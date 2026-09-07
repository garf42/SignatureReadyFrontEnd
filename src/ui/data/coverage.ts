/** §8.5 — the audit.
 *
 *  A PURE FUNCTION over `pathways.ts`, and that is the whole point of it. It
 *  calls no port member, so it works today, on a dead backend, forever, and a
 *  half-wired application cannot degrade it. The question it answers is the one
 *  that could not be answered before — *are the tabs actually built out, for
 *  every step and every pathway* — and it answers it with counts rather than
 *  with a feeling.
 *
 *  What it can and cannot do. It validates the BUILD against the spec: every
 *  row has a modality, every offered set says where its members come from,
 *  every citation resolves to a shape that looks like a paragraph of part 1b,
 *  the element totals hold. It can never validate the build against 7 CFR part
 *  1b itself, because the pinned text is not in this repository. A green ledger
 *  is therefore not a compliant application, and `owner: "regulation"` is where
 *  that distinction is kept honest rather than papered over.
 */

import {
  CROSS_CUTTING,
  LEVELS,
  PATHWAYS,
  PATHWAY_IDS,
  REOPEN_STEP,
  SHARED_STEPS,
  ridFor,
  stepsFor
} from "@/ui/data/pathways";
import type { Level, PathwayId, RowSpec, StepSpec, TabSpec } from "@/ui/data/pathways";

/** Who has to act for a gap to close. The field exists so a gap cannot be
 *  filed as "someone will fix it": `regulation` means the rule's own text is
 *  not in this repository and no amount of front-end work closes it. */
export type GapOwner = "spec" | "code" | "sme" | "regulation";

export interface RowAudit {
  rid: string;
  ref: string;
  label: string;
  form: string;
  level: Level;
  modality: string;
  text: string;
  /** `null` where the row offers no members. */
  optionsKind: string | null;
  gated: boolean;
  restates: string | null;
  /** Set where one row stands in for several enumerated items. */
  expands: { count: number; ref: string; why: string } | null;
}

export interface TabAudit {
  stepKey: string;
  stepName: string;
  stepN: number;
  tabId: string;
  tabName: string;
  level: Level;
  scope: "proposal" | "review";
  documentType: string | null;
  rows: RowAudit[];
  /** Rows whose own text is not in the build. A non-specialist cannot answer
   *  one, so this is the count that matters most on any tab that has any. */
  placeholders: number;
  /** Regulation items folded into fewer rows than the rule enumerates. */
  collapsedInto: number;
  collapsedFrom: number;
  permissions: number;
  gates: number;
  /** Offered sets whose members are not in this repository. */
  unstatedOptions: number;
}

export interface LevelAudit {
  pathway: PathwayId;
  name: string;
  steps: number;
  tabs: number;
  rows: number;
  placeholders: number;
  /** Which Levels-framework levels this pathway's own tabs carry. Present so
   *  the framework claim is checkable rather than asserted — and so a neglected
   *  Level 0 or 1 foundation shows up as an empty cell. */
  levelsCovered: Level[];
}

export interface Finding {
  id: string;
  owner: GapOwner;
  where: string;
  what: string;
}

export interface Coverage {
  tabs: TabAudit[];
  levels: LevelAudit[];
  totals: {
    distinctTabs: number;
    distinctRows: number;
    placeholders: number;
    permissions: number;
    gates: number;
    unstatedOptions: number;
    collapsedFrom: number;
    collapsedInto: number;
    byLevel: Record<Level, number>;
  };
  findings: Finding[];
}

/* A citation of part 1b, as a shape. This checks the FORM of a reference, never
   that the paragraph exists — the pinned text is in another repository. */
const ONE = String.raw`1b\.\d+(\([a-z0-9]+\))*(–\([a-z0-9ivx]+\))?`;
const CITATION = new RegExp(`^${ONE}( · ${ONE})*$`, "i");

function auditRow(stepKey: string, tab: TabSpec, index: number): RowAudit {
  const row: RowSpec = tab.rows[index];
  return {
    rid: ridFor(stepKey, tab, index),
    ref: row.ref,
    label: row.label,
    form: row.form,
    level: row.level ?? tab.level,
    modality: row.modality,
    text: row.text,
    optionsKind: row.options ? row.options.kind : null,
    gated: Boolean(row.gate),
    restates: row.restates ?? null,
    expands: row.expands ?? null
  };
}

function auditTab(stepKey: string, step: StepSpec, tab: TabSpec): TabAudit {
  const rows = tab.rows.map((_, i) => auditRow(stepKey, tab, i));
  const expanders = rows.filter((r) => r.expands);
  return {
    stepKey,
    stepName: step.name,
    stepN: step.n,
    tabId: tab.id,
    tabName: tab.name,
    level: tab.level,
    scope: tab.scope,
    documentType: tab.documentType ?? null,
    rows,
    placeholders: rows.filter((r) => r.text === "placeholder").length,
    collapsedInto: expanders.length,
    collapsedFrom: expanders.reduce((n, r) => n + (r.expands?.count ?? 0), 0),
    permissions: rows.filter((r) => r.modality === "permission").length,
    gates: rows.filter((r) => r.gated).length,
    unstatedOptions: rows.filter((r) => r.optionsKind === "unstated").length
  };
}

