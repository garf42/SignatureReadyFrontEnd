import {
  DRAFTED,
  RECORD,
  RULE,
  STARTED_BY,
  STEP_LINK,
  absent,
  blocked,
  filled,
  unresolved
} from "@/ui/data/fixtures";
import type {
  Archive,
  ArtifactView,
  Catalogue,
  ExpertDraft,
  ExpertQueue,
  Learning,
  Reference,
  ReferenceRow,
  Region,
  Regulation,
  UnresolvedLane
} from "@/ui/data/types";

/** §6, the four pages reachable from the left pane.
 *
 *  Two kinds of string live here and they must not be confused. A ⟨marker⟩ is
 *  a value the ontology would supply and does not: 76 of 79 object types hold
 *  zero rows. A bare number is a count the register measured on the platform
 *  on 2026-09-04, and it is reproduced exactly. Learning and Reference are
 *  mostly the second kind, which is why they are the two pages that fill.
 */

/* --------------------------------------------------------------------------
 * §6.3 Archive — Level 1
 * ------------------------------------------------------------------------ */

/** Heading and help for each supporting page. §6.1 says empty is the expected
 *  state at build time and should read as designed — a page whose title only
 *  appears when it has rows does not. These render in every state, and only
 *  the counts and the rows travel through a region. */
export const PAGES = {
  archive: {
    title: "Archive",
    help: "Projects removed from the inbox. Restore returns one; delete permanently is confirmed and cannot be undone."
  },
  experts: {
    title: "Expert Q",
    help: "Work the review cannot be completed without a specialist for. The system recognises the requirement and drafts the request; a person sends it."
  },
  learning: {
    title: "Learning",
    help: "What the system proposed, what a human did with it, and whether it is calibrated. Every number was measured on 2026-09-04."
  },
  reference: {
    title: "Reference",
    help: "The corpus, the pinned regulation and the categorical-exclusion catalogue. Search covers titles and metadata; there is no document body text to search."
  }
} as const;

/** §1 lists 17 acts and none of them deletes or restores, and §3 records no
 *  deleted or archivedAt property on project. The page has no backend address
 *  at all, so absent is the correct state and the only honest one. */
export const archiveAbsent: Region<Archive> = absent(
  "Nothing has been archived",
  "⟨project.archived = true · ordered by project.archivedAt desc⟩",
  [],
  [RECORD]
);

export const archiveFilled: Region<Archive> = filled<Archive>({
  count: "⟨n⟩ archived",
  rows: [
    {
      id: "a1",
      name: "⟨project.name⟩",
      archived: "Archived ⟨date.archived⟩",
      archivedBy: STARTED_BY,
      position: "Step ⟨n⟩ · ⟨tab⟩",
      mark: "review",
      summary: "⟨project.summary⟩",
      meta: "⟨project.ref⟩ · ⟨project.office⟩ · ⟨project.status⟩ · started ⟨date.started⟩"
    },
    {
      id: "a2",
      name: "⟨project.name⟩",
      archived: "Archived ⟨date.archived⟩",
      archivedBy: null,
      position: "Submitted ⟨date.modified⟩",
      mark: "ready",
      summary: "⟨project.summary⟩",
      meta: "⟨project.ref⟩ · ⟨project.office⟩ · ⟨project.status⟩ · started ⟨date.started⟩"
    }
  ]
});

export const archiveBlocked: Region<Archive> = blocked(
  "Not ready yet",
  "the officer's office assignment",
  STEP_LINK
);
export const archiveUnresolved: Region<Archive> = unresolved(
  "The archive could not be read",
  "no archived state exists on project, and no act archives, restores or purges one"
);

/** Carried on the page because anything that counts projects counts these. */
export const ARCHIVE_NOTE =
  "The two project rows in the ontology are both synthetic — one labelled “C5 write-path tracer — safe to delete”, one named “lk” with every other field null. §4 asks whether they should be removed.";

/* --------------------------------------------------------------------------
 * §6.4 Expert Q — Level 4
 * ------------------------------------------------------------------------ */

const QUEUE_LIMITS = [
  "Neither expert act writes an actor, so the queue cannot show who sent a request.",
  "Nothing joins a holder to a slot, so a recipient is a suggestion the officer confirms, never a routing the system made.",
  "Both acts key on a slot, and nothing creates one — eleven of seventeen acts wait on this."
];

