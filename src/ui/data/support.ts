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
  Regulation
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
/* --------------------------------------------------------------------------
 * §6.4 Expert Q — Level 4
 * ------------------------------------------------------------------------ */

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
  trigger: "⟨finding.trigger⟩ · 1b.3(f)(2)",
  artifactAwaited: "⟨artifactAwaited⟩",
  expectedReturn: "⟨expectedReturnDate⟩",
  regulatoryBasis: RULE,
  proposedRecipient: "⟨holder.name, qualification⟩",
  body: "⟨request.body — drafted from the project and the finding that triggered it, fully editable⟩"
});

export const expertDraftUnresolved: Region<ExpertDraft> = unresolved(
  "No request could be drafted",
  "the drafting lane could not run — no model call has occurred or can, and no Function or AIP Logic exists in the project"
);

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
      note: "How much of what the system says is written by a model, and how much is filled into a template. Right now, none of it is written by a model."
    },
    {
      id: "mechanism",
      title: "Mechanism status",
      figure: "0",
      unit: "records the system can learn from",
      tone: "error",
      note: "Whether the parts that would let the system learn from what officers accept are actually connected. They are not."
    }
  ],
  tiles: [
    {
      id: "adoption",
      title: "Adoption diff",
      figure: "⟨n⟩",
      unit: "adoptions, by state",
      tone: "warn",
      note: "How often officers accept, edit or reject what the system proposes — and what they changed when they edited it."
    },
    {
      id: "disposition",
      title: "Disposition mix against its pin",
      figure: "⟨retrieved / drafted / specialist⟩",
      unit: "against the expected split",
      tone: "plain",
      note: "Whether work is arriving from the expected mix of sources: found in the record, drafted, or supplied by a specialist."
    },
    {
      id: "verdicts",
      title: "Verifier verdicts",
      figure: "⟨pass⟩ / ⟨fail⟩",
      unit: "checks before issue",
      tone: "warn",
      note: "How often the checks that run before a document is issued pass, and how often they fail."
    },
    {
      id: "unresolved",
      title: "Unresolved, app-wide",
      figure: "3",
      unit: "lanes reporting unresolved",
      tone: "warn",
      note: "How often a question came back with no answer because the system could not look, rather than because there was nothing to find."
    },
    {
      id: "drift",
      title: "Regulation drift",
      figure: "0",
      unit: "drift detected",
      tone: "plain",
      note: "Whether the copy of the regulation the system reasons against still matches the published one."
    },
    {
      id: "corpus",
      title: "Corpus shortfalls",
      figure: "6",
      unit: "collections with shortfalls",
      tone: "plain",
      note: "Whether the reference library is complete: what each collection expected to hold, and what is missing."
    }
  ]
});

export const learningAbsent: Region<Learning> = absent(
  "Nothing has been proposed yet",
  "⟨adoption.byProject · determination.byProject⟩"
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

/* --------------------------------------------------------------------------
 * §6.6 Reference — Levels 0 and 1
 * ------------------------------------------------------------------------ */

const SUPERSEDED_WARNING = "Superseded 2025-07-03 — declares itself current";

const RESCINDED_WARNING = "Rescinded 2026-03-26 — WO Amendment 1909.15-2026-1";

const IMAGE_ONLY_WARNING = "Image-only — no text layer";

const TRUNCATED_WARNING = "Truncated at source — will not open";



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
    row("c1", "practice", "FONSI", "Current rule — 2026-04-03", "yes", "Born-digital"),
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
      [RESCINDED_WARNING]
    ),
    row("c7", "practice", "Decision Memo", "36 CFR 220 — superseded 2025-07-03", "not-declared", "OCR-derived", [
      "Issued under the prior rule. The current text has no Decision Memo; §4 asks a domain expert what the current-rule equivalent is in practice."
    ])
  ],
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

