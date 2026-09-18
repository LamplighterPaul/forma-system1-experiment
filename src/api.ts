import type { Decision, Pins, Previous, Review, RunStats, Spec } from '@shared/harness'

export interface DesignResult { spec: Spec; decisions: Decision[]; stats: RunStats; seed: number; remix: number }
export interface ReviewResult { review: Review; stats: RunStats }
export interface DesignRequest { messages: string[]; pins: Pins; seed: number; prev?: Previous; detectRemix?: boolean; remix?: boolean }

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`)
  return data as T
}

export const design = (req: DesignRequest, signal?: AbortSignal) => post<DesignResult>('/api/design', req, signal)
export const review = (spec: Spec, signal?: AbortSignal) => post<ReviewResult>('/api/review', { spec }, signal)
