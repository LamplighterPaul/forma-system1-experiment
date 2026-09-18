// Usage accounting: how many people and sessions reach the Jev key, and what it costs.
// Kept per UTC day in one small JSON file so it survives restarts and deploys.
// No IP address is stored: visitors are counted by a salted hash that changes every day.
import { createHash, randomBytes } from 'node:crypto'
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

interface Day {
  salt: string
  visitors: string[]       // salted hashes, only to count unique people across restarts
  sessions: string[]       // random ids made by the page, one per browser tab
  designs: number          // design requests answered (including cached ones)
  jevCalls: number         // requests that actually reached Jev
  cachedAnswers: number
  reviews: number
  tokens: number
  usd: number           // Jev spend
  writes: number        // calls that reached the writer (Luna)
  writeTokensIn: number
  writeTokensOut: number
  writeUsd: number
  limited: number          // requests refused by a rate limit or the budget
  errors: number
}

const FILE = process.env.USAGE_FILE ?? './data/usage.json'
const KEEP_DAYS = 60
const MAX_TRACKED = 20_000

/** Hard stop for the day, in dollars, across both models. The page keeps working from cache; new Jev calls are refused. */
export const DAILY_USD_CAP = Number(process.env.DAILY_USD_CAP ?? 5)

let days: Record<string, Day> = {}
try { days = JSON.parse(readFileSync(FILE, 'utf8')) } catch { /* first run, or no volume mounted */ }

const today = () => new Date().toISOString().slice(0, 10)
const blank = (): Day => ({ salt: randomBytes(16).toString('hex'), visitors: [], sessions: [], designs: 0, jevCalls: 0, cachedAnswers: 0, reviews: 0, tokens: 0, usd: 0, writes: 0, writeTokensIn: 0, writeTokensOut: 0, writeUsd: 0, limited: 0, errors: 0 })

// Records written by an older version lack newer counters; adding to a missing field would poison the sums with NaN.
function normalise(d: Day): Day {
  const zero = blank()
  for (const k of Object.keys(zero) as (keyof Day)[]) {
    const v = d[k]
    if (typeof zero[k] === 'number' && !(typeof v === 'number' && Number.isFinite(v))) (d as unknown as Record<string, unknown>)[k] = 0
  }
  return d
}

function day(): Day {
  const key = today()
  if (days[key]) normalise(days[key])
  if (!days[key]) {
    days[key] = blank()
    for (const old of Object.keys(days).sort().slice(0, -KEEP_DAYS)) delete days[old]
  }
  return days[key]
}

let dirty = false
function persist() {
  if (!dirty) return
  dirty = false
  try {
    mkdirSync(dirname(FILE), { recursive: true })
    writeFileSync(`${FILE}.tmp`, JSON.stringify(days))
    renameSync(`${FILE}.tmp`, FILE)
  } catch (e) { console.error('usage: could not persist', e) }
}
setInterval(persist, 10_000).unref()
for (const signal of ['SIGTERM', 'SIGINT'] as const) process.on(signal, () => { dirty = true; persist(); process.exit(0) })

export function seen(ip: string, session: string | undefined) {
  const d = day()
  const who = createHash('sha256').update(d.salt + ip).digest('hex').slice(0, 16)
  if (!d.visitors.includes(who) && d.visitors.length < MAX_TRACKED) d.visitors.push(who)
  const tab = session?.replace(/[^a-z0-9]/gi, '').slice(0, 24)
  if (tab && !d.sessions.includes(tab) && d.sessions.length < MAX_TRACKED) d.sessions.push(tab)
  dirty = true
}

export function spent(kind: 'design' | 'review', run: { cached: boolean; inputTokens: number; usd: number }) {
  const d = day()
  if (kind === 'design') d.designs++; else d.reviews++
  if (run.cached) d.cachedAnswers++
  else { d.jevCalls++; d.tokens += run.inputTokens; d.usd += run.usd }
  dirty = true
}

export function wrote(run: { inputTokens: number; outputTokens: number; usd: number }) {
  const d = day()
  d.writes++; d.writeTokensIn += run.inputTokens; d.writeTokensOut += run.outputTokens; d.writeUsd += run.usd
  dirty = true
}

const total = (d: Day) => d.usd + (d.writeUsd ?? 0)
export const refused = () => { day().limited++; dirty = true }
export const failed = () => { day().errors++; dirty = true }
export const overBudget = () => total(day()) >= DAILY_USD_CAP

export function report() {
  for (const d of Object.values(days)) normalise(d)
  const rows = Object.entries(days).sort(([a], [b]) => b.localeCompare(a)).map(([date, d]) => ({
    date, people: d.visitors.length, sessions: d.sessions.length, designs: d.designs, jevCalls: d.jevCalls,
    cachedAnswers: d.cachedAnswers, reviews: d.reviews, tokens: d.tokens, jevUsd: Number(d.usd.toFixed(4)),
    lunaCalls: d.writes ?? 0, lunaTokensIn: d.writeTokensIn ?? 0, lunaTokensOut: d.writeTokensOut ?? 0, lunaUsd: Number((d.writeUsd ?? 0).toFixed(4)),
    usd: Number(total(d).toFixed(4)), limited: d.limited, errors: d.errors,
  }))
  const sum = (k: 'designs' | 'jevCalls' | 'tokens' | 'usd' | 'jevUsd' | 'lunaCalls' | 'lunaUsd') => rows.reduce((n, r) => n + r[k], 0)
  return {
    today: rows.find(r => r.date === today()) ?? { date: today(), people: 0, sessions: 0, designs: 0, jevCalls: 0, cachedAnswers: 0, reviews: 0, tokens: 0, jevUsd: 0, lunaCalls: 0, lunaTokensIn: 0, lunaTokensOut: 0, lunaUsd: 0, usd: 0, limited: 0, errors: 0 },
    dailyUsdCap: DAILY_USD_CAP,
    allTime: { designs: sum('designs'), jevCalls: sum('jevCalls'), lunaCalls: sum('lunaCalls'), jevUsd: Number(sum('jevUsd').toFixed(4)), lunaUsd: Number(sum('lunaUsd').toFixed(4)), usd: Number(sum('usd').toFixed(4)) },
    days: rows,
  }
}
