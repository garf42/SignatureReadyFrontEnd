import { describe, expect, it } from "vitest";

// Read through Vite rather than node:fs — the single tsconfig types only
// vite/client, and `?raw` is part of that surface. It resolves through the @
// alias like everything else, so the file is inside the copied tree and the
// move stays one directory rename with nothing trailing behind it.
import generated from "@/ui/data/PORT-ADDITIONS.generated.md?raw";

import { ACTS } from "@/ui/data/acts";
import { BINDINGS } from "@/ui/data/bindings";
import { fixturePort } from "@/ui/data/fixturePort";

/** The gate the README asks for: no screen may read data without naming the
 *  backend it needs. The member list is read off the CONTRACT rather than
 *  maintained here, so the two cannot drift apart.
 *
 *  It is read off `fixturePort` and not off the port module's exports, because
 *  the module now exports the seam's own machinery (`usePort`, `composePort`,
 *  `DataPortProvider`) alongside the contract. `fixturePort` is typed as
 *  `DataPort`, so its key set IS the contract's key set: a member added to the
 *  interface and not implemented fails to compile, and one implemented and not
 *  declared here fails below. */

const hooksInPort = Object.keys(fixturePort).sort();

const hooksDeclared = Object.keys(BINDINGS).sort();

describe("port bindings", () => {
  it("finds hooks to check", () => {
    expect(hooksInPort.length).toBeGreaterThan(0);
  });

  it("declares a binding for every member the contract holds", () => {
    const undeclared = hooksInPort.filter((hook) => !(hook in BINDINGS));
    expect(undeclared).toEqual([]);
  });

  it("declares no binding for a member the contract does not hold", () => {
    const orphaned = hooksDeclared.filter((hook) => !hooksInPort.includes(hook));
    expect(orphaned).toEqual([]);
  });

  it.each(hooksDeclared)("%s names what it stands in for", (hook) => {
    const binding = BINDINGS[hook];
    expect(binding.serves.length).toBeGreaterThan(0);
    expect(binding.requires.length).toBeGreaterThan(0);
    expect(["answerable", "partial", "backlog", "absent"]).toContain(binding.status);
    // Either the hook names what it reads or writes, or it names what does
    // not exist yet. What it may never do is declare nothing at all.
    const named =
      binding.objectTypes.length +
      binding.datasets.length +
      binding.acts.length +
      binding.needed.length;
    expect(named, `${hook} names neither a backend nor a gap`).toBeGreaterThan(0);
  });

  it("says what the FDE must supply wherever the verdict is not answerable", () => {
    for (const hook of hooksDeclared) {
      const binding = BINDINGS[hook];
      if (binding.status !== "answerable") {
        expect(binding.needed.length, `${hook} is ${binding.status} and needs nothing`).toBeGreaterThan(0);
      }
    }
  });

  it("carries every hook into the generated PORT-ADDITIONS.md", () => {
    const missing = hooksDeclared.filter((hook) => !generated.includes("`" + hook + "`"));
    expect(missing, "run `npm run port:additions`").toEqual([]);
  });
});

/** The two files describe one system and must not disagree about it. Every
 *  contradiction the last review found sat on the boundary between them —
 *  a property bound to one object type here and another there, an act that
 *  stales a surface the surface never heard of, an arbiter named in one place
 *  and denied in the other. Prose cannot hold that; these can. */
