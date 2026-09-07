/** Emits `dist-walk/walk.html` — the whole project page as a specification, on
 *  one scrollable page, generated from `pathways.ts` and nothing else.
 *
 *  WHY THIS IS A GENERATOR AND NOT A ROUTE. Three reasons, and each one is a
 *  constraint rather than a preference.
 *
 *  1. It has to be reviewable OUTSIDE the application. `App.tsx` imports seven
 *     @fontsource stylesheets and `theme.css` pulls normalize and Blueprint, so
 *     a build emits a hashed multi-asset `dist/`. A previous review preview was
 *     excluded from this repository for loading fonts from a CDN the platform
 *     CSP refuses. This file is ONE file: styles inlined, system fonts, no
 *     external request of any kind.
 *
 *  2. It must not be reachable from a project URL. It is a build-gap list, and
 *     an officer who opened it would read a statement about the BUILD as a
 *     statement about THEIR PROJECT.
 *
 *  3. It cannot be allowed to drift. Loaded through Vite exactly the way
 *     `port-additions.mjs` does — same TypeScript, same `@` alias, no second
 *     resolver — so what it shows is what the application holds, not a copy of
 *     it that someone has to remember to update.
 *
 *  Every row carries its `rid`. That is the address a review comment resolves
 *  to, the DOM id it links to, and the key a backend eventually joins per-row
 *  state on: one string, computed in one place.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";

const OUT_DIR = new URL("../dist-walk/", import.meta.url);
/** Two files, one generator, so they cannot drift.
 *
 *  `walk.html` is standalone and makes NO external request of any kind — that
 *  is the constraint that made this a generator rather than a route, because a
 *  previous review preview was excluded from this repository for loading fonts
 *  from a CDN the platform CSP refuses.
 *
 *  `walk.artifact.html` is the same page as a fragment for publishing, with the
 *  three faces this application already uses linked from the one font host that
 *  surface admits. Both declare the same fallback stacks, so the standalone
 *  file renders correctly on system faces and neither is a different document
 *  from the other. */
const OUT = new URL("walk.html", OUT_DIR);
const OUT_ARTIFACT = new URL("walk.artifact.html", OUT_DIR);

const server = await createServer({
  configFile: new URL("../vite.config.ts", import.meta.url).pathname,
  server: { middlewareMode: true },
  appType: "custom",
  optimizeDeps: { noDiscovery: true },
  logLevel: "warn"
});

let mod;
let paths;
try {
  mod = await server.ssrLoadModule("/src/ui/data/coverage.ts");
  paths = await server.ssrLoadModule("/src/ui/data/pathways.ts");
} finally {
  await server.close();
}

const c = mod.coverage();
const { LEVELS, LEVEL_IDS, TRANSITIONS, COMPETENCE_CONDITIONS } = paths;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const MODALITY = {
  duty: ["duty", "The rule requires it. Holds the element open."],
  "duty-to-consider": [
    "must consider",
    "The rule requires that it be considered. The conclusion stays a judgement."
  ],
  derived: [
    "derived",
    "No single paragraph states it; a chain of them compels it. Not a choice."
  ],
  permission: [
    "permission",
    "The rule permits it. Never a requirement, never holds the element open."
  ],
  "outbound-request": [
    "outbound",
    "Someone else's act. Recorded and sent; nothing waits on the reply."
  ]
};

const TEXTSTATE = {
  verbatim: ["verbatim", "The row carries the rule's own words."],
  restated: ["restated", "The rule's requirement, restated."],
  placeholder: [
    "not written",
    "The rule's text for this item is not in the build. The label is its own citation ordinal, and no non-specialist can answer it."
  ]
};

/* --- the page ------------------------------------------------------------ */

const byLevelRow = LEVEL_IDS.map(
  (l) =>
    `<tr><td class="lvname">Level ${l}</td><td>${esc(LEVELS[l].name)}</td>` +
    `<td class="q">${esc(LEVELS[l].question)}</td><td class="n">${c.totals.byLevel[l]}</td></tr>`
).join("");

