import { useSearchParams } from "react-router-dom";

import * as fx from "@/ui/data/fixtures";
import * as pj from "@/ui/data/project";
import * as sp from "@/ui/data/support";
import { PATHWAY_IDS } from "@/ui/data/pathways";

import type { DataPort } from "@/ui/data/port";
import type {
  Archive,
  ArtifactView,
  Catalogue,
  DocumentType,
  ElementPanel,
  ExpertDraft,
  ExpertQueue,
  Gate,
  Inbox,
  Learning,
  LevelHistory,
  PathwayId,
  ProjectHeader,
  Reference,
  Region,
  Regulation,
  Session,
  SourceDocument,
  SourceKind,
  StepRail,
  TabSpec
} from "@/ui/data/types";

/** The default implementation of the port: fixtures, one per state per screen,
 *  including refusals and a signed-out case. It is the FLOOR, not the only
 *  option — `port.ts` declares the contract and the shell injects whatever it
 *  likes over the top, surface by surface.
 *
 *  Everything that reads the URL lives in this file and nowhere else. The
 *  contract mentions none of it, so a surface wired live loses its knob
 *  automatically and the knob surface shrinks by exactly one member per
 *  `composePort` line. That is what makes the knobs dev-only without a build
 *  flag — and gating them on `import.meta.env.DEV` would be wrong anyway,
 *  because they are the FDE's whole QA and demo surface in the deployed
 *  preview, and a stakeholder walkthrough of an empty ontology needs them.
 */

const STATES = ["pending", "filled", "absent", "blocked", "unresolved"] as const;
export type StateKey = (typeof STATES)[number];

/** ?state= drives the screen's own region; ?shell= drives the project band and
 *  the step list; ?session=out signs the officer out; ?pathway= fixes the
 *  pathway Step 2 would have determined; ?gate=held gives the caller the
 *  credential the rule reserves; ?retrieval=down takes the drafting lane out.
 *  The five state words never appear on screen: they are in data-state. */
export interface Overrides {
  /** null means the knob is not set, so each member applies its own default.
   *  Carrying the raw value rather than resolving it here is what removes the
   *  old asymmetry where `?state=garbage` read as "filled" on one page and as
   *  that page's own fallback on another. */
  state: StateKey | null;
  shell: StateKey | null;
  rail: StateKey | null;
  /** The levels this proposal has occupied, IN ORDER. `?levels=P3,P4` is a
   *  whole escalation in one URL: P3 superseded and still readable, P4 live.
   *  `?pathway=P3` is accepted as the one-level alias so every existing link,
   *  bookmark and test keeps working. */
  levels: PathwayId[];
  session: "in" | "out" | "pending";
  held: boolean;
  retrievalUp: boolean;
}

function sessionKnob(raw: string | null): Overrides["session"] {
  if (raw === "out") {
    return "out";
  }
  if (raw === "pending") {
    return "pending";
  }
  return "in";
}

/** Pure, so the whole knob surface is testable without a router. */
export function readOverrides(params: URLSearchParams): Overrides {
  const state = params.get("state");
  const shell = params.get("shell");
  const rail = params.get("rail");
  const levels = (params.get("levels") ?? params.get("pathway") ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is PathwayId => PATHWAY_IDS.some((id) => id === part));
  return {
    state: STATES.find((s) => s === state) ?? null,
    shell: STATES.find((s) => s === shell) ?? null,
    /* Split out of `shell` so the band and the rail can be in different
       states. They read the same knob before, so the partial failure a
       half-wired backend produces most often was unreachable. */
    rail: STATES.find((s) => s === rail) ?? null,
    levels,
    session: sessionKnob(params.get("session")),
    held: params.get("gate") === "held",
    retrievalUp: params.get("retrieval") !== "down"
  };
}

/** The ONE hook in this file that reads the router, and the only reason the
 *  fixture port needs a Router above it. Every member calls it first and
 *  unconditionally, which is also the shape a live member must take: a port
 *  member has to be callable during render whatever the branch, or an async
 *  implementation breaks the rules of hooks the first time it lands. */
function useOverrides(): Overrides {
  const [params] = useSearchParams();
  return readOverrides(params);
}

/** Pending and absent are one question at two times, so a pending fixture is
 *  DERIVED from its absent twin rather than authored beside it: there is one
 *  query string and it cannot drift. `host-contract.test.ts` fails on a
 *  pending region whose query is empty, which is what a twin built from a
 *  region that carries no query would produce. */