export const expertQueueAbsent: Region<ExpertQueue> = absent(
  "No expert requests are open",
  "⟨assignment · engagement.outcome = open · ordered by expectedReturnDate asc⟩",
  [],
  [RULE]
);

export const expertQueueFilled: Region<ExpertQueue> = filled<ExpertQueue>({
  count: "⟨n⟩ open · ⟨n⟩ overdue",
  filters: ["All requests", "Overdue", "Awaiting return", "Returned", "Accepted"],
  sorts: ["Overdue first", "Expected return", "Sent date", "Project", "Discipline"],
  limits: QUEUE_LIMITS,
  rows: [
    {
      id: "q1",
      expert: "⟨expert.name⟩",
      qualification: "⟨expert.qualification⟩",
      discipline: "⟨discipline⟩",
      project: "⟨project.name⟩",
      awaiting: "⟨artifactAwaited⟩",
      sent: "⟨sentAt⟩",
      expectedReturn: "⟨expectedReturnDate⟩",
      status: "overdue",
      gapsFound: null,
      sentBy: null
    },
    {
      id: "q2",
      expert: "⟨expert.name⟩",
      qualification: "⟨expert.qualification⟩",
      discipline: "⟨discipline⟩",
      project: "⟨project.name⟩",
      awaiting: "⟨artifactAwaited⟩",
      sent: "⟨sentAt⟩",
      expectedReturn: "⟨expectedReturnDate⟩",
      status: "awaiting",
      gapsFound: null,
      sentBy: null
    },
    {
      id: "q3",
      expert: "⟨expert.name⟩",
      qualification: "⟨expert.qualification⟩",
      discipline: "⟨discipline⟩",
      project: "⟨project.name⟩",
      awaiting: "⟨artifactType⟩",
      sent: "⟨sentAt⟩",
      expectedReturn: "⟨expectedReturnDate⟩",
      status: "returned",
      gapsFound: "⟨gapsFound⟩",
      sentBy: null
    },
    {
      id: "q4",
      expert: "⟨expert.name⟩",
      qualification: "⟨expert.qualification⟩",
      discipline: "⟨discipline⟩",
      project: "⟨project.name⟩",
      awaiting: "⟨artifactType⟩",
      sent: "⟨sentAt⟩",
      expectedReturn: "⟨expectedReturnDate⟩",
      status: "accepted",
      gapsFound: "⟨gapsFound⟩",
      sentBy: null
    }
  ]
});

export const expertQueueBlocked: Region<ExpertQueue> = blocked(
  "Not ready to request",
  "a slot to attach the request to",
  STEP_LINK
);
export const expertQueueUnresolved: Region<ExpertQueue> = unresolved(
  "The queue could not be read",
  "assignment.slot is written into the edits layer while the backing column is null, and whether the edge resolves in that state can only be settled by traversing it"
);

export const expertDraftFilled: Region<ExpertDraft> = filled<ExpertDraft>({
  project: "⟨project.name⟩",
  uniqueIdentificationNumber: "⟨project.uniqueIdentificationNumber⟩",
  trigger: "Extraordinary-circumstance finding returned present or undetermined — 1b.3(f)(2)",
  artifactAwaited: "⟨artifactAwaited⟩",
  expectedReturn: "⟨expectedReturnDate⟩",
  regulatoryBasis: RULE,
  proposedRecipient: "⟨holder.name, qualification⟩",
  recipientNote:
    "A suggestion, not a routing: nothing joins a holder to the slot that needs one, so the officer confirms the recipient.",
  body: "⟨request.body — drafted from the project and the finding that triggered it, fully editable⟩"
});

export const expertDraftUnresolved: Region<ExpertDraft> = unresolved(
  "No request could be drafted",
  "the drafting lane could not run — no model call has occurred or can, and no Function or AIP Logic exists in the project"
);

export const EXPERT_TRIGGER =
  "signature-ready-state-factor-finding closes at clear / present / undetermined. Present or undetermined is the condition that needs a discipline: on that finding the request is drafted and held here. The recognition is automated; the officer sends.";

export const EXPERT_RETURN =
  "The return leg belongs here too: record-artifact-arrival, then accept-artifact, which writes gapsFound and closes the engagement.";

/* --------------------------------------------------------------------------
 * §6.5 Learning — Level 3
 * ------------------------------------------------------------------------ */

