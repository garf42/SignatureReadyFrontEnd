import {
  COMPETENCE_CONDITIONS,
  CROSS_CUTTING,
  DOCUMENT_AUTHORITY,
  LEVELS,
  PATHWAYS,
  PATHWAY_IDS,
  RETRIEVAL_PUSHES,
  SHARED_STEPS,
  TRANSITIONS,
  TRIGGERS,
  elementRows,
  findTab,
  isPermission,
  railFor,
  ridFor
} from "@/ui/data/pathways";
import type {
  DocumentType,
  GateSpec,
  PathwayId,
  RowSpec,
  TabSpec
} from "@/ui/data/pathways";
import {
  CALCULATED,
  CHOICE_LIST,
  DRAFTED,
  RECORD,
  REQUESTED,
  RULE,
  STEP_LINK,
  SUBMITTING,
  absent,
  blocked,
  filled,
  unresolved
} from "@/ui/data/fixtures";
import type {
  Action,
  Answer,
  BandEntry,
  DocumentLedgerEntry,
  ElementPanel,
  Gate,
  LevelHistory,
  QuestionRow,
  Region,
  StepEntry,
  StepRail,
  TabEntry
} from "@/ui/data/types";

/** §7 rendered. Steps, tabs and rows come from `pathways.ts` — the rule, which
 *  is known. Everything a project would supply is a register marker, because
 *  76 of 79 object types hold zero rows and the honest fixture says so.
 *
 *  The one judgement in this file: no row is `unresolved` in the default view.
 *  §1 defines unresolved as always a defect, so scattering it decoratively
 *  would teach a reader that a defect is ordinary. It is reachable at
 *  `?state=unresolved` for the whole region and at `?retrieval=down` for the
 *  drafting lane, which is the case §7.8 names.
 */

export {
  COMPETENCE_CONDITIONS,
  CROSS_CUTTING,
  DOCUMENT_AUTHORITY,
  LEVELS,
  RETRIEVAL_PUSHES,
  TRANSITIONS,
  TRIGGERS
};

const CHANGE: Action = { id: "change", label: "Change answer", look: "secondary", enabled: true };
/* Every label here says what the act DOES, in the words of the work rather
   than the words of the widget. "Accept" was the worst of them: one word,
   addressed to someone being asked to rubber-stamp text they will sign, and it
   named no object — accept what, into what? A drafted paragraph becomes part of
   the document the responsible official signs, so the button says so. "Search"
   named no haystack. "Write your own answer" said "your own" to a professional
   whose own answer is the only kind there is. */
const ACCEPT: Action = { id: "accept", label: "Use this draft", look: "primary", enabled: true };
const EDIT: Action = { id: "edit", label: "Edit the draft", look: "secondary", enabled: true };
const SEARCH: Action = { id: "search", label: "Search the project record", look: "primary", enabled: true };
const SAVE: Action = { id: "save", label: "Save", look: "primary", enabled: true };
const WRITE_OWN: Action = { id: "write", label: "Write this yourself", look: "link", enabled: true };
const REPORT: Action = { id: "report", label: "Report a problem", look: "link", enabled: true };

/* --- the level history, and the state before a level is fixed -------------

   Replaces the old `pathwayState`, which was declared here, exported from
   nowhere and rendered by nothing: the pathway line was deleted from the band
   and the data layer was left behind. A non-specialist who is never told which
   review they are doing cannot be driven to the correct one, so it comes back —
   as a history rather than a scalar, because one proposal can occupy more than
   one level and, under 1b.9(r)(3), the same level twice. */

function episode(seq: number, pathway: PathwayId, ground: string, supersededBy: number | null) {
  const spec = PATHWAYS[pathway];
  return {
    seq,
    pathway,
    name: spec.name,
    reachedWhen: spec.reachedWhen,
    terminalOutput: spec.terminalOutput,
    ground,
    supersededBy
  };
}

/** The levels a proposal has occupied, in order, from the knob or the backend.
 *  `[]` is the honest state before Step 2 decides anything. */
