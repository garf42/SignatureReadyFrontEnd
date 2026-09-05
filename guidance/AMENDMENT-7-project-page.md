# §7 — Project page: pathways, steps, tabs, elements

*Amendment to "Backend state and part 1b requirements", register of 2026-09-04.
All citations are to that document's §2 and §3.*

Contents are specified. Layout is not. Sections within a tab use the expandable-row
template; work runs top to bottom within a tab.

---

## §7.1 Structure

| level | is |
| --- | --- |
| step | a phase ending in a determination or a document |
| tab | a unit within the phase |
| row | one enumerated element or required item |

Steps 0–2 are shared by every project. Steps 3 and beyond are pathway-specific and
do not exist until the pathway is determined at Step 2. Before then the left pane
carries no pathway steps and names none.

Every tab carries something the officer does — an input, a decision, a request, an
acceptance, or an issuance. No tab exists to inform. Where the regulation requires
that something be known but not done, it appears as a row inside an acting tab
rather than as a tab of its own.

The initiation overlay and Step 0 are different things and are not merged. The
overlay is built and unchanged: four administrative fields, submitted to create the
project and open the project page, displayed thereafter in the project band and
editable there. Step 0 is a step in the step list like any other, and carries the
detail the review itself needs.

---

## §7.2 Pathways

| id | reached when | terminal output |
| --- | --- | --- |
| P0 | 1b.2(e) — NEPA does not apply | none; record keeping advisable only |
| P1 | CE applies, category at 1b.4(c) | none; implementation clearance under 1b.3(j) |
| P2 | CE applies, category at 1b.4(d) | FANEC |
| P3 | 1b.2(f)(2)(iv)(A) — impacts not likely significant, or unknown | EA, then FONSI |
| P4 | 1b.2(f)(2)(iv)(B) — impacts likely significant | EIS, then ROD |

P1 and P2 share Steps 3–4 and diverge on which 1b.4 list the category came from.
That fork is decided by catalogue data, not by the officer.

1b.2(f)(2)(iii) — establishing or revising a categorical exclusion — is rulemaking
and out of scope. It is recorded as considered and not pursued.

### Drafting authority, credentials and preconditions

All five documents are built and creatable. What differs is who may prepare one and
who must sign it, and that difference lands as an access gate rather than an
omission. The primary user of this application is not the responsible official, but
the responsible official may use it.

| document | preparation open to | issued by | cannot begin until |
| --- | --- | --- | --- |
| FANEC | the subcomponent, or an applicant or third party under supervision — 1b.10(b) | responsible official signs — 1b.3(g)(2)(vi) | all three of 1b.3(g)(1)(i)–(iii) hold, and the interdisciplinary review 1b.3(g)(2)(v) must assert has occurred |
| EA | the subcomponent, or an applicant or third party under supervision — 1b.10(a) | no signature; approval to publish indicates concurrence — 1b.5(c)(6) | level of review resolves to 1b.2(f)(2)(iv)(A) |
| FONSI | the subcomponent only; 1b.10 does not extend to it | responsible official signs — 1b.6(b)(5) | the environmental assessment exists — 1b.6(a) |
| EIS | the subcomponent, or an applicant or third party under supervision — 1b.10(a) | no signature — 1b.7(h)(8) | level of review resolves to 1b.2(f)(2)(iv)(B) |
| ROD | the subcomponent only; 1b.10 does not extend to it | responsible official signs — 1b.8(b)(8) | the environmental impact statement is complete — 1b.8(a) |

**The build is walkable end to end as a regular user.** Every step, tab and row is
reachable and workable without agency credentials. Three surfaces are gated and no
others.

| gated surface | citation |
| --- | --- |
| FANEC signature | 1b.3(g)(2)(vi) |
| FONSI signature | 1b.6(b)(5) |
| ROD signature | 1b.8(b)(8) |

The EA and EIS carry no gate at any point. 1b.5(c)(6) and 1b.7(h)(8) state that the
certifying statement requires no signature and that approval to publish indicates
the responsible official's concurrence.

Drafting is never gated, the FONSI and ROD included. 1b.10 governs who may prepare
documentation, not who may use this application; it is recorded in the table above
and closes no surface.

