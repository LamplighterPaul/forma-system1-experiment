import { ArrowUp, Monitor, PanelRight, Plus, Shuffle, Smartphone, Tablet, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MAX_MESSAGE, type Pins, type Previous } from '@shared/harness'
import { design as requestDesign, review, type DesignResult, type ReviewResult } from './api'
import { Canvas } from './Canvas'
import { describeChanges, load, messagesOf, newDesign, newTurn, save, titleOf, type Design, type Turn } from './designs'
import { ReviewCard, RunLine, Trace } from './Trace'

const EXAMPLES = [
  'Landing page for a coffee subscription called Bean Box. Warm and friendly, with pricing and an FAQ.',
  'Analytics dashboard for an online shop: revenue, orders, a sales chart and a table of recent orders. Compact.',
  'Dark sign-up screen for a developer tool called Shipyard, with GitHub login.',
  'Portfolio for a design studio called Kiln. Minimal, editorial, serif, with selected projects and a contact form.',
  'Booking request form for a seaside restaurant called Marea.',
]
const FOLLOW_UPS = ['make it dark', 'add testimonials', 'remove the pricing', 'try something else']
const WIDTHS = { desktop: '100%', tablet: '820px', phone: '390px' } as const

const picksOf = (r: DesignResult | null): Previous =>
  Object.fromEntries((r?.decisions ?? []).filter(d => d.kind !== 'bank').map(d => [d.id, d.picked]))

function fromUrl(): Design | null {
  const q = new URLSearchParams(location.search)
  const messages = [...q.getAll('m'), ...(q.get('brief') ? [q.get('brief')!] : [])].map(m => m.trim().slice(0, MAX_MESSAGE)).filter(Boolean)
  if (!messages.length) return null
  return { ...newDesign(), turns: messages.map(newTurn), seed: Math.max(0, Number(q.get('s')) || 0) }
}

interface RunOptions { detectRemix?: boolean; remix?: boolean; turnId?: string; sticky?: boolean }

