/** The completeness audit.
 *
 *  A PURE FUNCTION over `pathways.ts`. It calls no port member, so it works
 *  today, on a dead backend, forever, and a half-wired application cannot
 *  degrade it.
 *
 *  WHY IT HAS TO EXIST OUTSIDE THE APPLICATION. The project page is dynamic on
 *  purpose: only the level of review the decision tree selected exists, and it
 *  exists only after Step 2 records it. That is correct — an officer must not
 *  be shown four levels they are not on — and it is exactly why completeness
 *  cannot be checked by clicking around. Without project data to trigger a
 *  level, most of the build is unreachable BY DESIGN. So the audit reads the
 *  specification rather than the running screen.
 *
 *  WHAT "COMPLETE" MEANS HERE, and it is a higher bar than "the tab has rows".
 *  Every element must say:
 *    · how it gets its value                  — `fill`
 *    · what shape that value takes            — `produces.shape`
 *    · what it becomes in the filed document  — `produces.template`
 *  An element whose label reads well and whose fill nobody can state is not
 *  designed. An element of a document with no template is an element the filed
 *  document cannot carry.
 *
 *  WHAT IT CANNOT DO. It validates the BUILD against its own specification, and
 *  neither against 7 CFR part 1b, because the pinned text is not in this
 *  repository. A green run is not a claim of compliance, and the
 *  `owner: "regulation"` findings are where that stays honest.
 */

import {
  LEVELS,
  PATHWAYS,
  PATHWAY_IDS,
  REOPEN_STEP,
  SHARED_STEPS,
  ridFor,
  stepsFor
} from "@/ui/data/pathways";
import type {
  ElementSpec,
  Fill,
  Level,
  PathwayId,
  Produces,
  StepSpec,
  TabSpec
} from "@/ui/data/pathways";

/** Who has to act for a gap to close. The field exists so a gap cannot be
 *  filed as "someone will fix it": `regulation` means the rule's own text is
 *  not in this repository and no amount of front-end work closes it. */
export type GapOwner = "spec" | "code" | "sme" | "regulation";

export interface ElementAudit {
  rid: string;
  ref: string;
  label: string;
  help: string | null;
  form: string;
  level: Level;
  modality: string;
  text: string;
  fill: Fill;
  source: string | null;
  rule: string | null;
  from: string | null;
  produces: Produces;
  /** The element this one qualifies, where it is a sub-paragraph saying HOW
   *  another may be satisfied. Such an element belongs to the TAB and not to
   *  the DOCUMENT, which is what keeps the frozen totals honest. */
  qualifies: string | null;
  optionsKind: string | null;
  options: string[] | null;
  gated: boolean;
  restates: string | null;
  expands: { count: number; ref: string; why: string } | null;
}

export interface TabAudit {
  stepKey: string;
  stepName: string;
  stepPurpose: string;
  stepN: number;
  tabId: string;
  tabName: string;
  tabPurpose: string;
  level: Level;
  scope: "proposal" | "review";
  documentType: string | null;
  elements: ElementAudit[];
  documentElements: number;
  placeholders: number;
  templated: number;
  untemplated: number;
  collapsedInto: number;
  collapsedFrom: number;
  permissions: number;
  gates: number;
  unstatedOptions: number;
  byFill: Record<Fill, number>;
}

export interface PathwayAudit {
  pathway: PathwayId;
  name: string;
  reachedWhen: string;
  terminalOutput: string;
  steps: { key: string; n: number; name: string; purpose: string; tabs: number }[];
  tabs: number;
  elements: number;
  placeholders: number;
  /** The documents this pathway produces, and how much of each is templated.
   *  This is the question "can this pathway actually generate what it files". */
  documents: { documentType: string; elements: number; templated: number }[];
  levelsCovered: Level[];
  byFill: Record<Fill, number>;
}

export interface Finding {
  id: string;
  owner: GapOwner;
  where: string;
  what: string;
}

export interface Coverage {
  tabs: TabAudit[];
  pathways: PathwayAudit[];
  totals: {
    distinctTabs: number;
    distinctElements: number;
    placeholders: number;
    templated: number;
    untemplated: number;
    permissions: number;
    gates: number;
    unstatedOptions: number;
    collapsedFrom: number;
    collapsedInto: number;
    byLevel: Record<Level, number>;
    byFill: Record<Fill, number>;
  };
  findings: Finding[];
}