export function levelHistory(levels: PathwayId[]): Region<LevelHistory> {
  const episodes = levels.map((pathway, i) =>
    episode(
      i + 1,
      pathway,
      i === 0 ? "initial" : "⟨transition⟩",
      i === levels.length - 1 ? null : i + 2
    )
  );
  const liveSeq = episodes.length > 0 ? episodes[episodes.length - 1].seq : null;
  const live = episodes.find((e) => e.seq === liveSeq);

  /* Levels the live determination's own limb sequence eliminated. Stated as an
     elimination, with the limb that did it — 1b.2(f)(2) is an ordered
     elimination, and expressing it by the ABSENCE of steps is what made the
     build unreviewable. Never rendered as a lane a user might pick from. */
  const foreclosed = live
    ? PATHWAY_IDS.filter((id) => !levels.includes(id)).map((pathway) => ({
        pathway,
        limb: FORECLOSED_BY[live.pathway],
        because: `${PATHWAYS[pathway].name} — not this proposal`
      }))
    : [];

  return filled<LevelHistory>({
    episodes,
    liveSeq,
    note:
      liveSeq === null
        ? "The level of review is fixed at Step 2. Until then no level step exists and none is named."
        : episodes.length > 1
          ? `Level ${String(liveSeq)} of ${String(episodes.length)} — this project has moved up. Everything from the earlier levels is still here and still readable.`
          : "",
    plain: live ? PATHWAYS[live.pathway].plain : null,
    documents: live ? DOCUMENTS_FOR[live.pathway](live.seq) : [],
    foreclosed
  });
}

const FORECLOSED_BY: Record<PathwayId, string> = {
  P0: "1b.2(e) — NEPA does not apply, so the level-of-review sequence is not reached",
  P1: "1b.2(f)(2)(i) — a categorical exclusion applies",
  P2: "1b.2(f)(2)(i) — a categorical exclusion applies",
  P3: "1b.2(f)(2)(iv)(A) — impacts not likely significant, or of unknown significance",
  P4: "1b.2(f)(2)(iv)(B) — impacts likely significant"
};

/** 1b.9(u) attaches the unique identification number to the DOCUMENT — the EA
 *  at 1b.5(c)(7), the EIS at 1b.7(h)(1)(v) — and makes it discretionary for a
 *  FANEC. One field on the project cannot carry two on an escalated proposal,
 *  which is the sharpest concrete consequence of escalation for the FDE and a
 *  schema change rather than a UI one. */
const doc = (
  documentType: DocumentType,
  seq: number,
  stepKey: string,
  numbered: boolean
): DocumentLedgerEntry => ({
  documentType,
  openedInEpisode: seq,
  state: "not-opened",
  uniqueIdentificationNumber: numbered ? "⟨document.uniqueIdentificationNumber⟩" : null,
  stepKey
});

const DOCUMENTS_FOR: Record<PathwayId, (seq: number) => DocumentLedgerEntry[]> = {
  P0: () => [],
  P1: () => [],
  P2: (seq) => [doc("FANEC", seq, `E${String(seq)}.P2.4`, false)],
  P3: (seq) => [
    doc("EA", seq, `E${String(seq)}.P3.4`, true),
    doc("FONSI", seq, `E${String(seq)}.P3.6`, false)
  ],
  P4: (seq) => [
    doc("EIS", seq, `E${String(seq)}.P4.5`, true),
    doc("ROD", seq, `E${String(seq)}.P4.8`, false)
  ]
};

export const levelsBlocked: Region<LevelHistory> = blocked(
  "Not ready yet",
  "the level-of-review determination at Step 2",
  STEP_LINK
);
export const levelsAbsent: Region<LevelHistory> = absent(
  "No level-of-review determination has been recorded",
  "⟨determination.whichDetermination = det_review_level⟩"
);
export const levelsUnresolved: Region<LevelHistory> = unresolved(
  "The level history could not be read",
  "determination.outcome is free text and nothing maps an outcome onto P0–P4; no supersession property exists, so an ordered history has no address"
);

/* --- the signature gate --- */

const CANNOT_VERIFY =
  "No platform predicate marks a caller's class. The surface withholds the act and the platform refuses the write; nothing here asserts an authorisation it cannot check.";

/** Takes the document it is being asked about. It used to take nothing and
 *  return one gate for the whole application whose citation was all three
 *  joined, so a FANEC tab could not say 1b.3(g)(2)(vi) without also saying
 *  something about a record of decision. */
