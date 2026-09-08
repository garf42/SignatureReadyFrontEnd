import { describe, expect, it } from "vitest";

import {
  COMPETENCE_CONDITIONS,
  CROSS_CUTTING,
  DISCRETIONS,
  DOCUMENT_AUTHORITY,
  PATHWAYS,
  PATHWAY_IDS,
  RETRIEVAL_PUSHES,
  SHARED_STEPS,
  TRANSITIONS,
  TRIGGERS,
  elementRows,
  findTab,
  isPermission,
  stepsFor
} from "@/ui/data/pathways";
import type { DocumentType, PathwayId, TabSpec } from "@/ui/data/pathways";

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
    expect(elementRows(tabs[0])).toHaveLength(count);
  });

  it("comes to thirty-four across the five documents", () => {
    const total = documentTabs().reduce((sum, tab) => sum + elementRows(tab).length, 0);
    expect(total).toBe(34);
  });

  it("agrees with the drafting-authority table", () => {
    for (const entry of DOCUMENT_AUTHORITY) {
      const tab = documentTabs().find((t) => t.documentType === entry.documentType);
      expect(elementRows(tab!)).toHaveLength(entry.elements);
    }
  });

  /* A sub-paragraph that says HOW an element may be satisfied must have a
     surface — a permission with no row cannot be exercised — and must not move
     the totals. Both halves are asserted, because keeping only the first is how
     1b.5(c)(2)(i) and (ii) would silently become elements of the EA. */
  it("gives a sub-paragraph a row without making it an element", () => {
    const ea = documentTabs().find((tab) => tab.documentType === "EA");
    expect(ea!.elements.length).toBeGreaterThan(elementRows(ea!).length);
    const subs = ea!.elements.filter((row) => row.subOf);
    expect(subs.map((row) => row.ref)).toEqual(["1b.5(c)(2)(i)", "1b.5(c)(2)(ii)"]);
    for (const row of subs) {
      expect(elementRows(ea!).some((el) => el.ref === row.subOf)).toBe(true);
    }
  });
});

