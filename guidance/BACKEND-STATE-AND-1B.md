# Backend state and part 1b requirements

Register, 2026-09-04. Extends the entry grammar of SOURCE-REGISTER.md (id · status / for / status_note / next). Every count here was measured on the platform on 2026-09-04, not read off a document. Where a number here disagrees with any other artifact, this one was checked more recently and §0 names the artifact that needs amending. **Not consulted, by instruction:** the specimen pack, the HTML prototype, the design_handoff_signatureready folder, and anything derived from them. **Contains no interface design.** Where a requirement could only be expressed as something a person looks at, it is recorded as a regulation obligation or an ontology address and nothing else.

## §0 — What you already have

Twenty artifacts, in four families. *"Last touched" is inferred from internal version markers and dated notes, not from commit metadata — I cannot read git timestamps from here.*

### Reconciliations and ledgers

| artifact | size | last touched | verdict |
|---|---|---|---|
| ALIGNMENT.md | 230,815 B / 4,043 lines | 2026-09-04.1 | Still good — needs amending. 540 verdicts, one per clause id and per backend identifier. OPEN; --next prints B.0.1; 108 failures, every one a staleness re-open (107 from 2026-09-03.2's eleven changed clauses, 1 from 2026-09-04.1's §0.9). Coverage is complete, so the 108 are re-judgements and not gaps. Queried, never read. |
| SOURCE-REGISTER.md | 31,331 B, uncapped | 2026-08-28 | Still good — three entries need amending. See below. |
| BACKEND-CHANGE-PLAN.md | 36,251 B, cap 536 | 2026-09-02 | Still good — the NEXT-THING-TO-DO box is partly overtaken. C1–C8 and C11 built; C9, C10 and the materializations outstanding. |
| signatureready/ledger.jsonl | 339,712 B | continuous | Retain as a log; it is explicitly "a log nothing reads to orient". Three findings were already lifted out of it into BACKEND-CONTRACT (L0050, L0088, L0089). |

### Contracts

| artifact | size | last touched | verdict |
|---|---|---|---|
| BACKEND-CONTRACT.md | 10,096 B, cap 168 | 2026-09-02 | NEEDS AMENDING. Says "the 71 object types hold zero rows". The live set is 79 object types and 76 of them hold zero instances. The 71 refers to the in-repo store's domain tables and reads as a platform count. |
| GROUNDING-CONTRACT.md | 6,480 B, cap 110 | 2026-08-28 | Still good. Its honest count (0 live-model / 0 cassette / 103 template-substitution claims) is unchanged, because no model call has happened and none can — the only configured provider host is an RFC-2606 .invalid domain and LiveHTTPTransport.invoke raises even with a credential set. |
| CLAUDE.md | 9,325 B, cap 118 | 2026-09-04 | NEEDS AMENDING ON TWO COUNTS. (1) It says actorPrincipal IS a client-supplied string guarded by ^(?!service:). That is stale: all four attributing acts took their principal from current_user_id on 2026-08-31. (2) The row-count dispute it records is now settled — see §1. |
| FRONTEND-CONSTITUTION.md | 33,948 B | 2026-09-04.2 | Out of scope of this pass. 71 clauses. §0.9 names no subordinate documents and there are none left. |
| HANDOFF.md (front-end repo) | 16,699 B | 2026-09-04 | NEEDS AMENDING. Says "77 of 79 object types hold zero rows"; the number is 76. A document row was created between the 2026-09-03 query and today. |
| signatureready/constitution.md | 14,537 B | 2026-08-28.1 | Still good. Carries the intent predicate and its five clauses. |

### Specification, registers and slot files