export function gateFor(documentType: DocumentType | null, held: boolean): Region<Gate> {
  const spec = documentType ? GATE_BY_DOCUMENT[documentType] : null;
  if (!spec) {
    return absent(
      "No surface here is reserved to a named holder",
      "⟨authority.reserved_surfaces · this tab⟩"
    );
  }
  return filled<Gate>({
    reservedTo: spec.reservedTo,
    citation: spec.citation,
    routeLabel: spec.routeLabel,
    held,
    cannotVerify: CANNOT_VERIFY
  });
}

/** Exactly three. 1b.5(c)(6) and 1b.7(h)(8) state that the certifying statement
 *  requires no signature and that approval to publish indicates concurrence, so
 *  the EA and the EIS carry no gate at any point. */
const GATE_BY_DOCUMENT: Partial<Record<DocumentType, GateSpec>> = {
  FANEC: { reservedTo: "responsible official", citation: "1b.3(g)(2)(vi)", routeLabel: "Route for signature" },
  FONSI: { reservedTo: "responsible official", citation: "1b.6(b)(5)", routeLabel: "Route for signature" },
  ROD: { reservedTo: "responsible official", citation: "1b.8(b)(8)", routeLabel: "Route for signature" }
};

export const gateUnresolved: Region<Gate> = unresolved(
  "The caller's credential could not be read",
  "responsibleOfficial and delegation hold no rows and no platform predicate marks a user's role"
);

/* --- the rail ------------------------------------------------------------

   Computed from `railFor`, which reads `pathways.ts` over the level IDS the
   history names. It is deliberately NOT the array a backend returned: a
   readonly array forbids mutation, not a shorter one, so a live implementation
   that returned a single episode would silently delete the earlier level's
   steps and nothing on this side could tell. Deriving the rail means a wrong
   response can mislabel a level and can never lose a step. */

/** Per-tab and per-step completion has NO ontology address: nothing creates a
 *  slot row and eleven of the seventeen acts are keyed on one. So the count is
 *  null, and null is not zero — a tab with no address must not render as done.
 *  The old rail computed completion from the step's INDEX relative to whatever
 *  step id was in the URL, which meant standing on Step 8 marked Steps 0–7
 *  complete with full tab counts from a cold start. */
function tabEntries(tabs: TabSpec[]): TabEntry[] {
  return tabs.map((tab) => ({
    id: tab.id,
    name: tab.name,
    done: false,
    outstanding: null,
    placeholders: tab.elements.filter((row) => row.text === "placeholder").length,
    level: tab.level
  }));
}

/** A step whose document cannot begin until another exists. Machine-readable,
 *  and the two kinds are deliberately different strengths because the rule's
 *  own words are: a finding is prepared "based on" the assessment — 1b.6(a) —
 *  while a record of decision comes "upon COMPLETING" the statement — 1b.8(a).
 *  Flattening them into one predicate loses a distinction the rule makes. */
const WAITS_ON: Record<string, string> = {
  "P3.6": "1b.6(a) — the environmental assessment exists",
  "P4.8": "1b.8(a) — the environmental impact statement is complete"
};

export function stepRail(levels: PathwayId[], activeKey: string): Region<StepRail> {
  const withSeq = levels.map((pathway, i) => ({ seq: i + 1, pathway }));
  const liveSeq = withSeq.length > 0 ? withSeq[withSeq.length - 1].seq : null;
  const rail = railFor(withSeq);

  const steps: StepEntry[] = rail.map((entry) => {
    const superseded = entry.band.kind === "episode" && entry.band.seq !== liveSeq;
    const waitKey =
      entry.band.kind === "episode" ? `${entry.band.pathway}.${entry.step.id}` : "";
    const waitingOn = WAITS_ON[waitKey] ?? null;
    const active = entry.key === activeKey;
    return {
      id: entry.step.id,
      key: entry.key,
      n: entry.step.n,
      name: entry.step.name,
      purpose: entry.step.purpose,
      mark: superseded
        ? ("superseded" as const)
        : active
          ? ("active" as const)
          : waitingOn
            ? ("blocked" as const)
            : ("waiting" as const),
      /* Short, and only where the rail knows something the step itself does
         not show. The tab count was on every row and the tab strip says it
         better; the unwritten count was on every row and those rows announce
         themselves in the panel. */
      meta: superseded ? "Read only" : waitingOn ? "Waiting" : null,
      tabs: tabEntries(entry.step.tabs),
      band:
        entry.band.kind === "shared"
          ? { kind: "shared" as const }
          : { kind: "episode" as const, seq: entry.band.seq, pathway: entry.band.pathway, superseded },
      waitingOn
    };
  });

  const bands: BandEntry[] = [
    {
      band: { kind: "shared" },
      title: "Every review",
      status: "shared",
      summary: `${String(SHARED_STEPS.length)} steps · intake, the threshold determination and the level of review`,
      documents: [],
      collapsed: false
    },
    ...withSeq.map((level): BandEntry => {
      const superseded = level.seq !== liveSeq;
      const own = steps.filter(
        (s) => s.band.kind === "episode" && s.band.seq === level.seq
      );
      const docs = DOCUMENTS_FOR[level.pathway](level.seq);
      return {
        band: { kind: "episode", seq: level.seq, pathway: level.pathway, superseded },
        title: `Level ${String(level.seq)} · ${level.pathway} ${PATHWAYS[level.pathway].name}`,
        status: superseded ? "superseded" : "live",
        summary: [
          `${String(own.length)} steps`,
          PATHWAYS[level.pathway].terminalOutput,
          superseded ? "superseded — read only" : null
        ]
          .filter(Boolean)
          .join(" · "),
        documents: docs,
        /* Exactly one band opens: the live one. A P1 → P3 → P4 proposal is
           eighteen steps, and a rail that shows all of them at once is not a
           rail. The summary line is what a reader who never expands still
           gets, and it names the step count and the documents. */
        collapsed: superseded
      };
    })
  ];

  return filled<StepRail>({ bands, steps });
}

