// Runs directly on Node 24+ (native type stripping): `node server/index.ts`.
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono, type Context } from 'hono'
import { readFile } from 'node:fs/promises'
import { BLOCKS, BLOCK_BY_ID, LAYOUTS } from '../shared/catalog.ts'
import { assemble, buildQuestions, buildReview, conversation, outline, readReview, MAX_BRIEF, MAX_MESSAGE, MAX_MESSAGES, REMIX_INTENT, USD_PER_TOKEN, type Pins, type Previous, type RunStats, type Spec } from '../shared/harness.ts'
import { decide, deciderName, type Run } from './decider.ts'

const app = new Hono()

// The key is ours and the page is public, so spend is capped per visitor and per day.
const PER_MINUTE = 40, PER_DAY = 1500, GLOBAL_PER_DAY = 60_000
const hits = new Map<string, { minute: number; m: number; day: number; d: number }>()
let globalDay = 0, globalCount = 0

function allow(c: Context): boolean {
  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for')?.split(',')[0].trim() ?? 'local'
  const now = Date.now(), minute = Math.floor(now / 60_000), day = Math.floor(now / 86_400_000)
  if (day !== globalDay) { globalDay = day; globalCount = 0; hits.clear() }
  const h = hits.get(ip) ?? { minute, m: 0, day, d: 0 }
  if (h.minute !== minute) { h.minute = minute; h.m = 0 }
  h.m++; h.d++; globalCount++
  hits.set(ip, h)
  return h.m <= PER_MINUTE && h.d <= PER_DAY && globalCount <= GLOBAL_PER_DAY
}

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

app.get('/up', c => c.text('ok'))

app.get('/api/catalog', c => c.json({
  decider: deciderName(),
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
  if (!allow(c)) return c.json({ error: 'Rate limit reached. This is a shared experiment; try again in a minute.' }, 429)

  try {
    let { text, run, cached } = await fanOut(messages)
    // Jev routes intent: "try something else" explores the previous thread instead of changing it.
    const intent = run.answers[REMIX_INTENT]
    const remix = body.detectRemix === true && messages.length > 1 && intent?.type === 'noul' ? intent.noul : 0
    const stats: RunStats = { decider: run.decider, model: run.model, ms: cached ? 0 : run.ms, questions: run.questions, inputTokens: cached ? 0 : run.inputTokens, usd: cached ? 0 : run.inputTokens * USD_PER_TOKEN, cached }
    if (remix >= 0.5) {
      messages = messages.slice(0, -1)
      seed += 1
      ;({ text, run } = await fanOut(messages))
    }
    // On a remix the previous look must not stick, otherwise nothing would change.
    const prev = remix >= 0.5 || body.remix === true ? cleanPrevious(body.prev, true) : cleanPrevious(body.prev, false)
    const { spec, decisions } = assemble(text, run.answers, pins, seed, prev)
    return c.json({ spec, decisions, stats, seed, remix: remix >= 0.5 ? remix : 0 })
  } catch (e) {
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
  const spec = cleanSpec((await c.req.json().catch(() => ({}))).spec)
  if (!spec) return c.json({ error: 'Invalid spec' }, 400)
  if (!allow(c)) return c.json({ error: 'Rate limit reached.' }, 429)
  try {
    const state = outline(spec)
    const key = `r:${JSON.stringify(state)}`
    const run = (cache.get(key) as Awaited<ReturnType<typeof decide>> | undefined) ?? remember(key, await decide(state, buildReview(spec)))
    const stats: RunStats = { decider: run.decider, model: run.model, ms: run.ms, questions: run.questions, inputTokens: run.inputTokens, usd: run.inputTokens * USD_PER_TOKEN, cached: false }
    return c.json({ review: readReview(spec, run.answers), stats })
  } catch (e) {
    console.error('review failed', e)
    return c.json({ error: e instanceof Error ? e.message : 'Decider failed' }, 502)
  }
})

app.use('/assets/*', async (c, next) => { await next(); c.header('Cache-Control', 'public, max-age=31536000, immutable') })
app.use('/*', serveStatic({ root: './dist' }))
app.get('*', async c => c.html(await readFile('./dist/index.html', 'utf8')))

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port, hostname: '0.0.0.0' })
console.log(`forma-experiment on :${port}, decider: ${deciderName()}`)