const levelsTable = c.levels
  .map(
    (l) =>
      `<tr><td class="pid">${l.pathway}</td><td>${esc(l.name)}</td><td class="n">${l.steps}</td>` +
      `<td class="n">${l.tabs}</td><td class="n">${l.rows}</td>` +
      `<td class="n${l.placeholders ? " flagn" : ""}">${l.placeholders || "—"}</td>` +
      `<td>${l.levelsCovered.map((x) => `<span class="chip lvl">L${x}</span>`).join(" ")}</td></tr>`
  )
  .join("");

const transitionCards = [...TRANSITIONS, ...COMPETENCE_CONDITIONS]
  .map((t) => {
    const [word, gloss] = MODALITY[t.modality];
    return `<article class="tr m-${esc(t.modality)}" id="${esc(t.id)}">
      <header>
        <span class="tid">${esc(t.id)}</span>
        <h3>${esc(t.label)}</h3>
        <span class="chip mod m-${esc(t.modality)}" title="${esc(gloss)}">${esc(word)}</span>
        <span class="dir">${esc(t.direction)}</span>
      </header>
      <p class="cites">${t.citations.map((x) => `<code>${esc(x)}</code>`).join(" · ")}</p>
      <p class="stmt">${esc(t.statement)}</p>
      <div class="cols">
        <div><h4>What carries</h4><ul>${
          t.carries.map((x) => `<li>${esc(x)}</li>`).join("") || "<li class=none>Nothing</li>"
        }</ul></div>
        <div><h4>What stays behind</h4><ul>${
          t.staysBehind.map((x) => `<li>${esc(x)}</li>`).join("") || "<li class=none>Nothing</li>"
        }</ul></div>
      </div>
      <p class="where">Offered on <code>${esc(t.offeredOn)}</code></p>
      ${t.unresolved ? `<p class="unres"><strong>Unresolved.</strong> ${esc(t.unresolved)}</p>` : ""}
    </article>`;
  })
  .join("");

const rowHtml = (r) => {
  const [mword, mgloss] = MODALITY[r.modality];
  const [tword, tgloss] = TEXTSTATE[r.text];
  return `<tr class="row${r.text === "placeholder" ? " ph" : ""}" id="${esc(r.rid)}">
    <td class="rid"><a href="#${esc(r.rid)}">${esc(r.rid)}</a></td>
    <td class="ref"><code>${esc(r.ref)}</code></td>
    <td class="lbl">${esc(r.label)}
      ${r.restates ? `<span class="echo">echoes <code>${esc(r.restates)}</code></span>` : ""}
      ${
        r.expands
          ? `<span class="exp">one row for ${r.expands.count} items at <code>${esc(
              r.expands.ref
            )}</code> — ${esc(r.expands.why)}</span>`
          : ""
      }
    </td>
    <td class="frm">${esc(r.form)}${
      r.optionsKind ? `<span class="chip o-${esc(r.optionsKind)}">${esc(r.optionsKind)}</span>` : ""
    }</td>
    <td><span class="chip mod m-${esc(r.modality)}" title="${esc(mgloss)}">${esc(mword)}</span></td>
    <td><span class="chip mod t-${esc(r.text)}" title="${esc(tgloss)}">${esc(tword)}</span></td>
    <td><span class="chip lvl">L${r.level}</span></td>
    <td>${r.gated ? '<span class="chip gate">reserved</span>' : ""}</td>
  </tr>`;
};

/* Grouped by the key each tab is addressed by, in rail order, so a reviewer
   walks the page the way an officer walks the application. */
const groups = [];
for (const tab of c.tabs) {
  const last = groups.at(-1);
  if (last && last.key === tab.stepKey) last.tabs.push(tab);
  else groups.push({ key: tab.stepKey, name: tab.stepName, n: tab.stepN, tabs: [tab] });
}

