import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Region } from "@/ui/components/Region";
import { absent, blocked, filled, pending, unresolved } from "@/ui/data/fixtures";

afterEach(cleanup);

/** The distinction the whole application rests on. absent is an answer about
 *  the world; blocked is a precondition; unresolved is a defect; and pending
 *  is a question still out, which is not an answer at all. A component that
 *  collapses them is the signature defect §1 names, so it is checked here
 *  rather than remembered. */
describe("the five states", () => {
  it("carries the state in data-state and never in words on the screen", () => {
    const { container } = render(
      <Region region={absent<string>("Nothing found", "⟨query⟩")}>
        {(v) => <p>{v}</p>}
      </Region>
    );
    expect(container.querySelector("[data-state='absent']")).not.toBeNull();
    for (const word of ["pending", "absent", "blocked", "unresolved", "filled"]) {
      expect(container.textContent?.toLowerCase()).not.toContain(word);
    }
  });

  it("renders a filled value through the child, and nothing else", () => {
    const { container } = render(
      <Region region={filled("⟨value⟩")}>
        {(v) => <p>{v}</p>}
      </Region>
    );
    expect(container.querySelector("[data-state='filled']")).not.toBeNull();
    expect(screen.getByText("⟨value⟩")).toBeTruthy();
  });

  it("shows the query an absent region ran, because that is the answer", () => {
    render(
      <Region region={absent<string>("Nothing found in the project record", "⟨record.query⟩")}>
        {(v) => <p>{v}</p>}
      </Region>
    );
    expect(screen.getByText(/⟨record.query⟩/)).toBeTruthy();
  });

  it("names what a blocked region waits on", () => {
    render(
      <Region region={blocked<string>("Not ready yet", "an earlier answer")}>
        {(v) => <p>{v}</p>}
      </Region>
    );
    expect(screen.getByText(/an earlier answer/)).toBeTruthy();
  });

  it("names the defect behind an unresolved region", () => {
    render(
      <Region region={unresolved<string>("No answer came back", "the lane could not run")}>
        {(v) => <p>{v}</p>}
      </Region>
    );
    expect(screen.getByText(/the lane could not run/)).toBeTruthy();
  });

  it("shows the query a pending region is asking, so it is a question and not a spinner", () => {
    render(
      <Region region={pending<string>("⟨register.inbox.query⟩")}>
        {(v) => <p>{v}</p>}
      </Region>
    );
    expect(screen.getByText(/⟨register.inbox.query⟩/)).toBeTruthy();
  });

  it("says nothing else while it is pending, because the only sentence it has is its own name", () => {
    const { container } = render(
      <Region region={pending<string>("⟨q⟩")}>
        {(v) => <p>{v}</p>}
      </Region>
    );
    expect(container.textContent).toBe("Asking: ⟨q⟩");
    expect(container.querySelector("[aria-busy='true']")).not.toBeNull();
  });

  it("carries one query through both tenses, so pending and absent are one question", () => {
    const q = "⟨register.inbox.query⟩";
    const before = render(
      <Region region={pending<string>(q)}>{(v) => <p>{v}</p>}</Region>
    ).container;
    expect(before.querySelector("[data-state]")?.getAttribute("data-state")).toBe("pending");
    expect(before.textContent).toContain("Asking: " + q);
    cleanup();
    const after = render(
      <Region region={absent<string>("No current projects", q)}>{(v) => <p>{v}</p>}</Region>
    ).container;
    expect(after.querySelector("[data-state]")?.getAttribute("data-state")).toBe("absent");
    expect(after.textContent).toContain("Searched: " + q);
  });

  it("holds the room on a list surface where absent centres its answer", () => {
    const p = render(
      <Region region={pending<string>("⟨q⟩")} variant="page">{(v) => <p>{v}</p>}</Region>
    ).container;
    // Pending fills the space the rows would have taken; it never centres,
    // because a centred sentence reads as an answer and pending has none.
    expect(p.querySelector("[data-room]")).not.toBeNull();
    expect((p.querySelector("[data-state]") as HTMLElement).className).not.toMatch(/page/);
    cleanup();
    const a = render(
      <Region region={absent<string>("No current projects", "⟨q⟩")} variant="page">
        {(v) => <p>{v}</p>}
      </Region>
    ).container;
    expect(a.querySelector("[data-room]")).toBeNull();
    expect((a.querySelector("[data-state]") as HTMLElement).className).toMatch(/page/);
  });

  it("draws no spinner and no skeleton: a request that outlives its deadline is unresolved", () => {
    const { container } = render(
      <Region region={pending<string>("⟨q⟩")}>{(v) => <p>{v}</p>}</Region>
    );
    expect(container.querySelector("[class*='skeleton']")).toBeNull();
    expect(container.querySelector("[class*='spinner']")).toBeNull();
    // The room is decoration standing in for a value, so it is hidden from
    // the accessibility tree; the query underneath it is not.
    expect(container.querySelector("[data-room]")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("tells absent and blocked apart in the markup, not only in the copy", () => {
    const a = render(
      <Region region={absent<string>("Nothing found", "⟨q⟩")}>
        {(v) => <p>{v}</p>}
      </Region>
    ).container.querySelector("[data-state]")?.getAttribute("data-state");
    cleanup();
    const b = render(
      <Region region={blocked<string>("Not ready yet", "⟨earlier⟩")}>
        {(v) => <p>{v}</p>}
      </Region>
    ).container.querySelector("[data-state]")?.getAttribute("data-state");
    expect(a).toBe("absent");
    expect(b).toBe("blocked");
    expect(a).not.toBe(b);
  });
});
