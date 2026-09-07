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
  useSteps(projectRef: string, stepId: string): Region<StepEntry[]>;
  useGate(): Region<Gate>;
  useElement(projectRef: string, stepId: string, tabId: string): Region<ElementPanel>;
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
