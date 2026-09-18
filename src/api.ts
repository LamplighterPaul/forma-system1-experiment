import type { Decision, Pins, Previous, Review, RunStats, Spec } from '@shared/harness'
import type { DesignText } from '@shared/text'

export interface DesignResult { spec: Spec; decisions: Decision[]; stats: RunStats; seed: number; remix: number; guard?: { design: number; unsafe: number } }
export interface Refusal { refused: 'unsafe' | 'not_design'; guard: { design: number; unsafe: number }; stats: RunStats }
export interface ReviewResult { review: Review; stats: RunStats }
export interface DesignRequest { messages: string[]; pins: Pins; seed: number; prev?: Previous; detectRemix?: boolean; remix?: boolean }

// A random id per browser tab, so the server can count sessions without cookies or personal data.
function sessionId(): string {
  try {
    const existing = sessionStorage.getItem('forma.session')
    if (existing) return existing
    const id = Math.random().toString(36).slice(2, 14)
    sessionStorage.setItem('forma.session', id)
    return id
  } catch { return 'nostorage' }
}

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forma-Session': sessionId() }, body: JSON.stringify(body), signal })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`)
  return data as T
}

export const design = (req: DesignRequest, signal?: AbortSignal) => post<DesignResult | Refusal>('/api/design', req, signal)
export const review = (spec: Spec, boxes: string[], signal?: AbortSignal) => post<ReviewResult>('/api/review', { spec, boxes }, signal)

export interface WriteStats { model: string; calls: number; ms: number; inputTokens: number; outputTokens: number; usd: number; cached: boolean; arrange?: { ms: number; questions: number; inputTokens: number; usd: number } }
export interface WriteResult { text: DesignText | null; writer: 'luna' | 'none'; stats?: WriteStats }
export type WritePart = { type: 'globals'; name: string; headline: string; sub: string; cta: string; links: DesignText['links'] } | { type: 'blocks'; blocks: DesignText['blocks'] }

/** Streams the writer's parts as they land (newline-delimited JSON) and resolves with the final text. */
export async function write(spec: Spec, previous: DesignText | null, onPart: (part: WritePart) => void, signal?: AbortSignal): Promise<WriteResult> {
  const res = await fetch('/api/write', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forma-Session': sessionId() }, body: JSON.stringify({ spec, previous }), signal })
  if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error ?? `Request failed (${res.status})`)
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = '', done: WriteResult | null = null
  for (;;) {
    const { value, done: ended } = await reader.read()
    buffer += value ?? ''
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines.filter(Boolean)) {
      const msg = JSON.parse(line)
      if (msg.type === 'error') throw new Error(msg.error)
      if (msg.type === 'done') done = { text: msg.text, writer: msg.writer, stats: msg.stats }
      else onPart(msg as WritePart)
    }
    if (ended) break
  }
  if (!done) throw new Error('The writer stopped before finishing')
  return done
}
export const capabilities = () => fetch('/api/catalog').then(r => r.json() as Promise<{ decider: string; writer: 'luna' | 'none'; questionsPerCall: number }>)
