import { createContext, createElement, useContext, useMemo } from "react";
import type { ReactNode } from "react";

import { fixturePort } from "@/ui/data/fixturePort";

export type {
  Action,
  ActionLook,
  Answer,
  Archive,
  ArchiveRow,
  ArtifactView,
  Catalogue,
  Assembly,
  CatalogueRow,
  Citable,
  Destination,
  DocumentType,
  BandEntry,
  BandRef,
  DocumentLedgerEntry,
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
  Level,
  LevelEpisode,
  LevelHistory,
  LevelState,
  Mark,
  Modality,
  NavSection,
  Options,
  PathwayId,
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
  StepRail,
  StepSpec,
  SubmitBar,
  TabEntry,
  TabSpec,
  TextState,
  TileTone
} from "@/ui/data/types";

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
  ProjectHeader,
  Reference,
  Region,
  Regulation,
  Session,
  SourceDocument,
  SourceKind,
  StepRail
} from "@/ui/data/types";

export { sourceTitle, sectionsFor } from "@/ui/data/fixtures";
export { PAGES } from "@/ui/data/support";
export {
  COMPETENCE_CONDITIONS,
  CROSS_CUTTING,
  DOCUMENT_AUTHORITY,
  RETRIEVAL_PUSHES,
  TRANSITIONS,
  TRIGGERS
} from "@/ui/data/project";
export {
  DISCRETIONS,
  FILL_SAYS,
  LEVELS,
  LEVEL_IDS,
  PATHWAYS,
  PATHWAY_IDS,
  REOPEN_STEP,
  railFor,
  ridFor,
  stepsFor
} from "@/ui/data/pathways";
export { coverage } from "@/ui/data/coverage";

/** The one seam, and from here on it is a CONTRACT rather than an
 *  implementation.
 *
 *  Screens read data only through `usePort()`. The fixture implementation in
 *  `fixturePort.ts` is the default, so nothing has to be provided for the tree
 *  to run; a shell that has a backend supplies its own implementation over the
 *  top, surface by surface, and NO FILE UNDER `src/ui/` IS EDITED to do it.
 *  That matters most during the long incremental period when some surfaces are
 *  live and others are still fixtures — `composePort` makes mixing one line
 *  per surface.
 *
 *  Every member is declared in `bindings.ts` — object type, properties, act
 *  and the section that requires it — and `port.bindings.test.ts` fails on one
 *  that is not.
 *
 *  TWO CONSTRAINTS ON ANY IMPLEMENTATION, because an async one depends on
 *  them:
 *
 *  1. Every member must be callable unconditionally during render. A caller
 *     invokes it before it knows whether it needs the value.
 *  2. No member may call a hook inside a branch, or take an early return
 *     before its last hook call. A query behind a branch is a rules-of-hooks
 *     violation the moment that surface goes async.
 *
 *  Members take the ids they address rather than reading the router, so an
 *  implementation is not tied to a route shape and cannot depend on which
 *  route a parameter was declared on. The parameters ARE the contract: a live
 *  `useProject` with no project reference cannot run.
 */
export interface DataPort {
  /** The signed-in officer, and the signed-out case. Real auth lives in the
   *  shell, so this is the member an integration replaces first — see the
   *  `session` prop on `DataPortProvider`. */
  useSession(): Region<Session>;
  useInbox(): Region<Inbox>;
  useProject(projectRef: string): Region<ProjectHeader>;
  /** Which levels of NEPA review this proposal has occupied, in order.
   *
   *  Wire this FIRST: everything downstream keys on it. It needs three things
   *  the platform does not have today, and each is a decision rather than a
   *  wiring gap. (a) A CONVENTION mapping `determination.outcome` onto P0–P4:
   *  the property is free text, so nothing decodes a level from it, and if the
   *  convention is invented privately the two sides will disagree with nothing
   *  to detect it. (b) A SUPERSESSION edge, so an ordered history has an
   *  address; until it exists this member returns `unresolved`, which is a
   *  demoable state and not a bug. (c) An ordering that is NOT a client-supplied
   *  timestamp — `decidedAt` is a parameter the browser sets.
   *
   *  And one constraint the FDE must not write as stated: uniqueness over
   *  (project, whichDetermination), written blanket, permanently forecloses
   *  reopening. Scope it to the unsuperseded row — at most one LIVE
   *  determination of each kind, with an ordered history behind it. */
  useLevels(projectRef: string): Region<LevelHistory>;
  useSteps(projectRef: string, stepKey: string): Region<StepRail>;
  /** Takes the document whose surface is being asked about. It took no argument
   *  and returned one gate for the whole application whose citation was all
   *  three joined, so per-document authority was inexpressible. */
  useGate(documentType: DocumentType | null): Region<Gate>;
  useElement(projectRef: string, stepKey: string, tabId: string): Region<ElementPanel>;
  useSource(kind: SourceKind): Region<SourceDocument>;
  useArchive(): Region<Archive>;
  useExpertQueue(): Region<ExpertQueue>;
  useExpertRequest(): Region<ExpertDraft>;
  useLearning(): Region<Learning>;
  useReference(): Region<Reference>;
  useReferenceArtifact(id: string): Region<ArtifactView>;
  useRegulation(): Region<Regulation>;
  useCatalogue(): Region<Catalogue>;
}

/** The fixture port is the DEFAULT and not merely the usual choice. A required
 *  provider would make the fixture path opt-in, so a screen mounted in
 *  isolation — or a test that forgets the wrapper — would get nothing instead
 *  of fixtures. A default value makes fixtures the floor: you have to work to
 *  get anything else. */
const PortContext = createContext<DataPort>(fixturePort);

export function usePort(): DataPort {
  return useContext(PortContext);
}

/** Mix a live implementation into the fixtures, one surface at a time:
 *
 *    composePort({ useInbox: live.useInbox })
 *
 *  Anything not named keeps its fixture, so a half-wired application is a
 *  normal state rather than a broken one — and a surface that goes live loses
 *  its URL knob automatically, because the knobs live in the fixture members
 *  that were replaced. */
export function composePort(over: Partial<DataPort>): DataPort {
  return { ...fixturePort, ...over };
}

interface ProviderProps {
  /** Omit it and the tree runs on fixtures. */
  port?: DataPort;
  /** The shell's own session, which is where real auth lives. Supplying it
   *  overrides `useSession` on whatever port is in force, so an integration
   *  that has authentication and no ontology yet needs one prop and no port.
   *  It is read on every render, so a session that is still `pending` becomes
   *  `filled` without remounting anything. */
  session?: Region<Session>;
  children: ReactNode;
}

export function DataPortProvider({ port, session, children }: ProviderProps) {
  const value = useMemo<DataPort>(() => {
    const base = port ?? fixturePort;
    return session === undefined ? base : { ...base, useSession: () => session };
  }, [port, session]);
  return createElement(PortContext.Provider, { value }, children);
}