export const stepsAbsentSpec: Region<StepRail> = absent(
  "No steps have been worked out yet",
  "⟨element.byDocument · slot.byElement⟩"
);
export const stepsBlockedSpec: Region<StepRail> = blocked(
  "Not ready yet",
  "the intake answers at Step 0",
  STEP_LINK
);
export const stepsUnresolvedSpec: Region<StepRail> = unresolved(
  "The steps could not be read",
  "nothing creates a slot row, and eleven of seventeen acts are keyed on one"
);

/* --- one row --- */

const answerFor = (spec: RowSpec): Answer => {
  switch (spec.form) {
    case "quote":
      return { form: "quote", text: `“⟨1b · ${spec.ref} · verbatim⟩”` };
    case "value":
      return { form: "value", text: "⟨register.item.value⟩" };
    case "draft":
      return { form: "draft", text: "⟨register.item.drafting_basis⟩ · ⟨register.item.grounding_kind⟩" };
    case "select":
      return { form: "select", options: ["⟨choice.1⟩", "⟨choice.2⟩", "⟨choice.3⟩"] };
    case "choice":
      return {
        form: "choice",
        prompt: "⟨question.drafted⟩",
        options: ["⟨choice.1⟩", "⟨choice.2⟩", "⟨choice.3⟩"]
      };
    case "sourcesOnly":
      return { form: "sourcesOnly" };
  }
};

/** The five fields every row now carries, whatever branch builds it. `rid` is
 *  computed by ONE function so the anchor a comment resolves to and the key a
 *  backend joins on are the same string. */
function stem(stepKey: string, tab: TabSpec, i: number) {
  const spec = tab.elements[i];
  return {
    id: `${tab.id}-${String(i + 1)}`,
    rid: ridFor(stepKey, tab, i),
    ref: spec.ref,
    label: spec.label,
    help: spec.help,
    modality: spec.modality,
    textState: spec.text,
    level: spec.level ?? tab.level,
    restates: spec.restates,
    discretionary: isPermission(spec),
    fill: spec.fill,
    produces: spec.produces,
    filledFrom: spec.from ?? spec.source ?? spec.rule
  };
}

/** A gated row is visible and in place. What a caller without the credential
 *  gets is the routing, never a dead end and never a silently empty row. */
function gatedRow(base: ReturnType<typeof stem>, spec: RowSpec, held: boolean): QuestionRow {
  const gate = spec.gate!;
  const asGate: Gate = { ...gate, held, cannotVerify: CANNOT_VERIFY };
  if (held) {
    return {
      ...base,
      mark: "ready",
      gate: asGate,
      answer: filled(answerFor(spec), [RULE, SUBMITTING], [
        { id: "sign", label: "Sign and issue", look: "primary", enabled: true }
      ])
    };
  }
  return {
    ...base,
    mark: "waiting",
    gate: asGate,
    answer: blocked(
      `Reserved to the ${gate.reservedTo} — ${gate.citation}`,
      `the ${gate.reservedTo}`,
      undefined,
      [{ id: "route", label: gate.routeLabel, look: "primary", enabled: true }],
      [RULE]
    )
  };
}

