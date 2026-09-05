import { useParams, useSearchParams } from "react-router-dom";

import * as fx from "@/ui/data/fixtures";
import * as pj from "@/ui/data/project";
import * as sp from "@/ui/data/support";
import { PATHWAY_IDS } from "@/ui/data/pathways";

export type {
  Action,
  ActionLook,
  Answer,
  Archive,
  ArchiveRow,
  ArtifactView,
  Catalogue,
  CatalogueRow,
  Citable,
  Destination,
  DocumentType,
  ElementPanel,
  ExpertDraft,
  ExpertQueue,
  ExpertRow,
  ExpertStatus,
  Facet,
  FacetOption,
  Gate,
  GateSpec,
  Inbox,
  Learning,
  LearningTile,
  Mark,
  NavSection,
  PathwayId,
  PathwayState,
  ProjectHeader,
  ProjectRow,
  QuestionRow,
  Reference,
  ReferenceRow,
  Region,
  RegionState,
  Regulation,
  RegulationSection,
  RowSpec,
  SectionIcon,
  Session,
  SourceDocument,
  SourceKind,
  SourceRef,
  StepEntry,
  StepMark,
  StepSpec,
  SubmitBar,
  TabEntry,
  TabSpec,
  TileTone
} from "@/ui/data/types";

import type {
  Archive,
  ArtifactView,
  Catalogue,
  ElementPanel,
  ExpertDraft,
  ExpertQueue,
  Gate,
  Inbox,
  Learning,
  PathwayId,
  PathwayState,
  ProjectHeader,
  Reference,
  Region,
  Regulation,
  Session,
  SourceDocument,
  SourceKind,
  StepEntry
} from "@/ui/data/types";

export { sourceTitle, sectionsFor } from "@/ui/data/fixtures";
export { PAGES } from "@/ui/data/support";
export { CROSS_CUTTING, DOCUMENT_AUTHORITY, RETRIEVAL_PUSHES, TRIGGERS } from "@/ui/data/project";
export { DISCRETIONS, PATHWAYS, PATHWAY_IDS, stepsFor } from "@/ui/data/pathways";

/** The one seam. Screens read data only through the hooks below; swapping
 *  fixtures for OSDK queries happens here and nowhere else. Every hook is
 *  declared in `bindings.ts` — object type, properties, act and the section
 *  that requires it — and `port.bindings.test.ts` fails on one that is not.
 *
 *  Hooks take a parameter only where the fixture varies by it; the rest read
 *  the route through the router, and will take ids when the real queries land.
 */

const STATES = ["filled", "absent", "blocked", "unresolved"] as const;
export type StateKey = (typeof STATES)[number];

function key(raw: string | null): StateKey {
  const found = STATES.find((s) => s === raw);
  return found ?? "filled";
}

/** ?state= drives the screen's own region; ?shell= drives the project band and
 *  the step list; ?session=out signs the officer out; ?pathway= fixes the
 *  pathway Step 2 would have determined; ?gate=held gives the caller the
 *  credential the rule reserves; ?retrieval=down takes the drafting lane out.
 *  The four state words never appear on screen: they are in data-state. */
function useScreenKey(): StateKey {
  const [params] = useSearchParams();
  return key(params.get("state"));
}

/** Same parameter, different default. §6.1 says empty is the expected state at
 *  build time and should read as designed, so the pages with no backend
 *  address open absent and `?state=filled` shows the populated design. Which
 *  state a page opens in is a claim about the backend, not a preference. */
function useScreenKeyDefault(fallback: StateKey): StateKey {
  const [params] = useSearchParams();
  const raw = params.get("state");
  return STATES.find((s) => s === raw) ?? fallback;
}

function useShellKey(): StateKey {
  const [params] = useSearchParams();
  return key(params.get("shell"));
}

function usePathwayParam(): PathwayId | null {
  const [params] = useSearchParams();
  const raw = params.get("pathway");
  return PATHWAY_IDS.find((id) => id === raw) ?? null;
}

function useCredential(): boolean {
  const [params] = useSearchParams();
  return params.get("gate") === "held";
}

function useRetrievalUp(): boolean {
  const [params] = useSearchParams();
  return params.get("retrieval") !== "down";
}


export function useSession(): Region<Session> {
  const [params] = useSearchParams();
  return params.get("session") === "out" ? fx.sessionOut : fx.sessionIn;
}