function asking<T>(twin: Region<T>): Region<T> {
  return fx.pending(twin.state === "absent" ? twin.query : "", twin.sources);
}

/* --- the fifteen members ---------------------------------------------------

   Every member calls useOverrides() first and unconditionally, then branches.
   No member calls a hook inside a branch, and no member takes an early return
   before its last hook call. Both are load-bearing: a live implementation
   turns these bodies into queries, and a query behind a branch is a rules-of-
   hooks violation the moment the first surface goes async. */

/** The signed-in officer, or the case where there is no session. Real auth
 *  lives in the shell, so this member is the first one an integration
 *  replaces — `<DataPortProvider session={...}>` does it in one line without
 *  composing a port at all. */
function useSession(): Region<Session> {
  const o = useOverrides();
  if (o.session === "pending") {
    return fx.pending("⟨session.principal_lookup⟩");
  }
  return o.session === "out" ? fx.sessionOut : fx.sessionIn;
}

function useInbox(): Region<Inbox> {
  const o = useOverrides();
  switch (o.state ?? "filled") {
    case "pending":
      return asking(fx.inboxAbsent);
    case "absent":
      return fx.inboxAbsent;
    case "blocked":
      return fx.inboxBlocked;
    case "unresolved":
      return fx.inboxUnresolved;
    default:
      return fx.inboxFilled;
  }
}

function useProject(_projectRef: string): Region<ProjectHeader> {
  const o = useOverrides();
  switch (o.shell ?? "filled") {
    case "pending":
      return asking(fx.projectAbsent);
    case "absent":
      return fx.projectAbsent;
    case "blocked":
      return fx.projectBlocked;
    case "unresolved":
      return fx.projectUnresolved;
    default:
      return fx.projectFilled;
  }
}

function useLevels(_projectRef: string): Region<LevelHistory> {
  const o = useOverrides();
  switch (o.shell ?? "filled") {
    case "pending":
      return asking(pj.levelsAbsent);
    case "absent":
      return pj.levelsAbsent;
    case "blocked":
      return pj.levelsBlocked;
    case "unresolved":
      return pj.levelsUnresolved;
    default:
      return pj.levelHistory(o.levels);
  }
}

function useSteps(_projectRef: string, stepKey: string): Region<StepRail> {
  const o = useOverrides();
  switch (o.rail ?? o.shell ?? "filled") {
    case "pending":
      return asking(pj.stepsAbsentSpec);
    case "absent":
      return pj.stepsAbsentSpec;
    case "blocked":
      return pj.stepsBlockedSpec;
    case "unresolved":
      return pj.stepsUnresolvedSpec;
    default:
      return pj.stepRail(o.levels, stepKey || "S.0");
  }
}

/** §7.7's ten tabs, through the port rather than as a static import. */
function useCrossCutting(_projectRef: string): Region<TabSpec[]> {
  const o = useOverrides();
  if (o.state === "pending") {
    return fx.pending("⟨element.byDocument · the ten cross-cutting surfaces⟩");
  }
  if (o.state === "unresolved") {
    return fx.unresolved(
      "The cross-cutting tabs could not be read",
      "no object type carries a cross-cutting surface; they come from the rule and not from data"
    );
  }
  return fx.filled(pj.CROSS_CUTTING);
}

/** The three surfaces the rule reserves to the responsible official. The
 *  interface presents the gate and cannot verify a credential: a gate held
 *  only in the client is not a gate. */
function useGate(documentType: DocumentType | null): Region<Gate> {
  const o = useOverrides();
  if (o.state === "pending") {
    return fx.pending("⟨authority.credential_lookup⟩");
  }
  if (o.state === "unresolved") {
    return pj.gateUnresolved;
  }
  return pj.gateFor(documentType, o.held);
}

function useElement(_projectRef: string, stepKey: string, tabId: string): Region<ElementPanel> {
  const o = useOverrides();
  /* A step key is `E<seq>.<PathwayId>.<localId>`, or a bare local id from an
     older link. Both resolve; the bare one resolves against the live level. */
  const local = stepKey.includes(".") ? stepKey.slice(stepKey.lastIndexOf(".") + 1) : stepKey;
  switch (o.state ?? "filled") {
    case "pending":
      return asking(pj.elementAbsentSpec);
    case "absent":
      return pj.elementAbsentSpec;
    case "blocked":
      return pj.elementBlockedSpec;
    case "unresolved":
      return pj.elementUnresolvedSpec;
    default:
      return pj.panelRegion(o.levels, local || "0", tabId, o.held, o.retrievalUp);
  }
}

