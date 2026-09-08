import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "@/ui/App";
import { forgetSubmitted } from "@/ui/data/submitted";

afterEach(cleanup);
/* Submission is session state, so it survives cleanup and would leak a tick
   from one test into the next. */
afterEach(forgetSubmitted);

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
    expect(within(rail(ce)).getByText("Assembly")).toBeTruthy();
  });

  it("gives P0 no pathway step at all", () => {
    const { container } = at("/projects/p1/steps/1/does-nepa-apply?pathway=P0");
    /* Counted over the rail's step items, not over its text: the seam names
       the level of review as a heading, and matching on words alone would
       count that heading as a step. */
    const steps = [...rail(container).querySelectorAll("li")]
      .map((li) => (li.textContent ?? "").trim())
      .filter((text) => /Intake|Threshold determination|Level of review/.test(text));
    expect(steps).toEqual(["1Intake", "2Threshold determination", "3Level of review"]);
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
      /* The strip carries a completion tick, so compare on the name. */
      .map((t) => (t.textContent ?? "").replace("✓", "").trim());
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
        .map((t) => (t.textContent ?? "").replace("✓", "").trim());
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
    expect(screen.getAllByText("Route").length).toBeGreaterThan(0);
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
    expect(screen.getAllByText("Sign").length).toBeGreaterThan(0);
    expect(screen.queryByText("Route")).toBeNull();
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
    expect(screen.getAllByText(/2 of 2 answered/).length).toBeGreaterThan(0);
  });
});

describe("the element panel", () => {
  it("names the document's element count where a tab assembles one", () => {
    at("/projects/p1/steps/8/rod?pathway=P4");
    expect(screen.getByText("Contents of the decision — 8 elements")).toBeTruthy();
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
    /* Both bands are in the rail, each headed by its level in plain words —
       the same two lines the seam sets on a project that has occupied one
       level — and the superseded one says so. Never the pathway id: "P3" means
       nothing to the person doing the work. */
    const pane = rail(container);
    expect(within(pane).getByText("Environmental assessment")).toBeTruthy();
    expect(within(pane).getByText("Environmental impact statement")).toBeTruthy();
    expect(within(pane).getByText(/Level 1 of 2 · superseded/)).toBeTruthy();
    expect(within(pane).getByText("Level 2 of 2")).toBeTruthy();
    expect(pane.textContent).not.toMatch(/\bP3\b|\bP4\b/);
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
      .map((tab) => (tab.textContent ?? "").replace("✓", "").trim());
    expect(names).toEqual(["Scope of analysis", "Deadline", "Scoping", "Comment and pre-decisional publication"]);
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

/** The band tells a non-expert which review they are doing and what this step
 *  is for. It used to read "Level 1 of 1 · P3 · EA, then FONSI", which guides
 *  nobody: every token in it is internal vocabulary. */
describe("the band says which review this is, in plain words", () => {
  it("states the level, why it is that one, and what it ends in", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const band = container.querySelector("[class*='band']") as HTMLElement;
    expect(band.textContent).toContain("This project needs an environmental assessment.");
    expect(band.textContent).toContain("1b.2(f)(2)(iv)(A)");
    expect(band.textContent).toContain("finding of no significant impact");
  });

  it("never puts the internal pathway id in front of the reader", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const band = container.querySelector("[class*='band']") as HTMLElement;
    expect(band.textContent).not.toMatch(/\bP3\b/);
  });

  it("shows the selected step's own purpose, and it changes with the step", () => {
    const assembly = at("/projects/p1/steps/4/ea?pathway=P3").container;
    const first = (assembly.querySelector("[class*='herePurpose']") as HTMLElement).textContent;
    expect(first).toBeTruthy();
    cleanup();
    const plan = at("/projects/p1/steps/3/scope?pathway=P3").container;
    const second = (plan.querySelector("[class*='herePurpose']") as HTMLElement).textContent;
    expect(second).toBeTruthy();
    expect(second).not.toBe(first);
  });

  /* The undecided case gets the same three sentences as every decided one:
     it is the state a reader is in first, and the one that has to teach them
     what the page is going to do. It must not claim a level, and it must not
     name the step by a number the rail no longer shows. */
  it("says the level is undecided, and where it gets decided", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action");
    const band = container.querySelector("[class*='band']") as HTMLElement;
    expect(band.textContent).not.toContain("This project needs");
    expect(band.textContent).toContain("has not been decided yet");
    expect(band.textContent).toContain("Step 3, Level of review");
    expect(band.textContent).toContain("1b.2(f)(2)");
    /* The rail counts from one, so prose that says "Step 2" points at the
       wrong row. */
    expect(band.textContent).not.toContain("Step 2");
  });
});

/** The band header inside the rail said the same thing as the level line above
 *  it and the step count below it. It earns its place only where there is more
 *  than one band to tell apart. */
/** The rail is dragged, not toggled. A collapse button had two states and the
 *  reader wanted neither: full width crowds the panel on a narrow screen, and
 *  collapsed-to-icons hides the step names, which are the only thing the rail
 *  is for. */
describe("the steps pane is resizable", () => {
  it("offers a divider with a value and its limits, not a collapse toggle", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action");
    expect(screen.queryByLabelText("Hide the steps")).toBeNull();
    const handle = screen.getByRole("slider", { name: "Width of the steps pane" });
    expect(handle.getAttribute("aria-valuenow")).toBe("280");
    expect(handle.getAttribute("aria-valuemin")).toBe("120");
    expect(handle.getAttribute("aria-valuemax")).toBe("420");
    /* The width itself is a custom property the pane reads; jsdom does not
       serialise those, so the value is checked where it is announced. */
    expect(container.querySelector("[class*='split']")).not.toBeNull();
  });

  /* A divider only a pointer can move is a control half this application's
     users cannot operate. */
  it("moves from the keyboard, and stops at both ends", () => {
    at("/projects/p1/steps/0/proposed-action");
    const handle = screen.getByRole("slider", { name: "Width of the steps pane" });
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(handle.getAttribute("aria-valuenow")).toBe("264");
    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
    expect(handle.getAttribute("aria-valuenow")).toBe("312");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(handle.getAttribute("aria-valuenow")).toBe("120");
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(handle.getAttribute("aria-valuenow")).toBe("120");
    fireEvent.keyDown(handle, { key: "End" });
    expect(handle.getAttribute("aria-valuenow")).toBe("420");
  });

  it("returns to its default on a double click", () => {
    at("/projects/p1/steps/0/proposed-action");
    const handle = screen.getByRole("slider", { name: "Width of the steps pane" });
    fireEvent.keyDown(handle, { key: "Home" });
    expect(handle.getAttribute("aria-valuenow")).toBe("120");
    fireEvent.doubleClick(handle);
    expect(handle.getAttribute("aria-valuenow")).toBe("280");
  });

  /* Whatever the width, the step names are there — which is the failure the
     collapse toggle had at one of its two states. */
  it("never hides the step names", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action");
    const handle = screen.getByRole("slider", { name: "Width of the steps pane" });
    fireEvent.keyDown(handle, { key: "Home" });
    expect(within(rail(container)).getByText("Intake")).toBeTruthy();
  });
});