describe("the signature gate — §7.2", () => {
  it("gates three surfaces and no others", () => {
    const gated = allTabs().flatMap((tab) => tab.elements.filter((row) => row.gate));
    const citations = [...new Set(gated.map((row) => row.gate?.citation))].sort();
    expect(citations).toEqual(["1b.3(g)(2)(vi)", "1b.6(b)(5)", "1b.8(b)(8)"]);
  });

  it("leaves the EA and the EIS ungated at every point", () => {
    for (const type of ["EA", "EIS"] as const) {
      const tab = documentTabs().find((t) => t.documentType === type);
      expect(tab?.elements.every((row) => !row.gate)).toBe(true);
      expect(DOCUMENT_AUTHORITY.find((e) => e.documentType === type)?.gate).toBeNull();
    }
  });

  it("reserves every gate to the responsible official, never to a delegate", () => {
    const gated = allTabs().flatMap((tab) => tab.elements.filter((row) => row.gate));
    expect(gated.every((row) => row.gate?.reservedTo === "responsible official")).toBe(true);
  });

  it("offers a routing wherever it withholds an act — never a dead end", () => {
    const gated = allTabs().flatMap((tab) => tab.elements.filter((row) => row.gate));
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

  it("gives P0 somewhere to end, and asks nothing there it may not ask", () => {
    expect(PATHWAYS.P0.steps).toHaveLength(1);
    expect(PATHWAYS.P0.steps[0].terminal).toBe(true);
    /* 1b.2(e) makes record keeping ADVISABLE, so the closing tab's own elements
       are permissions to the last one. The reevaluation duty attached to this
       step is a duty and is not one of them: it operates on a published
       document later, and P0 publishes nothing. */
    const close = PATHWAYS.P0.steps[0].tabs.find((tab) => tab.id === "close")!;
    expect(close.elements.every(isPermission)).toBe(true);
    // No document, no publication, no signature.
    expect(PATHWAYS.P0.steps.flatMap((s) => s.tabs).some((t) => t.documentType)).toBe(false);
    expect(PATHWAYS.P0.steps.flatMap((s) => s.tabs).flatMap((t) => t.elements).some((e) => e.gate)).toBe(
      false
    );
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
          expect(tab.elements.length).toBeGreaterThan(0);
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
        if (step.tabs.length < 2) {
          continue;
        }
        for (const tab of step.tabs) {
          if (stepNames.has(tab.name)) {
            clashes.push(`${id} · step ${step.id} · ${tab.name}`);
          }
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

/* THE STRUCTURE THIS BLOCK USED TO PIN. Ten tabs reachable from every step on
   every pathway, hanging off a rail entry that belonged to no step — the place
   content with no home ended up. Every one of them is now inside the step whose
   completion it conditions, so the assertions are about attachment rather than
   about a step-less shelf. */
describe("every duty is inside a step — the containment law", () => {
  it("leaves no tab outside a step, on any pathway", () => {
    const inSteps = new Set(
      PATHWAY_IDS.flatMap((id) => stepsFor(id).flatMap((step) => step.tabs))
    );
    for (const tab of CROSS_CUTTING) {
      expect(inSteps.has(tab), `${tab.id} belongs to no step`).toBe(true);
    }
  });

  it("finds a tab only under the step that owns it", () => {
    /* The old fallback searched the ten step-less tabs for ANY step id, so
       those ids rendered foreign content under any segment at all — including
       a step that does not exist. */
    expect(findTab("P3", "99", "proposal-record")).toBeUndefined();
    expect(findTab("P3", "4", "proposal-record")).toBeUndefined();
    expect(findTab("P3", "0", "proposal-record")).toBeDefined();
  });

  it("asks a duty that recurs with literally the same tab", () => {
    /* 1b.9(g) applies to every environmental document and 1b.9(r) to every
       published one, so both are asked in more than one place. Same object, so
       the two askings cannot drift; the anchor carries the step key, so they
       stay separately addressable. */
    const interdisciplinary = (id: PathwayId, step: string) =>
      stepsFor(id)
        .find((s) => s.id === step)!
        .tabs.find((t) => t.id === "interdisciplinary");
    expect(interdisciplinary("P3", "4")).toBe(interdisciplinary("P4", "5"));
    expect(interdisciplinary("P1", "3")).toBe(interdisciplinary("P3", "4"));
  });

  it("ends every pathway on a step that can reevaluate what it produced", () => {
    for (const id of PATHWAY_IDS) {
      const last = stepsFor(id).at(-1)!;
      expect(last.terminal, `${id} has no terminal step`).toBe(true);
      expect(
        last.tabs.some((t) => t.id === "reevaluation"),
        `${id} ends with nowhere to reevaluate`
      ).toBe(true);
    }
  });
});

describe("discretion that must not become requirement — §7.9", () => {
  it("keeps a written list beside the rows that carry it", () => {
    expect(DISCRETIONS).toHaveLength(12);
  });

  /* THE CORRECTION THIS TEST USED TO PIN. 1b.5(c)(2) was marked discretionary
     and asserted to be so — but it is an ELEMENT of a seven-item list the rule
     requires "at a minimum", and the submit gate dropped every flagged row, so
     a mandatory element of the environmental assessment could never hold the
     element open. What is discretionary is what goes INSIDE it, and that is
     now carried by (c)(2)(i) and (c)(2)(ii). */
  it("calls 1b.5(c)(2) a duty and its two sub-paragraphs permissions", () => {
    const rows = allTabs().flatMap((tab) => tab.elements);
    const element = rows.find((row) => row.ref === "1b.5(c)(2)");
    expect(element?.modality).toBe("duty");
    expect(rows.find((row) => row.ref === "1b.5(c)(2)(i)")?.modality).toBe("permission");
    expect(rows.find((row) => row.ref === "1b.5(c)(2)(ii)")?.modality).toBe("permission");
  });

  it("marks the rules that name the most-lost discretions", () => {
    const marked = allTabs()
      .flatMap((tab) => tab.elements)
      .filter(isPermission)
      .map((row) => row.ref);
    expect(marked).toContain("1b.2(e)");
    expect(marked).toContain("1b.5(c)(2)(ii)");
    expect(marked).toContain("1b.7(c)");
    expect(marked).toContain("1b.9(u)");
  });

  /* An evaluation the rule makes mandatory is not a permission just because
     its CONTENT is at sole discretion. All four were flagged, and all four
     left the submit gate as a result. */
  it("keeps a mandatory act a duty even where its content is at sole discretion", () => {
    const rows = allTabs().flatMap((tab) => tab.elements);
    for (const ref of ["1b.3(f)", "1b.9(g)"]) {
      expect(rows.find((row) => row.ref === ref)?.modality).toBe("duty");
    }
    // A Senior Agency Official act is neither a duty of this user nor a
    // permission: it is an outbound request, and it never holds work.
    for (const ref of ["1b.5(g)(2)", "1b.7(i)(2)"]) {
      expect(rows.find((row) => row.ref === ref)?.modality).toBe("outbound-request");
    }
  });

  it("never gates a row it also calls a permission", () => {
    const both = allTabs()
      .flatMap((tab) => tab.elements)
      .filter((row) => isPermission(row) && row.gate);
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

/** The step decomposition itself — which commitments a pathway is divided
 *  into, and where the boundaries fall. These were inherited from an earlier
 *  plan document rather than derived, and these are the properties the
 *  derivation has to keep true. */
describe("the steps are commitments, not containers", () => {
  const everyStep = PATHWAY_IDS.flatMap((id) => stepsFor(id));

  it("gives every step a purpose of its own", () => {
    for (const step of everyStep) {
      expect(step.purpose.length, step.name).toBeGreaterThan(40);
    }
  });

  /* A step name that lists its tabs is a container with a label, not a
     commitment: "Scope, clock and public involvement" was three unrelated
     things sharing a step because three tabs needed a home. The check is
     mechanical — no step name may be a comma list. */
  it("never names a step by enumerating its parts", () => {
    for (const step of everyStep) {
      expect(step.name, step.name).not.toContain(",");
    }
  });

  /* A step whose name is one of its own tab names says the tab is the step,
     which makes the containment law unreadable at exactly the place it has to
     be read. */
  it("never gives a step the name of a tab inside it", () => {
    for (const step of everyStep) {
      const clash = step.tabs.find((tab) => tab.name === step.name);
      expect(clash?.name, `${step.name} holds a tab of the same name`).toBeUndefined();
    }
  });

  it("ends every pathway on exactly one terminal step, and it is the last", () => {
    for (const id of PATHWAY_IDS) {
      const steps = stepsFor(id);
      const terminal = steps.filter((step) => step.terminal);
      expect(terminal, id).toHaveLength(1);
      expect(terminal[0], id).toBe(steps[steps.length - 1]);
    }
  });

  /* Only P4 has a step after notification, and the reason is in the rule and
     not in symmetry: 1b.8(e) makes an act by ANOTHER agency a precondition of
     lawful implementation, so notifying does not finish the review. */
  it("gives the statement pathway a clearance step for 1b.8(e), and no other pathway one", () => {
    const clearing = PATHWAY_IDS.filter((id) =>
      stepsFor(id).some((step) =>
        step.tabs.some((tab) => tab.elements.some((row) => row.ref === "1b.8(e)"))
      )
    );
    expect(clearing).toEqual(["P4"]);
    const last = stepsFor("P4").at(-1);
    expect(last?.name).toBe("Clearance");
    expect(last?.terminal).toBe(true);
  });

  it("asks the 1b.8(e) notice once, on the step it gates", () => {
    const asked = stepsFor("P4").flatMap((step) =>
      step.tabs.flatMap((tab) => tab.elements.filter((row) => row.ref === "1b.8(e)"))
    );
    expect(asked).toHaveLength(1);
  });

  /* 1b.7(n)(1) — "may choose to publish a draft environmental impact
     statement" — decides whether the statement pathway has one drafting cycle
     or two, and it had no surface anywhere in the build. It is a PERMISSION and
     nothing may present it as a required stage. */
  it("surfaces the draft-statement decision, as a permission, before assembly", () => {
    const steps = stepsFor("P4");
    const at = steps.findIndex((step) =>
      step.tabs.some((tab) => tab.elements.some((row) => row.ref === "1b.7(n)(1)"))
    );
    expect(at).toBeGreaterThanOrEqual(0);
    expect(at).toBeLessThan(steps.findIndex((step) => step.name === "Assembly"));
    const row = steps[at].tabs
      .flatMap((tab) => tab.elements)
      .find((element) => element.ref === "1b.7(n)(1)");
    expect(row?.modality).toBe("permission");
  });

  /* The document-building step is the same act on every pathway that builds
     one, so it carries the same name. It was "Disposition" on P2 and
     "Assembly" on P3 and P4 — one act under two names. */
  it("calls the document-building step Assembly wherever there is one", () => {
    for (const id of ["P2", "P3", "P4"] as const) {
      expect(stepsFor(id).map((step) => step.name), id).toContain("Assembly");
    }
  });

  /* A deadline stated as a bare duration is a claim about a date the reader is
     not given: 1b.5(e) and 1b.7(k) each run from "the sooner of, as applicable"
     several named events, so "one year to finish" from WHEN is the whole
     question. Wherever a duration appears in the plain sentences, the paragraph
     it runs from has to appear with it. */
  it("never states a deadline without the paragraph it runs from", () => {
    for (const id of PATHWAY_IDS) {
      const { ends } = PATHWAYS[id].plain;
      if (/\byear/.test(ends)) {
        expect(ends, id).toMatch(/1b\.5\(e\)|1b\.7\(k\)/);
      }
    }
  });

  it("says in plain words what each level of review is, why, and what it ends in", () => {
    for (const id of PATHWAY_IDS) {
      const { plain } = PATHWAYS[id];
      expect(plain.says, id).toMatch(/\.$/);
      expect(plain.because, id).toContain("1b.");
      expect(plain.ends.length, id).toBeGreaterThan(20);
      /* Internal vocabulary is exactly what these sentences exist to avoid. */
      expect(plain.says, id).not.toMatch(/\bP[0-4]\b|\bLevel \d/);
    }
  });
});

/** The transitions are addresses waiting for a surface. Nothing renders them
 *  yet, which is exactly why they need a test: two of them went on naming
 *  `x/reevaluation` for a whole rebuild after the cross-cutting band that held
 *  that tab was dissolved, and nothing anywhere noticed. */
describe("every transition names a surface that exists", () => {
  const all = [...TRANSITIONS, ...COMPETENCE_CONDITIONS];

  it("resolves each offeredOn to a real step and tab on a pathway it moves from", () => {
    for (const move of all) {
      const [head, tail] = move.offeredOn.split("/");
      const stepId = tail === undefined ? null : head;
      const tabId = tail ?? head;
      const found = move.from.some((pathway) =>
        stepsFor(pathway).some(
          (step) =>
            (stepId === null || step.id === stepId) &&
            step.tabs.some((tab) => tab.id === tabId)
        )
      );
      expect(found, `${move.id} — ${move.offeredOn}`).toBe(true);
    }
  });

  /* A bare tab id is the escape hatch for a tab whose step differs by pathway,
     and it earns that only by actually differing SOMEWHERE — reevaluation sits
     on step 3 of P0, step 4 of P1, step 5 of P2, step 7 of P3 and step 10 of
     P4, so no single step id is true of it. */
  it("uses a bare tab id only where the step really does vary", () => {
    for (const move of all) {
      if (move.offeredOn.includes("/")) {
        continue;
      }
      const steps = new Set(
        PATHWAY_IDS.flatMap((pathway) =>
          stepsFor(pathway)
            .filter((step) => step.tabs.some((tab) => tab.id === move.offeredOn))
            .map((step) => step.id)
        )
      );
      expect(steps.size, `${move.id} — ${move.offeredOn}`).toBeGreaterThan(1);
    }
  });

  /* Escalation is not a menu. Exactly one of the five is a permission the
     responsible official exercises; the rest are a duty to consider, a derived
     consequence, a duty, and a request to someone else. A surface that offered
     any of them as a free choice would misstate the rule. */
  it("carries exactly one transition a person may simply choose", () => {
    expect(all.filter((move) => move.modality === "permission").map((move) => move.id)).toEqual([
      "T4"
    ]);
  });

  /* De-escalation is unauthorable: `direction` has no member for it, so a
     backend cannot report one and a screen cannot draw one. */
  it("cannot express a move to a lower level of review", () => {
    for (const move of all) {
      expect(["higher", "same-level-again"]).toContain(move.direction);
    }
  });
});