const walkHtml = groups
  .map(
    (g) => `<section class="step">
      <h2><span class="key">${esc(g.key)}</span> ${esc(g.name)}</h2>
      ${g.tabs
        .map(
          (t) => `<div class="tab">
            <h3>
              ${esc(t.tabName)}
              <span class="chip lvl">L${t.level} ${esc(LEVELS[t.level].name)}</span>
              <span class="chip sc">${esc(t.scope)}</span>
              ${t.documentType ? `<span class="chip doc">${esc(t.documentType)}</span>` : ""}
              <span class="tabid"><code>${esc(t.stepKey)}/${esc(t.tabId)}</code></span>
            </h3>
            <p class="tabmeta">${t.rows.length} rows${
              t.placeholders ? ` · <b>${t.placeholders} not written</b>` : ""
            }${t.permissions ? ` · ${t.permissions} permissions` : ""}${
              t.gates ? ` · ${t.gates} reserved` : ""
            }${t.unstatedOptions ? ` · ${t.unstatedOptions} sets unstated` : ""}</p>
            <table class="rows">
              <thead><tr><th>anchor</th><th>citation</th><th>row</th><th>form</th><th>the rule</th><th>text</th><th>level</th><th></th></tr></thead>
              <tbody>${t.rows.map(rowHtml).join("")}</tbody>
            </table>
          </div>`
        )
        .join("")}
    </section>`
  )
  .join("");

const byOwner = {};
for (const f of c.findings) (byOwner[f.owner] ??= []).push(f);
const findingsHtml = Object.entries(byOwner)
  .map(
    ([owner, list]) => `<div class="own">
      <h3>${esc(owner)} <span class="n">${list.length}</span></h3>
      <p class="ownwhy">${esc(
        owner === "regulation"
          ? "The rule's own text for these is not in this repository, and outbound retrieval of the pinned copy is blocked. No amount of front-end work closes one — they need the text."
          : owner === "spec"
            ? "A decision about how this build expands the rule. Answerable here."
            : owner === "sme"
              ? "A question for a domain expert."
              : "A code change."
      )}</p>
      <ul>${list
        .map(
          (f) =>
            `<li><a href="#${esc(f.where)}">${esc(f.where)}</a><span>${esc(f.what)}</span></li>`
        )
        .join("")}</ul>
    </div>`
  )
  .join("");

/* --- the styles --------------------------------------------------------

   Lifted from the application's own theme rather than invented: the same three
   faces, the same oklch ink and paper, the same 3px radius, and — the part that
   matters — the same STATE COLOURS. A modality chip is not decorated by hand.
   It takes the colour of the region the row actually renders in: a permission
   is the link blue, a duty-to-consider is the blocked ochre, a row whose text
   is not in the build is the unresolved red, because that is exactly what the
   screen shows for one. The review surface looks like the thing under review.
   ------------------------------------------------------------------------ */