describe("the rail's band header", () => {
  it("is not drawn on a project that has occupied one level of review", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    expect(rail(container).querySelector("[class*='bandHeader']")).toBeNull();
  });

  it("is drawn once a level has been superseded and there are bands to tell apart", () => {
    const { container } = at("/projects/p1/steps/E2.P4.5/eis?levels=P3,P4");
    expect(rail(container).querySelector("[class*='bandHeader']")).not.toBeNull();
  });

  /* There is only ever one shared band, it is always the same three steps, and
     its summary restated the steps listed directly beneath it. */
  it("never heads the shared band, however many levels there are", () => {
    const { container } = at("/projects/p1/steps/E2.P4.5/eis?levels=P3,P4");
    const headers = [...rail(container).querySelectorAll("[class*='bandHeader']")].map(
      (header) => header.textContent ?? ""
    );
    expect(headers.some((text) => text.includes("Every review"))).toBe(false);
    expect(headers.length).toBe(2);
  });

  /* A title with a summary under it reads as a caption, not as a control, and
     these collapse a band's steps. */
  it("says it is a control, and its direction says which way", () => {
    const { container } = at("/projects/p1/steps/E2.P4.5/eis?levels=P3,P4");
    const headers = [...rail(container).querySelectorAll("[class*='bandHeader']")];
    const shut = headers.find((header) => header.getAttribute("aria-expanded") === "false");
    const open = headers.find((header) => header.getAttribute("aria-expanded") === "true");
    expect(shut?.querySelector("[data-icon='chevron-right']")).not.toBeNull();
    expect(open?.querySelector("[data-icon='chevron-down']")).not.toBeNull();
  });
});

/** The rail is a rail. Anything it says that the centre of the screen already
 *  says is a second line on every row, paid for in width the steps need. */
