# §8 — Project page: research findings and implementation plan

*Research pass of 2026-09-07. Amends §7. Every count below was measured against
this checkout (241 tests green, `npx vitest run`), not read off a document.
Every regulation claim is sourced to the register's §2 restatement and is
labelled where the register does not carry the paragraph.*

---

## §8.0 The finding that changes the question

**There is no ladder.** P0–P4 are the five mutually exclusive outcomes of *one*
ordered elimination at 1b.2(f)(2). Nothing in part 1b makes a pathway wait on
another pathway's output. The class of dependency you were describing —
"later decision branches don't open until the previous pathways have been
completed" — does not exist in the rule as a cross-pathway constraint.

What does exist, and what you were probably seeing:

| what | citation | class |
| --- | --- | --- |
| FONSI prepared "based on" the EA | 1b.6(a) | **within-pathway** step ordering. P3 Step 6. Already right. |
| ROD "upon completing" the EIS | 1b.8(a) | **within-pathway**. P4 Step 8. Already right. |
| NOI fixes the website every later publication uses | 1b.7(n)(2), 1b.8(c) | within-pathway |
| EPA notice of availability precedes implementation | 1b.8(e) | within-pathway |

Both document-dependencies may even resolve to *one physical document* —
1b.6(a) permits a combined EA/FONSI, 1b.8(a) a combined EIS/ROD. A boundary a
single PDF may straddle is not a pathway boundary. **§7's decision to model
FONSI as P3 Step 6 and ROD as P4 Step 8 is correct and should be kept.**

### The transitions that are real

Four, and their modalities differ sharply. Getting the modality wrong is how a
non-SME learns a false constraint.

| # | transition | citation | modality |
| --- | --- | --- | --- |
| T1 | reevaluation of an incomplete-and-ongoing action with substantial changes → "consider whether a higher level of NEPA review is warranted" | **1b.9(r)(2)** | **duty to *consider*.** The only express escalation instruction in part 1b. |
| T2 | uncured extraordinary circumstance → CE cannot be applied per limb (i) → (f)(2)(iv) engages → (iv)(A)/(B) selects EA or EIS | 1b.2(f)(2)(i) → 1b.3(g)(1)(ii) → 1b.2(f)(2)(iv) → 1b.3(f)(2) | **derived.** No single paragraph states it; the chain does. Not a choice. |
| T3 | substantial update to a filed EIS → supplemental EIS under 1b.7 | 1b.9(r)(3) | **duty.** Produces a *second* P4 run on a P4 project. |
| T4 | 1b.4(a) subcomponent, extraordinary circumstance, SAO concurrence | 1b.4(a) | **competence condition**, not a level change. |

**T1 has no row anywhere in the build.** The reevaluation tab
(`pathways.ts:1127-1145`) carries three rows and none of them is it.

**T2's routing row already exists and nothing consumes it** —
`pathways.ts:363-371`, `ref: "1b.3(f)(2)"`, `form: "choice"`. This is the
cheapest correct escalation wiring in the repository.

### §7.5's assertion is uncited and must be demoted

> §7.5 Step 6: "Where the EA supports significance, the level-of-review
> determination is reopened and the project moves to P4."

**No paragraph of 1b.5 or 1b.6 quoted anywhere in this repository supports
this.** 1b.5(a) and 1b.6(c) — the two paragraphs where such a rule would live —
are cited *nowhere* in the register, either amendment, or any source file. The
only textual hook is 1b.6(b)(3)'s negative: a FONSI must conclude that an EIS
"will not be prepared." External retrieval could not settle it (egress is
blocked; see §8.6).

Until someone reads those two paragraphs in the pinned XML, that move renders as
a **permission** under 1b.11(a)(46) — the responsible official's live authority
over "what level of NEPA review is appropriate" — carrying an `unresolved`
region naming 1b.5(a) and 1b.6(c) as unread. **Never as a duty.**

