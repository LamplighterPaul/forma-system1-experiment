// Designs are threads: a brief, then revisions. They live in this browser only (localStorage).
import { BLOCK_BY_ID } from '@shared/catalog'
import type { Pins, RunStats, Spec } from '@shared/harness'
import type { DesignText } from '@shared/text'

export interface Turn {
  id: string
  text: string
  /** Jev read this message as "show me another variation": it changed the seed, not the brief. */
  remix?: boolean
  /** What changed on the canvas, written by code from the spec diff. Jev never writes. */
  changes?: string[]
  stats?: RunStats
  error?: string
  /** Jev judged this message to be outside what Forma builds. It is kept in the thread but never sent again. */
  refused?: string
}
export interface Design { id: string; turns: Turn[]; pins: Pins; seed: number; createdAt: number }

const KEY = 'forma.designs.v1'
const uid = () => Math.random().toString(36).slice(2, 10)

export const newDesign = (): Design => ({ id: uid(), turns: [], pins: {}, seed: 0, createdAt: Date.now() })
export const newTurn = (text: string): Turn => ({ id: uid(), text })
export const titleOf = (d: Design) => d.turns[0]?.text ?? 'New design'
/** The messages Jev sees: everything except remix requests. */
export const messagesOf = (d: Design) => d.turns.filter(t => !t.remix && !t.error && !t.refused).map(t => t.text)

export function load(): Design[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(d => d && Array.isArray(d.turns)).slice(0, 50) : []
  } catch { return [] }
}
export function save(designs: Design[]) {
  try { localStorage.setItem(KEY, JSON.stringify(designs.filter(d => d.turns.length).slice(0, 50))) } catch { /* private window or storage blocked */ }
}

const title = (id: string) => BLOCK_BY_ID[id]?.title.toLowerCase() ?? id

export function describeChanges(before: Spec | null, after: Spec): string[] {
  if (!before) return [`${after.layout.replaceAll('_', ' ')} with ${after.blocks.length} blocks`, `${after.theme.accent}${after.theme.dark ? ', dark' : ''}, ${after.theme.font}`]
  const out: string[] = []
  if (before.layout !== after.layout) out.push(`layout → ${after.layout.replaceAll('_', ' ')}`)
  if (before.theme.accent !== after.theme.accent) out.push(`accent ${before.theme.accent} → ${after.theme.accent}`)
  if (before.theme.dark !== after.theme.dark) out.push(after.theme.dark ? 'dark theme' : 'light theme')
  if (before.theme.font !== after.theme.font) out.push(`type ${before.theme.font} → ${after.theme.font}`)
  if (before.theme.radius !== after.theme.radius) out.push(after.theme.radius > before.theme.radius ? 'rounder corners' : 'sharper corners')
  if (before.theme.density !== after.theme.density) out.push(after.theme.density > before.theme.density ? 'denser' : 'airier')
  if (before.copy.name !== after.copy.name) out.push(`name → ${after.copy.name}`)
  if (before.copy.headline !== after.copy.headline) out.push(`headline → “${after.copy.headline}”`)
  if (before.copy.cta !== after.copy.cta) out.push(`button → “${after.copy.cta}”`)
  const was = new Set(before.blocks.map(b => b.id)), now = new Set(after.blocks.map(b => b.id))
  for (const id of now) if (!was.has(id)) out.push(`+ ${title(id)}`)
  for (const id of was) if (!now.has(id)) out.push(`− ${title(id)}`)
  let tweaks = 0
  for (const b of after.blocks) {
    const old = before.blocks.find(o => o.id === b.id)
    if (old && JSON.stringify(old.props) !== JSON.stringify(b.props)) tweaks++
  }
  if (tweaks) out.push(`${tweaks} block${tweaks > 1 ? 's' : ''} adjusted`)
  return out.length ? out : ['no visible change']
}

/** What the writer changed, which the structural diff cannot see: new or removed boxes, a moved box, a new headline. */
export function describeTextChanges(before: DesignText | null, after: DesignText): string[] {
  if (!before) return []
  const out: string[] = []
  if (before.headline !== after.headline) out.push(`headline → “${after.headline}”`)
  if (before.name !== after.name) out.push(`name → ${after.name}`)
  const was = before.blocks.flow?.items ?? [], now = after.blocks.flow?.items ?? []
  if (was.length || now.length) {
    const had = new Set(was.map(i => i.title)), has = new Set(now.map(i => i.title))
    for (const t of has) if (!had.has(t)) { const home = after.structure?.find(s => s.child === t); out.push(`+ box ${t}${home ? ` under ${home.parent}` : ''}`) }
    for (const t of had) if (!has.has(t)) out.push(`− box ${t}`)
    for (const s of after.structure ?? []) { const old = before.structure?.find(o => o.child === s.child); if (old && old.parent !== s.parent) out.push(`${s.child} moved under ${s.parent}`) }
  }
  let rewritten = 0
  for (const [id, b] of Object.entries(after.blocks)) if (id !== 'flow' && before.blocks[id] && JSON.stringify(before.blocks[id]) !== JSON.stringify(b)) rewritten++
  if (rewritten) out.push(`${rewritten} section${rewritten > 1 ? 's' : ''} rewritten`)
  return out.slice(0, 8)
}
