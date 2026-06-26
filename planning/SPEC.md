# EFK Learning Tool v2 — Build Spec

A client-side, bilingual (DE/EN) study tool for the IHK *Elektrofachkraft für
Industrie*. The new project is the existing app plus two new tools. This spec is
the portable handoff: read it with [CONTEXT.md](./CONTEXT.md) (glossary) and the
[ADRs](./adr/).

## Hard constraints

- **Runs on GitHub Pages** — pure static files, no backend, no build step. This is
  the only non-negotiable.
- Bilingual DE/EN throughout (see existing `I18N` pattern).
- Loaded over HTTP(S) (uses `fetch()` and ES modules; `file://` unsupported).

See **ADR-0001** (static + vendored libs + native ES modules).

## The four tools

The Home screen offers four Tools. **Learn** and **Exam** are carried over from
the current app **unchanged** — same behaviour, same Chapter JSON format, same
exam logic (20 questions, fixed distribution, 50% pass, 60 min). They are not in
scope for changes. The two new tools below are the work.

### Tool 3 — Equation

Solve a physically-correct Formula for a Target Variable by rearranging it with
Operation Tokens. See **ADR-0002**.

- **Exercise** = one catalog entry: a fixed `(expr, solveFor, difficulty)` triple.
  Source: `formulas.json` (delivered here; see `deliverables/`). Difficulty tiers
  `leicht / mittel / schwer` by formula complexity for the chosen target.
- **Interaction**: the student types an Operation Token; the tool applies it to
  **both sides**, simplifies (via nerdamer), and renders the new — always valid —
  equation. Iterate, then submit.
- **Operation Token grammar**:
  - Binary `* / + -` followed by a variable in the current formula or an integer.
  - `^n` (integer power), `sqrt`, `swap` (exchange sides).
  - Malformed/illegal-operand tokens are rejected with a hint; the equation is
    unchanged.
- **Purely symbolic** — no numeric values, no final number to compute.
- **Correct at submit** = Target Variable alone on one side AND the equation is
  algebraically equivalent to the original Formula. Any valid path passes. The
  **Ideal Solution** (derived at runtime via `solveFor`) is then shown for
  comparison (e.g. "ideal: 2 steps").
- **Engine**: vendored **nerdamer** (**ADR-0004**), used only by this tool.
- **No persistence** (stateless practice).

### Tool 4 — Fractions

Practise fraction arithmetic with a focus on the lowest common denominator (LCD),
using randomly generated, mathematically-correct problems. See **ADR-0003**.

- **Problem**: random `a/b OP c/d` (schwer may have three fractions), `OP ∈ {+ − × ÷}`.
- **Generation** (three tiers):
  - leicht: small denominators sharing a factor or where one divides the other.
  - mittel: denominators up to ~12, including coprime (LCD = product).
  - schwer: denominators up to ~20 and/or three-fraction mixed-operator problems.
- **Interaction** (mirrors the Equation tool): the student applies operations and
  the tool performs each, showing the new correct state:
  - `expand <pos> n` — ×n numerator & denominator of fraction at position `pos`.
  - `reduce <pos> n` — ÷n numerator & denominator (rejected if n doesn't divide both).
  - `combine` — apply the problem's operator into a single fraction.
  - `simplify` — reduce the single fraction to lowest terms.
- **Correct at submit** = a single fraction, in lowest terms, equal in value to
  the original problem.
- **LCD guide**: a short in-tool explainer on finding the LCD (kgV).
- **No CAS** — hand-rolled integer arithmetic (gcd/lcm) only.
- **No persistence** (stateless practice).

## Localization

- Equation variable display names are bilingual in `formulas.json` (`name.de/en`).
- Fraction numbers are language-neutral; only UI labels, the LCD guide, and
  feedback strings need DE/EN entries in `I18N`.

## Suggested file layout (not a hard constraint)

Only "runs on GitHub Pages" is required; this layout realises ADR-0001 cleanly.

```
docs/                         GitHub Pages root
  index.html
  assets/
    main.js                   ES-module entry; registers tools with the router
    core/  store.js router.js i18n.js data.js dom.js
    tools/ learn.js exam.js equations.js fractions.js
    vendor/ nerdamer.js
    styles.css
  chapters/  index.json  de/*.json  en/*.json     (unchanged)
  equations/ formulas.json                          (new; from deliverables/)
```

`learn.js` / `exam.js` may start as the existing `app.js` logic lifted intact;
refactoring them further is optional and out of scope for behaviour.

## Out of scope

- Any change to Learn or Exam behaviour.
- Numeric evaluation in the Equation tool.
- Cross-session progress, accounts, or server state.