const STYLE = `
:root{
  --ink:oklch(0.24 0.012 250); --ink-soft:oklch(0.47 0.01 250); --ink-faint:oklch(0.645 0.008 250);
  --paper:oklch(0.982 0.003 85); --well:oklch(0.951 0.004 85); --panel:oklch(1 0 0);
  --rule:oklch(0.855 0.005 250); --rule-soft:oklch(0.915 0.004 250);
  --link:oklch(0.5 0.14 252); --ok:oklch(0.44 0.075 152);
  --blocked:oklch(0.5 0.095 72); --unresolved:oklch(0.5 0.155 25);
  --derived:oklch(0.46 0.14 300);
  --unresolved-wash:oklch(0.965 0.018 25);
  --sans:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --serif:Spectral,Georgia,"Times New Roman",serif;
  --radius:3px;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --ink:oklch(0.93 0.006 250); --ink-soft:oklch(0.72 0.008 250); --ink-faint:oklch(0.56 0.008 250);
  --paper:oklch(0.185 0.008 250); --well:oklch(0.225 0.008 250); --panel:oklch(0.235 0.009 250);
  --rule:oklch(0.34 0.009 250); --rule-soft:oklch(0.285 0.008 250);
  --link:oklch(0.74 0.11 252); --ok:oklch(0.75 0.09 152);
  --blocked:oklch(0.78 0.1 72); --unresolved:oklch(0.72 0.13 25);
  --derived:oklch(0.76 0.12 300);
  --unresolved-wash:oklch(0.26 0.035 25);
}}
:root[data-theme="dark"]{
  --ink:oklch(0.93 0.006 250); --ink-soft:oklch(0.72 0.008 250); --ink-faint:oklch(0.56 0.008 250);
  --paper:oklch(0.185 0.008 250); --well:oklch(0.225 0.008 250); --panel:oklch(0.235 0.009 250);
  --rule:oklch(0.34 0.009 250); --rule-soft:oklch(0.285 0.008 250);
  --link:oklch(0.74 0.11 252); --ok:oklch(0.75 0.09 152);
  --blocked:oklch(0.78 0.1 72); --unresolved:oklch(0.72 0.13 25);
  --derived:oklch(0.76 0.12 300);
  --unresolved-wash:oklch(0.26 0.035 25);
}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);
  font-family:var(--sans);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
a{color:var(--link)}
:focus-visible{outline:2px solid var(--link);outline-offset:2px;border-radius:2px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}

.wrap{max-width:1140px;margin:0 auto;padding:0 24px 96px}

/* The masthead states the thesis. No hero: this is a document to work
   through, and a viewport-tall opener would push the work off the first
   frame. */
.mast{padding:56px 0 8px;border-bottom:1px solid var(--ink)}
h1{font-family:var(--serif);font-weight:600;font-size:38px;line-height:1.08;
  letter-spacing:-0.015em;margin:0 0 10px;text-wrap:balance}
.stand{font-family:var(--serif);font-size:17px;line-height:1.5;color:var(--ink-soft);
  max-width:62ch;margin:0 0 22px}
.stand code{font-size:0.92em}

nav.jump{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;gap:18px;
  padding:10px 0;margin-bottom:28px;background:var(--paper);
  border-bottom:1px solid var(--rule);font-size:11.5px;letter-spacing:0.07em;
  text-transform:uppercase;font-weight:500}
nav.jump a{color:var(--ink-soft);text-decoration:none}
nav.jump a:hover{color:var(--ink)}

h2{font-family:var(--serif);font-weight:600;font-size:24px;letter-spacing:-0.01em;
  margin:52px 0 6px;padding-bottom:6px;border-bottom:1px solid var(--ink);text-wrap:balance}
h2:first-of-type{margin-top:36px}
.note{color:var(--ink-soft);max-width:66ch;margin:0 0 18px;font-size:13.5px}

/* The two claims a reader must not miss, set as pull quotes in the
   regulation's own voice rather than as another bordered card. */
.claims{display:grid;gap:20px;margin:24px 0 30px;
  grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.claim{border-left:3px solid var(--ink);padding-left:16px}
.claim h3{font-family:var(--sans);font-size:11px;letter-spacing:0.09em;
  text-transform:uppercase;color:var(--ink-soft);margin:0 0 6px;font-weight:600}
.claim p{font-family:var(--serif);font-size:15.5px;line-height:1.52;margin:0;max-width:52ch}
.claim.warn{border-left-color:var(--unresolved)}

/* Big numbers, because the reader's question IS a count: are the tabs built
   out, and how much is missing. */
.tiles{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule);
  grid-template-columns:repeat(auto-fit,minmax(132px,1fr));margin:0 0 8px}
.tile{background:var(--panel);padding:14px 16px 12px}
.tile b{display:block;font-family:var(--mono);font-size:27px;line-height:1;
  font-variant-numeric:tabular-nums;font-weight:500}
.tile span{display:block;margin-top:6px;font-size:10.5px;letter-spacing:0.07em;
  text-transform:uppercase;color:var(--ink-soft)}
.tile.flag b{color:var(--unresolved)}

.scroll{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:13px}
th{text-align:left;font-weight:600;font-size:10.5px;text-transform:uppercase;
  letter-spacing:0.07em;color:var(--ink-soft);padding:6px 10px 6px 0;
  border-bottom:1px solid var(--rule);white-space:nowrap}
td{padding:7px 10px 7px 0;border-bottom:1px solid var(--rule-soft);vertical-align:top}
td:last-child,th:last-child{padding-right:0}
.n{text-align:right;font-family:var(--mono);font-variant-numeric:tabular-nums;
  white-space:nowrap;font-size:12px}
.flagn{color:var(--unresolved)}
.q{color:var(--ink-soft);font-size:12.5px}
.lvname{font-family:var(--mono);font-size:12px;white-space:nowrap}
.pid{font-family:var(--mono);font-weight:500;white-space:nowrap}

/* Chips carry the row's own state, and they say the same thing the screen
   says: the rule's force, and where the words came from. */
.chip{display:inline-block;font-size:10.5px;line-height:1.6;padding:0 5px;
  border:1px solid currentColor;border-radius:var(--radius);white-space:nowrap;
  letter-spacing:0.02em;vertical-align:baseline}
.mod{cursor:help}
.m-duty{color:var(--ink-faint)}
.m-duty-to-consider{color:var(--blocked)}
.m-derived{color:var(--derived);font-weight:600}
.m-permission{color:var(--link)}
.m-outbound-request{color:var(--ink-faint);border-style:dashed}
.t-verbatim{color:var(--ok)}
.t-restated{color:var(--ink-faint);border-color:var(--rule)}
.t-placeholder{color:var(--unresolved);font-weight:600}
.o-unstated{color:var(--unresolved)}
.o-open{color:var(--ok)}
.o-closed,.o-catalogue,.o-register{color:var(--ink-faint);border-color:var(--rule)}
.lvl{color:var(--ink-faint);border-color:var(--rule);font-family:var(--mono)}
.sc,.doc{color:var(--ink-faint);border-color:var(--rule)}
.doc{font-family:var(--mono);font-weight:500;color:var(--ink-soft)}
.gate{color:var(--unresolved);font-weight:600}

/* Transition cards. The rail on the left is the modality, so a reader learns
   the four forces by colour before reading a word of any of them. */
.tr{border:1px solid var(--rule);border-left:4px solid var(--ink-faint);
  border-radius:var(--radius);background:var(--panel);padding:16px 20px;margin:14px 0}
.tr.m-duty-to-consider{border-left-color:var(--blocked)}
.tr.m-derived{border-left-color:var(--derived)}
.tr.m-permission{border-left-color:var(--link)}
.tr.m-outbound-request{border-left-color:var(--ink-faint)}
.tr header{display:flex;flex-wrap:wrap;gap:10px;align-items:baseline}
.tr h3{font-family:var(--sans);font-size:15.5px;font-weight:600;margin:0;flex:1 1 22rem}
.tid{font-family:var(--mono);font-weight:600;font-size:13px;color:var(--ink-soft)}
.dir{font-size:11px;color:var(--ink-faint);font-family:var(--mono)}
.cites{margin:8px 0 0;font-size:12px;color:var(--ink-soft)}
.cites code{font-family:var(--mono)}
.stmt{font-family:var(--serif);font-size:14.5px;line-height:1.55;
  margin:10px 0 14px;max-width:70ch}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px}
.cols h4{font-size:10.5px;text-transform:uppercase;letter-spacing:0.08em;
  color:var(--ink-soft);margin:0 0 4px;font-weight:600}
.cols ul{margin:0;padding-left:16px;font-size:12.5px;color:var(--ink-soft)}
.cols li{margin:3px 0}
li.none{list-style:none;margin-left:-16px}
.where{font-size:11.5px;color:var(--ink-faint);margin:14px 0 0;font-family:var(--mono)}
.unres{margin:12px 0 0;padding:10px 14px;background:var(--unresolved-wash);
  border-left:3px solid var(--unresolved);font-size:13px;line-height:1.5;max-width:74ch}
.unres b{font-weight:600}

/* Findings, grouped by who can actually close one. */
.own{border-top:1px solid var(--rule);padding:16px 0 4px}
.own h3{font-family:var(--sans);font-size:14px;margin:0;font-weight:600;
  display:flex;align-items:baseline;gap:10px}
.own h3 .n{color:var(--ink-soft);font-weight:400;font-size:13px}
.ownwhy{font-size:12.5px;color:var(--ink-soft);margin:5px 0 10px;max-width:72ch}
.own ul{margin:0;padding-left:0;list-style:none;font-size:12.5px}
.own li{margin:4px 0;padding-left:0;display:flex;gap:10px;align-items:baseline}
.own li a{font-family:var(--mono);font-size:11px;white-space:nowrap;flex:0 0 auto;
  text-decoration:none;min-width:16rem}
.own li a:hover{text-decoration:underline}
.own li span{color:var(--ink-soft)}

/* The walk. Steps are the spine, tabs the parts of each. */
.step{margin-top:38px}
.step h2{display:flex;align-items:baseline;gap:12px;margin-bottom:10px}
.step h2 .key{font-family:var(--mono);font-size:12px;font-weight:400;
  color:var(--ink-soft);letter-spacing:0}
.tab{border:1px solid var(--rule);border-radius:var(--radius);
  background:var(--panel);padding:14px 18px 16px;margin:12px 0}
.tab h3{font-family:var(--sans);font-size:14.5px;font-weight:600;margin:0 0 3px;
  display:flex;flex-wrap:wrap;gap:8px;align-items:baseline}
.tabid{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--ink-faint)}
.tabmeta{font-size:11.5px;color:var(--ink-soft);margin:0 0 10px}
.tabmeta b{color:var(--unresolved);font-weight:600}
.rid{font-family:var(--mono);font-size:10.5px;white-space:nowrap}
.rid a{color:var(--ink-faint);text-decoration:none}
.rid a:hover{color:var(--link);text-decoration:underline}
.ref{font-family:var(--mono);font-size:11.5px;white-space:nowrap;color:var(--ink-soft)}
.lbl{max-width:36rem}
.echo,.exp{display:block;font-size:11px;color:var(--ink-faint);margin-top:3px;line-height:1.45}
.echo code,.exp code{font-family:var(--mono)}
.frm{font-size:11px;color:var(--ink-faint);white-space:nowrap;font-family:var(--mono)}
.frm .chip{margin-left:5px}
tr.ph{background:var(--unresolved-wash)}
:target{outline:2px solid var(--link);outline-offset:3px}

/* The one place the sticky nav must not hide an anchor it just jumped to. */
tr[id],article[id]{scroll-margin-top:56px}
`;

