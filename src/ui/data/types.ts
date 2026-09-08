/** The five states every region is in. These five words never reach the screen:
 *  they are told apart by shape, and carried in a data-state attribute.
 *
 *  pending    — a request is out and no usable value is held. Not an answer,
 *               so it carries no message; it carries the query it is ASKING,
 *               the same string it will carry as absent if that query comes
 *               back empty. One question, two tenses.
 *  filled     — a value arrived.
 *  absent     — a query ran and found nothing. That is an answer, and the
 *               region carries the query it asked.
 *  blocked    — a precondition is unmet; names what it waits on.
 *  unresolved — the lane could not have answered. Always a defect.
 *
 *  The mapping from a backend outcome to one of the five is fixed, so an
 *  adapter is mechanical rather than interpretive:
 *
 *    request in flight, no usable cached value        → pending
 *    query succeeded, zero rows                       → absent
 *    caller lacks the credential the rule reserves,
 *      or the surface has no backend address          → blocked
 *    query or lane failed, or returned a defect       → unresolved
 *    query succeeded with rows                        → filled
 *
 *  A request that outlives its deadline is unresolved, not a slower pending:
 *  the port owns that deadline, so no component holds a clock.
 */
export type RegionState = "pending" | "filled" | "absent" | "blocked" | "unresolved";

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
  /** No message: the only sentence pending could carry is its own state word,
   *  and the state words never reach the screen. No duration either — see the
   *  deadline note above. `sources` may cite the rule, which is known before
   *  any query returns; a record-kind source here would claim retrieval from a
   *  record that has not answered, and is a defect in the fixture. */
  | { state: "pending"; query: string; sources: SourceRef[]; actions: Action[] }
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
   *  so the submit bar does not count it as outstanding. Derived from
   *  `modality` and never set beside it. */
  discretionary?: boolean;
  /** What the rule does with this row, in its own force. The renderer has one
   *  branch per member, so imperative copy cannot reach a permission. */
  modality: Modality;
  /** Where the row's own words come from. `placeholder` means the rule's text
   *  is not in the build and the row is not answerable by a non-specialist. */
  textState: TextState;
  /** The Levels-framework level this row carries. */
  level: Level;
  /** The stable anchor. Unique across the whole build, the DOM id, and the
   *  address a review comment resolves to. */
  rid: string;
  /** Where this question is canonically asked, when this row echoes one. */
  restates?: string;
  /** How this element gets its value, and what it becomes in the filed
   *  document. Both are on the surface, because "is this built?" reduces to
   *  them: an element nobody can say how to fill is not designed, and one with
   *  no template is one the document cannot carry. */
  fill: Fill;
  produces: Produces;
  /** Set where `fill` needs a second half to mean anything. */
  filledFrom?: string;
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
  /** Nothing outstanding and no text missing from the build — the SAME
   *  predicate the rail ticks a step with, so the two can never disagree.
   *  Carried on the panel as well as the strip because a step with one tab
   *  renders no strip at all, and a tab whose completion shows only when it has
   *  siblings is not consistently marked. */
  done: boolean;
  rows: QuestionRow[];
  submit: SubmitBar;
}

/** `superseded` and `blocked` are new and neither had a representation before:
 *  a step reserved by 1b.6(a) or 1b.8(a) rendered identically to one merely
 *  unvisited, and a step whose level had been superseded could not be drawn at
 *  all because it was removed from the rail instead. */
export type StepMark = "completed" | "active" | "waiting" | "error" | "superseded" | "blocked";

export interface TabEntry {
  id: string;
  name: string;
  done: boolean;
  /** How many binding rows are still outstanding, or null where completion has
   *  no ontology address. Null is not zero, and must not render as done. */
  outstanding: number | null;
  /** Rows whose text is not in the build. Counted on the strip so the debt is
   *  visible where the work is, not only in an audit. */
  placeholders: number;
  level: Level;
}

