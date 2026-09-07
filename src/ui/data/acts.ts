/** The write seam.
 *
 *  The design renders acts everywhere — `Action`, `ActionLook`, `SubmitBar`,
 *  `Destination`, the intake dialog, the signature gate — and until now the
 *  port had no way to perform one. This file declares every act the interface
 *  offers, so wiring one is mapping a declaration to an ontology action rather
 *  than deciding what the interface meant.
 *
 *  All seventeen are here because §1 lists seventeen and the interface may not
 *  quietly offer a sixteenth or invent an eighteenth.
 *
 *  WHAT "confirmed" MEANS, and it is narrower than it looks. §1's action table
 *  names, for each act, the properties it WRITES. It never publishes a
 *  parameter list. So a parameter marked `confirmed` is confirmed as a string
 *  the register uses for that act, not as a parameter the platform accepts;
 *  and the eight marked `proposed` are all target-object references
 *  (`determination`, `branch`, `factor`, `consistencyDetermination`,
 *  `manifest`, `engagement`, `slot`) whose object types exist and whose
 *  parameter names are this interface's guess. Check the eight against the
 *  action's own signature before wiring. 76 of 79 object types hold zero rows,
 *  so a near-miss and an empty type are the same pixel.
 *
 *  ONE FAILURE RULE, derived rather than chosen per act. `reserved` names the
 *  §7.2 row that reserves this act's surface to a named holder, or is null.
 *  A failed act takes `blocked` where it is reserved — the refusal is
 *  answerable, so the row stays in place and offers the routing — and
 *  `unresolved` everywhere else, because §1 defines unresolved as a lane that
 *  could not have answered. `acts.test.ts` holds the mapping, so two acts on
 *  the same submit bar cannot render different states for the same failure.
 *
 *  PRE-CHECK VERSUS BACKEND-REJECT. `preChecks` are cheap, local and certain:
 *  the interface refuses before sending. `backendRejects` are everything the
 *  interface must let the platform refuse — authority above all. A gate held
 *  only in the client is not a gate, so a reserved surface withholds the act
 *  AND the platform refuses the write; the client never asserts a credential
 *  it cannot verify. Note that eight named preconditions wait on a
 *  submission-time Function that does not exist (§1), so several of these are
 *  refusals nothing currently performs. They are declared as backend rejects
 *  anyway: the interface must not grow a client-side substitute for a
 *  guarantee the platform is supposed to hold.
 *
 *  No imports on purpose: this is data, like `bindings.ts`, and a generator
 *  should be able to load it without pulling React in behind it.
 */

/** Whether this exact string is the register's own, or this interface's guess.
 *  A wrong `confirmed` is the worst defect this file can carry. */
export type NameStatus = "confirmed" | "proposed";

/** `exercisable` — the act can be run today, on rows that exist.
 *  `blocked`     — the act exists and is keyed on a row nothing creates.
 *  `proposed`    — no such action exists; the ontology is what changes. */
export type ActStatus = "exercisable" | "blocked" | "proposed";

export interface ActParam {
  /** Ontology parameter API name. */
  name: string;
  status: NameStatus;
  /** The TypeScript type the interface passes. */
  type: string;
  required: boolean;
  /** The exact allowed values, where the act closes the set. Omitted rather
   *  than part-filled: §1 measures five sets as closed and names the members
   *  of only three, and a half-listed set reads as a complete one. */
  closedSet?: string[];
  note?: string;
}

export interface ActDecl {
  /** Exact action API name, with the `signature-ready-` prefix. */
  apiName: string;
  status: ActStatus;
  /** What the officer is doing, in the interface's vocabulary. */
  serves: string;
  /** The §7.2 row reserving this surface to a named holder, or null. */
  reserved: string | null;
  /** Where the interface offers it. Empty ONLY where `unplaced` says why, so
   *  an act with nowhere to go reads as designed rather than as an oversight —
   *  the same distinction Region draws between absent and unresolved. */
  offeredOn: string[];
  /** Why this act has no surface, or null where it has one. An act the design
   *  never placed is a finding about the design, and it is declared here
   *  rather than left as an empty list nobody reads. */
  unplaced: string | null;
  /** `objectType.property` pairs written, in the register's own names. */
  writes: string[];
  /** Six of the seventeen take their actor from `current_user_id`; the rest
   *  write none, each for a reason §1 records. (§1's prose says four and its
   *  own table says six — five writing `actorPrincipal`, one writing
   *  `emittedBy`. The table is what is followed here, and the discrepancy is
   *  recorded rather than resolved.) */
  actor: "current_user_id" | "none";
  params: ActParam[];
  /** What the interface refuses before sending. */
  preChecks: string[];
  /** What the interface must let the platform refuse. */
  backendRejects: string[];
  onSuccess: {
    mode: "optimistic" | "refetch" | "both";
    /** Port members whose data this act stales, by exact member name. Every
     *  entry is reciprocated by that binding's `freshness.invalidatedBy`, and
     *  `acts.test.ts` fails on a one-sided edge — an adapter that builds its
     *  invalidation graph from either file gets the same application. */
    invalidates: string[];
    note: string;
  };
  onFailure: {
    /** Derived from `reserved`. See the failure rule above. */
    region: "unresolved" | "blocked";
    /** The words shown. No backend vocabulary reaches the screen. */
    message: string;
    /** Whether the officer's typed input survives the failure. */
    preservesInput: boolean;
  };
  /** What does not exist yet. Empty means the act is exercisable today. */
  needed: string[];
  notes: string[];
}