Related, and separately missed by §7: 1b.7(a) has *two* halves. §2's own list is
corrupted at `BACKEND-STATE-AND-1B.md:331` where two bullets fused onto one
line, hiding one. The substantive-issue half has a row (`pathways.ts:882`); the
**significance** half — *"whether an action rises to the level of significant is
a matter of the responsible official's expert judgment"* — has no row on any
pathway. That is the judgement your entire escalation question turns on.

### Answer to "separate pages or an inbox button"

**Neither.** One project page, one proposal, one rail.

- 1b.2(e) chapeau: a subcomponent "will consider only the proposed action or
  project at hand."
- 1b.9(a): one proposal record per proposal.
- 1b.9(r)(2): a supplement attaches to the original and is posted "as a
  **separate version from the original**" — versions of one thing.
- 1b.3(g)(2)(i), 1b.6(b)(1), 1b.8(b)(1): incorporation by reference presupposes
  the earlier document is in the same record.
- `open-document`'s uniqueness is over the **pair** (project, documentType), so
  EA + FONSI + EIS + ROD already coexist on one project *by design*.

A separate-page model needs a `proposal` object type. There isn't one, so
proposal identity would survive only as a convention every adapter, count,
filter and 1b.9(u) lookup must remember. That is discipline-dependence at the
identity layer.

**The inbox reports a level change; it never initiates one.** Worth noting: the
inbox is governed by *no* amendment section — §6 covers the four pages reachable
*from* it, §7 covers the project page. So an escalate-from-inbox control is not
forbidden, it is *ungoverned*; it needs a spec written before an FDE has
anything to build against. Its only surviving specification is the fixture at
`fixtures.ts:182-211`, which renders no pathway and no level at all.

---

## §8.1 Why you cannot verify the pages — three mechanical causes

All three are single, nameable defects. None is a design problem.

**1. `stepsFor()` returns one pathway.** `pathways.ts:1362-1364`:

```ts
return pathway ? [...SHARED_STEPS, ...PATHWAYS[pathway].steps] : SHARED_STEPS;
```

One scalar in, one pathway out. You cannot see two at once, so reviewing all
five means five separate page loads walked tab by tab. This same function is
what would make a P3→P4 move *delete* the EA tab.

**2. Completion is positional, not real.** `project.ts:119-148` derives a step's
mark from its array index relative to whatever `stepId` is in the URL. Standing
on Step 8 marks Steps 0–7 `completed` with full tab counts, from a cold start.
`elementPanel` progress is `switch (i % 5)` on the row's **index**
(`project.ts:254`) — the row reading *"Not ready yet · an earlier answer"* is the
fifth row of any tab, not a row waiting on anything. Nothing is behind any of
it. `TabEntry.done` is never true on screen, so the ✓ at `TabStrip.tsx:71` is
dead code.

**3. An off-pathway tab reports `absent`.** `project.ts:346-359` returns
*"Nothing found for this part of the document"* for a tab not on the current
pathway — pinned by `ProjectScreen.test.tsx`. `absent` is defined as *a query
ran and found nothing*, i.e. a true statement about the world. This is the app
stating a falsehood in the one state reserved for real answers. After an
escalation it would state it about a document row that exists.

Also dead: `pathwayState()`, `pathwayBlocked`, `pathwayAbsent`,
`pathwayUnresolved` (`project.ts:61-91`) are referenced by no screen, no test and
no port member, and `PathwayState` is not in `port.ts`'s export list. The
pathway line was deleted from the band in commit `068d1ce` and the data layer was
left behind. `ProjectScreen.test.tsx:41-46` now actively *forbids* the word
"pathway" on the band — so a non-SME is never told which review they are doing,
which is the minimum viable Levels-framework fix.

---

## §8.2 The tabs — shape is right, depth is not

Measured against this checkout:

```
P0:  3 steps /  8 tabs / 35 rows      distinct tabs (incl. cross-cutting): 40
P1:  5 steps / 11 tabs / 49 rows      distinct rows (incl. cross-cutting): 156
P2:  6 steps / 12 tabs / 55 rows      cross-cutting: 10 tabs / 25 rows
P3:  8 steps / 15 tabs / 62 rows
P4: 10 steps / 18 tabs / 80 rows
```

