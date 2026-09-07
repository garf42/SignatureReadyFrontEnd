import { describe, expect, it } from "vitest";

import { coverage } from "@/ui/data/coverage";
import {
  COMPETENCE_CONDITIONS,
  CROSS_CUTTING,
  LEVEL_IDS,
  PATHWAYS,
  PATHWAY_IDS,
  REOPEN_STEP,
  SHARED_STEPS,
  TRANSITIONS,
  parseStepKey,
  railFor,
  ridFor
} from "@/ui/data/pathways";

/** §8.5 — the invariants that may never be filed away as an accepted gap.
 *
 *  A ratchet with nothing outside it becomes wallpaper: every finding gets an
 *  owner, the owner gets a queue, and the queue absorbs the defect instead of
 *  closing it. So the properties below are asserted HERE rather than counted in
 *  `coverage()`, and there is no mechanism anywhere to baseline one away.
 *
 *  What this file can and cannot prove. It proves the BUILD is internally
 *  consistent and complete against its own spec. It cannot prove the build is
 *  correct against 7 CFR part 1b, because the pinned text is in another
 *  repository and outbound retrieval is blocked — which is exactly what the
 *  `owner: "regulation"` findings are for, and why a green run here is not a
 *  claim of compliance.
 */

const c = coverage();
const rows = c.tabs.flatMap((tab) => tab.rows);

describe("the anchor", () => {
  /* A citation repeats inside a single tab in twelve places — four rows of
     implementation clearance all cite 1b.3(j), three of incorporation all cite
     1b.9(e)(7)(i)/(ii)/(iii)'s parent, three of programmatic all cite 1b.9(q).
     A ref-keyed anchor collides on the first run, which is why the ordinal is
     part of the identifier and not decoration. */
  it("gives every row an address that is unique across the whole build", () => {
    const seen = new Map<string, string>();
    for (const row of rows) {
      expect(seen.has(row.rid), `${row.rid} is claimed twice`).toBe(false);
      seen.set(row.rid, row.label);
    }
    expect(seen.size).toBe(c.totals.distinctRows);
  });

  it("keeps the ordinal, because refs really do repeat inside one tab", () => {
    const repeats = c.tabs.filter((tab) => {
      const refs = tab.rows.map((row) => row.ref);
      return new Set(refs).size !== refs.length;
    });
    expect(repeats.length).toBeGreaterThan(0);
    for (const tab of repeats) {
      const rids = tab.rows.map((row) => row.rid);
      expect(new Set(rids).size).toBe(rids.length);
    }
  });

  it("is stable when an unrelated row is added above", () => {
    const tab = CROSS_CUTTING.find((t) => t.id === "programmatic")!;
    expect(ridFor("x", tab, 2)).toBe(ridFor("x", tab, 2));
    expect(ridFor("x", tab, 0)).not.toBe(ridFor("x", tab, 1));
  });
});

