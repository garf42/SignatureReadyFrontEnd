# review-kit

A plan and two skills for reviewing the SignatureReady UI by clicking it, and
for holding the design conventions in one place the reviewer owns.

**Nothing here ships.** It is not part of the packet, it does not travel into the
host repository, and `src/ui/` does not know it exists. Move this directory
wherever you like — it depends on nothing above it.

| file | what it is |
| --- | --- |
| `PLAN.md` | the architecture: where the capability lives, how a click becomes a file and line, how the comment queue and the convention library work, and what still needs checking on your machine |
| `skills/seed-conventions/SKILL.md` | hand to the agent to **build** `conventions.md` from what the UI currently does, plus a gap report of everything already inconsistent |
| `skills/audit-conventions/SKILL.md` | hand to the agent to **sweep** the UI against the library and bring it into line |

Run the seed skill first. The audit skill has nothing to read until the library
exists, and the seeding pass is also the first honest inventory of what is
already broken.

Read `PLAN.md` §9 before either: four decisions are yours, and one of them —
whether the type scale gains a sixth step — changes what the first sweep
produces. Making it afterwards means working a queue you then invalidate.