export function useInbox(): Region<Inbox> {
  switch (useScreenKey()) {
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

export function useProject(): Region<ProjectHeader> {
  switch (useShellKey()) {
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

/** Which of P0–P4 Step 2 fixed, and so which steps exist. `null` is not an
 *  error: Steps 0–2 are shared, and before the determination is recorded the
 *  step list carries no pathway step and names none — §7.1. */
export function usePathway(): Region<PathwayState> {
  const state = useShellKey();
  const pathway = usePathwayParam();
  if (state === "absent") return pj.pathwayAbsent;
  if (state === "blocked") return pj.pathwayBlocked;
  if (state === "unresolved") return pj.pathwayUnresolved;
  return pj.pathwayState(pathway);
}

export function useSteps(): Region<StepEntry[]> {
  const state = useShellKey();
  const pathway = usePathwayParam();
  const params = useParams();
  if (state === "absent") return pj.stepsAbsentSpec;
  if (state === "blocked") return pj.stepsBlockedSpec;
  if (state === "unresolved") return pj.stepsUnresolvedSpec;
  return pj.stepEntries(pathway, params.stepId ?? "0");
}

/** The three surfaces the rule reserves to the responsible official. The
 *  interface presents the gate and cannot verify a credential: a gate held
 *  only in the client is not a gate. */
export function useGate(): Region<Gate> {
  const state = useScreenKey();
  const held = useCredential();
  if (state === "unresolved") return pj.gateUnresolved;
  return pj.gateFor(held);
}

export function useElement(tabId: string): Region<ElementPanel> {
  const state = useScreenKey();
  const pathway = usePathwayParam();
  const held = useCredential();
  const retrievalUp = useRetrievalUp();
  const params = useParams();
  if (state === "absent") return pj.elementAbsentSpec;
  if (state === "blocked") return pj.elementBlockedSpec;
  if (state === "unresolved") return pj.elementUnresolvedSpec;
  return pj.panelRegion(pathway, params.stepId ?? "0", tabId, held, retrievalUp);
}

export function useSource(kind: SourceKind): Region<SourceDocument> {
  const state = useScreenKey();
  if (state === "absent") return fx.sourceAbsent;
  if (state === "blocked") return fx.sourceBlocked;
  if (state === "unresolved") return fx.sourceUnresolved;
  return fx.sourceFilled(kind);
}

/* --- §6, the four supporting pages --- */

/** Placeholder rows by default, as on the inbox — the page has to show what
 *  it looks like holding something. `?state=absent` reaches what the backend
 *  actually holds today: §1 lists 17 acts and none deletes or restores, and
 *  no archived property exists on project. */
export function useArchive(): Region<Archive> {
  switch (useScreenKeyDefault("filled")) {
    case "filled":
      return sp.archiveFilled;
    case "blocked":
      return sp.archiveBlocked;
    case "unresolved":
      return sp.archiveUnresolved;
    default:
      return sp.archiveAbsent;
  }
}

/** Placeholder rows by default, so the queue and its compose overlay can be
 *  seen. `?state=absent` is the real state: both expert acts key on a slot
 *  and nothing creates one, so the queue is built and empty until that
 *  changes. */
export function useExpertQueue(): Region<ExpertQueue> {
  switch (useScreenKeyDefault("filled")) {
    case "filled":
      return sp.expertQueueFilled;
    case "blocked":
      return sp.expertQueueBlocked;
    case "unresolved":
      return sp.expertQueueUnresolved;
    default:
      return sp.expertQueueAbsent;
  }
}

export function useExpertRequest(): Region<ExpertDraft> {
  const retrievalUp = useRetrievalUp();
  return retrievalUp ? sp.expertDraftFilled : sp.expertDraftUnresolved;
}

export function useLearning(): Region<Learning> {
  switch (useScreenKey()) {
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

export function useReference(): Region<Reference> {
  switch (useScreenKey()) {
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
export function useReferenceArtifact(id: string): Region<ArtifactView> {
  return useScreenKeyDefault("blocked") === "filled" ? sp.artifactView(id) : sp.artifactBlocked;
}

export function useRegulation(): Region<Regulation> {
  return sp.regulationFilled;
}

/** Empty, and the section says why: category holds zero rows while the 87
 *  sit in ce_categories.json. */
export function useCatalogue(): Region<Catalogue> {
  return useScreenKeyDefault("absent") === "filled" ? sp.catalogueFilled : sp.catalogueAbsent;
}
