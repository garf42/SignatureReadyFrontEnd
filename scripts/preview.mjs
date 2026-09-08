/** Builds the review harness and folds it into ONE publishable file.
 *
 *  `npm run preview:artifact` → `dist-walk/preview.artifact.html`
 *
 *  This is the running application — the real `App`, the real screens, the real
 *  fixture port — not a picture of it and not a second implementation. What the
 *  harness adds is a bar of controls for the URL knobs the build already has,
 *  because a published page has no address bar a reviewer can type `?levels=`
 *  into.
 *
 *  Why one file. The publishing surface admits external SCRIPTS from a short
 *  list of CDNs and external STYLESHEETS from Google Fonts alone — nothing
 *  else, with no visible error when something is refused. So every byte of CSS
 *  and JS is inlined here, and the only outbound request the page makes is for
 *  the three faces this tree already uses. That is asserted below rather than
 *  assumed: a stylesheet or an image that crept in would fail silently, which
 *  is exactly how the previous preview was lost.
 */
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { build } from "vite";

const ROOT = new URL("../", import.meta.url);
const OUT_DIR = new URL("dist-walk/preview/", ROOT);
const OUT = new URL("dist-walk/preview.artifact.html", ROOT);

await build({ configFile: new URL("preview/vite.config.ts", import.meta.url).pathname });

const files = await readdir(new URL("assets/", OUT_DIR));
const cssFile = files.find((f) => f.endsWith(".css"));
const jsFiles = files.filter((f) => f.endsWith(".js"));
const other = files.filter((f) => !f.endsWith(".css") && !f.endsWith(".js"));

if (!cssFile || jsFiles.length !== 1) {
  throw new Error(
    `expected one stylesheet and one script, got ${String(files.length)}: ${files.join(", ")}`
  );
}
if (other.length > 0) {
  /* An emitted asset is a file the page would have to fetch, and the surface
     refuses every fetch but a font. Inline it or drop it — never ship a page
     that asks for something it cannot have. */
  throw new Error(`assets that would need fetching: ${other.join(", ")}`);
}

const css = await readFile(new URL(`assets/${cssFile}`, OUT_DIR), "utf8");
const js = await readFile(new URL(`assets/${jsFiles[0]}`, OUT_DIR), "utf8");

/* The three faces this tree already declares, from the one font host the
   surface admits. `theme.css` declares the fallback stacks either way, so a
   refused font degrades to system faces rather than to nothing. */
const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?' +
  "family=IBM+Plex+Mono:wght@400;500&" +
  "family=IBM+Plex+Sans:wght@400;500;600&" +
  "family=Spectral:wght@400;500&display=swap\">";

/* No doctype, html, head or body: the publishing surface supplies those. The
   script is a module because the build emits one, and it is placed after the
   mount node so it finds #root without waiting on an event. */
const page = `${FONTS}
<title>SignatureReady Project Page</title>
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>`;

/* Everything the page asks for, verified rather than trusted. Data URIs are
   part of the file; an http(s) URL is a request, and only the two font hosts
   may appear. */
const requests = [...new Set(page.match(/https?:\/\/[^"'\s)]+/g) ?? [])].filter(
  (u) => !u.startsWith("https://fonts.googleapis.com") && !u.startsWith("https://fonts.gstatic.com")
);
/* A URL inside a comment or a source-map hint is not a request. Keep only the
   ones that sit where a browser would actually fetch them. */
const fetched = requests.filter((u) =>
  new RegExp(`(src|href|url\\()\\s*=?\\s*["'(]?${u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(page)
);
if (fetched.length > 0) {
  process.stderr.write(
    "the page would fetch, and the surface refuses:\n" +
      fetched.map((u) => "  - " + u).join("\n") +
      "\n"
  );
  process.exit(1);
}

await writeFile(OUT, page);
await rm(OUT_DIR, { recursive: true, force: true });

const kb = (n) => `${String(Math.round(n / 1024))} KB`;
process.stdout.write(
  `preview.artifact.html — the running application in one file\n` +
    `  ${kb(css.length)} styles · ${kb(js.length)} script · ${kb(page.length)} total\n` +
    `  requests: the three faces from Google Fonts, and nothing else\n`
);
