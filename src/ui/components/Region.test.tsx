import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Region } from "@/ui/components/Region";
import { absent, blocked, filled, unresolved } from "@/ui/data/fixtures";

afterEach(cleanup);

/** The distinction the whole application rests on. absent is an answer about
 *  the world; blocked is a precondition; unresolved is a defect. A component
 *  that collapses them is the signature defect §1 names, so it is checked
 *  here rather than remembered. */
describe("the four states", () => {
  it("carries the state in data-state and never in words on the screen", () => {
    const { container } = render(
      <Region region={absent<string>("Nothing found", "⟨query⟩")}>
        {(v) => <p>{v}</p>}
      </Region>
    );
    expect(container.querySelector("[data-state='absent']")).not.toBeNull();
    for (const word of ["absent", "blocked", "unresolved", "filled"]) {
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