/** A row whose own words are not in the build. It is `unresolved` and not
 *  `absent`, and the distinction is the whole four-state contract: the lane
 *  COULD NOT have answered, because the question has not been written. Asking a
 *  non-specialist "Notice of intent — content (vii)" is not a question. It is
 *  never counted as complete and never holds the bar shut, because there is
 *  nothing there to answer. */
function placeholderRow(base: ReturnType<typeof stem>, spec: RowSpec): QuestionRow {
  return {
    ...base,
    mark: "error",
    answer: unresolved(
      "The rule's text for this item is not in the build",
      `${spec.ref} is named by ordinal and not by content anywhere in this repository, so this row cannot be answered as written`,
      [REPORT]
    )
  };
}

/** The drafting lane. §7.8: retrieval that cannot run reports unresolved, not
 *  absent — the lane could not have answered, which is a different claim from
 *  finding nothing. §1 records that no model call has occurred or can. */
function draftedRow(base: ReturnType<typeof stem>, spec: RowSpec, retrievalUp: boolean): QuestionRow {
  if (retrievalUp) {
    return { ...base, mark: "review", answer: filled(answerFor(spec), [DRAFTED], [ACCEPT, EDIT]) };
  }
  return {
    ...base,
    mark: "error",
    answer: unresolved(
      "No draft could be written",
      "the drafting lane could not run — the only configured provider host is an RFC-2606 .invalid domain and no Function or AIP Logic exists",
      [WRITE_OWN, REPORT]
    )
  };
}

/** A row that echoes a question asked somewhere else. Asked once and shown
 *  here, so a person is never asked the same thing twice and left to wonder
 *  whether they got it wrong the first time. */
function echoRow(base: ReturnType<typeof stem>, spec: RowSpec): QuestionRow {
  return {
    ...base,
    mark: "accepted",
    answer: filled(answerFor(spec), [RECORD], [
      { id: "goto", label: "Open where this is asked", look: "link", enabled: true }
    ])
  };
}

function ordinaryRow(base: ReturnType<typeof stem>, spec: RowSpec, i: number): QuestionRow {
  switch (i % 5) {
    case 2:
      return {
        ...base,
        mark: "review",
        answer: absent(
          "Nothing found in the project record",
          `⟨register.item.retrieval_query · ${spec.ref}⟩`,
          [SEARCH],
          [RULE]
        )
      };
    case 4:
      return {
        ...base,
        mark: "waiting",
        answer: blocked("Waiting on an earlier answer", "an earlier answer", STEP_LINK, [], [REQUESTED])
      };
    default: {
      const sources =
        spec.form === "quote"
          ? [RULE]
          : spec.form === "select" || spec.form === "choice"
            ? [CHOICE_LIST]
            : spec.form === "sourcesOnly"
              ? [RULE, RECORD]
              : i % 3 === 1
                ? [CALCULATED]
                : [RECORD];
      const actions = spec.form === "select" || spec.form === "choice" ? [SAVE] : [CHANGE];
      return { ...base, mark: "accepted", answer: filled(answerFor(spec), sources, actions) };
    }
  }
}

export function rowsFor(
  stepKey: string,
  tab: TabSpec,
  held: boolean,
  retrievalUp: boolean
): QuestionRow[] {
  return tab.elements.map((spec, i) => {
    const base = stem(stepKey, tab, i);
    if (spec.gate) {
      return gatedRow(base, spec, held);
    }
    if (spec.text === "placeholder") {
      return placeholderRow(base, spec);
    }
    if (spec.restates) {
      return echoRow(base, spec);
    }
    if (spec.form === "draft") {
      return draftedRow(base, spec, retrievalUp);
    }
    return ordinaryRow(base, spec, i);
  });
}

/* --- one tab --- */

/** A row the bar may wait on. Three classes never hold it: a PERMISSION,
 *  because §7.9 forbids turning one into a requirement; an OUTBOUND REQUEST,
 *  because a client cannot verify a concurrence and must not stall work on one;
 *  and a PLACEHOLDER, because there is no question there to answer. The old
 *  rule counted only the first, and one flag was doing all three jobs. */
