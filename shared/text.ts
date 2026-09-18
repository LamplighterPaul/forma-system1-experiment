// The text contract between the harness and the writer (Luna).
// Jev decides structure; the writer only fills these typed slots. It never produces markup,
// and it never produces URLs: links are extracted from what the person typed.

import type { Spec } from './harness.ts'

export interface TextItem { title: string; body: string; meta: string }
export interface BlockText { heading: string; sub: string; button: string; items: TextItem[] }
export interface DesignLink { label: string; url: string }
export interface DesignText {
  name: string
  headline: string
  sub: string
  cta: string
  blocks: Record<string, BlockText>
  links: DesignLink[]
}

/** What each block's slots mean, written for the writer. `items` is how many to write (a prop name means "one per selected entry"). */
export interface SlotGuide { about: string; heading?: string; sub?: string; button?: string; items?: { count: number | string; title: string; body?: string; meta?: string } }

export const SLOTS: Record<string, SlotGuide> = {
  banner: { about: 'A one-line announcement bar above the navigation', heading: 'The announcement, under 70 characters', button: 'Two or three words for its link' },
  hero: { about: 'The opening section', sub: 'An eyebrow label of at most four words shown above the headline, or empty', button: 'Secondary button label, two or three words' },
  about: { about: 'An introduction to the person or organisation', heading: 'Section heading', sub: 'Two to four warm, concrete sentences in the first person if this is a personal site',
    items: { count: 3, title: 'A short fact label such as Based in, Focus, Experience', body: 'The fact, a few words' } },
  links: { about: 'A list of link buttons', heading: 'Section heading, or empty', sub: 'One short line, or empty' },
  features: { about: 'Benefits of the product or service', heading: 'Section heading', sub: 'One supporting sentence',
    items: { count: 'items', title: 'Feature name, two to four words', body: 'One sentence benefit, under 110 characters' } },
  steps: { about: 'How it works, in order', heading: 'Section heading', sub: 'One supporting sentence',
    items: { count: 3, title: 'Step name, two to four words', body: 'One sentence' } },
  timeline: { about: 'A chronological list: experience, history or schedule', heading: 'Section heading',
    items: { count: 4, title: 'Role, milestone or session', body: 'One sentence', meta: 'Year, period or time' } },
  showcase: { about: 'A grid of items to browse', heading: 'Section heading',
    items: { count: 6, title: 'Item name', body: 'Short descriptor, under 50 characters', meta: 'Price such as $18, or empty when items are not for sale' } },
  gallery: { about: 'An image gallery with captions', heading: 'Section heading', items: { count: 6, title: 'Caption, two to four words' } },
  stats: { about: 'A band of headline numbers', items: { count: 'items', title: 'The figure, such as 12k+ or 4.9/5. Use figures from the brief when it gives them; otherwise round, modest placeholders', body: 'What it measures, two to four words' } },
  testimonials: { about: 'Customer quotes. These are sample quotes for a design mock-up', heading: 'Section heading',
    items: { count: 3, title: 'The quote, one or two sentences, without quotation marks', body: 'A generic attribution such as Subscriber since 2024; never a real person' } },
  pricing: { about: 'Pricing plans', heading: 'Section heading', sub: 'One reassuring sentence',
    items: { count: 'tiers', title: 'Plan name', body: 'Three or four included things, separated by semicolons', meta: 'Price such as $19' } },
  faq: { about: 'Frequently asked questions', heading: 'Section heading', items: { count: 'items', title: 'The question', body: 'A direct answer in one or two sentences' } },
  flow: { about: 'A left-to-right diagram of a process, pipeline or journey', heading: 'Section heading', sub: 'One supporting sentence',
    items: { count: 5, title: 'Node label, one to three words', body: 'A few words of detail' } },
  form: { about: 'A form visitors fill in', heading: 'Form title', sub: 'One sentence on what happens next', button: 'Submit button label' },
  contact: { about: 'Contact details', heading: 'Section heading', sub: 'One friendly sentence',
    items: { count: 3, title: 'Label such as Email, Studio, Hours', body: 'The detail. Use details from the brief; otherwise a clearly fictional placeholder' } },
  auth: { about: 'A sign-in or sign-up card', heading: 'Card title', sub: 'One short line' },
  cta: { about: 'The closing call to action', heading: 'A short rallying line', sub: 'One sentence' },
  newsletter: { about: 'An email signup', heading: 'Title', sub: 'One sentence on what subscribers get', button: 'Button label' },
  footer: { about: 'The footer', sub: 'A one-line description of the organisation' },
  stat_cards: { about: 'KPI cards in an application', items: { count: 'items', title: 'A realistic sample value', body: 'The metric name', meta: 'Change such as +12%' } },
  chart: { about: 'A trend chart', heading: 'Chart title', sub: 'The period, such as Last 12 weeks' },
  table: { about: 'A table of records with four columns', heading: 'Table title', sub: 'The four column names separated by semicolons',
    items: { count: 5, title: 'First column value', body: 'Second and third column values separated by a semicolon', meta: 'Fourth column value' } },
  activity: { about: 'A feed of recent events in the application', heading: 'Title', items: { count: 5, title: 'A sample first name and surname', body: 'What they did, a few words', meta: 'When, such as 2 min ago' } },
  checklist: { about: 'A checklist of tasks', heading: 'Title', items: { count: 5, title: 'The task' } },
  kanban: { about: 'A board with three columns of cards', heading: 'Board title', sub: 'The three column names separated by semicolons',
    items: { count: 6, title: 'Card title', body: 'A tag, one word', meta: 'Column number 1, 2 or 3' } },
  meters: { about: 'Progress or usage meters', heading: 'Title', items: { count: 4, title: 'What is measured', body: 'A caption such as 7.2 of 10 GB', meta: 'Percent filled, a whole number from 0 to 100' } },
  chat: { about: 'A sample conversation', heading: 'Title', items: { count: 4, title: 'Who speaks: them or me', body: 'The message' } },
  settings: { about: 'A settings panel', heading: 'Title', sub: 'One short line' },
}

/** How many items the writer should produce for a block in this spec. */
export function itemCount(spec: Spec, blockId: string): number {
  const guide = SLOTS[blockId]?.items
  if (!guide) return 0
  if (typeof guide.count === 'number') return guide.count
  const prop = spec.blocks.find(b => b.id === blockId)?.props[guide.count]
  if (Array.isArray(prop)) return prop.length
  if (prop === 'two') return 2
  if (prop === 'three') return 3
  return 3
}

const URL_RE = /\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s,;)"']*)?)/gi
const EMAIL_RE = /\b[\w.+-]+@(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi

/** Every URL and email address the person typed. The writer may label these; it cannot add to them. */
export function extractLinks(thread: string): string[] {
  const emails = thread.match(EMAIL_RE) ?? []
  const withoutEmails = emails.reduce((t, e) => t.replace(e, ' '), thread)
  const urls = (withoutEmails.match(URL_RE) ?? []).map(u => u.replace(/[.]+$/, '')).filter(u => !/^\d+(\.\d+)+$/.test(u))
  const all = [...urls.map(u => (/^https?:\/\//i.test(u) ? u : `https://${u}`)), ...emails.map(e => `mailto:${e}`)]
  return [...new Set(all)].slice(0, 12)
}
