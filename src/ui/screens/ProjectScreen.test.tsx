import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "@/ui/App";

afterEach(cleanup);

const at = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

const rail = (container: HTMLElement) =>
  container.querySelector("aside[aria-label='Steps']") as HTMLElement;

/** A row is closed until it is opened, so anything about an answer has to open
 *  it first. That is the design and not an accident of the test.
 *
 *  Scoped to the row headers deliberately. Blueprint gives an UNSELECTED TAB
 *  `aria-expanded="false"` too, so a helper that clicked every collapsed thing
 *  navigated to another tab and then asserted about the wrong panel. That was
 *  invisible while an assembly step had a single tab and rendered no strip. */
function openRows(container: HTMLElement) {
  const panel = container.querySelector("[class*='panelBox']") ?? container;
  for (const header of panel.querySelectorAll("button[aria-expanded='false']")) {
    fireEvent.click(header);
  }
  return container;
}

/** §7, checked where it can only be checked once it is rendered: which steps
 *  exist, what a gated row offers, and what a lane that could not run says. */
describe("pathway-dependent display — §7.1, §7.8", () => {
  it("shows only the shared steps until Step 2 fixes a pathway", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action");
    const pane = rail(container);
    expect(within(pane).getByText("Intake")).toBeTruthy();
    expect(within(pane).getByText("Threshold determination")).toBeTruthy();
    expect(within(pane).getByText("Level of review")).toBeTruthy();
    expect(within(pane).queryByText("Assembly")).toBeNull();
    expect(within(pane).queryByText("Record of decision")).toBeNull();
  });

  it("shows the band without commentary about the pathway", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action");
    const band = container.querySelector("[class*='band']") as HTMLElement;
    expect(band.textContent).toContain("⟨project.name⟩");
    expect(band.textContent).not.toMatch(/pathway/i);
  });

  it("replaces the step set once a pathway is determined", () => {
    const eis = at("/projects/p1/steps/5/eis?pathway=P4").container;
    expect(within(rail(eis)).getByText("Record of decision")).toBeTruthy();
    cleanup();
    const ce = at("/projects/p1/steps/4/fanec?pathway=P2").container;
    expect(within(rail(ce)).queryByText("Record of decision")).toBeNull();
    expect(within(rail(ce)).getByText("Disposition")).toBeTruthy();
  });

  it("gives P0 no pathway step at all", () => {
    const { container } = at("/projects/p1/steps/1/does-nepa-apply?pathway=P0");
    const steps = within(rail(container)).getAllByText(/Intake|Threshold determination|Level of review/);
    expect(steps.length).toBe(3);
  });

  /* THE SHAPE THIS TEST USED TO PIN. Ten tabs hung off a rail entry called
     "across the project" that belonged to no step and no level of review —
     which is where content with no home ends up, and it broke the containment
     law the whole page rests on: a pathway's steps complete it, a step's tabs
     complete the step, a tab's elements complete the tab. Every one of those
     duties is now inside the step whose completion it conditions. */
  it("puts every duty inside a step, and carries no step-less rail entry", () => {
    const { container } = at("/projects/p1/steps/S.0/proposed-action");
    const pane = rail(container);
    expect(within(pane).queryByText("Across the project")).toBeNull();
    // 1b.9(a)'s proposal record is a tab of Intake, because it is what the
    // proposal record IS before any level of review is fixed.
    const tabs = within(container.querySelector("[role='tablist']") as HTMLElement)
      .getAllByRole("tab")
      .map((t) => (t.textContent ?? "").trim());
    expect(tabs).toContain("Proposal record");
    expect(tabs).toContain("Applicant or third party");
  });

  it("attaches a duty to every step whose completion it conditions", () => {
    // 1b.9(r) reevaluation operates on a published document, so it is asked on
    // the step where a level ends — on every pathway, including the two that
    // produce no document at all.
    for (const [url, step] of [
      ["/projects/p1/steps/E1.P0.3/close?levels=P0", "Close the review"],
      ["/projects/p1/steps/E1.P3.7/notify?levels=P3", "Notification"]
    ]) {
      const { container } = at(url);
      const tabs = within(container.querySelector("[role='tablist']") as HTMLElement)
        .getAllByRole("tab")
        .map((t) => (t.textContent ?? "").trim());
      expect(tabs, step).toContain("Reevaluation");
      cleanup();
    }
  });
});