function useSource(kind: SourceKind): Region<SourceDocument> {
  const o = useOverrides();
  switch (o.state ?? "filled") {
    case "pending":
      return asking(fx.sourceAbsent);
    case "absent":
      return fx.sourceAbsent;
    case "blocked":
      return fx.sourceBlocked;
    case "unresolved":
      return fx.sourceUnresolved;
    default:
      return fx.sourceFilled(kind);
  }
}

/* --- §6, the four supporting pages --- */

/** Placeholder rows by default, as on the inbox — the page has to show what
 *  it looks like holding something. `?state=absent` reaches what the backend
 *  actually holds today: §1 lists 17 acts and none deletes or restores, and
 *  no archived property exists on project. */
function useArchive(): Region<Archive> {
  const o = useOverrides();
  switch (o.state ?? "filled") {
    case "pending":
      return asking(sp.archiveAbsent);
    case "absent":
      return sp.archiveAbsent;
    case "blocked":
      return sp.archiveBlocked;
    case "unresolved":
      return sp.archiveUnresolved;
    default:
      return sp.archiveFilled;
  }
}

/** Placeholder rows by default, so the queue and its compose overlay can be
 *  seen. `?state=absent` is the real state: both expert acts key on a slot
 *  and nothing creates one, so the queue is built and empty until that
 *  changes. */
function useExpertQueue(): Region<ExpertQueue> {
  const o = useOverrides();
  switch (o.state ?? "filled") {
    case "pending":
      return asking(sp.expertQueueAbsent);
    case "absent":
      return sp.expertQueueAbsent;
    case "blocked":
      return sp.expertQueueBlocked;
    case "unresolved":
      return sp.expertQueueUnresolved;
    default:
      return sp.expertQueueFilled;
  }
}

function useExpertRequest(): Region<ExpertDraft> {
  const o = useOverrides();
  if (o.state === "pending") {
    return fx.pending("⟨assignment.draft_query⟩");
  }
  return o.retrievalUp ? sp.expertDraftFilled : sp.expertDraftUnresolved;
}

function useLearning(): Region<Learning> {
  const o = useOverrides();
  switch (o.state ?? "filled") {
    case "pending":
      return asking(sp.learningAbsent);
    case "absent":
      return sp.learningAbsent;
    case "blocked":
      return sp.learningBlocked;
    case "unresolved":
      return sp.learningUnresolved;
    default:
      return sp.learningFilled;
  }
}

function useReference(): Region<Reference> {
  const o = useOverrides();
  switch (o.state ?? "filled") {
    case "pending":
      return asking(sp.referenceAbsent);
    case "absent":
      return sp.referenceAbsent;
    case "blocked":
      return sp.referenceBlocked;
    case "unresolved":
      return sp.referenceUnresolved;
    default:
      return sp.referenceFilled;
  }
}

/** The viewer. Blocked by default and it says what on: whether an OSDK front
 *  end can read media-set bytes, and by what route, is not answerable from
 *  the interface side, so the card carries metadata, digest and page-range
 *  citation meanwhile. */
function useReferenceArtifact(id: string): Region<ArtifactView> {
  const o = useOverrides();
  if (o.state === "pending") {
    return fx.pending("⟨corpus.artifact_lookup⟩");
  }
  return (o.state ?? "blocked") === "filled" ? sp.artifactView(id) : sp.artifactBlocked;
}

function useRegulation(): Region<Regulation> {
  const o = useOverrides();
  if (o.state === "pending") {
    return fx.pending("⟨corpus.text.regulation_query⟩");
  }
  return sp.regulationFilled;
}

/** Empty, and the section says why: category holds zero rows while the 87
 *  sit in ce_categories.json. */
function useCatalogue(): Region<Catalogue> {
  const o = useOverrides();
  if (o.state === "pending") {
    return asking(sp.catalogueAbsent);
  }
  return (o.state ?? "absent") === "filled" ? sp.catalogueFilled : sp.catalogueAbsent;
}

/** The whole contract, implemented. Injecting a live surface is one line per
 *  surface against this object — see `composePort` in `port.ts`. */
export const fixturePort: DataPort = {
  useSession,
  useInbox,
  useProject,
  useLevels,
  useSteps,
  useGate,
  useCrossCutting,
  useElement,
  useSource,
  useArchive,
  useExpertQueue,
  useExpertRequest,
  useLearning,
  useReference,
  useReferenceArtifact,
  useRegulation,
  useCatalogue
};
