// Runs directly on Node 24+ (native type stripping): `node server/index.ts`.
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono, type Context } from 'hono'
import { stream } from 'hono/streaming'
import { readFile } from 'node:fs/promises'
import { BLOCKS, BLOCK_BY_ID, LAYOUTS } from '../shared/catalog.ts'
import { assemble, buildQuestions, buildReview, conversation, outline, readReview, MAX_BRIEF, MAX_MESSAGE, MAX_MESSAGES, GUARD_DESIGN, GUARD_UNSAFE, REMIX_INTENT, ROUTE_WORDS, USD_PER_TOKEN, type Pins, type Previous, type RunStats, type Spec } from '../shared/harness.ts'
import { timingSafeEqual } from 'node:crypto'
import { decide, deciderName, type Run } from './decider.ts'
import { arrange, type Arrangement } from './arrange.ts'
import * as events from './events.ts'
import * as usage from './usage.ts'
import { write, writerName, type WriteRun } from './writer.ts'
import type { DesignText } from '../shared/text.ts'

const app = new Hono()

// The key is ours and the page is public, so spend is capped per visitor and per day.
const PER_MINUTE = 40, PER_DAY = 1500, GLOBAL_PER_DAY = 60_000
const hits = new Map<string, { minute: number; m: number; day: number; d: number }>()
let globalDay = 0, globalCount = 0

const ipOf = (c: Context) => c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for')?.split(',')[0].trim() ?? 'local'
/** Who is asking, anonymously, for the operator's live feed. */
const whoIs = (c: Context) => ({ who: usage.visitor(ipOf(c)).slice(0, 6), tab: (c.req.header('x-forma-session') ?? '').replace(/[^a-z0-9]/gi, '').slice(0, 4), country: (c.req.header('cf-ipcountry') ?? '').slice(0, 2) })

function allow(c: Context): boolean {
  const ip = ipOf(c)
  usage.seen(ip, c.req.header('x-forma-session'))
  const now = Date.now(), minute = Math.floor(now / 60_000), day = Math.floor(now / 86_400_000)
  if (day !== globalDay) { globalDay = day; globalCount = 0; hits.clear() }
  const h = hits.get(ip) ?? { minute, m: 0, day, d: 0 }
  if (h.minute !== minute) { h.minute = minute; h.m = 0 }
  h.m++; h.d++; globalCount++
  hits.set(ip, h)
  return h.m <= PER_MINUTE && h.d <= PER_DAY && globalCount <= GLOBAL_PER_DAY
}

const UNSAFE_AT = 0.7, NOT_DESIGN_AT = 0.3
const cache = new Map<string, unknown>()
function remember<T>(key: string, value: T): T {
  cache.set(key, value)
  if (cache.size > 400) cache.delete(cache.keys().next().value!)
  return value
}

const cleanBrief = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, MAX_BRIEF) : '')

function cleanPins(v: unknown): Pins {
  const pins: Pins = {}
  if (v && typeof v === 'object') for (const [k, val] of Object.entries(v).slice(0, 40)) {
    if (k.length < 80 && (typeof val === 'boolean' || (typeof val === 'string' && val.length < 80))) pins[k] = val
  }
  return pins
}

function cleanPrevious(v: unknown, blocksOnly: boolean): Previous {
  const prev: Previous = {}
  if (v && typeof v === 'object') for (const [k, val] of Object.entries(v).slice(0, 80)) {
    if (k.length < 80 && typeof val === 'string' && val.length < 80 && (!blocksOnly || k.startsWith('block.'))) prev[k] = val
  }
  return prev
}

/** Returns a 429 response when this visitor is over a rate limit or the day's Jev budget is spent. */
function gate(c: Context) {
  if (usage.overBudget()) { usage.refused(); return c.json({ error: `Today's Jev budget for this shared experiment is used up. It resets at midnight UTC.` }, 429) }
  if (!allow(c)) { usage.refused(); return c.json({ error: 'Rate limit reached. This is a shared experiment; try again in a minute.' }, 429) }
  return null
}

app.get('/up', c => c.text('ok'))