**Shape: clean.** Every step and every tab §7 names exists, with matching ids and
names. Zero missing, zero extra. All five element counts hold — FANEC 6 / EA 7 /
FONSI 5 / EIS 8 / ROD 8 = 34 — and `pathways.test.ts:29-55` locks them.

**Depth: five distinct defects.**

### (a) 17 rows are unanswerable

Their label is their own citation ordinal. A non-SME cannot answer
*"Notice of intent — content (vii)"*.

| rows | where | what is missing |
| --- | --- | --- |
| 10 | `pathways.ts:742-757` | the ten NOI contents, 1b.7(b)(1)(i)–(x) |
| 3 | `:535-537` | the three EA scope duties, 1b.5(b)(1)–(3) |
| 3 | `:802-804` | the three scoping sub-paragraphs, 1b.7(c)(1)–(3) |
| 1 | `:770` | 1b.7(g)'s unenumerated scope duties, collapsed to one row |

**None of these texts is in this repository.** Neither is the register's §2, which
asserts the counts and names none of the items. Ten of the seventeen open the EIS
pathway.

### (b) Enumerations collapse at three granularities with no rule

| enumeration | rule | rows |
| --- | --- | --- |
| NOI contents | 10 | 10 |
| proposal record categories, 1b.9(a)(1)–(11) | 11 | **1** |
| errata contents, 1b.9(r)(3)(i)(A)–(H) | 8 | **0** |
| EIS cover sub-items, 1b.7(h)(1) | 5 | **0** |
| environmental impacts sub-items, 1b.7(h)(5) | 7 | **0** |
| emergency channels, 1b.9(v)(2)(i)–(v) | 5 | **1** |
| comment action types, 1b.7(f)(2)(i)–(vi) | 6 | **1 select** |

`RowSpec` has no cardinality field, so there is nothing to make the choice
explicit or checkable. A strict expansion of §7 wants roughly 190 rows against
the 156 present.

### (c) `discretionary` is one flag doing three jobs

**20 rows carry it; `DISCRETIONS` lists 12.** `pathways.test.ts:175` asserts only
`length === 12` and proves nothing about the correspondence. Worse,
`project.ts:304-305` drops every flagged row from the submit gate, so four
conditional duties and **one outright mandatory element** are non-blocking:

- **1b.5(c)(2)** — an element of a seven-item "at a minimum" list, flagged
  discretionary at `pathways.ts:599-606` and *pinned as such* by
  `pathways.test.ts:180`.
- 1b.3(f) resource selection (`:355-362`) — 1b.3(e) makes the evaluation
  mandatory; only *which* resources is at sole discretion.
- 1b.5(g)(2) SAO coordination (`:557-563`) — mandatory once an extension is
  sought.
- 1b.9(g) interdisciplinary (`:1090-1096`) — the approach is required; only which
  disciplines is discretionary.

Two permissions on §7.9's list have **no row anywhere**: whether a draft EIS
exists (1b.7(n)(1)) and whether hearings occur (1b.9(k)). A permission with no
row cannot be exercised or recorded.

### (d) Two mis-cited rows, both act-binding targets

- `pathways.ts:919-925` labels *"EPA's Federal Register notice of availability"*
  with `ref: "1b.7(l)"` — the **compelled-publication** paragraph. `acts.ts:1347`
  binds `publish-under-compulsion` to it. Correct citation is 1b.8(e), which
  already has a twin at `:1005-1010`.
- `pathways.ts:643-649` gives *ordinary* EA publication `ref: "1b.5(f)"`, which is
  the compelled-publication rule — so nothing can tell a met deadline from a
  missed one.

### (e) Duplicate and gate defects

Four rows carry a gate, not three: the FANEC signature (1b.3(g)(2)(vi)) is asked
at both `pathways.ts:477` (Step 4) and `:498` (Step 5 Issue).
`pathways.test.ts:58-62` de-duplicates by citation, so the extra row passes.
The certifying statements are likewise asked twice on P3 and twice on P4.

