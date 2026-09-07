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
const OUT = new URL("walk.html", OUT_DIR);

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
    `<tr><td class="lv lv${l}">Level ${l}</td><td>${esc(LEVELS[l].name)}</td>` +
    `<td class="q">${esc(LEVELS[l].question)}</td><td class="n">${c.totals.byLevel[l]}</td></tr>`
).join("");

const levelsTable = c.levels
  .map(
    (l) =>
      `<tr><td class="p">${l.pathway}</td><td>${esc(l.name)}</td><td class="n">${l.steps}</td>` +
      `<td class="n">${l.tabs}</td><td class="n">${l.rows}</td>` +
      `<td class="n${l.placeholders ? " bad" : ""}">${l.placeholders || "—"}</td>` +
      `<td>${l.levelsCovered.map((x) => `<span class="chip lv${x}">L${x}</span>`).join(" ")}</td></tr>`
  )
  .join("");

const transitionCards = [...TRANSITIONS, ...COMPETENCE_CONDITIONS]
  .map((t) => {
    const [word, gloss] = MODALITY[t.modality];
    return `<article class="tr" id="${esc(t.id)}">
      <header>
        <span class="tid">${esc(t.id)}</span>
        <h3>${esc(t.label)}</h3>
        <span class="mod m-${esc(t.modality)}" title="${esc(gloss)}">${esc(word)}</span>
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
      r.optionsKind ? `<span class="opt o-${esc(r.optionsKind)}">${esc(r.optionsKind)}</span>` : ""
    }</td>
    <td><span class="mod m-${esc(r.modality)}" title="${esc(mgloss)}">${esc(mword)}</span></td>
    <td><span class="txt t-${esc(r.text)}" title="${esc(tgloss)}">${esc(tword)}</span></td>
    <td class="lvc"><span class="chip lv${r.level}">L${r.level}</span></td>
    <td class="gt">${r.gated ? "<span class=gate>reserved</span>" : ""}</td>
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
              <span class="chip lv${t.level}">L${t.level} ${esc(LEVELS[t.level].name)}</span>
              <span class="chip sc">${esc(t.scope)}</span>
              ${t.documentType ? `<span class="chip doc">${esc(t.documentType)}</span>` : ""}
              <span class="tabid"><code>${esc(t.stepKey)}/${esc(t.tabId)}</code></span>
            </h3>
            <p class="tabmeta">${t.rows.length} rows${
              t.placeholders ? ` · <b class=bad>${t.placeholders} not written</b>` : ""
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
        .map((f) => `<li><a href="#${esc(f.where)}"><code>${esc(f.where)}</code></a> ${esc(f.what)}</li>`)
        .join("")}</ul>
    </div>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SignatureReady — the project page, walked</title>
<style>
:root{color-scheme:light dark;
 --bg:#fbfaf8;--panel:#fff;--ink:#1a1a1c;--soft:#5c5f66;--rule:#dedad4;
 --bad:#8a2b1f;--badbg:#fdf1ef;--ok:#2c5f3a;
 --l0:#6b5b95;--l1:#2f6f8f;--l2:#1a1a1c;--l3:#8a6a1f;--l4:#2c5f3a;}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){
 --bg:#141416;--panel:#1c1c1f;--ink:#e9e7e3;--soft:#9a9ca3;--rule:#33343a;
 --bad:#e08b7d;--badbg:#2a1c19;--ok:#8fc9a3;
 --l0:#b3a4d8;--l1:#8ec4de;--l2:#e9e7e3;--l3:#d9b96a;--l4:#8fc9a3;}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
 font:15px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}
code,.rid,.key,.tabid{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.wrap{max-width:1180px;margin:0 auto;padding:2.5rem 1.25rem 6rem}
h1{font-size:1.9rem;line-height:1.15;margin:0 0 .4rem;letter-spacing:-.01em}
.sub{color:var(--soft);margin:0 0 2rem;max-width:62ch}
h2{font-size:1.05rem;margin:2.4rem 0 .6rem;padding-bottom:.35rem;border-bottom:2px solid var(--ink)}
h3{font-size:.95rem;margin:1.4rem 0 .3rem;font-weight:600}
h4{font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;color:var(--soft);margin:0 0 .3rem}
.lead{background:var(--panel);border:1px solid var(--rule);border-radius:6px;padding:1.1rem 1.25rem;margin:0 0 2rem}
.lead p{margin:.5rem 0}
.lead p:first-child{margin-top:0}
.lead p:last-child{margin-bottom:0}
table{border-collapse:collapse;width:100%;font-size:.82rem}
th{text-align:left;font-weight:600;font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;
 color:var(--soft);border-bottom:1px solid var(--rule);padding:.35rem .5rem}
td{padding:.4rem .5rem;border-bottom:1px solid var(--rule);vertical-align:top}
.n{text-align:right;font-variant-numeric:tabular-nums}
.bad{color:var(--bad)}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem;margin:0 0 1.5rem}
.card{background:var(--panel);border:1px solid var(--rule);border-radius:6px;padding:.7rem .85rem}
.card b{display:block;font-size:1.6rem;line-height:1.1;font-variant-numeric:tabular-nums}
.card span{font-size:.72rem;color:var(--soft);text-transform:uppercase;letter-spacing:.05em}
.chip{display:inline-block;font-size:.66rem;padding:.08rem .38rem;border-radius:3px;
 border:1px solid currentColor;letter-spacing:.03em;vertical-align:middle;white-space:nowrap}
.lv0{color:var(--l0)}.lv1{color:var(--l1)}.lv2{color:var(--l2)}.lv3{color:var(--l3)}.lv4{color:var(--l4)}
.chip.sc,.chip.doc{color:var(--soft)}
.chip.doc{border-style:dashed}
.step{margin-top:2.2rem}
.step h2 .key{color:var(--soft);font-size:.78rem;font-weight:400;margin-right:.5rem}
.tab{background:var(--panel);border:1px solid var(--rule);border-radius:6px;
 padding:.85rem 1rem 1rem;margin:.9rem 0}
.tab h3{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;margin-top:0}
.tabid{margin-left:auto;font-size:.7rem;color:var(--soft)}
.tabmeta{margin:.15rem 0 .6rem;font-size:.76rem;color:var(--soft)}
.rid a{color:var(--soft);text-decoration:none;font-size:.68rem;white-space:nowrap}
.rid a:hover{color:var(--ink);text-decoration:underline}
.ref code{font-size:.72rem;white-space:nowrap}
.lbl{max-width:34rem}
.echo,.exp{display:block;font-size:.7rem;color:var(--soft);margin-top:.15rem}
.frm{font-size:.72rem;color:var(--soft);white-space:nowrap}
.opt{display:inline-block;margin-left:.3rem;font-size:.64rem;padding:0 .25rem;
 border:1px solid var(--rule);border-radius:2px}
.o-unstated{color:var(--bad);border-color:currentColor}
.o-open{color:var(--l1);border-color:currentColor}
.mod,.txt{display:inline-block;font-size:.68rem;padding:.05rem .3rem;border-radius:3px;
 border:1px solid var(--rule);white-space:nowrap;cursor:help}
.m-permission{color:var(--l1);border-color:currentColor}
.m-derived{color:var(--l0);border-color:currentColor;font-weight:600}
.m-duty-to-consider{color:var(--l3);border-color:currentColor}
.m-outbound-request{color:var(--soft)}
.t-placeholder{color:var(--bad);border-color:currentColor;background:var(--badbg)}
.t-verbatim{color:var(--ok);border-color:currentColor}
tr.ph{background:var(--badbg)}
.gate{font-size:.66rem;color:var(--bad);border:1px solid currentColor;border-radius:3px;padding:.05rem .3rem}
.tr{background:var(--panel);border:1px solid var(--rule);border-radius:6px;padding:.9rem 1.1rem;margin:.8rem 0}
.tr header{display:flex;flex-wrap:wrap;gap:.5rem;align-items:baseline}
.tr h3{margin:0;flex:1 1 20rem}
.tid{font-family:ui-monospace,monospace;font-weight:700;color:var(--soft)}
.dir{font-size:.68rem;color:var(--soft)}
.cites{margin:.35rem 0;font-size:.75rem}
.stmt{margin:.4rem 0 .7rem;font-size:.85rem;max-width:70ch}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:1rem}
.cols ul{margin:0;padding-left:1.1rem;font-size:.78rem}
.cols li{margin:.15rem 0}
li.none{list-style:none;margin-left:-1.1rem;color:var(--soft)}
.where{font-size:.72rem;color:var(--soft);margin:.6rem 0 0}
.unres{margin:.6rem 0 0;padding:.5rem .7rem;background:var(--badbg);border-left:3px solid var(--bad);
 font-size:.79rem;border-radius:0 3px 3px 0}
.own{background:var(--panel);border:1px solid var(--rule);border-radius:6px;padding:.85rem 1.1rem;margin:.8rem 0}
.own h3{margin-top:0}
.own h3 .n{color:var(--soft);font-weight:400}
.ownwhy{font-size:.79rem;color:var(--soft);margin:.2rem 0 .6rem;max-width:70ch}
.own ul{margin:0;padding-left:1.1rem;font-size:.78rem}
.own li{margin:.2rem 0}
.own a{color:inherit}
.q{color:var(--soft);font-size:.78rem}
.p{font-weight:600}
:target{outline:2px solid var(--l1);outline-offset:2px;border-radius:3px}
</style></head><body><div class="wrap">

<h1>The project page, walked</h1>
<p class="sub">Every level of review, every step, every tab, every row — generated from
<code>src/ui/data/pathways.ts</code>, so it cannot drift from what the application holds.
Each row carries its anchor. Quote one when you leave a comment and it resolves to exactly that row.</p>

<div class="lead">
<p><strong>Part 1b contains no cross-pathway dependency.</strong> P0&ndash;P4 are the five mutually
exclusive outcomes of one ordered elimination at 1b.2(f)(2), not a ladder. A finding of no
significant impact after an assessment (1b.6(a)) and a record of decision after a statement
(1b.8(a)) are ordering <em>within</em> a level — and either may be one physical document with its
predecessor. Four transitions move a proposal between levels, and their modalities differ.</p>
<p><strong>Nothing here was checked against 7 CFR part 1b itself.</strong> The pinned text lives in
another repository and outbound retrieval is blocked. Every row marked <span class="txt t-placeholder">not
written</span> is a place where the rule's own words are missing, and no amount of work on this side
closes one.</p>
</div>

<div class="summary">
  <div class="card"><b>${c.totals.distinctTabs}</b><span>tabs</span></div>
  <div class="card"><b>${c.totals.distinctRows}</b><span>rows</span></div>
  <div class="card"><b class="${c.totals.placeholders ? "bad" : ""}">${c.totals.placeholders}</b><span>not written</span></div>
  <div class="card"><b>${c.totals.permissions}</b><span>permissions</span></div>
  <div class="card"><b>${c.totals.gates}</b><span>reserved signatures</span></div>
  <div class="card"><b class="${c.totals.unstatedOptions ? "bad" : ""}">${c.totals.unstatedOptions}</b><span>sets unstated</span></div>
</div>

<h2>The Levels framework</h2>
<p class="sub" style="margin-bottom:.8rem">Lower levels enable higher ones and a level is never
forced. This application's own job is <strong>Level 2</strong>: decision guidance driving a
non-specialist to the correct <em>level of NEPA review</em>. The collision of the two senses of
&ldquo;level&rdquo; is the design.</p>
<div class="scroll"><table>
<thead><tr><th></th><th>name</th><th>the question it answers</th><th>rows</th></tr></thead>
<tbody>${byLevelRow}</tbody></table></div>

<h2>The five levels of review</h2>
<div class="scroll"><table>
<thead><tr><th></th><th>name</th><th>steps</th><th>tabs</th><th>rows</th><th>not written</th><th>levels carried</th></tr></thead>
<tbody>${levelsTable}</tbody></table></div>

<h2>How a proposal moves between levels</h2>
${transitionCards}

<h2>What is not finished, and who owns it</h2>
${findingsHtml}

<h2>The walk</h2>
${walkHtml}

</div></body></html>`;

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT, html);
process.stdout.write(
  `walk.html — ${c.totals.distinctTabs} tabs, ${c.totals.distinctRows} rows, ` +
    `${c.findings.length} findings, ${Math.round(html.length / 1024)} KB, no external requests\n`
);
