# SignatureReady — front end

React conversion of the SignatureReady specimen pack, built out against the
register and its two amendments. The whole deliverable is `src/ui/`.
`MANIFEST.md` says where truth lives and in what order to read it; the built
screens are the design reference, and there is no separate design document.

```
npm install
npm run dev             # vite
npm run lint            # eslint, zero-warning bar
npm run test            # vitest
npm run typecheck       # tsc --noEmit
npm run port:additions  # regenerate PORT-ADDITIONS.md from the bindings
npm run build           # tsc --noEmit && vite build -> dist/
```

Node 24, ESM, Vite, output `dist/`.

## What ships

`src/ui/` is copied into the host app as files, not mounted as a nested app.
`src/main.tsx` is the only file outside it and does not port: in Foundry that
level is shell-owned (OSDK provider, `/auth/callback` route, dev-server
basename). It does `createRoot` plus router setup and nothing else.

No OSDK package is imported anywhere. All data comes from `src/ui/data/port.ts`,
which serves fixtures — one per state per screen, including refusals and a
signed-out case — behind typed hooks.

Two other files under `src/ui/data/` carry the shape rather than the data.
`pathways.ts` is §7 as data: every step, tab and row of all five pathways, with
the citation each comes from, because the flow is the regulation's and the
regulation is known. `bindings.ts` is the other half: for each hook, the object
type, properties, act and section it stands in for. Screens read `pathways.ts`
so that adding a tab is an edit to a list rather than a new component, and read
nothing but `port.ts` for values.

## Screens

| route | screen |
| --- | --- |
| `/` | the inbox: every project this officer holds |
| `/archive` | recently-deleted projects, restore or purge — §6.3 |
| `/experts` | the expert queue and the request it drafts — §6.4, Level 4 |
| `/learning` | what was proposed, what was adopted, whether it is calibrated — §6.5, Level 3 |
| `/reference` | the corpus, the pinned regulation, the CE catalogue — §6.6, Levels 0 and 1 |
| `/projects/:projectRef/steps/:stepId/:tabId` | the shell + one part of the document — §7 |
| `/projects/:projectRef/steps/x/:tabId` | the cross-cutting tabs, reachable from every step — §7.7 |
| anything else | not found |

## Every state is reachable by URL

The four state words never appear on screen; they are in `data-state`.

| query | what it moves |
| --- | --- |
| `?state=filled\|absent\|blocked\|unresolved` | the screen's own region |
| `?shell=…` | the project band, the pathway line and the step list |
| `?session=out` | the signed-out case |
| `?pathway=P0\|P1\|P2\|P3\|P4` | the pathway Step 2 fixed, and so which steps exist |
| `?gate=held` | the caller holds the credential the rule reserves |
| `?retrieval=down` | the drafting lane could not run |

**Three pages open `absent` rather than `filled`, and that is the claim they are
making.** Archive, Expert Q and the CE catalogue have no rows to hold — Archive
has no backend address at all, both expert acts key on a `slot` that nothing
creates, and `category` holds zero of its 87 rows. §6.1 says empty is the
expected state at build time and should read as designed, so those three open
empty and `?state=filled` shows the populated design. Which state a page opens
in is a claim about the backend, not a preference.

## Three judgements the register did not make for us

- **`unresolved` is not scattered decoratively.** §1 defines it as always a
  defect. A default view sprinkled with defects teaches a reader that a defect
  is ordinary, so the project page has none; `?state=unresolved` reaches the
  whole region and `?retrieval=down` reaches the case §7.8 actually names — a
  retrieval lane that could not have answered, which reports unresolved and
  never absent.
- **A waiting step still opens.** §7.2 requires the build to be walkable end to
  end as a regular user, every step, tab and row workable without agency
  credentials. So a step that is waiting reads as waiting and is not disabled.
- **The initiation overlay asks for what `submit-intake` writes** — name, unique
  identification number and its issuer, anticipated implementation start — and
  no longer for an office or a summary, which no act records. §7.3 keeps the
  overlay and Step 0 separate, and Step 0 carries the detail the review needs.

## The route to Foundry

This repository is uploaded into a Foundry OSDK React Application repository,
where the AI FDE integrates it and wires the backend. Everything the FDE has to
replace on arrival is a place the approved UI can drift, so the job here is to
shrink that surface.