export const learningFilled: Region<Learning> = filled<Learning>({
  status: [
    {
      id: "grounding",
      title: "Grounding honesty",
      figure: "0 / 0 / 103",
      unit: "live-model / cassette / template-substitution claims",
      tone: "warn",
      note: "How much of what the system says is written by a model, and how much is filled into a template. Right now, none of it is written by a model.",
      detail: [
        "The only configured provider host is an RFC-2606 .invalid domain.",
        "LiveHTTPTransport.invoke raises even with a credential set.",
        "The number shown is the real one. A dashboard showing an honest zero is a stronger artifact than one showing a fabricated adoption rate."
      ]
    },
    {
      id: "mechanism",
      title: "Mechanism status",
      figure: "0",
      unit: "rows in all five object-dataset materializations",
      tone: "error",
      note: "Whether the parts that would let the system learn from what officers accept are actually connected. They are not.",
      detail: [
        "materialized.adoption, .assignment, .determination, .engagement and .receivedArtifact all hold zero rows.",
        "So no transform can read an act-written row, and ratification can never populate.",
        "A person must create these in Ontology Manager; no tool exposes it."
      ]
    }
  ],
  tiles: [
    {
      id: "adoption",
      title: "Adoption diff",
      figure: "⟨n⟩",
      unit: "adoptions, by state",
      tone: "warn",
      note: "How often officers accept, edit or reject what the system proposes — and what they changed when they edited it.",
      detail: [
        "signature-ready-adopt writes adoptedValue and adoptionState (closed 3) with actorPrincipal from current_user_id.",
        "Latent defect, surfaced rather than filtered out: adoptedValue must be present unless the state is rejected. That is a conditional over another parameter's nullity, it is not expressible without a Function, and an adopted with no value can be recorded today."
      ]
    },
    {
      id: "disposition",
      title: "Disposition mix against its pin",
      figure: "⟨retrieved / drafted / specialist⟩",
      unit: "against disposition_mix.pin.json",
      tone: "plain",
      note: "Whether work is arriving from the expected mix of sources: found in the record, drafted, or supplied by a specialist.",
      detail: ["Intent-predicate clause 2 turns on this comparison, and is recorded as enforcedAt 'none'."]
    },
    {
      id: "verdicts",
      title: "Verifier verdicts",
      figure: "⟨pass⟩ / ⟨fail⟩",
      unit: "from stamp-verifier-verdict",
      tone: "warn",
      note: "How often the checks that run before a document is issued pass, and how often they fail.",
      detail: [
        "The default is still pass, and it can only be cleared by hand in Ontology Manager.",
        "Since the act widened to accept fail on 2026-09-01, clause 3's pass-only requirement is held by nothing. Recording a fail is correct; letting a failed claim into a signed document is not, and only an emission gate can tell those apart."
      ]
    },
    {
      id: "unresolved",
      title: "Unresolved, app-wide",
      figure: "3",
      unit: "lanes reporting unresolved",
      tone: "warn",
      note: "How often a question came back with no answer because the system could not look, rather than because there was nothing to find.",
      detail: [
        "determinationEvidence has a declared evidence set for two of the five determinations and none for the other three.",
        "Those three report that nothing was asked rather than that nothing was found — the distinction working, not a failure."
      ]
    },
    {
      id: "drift",
      title: "Regulation drift",
      figure: "0",
      unit: "drift detected",
      tone: "plain",
      note: "Whether the copy of the regulation the system reasons against still matches the published one.",
      detail: [
        "Witness retrieved independently at eCFR issue date 2026-08-25, byte-identical to the 2026-08-11 pin.",
        "The pin reaches 2026-08-25 against a stated currency of 2026-09-01 — seven days unverified.",
        "§1 calls this the one thing in the build that would ever want to run on a schedule."
      ]
    },
    {
      id: "corpus",
      title: "Corpus shortfalls",
      figure: "6",
      unit: "rows in corpus.manifestStatus",
      tone: "plain",
      note: "Whether the reference library is complete: what each collection expected to hold, and what is missing.",
      detail: ["⟨corpus.manifestStatus — one row per corpus, quoted as written⟩"]
    }
  ],
  notBuilt:
    "1b.3(h) reliance on a prior CE determination is a genuine regulation-backed learning loop — §3 records precedent and prior_coverage in the spec and 51 artifacts in the prior-coverage corpus, and no object type records a reliance. Named here so it is visible as a future tile, and not built now."
});