export const FILLS: Fill[] = [
  "intake",
  "carried",
  "catalogue",
  "computed",
  "drafted",
  "choice",
  "authored",
  "attested",
  "referenced"
];

const zeroFill = (): Record<Fill, number> =>
  Object.fromEntries(FILLS.map((f) => [f, 0])) as Record<Fill, number>;

/* A citation of part 1b, as a shape. This checks the FORM of a reference, never
   that the paragraph exists — the pinned text is in another repository. */
const ONE = String.raw`1b\.\d+(\([a-z0-9]+\))*(–\([a-z0-9ivx]+\))?`;
const CITATION = new RegExp(`^${ONE}( · ${ONE})*$`, "i");

function auditElement(stepKey: string, tab: TabSpec, index: number): ElementAudit {
  const e: ElementSpec = tab.elements[index];
  return {
    rid: ridFor(stepKey, tab, index),
    ref: e.ref,
    label: e.label,
    help: e.help ?? null,
    form: e.form,
    level: e.level ?? tab.level,
    modality: e.modality,
    text: e.text,
    fill: e.fill,
    source: e.source ?? null,
    rule: e.rule ?? null,
    from: e.from ?? null,
    produces: e.produces,
    qualifies: e.subOf ?? null,
    optionsKind: e.options ? e.options.kind : null,
    options:
      e.options && e.options.kind === "closed"
        ? e.options.members
        : e.options && e.options.kind === "open"
          ? e.options.seed
          : null,
    gated: Boolean(e.gate),
    restates: e.restates ?? null,
    expands: e.expands ?? null
  };
}

function auditTab(stepKey: string, step: StepSpec, tab: TabSpec): TabAudit {
  const elements = tab.elements.map((_, i) => auditElement(stepKey, tab, i));
  const expanders = elements.filter((e) => e.expands);
  const ofDocument = elements.filter((e) => !e.qualifies);
  const byFill = zeroFill();
  for (const e of elements) {
    byFill[e.fill] += 1;
  }
  return {
    stepKey,
    stepName: step.name,
    stepPurpose: step.purpose,
    stepN: step.n,
    tabId: tab.id,
    tabName: tab.name,
    tabPurpose: tab.purpose,
    level: tab.level,
    scope: tab.scope,
    documentType: tab.documentType ?? null,
    elements,
    documentElements: tab.documentType ? ofDocument.length : 0,
    placeholders: elements.filter((e) => e.text === "placeholder").length,
    templated: elements.filter((e) => e.produces.template !== null).length,
    untemplated: elements.filter((e) => e.produces.template === null).length,
    collapsedInto: expanders.length,
    collapsedFrom: expanders.reduce((n, e) => n + (e.expands?.count ?? 0), 0),
    permissions: elements.filter((e) => e.modality === "permission").length,
    gates: elements.filter((e) => e.gated).length,
    unstatedOptions: elements.filter((e) => e.optionsKind === "unstated").length,
    byFill
  };
}

/** Every tab in the build, once, with the key it is addressed by. A pathway
 *  step appears under its own pathway, so P1 and P2's shared screening step is
 *  listed under both — which is what a reviewer walking P2 needs to see. */
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
  /* No pass over step-less tabs, because there are none. The ten 1b.9 and
     1b.10 duties are reached through the steps they attach to, and a duty that
     attaches in two places is audited under both keys — which is what a
     reviewer walking either step needs to see. */
  return out;
}

/* --- the findings, each with an owner who can actually close it ----------- */

