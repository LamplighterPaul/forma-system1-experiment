// A live feed for the operator: who is using the experiment, what they asked for, what it cost.
// Anonymous by construction: a visitor is a daily-rotating hash, never an IP address. The feed is
// private (same bearer token as /api/stats) and the site tells visitors that briefs are logged.
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, statSync } from 'node:fs'
import { dirname } from 'node:path'

export interface FeedEvent {
  id: number
  t: string                 // ISO time
  who: string               // daily-rotating visitor hash, first 6 characters
  tab: string               // browser-tab session id, first 4 characters
  country: string           // from Cloudflare, e.g. MT; empty when unknown
  kind: 'visit' | 'design' | 'write' | 'review' | 'refused' | 'error'
  text?: string             // the latest message of the thread (design and refused only)
  turn?: number             // 1 = a new brief, 2+ = a revision
  note?: string             // layout and blocks, refusal reason, fit score, error message
  ms: number
  usd: number
  cached?: boolean
}

const FILE = process.env.EVENTS_FILE ?? (process.env.USAGE_FILE ? `${dirname(process.env.USAGE_FILE)}/events.jsonl` : './data/events.jsonl')
const KEEP = 400, ROTATE_BYTES = 8_000_000
const enabled = process.env.EVENT_LOG !== 'off'

let recent: FeedEvent[] = []
try { recent = readFileSync(FILE, 'utf8').trim().split('\n').slice(-KEEP).map(l => JSON.parse(l) as FeedEvent) } catch { /* first run */ }
let nextId = (recent.at(-1)?.id ?? 0) + 1

export function record(e: Omit<FeedEvent, 'id' | 't'>) {
  if (!enabled) return
  const event: FeedEvent = { id: nextId++, t: new Date().toISOString(), ...e, text: e.text?.replace(/\s+/g, ' ').slice(0, 220) }
  recent.push(event)
  if (recent.length > KEEP) recent = recent.slice(-KEEP)
  try {
    mkdirSync(dirname(FILE), { recursive: true })
    if (existsSync(FILE) && statSync(FILE).size > ROTATE_BYTES) renameSync(FILE, `${FILE}.1`)
    appendFileSync(FILE, `${JSON.stringify(event)}\n`)
  } catch (err) { console.error('events: could not persist', err) }
}

/** Events after `since` (an id). Without `since`, the most recent `limit`. */
export const feed = (since?: number, limit = 60) => (since ? recent.filter(e => e.id > since) : recent.slice(-limit))