export interface StepEntry {
  /** The local id inside its band — "0", "4", "x". Kept for compatibility;
   *  it is NOT an address, because it collides across pathways. */
  id: string;
  /** The canonical address. `S.0` for a shared step, `E<seq>.<PathwayId>.<id>`
   *  for a level episode's step, `x` for the cross-cutting band. Unique across
   *  the whole history by construction, including a proposal that occupies one
   *  pathway twice under 1b.9(r)(3). */
  key: string;
  n: number;
  name: string;
  /** The one thing the rail can say that the centre of the screen cannot, or
   *  null where there is nothing. It carried "3 tabs · 3 unwritten" on every
   *  step, which the tab strip and the panel's own count already say, and which
   *  cost a second line on every row of the rail. What is left is only what a
   *  reader cannot get by looking at the step: that it is read-only, or that it
   *  is waiting on a document that does not exist yet. */
  meta: string | null;
  /** What this step is for, in one or two plain sentences. Authored per step
   *  on `StepSpec`, so it is unique to the step wherever the step appears and
   *  no screen has to synthesise a description from the step's name. */
  purpose: string;
  mark: StepMark;
  /** Every tab in this step has nothing outstanding, and none of its text is
   *  missing from the build. Separate from `mark` because a step can be both
   *  finished and the one you are standing on, and one field cannot say both.
   *  Counted from the same rows the panel shows, so the rail and the panel can
   *  never disagree. */
  done: boolean;
  tabs: TabEntry[];
  band: BandRef;
  /** The citation a blocked step waits on — 1b.6(a) for a FONSI, 1b.8(a) for a
   *  ROD. Never help prose an adapter has to parse. */
  waitingOn: string | null;
}

/** The act at the seam between the shared steps and the pathway steps.
 *
 *  Steps 3 and beyond used to APPEAR — the level history gained an entry and
 *  the rail grew. That reads as a state flip, and it is not one: the work at
 *  that boundary is the expensive part of the whole review. The determination
 *  fixes WHICH level; assembly is what builds it — opening the document shells
 *  the level requires, pulling the references the assessment will incorporate,
 *  and drafting from the answers already given. A transition a person cannot
 *  see themselves starting, and cannot see running, is one they cannot tell
 *  apart from a hang.
 *
 *  `waiting` is not a disabled `ready`: it names the step that is not finished,
 *  because a control that is grey for an unstated reason is a dead end. */
export type AssemblyState = "waiting" | "ready" | "done";

export interface Assembly {
  state: AssemblyState;
  /** The level of review this seam opens onto, in the words a non-expert
   *  reads — "Environmental assessment", never "P3". Null before Step 2 fixes
   *  one. Once assembly has run, this is the heading the pathway steps sit
   *  under: everything above the seam is true of every review, everything
   *  below it exists because of this determination, and the seam is the only
   *  place that boundary can be named. */
  level: string | null;
  /** The act, on the control. */
  label: string;
  /** One line under it, in the words of the work. */
  says: string;
  /** What is not finished yet, where the state is `waiting`. Never help prose
   *  an adapter has to parse — it is the step's own name. */
  waitingOn: string | null;
  /** The documents assembly will open. Named before it runs, so a person knows
   *  what they are starting. */
  produces: string[];
}

/** What `useSteps` returns. A bare array could not carry the banding, and a
 *  screen that infers grouping from step ids is inferring it from a value the
 *  rule does not guarantee is unique. */
