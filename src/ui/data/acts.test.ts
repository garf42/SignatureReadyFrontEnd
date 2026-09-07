import { describe, expect, it } from "vitest";

import { ACTS } from "@/ui/data/acts";
import { BINDINGS } from "@/ui/data/bindings";

/** The rules acts.ts states, held as tests so they cannot be stated and then
 *  broken. Nothing here reads the register or either amendment: those
 *  documents govern this build and do not travel with the packet, so a test
 *  that needed one would fail the moment the tree arrived anywhere else. */

const acts = Object.values(ACTS);
const surfaces = Object.keys(BINDINGS);

describe("the seventeen acts", () => {
  it("declares seventeen, because §1 lists seventeen", () => {
    expect(acts.length).toBe(17);
  });

  it("keys every act by its own API name, so neither can drift", () => {
    for (const [key, act] of Object.entries(ACTS)) {
      expect(act.apiName).toBe(key);
    }
  });

  it("carries the signature-ready- prefix on every one", () => {
    for (const act of acts) {
      expect(act.apiName.startsWith("signature-ready-"), act.apiName).toBe(true);
    }
  });

  it("names what every act writes, as objectType.property", () => {
    for (const act of acts) {
      expect(act.writes.length, `${act.apiName} writes nothing`).toBeGreaterThan(0);
      for (const w of act.writes) {
        expect(w, `${act.apiName} writes ${w}`).toMatch(/^[a-zA-Z]+\.[a-zA-Z]+$/);
      }
    }
  });

  it("takes an actor from current_user_id on six, which is what §1's table shows", () => {
    // §1's prose says four and its own table says six. The table is followed;
    // this figure is here so a silent change to either has to be argued for.
    const attributing = acts.filter((a) => a.actor === "current_user_id");
    expect(attributing.map((a) => a.apiName).sort()).toEqual([
      "signature-ready-adopt",
      "signature-ready-emit-document",
      "signature-ready-publish-under-compulsion",
      "signature-ready-record-branch",
      "signature-ready-record-consistency-finding",
      "signature-ready-record-determination"
    ]);
  });
});

describe("one failure rule, derived and not chosen per act", () => {
  it("takes blocked where the surface is reserved and unresolved everywhere else", () => {
    for (const act of acts) {
      const expected = act.reserved ? "blocked" : "unresolved";
      expect(act.onFailure.region, `${act.apiName} is reserved=${Boolean(act.reserved)}`).toBe(
        expected
      );
    }
  });

  it("reserves the five acts that write a surface §7.2's access-gate table names", () => {
    // open-determination is deliberately absent: §7.2 reserves the five
    // determinations, and §1 says of that act "opening is not deciding".
    expect(acts.filter((a) => a.reserved).map((a) => a.apiName).sort()).toEqual([
      "signature-ready-emit-document",
      "signature-ready-record-branch",
      "signature-ready-record-determination",
      "signature-ready-record-determination-outcome",
      "signature-ready-state-factor-finding"
    ]);
  });

  it("says something on every failure, and never a state word", () => {
    for (const act of acts) {
      expect(act.onFailure.message.length, act.apiName).toBeGreaterThan(0);
      for (const word of ["pending", "absent", "blocked", "unresolved"]) {
        expect(act.onFailure.message.toLowerCase(), act.apiName).not.toContain(word);
      }
    }
  });
});

describe("a gate held only in the client is not a gate — §7.2", () => {
  /** The doctrine is a REQUIREMENT, and today it is unmet: §7.2 reserves six
   *  classes of surface to a named holder, and §1 records that no platform
   *  predicate marks a caller's class. So every reserved surface is reserved by
   *  the regulation and enforced by nothing, and the interface's withholding is
   *  the only gate there is — which is precisely what §7.2 calls not a gate.
   *
   *  That is the most consequential fact in this file, so it is asserted rather
   *  than mentioned. An act that gains a real platform refusal moves the note
   *  from `needed` to `backendRejects` and this test is what makes that a
   *  deliberate edit. */
  it("makes every reserved act say the arbiter does not exist yet", () => {
    for (const act of acts.filter((a) => a.reserved)) {
      const said = (act.needed.join(" ") + " " + act.backendRejects.join(" ")).toLowerCase();
      expect(
        /platform predicate/.test(said),
        `${act.apiName} is reserved and does not say what holds the gate`
      ).toBe(true);
    }
  });

  it("never lets a reserved act claim the interface verified a credential", () => {
    for (const act of acts.filter((a) => a.reserved)) {
      for (const check of act.preChecks) {
        expect(
          /verif(y|ies|ied)/i.test(check) && /credential/i.test(check),
          `${act.apiName} pre-checks a credential the interface cannot verify`
        ).toBe(false);
      }
    }
  });
});

describe("invalidation is stated in the port's own vocabulary", () => {
  it("names only real port members, so an adapter can act on it mechanically", () => {
    for (const act of acts) {
      for (const member of act.onSuccess.invalidates) {
        expect(surfaces, `${act.apiName} invalidates ${member}, which is not a surface`).toContain(
          member
        );
      }
    }
  });

  it("stales something on every act the interface actually offers", () => {
    // An act with no surface stales nothing, which is correct rather than an
    // oversight — and it has to say so in `unplaced` to be allowed to.
    for (const act of acts.filter((a) => a.unplaced === null)) {
      expect(act.onSuccess.invalidates.length, `${act.apiName} stales nothing`).toBeGreaterThan(0);
    }
  });
});

describe("no name is asserted that the register did not give", () => {
  it("marks every parameter confirmed or proposed", () => {
    for (const act of acts) {
      for (const p of act.params) {
        expect(["confirmed", "proposed"], `${act.apiName}.${p.name}`).toContain(p.status);
      }
    }
  });

  it("says on a proposed parameter that it is proposed, in the note a reader will see", () => {
    for (const act of acts) {
      for (const p of act.params.filter((x) => x.status === "proposed")) {
        expect(p.note ?? "", `${act.apiName}.${p.name} is proposed and does not say so`).toMatch(
          /proposed|not measured|never (names|publishes)|not recorded/i
        );
      }
    }
  });

  it("never part-fills a closed set: a half-listed set reads as a complete one", () => {
    for (const act of acts) {
      for (const p of act.params) {
        if (p.closedSet) {
          expect(p.closedSet.length, `${act.apiName}.${p.name}`).toBeGreaterThan(1);
        }
      }
    }
  });
});

describe("every act says where it is offered and what it still needs", () => {
  it.each(Object.keys(ACTS))("%s is either placed in the interface or says why not", (key) => {
    const act = ACTS[key];
    expect(act.serves.length).toBeGreaterThan(0);
    // Exactly one of the two: a surface, or a declared reason there is none.
    // An empty list with no reason is the oversight this rules out.
    expect(act.offeredOn.length > 0, `${key}`).toBe(act.unplaced === null);
    if (act.unplaced !== null) {
      expect(act.unplaced.length).toBeGreaterThan(0);
    }
  });

  it("leaves exactly one act unplaced, and names it, because that is a finding about the design", () => {
    expect(acts.filter((a) => a.unplaced !== null).map((a) => a.apiName)).toEqual([
      "signature-ready-record-consistency-finding"
    ]);
  });

  it("names what is missing wherever the act cannot be run today", () => {
    for (const act of acts.filter((a) => a.status !== "exercisable")) {
      expect(act.needed.length, `${act.apiName} is ${act.status} and needs nothing`).toBeGreaterThan(
        0
      );
    }
  });
});
