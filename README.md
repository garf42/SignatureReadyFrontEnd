# SignatureReady — front end

React conversion of the SignatureReady specimen pack, built out against the
register and its two amendments. The whole deliverable is `src/ui/`.

**This is a build in progress, not a finished interface.** See
[What is not finished](#what-is-not-finished) before reading anything here as a
claim that a screen is done. §7's project page in particular has substantial
work left.

```
npm install
npm run dev             # vite
npm run lint            # eslint, --max-warnings 0
npm run test            # vitest
npm run typecheck       # tsc --noEmit
npm run port:additions  # regenerate the port-gap list and HOST-CONTRACT.md
npm run walk            # emit dist-walk/walk.html — the whole spec, one file, no external requests
npm run build           # tsc --noEmit && vite build -> dist/
```

Node 24, ESM, Vite, output `dist/`.

## A note on the § numbers

`§1`–`§5` are the backend register, `§6` the supporting-pages amendment, `§7`
the project-page amendment. Those three documents govern this build and **do not
travel with the packet**. Nothing here depends on reading one: every fact a
binding or a test rests on is restated where it is used, and no shipped file
names them by path.

## What ships

`src/ui/` is copied into the host app as files, not mounted as a nested app. It
is self-contained: every import is `@/ui/…`, nothing reaches outside it, and no
file outside it is load-bearing — including the generated port-gap list, which
lives at `src/ui/data/PORT-ADDITIONS.generated.md` for exactly that reason. The
move is one directory rename.

`src/main.tsx` is the only file outside it and does not port: in Foundry that
level is shell-owned (OSDK provider, `/auth/callback` route, dev-server
basename).

No OSDK package is imported anywhere.

## Screens

| route | screen |
| --- | --- |
| `/` | the inbox: every project this officer holds |
| `/archive` | recently-deleted projects, restore or purge — §6.3 |
| `/experts` | the expert queue and the request it drafts — §6.4, Level 4 |
| `/learning` | what was proposed, what was adopted, whether it is calibrated — §6.5, Level 3 |
| `/reference` | the corpus, the pinned regulation, the CE catalogue — §6.6, Levels 0 and 1 |
| `/projects/:projectRef/steps/:stepId/:tabId` | the shell + one part of the document — §7 |
| `/projects/:projectRef/steps/x/:tabId` | the cross-cutting tabs, reachable from every step — §7.7 |
| anything else | not found |

## The five states

Every region a screen renders is in exactly one of five states, told apart by
shape and carried in `data-state`. The words never reach the screen.

| state | what it means |
| --- | --- |
| `pending` | a request is out and no usable value is held. Not an answer, so it carries no message — it carries the query it is **asking** |
| `filled` | a value arrived |
| `absent` | a query ran and found nothing. That is an answer, and the region carries the query it **searched** |
| `blocked` | a precondition is unmet; names what it waits on |
| `unresolved` | the lane could not have answered. Always a defect |

The mapping from a backend outcome to a state is fixed, so an adapter is
mechanical rather than interpretive:

| backend outcome | state |
| --- | --- |
| request in flight, and no usable cached value | `pending` |
| query succeeded, zero rows | `absent` |
| caller lacks the credential the rule reserves, or the surface has no backend address | `blocked` |
| query or lane failed, or returned a defect | `unresolved` |
| query succeeded with rows | `filled` |

`pending` and `absent` are one question at two times and carry the same query
string: *"Asking: q"* becomes *"Searched: q"*. `pending` draws no spinner and no
skeleton — it holds the room and names what it asked. A request that outlives
its deadline becomes `unresolved`; the port owns that deadline, so no component
holds a clock.

## The seam

`src/ui/data/port.ts` is a **contract**, not an implementation.

```ts
const port = usePort();
const inbox = port.useInbox();
```

`DataPort` declares seventeen members. `fixturePort` implements it from fixtures
and is the context's **default**, so nothing has to be provided for the tree to
run — a required provider would make the fixture path opt-in, and a screen
mounted in isolation would get nothing instead of fixtures.

Wiring a backend is shell work, and no file under `src/ui/` is edited to do it:

```tsx
// shell territory
<DataPortProvider port={composePort({ useInbox: live.useInbox })}>
<DataPortProvider session={osdkSession}>   // real auth, no port needed
```

Anything not named keeps its fixture, so a half-wired application is a normal
state rather than a broken one — which matters through the long period when some
surfaces are live and others are not.

**Two constraints on any implementation**, because an async one depends on them:
every member must be callable unconditionally during render, and no member may
call a hook inside a branch or return early before its last hook call.

`src/ui/data/acts.ts` is the write seam: all seventeen acts, each naming its
action API name, what it writes, its actor, its parameters, what the interface
refuses before sending versus what it must let the platform refuse, what goes
stale on success, and what the surface does on failure.

`src/ui/data/bindings.ts` declares, per surface, the exact API names, how the
surface is addressed, the query shape, which edges are traversed rather than
scanned, where the gate is held, and what may go stale.
`npm run port:additions` generates the port-gap list from it.

**Every name carries a status.** 76 of 79 object types hold zero rows, so a
near-miss API name and an empty object type are the same pixel — a wrong name
survives every test. `confirmed` means the exact string was measured on the
platform. `proposed` means it does not exist yet, or the register names the
thing without naming its API name. The generated list puts every proposed name
in one table at the top; work through that table first.

## Every state is reachable by URL

| query | what it moves |
| --- | --- |
| `?state=pending\|filled\|absent\|blocked\|unresolved` | the screen's own region |
| `?shell=…` | the project band, the pathway line and the step list |
| `?session=out\|pending` | the signed-out case, and the session still resolving |
| `?pathway=P0\|P1\|P2\|P3\|P4` | the pathway Step 2 fixed, and so which steps exist |
| `?gate=held` | the caller holds the credential the rule reserves |
| `?retrieval=down` | the drafting lane could not run |

These are the whole QA and demo surface and the acceptance tests depend on them,
so they **stay enabled in the deployed app** — a stakeholder walkthrough of an
empty ontology needs `?state=` and `?shell=`. They need no build flag and must
not have one: they live inside the fixture members, so a surface wired live
loses its knob automatically and the knob surface shrinks by exactly one member
per `composePort` line.

**Every list surface opens with placeholder rows, and `?state=absent` reaches
what the backend actually holds.** Archive has no backend address at all, both
expert acts key on a `slot` that nothing creates, and `category` holds zero of
its 87 rows. §6.1 asks that empty read as designed rather than as a failed load.

## What is not finished

The packet is mid-build. Read the bindings as a specification for the adapter,
never as a claim that the screen above them is done.

Run **`npm run walk`** first. It emits one self-contained `dist-walk/walk.html`
— every level of review, every step, every tab, every row, with its anchor, its
level, what the rule does with it, and where its own words came from — generated
from `pathways.ts`, so it cannot drift from what the tree holds. The counts below
come from it and go stale; the file does not.

- **The rule's own text is not in this repository.** 19 rows carry
  `text: "placeholder"`, which means their label is their own citation ordinal
  and no non-specialist can answer them: the ten notice-of-intent contents at
  1b.7(b)(1)(i)–(x), the three environmental-assessment scope duties at
  1b.5(b)(1)–(3), the three scoping sub-paragraphs at 1b.7(c)(1)–(3), 1b.7(g)'s
  unenumerated duties, and two more. 13 rows offer a set whose members are not
  here either, including the nine subcomponents at 1b.4(a) — where the source
  sentence names eight services plus a block of general offices and calls the
  total nine. **Do not build a picker for that until the list is read off the
  pinned text.** Such a row renders `unresolved`, is excluded from every submit
  count, and is listed under `owner: "regulation"` in the walk.
- **Completion still has no property behind it.** `TabEntry.outstanding` is
  `null` throughout, and null is not zero — a tab with no address must not
  render as done. Nothing creates a `slot` row and eleven of the seventeen acts
  are keyed on one.
- **Every action on the project page is inert.** `onAction` is threaded only on
  the inbox and submit is local state. There is no write seam on the port.
- **One act has no surface anywhere.** `record-consistency-finding` is declared
  with `unplaced` saying so. Placing it is still open: it may instead be one of
  the three unnamed members of `determination.whichDetermination`, which has to
  be read off Ontology Manager first.
- **Every reserved surface is enforced by nothing.** No platform predicate marks
  a caller's class, so the interface's withholding is the only gate there is.
  `acts.ts` asserts that every reserved act says so.
- **The screens run on fixtures.** A green preview says nothing about the
  ontology, because the tree makes no OSDK calls at all.

## Levels of review, and how a proposal moves between them

**Part 1b contains no cross-pathway dependency.** P0–P4 are the five mutually
exclusive outcomes of *one* ordered elimination at 1b.2(f)(2), not a ladder. A
finding of no significant impact after an environmental assessment — 1b.6(a) —
and a record of decision after a statement — 1b.8(a) — are ordering *within* a
level, and either may be one physical document with its predecessor. So neither
is a level boundary, and neither may be built as one.

Four transitions move a proposal between levels. They are declared in
`TRANSITIONS`, every one carries its citations, and **their modalities differ**
— which is the whole point, because reading a duty as a permission is the
dangerous direction:

| | citations | modality |
| --- | --- | --- |
| **T1** reevaluation finds a higher level may be warranted | 1b.9(r), 1b.9(r)(2) | **duty to *consider*.** The only express escalation instruction in part 1b, and its verb is *consider*. Nothing escalates by itself. |
| **T2** a categorical exclusion cannot be applied because an extraordinary circumstance was not cured | 1b.2(f)(2)(i) → 1b.3(g)(1)(ii) → 1b.3(f)(3) → 1b.2(f)(2)(iv) → 1b.3(f)(2) | **derived.** No single paragraph states it; the chain compels it. Not a choice. |
| **T3** a substantial update to a filed environmental impact statement | 1b.9(r)(3), 1b.7 | **duty.** Produces a *second* P4 episode on a P4 proposal, which is why the level history is an ordered list and not a set. |
| **T4** the responsible official redetermines the level | 1b.11(a)(46) | **permission.** See below. |

**T4 rests on something this repository cannot read.** §7 asserted that an
environmental assessment supporting significance *reopens* the determination and
moves the proposal to P4. No paragraph here supports that: 1b.2(f)(2)(iv) fires
*before* the assessment is written and expressly sends unknown significance to an
assessment, and 1b.5(a) and 1b.6(c) — where such a rule would live — are cited
nowhere in the tree and could not be retrieved. It is therefore carried as a
permission under 1b.11(a)(46), with the two unread paragraphs named on the
surface, and **must not be promoted to a duty until they are read.**

There is **no de-escalation**. `direction` is a closed union with no `"lower"`
member, so one is unauthorable rather than merely unrecommended: 1b.9(r)(2) says
*higher* and names no lower, an errata under 1b.9(r)(3)(i) is defined as an
update that does *not* change the determinations in the record of decision, and
1b.3(f)(3)'s cure operates before any document exists. The surface says this is
the rule's **silence**, not its prohibition.

**One proposal, one project, one rail.** 1b.2(e) confines the subcomponent to the
proposed action at hand, 1b.9(a) keeps one record per proposal, and
`open-document`'s uniqueness is over the *pair* (project, documentType) — so an
EA, a FONSI, an EIS and a ROD already coexist on one project by design. A level
change therefore **appends** a band to the rail; it never replaces one. §7.8 said
*replaces* and is superseded on that point. A superseded level keeps its steps,
readable and read-only.

**The rail is computed from the rule, not from the adapter's answer.** `railFor`
reads `pathways.ts` over the level ids `useLevels` returns. A `readonly` array
forbids mutation, not a *shorter* one — an implementation written against a
blanket uniqueness constraint would return a single episode and silently delete
the earlier level's steps, undetectably, because the port is the boundary. This
way a wrong answer can mislabel a level and can never lose a step.

**Three things the FDE must settle before wiring `useLevels`**, and each is a
decision rather than a gap:

1. **A convention mapping `determination.outcome` onto P0–P4.** The property is
   free text; nothing decodes a level from it. Invented privately, the two sides
   will disagree about what level a proposal is on with nothing to detect it.
2. **A supersession property or edge.** None exists, so an ordered level history
   has no address at all. Until it does, `useLevels` returns `unresolved` — which
   is a demoable state, not a bug.
3. **Uniqueness over `(project, whichDetermination)` scoped to the unsuperseded
   row.** Written blanket, it permanently forecloses reopening. At most one
   *live* determination of each kind, with an ordered history behind it. Order
   that history by the supersession edge or by the platform's own edit ordering
   and **never by `decidedAt`**, which is a client-supplied parameter — ordering
   on it lets the browser decide which level a proposal is on.

And one schema change that cannot be deferred past integration: **the unique
identification number belongs on the document, not the project.** 1b.9(u)
attaches it to the environmental assessment (1b.5(c)(7)) and the statement
(1b.7(h)(1)(v)) and makes it discretionary for a FANEC. One field on the project
cannot carry two on an escalated proposal.

## The Levels framework

A different scale entirely from a *level of NEPA review*, and the collision is
the design: this is a **Level 2** instrument whose job is to drive a
non-specialist to the correct level of review.

| | | this build |
| --- | --- | --- |
| **0** | Data processing | intake, the proposal record, withholding, agencies |
| **1** | Search and visualisation | the categorical-exclusion catalogue, the forest-plan register, incorporation by reference |
| **2** | Decision guidance | every determination, screen and drafted recommendation — the centre of gravity, and a test asserts it |
| **3** | Feedback loops | reevaluation under 1b.9(r); the adopt disposition on every drafted row |
| **4** | Automation | the deadline computed from soonest-of-three with compelled publication at expiry, page count against the limit, the notification list |

Lower levels enable higher ones and a level is never forced. `coverage.test.ts`
asserts that every level is carried and that no Level 0 or 1 foundation is
empty — the framework's own named failure pattern.

## Integrating this into the host

`src/ui/host-requirements.json` is the machine-readable contract:
dependencies and their majors, the required tsconfig and vitest settings, the
files that must not exist, the DOM the mount node needs, and the router shape.
`HOST-CONTRACT.md` is its generated rendering, and
`src/ui/host-contract.test.ts` asserts it against the host it is running in —
so an integration that breaks one of these fails in your terminal on the first
`npm run test` rather than in review.

These steps cannot be automated. In order:

1. **Move the tree.** `git mv <nested>/src/ui src/ui`. One rename, zero content
   edits.
2. **Delete the host's `src/index.css` and its import from `src/main.tsx`.**
   *The highest-risk item in the port, because it yields a plausible-looking
   wrong app rather than an error.* The template's `index.css` imports
   `normalize.css` and `blueprint.css` **unlayered**; `theme.css` deliberately
   puts those same two in `@layer vendor` so its own rules outrank them. A
   second unlayered copy loading afterwards wins every specificity tie, and
   buttons, cards, dialogs, tables and selects silently revert to stock
   Blueprint. Stripping the `#root` rule is not enough — the file has to go.
   `theme.css` is the only global stylesheet.
3. **Put `// @vitest-environment node` at the top of the host's
   `src/env.test.ts`.** This tree needs `environment: "jsdom"` project-wide, and
   the template's own `env.test.ts` imports Vite — and therefore esbuild, which
   throws `new TextEncoder().encode("") instanceof Uint8Array is incorrectly
   false` inside jsdom. Without the docblock the first tagged release build
   fails: `ci.yml` **does** set `VERIFY_ENV_PRODUCTION=true` on tagged builds,
   so the production env check really does run on release. `ci.yml` is marked
   DO NOT MODIFY and does not need to change.
4. **Mount `App` at a single root splat.** `path: "*"`, which also matches `/`.
   Keep only `/auth/callback` above it. Mounting at both `/` and `*` produces a
   React Router warning and a real defect: with an exact `/` route above the
   descendant `<Routes>`, `App` unmounts and remounts on the first navigation
   away from the inbox, discarding UI state such as the open sections pane, and
   flashing. `App` also tolerates a non-`/` basename — the Code Workspaces
   preview serves under a long proxy prefix — so nothing here routes off
   `window.location.pathname` and nothing hardcodes an absolute asset path.
5. **Unbox the mount node.** Remove the `<div id="root-container">` wrapper from
   `index.html`. `theme.css` owns `#root`: `min-height: 100vh`, full bleed.
6. **Install the dependency delta and set the alias.** Everything in
   `host-requirements.json`'s `dependencies` at those majors. `@` → `/src` in
   **both** `vite.config.ts` (`resolve.alias`) and `tsconfig.json` (`paths`), or
   the copy becomes a rewrite.
7. **Set the vitest block** from `host-requirements.json`.
8. **Delete the nested harness** — `package.json`, `package-lock.json`,
   `index.html`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`,
   `src/main.tsx`. Move `scripts/port-additions.mjs` to `scripts/`, and
   `README.md` and `MANIFEST.md` to `docs/signatureready/`.
9. **Run the suite.** `npm run lint -- --max-warnings 0`, `npm run test`,
   `npm run build`.

The lint config here is a **superset of the host's**, and this tree passes it
clean — so the host needs no `src/ui/**` exception for `curly` or anything else.

## Three judgements the register did not make for us

- **`unresolved` is not scattered decoratively.** §1 defines it as always a
  defect. A default view sprinkled with defects teaches a reader that a defect
  is ordinary, so the project page has none; `?state=unresolved` reaches the
  whole region and `?retrieval=down` reaches the case §7.8 actually names.
- **A waiting step still opens.** §7.2 requires the build to be walkable end to
  end as a regular user, so a step that is waiting reads as waiting and is not
  disabled.
- **The initiation overlay asks for what `submit-intake` writes** — name, unique
  identification number and its issuer, anticipated implementation start — and
  no longer for an office or a summary, which no act records.

## What the tests hold

The element counts (FANEC 6, EA 7, FONSI 5, EIS 8, ROD 8 = 34), that exactly
three documents carry a signature gate and the EA and EIS do not, that a gated
row is `blocked` and never `absent` and always offers the routing, that a
discretion is never rendered as a requirement, that a retrieval lane which could
not run reports `unresolved`, that the five states are told apart in
`data-state` and never in words on the screen, that `pending` reaches every
surface and no default clause swallows it, that every surface declares a
binding, that `acts.ts` and `bindings.ts` state the same invalidation relation,
that no name is asserted that the register did not give, and that the host meets
`host-requirements.json`.
