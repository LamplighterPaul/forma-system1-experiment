// The two side panels of the shell: every decision Jev made, and what the round cost.
import type { Pins, RunStats } from '@shared/harness'
import type { Placement } from '@shared/text'
import type { DesignResult, ReviewResult, WriteStats } from './api'
import { ReviewCard, Trace } from './Trace'

const usd = (n: number) => `$${n.toFixed(5)}`
const ms = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2)} s` : `${n} ms`)

export interface Perf { decide?: RunStats; write?: WriteStats; review?: RunStats; writer: 'on' | 'off' | 'unavailable' | 'skipped'; /** Jev's probability that this turn needed the writer. */ needsWords?: number }

export function totals(p: Perf) {
  const stages = [p.decide, p.write, p.write?.arrange, p.review].filter(Boolean) as { ms: number; usd: number }[]
  return { ms: stages.reduce((n, s) => n + s.ms, 0), usd: stages.reduce((n, s) => n + s.usd, 0), calls: stages.filter(s => s.ms > 0).length }
}

export function PerformancePanel({ perf, session }: { perf: Perf; session: { rounds: number; usd: number; jevUsd: number; lunaUsd: number } }) {
  const t = totals(perf)
  const rows: { stage: string; model: string; s?: { ms: number; usd: number; cached?: boolean }; tokens: string; note: string }[] = [
    { stage: 'decide', model: perf.decide?.model ?? 'jev', s: perf.decide, tokens: perf.decide ? `${perf.decide.inputTokens.toLocaleString()} in` : '', note: perf.decide ? `${perf.decide.questions} questions` : '' },
    { stage: 'write', model: perf.write?.model ?? 'luna', s: perf.write, tokens: perf.write ? `${perf.write.inputTokens.toLocaleString()} in · ${perf.write.outputTokens.toLocaleString()} out` : '', note: perf.writer === 'on' ? (perf.write && !perf.write.cached ? `${perf.write.calls} parallel calls` : '') : perf.writer === 'skipped' ? `skipped by jev · ${Math.round((perf.needsWords ?? 0) * 100)}% chance words were needed` : `luna ${perf.writer}` },
    ...(perf.write?.arrange ? [{ stage: 'arrange', model: 'jev', s: { ms: perf.write.arrange.ms, usd: perf.write.arrange.usd }, tokens: `${perf.write.arrange.inputTokens.toLocaleString()} in`, note: `${perf.write.arrange.questions} questions · runs beside luna` }] : []),
    { stage: 'review', model: perf.review?.model ?? 'jev', s: perf.review, tokens: perf.review ? `${perf.review.inputTokens.toLocaleString()} in` : '', note: perf.review ? `${perf.review.questions} questions` : '' },
  ]
  return (
    <div className="space-y-4 text-xs">
      <p className="text-muted-foreground">Jev decides, Luna writes, Jev reviews.</p>
      <table className="w-full border-collapse">
        <thead><tr className="text-left text-muted-foreground">{['stage', 'model', 'time', 'tokens', 'cost'].map(h => <th key={h} className="border-b py-1.5 pr-2 font-normal last:pr-0 last:text-right">{h}</th>)}</tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.stage} className="align-top">
              <td className="border-b py-2 pr-2 text-white">{r.stage}</td>
              <td className="border-b py-2 pr-2">{r.model}</td>
              <td className="border-b py-2 pr-2">{r.s ? (r.s.ms ? ms(r.s.ms) : 'cached') : '–'}</td>
              <td className="border-b py-2 pr-2">{r.tokens || '–'}{r.note ? <span className="block text-muted-foreground">{r.note}</span> : null}</td>
              <td className="border-b py-2 text-right">{r.s ? usd(r.s.usd) : '–'}</td>
            </tr>
          ))}
          <tr className="text-white"><td className="py-2" colSpan={2}>total</td><td className="py-2">{ms(t.ms)}</td><td /><td className="py-2 text-right">{usd(t.usd)}</td></tr>
        </tbody>
      </table>

      <div>
        <p className="mb-1.5 text-muted-foreground">where the time went</p>
        <div className="flex h-3 w-full overflow-hidden border">
          {rows.map(r => r.s?.ms ? <div key={r.stage} title={`${r.stage} ${ms(r.s.ms)}`} style={{ width: `${(100 * r.s.ms) / Math.max(1, t.ms)}%` }} className={r.stage === 'write' ? 'bg-primary' : r.stage === 'decide' ? 'bg-foreground' : 'bg-foreground/40'} /> : null)}
        </div>
        <p className="mt-1.5 flex gap-3 text-muted-foreground"><span><span className="text-foreground">■</span> jev decide</span><span><span className="text-primary">■</span> luna write</span><span><span className="text-foreground/40">■</span> jev arrange, review</span></p>
      </div>

      <div className="border p-2.5">
        <p className="text-muted-foreground">this tab</p>
        <p className="mt-1 text-white">{session.rounds} round{session.rounds === 1 ? '' : 's'} · {usd(session.usd)}</p>
        <p className="mt-0.5 text-muted-foreground">jev {usd(session.jevUsd)} · luna {usd(session.lunaUsd)}</p>
      </div>
      <p className="text-muted-foreground">Per million tokens: Jev $0.042 in. Luna $0.20 in, $1.20 out.</p>
    </div>
  )
}

export function DecisionsPanel({ result, reviewed, pins, onPin, structure }: { result: DesignResult; reviewed: ReviewResult | null; pins: Pins; onPin: (id: string, value: string | boolean | null) => void; structure?: Placement[] }) {
  return (
    <div className="space-y-3">
      {result.stats.decider === 'mock' ? <p className="border p-2.5 text-xs">No Jev key on this server. A mock is answering.</p> : null}
      {reviewed ? <ReviewCard review={reviewed.review} /> : null}
      <p className="text-xs text-muted-foreground">{result.decisions.length} decisions, one call. Click a bar to overrule Jev.</p>
      {structure?.length ? (
        <details open className="border px-2.5">
          <summary className="cursor-pointer py-1.5 text-xs text-white select-none">Diagram structure <span className="text-muted-foreground">· {structure.length} placements by Jev</span></summary>
          <div className="space-y-1 border-t py-2 text-xs">
            {structure.map(s => (
              <p key={s.child} className="flex justify-between gap-2"><span className="min-w-0 truncate"><span className="text-white">{s.child}</span> <span className="text-muted-foreground">under</span> {s.parent}</span>
                <span className="shrink-0 text-muted-foreground" title={s.runnerUp ? `runner-up: ${s.runnerUp}` : undefined}>{Math.round(s.p * 100)}%</span></p>
            ))}
          </div>
        </details>
      ) : null}
      <Trace decisions={result.decisions} pins={pins} onPin={onPin} />
    </div>
  )
}