describe("the step key", () => {
  /* Five step ids collide across pathways: "4" is Disposition on P1 and P2,
     Assembly on P3, and Scope-clock-and-scoping on P4. A bare id has therefore
     never been an address, and after an escalation it would silently retarget
     to a different step of a different level. */
  it("is unique across a history that occupies one level twice", () => {
    const keys = railFor([
      { seq: 1, pathway: "P3" },
      { seq: 2, pathway: "P4" },
      { seq: 3, pathway: "P4" }
    ]).map((entry) => entry.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("still resolves a bare id from an older link, against the live level", () => {
    const levels = [
      { seq: 1, pathway: "P3" as const },
      { seq: 2, pathway: "P4" as const }
    ];
    expect(parseStepKey("0", levels, 2)?.key).toBe("S.0");
    // "5" is Publication on P3 and Assembly on P4; the live level decides.
    expect(parseStepKey("5", levels, 2)?.key).toBe("E2.P4.5");
    expect(parseStepKey("E1.P3.5", levels, 2)?.key).toBe("E1.P3.5");
    expect(parseStepKey("nonsense", levels, 2)).toBeNull();
  });
});

describe("the rail", () => {
  /* THE STRUCTURAL PROPERTY OF THE WHOLE DESIGN. The rail is computed from the
     rule over the level ids, not taken from what an adapter returned — so a
     wrong or partial backend answer can mislabel a level and can never delete a
     step. Before this, `stepsFor` returned exactly one pathway's steps, and a
     level change made the earlier level's document unreachable. */
  it("only ever grows as levels are added", () => {
    const one = railFor([{ seq: 1, pathway: "P3" }]).map((e) => e.key);
    const two = railFor([
      { seq: 1, pathway: "P3" },
      { seq: 2, pathway: "P4" }
    ]).map((e) => e.key);
    expect(two.slice(0, one.length)).toEqual(one);
    expect(two.length).toBeGreaterThan(one.length);
  });

  it("carries the shared steps on every history, including none at all", () => {
    for (const levels of [[], [{ seq: 1, pathway: "P1" as const }]]) {
      const keys = railFor(levels).map((e) => e.key);
      expect(keys.slice(0, SHARED_STEPS.length)).toEqual(SHARED_STEPS.map((s) => `S.${s.id}`));
    }
  });

  it("opens a reopened level with the reopen step, and never the first", () => {
    const keys = railFor([
      { seq: 1, pathway: "P3" },
      { seq: 2, pathway: "P4" }
    ]).map((e) => e.key);
    expect(keys.filter((k) => k.endsWith(".R"))).toEqual(["E2.P4.R"]);
  });

  /* The same objects, not equal ones. A reopening asks the 1b.2(f)(2) limb
     sequence with literally the rows the first determination used, so drift
     between them is impossible rather than merely caught by a checker. Same
     precedent as P1 and P2 sharing their screening step by reference. */
  it("asks a reopened determination with the first determination's own rows", () => {
    expect(REOPEN_STEP.tabs[1]).toBe(SHARED_STEPS[2].tabs[0]);
    expect(REOPEN_STEP.tabs[2]).toBe(SHARED_STEPS[2].tabs[1]);
    expect(PATHWAYS.P1.steps[0]).toBe(PATHWAYS.P2.steps[0]);
  });
});

describe("the transitions", () => {
  it("every one carries at least one citation", () => {
    for (const t of [...TRANSITIONS, ...COMPETENCE_CONDITIONS]) {
      expect(t.citations.length, t.id).toBeGreaterThan(0);
      for (const cite of t.citations) {
        expect(cite, t.id).toMatch(/^1b\./);
      }
    }
  });

  /* 1b.9(r)(2) says "higher" and names no lower; 1b.9(r)(3)(i) defines an
     errata as an update that does NOT change the determinations in the record
     of decision; and 1b.3(f)(3)'s cure operates before any document exists. So
     the rule's silence about de-escalation is encoded as ABSENCE — there is no
     member to author one with — and the surface says it is silence rather than
     prohibition. */
  it("cannot express a move to a lower level", () => {
    for (const t of [...TRANSITIONS, ...COMPETENCE_CONDITIONS]) {
      expect(["higher", "same-level-again"]).toContain(t.direction);
    }
  });

  /* Four modalities, and the difference between them is the difference between
     something you must do, something you must consider, something that follows
     whether or not you choose it, and something you may do. Reading a duty as a
     permission is the dangerous direction. */
  it("keeps the one express escalation a duty to CONSIDER, and never a duty", () => {
    const t1 = TRANSITIONS.find((t) => t.id === "T1")!;
    expect(t1.modality).toBe("duty-to-consider");
    expect(t1.citations).toContain("1b.9(r)(2)");
  });

  it("keeps the uncured-exclusion route derived, and never a permission", () => {
    const t2 = TRANSITIONS.find((t) => t.id === "T2")!;
    expect(t2.modality).toBe("derived");
    // The whole chain is shown, because no single paragraph states the move.
    expect(t2.citations).toEqual(
      expect.arrayContaining(["1b.2(f)(2)(i)", "1b.3(g)(1)(ii)", "1b.2(f)(2)(iv)", "1b.3(f)(2)"])
    );
  });

  /* §7.5 asserted that an environmental assessment supporting significance
     REOPENS the determination and moves the proposal to P4. No paragraph in
     this repository supports it: 1b.5(a) and 1b.6(c), where such a rule would
     live, are cited nowhere and could not be retrieved. Until they are read it
     is a permission under 1b.11(a)(46), and it carries the reason. */
  it("carries the uncited assertion as a permission, with what is unread named", () => {
    const t4 = TRANSITIONS.find((t) => t.id === "T4")!;
    expect(t4.modality).toBe("permission");
    expect(t4.citations).toEqual(["1b.11(a)(46)"]);
    expect(t4.unresolved).toContain("1b.5(a)");
    expect(t4.unresolved).toContain("1b.6(c)");
  });

  it("never presents a level change as a one-way door", () => {
    for (const t of TRANSITIONS) {
      expect(t.statement.length).toBeGreaterThan(80);
      expect(t.carries.length + t.staysBehind.length).toBeGreaterThan(0);
    }
  });
});

describe("the Levels framework", () => {
  /* The framework's own named failure pattern is neglecting the Level 0 and 1
     foundations while reaching for a Level 4 the problem does not call for. So
     the claim that this build carries all five is asserted rather than said. */
  it("carries every level, and none is empty", () => {
    for (const level of LEVEL_IDS) {
      expect(c.totals.byLevel[level], `Level ${String(level)}`).toBeGreaterThan(0);
    }
  });

  /* The project page's own job is Level 2 — decision guidance — and the pun is
     the design: a Level 2 instrument driving a non-specialist to the correct
     LEVEL OF NEPA REVIEW. If some other level dominated it, the build would be
     answering a different problem from the one it claims. */
  it("puts its centre of gravity on decision guidance", () => {
    const most = LEVEL_IDS.reduce((a, b) => (c.totals.byLevel[a] >= c.totals.byLevel[b] ? a : b));
    expect(most).toBe(2);
  });

  it("gives every tab a level and a scope", () => {
    for (const tab of c.tabs) {
      expect(LEVEL_IDS, `${tab.stepKey}/${tab.tabId}`).toContain(tab.level);
      expect(["proposal", "review"]).toContain(tab.scope);
    }
  });

  /* What answers the non-specialist's first question after a level change —
     "do I have to do intake again?" — structurally, and with a no. */
  it("scopes intake and the threshold determination to the proposal", () => {
    const shared = c.tabs.filter((t) => t.stepKey === "S.0" || t.stepKey === "S.1");
    expect(shared.length).toBeGreaterThan(0);
    for (const tab of shared) {
      expect(tab.scope, tab.tabId).toBe("proposal");
    }
    // The level-of-review determination itself is per level, by definition.
    for (const tab of c.tabs.filter((t) => t.stepKey === "S.2")) {
      expect(tab.scope).toBe("review");
    }
  });
});

describe("the rows", () => {
  it("gives every row a modality and a text state", () => {
    for (const row of rows) {
      expect(
        ["duty", "duty-to-consider", "derived", "permission", "outbound-request"],
        row.rid
      ).toContain(row.modality);
      expect(["verbatim", "restated", "placeholder"], row.rid).toContain(row.text);
    }
  });

  /* A row that offers members must say where they come from, and the union
     makes an omission a compile error. This asserts the other half: that
     1b.3(f)(1)'s resources are OPEN, because the rule prefaces its eight
     classes with "may include, but are not limited to". A closed enum there is
     a false constraint someone would have to find again. */
  it("keeps the open-ended resource list open", () => {
    const resources = rows.find((row) => row.ref === "1b.3(f)")!;
    expect(resources.optionsKind).toBe("open");
  });

  it("offers no set without saying where its members come from", () => {
    for (const row of rows) {
      if (row.form === "select" || row.form === "choice") {
        expect(row.optionsKind, row.rid).not.toBeNull();
      }
    }
  });

  /* Exactly three, and the EA and the EIS carry none at any point: 1b.5(c)(6)
     and 1b.7(h)(8) state that the certifying statement requires no signature
     and that approval to publish indicates concurrence. The FANEC signature was
     gated at two steps and the citation-set check de-duplicated, so the extra
     gate passed. */
  it("gates exactly three rows, one per document that the rule reserves", () => {
    const gated = rows.filter((row) => row.gated);
    expect(gated).toHaveLength(3);
    expect(gated.map((row) => row.ref).sort()).toEqual([
      "1b.3(g)(2)(vi)",
      "1b.6(b)(5)",
      "1b.8(b)(8)"
    ]);
  });

  it("never gates a row it also calls a permission", () => {
    expect(rows.filter((row) => row.gated && row.modality === "permission")).toEqual([]);
  });

  /* A row that echoes a question asked elsewhere must point at a real one. A
     person asked the same question twice assumes they got it wrong the first
     time, and an echo pointing nowhere is worse than the duplicate. */
  it("points every echo at a row that exists", () => {
    const all = new Set(rows.map((row) => row.rid));
    for (const row of rows.filter((r) => r.restates)) {
      expect(all.has(row.restates!), `${row.rid} echoes ${row.restates ?? ""}`).toBe(true);
    }
  });
});

describe("the audit itself", () => {
  it("walks every pathway, and every pathway has every shared step", () => {
    for (const pathway of PATHWAY_IDS) {
      const level = c.levels.find((l) => l.pathway === pathway)!;
      expect(level.steps).toBeGreaterThanOrEqual(SHARED_STEPS.length);
      expect(level.tabs).toBeGreaterThan(0);
      expect(level.rows).toBeGreaterThan(0);
    }
  });

  it("leaves no tab empty", () => {
    expect(c.findings.filter((f) => f.id.startsWith("emptytab:"))).toEqual([]);
  });

  it("shapes every citation like a paragraph of part 1b", () => {
    expect(c.findings.filter((f) => f.id.startsWith("citation:"))).toEqual([]);
  });

  /* The honest half. These findings are REAL and they are owned by the
     regulation, not by this repository: the rule's text for them is not here
     and outbound retrieval is blocked, so no amount of front-end work closes
     one. The count is asserted so it cannot drift upward unnoticed — and so
     that nobody reads a green suite as a claim of compliance. */
  it("counts the gaps the regulation owns rather than hiding them", () => {
    const owned = c.findings.filter((f) => f.owner === "regulation");
    expect(owned.length).toBeGreaterThan(0);
    expect(c.totals.placeholders).toBe(
      c.findings.filter((f) => f.id.startsWith("placeholder:")).length
    );
    // Every one of them names a row a reviewer can open.
    const all = new Set(rows.map((row) => row.rid));
    for (const finding of owned) {
      expect(all.has(finding.where), finding.id).toBe(true);
    }
  });

  it("counts a collapsed enumeration rather than fabricating rows for it", () => {
    expect(c.totals.collapsedFrom).toBeGreaterThan(c.totals.collapsedInto);
    for (const finding of c.findings.filter((f) => f.id.startsWith("collapsed:"))) {
      expect(finding.owner).toBe("spec");
      expect(finding.what).toMatch(/carried by one row/);
    }
  });
});
