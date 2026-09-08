/** Emits `src/ui/data/PORT-ADDITIONS.generated.md` from the binding
 *  declarations in `src/ui/data/bindings.ts`, and `HOST-CONTRACT.md` from
 *  `src/ui/host-requirements.json`. Both are generated, never maintained: a
 *  surface that gains a gap gains a row on the next run, and
 *  `port.bindings.test.ts` fails on a member that declares nothing at all.
 *
 *  The port-gap list is written INSIDE src/ui/ on purpose. Two tests read it,
 *  so it is load-bearing; a load-bearing file outside the copied tree makes the
 *  move more than a directory rename, and on the last integration it forced the
 *  file to the host repo root to keep two relative imports working.
 *
 *  Loaded through Vite so the file is read exactly as the application reads it
 *  — same TypeScript, same `@` alias, no second resolver to drift.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "vite";

const ADDITIONS = new URL("../src/ui/data/PORT-ADDITIONS.generated.md", import.meta.url);
const CONTRACT = new URL("../HOST-CONTRACT.md", import.meta.url);

/* --- the CSS invariants, checked here because a test cannot reach them ------
   This tree requires `css: false` in vitest, and under it every stylesheet is
   stubbed before Vite's raw loader runs — a glob and a direct `?raw` import
   both come back empty, so src/ui/host-contract.test.ts cannot read CSS source
   at all. It checks the import GRAPH instead, which is where the danger enters.
   The rules about what is INSIDE a stylesheet are checked here, in node, where
   the files are just files. Failing loudly is the point: this script runs in
   the same breath as the docs it generates. */

async function stylesheets(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name.endsWith(".css")) {
      found.push(entry.parentPath + "/" + entry.name);
    }
  }
  return found;
}

const cssFiles = await stylesheets(new URL("../src", import.meta.url).pathname);
/** Comments stripped first: these files argue about !important and about
 *  #root in prose, and a scanner that cannot tell a rule from a sentence
 *  reports the documentation as the defect. */
const decomment = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "");
const cssSource = Object.fromEntries(
  await Promise.all(cssFiles.map(async (f) => [f, decomment(await readFile(f, "utf8"))]))
);

const cssFailures = [];
const theme = Object.entries(cssSource).find(([f]) => f.endsWith("/ui/theme.css"));
if (!theme) {
  cssFailures.push("src/ui/theme.css is missing; it is the only global stylesheet this tree has.");
} else {
  const layer = theme[1].slice(theme[1].indexOf("@layer"), theme[1].indexOf("@layer") + 400);
  if (!/normalize/.test(layer) || !/blueprint/.test(layer)) {
    cssFailures.push(
      "theme.css must keep normalize and Blueprint inside @layer vendor. Unlayered, they outrank this tree's own rules and every component reverts to stock Blueprint with no error anywhere."
    );
  }
  /* A disabled button that lights up under the cursor promises a click it will
     not take, and it is a cascade accident rather than a decision: an intent
     class written as `.primary, .primary:hover` is one class plus a
     pseudo-class — the same specificity as `.bp6-button:disabled` — so source
     order decides and the module file loads last. Naming the hover and active
     states on the disabled rule makes it (0,3,0) and puts it out of reach of
     ANY single-class intent, including ones nobody has written yet. Trimming
     them as redundant reopens it on every disabled button at once. */
  for (const selector of [
    ".bp6-button:disabled:hover",
    ".bp6-button:disabled:active",
    ".bp6-button.bp6-disabled:hover"
  ]) {
    if (!theme[1].includes(selector)) {
      cssFailures.push(
        `theme.css must carry ${selector}. Without it a disabled button loses to any intent class's own :hover on source order, and lights up under the cursor while refusing the click.`
      );
    }
  }
}
for (const [file, text] of Object.entries(cssSource)) {
  if (/!\s*important/.test(text)) {
    cssFailures.push(file + " uses !important. The vendor layer exists so that no rule has to.");
  }
  for (const block of text.split("}")) {
    if (/#root\b/.test(block) && /max-width/.test(block)) {
      cssFailures.push(file + " constrains #root with a max-width. The mount node is full bleed.");
    }
  }
  if (!file.endsWith("/ui/theme.css") && /normalize\.css|blueprint\.css/.test(text)) {
    cssFailures.push(file + " loads a vendor stylesheet a second time, outside the vendor layer.");
  }
}
if (cssFailures.length > 0) {
  process.stderr.write("CSS contract broken:\n" + cssFailures.map((f) => "  - " + f).join("\n") + "\n");
  process.exit(1);
}

