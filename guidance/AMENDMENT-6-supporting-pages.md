# §6 — Supporting pages and Levels attachment

*Amendment to "Backend state and part 1b requirements", register of 2026-09-04.
Section numbering continues that document. Every count cited here is that
document's; nothing new was measured.*

This section covers the four pages reachable from the left pane of the inbox. It
does not cover the project page, which is §7.

**Contents are specified; layout is not.** Where this section says a page must
carry a field, that is a requirement. Where it suggests an arrangement, that is a
suggestion and the builder decides. Follow the design rules already visible in the
built screens — the four region states, expandable rows, monospace provenance
lines, and the rule that nothing but a button looks like a button.

**Packet rule.** The interface repository and this register are the only inputs.
No other reference document travels. Earlier design artifacts describe an
interface that was deleted and will guide a build in the wrong direction.

---

## §6.1 Rules that bind all four pages

1. **Every list surface renders the four region states plus in-flight** — never
   just empty-or-list. Nearly every read on these pages returns *absent*, and
   *absent* must not look like *blocked*, *unresolved* or a failed load.
2. **Empty is the expected state at build time** and should read as designed.
3. **A corpus artifact never appears without its rule vintage.**
4. **Assets are bundled, never fetched.** External loads are refused.

---

## §6.2 The four pages, and the Levels they carry

| page | Levels | one line |
| --- | --- | --- |
| **Archive** | 1 | recently-deleted projects, restore or purge |
| **Expert Q** | **4** | the system recognises an expert is needed, drafts the request, a human sends it |
| **Learning** | **3** | what the system proposed, what was accepted, and whether it is calibrated |
| **Reference** | 0, 1 | the corpus, the pinned regulation, the CE catalogue — organised, searchable, viewable |

Levels 3 and 4 are carried by Expert Q and Learning. In both cases the
justification is regulatory rather than technical — neither is automation added to
reach a level.

Two further Level 4 candidates sit on the project page and are recorded here only
so they are not lost to §7: the statutory deadline computed from soonest-of-three
triggers (1b.5(e), 1b.7(k)) with its compelled publication at expiry (1b.5(f),
1b.7(l)); and page count against the EA and EIS limits with the 1b.5(c)(6)
certifying statement. Both have properties that exist and are null with nothing
computing them.

---

## §6.3 Archive

The inbox's recently-deleted tab, in a page.

**Contents.** Same row component and same fields as the inbox — nothing new is
displayed. Add: when it was archived, and by whom if that becomes recordable.
Two row actions, restore and permanently delete, with the second confirmed.
Ordering by archived-date descending.

**Suggested layout.** The inbox list, one header line explaining what the page
holds, and the two actions on the row rather than in a menu.

**Port additions AI FDE must answer.** §1 lists 17 acts and none of them deletes
or restores; §3 records no `deleted` or `archivedAt` property on `project`. Archive
therefore has no backend address at all. Needed: an archived state on `project`, an
archive act, a restore act, and a purge act. Until they exist the page is built
against the port shape and renders empty.

**One note.** The two existing `project` rows are both synthetic — one labelled
"C5 write-path tracer — safe to delete", one named "lk" with every other field
null. §4 asks whether they should be removed. Anything that counts projects counts
them, Archive included.

---

## §6.4 Expert Q — Level 4

A queue, and it behaves like one. This is where a specialist supplies input, a
report or an onsite visit that the review cannot be completed without. Expert
identities are notional for this build; nothing is transmitted.

**Layout.** An object table of queue items, one row per open request. Columns:
expert, discipline or field, project, what is awaited, sent date, expected return,
status. Sortable and filterable, defaulting to overdue first. Selecting a row opens
a compose overlay above the queue; closing it returns to the table.

**The overlay.** A drafted request assembled from the project and the finding that
triggered it — project and its unique identification number, the trigger, the
artifact awaited, the expected return date, the regulatory basis, the proposed
recipient. Body fully editable and copy-pasteable. Sending performs
`signature-ready-package-expert-request`.

**The Level 4 hook.** `signature-ready-state-factor-finding` closes at
`clear / present / undetermined`. *Present* or *undetermined* is the condition that
needs a discipline. On that finding, draft the request and hold it pending in the
queue. Automate the recognition; the officer sends.

**Scope.** All pathways. EA and EIS carry substantially more specialist
involvement than the CE pathway.

**The return leg belongs here.** `record-artifact-arrival` then `accept-artifact`,
which writes `gapsFound` and closes the engagement. `gapsFound` is visible on the
row, not buried.

