import { describe, expect, it } from "vitest";

import {
  CROSS_CUTTING,
  DISCRETIONS,
  DOCUMENT_AUTHORITY,
  PATHWAYS,
  PATHWAY_IDS,
  RETRIEVAL_PUSHES,
  SHARED_STEPS,
  TRIGGERS,
  findTab,
  stepsFor
} from "@/ui/data/pathways";
import type { DocumentType, TabSpec } from "@/ui/data/pathways";

/** §7 checked against the register's own counts. These are the numbers §2
 *  re-derived from the pinned text; if one of them moves, the rule moved or
 *  the spec is wrong, and either way somebody has to look. */

const allTabs = (): TabSpec[] => [
  ...SHARED_STEPS.flatMap((step) => step.tabs),
  ...PATHWAY_IDS.flatMap((id) => PATHWAYS[id].steps.flatMap((step) => step.tabs)),
  ...CROSS_CUTTING
];

const documentTabs = () => allTabs().filter((tab) => tab.documentType);

describe("element counts — §7.10", () => {
  const expected: Record<DocumentType, number> = {
    FANEC: 6,
    EA: 7,
    FONSI: 5,
    EIS: 8,
    ROD: 8
  };

  it.each(Object.entries(expected))("%s carries %i elements", (type, count) => {
    const tabs = documentTabs().filter((tab) => tab.documentType === type);
    expect(tabs).toHaveLength(1);
    expect(tabs[0].rows).toHaveLength(count);
  });

  it("comes to thirty-four across the five documents", () => {
    const total = documentTabs().reduce((sum, tab) => sum + tab.rows.length, 0);
    expect(total).toBe(34);
  });

  it("agrees with the drafting-authority table", () => {
    for (const entry of DOCUMENT_AUTHORITY) {
      const tab = documentTabs().find((t) => t.documentType === entry.documentType);
      expect(tab?.rows).toHaveLength(entry.elements);
    }
  });
});

describe("the signature gate — §7.2", () => {
  it("gates three surfaces and no others", () => {
    const gated = allTabs().flatMap((tab) => tab.rows.filter((row) => row.gate));
    const citations = [...new Set(gated.map((row) => row.gate?.citation))].sort();
    expect(citations).toEqual(["1b.3(g)(2)(vi)", "1b.6(b)(5)", "1b.8(b)(8)"]);
  });

  it("leaves the EA and the EIS ungated at every point", () => {
    for (const type of ["EA", "EIS"] as const) {
      const tab = documentTabs().find((t) => t.documentType === type);
      expect(tab?.rows.every((row) => !row.gate)).toBe(true);
      expect(DOCUMENT_AUTHORITY.find((e) => e.documentType === type)?.gate).toBeNull();
    }
  });

  it("reserves every gate to the responsible official, never to a delegate", () => {
    const gated = allTabs().flatMap((tab) => tab.rows.filter((row) => row.gate));
    expect(gated.every((row) => row.gate?.reservedTo === "responsible official")).toBe(true);
  });

  it("offers a routing wherever it withholds an act — never a dead end", () => {
    const gated = allTabs().flatMap((tab) => tab.rows.filter((row) => row.gate));
    expect(gated.every((row) => (row.gate?.routeLabel.length ?? 0) > 0)).toBe(true);
  });
});