describe("the signature gate — §7.2", () => {
  it("keeps the reserved row in place and offers the routing", () => {
    openRows(at("/projects/p1/steps/4/fanec?pathway=P2").container);
    expect(screen.getByText(/Date issued and signature of the responsible official/)).toBeTruthy();
    expect(screen.getAllByText(/Reserved to the responsible official — 1b.3\(g\)\(2\)\(vi\)/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Route for signature").length).toBeGreaterThan(0);
  });

  it("is blocked, never absent — the precondition is a credential, not a missing record", () => {
    const container = openRows(at("/projects/p1/steps/4/fanec?pathway=P2").container);
    const gated = container.querySelector("[data-gated='withheld']");
    expect(gated).not.toBeNull();
    expect(gated?.querySelector("[data-state='blocked']")).not.toBeNull();
    expect(gated?.querySelector("[data-state='absent']")).toBeNull();
  });

  it("offers the act itself where the caller is shown to hold the credential", () => {
    openRows(at("/projects/p1/steps/4/fanec?pathway=P2&gate=held").container);
    expect(screen.getAllByText("Sign and issue").length).toBeGreaterThan(0);
    expect(screen.queryByText("Route for signature")).toBeNull();
  });

  it("names the gate without explaining the backend behind it", () => {
    const container = openRows(at("/projects/p1/steps/4/fanec?pathway=P2").container);
    expect(container.textContent).not.toMatch(/platform predicate/);
    expect(screen.getAllByText(/Reserved to the responsible official/).length).toBeGreaterThan(0);
  });

  it("leaves the EA ungated at every row", () => {
    const { container } = at("/projects/p1/steps/E1.P3.4/ea?levels=P3");
    expect(container.querySelector("[data-gated]")).toBeNull();
  });
});

describe("retrieval that could not run — §7.8", () => {
  it("reports unresolved, not absent", () => {
    const container = openRows(at("/projects/p1/steps/E1.P3.4/ea?levels=P3&retrieval=down").container);
    const unresolved = container.querySelectorAll("[data-state='unresolved']");
    expect(unresolved.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/the drafting lane could not run/).length).toBeGreaterThan(0);
  });

  it("draws a proposal as a proposal while the lane is up", () => {
    const container = openRows(at("/projects/p1/steps/E1.P3.4/ea?levels=P3").container);
    expect(container.querySelectorAll("[data-state='unresolved']").length).toBe(0);
    expect(screen.getAllByText(/Drafted by AI from/).length).toBeGreaterThan(0);
  });
});

describe("discretion is never a requirement — §7.9", () => {
  it("says on the row that the rule permits rather than requires", () => {
    openRows(at("/projects/p1/steps/1/does-nepa-apply").container);
    expect(screen.getAllByText(/A permission in the rule, not a duty/).length).toBeGreaterThan(0);
  });

  it("does not hold the element open on an unanswered discretion", () => {
    const { container } = at("/projects/p1/steps/3/public-involvement?pathway=P3");
    const rows = container.querySelectorAll("[data-discretionary='yes']");
    expect(rows.length).toBe(2);
    expect(screen.getAllByText("2 of 2 completed").length).toBeGreaterThan(0);
  });
});

describe("the element panel", () => {
  it("names the document's element count where a tab assembles one", () => {
    at("/projects/p1/steps/8/rod?pathway=P4");
    expect(screen.getByText("Record of decision — 8 elements")).toBeTruthy();
  });

  it("carries the drafting authority into the tab's own words", () => {
    at("/projects/p1/steps/6/fonsi?pathway=P3");
    expect(screen.getByText(/the subcomponent only; 1b.10 does not extend to it/)).toBeTruthy();
  });

  /* THE FALSEHOOD THIS TEST USED TO PIN. A tab that is not on any level this
     proposal has occupied read as `absent` — "Nothing found for this part of
     the document" — which is the interface making a claim about the world in
     the one state defined as a real answer. After a level change it would have
     said it about a document row that exists. `absent` means a query ran and
     found nothing; a level that was never reached is not a query result. */
  it("says a tab on another level of review is blocked, and names the level", () => {
    const { container } = at("/projects/p1/steps/8/rod?pathway=P2");
    expect(container.querySelector("[data-state='blocked']")).not.toBeNull();
    expect(container.querySelector("[data-state='absent']")).toBeNull();
    expect(screen.getAllByText(/P4/).length).toBeGreaterThan(0);
  });

  /* And the case that made the whole change necessary: after an escalation the
     superseded level's document is STILL THERE. 1b.9(a) keeps it in the
     proposal record and 1b.6(b)(1)/1b.8(b)(1) incorporate it into what
     follows, so the rail may not drop it. */
  it("keeps the earlier level's document reachable after an escalation", () => {
    const { container } = at("/projects/p1/steps/E1.P3.4/ea?levels=P3,P4");
    expect(screen.getByText("Environmental assessment — 7 elements")).toBeTruthy();
    expect(container.querySelector("[data-state='blocked']")).toBeNull();
    // Both bands are in the rail, and the superseded one says so.
    const pane = rail(container);
    expect(within(pane).getByText(/Level 1 · P3/)).toBeTruthy();
    expect(within(pane).getByText(/Level 2 · P4/)).toBeTruthy();
    expect(pane.textContent).toContain("superseded");
  });
});

describe("tabs are the step's parts, not a copy of the step", () => {
  it("renders no tab strip where the step has one part", () => {
    // Step 4 on P2 is a single FANEC; a lone tab repeating the step's name
    // would read as if the step and the tab were the same object.
    const { container } = at("/projects/p1/steps/4/fanec?pathway=P2");
    expect(container.querySelector("[role='tablist']")).toBeNull();
    expect(screen.getByText("FANEC — 6 elements")).toBeTruthy();
  });

  it("renders tabs where the step divides into parts", () => {
    const { container } = at("/projects/p1/steps/4/scope?pathway=P4");
    const list = container.querySelector("[role='tablist']");
    expect(list).not.toBeNull();
    const names = within(list as HTMLElement)
      .getAllByRole("tab")
      .map((tab) => (tab.textContent ?? "").trim());
    expect(names).toEqual(["Scope of analysis", "Deadline", "Scoping", "Comment timing"]);
  });

  it("scrolls the strip rather than wrapping or clipping it", () => {
    const { container } = at("/projects/p1/steps/4/scope?pathway=P4");
    const wrap = container.querySelector("[data-overflow-right]");
    expect(wrap).not.toBeNull();
    expect(wrap?.getAttribute("data-overflow-left")).toBe("no");
  });

  it("marks exactly one step active, and it is the step being worked", () => {
    const { container } = at("/projects/p1/steps/S.0/participants");
    const active = rail(container).querySelectorAll("[class*='active']");
    expect(active.length).toBe(1);
    expect(active[0].textContent).toContain("Intake");
  });

  it("never shows the same name in the rail and in the tab strip", () => {
    const views: string[] = [
      "/projects/p1/steps/0/proposed-action",
      "/projects/p1/steps/2/level-of-review",
      "/projects/p1/steps/x/proposal-record",
      "/projects/p1/steps/3/scope?pathway=P3",
      "/projects/p1/steps/4/scope?pathway=P4"
    ];
    for (const view of views) {
      const { container } = at(view);
      const list = container.querySelector("[role='tablist']");
      const tabs = list
        ? within(list as HTMLElement).getAllByRole("tab").map((t) => (t.textContent ?? "").trim())
        : [];
      const railNames = within(rail(container))
        .getAllByRole("menuitem")
        .map((item) => (item.textContent ?? "").trim());
      for (const tab of tabs) {
        expect(
          railNames.some((name) => name.includes(tab)),
          `"${tab}" appears in both the rail and the tab strip at ${view}`
        ).toBe(false);
      }
      cleanup();
    }
  });
});
