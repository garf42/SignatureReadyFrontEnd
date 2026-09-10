# The review kit — plan

A click-to-comment layer for reviewing the SignatureReady UI as deployed, and a
convention library the AI FDE is held to. Nothing here ships inside the
application.

Every claim below marked **measured** was tested against this repository. Claims
marked **unverified** need five minutes on your laptop and are listed together
at the end, so nothing rests quietly on an assumption.

---

## 1. Where it lives

**A plain folder on your machine. Not in the Foundry repo, not in any repo.**

```
~/SignatureReadyReview/
  review.html            open it once, drag the button to your bookmarks bar
  conventions.md         the convention library — the master copy, yours
  pins/
    review-2026-09-10.md exported comments, one file per session
  ledger/
    resolved.jsonl       what the agent reports back
```

You hand the FDE two files: **a pin file** and **conventions.md**. It already
has the codebase, and — this is the part that makes the whole design work — it
can resolve every anchor from the codebase alone. Nothing has to be installed
into the app for that to happen.

Two small scripts do end up in the app repository, and only these two:

| file | why it cannot live in your folder |
| --- | --- |
| `scripts/conventions.mjs` | the audit reads the built stylesheet, so it runs where the build runs |
| `scripts/review/resolve.mjs` | turns a pin into a file and line, and needs the checkout |

Both sit outside `src/ui/`, so the packet property this build has enforced from
the start — *the move into a host repo is one directory rename with nothing
trailing behind it* — is untouched.

---

## 2. The anchor, and why it needs no instrumentation

This is the finding the design turns on, and it replaces the React-fiber plan in
`REVIEW-LOOP.md`, which would have died in production.

Vite names production CSS-module classes `_<local>_<hash>_<line>`. **Measured:**
the generator is `node_modules/vite/dist/node/chunks/build2.js:5431` and has no
production branch. So an element in the deployed Foundry app carries, in its own
`class` attribute, the name of its style rule *and the line it is declared on*:

```
_bandChevron_1i545_330   →   .bandChevron  at  ProjectScreen.module.css:330
```

Verified exactly: line 330 of that file is `.bandChevron {`.

The hash is `djb2-xor` over the file's own text, so the agent recomputes it from
the checkout in six lines — no map is shipped, and nothing can go stale:

```js
const h = s => { let x = 5381, i = s.length; while (i) x = x * 33 ^ s.charCodeAt(--i); return (x >>> 0).toString(36).slice(0, 5) }
```

**Measured against a real build:** 264 of 264 scoped classes resolve. Of the 251
that can reach a DOM element, 100% resolve to a stylesheet file and line, 95%
to exactly one `.tsx`, and 94% to a unique component name. Over 760 elements
across six routes, **no element lacked a module class somewhere on its ancestor
chain** — 61% carry one directly, the rest within four ancestors.

So: a production build, no debug info, no source maps, no instrumentation, and
every click still lands on a file and a line.

### What the anchor cannot do

Two ceilings, both real, both stated in the export rather than hidden:

- **39% of clicks name the container, not the element.** The pin says
  `rung: ancestor(depth 2)` when that happens, so the agent knows how much to
  trust it.
- **An anchor has a half-life of one CSS commit.** Editing `ProjectScreen.module.css`
  re-keys every class in it. Handled by recording the bundle filename at capture
  and refusing a confident anchor when the checkout no longer matches — a named
  degraded answer instead of a silent wrong one.

If those ceilings turn out to bite, the fix is a ~30-line Babel plugin stamping
`data-a="file:line:col"` on JSX elements. **Do not build it yet** — start where
the measurement says you can, and reopen it when you notice the FDE fumbling.

---

## 3. The overlay

A bookmarklet. One drag into the bookmarks bar, once. Click it on any page of
the app and the layer arms; click it again and it disarms.

Why a bookmarklet rather than an extension: no install policy to negotiate, no
store, no unpacked-extension ritual, and it works on the real deployed app.
**Measured:** the app is a top-level document on its own origin
(`signatureready.ontologize.palantirfoundry.com`), not an iframe, and it ships
zero inline scripts and zero inline styles — so the platform CSP can be as tight
as `script-src 'self'; style-src 'self'` and the app still runs. The overlay is
built to survive exactly that:

