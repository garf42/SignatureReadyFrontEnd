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
    ["/archive", "Archive"],
    ["/experts", "Expert Q"],
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
    at("/archive?state=absent");
    expect(screen.getByText("Nothing has been archived")).toBeTruthy();
    expect(screen.getByText(/project.archived/)).toBeTruthy();
  });

  it("says the expert queue is open and empty, not that it failed", () => {
    const { container } = at("/experts?state=absent");
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

describe("a supporting page says what it holds in every state — §6.1", () => {
  const pages: [string, string][] = [
    ["/archive", "Archive"],
    ["/experts", "Expert Q"],
    ["/learning", "Learning"],
    ["/reference", "Reference"]
  ];

  it.each(pages)("%s keeps its heading when the region is absent", (path, title) => {
    const { container } = at(path + "?state=absent");
    expect(within(container.querySelector("section") as HTMLElement).getByText(title)).toBeTruthy();
  });

  it.each(pages)("%s keeps its heading when the region is unresolved", (path, title) => {
    const { container } = at(path + "?state=unresolved");
    expect(within(container.querySelector("section") as HTMLElement).getByText(title)).toBeTruthy();
  });
});

describe("Archive carries the inbox row, not a lookalike — §6.3", () => {
  it("shows the same fields, with archived in place of changed", () => {
    const { container } = at("/archive");
    const heads = [...container.querySelectorAll("th")].map((th) => th.textContent);
    expect(heads).toEqual(["Project", "Archived", "Where it was", "Status", ""]);
  });

  it("opens a row into itself and offers restore and delete on the row", () => {
    const { container } = at("/archive");
    const group = container.querySelector("tbody") as HTMLElement;
    fireEvent.click(within(group).getByLabelText("Show the details"));
    expect(group.getAttribute("data-open")).toBe("yes");
    expect(within(group).getByText("Restore")).toBeTruthy();
    expect(within(group).getByText("Delete permanently")).toBeTruthy();
  });

  it("says so where no act records who archived it", () => {
    const { container } = at("/archive");
    const groups = container.querySelectorAll("tbody");
    fireEvent.click(within(groups[1] as HTMLElement).getByLabelText("Show the details"));
    expect(screen.getByText(/Who archived it is not recorded/)).toBeTruthy();
  });
});

describe("Learning reads as rows — §6.5", () => {
  it("hides nothing behind a control", () => {
    const { container } = at("/learning");
    const rows = container.querySelector("section") as HTMLElement;
    // Nothing inside the page body toggles: every measurement is on the page.
    expect(rows.querySelectorAll("[data-tone] [aria-expanded]").length).toBe(0);
    expect(
      screen.getByText(/LiveHTTPTransport.invoke raises even with a credential set/)
    ).toBeTruthy();
    expect(screen.getByText(/an adopted with no value can be recorded today/)).toBeTruthy();
  });

  it("puts all eight measurements on the page at once", () => {
    const { container } = at("/learning");
    const rows = container.querySelectorAll("[data-tone]");
    expect(rows.length).toBe(8);
  });
});

describe("a tab is one object across the application", () => {
  it("gives Reference the same strip the project page uses", () => {
    const { container } = at("/reference");
    const list = container.querySelector("[role='tablist']");
    expect(list).not.toBeNull();
    const names = within(list as HTMLElement)
      .getAllByRole("tab")
      .map((tab) => (tab.textContent ?? "").trim());
    expect(names).toEqual(["Corpus", "7 CFR part 1b", "Categorical exclusions"]);
    expect(container.querySelector("[data-overflow-right]")).not.toBeNull();
  });
});

describe("filter and sort are one control across the application", () => {
  it.each([
    ["/", "All projects"],
    ["/experts", "All requests"],
    ["/reference", "All artifacts"]
  ])("%s carries a labelled Filter and Sort", (path, firstFilter) => {
    const { container } = at(path);
    const section = container.querySelector("section") as HTMLElement;
    expect(within(section).getAllByText("Filter").length).toBeGreaterThan(0);
    expect(within(section).getAllByText("Sort").length).toBeGreaterThan(0);
    expect(within(section).getAllByText(firstFilter).length).toBeGreaterThan(0);
  });
});

describe("Expert Q shows the queue and its compose overlay — §6.4", () => {
  it("names the expert, not a provenance line", () => {
    const { container } = at("/experts");
    const first = container.querySelector("tbody td") as HTMLElement;
    expect(first.textContent).toContain("⟨expert.name⟩");
    expect(first.textContent).toContain("⟨expert.qualification⟩");
  });

  it("carries every column §6.4 asks for", () => {
    const { container } = at("/experts");
    const heads = [...container.querySelectorAll("th")].map((th) => th.textContent);
    expect(heads).toEqual([
      "Expert",
      "Discipline",
      "Project",
      "Awaited",
      "Sent",
      "Expected",
      "Status",
      "Gaps found",
      ""
    ]);
  });

  it("opens the compose overlay from the row and closes back to the table", () => {
    const { container } = at("/experts");
    fireEvent.click(container.querySelector("tbody tr") as HTMLElement);
    expect(screen.getByText("Request from a specialist")).toBeTruthy();
    expect(screen.getByText(/signature-ready-package-expert-request/)).toBeTruthy();
    expect(
      screen.getByDisplayValue(/Extraordinary-circumstance finding returned present/)
    ).toBeTruthy();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Request from a specialist")).toBeNull();
  });

  it("says the sender is not recorded, because no expert act writes one", () => {
    at("/experts");
    expect(screen.getAllByText("Sender not recorded").length).toBe(4);
  });
});

describe("an empty list surface centres its answer", () => {
  it("says No current projects, in the middle of the space the list would fill", () => {
    const { container } = at("/?state=absent");
    const region = container.querySelector("[data-state='absent']") as HTMLElement;
    expect(region.className).toMatch(/page/);
    expect(within(region).getByText("No current projects")).toBeTruthy();
  });

  it("still carries the query it ran, so absent stays an answer and not a blank", () => {
    at("/?state=absent");
    expect(screen.getByText(/register.inbox.query/)).toBeTruthy();
  });

  it("does not centre a region inside a question row", () => {
    const { container } = at("/projects/p1/steps/0/authority");
    fireEvent.click(within(container).getAllByRole("button", { expanded: false })[1]);
    for (const region of container.querySelectorAll("[data-state]")) {
      expect(region.className).not.toMatch(/page/);
    }
  });
});