Senior Agency Official concurrences at 1b.4(a), 1b.7(i)(2) and 1b.5(g)(2) are
outbound requests rather than gates. A regular user records and sends them.

**What a gated signature row does.** It is visible and in place. The action
available to a user without the credential is to route it — record that the
document is ready for signature and send the referral. Never a dead end, never
silently empty.

**Backend shape.** `responsibleOfficial` and `delegation` exist and hold no rows,
and no platform predicate marks a user's role. Four acts record their actor from
`current_user_id`, which §1 records as decidable against Multipass. The gate is
built against that shape. The interface does not assert an authorisation it cannot
check.

All environmental documents are prepared using an interdisciplinary approach —
1b.9(g). Which disciplines prepare is at the responsible official's sole discretion.

Where an applicant or third party prepares any of the three open to them: the
subcomponent remains responsible for accuracy, scope and content; independently
evaluates the submission and takes responsibility for its contents — 1b.10(a)(4);
receives the disclosure statement of financial or other interest — 1b.10(a)(5); and
maintains a schedule, with major changes documented in writing — 1b.10(a)(7).

--- | --- | --- | --- |
| FANEC | an applicant or third party under supervision — 1b.10(b) | signature of the responsible official — 1b.3(g)(2)(vi) | all three of 1b.3(g)(1)(i)–(iii) hold, and the interdisciplinary review that 1b.3(g)(2)(v) must assert has occurred |
| EA | an applicant or third party under supervision — 1b.10(a) | approval to publish; no signature — 1b.5(c)(6) | level of review resolves to 1b.2(f)(2)(iv)(A) |
| FONSI | not delegable | signature of the responsible official — 1b.6(b)(5) | the environmental assessment exists — 1b.6(a) |
| EIS | an applicant or third party under supervision — 1b.10(a) | approval to publish; no signature — 1b.7(h)(8) | level of review resolves to 1b.2(f)(2)(iv)(B) |
| ROD | not delegable | signature of the responsible official — 1b.8(b)(8) | the environmental impact statement is complete — 1b.8(a) |

1b.10 extends to the FANEC, the EA and the EIS and does not name the FONSI or the
ROD. Both are decision documents; preparation of either is not delegable outside
the subcomponent.

All environmental documents are prepared using an interdisciplinary approach —
1b.9(g). Which disciplines prepare is at the responsible official's sole discretion.

Where preparation is delegated: the subcomponent remains responsible for accuracy,
scope and content; independently evaluates the submission and takes responsibility
for its contents — 1b.10(a)(4); receives the disclosure statement of financial or
other interest — 1b.10(a)(5); and maintains a schedule, with major changes
documented in writing — 1b.10(a)(7).

### Access gates

Some surfaces are reserved by the regulation to a named holder. A user without that
credential reaches the surface and reads it; the act is unavailable and the action
offered instead is to route it to the holder, with the routing recorded.

| gated | reserved to |
| --- | --- |
| the five determinations at 1b.11(a)(46) | the responsible official |
| signature rows on the FANEC, FONSI and ROD | the responsible official |
| approval to publish an EA or EIS | the responsible official |
| preparation of a FONSI or ROD | the subcomponent; never a delegate |
| whether an effect is significant, whether an issue is substantive, which resources are screened, which disciplines prepare | the responsible official |
| 1b.4(a) concurrence, extraordinary complexity, deviation from a time limit, emergency alternative arrangements | the Senior Agency Official |

The interface presents the gate; it cannot verify a credential. §1 records that there
is no platform predicate for the caller's class and that attribution now comes from
`current_user_id`, which makes the actor decidable against Multipass rather than
trusted at write time. A gate held only in the client is not a gate — the surface
withholds the act, the platform refuses the write.

--- | --- | --- |
| FANEC | the subcomponent, or an applicant or third party under supervision — 1b.10(b) | all three of 1b.3(g)(1)(i)–(iii) hold, and the interdisciplinary review 1b.3(g)(2)(v) must assert has occurred |
| EA | the subcomponent, or an applicant or third party under supervision — 1b.10(a) | level of review resolves to 1b.2(f)(2)(iv)(A) |
| FONSI | the subcomponent only | the environmental assessment exists — 1b.6(a) |
| EIS | the subcomponent, or an applicant or third party under supervision — 1b.10(a) | level of review resolves to 1b.2(f)(2)(iv)(B) |
| ROD | the subcomponent only | the environmental impact statement is complete — 1b.8(a) |