- **Styling through CSSOM only** — `new CSSStyleSheet()` + `replaceSync()` +
  `adoptedStyleSheets`, plus `el.style.setProperty()`. Neither has a CSP hook, so
  neither can be refused by any policy that still lets the app run. A `<style>`
  element or a `style=` attribute would be refused; do not use them as fallbacks.
- **`host.style.setProperty('all', 'initial')` on the shadow host.** A shadow
  root blocks selectors, not inheritance — font, colour and line-height cross the
  boundary. An overlay whose job is reporting typography must not inherit the
  typography it is measuring.
- **No string-to-markup anywhere.** No `innerHTML`, `insertAdjacentHTML`,
  `document.write`, `eval` or `new Function`. If the platform default carries
  `require-trusted-types-for 'script'`, `innerHTML` dies silently. The builder
  greps its own minified output for those tokens and fails rather than shipping
  a bookmarklet that breaks on your first click.
- **`javascript:void((()=>{…})())`.** A bookmarklet whose last expression is not
  `undefined` replaces the page with that value — which reads as "the tool broke
  the app."

Fallbacks, in order, if any of that fails on your machine: an MV3 content script
(isolated world — it can still read `class` and `data-*`, which is all the anchor
needs), then a userscript.

### The gesture

Armed, the viewport takes a crosshair cursor and a transparent catcher, so a
misjudged click cannot navigate mid-thought.

| key | does |
| --- | --- |
| click | drop a pin, open a one-line box at that point, already focused |
| **Enter** | commit, number the marker, **re-arm in the same keystroke** |
| Shift+Enter | second line |
| drag | marquee instead of a point — for "something is missing here" |
| Shift+click | click *through* to the app (not Alt: Alt+click is "download link" in Firefox) |
| `#` | attach an existing convention; `#new ` promotes this pin into one |
| `E` | export the session |
| Esc | cancel the box; Esc again disarms |

Twenty comments across five pages without ever waiting for a fix — which is
requirement 1, and the reason Enter re-arms rather than closing.

---

## 4. What a pin carries

The overlay resolves *nothing* at capture time. It records, and the agent
resolves. That is what keeps the map out of the shipped app.

```markdown
## Pin 7 · /projects/nepa-0042/steps/E1.P3.3/scope?pathway=P3&submitted=all
anchor: _levelNote_1i545_209  ·  rung: self  ·  about: element
also:   _band_1i545_5 (depth 3), [data-rid="E1.P3.3/scope/r2"]
build:  index-Dhqg80Tx.js
seen:   14px / IBM Plex Sans / oklch(0.47 0.01 250) / 1.45   (zoom 100%, dpr 2)
rules:  .levelNote { font-size: 0.8125rem }            @media (min-width: 60rem)
text:   "Assessment of environmental effects"

> This is smaller than the other notes on this band and I can't tell why.
```

Six things earn their place, and each closes a hole that would otherwise cost a
round-trip:

1. **The scoped class** — the address, per §2.
2. **The rung** — `self`, or `ancestor(depth N)`, so the agent knows whether the
   pin names the thing or its container.
3. **`about: element | region | absence`** — a comment about something *missing*
   has no element to click, and without this the tool silently converts "there
   should be a back button here" into "change this thing I clicked."
4. **The measured values, with zoom and device-pixel-ratio.** `getComputedStyle`
   reports CSS pixels regardless of zoom: at 110% you see 15.4px while the pin
   would record 14px, and the agent is told the size is on-scale when your
   complaint is that it looks wrong.
5. **The matching CSS rules, read from the CSSOM** — including `:hover` and
   `:focus`, which computed style cannot report because clicking destroys hover.
   The built sheet is same-origin, so `document.styleSheets[].cssRules` is
   readable. **Trap:** it carries `@layer` and 97 `@media` blocks, so the walk
   must recurse into `CSSLayerBlockRule` and `CSSMediaRule` — a flat iteration
   misses every Blueprint rule, which is where most of the drift lives.
6. **The bundle filename** — the staleness check of §2.

Also captured and not shown above: the full `outerHTML` of the anchored element.
It is greppable, diffable, needs no library, and for a multimodal agent it is the
next best thing to a picture. (A real screenshot is available via one
`getDisplayMedia` grant per session if you want it; it costs a permission prompt
and a visible sharing indicator.)

---

## 5. The queue, and how "resolved" works