### (f) The gate model disagrees five ways

| source | count |
| --- | --- |
| §7.2 body | 3 |
| §7.2 "Access gates" table | 6 |
| `README.md:243-247` | 6 |
| `acts.ts:748` + `bindings.ts:2272` | 5 (adds approval-to-publish and the determinations) |
| `pathways.ts` (implemented, test-pinned) | 3 |

The code's three is defensible — 1b.5(c)(6) and 1b.7(h)(8) say the certifying
statement needs no signature. But five artifacts stating three different numbers
is a defect an FDE resolves privately and wrongly.

### Obligations with no row at all

Beyond §3's table: 1b.9(n)(2) multiple signature blocks; 1b.9(s) CEQ
confirmation; 1b.2(b)(2)'s eight SAO authorities and 1b.9(o) elevation;
**1b.6(d) FONSI publication to the EA's website** (absent from §7 as well as the
code); 1b.3(i); the 1b.4(d) NRCS-standards duty; the 1b.3(g)(1)(i)–(iii)
FANEC-required test; P4's page count and the 1b.7(i)(2) extraordinary-complexity
determination; 1b.5(g)(1)/1b.7(l)(2) "whether cause exists for a new deadline";
1b.9(e)(7)(ii)'s comment-period inspection duty; **1b.7(a)-significance**.

---

## §8.3 The blocker nobody wrote down: `guidance/` does not travel

`MANIFEST.md`:

> `guidance/` — the backend register and the two amendments. They govern this
> build and are **not part of the packet**: they are not uploaded to Foundry and
> nothing that ships depends on reading one.

**The FDE never reads §2 or §7.** Every decision recorded only in an amendment is
invisible to its intended audience. The only channels that reach them are:

```
README.md                            hand-written
HOST-CONTRACT.md                     generated from src/ui/host-requirements.json
src/ui/data/PORT-ADDITIONS.generated.md   generated from bindings.ts + acts.ts
the screens themselves
```

Both generated files open with *"Do not edit this file"* and are produced by
`npm run port:additions`. So **a fix that is not written into `host-requirements.json`,
`bindings.ts`, `acts.ts` or `README.md` does not exist for the FDE.**

And the generated handoff currently tells them the opposite of what we are about
to build. `PORT-ADDITIONS.generated.md:697`, from `bindings.ts:557`:

> §7.8 records that a reopened level-of-review determination **REPLACES** the
> step set

`:719` also describes a rail of three segments where "§7.7's ten items … each is
a step of its own" — the code renders one rail entry with ten tabs at a single
step segment `x`. **The document an FDE reads first is wrong in both
directions, today, before any escalation work.**

---

## §8.4 Recommendation

### The shape: one page, an accumulating rail, computed client-side

Replace the scalar `pathway` with an append-only ordered ledger of
level-of-review **episodes**. The rail is `SHARED ++ concat(episodes)`. A
superseded episode's steps stay in the rail, readable and read-only. Escalation
appends a band; it never replaces a step set.

The four-level shape you want is preserved exactly: the escalation affordance is
a **row**, in a **tab**, in a **step**, in a **pathway band**.

**The structural point that decides this design.** Rail monotonicity must *not*
be a property of what the adapter returns. `readonly` forbids mutation, not a
shorter array — a live `useLevelHistory` written against `bindings.ts:565`'s
blanket uniqueness returns one episode and silently reproduces today's
vanishing-EA defect, undetectable from the client. So:

> **Compute the rail from `pathways.ts` over the set of levels the project has
> occupied, and render every unoccupied level's steps in a `blocked` state.**
> A wrong or partial backend response can then mislabel a level but cannot
> delete a step.

Liveness is **derived**, not stored: the live level is the unique determination
with `supersededAt === null`. Two live levels are unrepresentable for want of a
field.

### Four level states, in plain copy

