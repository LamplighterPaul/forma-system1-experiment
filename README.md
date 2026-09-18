# Forma · System One experiment

**A design harness driven only by [Jev](https://typesafe.ai), a model that cannot write.**
Live at https://forma-experiment.zammitpaul.com

Describe a page, an app screen or a form and press Enter. A design appears in about a
second. Keep typing in the same design to iterate: "make it dark", "remove the FAQ",
"call it Roast Club", "try something else".

Jev is TypeSafe AI's "System One" model. It returns typed decisions with calibrated
probabilities and cannot generate text or code. So this is not a chat model writing HTML.
Forma does the work; Jev only picks.

By [Paul Zammit](https://zammitpaul.com/about). Not affiliated with TypeSafe AI.

## How it works

1. **The catalog** (`shared/catalog.ts`) is everything Jev may pick from: three layouts,
   22 prebuilt [shadcn/ui](https://ui.shadcn.com) blocks with typed parameters, theme
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

You need Node 24+ and a [TypeSafe API key](https://console.typesafe.ai).

```sh
npm ci
npm run build
TYPESAFE_API_KEY=... npm start        # http://localhost:8787
```

For development run `npm run dev` beside the server; Vite proxies `/api`.
Without `TYPESAFE_API_KEY` the server uses a clearly labelled keyword mock so the pipeline
can be worked on offline. Its decisions are meaningless.

The public endpoint is rate-limited per visitor and capped per day (`server/index.ts`).
To deploy with [Kamal](https://kamal-deploy.org), copy `config/deploy.example.yml` to
`config/deploy.yml`.

## Limits

- The ceiling is the catalog. Jev cannot invent a block, a layout or a sentence.
- Jev reads text only. It never sees the rendered pixels.
- Questions are answered in isolation. Coherence comes from shared state, sticky
  decisions and the review pass, not from the model reasoning across choices.

## Licence

MIT. The interface borrows its colours from the Sinclair ZX Spectrum (1982).
