import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icon } from '@/lib/icons'
import { FAQS, FEATURES, ITEM_KINDS, METRICS } from '@shared/catalog'
import { items, list, type BlockProps } from './types'

export function Logo({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <span className="grid size-6 place-items-center rounded-md bg-primary text-xs text-primary-foreground">{name[0]}</span>
      <span className="forma-heading">{name}</span>
    </div>
  )
}

export function Thumb({ icon = 'sparkles', className = '' }: { icon?: string; className?: string }) {
  return (
    <div className={`grid place-items-center bg-linear-to-br from-primary/25 via-primary/10 to-muted ${className}`}>
      <Icon name={icon} className="size-8 text-primary/50" />
    </div>
  )
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <h2 className="forma-heading text-3xl font-semibold tracking-tight text-balance">{title}</h2>
      {sub ? <p className="mt-3 text-muted-foreground text-balance">{sub}</p> : null}
    </div>
  )
}

export function LinkRow({ links, className = '' }: { links: BlockProps['links']; className?: string }) {
  if (!links.length) return null
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${className}`}>
      {links.map(l => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="underline decoration-primary/40 underline-offset-4 hover:decoration-primary">{l.label}</a>)}
    </div>
  )
}

export function Banner({ text, spec }: BlockProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-primary px-4 py-2 text-center text-sm text-primary-foreground">
      <span>{text?.heading || `New from ${spec.copy.name}: now available`}</span>
      <span className="font-medium underline underline-offset-4">{text?.button || 'Learn more'}</span>
    </div>
  )
}

export function Navbar({ spec, props }: BlockProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
      <Logo name={spec.copy.name} />
      <nav className="hidden items-center gap-6 text-sm text-muted-foreground @2xl:flex">
        {list(props.items).map(item => <span key={item}>{item}</span>)}
      </nav>
      <div className="flex items-center gap-2">
        {props.login ? <Button variant="ghost" size="sm">Log in</Button> : null}
        <Button size="sm">{spec.copy.cta}</Button>
      </div>
    </header>
  )
}

export function Hero({ spec, props, text }: BlockProps) {
  const { headline, sub, cta } = spec.copy
  const eyebrow = text?.sub || (props.badge ? 'New · now available' : '')
  const badge = eyebrow ? <Badge variant="secondary" className="mb-5"><Icon name="sparkles" className="size-3" /> {eyebrow}</Badge> : null
  const second = text?.button || 'Learn more'
  if (props.variant === 'split') {
    return (
      <section className="section grid items-center gap-10 px-6 @3xl:grid-cols-2">
        <div>
          {badge}
          <h1 className="forma-heading text-4xl font-semibold tracking-tight text-balance @4xl:text-5xl">{headline}</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">{sub}</p>
          <div className="mt-7 flex gap-3"><Button size="lg">{cta}</Button><Button size="lg" variant="outline">{second}</Button></div>
        </div>
        <Thumb icon="camera" className="aspect-4/3 rounded-xl border" />
      </section>
    )
  }
  return (
    <section className="section flex flex-col items-center px-6 text-center">
      {badge}
      <h1 className="forma-heading max-w-3xl text-4xl font-semibold tracking-tight text-balance @3xl:text-6xl">{headline}</h1>
      <p className="mt-5 max-w-xl text-lg text-muted-foreground text-balance">{sub}</p>
      {props.variant === 'email_capture' ? (
        <div className="mt-8 flex w-full max-w-sm gap-2"><Input type="email" placeholder="you@example.com" /><Button>{cta}</Button></div>
      ) : (
        <div className="mt-8 flex gap-3"><Button size="lg">{cta}</Button><Button size="lg" variant="outline">{second}</Button></div>
      )}
    </section>
  )
}

export function Logos() {
  return (
    <section className="border-y bg-muted/40 px-6 py-8 text-center">
      <p className="text-xs tracking-widest text-muted-foreground uppercase">Trusted by teams at</p>
      <div className="mt-4 flex flex-wrap justify-center gap-x-10 gap-y-3 text-lg font-semibold text-muted-foreground/70">
        {['Northwind', 'Atlas', 'Kiln & Co', 'Sol Energy', 'Fieldnotes'].map(n => <span key={n}>{n}</span>)}
      </div>
    </section>
  )
}

export function About({ spec, props, text, links }: BlockProps) {
  const heading = text?.heading || `About ${spec.copy.name}`
  const body = text?.sub || `${spec.copy.name} is built with care by a small team that sweats the details. We believe good work speaks for itself.`
  const facts = items(text, [{ title: 'Based in', body: 'Valletta, Malta', meta: '' }, { title: 'Focus', body: 'Thoughtful, useful work', meta: '' }, { title: 'Since', body: '2019', meta: '' }])
  const content = (
    <div className={props.variant === 'centered' ? 'mx-auto max-w-2xl text-center' : ''}>
      <h2 className="forma-heading text-3xl font-semibold tracking-tight">{heading}</h2>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{body}</p>
      <dl className={`mt-6 grid gap-4 @xl:grid-cols-3 ${props.variant === 'centered' ? 'text-center' : ''}`}>
        {facts.map(f => <div key={f.title}><dt className="text-xs tracking-wider text-muted-foreground uppercase">{f.title}</dt><dd className="mt-1 font-medium">{f.body}</dd></div>)}
      </dl>
      <LinkRow links={links} className={`mt-6 ${props.variant === 'centered' ? 'justify-center' : ''}`} />
    </div>
  )
  if (props.variant === 'centered') return <section className="section px-6">{content}</section>
  return (
    <section className="section grid items-center gap-10 px-6 @3xl:grid-cols-[2fr_3fr]">
      <Thumb icon="smile" className="aspect-square rounded-xl border" />
      {content}
    </section>
  )
}

export function Links({ spec, props, text, links }: BlockProps) {
  const shown = links.length ? links : [{ label: 'Website', url: '#' }, { label: 'LinkedIn', url: '#' }, { label: 'GitHub', url: '#' }]
  if (props.variant === 'row') {
    return <section className="px-6 py-8 text-center">{text?.heading ? <p className="mb-3 text-sm text-muted-foreground">{text.heading}</p> : null}<LinkRow links={shown} className="justify-center" /></section>
  }
  return (
    <section className={spec.layout === 'marketing_page' ? 'section px-6' : 'w-full'}>
      <div className="mx-auto w-full max-w-sm text-center">
        {text?.heading ? <h2 className="forma-heading text-xl font-semibold">{text.heading}</h2> : null}
        {text?.sub ? <p className="mt-1 text-sm text-muted-foreground">{text.sub}</p> : null}
        <div className="mt-5 grid gap-2.5">
          {shown.map(l => <a key={l.label + l.url} href={l.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full justify-between' })}>{l.label}<Icon name="send" className="size-4 opacity-50" /></a>)}
        </div>
        {!links.length ? <p className="mt-3 text-xs text-muted-foreground">Add addresses to the brief to make these real links.</p> : null}
      </div>
    </section>
  )
}

export function Features({ spec, props, text }: BlockProps) {
  const bank = list(props.items).map(k => FEATURES[k]).filter(Boolean)
  const written = text?.items ?? []
  const shown = bank.map((f, i) => ({ icon: f.icon, title: written[i]?.title || f.title, desc: written[i]?.body || f.desc }))
  const heading = text?.heading || `Why ${spec.copy.name}`, sub = text?.sub || 'The details that make the difference.'
  if (props.variant === 'list') {
    return (
      <section className="section grid gap-10 px-6 @3xl:grid-cols-2">
        <div><h2 className="forma-heading text-3xl font-semibold tracking-tight">{heading}</h2><p className="mt-3 text-muted-foreground">{sub}</p></div>
        <ul className="space-y-5">
          {shown.map(f => (
            <li key={f.title} className="flex gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Icon name="check" className="size-3" /></span>
              <div><p className="font-medium">{f.title}</p><p className="text-sm text-muted-foreground">{f.desc}</p></div>
            </li>
          ))}
        </ul>
      </section>
    )
  }
  return (
    <section className="section px-6">
      <SectionHead title={heading} sub={sub} />
      <div className="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
        {shown.map(f => props.variant === 'plain' ? (
          <div key={f.title} className="p-2"><Icon name={f.icon} className="size-6 text-primary" /><p className="mt-3 font-medium">{f.title}</p><p className="mt-1 text-sm text-muted-foreground">{f.desc}</p></div>
        ) : (
          <Card key={f.title}>
            <CardHeader>
              <span className="mb-2 grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon name={f.icon} className="size-4.5" /></span>
              <CardTitle>{f.title}</CardTitle>
              <CardDescription>{f.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}

export function Steps({ text }: BlockProps) {
  const steps = items(text, [{ title: 'Tell us what you need', body: 'Answer a few quick questions.', meta: '' }, { title: 'We set it up', body: 'Everything is prepared for you.', meta: '' }, { title: 'Enjoy', body: 'Sit back. Change anything, any time.', meta: '' }])
  return (
    <section className="section px-6">
      <SectionHead title={text?.heading || 'How it works'} sub={text?.sub} />
      <ol className="grid gap-6 @3xl:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="relative border-t-2 border-primary/30 pt-5">
            <span className="forma-heading text-4xl font-semibold text-primary/70">{String(i + 1).padStart(2, '0')}</span>
            <p className="mt-2 font-medium">{s.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Timeline({ text }: BlockProps) {
  const rows = items(text, [{ title: 'Founded', body: 'Started with one idea and a borrowed desk.', meta: '2019' }, { title: 'First customers', body: 'Word of mouth did the rest.', meta: '2021' },
    { title: 'Grew the team', body: 'Still small, on purpose.', meta: '2023' }, { title: 'Today', body: 'Doing the best work we have done.', meta: '2026' }])
  return (
    <section className="section mx-auto max-w-3xl px-6">
      <SectionHead title={text?.heading || 'The story so far'} />
      <ol className="space-y-8 border-l pl-6">
        {rows.map(r => (
          <li key={r.title + r.meta} className="relative">
            <span className="absolute top-1.5 -left-[1.95rem] size-3 rounded-full border-2 border-background bg-primary" />
            <p className="text-xs tracking-wider text-muted-foreground uppercase">{r.meta}</p>
            <p className="mt-1 font-medium">{r.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

const KIND_ICON: Record<string, string> = { products: 'tag', food: 'leaf', articles: 'book', places: 'map_pin', events: 'ticket', courses: 'graduation', projects: 'camera', people: 'smile' }

export function Showcase({ props, text }: BlockProps) {
  const kind = String(props.kind ?? 'products')
  const def = ITEM_KINDS[kind] ?? ITEM_KINDS.products
  const shown = text?.items.length ? text.items.map(i => ({ title: i.title, meta: i.body, price: i.meta })) : def.items
  return (
    <section className="section px-6">
      <SectionHead title={text?.heading || def.heading} />
      <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
        {shown.map(item => (
          <Card key={item.title} className="overflow-hidden pt-0">
            <Thumb icon={KIND_ICON[kind]} className="aspect-16/10" />
            <CardHeader><CardTitle>{item.title}</CardTitle><CardDescription>{item.meta}</CardDescription></CardHeader>
            {item.price ? <CardFooter className="justify-between"><span className="font-semibold">{item.price}</span><Button size="sm" variant="outline">View</Button></CardFooter> : null}
          </Card>
        ))}
      </div>
    </section>
  )
}

export function Gallery({ props, text }: BlockProps) {
  const shots = items(text, ['Morning light', 'The details', 'Behind the scenes', 'In use', 'The space', 'Up close'].map(title => ({ title, body: '', meta: '' })))
  const mosaic = props.variant === 'mosaic'
  return (
    <section className="section px-6">
      <SectionHead title={text?.heading || 'Gallery'} />
      <div className={`grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-3 ${mosaic ? '@3xl:grid-rows-2' : ''}`}>
        {shots.map((s, i) => (
          <figure key={s.title + i} className={`group relative overflow-hidden rounded-xl border ${mosaic && i === 0 ? '@3xl:col-span-2 @3xl:row-span-2' : ''}`}>
            <Thumb icon="camera" className={mosaic && i === 0 ? 'aspect-4/3 h-full' : 'aspect-4/3'} />
            <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-3 text-sm text-white">{s.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

export function Stats({ props, text }: BlockProps) {
  const bank = list(props.items).map(k => METRICS[k]).filter(Boolean)
  const shown = bank.map((m, i) => ({ value: text?.items[i]?.title || m.value, label: text?.items[i]?.body || m.label }))
  return (
    <section className="border-y bg-muted/40 px-6 py-12">
      <div className="grid gap-8 text-center @xl:grid-cols-2 @3xl:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]" style={{ '--n': shown.length } as React.CSSProperties}>
        {shown.map(m => <div key={m.label}><p className="forma-heading text-4xl font-semibold tracking-tight">{m.value}</p><p className="mt-1 text-sm text-muted-foreground">{m.label}</p></div>)}
      </div>
    </section>
  )
}

const QUOTES = [
  { title: 'It does exactly what it promises. I recommended it to everyone I know within a week.', body: 'Customer since 2024', meta: '' },
  { title: 'Simple, thoughtful and genuinely a pleasure to use. The support is excellent too.', body: 'Verified customer', meta: '' },
  { title: 'I have tried the alternatives. Nothing else comes close for the price.', body: 'Member', meta: '' },
]

export function Testimonials({ props, text }: BlockProps) {
  const quotes = items(text, QUOTES)
  const who = (body: string, i: number) => (
    <div className="flex items-center gap-3">
      <Avatar><AvatarFallback>{['MB', 'DO', 'YT'][i % 3]}</AvatarFallback></Avatar>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  )
  if (props.variant === 'single') {
    return (
      <section className="section mx-auto max-w-3xl px-6 text-center">
        <p className="forma-heading text-2xl leading-snug font-medium text-balance @3xl:text-3xl">“{quotes[0].title}”</p>
        <div className="mt-6 flex justify-center">{who(quotes[0].body, 0)}</div>
      </section>
    )
  }
  return (
    <section className="section px-6">
      <SectionHead title={text?.heading || 'People love it'} />
      <div className="grid gap-4 @3xl:grid-cols-3">
        {quotes.map((t, i) => (
          <Card key={t.title}>
            <CardContent className="space-y-4">
              <div className="flex gap-0.5 text-primary">{[0, 1, 2, 3, 4].map(s => <Icon key={s} name="star" className="size-4 fill-current" />)}</div>
              <p className="text-sm">“{t.title}”</p>
              {who(t.body, i)}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

const TIERS = [
  { title: 'Starter', meta: '$9', body: 'The essentials; Email support; Cancel any time' },
  { title: 'Plus', meta: '$19', body: 'Everything in Starter; Priority support; Extra perks every month; Early access to new things' },
  { title: 'Team', meta: '$49', body: 'Everything in Plus; Shared billing; A dedicated contact' },
]

export function Pricing({ spec, props, text }: BlockProps) {
  const count = props.tiers === 'two' ? 2 : 3
  const tiers = items(text, TIERS).slice(0, count)
  const popular = tiers.length === 2 ? 1 : 1
  return (
    <section className="section px-6">
      <SectionHead title={text?.heading || 'Simple pricing'} sub={text?.sub || 'No hidden fees. Change or cancel whenever you like.'} />
      {props.yearly ? (
        <Tabs defaultValue="monthly" className="mb-8 items-center"><TabsList><TabsTrigger value="monthly">Monthly</TabsTrigger><TabsTrigger value="yearly">Yearly · save 20%</TabsTrigger></TabsList></Tabs>
      ) : null}
      <div className={`mx-auto grid gap-4 ${tiers.length === 2 ? 'max-w-3xl @2xl:grid-cols-2' : '@3xl:grid-cols-3'}`}>
        {tiers.map((t, i) => (
          <Card key={t.title} className={i === popular ? 'ring-2 ring-primary' : ''}>
            <CardHeader><CardTitle className="flex items-center justify-between">{t.title}{i === popular ? <Badge>Popular</Badge> : null}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p><span className="forma-heading text-4xl font-semibold">{t.meta}</span>{props.yearly ? <span className="text-muted-foreground"> / month</span> : null}</p>
              <ul className="space-y-2 text-sm">
                {t.body.split(';').map(l => l.trim()).filter(Boolean).map(l => <li key={l} className="flex gap-2"><Icon name="check" className="mt-0.5 size-4 shrink-0 text-primary" />{l}</li>)}
              </ul>
            </CardContent>
            <CardFooter><Button className="w-full" variant={i === popular ? 'default' : 'outline'}>{spec.copy.cta}</Button></CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

export function Faq({ props, text }: BlockProps) {
  const bank = list(props.items).map(k => FAQS[k]).filter(Boolean).map(f => ({ title: f.q, body: f.a, meta: '' }))
  const shown = items(text, bank)
  return (
    <section className="section mx-auto max-w-2xl px-6">
      <SectionHead title={text?.heading || 'Questions, answered'} />
      <Accordion defaultValue={['q0']}>
        {shown.map((f, i) => (
          <AccordionItem key={f.title} value={`q${i}`}>
            <AccordionTrigger>{f.title}</AccordionTrigger>
            <AccordionContent><p className="text-muted-foreground">{f.body}</p></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export function Contact({ text, links }: BlockProps) {
  const rows = items(text, [{ title: 'Email', body: 'hello@example.com', meta: '' }, { title: 'Studio', body: '12 Example Street', meta: '' }, { title: 'Hours', body: 'Monday to Friday, 9 to 5', meta: '' }])
  return (
    <section className="section px-6">
      <SectionHead title={text?.heading || 'Get in touch'} sub={text?.sub} />
      <div className="mx-auto grid max-w-3xl gap-4 @2xl:grid-cols-3">
        {rows.map(r => <Card key={r.title} size="sm"><CardHeader><CardDescription>{r.title}</CardDescription><CardTitle className="text-base">{r.body}</CardTitle></CardHeader></Card>)}
      </div>
      <LinkRow links={links} className="mt-6 justify-center" />
    </section>
  )
}

export function Cta({ spec, text }: BlockProps) {
  return (
    <section className="px-6 py-10">
      <div className="rounded-2xl bg-primary px-8 py-14 text-center text-primary-foreground">
        <h2 className="forma-heading text-3xl font-semibold tracking-tight text-balance">{text?.heading || 'Ready when you are'}</h2>
        <p className="mx-auto mt-3 max-w-md opacity-80">{text?.sub || spec.copy.sub}</p>
        <Button size="lg" variant="secondary" className="mt-7">{spec.copy.cta}</Button>
      </div>
    </section>
  )
}

export function Newsletter({ spec, text }: BlockProps) {
  return (
    <section className="section px-6">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="forma-heading text-xl">{text?.heading || 'Stay in the loop'}</CardTitle>
          <CardDescription>{text?.sub || `Occasional updates from ${spec.copy.name}. No spam, unsubscribe any time.`}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2"><Input type="email" placeholder="you@example.com" /><Button>{text?.button || 'Subscribe'}</Button></CardContent>
      </Card>
    </section>
  )
}

export function Footer({ spec, props, text, links }: BlockProps) {
  const blurb = text?.sub || `${spec.copy.headline}.`
  if (props.variant === 'columns') {
    const cols = { Product: ['Overview', 'Pricing', 'What’s new'], Company: ['About', 'Careers', 'Contact'], Help: ['Support', 'Privacy', 'Terms'] }
    return (
      <footer className="border-t px-6 py-10">
        <div className="grid gap-8 @2xl:grid-cols-4">
          <div><Logo name={spec.copy.name} /><p className="mt-3 text-sm text-muted-foreground">{blurb}</p><LinkRow links={links} className="mt-3" /></div>
          {Object.entries(cols).map(([h, ls]) => <div key={h} className="text-sm"><p className="font-medium">{h}</p><ul className="mt-3 space-y-2 text-muted-foreground">{ls.map(l => <li key={l}>{l}</li>)}</ul></div>)}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">© 2026 {spec.copy.name}. All rights reserved.</p>
      </footer>
    )
  }
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-6 text-sm text-muted-foreground">
      <Logo name={spec.copy.name} />
      <LinkRow links={links} />
      <p>© 2026 {spec.copy.name}</p>
    </footer>
  )
}
