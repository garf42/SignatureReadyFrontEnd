import { describe, expect, it } from "vitest";

// Read through Vite rather than node:fs — the single tsconfig types only
// vite/client, and `?raw` is part of that surface.
import generated from "../../../PORT-ADDITIONS.md?raw";

import { BINDINGS } from "@/ui/data/bindings";
import * as port from "@/ui/data/port";

/** The gate the README asks for: no screen may read data without naming the
 *  backend it needs. The hook list is read off the port itself rather than
 *  maintained here, so the two cannot drift apart. */

const hooksInPort = Object.keys(port)
  .filter((name) => name.startsWith("use"))
  .filter((name) => typeof (port as Record<string, unknown>)[name] === "function")
  .sort();

const hooksDeclared = Object.keys(BINDINGS).sort();

describe("port bindings", () => {
  it("finds hooks to check", () => {
    expect(hooksInPort.length).toBeGreaterThan(0);
  });

  it("declares a binding for every hook the port exports", () => {
    const undeclared = hooksInPort.filter((hook) => !(hook in BINDINGS));
    expect(undeclared).toEqual([]);
  });

  it("declares no binding for a hook the port does not export", () => {
    const orphaned = hooksDeclared.filter((hook) => !hooksInPort.includes(hook));
    expect(orphaned).toEqual([]);
  });

  it.each(hooksDeclared)("%s names what it stands in for", (hook) => {
    const binding = BINDINGS[hook];
    expect(binding.serves.length).toBeGreaterThan(0);
    expect(binding.requires.length).toBeGreaterThan(0);
    expect(["answerable", "partial", "backlog", "absent"]).toContain(binding.status);
    // Either the hook names what it reads or writes, or it names what does
    // not exist yet. What it may never do is declare nothing at all.
    const named =
      binding.objectTypes.length +
      binding.datasets.length +
      binding.acts.length +
      binding.needed.length;
    expect(named, `${hook} names neither a backend nor a gap`).toBeGreaterThan(0);
  });

  it("says what the FDE must supply wherever the verdict is not answerable", () => {
    for (const hook of hooksDeclared) {
      const binding = BINDINGS[hook];
      if (binding.status !== "answerable") {
        expect(binding.needed.length, `${hook} is ${binding.status} and needs nothing`).toBeGreaterThan(0);
      }
    }
  });

  it("carries every hook into the generated PORT-ADDITIONS.md", () => {
    const missing = hooksDeclared.filter((hook) => !generated.includes("`" + hook + "`"));
    expect(missing, "run `npm run port:additions`").toEqual([]);
  });
});