| state | what a non-SME reads |
| --- | --- |
| `live` | the level this project is on now |
| `superseded` | "Superseded — this work stays part of the record" |
| `foreclosed` | "Not this project — a categorical exclusion applies (1b.2(f)(2)(i))", with a link back to the answer that closed it |
| `notReached` | "Waiting on the level-of-review determination at Step 2" |

`foreclosed` is what states an ordered elimination *as* an elimination, rather
than by silently omitting steps. **Foreclosed levels collapse to one line and
offer no action** — they must not read as a menu to a user whose defining
property is that they do not choose.

### Escalation is staged as an offer, not a form

The reopen affordance sits on the surface where the rule discovers the fact
(the FONSI tab for T1/§7.5; the reevaluation tab for T1/T3; the
extraordinary-circumstance tab for T2). Taking it renders an **offer card**:

1. one plain sentence — *"This review would move from an environmental
   assessment to an environmental impact statement"*;
2. the modality in user words — *"the rule permits this; it does not require
   it"* vs *"the rule requires you to consider this"*;
3. a **carry-over manifest**: what moves, what stays, where each lands, each line
   with its citation (the published EA → cross-cutting *Reliance on existing
   documents*, 1b.9(e)(8) with its three (vi)(A)–(C) disclosures; the EA's
   identification number stays with the EA, 1b.5(c)(7));
4. accept and decline at **equal visual weight** — a permission is never a
   one-way door.

Citations sit *below* the plain sentence. This is the highest-stakes moment in
the app and it must not open as seven expert-facing rows.

### Modality replaces `discretionary`

```ts
modality: "duty" | "duty-to-consider" | "derived" | "permission" | "outbound-request"
```

Required on all 156 rows, so an omission is a **compile error**. `discretionary`
is derived (`modality === "permission"`). Only `permission` and
`outbound-request` leave the submit gate. `direction` on a transition is a closed
union with **no `"lower"` member**, so de-escalation is unauthorable — matching
the rule's asymmetry, with copy saying this is *silence*, not prohibition.

### `options` required, with a structurally distinct `open` kind

Fourteen `select` rows name no option source. Four sets are stated verbatim in
the register; 1b.3(f)(1)'s eight resource classes are expressly *"may include,
but are not limited to"* and **must** be `kind: "open"` so nobody can ship them
as a closed enum by forgetting.

### `rid` — the anchor that makes your feedback loop work

```
rid = <pathway|shared|cross>/<stepId>/<tabId>/<ref>#<ordinal-within-tab>
```

**The ordinal is not optional.** Refs repeat inside a single tab in 12 places
today — `implementation-clearance` has four rows all `1b.3(j)`,
`subcomponent-exclusion` three all `1b.4(a)`, `incorporation` three all
`1b.9(e)(7)`, `programmatic` three all `1b.9(q)`. A ref-keyed anchor collides on
day one.

One function computes it. It is the DOM id, the comment anchor, the review-page
key **and** the natural join key for per-row backend state — so it costs nothing
to carry. Rendered as a monospace chip on **every row on the ordinary project
page**, not only on the review page, or a comment on a normal screen resolves to
nothing.

### Step keys must be re-keyed

Five step ids collide across pathways:

```
id "3" = P1/P2 Category & EC | P3 Scope, clock | P4 Notice of intent
id "4" = P1/P2 Disposition   | P3 Assembly     | P4 Scope, clock, scoping
id "5" = P2 Issue            | P3 Publication  | P4 Assembly
id "6" = P3 Finding          | P4 Comments
id "7" = P3 Notification     | P4 Publication and filing
```

`/steps/4/scope` means nothing without a knob today, and would silently retarget
after an escalation. Key as `E<seq>.<PathwayId>.<localId>`, accept a bare id
resolved against the live episode, and canonicalise by redirect so every
existing URL keeps working.

---

## §8.5 The plan

**Phase order is chosen so the review artifact exists before the escalation work
lands** — you review the audit, not the rewrite.

### Phase 0 — Truth, before anything moves (no behaviour change)

