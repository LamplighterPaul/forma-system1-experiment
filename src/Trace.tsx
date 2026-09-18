import { Pin, Shuffle } from 'lucide-react'
import type { Decision, Pins, Review, RunStats } from '@shared/harness'

const pct = (p: number) => `${Math.round(p * 100)}%`
const usd = (n: number) => (n < 0.01 ? `$${n.toFixed(5)}` : `$${n.toFixed(3)}`)

export function RunLine({ label, stats }: { label: string; stats: RunStats }) {
  return (
    <p className="font-mono text-[11px] leading-5 text-muted-foreground">
      <span className="text-foreground">{label}</span> · {stats.cached ? `cached · ${stats.questions} questions · 0 tokens` : `1 call · ${stats.questions} questions · ${stats.ms} ms · ${stats.inputTokens.toLocaleString()} tokens · ${usd(stats.usd)}`}
    </p>
  )
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-sm">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium">Jev’s review</p>
        <p className="font-mono text-xs text-muted-foreground">fit {review.fit.toFixed(2)} / 3 · conf {pct(review.confidence)}</p>
      </div>
      <p className="mt-1 text-muted-foreground">{review.fitLabel}.</p>
      {review.missing >= 0.5 ? <p className="mt-2 text-foreground">The brief asks for something the catalog has no block for ({pct(review.missing)}). That is a catalog gap, not a wrong pick.</p> : null}
      {review.doubts.map(d => <p key={d.id} className="mt-2 text-foreground">Doubts “{d.title}” belongs ({pct(d.p)}).</p>)}
    </div>
  )
}

function Row({ d, pins, onPin }: { d: Decision; pins: Pins; onPin: (id: string, value: string | boolean | null) => void }) {
  const canPin = d.kind === 'choice' || d.kind === 'noul'
  const options = d.kind === 'noul' ? [{ key: 'yes', p: d.options[0].p }, { key: 'no', p: 1 - d.options[0].p }] : d.options.slice(0, d.kind === 'bank' ? 6 : 4)
  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="shrink-0 text-muted-foreground">{d.label}</span>
        <span className="flex min-w-0 items-center gap-1 font-medium">{d.pinned ? <Pin className="size-3 shrink-0 text-foreground" /> : d.remixed ? <Shuffle className="size-3 shrink-0 text-muted-foreground" /> : null}<span className="truncate">{d.kind === 'bank' ? '' : d.picked.replaceAll('_', ' ')}</span></span>
      </div>
      <div className="mt-1.5 space-y-1">
        {options.map(o => {
          const value = d.kind === 'noul' ? o.key === 'yes' : o.key
          const isPinned = pins[d.id] === value
          return (
            <button key={o.key} type="button" disabled={!canPin} onClick={() => onPin(d.id, isPinned ? null : value)}
              title={canPin ? (isPinned ? 'Unpin' : 'Pin this option') : undefined}
              className="group relative block h-5 w-full overflow-hidden rounded bg-muted text-left enabled:cursor-pointer">
              <span className={`absolute inset-y-0 left-0 ${o.key === d.picked || (d.kind === 'bank' && d.picked.split(', ').includes(o.key)) ? (isPinned ? 'bg-foreground/45' : 'bg-foreground/25') : 'bg-foreground/8'}`} style={{ width: pct(Math.max(0.01, o.p)) }} />
              <span className="relative flex justify-between px-1.5 font-mono text-[11px] leading-5">
                <span className="truncate">{o.key.replaceAll('_', ' ')}</span><span className="text-muted-foreground">{pct(o.p)}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Trace({ decisions, pins, onPin }: { decisions: Decision[]; pins: Pins; onPin: (id: string, value: string | boolean | null) => void }) {
  const groups = new Map<string, Decision[]>()
  for (const d of decisions) groups.set(d.group, [...(groups.get(d.group) ?? []), d])
  return (
    <div className="space-y-3">
      {[...groups].map(([group, rows]) => (
        <details key={group} open={group === 'Canvas' || group === 'Theme' || group === 'Blocks'} className="rounded-lg border bg-card px-3">
          <summary className="cursor-pointer py-2 text-sm font-medium select-none">{group} <span className="font-normal text-muted-foreground">· {rows.length}</span></summary>
          <div className="divide-y border-t">{rows.map(d => <Row key={d.id} d={d} pins={pins} onPin={onPin} />)}</div>
        </details>
      ))}
    </div>
  )
}