// Private usage report. Disabled unless STATS_TOKEN is set; send it as `Authorization: Bearer <token>`.
app.get('/api/stats', c => {
  const token = process.env.STATS_TOKEN ?? ''
  const given = (c.req.header('authorization') ?? '').replace(/^Bearer /, '')
  const ok = token.length >= 16 && given.length === token.length && timingSafeEqual(Buffer.from(given), Buffer.from(token))
  return ok ? c.json(usage.report()) : c.json({ error: 'Not found' }, 404)
})

// The private live feed: `?since=<id>` returns only newer events, so a watcher can poll cheaply.
app.get('/api/events', c => {
  const token = process.env.STATS_TOKEN ?? ''
  const given = (c.req.header('authorization') ?? '').replace(/^Bearer /, '')
  const ok = token.length >= 16 && given.length === token.length && timingSafeEqual(Buffer.from(given), Buffer.from(token))
  if (!ok) return c.json({ error: 'Not found' }, 404)
  const since = Number(c.req.query('since')) || undefined
  return c.json({ events: events.feed(since), today: usage.report().today, dailyUsdCap: usage.DAILY_USD_CAP })
})

app.get('/api/catalog', c => c.json({
  decider: deciderName(),
  writer: writerName(),
  layouts: LAYOUTS,
  blocks: BLOCKS.map(b => ({ id: b.id, title: b.title, layouts: b.layouts, asks: b.need || 'always placed', params: b.params.map(p => ({ id: p.id, kind: p.kind, options: p.kind === 'choice' ? Object.keys(p.options) : p.kind === 'bank' ? Object.keys(p.bank) : ['yes', 'no'] })) })),
  questionsPerCall: Object.keys(buildQuestions('')).length,
}))

const cleanMessage = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, MAX_MESSAGE) : '')

/** One fan-out call for a thread, cached by its full text so switching designs or pinning costs nothing. */
async function fanOut(messages: string[]): Promise<{ text: string; run: Run; cached: boolean }> {
  const text = conversation(messages).slice(0, MAX_BRIEF)
  const hit = cache.get(`d:${text}`) as Run | undefined
  if (hit) return { text, run: hit, cached: true }
  const latest = messages.length > 1 ? messages[messages.length - 1] : undefined
  return { text, run: remember(`d:${text}`, await decide({ brief: text }, buildQuestions(text, latest))), cached: false }
}

app.post('/api/design', async c => {
  const body = await c.req.json().catch(() => ({}))
  // `messages` is a design thread (brief, then revisions); `brief` is the single-message form.
  const raw: unknown[] = Array.isArray(body.messages) ? body.messages : [body.brief]
  let messages = raw.map(cleanMessage).filter(m => m.length > 0).slice(-MAX_MESSAGES)
  const pins = cleanPins(body.pins)
  let seed = Number.isInteger(body.seed) && body.seed >= 0 ? (body.seed as number) % 1_000_000 : 0
  if (!messages.length || messages[0].length < 3) return c.json({ error: 'Describe what you want to see.' }, 400)
  const blocked = gate(c)
  if (blocked) return blocked

  try {
    const asked = messages.at(-1), turns = messages.length
    let { text, run, cached } = await fanOut(messages)
    // Jev routes intent: "try something else" explores the previous thread instead of changing it.
    const intent = run.answers[REMIX_INTENT]
    const remix = body.detectRemix === true && messages.length > 1 && intent?.type === 'noul' ? intent.noul : 0
    const stats: RunStats = { decider: run.decider, model: run.model, ms: cached ? 0 : run.ms, questions: run.questions, inputTokens: cached ? 0 : run.inputTokens, usd: cached ? 0 : run.inputTokens * USD_PER_TOKEN, cached }
    // Jev as guardrail: refuse what is not a design brief, or what should not be built. Code holds the thresholds and the words.
    const noulOf = (id: string, fallback: number) => { const a = run.answers[id]; return a?.type === 'noul' ? a.noul : fallback }
    const guard = { design: noulOf(GUARD_DESIGN, 1), unsafe: noulOf(GUARD_UNSAFE, 0) }
    // 1 = the writer is needed. A first brief always needs words; so does anything Jev is unsure about.
    const needsWords = messages.length > 1 ? noulOf(ROUTE_WORDS, 1) : 1
    const refusal = guard.unsafe >= UNSAFE_AT ? 'unsafe' : guard.design <= NOT_DESIGN_AT ? 'not_design' : null
    if (refusal && process.env.GUARD !== 'off') {
      usage.spent('design', stats); usage.refused()
      events.record({ ...whoIs(c), kind: 'refused', text: messages.at(-1), turn: messages.length, ms: stats.ms, usd: stats.usd, cached,
        note: refusal === 'unsafe' ? `unsafe ${Math.round(guard.unsafe * 100)}%` : `not a design ${Math.round(guard.design * 100)}%` })
      return c.json({ refused: refusal, guard, stats })
    }
    if (remix >= 0.5) {
      messages = messages.slice(0, -1)
      seed += 1
      const again = await fanOut(messages)
      ;({ text, run } = again)
      if (!again.cached) usage.spent('design', { cached: false, inputTokens: run.inputTokens, usd: run.inputTokens * USD_PER_TOKEN })
    }
    // On a remix the previous look must not stick, otherwise nothing would change.
    const prev = remix >= 0.5 || body.remix === true ? cleanPrevious(body.prev, true) : cleanPrevious(body.prev, false)
    const { spec, decisions } = assemble(text, run.answers, pins, seed, prev)
    usage.spent('design', stats)
    events.record({ ...whoIs(c), kind: 'design', text: asked, turn: turns, ms: stats.ms, usd: stats.usd, cached,
      note: `${remix >= 0.5 || body.remix === true ? 'remix · ' : ''}${spec.layout.replaceAll('_', ' ')} · ${spec.blocks.length} blocks · ${spec.theme.accent}${spec.theme.dark ? ' dark' : ''}${turns > 1 && needsWords < 0.35 ? ` · jev: no words needed (${Math.round(needsWords * 100)}%)` : ''}` })
    return c.json({ spec, decisions, stats, seed, remix: remix >= 0.5 ? remix : 0, guard, needsWords })
  } catch (e) {
    usage.failed()
    events.record({ ...whoIs(c), kind: 'error', note: `design: ${e instanceof Error ? e.message.slice(0, 120) : 'failed'}`, ms: 0, usd: 0 })
    console.error('design failed', e)
    return c.json({ error: e instanceof Error ? e.message : 'Decider failed' }, 502)
  }
})