/* --- the document ------------------------------------------------------- */

const TITLE = "The Project Page, Walked";

const BODY = `<div class="wrap">

<header class="mast">
  <h1>The project page, walked</h1>
  <p class="stand">Every level of NEPA review, every step, every tab, every row —
  generated from <code>src/ui/data/pathways.ts</code>, so it cannot drift from what the
  application holds. Each row carries its anchor. Quote one in a comment and it lands on
  exactly that row.</p>
</header>

<nav class="jump" aria-label="Sections">
  <a href="#levels">Levels</a>
  <a href="#review">Levels of review</a>
  <a href="#moves">How a proposal moves</a>
  <a href="#gaps">What is not finished</a>
  <a href="#walk">The walk</a>
</nav>

<div class="claims">
  <div class="claim">
    <h3>There is no ladder</h3>
    <p>P0&ndash;P4 are the five mutually exclusive outcomes of <em>one</em> ordered elimination
    at 1b.2(f)(2). A finding of no significant impact after an assessment &mdash; 1b.6(a) &mdash;
    and a record of decision after a statement &mdash; 1b.8(a) &mdash; are ordering <em>within</em>
    a level, and either may be one physical document with its predecessor.</p>
  </div>
  <div class="claim warn">
    <h3>Nothing here was checked against the rule itself</h3>
    <p>The pinned copy of 7 CFR part&nbsp;1b lives in another repository and outbound retrieval
    is blocked. Every row marked <span class="chip t-placeholder">not written</span> is a place
    where the rule&rsquo;s own words are missing, and no amount of work on this side closes one.</p>
  </div>
</div>

<div class="tiles">
  <div class="tile"><b>${c.totals.distinctTabs}</b><span>tabs</span></div>
  <div class="tile"><b>${c.totals.distinctRows}</b><span>rows</span></div>
  <div class="tile${c.totals.placeholders ? " flag" : ""}"><b>${c.totals.placeholders}</b><span>not written</span></div>
  <div class="tile${c.totals.unstatedOptions ? " flag" : ""}"><b>${c.totals.unstatedOptions}</b><span>sets unstated</span></div>
  <div class="tile"><b>${c.totals.permissions}</b><span>permissions</span></div>
  <div class="tile"><b>${c.totals.gates}</b><span>reserved signatures</span></div>
</div>

<h2 id="levels">The Levels framework</h2>
<p class="note">A different scale entirely from a <em>level of NEPA review</em>, and the
collision is the design: this is a <strong>Level&nbsp;2</strong> instrument whose job is to
drive a non-specialist to the correct level of review. Lower levels enable higher ones, and a
level is never forced.</p>
<div class="scroll"><table>
<thead><tr><th></th><th>name</th><th>the question it answers</th><th class="n">rows</th></tr></thead>
<tbody>${byLevelRow}</tbody></table></div>

<h2 id="review">The five levels of review</h2>
<p class="note">Every level carries the three shared steps &mdash; intake, the threshold
determination, and the level of review itself &mdash; and then its own.</p>
<div class="scroll"><table>
<thead><tr><th></th><th>name</th><th class="n">steps</th><th class="n">tabs</th><th class="n">rows</th><th class="n">not written</th><th>levels carried</th></tr></thead>
<tbody>${levelsTable}</tbody></table></div>

<h2 id="moves">How a proposal moves between levels</h2>
<p class="note">Four of them, and their modalities differ &mdash; which is the whole point,
because reading a duty as a permission is the dangerous direction. The rail on each card is
the modality. There is no de-escalation: <code>direction</code> has no <code>lower</code>
member, so one is unauthorable rather than merely unrecommended. That is the rule&rsquo;s
silence, not its prohibition.</p>
${transitionCards}

<h2 id="gaps">What is not finished, and who owns it</h2>
${findingsHtml}

<h2 id="walk">The walk</h2>
<p class="note">In rail order, the way an officer walks the application. <code>S.n</code> is a
shared step, <code>E&lt;level&gt;.&lt;pathway&gt;.&lt;step&gt;</code> a step of one level of
review, <code>x</code> the tabs reachable from every step.</p>
${walkHtml}

</div>`;

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?' +
  "family=IBM+Plex+Mono:wght@400;500;600&" +
  "family=IBM+Plex+Sans:wght@400;500;600&" +
  "family=Spectral:ital,wght@0,400;0,600;1,400&display=swap\">";