const outstanding = (rows: QuestionRow[]) =>
  rows.filter(
    (row) =>
      row.modality !== "permission" &&
      row.modality !== "outbound-request" &&
      row.textState !== "placeholder" &&
      row.mark !== "accepted" &&
      row.mark !== "ready"
  ).length;

export function panelFor(
  stepKey: string,
  tab: TabSpec,
  held: boolean,
  retrievalUp: boolean
): ElementPanel {
  const rows = rowsFor(stepKey, tab, held, retrievalUp);
  const left = outstanding(rows);
  const done = rows.length - left;
  const gated = rows.some((row) => row.gate && !row.gate.held);
  const document = tab.documentType;

  return {
    title: document ? `${tab.name} — ${String(elementRows(tab).length)} elements` : tab.name,
    help: helpFor(tab),
    progress: `${String(done)} of ${String(rows.length)} answered`,
    rows,
    submit: {
      /* "Submit element" named an internal noun the reader never sees, and
         "Undo submit" named the button rather than the state it returns to. */
      label: document ? `Submit ${document}` : "Submit these answers",
      undoLabel: "Reopen for edits",
      enabled: left === 0,
      note: gated
        ? `The signature at ${rows.find((row) => row.gate)?.gate?.citation ?? ""} is reserved; the row above routes it`
        : left > 0
          ? `${String(left)} ${left === 1 ? "question" : "questions"} still ${left === 1 ? "needs" : "need"} review`
          : undefined,
      destination: left > 0 ? STEP_LINK : undefined,
      source: left === 0 ? SUBMITTING : undefined
    }
  };
}

function helpFor(tab: TabSpec): string {
  const authority = DOCUMENT_AUTHORITY.find((entry) => entry.documentType === tab.documentType);
  if (authority) {
    return `Preparation open to ${authority.preparationOpenTo}. Issued by: ${authority.issuedBy}. Cannot begin until ${authority.cannotBeginUntil}.`;
  }
  const discretions = tab.elements.filter((row) => isPermission(row)).length;
  if (discretions > 0) {
    return `${String(discretions)} of these ${String(tab.elements.length)} are permissions in the rule rather than duties, and nothing here turns one into a requirement.`;
  }
  return "Work runs top to bottom. Every row is reachable and workable without agency credentials.";
}

/** A tab that is not on any level this proposal has occupied is BLOCKED, and
 *  it names the level it waits on.
 *
 *  It used to be `absent` — "Nothing found for this part of the document" —
 *  which is the interface stating a falsehood in the one state defined as a
 *  real answer about the world. After a level change it would have said it
 *  about a document row that exists. `absent` means a query ran and found
 *  nothing; a level that was never reached is not a query result. */
export function panelRegion(
  levels: PathwayId[],
  stepId: string,
  tabId: string,
  held: boolean,
  retrievalUp: boolean
): Region<ElementPanel> {
  const owner = levels.find((pathway) => findTab(pathway, stepId, tabId));
  const tab = findTab(owner ?? levels[0] ?? null, stepId, tabId);
  if (!tab) {
    const elsewhere = PATHWAY_IDS.find((pathway) => findTab(pathway, stepId, tabId));
    if (elsewhere) {
      return blocked(
        "Not this level of review",
        `a level-of-review determination reaching ${elsewhere} — ${PATHWAYS[elsewhere].reachedWhen}`,
        STEP_LINK,
        [],
        [RULE]
      );
    }
    return absent(
      "Nothing found for this part of the document",
      `⟨element.byTab · ${tabId}⟩`,
      [SEARCH]
    );
  }
  const stepKey = owner ? `E${String(levels.indexOf(owner) + 1)}.${owner}.${stepId}` : stepId;
  return filled(panelFor(stepKey, tab, held, retrievalUp));
}

export const elementAbsentSpec: Region<ElementPanel> = absent(
  "No questions have been worked out for this part yet",
  "⟨element.byDocument · slot.byElement⟩",
  [SEARCH]
);
export const elementBlockedSpec: Region<ElementPanel> = blocked(
  "Not ready yet",
  "an earlier step",
  STEP_LINK
);
export const elementUnresolvedSpec: Region<ElementPanel> = unresolved(
  "No answer came back",
  "the lane could not have answered — element and slot both hold zero rows and nothing creates either"
);

export const FIRST_STEP = SHARED_STEPS[0];
export const FIRST_TAB_ID = SHARED_STEPS[0].tabs[0].id;
