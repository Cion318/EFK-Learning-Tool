# Planning package — EFK Learning Tool v2

Design output from a grilling session, ready to carry into the new project.

## Read in this order

1. **[SPEC.md](./SPEC.md)** — the build spec: hard constraints, the four tools,
   the two new tools in detail, file layout, scope.
2. **[CONTEXT.md](./CONTEXT.md)** — the domain glossary (canonical vocabulary for
   code, UI, and docs).
3. **[adr/](./adr/)** — the decisions and why they were made:
   - `0001` — static hosting, vendored libs, native ES modules.
   - `0002` — Equation tool: operation-token, both-sides, purely-symbolic algebra.
   - `0003` — Fractions tool: same operation-driven interaction; generation tiers.
   - `0004` — vendor nerdamer as the Equation engine.

## Deliverables

- **[deliverables/formulas.json](./deliverables/formulas.json)** — the Equation
  tool's formula catalog (14 physically-correct exercises across leicht/mittel/
  schwer). Intended runtime path: `docs/equations/formulas.json`.

## Summary of decisions

- Keep the zero-backend, no-build, GitHub-Pages model; evolve to native ES modules
  and allow vendored client-side libraries.
- **Learn** and **Exam** carry over **unchanged**.
- **Equation tool**: pick a `(formula, solve-for, difficulty)` exercise; rearrange
  by typing Operation Tokens (`*R`, `/I`, `+x`, `-y`, `^n`, `sqrt`, `swap`) that
  the tool applies to both sides and simplifies; purely symbolic; correct when the
  target is isolated and equivalent; nerdamer does the math; stateless.
- **Fractions tool**: randomly generated `+ − × ÷` problems in three tiers with an
  LCD focus; the student manipulates fractions (`expand`, `reduce`, `combine`,
  `simplify`) and the tool performs each; correct when a single lowest-terms
  fraction equal to the problem; hand-rolled gcd/lcm; LCD guide included; stateless.