The FONSI and the ROD are the two documents 1b.10 does not extend to. Both are
decision documents and neither may be externally prepared.

All environmental documents are prepared using an interdisciplinary approach —
1b.9(g). Which disciplines prepare is at the responsible official's sole discretion.

Where an applicant or third party prepares any of the three: the subcomponent
remains responsible for accuracy, scope and content; independently evaluates the
submission and takes responsibility for its contents — 1b.10(a)(4); receives the
disclosure statement of financial or other interest — 1b.10(a)(5); and maintains a
schedule, with major changes documented in writing — 1b.10(a)(7).

---

## §7.3 Shared steps

### Initiation overlay

Opened by Initiate Project on the inbox. General administrative information only.

| rows |
| --- |
| project name; unique identification number and issuer; anticipated implementation start |

Act: `submit-intake`. Submitting creates the project and opens the project page.
These fields display at the top of the project page thereafter, editable.

### Step 0 — Intake

The most manual step. Everything the review needs known before any of it can
proceed, and the only step whose contents are supplied entirely by the officer.

| tab | rows |
| --- | --- |
| Proposed action | description; components and connected actions; anticipated implementation start |
| Location and jurisdiction | geographic extent and acreage; administrative unit; applicable land management plan; where 1b.4(d)(24) applies, detailed site plans and location maps equivalent to a USGS quadrangle, accurate, complete and capable of verification |
| Authority | federal nexus; statutory or regulatory authority for the action; whether decisional criteria leave residual discretion; whether another statute's requirements serve the compliance function |
| Timing | the deadline trigger event and its date, where a deadline applies; unique identification number and issuer |
| Participants | USDA subcomponent; responsible official; whether an applicant or third party is involved, with the 1b.10(a)(5) disclosure statement; lead, joint and cooperating agencies under 1b.9(m) |

Authority supplies what Step 1 evaluates against 1b.2(e). Location and jurisdiction
supplies the potentially affected environment the extraordinary-circumstance screen
needs, and selects the applicable land management plan from the forest plan
register.

This step carries the heaviest manual load in the application and the most to gain
from interface work. Where a field has a closed set, it is a selection rather than
free text. Where one field determines or narrows another, the second is populated
or filtered from the first. Where a value can be derived from what has been
entered, it is derived and shown for confirmation rather than asked for.

Act: `submit-intake`, which writes a subset of the above. The remainder has no
ontology address.

Completion fires the first retrieval push — §7.8.

### Step 1 — Threshold determination (D0)

| tab | rows |
| --- | --- |
| Does NEPA apply | the six grounds at 1b.2(e)(1)–(6), each answerable; which ground answered; justification record (advisable, not required) |

Acts: `open-determination` (`det_nepa_applies`) → `record-determination-outcome` →
`record-determination`. `record-branch` records the ground.

Outcome NEPA-does-not-apply terminates the project at P0. Outcome NEPA-applies
opens Step 2.

Nothing may force a justification record. §2 records 1b.2(e) as advisable.

### Step 2 — Level of review (D1)

| tab | rows |
| --- | --- |
| Subcomponent exclusion | whether the subcomponent is one of the nine at 1b.4(a); if so, whether an extraordinary circumstance exists for this action; Senior Agency Official concurrence |
| Level of review | limb (i) an established or adopted CE covers the action; limb (ii) another agency's CE is adopted under 1b.3(c); limb (iii) considered and not pursued; limb (iv) reasonably foreseeable significant impacts per 1b.2(f)(3) |

Limbs evaluate in order; first applicable wins; limb (iv) is reachable only on the
failure of (i)–(iii).

Limb (iv) rows carry the modal split at 1b.2(f)(3): the five factors at (f)(3)(ii)
are advisory, the two rationale items at (f)(3)(iii) are mandatory. Unknown
significance routes to P3, not P4.

