import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { filled } from "@/ui/data/fixtures";
import { fixturePort } from "@/ui/data/fixturePort";
import { composePort, DataPortProvider, usePort } from "@/ui/data/port";
import type { DataPort, Region, Session } from "@/ui/data/port";

/** What the seam promises the FDE, held as tests rather than as prose.
 *
 *  Each of these is a promise an integration relies on and cannot check by
 *  reading: that the contract can be implemented from outside the tree, that a
 *  half-wired port is a normal state, that the URL knobs still reach every
 *  surface, and that the fifth state cannot be swallowed by a default clause.
 */

/** Calls all seventeen members, unconditionally and in one render — which is
 *  itself the first constraint the contract states, so a member that cannot be
 *  called during render fails here rather than at integration. */
function useEverySurface(): Record<string, Region<unknown>> {
  const p = usePort();
  return {
    useSession: p.useSession(),
    useInbox: p.useInbox(),
    useProject: p.useProject("p1"),
    useLevels: p.useLevels("p1"),
    useSteps: p.useSteps("p1", "S.0"),
    useGate: p.useGate("FANEC"),
    useCrossCutting: p.useCrossCutting("p1"),
    useElement: p.useElement("p1", "S.0", "proposed-action"),
    useSource: p.useSource("rule"),
    useArchive: p.useArchive(),
    useExpertQueue: p.useExpertQueue(),
    useExpertRequest: p.useExpertRequest(),
    useLearning: p.useLearning(),
    useReference: p.useReference(),
    useReferenceArtifact: p.useReferenceArtifact("a1"),
    useRegulation: p.useRegulation(),
    useCatalogue: p.useCatalogue()
  };
}

const at = (url: string, wrap?: (node: ReactNode) => ReactNode) =>
  renderHook(useEverySurface, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[url]}>{wrap ? wrap(children) : children}</MemoryRouter>
    )
  }).result.current;

describe("the contract covers every surface", () => {
  it("implements exactly the members the contract declares", () => {
    expect(Object.keys(at("/")).sort()).toEqual(Object.keys(fixturePort).sort());
  });

  it("needs no provider: the fixture port is the floor, not an opt-in", () => {
    // Nothing wraps this render but a router, and every surface still answers.
    for (const [name, region] of Object.entries(at("/"))) {
      expect(region.state, `${name} returned nothing without a provider`).toBeTruthy();
    }
  });
});

describe("pending reaches every surface — §6.1 and the five-state mapping", () => {
  // Three knobs, three disjoint sets of surfaces: ?state= the screen's own
  // region, ?shell= the project band and the step list, ?session= the officer.
  // Pending has to be reachable on all three, or a surface exists whose fifth
  // state nobody can see.
  const pendingAll = () => at("/?state=pending&shell=pending&session=pending");

  it("puts every one of the seventeen into pending, so no default clause swallows it", () => {
    const wrong = Object.entries(pendingAll())
      .filter(([, region]) => region.state !== "pending")
      .map(([name, region]) => `${name} is ${region.state}`);
    expect(wrong).toEqual([]);
  });

  it("names the query each pending surface is asking, because a pending region that cannot is not pending", () => {
    for (const [name, region] of Object.entries(pendingAll())) {
      if (region.state !== "pending") {
        continue;
      }
      expect(region.query.length, `${name} is pending and asks nothing`).toBeGreaterThan(0);
    }
  });

  it("never opens a surface in pending: the default view holds no unanswered question", () => {
    for (const [name, region] of Object.entries(at("/"))) {
      expect(region.state, `${name} opens pending`).not.toBe("pending");
    }
  });
});

describe("the URL knobs still reach the fixtures", () => {
  it.each(["absent", "blocked", "unresolved"] as const)("?state=%s moves the screen's own region", (state) => {
    expect(at(`/?state=${state}`).useInbox.state).toBe(state);
  });

  it("?shell= moves the project band and not the screen's region", () => {
    const o = at("/?shell=unresolved");
    expect(o.useProject.state).toBe("unresolved");
    expect(o.useInbox.state).toBe("filled");
  });

  it("?session=out signs the officer out without touching any other surface", () => {
    const o = at("/?session=out");
    expect(o.useSession.state).not.toBe("filled");
    expect(o.useInbox.state).toBe("filled");
  });

  it("reads an unknown ?state= as if it were unset, on every page alike", () => {
    // Two pages with different defaults. The old two-function split made
    // garbage read as "filled" on one and as the page's own fallback on the
    // other; carrying the raw value as null removes the asymmetry.
    const garbage = at("/?state=garbage");
    const unset = at("/");
    expect(garbage.useInbox.state).toBe(unset.useInbox.state);
    expect(garbage.useCatalogue.state).toBe(unset.useCatalogue.state);
    expect(garbage.useReferenceArtifact.state).toBe(unset.useReferenceArtifact.state);
  });
});

describe("a live implementation is supplied entirely from shell code", () => {
  const liveInbox: Region<unknown> = {
    state: "unresolved",
    message: "⟨live⟩",
    reason: "⟨live.lane⟩",
    sources: [],
    actions: []
  };

  it("mixes one live surface into the fixtures and leaves the rest alone", () => {
    const port = composePort({ useInbox: () => liveInbox as never });
    const o = at("/", (children) => (
      <DataPortProvider port={port}>{children}</DataPortProvider>
    ));
    expect(o.useInbox.state).toBe("unresolved");
    // Every other surface is still on fixtures: a half-wired port is normal.
    expect(o.useReference.state).toBe("filled");
    expect(o.useArchive.state).toBe("filled");
  });

  it("takes the shell's session without composing a port at all", () => {
    const session = filled<Session>({ officer: { lead: "Signed in as ", label: "⟨shell⟩" } });
    const o = at("/?session=out", (children) => (
      <DataPortProvider session={session}>{children}</DataPortProvider>
    ));
    // The injected session wins over the URL knob, because real auth is the
    // shell's and the knob belongs to the fixture it replaced.
    expect(o.useSession).toBe(session);
  });

  it("keeps the knob on a surface the shell has not wired, and drops it on one it has", () => {
    const port: DataPort = composePort({ useInbox: () => liveInbox as never });
    const o = at("/?state=absent", (children) => (
      <DataPortProvider port={port}>{children}</DataPortProvider>
    ));
    // useInbox is live, so ?state= no longer reaches it...
    expect(o.useInbox.state).toBe("unresolved");
    // ...while useArchive is still a fixture and still answers the knob.
    expect(o.useArchive.state).toBe("absent");
  });
});
