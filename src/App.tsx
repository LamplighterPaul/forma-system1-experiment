import { useCallback, useEffect, useRef, useState } from 'react'
import { MAX_MESSAGE, type Pins, type Previous } from '@shared/harness'
import type { DesignText } from '@shared/text'
import { capabilities, design as requestDesign, review, write, type DesignResult, type ReviewResult } from './api'
import { Canvas } from './Canvas'
import { describeChanges, load, messagesOf, newDesign, newTurn, save, titleOf, type Design, type Turn } from './designs'
import { DecisionsPanel, PerformancePanel, totals, type Perf } from './Panels'

const EXAMPLES = [
  'Landing page for a coffee subscription called Bean Box, warm, with pricing',
  'Portfolio for a designer called Maya Borg with projects and links to github.com/example',
  'Dashboard for an online shop: revenue, orders and a sales chart',
  'Dark sign-up screen for a developer tool called Shipyard',
  'A mind map of what a startup founder has to think about',
]
const WIDTHS = { desktop: '100%', tablet: '820px', phone: '390px' } as const
type Panel = 'decisions' | 'performance'

const picksOf = (r: DesignResult | null): Previous => Object.fromEntries((r?.decisions ?? []).filter(d => d.kind !== 'bank').map(d => [d.id, d.picked]))
const stored = (key: string, fallback: string) => { try { return localStorage.getItem(key) ?? fallback } catch { return fallback } }
const store = (key: string, value: string) => { try { localStorage.setItem(key, value) } catch { /* storage blocked */ } }

function fromUrl(): Design | null {
  const q = new URLSearchParams(location.search)
  const messages = [...q.getAll('m'), ...(q.get('brief') ? [q.get('brief')!] : [])].map(m => m.trim().slice(0, MAX_MESSAGE)).filter(Boolean)
  return messages.length ? { ...newDesign(), turns: messages.map(newTurn), seed: Math.max(0, Number(q.get('s')) || 0) } : null
}

interface RunOptions { detectRemix?: boolean; remix?: boolean; turnId?: string; sticky?: boolean }
interface Shown extends DesignResult { designId: string }

/** A bracketed text button, the only kind of control in the shell. */
function Key({ children, active, onClick, disabled, title, accent }: { children: React.ReactNode; active?: boolean; onClick?: () => void; disabled?: boolean; title?: string; accent?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} aria-pressed={active}
      className={`cursor-pointer px-1 whitespace-nowrap disabled:cursor-default disabled:opacity-40 ${accent ? 'text-primary hover:text-[#ff4d4d]' : active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-white'}`}>
      [{children}]
    </button>
  )
}

