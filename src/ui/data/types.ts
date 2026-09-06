/** The four states every region is in. These four words never reach the screen:
 *  they are told apart by shape, and carried in a data-state attribute.
 *
 *  filled     — a value arrived.
 *  absent     — a query ran and found nothing. That is an answer, and the
 *               region carries the query it asked.
 *  blocked    — a precondition is unmet; names what it waits on.
 *  unresolved — the lane could not have answered. Always a defect.
 */
export type RegionState = "filled" | "absent" | "blocked" | "unresolved";

/** The kinds of primary source a value can be traced to. A person is not one
 *  of them: an officer's name is a name, and there is nothing to open behind
 *  it. */
export type SourceKind = "rule" | "record" | "document" | "inputs";

/** Where a value came from, stated on the line under it. Where `kind` is set
 *  the line opens the primary source; where it is not, the line is text. */
export interface SourceRef {
  kind?: SourceKind;
  /** Plain words first, e.g. "Retrieved from the project record · ". */
  lead: string;
  /** The address itself, always a register-supplied marker. */
  label: string;
}

export interface SourceDocument {
  reference: string;
  primary: string;
  full: Destination;
}

export interface Destination {
  label: string;
  href: string;
}

export type ActionLook = "primary" | "secondary" | "destructive" | "link";

export interface Action {
  id: string;
  label: string;
  look: ActionLook;
  enabled: boolean;
}

export type Region<T> =
  | { state: "filled"; value: T; sources: SourceRef[]; actions: Action[] }
  | { state: "absent"; message: string; query: string; sources: SourceRef[]; actions: Action[] }
  | {
      state: "blocked";
      message: string;
      waitingOn: string;
      destination?: Destination;
      sources: SourceRef[];
      actions: Action[];
    }
  | { state: "unresolved"; message: string; reason: string; sources: SourceRef[]; actions: Action[] };

/** How a filled answer is written down. A proposal never renders as an answer
 *  of record: "draft" is sans and soft, "value" is serif and ink. */
export type Answer =
  | { form: "quote"; text: string }
  | { form: "value"; text: string }
  | { form: "draft"; text: string }
  | { form: "select"; options: string[] }
  | { form: "choice"; prompt: string; options: string[] }
  | { form: "sourcesOnly" };

export type Mark = "accepted" | "review" | "waiting" | "error" | "ready";

export interface QuestionRow {
  id: string;
  ref: string;
  label: string;
  help?: string;
  mark: Mark;
  answer: Region<Answer>;
  /** §7.2. Set where the rule reserves this surface to a named holder. The
   *  row is visible and in place either way; what changes is the act offered. */
  gate?: Gate;
  /** §7.9. A permission in the rule. Nothing may turn it into a requirement,
   *  so the submit bar does not count it as outstanding. */
  discretionary?: boolean;
}

export interface SubmitBar {
  label: string;
  undoLabel: string;
  enabled: boolean;
  note?: string;
  destination?: Destination;
  source?: SourceRef;
}

export interface ElementPanel {
  title: string;
  help: string;
  progress: string;
  rows: QuestionRow[];
  submit: SubmitBar;
}

export type StepMark = "completed" | "active" | "waiting" | "error";

export interface TabEntry {
  id: string;
  name: string;
  done: boolean;
}

export interface StepEntry {
  id: string;
  n: number;
  name: string;
  mark: StepMark;
  meta: string;
  tabs: TabEntry[];
}

export interface ProjectHeader {
  name: string;
  ref: string;
  office: string;
  status: string;
  summary: string;
}

export type SectionIcon = "inbox" | "documents" | "archive" | "learning" | "people";

export interface NavSection {
  id: string;
  name: string;
  icon: SectionIcon;
  href: string;
  current: boolean;
}

export interface ProjectRow {
  id: string;
  name: string;
  changed: string;
  position: string;
  mark: Mark;
  summary: string;
  meta: string;
  startedBy: SourceRef;
}

export interface Inbox {
  sections: NavSection[];
  heading: string;
  count: string;
  filters: string[];
  sorts: string[];
  projects: ProjectRow[];
}

export interface Session {
  officer: SourceRef;
}

/* --------------------------------------------------------------------------
 * §7 — the project page. Pathways, the signature gate, and the trigger map.
 * ------------------------------------------------------------------------ */

import type { PathwayId } from "@/ui/data/pathways";