**Append-only, one writer per file.** No file has two writers, so there is no
lock, no merge, and no lost update — a synced folder is a safe transport.

| file | written by | contains |
| --- | --- | --- |
| `pins/review-<date>.md` | you, via the overlay | the comments, write-once |
| `ledger/resolved.jsonl` | the agent | one JSON line per disposition |
| `conventions.md` | you, via the overlay | the library |

Status is folded at read time from the last record and is **monotone**. Three
terminal states, owned by different parties:

- The agent may set **done**, **wontfix** or **needs-you**.
- Only you may set **accepted**, **still-wrong** or **withdrawn**.
- A pin closes when *your* file says it closes.

So the agent can disagree but cannot dispose — and a contested item still has
somewhere to end, which is the half most designs leave open.

Two structural guards worth their weight:

- **Resolve every anchor in a batch before making the first edit.** Measured
  here: 7 of the last 20 commits touched a `.module.css`, and one touched 8 of
  23 at once. The agent's own work re-keys the anchors of items it has not
  reached yet. Resolving up front means "resolvable then, gone now" reads as
  *plausibly done* rather than as anchor rot.
- **Verify a resolution by re-probing.** Every pin stores what it measured. Next
  session, measure the same anchor again and diff. If nothing measurable changed,
  the item renders "done — but nothing measurable changed here" and returns to
  the open list. No rule needed, no DSL — it works for exactly the typography and
  colour comments that started this.

One more thing the overlay must get right, because it is the only place a comment
can actually vanish: **one `localStorage` key per pin**, not one array. Two tabs
each holding their own copy of an array is last-write-wins, and this is a
router-driven app you will certainly open twice.

---

## 6. The convention library

`conventions.md` in your folder is the **master**. There is no second copy in the
repo — "one stop shop" is only true if it is one file, and it has to be the one
you can edit.

Each convention is a section with prose, an optional machine-checkable block, and
two hashes:

```markdown
### type-scale
status: checked
scope: src/ui/**/*.css + dist/assets/*.css

Five sizes, and each has a job. --t-micro (11px) is provenance and metadata.
--t-meta (12.5px) is a control label. --t-body (14px) is the default and the
size of a named thing in a row. --t-read (16px) is a heading or text of record.
--t-count (22px) is a single figure on a card.

```check
property: font-size
allow: var(--t-micro) var(--t-meta) var(--t-body) var(--t-read) var(--t-count) inherit 1em
```

exceptions:
- DocumentOverlay.module.css .slot — 0.8125em, relative to the document's own
  serif measure rather than to the UI scale. Deliberate.
```

**The two hashes are the mechanism that makes a convention change sweep the UI.**
Hash the prose and the check block *separately*, because they trigger different
things:

- **The check block changes → a checked sweep.** Every offender is enumerated
  mechanically. Exact, no judgement.
- **The prose changes, check block unchanged → a judgement sweep.** One work item
  per *site in scope* — not per offender, because the machine cannot tell — each
  carrying the rule's old and new wording, that site's current value, and a
  required disposition. It is typed `judgement`, it may never be reported as
  "audited", and it carries a denominator: *41 sites in scope; 41 read; 6 changed.*

That second half is the one your actual complaint lives in. **Measured:**
`font-family` in this tree is 68/68 clean and `font-size` is 109/121 — the drift
is not in using an unknown font, it is in choosing among five semantic steps.
A check block cannot catch that. An edit to the sentence *"--t-meta is for
control labels, not prose helpers"* has to be able to fire a sweep, and in every
naive design it fires nothing at all.

### The scope correction — the most important line in this document

**Audit the built stylesheet, not the sources.**

The obvious scope, `src/ui/**/*.module.css`, was tested and fails badly.
**Measured** against the real `dist/assets/*.css`: 200 `font-size` declarations
ship, 75 are off-scale, and only **12** are in the module sources. 58 are
Blueprint. The obvious sweep sees **16%** of the thing it claims to sweep.

Worse, that glob does not match `src/ui/theme.css` at all — the one file holding
every Blueprint restyling and the highest-leverage typography surface in the
app. It is clean today, so the omission would stay invisible until someone edits
it.

Three consequences, all of which the audit skill implements:

1. Run `postcss` (already in `node_modules`, no new dependency) over
   `dist/assets/*.css` — the resolved artefact you are actually looking at.
   Violations map back to source for free, because the scoped class carries its
   own source line.
