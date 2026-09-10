---
name: seed-conventions
description: Build the design-convention library by reading what the UI actually does, then report every place it contradicts itself. Run this once to create conventions.md, and again after a large refactor. Use when there is no convention library yet, or when the existing one has fallen behind the code.
---

# Seed the convention library

You are writing `conventions.md` — the single place the design conventions of
this UI live. It is the reviewer's file. You draft it; they own it.

## The one rule that governs everything here

**A convention is a description of what this tree already does, promoted to a
rule. It is never an aspiration, and it is never your taste.**

When the tree is consistent, write the convention and cite the consistency. When
the tree is inconsistent, **do not pick a winner** — write the fork, both sides,
with counts, and leave it for the reviewer. A library seeded with your
preferences is worse than no library, because the audit will then enforce them
across the whole application.

---

## Step 1 — Read the whole surface, including the parts that are not source

Read, in this order:

1. `src/ui/theme.css` — the token definitions and every vendor restyling.
2. Every `*.module.css` under `src/ui/`.
3. **The built stylesheet.** Run the production build and read `dist/assets/*.css`
   with `postcss` (already in `node_modules` — do not add a dependency).

Step 3 is not optional and it is the step that gets skipped. The built sheet is
the resolved artefact — vendor plus theme plus modules — and it is what the
reviewer is actually looking at. Measured on this tree at the time of writing:
200 `font-size` declarations ship, 75 are off the type scale, and only **12** are
in the module sources. A library seeded from `src/**/*.module.css` alone
describes 16% of the typography that ships.

Then read for the conventions that are not about pixels:

4. `README.md`, particularly *"What the surface says, and why it says it that
   way"* — several conventions are already written there in prose.
5. The component and screen `.tsx` files, for conventions visible only in code.
6. `scripts/port-additions.mjs` and the `*.test.ts` files — some conventions are
   **already enforced**, and those must be recorded as `status: checked` with a
   pointer to the existing checker rather than duplicated into a second one.

## Step 2 — Recover the mapping from built class to source

Every scoped class in the built sheet is `_<local>_<hash>_<line>`, where `hash`
is djb2-xor over the source file's own text. Rebuild the map in six lines:

```js
const h = s => { let x = 5381, i = s.length; while (i) x = x * 33 ^ s.charCodeAt(--i); return (x >>> 0).toString(36).slice(0, 5) }
```

Hash each `*.module.css` under `src/ui/`, build `{hash: path}`, and every
violation you find in the built sheet then carries its own source file and line.

Three traps, each of which silently produces a wrong line number:

- **`@keyframes` names look like classes.** A local name with no `.local` in the
  source file is a keyframe. The generator's `css.indexOf('.' + name)` returns
  −1 and the line arithmetic yields line 1. Skip them.
- **Generic components.** Match `function\s+([A-Z]\w*)\s*(?:<[^>]*>)?\s*\(` when
  you need a component name — without the generic clause, `export function
  Region<T>` misses.
- **Dynamic class access.** When `css.<local>` has no static hit, grep `css[` in
  the same file: `css[action.look]` and `css[active ? "active" : step.mark]` are
  both real in this tree and both resolve to nothing under a naive grep.

## Step 3 — Write each convention

One section per convention:

````markdown
### <kebab-name>
status: checked | judgement | prose-only
scope: <globs, and whether it covers the built sheet>

<Two to five sentences. What the rule is, and what it MEANS — the semantic job
of each value, not just the list. This half is what a reader follows when the
check block cannot decide for them.>

```check
property: <css property>
allow: <the permitted values, exactly as they appear in source>
```

exceptions:
- <file> <selector> — <the written reason it is exempt>
````

`status` is the honest label, and getting it wrong is the main way this file
becomes a lie:

| status | means |
| --- | --- |
| `checked` | the check block decides it completely; a clean run means compliance |
| `judgement` | the check block narrows it, a person decides the rest |
| `prose-only` | nothing mechanical can test this |

**A `prose-only` convention is first-class.** "One verb per button and the verb
is chosen" cannot be checked and is one of the most important rules in this
build. Write it, mark it, and never let a green audit be read as covering it.

## Step 4 — Seed at least these

Do not stop at colour and type. The reviewer's complaint is typography, but a
library that holds only typography leaves everything else exactly as scattered
as it was.

**Mechanical (aim for `checked`):**