const standalone = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLE}</title>
<style>${STYLE}</style>
</head><body>${BODY}</body></html>`;

/* The publishable fragment: no doctype, html, head or body of its own — the
   artifact surface supplies those — and the three faces linked from the one
   font host that surface admits. Same style block, same body, same fallback
   stacks, so it is not a different document. */
const fragment = `${FONTS}
<title>${TITLE}</title>
<style>${STYLE}</style>
${BODY}`;

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT, standalone);
await writeFile(OUT_ARTIFACT, fragment);

/* The standalone file's whole reason for existing is that it asks for nothing.
   Assert it rather than trust it: a font link or an image that crept in would
   fail silently under the platform CSP, which is exactly how the last preview
   was lost. */
const external = standalone.match(/https?:\/\/[^"'\s)]+/g) ?? [];
if (external.length > 0) {
  process.stderr.write(
    "walk.html must make no external request, and asks for:\n" +
      external.map((u) => "  - " + u).join("\n") +
      "\n"
  );
  process.exit(1);
}

process.stdout.write(
  `walk.html — ${c.totals.distinctTabs} tabs, ${c.totals.distinctRows} rows, ` +
    `${c.findings.length} findings, ${Math.round(standalone.length / 1024)} KB, ` +
    "no external requests\n" +
    `walk.artifact.html — the same page as a fragment, ${Math.round(fragment.length / 1024)} KB\n`
);