const server = await createServer({
  configFile: new URL("../vite.config.ts", import.meta.url).pathname,
  server: { middlewareMode: true },
  appType: "custom",
  // Only three data modules are loaded, and none of them has a dependency to
  // pre-bundle. Without this the scanner races the close and prints an
  // alarming, harmless stack trace over a run that succeeded.
  optimizeDeps: { noDiscovery: true },
  logLevel: "warn"
});

let bindings;
let acts;
let requirements;
try {
  ({ BINDINGS: bindings } = await server.ssrLoadModule("/src/ui/data/bindings.ts"));
  ({ ACTS: acts } = await server.ssrLoadModule("/src/ui/data/acts.ts"));
  ({ default: requirements } = await server.ssrLoadModule("/src/ui/host-requirements.json"));
} finally {
  await server.close();
}

const cell = (text) => String(text).replace(/\|/g, "\\|").replace(/\n/g, " ");
const list = (items) => (items.length > 0 ? items.map(cell).join("; ") : "—");
/** An ApiName renders with its status, because the status is the point. */
const names = (items) =>
  items.length > 0
    ? items.map((n) => `\`${cell(n.name)}\`${n.status === "proposed" ? " *(proposed)*" : ""}`).join(", ")
    : "—";

const hooks = Object.keys(bindings).sort();
const withGaps = hooks.filter((hook) => bindings[hook].needed.length > 0);
const clean = hooks.filter((hook) => bindings[hook].needed.length === 0);
const proposed = hooks.flatMap((hook) =>
  [...bindings[hook].objectTypes, ...bindings[hook].properties, ...bindings[hook].acts, ...bindings[hook].links]
    .filter((n) => n.status === "proposed")
    .map((n) => ({ hook, name: n.name }))
);

const out = [];
out.push("# Port additions the AI FDE must answer");
out.push("");
out.push(
  "Generated by `npm run port:additions` from the declarations in",
  "`src/ui/data/bindings.ts` and `src/ui/data/acts.ts`. Do not edit this file —",
  "edit the binding next to the fixture it serves and run the script again."
);
out.push("");
out.push(
  "§-numbers are citations, not file paths: §1–§5 are the backend register, §6",
  "the supporting-pages amendment, §7 the project-page amendment. Those",
  "documents govern the front-end build and do not travel with this tree, so",
  "every fact below is restated where it is used."
);
out.push("");
out.push(
  "Where the front end needs something the ontology does not yet support, the",
  "ontology is what changes. A declared gap is a note for the FDE, never a",
  "reason to redesign the screen."
);
out.push("");
out.push(
  `${hooks.length} surfaces declared · ${withGaps.length} with gaps · ${clean.length} answerable today · ` +
    `${Object.keys(acts).length} acts · ${proposed.length} names still to confirm.`
);
out.push("");

out.push("## Read this first: the names that are not measured");
out.push("");
out.push(
  "76 of 79 object types hold zero rows, so a near-miss API name and an empty",
  "object type are the same pixel. Every name below marked *(proposed)* is this",
  "interface's proposal, not a measurement — check each one against the ontology",
  "before wiring it. A wrong name here fails silently and forever."
);
out.push("");
if (proposed.length === 0) {
  out.push("None.");
} else {
  out.push("| surface | name |");
  out.push("| --- | --- |");
  for (const p of proposed) {
    out.push(`| \`${p.hook}\` | \`${cell(p.name)}\` |`);
  }
}
out.push("");