export const learningAbsent: Region<Learning> = absent(
  "Nothing has been proposed yet",
  "⟨materialized.adoption · materialized.determination⟩"
);
export const learningBlocked: Region<Learning> = blocked(
  "Not ready yet",
  "the five object-dataset materializations",
  STEP_LINK
);
export const learningUnresolved: Region<Learning> = unresolved(
  "The dashboard could not be read",
  "no transform can read an act-written row while the materializations hold zero rows"
);

export const unresolvedLanes: Region<UnresolvedLane[]> = filled<UnresolvedLane[]>([
  {
    lane: "determinationEvidence · det_extraordinary_circumstances",
    count: "1",
    reason: "No evidence set is declared for this determination, so nothing was asked.",
    correct: true
  },
  {
    lane: "determinationEvidence · det_documentation_required",
    count: "1",
    reason: "No evidence set is declared for this determination, so nothing was asked.",
    correct: true
  },
  {
    lane: "determinationEvidence · det_significance",
    count: "1",
    reason: "No evidence set is declared for this determination, so nothing was asked.",
    correct: true
  }
]);

/* --------------------------------------------------------------------------
 * §6.6 Reference — Levels 0 and 1
 * ------------------------------------------------------------------------ */

const SUPERSEDED_WARNING =
  "Declares itself current and is not: 36 CFR 220 was superseded on 2025-07-03, and 111 corpus artifacts are written under it. Still a WARN; it becomes a FAIL when a corrected manifest lands.";

const RESCINDED_WARNING =
  "Rescinded in its entirety by WO Amendment 1909.15-2026-1, effective 2026-03-26. Never citable, and browsable: superseded practice is still evidence about practice.";

const IMAGE_ONLY_WARNING =
  "Image-only. No text layer to select; the page image is the artifact.";

const TRUNCATED_WARNING = "Truncated at source. This one will not open.";

const MARKER_ABSENCE_WARNING =
  "Born-digital by marker absence, not by measurement: only 2 documents in the corpus fire a producer marker at all. minCharsOnAPage is shown so the suspicion is investigable.";

const row = (
  id: string,
  corpus: string,
  documentType: string,
  ruleVintage: string,
  citable: ReferenceRow["citable"],
  extractability: string,
  warnings: string[] = []
): ReferenceRow => ({
  id,
  title: "⟨artifact.title⟩",
  corpus,
  documentType,
  ruleVintage,
  citable,
  extractability,
  sha256: "⟨sha256⟩",
  byteLength: "⟨byteLength⟩",
  minCharsOnAPage: "⟨minCharsOnAPage⟩",
  warnings
});

export const referenceFilled: Region<Reference> = filled<Reference>({
  count: "312 artifacts · 7 media sets · 283 practice, 4 regulation, 25 undeclared",
  filters: [
    "All artifacts",
    "Citable",
    "Not citable",
    "Not declared",
    "Superseded authority",
    "Rescinded",
    "Will not open"
  ],
  sorts: ["Corpus", "Document type", "Rule vintage", "Title", "Byte length"],
  facets: [
    {
      id: "documentType",
      name: "Document type",
      options: [
        { label: "FANEC", count: "4" },
        { label: "Decision Memo", count: "32" },
        { label: "EA", count: "29" },
        { label: "FONSI", count: "34" },
        { label: "EIS", count: "51" },
        { label: "ROD", count: "47" }
      ]
    },
    {
      id: "class",
      name: "Class",
      options: [
        { label: "Practice", count: "283" },
        { label: "Regulation", count: "4" },
        { label: "Undeclared", count: "25" }
      ]
    },
    {
      id: "vintage",
      name: "Rule vintage",
      options: [
        { label: "Current rule — 2026-04-03", count: "⟨n⟩" },
        { label: "36 CFR 220 — superseded 2025-07-03", count: "111" },
        { label: "FSH 1909.15 — rescinded 2026-03-26", count: "26" }
      ]
    },
    {
      id: "extractability",
      name: "Extractability",
      options: [
        { label: "Born-digital", count: "253" },
        { label: "Image-only", count: "14" },
        { label: "OCR-derived", count: "2" },
        { label: "Unreadable — truncated at source", count: "2" }
      ]
    },
    {
      id: "citable",
      name: "Citable",
      options: [
        { label: "Citable", count: "⟨n⟩" },
        { label: "Not citable", count: "⟨n⟩" },
        { label: "Not declared", count: "25" }
      ]
    }
  ],
  rows: [
    row("c1", "practice", "FONSI", "Current rule — 2026-04-03", "yes", "Born-digital", [
      MARKER_ABSENCE_WARNING
    ]),
    row("c2", "practice", "ROD", "36 CFR 220 — superseded 2025-07-03", "yes", "Born-digital", [
      SUPERSEDED_WARNING
    ]),
    row("c3", "regulation", "Regulation", "36 CFR 220 — superseded 2025-07-03", "yes", "Born-digital", [
      SUPERSEDED_WARNING
    ]),
    row("c4", "practice", "EIS", "36 CFR 220 — superseded 2025-07-03", "no", "Image-only", [
      IMAGE_ONLY_WARNING
    ]),
    row("c5", "practice", "EA", "Current rule — 2026-04-03", "no", "Unreadable", [
      TRUNCATED_WARNING
    ]),
    row(
      "c6",
      "forest-plan-raw",
      "Forest plan",
      "FSH 1909.15 — rescinded 2026-03-26",
      "not-declared",
      "Born-digital",
      [
        RESCINDED_WARNING,
        "classDeclared is false and citable is NULL. Not declared is not the same claim as not citable, and the two must not share a null."
      ]
    ),
    row("c7", "practice", "Decision Memo", "36 CFR 220 — superseded 2025-07-03", "not-declared", "OCR-derived", [
      "Issued under the prior rule. The current text has no Decision Memo; §4 asks a domain expert what the current-rule equivalent is in practice."
    ])
  ],
  integrity: [
    "287 of 287 declared artifacts match on digest and length, both directions",
    "11 forest-plan sources pinned",
    "Regulation pin green",
    "Drift clean — witness at 2026-08-25 byte-identical to the 2026-08-11 pin"
  ],
  hazard:
    "Extracted text can be wrong while announcing nothing. On the 1990 Umatilla ROD the cover reads “Forest Service” in the page image and “Forest %Nice” in the text layer, on all three extractors, with no error and no signal. Anything offered here as selectable text carries that caveat."
});

