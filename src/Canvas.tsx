import type { CSSProperties, ComponentType } from 'react'
import { ACCENTS, BASES } from '@shared/catalog'
import type { Spec } from '@shared/harness'
import { SLOTS, extractLinks, type DesignText } from '@shared/text'
import { ActivityFeed, AuthCard, Chart, Chat, Checklist, DataTable, FormCard, Kanban, Meters, SettingsPanel, Sidebar, StatCards, Topbar } from './blocks/app'
import { Flow } from './blocks/flow'
import { Composer, Feed, MediaList, MediaPlayer, Profile, Stories, TabBar } from './blocks/social'
import { About, Banner, Contact, Locations, Cta, Faq, Features, Footer, Gallery, Hero, Links, Logo, Logos, Navbar, Newsletter, Pricing, Showcase, Stats, Steps, Testimonials, Timeline } from './blocks/marketing'
import type { BlockProps } from './blocks/types'

// Catalog block id -> the prebuilt component. Jev picks ids; it never sees this file.
const BLOCKS: Record<string, ComponentType<BlockProps>> = {
  navbar: Navbar, hero: Hero, logos: Logos, features: Features, showcase: Showcase, stats: Stats, testimonials: Testimonials,
  pricing: Pricing, faq: Faq, form: FormCard, auth: AuthCard, cta: Cta, newsletter: Newsletter, footer: Footer,
  sidebar: Sidebar, stat_cards: StatCards, chart: Chart, table: DataTable, activity: ActivityFeed, checklist: Checklist,
  chat: Chat, settings: SettingsPanel, banner: Banner, about: About, links: Links, steps: Steps, timeline: Timeline, gallery: Gallery,
  contact: Contact, flow: Flow, kanban: Kanban, meters: Meters, locations: Locations,
  stories: Stories, composer: Composer, feed: Feed, profile: Profile, media_player: MediaPlayer, media_list: MediaList, tabbar: TabBar,
}

// Width of each app-screen block on the three-column dashboard grid.
const SPAN: Record<string, string> = { stat_cards: '@4xl:col-span-3', chart: '@4xl:col-span-2', table: '@4xl:col-span-2', showcase: '@4xl:col-span-3', chat: '@4xl:col-span-2', settings: '@4xl:col-span-2', flow: '@4xl:col-span-3', kanban: '@4xl:col-span-3', meters: '@4xl:col-span-1', feed: '@4xl:col-span-2', composer: '@4xl:col-span-2', stories: '@4xl:col-span-3', media_list: '@4xl:col-span-2' }

const RADII = ['0rem', '0.625rem', '1.1rem']
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif"
const MONO = "'JetBrains Mono Variable', ui-monospace, 'SF Mono', Menlo, monospace"

function themeStyle({ theme }: Spec): CSSProperties {
  const vars: Record<string, string> = { '--radius': RADII[theme.radius] ?? RADII[1] }
  const accent = ACCENTS[theme.accent]
  if (accent && theme.accent !== 'neutral') {
    const primary = theme.dark ? accent.dark : accent.light
    const lightness = Number(primary.match(/oklch\(([\d.]+)/)?.[1] ?? 0.5)
    vars['--primary'] = primary
    vars['--ring'] = primary
    vars['--primary-foreground'] = lightness > 0.72 ? 'oklch(0.2 0 0)' : 'oklch(0.985 0 0)'
  }
  // A background tone is a slight tint of the paper and its greys; the accent still carries the brand.
  const base = BASES[theme.base]
  if (base && base.chroma > 0) {
    const hue = base.hue >= 0 ? base.hue : Number((accent ?? ACCENTS.blue).light.match(/([\d.]+)\)$/)?.[1] ?? 250)
    const c = base.chroma
    const set = theme.dark
      ? { '--background': `oklch(0.16 ${c} ${hue})`, '--card': `oklch(0.21 ${c} ${hue})`, '--popover': `oklch(0.21 ${c} ${hue})`, '--muted': `oklch(0.27 ${c} ${hue})`, '--secondary': `oklch(0.27 ${c} ${hue})`, '--accent': `oklch(0.27 ${c} ${hue})` }
      : { '--background': `oklch(0.985 ${c} ${hue})`, '--card': `oklch(0.995 ${c * 0.5} ${hue})`, '--popover': `oklch(0.995 ${c * 0.5} ${hue})`, '--muted': `oklch(0.955 ${c * 1.4} ${hue})`, '--secondary': `oklch(0.955 ${c * 1.4} ${hue})`, '--accent': `oklch(0.955 ${c * 1.4} ${hue})`, '--border': `oklch(0.9 ${c * 1.6} ${hue})` }
    Object.assign(vars, set)
  }
  if (theme.font === 'serif') vars['--forma-heading'] = SERIF
  if (theme.font === 'mono') { vars['--forma-heading'] = MONO; vars.fontFamily = MONO }
  return vars as CSSProperties
}