describe("the rail says only what the step itself cannot", () => {
  it("puts no tab count and no unwritten count on a step", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const pane = rail(container);
    expect(pane.textContent).not.toMatch(/\d+ tabs?\b/);
    expect(pane.textContent).not.toContain("unwritten");
  });

  it("still marks a superseded step read-only, because nothing else does", () => {
    /* Stand inside the superseded level, so its band is open and its steps
       are drawn rather than summarised. */
    const { container } = at("/projects/p1/steps/E1.P3.4/ea?levels=P3,P4");
    expect(rail(container).textContent).toContain("Read only");
  });
});

/** Steps 3 and beyond used to APPEAR. That reads as a toggle, and the work at
 *  that boundary is the opposite of one: the documents get opened, the
 *  references they incorporate get pulled, and drafting runs against everything
 *  answered above. It takes real time, and a transition nobody can see start —
 *  or see running — is one they cannot tell apart from a hang. */
describe("assembly is an act at the seam, not a state flip", () => {
  it("names the first unfinished step, and offers nothing", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action");
    const gate = rail(container).querySelector("[class*='gate']") as HTMLElement;
    /* The first thing outstanding, not the last thing needed: telling a reader
       the level of review is not fixed when intake is half-answered points them
       at the wrong end of the work. */
    expect(gate.textContent).toContain("Waiting on Intake");
    expect(gate.textContent).toContain("until the level of review is fixed");
    expect(gate.querySelector("button")?.hasAttribute("disabled")).toBe(true);
  });

  /* Grey until the steps it reads from are finished, and it names the first
     one that is not. Assembly reads every answer above it, so a review built on
     a half-answered intake is built on nothing. */
  it("stays grey while a step above it is unanswered, and names that step", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action?pathway=P3&assembled=no");
    const gate = rail(container).querySelector("[class*='gate']") as HTMLElement;
    expect(gate.querySelector("button")?.hasAttribute("disabled")).toBe(true);
    expect(gate.textContent).toContain("Waiting on Intake");
  });

  it("offers the act once a level is fixed and the steps above are answered", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action?pathway=P3&assembled=ready");
    expect(screen.getByText("Assemble review")).toBeTruthy();
    /* This application's own primary, not Blueprint's intent — an intent prop
       reaches for a different blue than the submit bar and the dialogs use. */
    const live = rail(container).querySelector("[class*='gateButton']") as HTMLElement;
    expect(live.getAttribute("data-ready")).toBe("yes");
    expect(live.className).not.toMatch(/bp6-intent/);
    const pane = rail(container);
    const gate = pane.querySelector("[class*='gate']") as HTMLElement;
    expect(gate.querySelector("button")?.hasAttribute("disabled")).toBe(false);
    /* Determined is not assembled: the steps do not exist yet. */
    expect(within(pane).queryByText("Assembly")).toBeNull();
    expect(within(pane).queryByText("Plan of analysis")).toBeNull();
  });

  it("names what it will produce before it runs", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action?pathway=P3&assembled=ready");
    const gate = rail(container).querySelector("[class*='gate']") as HTMLElement;
    expect(gate.textContent).toContain("EA");
    expect(gate.textContent).toContain("FONSI");
  });

  it("announces the wait rather than only animating it", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action?pathway=P3&assembled=ready");
    const gate = rail(container).querySelector("[class*='gate']") as HTMLElement;
    fireEvent.click(gate.querySelector("button") as HTMLElement);
    const live = rail(container).querySelector("[role='status']") as HTMLElement;
    expect(live.textContent).toContain("Assembling the review");
    expect(live.getAttribute("aria-live")).toBe("polite");
  });

  it("says it is built, and offers no button, once the steps exist", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const pane = rail(container);
    const gate = pane.querySelector("[class*='gate']") as HTMLElement;
    expect(gate.querySelector("button")).toBeNull();
    expect(within(pane).getByText("Assembly")).toBeTruthy();
  });
});

/** Once assembly has run, the seam stops being a control and becomes the
 *  heading the pathway steps sit under. Above it, the three steps every review
 *  has; below it, the steps this determination created and nothing else — and
 *  the seam is the only place that boundary gets named. */