2. Add a `scope-covers` meta-rule: the union of what the rules cover must equal
   the CSS that reaches the bundle. **A stylesheet no rule covers is itself a
   finding.** This is what catches the next `theme.css`.
3. Give vendor violations a third disposition, `override`: Blueprint sits in
   `@layer vendor`, so any unlayered rule in `theme.css` beats it regardless of
   specificity — which is how the 11 existing overrides already work. The first
   one to write: redefine `--bp-typography-size-body-large/-medium/-small` in
   terms of the five steps, so Blueprint stops running a live parallel scale the
   sweep never sees.

And the header states its own coverage as a fraction of what ships — *"12 of 75
off-scale font-size declarations are in scope; 58 vendor; 7 global"* — so
"swept 23 stylesheets" can never be read as "swept the UI".

### Who writes a convention

You do — but the agent drafts the check block. You type a sentence into a pin
with `#new `; the agent proposes the machine-checkable half; you approve it in
your own file with one click. Without that round-trip the library ends up written
by the agent whose unreliability is the reason it exists.

---

## 7. What is verified, and what is not

**Measured in this repository:**

- The scoped-class anchor: 264/264 resolve; 94% to a unique component name; no
  DOM element without a module class on its ancestor chain.
- The build is byte-deterministic across rebuilds, so what was tested is what
  Foundry serves.
- No `_debugSource`, no `jsxDEV`, no `.tsx` names, no source maps in the
  production bundle — every fiber-walk tool is dead there, including the one
  `REVIEW-LOOP.md` proposed.
- The audit scope failure: 12 of 75, and `theme.css` outside the glob.
- postcss 8.5.28 is already present.
- Three tokens are *referenced but never defined* — `--bad`, `--warn`,
  `--rail-width`. `--bad` falls back to a raw `#b4341f`, which paints as the most
  saturated pixel in the application. `--warn` falls back to `--ink-soft`,
  silently erasing the distinction it exists to draw. **These are live defects,
  and the first sweep will find them.**
- One dead rule from a missing brace at `ProjectScreen.module.css:190`.

**Unverified — five minutes on your laptop each:**

1. Which browser you review in. The `javascript:` carve-out that lets a
   bookmarklet run under a strict CSP is a *should*, not a *must*: Chromium and
   Firefox 69+ implement it; Safari is the risk.
2. Whether you reach the app at its own subdomain or inside a Workshop iframe.
   Own subdomain is the measured case; an iframe changes the delivery.
3. Whether the CSSOM paint actually lands under the live policy.

Build the three-line probe first, run it once, and the rest follows. Do not build
the overlay before that answer.

---

## 8. Build order

1. **The probe.** A ten-line bookmarklet that paints a green square via
   `adoptedStyleSheets` and prints the CSP header. Answers §7 in one click.
2. **Seed the library.** Run the `seed-conventions` skill. It reads the current
   UI and writes `conventions.md` — an empty library stays empty, and the seeding
   pass is also the first inventory of what is already broken.
3. **The audit.** Run `audit-conventions`. Read its report before letting it
   change anything.
4. **The overlay.** Capture and export only — no resolution, no ledger.
5. **The resolver.** `scripts/review/resolve.mjs`, then the first real session.
6. **The ledger and the re-probe verification.** Only once you have felt the
   loop.

---

## 9. Four decisions that are yours

1. **Does the type scale gain a sixth step?** 13px has four users and 12px has
   three. Forcing them onto `--t-meta` (12.5px) makes several things visibly
   worse before anyone decides whether the scale was simply missing a step.
   **Decide before the first sweep** — it changes what the sweep produces, and
   running it first means working a queue you then invalidate.
2. **Does the audit hard-fail the build, or report into the queue?**
   Recommendation: split it. Hard-gate the three rules that fire only on genuine
   defects and never on judgement — undefined tokens, the parse hazard, and
   `scope-covers`. Report the rest. Any rule can be promoted with a one-line
   commit once its sweep has landed.
3. **Ticks by file-drop, or live?** File-drop, plus a one-line boot probe that
   tests whether `connect-src` allows `'self'` and shows the answer in the status
   bar. That measures the fact once instead of assuming it forever.
4. **One reviewer or several?** Everything above assumes one. Two is a 4-character
   id prefix per install — cheap, but only if it goes in from the start.
