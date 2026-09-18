// The two side panels of the shell: every decision Jev made, and what the round cost.
import type { Pins, RunStats } from '@shared/harness'
import type { DesignResult, ReviewResult, WriteStats } from './api'
import { ReviewCard, Trace } from './Trace'

const usd = (n: number) => `$${n.toFixed(5)}`
const ms = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2)} s` : `${n} ms`)

export interface Perf { decide?: RunStats; write?: WriteStats; review?: RunStats; writer: 'on' | 'off' | 'unavailable' }

export function totals(p: Perf) {
  const stages = [p.decide, p.write, p.review].filter(Boolean) as { ms: number; usd: number }[]
  return { ms: stages.reduce((n, s) => n + s.ms, 0), usd: stages.reduce((n, s) => n + s.usd, 0), calls: stages.filter(s => s.ms > 0).length }
}

export function PerformancePanel({ perf, session }: { perf: Perf; session: { rounds: number; usd: number; jevUsd: number; lunaUsd: number } }) {
  const t = totals(perf)
  const rows = [
    { stage: 'decide', model: perf.decide?.model ?? 'jev', s: perf.decide, tokens: perf.decide ? `${perf.decide.inputTokens.toLocaleString()} in` : '', note: perf.decide ? `${perf.decide.questions} questions` : '' },
    { stage: 'write', model: perf.write?.model ?? 'luna', s: perf.write, tokens: perf.write ? `${perf.write.inputTokens.toLocaleString()} in · ${perf.write.outputTokens.toLocaleString()} out` : '', note: perf.writer === 'on' ? (perf.write && !perf.write.cached ? `${perf.write.calls} parallel calls` : '') : `luna ${perf.writer}` },
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
          {rows.map((r, i) => r.s?.ms ? <div key={r.stage} title={`${r.stage} ${ms(r.s.ms)}`} style={{ width: `${(100 * r.s.ms) / Math.max(1, t.ms)}%` }} className={['bg-foreground', 'bg-primary', 'bg-foreground/40'][i]} /> : null)}
        </div>
        <p className="mt-1.5 flex gap-3 text-muted-foreground"><span><span className="text-foreground">■</span> jev decide</span><span><span className="text-primary">■</span> luna write</span><span><span className="text-foreground/40">■</span> jev review</span></p>
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

export function DecisionsPanel({ result, reviewed, pins, onPin }: { result: DesignResult; reviewed: ReviewResult | null; pins: Pins; onPin: (id: string, value: string | boolean | null) => void }) {
  return (
    <div className="space-y-3">
      {result.stats.decider === 'mock' ? <p className="border p-2.5 text-xs">No Jev key on this server. A mock is answering.</p> : null}
      {reviewed ? <ReviewCard review={reviewed.review} /> : null}
      <p className="text-xs text-muted-foreground">{result.decisions.length} decisions, one call. Click a bar to overrule Jev.</p>
      <Trace decisions={result.decisions} pins={pins} onPin={onPin} />
    </div>
  )
}
