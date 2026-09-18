import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@/lib/icons'
import { FORM_FIELDS, METRICS, SETTINGS, SIDEBAR_ITEMS, TABLES } from '@shared/catalog'
import { Logo } from './marketing'
import type { BlockProps } from './types'

const list = (v: unknown) => (Array.isArray(v) ? (v as string[]) : [])

export function Sidebar({ spec, props }: BlockProps) {
  return (
    <aside className="hidden w-52 shrink-0 flex-col gap-1 border-r bg-muted/40 p-3 @3xl:flex">
      <div className="px-2 py-3"><Logo name={spec.copy.name} /></div>
      {list(props.items).map((item, i) => (
        <div key={item} className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm ${i === 0 ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground'}`}>
          <Icon name={SIDEBAR_ITEMS[item]?.icon ?? 'layout'} className="size-4" />{item}
        </div>
      ))}
    </aside>
  )
}

export function Topbar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b px-5 py-3">
      <h1 className="forma-heading text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <Input placeholder="Search…" className="hidden h-8 w-48 @xl:block" />
        <Button variant="ghost" size="icon-sm"><Icon name="bell" className="size-4" /></Button>
        <Avatar className="size-7"><AvatarFallback className="text-xs">MB</AvatarFallback></Avatar>
      </div>
    </div>
  )
}