1. **Get the pinned XML into this repo.** `title-7-part-1b.2026-08-11.xml`,
   222,131 B, sha256 `a8097af3…fea6db20`. Everything in §8.2(a) and half of §8.2(b)
   is blocked on text that lives in the other repository. **This is the single
   highest-value action available and it is a copy.**
2. **Read 1b.5(a) and 1b.6(c) first.** They settle §7.5 and cost one paragraph
   each.
3. Correct the two mis-citations (`:919-925` → 1b.8(e); `:643-649` → the ordinary
   publication paragraph, currently unidentified).
4. Rewrite `bindings.ts:557` (replaces → accumulates) and `:719` (rail shape),
   run `npm run port:additions`, commit both. Amend §7.8 to match rather than
   diverge from it.
5. Reconcile the five-way gate disagreement in one place.

### Phase 1 — The audit instrument and the review artifact

6. `RowSpec` gains **required** `modality`, `options`, `text: "verbatim" |
   "restated" | "placeholder"`, and `rid`. Required = compile error on omission
   across all 156 rows.
7. `coverage()` — a **pure function** over `SHARED_STEPS + PATHWAYS +
   CROSS_CUTTING + DOCUMENT_AUTHORITY + DISCRETIONS`. Zero port members. Cannot
   be broken by a half-wired backend. Emits per (level, step, tab): row count,
   refs, forms, modality mix, gates, placeholders, collapsed enumerations,
   optionless selects.
8. **`scripts/walk.mjs`** — emits **one self-contained HTML file** of the walk:
   every level, every step, every tab, every row, `rid` on each. CSS inlined,
   system-font stack, no external requests.
   *This is a hard constraint, not a nicety:* `App.tsx:2-8` imports seven
   `@fontsource` stylesheets and `theme.css` pulls `normalize.css` and
   `blueprint.css`, so a build emits a hashed multi-asset `dist/` that **cannot
   be published as an artifact** — which is exactly why the previous preview was
   excluded (`MANIFEST.md:59`). Load `pathways.ts` through Vite the way
   `scripts/port-additions.mjs:11-14` already does; ESLint forbids importing it
   as a plain node module.
9. **A `reviews/` ledger keyed by `rid`.** One line per comment: `rid`, verbatim
   comment, disposition (`fixed` / `declined-with-reason` / `owner:sme`), commit.
   Five rounds of preview comments currently exist only as commit prose — nothing
   lets a reader ask *"what did comment 7 of round 3 say and what changed."*
10. **Baseline ratchet with an `owner` field** (`spec` / `code` / `sme` /
    `regulation`). A new gap fails CI; a *fixed* gap fails CI until its entry is
    deleted. `owner: "regulation"` is the honest home for the 17 placeholders and
    the unenumerated deadline triggers — an SME worklist, not a pretence of
    compliance. **Un-baselinable invariants** (or the ratchet becomes wallpaper):
    the 34 element counts, the three gate citations, `rid` uniqueness, step-id
    uniqueness, `findTab` reachability, every transition carrying a citation, the
    `CE_SCREEN_STEP` identity assertion, and the rail-union property.

> **→ You review the artifact here.** Comments land against `rid`s.

### Phase 2 — Honesty fixes (no new port members)

11. Off-pathway tab: `absent` → `blocked`, naming the level not reached.
12. Split `discretionary` into `modality`; correct the five mis-flags; add rows
    for 1b.7(n)(1) and 1b.9(k).
13. `restates?: rid` for the FANEC signature (asked twice) and the certifying
    statements (asked four times) — ask once, echo elsewhere. A non-SME asked the
    same question twice assumes they got it wrong the first time.
14. Add the missing rows from §8.2's tail. Priority: **1b.7(a)-significance**,
    1b.9(r)(2), 1b.6(d), 1b.3(g)(1)(i)–(iii), P4 page count + 1b.7(i)(2).
15. **Give P0 a terminal step.** `PATHWAYS.P0.steps` is `[]`, so a project that
    ends at 1b.2(e) can never be closed, marked finished or archived from its own
    page. One step, one tab, two *discretionary* rows (the ground that answered;
    whether the justification is recorded — 1b.2(e) makes it advisable).

