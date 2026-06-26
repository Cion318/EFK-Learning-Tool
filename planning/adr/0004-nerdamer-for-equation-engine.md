# Vendor nerdamer as the Equation tool's symbolic engine

The Equation tool needs to: apply an Operation Token to both sides of an
equation, simplify the result symbolically, solve a Formula for its Target
Variable (to derive the Ideal Solution), and test whether two expressions are
algebraically equivalent. We vendor **nerdamer** (MIT, pure client-side, no build)
under `assets/vendor/` for this.

## Considered options

- **Algebrite** — rejected: a fuller CAS than this purely-rearrangement use case
  needs, with a larger payload.
- **Hand-rolled mini symbolic engine** — rejected for the engine itself: writing a
  correct simplify + equivalence checker is the riskiest, highest-effort part of
  the project; a vetted library removes that risk. (We still hand-roll the
  Fractions arithmetic, which only needs integer gcd/lcm.)

## Consequences

- nerdamer is committed verbatim and pinned by file (per ADR-0001); upgrades are a
  deliberate file swap.
- Equivalence is checked via nerdamer (e.g. simplify of `lhs - rhs` to 0), and the
  Ideal Solution comes from `solveFor`, so it never needs hand-authoring.
- Scope guard: nerdamer is used **only** by the Equation tool; the other three
  tools stay dependency-free.
