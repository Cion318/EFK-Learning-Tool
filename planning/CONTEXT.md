# EFK Learning Tool — Domain Glossary

The shared vocabulary for the EFK learning platform: a client-side, bilingual
(DE/EN) study tool for the IHK *Elektrofachkraft für Industrie* qualification.
This glossary is the canonical language — code, UI strings, and docs should use
these terms. It contains no implementation detail.

## Language

### Platform & content

**Tool**:
One of the four top-level study modes the platform offers: Learn, Exam,
Equation, and Fractions. Selected from the Home screen.
_Avoid_: mode, section, module, page.

**Chapter**:
A themed unit of question content (e.g. `EFK01 – Grundlagen`), identified by an
uppercase key and supplied as a DE/EN JSON file pair. Used by Learn and Exam.
_Avoid_: topic, unit, lesson.

**Question**:
A single multiple-choice item belonging to a Chapter, with a `type`
(`wissen`/`rechnung`), a `difficulty` (`leicht`/`mittel`/`schwer`), answer
options, one correct answer, and an explanation. The internal unique key is
`CHAPTER::id`.
_Avoid_: item, problem, task.

**Learn**:
The self-paced Tool that shows Chapter Questions one at a time for practice,
with immediate feedback and no time limit.
_Avoid_: practice mode, study mode, flashcards.

**Exam**:
The timed, scored Tool that assembles a fixed 20-Question mock exam from
Chapters with a fixed difficulty distribution and a pass threshold.
_Avoid_: test, quiz, assessment.

### Equation tool

**Equation tool**:
The Tool where the student rearranges a physically-correct electrical-
engineering formula to solve for a Target Variable, by issuing Operation Tokens
that the tool applies to the equation and checks.
_Avoid_: formula trainer, algebra tool, solver.

**Formula**:
A physically-correct electrical-engineering relationship (e.g. `U = R · I`) that
seeds an Equation exercise. Distinct from a randomly-generated arithmetic problem
in the Fractions tool.
_Avoid_: equation (reserve "equation" for the live, mutating expression).

**Target Variable**:
The single variable the student must isolate (solve the Formula for) in an
Equation exercise.
_Avoid_: unknown, solve-for, subject.

**Operation Token**:
A short textual instruction the student types — e.g. `*R`, `/I`, `+x`, `-y`,
`^6`, `sqrt` — that the Equation tool applies **to both sides** of the current
equation, simplifies, and renders as the new equation form.
_Avoid_: command, move, step input.

**Both-Sides Application**:
The rule that every Operation Token is applied identically to the left and right
sides of the equation, guaranteeing the displayed result stays mathematically
valid.

**Ideal Solution**:
The reference rearrangement path (and/or final isolated form) the tool reveals
after the student submits, for comparison against their own work.
_Avoid_: answer key, correct steps.

### Fractions tool

**Fractions tool**:
The Tool for practising fraction arithmetic (add, subtract, multiply, divide)
with a focus on finding the lowest common denominator, using randomly generated,
mathematically-correct problems.
_Avoid_: math tool, arithmetic trainer.

**LCD (Lowest Common Denominator)**:
The smallest shared denominator used to add or subtract two fractions — the
central skill the Fractions tool drills.
_Avoid_: smallest common divisor, common multiple, LCM (in UI; clarify in guide).

**Expand** (fraction):
An operation that multiplies a fraction's numerator and denominator by the same
integer — used to reach a common denominator. Inverse of Reduce.
_Avoid_: scale, multiply up.

**Reduce** (fraction):
An operation that divides a fraction's numerator and denominator by a common
integer factor. Repeated until lowest terms (see Simplify).
_Avoid_: cancel, shorten.

**Combine**:
The operation that applies the problem's arithmetic (`+ − × ÷`) to the two
fractions, producing a single fraction.
_Avoid_: merge, add (reserve "add" for the `+` operator itself).

**Simplify**:
Reducing the current single fraction all the way to lowest terms.
_Avoid_: fully reduce, normalise.