**Limits to render rather than hide.** Neither expert act writes an actor, so the
queue cannot show who sent a request. Nothing joins a holder to a slot, so a
recipient is a suggestion the officer confirms, never a routing the system made.
Both acts key on a `slot`, and nothing creates one — the queue is built and empty
until that changes.

---

## §6.5 Learning — Level 3

A dashboard. What the system proposed, what a human did with it, and whether the
system is calibrated.

**Tiles, highest leverage first.**

1. **Grounding honesty.** 0 live-model, 0 cassette, 103 template-substitution
   claims — §0's count from GROUNDING-CONTRACT.md, unchanged because no model call
   has happened and none can: the only configured provider host is an RFC-2606
   `.invalid` domain and `LiveHTTPTransport.invoke` raises even with a credential
   set. Display the real number. A dashboard showing an honest zero is a stronger
   artifact than one showing a fabricated adoption rate, and the evaluation
   criteria reward exactly that.
2. **Mechanism status.** §1's finding, which nothing else surfaces: the five
   object-dataset materializations — adoption, assignment, determination,
   engagement, receivedArtifact — all hold zero rows, so no transform can read an
   act-written row, and `ratification` can never populate. Level 3 has its shape
   and not its mechanism. One banner, stated plainly.
3. **Adoption diff.** `signature-ready-adopt` writes `adoptedValue` and
   `adoptionState` (closed 3) with `actorPrincipal` from `current_user_id`. Rate by
   state, and what changed between proposal and adopted value. §1 records the
   latent defect: `adoptedValue` must be present unless the state is rejected, that
   is a conditional over another parameter's nullity, it is not expressible without
   a Function, and an *adopted* with no value can be recorded today. Surface those
   if they appear rather than filtering them out.
4. **Disposition mix against its pin.** `disposition_mix.pin.json` holds the
   expectation; intent-predicate clause 2 turns on the comparison. This is
   calibration proper — is the retrieved/drafted/specialist split behaving as
   pinned.
5. **Verifier verdicts.** Pass and fail counts from
   `signature-ready-stamp-verifier-verdict`. Carry two warnings from §1: the
   default is still `pass` and can only be cleared by hand in Ontology Manager, and
   since the act widened to accept `fail` on 2026-09-01, clause 3's pass-only
   requirement is held by nothing.
6. **Unresolved, app-wide.** §1 defines *unresolved* as always a defect in this
   build. A defect state with no aggregate view is a defect nobody reads. Count and
   list, grouped by lane. Note the correct case that will appear immediately:
   `determinationEvidence` has a declared evidence set for two of the five
   determinations and none for the other three, so those three report that nothing
   was asked rather than that nothing was found — that is the distinction working,
   not a failure.
7. **Regulation drift.** `check.regulationDrift`, one row, `noDriftDetected` true,
   witness at eCFR issue date 2026-08-25 byte-identical to the 2026-08-11 pin. §2
   notes the pin reaches 2026-08-25 against a stated currency of 2026-09-01 —
   seven days unverified. §1 calls this the one thing in the build that would ever
   want to run on a schedule.
8. **Corpus shortfalls.** `corpus.manifestStatus`, 6 rows, per-corpus shortfalls
   and not-retrieved notes verbatim from the assembler.

**Suggested layout.** Tiles 1 and 2 across the top as status, the rest as a grid,
each drilling into a list. No sparklines over series that do not exist.

**Not built here.** 1b.3(h) reliance on a prior CE determination is a genuine
regulation-backed learning loop — §3 records `precedent` and `prior_coverage` in
the spec, 51 artifacts in the prior-coverage corpus, and no object type recording a
reliance. Named so it is visible as a future tile, not built now.

---

## §6.6 Reference — Levels 0 and 1

A file organiser with a document viewer. The only page in the application with real
data in it.

**What it holds.** 312 corpus artifacts across seven media sets — 283 practice, 4
regulation, 25 undeclared — plus the pinned copy of 7 CFR part 1b and, when
`category` is populated, the 87-row CE catalogue.

**Organisation and facets.** Corpus is the primary grouping. Facets: document type
(FANEC 4, DM 32, EA 29, FONSI 34, EIS 51, ROD 47), class, rule vintage,
extractability, citable. Free-text search over titles and metadata — note that
there is no body text to search: `corpus.text` holds 17 rows and every one is a
manifest, a regulation XML, a drift witness, a forest-plan JSON or a cover note.
Zero PDF body text exists in any dataset.

**Row fields.** Title, corpus, document type, **rule vintage always**, citable,
extractability, sha256, byte length.

Two fields are not ordinary facets:

- **`citable` has three values.** 25 rows carry `classDeclared=false` and a NULL
  `citable`, and §1 records that the null is being asked to carry a refusal — a
  null meaning *not declared* and a null meaning *not applicable* are the same
  null. Render not-declared distinctly from not-citable. C11 gave `classDeclared`
  this treatment; `citable` did not get it.
- **Two rows declare themselves current when they are not.** `reg-36cfr220`, two
  rows, `authorityClass=regulation`, `citable=true`,
  `supersededButClassedCurrent=true`. 36 CFR 220 was superseded on 2025-07-03 and
  111 corpus artifacts are written under it. Currently a WARN. Show the warning on
  every affected row.

**Rescinded material.** The 26 FSH 1909.15 chapters were rescinded in their
entirety by WO Amendment 1909.15-2026-1 effective 2026-03-26. Marked rescinded,
never citable, and browsable — superseded practice is still evidence about
practice.

**The viewer.** PDF, and the addressable unit is a page range rather than a
document. §5's finding is the reason: one corpus FONSI occupies pages 31–34 of a
155-page file, so sufficiency lives at a page range and treating the document as
the unit teaches the wrong length. The viewer should open at a cited page.

Three viewer caveats from §5, surfaced on the artifact rather than in
documentation: 14 artifacts are image-only, one of them legitimately so because it
is a map; 2 are truncated at source and will not open; and the 253 born-digital
verdicts rest on marker *absence*, with only 2 documents firing a marker at all, so
a scanned document whose producer string is not in the conservative list reads as
born-digital. `minCharsOnAPage` is recorded on every row and deliberately not wired
into the classifier — expose it as a field so the suspicion is investigable.

**The extraction hazard, worth one line on the page.** §5 records that on the 1990
Umatilla ROD the cover reads "Forest Service" in the page image and "Forest %Nice"
in the text layer, on all three extractors, with no error and no signal. Text
extracted from these PDFs can be wrong while announcing nothing. Anything the
viewer offers as selectable text carries that caveat.

**Integrity strip.** One line, not a page: 287 of 287 declared artifacts match on
digest and length in both directions; 11 forest-plan sources pinned; regulation pin
green; drift clean.

**The regulation.** The pinned part 1b, browsable by section, with the per-section
amendment dates from §2 — 1b.9 amended 2026-07-02, everything else 2026-04-03,
1b.12 alone still carrying interim-rule text from 2025-07-03. Also carry the four
places §2 found where the current text cites a paragraph that does not exist. Those
are not build defects and must not be silently repaired; a resolver that quietly
fixes them hides a finding.

**The CE catalogue.** `category` holds zero rows; the 87 rows sit in
`ce_categories.json`, which §3 names as the single cheapest high-value population
in the build with five obligations blocked behind it. Reference is where it lands.
Until then the section renders empty and says why. When populated: citation,
verbatim description, and the 39 / 48 split between 1b.4(c) categories requiring no
documentation and 1b.4(d) categories requiring a FANEC.

**Port additions AI FDE must answer.**

- **Media access for the viewer.** The PDFs live in media sets. Whether an OSDK
  front end can read those bytes, and by what route, is not answerable from the
  interface side. If the route does not exist, the viewer is a slot that lights up
  later and the artifact card carries metadata, digest and page-range citation
  meanwhile.
- **Add and delete have no path.** §1 records that nothing syncs, that the build
  account is Viewer-only and permanently so, and that ingest is out-of-band upload
  to a media set plus digest verification in a build — proven over 287 artifacts.
  No act adds or removes a corpus artifact. The honest question for AI FDE is
  whether *add* means upload or means recording an intent to add; the page should
  be built for whichever answer comes back and should not fake the other.

---

## §6.7 Port additions, consolidated

Everything the four pages need that §1 and §3 record as absent:

| for | needed |
| --- | --- |
| Archive | archived state on `project`; archive, restore and purge acts |
| Expert Q | actor on `identify-expert-requirement`, `package-expert-request` and `state-factor-finding`; a holder-to-slot join (B.5.12); a record that an interdisciplinary review occurred |
| Expert Q | anything that creates a `slot` row — eleven of seventeen acts wait on this |
| Learning | the five object-dataset materializations, without which no transform reads an act-written row |
| Learning | the submission-time Function, which holds eight named preconditions including two intent-predicate clauses |
| Reference | media-set read route for the viewer; a decision on what *add* means |
| Reference | `category` populated from `ce_categories.json` — 87 rows already in the repository |

None of these blocks building the pages. All of them block the pages holding
anything.