### Phase 3 — The level ledger

16. `types.ts`: `LevelEpisode` / `LevelHistory`; `StepMark` gains `superseded`
    and `blocked`; `StepEntry` gains `band`, `key`, `localN`, `waitingOn`;
    `TabEntry` gains `outstanding`, `placeholders`.
17. `railFor(history)`; `stepsFor` kept as a one-episode adapter so
    `pathways.test.ts:84-94` survives.
18. `REOPEN_STEP` reusing `SHARED_STEPS[2]`'s two tabs **by object identity** —
    the `CE_SCREEN_STEP` precedent (`pathways.ts:314`, used at `:401` and `:437`,
    pinned by `pathways.test.ts:100-102`). Limb-sequence drift between a first
    determination and a reopening becomes *impossible*, not merely unlikely.
19. `TRANSITIONS` table: T1–T4, each with citations, modality, direction,
    what-carries / what-does-not, and a decline. A test asserts every entry
    carries a citation, so the inventory is provably complete and no fifth
    transition can arrive as help-string prose.
20. Rebuild the reevaluation tab: the 1b.9(r) predicate; (r)(2)'s four duties
    including stop-work cross-linked to its 1b.9(v) exception; the eight errata
    contents.
21. Band rail with collapse; band footer document ledger; level line restored to
    the project band (**reverses `068d1ce`; `ProjectScreen.test.tsx:41-46`
    changes deliberately**).
22. Port: `useLevelHistory`, `useCrossCutting`, `useGate(documentType)`, and an
    `ActPort` write seam with `composeActs`. Every button on the project page is
    currently inert — `onAction` is threaded only at `InboxScreen.tsx:38` and
    submit is a local `useState` at `ElementScreen.tsx:27`.
23. `scope: "proposal" | "review"` on `StepSpec`/`TabSpec`, so "do I redo intake
    after an escalation?" is answered structurally (no), and the reevaluation tab
    can name *which* published document it is about.

---

## §8.6 Four decisions I need from you

**D1 — Union or replacement?** §7.8 and the generated FDE handoff both say a
reopened determination **replaces** the step set. This plan says it
**accumulates**. Both readings are defensible; only accumulation keeps a
published EA visible after an escalation, and only accumulation can express
1b.9(r)(3)'s second P4 run. *Recommend: accumulate, and amend §7.8 in the same
commit.*

**D2 — "Levels" means two different things in this repo.** §6.2 assigns
Levels 0–4 to *pages* as an automation-maturity scale (Reference = Levels 0/1,
Learning = 3, Expert Q = 4) and §7.8 uses "Level 2 → Level 4". 1b.2(f)(2) uses
"level of NEPA review" for something entirely unrelated. **No document in the
repository defines the first sense.** Your requirement — "the Levels framework
must drive a non-SME to the correct level of review" — is ambiguous between them,
and the answer changes what Phase 1 measures. *I need the definition.*

**D3 — Which pathway is finished first?** §4 of the register already puts this to
you and notes the corpus can supply sufficiency evidence for none of them under
the current rule, so it cannot be chosen on evidence. P2 (FANEC) is the
highest-volume pathway and the only one with no export obligation at all —
cheapest to ship, or the one where the app adds least. P4 carries four of the six
obligations with no ontology representation.

**D4 — Where does `record-consistency-finding` go?** The one act with no surface.
Both candidate homes break a pinned test: an eleventh cross-cutting tab breaks
`pathways.test.ts:163`; a per-document tab breaks `:38-40`. It may also be one of
the three unnamed members of `determination.whichDetermination`, which the FDE
must read off Ontology Manager. *Recommend: park it as an explicit §8 open item
rather than guess.*

---

## §8.7 What could not be verified, and what would close it

