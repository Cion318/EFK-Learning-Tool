# Fractions tool uses the same operation-driven interaction as Equations

The Fractions tool mirrors the Equation tool's feel: rather than typing a final
answer, the student applies **operations** to a randomly generated fraction
problem (e.g. `1/6 + 1/4`) and the tool performs each one, rendering the new —
always mathematically correct — state. The student works toward a single reduced
fraction, submits, and the Ideal Solution is revealed.

## Operations

Operations target a fraction by **position index** (not just left/right), because
the `schwer` tier can generate three-fraction problems (e.g. `3/8 − 5/12 + 1/6`).

- **expand `<pos> n`** — multiply the chosen fraction's numerator and
  denominator by integer `n` (used to reach a common denominator).
- **reduce `<pos> n`** — divide the chosen fraction's numerator and denominator
  by integer `n` (rejected if it doesn't divide both evenly).
- **combine** — once denominators match (for `+`/`−`) or for `×`/`÷`, perform the
  problem's operation into a single fraction.
- **simplify** — reduce the current single fraction to lowest terms.

## Why

- Consistency: one interaction metaphor across both new tools lowers the learning
  curve and lets the two tools share UI/engine scaffolding.
- It makes the **LCD** the visible, deliberate skill — the student must choose
  expansion factors that land on a common denominator, which is the stated focus.

## Correctness at submit

Correct iff the current expression is a single fraction, in lowest terms, equal
in value to the original problem. Any valid sequence of operations that reaches
it passes; the Ideal Solution (canonical LCD path) is shown for comparison.

## Generation (difficulty tiers)

Randomly generated, three tiers by denominator difficulty (consistent with the
rest of the app):

- **leicht**: two proper fractions, small denominators that share a factor or
  where one divides the other (halves/quarters) — LCD is easy (`1/2 + 1/4`).
- **mittel**: denominators up to ~12, including coprime cases where LCD is the
  product (`1/6 + 1/4` → LCD 12).
- **schwer**: denominators up to ~20, and/or three-fraction problems with mixed
  operators (`3/8 − 5/12 + 1/6` → LCD 24).

## Notes

- `×` and `÷` don't need a common denominator; the guided LCD emphasis applies to
  `+` and `−`. The tool still lets the student combine then simplify for all four.
- A short **LCD guide** (how to find the lowest common denominator / kgV) is
  available within the tool.