export const ACTS: Record<string, ActDecl> = {
  "signature-ready-submit-intake": {
    apiName: "signature-ready-submit-intake",
    status: "exercisable",
    serves: "starts a project from the four administrative fields, and opens its page",
    reserved: null,
    offeredOn: [
      "InboxScreen — the Initiate project button inside ListControls",
      "IntakeDialog — §7.3's initiation overlay; Start project submits and navigates to the project page",
      "ElementScreen — Step 0 Intake, whose five tabs close through ActionBar; §7.3 names submit-intake as the step's act and records that it writes a subset of what the step carries"
    ],
    unplaced: null,
    writes: [
      "project.name",
      "project.uniqueIdentificationNumber",
      "project.uniqueIdentificationNumberIssuer",
      "project.anticipatedImplementationStart",
      "project.synthetic"
    ],
    actor: "none",
    params: [
      {
        name: "name",
        status: "confirmed",
        type: "string",
        required: true,
        note: "The overlay's first field. §1 records the property written; parameter requiredness is not measured on this act."
      },
      {
        name: "uniqueIdentificationNumber",
        status: "confirmed",
        type: "string",
        required: false,
        note: "1b.9(u) makes the number mandatory for an EA and an EIS and discretionary for a FANEC, and no pathway is fixed at intake. §3 records modelling it on project as a divergence rather than a defect."
      },
      {
        name: "uniqueIdentificationNumberIssuer",
        status: "confirmed",
        type: "string",
        required: false,
        note: "§1 measures the set as closed at two and names neither member, so closedSet is omitted rather than part-filled and IntakeDialog's select still carries ⟨issuer.1⟩ and ⟨issuer.2⟩."
      },
      {
        name: "anticipatedImplementationStart",
        status: "confirmed",
        type: "string",
        required: false,
        note: "An ISO-8601 date. The rule requires a statement of when implementation is anticipated to begin on the FONSI and the ROD — 1b.6(b)(4), 1b.8(b)(7) — and requires nothing at intake."
      },
      {
        name: "synthetic",
        status: "confirmed",
        type: "boolean",
        required: true,
        note: "A real intake writes false. Both existing project rows carry synthetic=true and §1 records that anything counting projects counts them. §1 states 'required, never defaulted' of open-document's synthetic and not of this one."
      }
    ],
    preChecks: [
      "an empty name; the act carries no criterion that would refuse one",
      "an issuer that is not one of the two the closed set holds; the field is a selection, so anything else is a client defect and not a submission",
      "a second submit while the first is in flight; §1's fifth state is in-flight and must not look like absent"
    ],
    backendRejects: [
      "a caller outside the organization marking; all 17 acts carry INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e) (§1)",
      "nothing else. §1 records no submission criterion on this act and no uniqueness over name or uniqueIdentificationNumber, so a duplicate project is created without complaint"
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [
        "useInbox",
        "useProject"
      ],
      note: "The created row's reference is the route — IntakeDialog navigates to projectPath — so it has to come back from the write rather than be assumed. useSteps is not listed: Steps 0–2 are shared, come from pathways.ts, and do not depend on the row."
    },
    onFailure: {
      region: "unresolved",
      message: "The project could not be started. Nothing was written, and the fields are as you left them.",
      preservesInput: true
    },
    needed: [
      "the two members of uniqueIdentificationNumberIssuer; §1 measures the set as closed at two and names neither, so the select cannot be built from the register",
      "an ontology address for the rest of Step 0; §7.3 records that submit-intake writes a subset of the five tabs and the remainder has none",
      "a decision on the two synthetic project rows. §4 asks whether they are deleted; until it is answered every real intake lands in a list of two tracers"
    ],
    notes: [
      "Proved. §1 names submit-intake one of four acts that can be run today, with two rows written by it — 'C5 write-path tracer — safe to delete' and one named 'lk' with every other field null.",
      "project rows live in the edits layer; signatureReady.project holds zero rows, so no transform can read one back (§1).",
      "Creating a project is not a reserved determination, which is why the act writes no actor (§1). Nothing on the row records who started it, and useInbox already carries the missing holder-to-project relation.",
      "The overlay and Step 0 are different things and are not merged. The overlay carries general administrative information; Step 0 carries the detail the review itself needs (§7.3)."
    ]
  },

  // Deliberately NOT reserved. §7.2 reserves the five determinations at
  // 1b.11(a)(46) to the responsible official, and §1 says of this act "none —
  // opening is not deciding": it creates the row, and the pair that follows
  // records the outcome and attributes it. Reserving the opening would gate a
  // surface the regulation leaves open.
  "signature-ready-open-determination": {
    apiName: "signature-ready-open-determination",
    status: "exercisable",
    serves: "opens one of the five reserved determinations on this project, before anything is decided",
    reserved: null,
    offeredOn: [
      "ElementScreen — Step 1 · does-nepa-apply, through ActionBar; §7.3 gives the chain open-determination (det_nepa_applies) → record-determination-outcome → record-determination",
      "ElementScreen — Step 2 · level-of-review, the tab named Sequence and significance, through ActionBar; §7.3 gives open-determination (det_review_level)"
    ],
    unplaced: null,
    writes: [
      "determination.whichDetermination",
      "determination.citation",
      "determination.project"
    ],
    actor: "none",
    params: [
      {
        name: "whichDetermination",
        status: "confirmed",
        type: "string",
        required: true,
        note: "Closed at five, taken from the rule's own clause. The guidance names two of the five verbatim — det_nepa_applies (§3, §7.3) and det_review_level (§3, §7.3) — and not the other three, so closedSet is omitted rather than part-filled."
      },
      {
        name: "project",
        status: "confirmed",
        type: "string",
        required: true,
        note: "The project the determination hangs on. §1 lists project among what the act writes, so the name is the register's; whether the parameter carries an object reference or a primary key is not recorded."
      }
    ],
    preChecks: [
      "no project in the route; the act writes project and the tab is unreachable without one",
      "a whichDetermination that is not one of the five; the row is a selection",
      "a second open while the first is in flight; §1's fifth state is in-flight and must not look like absent"
    ],
    backendRejects: [
      "a caller outside the organization marking; all 17 acts carry INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e) (§1)",
      "a second determination of the same kind on the same project. Uniqueness over (project, whichDetermination) is one of the eight guarantees waiting on the submission-time Function; §1 records that nothing refuses a second det_nepa_applies today, and the surface offers the refusal to the backend rather than holding it"
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [
        "useSteps",
        "useElement"
      ],
      note: "The created row is what record-determination-outcome and record-determination are keyed on, so its reference has to come back from the write. §1 records that open-determination creating a determination is what makes that pair reachable at all."
    },
    onFailure: {
      region: "unresolved",
      message: "The determination could not be opened. Nothing was written.",
      preservesInput: true
    },
    needed: [
      "the three unnamed members of whichDetermination; §1 measures the set as closed at five and the guidance names det_nepa_applies and det_review_level only",
      "the submission-time Function, which holds uniqueness over (project, whichDetermination) along with seven other named preconditions. There is no Foundry Function and no AIP Logic in this project (§1)",
      "the exact static citation string. §1's actions table writes it '1b.11(a) (46)' and §3 writes it '1b.11(a)(46)'; it is not a parameter, so a screen that echoes it echoes whichever the platform holds"
    ],
    notes: [
      "Opening is not deciding, which is why the act writes no actor (§1). Attribution arrives two acts later, on record-determination.",
      "citation is written static and is not a parameter (§1). The five determinations and that clause are one sentence — 1b.11(a)(46) is the whole of the reservation.",
      "determination is one of the ten wave-2 edges §1 records as traversing, so the project → determination link resolves.",
      "§3 names the five determinations the strongest match in the build: the closed member set from the rule's own clause, the two-step outcome-then-attribution refusal, and attribution from current_user_id. The one gap is the duplicate.",
      "§7.2's access-gate table reserves the five determinations at 1b.11(a)(46) to the responsible official. pathways.ts carries a GateSpec on the three signature rows only, and §1 records no platform predicate for a caller's class, so nothing withholds this act from anyone inside the organization marking."
    ]
  },

  "signature-ready-record-determination-outcome": {
    apiName: "signature-ready-record-determination-outcome",
    status: "exercisable",
    serves: "records what the determination decided, while it is still unattributed",
    reserved: "§7.2 — the five determinations at 1b.11(a)(46), reserved to the responsible official",
    offeredOn: [
      "ElementScreen — Step 1 · does-nepa-apply, through ActionBar (§7.3)",
      "ElementScreen — Step 2 · level-of-review, through ActionBar (§7.3)",
      "ElementScreen — P3 Step 6 · fonsi, the 1b.6(b)(2) row; §3 puts the selected alternative on determination.outcome",
      "ElementScreen — P4 Step 8 · rod, the 1b.8(b)(3) row, on the same reasoning"
    ],
    unplaced: null,
    writes: [
      "determination.outcome"
    ],
    actor: "none",
    params: [
      {
        name: "determination",
        status: "proposed",
        type: "string",
        required: true,
        note: "Proposed, and normalised from the object type. §1 names the property a modify act writes and never the parameter that carries the row it edits; nothing in the register or either amendment fixes this name."
      },
      {
        name: "outcome",
        status: "confirmed",
        type: "string",
        required: true,
        note: "Free text. §3 records outcome as free text, and the act closes no set — a screen offering a select here would be inventing the closure."
      }
    ],
    preChecks: [
      "an empty outcome; the act writes outcome only, and a modify with nothing in it is not a record",
      "no determination in hand; open-determination has to have run first, and §1 records that this act is reachable only because it does",
      "a second record while the first is in flight; §1's fifth state is in-flight and must not look like absent"
    ],
    backendRejects: [
      "a caller outside the organization marking; all 17 acts carry INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e) (§1)",
      "an outcome on a determination that already carries an actorPrincipal. §1 records that the act refuses once actorPrincipal is set and §3 records it as a submission criterion that holds today, not one of the eight waiting on the Function — so the surface offers the change and lets the platform refuse it"
    ],
    onSuccess: {
      mode: "both",
      invalidates: [
        "useLevels",
        "useSteps",
        "useElement"
      ],
      note: "The typed outcome shows immediately. The refetch is not for it but for record-determination, whose availability turns on the platform's view of outcome and not the client's — §1 records that act as refusing while outcome is empty."
    },
    onFailure: {
      region: "blocked",
      message: "The outcome could not be recorded. Once a determination has been recorded and attributed, its outcome no longer changes.",
      preservesInput: true
    },
    needed: [
      "a platform predicate for the caller's class. §7.2 reserves this surface to a named holder and §1 records that no platform predicate marks a user's class, so the regulation reserves it and nothing enforces it. The interface withholds the act and offers the routing; until the predicate exists that withholding is the only gate there is, which is exactly what §7.2 says is not a gate.",
      "which of the five whichDetermination members carries the selected-alternative decision at 1b.6(b)(2) and 1b.8(b)(3). §3 puts it on determination.outcome; the guidance names two of the five members and neither is that one",
      "an address for the six grounds at 1b.2(e)(1)–(6) and for the 1b.2(f)(2)(i)–(iv) sequence. outcome is one free-text field and §3 records that nothing says which limb answered — (e)(4) nondiscretionary and (e)(5) fundamental conflict are legally very different answers"
    ],
    notes: [
      "Half of a two-step. §3 names the outcome-then-attribution pair: a submission criterion refuses attribution while outcome is empty and refuses a new outcome once attribution exists. Both halves are exercisable today.",
      "The act writes no actor and §1 gives the reason: attribution is the other half. Nothing on the row records who entered the outcome.",
      "§3 puts the selected alternative here deliberately and never on a 'selected' boolean on alternative, because a boolean is settable by anything that can reach the store.",
      "This act appears in no binding in bindings.ts today — useSteps declares open-determination and open-document only. The write seam is where it first enters the repository."
    ]
  },

  "signature-ready-record-determination": {
    apiName: "signature-ready-record-determination",
    status: "exercisable",
    serves: "closes the determination — dates it, hashes its evidence, and attributes it to the caller",
    reserved: "§7.2 — the five determinations at 1b.11(a)(46), reserved to the responsible official",
    offeredOn: [
      "ElementScreen — Step 1 · does-nepa-apply, through ActionBar; the last act in §7.3's chain for det_nepa_applies",
      "ElementScreen — Step 2 · level-of-review, through ActionBar; completion of Step 2 fixes the pathway and populates Steps 3+ (§7.3)"
    ],
    unplaced: null,
    writes: [
      "determination.decidedAt",
      "determination.evidenceHash",
      "determination.actorPrincipal"
    ],
    actor: "current_user_id",
    params: [
      {
        name: "determination",
        status: "proposed",
        type: "string",
        required: true,
        note: "Proposed, and normalised from the object type. §1 names the properties a modify act writes and never the parameter that carries the row it edits."
      },
      {
        name: "decidedAt",
        status: "confirmed",
        type: "string",
        required: true,
        note: "An ISO-8601 timestamp. §1 annotates actorPrincipal as coming from current_user_id and does not annotate this one, so the interface passes it."
      },
      {
        name: "evidenceHash",
        status: "confirmed",
        type: "string",
        required: true,
        note: "§1 names the property and not what is hashed, so the interface has no value it can defend computing. Carried in `needed`."
      }
    ],
    preChecks: [
      "no determination in hand; the act modifies a row open-determination created",
      "a second record while the first is in flight; §1's fifth state is in-flight and must not look like absent"
    ],
    backendRejects: [
      "a caller outside the organization marking; all 17 acts carry INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e) (§1)",
      "attribution while outcome is empty. §1 records the refusal and §3 records it as a submission criterion that holds today, not one of the eight waiting on the Function"
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [
        "useLevels",
        "useSteps",
        "useElement"
      ],
      note: "actorPrincipal comes from current_user_id and cannot be shown before the write returns, so nothing here is optimistic. useLearning is not listed: materialized.determination holds zero rows, so no transform can read an act-written row and Learning does not go stale on this write (§1)."
    },
    onFailure: {
      region: "blocked",
      message: "Not ready to record. The outcome above has to be entered first.",
      preservesInput: true
    },
    needed: [
      "a rule for what evidenceHash covers; §1 names the property and not what is hashed",
      "a platform predicate for the caller's class. §7.2 reserves the five determinations at 1b.11(a)(46) to the responsible official; §1 records that no such predicate exists and pathways.ts gates the three signature rows and nothing else",
      "a record of a routing — that a determination was referred to the responsible official. §7.2 requires the act offered in place of a reserved one to be a routing, and none of the 17 acts records one"
    ],
    notes: [
      "One of the four acts that write actorPrincipal from current_user_id. §1 records the 2026-08-31 change: the ^(?!service:) regex is gone, nothing replaces it, and the record can no longer misstate who acted — which moves the actor question from trusted-at-write-time to decidable against Multipass.",
      "CLAUDE.md still records actorPrincipal as a client-supplied string guarded by that regex. §1 marks it stale on two counts and this is one of them.",
      "ActionBar's enabled flag may mirror the outcome-empty refusal. Mirroring is not holding it: §1 records the refusal as a submission criterion on the platform, and a check held only in the client is not the guarantee (§7.2).",
      "§3 names this the strongest match in the build and fully exercisable today. Nothing here waits on the submission-time Function.",
      "This act appears in no binding in bindings.ts today — useSteps declares open-determination and open-document only."
    ]
  },

  "signature-ready-record-branch": {
    apiName: "signature-ready-record-branch",
    status: "blocked",
    serves: "records which ground or limb answered, and attributes it",
    reserved: "§7.2 — whether an effect is significant, reserved to the responsible official; the branch records which limb of 1b.2(f)(2) answered",
    offeredOn: [
      "ElementScreen — Step 1 · does-nepa-apply, the 1b.2(e) row 'Which ground answered'; §7.3 gives record-branch as what records the ground",
      "ElementScreen — Step 2 · level-of-review, per limb across 1b.2(f)(2)(i)–(iv); §7.3 gives 'record-branch per limb'"
    ],
    unplaced: null,
    writes: [
      "branch.taken",
      "branch.decidedAt",
      "branch.evidenceHash",
      "branch.actorPrincipal"
    ],
    actor: "current_user_id",
    params: [
      {
        name: "branch",
        status: "proposed",
        type: "string",
        required: true,
        note: "Proposed, and normalised from the object type. §1 names the properties a modify act writes and never the parameter that carries the row it edits."
      },
      {
        name: "decidedAt",
        status: "confirmed",
        type: "string",
        required: true,
        note: "An ISO-8601 timestamp. §1 annotates taken as static and actorPrincipal as coming from current_user_id, and does not annotate this one."
      },
      {
        name: "evidenceHash",
        status: "confirmed",
        type: "string",
        required: true,
        note: "§1 names the property and not what is hashed. The same gap sits on record-determination."
      }
    ],
    preChecks: [
      "no branch row in hand. §1 records that eleven of the seventeen acts are keyed on a row nothing creates, branch among them, so the surface has nothing to modify and says so rather than calling",
      "a second record while the first is in flight; §1's fifth state is in-flight and must not look like absent"
    ],
    backendRejects: [
      "a caller outside the organization marking; all 17 acts carry INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e) (§1)",
      "a second taken branch on the same question. 'Exactly one taken branch per question' is one of the eight guarantees waiting on the submission-time Function, and §1 gives the reason an action cannot hold it: an action sees only the object it is given"
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [
        "useSteps",
        "useElement"
      ],
      note: "actorPrincipal comes from current_user_id and cannot be shown before the write returns. The step list is what changes: §3 records that nothing today says which limb answered, and this write is what would."
    },
    onFailure: {
      region: "blocked",
      message: "The ground could not be recorded. The grounds at 1b.2(e)(1)–(6) and the limbs at 1b.2(f)(2)(i)–(iv) do not exist to record against yet.",
      preservesInput: true
    },
    needed: [
      "a platform predicate for the caller's class. §7.2 reserves this surface to a named holder and §1 records that no platform predicate marks a user's class, so the regulation reserves it and nothing enforces it. The interface withholds the act and offers the routing; until the predicate exists that withholding is the only gate there is, which is exactly what §7.2 says is not a gate.",
      "a branch row. §1 lists 17 acts and none creates one; §3 records that branch is the right shape and record-branch the right act, and that nothing creates a branch row",
      "the branch set for 1b.2(e)(1)–(6), so a NEPA-does-not-apply determination records which ground answered. §4 carries it as an ontology item",
      "the branch set for the 1b.2(f)(2)(i)–(iv) sequence, so that (i)–(iii) were tried and failed is recorded — which is what (iv) is conditioned on. §3 calls this C9's pathway state and records it as not built",
      "the submission-time Function, which holds 'exactly one taken branch per question' along with seven other named preconditions (§1)",
      "a rule for what evidenceHash covers; §1 names the property and not what is hashed"
    ],
    notes: [
      "taken is written true and static and is not a parameter (§1). None of the 17 acts un-takes a branch, and none deletes or restores anything.",
      "One of the four acts that write actorPrincipal from current_user_id (§1).",
      "Step 1 and Step 2 use it against two different sets. §7.3 gives record-branch for the ground at 1b.2(e)(1)–(6) and per limb at 1b.2(f)(2)(i)–(iv); §4 records the first as absent and useSteps records the second as absent.",
      "A free-text outcome cannot stand in for this act. 1b.2(f)(2) is an ordered elimination, and §3 records 1b.2(e)(4) nondiscretionary and (e)(5) fundamental conflict as legally very different answers that determination.outcome does not tell apart.",
      "branch is one of the ten wave-2 edges §1 records as traversing, so the shape is in place and only the rows are missing.",
      "This act appears in no binding in bindings.ts today — useSteps names it only in `needed`, as the branch set it waits on."
    ]
  },

  "signature-ready-state-factor-finding": {
    apiName: "signature-ready-state-factor-finding",
    status: "blocked",
    serves: "records, for a resource under consideration, whether an extraordinary circumstance is clear, present or undetermined",
    reserved: "§7.2 — which resources are screened and which disciplines prepare, reserved to the responsible official",
    offeredOn: [
      "ElementScreen — P1/P2 Step 3 'Category and extraordinary circumstances', tab `extraordinary-circumstances`, the row at 1b.3(f)(1) labelled 'Per-resource finding' (§7.4)",
      "QuestionRow — the row renders form 'choice'; the finding is the choice",
      "ActionBar — the SubmitBar that closes the tab, which stays disabled while any non-discretionary row is outstanding"
    ],
    unplaced: null,
    writes: [
      "factor.finding"
    ],
    actor: "none",
    params: [
      {
        name: "factor",
        status: "proposed",
        type: "string",
        required: true,
        note: "The factor row the finding attaches to. §1's table records what each act writes, not its parameter list, so this name is proposed and not measured."
      },
      {
        name: "finding",
        status: "confirmed",
        type: "\"clear\" | \"present\" | \"undetermined\"",
        required: true,
        closedSet: [
          "clear",
          "present",
          "undetermined"
        ],
        note: "Closed at three (§1). §3 records the property as factor.finding and the three values verbatim; the parameter name is assumed to match the property."
      }
    ],
    preChecks: [
      "refuse where the row carries no factor to modify; the region is absent and there is nothing to write to",
      "refuse any value outside clear / present / undetermined; the set is closed at three and the act carries no default",
      "refuse a resubmission of a row whose write is still in flight; the act writes one property and a repeat is indistinguishable from the first"
    ],
    backendRejects: [
      "the organization marking: every one of the seventeen acts carries INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e), and a caller outside it is refused at the platform (§1)",
      "the factor row not existing. Nothing creates one, so every call is refused today for want of its object (§1)"
    ],
    onSuccess: {
      mode: "both",
      invalidates: [
        "useElement",
        "useSteps",
        "useExpertQueue",
        "useExpertRequest"
      ],
      note: "The finding itself is client-supplied and shows immediately. Present or undetermined is the condition that drafts an expert request and holds it pending in the queue (§6.4, §7.8), and the draft is assembled from the project and the finding, so the client cannot compute it."
    },
    onFailure: {
      region: "blocked",
      message: "The finding was not recorded.",
      preservesInput: true
    },
    needed: [
      "a platform predicate for the caller's class. §7.2 reserves this surface to a named holder and §1 records that no platform predicate marks a user's class, so the regulation reserves it and nothing enforces it. The interface withholds the act and offers the routing; until the predicate exists that withholding is the only gate there is, which is exactly what §7.2 says is not a gate.",
      "anything that creates a factor row; eleven of the seventeen acts are keyed on a row nothing creates, and this is one of them (§1)",
      "an actor on the act. It writes none, which §1 records as a named gap and §6.7 lists as a port addition, so the queue cannot show who stated a finding",
      "a decidedAt and a reference to whatever answered each finding; §3 records both as missing",
      "a resource dimension, so 1b.3(f)'s questions are findings per (resource, factor). §4 records that attribution belongs with that reshape rather than hung off the current shape and then undone"
    ],
    notes: [
      "The three values encode 1b.3(f)(2): mere presence of a listed resource does not mean an extraordinary circumstance exists, and one exists only where there is reasonable uncertainty whether the degree of effect is significant or certainty that it is. §3 records that a two-member yes/no set would have made the stopping rule invisible.",
      "The eight resource classes at 1b.3(f)(1) are prefaced 'may include, but are not limited to' and are chosen at the responsible official's sole discretion, so what the finding is about is never a closed set even though the finding is (§7.4).",
      "A present finding does not close the pathway. 1b.3(f)(3) permits the action to be modified so that certainty is created that the effect is not significant, and the circumstance then no longer exists (§7.4).",
      "None of the eight preconditions waiting on the submission-time Function is this act's; §1 names the eight and this is not among them.",
      "Unlike record-consistency-finding and record-determination, the act writes no decidedAt, no evidenceHash and no actorPrincipal (§1)."
    ]
  },

  "signature-ready-record-consistency-finding": {
    apiName: "signature-ready-record-consistency-finding",
    status: "blocked",
    serves: "records a consistency finding, the date it was decided, the hash of the evidence it rests on and the officer who decided it",
    reserved: null,
    offeredOn: [],
    unplaced: "No surface offers it. The design places every other act on a step, a tab, a row or an overlay; a consistency finding appears on none, and bindings.ts declares no object type, property or act for one across all fifteen surfaces. Placing it is a decision about §7, not a wiring gap — until that decision is made the act exists in the ontology and nowhere in the interface.",
    writes: [
      "consistencyDetermination.finding",
      "consistencyDetermination.decidedAt",
      "consistencyDetermination.evidenceHash",
      "consistencyDetermination.actorPrincipal"
    ],
    actor: "current_user_id",
    params: [
      {
        name: "consistencyDetermination",
        status: "proposed",
        type: "string",
        required: true,
        note: "The row the finding attaches to. §1's table records what the act writes, not its parameter list, so this name is proposed and not measured."
      },
      {
        name: "finding",
        status: "confirmed",
        type: "string",
        required: true,
        note: "Open. §1 marks closed sets explicitly on six other acts and marks none here, so no set is declared. Compare state-factor-finding, whose finding §1 records as 'closed 3'."
      },
      {
        name: "decidedAt",
        status: "confirmed",
        type: "string",
        required: true,
        note: "An ISO timestamp. A parameter and not a static: where §1 records a value as written statically it says so — citation='1b.11(a) (46)' on open-determination, taken=true on record-branch, engagement.outcome='open' on package-expert-request — and it says nothing of the kind here."
      },
      {
        name: "evidenceHash",
        status: "confirmed",
        type: "string",
        required: true,
        note: "The digest of what the finding rests on. Same shape as record-determination and record-branch (§1)."
      }
    ],
    preChecks: [
      "refuse where there is no consistencyDetermination row to modify; the region is absent and there is nothing to write to",
      "refuse a blank finding and a blank evidence hash; a modify that writes empty strings records a decision that was never made",
      "never send actorPrincipal. It comes from current_user_id and the client cannot set it"
    ],
    backendRejects: [
      "the organization marking: every one of the seventeen acts carries INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e), and a caller outside it is refused at the platform (§1)",
      "who is recorded. actorPrincipal comes from current_user_id, which since 2026-08-31 makes the actor decidable against Multipass rather than trusted at write time; the screen cannot state it and cannot contradict it (§1)",
      "the consistencyDetermination row not existing. §1 names it among the seven row types the eleven unwalkable acts key on, and nothing creates any of them"
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [],
      note: "Nothing on the screen goes stale, because nothing on the screen reads a consistency finding: bindings.ts declares no object type, property or act for one across all fifteen hooks. The invalidation list is empty for that reason and not by oversight. actorPrincipal comes back from the platform, so even once a surface exists the officer's line on the row cannot be shown optimistically."
    },
    onFailure: {
      region: "unresolved",
      message: "The finding was not recorded.",
      preservesInput: true
    },
    needed: [
      "a surface. §6 and §7 name no page, step, tab or row that records a consistency finding, so the act has nowhere to be offered and no hook to belong to",
      "what the finding is a finding about. §1's table row is the only occurrence of the act in the register, the amendments and the repository",
      "anything that creates a consistencyDetermination row; §1 names it among the seven row types the eleven unwalkable acts key on",
      "the closed set, if there is one. §1 closes finding at three on state-factor-finding and closes nothing here"
    ],
    notes: [
      "§1 records the act as a modify writing finding, decidedAt, evidenceHash and actorPrincipal, with its actor from current_user_id — the same four-part shape as record-determination and record-branch.",
      "actorPrincipal was a client-supplied string guarded by ^(?!service:) until 2026-08-31, when all the attributing acts moved to current_user_id. The regex is gone and nothing replaces it — there is no platform predicate for 'this caller is not a service user' — but the record can no longer misstate who acted (§1).",
      "§1's prose says four acts take their principal from current_user_id while the table's actor column names six. The two are not reconciled in the register and this act is one of the six.",
      "None of the eight preconditions waiting on the submission-time Function is this act's; §1 names the eight and this is not among them."
    ]
  },

  "signature-ready-open-document": {
    apiName: "signature-ready-open-document",
    status: "exercisable",
    serves: "opens the document the pathway calls for, so its elements have something to hang on",
    reserved: null,
    offeredOn: [
      "ProjectScreen — the step list, where a pathway's document steps appear once Step 2 fixes the pathway (§7.8). bindings.ts declares open-document on useSteps",
      "ElementScreen — the first open of a document tab: `fanec` at P2 Step 4 (§7.4), `ea` at P3 Step 4 and `fonsi` at P3 Step 6 (§7.5), `eis` at P4 Step 5 and `rod` at P4 Step 8 (§7.6)",
      "ActionBar — the SubmitBar on those tabs reads 'Submit FANEC', 'Submit EA' and so on, so the document must exist before the bar can close it"
    ],
    unplaced: null,
    writes: [
      "document.documentType",
      "document.project",
      "document.synthetic"
    ],
    actor: "none",
    params: [
      {
        name: "documentType",
        status: "confirmed",
        type: "\"FANEC\" | \"EA\" | \"FONSI\" | \"EIS\" | \"ROD\"",
        required: true,
        closedSet: [
          "FANEC",
          "EA",
          "FONSI",
          "EIS",
          "ROD"
        ],
        note: "Closed at five (§1). Only FANEC is measured — it is the value on the one document row — and the other four are the DocumentType union in src/ui/data/pathways.ts and §2's names for the five documents, not strings read off the action."
      },
      {
        name: "project",
        status: "confirmed",
        type: "string",
        required: true,
        note: "The project the document hangs on. §1 records project among the act's writes; whether the parameter takes an object id or a primary key is not recorded."
      },
      {
        name: "synthetic",
        status: "confirmed",
        type: "boolean",
        required: true,
        note: "Required and never defaulted (§1). There is no value to fall back on, so a form that omits it does not open a document."
      }
    ],
    preChecks: [
      "refuse while no pathway is fixed. Steps 3 and beyond do not exist until Step 2 records det_review_level, and before then the step list names no document step (§7.1)",
      "refuse a documentType the pathway does not reach: P0 and P1 produce no document at all, P2 produces only a FANEC, P3 an EA then a FONSI, P4 an EIS then a ROD (§7.2)",
      "refuse a documentType outside the five; the set is closed",
      "refuse a submission with synthetic unset, rather than sending a default the act does not have"
    ],
    backendRejects: [
      "uniqueness over (project, documentType). One of the eight named preconditions waiting on a submission-time Function that does not exist, so a second FANEC on one project is not refused today (§1)",
      "the organization marking: every one of the seventeen acts carries INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e), and a caller outside it is refused at the platform (§1)",
      "the ordering the rule imposes — the EA before the FONSI (1b.6(a)) and the EIS before the ROD (1b.8(a)). Nothing on the platform holds it; the screen states the precondition and does not enforce it as an authorisation"
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [
        "useLevels",
        "useSteps",
        "useElement"
      ],
      note: "The row's identifier and everything hanging off it come from the platform. The document exists and its elements do not: document → element → slot → claim traverses and all four types hold zero rows, so the tab opens on an element set that is absent rather than empty (§3)."
    },
    onFailure: {
      region: "unresolved",
      message: "The document was not opened.",
      preservesInput: true
    },
    needed: [
      "the exact five values of documentType. §1 records the set as closed at five and names only FANEC",
      "uniqueness over (project, documentType), which needs the submission-time Function that does not exist (§1)"
    ],
    notes: [
      "Proved. §1 names open-document as one of the four acts that can be run today, and the one document row in the ontology — documentType=FANEC, synthetic=true, on the C5 tracer project — was written by it.",
      "document rows live in the edits layer; signatureReady.document holds zero rows, and materialized.* holds none either, so no transform can read what this act wrote (§1).",
      "document.regulationVersion is null on that row. Per C3 a null means unbound, not current; the version is fixed at signature and never re-derived, so a nullable column nothing writes is re-derivation with extra steps (§1).",
      "synthetic is required and never defaulted. Anything that counts documents counts the synthetic one, as §6.3 says of the two synthetic projects.",
      "Opening a document is not issuing one. The three signature gates at 1b.3(g)(2)(vi), 1b.6(b)(5) and 1b.8(b)(8) attach to emit-document; open-document writes no actor and closes nothing (§7.2).",
      "Pathway state is what decides which document types remain possible, and it has no ontology address: document.documentType names the type of a document that exists, not the set still open, and 1b.2(f)(2) is an ordered elimination (§4)."
    ]
  },

  "signature-ready-emit-document": {
    apiName: "signature-ready-emit-document",
    status: "blocked",
    serves: "issues the assembled document, recording when it was emitted, that closure holds, the manifest hash and who emitted it",
    reserved: "§7.2 — the signature rows on the FANEC, FONSI and ROD (1b.3(g)(2)(vi), 1b.6(b)(5), 1b.8(b)(8)), and approval to publish an EA or EIS, reserved to the responsible official",
    offeredOn: [
      "ElementScreen — the ActionBar on a document tab, where the SubmitBar reads 'Submit FANEC', 'Submit EA', 'Submit FONSI', 'Submit EIS' or 'Submit ROD'",
      "ElementScreen — P2 Step 5 `issue` (§7.4), the tab that carries the date issued and the signature row",
      "QuestionRow — the gated signature rows at 1b.3(g)(2)(vi), 1b.6(b)(5) and 1b.8(b)(8), which carry the GateSpec in pathways.ts",
      "useGate — where the caller does not hold the credential the surface withholds the act and offers 'Route for signature' in its place, with a Destination rather than a dead end (§7.2)"
    ],
    unplaced: null,
    writes: [
      "manifest.emittedAt",
      "manifest.closureHolds",
      "manifest.manifestHash",
      "manifest.emittedBy"
    ],
    actor: "current_user_id",
    params: [
      {
        name: "manifest",
        status: "proposed",
        type: "string",
        required: true,
        note: "The manifest being emitted. document.manifest is a C1 singleton link, so one document has one (§1). §1's table records what the act writes, not its parameter list, so this name is proposed and not measured."
      },
      {
        name: "emittedAt",
        status: "confirmed",
        type: "string",
        required: true,
        note: "An ISO timestamp. stamp-verifier-verdict's not_before is 'verdict at or after the manifest's emittedAt', so this is the value the verdict is compared against — and §1 records that comparison as unenforceable, being cross-object."
      },
      {
        name: "closureHolds",
        status: "confirmed",
        type: "boolean",
        required: true,
        note: "A parameter, not a check. §1: 'closureHolds is a parameter and a false value is not refused.' The screen submits what the officer asserts; nothing on the platform verifies it."
      },
      {
        name: "manifestHash",
        status: "confirmed",
        type: "string",
        required: true,
        note: "The digest of what was emitted."
      }
    ],
    preChecks: [
      "withhold the act where the caller does not hold the credential the rule reserves — 1b.3(g)(2)(vi) on a FANEC, 1b.6(b)(5) on a FONSI, 1b.8(b)(8) on a ROD — and offer the routing instead. The EA and the EIS carry no gate at any point: 1b.5(c)(6) and 1b.7(h)(8) state that the certifying statement requires no signature (§7.2)",
      "refuse while any non-discretionary row in the tab is outstanding. §7.9's permissions are not counted as outstanding, so a discretion never holds the bar shut",
      "refuse a blank manifest hash",
      "never send emittedBy. It comes from current_user_id and the client cannot set it"
    ],
    backendRejects: [
      "intent-predicate clause 1, element closure, and clause 2, that the disposition mix equals its pinned expectation. Both are recorded enforcedAt 'none' and both wait on a submission-time Function that does not exist, so a closureHolds of false is accepted today (§1)",
      "the signature the rule reserves. A gate held only in the client is not a gate: the surface withholds the act and the platform refuses the write. The interface cannot verify the credential — no platform predicate marks a caller's class — and emittedBy from current_user_id is what makes the actor decidable against Multipass rather than trusted at write time (§1, §7.2)",
      "the organization marking: every one of the seventeen acts carries INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e), and a caller outside it is refused at the platform (§1)",
      "the manifest row not existing. §1 names manifest among the seven row types the eleven unwalkable acts key on, and nothing creates any of them"
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [
        "useGate",
        "useElement",
        "useSteps"
      ],
      note: "emittedBy comes back from the platform, so the line naming who issued the document cannot be written optimistically. A success is not evidence that the elements closed: closureHolds is what the officer submitted, not what the platform checked (§1)."
    },
    onFailure: {
      region: "blocked",
      message: "The document was not issued.",
      preservesInput: true
    },
    needed: [
      "the submission-time Function. Intent-predicate clauses 1 and 2 are both recorded enforcedAt 'none', and clause 3's pass-only requirement has been held by nothing since stamp-verifier-verdict widened to accept fail on 2026-09-01 — only an emission gate can tell a recorded fail from a failed claim reaching a signed document (§1)",
      "anything that creates a manifest row; §1 names manifest among the seven row types the eleven unwalkable acts key on",
      "a signature concept. document carries no date-issued and no signatory property, and §5 records a signature as the corpus's largest gap — 67 of 151 nepa-decided items carry signatoryRole 'unknown' because the signature page is the part that did not survive extraction (§3, §5)",
      "a platform predicate for the caller's class; responsibleOfficial and delegation exist and hold no rows (§7.2)",
      "a record of a routing — that a document was referred to a holder for signature. bindings.ts records its absence on useGate"
    ],
    notes: [
      "Gated on three of the five documents: FANEC 1b.3(g)(2)(vi), FONSI 1b.6(b)(5), ROD 1b.8(b)(8). The EA and the EIS carry no gate — 1b.5(c)(6) and 1b.7(h)(8) state that the certifying statement requires no signature and that approval to publish indicates the responsible official's concurrence (§7.2).",
      "The EA and EIS certifications must not be modelled as a signature. §3 records that they are a different shape and that collapsing the two would assert a signature the rule does not ask for.",
      "Drafting is never gated, the FONSI and the ROD included. 1b.10 governs who may prepare documentation, not who may use this application, and closes no surface (§7.2).",
      "The act writes emittedBy rather than actorPrincipal, so it is not one of the acts carrying the actorPrincipal property, although §1's table gives its actor as current_user_id.",
      "Emission is not publication. Compelled publication under 1b.5(f) and 1b.7(l) is publish-under-compulsion, which §3 records as answerable and best-matched after the determinations, and a FANEC carries no publication duty at all (§2, §4)."
    ]
  },

  "signature-ready-adopt": {
    apiName: "signature-ready-adopt",
    status: "blocked",
    serves: "records what the officer did with a proposed answer, so a drafted row stops being a proposal",
    reserved: null,
    offeredOn: [
      "QuestionRow — the Accept action on a drafted row, and the Edit that precedes it",
      "ElementScreen — the panel the row sits in, which locks its rows once the bar is submitted",
      "Region · Actions — the one place a row's actions render"
    ],
    unplaced: null,
    writes: [
      "adoption.adoptedValue",
      "adoption.adoptionState",
      "adoption.adoptedAt",
      "adoption.actorPrincipal"
    ],
    actor: "current_user_id",
    params: [
      {
        name: "adoptedValue",
        status: "confirmed",
        type: "string",
        required: false,
        note: "Absent only where the state is rejected. §1 records that conditional as a rule over another parameter's nullity, not expressible without a Function, so an adopted row with no value is accepted today."
      },
      {
        name: "adoptionState",
        status: "confirmed",
        type: "string",
        required: true,
        note: "§1 and §6.5 both close the set at three; §1 names one member, 'rejected'. The other two are not in the register, so no set is reproduced here."
      },
      {
        name: "adoptedAt",
        status: "confirmed",
        type: "string",
        required: true,
        note: "§1 lists it among adopt's four writes."
      }
    ],
    preChecks: [
      "No adoption row in hand. adopt is a modify, and §1 records that nothing creates an adoption row.",
      "Nothing drafted on the row. §7.8 makes a prefilled row a proposal until adopt records what the officer did with it, so a row carrying no proposal has nothing to adopt.",
      "adoptionState unset. The act closes the set and the register names one of its three members, so the interface requires the value and checks nothing about it.",
      "The panel is already submitted. ElementScreen locks its rows and the bar becomes an undo."
    ],
    backendRejects: [
      "adoptedValue present unless adoptionState is 'rejected' — one of §1's eight preconditions waiting on the submission-time Function. Nothing holds it today and an 'adopted' with no value can be recorded.",
      "a value outside adoptionState's closed three, which the interface cannot pre-empt while the register names one of the three.",
      "the organization marking. Every one of the 17 acts carries INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e), and a caller outside it is refused (§1)."
    ],
    onSuccess: {
      mode: "both",
      invalidates: [
        "useElement",
        "useLearning"
      ],
      note: "The row stops reading as a draft at once and the panel is read back. §7.8 sends adopt on a drafted row to Learning as a Level 2 → Level 3 trigger, and §6.5's third tile is the adoption diff it feeds."
    },
    onFailure: {
      region: "unresolved",
      message: "That answer was not recorded",
      preservesInput: true
    },
    needed: [
      "the submission-time Function; adopt's conditional is one of the eight preconditions waiting on one (§1)",
      "an adoption row; §1 records that nothing creates one, and eleven of the seventeen acts are keyed on a row nothing creates",
      "the two unnamed members of adoptionState's closed three; §1 gives the count and names 'rejected' alone",
      "the object-dataset materialization for adoption; materialized.adoption holds zero rows, so no transform can read an adopted row and the diff on Learning cannot populate (§1)"
    ],
    notes: [
      "actorPrincipal is written from current_user_id and is never sent. §1 records the move off a client-supplied string on 2026-08-31, which makes the actor decidable against Multipass rather than trusted at write time.",
      "The submit bar closes a tab; adopt closes a row. ElementScreen locks its rows when the bar is submitted, so the act is offered only while the panel is open.",
      "An 'adopted' with no value is a state this platform records, and §6.5 asks for it to be surfaced rather than filtered out."
    ]
  },

  "signature-ready-identify-expert-requirement": {
    apiName: "signature-ready-identify-expert-requirement",
    status: "blocked",
    serves: "records that this part of the review needs a discipline, and opens the request in Expert Q",
    reserved: null,
    offeredOn: [
      "ExpertQScreen — the queue row the identified requirement arrives as, overdue first",
      "QuestionRow — the extraordinary-circumstance finding at Step 3 whose answer fires it (§7.4)",
      "ElementScreen — the panel that finding sits in"
    ],
    unplaced: null,
    writes: [
      "assignment.identifiedAt",
      "assignment.targetKind",
      "assignment.targetName",
      "assignment.slot"
    ],
    actor: "none",
    params: [
      {
        name: "identifiedAt",
        status: "confirmed",
        type: "string",
        required: true,
        note: "§1 lists it first among the act's writes."
      },
      {
        name: "targetKind",
        status: "confirmed",
        type: "string",
        required: true,
        note: "§1 closes the set at three and names none of the members, so no set is reproduced here."
      },
      {
        name: "targetName",
        status: "confirmed",
        type: "string",
        required: true
      },
      {
        name: "slot",
        status: "confirmed",
        type: "string",
        required: true,
        note: "The slot the requirement is on. §1 records that assignment.slot is written into the edits layer while the backing column is null, and that whether the edge resolves in that state is settled by traversing it, never by reading the property back."
      }
    ],
    preChecks: [
      "No slot row in hand. The act writes slot and §1 records that nothing creates one.",
      "The finding is clear. §6.4 makes present or undetermined the condition that needs a discipline, and state-factor-finding closes the finding at those three.",
      "targetName empty.",
      "targetKind unset. Its three members are not in the register, so the interface requires the value and checks nothing about it."
    ],
    backendRejects: [
      "a targetKind outside the closed three (§1).",
      "a slot the act cannot resolve. §1 records assignment.slot as written and never traversed, so a refusal here is the first evidence either way.",
      "the organization marking, carried by every one of the 17 acts (§1)."
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [
        "useExpertQueue",
        "useExpertRequest"
      ],
      note: "The requirement arrives as a queue row and the request is drafted against it. The queue is read back rather than assembled in the client, because §6.4 orders it overdue first against dates this act does not write."
    },
    onFailure: {
      region: "unresolved",
      message: "This could not be added to Expert Q",
      preservesInput: false
    },
    needed: [
      "a slot row; eleven of seventeen acts wait on one and §1 records that nothing creates any (§6.7)",
      "an actor; §6.7 names the missing actor on identify-expert-requirement, package-expert-request and state-factor-finding, so the queue cannot show who identified a requirement",
      "the three members of targetKind's closed set; §1 gives the count and names none",
      "a holder-to-slot join (B.5.12); nothing joins a holder to the slot needing one, so a recipient is a suggestion the officer confirms and never a routing the system made (§6.4)",
      "a traversal of assignment.slot; the property reads correctly whether or not the edge resolves, which is what makes the failure silent (§1)"
    ],
    notes: [
      "§6.4 automates the recognition and reserves the sending, so the act follows a finding rather than a button: state-factor-finding returning present or undetermined is §7.8's Level 2 → Level 4 trigger.",
      "Nothing refuses a second requirement on the same slot. §1's eight preconditions name uniqueness for open-determination, open-document and record-artifact-arrival, and none for this act.",
      "The officer types nothing here. What is confirmed by hand — the recipient — is confirmed on the compose overlay, which is package-expert-request (§6.4)."
    ]
  },

  "signature-ready-package-expert-request": {
    apiName: "signature-ready-package-expert-request",
    status: "blocked",
    serves: "sends the drafted request from the compose overlay — the officer's half of a Level 4 loop the system started",
    reserved: null,
    offeredOn: [
      "ComposeOverlay — the Send request button; §6.4 makes sending perform this act",
      "ExpertQScreen — the queue the overlay opens above and returns to on close",
      "Overlay · OverlayActions — where send and cancel sit"
    ],
    unplaced: null,
    writes: [
      "assignment.sentAt",
      "assignment.expectedReturnDate",
      "engagement.outcome"
    ],
    actor: "none",
    params: [
      {
        name: "sentAt",
        status: "confirmed",
        type: "string",
        required: true,
        note: "The queue's Sent column, and half of what §6.4 sorts on."
      },
      {
        name: "expectedReturnDate",
        status: "confirmed",
        type: "string",
        required: true,
        note: "§6.4's overlay carries it as one of the three facts the request is assembled from, and the queue defaults to overdue first against it."
      }
    ],
    preChecks: [
      "No request in hand. §1 records the act as a modify ×2 and names both rows it writes.",
      "expectedReturnDate unset. The queue sorts on it and defaults to overdue first (§6.4).",
      "The recipient is unconfirmed. §6.4 records that nothing joins a holder to a slot, so the recipient is a suggestion the officer confirms and the interface must not send an unconfirmed one."
    ],
    backendRejects: [
      "either of the two rows failing to resolve. The act is a modify ×2 over an assignment and an engagement, and §1 records no act creating one of the two.",
      "the organization marking, carried by every one of the 17 acts (§1)."
    ],
    onSuccess: {
      mode: "both",
      invalidates: [
        "useExpertQueue",
        "useExpertRequest"
      ],
      note: "The overlay closes and the row moves to awaiting; the queue is read back because its order is by expected return and its default is overdue first (§6.4)."
    },
    onFailure: {
      region: "unresolved",
      message: "The request was not sent",
      preservesInput: true
    },
    needed: [
      "an actor; §1 records the absence as a named asymmetry and §6.7 lists it, so the queue cannot show who sent a request",
      "the slot row the queue waits on (§6.4)",
      "a create for whichever of the two rows it modifies nothing creates; §1 records identify-expert-requirement as a single create and names no object type for it, and none of the other five creates writes an assignment or an engagement property",
      "an address for the regulatory basis of a request; the trigger is a factor finding and nothing joins it to the clause that required the discipline",
      "a record that an interdisciplinary review occurred — precisely what 1b.3(g)(2)(v) requires a FANEC to assert (§6.7)"
    ],
    notes: [
      "engagement.outcome is written 'open' by the act (§1). The interface sends no outcome.",
      "A modify ×2 that writes no actor is §1's named asymmetry: two properties record that a request went out and nothing records who sent it. ExpertQScreen renders that as 'Sender not recorded' rather than as a blank.",
      "Expert identities are notional for this build and nothing is transmitted (§6.4). The act records that a request was packaged, not that anything left the system.",
      "Nothing refuses a second send: none of §1's eight preconditions names this act."
    ]
  },

  "signature-ready-record-artifact-arrival": {
    apiName: "signature-ready-record-artifact-arrival",
    status: "blocked",
    serves: "records that the specialist's artifact came back, which is the first half of the return leg",
    reserved: null,
    offeredOn: [
      "ExpertQScreen — the queue row; §6.4 puts the return leg on the row, beside Awaited and Gaps found",
      "ListControls — the Returned filter the row moves into once an arrival is recorded"
    ],
    unplaced: null,
    writes: [
      "receivedArtifact.artifactType",
      "receivedArtifact.assignment",
      "receivedArtifact.receivedAt"
    ],
    actor: "none",
    params: [
      {
        name: "artifactType",
        status: "confirmed",
        type: "string",
        required: true,
        note: "Deliberately unconstrained (§1): no closed set here. §3 records the constraint one act later — accept-artifact refuses a delivered artifactType that is not slot.artifactAwaited."
      },
      {
        name: "assignment",
        status: "confirmed",
        type: "string",
        required: true,
        note: "The request the artifact answers. §1 lists it among the act's writes."
      },
      {
        name: "receivedAt",
        status: "confirmed",
        type: "string",
        required: true
      }
    ],
    preChecks: [
      "No request in hand. §1 records the act as a create keyed on an assignment.",
      "artifactType empty. §1 leaves the type deliberately unconstrained, so emptiness is the only thing the interface can refuse about it.",
      "The request has not been sent. §6.4 makes this the return leg of a request that went out."
    ],
    backendRejects: [
      "at most one arrival per assignment — one of §1's eight preconditions waiting on the submission-time Function. Nothing refuses a second arrival today.",
      "the organization marking, carried by every one of the 17 acts (§1)."
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [
        "useExpertQueue"
      ],
      note: "The row moves to returned and the queue is read back rather than written in the client: at most one arrival per assignment is held by nothing (§1), so an optimistic row would hide a duplicate the platform accepted."
    },
    onFailure: {
      region: "unresolved",
      message: "The return was not recorded",
      preservesInput: true
    },
    needed: [
      "the submission-time Function; at most one arrival per assignment is one of the eight preconditions waiting on one (§1)",
      "an assignment row to key the arrival on; the act that would create one writes slot, and §1 records that nothing creates a slot",
      "the object-dataset materialization for receivedArtifact; materialized.receivedArtifact holds zero rows, so no transform can read an arrival (§1)",
      "a control for the return leg on the queue row; ExpertQScreen offers Open request and nothing else"
    ],
    notes: [
      "artifactType is unconstrained here and constrained one act later: §3 records that accept-artifact refuses a delivered artifactType that is not slot.artifactAwaited, and that accept-artifact writes gapsFound and closes the engagement.",
      "The act writes no actor, so the queue cannot show who recorded a return (§1).",
      "gapsFound belongs to accept-artifact and not to this act, and §6.4 requires it visible on the row rather than buried."
    ]
  },

  "signature-ready-accept-artifact": {
    apiName: "signature-ready-accept-artifact",
    status: "blocked",
    serves: "records that what a specialist returned has been accepted, notes the gaps it left, and closes the request",
    reserved: null,
    offeredOn: [
      "ExpertQScreen — the row of a returned request; §6.4 puts the return leg on this page",
      "Overlay / OverlayActions — the overlay a queue row opens, where gaps found are typed before the act runs"
    ],
    unplaced: null,
    writes: [
      "engagement.gapsFound",
      "engagement.outcome"
    ],
    actor: "none",
    params: [
      {
        name: "engagement",
        status: "proposed",
        type: "string",
        required: true,
        note: "The request being closed, by object id. §1 records the properties each act writes and never its parameter API names, so this name is proposed from the object type."
      },
      {
        name: "gapsFound",
        status: "confirmed",
        type: "string",
        required: false,
        note: "What the delivery did not cover. §6.4 puts it on the queue row rather than burying it, and ExpertRow.gapsFound is string | null."
      }
    ],
    preChecks: [
      "No arrival recorded against the assignment. record-artifact-arrival is the first half of the return leg and this act is the second (§6.4).",
      "A request that already reads as accepted. The accepted status on the queue is engagement.outcome='artifact_received'; nothing on the platform refuses a second write, so this withholds the act and asserts no guarantee."
    ],
    backendRejects: [
      "A delivered artifactType that is not the slot's artifactAwaited. §3 records that the act refuses it, and record-artifact-arrival leaves artifactType deliberately unconstrained, so the refusal lands here.",
      "The organization marking every act carries — INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e) — which refuses a caller outside it (§1)."
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [
        "useExpertQueue"
      ],
      note: "The status column and the gaps-found column are both written by this act, and the artifactType refusal is one the client cannot predict, so the queue is read back rather than assumed."
    },
    onFailure: {
      region: "unresolved",
      message: "This request is still waiting on what it asked for. Nothing was recorded, and what you typed is still here.",
      preservesInput: true
    },
    needed: [
      "anything that creates a slot row; the chain identify-expert-requirement → package-expert-request → record-artifact-arrival → accept-artifact is keyed on one and nothing creates any (§1)",
      "materialized.engagement, which holds zero rows, so no transform can read what this act wrote (§1)"
    ],
    notes: [
      "outcome='artifact_received' is written statically — §1's notation for a value the act fixes rather than takes, as with record-branch's taken=true.",
      "One of the eleven acts §1 records as unreachable today. Four acts run, the pair after open-determination is reachable, and nothing creates the rows the rest are keyed on.",
      "§1's table records the actor as none and gives no reason, so nothing records who accepted a delivery or closed a request. §6.7 asks for an actor on identify-expert-requirement, package-expert-request and state-factor-finding and does not name this act.",
      "1b.3(g)(2)(v) requires a FANEC to state that no extraordinary circumstances exist as informed by the interdisciplinary review, and §3 records that nothing holds that the review happened. An acceptance is not that record.",
      "assignment.slot is written into the edits layer while the backing column is null, and §1 records that whether the edge resolves in that state can be settled only by traversing it."
    ]
  },

  "signature-ready-freeze-slot-disposition": {
    apiName: "signature-ready-freeze-slot-disposition",
    status: "blocked",
    serves: "closes a part of a document by fixing, for each answer in it, where that answer came from",
    reserved: null,
    offeredOn: [
      "ElementScreen — the one act that closes a tab, after its rows are answered",
      "ActionBar — the SubmitBar under the rows, which becomes an undo once submitted"
    ],
    unplaced: null,
    writes: [
      "slot.disposition"
    ],
    actor: "none",
    params: [
      {
        name: "slot",
        status: "proposed",
        type: "string",
        required: true,
        note: "The row being frozen, by object id. §1 records writes and never parameter API names, so this name is proposed from the object type."
      },
      {
        name: "disposition",
        status: "confirmed",
        type: "string",
        required: true,
        note: "Closed at three members (§1), which records the arity and never the members. §6.5's disposition mix is a retrieved / drafted / specialist split; a mix is not this parameter's set, so no closed set is asserted here."
      }
    ],
    preChecks: [
      "A row still unanswered and not discretionary. §7.9's permissions stay permissions: the submit bar does not count one as outstanding.",
      "A row with no disposition chosen. The act records where an answer came from and has nothing to record without one."
    ],
    backendRejects: [
      "frozen_upstream — a faithful replay of a frozen disposition, as against a fresh choice made at submission. §1 names it among the eight preconditions waiting on the submission-time Function, and it is the guarantee that stops work migrating during assembly.",
      "The organization marking every act carries — INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e) — which refuses a caller outside it (§1)."
    ],
    onSuccess: {
      mode: "both",
      invalidates: [
        "useElement",
        "useLearning"
      ],
      note: "ElementScreen locks the rows and turns the bar into an undo at once; the panel and the disposition mix are then read back, because nothing holds frozen_upstream and only the record says what was frozen."
    },
    onFailure: {
      region: "unresolved",
      message: "This part could not be closed. Your answers are still here, and nothing about them has changed.",
      preservesInput: true
    },
    needed: [
      "the submission-time Function; frozen_upstream is one of its eight named preconditions and there is no Function or AIP Logic of any kind in the project (§1)",
      "anything that creates a slot row — eleven of the seventeen acts are keyed on one and nothing creates any (§1)",
      "the three values disposition closes over; §1 records the arity and never the members"
    ],
    notes: [
      "§7.8 makes the act a Level 2 → Level 3 trigger: on freeze, the disposition mix is compared against disposition_mix.pin.json, which is also intent-predicate clause 2 on emit-document (§6.5).",
      "The act cannot tell a replay from a fresh choice, so a mix that matches its pin is evidence about what was recorded and not about when it was decided (§1).",
      "§1 records the property as disposition without an object type. slot is taken from the act's own name and from §1's list of the row types the eleven unreachable acts are keyed on.",
      "§1's table records the actor as none and gives no reason. Nothing records who froze a disposition."
    ]
  },

  "signature-ready-stamp-verifier-verdict": {
    apiName: "signature-ready-stamp-verifier-verdict",
    status: "blocked",
    serves: "records the check that runs over an issued part as a pass or a fail, and when it was stamped",
    reserved: null,
    offeredOn: [
      "ElementScreen — the document tab, beside the part the check covers",
      "QuestionRow — the pass or fail, offered as a choice that opens on neither value",
      "ActionBar"
    ],
    unplaced: null,
    writes: [
      "claim.verdict",
      "claim.verdictStampedAt"
    ],
    actor: "none",
    params: [
      {
        name: "verdict",
        status: "confirmed",
        type: "string",
        required: true,
        closedSet: [
          "pass",
          "fail"
        ],
        note: "§1 records the set as pass / fail and records that the default is still pass. Clearing it is not expressible through the API path the widening used and must be done by hand in Ontology Manager, so the form opens on neither value and a pass is a click."
      },
      {
        name: "verdictStampedAt",
        status: "confirmed",
        type: "string",
        required: true,
        note: "When the check was stamped. §1's not_before compares it against the manifest's emittedAt."
      }
    ],
    preChecks: [
      "A submission with no verdict chosen. The parameter default is still pass (§1), so an unanswered form would otherwise record the answer nobody gave.",
      "A stamp where nothing has been emitted for the document. §1's not_before compares the stamp against the manifest's emittedAt, and until one exists there is nothing to stamp against; the comparison itself stays the backend's."
    ],
    backendRejects: [
      "not_before — a verdict stamped before the manifest's emittedAt. §1 names it among the eight preconditions waiting on the submission-time Function and records it as a cross-object comparison an action cannot make.",
      "The organization marking every act carries — INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e) — which refuses a caller outside it (§1)."
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [
        "useElement",
        "useLearning"
      ],
      note: "What was recorded is read back and never assumed from the click, because the parameter's default is still pass; §7.8 records the verdict on Learning as a Level 2 → Level 3 trigger."
    },
    onFailure: {
      region: "unresolved",
      message: "The check could not be recorded. Nothing was stamped, and the answer you gave is still here.",
      preservesInput: true
    },
    needed: [
      "the object type verdict and verdictStampedAt are written on; §1 records the two properties without one, and no other section of the register names it",
      "the pass default cleared by hand in Ontology Manager; §1 records that it cannot be cleared through the API path the widening used",
      "the submission-time Function, for not_before",
      "an emission gate. Since the act widened to accept fail on 2026-09-01, clause 3's pass-only requirement is held by nothing: recording a fail is correct, letting a failed claim into a signed document is not, and only a gate at emission tells those apart (§1)"
    ],
    notes: [
      "The register never names the object type carrying verdict. claim is inferred from §1s own sentence — \"letting a failed claim into a signed document\" — and from claim being one of the seven row types the eleven unwalkable acts key on. Inferred, not measured: confirm it against the ontology before wiring.",
      "A modify act takes the object it modifies. §1 records neither that object type nor the parameter, so neither is written here.",
      "emit-document writes emittedAt, closureHolds, manifestHash and emittedBy, and closureHolds is a parameter whose false value is not refused (§1). A fail and a closure that holds can both stand on one document today.",
      "§6.5's Verifier verdicts tile counts what this act wrote and carries both of §1's warnings — the pass default, and the pass-only requirement now held by nothing.",
      "§1's table records the actor as none and gives no reason. Nothing records who stamped a verdict.",
      "One of the eleven acts §1 records as unreachable today."
    ]
  },

  "signature-ready-publish-under-compulsion": {
    apiName: "signature-ready-publish-under-compulsion",
    status: "exercisable",
    serves: "publishes on the day the deadline elapses, in as substantially complete form as is possible, and records which rule compelled it",
    reserved: null,
    offeredOn: [
      "ElementScreen — P3 Step 5 · Publish, the 1b.5(f) row, and P4 Step 7 · Publish and file, the 1b.7(l) row",
      "ActionBar — the SubmitBar on those two tabs"
    ],
    unplaced: null,
    writes: [
      "compelledPublication.publishedAt",
      "compelledPublication.compellingRule",
      "compelledPublication.actorPrincipal"
    ],
    actor: "current_user_id",
    params: [
      {
        name: "publishedAt",
        status: "confirmed",
        type: "string",
        required: true,
        note: "The day publication was compelled. 1b.5(f) and 1b.7(l) each require it at the latest on the day the deadline elapses."
      },
      {
        name: "compellingRule",
        status: "confirmed",
        type: "string",
        required: true,
        closedSet: [
          "1b.5(f)",
          "1b.7(l)"
        ],
        note: "§1 and §3 record the set as exactly these two, which is exactly where part 1b compels publication, no more and no fewer."
      }
    ],
    preChecks: [
      "A compelling rule the pathway cannot reach. 1b.5(f) is the environmental assessment's and 1b.7(l) is the environmental impact statement's, so P0, P1 and P2 reach neither.",
      "A publication with no date. The record is of the day the deadline elapsed and there is nothing to record without one."
    ],
    backendRejects: [
      "The organization marking every act carries — INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e) — which refuses a caller outside it (§1)."
    ],
    onSuccess: {
      mode: "refetch",
      invalidates: [
        "useElement",
        "useSteps"
      ],
      note: "The act creates a row, and both the publish tab and the step's mark turn on it. It is the only one of these four that leaves a record on the platform today, so that record is read back."
    },
    onFailure: {
      region: "unresolved",
      message: "The publication was not recorded. Nothing has been published, and what you entered is still here.",
      preservesInput: true
    },
    needed: [],
    notes: [
      "§1 names this one of the four acts that can be run today, and the only one of the four keyed on nothing: it creates its own row.",
      "§3 records the still-pending list as unsatisfiedElement rows via manifest.unsatisfiedElements, written in the same transaction rather than as a facet. Nothing creates a manifest, so a compelled publication can be recorded today with no list of what was still outstanding.",
      "Not gated. §7.2 names three gated surfaces — the FANEC, FONSI and ROD signatures at 1b.3(g)(2)(vi), 1b.6(b)(5) and 1b.8(b)(8) — and records that the EA and the EIS carry no gate at any point, because 1b.5(c)(6) and 1b.7(h)(8) state that the certifying statement requires no signature and that approval to publish indicates concurrence.",
      "The trigger is not built. §7.8 assembles the pending-element list when the deadline reaches expiry, and document.deadlineDays, deadlineTriggerName and deadlineTriggerDate are null with nothing computing the soonest of three (§3).",
      "Nothing refuses a second compelled publication on one document. §1's uniqueness gaps name open-determination and open-document and not this act.",
      "Attribution is from current_user_id, which §1 records as decidable against Multipass rather than trusted at write time; the ^(?!service:) regex is gone and nothing replaces it.",
      "The failure message must not read as though the deadline was met. Under 1b.5(f) and 1b.7(l) the day is the obligation."
    ]
  }
};