function cleanSpec(v: unknown): Spec | null {
  const s = v as Spec
  if (!s || typeof s !== 'object' || !(s.layout in LAYOUTS) || !Array.isArray(s.blocks) || !s.copy || !s.theme) return null
  const brief = cleanBrief(s.brief)
  if (brief.length < 3) return null
  return { ...s, brief, blocks: s.blocks.filter(b => b && b.id in BLOCK_BY_ID).slice(0, 20) }
}

app.post('/api/review', async c => {
  const body2 = await c.req.json().catch(() => ({}))
  const spec = cleanSpec(body2.spec)
  if (!spec) return c.json({ error: 'Invalid spec' }, 400)
  const blocked = gate(c)
  if (blocked) return blocked
  try {
    // A diagram's content is its boxes; without them the review can only judge that a diagram exists.
    const boxes = Array.isArray(body2.boxes) ? (body2.boxes as unknown[]).filter(b => typeof b === 'string').slice(0, 16).map(b => String(b).slice(0, 60)) : []
    const state = outline(spec, boxes)
    const key = `r:${JSON.stringify(state)}`
    const hit = cache.get(key) as Run | undefined
    const run = hit ?? remember(key, await decide(state, buildReview(spec)))
    const stats: RunStats = { decider: run.decider, model: run.model, ms: hit ? 0 : run.ms, questions: run.questions, inputTokens: hit ? 0 : run.inputTokens, usd: hit ? 0 : run.inputTokens * USD_PER_TOKEN, cached: Boolean(hit) }
    usage.spent('review', stats)
    const verdict = readReview(spec, run.answers)
    events.record({ ...whoIs(c), kind: 'review', ms: stats.ms, usd: stats.usd, cached: stats.cached, note: `fit ${verdict.fit.toFixed(1)}/3${verdict.missing >= 0.5 ? ` · catalog gap ${Math.round(verdict.missing * 100)}%` : ''}` })
    return c.json({ review: readReview(spec, run.answers), stats })
  } catch (e) {
    usage.failed()
    console.error('review failed', e)
    return c.json({ error: e instanceof Error ? e.message : 'Decider failed' }, 502)
  }
})

