import { describe, expect, it } from "vitest";

import requirements from "@/ui/host-requirements.json";
// The host's package.json, and the ONE import in this tree that deliberately
// climbs out of it. src/ui/ sits at src/ui/ by the contract's own first step,
// so ../../ is the host root by construction — and if the tree is placed
// anywhere else this import fails loudly, which is the right behaviour.
import pkg from "../../package.json";

/** What this tree needs from the application hosting it, asserted against the
 *  application actually hosting it.
 *
 *  Every rule here is a friction item from a real integration that a human
 *  found by reading a README. Prose in a README is checked by whoever
 *  remembers to read it; this file fails in the FDE's terminal on the first
 *  `npm run test`.
 *
 *  It is the one file in the tree that deliberately looks OUTSIDE src/ui/ —
 *  because the things it checks are the host's, and a contract that could only
 *  see its own side would be checking nothing. It reads the host through Vite's
 *  own resolver, so what it sees is what the build sees.
 */

/** Everything the host will bundle, as text.
 *
 *  ONE LIMIT, stated because a silent one would be worse. This tree requires
 *  `css: false`, and under it vitest stubs every stylesheet before Vite's raw
 *  loader runs — a glob and a direct `?raw` import both come back empty. So
 *  CSS SOURCE CANNOT BE READ FROM A TEST HERE, and the rules about what is in
 *  theme.css are enforced by `npm run port:additions`, which runs in node and
 *  reads the files directly.
 *
 *  What this file enforces instead is the IMPORT GRAPH, which is reachable and
 *  is where the danger actually enters: the template's `src/index.css` does
 *  harm only because `main.tsx` imports it. Catching the import catches the
 *  stylesheet. */