export const referenceAbsent: Region<Reference> = absent(
  "No artifacts match",
  "⟨corpusArtifact · facets over title and metadata only⟩"
);
export const referenceBlocked: Region<Reference> = blocked(
  "Not ready yet",
  "a media-set read route",
  STEP_LINK
);
export const referenceUnresolved: Region<Reference> = unresolved(
  "The corpus could not be read",
  "corpusArtifact is the one populated type in the build; an empty read here is a binding failure, not an answer"
);

export function artifactView(id: string): Region<ArtifactView> {
  const found = referenceFilled.state === "filled" ? referenceFilled.value.rows.find((r) => r.id === id) : undefined;
  if (!found) {
    return absent("That artifact is not in the corpus", `⟨corpusArtifact.byId · ${id}⟩`);
  }
  if (found.extractability === "Unreadable") {
    return unresolved(
      "This artifact will not open",
      "truncated at source — 2 of the 271 classified PDFs are, and this is one"
    );
  }
  return filled<ArtifactView>({
    row: found,
    pageRange: "⟨pages.start⟩–⟨pages.end⟩ of ⟨pages.total⟩",
    opensAt: "⟨citation.page⟩",
    caveats: [
      "The addressable unit is a page range, not a document: one corpus FONSI occupies pages 31–34 of a 155-page file, so sufficiency lives at a page range and treating the document as the unit teaches the wrong length.",
      ...found.warnings
    ]
  });
}

export const artifactBlocked: Region<ArtifactView> = blocked(
  "The viewer is not wired yet",
  "a media-set read route the OSDK front end can use",
  { label: "PORT-ADDITIONS.md · useReferenceArtifact ›", href: "#port-additions" },
  [],
  [DRAFTED]
);

export const REGULATION_BODY = "⟨1b · section text, from the pinned copy⟩";

export const REGULATION_CURRENCY =
  "The pin and its independent drift witness both reach eCFR issue date 2026-08-25 and agree byte for byte. The stated currency line is 2026-09-01, so seven days are unverified.";