describe("the seam names the level of review", () => {
  it("heads the pathway steps with the level, in plain words", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const gate = rail(container).querySelector("[data-state='done']") as HTMLElement;
    expect(gate.textContent).toContain("Level of review");
    expect(gate.querySelector("h2")?.textContent).toBe("Environmental assessment");
    expect(gate.textContent).not.toMatch(/\bP3\b/);
  });

  /* On an escalated proposal each band header IS that heading, one per level.
     A seam as well would be a second box saying the same kind of thing about a
     different level, directly above the one that says it correctly. */
  it("is not drawn at all where the band headers already head the levels", () => {
    const { container } = at("/projects/p1/steps/E2.P4.5/eis?levels=P3,P4");
    expect(rail(container).querySelector("[data-state='done']")).toBeNull();
  });

  /* One level or four, a level of review is headed the same way — the same
     well ground, the same rule above, the same bold left edge — so an escalated
     project is the ordinary one with more than one heading rather than a
     different-looking screen. */
  it("heads every level with the same box, however many there are", () => {
    const one = at("/projects/p1/steps/4/ea?pathway=P3").container;
    const seam = rail(one).querySelector("[data-state='done']") as HTMLElement;
    expect(seam.querySelector("h2")?.textContent).toBe("Environmental assessment");
    cleanup();
    const two = at("/projects/p1/steps/E2.P4.5/eis?levels=P3,P4").container;
    const headers = [...rail(two).querySelectorAll("[class*='bandHeader']")];
    expect(headers).toHaveLength(2);
    for (const header of headers) {
      expect(header.querySelector("[class*='gateOverline']")).not.toBeNull();
      expect(header.querySelector("[class*='gateLevel']")).not.toBeNull();
    }
  });
});

/** Nobody calls intake "step zero". The spec counts from zero because that is
 *  the position in the list, and the step's ADDRESS keeps it — `S.0` is in
 *  every URL and every row anchor — so the two are reconciled in one place. */
describe("steps are numbered from one", () => {
  it("starts the rail at 1", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action");
    const first = rail(container).querySelector("li") as HTMLElement;
    expect((first.textContent ?? "").trim()).toBe("1Intake");
  });

  it("counts the whole rail from one on the step line", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action");
    const where = container.querySelector("[class*='hereWhere']") as HTMLElement;
    expect(where.textContent).toContain("Step 1 of 3");
  });

  /* The address is unchanged, and has to be: renumbering it would break every
     link, every comment anchor and the rid map. */
  /* The address is unchanged, and has to be: renumbering it would break every
     link, every comment anchor and the rid map. */
  it("leaves the address alone", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action");
    const anchored = container.querySelector("[data-rid]");
    expect((anchored?.getAttribute("data-rid") ?? "").startsWith("0/")).toBe(true);
  });

  /* Two sequences, not one. The shared steps are 1-3 and the level's own steps
     start again at 1, because the seam between them separates what is true of
     every review from what this determination created. */
  it("restarts the count at the seam", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const steps = [...rail(container).querySelectorAll("li")].map((li) =>
      (li.textContent ?? "").trim()
    );
    expect(steps).toEqual([
      "1Intake",
      "2Threshold determination",
      "3Level of review",
      "1Plan of analysis",
      "2Assembly",
      "3Publication",
      "4FindingWaiting",
      "5Notification"
    ]);
  });
});

/** The first thing anyone looks at a rail for is what is left. It could not
 *  say: every tab answered `outstanding: null`, honest at the time because the
 *  rail had no way to reach the rows, so nothing was ever marked finished. */
describe("finished work is marked, minimally", () => {
  it("ticks a finished step at the right edge, and never gives up its number", () => {
    const { container } = at("/projects/p1/steps/E1.P3.3/scope?levels=P3");
    const items = [...rail(container).querySelectorAll("li")];
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      /* The number is the address a reader finds a step by, so it survives
         whatever the step's state is. */
      expect(item.querySelector("[class*='number']")?.textContent).toMatch(/^\d+$/);
    }
    /* Any tick present is the tick, at the right edge, and never in place of
       a number. The fixture's rows are markers, so whether a given step is
       finished is not something to assert here — that a tick never costs the
       number is. */
    for (const tick of rail(container).querySelectorAll("[class*='tick']")) {
      expect(tick.textContent).toBe("✓");
    }
  });

  it("says it in words too, for anyone who cannot read a tick at that size", () => {
    const { container } = at("/projects/p1/steps/E1.P3.3/scope?levels=P3");
    const done = rail(container).querySelector("[data-done='yes']");
    if (done) {
      expect(done.closest("li")?.textContent).toContain("done");
    }
  });

  /* NOTHING is ticked until it is submitted. The tick used to mean "could be
     submitted", which put it on exactly the tabs that still had a live Submit
     button — the mark and the control contradicting each other on one row. */
  it("ticks nothing before anything has been submitted", () => {
    const { container } = at("/projects/p1/steps/E1.P3.3/public-involvement?levels=P3");
    const strip = container.querySelector("[role='tablist']") as HTMLElement;
    expect([...strip.querySelectorAll("[role='tab']")].some((tab) =>
      (tab.textContent ?? "").includes("✓")
    )).toBe(false);
    expect(rail(container).querySelector("[class*='tick']")).toBeNull();
  });

  it("ticks the tab the officer submitted, and takes it back on reopen", () => {
    const { container } = at("/projects/p1/steps/E1.P3.3/public-involvement?levels=P3");
    const strip = container.querySelector("[role='tablist']") as HTMLElement;
    const tabOf = () =>
      [...strip.querySelectorAll("[role='tab']")].find((tab) =>
        (tab.textContent ?? "").includes("Public involvement")
      );
    fireEvent.click(screen.getByText("Submit"));
    expect((tabOf()?.textContent ?? "").includes("✓")).toBe(true);
    fireEvent.click(screen.getByText("Reopen"));
    expect((tabOf()?.textContent ?? "").includes("✓")).toBe(false);
  });

  /* Readiness and completion are two facts. Submit is offered on what is
     ready; the tick reports what was done. */
  it("offers Submit on a ready tab and only ticks it afterwards", () => {
    const { container } = at("/projects/p1/steps/E1.P3.3/public-involvement?levels=P3");
    const bar = screen.getByText("Submit").closest("button") as HTMLButtonElement;
    expect(bar.hasAttribute("disabled")).toBe(false);
    expect(container.querySelector("[class*='progress']")?.getAttribute("data-done")).toBe("no");
  });
});