export function StatCards({ props }: BlockProps) {
  const items = list(props.items).map(k => METRICS[k]).filter(Boolean)
  return (
    <div className="grid gap-4 @lg:grid-cols-2 @4xl:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]" style={{ '--n': items.length } as React.CSSProperties}>
      {items.map(m => (
        <Card key={m.label} size="sm">
          <CardHeader>
            <CardDescription>{m.label}</CardDescription>
            <CardTitle className="forma-heading text-2xl">{m.value}</CardTitle>
            <CardAction><Badge variant="secondary">{m.delta}</Badge></CardAction>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

const SERIES = [22, 30, 26, 38, 35, 48, 44, 58, 52, 66, 61, 78]

export function Chart({ spec, props }: BlockProps) {
  const first = spec.blocks.find(b => b.id === 'stat_cards')?.props.items
  const metric = METRICS[list(first)[0]]
  const w = 600, h = 200, step = w / (SERIES.length - 1)
  const pts = SERIES.map((v, i) => [i * step, h - (v / 85) * h] as const)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{metric?.label ?? 'Overview'}</CardTitle>
        <CardDescription>Last 12 weeks</CardDescription>
        <CardAction><Badge variant="secondary">{metric?.delta ?? '+12%'}</Badge></CardAction>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full text-primary" preserveAspectRatio="none" role="img" aria-label="Trend chart">
          {props.variant === 'bars'
            ? SERIES.map((v, i) => <rect key={i} x={i * (w / SERIES.length) + 8} y={h - (v / 85) * h} width={w / SERIES.length - 16} height={(v / 85) * h} rx="4" fill="currentColor" opacity={0.35 + (i / SERIES.length) * 0.65} />)
            : <><path d={`${line} L${w},${h} L0,${h} Z`} fill="currentColor" opacity="0.12" /><path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></>}
        </svg>
      </CardContent>
    </Card>
  )
}

const TONE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Paid: 'default', Live: 'default', Confirmed: 'default', Done: 'default', Solved: 'default',
  Overdue: 'destructive', Failed: 'destructive', Refunded: 'destructive', Cancelled: 'destructive', Urgent: 'destructive',
  Draft: 'outline', 'To do': 'outline', Low: 'outline', Free: 'outline',
}
const STATUS_COLS = new Set(['Status', 'Priority', 'Plan'])

export function DataTable({ props }: BlockProps) {
  const entity = String(props.entity ?? 'customers')
  const def = TABLES[entity] ?? TABLES.customers
  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{entity}</CardTitle>
        <CardDescription>Most recent first</CardDescription>
        <CardAction><Button size="sm" variant="outline">Export</Button></CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>{def.columns.map(c => <TableHead key={c}>{c}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {def.rows.map(row => (
              <TableRow key={row[0]}>
                {row.map((cell, i) => (
                  <TableCell key={i} className={i === 0 ? 'font-medium' : ''}>
                    {STATUS_COLS.has(def.columns[i]) ? <Badge variant={TONE[cell] ?? 'secondary'}>{cell}</Badge> : cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

const EVENTS = [
  ['Maria Borg', 'completed a new order', '2 min ago'], ['Daniel Okafor', 'left a comment', '18 min ago'],
  ['Yuki Tanaka', 'updated their details', '1 h ago'], ['Elena Rossi', 'joined', '3 h ago'], ['Sam Carter', 'sent a message', 'Yesterday'],
]

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {EVENTS.map(([who, what, when]) => (
          <div key={who} className="flex items-center gap-3 text-sm">
            <Avatar className="size-7"><AvatarFallback className="text-xs">{who.split(' ').map(w => w[0]).join('')}</AvatarFallback></Avatar>
            <p className="flex-1"><span className="font-medium">{who}</span> <span className="text-muted-foreground">{what}</span></p>
            <span className="text-xs text-muted-foreground">{when}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const TODOS = [['Review this week’s plan', true], ['Reply to open messages', true], ['Prepare Friday’s summary', false], ['Follow up with Daniel', false], ['Tidy the backlog', false]] as const

export function Checklist() {
  return (
    <Card>
      <CardHeader><CardTitle>Today</CardTitle><CardDescription>2 of 5 done</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {TODOS.map(([text, done]) => (
          <Label key={text} className="flex items-center gap-3 font-normal"><Checkbox defaultChecked={done} /><span className={done ? 'text-muted-foreground line-through' : ''}>{text}</span></Label>
        ))}
      </CardContent>
    </Card>
  )
}

const MESSAGES = [['them', 'Hi! Is there anything I can help you with today?'], ['me', 'Yes, I would like to change my plan.'], ['them', 'Of course. I can do that for you now. Which plan would you like?']] as const

export function Chat() {
  return (
    <Card>
      <CardHeader><CardTitle>Conversation</CardTitle><CardDescription>Usually replies in a few minutes</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {MESSAGES.map(([from, text]) => (
          <div key={text} className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${from === 'me' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>{text}</div>
        ))}
      </CardContent>
      <CardFooter className="gap-2"><Input placeholder="Write a message…" /><Button size="icon"><Icon name="send" className="size-4" /></Button></CardFooter>
    </Card>
  )
}

export function SettingsPanel({ props }: BlockProps) {
  const items = list(props.items).map(k => SETTINGS[k]).filter(Boolean)
  return (
    <Card>
      <CardHeader><CardTitle>Preferences</CardTitle><CardDescription>Changes are saved automatically.</CardDescription></CardHeader>
      <CardContent>
        {items.map((s, i) => (
          <div key={s.label}>
            {i ? <Separator className="my-4" /> : null}
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-sm font-medium">{s.label}</p><p className="text-sm text-muted-foreground">{s.desc}</p></div>
              <Switch defaultChecked={s.on} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// --- Cards used on the centered layout (and the form inside marketing pages) ---

function Field({ id }: { id: string }) {
  const f = FORM_FIELDS[id]
  if (!f) return null
  if (f.type === 'checkbox') return <Label className="flex items-center gap-2.5 font-normal"><Checkbox />{f.label}</Label>
  return (
    <div className="grid gap-1.5">
      <Label>{f.label}</Label>
      {f.type === 'textarea' ? <Textarea placeholder={f.placeholder} rows={3} />
        : f.type === 'select' ? <div className="flex h-8 items-center justify-between rounded-lg border border-input px-2.5 text-sm text-muted-foreground">{f.placeholder}<span aria-hidden>▾</span></div>
        : <Input type={f.type} placeholder={f.placeholder} />}
    </div>
  )
}

export function FormCard({ spec, props }: BlockProps) {
  const title = String(props.title ?? 'Contact us')
  return (
    <section className={spec.layout === 'marketing_page' ? 'section px-6' : ''}>
      <Card className="mx-auto w-full max-w-md">
        <CardHeader><CardTitle className="forma-heading text-xl">{title}</CardTitle><CardDescription>{spec.copy.name} will get back to you shortly.</CardDescription></CardHeader>
        <CardContent className="grid gap-4">{list(props.fields).map(id => <Field key={id} id={id} />)}</CardContent>
        <CardFooter><Button className="w-full">{title === 'Contact us' || title === 'Get in touch' ? 'Send message' : title}</Button></CardFooter>
      </Card>
    </section>
  )
}

export function AuthCard({ spec, props }: BlockProps) {
  const signUp = props.mode === 'sign_up'
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="forma-heading text-xl">{signUp ? `Create your ${spec.copy.name} account` : `Welcome back to ${spec.copy.name}`}</CardTitle>
        <CardDescription>{signUp ? 'It takes less than a minute.' : 'Sign in to continue.'}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {props.social ? (
          <>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(2, list(props.providers).length) || 1}, minmax(0, 1fr))` }}>
              {list(props.providers).map(p => <Button key={p} variant="outline" className="last:odd:col-span-full">{p}</Button>)}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground"><Separator className="flex-1" />or<Separator className="flex-1" /></div>
          </>
        ) : null}
        {signUp ? <Field id="name" /> : null}
        <Field id="email" />
        <div className="grid gap-1.5"><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
        {signUp ? <Field id="terms" /> : null}
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button className="w-full">{signUp ? 'Create account' : 'Sign in'}</Button>
        <p className="text-sm text-muted-foreground">{signUp ? 'Already have an account? Sign in' : 'New here? Create an account'}</p>
      </CardFooter>
    </Card>
  )
}