out.push("## What each surface needs");
out.push("");
out.push("| for | verdict | needed |");
out.push("| --- | --- | --- |");
for (const hook of withGaps) {
  const b = bindings[hook];
  out.push(`| \`${hook}\` — ${cell(b.serves)} | ${b.status} | ${list(b.needed)} |`);
}
out.push("");

out.push("## Surfaces the backend can answer today");
out.push("");
if (clean.length === 0) {
  out.push("None.");
} else {
  out.push("| for | verdict | reads |");
  out.push("| --- | --- | --- |");
  for (const hook of clean) {
    const b = bindings[hook];
    out.push(
      `| \`${hook}\` — ${cell(b.serves)} | ${b.status} | ${names([...b.objectTypes, ...b.datasets])} |`
    );
  }
}
out.push("");
out.push(
  '"Answerable" means the shape and the act exist and are exercisable — not that',
  "any row exists. 76 of 79 object types hold zero instances, and the only real",
  "data in the build is the corpus."
);
out.push("");

out.push("## Where the gate is held");
out.push("");
out.push(
  "The regulation reserves six classes of surface to a named holder, and no",
  "platform predicate marks a caller's class — so every reserved surface below",
  "is reserved by the rule and enforced by nothing. The interface withholds the",
  "act and offers the routing; that withholding is not a gate. Wire the refusal",
  "onto the act named here."
);
out.push("");
out.push("| surface | held by today | must be | on |");
out.push("| --- | --- | --- | --- |");
for (const hook of hooks) {
  const a = bindings[hook].authority;
  if (a.mustBe === "none" && a.heldBy === "none") {
    continue;
  }
  out.push(
    `| \`${hook}\` | ${a.heldBy} | ${a.mustBe} | ${a.mustBeOn.map((n) => `\`${n}\``).join(", ") || "—"} |`
  );
}
out.push("");

out.push("## The acts");
out.push("");
out.push(
  "One row per act. `stales` is what must be re-read after it lands; the same",
  "relation appears on each surface as `freshness.invalidatedBy` and is derived",
  "from this one, so the two cannot disagree."
);
out.push("");
out.push("| act | verdict | reserved | actor | stales |");
out.push("| --- | --- | --- | --- | --- |");
for (const key of Object.keys(acts).sort()) {
  const a = acts[key];
  out.push(
    `| \`${key}\` | ${a.status} | ${a.reserved ? "yes" : "no"} | ${a.actor} | ${
      a.onSuccess.invalidates.map((s) => `\`${s}\``).join(", ") || "—"
    } |`
  );
}
out.push("");

out.push("## Bindings in full");
out.push("");
for (const hook of hooks) {
  const b = bindings[hook];
  out.push(`### \`${hook}\``);
  out.push("");
  out.push(`${b.serves}. Verdict: **${b.status}**. Required by ${list(b.requires)}.`);
  out.push("");
  out.push("| | |");
  out.push("| --- | --- |");
  out.push(`| object types | ${names(b.objectTypes)} |`);
  out.push(
    `| properties | ${
      b.properties.length > 0
        ? b.properties
            .map((p) => `\`${cell(p.objectType)}.${cell(p.name)}\`${p.status === "proposed" ? " *(proposed)*" : ""}`)
            .join(", ")
        : "—"
    } |`
  );
  out.push(`| acts | ${names(b.acts)} |`);
  out.push(
    `| datasets | ${b.datasets.length > 0 ? b.datasets.map((d) => `\`signatureReady.${cell(d.name)}\``).join(", ") : "—"} |`
  );
  out.push(
    `| links traversed | ${
      b.links.length > 0
        ? b.links.map((l) => `\`${cell(l.name)}\` (${cell(l.from)} → ${cell(l.to)})`).join(", ")
        : "—"
    } |`
  );
  out.push(
    `| addressed by | ${b.identity.routeParam ? `\`${cell(b.identity.routeParam)}\`` : "no route parameter"}${
      b.identity.displayNumber ? `, shown as ${cell(b.identity.displayNumber)}` : ""
    } |`
  );
  out.push(
    `| query | ${b.query.pageSize === null ? "not a list" : `${b.query.pageSize} per page`}, sort ${
      b.query.sortKey ? `\`${cell(b.query.sortKey)}\` ${b.query.sortDirection}` : "unaddressed"
    }, search ${b.query.search}, counts ${b.query.counts} |`
  );
  out.push(`| freshness | ${b.freshness.afterWrite} |`);
  out.push("");
  for (const [label, text] of [
    ["Identity", b.identity.note],
    ["Query", b.query.note],
    ["Authority", b.authority.note],
    ["Freshness", b.freshness.note]
  ]) {
    out.push(`**${label}.** ${text}`);
    out.push("");
  }
  if (b.links.length > 0) {
    out.push("Traversed rather than scanned:");
    out.push("");
    for (const l of b.links) {
      out.push(`- \`${l.name}\` — ${l.why}`);
    }
    out.push("");
  }
  if (b.needed.length > 0) {
    out.push("Needed:");
    out.push("");
    for (const item of b.needed) {
      out.push(`- ${item}`);
    }
    out.push("");
  }
  if (b.notes.length > 0) {
    out.push("Rendered rather than hidden:");
    out.push("");
    for (const note of b.notes) {
      out.push(`- ${note}`);
    }
    out.push("");
  }
}