export function Canvas({ spec: decided, text, writing = false }: { spec: Spec; text?: DesignText | null; writing?: boolean }) {
  // The writer's words replace the pre-written copy; everything structural stays Jev's.
  const spec: Spec = text ? { ...decided, copy: { name: text.name, headline: text.headline, sub: text.sub, cta: text.cta } } : decided
  const links = text?.links.length ? text.links : extractLinks(decided.brief).map(url => ({ url, label: url.startsWith('mailto:') ? 'Email' : new URL(url).hostname.replace(/^www\./, '') }))
  const render = (id: string) => {
    const block = spec.blocks.find(b => b.id === id)
    const Cmp = BLOCKS[id]
    if (!block || !Cmp) return null
    // While Luna is still writing a section, its placeholder copy is dimmed so the swap reads as "filling in", not as a glitch.
    const pending = writing && id in SLOTS && !text?.blocks[id]
    return <div key={id} className={`transition-opacity duration-300 ${pending ? 'animate-pulse opacity-40' : ''}`}><Cmp spec={spec} props={block.props} text={text?.blocks[id]} links={links} /></div>
  }
  const body = spec.blocks.filter(b => b.id !== 'sidebar')
  // Wide blocks only share a row when a narrow one (activity, checklist) exists to sit beside them.
  const hasNarrow = body.some(b => !SPAN[b.id])
  const span = (id: string) => (hasNarrow ? SPAN[id] ?? '' : '@4xl:col-span-3')

  return (
    <div className={`forma-canvas @container min-h-full bg-background text-foreground ${spec.theme.dark ? 'dark' : 'light'}`} data-density={spec.theme.density} style={themeStyle(spec)}>
      {spec.layout === 'marketing_page' ? spec.blocks.map(b => render(b.id)) : null}

      {spec.layout === 'app_screen' ? (
        <div className="flex min-h-[640px]">
          {render('sidebar')}
          <div className="min-w-0 flex-1">
            <Topbar title={String((spec.blocks.find(b => b.id === 'sidebar')?.props.items as string[] | undefined)?.[0] ?? 'Dashboard')} />
            <div className="forma-grid grid p-5 @4xl:grid-cols-3">
              {body.map(b => <div key={b.id} className={`min-w-0 ${span(b.id)}`}>{render(b.id)}</div>)}
            </div>
          </div>
        </div>
      ) : null}

      {spec.layout === 'diagram' ? render('flow') : null}

      {spec.layout === 'mobile_app' ? (
        <div className="flex justify-center bg-muted/50 px-4 py-8">
          {/* A phone frame. Its own @container makes every block inside lay out for a narrow screen. */}
          <div className="@container flex h-[760px] w-[372px] max-w-full flex-col overflow-hidden rounded-[2.4rem] border-[7px] border-foreground/85 bg-background shadow-xl">
            <div className="flex items-center justify-between px-6 pt-2.5 text-[11px] font-medium"><span>9:41</span><span className="h-4 w-16 rounded-full bg-foreground/85" /><span>5G ▮</span></div>
            <div className="flex items-center justify-between px-4 pt-3 pb-2"><h1 className="forma-heading text-xl font-semibold">{text?.blocks.tabbar?.heading || spec.copy.name}</h1><Logo name={spec.copy.name} /></div>
            <div className="forma-grid grid min-h-0 flex-1 grid-cols-1 content-start overflow-x-hidden overflow-y-auto px-4 pb-4 [&>*]:min-w-0">{body.filter(b => b.id !== 'tabbar').map(b => render(b.id))}</div>
            {render('tabbar')}
          </div>
        </div>
      ) : null}

      {spec.layout === 'centered_card' ? (
        <div className="flex min-h-[640px] flex-col items-center justify-center gap-6 bg-muted/40 p-6">
          <Logo name={spec.copy.name} />
          {body.map(b => render(b.id))}
        </div>
      ) : null}
    </div>
  )
}