// Luna writes the words for a design Jev has decided. The reply is newline-delimited JSON: parts are sent
// as each parallel call lands (headline first in practice), then a final "done" line with the whole text and the cost.
app.post('/api/write', async c => {
  const body = await c.req.json().catch(() => ({}))
  const spec = cleanSpec(body.spec)
  if (!spec) return c.json({ error: 'Invalid spec' }, 400)
  const available = writerName() !== 'none'
  const blocked = available ? gate(c) : null
  if (blocked) return blocked
  const previous = body.previous && typeof body.previous === 'object' && JSON.stringify(body.previous).length < 20_000 ? (body.previous as DesignText) : null
  const only = Array.isArray(body.only) ? (body.only as unknown[]).filter(x => typeof x === 'string' && x in BLOCK_BY_ID).slice(0, 12) as string[] : undefined
  const key = `w:${only?.join(',') ?? ''}:${spec.brief}|${JSON.stringify(spec.blocks.map(b => [b.id, b.props]))}|${spec.copy.name}`
  c.header('Content-Type', 'application/x-ndjson; charset=utf-8')
  c.header('Cache-Control', 'no-store')
  c.header('X-Accel-Buffering', 'no')
  const who = whoIs(c)
  return stream(c, async out => {
    const send = (line: unknown) => out.write(`${JSON.stringify(line)}\n`)
    if (!available) { await send({ type: 'done', text: null, writer: 'none' }); return }
    try {
      const hit = cache.get(key) as (WriteRun & { arranged?: Arrangement }) | undefined
      let run = hit
      if (!run) {
        // Luna names the boxes of a mind map or tree; Jev decides where each one hangs. It starts the moment the boxes land.
        let arranging: Promise<Arrangement | null> = Promise.resolve(null)
        const fresh = await write(spec, previous, part => {
          if (part.type === 'blocks' && part.blocks.flow) arranging = arrange(spec, part.blocks.flow.items).catch(e => { console.error('arrange failed', e); return null })
          void send(part)
        }, only)
        const arranged = await arranging
        if (arranged && fresh.text.blocks.flow) {
          fresh.text.blocks.flow = { ...fresh.text.blocks.flow, items: arranged.items }
          fresh.text.structure = arranged.structure
          usage.spent('arrange', { cached: false, inputTokens: arranged.inputTokens, usd: arranged.usd })
          await send({ type: 'blocks', blocks: { flow: fresh.text.blocks.flow } })
        }
        run = remember(key, { ...fresh, arranged: arranged ?? undefined })
        usage.wrote(fresh)
      }
      const arrangeStats = run.arranged ? { ms: hit ? 0 : run.arranged.ms, questions: run.arranged.questions, inputTokens: hit ? 0 : run.arranged.inputTokens, usd: hit ? 0 : run.arranged.usd } : undefined
      events.record({ ...who, kind: 'write', ms: hit ? 0 : run.ms, usd: hit ? 0 : run.usd, cached: Boolean(hit), note: `luna · ${run.calls} calls · ${run.inputTokens}→${run.outputTokens} tok · “${run.text.headline}”${run.arranged ? ` · jev arranged ${run.arranged.structure.length} boxes` : ''}` })
      await send({ type: 'done', writer: 'luna', text: run.text,
        stats: { model: run.model, calls: hit ? 0 : run.calls, ms: hit ? 0 : run.ms, inputTokens: hit ? 0 : run.inputTokens, outputTokens: hit ? 0 : run.outputTokens, usd: hit ? 0 : run.usd, cached: Boolean(hit), arrange: arrangeStats } })
    } catch (e) {
      usage.failed()
      events.record({ ...who, kind: 'error', note: `luna: ${e instanceof Error ? e.message.slice(0, 120) : 'failed'}`, ms: 0, usd: 0 })
      console.error('write failed', e)
      await send({ type: 'error', error: e instanceof Error ? e.message : 'Writer failed' })
    }
  })
})

app.use('/assets/*', async (c, next) => { await next(); c.header('Cache-Control', 'public, max-age=31536000, immutable') })
app.use('/*', serveStatic({ root: './dist' }))
app.get('*', async c => c.html(await readFile('./dist/index.html', 'utf8')))

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port, hostname: '0.0.0.0' })
console.log(`forma-experiment on :${port}, decider: ${deciderName()}, writer: ${writerName()}`)
