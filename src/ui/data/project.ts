import {
  CROSS_CUTTING,
  DOCUMENT_AUTHORITY,
  PATHWAYS,
  RETRIEVAL_PUSHES,
  SHARED_STEPS,
  TRIGGERS,
  findTab,
  stepsFor
} from "@/ui/data/pathways";
import type { PathwayId, RowSpec, TabSpec } from "@/ui/data/pathways";
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
  ElementPanel,
  Gate,
  PathwayState,
  QuestionRow,
  Region,
  StepEntry,
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

export { CROSS_CUTTING, DOCUMENT_AUTHORITY, RETRIEVAL_PUSHES, TRIGGERS };

const CHANGE: Action = { id: "change", label: "Change answer", look: "secondary", enabled: true };
const ACCEPT: Action = { id: "accept", label: "Accept", look: "primary", enabled: true };
const EDIT: Action = { id: "edit", label: "Edit", look: "secondary", enabled: true };
const SEARCH: Action = { id: "search", label: "Search", look: "primary", enabled: true };
const SAVE: Action = { id: "save", label: "Save", look: "primary", enabled: true };
const WRITE_OWN: Action = { id: "write", label: "Write your own answer", look: "link", enabled: true };
const REPORT: Action = { id: "report", label: "Report a problem", look: "link", enabled: true };

/* --- the pathway, and the state before one is fixed --- */

export function pathwayState(pathway: PathwayId | null): Region<PathwayState> {
  if (!pathway) {
    return filled<PathwayState>({
      pathway: null,
      note: "The pathway is fixed at Step 2. Until then no pathway step exists and none is named.",
      reachedWhen: "1b.2(f)(2) — the level-of-review determination, in sequence",
      terminalOutput: "Not yet determined"
    });
  }
  const spec = PATHWAYS[pathway];
  return filled<PathwayState>({
    pathway,
    note: `${spec.id} · ${spec.name}`,
    reachedWhen: spec.reachedWhen,
    terminalOutput: spec.terminalOutput
  });
}

export const pathwayBlocked: Region<PathwayState> = blocked(
  "Not ready yet",
  "the level-of-review determination at Step 2",
  STEP_LINK
);
export const pathwayAbsent: Region<PathwayState> = absent(
  "No level-of-review determination has been recorded",
  "⟨determination.whichDetermination = det_review_level⟩"
);
export const pathwayUnresolved: Region<PathwayState> = unresolved(
  "The pathway could not be read",
  "pathway state has no ontology address — 1b.2(f)(2) is an ordered elimination and document.documentType names only a document that exists"
);

/* --- the signature gate --- */

const CANNOT_VERIFY =
  "No platform predicate marks a caller's class. The surface withholds the act and the platform refuses the write; nothing here asserts an authorisation it cannot check.";

export function gateFor(held: boolean): Region<Gate> {
  return filled<Gate>({
    reservedTo: "responsible official",
    citation: "1b.3(g)(2)(vi) · 1b.6(b)(5) · 1b.8(b)(8)",
    routeLabel: "Route for signature",
    held,
    cannotVerify: CANNOT_VERIFY
  });
}

export const gateUnresolved: Region<Gate> = unresolved(
  "The caller's credential could not be read",
  "responsibleOfficial and delegation hold no rows and no platform predicate marks a user's role"
);

/* --- steps and tabs --- */

function tabEntries(tabs: TabSpec[], activeIndex: number): TabEntry[] {
  return tabs.map((tab, i) => ({ id: tab.id, name: tab.name, done: i < activeIndex }));
}

export function stepEntries(pathway: PathwayId | null, activeStepId: string): Region<StepEntry[]> {
  const steps = stepsFor(pathway);
  // -1 where the route is not on a step at all — the cross-cutting tabs sit
  // outside the sequence. No step is active then, and marking the first one
  // would leave Intake highlighted from anywhere in §7.7.
  const activeIndex = steps.findIndex((step) => step.id === activeStepId);

  return filled(
    steps.map((step, i) => ({
      id: step.id,
      n: step.n,
      name: step.name,
      mark:
        activeIndex < 0
          ? ("waiting" as const)
          : i < activeIndex
            ? ("completed" as const)
            : i === activeIndex
              ? ("active" as const)
              : ("waiting" as const),
      meta:
        activeIndex >= 0 && i < activeIndex
          ? `${step.tabs.length} of ${step.tabs.length} tabs`
          : i === activeIndex
            ? `0 of ${step.tabs.length} tabs`
            : "Not started",
      tabs: tabEntries(step.tabs, activeIndex >= 0 && i < activeIndex ? step.tabs.length : 0)
    }))
  );
}