export const regulationFilled: Region<Regulation> = filled<Regulation>({
  pin: "eCFR title-7 subtitle A part 1b, issue date 2026-08-11 · 222,131 bytes · sha256 a8097af3…fea6db20",
  currency:
    "The pin and its independent drift witness both reach eCFR issue date 2026-08-25 and agree byte for byte. The stated currency line is 2026-09-01, so seven days are unverified.",
  sections: [
    { id: "1b.1", name: "Purpose and scope", amended: "2026-04-03", note: null, body: REGULATION_BODY },
    { id: "1b.2", name: "Applicability and level of review", amended: "2026-04-03", note: null, body: REGULATION_BODY },
    { id: "1b.3", name: "Categorical exclusions", amended: "2026-04-03", note: null, body: REGULATION_BODY },
    {
      id: "1b.4",
      name: "USDA categorical exclusions",
      amended: "2026-04-03",
      note: "Also carries an interim-period amendment at 2025-07-18. Three limbs, not two: (a) excludes nine named subcomponents outright.",
      body: REGULATION_BODY
    },
    { id: "1b.5", name: "Environmental assessments", amended: "2026-04-03", note: null, body: REGULATION_BODY },
    { id: "1b.6", name: "Findings of no significant impact", amended: "2026-04-03", note: null, body: REGULATION_BODY },
    { id: "1b.7", name: "Environmental impact statements", amended: "2026-04-03", note: null, body: REGULATION_BODY },
    { id: "1b.8", name: "Records of decision", amended: "2026-04-03", note: null, body: REGULATION_BODY },
    {
      id: "1b.9",
      name: "General provisions",
      amended: "2026-07-02",
      note: "Further amended at 91 FR 40353. The source note at the foot of the section corroborates both amendments from inside the document.",
      body: REGULATION_BODY
    },
    { id: "1b.10", name: "Applicant and third-party preparation", amended: "2026-04-03", note: null, body: REGULATION_BODY },
    { id: "1b.11", name: "Definitions", amended: "2026-04-03", note: null, body: REGULATION_BODY },
    {
      id: "1b.12",
      name: "Severability",
      amended: "2025-07-03",
      note: "The only section the 2026-04-03 final rule did not touch. It still carries interim-rule text. Probably deliberate; not verified.",
      body: REGULATION_BODY
    }
  ],
  unresolvedCitations: [
    "1b.5(g)(2) cites “§ 1b.2(b)(5)(iv)”, which does not exist — 1b.2(b) has paragraphs (1) and (2) only. The intended target is almost certainly 1b.2(b)(2)(iv).",
    "1b.9(o) cites “§ 1b.2(b)(2)(ix)”, which does not exist — 1b.2(b)(2) runs (i) through (viii). The intended target is (viii).",
    "1b.2(f)(2)(i) cites NEPA section 109 as “42 U.S.C. 336c”; 1b.3(c) cites the same section as 42 U.S.C. 4336c. The former is the typographical error.",
    "1b.11(a) opens “terms have the meanings provided in NEPA section 111, 42 U.S.C. 4336(e)”. Section 111 is codified at 42 U.S.C. 4336e, which is what the body of 1b.11 uses throughout."
  ]
});

export const REGULATION_NOTE =
  "Shown as found. These are not build defects and must not be silently repaired: a resolver that quietly fixes them hides a finding.";

export const catalogueAbsent: Region<Catalogue> = absent(
  "The categorical-exclusion catalogue has not been loaded",
  "⟨category · citation, descriptionVerbatim⟩",
  [],
  [RULE]
);

export const catalogueFilled: Region<Catalogue> = filled<Catalogue>({
  split:
    "87 categories: 39 at 1b.4(c) requiring no documentation, 48 at 1b.4(d) requiring a FANEC completed as set forth at 1b.3(g).",
  rows: [
    {
      citation: "1b.4(c)(⟨n⟩)",
      descriptionVerbatim: "⟨category.descriptionVerbatim⟩",
      documentationRequired: false
    },
    {
      citation: "1b.4(d)(⟨n⟩)",
      descriptionVerbatim: "⟨category.descriptionVerbatim⟩",
      documentationRequired: true
    }
  ]
});

export const CATALOGUE_EMPTY_REASON =
  "category holds zero rows. The 87 rows sit in ce_categories.json, which §3 names as the single cheapest high-value population in the build, with five obligations blocked behind it. §2 re-derives 87 from the pinned text, so the file and the rule agree.";

export const integrityStrip: Region<string[]> = filled<string[]>([
  "287 / 287 digests and lengths match, both directions",
  "11 forest-plan sources pinned",
  "Regulation pin green",
  "Drift clean at 2026-08-25",
  "reg-36cfr220 — WARN: 2 rows declare themselves current"
]);

export const integrityUnresolved: Region<string[]> = unresolved(
  "The integrity checks could not be read",
  "check.corpusPin, check.forestPlanPin, check.regulationPin and check.regulationDrift are the four datasets this strip reads"
);