export default function App() {
  const [designs, setDesigns] = useState<Design[]>(() => {
    const stored = load(), shared = fromUrl()
    return shared ? [shared, ...stored] : stored.length ? stored : [newDesign()]
  })
  const [currentId, setCurrentId] = useState(() => designs[0].id)
  const [result, setResult] = useState<(DesignResult & { designId: string }) | null>(null)
  const [reviewed, setReviewed] = useState<ReviewResult | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [width, setWidth] = useState<keyof typeof WIDTHS>('desktop')
  const [showDecisions, setShowDecisions] = useState(true)

  const current = designs.find(d => d.id === currentId) ?? designs[0]
  const shown = result?.designId === current.id ? result : null

  // The latest values, for callbacks that outlive a render (in-flight requests).
  const live = useRef({ designs, current, result })
  live.current = { designs, current, result }
  const inflight = useRef<AbortController | null>(null)
  const threadEnd = useRef<HTMLDivElement | null>(null)

  useEffect(() => save(designs), [designs])
  useEffect(() => { threadEnd.current?.scrollIntoView({ block: 'end' }) }, [current.turns.length, busy])

  const patch = useCallback((id: string, fn: (d: Design) => Design) => setDesigns(all => all.map(d => (d.id === id ? fn(d) : d))), [])

  /** One Jev round for a design. Everything that changes the canvas goes through here. */
  const run = useCallback(async (target: Design, opts: RunOptions = {}): Promise<DesignResult> => {
    inflight.current?.abort()
    const ctl = (inflight.current = new AbortController())
    setBusy(true)
    const before = live.current.result?.designId === target.id ? live.current.result : null
    const setTurn = (fn: (t: Turn) => Turn) => opts.turnId && patch(target.id, d => ({ ...d, turns: d.turns.map(t => (t.id === opts.turnId ? fn(t) : t)) }))
    try {
      const r = await requestDesign({
        messages: messagesOf(target), pins: target.pins, seed: target.seed,
        prev: opts.sticky === false ? undefined : picksOf(before), detectRemix: opts.detectRemix, remix: opts.remix,
      }, ctl.signal)
      setResult({ ...r, designId: target.id }); setReviewed(null)
      patch(target.id, d => ({ ...d, seed: r.seed }))
      setTurn(t => ({ ...t, remix: t.remix || r.remix >= 0.5, stats: r.stats, changes: describeChanges(before?.spec ?? null, r.spec) }))
      const q = new URLSearchParams()
      for (const m of messagesOf(target).slice(0, r.remix >= 0.5 ? -1 : undefined)) q.append('m', m)
      if (r.seed) q.set('s', String(r.seed))
      history.replaceState(null, '', `?${q}`)
      review(r.spec, ctl.signal).then(setReviewed).catch(() => {})
      return r
    } catch (e) {
      if (!ctl.signal.aborted) setTurn(t => ({ ...t, error: e instanceof Error ? e.message : 'Something went wrong' }))
      throw e
    } finally {
      if (inflight.current === ctl) setBusy(false)
    }
  }, [patch])

  /** Send a message into a design: the first is the brief, the rest are revisions. */
  const send = useCallback((text: string, into?: Design): Promise<DesignResult> => {
    const message = text.replace(/\s+/g, ' ').trim().slice(0, MAX_MESSAGE)
    const base = into ?? live.current.current
    if (message.length < 3) return Promise.reject(new Error('Say a little more.'))
    const turn = newTurn(message)
    const next = { ...base, turns: [...base.turns, turn] }
    setDesigns(all => (all.some(d => d.id === base.id) ? all.map(d => (d.id === base.id ? next : d)) : [next, ...all]))
    setCurrentId(base.id)
    return run(next, { turnId: turn.id, detectRemix: messagesOf(base).length > 0 })
  }, [run])

  const remix = useCallback((): Promise<DesignResult> => {
    const base = live.current.current
    const turn: Turn = { ...newTurn('Remix'), remix: true }
    const next = { ...base, seed: base.seed + 1, turns: [...base.turns, turn] }
    patch(base.id, () => next)
    return run(next, { turnId: turn.id, remix: true })
  }, [patch, run])

  const startNew = useCallback(() => {
    const empty = live.current.designs.find(d => !d.turns.length) ?? newDesign()
    setDesigns(all => (all.includes(empty) ? all : [empty, ...all]))
    setCurrentId(empty.id); setDraft('')
    history.replaceState(null, '', location.pathname)
    return empty
  }, [])

  const open = (d: Design) => { setCurrentId(d.id); if (messagesOf(d).length) run(d, { sticky: false }).catch(() => {}) }
  const remove = (d: Design) => setDesigns(all => {
    const rest = all.filter(x => x.id !== d.id)
    const next = rest.length ? rest : [newDesign()]
    if (d.id === currentId) { setCurrentId(next[0].id); setResult(null) }
    return next
  })
  const setPins = useCallback((pins: Pins): Promise<DesignResult> => {
    const next = { ...live.current.current, pins }
    patch(next.id, () => next)
    return run(next)
  }, [patch, run])
  const onPin = (id: string, value: string | boolean | null) => {
    const pins = { ...current.pins }
    if (value === null) delete pins[id]; else pins[id] = value
    setPins(pins).catch(() => {})
  }

  // First paint: rebuild whatever design is open (a shared link, or the last one used).
  useEffect(() => {
    if (messagesOf(live.current.current).length) run(live.current.current, { sticky: false }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => { if (draft.trim().length >= 3 && !busy) { send(draft).catch(() => {}); setDraft('') } }
  const hasBrief = messagesOf(current).length > 0

  return (
    <div className="flex min-h-svh flex-col bg-background lg:h-svh">
      <div className={`spectrum-flash shrink-0 ${busy ? 'busy' : ''}`} />
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b px-4 py-2.5">
        <div className="flex items-baseline gap-3">
          <h1 className="text-sm font-semibold tracking-[0.2em] text-white">FORMA</h1>
          <p className="hidden text-sm text-muted-foreground sm:block">System One experiment · a design harness driven only by <a className="text-foreground underline underline-offset-2 hover:text-white" href="https://typesafe.ai" target="_blank" rel="noreferrer">Jev by TypeSafe AI</a>, a model that cannot write</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => setShowDecisions(v => !v)} aria-label="Toggle decisions" aria-pressed={showDecisions} className="hidden xl:inline-flex"><PanelRight className="size-4" /></Button>
        </div>
      </header>

      <div className={`grid min-h-0 flex-1 lg:grid-cols-[360px_minmax(0,1fr)] ${showDecisions ? 'xl:grid-cols-[360px_minmax(0,1fr)_340px]' : ''}`}>
        {/* Designs and the thread */}
        <aside className="flex min-h-0 flex-col border-r lg:overflow-hidden">
          <div className="border-b p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">Designs</p>
              <button type="button" onClick={startNew} className="flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-xs text-foreground hover:bg-secondary hover:text-white"><Plus className="size-3" /> New design</button>
            </div>
            <div className="max-h-32 space-y-0.5 overflow-y-auto">
              {designs.map(d => (
                <div key={d.id} className={`group flex items-center gap-2 rounded-md px-2 py-1 text-sm ${d.id === current.id ? 'bg-secondary text-white' : 'text-muted-foreground hover:bg-secondary/60'}`}>
                  <button type="button" onClick={() => open(d)} className="min-w-0 flex-1 cursor-pointer truncate text-left">{titleOf(d)}</button>
                  {d.turns.length ? <button type="button" onClick={() => remove(d)} aria-label="Delete design" className="cursor-pointer opacity-0 group-hover:opacity-100 hover:text-white"><X className="size-3.5" /></button> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-40 flex-1 space-y-4 overflow-y-auto p-3">
            {!current.turns.length ? (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="text-foreground">Describe a page, an app screen or a form, then press <kbd className="rounded border px-1 font-mono text-xs">Enter</kbd>.</p>
                <p>Jev answers about 250 typed questions in one call and Forma assembles the design from prebuilt shadcn/ui blocks. Keep typing in the same design to iterate: “make it dark”, “add pricing”, “try something else”. Every word on the canvas was written in advance; Jev only picks.</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {EXAMPLES.map(e => <button key={e} type="button" onClick={() => send(e).catch(() => {})} className="cursor-pointer rounded-full border px-2.5 py-1 text-left text-xs hover:border-foreground/40 hover:text-white">{e.split(/[.:]/)[0].replace(/ called \w+( \w+)?$/, '')}</button>)}
                </div>
              </div>
            ) : null}
            {current.turns.map(t => (
              <div key={t.id} className="space-y-1.5">
                <p className="ml-8 w-fit max-w-full justify-self-end rounded-xl rounded-br-sm bg-secondary px-3 py-1.5 text-sm text-white" style={{ marginLeft: 'auto' }}>{t.text}</p>
                {t.error ? <p className="text-xs text-destructive">{t.error}</p> : null}
                {t.changes ? (
                  <div className="space-y-1">
                    <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                      {t.remix ? <Shuffle className="size-3" /> : null}
                      JEV {t.remix ? '· read as a remix' : ''} {t.stats && !t.stats.cached ? `· ${t.stats.ms} ms · ${t.stats.questions} questions` : '· cached'}
                    </p>
                    <div className="flex flex-wrap gap-1">{t.changes.map(c => <span key={c} className="rounded border px-1.5 py-0.5 text-[11px] text-foreground">{c}</span>)}</div>
                  </div>
                ) : null}
              </div>
            ))}
            {busy ? <p className="text-[11px] text-muted-foreground">JEV · deciding…</p> : null}
            <div ref={threadEnd} />
          </div>

          <div className="border-t p-3">
            {hasBrief && shown ? (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {FOLLOW_UPS.map(f => <button key={f} type="button" disabled={busy} onClick={() => send(f).catch(() => {})} className="cursor-pointer rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-foreground/40 hover:text-white disabled:opacity-50">{f}</button>)}
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <Textarea value={draft} rows={2} autoFocus maxLength={MAX_MESSAGE} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit() } }}
                placeholder={hasBrief ? 'Tell Jev what to change, or to try something else…' : 'Describe what you want to see…'} className="max-h-40 min-h-14 resize-none text-base" />
              <div className="flex flex-col gap-1.5">
                <Button size="icon" onClick={submit} disabled={busy || draft.trim().length < 3} aria-label="Send" className="bg-primary text-white hover:bg-[#ff2a2a]"><ArrowUp className="size-4" /></Button>
                <Button size="icon" variant="outline" onClick={() => remix().catch(() => {})} disabled={busy || !shown} aria-label="Remix" title="Remix: explore Jev's runner-up choices"><Shuffle className="size-4" /></Button>
              </div>
            </div>
            <p className="mt-2 flex flex-wrap justify-between gap-x-3 font-mono text-[10px] text-muted-foreground">
              <span><span className="text-white">v{__APP_VERSION__}</span> · Forma System One experiment · <a href="https://zammitpaul.com/about" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-white">Paul Zammit</a> · <a href="https://github.com/LamplighterPaul/forma-system1-experiment" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-white">source</a></span>
              <span>Enter to send · Shift+Enter for a new line</span>
            </p>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex min-h-[70svh] min-w-0 flex-col bg-[#0a0a0b]">
          <div className="flex items-center justify-between border-b bg-background px-4 py-1.5">
            <p className="truncate font-mono text-xs text-muted-foreground">{shown ? `${shown.spec.layout.replaceAll('_', ' ')} · ${shown.spec.blocks.length} blocks · ${shown.spec.theme.accent}${shown.spec.theme.dark ? ' · dark' : ''}${shown.seed ? ` · remix ${shown.seed}` : ''}` : 'canvas'}</p>
            <div className="flex gap-0.5">
              {([['desktop', Monitor], ['tablet', Tablet], ['phone', Smartphone]] as const).map(([key, Cmp]) => (
                <button key={key} type="button" onClick={() => setWidth(key)} aria-label={key} aria-pressed={width === key}
                  className={`cursor-pointer rounded-md p-1.5 ${width === key ? 'bg-secondary text-white' : 'text-muted-foreground hover:bg-secondary'}`}><Cmp className="size-4" /></button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className={`mx-auto overflow-hidden rounded-xl border shadow-2xl shadow-black/60 transition-[max-width,opacity] duration-300 ${busy ? 'opacity-70' : ''}`} style={{ maxWidth: WIDTHS[width] }}>
              {shown ? <Canvas spec={shown.spec} /> : (
                <div className="grid min-h-[60svh] place-items-center p-10 text-center text-muted-foreground">
                  <p className="max-w-sm font-mono text-xs">{busy ? 'JEV · deciding…' : '© 1982–2026 · the canvas is empty · describe something'}</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Decisions */}
        <aside className={`min-h-0 space-y-3 border-l p-3 lg:col-span-2 lg:border-t xl:col-span-1 xl:border-t-0 xl:overflow-y-auto ${showDecisions ? '' : 'xl:hidden'}`}>
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">Decisions</p>
          {shown?.stats.decider === 'mock' ? <p className="rounded-lg border p-3 text-sm text-foreground">No Jev key is configured on this server, so a keyword mock is answering. These decisions are meaningless.</p> : null}
          {shown ? (
            <>
              <div>
                <RunLine label={`decide · ${shown.stats.model}`} stats={shown.stats} />
                {reviewed ? <RunLine label="review" stats={reviewed.stats} /> : null}
              </div>
              {reviewed ? <ReviewCard review={reviewed.review} /> : null}
              <p className="text-xs text-muted-foreground">Click any bar to pin it and overrule Jev.</p>
              <Trace decisions={shown.decisions} pins={current.pins} onPin={onPin} />
            </>
          ) : <p className="text-sm text-muted-foreground">Every typed decision Jev makes appears here with its probabilities.</p>}
          <p className="pt-2 text-xs text-muted-foreground">Not affiliated with TypeSafe AI.</p>
        </aside>
      </div>
    </div>
  )
}
