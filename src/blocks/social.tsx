// Consumer app blocks: feeds, stories, profiles and media. Added because the first outside visitors asked for
// "an x feed" and "a podcast app for mobile" and the catalog only had dashboards to offer them.
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/lib/icons'
import { TAB_ITEMS } from '@shared/catalog'
import { Thumb } from './marketing'
import { items, list, type BlockProps } from './types'

const initials = (s: string) => s.replace(/@.*/, '').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()

export function Stories({ text }: BlockProps) {
  const people = items(text, ['maya', 'daniel', 'yuki', 'elena', 'sam', 'priya'].map(title => ({ title, body: '', meta: '' })))
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {people.map((p, i) => (
        <div key={p.title + i} className="flex w-14 shrink-0 flex-col items-center gap-1">
          <span className="rounded-full bg-linear-to-tr from-primary to-primary/40 p-0.5"><Avatar className="size-12 border-2 border-background"><AvatarFallback>{initials(p.title)}</AvatarFallback></Avatar></span>
          <span className="w-full truncate text-center text-[11px] text-muted-foreground">{p.title}</span>
        </div>
      ))}
    </div>
  )
}

export function Composer({ text }: BlockProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <Avatar className="size-9"><AvatarFallback>ME</AvatarFallback></Avatar>
        <p className="flex-1 text-muted-foreground">{text?.heading || 'What is happening?'}</p>
        <Icon name="image" className="size-4 text-muted-foreground" />
        <Button size="sm">{text?.button || 'Post'}</Button>
      </CardContent>
    </Card>
  )
}

const POSTS = [
  { title: 'Maya Borg @mayab', body: 'Shipped the thing we have been talking about for weeks. It is small, but it is real.', meta: '2h' },
  { title: 'Daniel Okafor @dokafor', body: 'Reminder that the best feature is the one you removed.', meta: '4h' },
  { title: 'Yuki Tanaka @yukit', body: 'Morning light on the harbour today. No filter needed.', meta: '6h' },
  { title: 'Elena Rossi @elenar', body: 'Anyone else reading three books at once and finishing none of them?', meta: '9h' },
]
const ACTIONS: [string, string][] = [['message', '12'], ['repeat', '4'], ['heart', '86'], ['bookmark', ''], ['share', '']]

export function Feed({ props, text }: BlockProps) {
  const posts = items(text, POSTS)
  const photo = props.variant === 'photo'
  return (
    <div className="grid gap-3">
      {posts.map((p, i) => {
        const [name, handle] = [p.title.replace(/\s*@\S+$/, ''), p.title.match(/@\S+$/)?.[0] ?? '']
        return (
          <Card key={p.title + i} size="sm" className={photo ? 'overflow-hidden' : ''}>
            <CardContent className="grid gap-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-9"><AvatarFallback>{initials(name)}</AvatarFallback></Avatar>
                <p className="min-w-0 flex-1 truncate text-sm"><span className="font-medium">{name}</span> <span className="text-muted-foreground">{handle} · {p.meta}</span></p>
              </div>
              {photo ? <Thumb icon="image" className="-mx-4 aspect-square" /> : null}
              <p className="text-sm leading-relaxed">{p.body}</p>
              <div className="flex justify-between text-muted-foreground">
                {ACTIONS.map(([icon, count]) => <span key={icon} className="flex items-center gap-1 text-xs"><Icon name={icon} className="size-4" />{count}</span>)}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function Profile({ text, links }: BlockProps) {
  const stats = items(text, [{ title: '128', body: 'Posts', meta: '' }, { title: '4,302', body: 'Followers', meta: '' }, { title: '311', body: 'Following', meta: '' }])
  const name = text?.heading || 'Maya Borg'
  return (
    <Card size="sm" className="overflow-hidden pt-0">
      <div className="h-20 bg-linear-to-r from-primary/40 to-primary/10" />
      <CardContent className="-mt-10 grid gap-3">
        <Avatar className="size-16 border-4 border-card"><AvatarFallback className="text-lg">{initials(name)}</AvatarFallback></Avatar>
        <div><p className="forma-heading text-lg font-semibold">{name}</p><p className="mt-1 text-sm text-muted-foreground">{text?.sub || 'Designer, walker, occasional baker. Writing about small things that work well.'}</p></div>
        <div className="flex gap-5 text-sm">{stats.map(s => <p key={s.body}><span className="font-semibold">{s.title}</span> <span className="text-muted-foreground">{s.body}</span></p>)}</div>
        {links.length ? <div className="flex flex-wrap gap-x-3 text-sm">{links.map(l => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">{l.label}</a>)}</div> : null}
        <div className="flex gap-2"><Button size="sm" className="flex-1">Follow</Button><Button size="sm" variant="outline" className="flex-1">Message</Button></div>
      </CardContent>
    </Card>
  )
}

export function MediaPlayer({ text }: BlockProps) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-3">
        <div className="flex items-center gap-3">
          <Thumb icon="headphones" className="size-16 shrink-0 rounded-lg" />
          <div className="min-w-0"><p className="truncate font-medium">{text?.heading || 'The long way round'}</p><p className="truncate text-sm text-muted-foreground">{text?.sub || 'Field Notes · Episode 42'}</p></div>
        </div>
        <div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-2/5 rounded-full bg-primary" /></div><p className="mt-1 flex justify-between text-[11px] text-muted-foreground"><span>16:48</span><span>-25:12</span></p></div>
        <div className="flex items-center justify-center gap-6"><Icon name="skip_back" className="size-5" /><span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"><Icon name="pause" className="size-5" /></span><Icon name="skip_forward" className="size-5" /></div>
      </CardContent>
    </Card>
  )
}

const EPISODES = [['The long way round', 'Field Notes', '42 min'], ['What we got wrong', 'Field Notes', '38 min'], ['A better morning', 'Slow Starts', '27 min'], ['Listener questions', 'Field Notes', '51 min'], ['The quiet hour', 'Slow Starts', '33 min']]

export function MediaList({ text }: BlockProps) {
  const rows = items(text, EPISODES.map(([title, body, meta]) => ({ title, body, meta })))
  return (
    <div>
      <p className="forma-heading mb-2 font-semibold">{text?.heading || 'New episodes'}</p>
      <div className="divide-y rounded-xl border bg-card">
        {rows.map((r, i) => (
          <div key={r.title + i} className="flex items-center gap-3 p-3">
            <Thumb icon="play" className="size-11 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{r.title}</p><p className="truncate text-xs text-muted-foreground">{r.body}</p></div>
            <span className="shrink-0 text-xs text-muted-foreground">{r.meta}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TabBar({ props }: BlockProps) {
  const tabs = list(props.items)
  return (
    <nav className="grid border-t bg-background/95 px-2 pt-2 pb-5" style={{ gridTemplateColumns: `repeat(${tabs.length || 1}, minmax(0, 1fr))` }}>
      {tabs.map((t, i) => (
        <span key={t} className={`flex flex-col items-center gap-1 text-[10px] ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}><Icon name={TAB_ITEMS[t]?.icon ?? 'home'} className="size-5" />{t}</span>
      ))}
    </nav>
  )
}