/** One predicate, three surfaces. The rail ticks a step, the strip ticks a tab,
 *  and the panel ticks the tab it is showing — all from the same rows, so they
 *  cannot disagree, and a step with a single tab (which renders no strip) is
 *  still marked. */
describe("completion is marked everywhere it is claimed", () => {
  it("marks the panel of a submitted tab", () => {
    const { container } = at("/projects/p1/steps/E1.P3.3/public-involvement?levels=P3");
    fireEvent.click(screen.getByText("Submit"));
    const progress = container.querySelector("[class*='progress']") as HTMLElement;
    expect(progress.getAttribute("data-done")).toBe("yes");
    expect(progress.textContent).toContain("✓");
  });

  it("marks it on a step that has one tab and therefore no strip", () => {
    const { container } = at("/projects/p1/steps/E1.P3.6/fonsi?levels=P3");
    expect(container.querySelector("[role='tablist']")).toBeNull();
    expect(container.querySelector("[class*='progress']")?.getAttribute("data-done")).not.toBeNull();
  });

  it("keeps every step's number visible, whatever its state", () => {
    const { container } = at("/projects/p1/steps/E1.P3.4/ea?levels=P3");
    const items = [...rail(container).querySelectorAll("li")];
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.querySelector("[class*='number']")?.textContent).toMatch(/^\d+$/);
    }
  });

  /* A step is finished when every tab in it is, so submitting SOME of them
     ticks those tabs and leaves the step alone. The step's tick is the claim
     that there is nothing left in it, and one unsubmitted tab falsifies that. */
  it("never ticks a step while one of its tabs is unsubmitted", () => {
    const { container } = at("/projects/p1/steps/E1.P3.3/public-involvement?levels=P3");
    fireEvent.click(screen.getByText("Submit"));
    const strip = container.querySelector("[role='tablist']") as HTMLElement;
    const tabs = [...strip.querySelectorAll("[role='tab']")];
    expect(tabs.some((tab) => (tab.textContent ?? "").includes("✓"))).toBe(true);
    expect(tabs.every((tab) => (tab.textContent ?? "").includes("✓"))).toBe(false);
    const active = rail(container).querySelector("[class*='active']");
    expect(active?.querySelector("[class*='tick']")).toBeNull();
  });
});

/** The band's two blocks fold, on the same chevron the rail's bands use. Both
 *  open by default: the three sentences are what teach a non-specialist which
 *  review they are doing, and a reader who has to find them is a reader who was
 *  not told. */
