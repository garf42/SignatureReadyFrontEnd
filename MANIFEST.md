# SignatureReady front-end build packet

## What travels

```
README.md                          the contract, and the ordered integration steps
HOST-CONTRACT.md                   generated from src/ui/host-requirements.json
scripts/port-additions.mjs         regenerates both generated documents
src/ui/                            the deliverable
  host-requirements.json           what this tree needs from its host
  host-contract.test.ts            asserts that, against the host it runs in
  data/PORT-ADDITIONS.generated.md generated from bindings.ts and acts.ts
```

`src/ui/` is self-contained. Every import inside it is `@/ui/…`, nothing reaches
outside it, no file outside it is load-bearing, and a lint rule enforces both —
so the move into a host repository is one directory rename with nothing trailing
behind it. Everything else in this repository is a local harness the shell
replaces.

## What does NOT travel

`guidance/` — the backend register and the two amendments. They govern this
build and are **not part of the packet**: they are not uploaded to Foundry and
nothing that ships depends on reading one.

The § numbers throughout the tree are a citation vocabulary, not file paths.
`§1`–`§5` are the register, `§6` the supporting-pages amendment, `§7` the
project-page amendment. Every fact a binding, an act or a test rests on is
restated where it is used, so the packet is readable on its own terms. No
shipped file names those documents by path — and nothing inlines them either,
because a second copy of the register in the tree is a second place for it to go
stale.

## Reading order

1. `README.md` — what ships, the five states, the seam, **what is not
   finished**, and the ordered integration steps.
2. `HOST-CONTRACT.md` — what this tree needs from its host, and why each item is
   there. Generated; edit `src/ui/host-requirements.json` instead.
3. `src/ui/data/PORT-ADDITIONS.generated.md` — every surface, what it needs from
   the ontology, and the names that are proposed rather than measured. Generated;
   edit `src/ui/data/bindings.ts` instead.
4. The built screens. They are the design reference; there is no separate design
   document in this packet.
5. `REVIEW-LOOP.md` — how UI review was conducted against this build, and how to
   rebuild that loop in a host that has no comment surface. Process rather than
   packet: nothing in `src/ui/` depends on it, and it is the one document to read
   before the first round of "change this, on the screen, here.

## This is a build in progress

The packet is not a finished interface, and the declarations in it are a
specification for the adapter rather than a claim that the screen above them is
done. §7's project page has the most left to do. `README.md`'s *What is not
finished* section is the current list; it is maintained there rather than here,
so there is one place for it to be true.

## Excluded from the repository, deliberately

| removed | why |
| --- | --- |
| `SignatureReady App Preview.dc.html` | prior build's preview; loads fonts from an external CDN, which the platform CSP refuses |
| `SignatureReady Specimen Pack v2.dc.html` (root) | byte-identical duplicate |
| `design_handoff_signatureready/` | describes an interface that was deleted; the specimen pack also loads external fonts |
| `src/ui/CONVENTIONS.md` | a second place for design rules to live, and so a second place for them to go stale; the rules are in the built screens and in the components |
| `support.js`, `.thumbnail`, `.section3-bounds.txt` | prototype tooling residue |

## Contract that does not change

`src/main.tsx` and `src/router.tsx` are shell-owned in Foundry and do not port.
All application code lives under `src/ui/`. Do not create a nested app with its
own `package.json`, `index.html` or `vite.config.ts` — a prior attempt did and
the Foundry build never reached it. Do not constrain `#root` and do not add a
wrapper element around the mount node.

Foundry CI runs `npm run lint` with `--max-warnings 0`, then `npm run test`,
then `npm run build`. All three are defined and green. Every lint rule this
repository turns on is an error rather than a warning, and the rule set is a
superset of the host's, so this tree cannot pass here and fail there.
