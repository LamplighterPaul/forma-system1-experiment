# Forma · experimental design harness

**Experimental.** How fast and cheap can design get if a small, fast model makes the decisions and a
traditional LLM is only allowed to write the words?

Live at https://forma-experiment.zammitpaul.com · by [Paul Zammit](https://zammitpaul.com/about)

Describe a page, a screen, a form or a diagram and press Enter. A design appears in about a second and the
words fill in a moment later. Keep typing to iterate: "make it dark", "remove the FAQ", "try something else".
Switch Luna off to see what the decision model does alone.

- **[Jev](https://typesafe.ai)** is TypeSafe AI's "System One" model. It returns typed decisions with
  probabilities and cannot generate text or code. It picks the whole design, reviews the result and acts as
  the guardrail. About a second and $0.0005 per design.
- **Luna** is OpenAI's `gpt-5.6-luna`, a small traditional LLM. It fills typed text slots and nothing else.
  About three seconds and $0.0015 per design. Optional.
- **Code** owns everything else: the catalog of prebuilt blocks, layout rules, limits, links and sanitising.

This is an experiment, not a product. Not affiliated with TypeSafe AI or OpenAI.

## Two models, two jobs

- **Jev decides. Always on.** Layout, blocks, variants, colours, typeface: every structural decision is a
  typed answer with a probability.
- **Luna writes. Optional.** OpenAI's `gpt-5.6-luna` fills typed text slots (`shared/text.ts`) against a
  strict JSON schema built from the design Jev decided. It produces no markup and no addresses: links
  are extracted by code from what the person typed, and Luna only labels them. Nothing is fetched from
  the web. Switch Luna off and the pre-written copy is used instead.
- **Code assembles.** Order, limits, fallbacks and sanitising live in code.

The performance panel shows each stage of a round (Jev decide, Luna write, Jev review) with time, tokens
and cost.

**Diagrams** are drawn with [React Flow](https://reactflow.dev). Jev decides that a brief needs one and which
shape it takes (pipeline, tree, hub or cycle). Luna names the boxes. For mind maps and trees **Jev then arranges
them**: one typed question per box ("which box is this a sub-topic of?"), answered in parallel in about 300 ms,
so "add a fuel tank to the fuel system" lands where it was asked. Code validates the graph and lays it out. A brief that is only a diagram ("a mind map of…", "org chart for…") gets a
full-canvas diagram layout.

**The catalog grows where real briefs hit it.** The first outside visitors asked for "an x feed" and "a podcast app
for mobile"; the catalog only had dashboards, and Jev's own review scored the results 0.8 out of 3. That became a
phone-app layout with a tab bar, and social and media blocks (feed, stories, composer, profile, player, episode
list). The same briefs now score 2.3 and 3.0. When a match is still weak, the thread says so.

**Jev routes the work.** The same call that designs the page also answers "does this turn need new words at
all?". "Make it dark" does not, so Luna is never called and the turn takes about a second. When a turn only
brings in a new section, Luna writes that section alone and the rest stays word for word. Code keeps the veto:
any section without text means the writer runs, whatever Jev thinks.

**Guardrails are System One questions too.** Every call asks Jev whether the brief is a design request at all
and whether it is something that should not be built (abuse, defamation, instruction override). Code holds the
thresholds and the refusal wording; Luna is never called for a refused brief.

## How it works

1. **The catalog** (`shared/catalog.ts`) is everything Jev may pick from: five layouts,
   40 prebuilt [shadcn/ui](https://ui.shadcn.com) blocks with typed parameters, theme
   tokens named by meaning rather than hex, and banks of pre-written copy (headlines,
   features, metrics, form fields, FAQs). Every word on the canvas was written in advance.
2. **One fan-out call** (`shared/harness.ts`). The catalog becomes about 250 typed
   questions (Choice, Score, Noul) sent with the thread in a single request. Jev answers
   questions in parallel and in isolation, so asking about every block and parameter up
   front costs almost nothing; code ignores what it does not need.
3. **Code stays in control.** `assemble()` turns probabilities into a spec: minimums,
   maximums, ordering and fallbacks live in code, not in the model.
4. **Threads.** Jev has no memory, so each turn sends the whole thread (brief, then
   revisions) as state. Decisions are sticky between turns, so a revision only changes
   what it is about.
5. **Intent routing.** "Try something else" is not a change to the brief. Jev classifies
   it as a remix, and code moves decisions of taste (accent, typeface, headline, variants)
   to Jev's runner-up options. Decisions of fact (layout, which blocks) never remix.
6. **Review.** A second small call asks Jev to judge the assembled outline against the
   thread: a fit score, a "something is missing" probability and per-block doubts. A high
   "missing" value is a catalog gap, which is the signal for what to build next.

Any decision can be pinned by clicking its probability bar.

Measured in September 2026 from Malta: about 250 questions, 11k input tokens,
0.8 to 1.6 seconds and roughly $0.0005 per design.

## HTTP API

`POST /api/design` with `{"messages": ["brief", "revision", ...]}` returns the spec, every
decision with its probabilities, and the run statistics. `GET /api/catalog` lists what Jev
can choose from.

## Run it

You need Node 24+ and a [TypeSafe API key](https://console.typesafe.ai). An OpenAI key is optional and enables Luna.

```sh
npm ci
npm run build
TYPESAFE_API_KEY=... OPENAI_API_KEY=... npm start        # http://localhost:8787
```

For development run `npm run dev` beside the server; Vite proxies `/api`.
Without `TYPESAFE_API_KEY` the server uses a clearly labelled keyword mock so the pipeline
can be worked on offline. Its decisions are meaningless.

The public endpoint is rate-limited per visitor, and `DAILY_USD_CAP` (default 5) stops new Jev
calls for the day once that much has been spent.

Usage is counted per UTC day in `server/usage.ts`: people, sessions, Jev calls, tokens and cost.
No IP address is stored; visitors are counted by a salted hash that changes daily, and sessions
by a random id per browser tab. Set `STATS_TOKEN` (16+ characters) to enable the private report:

```sh
curl -H "Authorization: Bearer $STATS_TOKEN" https://your-host/api/stats
```

The same token opens `GET /api/events`, a live feed of requests for whoever runs the site: the latest message
of each thread, what was built and what it cost. Visitors are anonymous there too, and the page tells them
that briefs are logged. Set `EVENT_LOG=off` to disable it.

Mount a volume at `/data` to keep the counters and the feed across deploys.
To deploy with [Kamal](https://kamal-deploy.org), copy `config/deploy.example.yml` to
`config/deploy.yml`.

## Limits

- The ceiling is the catalog. Jev cannot invent a block, a layout or a sentence.
- Jev reads text only. It never sees the rendered pixels.
- Questions are answered in isolation. Coherence comes from shared state, sticky
  decisions and the review pass, not from the model reasoning across choices.

## Licence

MIT. The interface borrows its colours from the Sinclair ZX Spectrum (1982).