**No byte of 7 CFR part 1b was read.** The pinned XML is in the backend
repository; every outbound host tested (ecfr.gov, federalregister.gov,
govinfo.gov, law.cornell.edu, usda.gov) is refused by the egress proxy for both
`curl` and `WebFetch`. WebSearch returns a summariser's paraphrase, never
attestable text. **Every regulation claim in this document rests on the
register's §2/§5 restatement.** Closed by copying one file.

Corroborated bibliographically only: the 2026-04-03 final rule at 91 FR 17092
(FR doc 2026-06537) exists and adopts the 2025-07-03 interim rule; the
2026-07-02 amendment at 91 FR 40353 (FR doc 2026-13372) exists and is a
**correcting amendment that fixed an incorrect cross-reference** — which may mean
one or more of the four dangling citations the app publishes at
`support.ts:505-510` is now stale. Unverified.

Open, in priority order:

1. **1b.5(a) and 1b.6(c)** — cited nowhere in this repository, and exactly where
   an EA→EIS rule would live. Settles §8.0's central question.
2. **The three "sooner of" deadline triggers** at 1b.5(e) and at 1b.7(k) — named
   *nowhere*: not in §2, not in §7, not in the code. Both `Deadline` tabs and
   Step 0's `Timing` tab carry a single trigger row that cannot hold three
   candidate dates.
3. **The 17 placeholder texts** — ten NOI contents, three EA scope duties, three
   scoping sub-paragraphs, 1b.7(g)'s duties. Plus the EIS cover's five and
   impacts' seven sub-items and the errata's eight.
4. **1b.4(a)'s subcomponents.** The register's own sentence names *eight*
   services plus "eleven listed general offices" and calls it *nine*. Do not build
   the selector until the list is read off the XML — a nine-item select that
   silently collapses eleven offices is the near-miss that ships and is never
   found again.
5. **Whether a supplemental EIS carries a second ROD.** 1b.8(a) suggests yes; the
   rule as restated does not say so. Not asserted here.
6. **1b.9(q)'s five-year programmatic lapse and 1b.3(d) CE removal** — two
   reopening sources in no inventory. §3 verdicts programmatic **partial** (the
   type and the `document.programmatic` link exist), so the clock is closer to
   buildable than the rest.
7. **1b.1** — cited zero times anywhere in `src/`. Nobody asked why.

---

## §8.8 Migration cost — tests that must change deliberately

241 tests pass now. This plan breaks these on purpose:

| test | why |
| --- | --- |
| `ProjectScreen.test.tsx:41-46` | forbids "pathway" on the band; the level line reverses `068d1ce` |
| `ProjectScreen.test.tsx:48-55` | `/steps/5/eis?pathway=P4` — broken by episode-qualified keys |
| `pathways.test.ts:180` | pins 1b.5(c)(2) as discretionary; it is a mandatory element |
| `pathways.test.ts:175` | `DISCRETIONS.length === 12` against 20 flagged rows |
| `pathways.test.ts:163` | `CROSS_CUTTING.length === 10` — only if D4 places an eleventh tab |
| `port.contract.test.tsx:19-41` | hand-enumerates fifteen members; calls `useGate()` with no argument |

Two further edit-forcing items no design named: `PORT-ADDITIONS.generated.md`
lives **inside** `src/ui/` and is asserted by `port.bindings.test.ts:67-68` and
`App.test.tsx:365-377`, so **every new port member needs `bindings.ts` edited and
`npm run port:additions` run in the same commit**; and `README.md:97` repeats
"fifteen". Both are closable now and expensive after integration — which is the
exact class of change the handoff goal exists to avoid.

New screens: must ship a `*.module.css` (`host-contract.test.ts:104` allows only
`theme.css`, `@fontsource/*` and CSS modules) and cannot import outside `@/ui`
(`eslint.config.js:93-114`).

**Fixtures cannot demonstrate any of this yet.** All five inbox rows render
identical marker text (`fixtures.ts:182-211`) and the knobs are global query
parameters, not per project (`fixturePort.ts:76-88`) — so a Level column, a
superseded band or a chain badge has nothing distinguishable to render against.
Give the fixture rows distinguishing suffixes, or state plainly that the demo is
single-project.
