// Jev arranges what Luna named. For hierarchies (mind maps, trees) every box except the first gets one typed
// question: which box is it a direct sub-topic of? One call, answered in parallel, with a probability per parent.
import type { Spec } from '../shared/harness.ts'
import { USD_PER_TOKEN } from '../shared/harness.ts'
import type { TextItem } from '../shared/text.ts'
import { decide } from './decider.ts'

export interface Placement { child: string; parent: string; p: number; runnerUp?: string }
export interface Arrangement { items: TextItem[]; structure: Placement[]; ms: number; questions: number; inputTokens: number; usd: number }

export async function arrange(spec: Spec, items: TextItem[]): Promise<Arrangement | null> {
  const shape = spec.blocks.find(b => b.id === 'flow')?.props.shape
  if ((shape !== 'hub' && shape !== 'tree') || items.length < 3) return null
  // Labels are the option keys, so they must be unique.
  const labels = items.map((item, i) => (items.findIndex(o => o.title === item.title) === i ? item.title : `${item.title} (${i + 1})`))
  const root = labels[0]
  const state = { brief: spec.brief, kind: shape === 'hub' ? 'mind map' : 'hierarchy', top: root, boxes: items.map((item, i) => ({ name: labels[i], detail: item.body })) }
  const questions = Object.fromEntries(labels.slice(1).map((label, n) => [`parent.${n + 1}`, {
    type: 'choice' as const,
    instructions: `In this ${state.kind}, which box is "${label}" a direct sub-topic of? Choose the most specific parent. If the brief or a revision says where it belongs, follow that. Main topics belong under "${root}".`,
    criteria: Object.fromEntries(labels.filter(l => l !== label).map(l => [l, null])),
  }]))
  const run = await decide(state, questions)

  const parent: number[] = [-1]
  const structure: Placement[] = []
  labels.slice(1).forEach((label, n) => {
    const a = run.answers[`parent.${n + 1}`]
    let at = 0
    if (a?.type === 'choice') {
      const ranked = Object.entries(a.probabilities).sort((x, y) => y[1] - x[1])
      at = Math.max(0, labels.indexOf(a.choice))
      structure.push({ child: label, parent: labels[at], p: ranked[0]?.[1] ?? 0, runnerUp: ranked[1] && ranked[1][1] >= 0.05 ? `${ranked[1][0]} ${Math.round(ranked[1][1] * 100)}%` : undefined })
    }
    parent[n + 1] = at
  })
  // Two boxes that name each other as parent would float free of the top: hang the less certain one from the top.
  const reaches = (i: number, seen = new Set<number>()): boolean => (i === 0 ? true : seen.has(i) ? false : reaches(parent[i], seen.add(i)))
  parent.forEach((_, i) => { if (i > 0 && !reaches(i)) parent[i] = 0 })

  // The graph is stored the way the writer stores it: each box lists the boxes it points to.
  const arranged = items.map((item, i) => ({ ...item, meta: parent.map((p, child) => (p === i ? child + 1 : 0)).filter(Boolean).join(',') }))
  return { items: arranged, structure: structure.map((s, n) => ({ ...s, parent: labels[parent[n + 1]] })), ms: run.ms, questions: run.questions, inputTokens: run.inputTokens, usd: run.inputTokens * USD_PER_TOKEN }
}