export default function App() {
  const [designs, setDesigns] = useState<Design[]>(() => {
    const saved = load(), shared = fromUrl()
    return shared ? [shared, ...saved] : saved.length ? saved : [newDesign()]
  })
  const [currentId, setCurrentId] = useState(() => designs[0].id)
  const [result, setResult] = useState<Shown | null>(null)
  const [text, setText] = useState<DesignText | null>(null)
  const [reviewed, setReviewed] = useState<ReviewResult | null>(null)
  const [perf, setPerf] = useState<Perf>({ writer: 'off' })
  const [session, setSession] = useState({ rounds: 0, usd: 0, jevUsd: 0, lunaUsd: 0 })
  const [draft, setDraft] = useState('')
  const [stage, setStage] = useState<'' | 'jev' | 'luna' | 'review'>('')
  const [width, setWidth] = useState<keyof typeof WIDTHS>('desktop')
  const [panel, setPanel] = useState<Panel>('decisions')
  const [showPanel, setShowPanel] = useState(() => stored('forma.panel', 'on') === 'on')
  const [showDesigns, setShowDesigns] = useState(false)
  const [lunaOn, setLunaOn] = useState(() => stored('forma.luna', 'on') === 'on')
  const [lunaAvailable, setLunaAvailable] = useState(true)

  const current = designs.find(d => d.id === currentId) ?? designs[0]
  const shown = result?.designId === current.id ? result : null
  const busy = stage !== ''

  // The latest values, for callbacks that outlive a render.
  const live = useRef({ designs, current, result, text, lunaOn, lunaAvailable })
  live.current = { designs, current, result, text, lunaOn, lunaAvailable }
  const inflight = useRef<AbortController | null>(null)
  const threadEnd = useRef<HTMLDivElement | null>(null)
  const prompt = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => save(designs), [designs])
  useEffect(() => { threadEnd.current?.scrollIntoView({ block: 'end' }) }, [current.turns.length, stage])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowDesigns(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const patch = useCallback((id: string, fn: (d: Design) => Design) => setDesigns(all => all.map(d => (d.id === id ? fn(d) : d))), [])

  /** One round for a design: Jev decides, Luna writes (when on), Jev reviews. Everything that changes the canvas goes through here. */
  const run = useCallback(async (target: Design, opts: RunOptions = {}): Promise<DesignResult> => {
    inflight.current?.abort()
    const ctl = (inflight.current = new AbortController())
    const same = live.current.result?.designId === target.id
    const before = same ? (live.current.result as Shown | null) : null
    const beforeText = same ? live.current.text : null
    const setTurn = (fn: (t: Turn) => Turn) => opts.turnId && patch(target.id, d => ({ ...d, turns: d.turns.map(t => (t.id === opts.turnId ? fn(t) : t)) }))
    const useLuna = live.current.lunaOn && live.current.lunaAvailable
    const round: Perf = { writer: !live.current.lunaAvailable ? 'unavailable' : useLuna ? 'on' : 'off' }
    try {
      setStage('jev')
      const r = await requestDesign({
        messages: messagesOf(target), pins: target.pins, seed: target.seed,
        prev: opts.sticky === false ? undefined : picksOf(before), detectRemix: opts.detectRemix, remix: opts.remix,
      }, ctl.signal)
      if ('refused' in r) {
        // The words are code's: Jev only supplied the probability.
        const why = r.refused === 'unsafe'
          ? `Jev flagged this (${Math.round(r.guard.unsafe * 100)}% unsafe). Forma will not build it.`
          : `Not a design brief (${Math.round(r.guard.design * 100)}%). Try a page, a screen, a form or a diagram.`
        setTurn(t => ({ ...t, refused: why, stats: r.stats }))
        throw new Error('refused')
      }
      round.decide = r.stats
      setResult({ ...r, designId: target.id }); setReviewed(null); setPerf({ ...round })
      // Keep the words already on the canvas while Luna works, so the page never flashes back to placeholder copy.
      setText(beforeText)
      patch(target.id, d => ({ ...d, seed: r.seed }))
      setTurn(t => ({ ...t, remix: t.remix || r.remix >= 0.5, stats: r.stats, changes: describeChanges(before?.spec ?? null, r.spec) }))
      const q = new URLSearchParams()
      for (const m of messagesOf(target).slice(0, r.remix >= 0.5 ? -1 : undefined)) q.append('m', m)
      if (r.seed) q.set('s', String(r.seed))
      history.replaceState(null, '', `?${q}`)

      let words: DesignText | null = null
      if (useLuna) {
        setStage('luna')
        try {
          // Parts land as Luna's parallel calls finish: headline first, then sections. Each one is painted immediately.
          let partial: DesignText = beforeText ?? { name: r.spec.copy.name, headline: r.spec.copy.headline, sub: r.spec.copy.sub, cta: r.spec.copy.cta, blocks: {}, links: [] }
          const w = await write(r.spec, beforeText, part => {
            partial = part.type === 'globals' ? { ...partial, name: part.name, headline: part.headline, sub: part.sub, cta: part.cta, links: part.links } : { ...partial, blocks: { ...partial.blocks, ...part.blocks } }
            setText(partial)
          }, ctl.signal)
          if (w.writer === 'none') { setLunaAvailable(false); round.writer = 'unavailable' }
          words = w.text; round.write = w.stats
          setText(words); setPerf({ ...round })
        } catch (e) {
          if (ctl.signal.aborted) throw e
          setTurn(t => ({ ...t, error: `Luna: ${e instanceof Error ? e.message : 'failed'}. Showing pre-written copy.` }))
        }
      } else setText(null)

      setStage('review')
      const reviewSpec = words ? { ...r.spec, copy: { name: words.name, headline: words.headline, sub: words.sub, cta: words.cta } } : r.spec
      await review(reviewSpec, ctl.signal).then(v => { round.review = v.stats; setReviewed(v); setPerf({ ...round }) }).catch(() => {})
      const t = totals(round)
      setSession(s => ({ rounds: s.rounds + 1, usd: s.usd + t.usd, jevUsd: s.jevUsd + (round.decide?.usd ?? 0) + (round.review?.usd ?? 0), lunaUsd: s.lunaUsd + (round.write?.usd ?? 0) }))
      return r
    } catch (e) {
      if (!ctl.signal.aborted && !(e instanceof Error && e.message === 'refused')) setTurn(t => ({ ...t, error: e instanceof Error ? e.message : 'Something went wrong' }))
      throw e
    } finally {
      if (inflight.current === ctl) setStage('')
    }
  }, [patch])

  /** Send a message into a design: the first is the brief, the rest are revisions. */
  const send = useCallback((message: string): Promise<DesignResult> => {
    const clean = message.replace(/\s+/g, ' ').trim().slice(0, MAX_MESSAGE)
    const base = live.current.current
    if (clean.length < 3) return Promise.reject(new Error('Say a little more.'))
    const turn = newTurn(clean)
    const next = { ...base, turns: [...base.turns, turn] }
    setDesigns(all => all.map(d => (d.id === base.id ? next : d)))
    return run(next, { turnId: turn.id, detectRemix: messagesOf(base).length > 0 })
  }, [run])

  const remix = () => {
    const base = live.current.current
    const turn: Turn = { ...newTurn('remix'), remix: true }
    const next = { ...base, seed: base.seed + 1, turns: [...base.turns, turn] }
    patch(base.id, () => next)
    run(next, { turnId: turn.id, remix: true }).catch(() => {})
  }
  const startNew = () => {
    const empty = designs.find(d => !d.turns.length) ?? newDesign()
    setDesigns(all => (all.includes(empty) ? all : [empty, ...all]))
    setCurrentId(empty.id); setDraft(''); setShowDesigns(false); setResult(null); setText(null)
    history.replaceState(null, '', location.pathname)
    prompt.current?.focus()
  }
  const open = (d: Design) => { setCurrentId(d.id); setShowDesigns(false); setText(null); if (messagesOf(d).length) run(d, { sticky: false }).catch(() => {}) }
  const remove = (d: Design) => setDesigns(all => {
    const rest = all.filter(x => x.id !== d.id)
    const next = rest.length ? rest : [newDesign()]
    if (d.id === currentId) { setCurrentId(next[0].id); setResult(null); setText(null) }
    return next
  })
  const onPin = (id: string, value: string | boolean | null) => {
    const pins: Pins = { ...current.pins }
    if (value === null) delete pins[id]; else pins[id] = value
    const next = { ...current, pins }
    patch(next.id, () => next)
    run(next).catch(() => {})
  }
  const toggleLuna = () => {
    const on = !lunaOn
    setLunaOn(on); store('forma.luna', on ? 'on' : 'off')
    live.current.lunaOn = on
    if (messagesOf(current).length) run(current).catch(() => {})
  }

  // First paint: learn what the server can do, then rebuild whatever design is open (a shared link, or the last one used).
  useEffect(() => {
    capabilities().then(c => { const ok = c.writer === 'luna'; setLunaAvailable(ok); live.current.lunaAvailable = ok }).catch(() => {})
      .finally(() => { if (messagesOf(live.current.current).length) run(live.current.current, { sticky: false }).catch(() => {}) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => { if (draft.trim().length >= 3 && !busy) { send(draft).catch(() => {}); setDraft('') } }
  const hasBrief = messagesOf(current).length > 0
  const t = totals(perf)

  return (
    <div className="flex min-h-svh flex-col bg-background text-[13px] leading-5 lg:h-svh">
      <div className={`spectrum-flash shrink-0 ${busy ? 'busy' : ''}`} />

      <header className="flex flex-wrap items-center justify-between gap-x-4 border-b px-3 py-1.5">
        <p><span className="font-semibold tracking-[0.2em] text-white">FORMA</span> <span className="bg-primary px-1 text-white">experimental</span> <span className="text-white">v{__APP_VERSION__}</span> <span className="hidden text-muted-foreground sm:inline">· designs from cheaper, faster models</span></p>
        <p className="flex items-center gap-2">
          <span title="Jev, a small decision model, picks the whole design. Always on."><span className="text-muted-foreground">jev</span> <span className="text-white">[on]</span></span>
          <span><span className="text-muted-foreground">luna</span> {lunaAvailable ? <Key active={lunaOn} onClick={toggleLuna} disabled={busy} title="Luna, a traditional LLM, writes the words. Switch it off to see Jev alone.">{lunaOn ? 'on' : 'off'}</Key> : <span className="text-muted-foreground" title="No writer key on this server">[unavailable]</span>}</span>
        </p>
      </header>

      <div className={`grid min-h-0 flex-1 lg:grid-cols-[320px_minmax(0,1fr)] ${showPanel ? 'wide:grid-cols-[300px_minmax(0,1fr)_320px]' : ''}`}>
        <aside className="flex min-h-0 flex-col border-r lg:overflow-hidden">
          <div className="flex items-center justify-between border-b px-3 py-1.5">
            <button type="button" onClick={() => setShowDesigns(v => !v)} className="min-w-0 cursor-pointer truncate text-left text-muted-foreground hover:text-white">
              {showDesigns ? '▾' : '▸'} designs <span className="text-foreground">{designs.filter(d => d.turns.length).length}</span>
            </button>
            <Key onClick={startNew}>+ new</Key>
          </div>
          {showDesigns ? (
            <div className="max-h-44 overflow-y-auto border-b py-1">
              {designs.filter(d => d.turns.length).map(d => (
                <div key={d.id} className={`group flex items-center gap-2 px-3 py-0.5 ${d.id === current.id ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}>
                  <span>{d.id === current.id ? '▸' : ' '}</span>
                  <button type="button" onClick={() => open(d)} className="min-w-0 flex-1 cursor-pointer truncate text-left">{titleOf(d)}</button>
                  <button type="button" onClick={() => remove(d)} aria-label="Delete design" className="cursor-pointer opacity-0 group-hover:opacity-100 hover:text-white">x</button>
                </div>
              ))}
              {!designs.some(d => d.turns.length) ? <p className="px-3 py-0.5 text-muted-foreground">nothing yet</p> : null}
            </div>
          ) : null}

          <div className="min-h-40 flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {!current.turns.length ? (
              <div className="space-y-3 text-muted-foreground">
                <p className="text-foreground">An experiment: how fast and cheap can design get?</p>
                <p><span className="text-foreground">Jev</span>, a small decision model, picks the design. <span className="text-foreground">Luna</span>, a traditional LLM, only writes the words. Switch Luna off to see Jev alone.</p>
                <p>Describe a page, a screen, a form or a diagram. Press enter.</p>
                <p className="text-xs">Briefs are logged anonymously for the experiment. Don’t type anything private.</p>
                <div>
                  {EXAMPLES.map((e, i) => <button key={e} type="button" onClick={() => send(e).catch(() => {})} className="block w-full cursor-pointer truncate py-0.5 text-left hover:text-white">{i + 1}. {e}</button>)}
                </div>
              </div>
            ) : null}
            {current.turns.map(turn => (
              <div key={turn.id}>
                <p className="text-white"><span className="text-primary">&gt;</span> {turn.text}</p>
                {turn.error ? <p className="pl-3.5 text-destructive">{turn.error}</p> : null}
                {turn.refused ? <p className="pl-3.5 text-muted-foreground"><span className="text-primary">refused</span> · {turn.refused}</p> : null}
                {turn.changes ? (
                  <div className="pl-3.5 text-muted-foreground">
                    <p>{turn.remix ? 'remix · ' : ''}{turn.stats && !turn.stats.cached ? `jev ${turn.stats.ms} ms` : 'jev cached'}</p>
                    {turn.changes.map(c => <p key={c} className="text-foreground">{c}</p>)}
                  </div>
                ) : null}
              </div>
            ))}
            {busy ? <p className="pl-3.5 text-muted-foreground">{stage === 'jev' ? 'jev is deciding…' : stage === 'luna' ? 'luna is writing…' : 'jev is reviewing…'}</p> : null}
            <div ref={threadEnd} />
          </div>

          <div className="flex items-start gap-2 border-t px-3 py-2">
            <span className="text-primary">&gt;</span>
            <textarea ref={prompt} value={draft} rows={2} autoFocus maxLength={MAX_MESSAGE} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit() } }}
              placeholder={hasBrief ? 'change it, or "try something else"' : 'describe a design'}
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent text-white outline-none placeholder:text-muted-foreground/70" />
            <Key accent onClick={submit} disabled={busy || draft.trim().length < 3} title="Enter to send · Shift+Enter for a new line">⏎ send</Key>
          </div>
        </aside>

        <main className="flex min-h-[70svh] min-w-0 flex-col bg-[#0a0a0b]">
          <div className="flex items-center justify-between gap-3 border-b bg-background px-3 py-1.5">
            <p className="truncate text-muted-foreground">{shown ? `${shown.spec.layout.replaceAll('_', ' ')} · ${shown.spec.blocks.length} blocks · ${shown.spec.theme.accent} on ${shown.spec.theme.base}${shown.spec.theme.dark ? ' · dark' : ''}${shown.seed ? ` · remix ${shown.seed}` : ''}` : 'canvas'}</p>
            <p className="flex shrink-0">{(['desktop', 'tablet', 'phone'] as const).map(w => <Key key={w} active={width === w} onClick={() => setWidth(w)}>{w}</Key>)}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            <div className={`mx-auto overflow-hidden border transition-[max-width,opacity] duration-300 ${stage === 'jev' ? 'opacity-60' : ''}`} style={{ maxWidth: WIDTHS[width] }}>
              {shown ? <Canvas spec={shown.spec} text={text} writing={stage === 'luna'} /> : <p className="grid min-h-[60svh] place-items-center p-10 text-muted-foreground">{busy ? 'jev is deciding…' : 'the canvas is empty'}</p>}
            </div>
          </div>

        </main>

        {showPanel ? (
          <aside className="flex min-h-0 flex-col border-l lg:col-span-2 lg:border-t wide:col-span-1 wide:border-t-0 wide:overflow-hidden">
            <div className="flex items-center justify-between border-b px-3 py-1.5">
              <p className="flex"><Key active={panel === 'decisions'} onClick={() => setPanel('decisions')}>decisions</Key><Key active={panel === 'performance'} onClick={() => setPanel('performance')}>performance</Key></p>
              <Key onClick={() => { setShowPanel(false); store('forma.panel', 'off') }}>hide</Key>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {!shown ? <p className="text-muted-foreground">Jev’s decisions and what each round cost appear here.</p>
                : panel === 'decisions' ? <DecisionsPanel result={shown} reviewed={reviewed} pins={current.pins} onPin={onPin} /> : <PerformancePanel perf={perf} session={session} />}
            </div>
          </aside>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 border-t px-3 py-1">
        <p className="min-w-0 truncate text-muted-foreground">
          {shown && perf.decide ? (
            <>
              <span className="text-foreground">jev</span> {perf.decide.cached ? 'cached' : `${perf.decide.ms} ms`} · {perf.decide.questions}q
              {perf.write ? <> │ <span className="text-foreground">luna</span> {perf.write.cached ? 'cached' : `${(perf.write.ms / 1000).toFixed(1)} s`}</> : perf.writer !== 'on' ? <> │ luna {perf.writer}</> : null}
              {reviewed ? <> │ <span className="text-foreground">fit</span> {reviewed.review.fit.toFixed(1)}/3</> : null}
              {' '}│ <span className="text-white">{t.ms >= 1000 ? `${(t.ms / 1000).toFixed(1)} s` : `${t.ms} ms`} · ${t.usd.toFixed(5)}</span>
            </>
          ) : 'ready'}
        </p>
        <p className="flex flex-wrap items-center gap-x-1">
          {!showPanel ? <Key onClick={() => { setShowPanel(true); store('forma.panel', 'on') }}>decisions</Key> : null}
          <Key onClick={remix} disabled={busy || !shown} title="Explore Jev's runner-up choices. No model call.">remix</Key>
          <span className="pl-2 text-muted-foreground"><a href="https://zammitpaul.com/about" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-white">Paul Zammit</a> · <a href="https://github.com/LamplighterPaul/forma-system1-experiment" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-white">source</a></span>
        </p>
      </footer>
    </div>
  )
}