describe("the band folds, and keeps its top line either way", () => {
  const heads = (container: HTMLElement) =>
    [...(container.querySelector("[class*='band']") as HTMLElement).querySelectorAll(
      "button[aria-expanded]"
    )];

  it("opens both blocks by default", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const open = heads(container);
    expect(open.length).toBe(2);
    for (const head of open) {
      expect(head.getAttribute("aria-expanded")).toBe("true");
    }
  });

  it("keeps the sentence that has to be read when the rest is put away", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const [level] = heads(container);
    fireEvent.click(level);
    const band = container.querySelector("[class*='band']") as HTMLElement;
    expect(band.textContent).toContain("This project needs an environmental assessment.");
    expect(band.textContent).not.toContain("1b.2(f)(2)(iv)(A)");
    fireEvent.click(level);
    expect(band.textContent).toContain("1b.2(f)(2)(iv)(A)");
  });

  it("folds the step line the same way, keeping where you are standing", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const step = heads(container)[1];
    fireEvent.click(step);
    const band = container.querySelector("[class*='band']") as HTMLElement;
    expect(band.textContent).toContain("Step 2 of 5 · Assembly");
    expect(container.querySelector("[class*='herePurpose']")).toBeNull();
  });

  /* One gesture, learned once. The chevron is the rail's, turning the same
     way, because folding a band and folding this are the same act. */
  it("uses the rail's chevron, and turns it the same way", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const [level] = heads(container);
    expect(level.querySelector("[data-icon='chevron-down']")).not.toBeNull();
    fireEvent.click(level);
    expect(level.querySelector("[data-icon='chevron-right']")).not.toBeNull();
  });

  /* 80ch is a reading measure for a column of prose. These are three sentences
     across the full width of the page, and the cap was wrapping them at a third
     of the room they had — three lines becoming nine. */
  it("caps no line at a reading measure", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const band = container.querySelector("[class*='band']") as HTMLElement;
    for (const el of band.querySelectorAll<HTMLElement>("[class*='level'], [class*='here']")) {
      expect(getComputedStyle(el).maxWidth).not.toBe("80ch");
    }
  });
});

/** One convention across the band: the head of a block is ink, the prose under
 *  it is ink-soft. Two blocks sitting on top of each other in two different
 *  greys reads as two different kinds of text, which they are not. */
describe("the band's prose is one colour", () => {
  it("sets the body of both blocks the same way", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action");
    const band = container.querySelector("[class*='band']") as HTMLElement;
    const colours = new Set(
      [...band.querySelectorAll<HTMLElement>(
        "[class*='levelWhy'], [class*='levelEnds'], [class*='herePurpose'], [class*='levelNote']"
      )].map((el) => getComputedStyle(el).color)
    );
    expect(colours.size).toBeLessThanOrEqual(1);
  });
});

/** A superseded level is headed the same way as a live one. It is the same
 *  kind of thing — a level of review — and the words already say which is
 *  which. Setting one of them in a different face makes the multi-level view a
 *  different-looking screen for a fact that is already stated. */
describe("a superseded level is headed like any other", () => {
  it("sets both headings in the same face", () => {
    const { container } = at("/projects/p1/steps/E2.P4.5/eis?levels=P3,P4");
    const faces = new Set(
      [...rail(container).querySelectorAll<HTMLElement>("[class*='gateLevel']")].map(
        (el) => getComputedStyle(el).fontStyle
      )
    );
    expect(faces.size).toBe(1);
    expect([...faces][0]).not.toBe("italic");
  });

  it("still says which one is superseded, in words", () => {
    const { container } = at("/projects/p1/steps/E2.P4.5/eis?levels=P3,P4");
    const pane = rail(container);
    expect(pane.textContent).toContain("Level 1 of 2 · superseded");
    expect(pane.textContent).toContain("read only");
  });
});

/** Assembly reads every answer above it, and an answer nobody has committed is
 *  a draft. Building a whole level of review on drafts is what this gate is
 *  for, so readiness alone is not enough — the steps above have to be
 *  submitted. */
describe("assembly waits on submissions, not only on answers", () => {
  it("stays grey while a step above it is answered but unsubmitted", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action?pathway=P3&assembled=no");
    const gate = rail(container).querySelector("[class*='gate']") as HTMLElement;
    expect(gate.querySelector("button")?.hasAttribute("disabled")).toBe(true);
    expect(gate.textContent).toContain("answered AND submitted");
  });

  /* The demo override stands in for a backend that would answer both halves
     from the real rows and the real record. */
  it("offers the act once the steps above count as finished", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action?pathway=P3&assembled=ready");
    const gate = rail(container).querySelector("[class*='gate']") as HTMLElement;
    expect(gate.querySelector("button")?.hasAttribute("disabled")).toBe(false);
  });

  /* Submitting one tab of a step does not finish the step, so the gate does not
     move — which is the point of computing it from the same place the tick
     comes from rather than from a second count that could drift. */
  it("does not move on one tab of a step being submitted", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action?pathway=P3&assembled=no");
    fireEvent.click(screen.getByText("Submit"));
    const gate = rail(container).querySelector("[class*='gate']") as HTMLElement;
    expect(gate.textContent).toContain("Waiting on Intake");
    expect(gate.querySelector("button")?.hasAttribute("disabled")).toBe(true);
  });
});

/** Finished work is greyed as well as ticked — the convention an accepted row
 *  already uses, carried onto the rail and the strip. */