Acts: `open-determination` (`det_review_level`), `record-branch` per limb.

Screening against the CE catalogue is blocked until `category` is populated (§3).
The sequence itself has no ontology address (§3, backlog).

Completion of Step 2 fixes the pathway and populates Steps 3+.

---

## §7.4 P1 / P2 — categorical exclusion

### Step 3 — Category and extraordinary circumstances

| tab | rows |
| --- | --- |
| Category | category or categories applied, with citation and verbatim description; whether adopted from a non-USDA agency, per 1b.3(g)(2)(ii); reliance on a prior determination under 1b.3(h), with the substantial-sameness explanation; applicant documentation where 1b.4(d)(24) applies |
| Extraordinary circumstances | resources selected for consideration; per-resource finding; whether reasonable uncertainty or certainty of significance exists, per 1b.3(f)(2); modification of the action to cure, per 1b.3(f)(3); reliance on other-law effects analysis, per 1b.3(f)(4); interdisciplinary review record |

Resource selection is at the responsible official's sole discretion, informed by
interdisciplinary review. The eight classes at 1b.3(f)(1) are open-ended and must
not be a closed set.

Act: `state-factor-finding`, closed at clear / present / undetermined.

An extraordinary circumstance is not terminal. 1b.3(f)(3) permits cure.

### Step 4 — Disposition

Fork on the 1b.4 list.

| pathway | tab | rows |
| --- | --- | --- |
| P1 | Implementation clearance | CE applies; no extraordinary circumstance; other necessary environmental review documentation completed; no other statute or regulation requires otherwise — 1b.3(j) |
| P2 | FANEC | the six elements at 1b.3(g)(2)(i)–(vi) |

P1 is terminal. No document, no publication, no signature.

FANEC required only where all three of 1b.3(g)(1)(i)–(iii) hold. Format is free and
there is no page limit or deadline. 1b.3(i) permits items required by other statute
or regulation.

### Step 5 — Issue (P2)

| tab | rows |
| --- | --- |
| Issue | date issued; signature of the responsible official; unique identification number, discretionary under 1b.9(u); disposition of the signed document |

No publication or notification duty attaches to a FANEC.

---

## §7.5 P3 — environmental assessment

### Step 3 — Scope, clock and public involvement

| tab | rows |
| --- | --- |
| Scope of analysis | the duties at 1b.5(b)(1)–(3) |
| Deadline | the three triggers at 1b.5(e), the soonest applicable, and the resulting date; extension under 1b.5(g), with cause, applicant consultation, Senior Agency Official coordination per 1b.5(g)(2), and the written record |
| Public involvement | whether a notice of intent is published — sole discretion, 1b.5(e)(3)(ii); whether comment is solicited — sole discretion, 1b.5(e)(3)(iii) |

`deadlineDays`, `deadlineTriggerName` and `deadlineTriggerDate` exist and are null;
nothing computes soonest-of-three (§3).

### Step 4 — Assembly

| tab | rows |
| --- | --- |
| Environmental assessment | the seven elements at 1b.5(c)(1)–(7) |

Alternatives are conditional: 1b.5(c)(2)(i) makes no action optional as a
stand-alone alternative while requiring its consequences in the impacts analysis;
1b.5(c)(2)(ii) permits an EA analysing only the proposed action where there are no
unresolved conflicts. Neither may be built as a requirement.

Appendices do not count toward the page limit and may not carry substantive
analysis — 1b.5(d)(2).

### Step 5 — Publication

| tab | rows |
| --- | --- |
| Publish | page count against the 75-page limit and the certifying statement at 1b.5(c)(6); deadline certification; publication to a USDA website |

Certifying statements require no signature. Approval to publish indicates
concurrence.

Publication completes the EA and stops the clock. Where the deadline elapses first,
1b.5(f) compels publication that day in as substantially complete form as possible.

### Step 6 — Finding

| tab | rows |
| --- | --- |
| Finding of no significant impact | the five elements at 1b.6(b)(1)–(5) |

Where the finding rests on mitigation, the statutory or regulatory authority for it
and any monitoring or enforcement provisions are required.

May be combined with the EA under 1b.6(a) and does not count toward its page limit.
May be retitled as a decision document where a statute or regulation requires one.