export type { DocumentType, GateSpec, PathwayId, RowSpec, StepSpec, TabSpec } from "@/ui/data/pathways";

/** Which pathway Step 2 fixed. `null` is the state before it is fixed, and it
 *  is not an error: Steps 0–2 exist on every pathway, and until the
 *  determination is recorded the step list names no pathway step. */
export interface PathwayState {
  pathway: PathwayId | null;
  /** The words shown where a pathway is not yet fixed. */
  note: string;
  reachedWhen: string;
  terminalOutput: string;
}

/** A surface the rule reserves to a named holder. `held` is what the caller
 *  can be shown to have; the interface can never assert it, so a false value
 *  withholds the act and offers the routing, and the platform refuses the
 *  write either way. */
export interface Gate {
  reservedTo: string;
  citation: string;
  routeLabel: string;
  held: boolean;
  /** Why the interface cannot verify the credential. Rendered, never hidden. */
  cannotVerify: string;
}

/* --------------------------------------------------------------------------
 * §6 — the four supporting pages.
 * ------------------------------------------------------------------------ */

export interface ArchiveRow {
  id: string;
  name: string;
  archived: string;
  archivedBy: SourceRef | null;
  position: string;
  mark: Mark;
  summary: string;
  meta: string;
}

export interface Archive {
  count: string;
  rows: ArchiveRow[];
}

export type ExpertStatus = "overdue" | "awaiting" | "returned" | "accepted";

export interface ExpertRow {
  id: string;
  /** The holder's own placeholder, not a provenance line: this column is a
   *  name, the way the inbox's first column is a project name. */
  expert: string;
  qualification: string;
  discipline: string;
  project: string;
  awaiting: string;
  sent: string;
  expectedReturn: string;
  status: ExpertStatus;
  /** Written by accept-artifact, and shown on the row rather than buried. */
  gapsFound: string | null;
  /** Who sent it. Null because no expert act writes an actor — §6.4. */
  sentBy: SourceRef | null;
}

export interface ExpertQueue {
  count: string;
  filters: string[];
  sorts: string[];
  rows: ExpertRow[];
}

/** The drafted request in the compose overlay. Assembled from the project and
 *  the finding that triggered it; the body is editable and copy-pasteable. */
export interface ExpertDraft {
  project: string;
  uniqueIdentificationNumber: string;
  trigger: string;
  artifactAwaited: string;
  expectedReturn: string;
  regulatoryBasis: SourceRef;
  proposedRecipient: string;
  body: string;
}

export type TileTone = "plain" | "warn" | "error";

export interface LearningTile {
  id: string;
  title: string;
  figure: string;
  unit: string;
  tone: TileTone;
  note: string;
}

export interface Learning {
  /** Tiles 1 and 2 — grounding honesty and mechanism status. */
  status: LearningTile[];
  tiles: LearningTile[];
}

export type Citable = "yes" | "no" | "not-declared";

export interface FacetOption {
  label: string;
  count: string;
}

export interface Facet {
  id: string;
  name: string;
  options: FacetOption[];
}

export interface ReferenceRow {
  id: string;
  title: string;
  corpus: string;
  documentType: string;
  /** Never omitted: a corpus artifact never appears without its rule vintage. */
  ruleVintage: string;
  citable: Citable;
  extractability: string;
  sha256: string;
  byteLength: string;
  /** Recorded on every row and deliberately not wired into the classifier. */
  minCharsOnAPage: string;
  warnings: string[];
}

export interface Reference {
  count: string;
  filters: string[];
  sorts: string[];
  facets: Facet[];
  rows: ReferenceRow[];
}

export interface ArtifactView {
  row: ReferenceRow;
  /** The addressable unit is a page range, not a document. */
  pageRange: string;
  opensAt: string;
  caveats: string[];
}

export interface RegulationSection {
  id: string;
  name: string;
  amended: string;
  note: string | null;
  /** The section's own text, read in full on the page. */
  body: string;
}

export interface Regulation {
  pin: string;
  currency: string;
  sections: RegulationSection[];
  /** Places where the current text cites a paragraph that does not exist.
   *  Shown as found: a resolver that quietly repairs them hides a finding. */
  unresolvedCitations: string[];
}

export interface CatalogueRow {
  citation: string;
  descriptionVerbatim: string;
  documentationRequired: boolean;
}

export interface Catalogue {
  split: string;
  rows: CatalogueRow[];
}