export const stepsAbsentSpec: Region<StepEntry[]> = absent(
  "No steps have been worked out yet",
  "⟨element.byDocument · slot.byElement⟩"
);
export const stepsBlockedSpec: Region<StepEntry[]> = blocked(
  "Not ready yet",
  "the intake answers at Step 0",
  STEP_LINK
);
export const stepsUnresolvedSpec: Region<StepEntry[]> = unresolved(
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

/** A gated row is visible and in place. What a caller without the credential
 *  gets is the routing, never a dead end and never a silently empty row. */
function gatedRow(id: string, spec: RowSpec, held: boolean): QuestionRow {
  const gate = spec.gate!;
  const asGate: Gate = { ...gate, held, cannotVerify: CANNOT_VERIFY };
  if (held) {
    return {
      id,
      ref: spec.ref,
      label: spec.label,
      help: spec.help,
      mark: "ready",
      gate: asGate,
      answer: filled(answerFor(spec), [RULE, SUBMITTING], [
        { id: "sign", label: "Sign and issue", look: "primary", enabled: true }
      ])
    };
  }
  return {
    id,
    ref: spec.ref,
    label: spec.label,
    help: spec.help,
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

/** The drafting lane. §7.8: retrieval that cannot run reports unresolved, not
 *  absent — the lane could not have answered, which is a different claim from
 *  finding nothing. §1 records that no model call has occurred or can. */
function draftedRow(id: string, spec: RowSpec, retrievalUp: boolean): QuestionRow {
  if (retrievalUp) {
    return {
      id,
      ref: spec.ref,
      label: spec.label,
      help: spec.help,
      mark: "review",
      discretionary: spec.discretionary,
      answer: filled(answerFor(spec), [DRAFTED], [ACCEPT, EDIT])
    };
  }
  return {
    id,
    ref: spec.ref,
    label: spec.label,
    help: spec.help,
    mark: "error",
    discretionary: spec.discretionary,
    answer: unresolved(
      "No draft could be written",
      "the drafting lane could not run — the only configured provider host is an RFC-2606 .invalid domain and no Function or AIP Logic exists",
      [WRITE_OWN, REPORT]
    )
  };
}

function ordinaryRow(id: string, spec: RowSpec, i: number): QuestionRow {
  const base = { id, ref: spec.ref, label: spec.label, help: spec.help, discretionary: spec.discretionary };
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
        answer: blocked("Not ready yet", "an earlier answer", STEP_LINK, [], [REQUESTED])
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

export function rowsFor(tab: TabSpec, held: boolean, retrievalUp: boolean): QuestionRow[] {
  return tab.rows.map((spec, i) => {
    const id = `${tab.id}-${String(i + 1)}`;
    if (spec.gate) return gatedRow(id, spec, held);
    if (spec.form === "draft") return draftedRow(id, spec, retrievalUp);
    return ordinaryRow(id, spec, i);
  });
}

/* --- one tab --- */

const outstanding = (rows: QuestionRow[]) =>
  rows.filter((row) => !row.discretionary && row.mark !== "accepted" && row.mark !== "ready").length;

export function panelFor(tab: TabSpec, held: boolean, retrievalUp: boolean): ElementPanel {
  const rows = rowsFor(tab, held, retrievalUp);
  const left = outstanding(rows);
  const done = rows.length - left;
  const gated = rows.some((row) => row.gate && !row.gate.held);
  const document = tab.documentType;

  return {
    title: document ? `${tab.name} — ${String(tab.rows.length)} elements` : tab.name,
    help: helpFor(tab),
    progress: `${String(done)} of ${String(rows.length)} completed`,
    rows,
    submit: {
      label: document ? `Submit ${document}` : "Submit element",
      undoLabel: "Undo submit",
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
  const discretions = tab.rows.filter((row) => row.discretionary).length;
  if (discretions > 0) {
    return `${String(discretions)} of these ${String(tab.rows.length)} are permissions in the rule rather than duties, and nothing here turns one into a requirement.`;
  }
  return "Work runs top to bottom. Every row is reachable and workable without agency credentials.";
}

export function panelRegion(
  pathway: PathwayId | null,
  stepId: string,
  tabId: string,
  held: boolean,
  retrievalUp: boolean
): Region<ElementPanel> {
  const tab = findTab(pathway, stepId, tabId);
  if (!tab) {
    return absent(
      "Nothing found for this part of the document",
      `⟨element.byTab · ${tabId}⟩`,
      [SEARCH]
    );
  }
  return filled(panelFor(tab, held, retrievalUp));
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
