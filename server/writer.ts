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

export interface WriteRun { text: DesignText; model: string; ms: number; inputTokens: number; outputTokens: number; usd: number }

const str = (description: string) => ({ type: 'string', description })

function blockSchema(spec: Spec, id: string) {
  const guide = SLOTS[id]
  const n = itemCount(spec, id)
  return {
    type: 'object', additionalProperties: false, required: ['heading', 'sub', 'button', 'items'],
    description: `${BLOCK_BY_ID[id]?.title ?? id}: ${guide.about}`,
    properties: {
      heading: str(guide.heading ?? 'Leave empty'),
      sub: str(guide.sub ?? 'Leave empty'),
      button: str(guide.button ?? 'Leave empty'),
      items: {
        type: 'array', description: guide.items ? `Exactly ${n} items` : 'Leave empty',
        items: { type: 'object', additionalProperties: false, required: ['title', 'body', 'meta'],
          properties: { title: str(guide.items?.title ?? ''), body: str(guide.items?.body ?? 'Leave empty'), meta: str(guide.items?.meta ?? 'Leave empty') } },
      },
    },
  }
}

const INSTRUCTIONS = `You write the words for a web design that has already been laid out. A separate model chose the layout, sections, colours and typography; you only fill text slots.

Rules:
- Write for the specific product, person or organisation in the brief. Be concrete and natural. No filler, no buzzwords, no exclamation marks.
- Follow every revision in the thread. A later revision overrides earlier text.
- Use facts from the brief. Do not invent awards, clients, employers, qualifications, addresses, phone numbers or statistics about a real person or company. Where a design needs sample data (orders, names in a table, prices), make it obviously generic.
- Never write a URL, a domain or an email address into any slot. Links are handled separately: you only label the links you are given.
- Respect the length guidance of each slot. Leave a slot as an empty string when its description says to leave it empty.
- If previous text is supplied, keep it word for word unless a revision asks for a change or the slot is new.
- Plain text only: no markdown, no HTML, no emoji unless the brief uses them.`

export async function write(spec: Spec, previous?: DesignText | null): Promise<WriteRun> {
  if (!KEY) throw new Error('No writer key configured')
  const started = performance.now()
  const ids = spec.blocks.map(b => b.id).filter(id => id in SLOTS)
  const links = extractLinks(spec.brief)

  const schema = {
    type: 'object', additionalProperties: false, required: ['name', 'headline', 'sub', 'cta', 'blocks', 'links'],
    properties: {
      name: str('The name of the product, person or organisation, exactly as given in the brief. If none is given, a short fitting name'),
      headline: str('The main headline, at most eight words'),
      sub: str('One or two sentences under the headline, under 180 characters'),
      cta: str('Primary button label, two or three words'),
      blocks: { type: 'object', additionalProperties: false, required: ids, properties: Object.fromEntries(ids.map(id => [id, blockSchema(spec, id)])) },
      links: { type: 'array', description: `Exactly ${links.length} labels, one per supplied link, in the same order`,
        items: { type: 'object', additionalProperties: false, required: ['index', 'label'], properties: { index: { type: 'integer' }, label: str('A short label such as LinkedIn, GitHub, Website, Email') } } },
    },
  }

  const design = {
    kind: spec.layout.replaceAll('_', ' '), tone: { accent: spec.theme.accent, typeface: spec.theme.font, dark: spec.theme.dark },
    placeholder_headline: spec.copy.headline,
    sections: spec.blocks.map(b => ({ id: b.id, title: BLOCK_BY_ID[b.id]?.title, settings: b.props })),
  }
  const input = [
    { role: 'user', content: `BRIEF AND REVISIONS\n${spec.brief}` },
    { role: 'user', content: `DESIGN (decided already)\n${JSON.stringify(design)}` },
    { role: 'user', content: `LINKS TO LABEL (index: address)\n${links.length ? links.map((u, i) => `${i}: ${u}`).join('\n') : 'none'}` },
    ...(previous ? [{ role: 'user', content: `PREVIOUS TEXT (keep unless a revision changes it)\n${JSON.stringify({ name: previous.name, headline: previous.headline, sub: previous.sub, cta: previous.cta, blocks: previous.blocks })}` }] : []),
  ]

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, instructions: INSTRUCTIONS, input, store: false, reasoning: { effort: 'low' }, max_output_tokens: 6000,
      text: { format: { type: 'json_schema', name: 'design_text', strict: true, schema } } }),
    signal: AbortSignal.timeout(45_000),
  })
  if (!res.ok) throw new Error(`Writer returned ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const body = await res.json() as { status: string; model?: string; output?: { type: string; content?: { type: string; text?: string }[] }[]; usage?: { input_tokens?: number; output_tokens?: number } }
  if (body.status !== 'completed') throw new Error(`Writer did not complete (${body.status})`)
  const raw = (body.output ?? []).filter(o => o.type === 'message').flatMap(o => o.content ?? []).filter(c => c.type === 'output_text').map(c => c.text ?? '').join('')
  const text = sanitize(JSON.parse(raw), spec, links)
  const inputTokens = body.usage?.input_tokens ?? 0, outputTokens = body.usage?.output_tokens ?? 0
  return { text, model: body.model ?? MODEL, ms: Math.round(performance.now() - started), inputTokens, outputTokens,
    usd: inputTokens * WRITER_USD.input + outputTokens * WRITER_USD.output }
}

// The schema guarantees shape; this guarantees the rules code cares about: lengths, counts, and no smuggled addresses.
const ADDRESS = /\b(?:https?:\/\/|www\.)\S+|\b[\w.+-]+@[\w-]+\.[\w.]+\b/gi
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(ADDRESS, '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max) : '')

function sanitize(data: Record<string, unknown>, spec: Spec, links: string[]): DesignText {
  const blocks: Record<string, BlockText> = {}
  const given = (data.blocks ?? {}) as Record<string, Record<string, unknown>>
  for (const b of spec.blocks) {
    const g = given[b.id]
    if (!g || !(b.id in SLOTS)) continue
    const items = Array.isArray(g.items) ? g.items.slice(0, Math.max(itemCount(spec, b.id), 0)) : []
    blocks[b.id] = { heading: clean(g.heading, 90), sub: clean(g.sub, 420), button: clean(g.button, 32),
      items: items.map(i => ({ title: clean((i as Record<string, unknown>).title, 220), body: clean((i as Record<string, unknown>).body, 260), meta: clean((i as Record<string, unknown>).meta, 40) })) }
  }
  const labels = Array.isArray(data.links) ? (data.links as { index?: number; label?: string }[]) : []
  return {
    name: clean(data.name, 40) || spec.copy.name, headline: clean(data.headline, 90) || spec.copy.headline,
    sub: clean(data.sub, 240) || spec.copy.sub, cta: clean(data.cta, 28) || spec.copy.cta, blocks,
    // Addresses come from the person's own words; the writer only supplied labels.
    links: links.map((url, i) => ({ url, label: clean(labels.find(l => l.index === i)?.label, 28) || (url.startsWith('mailto:') ? 'Email' : new URL(url).hostname.replace(/^www\./, '')) })),
  }
}