Where the EA supports significance, the level-of-review determination is reopened
and the project moves to P4.

### Step 7 — Notification

| tab | rows |
| --- | --- |
| Notify | every agency and person consulted as identified in the EA, in the manner of communication used to consult — 1b.6(e) |

---

## §7.6 P4 — environmental impact statement

### Step 3 — Notice of intent

| tab | rows |
| --- | --- |
| Notice of intent | the ten contents at 1b.7(b)(1)(i)–(x) |

The NOI fixes the website used by every later publication — 1b.7(n)(2), 1b.8(c).

No ontology address (§3, absent).

### Step 4 — Scope, clock and scoping

| tab | rows |
| --- | --- |
| Scope of analysis | the duties at 1b.7(g) |
| Deadline | the three triggers at 1b.7(k), the soonest applicable, and the resulting date; extension under 1b.7(l)(1) |
| Scoping | whether a scoping process is applied — 1b.7(c), not statutorily required and with no prescribed process; where applied, 1b.7(c)(1)–(3) |
| Comments | when comment is requested — 1b.7(d)(3), any time deemed reasonable |

### Step 5 — Assembly

| tab | rows |
| --- | --- |
| Environmental impact statement | the eight elements at 1b.7(h)(1)–(8) |

The cover carries five sub-items and a two-page limit. Environmental impacts
carries seven sub-items.

Page limit 150, or 300 on a determination of extraordinary complexity, which
requires Senior Agency Official coordination per 1b.7(i)(2).

A draft EIS is optional — 1b.7(n)(1).

### Step 6 — Comments

| tab | rows |
| --- | --- |
| Substantive comments | comments received; whether each issue is substantive, at sole discretion per 1b.7(a); action taken, from the six types at 1b.7(f)(2)(i)–(vi) |

The sixth action type is no action needed and carries the rationale.

### Step 7 — Publication and filing

| tab | rows |
| --- | --- |
| Publish and file | certifying statements at 1b.7(h)(8), no signature; publication to the website named in the notice of intent; filing with EPA under 1b.7(o); EPA's Federal Register notice of availability |

1b.7(l) compels publication at deadline expiry on the same terms as 1b.5(f).

### Step 8 — Record of decision

| tab | rows |
| --- | --- |
| Record of decision | the eight elements at 1b.8(b)(1)–(8) |

Mitigation, where adopted, requires its statutory or regulatory authority and an
adopted and summarised monitoring and enforcement programme for enforceable
commitments.

May be combined with the EIS under 1b.8(a), in which case the cover is updated and
the combined document is filed.

### Step 9 — Notification and implementation clearance

| tab | rows |
| --- | --- |
| Notify and clear | publication to the website named in the notice of intent — 1b.8(c); notification of agencies and persons consulted as listed in the EIS and of any party that commented, in the manner used to consult — 1b.8(d); EPA notice of availability |

The EPA notice is a precondition of lawful implementation — 1b.8(e).

EPA filing and the notice have no ontology address (§3, absent).

---

## §7.7 Cross-cutting

Reachable from every step on every pathway.

| tab | rows |
| --- | --- |
| Proposal record | the eleven categories at 1b.9(a)(1)–(11) |
| Incorporation by reference | cited so the content is identified; reasonably available for review; privileged, classified or withheld material excluded — 1b.9(e)(7) |
| Reliance on existing documents | the explanation of substantial sameness and the three disclosures at 1b.9(e)(8)(vi)(A)–(C) |
| Agencies | lead, joint and cooperating agency roles; a documented reason for any cooperating-agency denial — 1b.9(m) |
| Interdisciplinary preparation | disciplines engaged; that the review occurred — 1b.9(g) |
| Withholding | privileged, classified and segregated material — 1b.9(c), (d) |
| Programmatic reliance | the five-year clock, the reevaluation, and the documentation that the analysis remains valid — 1b.9(q) |
| Reevaluation | the three outcomes at 1b.9(r)(1)–(3); the errata sheet's eight contents at (r)(3)(i)(A)–(H) |
| Emergency | the agency-specific channels at 1b.9(v)(2)(i)–(v) |
| Applicant or third party | supervision, independent evaluation, the disclosure statement at 1b.10(a)(5), and the schedule at 1b.10(a)(7) |

