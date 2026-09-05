import type {
  Action,
  Destination,
  Inbox,
  ProjectHeader,
  NavSection,
  Region,
  Session,
  SourceDocument,
  SourceKind,
  SourceRef
} from "@/ui/data/types";

/* Every supplied string is a register marker. No project data lives here. */

export const RULE: SourceRef = { kind: "rule", lead: "7 CFR 1b · ", label: "⟨cite.section⟩" };
export const RECORD: SourceRef = {
  kind: "record",
  lead: "Retrieved from the project record · ",
  label: "⟨record.path⟩"
};
export const DRAFTED: SourceRef = { kind: "document", lead: "Drafted by AI from ", label: "⟨corpus.basis⟩" };
export const DRAFTED_SET: SourceRef = {
  kind: "document",
  lead: "Question and choices drafted by AI from ",
  label: "⟨corpus.basis⟩"
};
export const CALCULATED: SourceRef = {
  kind: "inputs",
  lead: "Calculated from ",
  label: "⟨inputs⟩ earlier answers"
};
export const CHOICE_LIST: SourceRef = {
  kind: "record",
  lead: "Choices from ",
  label: "⟨register.item.choice_list⟩"
};
export const REQUESTED: SourceRef = {
  kind: "person",
  lead: "Requested from ",
  label: "⟨specialist.name, qualification⟩"
};
export const RETURNED: SourceRef = {
  kind: "person",
  lead: "Returned by ",
  label: "⟨specialist.name, qualification⟩"
};
export const OFFICER: SourceRef = { kind: "person", lead: "Entered by ", label: "⟨officer.name, title⟩" };
export const SUBMITTING: SourceRef = {
  kind: "person",
  lead: "Submitting as ",
  label: "⟨officer.name, title⟩"
};
export const STARTED_BY: SourceRef = { kind: "person", lead: "Started by ", label: "⟨officer.name, title⟩" };

export const STEP_LINK: Destination = { label: "Step ⟨n⟩ · ⟨tab⟩ ›", href: "#earlier-answer" };

/* --- region constructors: the only place a state is named --- */

export function filled<T>(value: T, sources: SourceRef[] = [], actions: Action[] = []): Region<T> {
  return { state: "filled", value, sources, actions };
}

export function absent<T>(
  message: string,
  query: string,
  actions: Action[] = [],
  sources: SourceRef[] = []
): Region<T> {
  return { state: "absent", message, query, sources, actions };
}

export function blocked<T>(
  message: string,
  waitingOn: string,
  destination?: Destination,
  actions: Action[] = [],
  sources: SourceRef[] = []
): Region<T> {
  return { state: "blocked", message, waitingOn, destination, sources, actions };
}

const REPORT: Action = { id: "report", label: "Report a problem", look: "link", enabled: true };

export function unresolved<T>(
  message: string,
  reason = "⟨reason⟩",
  actions: Action[] = [REPORT]
): Region<T> {
  return { state: "unresolved", message, reason, sources: [], actions };
}

/* --- session --- */

export const sessionIn: Region<Session> = filled({ officer: OFFICER });
export const sessionOut: Region<Session> = absent(
  "You are not signed in",
  "⟨session.lookup⟩",
  [{ id: "sign-in", label: "Sign in", look: "primary", enabled: true }]
);

/* --- source overlay --- */

export const sourceTitle: Record<SourceKind, string> = {
  rule: "The rule, as written",
  record: "The project record",
  document: "Source document",
  person: "Person",
  inputs: "Earlier answers used"
};

const sourceRef: Record<SourceKind, string> = {
  rule: "7 CFR 1b · ⟨cite.section⟩",
  record: "⟨record.path⟩",
  document: "⟨corpus.basis⟩",
  person: "⟨person.name, role⟩",
  inputs: "⟨inputs.list⟩"
};