describe("pathways — §7.1 and §7.2", () => {
  it("shares steps 0 to 2 across every pathway", () => {
    expect(SHARED_STEPS.map((step) => step.n)).toEqual([0, 1, 2]);
    for (const id of PATHWAY_IDS) {
      expect(PATHWAYS[id].steps.every((step) => step.n >= 3)).toBe(true);
    }
  });

  it("names no pathway step before Step 2 fixes one", () => {
    expect(stepsFor(null)).toEqual(SHARED_STEPS);
    expect(stepsFor(null).map((step) => step.name)).not.toContain("Assembly");
  });

  it("terminates P0 at the threshold determination", () => {
    expect(PATHWAYS.P0.steps).toHaveLength(0);
  });

  it("gives P1 and P2 the same extraordinary-circumstance screen at Step 3", () => {
    expect(PATHWAYS.P1.steps[0]).toBe(PATHWAYS.P2.steps[0]);
  });

  it("makes P1 terminal with no document, and P2 end in a FANEC", () => {
    const p1Last = PATHWAYS.P1.steps.at(-1);
    expect(p1Last?.terminal).toBe(true);
    expect(PATHWAYS.P1.steps.flatMap((s) => s.tabs).some((t) => t.documentType)).toBe(false);
    expect(PATHWAYS.P2.terminalOutput).toBe("FANEC");
  });

  it("routes unknown significance to the EA pathway, not the EIS", () => {
    expect(PATHWAYS.P3.reachedWhen).toContain("unknown significance");
    expect(PATHWAYS.P4.reachedWhen).not.toContain("unknown");
  });

  it("ends every step id it advertises in a reachable tab", () => {
    for (const id of PATHWAY_IDS) {
      for (const step of stepsFor(id)) {
        expect(step.tabs.length).toBeGreaterThan(0);
        for (const tab of step.tabs) {
          expect(findTab(id, step.id, tab.id)).toBe(tab);
          expect(tab.rows.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("a tab is a part of its step, never a copy of one", () => {
  it("never gives a tab the name of a step on the same pathway", () => {
    const clashes: string[] = [];
    for (const id of PATHWAY_IDS) {
      const steps = stepsFor(id);
      const stepNames = new Set(steps.map((step) => step.name));
      for (const step of steps) {
        // A step with one part renders no strip, so no clone is ever shown;
        // the clash that matters is a tab standing beside its siblings under
        // a name the step list already uses.
        if (step.tabs.length < 2) continue;
        for (const tab of step.tabs) {
          if (stepNames.has(tab.name)) clashes.push(`${id} · step ${step.id} · ${tab.name}`);
        }
      }
    }
    expect(clashes).toEqual([]);
  });

  it("keeps tab names distinct within a step", () => {
    for (const id of PATHWAY_IDS) {
      for (const step of stepsFor(id)) {
        const names = step.tabs.map((tab) => tab.name);
        expect(new Set(names).size).toBe(names.length);
      }
    }
  });
});

describe("cross-cutting — §7.7", () => {
  it("carries the ten tabs, reachable from every step on every pathway", () => {
    expect(CROSS_CUTTING).toHaveLength(10);
    for (const id of PATHWAY_IDS) {
      for (const tab of CROSS_CUTTING) {
        expect(findTab(id, "0", tab.id)).toBe(tab);
      }
    }
  });
});

describe("discretion that must not become requirement — §7.9", () => {
  it("keeps a written list beside the rows that carry it", () => {
    expect(DISCRETIONS).toHaveLength(12);
  });

  it("marks the two rules that name the most-lost discretions", () => {
    const marked = allTabs()
      .flatMap((tab) => tab.rows)
      .filter((row) => row.discretionary)
      .map((row) => row.ref);
    // The threshold-determination record is advisable, not required, and
    // 1b.5(c)(2) may never be built as a requirement to analyse alternatives.
    expect(marked).toContain("1b.2(e)");
    expect(marked).toContain("1b.5(c)(2)");
    expect(marked).toContain("1b.7(c)");
    expect(marked).toContain("1b.9(u)");
  });

  it("never gates a row it also calls discretionary", () => {
    const both = allTabs()
      .flatMap((tab) => tab.rows)
      .filter((row) => row.discretionary && row.gate);
    expect(both).toEqual([]);
  });
});

describe("the trigger map — §7.8", () => {
  it("records what each step completion can populate", () => {
    expect(RETRIEVAL_PUSHES.map((push) => push.after)).toEqual([
      "Step 0",
      "Step 1",
      "Step 2",
      "Step 3",
      "Document steps"
    ]);
  });

  it("says plainly where a completion fires nothing", () => {
    const step1 = RETRIEVAL_PUSHES.find((push) => push.after === "Step 1");
    expect(step1?.populates.join(" ")).toContain("nothing by itself");
    expect(TRIGGERS.some((t) => t.fires === "nothing")).toBe(true);
  });

  it("carries the four Level 2 to Level 4 escalations", () => {
    expect(TRIGGERS.filter((t) => t.level === "2 → 4")).toHaveLength(4);
  });
});