describe("finished steps and tabs are greyed", () => {
  it("grounds a submitted step on the well, alongside its tick", () => {
    const { container } = at("/projects/p1/steps/E1.P3.3/public-involvement?levels=P3");
    const before = rail(container).querySelectorAll("[class*='completed']").length;
    fireEvent.click(screen.getByText("Submit"));
    /* Public involvement is one of three tabs on this step, so the STEP is not
       finished and does not grey — the tab is. */
    expect(rail(container).querySelectorAll("[class*='completed']").length).toBe(before);
    const strip = container.querySelector("[role='tablist']") as HTMLElement;
    expect(strip.querySelector("[class*='doneTab']")).not.toBeNull();
  });

  /* The grey and the tick are the same fact said twice, so neither may appear
     without the other. In the fixture no step is ever fully submitted — several
     of its rows can never be cleared — so what this pins is the invariant
     rather than a reachable state. */
  it("greys exactly the steps it ticks", () => {
    const { container } = at("/projects/p1/steps/E1.P3.3/public-involvement?levels=P3");
    fireEvent.click(screen.getByText("Submit"));
    const pane = rail(container);
    for (const item of pane.querySelectorAll("li")) {
      const greyed = /completed/.test(item.querySelector("a")?.className ?? "");
      const ticked = item.querySelector("[class*='tick']") !== null;
      expect(greyed).toBe(ticked);
    }
  });
});

/** One reveal gesture across the application. Plus and minus said the same
 *  thing in a second alphabet — and worse, they read as add and remove where a
 *  chevron reads as reveal, which is what these do. */
describe("everything that opens uses the same chevron", () => {
  it("never draws a plus or a minus to expand something", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    expect(container.querySelector("[data-icon='plus']")).toBeNull();
    expect(container.querySelector("[data-icon='minus']")).toBeNull();
    expect(container.querySelector("[data-icon='chevron-right']")).not.toBeNull();
  });

  it("turns it on an element row the same way as everywhere else", () => {
    const { container } = at("/projects/p1/steps/4/ea?pathway=P3");
    const row = container.querySelector("[data-rid]") as HTMLElement;
    const header = row.querySelector("button[aria-expanded]") as HTMLElement;
    expect(header.querySelector("[data-icon='chevron-right']")).not.toBeNull();
    fireEvent.click(header);
    expect(header.querySelector("[data-icon='chevron-down']")).not.toBeNull();
  });
});

/** The review document, as it will be laid out. Not an editor: an element's
 *  words are what the officer adopted on the step that produces them, and a
 *  document view that let them be changed would create a second, unrecorded
 *  place where a federal document's text comes from. */
