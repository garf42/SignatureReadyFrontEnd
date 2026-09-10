---
name: audit-conventions
description: Sweep the whole UI against conventions.md and bring it into line. Run after any change to the library, and before any release. Use when a convention was added or reworded, when the reviewer asks for a consistency pass, or when a comment says "this everywhere".
---

# Audit the UI against the convention library

`conventions.md` is the authority. This skill finds everything that disagrees
with it and fixes what can be fixed mechanically, in the reviewer's own terms.

It is the mirror of `seed-conventions`: same reading, same resolution machinery,
opposite direction. Seeding writes the library from the UI. Auditing writes the
UI from the library.

## Before anything else

**Read `conventions.md` in full.** Not the check blocks — the prose. The check
block narrows a rule; the prose is the rule. Most of what you are here to fix is
choosing correctly among five legal values, and no check block can tell you
which one a given element wants. The sentence can.

Then check `status` on every rule you are about to act on. A `prose-only` rule
gets read and applied by judgement; it never produces a mechanical finding. A
`judgement` rule narrows and then stops. Only `checked` decides on its own.

---

## Step 1 — Work out which sweep this is

Each convention carries two hashes: one over its prose, one over its check
block. Compare against the last run's record.

| what changed | sweep | what it produces |
| --- | --- | --- |
| check block | **checked sweep** | every offender, enumerated mechanically |
| prose only | **judgement sweep** | one item per *site in scope* |
| both | run the checked sweep first, then the judgement sweep over what survives |
| neither | that rule is not swept; say so |

**The judgement sweep is the one that matters and the one every naive design
omits.** In this tree `font-family` is 68/68 clean and `font-size` is 109/121 —
nobody is reaching for an unknown font, they are choosing the wrong step among
five. So the highest-value edit the reviewer can make is to a *sentence*:
*"`--t-meta` is for control labels, not prose helpers."* That changes no check
block and fires nothing at all unless you sweep on prose.

A judgement sweep enumerates **sites, not offenders**, because the machine cannot
tell which is which. Every item carries the rule's old and new wording, that
site's current value, and a required disposition. It is typed `judgement` and it
**may never be reported as "audited"**. Its header carries a denominator:

> `type-scale · judgement sweep · 41 sites in scope · 41 read · 6 changed`

---

## Step 2 — Sweep the built stylesheet, not the sources

Run the production build. Parse `dist/assets/*.css` with `postcss` (already in
`node_modules`; do not add a dependency). Map every finding back to source
through the scoped class name, which carries its own source line:

```
_levelNote_1i545_209   →   .levelNote  at  ProjectScreen.module.css:209
```

Rebuild the hash map with djb2-xor over each `*.module.css`:

```js
const h = s => { let x = 5381, i = s.length; while (i) x = x * 33 ^ s.charCodeAt(--i); return (x >>> 0).toString(36).slice(0, 5) }
```

**Do not sweep `src/ui/**/*.module.css` instead.** Measured: that scope sees 12
of the 75 off-scale `font-size` declarations that actually ship — 16% — and it
does not match `src/ui/theme.css` at all, the one file holding every Blueprint
restyling. The built sheet is the resolved artefact and it is what the reviewer
is looking at.

Then run **`scope-covers`** before reporting anything: the union of what the
rules cover must equal the CSS reaching the bundle. A stylesheet no rule covers
is a finding in its own right, reported first. This is the check that catches
the next `theme.css`.

---

## Step 3 — Dispose of each finding

Four dispositions. Two are terminal, two change something other than the UI.

**`done`** — the site is brought onto the rule. Ordinary, and most findings.

**`override`** — the violation is in vendor CSS. Blueprint sits in
`@layer vendor`, so *any* unlayered rule in `theme.css` beats it regardless of
specificity; that is how the existing overrides already work. Write the override
in this tree's own tokens and spacing, never in Blueprint's pixels. The first
one worth writing: redefine `--bp-typography-size-body-large/-medium/-small` in
terms of the five steps, so Blueprint stops running a live parallel scale.