- **signatureready/spec/**ontology.yaml (107,079 B), slot_definitions.json (281,629), slot_bindings.json (37,761), element_definitions.json (32,603), ce_categories.json (48,862 — the 87 CE rows, still a git artifact and not a dataset), determination_definitions.json (1,861 — the five determinations, verbatim spans asserted as substrings of 1b.11(a)(46)), state_record_prefixes.json (34,641), step0.freeze.json (15,947), disposition_mix.pin.json (14,653), forest_plan_register.md (6,318), PATH_GRAMMAR.md (7,827). All still good.
- **signatureready/nodes/**29 node contracts (n.assembly, n.slot_register, n.issue_register, n.authority_ledger, n.rule_corpus, n.ontology, n.ontology_spec, n.expert_queue, n.expert_directory, n.det_core, n.drafter, n.evals, n.verifier, n.precedent, n.prior_coverage, n.process_record, n.project_state, n.element_sets, n.ce_catalog, n.enumerations and others). Still good. n.surface and n.surface_spec were deleted with the interface.
- **signatureready/reg/**part-1b.xml (222,131 B), sections.json (214,988), prior-sections.json (51,544), part-220.xml (54,336), version.json. Still good and POST-DATES the current rule — see §2.
- **ontology-roster.txt**22,876 B, uncapped. 79 object types / 17 action types. Its own header was found rotted on 2026-09-03 (said 15 actions while listing 17, and "only these 77 are live" while listing 79). Diff the lines, never the total.
- **generated/type_definitions.json**130,481 B. RETIRE AS A DESCRIPTION OF DEPLOYMENT, keep as spec. Names the retired chrisp-sr namespace and declares 3 link types and 27 value types that could never be created. Duplicated at root and under signatureready/; the latter is right.
- **signatureready/seams.jsonl / prefabs.jsonl**23,668 B / 143,656 B. Still good.

### Platform-side registers (regenerated by a build, not maintained by hand)

These are the half SOURCE-REGISTER deliberately does not restate. All were rebuilt and all hold real rows; counts in §1.

- signatureReady.corpus.census · corpus.manifest · corpus.manifestStatus · corpus.text · corpus.textProvenance signatureReady.check.corpusPin · check.forestPlanPin · check.regulationPin · check.regulationDrift signatureReady.corpusArtifact — the joined object type, 312 rows, queryable

### Retire

- **[RETIRED — Phase 1B] SignatureReady — Phase 2 Source Register** (Notepad). Already marked retired; superseded by SOURCE-REGISTER.md. Nothing points at it.
- **99 Retired - superseded by Ontology Manager migration** (folder). Two frozen generations, [chrisp_sr] and [chrisp_sr2], undeletable and entirely plausible in a picker. Filter by the SignatureReady type group, never by name.
- **generated/type_definitions.json as a deployment description** — see above. The file stays; the reading of it retires.

### Three SOURCE-REGISTER entries this pass changes

- **fanec-exemplars — amend, and it is worse than the entry says.** The entry reads the four held FANECs as "merely current-rule". They are not current-rule. All four carry rule vintage 7CFR1b-2025-07-03, the interim final rule, which was superseded on 2026-04-03. See §5.
- **ce-catalog-as-data — still open and now the single cheapest item in the build.** category holds zero rows; the 87 CE rows sit in ce_categories.json. §2 re-derives 87 from the pinned text, so the file and the rule agree and the projection is safe to run.
- **reg-36cfr220-classed-as-current — still live in the data, unchanged.** Two rows still declare authorityClass=regulation, citable=true, supersededButClassedCurrent=true. Still a WARN, not a FAIL.

## §1 — Backend state, as it stands

### Object types: 79 live, 3 populated

The live set is exactly the SignatureReady type group. Two population routes exist and they must not be conflated: a dataset-backed type reads from signatureReady.\*, an edits-layer type reads from rows an action wrote. Querying only the datasets misses the second; querying only the ontology hides which is which.

| object type | instances | route | what the rows actually are |
|---|---|---|---|
| corpusArtifact | 312 | dataset | REAL. The pinned grounding corpus, digest-verified. 283 practice / 4 regulation / 25 undeclared. |
| project | 2 | edits layer | BOTH SYNTHETIC. "C5 write-path tracer — safe to delete" (TRACER-C5-0001) and one named "lk" with every other field null. Both carry synthetic=true. |
| document | 1 | edits layer | SYNTHETIC. documentType=FANEC on the tracer project, synthetic=true, regulationVersion NULL, pageCount and pageLimit NULL. New since the 2026-09-03 query. |
| the other 76 | 0 | — | Empty. Schema only. |

**Read that carefully: there is no real project data in the ontology at all.** The only real rows in the build are the corpus. Everything else is either empty or a tracer.

**On the datasets specifically:** of the 79 backing datasets, exactly one holds rows — signatureReady.corpusArtifact, 312. Every other domain dataset is zero, including signatureReady.project and signatureReady.document, whose rows live only in the edits layer.

**And the consequence nobody has written down yet:** the five object-dataset materializations — materialized.adoption, .assignment, .determination, .engagement, .receivedArtifact — all hold ZERO rows. So no transform can read an act-written row. That is why ratification can never be populated: it projects over acts that write to the edits layer, and nothing can read one. Level 3 has its shape and not its mechanism.

### Links

38 link type resources. The spine that matters traverses today: project → document → element → slot → claim, plus manifest → unsatisfiedElement, plus the C1 singletons (document.manifest, document.programmatic, manifest.dispositionMix, unit.coveredPortion, project.commentPublication) and the ten wave-2 edges (screen, factor, issue, alternative, determination, branch, unit, treatment, assignment, receivedArtifact).

- **The two many-to-many links are vacuous at the target end.** element_cites_enumset and project_screened_against_category each hold 0 rows, and so do their targets: enumset 0, category 0. The link types are correct; writing the target end is the change and it is upstream.
- **One edge has never been tested and cannot be yet.** assignment.slot is written by an act into the edits layer while the backing column is null. Whether the link resolves in that state is unknown. Settle it by TRAVERSING the edge, never by reading the property back — the property reads correctly either way, which is what makes the failure silent.
- **Two documentId columns are deliberately not edges.** proposalRecordItem.documentId and incorporatedByReference.documentId refer to a pinned corpus artifact, never to a document object. A link there would be wrong, not merely empty.

### Actions: 17, all edits-enabled, all organization-marked

Every one carries INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e). Four write their actor principal from current_user_id; the rest write no actor at all, each for a recorded reason.

| API name | rule | writes | actor |
|---|---|---|---|
| signature-ready-submit-intake | create | name, uniqueIdentificationNumber, uniqueIdentificationNumberIssuer (closed 2), anticipatedImplementationStart, synthetic | none — creating a project is not a reserved determination |
| signature-ready-open-determination | create | whichDetermination (closed 5), citation='1b.11(a) (46)' static, project | none — opening is not deciding |
| signature-ready-record-determination-outcome | modify | outcome only | none; refuses once actorPrincipal is set |
| signature-ready-record-determination | modify | decidedAt, evidenceHash, actorPrincipal | current_user_id; refuses while outcome is empty |
| signature-ready-record-branch | modify | taken=true (static, not a parameter), decidedAt, evidenceHash, actorPrincipal | current_user_id |
| signature-ready-state-factor-finding | modify | finding (closed 3: clear / present / undetermined) | NONE — named gap |
| signature-ready-record-consistency-finding | modify | finding, decidedAt, evidenceHash, actorPrincipal | current_user_id |
| signature-ready-open-document | create | documentType (closed 5), project, synthetic (required, never defaulted) | none |
| signature-ready-emit-document | modify | emittedAt, closureHolds, manifestHash, emittedBy | current_user_id |
| signature-ready-adopt | modify | adoptedValue, adoptionState (closed 3), adoptedAt, actorPrincipal | current_user_id |
| signature-ready-identify-expert-requirement | create | identifiedAt, targetKind (closed 3), targetName, slot | none |
| signature-ready-package-expert-request | modify ×2 | assignment.sentAt, assignment.expectedReturnDate; engagement.outcome='open' | none — named asymmetry |
| signature-ready-record-artifact-arrival | create | artifactType (deliberately unconstrained), assignment, receivedAt | none |
| signature-ready-accept-artifact | modify | engagement.gapsFound, engagement.outcome='artifact_received' | none |
| signature-ready-freeze-slot-disposition | modify | disposition (closed 3) | none |
| signature-ready-stamp-verifier-verdict | modify | verdict (pass / fail), verdictStampedAt | none; DEFAULT IS STILL pass |
| signature-ready-publish-under-compulsion | create | publishedAt, compellingRule (closed 2: 1b.5(f) / 1b.7(l)), actorPrincipal | current_user_id |

**Which acts can actually be run today.** Four: submit-intake (proved — two rows), open-document (proved — one row), open-determination (a project exists to hang it on), publish-under-compulsion (creates its own row). Then, because open-determination now creates a determination, the pair record-determination-outcome → record-determination is reachable. That is the whole walkable chain. The other eleven acts are keyed on a slot, claim, manifest, adoption, factor, branch or consistencyDetermination row, and nothing creates any of those.

**A correction to CLAUDE.md.** It records actorPrincipal as a client-supplied string guarded only by ^(?!service:), and cites the C5 tracer that wrote synthetic:c5-tracer into a real row as evidence (U13). That was true and is not any more: on 2026-08-31 all four attributing acts moved to current_user_id in one branch. The regex is gone and nothing replaces it — there is no platform predicate for "this caller is not a service user" — but the record can no longer misstate who acted, which moves clause 4's actor question from trusted-at-write-time to decidable against Multipass.

### Functions and AIP Logic: none

**There is no Foundry Function and no AIP Logic in this project.** A search of the ontology returned nothing. That matters more than its one line, because eight named guarantees are all waiting on the same non-existent submission-time Function:

- adopt — adoptedValue must be present unless adoptionState is 'rejected'. A conditional over another parameter's nullity; not expressible. An 'adopted' with no value can be recorded today.
- freeze-slot-disposition — frozen_upstream. The act cannot distinguish a faithful replay of a frozen disposition from a fresh choice made at submission, which is the guarantee that stops work migrating during assembly.
- emit-document — intent-predicate clause 1 (element closure) and clause 2 (disposition mix equals its pinned expectation). Both recorded as enforcedAt 'none'. closureHolds is a parameter and a false value is not refused.
- stamp-verifier-verdict — not_before (verdict at or after the manifest's emittedAt) is a cross-object comparison. AND: since the act widened to accept 'fail' on 2026-09-01, clause 3's pass-only requirement is now held by NOTHING. Recording a fail is correct; letting a failed claim into a signed document is not, and only an emission gate can tell those apart.
- record-branch — exactly one taken branch per question. An action sees only the object it is given.
- open-determination — uniqueness over (project, whichDetermination). Nothing refuses a second det_nepa_applies on one project.
- open-document — uniqueness over (project, documentType).
- record-artifact-arrival — at most one arrival per assignment.

### What feeds them

| dataset | rows | note |
|---|---|---|
| signatureReady.corpus.census | 312 | every artifact in every grounding media set, with sha256 and byte length |
| signatureReady.corpus.manifest | 287 | what each corpus declares |
| signatureReady.corpus.manifestStatus | 6 | per-corpus shortfalls and not-retrieved notes, verbatim from the assembler |
| signatureReady.corpus.text | 17 | UTF-8 decode only. One MANIFEST.json per corpus plus the regulation XMLs and forest-plan JSONs. ZERO PDF body text. |
| signatureReady.corpus.textProvenance | 271 | all PDFs classified: 253 born-digital, 14 image-only, 2 unreadable, 2 ocr-derived |
| signatureReady.check.corpusPin | 287 | 287 of 287 declared artifacts match on digest and length, both directions |
| signatureReady.check.forestPlanPin | 11 | the 11 retrieved forest-plan source documents |
| signatureReady.check.regulationPin | 1 | the platform copy of 7 CFR 1b against the pin — green |
| signatureReady.check.regulationDrift | 1 | an independently retrieved part 1b at eCFR issue date 2026-08-25, byte-identical to the 2026-08-11 pin. noDriftDetected = true. |

**Sync state: nothing syncs.** Every data connection source has code-repository, Pipeline Builder and compute-module usage disabled, the build account is Viewer only and permanently so, and no egress policy has ever carried a packet. Retrieval is out-of-band, uploaded to a media set and verified by digest in a build. That route is proven over 287 artifacts. The eCFR source is kept because §0.5's drift check is the one thing that would ever want to run on a schedule inside the platform.

### Placeholders — including two of yours that no longer stand

- **The all-zeros ontology RID: not reproduced in the deployment path.** foundry.config.json carries no ontology RID at all — only foundryUrl and the Developer Console application RID f2f61853-7f53-49c1-8c12-1782fc767191. The live ontology is ri.ontology.main.ontology.aa2788ae-95a9-4704-8e7b-97ef0a3a366c and an all-zeros RID does not resolve; I tried it. If it survives anywhere it is in generated/type_definitions.json, which is spec and not deployment and which nothing reads at runtime. Where did you see it? → §4.
- **VITE_FOUNDRY_REDIRECT_URL is filled, and the test that would check it never runs.**.env.production carries all three variables, redirect included: https://signatureready.ontologize.palantirfoundry.com/auth/callback. So the premise is wrong. The interesting half is the other one: src/env.test.ts wraps every assertion in test.skipIf(process.env.VERIFY_ENV_PRODUCTION !== "true"), and ci.yml runs npm install && npm run lint && npm run test && npm run build without ever setting VERIFY_ENV_PRODUCTION. The guard is inert in CI. A tagged release would NOT fail env.test.ts — it would pass it without running it, which is the worse of the two conditions.
- **document.regulationVersion is null on the one document row.** Per C3 a null means UNBOUND, not current. The version is fixed at signature and never re-derived (§8.10), so a nullable column nothing writes is re-derivation with extra steps.
- **stamp-verifier-verdict still defaults to pass.** Clearing a parameter default is not expressible through the API path the edit used, so the form opens on Pass and the valuable answer — the rejection — is the harder click. Must be cleared by hand in Ontology Manager.
- **The Developer Console CSP fields are empty, and that is the strictest case rather than the loosest.** Those fields hold ADDITIONS to the platform default, so empty means nothing has ever been allowlisted and the restrictive default applies unmodified. It also confirms independently that the Google Fonts requests which silently degraded the three-face typography were always going to be refused.
- **reg-36cfr220 still declares itself current.** Two rows: authorityClass=regulation, citable=true, supersededButClassedCurrent=true. 36 CFR 220 was superseded on 2025-07-03 and 111 corpus artifacts are written under it. Still a WARN. It becomes a FAIL when a corrected manifest lands, and that flip is the point.
- **25 corpus rows carry classDeclared=false and citable=NULL.** 17 forest-plan-raw plus 8 manifests and cover notes. The forest-plan corpus ships MANIFEST.md where the other six ship MANIFEST.json, and only JSON is parsed — so the one jurisdiction §0.1 says IS citable is the one with no machine-readable class.

### What is not imported into the Developer Console application

**Unknown, and not readable from here.** The import list is a Developer Console setting, not an ontology or repository artifact. What is certain is the shape of the risk: the front end reaches the ontology only through src/port/osdkPort.ts, the OSDK is generated against the imported set, and an object type that was never imported is invisible to the application regardless of how many rows it holds — and it fails in exactly the same way an empty type does. With 76 of 79 types empty, a missing import and an empty type are the same pixel. → §4.

### Can a query distinguish "no record exists" from "the query could not run"?

**Yes. The distinction is implemented, and it is implemented in exactly one place.** src/port/types.ts and src/port/index.ts define a four-state region and toRegion is the single site that makes the call:

- **filled** — a value resolved. Carries rows.
- **absent** — the query RAN and found nothing. A real answer about the world, and often the correct one.
- **blocked** — a precondition is not met. Carries blockedBy and resolvedAt.
- **unresolved** — the lane COULD NOT have answered. Always a defect in this build. Carries defect.
- **undefined** — in flight. A fifth state that is not one of the four and must not look like absent.

So the property you are asking about is held. Three qualifications, and they are the honest part:

1. **It is held only at that boundary.** Any consumer that reads the SDK directly, or writes rows.length === 0 ? Empty : List, collapses absent, blocked and unresolved into one. That is named as the application's signature defect. There is a gate — check:port, which allowlists only osdkPort.ts and client.ts to import @osdk/\* — and it also fails if NO allowlisted file imports one, because a green over an application that reads nothing certifies nothing. But the gate polices imports, not the collapse.
2. **It is held by a repository artifact, not by the ontology or the datasets.** Nothing in the ontology records why a query returned nothing. An empty object set from an ontology SQL query is indistinguishable from a broken one at the platform level, and the four-state contract exists in TypeScript that the platform never executes.
3. **Two lanes report unresolved even under the "filled" fixture, and that is correct.** determinationEvidence has a declared evidence set for two of the five determinations and none for the other three, so those three report that NOTHING WAS ASKED rather than that nothing was found. That is the distinction working.

**Where it currently fails.** corpusArtifact.citable is a bare null on the 25 undeclared rows and the null is being asked to carry the refusal — the instruction is "read it as not citable". A null that means "not declared" and a null that means "not applicable" are the same null. C11 got half of this right by adding classDeclared=false rather than leaving it null; citable itself did not get the same treatment.

**And the population state makes the whole distinction expensive.** With 76 of 79 types empty, essentially every read returns absent. absent is the correct answer AND it is the answer a mis-bound type returns. A widget bound to a frozen [chrisp_sr2] type resolves cleanly and is empty forever, and looks identical to a correct binding over an empty table. Nothing on the platform distinguishes those two today.

### What vocabulary does the corpus actually use?

**Not measured. Cannot currently be measured on the platform.** signatureReady.corpus.text holds 17 rows totalling about 1.9M characters, and every one of them is a MANIFEST.json, a regulation XML, a drift witness, a forest-plan JSON or a cover note. The transform decodes UTF-8 and nothing else, so 271 PDFs yield nothing. There is no practice-document body text in any dataset, so there is no corpus to measure regulation phrasing against.

**What is measured, and is adjacent enough to be worth having.** corpus.textProvenance classifies all 271 PDFs by /Creator, /Producer and /Style marker and never by character density: 253 born-digital and quotable at a page, 14 image-only, 2 unreadable (truncated at source), 2 ocr-derived. And the probe evidence at tests/probes/evidence/pdf-page-extraction.json censused 976 pages across 13 USFS documents and found ZERO pages carrying an image and no text — public USFS PDFs are OCR'd before publication.

**Which relocates the risk rather than removing it.** The corpus-wide hazard is not absent text, it is WRONG text that announces nothing. On the 1990 Umatilla ROD the cover reads "Forest Service" in the page image and "Forest %Nice" in the text layer, on all three extractors, with no error and no signal. A verbatim quote check against a document whose page anchor is perfectly correct therefore returns a false negative. Also worth stating honestly: the 253 born-digital verdicts rest on marker ABSENCE, and only 2 documents fired a marker at all, so a scanned document whose producer string is not in the conservative list reads as born-digital. minCharsOnAPage is recorded on every row so the suspicion is investigable, and is deliberately not wired into the classifier, because a threshold is a determination nobody wrote down.

Getting the vocabulary numbers needs PDF text extraction on the platform. That is the same single absent capability three SOURCE-REGISTER entries already wait on (northern-rockies-lynx-2007, forest-plan-unit-register-integrity, image-only-scans), which makes it four.

## §2 — What part 1b requires, and in what order

Written before the corpus was opened. Every quotation below is from the pinned copy of the current text; nothing here is anchored to an exemplar.

### Currency

The pinned copy is eCFR /full/2026-08-18/title-7.xml?subtitle=A&part=1b — 222,131 bytes, sha256 a8097af3…fea6db20, retrieved 2026-08-20, vendored as title-7-part-1b.2026-08-11.xml.

| section | last amended | note |
|---|---|---|
| 1b.1, 1b.2, 1b.3, 1b.5, 1b.6, 1b.7, 1b.8, 1b.10, 1b.11 | 2026-04-03 | the final rule, 91 FR 17092 |
| 1b.4 | 2026-04-03 | also carries an interim-period amendment at 2025-07-18 |
| 1b.9 | 2026-07-02 | further amended, 91 FR 40353 |
| 1b.12 Severability | 2025-07-03 | NOT touched by the final rule. The only section still carrying interim-rule text. |

The source note printed at the foot of 1b.9 in the pinned text is literally [91 FR 17092, Apr. 3, 2026; 91 FR 40353, July 2, 2026], which corroborates both amendments from inside the document. The per-section version history records latest_amendment_date 2026-07-02.

**Drift is checked and clean.** signatureReady.check.regulationDrift retrieved an independent witness at eCFR issue date 2026-08-25 and it hashes byte-for-byte identical to the 2026-08-11 pin — same sha256, same 222,131 bytes, noDriftDetected true. **Gap against your currency line:** you give Title 7 current as of 2026-09-01; the pin and its witness reach 2026-08-25. Seven days are unverified. → §4.

**Which artifacts predate 2026-04-03? None in this section's source chain.** The pin post-dates both amendments. reg/prior-sections.json and reg/part-220.xml are deliberately the prior rule and are labelled as such. So §2 is not derived against superseded text at any point — the vintage exposure in this build is entirely on the corpus side, which is §5.

**What re-resolving changed: nothing in the counts, and that is itself the finding.** I re-derived rather than reconciled. The element counts come out FANEC 6 / EA 7 / FONSI 5 / EIS 8 / ROD 8 = 34, which is exactly what BACKEND-CONTRACT records. The determinations at 1b.11(a)(46) come out at five, and the verbatim spans in determination_definitions.json are all still substrings of the current paragraph. The categorical-exclusion catalogue comes out at 87 (39 + 48, worked below), which is exactly the row count of ce_categories.json. **No obligation count moved.** If you expected one to, the reason it did not is that the 2026-04-03 rule rewrote wording and structure but not the enumerated element lists.

### Your three orientation points, checked against the pinned text

- **1b.2(f)(2) is the level-of-review sequence — CONFIRMED,** and it is both explicitly ordered and explicitly conditional: "the subcomponent will then determine the appropriate level of NEPA review in the following sequence and manner", with limb (iv) reached only if a categorical exclusion cannot be applied "consistent with paragraph (f)(2)(i) through (iii) of this section". First applicable wins, and the fall-through is named.
- **1b.2(e) is where NEPA does not apply, and it is reached first — CONFIRMED.** Six circumstances at (e)(1)–(6). The gate is explicit in the opening words of (f)(2): "If a USDA subcomponent determines under § 1b.2(e) that NEPA applies to a proposal or decision, the subcomponent will then determine…".
- **1b.4 splits categories into no-documentation and documentation-under-1b.3(g) — CONFIRMED, but it splits THREE ways, not two.** You are missing 1b.4(a), which excludes nine named USDA subcomponents' actions from EA/EIS preparation outright. Earlier work in this build treats 1b.4 as a two-way split, and the third limb has no representation anywhere in the ontology.

### D0 — does NEPA apply at all? · 1b.2(e)

The chapeau, verbatim:

> Threshold determinations of whether NEPA applies may be made on a case-by-case or programmatic basis and record keeping of the justifications for these determinations is advisable. In determining whether NEPA applies, a USDA subcomponent will consider only the proposed action or project at hand. NEPA does not apply to a proposal when:

Then six limbs, each cited to its operative words:

- **(e)(1)** not a "major Federal action" — and "The terms 'major' and 'Federal action,' each have independent force. NEPA applies only when both of these two criteria are met. Such a determination is inherently bound up in the facts and circumstances of each individual situation, and is thus reserved to the judgment of a USDA subcomponent in each instance".
- **(e)(2)** "The proposal or decision is exempted from NEPA by law".
- **(e)(3)** no "final Federal agency action under the Administrative Procedure Act, see 5 U.S.C. 704, or other relevant statute that also includes a finality requirement".
- **(e)(4)** nondiscretionary — "where Congress, by statute, has prescribed decisional criteria with sufficient completeness and precision such that a Federal agency retains no residual discretion to alter its action based on the consideration of environmental factors".
- **(e)(5)** "Compliance with NEPA would clearly and fundamentally conflict with the requirements of another provision of law".
- **(e)(6)** "The proposal is an action for which another statute's requirements serve the function of the Federal agency's compliance with the Act".

**Obliges: nothing documentary.** Record keeping of the justification is *advisable*, not required. This is the first and largest discretion in the part and the easiest to build as a requirement by mistake.

### D1 — which level of review? · 1b.2(f)(2), gated on D0

The (f) chapeau applies throughout: "At all steps in the following process, USDA subcomponents will consider the nature of the proposal or project at hand, the potentially affected environment, and the anticipated degree of effect." And (f)(1) permits any reliable data source and does not require new scientific or technical research "unless the new scientific or technical research is essential to a reasoned choice among alternatives, and the overall costs and time frame of obtaining it are not unreasonable".

The sequence, first applicable wins:

1. **(f)(2)(i)** the subcomponent has established, or adopted under NEPA §109, a categorical exclusion covering the action → analyse whether to apply it and apply it if appropriate, per 1b.3(f) and (g).
2. **(f)(2)(ii)** another agency has already established one covering the action → consider whether to adopt it under 1b.3(c), "so that it can be applied to the proposed action at issue, and to future activities or decisions of that type".
3. **(f)(2)(iii)** the action warrants establishing a new categorical exclusion or revising an existing one under 1b.3(b) → consider doing so, then apply per 1b.3(f) and (g).
4. **(f)(2)(iv)** if a categorical exclusion cannot be applied consistent with (i)–(iii) → consider reasonably foreseeable significant impacts per (f)(3), then: (A) "if the proposed action is not likely to have reasonably foreseeable significant impacts or the significance of the impacts is unknown, develop an environmental assessment, as described in § 1b.5"; or (B) "if the proposed action is likely to have reasonably foreseeable significant impacts, develop an environmental impact statement, as described in § 1b.7".

**Note (iv)(A) carefully:** unknown significance routes to an EA, not to an EIS. Uncertainty is an EA trigger, not an escalation.

### D2 — extraordinary circumstances · 1b.3(e)–(f), reached only if a CE applies

1b.3(e): "If a USDA subcomponent determines that one or more categorical exclusions applies to a proposed action, the subcomponent will evaluate the action for extraordinary circumstances."

1b.3(f), on who chooses the resources and on what basis:

> Resources for consideration for extraordinary circumstances will be determined at the responsible official's sole discretion, as informed by interdisciplinary review, and shall be based on the nature of the actions proposed and in the context of the potentially affected environment.

(f)(1) then lists eight resource classes — listed species and critical habitat; flood plains and wetlands; special sources of water; formally designated areas; specially managed areas; prime, unique or important farmland; property of historic, archeological or architectural significance; and American Indian and Alaska Native religious or cultural sites — prefaced by "**may include, but are not limited to**". The list is open and the set is discretionary.

(f)(2) carries the two sentences that do the actual work:

> The mere presence of one or more of the resources listed in paragraph (f)(1) of this section, or as otherwise identified at the sole discretion of the responsible official, does not mean an extraordinary circumstance exists. … An extraordinary circumstance exists only when there is reasonable uncertainty whether the degree of the effect is significant or certainty that the degree of effect is significant.

(f)(3): if one exists, the responsible official *may* modify the action or take other steps so that certainty is created that the effect is not significant — and then "the extraordinary circumstance will be considered to no longer exist and use of the categorical exclusion may proceed". An extraordinary circumstance is therefore not fatal. (f)(4) permits reliance on effects analysis done for another law to inform a finding of no extraordinary circumstance.

### D3 — does this category require documentation? · 1b.4, then 1b.3(g)

Three limbs, and this is where the two-way reading needs correcting.

| limb | what it says |
|---|---|
| 1b.4(a) | Nine named subcomponents (Agricultural Marketing Service, Economic Research Service, Federal Crop Insurance Corporation, Food and Nutrition Service, Food Safety and Inspection Service, Foreign Agricultural Service, National Agricultural Library, National Agricultural Statistics Service, and eleven listed general offices) "conduct programs and activities that do not normally result in reasonably foreseeable significant impacts" and their actions "are excluded from the preparation of an environmental assessment (EA) or environmental impact statement (EIS)" — "unless the subcomponent determines that an extraordinary circumstance exists for an individual action and obtains the concurrence of the USDA Senior Agency Official (or their designee)". |
| 1b.4(c) | "The following categorical exclusions do not require NEPA documentation." 40 numbered entries, (27) [Reserved] → 39 live. |
| 1b.4(d) | "The following categorical exclusions require NEPA documentation, which will be completed as set forth at § 1b.3(g)." 47 numbered entries, (25) [Reserved]; (24) is a chapeau expanding into three lettered CEs (USDA-24-1d-RD, -24-2d-RD, -24-3d-RD) → 48 live. |

39 + 48 = **87**, which is the row count ce_categories.json carries. Two further duties sit inside 1b.4(d): for NRCS-promulgated categories, subcomponents "must adhere to NRCS Conservation Practice Standards, or to comparable technical guidelines, or similar agency-specific conservation or best management practices, as determined at the sole discretion of the subcomponent's responsible official"; and (d)(24)'s chapeau imposes an applicant documentation duty — all components and connected actions, "its specific location on detailed site plans as well as location maps equivalent to a U.S. Geological Survey (USGS) quadrangle map", and authoritative confirmation of "the presence or absence of sensitive environmental resources", all of which "must be accurate, complete, and capable of verification".

### D4 — significance · 1b.2(f)(3), 1b.7(a)

The modal split here is load-bearing and easy to lose. (f)(3)(ii): "In considering the degree of effects, USDA subcomponents **should** consider the following, as appropriate to the specific action and in the context of the potentially affected environment" — short- and long-term effects; beneficial and adverse effects; effects on public health and safety; economic effects; effects on the quality of life of the American people. (f)(3)(iii): "In providing rationale for whether the degree of effect is significant, responsible officials **shall** consider" — (A) how the unavoidable short- and long-term adverse and beneficial impacts of implementing compare to the consequences of not implementing, and (B) how the irreversible and irretrievable commitment of a Federal resource contributes to a loss of long-term productivity. Five factors advisory; two rationale items mandatory.

1b.7(a) reserves the conclusion: "Whether an action rises to the level of significant is a matter of the responsible official's expert judgment, as informed by interdisciplinary analysis."

### What each outcome obliges

| outcome | document | what the rule says it must contain, and what constrains it |
|---|---|---|
| NEPA does not apply — 1b.2(e) | none | Record keeping of the justification is ADVISABLE. No document, no publication, no signature. |
| CE with no documentation — 1b.4(c) | none | 1b.3(j): once the responsible official has determined a CE applies and no extraordinary circumstance exists "and has completed any other necessary environmental review documentation, and unless other statutes or regulations require otherwise, the USDA subcomponent or applicant may begin implementing the action". 39 of 87 categories land here. |
| CE requiring documentation — 1b.3(g) | FANEC | Required only when all three of (g)(1)(i)–(iii) hold: the action is categorically excluded, no extraordinary circumstance exists, AND the category requires documentation. Six elements at (g)(2)(i)–(vi): incorporate by reference other relevant documentation in the proposal record; state the category or categories and, if adopted from a non-USDA agency, specify that it was adopted; describe the proposed action and state how the categories apply; state the resources considered; state that no extraordinary circumstances exist, as informed by the interdisciplinary review; include the date issued and signature of the responsible official. Format free. No page limit. No deadline. No publication duty. Unique ID discretionary. 1b.3(i) permits adding items required by other statute or regulation. |
| Not excluded; impacts not likely significant, or unknown — 1b.2(f)(2)(iv)(A) | EA | Seven elements at 1b.5(c)(1)–(7): purpose and need; no action, proposed action and alternatives; potentially affected environment and environmental impacts; agencies and persons consulted; other environmental reviews; certifying statements for page limit and deadline; unique identification number. The scope-of-analysis duties at 1b.5(b)(1)–(3) are ALSO mandatory — "shall address the scope of analysis required in paragraph (b) of this section and the following elements at a minimum". 75-page text limit excluding citations and appendices. One year from the soonest of three triggers. Published to a USDA website, which is what makes it complete and stops the clock. |
| EA supports no significant impact — 1b.6 | FONSI | Five elements at 1b.6(b)(1)–(5): incorporate by reference the EA and note other related documentation; state the selected alternative if others were analysed in detail; document the reasons for the finding based on the EA's analysis and evidence and "conclude with a statement that for these reasons an environmental impact statement will not be prepared", and where the finding rests on mitigation state the authority for it and any monitoring or enforcement provisions; a statement regarding when implementation is anticipated to begin; the date issued and the signature of the responsible official. May be combined with the EA and does not count toward its page limit. May be retitled as a decision document where a statute or regulation requires one. |
| Impacts likely significant — 1b.2(f)(2)(iv)(B) | EIS | Eight elements at 1b.7(h)(1)–(8): cover (≤2 pages, five sub-items including the unique ID); purpose and need; proposed action and alternatives; potentially affected environment; environmental impacts (seven sub-items); environmental review and consultation requirements including a list of agencies and persons consulted and all Federal permits, licences and other authorisations; appendices if any; certifying statements. Plus the scope-of-analysis duties at 1b.7(g). 150-page limit, or 300 for extraordinary complexity. Two years. NOI required, with ten contents. Filed with EPA. |
| Decision on an EIS — 1b.8 | ROD | Eight elements at 1b.8(b)(1)–(8): incorporate by reference the EIS; certify consideration of all substantive alternatives, information and analyses submitted by State, Tribal and local governments and public commenters; "State the decision, that is, the alternative selected"; explain how significance was considered per 1b.2(f)(3); identify and discuss all factors balanced, including any essential considerations of national policy, and state how they informed the decision; state any mitigation and, if adopted, its statutory or regulatory authority, and adopt and summarise a monitoring and enforcement programme for enforceable commitments; a statement regarding when implementation is anticipated to begin; the date issued and the signature of the responsible official. |

**Two obligations that attach to the process rather than to a document.** Compelled publication: 1b.5(f) and 1b.7(l) each require publication "at the latest, on the day the deadline elapses, in as substantially complete form as is possible" unless the deadline is extended — so a document may be published with required elements still pending, and part 1b compels publication in exactly those two places and nowhere else. And the proposal record: 1b.9(a) enumerates eleven categories of material the record "should include", from internal communications capturing rationale through to "Any other information deemed applicable by the responsible official".

### Dependency — what the text actually constrains

This is the regulation's own ordering, not a workflow. Twelve hard constraints, each stated by the rule rather than inferred:

1. 1b.2(e) before 1b.2(f). Explicit: "If a USDA subcomponent determines under § 1b.2(e) that NEPA applies … the subcomponent will then determine the appropriate level of NEPA review".
2. Within 1b.2(f)(2), (i) → (ii) → (iii) → (iv). Explicit: "in the following sequence and manner", and (iv) is conditioned on the failure of (i) through (iii).
3. A categorical exclusion must be found to apply before extraordinary circumstances are evaluated — 1b.3(e).
4. Both CE applicability AND no extraordinary circumstance before a categorical exclusion may be applied — 1b.3(g): "a responsible official must determine that one or more categorical exclusions apply to a proposed action and that no extraordinary circumstance exists".
5. The category must require documentation before a FANEC is required — 1b.3(g)(1)(iii).
6. The EA before the FONSI — 1b.6(a): the finding is prepared "based on the environmental assessment".
7. The EIS before the ROD — 1b.8(a): "Upon completing the environmental impact statement, at the time of its decision".
8. The NOI before EIS publication, because the NOI fixes the website — 1b.7(n)(2) publishes "to the USDA website that was specified in the notice of intent", and 1b.8(c) says the same for the ROD.
9. EPA filing and EPA's Federal Register notice of availability before implementation on an EIS pathway — 1b.8(e).
10. The deadline trigger date before the deadline can be computed — 1b.5(e) and 1b.7(k) each run from "the sooner of, as applicable" three named events.
11. Consultation with the applicant before a new deadline is established — 1b.5(g), 1b.7(l)(1); and coordination with the Senior Agency Official before extending (1b.5(g)(2)) and before an extraordinary-complexity determination (1b.7(i)(2)).
12. For a 1b.4(a) subcomponent, the Senior Agency Official's concurrence before an EA or EIS is required on an individual action — 1b.4(a).

**And where the rule constrains nothing.** These are as important as the constraints, because each one recorded as a requirement is a false constraint that will get built in and then have to be found again.

- **Scoping.** 1b.7(c): "Scoping is not a statutorily required step in the NEPA review procedures and there is no prescribed process or procedure required for scoping." It "may begin as soon as practicable", and the whole of (c)(1)–(3) is conditioned on "if … the responsible official chooses to apply a scoping process".
- **The order of elements inside any document.** All five element lists are prefaced by "may apply any format they choose" — 1b.3(g)(2), 1b.5(c), 1b.6(b), 1b.7(h), 1b.8(b). The rule fixes contents and fixes nothing about arrangement.
- **When comments are requested.** 1b.7(d)(3): "The process of obtaining and requesting comments may be undertaken at any time that is determined reasonable by the responsible official."
- **Whether a draft EIS exists at all.** 1b.7(n)(1): a responsible official "may choose to publish a draft environmental impact statement and any other pre-decisional materials".
- **Whether an NOI is published for an EA.** 1b.5(e)(3)(ii): "Publication of a notice of intent for an environmental assessment shall be at the sole discretion of the responsible official", and (e)(3)(i) says it "should be the exception rather than the norm".
- **Whether public comment is solicited on an EA at all.** 1b.5(e)(3)(iii): "Notwithstanding other statutory or regulatory requirements, the decision to solicit public comment in the notice of intent for an environmental assessment shall be at the sole discretion of the responsible official."
- **Whether no action is a stand-alone alternative.** 1b.5(c)(2)(i): "No action may be listed as a stand-alone alternative but is not required" — though its consequences "shall be included as part of the environmental impacts analysis".
- **Whether an EA analyses any alternatives at all.** 1b.5(c)(2)(ii): "When there are no unresolved conflicts concerning alternative uses of available resources, the environmental assessment need only analyze the proposed action and may proceed without consideration of additional alternatives."
- **Whether public hearings or meetings happen.** 1b.9(k): "as deemed necessary by the responsible official".
- **Whether a threshold determination is recorded.** 1b.2(e): "advisable".
- **Whether a FANEC carries a unique identification number.** 1b.9(u): a subcomponent "may provide a unique identification number on documentation for a finding of applicability and no extraordinary circumstances where useful to do so" — mandatory for EA and EIS, discretionary here.
- **Whether a reevaluation finding no update needed is documented at all.** 1b.9(r)(1): the subcomponent "may document the reevaluation determination in the proposal record in a format deemed sufficient by the responsible official".

### Who is competent to answer

The five reserved determinations, verbatim from 1b.11(a)(46) — this is the whole of the reservation and it is one sentence:

> Responsible official means the USDA subcomponent employee who has the authority to determine: when NEPA applies, what level of NEPA review is appropriate, the extent of environmental review; the final NEPA finding and compliance with other applicable laws, regulations, and executive orders; and, how to proceed for a proposed action or action alternative(s).

Beyond those five, the rule reserves further judgements to the responsible official by name:

- which resources are screened for extraordinary circumstances — 1b.3(f), "sole discretion", as informed by interdisciplinary review whether an effect is significant — 1b.7(a), "expert judgment, as informed by interdisciplinary analysis"
- whether an issue is substantive, and therefore whether it is analysed at all — 1b.7(a), "at the sole discretion of the responsible official"
- which disciplines prepare the document — 1b.9(g), "at the sole discretion of the responsible official"
- the signature on a FANEC, FONSI or ROD — 1b.3(g)(2)(vi), 1b.6(b)(5), 1b.8(b)(8)
- the page-limit and deadline certifications — 1b.5(d)(4), 1b.5(h), 1b.7(j), 1b.7(m); these are certifications by a responsible official that expressly DO NOT require a signature (1b.5(c)(6), 1b.7(h)(8))
- whether cause exists for a new deadline — 1b.5(g)(1), 1b.7(l)(2), "in the responsible official's judgment"
- emergency action taken without any NEPA analysis — 1b.9(v)(1)
- the outcome of a reevaluation, and whether updates are substantial — 1b.9(r)

**Interdisciplinary review is required, not optional, and one FANEC element depends on it.** 1b.9(g): "USDA subcomponents shall prepare environmental documents using an interdisciplinary approach that will ensure the integrated use of the natural and social sciences and the environmental design arts." And 1b.3(g)(2)(v) requires a FANEC to state that no extraordinary circumstances exist "as informed by the interdisciplinary review" — so the review is a precondition of a sentence the document must contain.

**Senior Agency Official** — the Deputy Secretary (1b.11(a)(49), 1b.2(b)), with authority delegable to a mission area Under Secretary or other subcomponent official under 1b.2(b)(2): concurrence for an EA or EIS on a 1b.4(a) subcomponent's action; the extraordinary-complexity determination allowing an EIS to exceed 150 pages up to 300 (1b.2(b)(2)(iii), 1b.7(i)(2)); authorising a deviation from the statutory time limit (1b.2(b)(2)(iv)); approving alternative arrangements for emergencies (1b.2(b)(2)(vi)); receiving and responding to lead-agency designation requests (1b.2(b)(2)(vii)); deciding whether an interagency disagreement is elevated to CEQ (1b.2(b)(2)(viii), 1b.9(o)); approving all revisions to this part, and the annual report to Congress (1b.2(b)(1)).

**CEQ** — consultation for up to 30 days before public notice when establishing or revising a categorical exclusion (1b.3(b)(2)) and when removing one (1b.3(d)(2)); consultation on emergency alternative arrangements where significant impacts are likely (1b.9(v)(3)); confirmation where another statute's procedure is substituted for a requirement of this part (1b.9(s)).

**An applicant or third party may prepare the documentation — 1b.10, the one place the rule lets someone outside the agency write the document.** 1b.10(a): subcomponents "may allow an applicant or other third party ( e.g., contractor) to prepare an environmental assessment or environmental impact statement, in whole or in part, under their supervision", and 1b.10(b) extends the same to FANEC documentation. Four constraints bind: "Each USDA subcomponent is responsible for the accuracy, scope, and content of documentation prepared by an applicant or third party under the supervision of the subcomponent"; (a)(4) "The subcomponent shall independently evaluate the information or documentation submitted … and it shall take responsibility for its contents"; (a)(5) "Applicants or third parties preparing an environmental assessment or environmental impact statement shall submit a disclosure statement to the lead agency that specifies any financial or other interest in the outcome of the action"; and (a)(7) requires a schedule, with major changes documented through written correspondence.

**Emergency channels are agency-specific.** 1b.9(v)(2)(i)–(v) name APHIS, FSA, Rural Development, the Forest Service and "all other USDA subcomponents" separately. For the Forest Service: "The Chief or Associate Chief of the Forest Service may grant emergency alternative arrangements under NEPA for categorical exclusions, environmental assessments, and associated findings."

### Four places where the current text does not resolve

Recorded because citations never inherit and every citation this app produces must resolve into current part 1b — and these four cannot, because the rule itself is wrong. Carried into §4 as regulation-settled items.

1. 1b.5(g)(2) cites "§ 1b.2(b)(5)(iv)". 1b.2(b) has paragraphs (1) and (2) only, so there is no (b)(5). The intended target is 1b.2(b)(2)(iv), which is what 1b.7(l)(1) cites for the identical purpose.
2. 1b.9(o) cites "§ 1b.2(b)(2)(ix)". 1b.2(b)(2) runs (i) through (viii). The intended target is (viii).
3. 1b.2(f)(2)(i) cites NEPA section 109 as "42 U.S.C. 336c"; 1b.3(c) cites the same section as 42 U.S.C. 4336c.
4. 1b.11(a) says terms "have the meanings provided in NEPA section 111, 42 U.S.C. 4336(e)", while the body of 1b.11 uses 4336e throughout. Several internal references are also written "§ 1b.11(53)" and "§ 1b.11(23)" where the paragraph is 1b.11(a)(53) and 1b.11(a)(23).

## §3 — Where the two meet

Five verdicts, not three, because two of your buckets each split. **answerable** — the backend can answer it today. **partial** — some of the shape exists and something specific is missing; recorded as partial rather than forced either way. **backlog** — could be answered if something named were added. **absent** — no representation at all, which is different from a backlog item because nobody has yet decided it belongs. **not in principle** — requires a human judgment, a professional qualification, or information that does not exist as data.

**One caveat that applies to every row.** "Answerable" here means the shape and the act exist and are exercisable — not that any row exists. 76 of 79 object types hold zero instances, so every verdict below is about capability, and the only real data in the build is the corpus.

### The determinations

| obligation | verdict | detail |
|---|---|---|
| D0 · NEPA applies at all — 1b.2(e) | partial | determination + open-determination write whichDetermination='det_nepa_applies' and citation='1b.11(a)(46)'. outcome is free text. MISSING: no address for the six grounds at (e)(1)– (6), so nothing records WHICH limb answered — and (e)(4) nondiscretionary and (e)(5) fundamental conflict are legally very different answers. branch is the right shape and record-branch is the right act; nothing creates a branch row. |
| D0 record keeping is ADVISABLE, not required — 1b.2(e) | answerable, and must stay this way | Nothing in the ontology forces a record of a threshold determination. That is correct. Recorded here so it is not later mistaken for a gap and hardened into a false constraint. |
| D1 · level of review, in sequence — 1b.2(f)(2)(i)–(iv) | backlog | determination.whichDetermination='det_review_level' exists. The SEQUENCE has no address: nothing records which limb was reached, or that (i)–(iii) were tried and failed, which is what (iv) is conditioned on. This is C9's "pathway state" and it is not built. |
| D1 may use any reliable data source; no new research unless essential — 1b.2(f)(1) | answerable as a discretion | A permission, not a duty. No address needed and adding one would invent a constraint. |
| D2 · extraordinary circumstances — 1b.3(e)–(f) | partial | screen + factor + state-factor-finding exist. factor.finding is closed at clear / present / undetermined, which correctly encodes 1b.3(f)(2)'s rule that mere presence is not an extraordinary circumstance — a two-member yes/no set would have made the stopping rule invisible. MISSING: a resource dimension (findings per resource, factor), a reference to whatever answered each, and any actor or timestamp on the finding. |
| The (f)(1) resource list is open-ended and at sole discretion | answerable as a discretion | "may include, but are not limited to", and the set is determined at the responsible official's sole discretion as informed by interdisciplinary review. Nothing encodes the eight classes today, which is the safe state — a closed enum of eight would be a false constraint that a reviewer would have to find again. |
| An extraordinary circumstance cured by modifying the action — 1b.3(f)(3) | backlog | No address. mitigation and designCriterion exist and are empty, but curing an extraordinary circumstance is not mitigation in the 1b.11(a) (29) sense — mitigation is documented in a FONSI or ROD in reaction to effects, and this is a change made so the categorical exclusion may proceed. |
| Reliance on other-law analysis for a no-EC finding — 1b.3(f)(4) | backlog | complianceRecord, applicableLaw and federalAuthorization exist, empty. No link from a factor finding to the compliance analysis relied on. |
| D4 · significance — 1b.2(f)(3), 1b.7(a) | not in principle, with a backlog half | The (f)(3)(iii) comparison is a judgement and 1b.7(a) makes it "the responsible official's expert judgment". What the backend COULD hold is the record that it was made and what it rested on: effectsFinding, effect and decisionFactor exist and are empty. Note the modal split — the five factors at (f)(3)(ii) are "should", the two rationale items at (f)(3)(iii) are "shall". |
| The five determinations, attributed — 1b.11(a)(46) | ANSWERABLE | The strongest match in the build. determination, the closed five-member whichDetermination taken from the rule's own clause, the two-step outcome-then-attribution refusal, actorPrincipal from current_user_id, and a submission criterion that refuses attribution while outcome is empty and refuses a new outcome once attribution exists. Fully exercisable today. Only gap: nothing refuses a duplicate (project, whichDetermination). |

### The categorical-exclusion machinery

| obligation | verdict | detail |
|---|---|---|
| A catalogue to screen against — 1b.2(f)(2)(i), 1b.4 | backlog — the single cheapest item | category exists WITH citation and descriptionVerbatim (added 2026-08-28) and holds ZERO rows. The 87 rows sit in ce_categories.json, a git artifact the transforms repo deliberately does not read. project_screened_against_category is correct and vacuous at the target end. §2 re-derives 87 from the pinned text, so the file and the rule agree. Five obligations below are blocked behind this one. |
| Which categories require documentation — 1b.4(c) vs 1b.4(d) | backlog | Blocked behind the population above. 39 live categories require no documentation; 48 require it. The question cannot be asked of an empty table. |
| 1b.4(a) — nine subcomponents excluded outright, unless an EC exists AND the Senior Agency Official concurs | ABSENT | New finding. No object type carries a USDA subcomponent identity and nothing records a concurrence. This is the third limb of 1b.4 and it is missing entirely — earlier work treats 1b.4 as a two-way split. |
| Adopting another agency's CE — 1b.2(f)(2)(ii), 1b.3(c) | backlog | 1b.3(g)(2)(ii) requires the FANEC to "specify that it was adopted". No property carries an adopted-from marker. |
| Establishing or revising a CE — 1b.3(b); removing one — 1b.3(d) | not in principle / out of scope | A rulemaking act requiring a written record, CEQ consultation for up to 30 days, and Federal Register notice. Not something a district-level record system performs. Recorded as out of scope rather than as a gap, so it is not later read as backlog. |
| Reliance on a prior CE determination — 1b.3(h) | backlog | Two variants: category applies where activities are substantially the same, and additionally no EC exists where the affected environment is substantially the same. precedent and prior_coverage exist in the spec and 51 corpus artifacts sit in prior-coverage-ipnf-knf; no object type records a reliance or the substantial-sameness explanation. |
| Applicant environmental documentation for a (d)(24) CE — 1b.4(d)(24) | absent | The chapeau imposes a specific documentary duty on the applicant: all components and connected actions, location on detailed site plans, maps equivalent to a USGS quadrangle, and authoritative confirmation of the presence or absence of sensitive resources, "accurate, complete, and capable of verification". Nothing represents an applicant submission. |

### The documents

| obligation | verdict | detail |
|---|---|---|
| The element spine for all five document types | partial | document → element → slot → claim traverses, and manifest → unsatisfiedElement traverses. Element counts are frozen at FANEC 6 / EA 7 / FONSI 5 / EIS 8 / ROD 8 = 34, and §2 re-derives every one of them correctly from the current text. All four types hold zero rows and nothing creates an element. |
| FANEC is REQUIRED only when all three of 1b.3(g)(1) (i)–(iii) hold | backlog | Needs category populated (limbs i and iii) and the factor screen (limb ii). Note the third limb: a FANEC is required only where the category requires documentation — so 39 of 87 categories produce no document at all. |
| FANEC six elements — 1b.3(g) (2)(i)–(vi) | partial | Spine exists; open-document can create a FANEC and has (one synthetic row). Nothing creates its elements. |
| Incorporation by reference — 1b.3(g)(2)(i), 1b.6(b)(1), 1b.8(b)(1), 1b.9(e)(7) | partial | incorporatedByReference exists with documentId and page (C11), zero rows. The rule's operative duty is that the material be "reasonably available for review by potentially interested parties" — a duty about the world, not about a link, and unrepresentable. TRAP: documentId refers to a pinned CORPUS artifact, never to a document object. |
| Date issued and signature of the responsible official — 1b.3(g)(2)(vi), 1b.6(b)(5), 1b.8(b)(8) | partial | responsibleOfficial and delegation exist, empty. Real attribution exists on determination via current_user_id. But there is no signature concept, and document carries no date-issued and no signatory property. A signature is also the corpus's largest gap (§5). |
| EA / EIS certifications explicitly need NO signature — 1b.5(c)(6), 1b.7(h)(8) | backlog, and must not be modelled as a signature | No object type carries a certification. The rule is explicit that approval to publish indicates concurrence and no signature is required, so this is a different shape from the FANEC/FONSI/ROD signature and collapsing the two would assert a signature the rule does not ask for. |
| Page limits — EA 75, EIS 150 or 300 — 1b.5(d), 1b.7(i) | partial | document.pageLimit and document.pageCount exist as properties; both null and nothing computes either. Extraordinary complexity additionally needs Senior Agency Official coordination (1b.7(i)(2)), which has no address. |
| Deadlines — EA 1 year, EIS 2 years, from the SOONEST of three triggers — 1b.5(e), 1b.7(k) | partial | document.deadlineDays, deadlineTriggerName and deadlineTriggerDate exist. Null. Nothing computes the soonest-of-three. |
| Deadline extension — 1b.5(g), 1b.7(l)(1) | backlog | No address for the new deadline, its written documentation, the reason it could not be met, or whether the applicant consented — and 1b.5(g) requires all of those in the proposal record. |
| Compelled publication on the day the deadline elapses — 1b.5(f), 1b.7(l) | ANSWERABLE | compelledPublication + publish-under-compulsion, with compellingRule closed at exactly {1b.5(f), 1b.7(l)} — which is exactly where part 1b compels publication, no more and no fewer. The still-pending list is unsatisfiedElement rows via manifest.unsatisfiedElements, written in the same transaction rather than as a facet. Attribution from current_user_id. Best-matched obligation in the build after the determinations. |
| FONSI five elements — 1b.6(b) | backlog | Spine exists, empty. |
| Selected alternative — 1b.6(b)(2), 1b.8(b)(3) | answerable in shape | Deliberately on determination.outcome, written by record-determination-outcome, and never as a 'selected' boolean on alternative — the recorded reasoning is that a boolean is settable by anything that can reach the store. alternative and document.alternatives exist, empty. |
| Mitigation, its AUTHORITY, and a monitoring/enforcement programme — 1b.6(b)(3), 1b.8(b)(6) | backlog | mitigation exists, empty, with no property for the statutory or regulatory authority the rule requires to be stated, and no monitoring or enforcement programme. The rule is emphatic that NEPA neither requires nor authorises the imposition of mitigation, so the authority is the load-bearing field. |
| EIS eight elements — 1b.7(h) | backlog | Spine exists, empty. The cover alone has five sub-items and a two-page limit. |
| Notice of intent — 1b.7(b)(1) (i)–(x) | ABSENT | No NOI object type. Ten mandatory contents. The NOI also fixes the website every later publication must use (1b.7(n)(2), 1b.8(c)). |
| Substantive comments — 1b.7(e), (f) | partial | comment and commentPublication exist, empty. The six action-taken types at 1b.7(f)(2)(i)–(vi) have no address — including "(vi) No action needed", which is the one a model would drop and the one that carries the rationale. |
| Filing with EPA and its notice of availability — 1b.7(o), 1b.8(e) | ABSENT | Nothing records the filing or the notice. 1b.8(e) makes the notice a precondition of lawful implementation, so this is an absence with legal consequence. |
| ROD eight elements — 1b.8(b) | backlog | Spine exists, empty. |
| ROD certification of consideration — 1b.8(b)(2) | backlog | Certify that all substantive alternatives, information and analyses submitted by State, Tribal and local governments and public commenters were considered. No address. |

### Process, record and competence

| obligation | verdict | detail |
|---|---|---|
| Proposal record — 1b.9(a)(1)– (11) | partial | corpusArtifact holds 312 rows with digest-verified provenance and is the closest thing to this in the build. sourceLayer, attestation and proposalRecordItem exist; proposalRecordItem holds zero rows and gained documentId/page in C11. None of the eleven enumerated categories is individually addressable. |
| Potential withholdings, privileges, classified material — 1b.9(c), (d) | partial | privilegeMarking exists, empty. 1b.9(d) requires segregation and, where segregation would leave meaningless material, withholding the entire analysis document — a rule about what may be published, which nothing enforces. |
| Interdisciplinary preparation — 1b.9(g), and 1b.3(g)(2)(v) | partial | discipline, holder, attestation, assignment, engagement, receivedArtifact and the two expert acts exist, and accept-artifact refuses a delivered artifactType that is not slot.artifactAwaited. Two gaps: nothing joins holder to the slot needing one (B.5.12, still open), so routing is chosen by hand; and nothing records that an interdisciplinary review HAPPENED, which is precisely what a FANEC must state. |
| Reliance on existing documents — 1b.9(e)(8) and its (vi)(A)–(C) disclosures | backlog | No object type records a reliance, the explanation of quantitative and qualitative substantial sameness, or the three circumstances that must be specified — not final within the preparing agency, subject to an adequacy referral, or subject to a non-final judicial action. |
| Programmatic reliance for five years — 1b.9(q) | partial | programmatic type and document.programmatic one-to-one link exist, empty. No reevaluation date, no validity determination, no brief documentation of why the analysis remains valid. |
| Reevaluation and supplementation — 1b.9(r) | backlog | No reevaluation type, no errata type, no supersession property. The errata sheet for a filed EIS has eight mandatory contents at (r)(3)(i)(A)– (H). |
| Unique identification number — 1b.9(u) | partial, and a recorded divergence | project.uniqueIdentificationNumber and its two-member issuer set exist and are populated on one synthetic row. The rule attaches the number to the EA and the EIS and makes it discretionary for a FANEC; modelling it on the project is defensible but it is a divergence. |
| Emergency actions — 1b.9(v) | ABSENT | No object type. Four agency-specific channels plus a CEQ route, and for the Forest Service specifically the Chief or Associate Chief may grant alternative arrangements. Absent entirely. |
| Applicant or third-party preparation — 1b.10 | ABSENT | No type for an applicant or third-party preparer and none for the (a)(5) disclosure statement of financial or other interest in the outcome. A named competence in the rule with no representation, and the one place the rule lets someone outside the agency write the document. |
| Lead, joint and cooperating agencies — 1b.9(m) | partial | agencyRole, leadAgencyContact and consultedParty exist, empty. 1b.9(m)(3)(ii) makes a cooperating-agency denial a reasoned act that must be documented in the proposal record; nothing holds it. |
| Whether an issue is substantive — 1b.11(a)(53), 1b.7(a) | not in principle | Expressly the responsible official's sole discretion. issue exists; C9 records that issue.disposition is single-valued while an issue may carry several (G134). |
| Notification of consulted parties and commenters — 1b.6(e), 1b.8(d) | backlog | "In the manner of communication used to consult" — so the channel is part of the obligation. contactChannel and consultedParty exist and are empty; nothing records that a notification was sent. |
| Severability — 1b.12 | n/a | Not an obligation on a document or a determination. |

### Tally, with the caveat that matters more than the numbers

Across the 44 rows above: 5 answerable, 15 partial, 15 backlog, 6 absent, 3 not in principle or out of scope. **Do not read the tally as progress.** Two of the five answerables — the five determinations and compelled publication — are answerable because they were built directly from the rule's own clauses and closed sets. The six **absent** rows are the more interesting number, because each is an obligation nobody has yet decided belongs in the ontology at all: the 1b.4(a) subcomponent exclusion, the notice of intent, EPA filing and the notice of availability, emergency actions, applicant and third-party preparation, and the (d)(24) applicant documentation duty. Four of those six sit on the EIS/ROD pathway, which is the pathway with the most obligations and the least representation.

- **The single highest-leverage change is populating category.** It is 87 rows already in the repository, and it moves five rows above out of backlog.
- **The second is anything that creates a slot.** Eleven of the seventeen acts are keyed on a row that nothing creates, and slot is the root of most of them — slots come from the slot-register projection, whose transform input is unbound.
- **The third is the submission-time Function,** because it is the only thing that can hold eight named preconditions, two of which are intent-predicate clauses.

## §4 — Unknowns

An unknown here is a finished output, not an unfinished one. Nothing in this section has been filled in to make the file look complete.

### Settled by a domain expert

Each of these is answerable without reading the rest of this document.

1. When one of the nine subcomponents listed at 1b.4(a) determines that an extraordinary circumstance exists for an individual action, what does the Senior Agency Official's concurrence physically consist of — a memo, an email, a signature block on the finding, or something else?
2. 1b.3(g)(2)(v) requires a FANEC to state that no extraordinary circumstances exist "as informed by the interdisciplinary review". In practice, is that review a meeting, a set of specialist reports, a routing sheet, or an initialled checklist — and what would a reviewer expect to find in the proposal record as evidence it happened?
3. Does a ranger district ever apply a categorical exclusion adopted from a non-USDA agency? If so, how is 1b.3(g)(2)(ii)'s requirement to "specify that it was adopted" normally worded on the face of the document?
4. When an EA and a FONSI are combined into one document under 1b.6(a), what is the combined document called on its cover, and is it published as one artifact or two?
5. 1b.5(c)(6) and 1b.7(h)(8) say the certifying statement needs no signature and that approval to publish indicates the responsible official concurs. What records that approval today — a workflow step, an email, a date stamp, or nothing?
6. When a deadline is extended under 1b.5(g) or 1b.7(l)(1), where is the written documentation of the new deadline kept, and who besides the applicant is normally notified?
7. 1b.9(u) makes a unique identification number mandatory for an EA and an EIS and discretionary for a FANEC. Is one in fact used on FANECs locally, and if so is it drawn from the same series?
8. A FANEC carries no publication duty under 1b.3. What does a district actually do with one once it is signed — post it, file it, send it somewhere, or all three?
9. For a Decision Memo issued under the prior rule, what is the current-rule equivalent in practice? The current text has no Decision Memo, and 32 of the held exemplars are Decision Memos.

### Settled by ontology work

- **Populate category from ce_categories.json.** 87 rows, already in the repository, no egress and no retrieval. §2 independently re-derives 87 from the pinned text, so the file and the rule agree and the projection is safe. Named as the cheapest high-value population in the change plan and still not done; §3 shows five obligations blocked behind it.
- **Object-dataset materializations for adoption, assignment, determination, engagement and receivedArtifact.** A person must do this in Ontology Manager; no tool exposes it, so it cannot be planned around. Until it exists no transform can read an act-written row, and ratification can never hold one.
- **A submission-time Function.** There is currently no Function of any kind in this project. Eight named preconditions wait on one — the list is in §1. Two of them are intent-predicate clauses 1 and 2, and one is the pass-only half of clause 3 that was lost when stamp-verifier-verdict widened.
- **A resource dimension on the extraordinary-circumstance screen,** so 1b.3(f)'s questions are findings per (resource, factor), plus a reference to whatever answered each and an actor and timestamp on the finding. Attribution belongs with that reshape, not hung off the current shape and then undone.
- **Pathway state.** Which document types remain possible given screening so far. document.documentType names the type of a document that exists, not the set still open, and 1b.2(f)(2) is an ordered elimination.
- **The branch set for 1b.2(e)(1)–(6),** so a NEPA-does-not-apply determination records WHICH limb answered. branch and record-branch exist; nothing creates a branch row.
- **Reevaluation, supplementation and errata (1b.9(r)).** No type, and the errata sheet has eight mandatory contents.
- **Applicant and third-party preparation (1b.10),** including the 1b.10(a)(5) disclosure statement of financial or other interest. A named competence in the rule with no representation at all.
- **1b.4(a) subcomponent identity and Senior Agency Official concurrence.** The third limb of 1b.4 is absent from the ontology entirely.
- **EPA filing and notice of availability.** 1b.8(e) makes the notice a precondition of implementation; nothing records either.
- **Mitigation authority and the monitoring/enforcement programme.** 1b.6(b)(3) and 1b.8(b)(6) require the statutory or regulatory authority to be stated wherever mitigation is adopted. mitigation exists with no property for it.
- **Decide where the unique identification number lives.** It is on project today; the rule attaches it to the EA and the EIS (1b.5(c)(7), 1b.7(h)(1)(v)). Defensible as a simplification, but it is a divergence and should be recorded as one rather than discovered.
- **Clear the pass default on stamp-verifier-verdict,** by hand in Ontology Manager. Not expressible through the API path the widening used.
- **Give citable the treatment classDeclared already got.** A bare null is carrying a refusal on 25 rows.
- **Retype slot.reference and split the 56 multi-valued rows (C9).** The only item touching populated data — and note "populated" means the in-repo store, because slot holds zero rows on the platform.
- **Decide whether binding-constraint becomes a fifth jurisdiction.** SOURCE-REGISTER recommends adopting it in the same change that lands the first Biological Opinion, not before, because a jurisdiction with no member is a clause quantifying over an empty set.

### Settled by the regulation itself

Four of these are defects in the current text. They matter because every citation this app produces must resolve, and a citation that does not resolve in the source cannot be made to resolve downstream.

- **1b.5(g)(2) cites "§ 1b.2(b)(5)(iv)", which does not exist.** 1b.2(b) has paragraphs (1) and (2) only. The intended target is almost certainly 1b.2(b)(2)(iv) — authority to review and determine whether to authorise a deviation from the NEPA §107(g) time limit — which is what 1b.7(l)(1) cites for the same purpose. Confirm before building a resolver that silently repairs it.
- **1b.9(o) cites "§ 1b.2(b)(2)(ix)", which does not exist.** 1b.2(b)(2) runs (i) through (viii). The intended target is (viii), facilitating interagency disagreements and determining whether to elevate to CEQ.
- **1b.2(f)(2)(i) cites NEPA section 109 as "42 U.S.C. 336c".** 1b.3(c) cites the same section as 42 U.S.C. 4336c. One of the two is a typographical error and it is the former.
- **1b.11(a) opens "terms have the meanings provided in NEPA section 111, 42 U.S.C. 4336(e)".** Section 111 is codified at 42 U.S.C. 4336e, which is what the body of 1b.11 uses throughout.
- **Whether 1b.12's non-amendment is deliberate.** Severability is the only section the 2026-04-03 final rule did not touch; it still carries its 2025-07-03 text. Probably intentional, not verified.
- **Whether anything amended part 1b between 2026-08-25 and 2026-09-01.** The pin and its independent drift witness both reach eCFR issue date 2026-08-25 and agree byte for byte. Your currency line is 2026-09-01. Seven days are unverified, and the check that would close them is the one thing in this build that would ever want to run on a schedule.
- **Reconcile reg/version.json's latest_amended_on.** It records 2026-08-17 while the per-section version history records the part's last amendment as 2026-07-02. The former is a title-level field and the latter is part-level, so they are probably both right — but the two have never been reconciled in writing and one of them will be read as the other.

### Settled by you

- **Where did you see the all-zeros ontology RID?** It is not in foundry.config.json, which carries no ontology RID at all, and the live ontology resolves. If it is in generated/type_definitions.json it is inert — that file is spec, names the retired chrisp-sr namespace, and nothing reads it at runtime. If it was in the deleted interface it went with it.
- **Do you want the env.test.ts gate removed?** The variables are all filled, so the premise of your note is already satisfied — but the test is wrapped in test.skipIf(VERIFY_ENV_PRODUCTION !== "true") and CI never sets that variable, so a tagged release passes the check without running it. That is a live defect and it is the inverse of the one you described. Removing the gate, or setting the variable in ci.yml, is a one-line change and a decision rather than a discovery.
- **Do you want the Developer Console import list audited?** I cannot read it from here. It is the one place where a type can hold rows and still be invisible, and with 76 of 79 types empty a missing import is indistinguishable from an empty type.
- **Which pathway is in scope first?** §P.2 says all five are built to completion. The corpus can support sufficiency evidence for none of them under the current rule, so the ordering cannot be chosen on evidence availability — it has to be chosen on something else.
- **Is the FANEC's absent publication duty a feature or a gap for you?** 1b.3 imposes no publication and no notification duty on a FANEC. It is the highest-volume pathway and the one with no export obligation, which makes it either the cheapest thing to ship or the one where an app adds least.
- **Should the two synthetic project rows and the synthetic document be deleted?** One is explicitly labelled "C5 write-path tracer — safe to delete"; the other is named "lk" and looks like a slip. They are the only rows in the ontology outside the corpus, so anything that counts projects counts them.

## §5 — Document production

Written after §2 and anchored to it. The corpus is authoritative here for SUFFICIENCY ONLY — how much detail a real document carried. Never for structure, never for citations, never for whether something is required. Those come from §2.

### Vintage first, because it changes what the rest of this section is worth

312 corpus artifacts: 283 practice, 4 regulation, 25 undeclared. That settles a dispute SOURCE-REGISTER recorded two ways — the split is 283/4, not 285/2.

| rule vintage | artifacts | what it is |
|---|---|---|
| unknown | 169 | 43 are non-USDA agency documents to which neither rule applies; the rest cite no NEPA procedural rule anywhere in their text. Vintage was never inferred from a decision date. |
| 36 CFR 220 (2024-12-31) | 100 | superseded on 2025-07-03 |
| 36 CFR 220 (older vintages) | 11 | 2008 through 2023. Superseded. |
| 7 CFR 1b (2025-07-03) | 5 | the INTERIM FINAL RULE. Superseded on 2026-04-03. |
| 7 CFR 1b (2026-08-25) | 2 | the two drift-witness copies of THE REGULATION ITSELF. Not practice documents. |
| null | 25 | forest-plan-raw, manifests, cover notes — no class declared |

**So: zero practice exemplars under the current rule.** Your prediction was that it is plausible nothing in the corpus predates the current text, and near-certain for FANECs because that document type postdates the revision. Half right, and the wrong half is the one that matters. FANEC postdates the *interim* rule of 2025-07-03, not the *final* rule of 2026-04-03. All four held FANECs carry vintage 7CFR1b-2025-07-03 — written under text superseded nine months later. There is no current-rule exemplar of ANY document type, FANEC included, and the only artifacts carrying the current vintage are two copies of the rule.

| type | held | vintage |
|---|---|---|
| FANEC | 4 | all 7CFR1b-2025-07-03 — interim rule, superseded |
| DM (Decision Memo) | 32 | 28 at 36 CFR 220 (2024-12-31), 4 unknown. NOTE: the Decision Memo is a PRIOR-RULE instrument; current part 1b has no such document. |
| EA | 29 | 19 at 36 CFR 220, 9 unknown, 1 at 36 CFR 220 (2008-07-24) |
| FONSI | 34 | 12 at 36 CFR 220, 22 unknown |
| EIS | 51 | 14 at 36 CFR 220, 36 unknown, 1 at 36 CFR 220 (2020-11-19) |
| ROD | 47 | 16 at 36 CFR 220, 31 unknown |

**Nothing older is promoted to stand in.** For every document type the honest statement is: no current-rule exemplar exists. The 26 FSH 1909.15 chapters are in the same position and worse — the handbook was rescinded in its entirety by WO Amendment 1909.15-2026-1 effective 2026-03-26, so it is superseded practice and never a current citation.

### What a document is, as a file

- **Type: PDF, overwhelmingly.** 271 PDFs across five corpora. 253 born-digital and quotable at a page; 14 image-only; 2 truncated at source and unopenable by pypdf; 2 ocr-derived.
- **Length: three orders of magnitude, and the document is the wrong unit.** One corpus FONSI is 4 pages sitting at pp. 31– 34 of a 155-page file. Sufficiency lives at a PAGE RANGE inside a document, not at a document, and typing whole documents would teach the wrong length.
- **Maps, figures, tables: present, and one is image-only because it IS a map.** IPNF-2015-Plan-Map-Timber-Suitability.pdf has no text layer, which is the nature of the artifact and not a defect. The rule already anticipates this: a page of graphical material counts toward the page limit, and an item larger than 8.5×11 counts as one page (1b.5(d)(3), 1b.7(i)(3), 1b.11(a)(33)).
- **Appendices: common, and constrained by the rule rather than by practice.** 1b.5(d)(2) and 1b.7(h)(7)(iv): appendices are for voluminous substantiating material and "are not to be used to provide additional substantive analysis, because that would circumvent the Congressionally mandated page limits". They also do not count toward the page limit.
- **Attachments and sidecars: specialist reports travel separately.** 49 specialist reports are held across twelve disciplines; 48 of 49 carry rule vintage unknown, correctly — a specialist report is a technical resource analysis and does not cite the agency's procedural rule.

### Incorporation by reference, in practice

From the rule (§2, not the corpus): FANEC, FONSI and ROD each *open* with an incorporation instruction — 1b.3(g)(2)(i), 1b.6(b)(1), 1b.8(b)(1). So resolution is not optional. 1b.9(e)(7) sets the operative duties: cite the incorporated material "in a manner that identifies the content it contains" and "make the materials reasonably available for review by potentially interested parties"; where comment is invited the material must be available for inspection within the comment period (1b.9(e)(7)(ii)); and privileged, classified or otherwise withheld material should not be incorporated unredacted, because it is not available for review (1b.9(e)(7)(iii)).

**What the backend holds.** incorporatedByReference exists with documentId and page (added by C11), zero rows. The resolvable unit is therefore a page range in a held artifact, which matches the corpus grain. Two traps: documentId on a corpus-side type refers to a PINNED ARTIFACT and never to a document object, so a link there would be wrong rather than empty; and the availability duty is a duty about the world, not about a link — nothing in the ontology can hold it.

### Who signs, and what the signature block contains

**From the rule — and the split is sharper than practice would suggest.** Three document types require a signature and two explicitly do not.

| document | signature requirement |
|---|---|
| FANEC | 1b.3(g)(2)(vi) — "Include the date issued and signature of the responsible official." Implementation may begin once signed (1b.3(j)). |
| FONSI | 1b.6(b)(5) — "Include the date issued and the signature of the responsible official." |
| ROD | 1b.8(b)(8) — "Include the date issued and the signature of the responsible official." |
| EA | 1b.5(c)(6) — "The certifying statement does not require a signature. Approval to publish the environmental assessment to a USDA website indicates the responsible official has reviewed the environmental assessment and concurs with the certifying statement." |
| EIS | 1b.7(h)(8) — same words. No signature. |

Two further rules about the block itself. Where more than one responsible official signs one document, 1b.9(n)(2): "When multiple signature blocks are included, the document shall specify what each signing responsible official is approving or authorizing given the nature of the actions proposed and the responsible official's statutory authority." And an errata sheet for a filed EIS carries its own "Date and signature of the responsible official" (1b.9(r)(3)(i)(F)).

**From the corpus, on sufficiency only — and it cannot supply this.** 67 of 151 items in nepa-decided and 27 of 51 in prior-coverage-ipnf-knf carry signatoryRole "unknown", overwhelmingly because Forest Service DN/FONSI and Decision Memo signature blocks are scanned images with no text layer, and re-OCR was prohibited because it would alter bytes the manifest pins. 86 of 151 carry decisionDate "unknown" — partly the same cause, partly because an EIS carries no decision date or signature at all, only a month-level cover date that cannot be rendered as YYYY-MM-DD. **So the historical corpus cannot**

**presently supply a signature exemplar for any document type, because the signature page is the part that did not survive extraction.** Leaving them unknown was the right call; a guessed signatory is worse than an absent one.

### Amendment and supplementation after issue

**Yes, and 1b.9(r) is specific about it.** Reevaluation is required — "shall reevaluate" — where a major Federal action or portion of it is incomplete and ongoing AND the subcomponent makes substantial changes, or there are new circumstances or information with relevance that bear on the action "such that there is potential to alter the disclosure of adverse effects". Three outcomes:

1. **No update needed (1b.9(r)(1)).** Implementation may continue; the determination MAY be documented in the proposal record in a format the responsible official deems sufficient.
2. **Update to a document other than a filed EIS (1b.9(r)(2)).** Minor corrections: continue, document the reevaluation in the proposal record, and post the reevaluation documentation to the USDA website alongside the original. Substantial changes: stop the affected portions unless an emergency authority or exemption is invoked, supplement the published document, consider whether a higher level of NEPA review is warranted, and post the supplement as a SEPARATE version from the original.
3. **Update to a filed EIS (1b.9(r)(3)).** Minor: file an errata sheet with EPA carrying eight specified contents at (r)(3)(i)(A)–(H) — the EIS title as filed, a citation to EPA's Federal Register notice of availability, citations to the pages and sections being updated, clear descriptions and an explanation of why, a statement by the responsible official that the updates do not substantially change the action, do not add disclosure of additional significant adverse impacts and DO NOT CHANGE THE DETERMINATIONS MADE IN THE RECORD OF DECISION, the date and signature of the responsible official, publication of the errata to the USDA website, and notification where necessary. Substantial: a supplemental EIS under 1b.7.

**None of this has an address in the ontology.** There is no reevaluation type, no errata type, and no property recording that a document was superseded by a supplement. Programmatic reliance has half a home — the programmatic type and the document.programmatic one-to-one link exist, empty — but 1b.9(q)'s five-year clock, the reevaluation after it, and the brief documentation of why the analysis remains valid have none.

### What the county actually files, publishes or hands on — the export target

| document | published where | handed on to whom |
|---|---|---|
| FANEC | NO publication duty in 1b.3. | Nobody, by the rule. Implementation may begin once signed (1b.3(j)). This is the one pathway with no export obligation at all. |
| EA | A USDA website (1b.5(f)). Publication is what makes it complete and stops the statutory clock. | No notification duty in 1b.5. If the deadline elapses first it must be published anyway, on the day, "in as substantially complete form as is possible". |
| FONSI | The same USDA website as the EA (1b.6(d)), unless combined into one document with it (1b.6(a)). | Every agency and person consulted, as identified in the EA — and "Notification shall be in the manner of communication used to consult with the agency or person" (1b.6(e)). |
| EIS | The USDA website named in the NOI (1b.7(n)(2)) AND filed with EPA (1b.7(o)). | Participating agencies and the public, optionally at the same time as filing. EPA then publishes a weekly notice of availability in the Federal Register. |
| ROD | The USDA website named in the NOI (1b.8(c)), unless combined with the EIS (1b.8(a)) — in which case the EIS cover page should be updated and it is filed too. | Agencies and persons consulted as listed in the EIS, AND any party that commented in response to the NOI or any other comment opportunity (1b.8(d)), in the manner used to consult. |

**So the export target is three things, not one:** a published web artifact in every case except FANEC; an EPA filing for the EIS; and a notification list derived from the consulted parties and, for the ROD, from the commenters. consultedParty, comment, commentPublication and contactChannel all exist and all hold zero rows. Nothing records an EPA filing or the notice of availability, and 1b.8(e) makes that notice a precondition of lawful implementation.

**Two constraints, honoured.** Every exemplar above carries the vintage the corpus recorded, and no document type has a current-rule exemplar — so nothing here has been promoted to stand in for one. Every citation in this section resolves into the pinned current text, with the four exceptions the regulation itself gets wrong, which are listed once in §4 and not repeated. The corpus remains a backend retrieval source with provenance; it is not shipped and not built against.