await writeFile(ADDITIONS, out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n", "utf8");

/* --- HOST-CONTRACT.md, the human-readable rendering of host-requirements.json --- */

const h = [];
h.push("# Host contract");
h.push("");
h.push(
  "Generated by `npm run port:additions` from `src/ui/host-requirements.json`.",
  "Do not edit this file — edit the JSON and run the script again.",
  "`src/ui/host-contract.test.ts` asserts the same file against the host it is",
  "running in, so an integration that breaks one of these fails in the FDE's",
  "terminal on the first `npm run test` rather than in review."
);
h.push("");
h.push(`${requirements.steps.length} integration steps that cannot be automated · ${Object.keys(requirements.dependencies).length} pinned dependencies · ${requirements.mustNotExist.length} files that must not exist.`);
h.push("");
h.push("## Steps, in order");
h.push("");
for (const [i, step] of requirements.steps.entries()) {
  h.push(`${i + 1}. **${step.title}** — ${step.why}`);
  if (step.how) {
    h.push(`   ${step.how}`);
  }
}
h.push("");
h.push("## Dependencies, at these majors");
h.push("");
h.push("| package | range | why |");
h.push("| --- | --- | --- |");
for (const [name, spec] of Object.entries(requirements.dependencies)) {
  h.push(`| \`${name}\` | \`${spec.range}\` | ${cell(spec.why)} |`);
}
h.push("");
h.push("## Files that must not exist");
h.push("");
for (const f of requirements.mustNotExist) {
  h.push(`- \`${f.path}\` — ${f.why}`);
}
h.push("");
h.push("## The router");
h.push("");
h.push(requirements.router.why);
h.push("");
h.push("```");
h.push(requirements.router.shape);
h.push("```");
h.push("");
h.push("## Required tsconfig and vitest settings");
h.push("");
h.push("| key | value |");
h.push("| --- | --- |");
for (const [k, v] of Object.entries(requirements.tsconfig)) {
  h.push(`| \`tsconfig.compilerOptions.${k}\` | \`${JSON.stringify(v)}\` |`);
}
for (const [k, v] of Object.entries(requirements.vitest)) {
  h.push(`| \`test.${k}\` | \`${JSON.stringify(v)}\` |`);
}
h.push("");

await writeFile(CONTRACT, h.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n", "utf8");

process.stdout.write(
  `PORT-ADDITIONS.generated.md — ${hooks.length} surfaces, ${withGaps.length} with gaps, ${proposed.length} proposed names\n` +
    `HOST-CONTRACT.md — ${requirements.steps.length} steps\n` +
    `CSS contract — ${cssFiles.length} stylesheets checked, clean\n`
);