export function sourceFilled(kind: SourceKind): Region<SourceDocument> {
  return filled<SourceDocument>({
    reference: sourceRef[kind],
    primary: "⟨source.excerpt⟩",
    full: { label: "Open the full document ›", href: "#full-document" }
  });
}

export const sourceAbsent: Region<SourceDocument> = absent(
  "Nothing found in the project record",
  "⟨register.item.retrieval_query⟩"
);
export const sourceBlocked: Region<SourceDocument> = blocked(
  "Not ready yet",
  "⟨earlier.answer⟩",
  STEP_LINK
);
export const sourceUnresolved: Region<SourceDocument> = unresolved("This document could not be read");

/* --- project band --- */

export const projectFilled: Region<ProjectHeader> = filled({
  name: "⟨project.name⟩",
  ref: "⟨project.ref⟩",
  office: "⟨project.office⟩",
  status: "⟨project.status⟩",
  summary: "⟨project.summary⟩"
});
export const projectAbsent: Region<ProjectHeader> = absent(
  "Nothing found in the project record",
  "⟨register.project.lookup⟩"
);
export const projectBlocked: Region<ProjectHeader> = blocked(
  "Not ready yet",
  "⟨intake.answers⟩",
  STEP_LINK
);
export const projectUnresolved: Region<ProjectHeader> = unresolved("This project could not be read");

/* --- inbox --- */

/** The five sections in the left pane. §6 names the four beyond the inbox and
 *  which Levels each carries; `href` is the only thing a screen needs. */
export const SECTIONS: NavSection[] = [
  { id: "inbox", name: "Inbox", icon: "inbox", href: "/", current: false },
  { id: "archive", name: "Archive", icon: "archive", href: "/archive", current: false },
  { id: "experts", name: "Expert Q", icon: "people", href: "/experts", current: false },
  { id: "learning", name: "Learning", icon: "learning", href: "/learning", current: false },
  { id: "reference", name: "Reference", icon: "documents", href: "/reference", current: false }
];

export function sectionsFor(currentId: string): NavSection[] {
  return SECTIONS.map((section) => ({ ...section, current: section.id === currentId }));
}

const projectRow = (id: string, position: string, mark: Inbox["projects"][number]["mark"]) => ({
  id,
  name: "⟨project.name⟩",
  changed: "Changed ⟨date.modified⟩",
  position,
  mark,
  summary: "⟨project.summary⟩",
  meta: "⟨project.ref⟩ · ⟨project.office⟩ · ⟨project.status⟩ · started ⟨date.started⟩",
  startedBy: STARTED_BY
});

export const inboxFilled: Region<Inbox> = filled({
  sections: sectionsFor("inbox"),
  heading: "Your projects",
  count: "⟨n⟩ projects · ⟨n⟩ need review",
  filters: [
    "All projects",
    "Needs review",
    "Waiting on reviewers",
    "Has an error",
    "Signature ready"
  ],
  sorts: ["Recently changed", "Oldest change", "Project name", "Step", "Date started"],
  projects: [
    projectRow("p1", "Step ⟨n⟩ · ⟨tab⟩", "review"),
    projectRow("p2", "Step ⟨n⟩ · ⟨tab⟩", "review"),
    projectRow("p3", "⟨n⟩ with reviewers", "waiting"),
    projectRow("p4", "Step ⟨n⟩ · ⟨tab⟩", "error"),
    projectRow("p5", "Submitted ⟨date.modified⟩", "ready")
  ]
});

export const inboxAbsent: Region<Inbox> = absent(
  "No current projects",
  "⟨register.inbox.query⟩",
  [{ id: "initiate", label: "Initiate project", look: "primary", enabled: true }]
);
export const inboxBlocked: Region<Inbox> = blocked(
  "Not ready yet",
  "⟨officer.office assignment⟩",
  STEP_LINK
);
export const inboxUnresolved: Region<Inbox> = unresolved("Your projects could not be read");