function findings(tabs: TabAudit[]): Finding[] {
  const out: Finding[] = [];

  for (const tab of tabs) {
    for (const e of tab.elements) {
      if (e.text === "placeholder") {
        out.push({
          id: `placeholder:${e.rid}`,
          owner: "regulation",
          where: e.rid,
          what: `The rule's text for this item is not in this repository, so the label is its own citation ordinal: "${e.label}". Nobody can answer it as written.`
        });
      }
      if (e.optionsKind === "unstated") {
        out.push({
          id: `unstated:${e.rid}`,
          owner: "regulation",
          where: e.rid,
          what: `Offers a set whose members are not in this repository: "${e.label}".`
        });
      }
      /* THE COMPLETENESS TEST THAT MATTERS. An element of a document with no
         template is an element the filed document cannot carry, however well
         its label reads. */
      if (tab.documentType && !e.qualifies && e.produces.template === null) {
        out.push({
          id: `untemplated:${e.rid}`,
          owner: e.text === "placeholder" ? "regulation" : "spec",
          where: e.rid,
          what: `Element of the ${tab.documentType} with no template: nothing states what "${e.label}" becomes on the page that is filed.`
        });
      }
      if (e.fill === "carried" && !e.from) {
        out.push({
          id: `carry:${e.rid}`,
          owner: "spec",
          where: e.rid,
          what: `Carried forward from nothing: "${e.label}" says it is auto-populated and does not say from where.`
        });
      }
      if (e.fill === "catalogue" && !e.source) {
        out.push({
          id: `source:${e.rid}`,
          owner: "spec",
          where: e.rid,
          what: `Looked up from nothing: "${e.label}" says it comes from a pinned reference and does not name one.`
        });
      }
      if (e.fill === "computed" && !e.rule) {
        out.push({
          id: `rule:${e.rid}`,
          owner: "spec",
          where: e.rid,
          what: `Worked out by no stated rule: "${e.label}".`
        });
      }
      if (e.expands) {
        out.push({
          id: `collapsed:${e.rid}`,
          owner: "spec",
          where: e.rid,
          what: `${String(e.expands.count)} enumerated items at ${e.expands.ref} are carried by one element. ${e.expands.why}`
        });
      }
      if (!CITATION.test(e.ref)) {
        out.push({
          id: `citation:${e.rid}`,
          owner: "spec",
          where: e.rid,
          what: `"${e.ref}" is not shaped like a paragraph of part 1b.`
        });
      }
    }

    if (tab.elements.length === 0) {
      out.push({
        id: `emptytab:${tab.stepKey}/${tab.tabId}`,
        owner: "spec",
        where: `${tab.stepKey}/${tab.tabId}`,
        what: "The tab has no elements, so completing it means nothing."
      });
    }
  }

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

  const pathways: PathwayAudit[] = PATHWAY_IDS.map((pathway) => {
    const steps = stepsFor(pathway);
    const own = steps.flatMap((s) => s.tabs);
    const byFill = zeroFill();
    for (const tab of own) {
      for (const e of tab.elements) {
        byFill[e.fill] += 1;
      }
    }
    return {
      pathway,
      name: PATHWAYS[pathway].name,
      reachedWhen: PATHWAYS[pathway].reachedWhen,
      terminalOutput: PATHWAYS[pathway].terminalOutput,
      steps: steps.map((s) => ({
        key: SHARED_STEPS.includes(s) ? `S.${s.id}` : `E1.${pathway}.${s.id}`,
        n: s.n,
        name: s.name,
        purpose: s.purpose,
        tabs: s.tabs.length
      })),
      tabs: own.length,
      elements: own.reduce((n, t) => n + t.elements.length, 0),
      placeholders: own.reduce(
        (n, t) => n + t.elements.filter((e) => e.text === "placeholder").length,
        0
      ),
      documents: own
        .filter((t) => t.documentType)
        .map((t) => ({
          documentType: String(t.documentType),
          elements: t.elements.filter((e) => !e.subOf).length,
          templated: t.elements.filter((e) => !e.subOf && e.produces.template !== null).length
        })),
      levelsCovered: [...new Set(own.map((t) => t.level))].sort((a, b) => a - b),
      byFill
    };
  });

  const byLevel = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 } as Record<Level, number>;
  const byFill = zeroFill();
  for (const tab of tabs) {
    byLevel[tab.level] += tab.elements.length;
    for (const e of tab.elements) {
      byFill[e.fill] += 1;
    }
  }

  return {
    tabs,
    pathways,
    totals: {
      distinctTabs: new Set(tabs.map((t) => `${t.stepKey}/${t.tabId}`)).size,
      distinctElements: tabs.reduce((n, t) => n + t.elements.length, 0),
      placeholders: tabs.reduce((n, t) => n + t.placeholders, 0),
      templated: tabs.reduce((n, t) => n + t.templated, 0),
      untemplated: tabs.reduce((n, t) => n + t.untemplated, 0),
      permissions: tabs.reduce((n, t) => n + t.permissions, 0),
      gates: tabs.reduce((n, t) => n + t.gates, 0),
      unstatedOptions: tabs.reduce((n, t) => n + t.unstatedOptions, 0),
      collapsedFrom: tabs.reduce((n, t) => n + t.collapsedFrom, 0),
      collapsedInto: tabs.reduce((n, t) => n + t.collapsedInto, 0),
      byLevel,
      byFill
    },
    findings: findings(tabs)
  };
}