- **Type scale.** The five steps and the semantic job of each.
- **Spacing scale.** The six steps. Note where the ramp has no step — that
  absence is why off-scale values accumulate, and it is evidence for the
  reviewer, not something for you to fix.
- **Colour.** Token-only. Flag every raw literal.
- **Font family.** Token-only.
- **Defined tokens.** Every `var(--x)` must resolve to a definition in
  `theme.css`. This one is worth writing first: it fires on real, live defects
  rather than on judgement calls.
- **No `!important`.** Already enforced in `scripts/port-additions.mjs` — record
  it as checked *there*, do not write a second checker.
- **Vendor layering.** Blueprint and normalize stay inside `@layer vendor`.
  Already enforced; same treatment.

**Semantic (mostly `prose-only`, and mostly already written in `README.md`):**

- Finished work grounds on `--well`; unfinished sits on `--paper`.
- The ink ramp: the head of a block is `--ink`, the prose under it `--ink-soft`,
  counts and timestamps `--ink-faint`.
- One verb per button, and the verb is chosen.
- No internal vocabulary reaches the reader.
- Disabled outranks intent.
- Pointer focus draws no ring.
- A viewer shows; it does not edit.

**One meta-rule, and it is not optional:**

- **`scope-covers`.** The union of the files every rule scopes over must equal
  the set of CSS that reaches the bundle. A stylesheet no rule covers is itself
  a finding. Without this, a new stylesheet is silently outside the library
  forever — which is exactly how `src/ui/theme.css`, the single
  highest-leverage typography surface in this application, ended up outside the
  obvious glob.

## Step 5 — The gap report

Alongside the library, write `conventions-gaps.md`. This is the more useful of
the two outputs on day one. Four sections:

### A. Live defects
Things already broken, not merely inconsistent. Each with file, line, and what
it does on screen. At the time of writing this tree had:

- `--bad`, `--warn` and `--rail-width` referenced but never defined in
  `theme.css`. `--bad` falls back to a raw `#b4341f` that always paints — the
  most saturated pixel in the application. `--warn` falls back to `--ink-soft`,
  silently erasing the distinction it exists to draw.
- A dangling selector at `ProjectScreen.module.css:190` — `.pathway[data-pathway="none"]`
  with no declaration block, swallowing `.cross` into a descendant selector.

**Verify each of these against the current tree.** The code has moved since; do
not report a fixed defect, and do not assume this list is complete.

### B. Forks for the reviewer
Every inconsistency where the tree does two things and you must not choose.
State both sides with counts and the cost of each. The known one:

> **Does the type scale gain a sixth step?** 13px has four users, 12px has three
> and sits half a pixel from `--t-meta`. Forcing them onto the existing five is
> clean and enforceable, but will make several things visibly worse before
> anyone decides whether the scale was simply missing a step. Naming `--t-note`
> (13px) instead converts most of the drift mechanically and leaves the rest as
> genuine judgement.
>
> **This must be decided before the first audit**, because it changes what the
> audit produces.

### C. Unreachable and undeclared
- Tokens defined but referenced by nothing.
- Values used repeatedly with no token — a convention with no name.
- Parallel scales. Blueprint runs `--bp-typography-size-body-large/-medium/-small`
  and `theme.css` never redefines them, so there is a live second type scale the
  library would not see. Recommend redefining those three in terms of the five
  steps as the first vendor override.

### D. Coverage
State what fraction of the shipped stylesheet the library actually governs, as a
fraction, per rule. *"Type scale: 12 of 75 off-scale declarations are in scope;
58 vendor; 7 global."* Without this line, "seeded 24 stylesheets" reads as
"seeded the UI," and it is not the same claim.

## What you must not do

- **Do not edit any UI file.** Seeding is read-only. Everything you find goes in
  the gap report; changing the UI is the `audit-conventions` skill's job, and
  only after the reviewer has read the report.
- **Do not invent a convention to make a violation disappear.** If eleven sites
  do one thing and one does another, that is a fork with an 11–1 count, not a
  rule with one exception — unless the one has a *written reason*, in which case
  it is an exception and the reason goes in the file.
- **Do not write a second checker for a rule already enforced.** Point at the
  existing one.
- **Do not claim `checked` for anything a check block cannot fully decide.** The
  status field is the file's honesty, and an over-claimed `checked` is how a
  green run comes to mean nothing.
