# SignatureReady — front end

React conversion of the SignatureReady specimen pack, built out against the
register and its two amendments. The whole deliverable is `src/ui/`.

**This is a build in progress, not a finished interface.** See
[What is not finished](#what-is-not-finished) before reading anything here as a
claim that a screen is done. §7's project page in particular has substantial
work left.

```
npm install
npm run dev             # vite
npm run lint            # eslint, --max-warnings 0
npm run test            # vitest
npm run typecheck       # tsc --noEmit
npm run port:additions  # regenerate the port-gap list and HOST-CONTRACT.md
npm run build           # tsc --noEmit && vite build -> dist/
```

Node 24, ESM, Vite, output `dist/`.

## A note on the § numbers

`§1`–`§5` are the backend register, `§6` the supporting-pages amendment, `§7`
the project-page amendment. Those three documents govern this build and **do not
travel with the packet**. Nothing here depends on reading one: every fact a
binding or a test rests on is restated where it is used, and no shipped file
names them by path.

## What ships

`src/ui/` is copied into the host app as files, not mounted as a nested app. It
is self-contained: every import is `@/ui/…`, nothing reaches outside it, and no
file outside it is load-bearing — including the generated port-gap list, which
lives at `src/ui/data/PORT-ADDITIONS.generated.md` for exactly that reason. The
move is one directory rename.

`src/main.tsx` is the only file outside it and does not port: in Foundry that
level is shell-owned (OSDK provider, `/auth/callback` route, dev-server
basename).

No OSDK package is imported anywhere.

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

## The five states

Every region a screen renders is in exactly one of five states, told apart by
shape and carried in `data-state`. The words never reach the screen.

| state | what it means |
| --- | --- |
| `pending` | a request is out and no usable value is held. Not an answer, so it carries no message — it carries the query it is **asking** |
| `filled` | a value arrived |
| `absent` | a query ran and found nothing. That is an answer, and the region carries the query it **searched** |
| `blocked` | a precondition is unmet; names what it waits on |
| `unresolved` | the lane could not have answered. Always a defect |

The mapping from a backend outcome to a state is fixed, so an adapter is
mechanical rather than interpretive:

| backend outcome | state |
| --- | --- |
| request in flight, and no usable cached value | `pending` |
| query succeeded, zero rows | `absent` |
| caller lacks the credential the rule reserves, or the surface has no backend address | `blocked` |
| query or lane failed, or returned a defect | `unresolved` |
| query succeeded with rows | `filled` |

`pending` and `absent` are one question at two times and carry the same query
string: *"Asking: q"* becomes *"Searched: q"*. `pending` draws no spinner and no
skeleton — it holds the room and names what it asked. A request that outlives
its deadline becomes `unresolved`; the port owns that deadline, so no component
holds a clock.

## The seam

`src/ui/data/port.ts` is a **contract**, not an implementation.

```ts
const port = usePort();
const inbox = port.useInbox();
```

`DataPort` declares fifteen members. `fixturePort` implements it from fixtures
and is the context's **default**, so nothing has to be provided for the tree to
run — a required provider would make the fixture path opt-in, and a screen
mounted in isolation would get nothing instead of fixtures.

Wiring a backend is shell work, and no file under `src/ui/` is edited to do it:

```tsx
// shell territory
<DataPortProvider port={composePort({ useInbox: live.useInbox })}>
<DataPortProvider session={osdkSession}>   // real auth, no port needed
```

Anything not named keeps its fixture, so a half-wired application is a normal
state rather than a broken one — which matters through the long period when some
surfaces are live and others are not.

**Two constraints on any implementation**, because an async one depends on them:
every member must be callable unconditionally during render, and no member may
call a hook inside a branch or return early before its last hook call.

`src/ui/data/acts.ts` is the write seam: all seventeen acts, each naming its
action API name, what it writes, its actor, its parameters, what the interface
refuses before sending versus what it must let the platform refuse, what goes
stale on success, and what the surface does on failure.

`src/ui/data/bindings.ts` declares, per surface, the exact API names, how the
surface is addressed, the query shape, which edges are traversed rather than
scanned, where the gate is held, and what may go stale.
`npm run port:additions` generates the port-gap list from it.

**Every name carries a status.** 76 of 79 object types hold zero rows, so a
near-miss API name and an empty object type are the same pixel — a wrong name
survives every test. `confirmed` means the exact string was measured on the
platform. `proposed` means it does not exist yet, or the register names the
thing without naming its API name. The generated list puts every proposed name
in one table at the top; work through that table first.

## Every state is reachable by URL

| query | what it moves |
| --- | --- |
| `?state=pending\|filled\|absent\|blocked\|unresolved` | the screen's own region |
| `?shell=…` | the project band, the pathway line and the step list |
| `?session=out\|pending` | the signed-out case, and the session still resolving |
| `?pathway=P0\|P1\|P2\|P3\|P4` | the pathway Step 2 fixed, and so which steps exist |
| `?gate=held` | the caller holds the credential the rule reserves |
| `?retrieval=down` | the drafting lane could not run |

These are the whole QA and demo surface and the acceptance tests depend on them,
so they **stay enabled in the deployed app** — a stakeholder walkthrough of an
empty ontology needs `?state=` and `?shell=`. They need no build flag and must
not have one: they live inside the fixture members, so a surface wired live
loses its knob automatically and the knob surface shrinks by exactly one member
per `composePort` line.

**Every list surface opens with placeholder rows, and `?state=absent` reaches
what the backend actually holds.** Archive has no backend address at all, both
expert acts key on a `slot` that nothing creates, and `category` holds zero of
its 87 rows. §6.1 asks that empty read as designed rather than as a failed load.

## What is not finished

The packet is mid-build. Read the bindings as a specification for the adapter,
never as a claim that the screen above them is done.

- **§7's project page has the most left to do.** Pathway state is not built;
  step and tab completion have no property behind them; the branch set that
  records which limb of 1b.2(f)(2) answered does not exist; and eleven of the
  seventeen acts are keyed on a `slot`, `claim`, `manifest`, `adoption`,
  `factor`, `branch` or `consistencyDetermination` row that nothing creates.
- **One act has no surface anywhere.** `record-consistency-finding` is declared
  with `unplaced` saying so. Placing it is a decision about §7.
- **Every reserved surface is enforced by nothing.** The regulation reserves six
  classes of surface to a named holder and no platform predicate marks a
  caller's class, so the interface's withholding is the only gate there is —
  which is exactly what §7.2 calls not a gate. `acts.ts` asserts that every
  reserved act says so.
- **Eight parameter names and 56 binding names are proposed**, not measured.
- **The screens run on fixtures.** A green preview says nothing about the
  ontology, because the tree makes no OSDK calls at all.

## Integrating this into the host

`src/ui/host-requirements.json` is the machine-readable contract:
dependencies and their majors, the required tsconfig and vitest settings, the
files that must not exist, the DOM the mount node needs, and the router shape.
`HOST-CONTRACT.md` is its generated rendering, and
`src/ui/host-contract.test.ts` asserts it against the host it is running in —
so an integration that breaks one of these fails in your terminal on the first
`npm run test` rather than in review.

These steps cannot be automated. In order:

1. **Move the tree.** `git mv <nested>/src/ui src/ui`. One rename, zero content
   edits.
2. **Delete the host's `src/index.css` and its import from `src/main.tsx`.**
   *The highest-risk item in the port, because it yields a plausible-looking
   wrong app rather than an error.* The template's `index.css` imports
   `normalize.css` and `blueprint.css` **unlayered**; `theme.css` deliberately
   puts those same two in `@layer vendor` so its own rules outrank them. A
   second unlayered copy loading afterwards wins every specificity tie, and
   buttons, cards, dialogs, tables and selects silently revert to stock
   Blueprint. Stripping the `#root` rule is not enough — the file has to go.
   `theme.css` is the only global stylesheet.
3. **Put `// @vitest-environment node` at the top of the host's
   `src/env.test.ts`.** This tree needs `environment: "jsdom"` project-wide, and
   the template's own `env.test.ts` imports Vite — and therefore esbuild, which
   throws `new TextEncoder().encode("") instanceof Uint8Array is incorrectly
   false` inside jsdom. Without the docblock the first tagged release build
   fails: `ci.yml` **does** set `VERIFY_ENV_PRODUCTION=true` on tagged builds,
   so the production env check really does run on release. `ci.yml` is marked
   DO NOT MODIFY and does not need to change.
4. **Mount `App` at a single root splat.** `path: "*"`, which also matches `/`.
   Keep only `/auth/callback` above it. Mounting at both `/` and `*` produces a
   React Router warning and a real defect: with an exact `/` route above the
   descendant `<Routes>`, `App` unmounts and remounts on the first navigation
   away from the inbox, discarding UI state such as the open sections pane, and
   flashing. `App` also tolerates a non-`/` basename — the Code Workspaces
   preview serves under a long proxy prefix — so nothing here routes off
   `window.location.pathname` and nothing hardcodes an absolute asset path.
5. **Unbox the mount node.** Remove the `<div id="root-container">` wrapper from
   `index.html`. `theme.css` owns `#root`: `min-height: 100vh`, full bleed.
6. **Install the dependency delta and set the alias.** Everything in
   `host-requirements.json`'s `dependencies` at those majors. `@` → `/src` in
   **both** `vite.config.ts` (`resolve.alias`) and `tsconfig.json` (`paths`), or
   the copy becomes a rewrite.
7. **Set the vitest block** from `host-requirements.json`.
8. **Delete the nested harness** — `package.json`, `package-lock.json`,
   `index.html`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`,
   `src/main.tsx`. Move `scripts/port-additions.mjs` to `scripts/`, and
   `README.md` and `MANIFEST.md` to `docs/signatureready/`.
9. **Run the suite.** `npm run lint -- --max-warnings 0`, `npm run test`,
   `npm run build`.

The lint config here is a **superset of the host's**, and this tree passes it
clean — so the host needs no `src/ui/**` exception for `curly` or anything else.

## Three judgements the register did not make for us

- **`unresolved` is not scattered decoratively.** §1 defines it as always a
  defect. A default view sprinkled with defects teaches a reader that a defect
  is ordinary, so the project page has none; `?state=unresolved` reaches the
  whole region and `?retrieval=down` reaches the case §7.8 actually names.
- **A waiting step still opens.** §7.2 requires the build to be walkable end to
  end as a regular user, so a step that is waiting reads as waiting and is not
  disabled.
- **The initiation overlay asks for what `submit-intake` writes** — name, unique
  identification number and its issuer, anticipated implementation start — and
  no longer for an office or a summary, which no act records.

## What the tests hold

The element counts (FANEC 6, EA 7, FONSI 5, EIS 8, ROD 8 = 34), that exactly
three documents carry a signature gate and the EA and EIS do not, that a gated
row is `blocked` and never `absent` and always offers the routing, that a
discretion is never rendered as a requirement, that a retrieval lane which could
not run reports `unresolved`, that the five states are told apart in
`data-state` and never in words on the screen, that `pending` reaches every
surface and no default clause swallows it, that every surface declares a
binding, that `acts.ts` and `bindings.ts` state the same invalidation relation,
that no name is asserted that the register did not give, and that the host meets
`host-requirements.json`.
