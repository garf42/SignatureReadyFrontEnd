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

/** The section pane opens collapsed on every page, so anything about its
 *  labels has to open it first. Collapsed it is icons and titles only. */
function openSections(container: HTMLElement) {
  const toggle = container.querySelector("[aria-label='Show the sections']");
  if (toggle) fireEvent.click(toggle);
  return container;
}

const sectionsPane = (container: HTMLElement) =>
  container.querySelector("aside[aria-label='Sections']") as HTMLElement;

/** Every screen, reached the way the README says it is reached. These are
 *  smoke tests with one assertion each about the thing the page exists to
 *  say, so a page that renders but says nothing still fails. */
describe("routes", () => {
  it("opens the inbox at /", () => {
    at("/");
    expect(screen.getByText("Your projects")).toBeTruthy();
  });

  it.each([
    ["/archive", "Nothing has been archived"],
    ["/experts", "No expert requests are open"],
    ["/learning", "Learning"],
    ["/reference", "Reference"]
  ])("opens %s", (path, heading) => {
    const { container } = at(path);
    expect(within(container).getAllByText(heading).length).toBeGreaterThan(0);
  });

  it("routes a section click instead of reloading the document", () => {
    const { container } = at("/");
    openSections(container);
    fireEvent.click(within(sectionsPane(container)).getByText("Reference"));
    expect(screen.getAllByText(/312 artifacts/).length).toBeGreaterThan(0);
  });

  it("keeps the section pane on the project page too", () => {
    const { container } = at("/projects/p1/steps/0/proposed-action");
    expect(sectionsPane(container)).not.toBeNull();
    expect(container.querySelector("aside[aria-label='Steps']")).not.toBeNull();
  });

  it("opens the section pane collapsed, and it still opens", () => {
    const { container } = at("/");
    expect(container.querySelector("[aria-label='Show the sections']")).not.toBeNull();
    expect(within(sectionsPane(container)).queryByText("Reference")).toBeNull();
    openSections(container);
    expect(within(sectionsPane(container)).getByText("Reference")).toBeTruthy();
  });

  it("shows the signed-out case when the session is not filled", () => {
    at("/?session=out");
    expect(screen.getByText("You are signed out")).toBeTruthy();
  });

  it("shows the not-found screen for anything else", () => {
    at("/nowhere");
    expect(screen.getByText("That page is not here")).toBeTruthy();
  });

  it("reaches every section of the left pane from every page", () => {
    for (const path of ["/", "/learning", "/reference", "/projects/p1/steps/0/proposed-action"]) {
      const { container } = at(path);
      openSections(container);
      const nav = sectionsPane(container);
      for (const name of ["Inbox", "Archive", "Expert Q", "Learning", "Reference"]) {
        expect(within(nav).getByText(name), `${name} missing on ${path}`).toBeTruthy();
      }
      cleanup();
    }
  });
});

describe("the supporting pages render empty by design — §6.1", () => {
  it("says nothing has been archived, and what it searched for", () => {
    at("/archive");
    expect(screen.getByText("Nothing has been archived")).toBeTruthy();
    expect(screen.getByText(/project.archived/)).toBeTruthy();
  });

  it("says the expert queue is open and empty, not that it failed", () => {
    const { container } = at("/experts");
    expect(screen.getByText("No expert requests are open")).toBeTruthy();
    expect(container.querySelector("[data-state='absent']")).not.toBeNull();
    expect(container.querySelector("[data-state='unresolved']")).toBeNull();
  });

  it("fills Learning and Reference, because those two have measured data", () => {
    const learning = at("/learning").container;
    expect(learning.querySelector("[data-state='filled']")).not.toBeNull();
    cleanup();
    const reference = at("/reference").container;
    expect(reference.querySelector("[data-state='filled']")).not.toBeNull();
  });
});

describe("Learning shows the honest zero — §6.5", () => {
  it("displays the real grounding numbers rather than an adoption rate", () => {
    at("/learning");
    expect(screen.getByText("0 / 0 / 103")).toBeTruthy();
    expect(screen.getByText(/live-model \/ cassette \/ template-substitution/)).toBeTruthy();
  });

  it("states the mechanism gap plainly, in one banner", () => {
    at("/learning");
    expect(screen.getByText(/rows in all five object-dataset materializations/)).toBeTruthy();
  });
});

describe("Reference keeps three values for citable — §6.6", () => {
  it("renders not-declared distinctly from not-citable", () => {
    at("/reference");
    expect(screen.getAllByText("Not declared").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Not citable").length).toBeGreaterThan(0);
  });

  it("never shows an artifact without its rule vintage", () => {
    const { container } = at("/reference");
    const bodies = container.querySelectorAll("tbody");
    expect(bodies.length).toBeGreaterThan(0);
    for (const body of bodies) {
      expect(body.textContent).toMatch(/rule|superseded|rescinded/i);
    }
  });

  it("warns on every row written under a superseded authority", () => {
    at("/reference");
    expect(screen.getAllByText(/36 CFR 220 was superseded on 2025-07-03/).length).toBeGreaterThan(0);
  });

  it("carries the extraction hazard on the page", () => {
    at("/reference");
    expect(screen.getByText(/Forest %Nice/)).toBeTruthy();
  });

  it("carries the integrity strip as one line", () => {
    at("/reference");
    expect(screen.getByText("287 / 287 digests and lengths match, both directions")).toBeTruthy();
  });
});

describe("the inbox row opens into itself", () => {
  it("keeps an expanded project in one box, not two", () => {
    const { container } = at("/");
    const group = container.querySelector("tbody") as HTMLElement;
    expect(group.getAttribute("data-open")).toBe("no");
    fireEvent.click(within(group).getByLabelText("Show the details"));
    expect(group.getAttribute("data-open")).toBe("yes");
    // The detail is a row of the same tbody, so the border runs around both.
    expect(group.querySelectorAll("tr").length).toBe(2);
    expect(within(group).getByText("Open project")).toBeTruthy();
  });
});