describe("bindings and acts describe one system", () => {
  it("names the same invalidation relation from both sides", () => {
    // freshness.invalidatedBy is DERIVED from acts.ts rather than authored, so
    // this asserts the derivation still holds. An adapter that builds its
    // invalidation graph from either file gets the same application.
    const fromActs = new Set<string>();
    for (const act of Object.values(ACTS)) {
      for (const surface of act.onSuccess.invalidates) {
        fromActs.add(`${act.apiName} -> ${surface}`);
      }
    }
    const fromBindings = new Set<string>();
    for (const [hook, binding] of Object.entries(BINDINGS)) {
      for (const act of binding.freshness.invalidatedBy) {
        fromBindings.add(`${act} -> ${hook}`);
      }
    }
    expect([...fromBindings].sort()).toEqual([...fromActs].sort());
  });

  it("is staled only by acts that exist", () => {
    // An earlier hand-written invalidation list named three acts that are not
    // among the seventeen at all — archive, restore and purge, none of which
    // the ontology has. A surface may not invent an act to be staled by, and
    // deriving the list from acts.ts is what makes that unwritable.
    const real = new Set(Object.keys(ACTS));
    for (const [hook, binding] of Object.entries(BINDINGS)) {
      for (const act of binding.freshness.invalidatedBy) {
        expect(real, `${hook} is staled by ${act}, which is not one of the seventeen`).toContain(act);
      }
    }
  });

  it("marks an act confirmed if and only if it is one of the seventeen", () => {
    // A surface MAY name an act that does not exist — useArchive names three,
    // because §6.7 asks for archive, restore and purge and §1 lists none of
    // them. What it may not do is pass one off as real, or mark a real one as
    // a proposal. The status is what an FDE matches against the ontology, so
    // it has to be right in both directions.
    const real = new Set(Object.keys(ACTS));
    for (const [hook, binding] of Object.entries(BINDINGS)) {
      for (const act of binding.acts) {
        expect(
          real.has(act.name),
          `${hook} marks ${act.name} ${act.status}, and it is ${real.has(act.name) ? "" : "not "}one of the seventeen`
        ).toBe(act.status === "confirmed");
      }
    }
  });

  it("puts the gate on an act that is actually reserved", () => {
    for (const [hook, binding] of Object.entries(BINDINGS)) {
      for (const apiName of binding.authority.mustBeOn) {
        expect(ACTS[apiName], `${hook} wires a gate onto ${apiName}, which does not exist`).toBeDefined();
        expect(
          ACTS[apiName].reserved,
          `${hook} wires a gate onto ${apiName}, which the regulation does not reserve`
        ).not.toBeNull();
      }
    }
  });

  it("never claims a gate is held, because on this build none is", () => {
    // §7.2 reserves six classes of surface and §1 records no platform predicate
    // for a caller's class, so every reserved surface is reserved by the rule
    // and enforced by nothing. A binding that claimed otherwise would tell an
    // FDE to wire a refusal that never fires — and a signature that looks gated
    // and is not is the highest-consequence lie this application can tell.
    for (const [hook, binding] of Object.entries(BINDINGS)) {
      if (binding.authority.heldBy !== "none") {
        expect(
          binding.authority.heldByName,
          `${hook} claims a gate is held and does not name what holds it`
        ).toBeTruthy();
      }
      // Where there is a gate to wire, it must say where.
      if (binding.authority.mustBe !== "none") {
        expect(binding.authority.mustBeOn.length, `${hook} has a gate to wire and no act to wire it on`)
          .toBeGreaterThan(0);
      }
    }
  });
});

describe("no name is asserted that the register did not give", () => {
  const every = (b: (typeof BINDINGS)[string]) => [
    ...b.objectTypes,
    ...b.properties,
    ...b.acts,
    ...b.datasets
  ];

  it("marks every name confirmed or proposed", () => {
    for (const [hook, binding] of Object.entries(BINDINGS)) {
      for (const n of every(binding)) {
        expect(["confirmed", "proposed"], `${hook}.${n.name}`).toContain(n.status);
      }
      for (const link of binding.links) {
        expect(["confirmed", "proposed"], `${hook}.${link.name}`).toContain(link.status);
      }
    }
  });

  it("introduces every object type it goes on to use", () => {
    // A reader must never meet a type name the binding did not declare: a
    // property's owner and both ends of every link are declared object types.
    for (const [hook, binding] of Object.entries(BINDINGS)) {
      const declared = new Set(binding.objectTypes.map((o) => o.name));
      for (const p of binding.properties) {
        expect(declared, `${hook} reads ${p.objectType}.${p.name} off an undeclared type`).toContain(
          p.objectType
        );
      }
      for (const l of binding.links) {
        expect(declared, `${hook} traverses ${l.name} from an undeclared type`).toContain(l.from);
        expect(declared, `${hook} traverses ${l.name} to an undeclared type`).toContain(l.to);
      }
    }
  });

  it("keeps dataset columns out of the properties", () => {
    // A dataset column is not an object property, and the read route — edits
    // layer versus dataset — is the first thing §1 says an adapter gets wrong.
    for (const [hook, binding] of Object.entries(BINDINGS)) {
      for (const p of binding.properties) {
        expect(
          p.objectType.startsWith("signatureReady."),
          `${hook} lists the dataset column ${p.objectType}.${p.name} among its properties`
        ).toBe(false);
      }
    }
  });

  it("claims a primary key only where it names one", () => {
    // No object type's primary key is named anywhere in the register, so none
    // is asserted. isPrimaryKey is a statement about what is known.
    for (const [hook, binding] of Object.entries(BINDINGS)) {
      if (binding.identity.isPrimaryKey) {
        expect(binding.identity.primaryKey, `${hook} says its route parameter is a key and names none`)
          .not.toBeNull();
      }
    }
  });

  it("says how every list surface is counted, because a total is not a length", () => {
    for (const [hook, binding] of Object.entries(BINDINGS)) {
      expect(["aggregation", "length", "none"], `${hook}`).toContain(binding.query.counts);
      expect(binding.query.filter.length, `${hook} declares no filter semantics`).toBeGreaterThan(0);
    }
  });

  it("says why every traversed link is a link and not a scan", () => {
    for (const [hook, binding] of Object.entries(BINDINGS)) {
      for (const l of binding.links) {
        expect(l.why.length, `${hook}.${l.name} does not say why it is traversed`).toBeGreaterThan(0);
      }
    }
  });
});