**`rule-is-wrong`** — the rule is at fault, not the code. This edits the check
block, which changes its hash, which re-triggers the sweep. Use it when the
count says so: if 32 sites disagree with a rule, that is evidence about the rule.
Widen the allowlist deliberately and re-sweep; do not grandfather 32 sites.

**`exception`** — a named entry in `conventions.md` with a **written reason**.
Not a suppression. The auditor prints each rule's exception count beside its
violation count, so a rule quietly filling with exceptions is visible rather
than silently hollowed out.

There is deliberately **no `wontfix` and no violation budget** on a sweep item.
A budget is a violation you have agreed to keep and stopped seeing.

---

## Step 4 — The liveness pass

A rule can be violated by CSS that never paints. Before reporting, build
`dist-walk/preview.artifact.html` (`npm run preview:artifact`) and walk it
through the URL knobs — `?state= ?pathway= ?levels= ?submitted=` and the rest,
listed in `README.md`. Collect `querySelectorAll` matches for every flagged
selector.

Report **three numbers, not one**:

- offenders that actually paint,
- offenders on dead rules (there were ~14 candidates on this tree, including
  `.cross` behind a dangling selector),
- offenders undecidable because the class is applied dynamically.

The first number is the queue. The second is a separate, smaller, more valuable
finding: dead CSS. The third has to be said out loud rather than folded into
either.

---

## Step 5 — Change the UI

Only now, and under these constraints:

- **One rule per commit.** A commit message names the rule, the count, and the
  dispositions. A mixed commit cannot be reverted when one rule turns out wrong.
- **Never widen the change.** A type-scale sweep changes `font-size`. If you see
  something else wrong, file it; do not fix it in the same pass. The reviewer is
  auditing the audit, and a diff carrying unrequested changes cannot be read.
- **Run the repo's own checks before pushing** — `npm run lint`, `npm run
  typecheck`, `npm test`, `npm run port:additions`. The CSS contract in
  `port-additions.mjs` is a peer of this audit, not a subordinate: if it fails,
  your change is wrong.
- **Re-run the sweep after the change** and put the before/after counts in the
  report. A sweep that does not close is not finished.

---

## Step 6 — The report

Write it whether or not anything changed. Header first, and the header is a
coverage statement, not a score:

```
type-scale · checked sweep · rule hash 4f2a → 9c11
  scope: dist/assets/*.css + src/ui/**/*.css
  coverage: 75 off-scale font-size declarations ship · 12 in module sources ·
            58 vendor · 7 global
  findings: 12 · done 9 · override 2 · exception 1 · rule-is-wrong 0
  liveness: 10 paint · 2 dead rules · 0 undecidable
```

Then per finding: the source file and line, the current value, the value it
becomes, and the sentence from the rule that decides it.

**The coverage line is not optional.** Without it, "swept 24 stylesheets" reads
as "swept the UI," and those are different claims. State the fraction of what
ships that the library actually governs, every time.

Close with what the sweep could **not** answer: every `prose-only` rule in the
library, listed by name, so a clean run is never mistaken for compliance with
the conventions that matter most.

---

## When the audit is triggered by a comment rather than a library change

A pin that says *"this everywhere"* is a convention in the making, not a
one-site fix. Handle it in this order:

1. Fix the site the reviewer clicked, so the comment is answered.
2. Draft the convention — prose **and** a check block — and propose it. Do not
   write it into `conventions.md` yourself: the library is the reviewer's file,
   and a library authored by the agent whose unreliability created the problem
   is not a source of truth. Propose; they approve.
3. Once approved, the new rule's hash change triggers a normal sweep. Run it as
   above.

Never do step 3 before step 2 is approved. A sweep from an unapproved rule
changes the whole UI on your reading of one sentence.
