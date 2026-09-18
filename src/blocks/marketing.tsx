import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icon } from '@/lib/icons'
import { FAQS, FEATURES, ITEM_KINDS, METRICS } from '@shared/catalog'
import type { BlockProps } from './types'

const list = (v: unknown) => (Array.isArray(v) ? (v as string[]) : [])

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

export function Hero({ spec, props }: BlockProps) {
  const { headline, sub, cta } = spec.copy
  const badge = props.badge ? <Badge variant="secondary" className="mb-5"><Icon name="sparkles" className="size-3" /> New · now available</Badge> : null
  if (props.variant === 'split') {
    return (
      <section className="section grid items-center gap-10 px-6 @3xl:grid-cols-2">
        <div>
          {badge}
          <h1 className="forma-heading text-4xl font-semibold tracking-tight text-balance @4xl:text-5xl">{headline}</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">{sub}</p>
          <div className="mt-7 flex gap-3"><Button size="lg">{cta}</Button><Button size="lg" variant="outline">Learn more</Button></div>
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
        <div className="mt-8 flex gap-3"><Button size="lg">{cta}</Button><Button size="lg" variant="outline">Learn more</Button></div>
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

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <h2 className="forma-heading text-3xl font-semibold tracking-tight text-balance">{title}</h2>
      {sub ? <p className="mt-3 text-muted-foreground">{sub}</p> : null}
    </div>
  )
}

export function Features({ spec, props }: BlockProps) {
  const items = list(props.items).map(k => FEATURES[k]).filter(Boolean)
  if (props.variant === 'list') {
    return (
      <section className="section grid gap-10 px-6 @3xl:grid-cols-2">
        <div>
          <h2 className="forma-heading text-3xl font-semibold tracking-tight">Why {spec.copy.name}</h2>
          <p className="mt-3 text-muted-foreground">The details that make the difference.</p>
        </div>
        <ul className="space-y-5">
          {items.map(f => (
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
      <SectionHead title={`Why ${spec.copy.name}`} sub="The details that make the difference." />
      <div className="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
        {items.map(f => props.variant === 'plain' ? (
          <div key={f.title} className="p-2">
            <Icon name={f.icon} className="size-6 text-primary" />
            <p className="mt-3 font-medium">{f.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
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

const KIND_ICON: Record<string, string> = { products: 'tag', food: 'leaf', articles: 'book', places: 'map_pin', events: 'ticket', courses: 'graduation', projects: 'camera', people: 'smile' }

export function Showcase({ props }: BlockProps) {
  const kind = String(props.kind ?? 'products')
  const def = ITEM_KINDS[kind] ?? ITEM_KINDS.products
  return (
    <section className="section px-6">
      <SectionHead title={def.heading} />
      <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
        {def.items.map(item => (
          <Card key={item.title} className="overflow-hidden pt-0">
            <Thumb icon={KIND_ICON[kind]} className="aspect-16/10" />
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.meta}</CardDescription>
            </CardHeader>
            {item.price ? <CardFooter className="justify-between"><span className="font-semibold">{item.price}</span><Button size="sm" variant="outline">View</Button></CardFooter> : null}
          </Card>
        ))}
      </div>
    </section>
  )
}

export function Stats({ props }: BlockProps) {
  const items = list(props.items).map(k => METRICS[k]).filter(Boolean)
  return (
    <section className="border-y bg-muted/40 px-6 py-12">
      <div className="grid gap-8 text-center @xl:grid-cols-2 @3xl:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]" style={{ '--n': items.length } as React.CSSProperties}>
        {items.map(m => (
          <div key={m.label}>
            <p className="forma-heading text-4xl font-semibold tracking-tight">{m.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const QUOTES = [
  { who: 'Maria Borg', role: 'Customer since 2024', text: 'It does exactly what it promises. I recommended it to everyone I know within a week.' },
  { who: 'Daniel Okafor', role: 'Verified customer', text: 'Simple, thoughtful and genuinely a pleasure to use. The support is excellent too.' },
  { who: 'Yuki Tanaka', role: 'Member', text: 'I have tried the alternatives. Nothing else comes close for the price.' },
]
const initials = (s: string) => s.split(' ').map(w => w[0]).join('')

export function Testimonials({ props }: BlockProps) {
  if (props.variant === 'single') {
    const t = QUOTES[0]
    return (
      <section className="section mx-auto max-w-3xl px-6 text-center">
        <p className="forma-heading text-2xl leading-snug font-medium text-balance @3xl:text-3xl">“{t.text}”</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Avatar><AvatarFallback>{initials(t.who)}</AvatarFallback></Avatar>
          <div className="text-left text-sm"><p className="font-medium">{t.who}</p><p className="text-muted-foreground">{t.role}</p></div>
        </div>
      </section>
    )
  }
  return (
    <section className="section px-6">
      <SectionHead title="People love it" />
      <div className="grid gap-4 @3xl:grid-cols-3">
        {QUOTES.map(t => (
          <Card key={t.who}>
            <CardContent className="space-y-4">
              <div className="flex gap-0.5 text-primary">{[0, 1, 2, 3, 4].map(i => <Icon key={i} name="star" className="size-4 fill-current" />)}</div>
              <p className="text-sm">“{t.text}”</p>
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>{initials(t.who)}</AvatarFallback></Avatar>
                <div className="text-sm"><p className="font-medium">{t.who}</p><p className="text-muted-foreground">{t.role}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

const TIERS = [
  { name: 'Starter', price: '$9', note: 'For getting going', lines: ['The essentials', 'Email support', 'Cancel any time'] },
  { name: 'Plus', price: '$19', note: 'Our most popular plan', lines: ['Everything in Starter', 'Priority support', 'Extra perks every month', 'Early access to new things'], popular: true },
  { name: 'Team', price: '$49', note: 'For groups and companies', lines: ['Everything in Plus', 'Shared billing', 'A dedicated contact'] },
]

export function Pricing({ spec, props }: BlockProps) {
  const tiers = props.tiers === 'two' ? TIERS.slice(0, 2) : TIERS
  return (
    <section className="section px-6">
      <SectionHead title="Simple pricing" sub="No hidden fees. Change or cancel whenever you like." />
      {props.yearly ? (
        <Tabs defaultValue="monthly" className="mb-8 items-center">
          <TabsList><TabsTrigger value="monthly">Monthly</TabsTrigger><TabsTrigger value="yearly">Yearly · save 20%</TabsTrigger></TabsList>
        </Tabs>
      ) : null}
      <div className={`mx-auto grid gap-4 ${tiers.length === 2 ? 'max-w-3xl @2xl:grid-cols-2' : '@3xl:grid-cols-3'}`}>
        {tiers.map(t => (
          <Card key={t.name} className={t.popular ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">{t.name}{t.popular ? <Badge>Popular</Badge> : null}</CardTitle>
              <CardDescription>{t.note}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><span className="forma-heading text-4xl font-semibold">{t.price}</span>{props.yearly ? <span className="text-muted-foreground"> / month</span> : null}</p>
              <ul className="space-y-2 text-sm">
                {t.lines.map(l => <li key={l} className="flex gap-2"><Icon name="check" className="mt-0.5 size-4 text-primary" />{l}</li>)}
              </ul>
            </CardContent>
            <CardFooter><Button className="w-full" variant={t.popular ? 'default' : 'outline'}>{spec.copy.cta}</Button></CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

export function Faq({ props }: BlockProps) {
  const items = list(props.items).map(k => ({ k, ...FAQS[k] })).filter(f => f.q)
  return (
    <section className="section mx-auto max-w-2xl px-6">
      <SectionHead title="Questions, answered" />
      <Accordion defaultValue={[items[0]?.k]}>
        {items.map(f => (
          <AccordionItem key={f.k} value={f.k}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent><p className="text-muted-foreground">{f.a}</p></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export function Cta({ spec }: BlockProps) {
  return (
    <section className="px-6 py-10">
      <div className="rounded-2xl bg-primary px-8 py-14 text-center text-primary-foreground">
        <h2 className="forma-heading text-3xl font-semibold tracking-tight text-balance">Ready when you are</h2>
        <p className="mx-auto mt-3 max-w-md opacity-80">{spec.copy.sub}</p>
        <Button size="lg" variant="secondary" className="mt-7">{spec.copy.cta}</Button>
      </div>
    </section>
  )
}

export function Newsletter({ spec }: BlockProps) {
  return (
    <section className="section px-6">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="forma-heading text-xl">Stay in the loop</CardTitle>
          <CardDescription>Occasional updates from {spec.copy.name}. No spam, unsubscribe any time.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2"><Input type="email" placeholder="you@example.com" /><Button>Subscribe</Button></CardContent>
      </Card>
    </section>
  )
}

export function Footer({ spec, props }: BlockProps) {
  const year = '2026'
  if (props.variant === 'columns') {
    const cols = { Product: ['Overview', 'Pricing', 'What’s new'], Company: ['About', 'Careers', 'Contact'], Help: ['Support', 'Privacy', 'Terms'] }
    return (
      <footer className="border-t px-6 py-10">
        <div className="grid gap-8 @2xl:grid-cols-4">
          <div><Logo name={spec.copy.name} /><p className="mt-3 text-sm text-muted-foreground">{spec.copy.headline}.</p></div>
          {Object.entries(cols).map(([h, links]) => (
            <div key={h} className="text-sm"><p className="font-medium">{h}</p><ul className="mt-3 space-y-2 text-muted-foreground">{links.map(l => <li key={l}>{l}</li>)}</ul></div>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">© {year} {spec.copy.name}. All rights reserved.</p>
      </footer>
    )
  }
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-6 text-sm text-muted-foreground">
      <Logo name={spec.copy.name} />
      <p>© {year} {spec.copy.name}</p>
    </footer>
  )
}