Reevaluation, emergency and applicant preparation have no ontology address (§3,
absent or backlog).

---

## §7.8 Trigger map

### Retrieval pushes

Step completion is what advances retrieval. A completed step establishes facts;
those facts make a further set of queries answerable; results arrive prefilled in
downstream tabs for review rather than as finished answers. Not every step
completion fires a push — whether one does is determined by whether the step
established anything a downstream query was waiting on.

| after | can populate |
| --- | --- |
| Step 0 | candidate CE categories from the catalogue; applicable land management plan sections; precedent and prior-coverage material; regulation sections bearing on 1b.2(e) and 1b.2(f)(2); resources in the potentially affected environment |
| Step 1 | nothing by itself; the outcome narrows Step 2 or terminates at P0 |
| Step 2 | the pathway's step set; the element set for each document on that pathway; deadline applicability |
| Step 3 | on P1/P2, FANEC element drafts from the category and screen findings; on P3/P4, document element drafts from scope and the record |
| document steps | the dependent document's drafts — a FONSI only after its EA, per 1b.6(a); a ROD only after its EIS, per 1b.8(a) |

A prefilled row is a proposal until `adopt` records what the officer did with it.

Retrieval that cannot run reports as unresolved, not absent. §1 records that no
model call has occurred or can, that no Function or AIP Logic exists, and that
`corpus.text` holds no PDF body text — the lane could not have answered, which is a
different claim from finding nothing.

**Level 2 — decision guidance.** Steps 1 and 2 on every pathway; Step 3 category
and extraordinary-circumstance screens on P1/P2; significance at 1b.2(f)(3) and
1b.7(a). Each is guidance toward a determination reserved to the responsible
official by 1b.11(a)(46).

**Level 2 → Level 4.**

| trigger | fires |
| --- | --- |
| `state-factor-finding` returns present or undetermined | expert request drafted and held in Expert Q |
| deadline trigger date recorded | soonest-of-three computed; countdown runs |
| deadline reaches expiry | pending-element list assembled for compelled publication under 1b.5(f) or 1b.7(l); the responsible official publishes |
| page count crosses the limit | certifying statement at 1b.5(c)(6) or 1b.7(h)(8) surfaced |

**Level 2 → Level 3.**

| trigger | fires |
| --- | --- |
| `adopt` on a drafted row | adoption diff recorded on Learning |
| `freeze-slot-disposition` | disposition mix compared against its pin |
| `stamp-verifier-verdict` | verdict recorded |

**Step completion → population push.**

| trigger | fires |
| --- | --- |
| Step 0 completes | first push: retrieval across corpus, forest plan register, regulation and CE catalogue; drafted rows written into Steps 1 and 2 |
| a step completes that supplies inputs the next step needs | a further push into that step's tabs |
| a step supplies nothing downstream | nothing |

Which completions fire a push follows from what the next step requires, not from
position in the sequence.

**Pathway-dependent display.** The left pane shows only the steps of the determined
pathway. Step 2 determines it. A reopened level-of-review determination replaces
the step set.

---

## §7.9 Discretion that must not become requirement

Recorded so it is not built as a gate. Each is a permission in §2.

Scoping and its process — 1b.7(c). Element order inside any document; all five
lists permit any format. Comment timing — 1b.7(d)(3). Whether a draft EIS exists —
1b.7(n)(1). Whether an NOI is published for an EA — 1b.5(e)(3)(ii). Whether comment
is solicited on an EA — 1b.5(e)(3)(iii). Whether no action is a stand-alone
alternative — 1b.5(c)(2)(i). Whether an EA analyses alternatives at all —
1b.5(c)(2)(ii). Whether hearings or meetings occur — 1b.9(k). Whether a threshold
determination is recorded — 1b.2(e). Whether a FANEC carries a unique
identification number — 1b.9(u). Whether a reevaluation finding no update needed is
documented — 1b.9(r)(1).

---

## §7.10 Element totals

FANEC 6, EA 7, FONSI 5, EIS 8, ROD 8. Thirty-four.
