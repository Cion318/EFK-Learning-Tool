# Equation tool uses operation-token, both-sides algebra

The Equation tool lets the student solve a Formula for a Target Variable by
typing **Operation Tokens** (`*R`, `/I`, `+x`, `-y`, `^6`, `sqrt`, …) one at a
time. Each token is applied by the tool **to both sides** of the current
equation, simplified by a symbolic engine, and rendered as the new — always
mathematically correct — equation form. The student iterates until satisfied,
submits, and the Ideal Solution is revealed for comparison.

## Why this shape

- The tool, not the student, performs the algebra, so every displayed
  intermediate equation is guaranteed valid — the student practises *strategy*
  (which operation to apply next), not error-free hand manipulation.
- Avoids free-form equation parsing (messy, ambiguous) while staying far more
  open-ended than picking a pre-written rearrangement from a list.

## Considered options

- **Free-form: type the whole equation each step** — rejected: heavy, ambiguous
  parsing; the student can enter an invalid line.
- **Pick-the-rearrangement multiple choice** — rejected: too constrained, doesn't
  build the manipulation skill.

## Resolved scope

- **Purely symbolic.** An exercise is a Formula + Target Variable; the student
  rearranges to isolate the variable. No numeric values, no final numeric answer
  to compute. (See glossary: Target Variable.)
- **Correctness at submit = isolated + equivalent.** The attempt passes iff the
  final equation has the Target Variable alone on one side AND is algebraically
  equivalent to the original Formula. Any valid token path that reaches this
  passes; the Ideal Solution is then shown for comparison (e.g. "ideal: 2 steps").

## Operation Token grammar

- **Binary**: an operator `* / + -` followed by an operand that is either a
  variable present in the current formula (`R`, `I`, `R1`, …) or an integer
  (`5`, `6`). Applied to both sides.
- **Power**: `^n` (raise both sides to integer power n).
- **Named unary**: `sqrt` (take the square root of both sides), `swap` (exchange
  left and right sides).
- Operand variables are restricted to those in the active formula. Malformed
  tokens (`*`, `/x?`, `++`) are rejected with a hint and do not mutate the
  equation.

## Difficulty

Three tiers `leicht / mittel / schwer` (consistent with Learn/Exam), defined by
formula complexity for the chosen Target Variable. Each catalog entry is a fixed
`(expr, solveFor, difficulty)` triple — the same formula may appear at different
tiers for different targets (e.g. `P=U²/R` solve `R` is *mittel*, solve `U` is
*schwer* because it needs `sqrt`). See `deliverables/formulas.json`.

The Ideal Solution is derived at runtime by the CAS solving `expr` for
`solveFor`; steps are not hand-authored.
