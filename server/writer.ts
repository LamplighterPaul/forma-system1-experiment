// The writer: Luna (OpenAI gpt-5.6-luna) fills the typed text slots of a design Jev has decided.
// It returns JSON against a strict schema built from the spec. No markup, no URLs, no web access.
import { BLOCK_BY_ID } from '../shared/catalog.ts'
import type { Spec } from '../shared/harness.ts'
import { SLOTS, extractLinks, itemCount, type BlockText, type DesignText } from '../shared/text.ts'

const KEY = process.env.OPENAI_API_KEY?.trim()
const MODEL = process.env.WRITER_MODEL ?? 'gpt-5.6-luna'
const ENDPOINT = 'https://api.openai.com/v1/responses'
export const WRITER_USD = { input: 0.2 / 1_000_000, output: 1.2 / 1_000_000 }

export const writerName = () => (KEY ? 'luna' : 'none')

export interface WriteRun { text: DesignText; model: string; ms: number; calls: number; inputTokens: number; outputTokens: number; usd: number }

const str = (description: string) => ({ type: 'string', description })

// Two FIXED schemas, identical for every design, so the provider can cache them. What each slot means
// is explained in the prompt instead. Generation speed is the bottleneck (~75 tokens/s), so the work is
// split into small calls that run in parallel and are streamed to the page as they land.
const ITEM = { type: 'object', additionalProperties: false, required: ['title', 'body', 'meta'], properties: { title: str(''), body: str(''), meta: str('') } }
const GLOBALS_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['name', 'headline', 'sub', 'cta', 'links'],
  properties: {
    name: str('The name of the product, person or organisation exactly as given in the brief. If none is given, a short fitting name'),
    headline: str('The main headline, at most eight words'),
    sub: str('One or two sentences under the headline, under 180 characters'),
    cta: str('Primary button label, two or three words'),
    links: { type: 'array', description: 'One label per supplied link', items: { type: 'object', additionalProperties: false, required: ['index', 'label'],
      properties: { index: { type: 'integer' }, label: str('A short label such as LinkedIn, GitHub, Website, Email') } } },
  },
}
const BLOCKS_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['blocks'],
  properties: { blocks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'heading', 'sub', 'button', 'items'],
    properties: { id: str('The section id exactly as given'), heading: str(''), sub: str(''), button: str(''), items: { type: 'array', items: ITEM } } } } },
}

const INSTRUCTIONS = `You write the words for a web design that has already been laid out. A separate model chose the layout, sections, colours and typography; you only fill text slots.

Rules:
- Write for the specific product, person or organisation in the brief. Be concrete and natural. No filler, no buzzwords, no exclamation marks.
- Follow every revision in the thread. A later revision overrides earlier text.
- Use facts from the brief. Do not invent awards, clients, employers, qualifications, addresses, phone numbers or statistics about a real person or company. Where a design needs sample data (orders, names in a table, prices), make it obviously generic.
- Never write a URL, a domain or an email address into any slot. Links are handled separately.
- Follow the guidance given for each slot, including its length and the exact number of items. A slot marked "empty" must be an empty string.
- If previous text is supplied, keep it word for word unless a revision asks for a change or the slot is new.
- Plain text only: no markdown, no HTML, no emoji unless the brief uses them.`

interface Usage { inputTokens: number; outputTokens: number }