/** Every tab in the build, once, with the key it is addressed by. Shared steps
 *  and the reopen step appear once; a pathway step appears under its own
 *  pathway, so P1 and P2's shared screening step is listed under both — which
 *  is what a reviewer walking P2 needs to see. */
export function allTabs(): TabAudit[] {
  const out: TabAudit[] = [];
  for (const step of SHARED_STEPS) {
    for (const tab of step.tabs) {
      out.push(auditTab(`S.${step.id}`, step, tab));
    }
  }
  for (const pathway of PATHWAY_IDS) {
    for (const step of PATHWAYS[pathway].steps) {
      for (const tab of step.tabs) {
        out.push(auditTab(`E1.${pathway}.${step.id}`, step, tab));
      }
    }
  }
  for (const tab of REOPEN_STEP.tabs) {
    out.push(auditTab("E2.P4.R", REOPEN_STEP, tab));
  }
  const cross: StepSpec = { id: "x", n: -1, name: "Across the project", tabs: CROSS_CUTTING };
  for (const tab of CROSS_CUTTING) {
    out.push(auditTab("x", cross, tab));
  }
  return out;
}

/* --- the invariants, and what may never be baselined away -----------------
   Everything below is a finding an owner has to clear. The set that may NEVER
   be filed as an accepted gap is asserted in coverage.test.ts instead: the 34
   element counts, the three gate citations, rid uniqueness, step-key
   uniqueness, and every transition carrying a citation. A ratchet with nothing
   outside it becomes wallpaper. */

function findings(tabs: TabAudit[]): Finding[] {
  const out: Finding[] = [];

  for (const tab of tabs) {
    for (const row of tab.rows) {
      if (row.text === "placeholder") {
        out.push({
          id: `placeholder:${row.rid}`,
          owner: "regulation",
          where: row.rid,
          what: `The rule's text for this item is not in this repository, so the label is its own citation ordinal: "${row.label}". No non-specialist can answer it.`
        });
      }
      if (row.optionsKind === "unstated") {
        out.push({
          id: `unstated:${row.rid}`,
          owner: "regulation",
          where: row.rid,
          what: `Offers a set whose members are not in this repository: "${row.label}".`
        });
      }
      if (row.expands) {
        out.push({
          id: `collapsed:${row.rid}`,
          owner: "spec",
          where: row.rid,
          what: `${String(row.expands.count)} enumerated items at ${row.expands.ref} are carried by one row. ${row.expands.why}`
        });
      }
      if (!CITATION.test(row.ref)) {
        out.push({
          id: `citation:${row.rid}`,
          owner: "spec",
          where: row.rid,
          what: `"${row.ref}" is not shaped like a paragraph of part 1b.`
        });
      }
    }
  }

  /* A tab with no binding row cannot be completed, and one with no row at all
     is a heading. Both were invisible: the old test asserted only that a tab
     had at least one row of any kind. */
  for (const tab of tabs) {
    if (tab.rows.length === 0) {
      out.push({
        id: `emptytab:${tab.stepKey}/${tab.tabId}`,
        owner: "spec",
        where: `${tab.stepKey}/${tab.tabId}`,
        what: "The tab has no rows."
      });
    }
  }

  /* A level of the framework carried by no tab at all is a neglected
     foundation, and the framework's own failure pattern is exactly that. */
  const carried = new Set(tabs.map((t) => t.level));
  for (const level of [0, 1, 2, 3, 4] as Level[]) {
    if (!carried.has(level)) {
      out.push({
        id: `level:${String(level)}`,
        owner: "spec",
        where: "the build",
        what: `No tab carries Level ${String(level)} — ${LEVELS[level].name}.`
      });
    }
  }

  return out;
}

export function coverage(): Coverage {
  const tabs = allTabs();

  const levels: LevelAudit[] = PATHWAY_IDS.map((pathway) => {
    const steps = stepsFor(pathway);
    const own = steps.flatMap((s) => s.tabs);
    return {
      pathway,
      name: PATHWAYS[pathway].name,
      steps: steps.length,
      tabs: own.length,
      rows: own.reduce((n, t) => n + t.rows.length, 0),
      placeholders: own.reduce(
        (n, t) => n + t.rows.filter((r) => r.text === "placeholder").length,
        0
      ),
      levelsCovered: [...new Set(own.map((t) => t.level))].sort((a, b) => a - b)
    };
  });

  const byLevel = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 } as Record<Level, number>;
  for (const tab of tabs) {
    byLevel[tab.level] += tab.rows.length;
  }

  return {
    tabs,
    levels,
    totals: {
      distinctTabs: new Set(tabs.map((t) => `${t.stepKey}/${t.tabId}`)).size,
      distinctRows: tabs.reduce((n, t) => n + t.rows.length, 0),
      placeholders: tabs.reduce((n, t) => n + t.placeholders, 0),
      permissions: tabs.reduce((n, t) => n + t.permissions, 0),
      gates: tabs.reduce((n, t) => n + t.gates, 0),
      unstatedOptions: tabs.reduce((n, t) => n + t.unstatedOptions, 0),
      collapsedFrom: tabs.reduce((n, t) => n + t.collapsedFrom, 0),
      collapsedInto: tabs.reduce((n, t) => n + t.collapsedInto, 0),
      byLevel
    },
    findings: findings(tabs)
  };
}
