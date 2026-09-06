# SignatureReady front-end build packet

Three inputs, and nothing else. Anything not in this packet is either superseded or
describes an interface that was deleted.

```
README.md                   the directory contract and the porting contract
src/ui/                     the deliverable
PORT-ADDITIONS.md           generated from src/ui/data/bindings.ts
guidance/
  BACKEND-STATE-AND-1B.md
  AMENDMENT-6-supporting-pages.md
  AMENDMENT-7-project-page.md
```

The packet was unpacked into this repository: what it called
`signatureready-ui/` is the root, and `guidance/` travels with it so the three
inputs stay next to the build they govern.

## Reading order

1. `README.md` — the directory contract, the porting contract,
   and what must be true before the merge. The built screens are the design
   reference; there is no separate design document in this packet.
2. `guidance/BACKEND-STATE-AND-1B.md` — the register. §0 what already exists,
   §1 backend state, §2 what 7 CFR part 1b requires and in what order, §3 where
   the two meet, §4 unknowns, §5 document production. Measured 2026-09-04.
3. `guidance/AMENDMENT-6-supporting-pages.md` — §6. Archive, Expert Q, Learning,
   Reference, and where Levels 3 and 4 attach. §6.7 consolidates the port
   additions the register records as absent.
4. `guidance/AMENDMENT-7-project-page.md` — §7. Pathways, steps, tabs, elements,
   drafting authority and the signature gate, retrieval pushes, trigger map.

Both amendments cite the register by section. Read it first. It is the AI FDE
output document, converted from its PDF export rather than retyped — headings,
tables, quotations and emphasis are carried over, and no wording was changed.

## Excluded from the repository, deliberately

| removed | why |
| --- | --- |
| `SignatureReady App Preview.dc.html` | prior build's preview; loads fonts from an external CDN, which the platform CSP refuses |
| `SignatureReady Specimen Pack v2.dc.html` (root) | byte-identical duplicate |
| `design_handoff_signatureready/` | describes an interface that was deleted; the specimen pack also loads external fonts |
| `src/ui/CONVENTIONS.md` | a second place for design rules to live, and so a second place for them to go stale; this file says where truth lives |
| `support.js`, `.thumbnail`, `.section3-bounds.txt` | prototype tooling residue |

The design rules are not lost with the handoff folder. They are in the built
screens and in the components themselves.

## Contract that does not change

`src/main.tsx` and `src/router.tsx` are shell-owned in Foundry and do not port. All
application code lives under `src/ui/`. Do not create a nested app with its own
`package.json`, `index.html` or `vite.config.ts` — a prior attempt did and the
Foundry build never reached it. Do not constrain `#root` and do not add a wrapper
element around the mount node.

Foundry CI runs `npm run lint` with `--max-warnings 0`, then `npm run test`, then
`npm run build`. All three are defined and green. Every lint rule this repository
turns on is an error rather than a warning, so the bar and the config cannot
drift apart.