async function call(name: string, schema: object, input: { role: string; content: string }[], signal: AbortSignal): Promise<{ data: Record<string, unknown>; usage: Usage; model: string }> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, instructions: INSTRUCTIONS, input, store: false, reasoning: { effort: process.env.WRITER_EFFORT ?? 'none' }, max_output_tokens: 2500,
      text: { format: { type: 'json_schema', name, strict: true, schema } } }),
    signal,
  })
  if (!res.ok) throw new Error(`Writer returned ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const body = await res.json() as { status: string; model?: string; output?: { type: string; content?: { type: string; text?: string }[] }[]; usage?: { input_tokens?: number; output_tokens?: number } }
  if (body.status !== 'completed') throw new Error(`Writer did not complete (${body.status})`)
  const raw = (body.output ?? []).filter(o => o.type === 'message').flatMap(o => o.content ?? []).filter(c => c.type === 'output_text').map(c => c.text ?? '').join('')
  return { data: JSON.parse(raw), usage: { inputTokens: body.usage?.input_tokens ?? 0, outputTokens: body.usage?.output_tokens ?? 0 }, model: body.model ?? MODEL }
}

/** What to write for one section, as plain guidance in the prompt. */
function guidance(spec: Spec, id: string): string {
  const g = SLOTS[id], n = itemCount(spec, id)
  const block = spec.blocks.find(b => b.id === id)
  const lines = [`SECTION id="${id}" (${BLOCK_BY_ID[id]?.title}): ${g.about}. Settings: ${JSON.stringify(block?.props ?? {})}`,
    `  heading: ${g.heading ?? 'empty'}`, `  sub: ${g.sub ?? 'empty'}`, `  button: ${g.button ?? 'empty'}`]
  lines.push(g.items ? `  items: exactly ${n}. title: ${g.items.title}. body: ${g.items.body ?? 'empty'}. meta: ${g.items.meta ?? 'empty'}` : '  items: none (empty array)')
  return lines.join('\n')
}

/** Group sections so each call writes a similar amount. */
function chunks(spec: Spec, ids: string[]): string[][] {
  const out: string[][] = []
  let current: string[] = [], weight = 0
  for (const id of ids) {
    const w = 2 + itemCount(spec, id) * 1.5
    if (current.length && weight + w > 15) { out.push(current); current = []; weight = 0 }
    current.push(id); weight += w
  }
  if (current.length) out.push(current)
  return out
}

export type Part = { type: 'globals'; name: string; headline: string; sub: string; cta: string; links: DesignText['links'] } | { type: 'blocks'; blocks: Record<string, BlockText> }

/** Writes a design's text in parallel calls. `onPart` fires as each piece lands, headline first in practice. */
export async function write(spec: Spec, previous: DesignText | null | undefined, onPart: (part: Part) => void): Promise<WriteRun> {
  if (!KEY) throw new Error('No writer key configured')
  const started = performance.now()
  const signal = AbortSignal.timeout(40_000)
  const ids = spec.blocks.map(b => b.id).filter(id => id in SLOTS)
  const links = extractLinks(spec.brief)
  const named = spec.copy.name !== 'Acme'
  const context = [
    { role: 'user', content: `BRIEF AND REVISIONS\n${spec.brief}` },
    { role: 'user', content: `DESIGN (decided already): a ${spec.layout.replaceAll('_', ' ')}, ${spec.theme.accent} accent, ${spec.theme.font} type, ${spec.theme.dark ? 'dark' : 'light'}. Sections in order: ${spec.blocks.map(b => BLOCK_BY_ID[b.id]?.title ?? b.id).join(', ')}.` },
  ]
  const usage: Usage = { inputTokens: 0, outputTokens: 0 }
  let model = MODEL
  const text: DesignText = { name: spec.copy.name, headline: spec.copy.headline, sub: spec.copy.sub, cta: spec.copy.cta, blocks: {}, links: labelled(links, []) }

  const globals = call('design_globals', GLOBALS_SCHEMA, [...context,
    { role: 'user', content: `Write the name, headline, sub and cta.\nLINKS TO LABEL (index: address)\n${links.length ? links.map((u, i) => `${i}: ${u}`).join('\n') : 'none: return an empty links array'}` },
    ...(previous ? [{ role: 'user', content: `PREVIOUS TEXT (keep unless a revision changes it)\n${JSON.stringify({ name: previous.name, headline: previous.headline, sub: previous.sub, cta: previous.cta })}` }] : []),
  ], signal).then(r => {
    usage.inputTokens += r.usage.inputTokens; usage.outputTokens += r.usage.outputTokens; model = r.model
    const d = r.data
    Object.assign(text, { name: clean(d.name, 40) || spec.copy.name, headline: clean(d.headline, 90) || spec.copy.headline, sub: clean(d.sub, 240) || spec.copy.sub, cta: clean(d.cta, 28) || spec.copy.cta,
      links: labelled(links, Array.isArray(d.links) ? (d.links as { index?: number; label?: string }[]) : []) })
    onPart({ type: 'globals', name: text.name, headline: text.headline, sub: text.sub, cta: text.cta, links: text.links })
  })

  const sections = chunks(spec, ids).map(group => call('design_sections', BLOCKS_SCHEMA, [...context,
    { role: 'user', content: `${named ? `The name is "${spec.copy.name}". Use only that name.` : 'The brief gives no name: do not mention a product or company name in these sections.'}\nWrite these sections and no others:\n\n${group.map(id => guidance(spec, id)).join('\n\n')}` },
    ...(previous && group.some(id => previous.blocks[id]) ? [{ role: 'user', content: `PREVIOUS TEXT (keep unless a revision changes it)\n${JSON.stringify(Object.fromEntries(group.filter(id => previous.blocks[id]).map(id => [id, previous.blocks[id]])))}` }] : []),
  ], signal).then(r => {
    usage.inputTokens += r.usage.inputTokens; usage.outputTokens += r.usage.outputTokens
    const written = sanitizeBlocks(Array.isArray(r.data.blocks) ? (r.data.blocks as Record<string, unknown>[]) : [], spec, group)
    Object.assign(text.blocks, written)
    onPart({ type: 'blocks', blocks: written })
  }))

  // A failed chunk leaves its sections on pre-written copy; only a total failure is an error.
  const settled = await Promise.allSettled([globals, ...sections])
  const failures = settled.filter(r => r.status === 'rejected') as PromiseRejectedResult[]
  if (failures.length === settled.length) throw failures[0].reason
  for (const f of failures) console.error('writer chunk failed', f.reason)
  return { text, model, ms: Math.round(performance.now() - started), calls: settled.length, inputTokens: usage.inputTokens, outputTokens: usage.outputTokens,
    usd: usage.inputTokens * WRITER_USD.input + usage.outputTokens * WRITER_USD.output }
}

// The schema guarantees shape; this guarantees the rules code cares about: lengths, counts, and no smuggled addresses.
const ADDRESS = /\b(?:https?:\/\/|www\.)\S+|\b[\w.+-]+@[\w-]+\.[\w.]+\b/gi
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(ADDRESS, '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max) : '')

function sanitizeBlocks(given: Record<string, unknown>[], spec: Spec, allowed: string[]): Record<string, BlockText> {
  const blocks: Record<string, BlockText> = {}
  for (const g of given) {
    const id = String(g.id ?? '')
    if (!allowed.includes(id) || !(id in SLOTS)) continue
    const rows = Array.isArray(g.items) ? g.items.slice(0, Math.max(itemCount(spec, id), 0)) : []
    blocks[id] = { heading: clean(g.heading, 90), sub: clean(g.sub, 420), button: clean(g.button, 32),
      items: rows.map(i => ({ title: clean((i as Record<string, unknown>).title, 220), body: clean((i as Record<string, unknown>).body, 260), meta: clean((i as Record<string, unknown>).meta, 40) })) }
  }
  return blocks
}

// Addresses come from the person's own words; the writer only supplies labels.
function labelled(links: string[], labels: { index?: number; label?: string }[]): DesignText['links'] {
  return links.map((url, i) => ({ url, label: clean(labels.find(l => l.index === i)?.label, 28) || (url.startsWith('mailto:') ? 'Email' : new URL(url).hostname.replace(/^www\./, '')) }))
}