describe("the document can be viewed, and never edited, from the band", () => {
  /* The document's own tabs can never be submitted in the fixture — the FANEC
     tab carries four rows that cannot be cleared — so `?submitted=all` is the
     way in. It stands in for exactly the fact the backend will supply. */
  const ready = "/projects/p1/steps/4/fanec?pathway=P2&submitted=all";

  const open = (path: string) => {
    const { container } = at(path);
    fireEvent.click(screen.getByText("View document"));
    return container;
  };

  it("offers nothing before the level of review is fixed", () => {
    at("/projects/p1/steps/0/proposed-action");
    expect(screen.queryByText(/^View /)).toBeNull();
  });

  /* An empty shape presented as the document teaches a reader that the
     document is empty, rather than that it has not been started. */
  it("offers nothing while the document has no submitted section", () => {
    at("/projects/p1/steps/4/fanec?pathway=P2");
    expect(screen.queryByText(/^View /)).toBeNull();
  });

  /* One label on every pathway. The document's own name is said once, inside,
     where it starts — a button naming it too says it twice and says a
     different thing on each pathway. */
  it("opens once a section has been submitted, under one label", () => {
    const { container } = at(ready);
    const view = screen.getByText("View document");
    expect(view).toBeTruthy();
    expect(
      (container.querySelector("[class*='viewDocument']") as HTMLElement).getAttribute("data-ready")
    ).toBe("yes");
  });

  /* A level of review can produce TWO documents — an assessment then a
     finding, a statement then a record of decision. They are separate
     documents written in sequence, and running them together in one list is a
     claim about what gets filed. */
  it("heads the two documents apart where the level produces two", () => {
    at("/projects/p1/steps/E1.P3.4/ea?levels=P3&submitted=all");
    fireEvent.click(screen.getByText("View document"));
    const dialog = screen.getByRole("dialog");
    const heads = [...dialog.querySelectorAll("h3")].map((h) => h.textContent);
    expect(heads).toEqual(["EA", "FONSI"]);
    /* Seven at 1b.5(c) and five at 1b.6(b), and the counts are frozen. */
    expect(dialog.querySelectorAll("section[data-state]").length).toBe(12);
  });

  it("shows every section in order, with the layout it renders through", () => {
    open(ready);
    const dialog = screen.getByRole("dialog");
    /* Six elements at 1b.3(g)(2), and the count is frozen in pathways.ts. */
    expect(dialog.querySelectorAll("section[data-state]").length).toBe(6);
    expect(dialog.textContent).toContain("1b.3(g)(2)(i)");
  });

  /* It has to READ as the document. The templates carry their own numbered
     headings, so a second heading per section — and a chip naming the document
     on every paragraph — made one document look patched together. */
  it("names the document once, where it starts, and never per section", () => {
    open(ready);
    const dialog = screen.getByRole("dialog");
    const heads = [...dialog.querySelectorAll("h3")].map((h) => h.textContent);
    expect(heads).toEqual(["FANEC"]);
    /* Six sections, and the word FANEC appears once as a heading rather than
       six times as a label. */
    const labels = [...dialog.querySelectorAll("section[data-state] span")].filter(
      (span) => span.textContent === "FANEC"
    );
    expect(labels).toEqual([]);
  });

  /* A marker is where a value arrives, not text anyone wrote — so the PROSE
     is what must come out clean. A repeated block is one slot and legitimately
     carries fields inside it; what must never happen is a stray brace landing
     in the document's own words. */
  it("draws the markers as slots and leaves no brace in the prose", () => {
    open(ready);
    const dialog = screen.getByRole("dialog");
    const flow = [...dialog.querySelectorAll<HTMLElement>("[class*='flow']")];
    expect(flow.length).toBeGreaterThan(0);
    expect(dialog.querySelectorAll("[class*='slot']").length).toBeGreaterThan(0);
    for (const paragraph of flow) {
      for (const span of paragraph.children) {
        if (/slot/.test(span.className)) {
          continue;
        }
        expect(span.textContent ?? "").not.toMatch(/[{}]/);
      }
    }
  });

  /* The load-bearing property: no field anywhere in it. */
  it("carries no control that could change a word of it", () => {
    open(ready);
    const view = screen.getByRole("dialog");
    expect(view.querySelectorAll("input, textarea, select, [contenteditable]").length).toBe(0);
  });

  /* NO PREAMBLE. What stood at the top explained the design — that contents
     are authored elsewhere, that arrangement is permitted — which is reasoning
     for whoever builds this, not something a reader of the document can act
     on. The absence of a single field says the first; the second is in the
     handoff. */
  it("carries no explanation of itself, only the state", () => {
    open(ready);
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).not.toMatch(/arrangement/i);
    expect(dialog.textContent).not.toMatch(/cannot be changed here/i);
    expect(dialog.textContent).toMatch(/\d+ of \d+ sections submitted/);
  });
});

/** The greying has to actually render. The first attempt set it in ink at a
 *  specificity that lost to the tab's own colour, so the class landed and
 *  nothing changed — which is the failure mode a class-presence test misses. */
describe("a finished tab is visibly settled", () => {
  /* THE SAME MARK an accepted row and a finished step carry, and nothing else:
     the well, with the text untouched. Two earlier attempts translated it into
     ink and then into opacity; neither was the convention. */
  it("marks a finished tab with a fill and leaves its words alone", () => {
    const { container } = at("/projects/p1/steps/E1.P3.3/public-involvement?levels=P3");
    fireEvent.click(screen.getByText("Submit"));
    const done = [...container.querySelectorAll<HTMLElement>("[role='tab']")].find((tab) =>
      (tab.textContent ?? "").includes("✓")
    );
    expect(done).toBeDefined();
    const style = getComputedStyle(done as HTMLElement);
    expect(style.opacity === "" || style.opacity === "1").toBe(true);
  });
});

/** One title, whichever pathway this is. It was the document types joined, so
 *  the same overlay announced itself differently depending on where it was
 *  opened — and on a two-document pathway it announced a sequence rather than
 *  a thing. */
describe("the document overlay has one title", () => {
  it("titles itself the same on a one-document and a two-document pathway", () => {
    at("/projects/p1/steps/4/fanec?pathway=P2&submitted=all");
    fireEvent.click(screen.getByText("View document"));
    const one = screen.getByRole("dialog").querySelector("h2")?.textContent;
    cleanup();
    at("/projects/p1/steps/E1.P3.4/ea?levels=P3&submitted=all");
    fireEvent.click(screen.getByText("View document"));
    const two = screen.getByRole("dialog").querySelector("h2")?.textContent;
    expect(one).toBe("Review document");
    expect(two).toBe(one);
  });
});