const css = import.meta.glob("/src/**/*.css", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;
const sources = import.meta.glob("/src/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;
const html = import.meta.glob("/index.html", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;

// Only the entries that came back as source. See the limit above.
/** Only the entries that came back as source; the rest are class-name
 *  proxies. See the limit above. */
const globalCss = Object.entries(css).filter((e): e is [string, string] => typeof e[1] === "string");
const allCss = globalCss.map(([, text]) => text).join("\n");
const allSources = Object.entries(sources);

describe("the @ alias resolves", () => {
  it("resolves @/ui/… from a file inside the tree, which is how every import here is written", () => {
    // This file imported host-requirements.json through the alias. Reaching
    // this assertion at all proves the alias resolved in both Vite and tsc.
    expect(requirements.alias["@"]).toBe("/src");
  });

  it("finds no import in the tree that reaches outside it, but for this file", () => {
    // The property that made the last port free: not one import path needed
    // rewriting, because every one is @/ui/…. A relative import silently
    // reintroduces a dependency on where the tree was placed.
    //
    // This file is the single exemption, and it is named rather than skipped:
    // its whole job is to look at the host, and a contract that could only see
    // its own side would be checking nothing.
    const escaping = allSources
      .filter(([path]) => path.startsWith("/src/ui/"))
      .flatMap(([path, text]) =>
        [...text.matchAll(/from\s+"([^"]+)"/g)]
          .map((m) => m[1])
          .filter((spec) => spec.startsWith("../") || spec.startsWith("./"))
          .map(() => path)
      );
    // This file's own `../../package.json` import is the single exemption, and
    // it needs no special-casing: import.meta.glob excludes the importing
    // module, so the one file allowed to look outside cannot see itself. The
    // exemption is structural rather than a name in a skip list.
    expect([...new Set(escaping)]).toEqual([]);
  });
});

describe("theme.css is the only global stylesheet — the highest-risk item in the port", () => {
  it("imports theme.css exactly once", () => {
    const importers = allSources.filter(([, text]) => /import\s+"[^"]*theme\.css"/.test(text));
    expect(importers.map(([p]) => p)).toEqual(["/src/ui/App.tsx"]);
  });

  it("imports no other global stylesheet anywhere in the host", () => {
    // THE HIGHEST-RISK ITEM IN THE PORT. The template's src/index.css imports
    // normalize.css and blueprint.css UNLAYERED; theme.css puts those same two
    // in @layer vendor so this tree's own rules outrank them. A second
    // unlayered copy loading afterwards wins every specificity tie and reverts
    // buttons, cards, dialogs, tables and selects to stock Blueprint — with no
    // error anywhere, which is what makes it worth a test rather than a note.
    //
    // The stylesheet is inert until something imports it, so the import is what
    // is checked. Only theme.css and the self-hosted font faces are allowed.
    const allowed = /theme\.css$|^@fontsource\/|\.module\.css$/;
    const offenders = allSources.flatMap(([path, text]) =>
      [...text.matchAll(/import\s+"([^"]+\.css)"/g)]
        .map((m) => m[1])
        .filter((spec) => !allowed.test(spec))
        .map((spec) => `${path} imports ${spec}`)
    );
    expect(offenders).toEqual([]);
  });
});

describe("the mount node is unboxed", () => {
  it("puts no max-width on #root in any stylesheet it can read", () => {
    // theme.css owns #root — min-height 100vh, full bleed. The template's
    // `#root { max-width: 1280px; padding }` boxes the whole application.
    // See the limit above: a stylesheet vitest stubs is checked by
    // `npm run port:additions` instead, not left unchecked.
    const rules = allCss.split("}").filter((block) => /#root\b/.test(block));
    for (const rule of rules) {
      expect(rule, "#root is constrained somewhere").not.toMatch(/max-width/);
    }
  });

  it("carries no #root-container wrapper in the document", () => {
    for (const [path, text] of Object.entries(html)) {
      expect(text, `${path} wraps the mount node`).not.toMatch(/root-container/);
    }
  });

  it("declares the mount-node rules it needs, so the shell does not have to guess", () => {
    const rules = requirements.domRequirements.map((d) => d.selector);
    expect(rules).toContain("#root");
    expect(rules).toContain("#root-container");
  });
});

describe("the host ships the dependencies at the majors this tree was built against", () => {
  const installed: Record<string, string> = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {})
  };
  const major = (range: string) => (range.match(/(\d+)/) ?? [])[1];

  const required = Object.entries(requirements.dependencies);

  it.each(required)("ships %s", (name) => {
    expect(installed[name], `${name} is not installed`).toBeDefined();
  });

  it.each(required)("ships %s at the required major", (name, spec) => {
    const want = major((spec as { range: string }).range);
    const got = major(installed[name] ?? "");
    expect(got, `${name} is ${installed[name]}, this tree needs ${(spec as { range: string }).range}`).toBe(
      want
    );
  });
});

describe("the files that must not exist do not exist", () => {
  const present = new Set([...Object.keys(css), ...Object.keys(sources), ...Object.keys(html)]);
  // A file Vite never imports is still a file, so this catches only what the
  // build would actually load. That is the set that can do harm.

  it.each(requirements.mustNotExist)("$path", ({ path }) => {
    expect(present.has("/" + path), `${path} is present and must not be`).toBe(false);
  });
});

describe("the vitest block is what the tests need", () => {
  it("runs in jsdom, because every screen test renders", () => {
    // A document means jsdom. If the host left the default node environment the
    // screen tests would fail obscurely rather than here.
    expect(typeof document, "the vitest environment is not jsdom").toBe("object");
    expect(requirements.vitest.environment).toBe("jsdom");
  });

  it("does not inject globals, because every test imports from vitest by name", () => {
    expect(requirements.vitest.globals).toBe(false);
    expect((globalThis as Record<string, unknown>).describe).toBeUndefined();
  });
});

describe("the router shape is the one the tree was built for", () => {
  it("states the single root splat, and says why two routes are a defect", () => {
    expect(requirements.router.shape).toMatch(/path:\s*"\*"/);
    expect(requirements.router.shape).toMatch(/auth\/callback/);
    // An exact "/" above the descendant <Routes> remounts App on the first
    // navigation away from the inbox, discarding UI state.
    expect(requirements.router.shape).not.toMatch(/path:\s*"\/"/);
  });

  it("routes off no absolute path, so a non-/ basename still works", () => {
    // The Code Workspaces preview serves under a long proxy prefix.
    const offenders = allSources
      .filter(([path]) => path.startsWith("/src/ui/"))
      .filter(([, text]) => /window\.location\.pathname/.test(text))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });
});

describe("the packet is readable on its own terms", () => {
  /** The register and the two amendments govern this build and are NOT part of
   *  the packet: they are not uploaded, so a shipped file that points at one
   *  is a dangling pointer for everyone downstream. The § numbers stay — they
   *  are a citation vocabulary, and every fact they cite is restated where it
   *  is used — but the folder must not be named. */
  it("names no build-side document by path", () => {
    const offenders = allSources
      .filter(([, text]) => /guidance\//.test(text))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it("reads nothing at runtime or test time from outside the tree, but for the host itself", () => {
    // ?raw and JSON imports are how a file becomes load-bearing across the
    // move. Everything the tree reads that way must be inside it.
    const offenders = allSources
      .filter(([path]) => path.startsWith("/src/ui/"))
      .flatMap(([path, text]) =>
        [...text.matchAll(/from\s+"([^"]+(?:\?raw|\.json))"/g)]
          .map((m) => m[1])
          .filter((spec) => !spec.startsWith("@/ui/"))
          .map((spec) => `${path} reads ${spec}`)
      );
    expect(offenders).toEqual([]);
  });
});
