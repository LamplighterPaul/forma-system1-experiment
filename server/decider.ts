import type { Answer, Answers, Questions } from '../shared/harness.ts'

export interface Run { answers: Answers; decider: string; model: string; ms: number; questions: number; inputTokens: number }

const KEY = process.env.TYPESAFE_API_KEY?.trim()
const MODEL = process.env.TYPESAFE_MODEL ?? 'jev-latest'
const ENDPOINT = 'https://api.typesafe.ai/v1/systemone'

export const deciderName = () => (KEY ? 'jev' : 'mock')

export async function decide(state: unknown, questions: Questions): Promise<Run> {
  return KEY ? jev(state, questions) : mock(state, questions)
}

async function jev(state: unknown, questions: Questions): Promise<Run> {
  const started = performance.now()
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, model: MODEL, questions }),
      signal: AbortSignal.timeout(15_000),
    })
    if ((res.status === 429 || res.status === 529) && attempt < 2) {
      await new Promise(r => setTimeout(r, 400 * 2 ** attempt))
      continue
    }
    if (!res.ok) throw new Error(`Jev returned ${res.status}: ${(await res.text()).slice(0, 300)}`)
    const body = await res.json() as { model: string; answers: Answers; usage?: { input_tokens?: number } }
    return { answers: body.answers, decider: 'jev', model: body.model, ms: Math.round(performance.now() - started),
      questions: Object.keys(questions).length, inputTokens: body.usage?.input_tokens ?? 0 }
  }
}

// Development stand-in when no key is configured: scores options by word overlap
// with the state. It exists to exercise the pipeline, not to make good decisions.
const words = (s: string) => new Set(s.toLowerCase().match(/[a-z]{3,}/g) ?? [])

function mock(state: unknown, questions: Questions): Run {
  const started = performance.now()
  const text = JSON.stringify(state)
  const have = words(text)
  const overlap = (s: string) => [...words(s)].filter(w => have.has(w)).length
  const answers: Answers = {}
  for (const [id, question] of Object.entries(questions)) {
    let a: Answer
    if (question.type === 'noul') {
      a = { type: 'noul', noul: Math.min(0.95, 0.2 + 0.25 * overlap(question.instructions.split(':').slice(1).join(':') || question.instructions)) }
    } else if (question.type === 'choice') {
      const raw = Object.entries(question.criteria).map(([k, v]) => [k, Math.exp(overlap(`${k} ${v ?? ''}`))] as const)
      const sum = raw.reduce((n, [, v]) => n + v, 0)
      const probabilities = Object.fromEntries(raw.map(([k, v]) => [k, v / sum]))
      const best = raw.reduce((x, y) => (y[1] > x[1] ? y : x))
      a = { type: 'choice', choice: best[0], probabilities, confidence: best[1] / sum }
    } else {
      const n = question.criteria.length
      a = { type: 'score', score: (n - 1) / 2, confidence: 0.3, probabilities: Object.fromEntries(question.criteria.map((_, i) => [String(i), 1 / n])) }
    }
    answers[id] = a
  }
  return { answers, decider: 'mock', model: 'keyword-overlap', ms: Math.round(performance.now() - started), questions: Object.keys(questions).length, inputTokens: Math.round(JSON.stringify(questions).length / 4) }
}