- **Prefer the prebuilt component wherever it can carry the design.** Blueprint
  carries the tables, tabs, menus, dialogs, selects and callouts on every screen
  here, restyled through `theme.css` rather than replaced. Three things are
  hand-built and each is named here because the design wins the trade:
  `Region`, which is the four-state distinction itself and has no prebuilt
  equivalent; `QuestionRow`, whose closed row is a four-column grid Blueprint's
  collapse does not lay out; and `SourceLine`, which is deliberately plain
  monospace and never a badge. No new runtime dependency was added.
- **The port-gap list is generated, not maintained.** Each hook in
  `src/ui/data/port.ts` has a declaration in `src/ui/data/bindings.ts` — object
  type, properties, act, the section that requires it, and what the register
  records as absent. `npm run port:additions` emits `PORT-ADDITIONS.md` from
  those declarations, and `port.bindings.test.ts` fails on a hook that has none
  and on a declaration with no hook, so the list cannot fall behind the code.
  Where the front end needs something the ontology does not yet support, the
  ontology is what changes — a declared gap is a note for the FDE, never a
  reason to redesign the screen.

## Porting contract

`src/ui/` copies in whole; everything outside it is a local harness the shell
replaces. Each rule below is a failure that already happened once, on the test
front end.

- **No nested app.** Nothing under the copied tree may carry its own
  `package.json`, `index.html`, `vite.config.ts` or `tsconfig.json`. A prior
  attempt did and the Foundry build never reached it — `tsconfig` includes
  `src` only, and Vite's entry is the root `index.html`.
- **`src/main.tsx` is replaced, not ported.** The shell mounts `App` at `/` and
  `*`. Delete the `@osdk/create-app` demo screen (`Home` / `Header` /
  `NextSteps` / `Osdk`) so it cannot win the route.
- **`#root` belongs to `theme.css`** (`min-height: 100vh`, full bleed). Strip the
  template's `#root { max-width: 1280px; padding }` from `src/index.css` and the
  `<div id="root-container">` wrapper from `index.html`: one mount node, with no
  constraint on it.
- **`@` → `/src` in both configs.** Every file imports `@/ui/…`; the alias must
  exist in `vite.config.ts` (`resolve.alias`) *and* `tsconfig.json` (`paths`), or
  the copy becomes a rewrite.
- **Fonts self-hosted via `@fontsource` only** — the platform CSP refuses an
  external CDN. `theme.css` keeps normalize + Blueprint in `@layer vendor` and
  our own rules unlayered, which is why no rule needs `!important`; this survives
  Vite's PostCSS pipeline as written.
- **The tests port with the code.** They are `*.test.tsx` beside what they
  check, so a rule that survives the move keeps its guard. Vitest's config lives
  in the root `vite.config.ts`, which does not port.

## What must be true before the merge

- **CI runs three commands.** `npm run lint` with `--max-warnings 0`, then
  `npm run test`, then `npm run build`. All three are defined and green. Lint
  turns on no warnings at all — every rule is an error — so the bar and the
  config cannot drift apart.
- **What the tests hold.** The element counts (FANEC 6, EA 7, FONSI 5, EIS 8,
  ROD 8 = 34), that exactly three surfaces are gated and the EA and EIS are not,
  that a gated row is `blocked` and never `absent` and always offers the routing,
  that a discretion is never rendered as a requirement, that a retrieval lane
  which could not run reports `unresolved`, that the four states are told apart
  in `data-state` and never in words on the screen, and that every hook declares
  a binding.
- **Install the delta.** The OSDK template ships none of `@blueprintjs/icons`,
  `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`, `@fontsource/spectral`.
  Pins that must match the host exactly: React 18, `react-router-dom` 6,
  `@blueprintjs/core` 6, `normalize.css` 8.
- **`base: "./"` breaks a deep route in a static build.** The relative asset
  paths resolve against the route rather than the root, so `dist/` serves `/`
  and returns a blank page at `/projects/…`. It does not affect `npm run dev`
  and the shell owns this setting in Foundry, but a preview of `dist/` is not a
  test of the routes.
- **Blockers this UI cannot surface.** It makes no OSDK calls, so a green
  preview says nothing about the ontology. Two of the three placeholders the
  earlier note listed were measured and do not stand: `foundry.config.json`
  carries no ontology RID at all (the live one resolves; an all-zeros RID does
  not), and `.env.production` carries all three variables including the
  redirect. The live defect is the inverse — `src/env.test.ts` wraps every
  assertion in `test.skipIf(VERIFY_ENV_PRODUCTION !== "true")` and CI never sets
  that variable, so a tagged release passes the check **without running it**.
  Set the variable in `ci.yml` or remove the guard. The Developer Console import
  list is still unread, and with 76 of 79 object types empty a missing import
  and an empty type are the same pixel.
