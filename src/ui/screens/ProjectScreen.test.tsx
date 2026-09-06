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
 *  it first. That is the design and not an accident of the test. */
function openRows(container: HTMLElement) {
  for (const header of container.querySelectorAll("[aria-expanded='false']")) {
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

  it("keeps the cross-cutting tabs reachable from every step", () => {
    const { container } = at("/projects/p1/steps/x/proposal-record");
    // One rail entry, ten tabs — the rail lists parents, the strip lists parts.
    expect(within(rail(container)).getByText("Across the project")).toBeTruthy();
    expect(within(rail(container)).queryByText("Interdisciplinary preparation")).toBeNull();
    const tabs = within(container.querySelector("[role='tablist']") as HTMLElement).getAllByRole("tab");
    expect(tabs.map((t) => (t.textContent ?? "").trim())).toContain("Interdisciplinary preparation");
    expect(screen.getByText(/eleven categories of material/)).toBeTruthy();
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
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    expect(container.querySelector("[data-gated]")).toBeNull();
  });
});

describe("retrieval that could not run — §7.8", () => {
  it("reports unresolved, not absent", () => {
    const container = openRows(at("/projects/p1/steps/4/ea?pathway=P3&retrieval=down").container);
    const unresolved = container.querySelectorAll("[data-state='unresolved']");
    expect(unresolved.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/the drafting lane could not run/).length).toBeGreaterThan(0);
  });

  it("draws a proposal as a proposal while the lane is up", () => {
    const container = openRows(at("/projects/p1/steps/4/ea?pathway=P3").container);
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

  it("says nothing was found for a tab that is not on this pathway", () => {
    const { container } = at("/projects/p1/steps/8/rod?pathway=P2");
    expect(container.querySelector("[data-state='absent']")).not.toBeNull();
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

  it("marks no step active while a cross-cutting tab is open", () => {
    const { container } = at("/projects/p1/steps/x/proposal-record");
    const active = rail(container).querySelectorAll("[class*='active']");
    // Only the cross-cutting entry itself, never a step in the sequence.
    expect(active.length).toBe(1);
    expect(active[0].textContent).toContain("Across the project");
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