export interface StepRail {
  bands: BandEntry[];
  steps: StepEntry[];
  assembly: Assembly;
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

/** What the frame draws a dot for. Kept separate from `NavSection` because the
 *  section list is application structure and must not travel through a region —
 *  a page that cannot load its own contents still has to show the way out of
 *  itself. A count that fails to load simply does not draw, which is the
 *  correct failure for a badge and the wrong one for a nav. */
export interface SectionBadge {
  sectionId: string;
  count: number;
  says: string;
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

import type {
  DocumentType,
  Fill,
  Level,
  Modality,
  PathwayId,
  Produces,
  TextState
} from "@/ui/data/pathways";

export type {
  DocumentType,
  ElementSpec,
  Fill,
  GateSpec,
  Level,
  Modality,
  Options,
  PathwayId,
  Produces,
  RowForm,
  RowSpec,
  StepSpec,
  TabSpec,
  TextState
} from "@/ui/data/pathways";

/** What a level of review is to this project, once the ordered elimination at
 *  1b.2(f)(2) has reached it or declined to.
 *
 *  Told apart from the five REGION states on purpose, and the distinction is
 *  load-bearing: a Region says whether a QUERY answered, a LevelState says a
 *  fact about the WORLD. An adapter that returns `absent` where it meant "this
 *  level was never reached" is making a false claim in the one state reserved
 *  for true ones — which is exactly what the build did before. */
export type LevelState =
  /** The outcome of the determination that has not been superseded. */
  | "live"
  /** Was the outcome of a superseded determination. Rows stay readable and
   *  read-only forever: 1b.9(a) keeps the work in the proposal record and
   *  1b.6(b)(1)/1b.8(b)(1) incorporate it. */
  | "superseded"
  /** Eliminated by the live determination's own limb sequence. Named with the
   *  limb that eliminated it, and a way back to the answer that did. */
  | "foreclosed"
  /** No level-of-review determination exists yet. */
  | "notReached";

/** One level of review this proposal has been on. Episodes are append-only:
 *  the array is readonly, no act removes one, and `railFor` only concatenates,
 *  so a step cannot leave the rail once it has entered it. */
export interface LevelEpisode {
  /** 1-based, in the order the determinations were made. */
  seq: number;
  pathway: PathwayId;
  name: string;
  reachedWhen: string;
  terminalOutput: string;
  /** Which transition opened this episode; `"initial"` for the first. */
  ground: string;
  /** The seq of the episode that superseded this one, or null while live. */
  supersededBy: number | null;
}

/** A document opened on this proposal, and where it sits. `open-document`'s
 *  uniqueness is over the PAIR (project, documentType), so an EA, a FONSI, an
 *  EIS and a ROD coexist on one project by design — which is why an escalated
 *  project needs no second project row. */
export interface DocumentLedgerEntry {
  documentType: DocumentType;
  openedInEpisode: number;
  state: "not-opened" | "assembling" | "published" | "signed" | "supplemented";
  /** 1b.9(u): the number follows the DOCUMENT — 1b.5(c)(7) for an EA,
   *  1b.7(h)(1)(v) for an EIS, discretionary for a FANEC. One field on the
   *  project cannot carry two on an escalated proposal. */
  uniqueIdentificationNumber: string | null;
  stepKey: string;
}

/** The whole level history of one proposal. `null` liveSeq is the state before
 *  Step 2 fixes anything, and it is not an error. */
export interface LevelHistory {
  episodes: readonly LevelEpisode[];
  /** The seq of the live episode. Derived from the one episode whose
   *  `supersededBy` is null — never stored twice, so two live levels are
   *  unrepresentable for want of a field. */
  liveSeq: number | null;
  /** The words shown where no level is fixed yet. */
  note: string;
  /** The determination in plain sentences, for the person doing the work.
   *  Null before Step 2 fixes a level, because before then there is no
   *  determination to state and the surface must not imply one. */
  plain: { says: string; because: string; ends: string } | null;
  documents: DocumentLedgerEntry[];
  /** Levels the live determination's limb sequence eliminated, with the limb. */
  foreclosed: { pathway: PathwayId; limb: string; because: string }[];
}

/** A band in the step rail: the shared steps, one level episode, or the
 *  cross-cutting tabs. Grouping is data, so no screen infers it from markup. */
export type BandRef =
  | { kind: "shared" }
  | { kind: "episode"; seq: number; pathway: PathwayId; superseded: boolean }
  | { kind: "cross" };

export interface BandEntry {
  band: BandRef;
  title: string;
  status: "shared" | "live" | "superseded" | "cross";
  /** One line that stands in for the band when it is collapsed, so a reader
   *  who never expands it still knows what is inside. */
  summary: string;
  documents: DocumentLedgerEntry[];
  collapsed: boolean;
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

/** `drafted` is the state the workflow creates and nothing else did: a request
 *  the project page assembled automatically that nobody has sent yet. Without
 *  it there is no way to say a request is WAITING ON THE OFFICER rather than on
 *  the specialist, and no way to count what a notification should point at. */
export type ExpertStatus = "drafted" | "overdue" | "awaiting" | "returned" | "accepted";

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
  /** The subject line. The request leaves this application through the
   *  officer's own mail client, so what is assembled has to be a whole
   *  message and not a body someone has to title themselves. */
  subject: string;
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
