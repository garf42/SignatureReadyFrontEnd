# The point-and-comment review loop, and how to rebuild it outside Claude

## The honest answer first

**No.** Anchored comments on a published artifact are a claude.ai product feature,
not something a model produces. An agent in Foundry — or any other host — cannot
emit one, and there is no equivalent surface to wait for. If the loop matters,
it has to live in this repository, where it works with any agent.

That turns out to be the better outcome anyway, because the artifact-comment
anchor is the weakest part of the loop as it stands. What comes back to the model
is a CSS path:

```
div:nth-of-type(1) > section:nth-of-type(1) > div:nth-of-type(2) > … > div:nth-of-type(3)
```

Which is a location, not an identity. The model reverse-engineers which component
that is, and the path breaks the moment a wrapper div moves. Most of the "the AI
never gets it quite right" failures are that reverse-engineering step going wrong,
not the instruction being unclear.

## What actually makes the loop work

Three properties. Rebuild these and the loop transfers; miss one and it doesn't.

1. **The review surface is the running application, built from the repo.** Not a
   mockup, not a screenshot, not a second implementation. `npm run preview:artifact`
   folds the real `App`, the real screens and the real fixture port into one file.
   A comment on it is a comment on the code, because there is nothing else it
   could be about.
2. **Every comment carries a machine-readable anchor** to the thing on screen. This
   is the half that removes "describe where on the page you are looking."
3. **The review surface is a build output and is never edited.** This is the
   guarantee that fixes land in code rather than in a snapshot that then diverges.

Property 3 already holds structurally here rather than by good behaviour:
`dist-walk/` is in `.gitignore`, so an agent that "fixes the UI" by editing the
built HTML produces a change git will not carry. The fix has nowhere to go except
`src/`. Keep it that way — never track a built review page.

## The replacement anchor: click to source

React 18 development builds record where each element was written. Verified in
this tree, not assumed:

- `node_modules/react-dom/cjs/react-dom.development.js` carries `_debugSource`.
- `react/jsx-dev-runtime` emits `fileName` (the automatic dev runtime that
  `@vitejs/plugin-react` already uses).

So a click on the screen can resolve to `src/ui/components/TabStrip.tsx:42` —
a file and a line, which is an address any coding agent opens directly. That is
strictly more than the artifact loop gives, and it does not decay when the DOM
shifts.

### How the resolution works

Given the clicked `Element`:

1. Find the fiber. React attaches it under a key beginning `__reactFiber$` —
   `Object.keys(el).find(k => k.startsWith("__reactFiber$"))`.
2. Read `fiber._debugSource` → `{ fileName, lineNumber, columnNumber }`.
3. If it is missing or points outside `src/ui/`, climb `fiber._debugOwner` until
   the file is one of ours. A click usually lands on a Blueprint internal; the
   owner chain is what gets you to the component *we* wrote.
4. Take the component name from `fiber._debugOwner.type.name` for the heading.

Roughly eighty lines, including the DOM-node ascent for clicks that land on a
text node.

### The pin

Gate on a key, not a mode, so review can happen against the real screen with the
real data: **Alt+click** pins a marker and opens a one-line text box. Comments
accumulate in `sessionStorage` (this build already has two such stores — see
`src/ui/data/seen.ts` and `src/ui/data/submitted.ts` for the wrapped-access
convention), and an **Export** control writes the whole set out as markdown.

### The export is the deliverable

The export is not a report for a human — it is the prompt for the next agent.
One block per comment:

```markdown
## src/ui/components/TabStrip.module.css — <TabStrip> at src/ui/components/TabStrip.tsx:42
Screen text: "Contents of the notice"
URL: /project/nepa-0042?pathway=P4&submitted=all

Completed tabs need the same fill and font colour as completed steps.
```

Three things earn their place there:

- **The file and line**, so the agent opens the right thing instead of searching.
- **The screen text under the pointer**, so a wrong anchor is caught by the human
  reading the export rather than discovered after the edit.
- **The URL including the demo knobs**, so the agent can reproduce the exact state
  the comment was made in. This build's knobs (`?state= ?shell= ?rail= ?levels=
  ?pathway= ?gate= ?retrieval= ?session= ?assembled= ?submitted=`) are documented
  in `README.md`, and half the review confusion in this project came from a
  comment made in a state the reader could not reach.

Hand that file to the agent verbatim. No description of where on the page anything
is, because the address is in the heading.

## What to build

Suggested shape, dev-only:

| File | Does |
| --- | --- |
| `src/review/source.ts` | fiber walk → `{ file, line, component }` |
| `src/review/store.ts` | sessionStorage set of pins, same wrapped-access convention as `seen.ts` |
| `src/review/Layer.tsx` | Alt+click capture, marker pins, the text box, the Export control |
| `src/review/export.ts` | pins → the markdown above |
| `src/review/index.ts` | mounts only under `import.meta.env.DEV` |

And two guards, because both of these are silent failures:

- **A test that fails if `_debugSource` disappears.** React 19 removed it. If this
  tree ever moves to 19, the loop has to switch to the
  `@babel/plugin-transform-react-jsx-source` output or an explicit `data-src`
  attribute injected at build time — either works, but you want to find out from
  a red test, not from an export full of blanks.
- **A test that the review layer is absent from the production bundle.** It reads
  React internals; it must never ship.

## Build or buy

`click-to-react-component` and `react-dev-inspector` both do the click→source half
and are well-tested. Both then **open your editor**, which is the wrong terminal
for an agent loop: you want a file you can paste, not an IDE jumping to a line.

Recommendation: **build**. Take the fiber-walk idea from either (it is the same
technique described above), and own the export format, which is the part that
actually determines whether the next agent gets it right. The dependency buys you
the eighty easy lines and none of the hard decision.

## What this does not give you

The artifact loop has one thing this does not: **a reviewer who is not running the
repo**. A published page opens in a browser with no checkout, no `npm install`, no
dev server. If review has to reach someone who will never run `npm run dev`, that
gap is real, and the honest answer is to publish a built page for reading and take
their comments as prose — accepting the reverse-engineering cost for that reader
only.

For anyone who can run the tree, the loop above is better in every respect that
matters.
