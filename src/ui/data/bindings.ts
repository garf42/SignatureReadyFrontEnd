/** Every member of the port declares here the backend it stands in for. The
 *  declaration is the point of the file: a screen cannot read data without
 *  naming the object type, the properties, the act and the section of the
 *  register or the amendments that requires it.
 *
 *  The aim is that an FDE can write the adapter without asking a question. So
 *  beyond what a surface reads, each binding names the exact API names, how the
 *  surface is addressed, the shape of the query, which edges are traversed
 *  rather than scanned, what holds the gate, and what may go stale.
 *
 *  §-numbers are citations, not file paths. §1–§5 are the backend register,
 *  §6 the supporting-pages amendment and §7 the project-page amendment; those
 *  documents govern the front-end build and DO NOT travel with this tree, so
 *  nothing here depends on reading one. Every fact a binding rests on is
 *  restated in the binding.
 *
 *  Two things read this file. `scripts/port-additions.mjs` emits the port-gap
 *  list from it — generated rather than maintained. And `port.bindings.test.ts`
 *  enumerates the contract's own members and fails on one that is not declared
 *  here, so the list cannot fall behind the code.
 *
 *  THE NAMING RULE, which is the most important thing in the file. 76 of 79
 *  object types hold zero rows, so a near-miss API name and an empty object
 *  type are the same pixel: nothing in the build can tell them apart, and a
 *  wrong name can survive every test. `confirmed` therefore means the exact
 *  string was measured on the platform and recorded in the register.
 *  `proposed` means it does not exist yet, or the register names the thing
 *  without naming its API name. Check every `proposed` before wiring it.
 *
 *  WHAT IS NOT FINISHED. §7's project page is the least complete surface in the
 *  build, and these bindings describe what it needs rather than what it has:
 *  pathway state is not built, eleven of the seventeen acts are keyed on rows
 *  nothing creates, and the step and tab state the rail renders has no property
 *  behind it. A binding here is a specification for the adapter, never a claim
 *  that the screen above it is done.
 *
 *  No imports on purpose: this is data, and a generator should be able to load
 *  it without pulling React in behind it.
 */

/** §3's five verdicts, as measured on 2026-09-04. `answerable` means the
 *  shape and the act exist and are exercisable — never that a row exists. */
export type BindingStatus = "answerable" | "partial" | "backlog" | "absent";

/** Whether this exact string was measured on the platform, or is this
 *  interface's proposal for something that does not exist yet. */
export type NameStatus = "confirmed" | "proposed";

export interface ApiName {
  /** The exact string the FDE matches against the ontology. */
  name: string;
  status: NameStatus;
  note?: string;
}

export interface PropertyName extends ApiName {
  /** The object type carrying it. Always one this binding also declares. */
  objectType: string;
}

export interface LinkTraversal {
  /** Exact link type API name. */
  name: string;
  status: NameStatus;
  from: string;
  to: string;
  /** Why this surface is reached by the link rather than by a filter or a
   *  scan. An adapter that scans where an edge exists asks the platform a
   *  question the edge already answers. */
  why: string;
}

export interface Identity {
  /** The route parameter this surface is addressed by, or null. */
  routeParam: string | null;
  /** The property that IS the primary key. No object type's primary key is
   *  named anywhere in the register, so this is null throughout and the FDE
   *  fills it in from Ontology Manager. */
  primaryKey: ApiName | null;
  /** True only where `primaryKey` names one — a statement about what is known,
   *  not about what the URL ought to carry. Prefer the primary key in the URL. */
  isPrimaryKey: boolean;
  /** A human-readable number that must appear on screen, or null. */
  displayNumber: string | null;
  /** The query resolving a display number to a primary key, or null where no
   *  display number addresses anything. */
  resolver: string | null;
  note: string;
}

export interface QueryShape {
  /** Rows per page, or null where the surface is not a list. */
  pageSize: number | null;
  sortKey: string | null;
  sortDirection: "asc" | "desc" | null;
  /** Filter and search semantics, in the ontology's vocabulary. */
  filter: string;
  search: "server" | "client" | "none";
  /** A total like "312 artifacts" is an aggregation over the object set, not
   *  the length of the rows in hand. Which one it is, is said here. */
  counts: "aggregation" | "length" | "none";
  note: string;
}

/** Where the truth behind a gate lives — split in two on purpose.
 *
 *  A single "arbiter" field cannot say both what holds the gate and where it
 *  ought to live, and two surfaces reading the same act answered it in
 *  opposite directions when it tried. The split makes the answer unambiguous
 *  and the honest one visible: on this build `heldBy` is "none" everywhere,
 *  because no platform predicate marks a caller's class. A signature that
 *  looks gated and is not is the highest-consequence lie this application can
 *  tell, so it is stated rather than implied. */
export interface Authority {
  /** What holds the gate TODAY. */
  heldBy: "property" | "group" | "submissionCriteria" | "none";
  heldByName: string | null;
  /** Where the arbiter must land, so the FDE wires it rather than guessing. */
  mustBe: "property" | "group" | "submissionCriteria" | "none";
  /** The acts whose submission criteria must carry it, by exact API name.
   *  DERIVED from `acts.ts` — the reserved acts that stale this surface — so
   *  the two files cannot disagree about where a gate belongs. */
  mustBeOn: string[];
  note: string;
}

export interface Freshness {
  /** Whether the surface must reflect a write immediately, or tolerates
   *  staleness. Independent of the list below: a measurement page is staled by
   *  an act and still tolerates being a moment behind. */
  afterWrite: "immediate" | "tolerant";
  /** The acts that stale this surface, by exact API name. DERIVED from
   *  `acts.ts` rather than authored here: a surface cannot know about an act it
   *  never heard of, and an earlier hand-written version of this list named
   *  three acts that are not among the seventeen at all. */
  invalidatedBy: string[];
  note: string;
}

export interface Binding {
  /** What the surface serves, in one line. */
  serves: string;
  /** Sections that require this surface. */
  requires: string[];
  /** §3's verdict for the weakest thing this surface needs. */
  status: BindingStatus;
  /** Ontology object types read. Every type named anywhere else in the binding
   *  — a property's owner, a link's either end — is declared here too, so a
   *  reader never meets a name the binding did not introduce. */
  objectTypes: ApiName[];
  /** Properties read, each against the type carrying it. */
  properties: PropertyName[];
  /** Acts written, by exact API name, WITH the `signature-ready-` prefix. */
  acts: ApiName[];
  /** Platform datasets read directly. A dataset column is not an object
   *  property and never appears among the properties. */
  datasets: ApiName[];
  /** Edges traversed rather than scanned. */
  links: LinkTraversal[];
  identity: Identity;
  query: QueryShape;
  authority: Authority;
  freshness: Freshness;
  /** What the FDE has to supply. Empty means the backend can answer today. */
  needed: string[];
  /** Anything true of the binding that the screen must not hide. */
  notes: string[];
}

export const BINDINGS: Record<string, Binding> = {
  useSession: {
    serves: "the signed-in officer, and the signed-out case",
    requires: [
      "§1 actions",
      "README · the route to Foundry"
    ],
    status: "partial",
    objectTypes: [],
    properties: [],
    acts: [],
    datasets: [],
    links: [],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: null,
      resolver: null,
      note: "The officer is not an object and has no route parameter. The caller arrives from the shell's OSDK provider — the same Multipass identity §1 records four acts taking as current_user_id — and no object type carries a name or a title, so nothing on this surface resolves to a row and there is nothing to resolve it against. Signed-out is the provider's state and not an absent object; ?session=out reaches it in the fixture."
    },
    query: {
      pageSize: null,
      sortKey: null,
      sortDirection: null,
      filter: "None. There is no object query behind this hook — the caller is read off the client's auth context, and §1 records that no object type holds the officer's name or title.",
      search: "none",
      counts: "none",
      note: "Not a list and not a read of the ontology at all. The one thing the session must carry into every other surface is the principal, because four acts write it from current_user_id and the record can no longer misstate who acted (§1)."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "none",
      mustBeOn: [],
      note: "No gate, and no arbiter to name: §1 records that there is no platform predicate for a caller's class, so the session cannot answer whether this caller is the responsible official. What it can carry is the principal current_user_id supplies, which makes the actor decidable against Multipass after the write rather than checkable before it. Nothing here may be turned into a client-side role check."
    },
    freshness: {
      afterWrite: "tolerant",
      invalidatedBy: [],
      note: "None of the seventeen acts touches the session. It changes when the shell's provider changes, which is a sign-in or a sign-out and not a write, so nothing in the ontology stales it."
    },
    needed: [
      "a caller identity from the shell's OSDK provider; the officer's name and title are not on any object type"
    ],
    notes: [
      "Four acts write actorPrincipal from current_user_id, which makes the actor decidable against Multipass rather than trusted at write time (§1).",
      "No platform predicate marks a user's class, so the session cannot answer whether this caller is the responsible official."
    ]
  },
  useInbox: {
    serves: "every project this officer holds",
    requires: [
      "§1 object types",
      "§3 process, record and competence"
    ],
    status: "partial",
    objectTypes: [
      {
        name: "document",
        status: "proposed",
        note: "Declared because the link project.documents ends here."
      },
      {
        name: "project",
        status: "confirmed",
        note: "2 rows, both synthetic, and both in the EDITS LAYER — signatureReady.project holds zero rows, so the adapter reads the object type and never the backing dataset (§1)."
      }
    ],
    properties: [
      {
        name: "name",
        objectType: "project",
        status: "confirmed",
        note: "Written by submit-intake. One of the two live rows is named 'lk' with every other field null (§1)."
      },
      {
        name: "uniqueIdentificationNumber",
        objectType: "project",
        status: "confirmed",
        note: "Written by submit-intake, and null on one of the two rows — a project with no number exists on the platform today, which is why it cannot be the address."
      },
      {
        name: "uniqueIdentificationNumberIssuer",
        objectType: "project",
        status: "confirmed",
        note: "A closed two-member set (§1). The number is meaningful only against its issuer, so the pair travels together wherever the number is shown or matched."
      },
      {
        name: "anticipatedImplementationStart",
        objectType: "project",
        status: "confirmed",
        note: "Written by submit-intake. It is not a started-at and not a modified-at: the row's 'Changed' line and its 'started ⟨date.started⟩' meta both want properties that do not exist."
      },
      {
        name: "synthetic",
        objectType: "project",
        status: "confirmed",
        note: "Written by submit-intake. Both live rows carry synthetic=true and §6.3 requires that anything counting projects counts them, so the query must not filter them out to make the list look real."
      }
    ],
    acts: [
      {
        name: "signature-ready-submit-intake",
        status: "confirmed",
        note: "Create, and one of the four acts that can actually be run today — the two project rows are its output. Writes no actor; §1 records that creating a project is not a reserved determination."
      }
    ],
    datasets: [],
    links: [
      {
        name: "project.documents",
        status: "proposed",
        from: "project",
        to: "document",
        why: "The row's 'Where it is' column is document state per project, and §1 names project → document as the first edge of the spine that traverses. Not a scan: document rows live in the edits layer and signatureReady.document holds zero rows, so a dataset query over documents finds nothing at all, and grouping a global document scan by project asks the platform a question the edge already answers. The name is a NORMALISATION — §1 names the traversal and not the link type's API name, so it must be matched against the 38 link type resources before it is bound. Even traversed, this edge does not supply the column on its own: the binding's `needed` records position as pathway state, which is C9 and is not built."
      }
    ],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: "uniqueIdentificationNumber",
      resolver: null,
      note: "The inbox takes no route parameter, but it is where :projectRef gets its value, so each row must carry the project's primary key and hand that to the link. It does not today: InboxScreen.tsx hands projectPath the row's id while IntakeDialog.tsx hands it ⟨project.ref⟩, so one parameter is fed a key at one call site and a display number at the other. The number and its issuer appear in the row meta and must keep appearing; §1's second project row carries a null uniqueIdentificationNumber, which on its own settles that the number cannot address every project."
    },
    query: {
      pageSize: 50,
      sortKey: null,
      sortDirection: "desc",
      filter: "project, unfiltered. Nothing records which officer holds a project, so 'every project this officer holds' is the whole object set; synthetic=true is not excluded, because §6.3 requires that anything counting projects counts the two tracer rows. The five options — All projects, Needs review, Waiting on reviewers, Has an error, Signature ready — are pathway and expert-queue state and no property carries any of them.",
      search: "none",
      counts: "aggregation",
      note: "50 is PROPOSED and nothing in the register or the screens declares a page size; the object type holds two rows, so any page size is untested and the OSDK's own page limit is what will actually bind. The default sort is 'Recently changed', descending, and no modified-at exists on project — of the five sorts only 'Project name' has an address, project.name ascending, and 'Step' and 'Date started' have none. There is no search box on this surface. The heading '⟨n⟩ projects · ⟨n⟩ need review' is an AGGREGATION over the whole object set and never the length of the page or of the rows in hand; the honest total today is 2, both synthetic."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "none",
      mustBeOn: [],
      note: "No gate. §7.2 requires the build to be walkable end to end as a regular user, and §1 records that creating a project is not a reserved determination, so submit-intake writes no actor and none is checked. The only platform-side refusal on it is the organization marking every one of the seventeen acts carries, which decides whether this caller may write at all and says nothing about who they are."
    },
    freshness: {
      afterWrite: "immediate",
      invalidatedBy: [
        "signature-ready-submit-intake"
      ],
      note: "The overlay creates the project and navigates straight to its page (§7.3), so the row has to be there on the way back. The write lands in the edits layer and that is where the read must look — signatureReady.project holds zero rows and the five object-dataset materializations hold zero rows, so a write is never visible through a dataset. Everything else the row shows would be staled by open-determination, record-determination, open-document and emit-document, and every one of those stales a column that has no property behind it today, which is why they are not listed: refetching would change nothing."
    },
    needed: [
      "a holder-to-project relation; nothing records which officer holds a project",
      "a modified-at property; the inbox sorts and groups on 'recently changed' and nothing carries it",
      "a position property, or a projection of it; 'where it is' is step and tab state, which is C9's pathway state and is not built"
    ],
    notes: [
      "project holds 2 rows, both synthetic — one labelled 'C5 write-path tracer — safe to delete', one named 'lk' with every other field null. Anything that counts projects counts them (§6.3).",
      "project rows live in the edits layer; signatureReady.project holds zero rows."
    ]
  },
  useProject: {
    serves: "the project band above every step",
    requires: [
      "§7.3 initiation overlay",
      "§3 process, record and competence"
    ],
    status: "partial",
    objectTypes: [
      {
        name: "project",
        status: "confirmed",
        note: "Edits-layer rows only; signatureReady.project holds zero. The band reads the object type (§1)."
      }
    ],
    properties: [
      {
        name: "name",
        objectType: "project",
        status: "confirmed",
        note: "Written by submit-intake, and the heading of the band."
      },
      {
        name: "uniqueIdentificationNumber",
        objectType: "project",
        status: "confirmed",
        note: "The band's ref line. 1b.9(u) attaches the number to the EA and the EIS and makes it discretionary for a FANEC; §1 shows one live row carrying none."
      },
      {
        name: "uniqueIdentificationNumberIssuer",
        objectType: "project",
        status: "confirmed",
        note: "Closed two-member set. Shown with the number, and matched with it — the number is unique at most within an issuer."
      },
      {
        name: "anticipatedImplementationStart",
        objectType: "project",
        status: "confirmed",
        note: "Written by submit-intake and displayed in the band thereafter (§7.3). It is not the deadline trigger date, which lives on document and is null (§3)."
      }
    ],
    acts: [
      {
        name: "signature-ready-submit-intake",
        status: "confirmed",
        note: "Create, and the ONLY act in §1's seventeen that writes a project property. There is no modify, so the band's editability has no act behind it."
      }
    ],
    datasets: [],
    links: [],
    identity: {
      routeParam: ":projectRef",
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: "uniqueIdentificationNumber",
      resolver: "project where uniqueIdentificationNumber = ⟨number⟩ and uniqueIdentificationNumberIssuer = ⟨issuer⟩, taking one row and refusing on more than one",
      note: "The band shows the number; the route should not carry it. :projectRef is fed two different things today — the inbox row's id in InboxScreen.tsx and ⟨project.ref⟩ in IntakeDialog.tsx — and the register settles which belongs in the URL: 1b.9(u) makes the number discretionary for a FANEC and §1 shows a live project row with a null uniqueIdentificationNumber, so a number cannot address every project. Put the primary key in the URL and run the resolver only where a person types a number. The resolver takes the pair because the issuer is a closed two-member set and §1 records no uniqueness constraint on the number itself. §1 never names project's primary-key property; take it from the generated OSDK type and do not assume a name. The primary-key PROPERTY is not named anywhere in the register, so none is asserted here: the FDE reads it off the object type in Ontology Manager and fills `primaryKey` in. Until it is filled, `isPrimaryKey` stays false, which is a statement about what is known and not about the URL."
    },
    query: {
      pageSize: null,
      sortKey: null,
      sortDirection: null,
      filter: "one project by primary key. No facet, no ordering, no page.",
      search: "none",
      counts: "none",
      note: "Not a list. Two of the five fields the band shows have no address at all: §3 records that no object type carries a USDA subcomponent identity — which is 1b.4(a)'s third limb as well as this band's office line — and status is pathway state, which is C9 and is not built. Both render as register markers rather than being dropped, so the FDE can see exactly which two lines the ontology owes."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "none",
      mustBeOn: [],
      note: "No gate. §7.3 keeps the initiation overlay separate from Step 0 precisely because these four fields are general administrative information, and §1 records that creating a project is not a reserved determination — so no actor is written on submit-intake and none is checked. The organization marking on the act is the only refusal the platform holds here."
    },
    freshness: {
      afterWrite: "immediate",
      invalidatedBy: [
        "signature-ready-submit-intake"
      ],
      note: "The band displays what the overlay has just written and the navigation happens in the same gesture, so it must reflect the create. It cannot reflect an edit: §7.3 says the four fields are editable in the band thereafter and §1's seventeen acts contain no modify on project, so the FDE should not wire a save that has nothing to call. Reads go to the edits layer — signatureReady.project holds zero rows and materialized.* cannot see an act-written row."
    },
    needed: [
      "an office or subcomponent property; §3 records that no object type carries a USDA subcomponent identity, which is also 1b.4(a)'s third limb",
      "a status property; project state is pathway state and is not built"
    ],
    notes: [
      "1b.9(u) attaches the unique identification number to the EA and the EIS and makes it discretionary for a FANEC. It is modelled on project, which §3 records as a divergence rather than a defect."
    ]
  },
  useSteps: {
    serves: "the step list for the determined pathway, and each step's tabs",
    requires: [
      "§7.1",
      "§7.3–§7.7",
      "§3 the documents"
    ],
    status: "backlog",
    objectTypes: [
      {
        name: "determination",
        status: "confirmed",
        note: "§3 calls it the strongest match in the build — the closed five-member whichDetermination taken from 1b.11(a)(46), the two-step outcome-then-attribution refusal, actorPrincipal from current_user_id. Zero rows."
      },
      {
        name: "document",
        status: "confirmed",
        note: "1 row, synthetic, documentType=FANEC on the tracer project, edits layer, regulationVersion NULL — which per C3 means UNBOUND and not current (§1)."
      },
      {
        name: "element",
        status: "confirmed",
        note: "Zero rows and nothing creates one. Element counts are frozen at FANEC 6 / EA 7 / FONSI 5 / EIS 8 / ROD 8 = 34 and §2 re-derives every one (§7.10)."
      },
      {
        name: "project",
        status: "confirmed",
        note: "The step list is per project and every traversal below starts here. Two rows, both synthetic, edits layer (§1)."
      },
      {
        name: "slot",
        status: "confirmed",
        note: "Zero rows. Eleven of the seventeen acts are keyed on a slot and nothing creates any, so per-step completion resolves absent for every step (§1)."
      }
    ],
    properties: [
      {
        name: "whichDetermination",
        objectType: "determination",
        status: "confirmed",
        note: "Closed five-member set written by open-determination. det_review_level is the one that fixes the pathway at Step 2; det_nepa_applies is Step 1's (§1, §3)."
      },
      {
        name: "outcome",
        objectType: "determination",
        status: "confirmed",
        note: "Written by record-determination-outcome and FREE TEXT (§3) — so nothing maps an outcome onto P0–P4 and the adapter cannot decode the pathway without a convention the register does not supply."
      },
      {
        name: "documentType",
        objectType: "document",
        status: "confirmed",
        note: "Closed five-member set written by open-document. It names the type of a document that EXISTS, never the set still open — 1b.2(f)(2) is an ordered elimination and that state has no address (§1, §4)."
      }
    ],
    acts: [
      {
        name: "signature-ready-open-determination",
        status: "confirmed",
        note: "Create; writes whichDetermination, a static citation of 1b.11(a)(46) and project. No actor — opening is not deciding. No uniqueness over (project, whichDetermination), so it will make a second det_review_level and nothing refuses it (§1)."
      },
      {
        name: "signature-ready-open-document",
        status: "confirmed",
        note: "Create; writes documentType, project and synthetic, which is required and never defaulted. No uniqueness over (project, documentType) either (§1)."
      }
    ],
    datasets: [],
    links: [
      {
        name: "project.determinations",
        status: "proposed",
        from: "project",
        to: "determination",
        why: "Which pathway exists is this project's level-of-review determination, and the edge is real — open-determination writes project as a parameter and §1 names determination among the ten wave-2 edges. Traverse rather than filter the whole determination type, and expect more than one: nothing refuses a second det_review_level, so the adapter chooses by decidedAt or shows the conflict and must never assume a single row. The NAME is a normalisation — §1 names the edge by its target type only — and must be matched against the 38 link type resources first."
      },
      {
        name: "project.documents",
        status: "proposed",
        from: "project",
        to: "document",
        why: "Which documents exist on this project is the first edge of the spine §1 says traverses today. Not a scan: document rows live in the edits layer, signatureReady.document holds zero rows, and a dataset query finds nothing at all. Name normalised as above."
      },
      {
        name: "document.elements",
        status: "proposed",
        from: "document",
        to: "element",
        why: "A step's tabs are its document's elements. §1 names document → element as part of the spine and names no property on element that a filter could stand in for, so the edge is the only address; §7.10 freezes the counts at 34 and a scan that returned a different number would be answering a different question. Name normalised."
      },
      {
        name: "element.slots",
        status: "proposed",
        from: "element",
        to: "slot",
        why: "A step's completion is its slots, and slot is the root eleven of the seventeen acts are keyed on. §1 names element → slot in the spine; the name is normalised. Nothing creates a slot row, so this edge resolves to nothing today — which is absent, and the step must read as having no work worked out yet rather than as a step with no work in it."
      }
    ],
    identity: {
      routeParam: ":projectRef",
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: null,
      resolver: null,
      note: "The step list is per project and carries useProject's ambiguity unchanged — prefer the primary key, and resolve a number only where one is typed. :stepId and :tabId are NOT object identities: they are pathways.ts's own ids — '0', '1', '2' and then the pathway's, plus 'x' for §7.7's cross-cutting tabs — and no object type holds a step or a tab. Nothing resolves them and nothing should try; §7.1 makes a step a phase and a tab a part of it, which is the rule's structure and not the ontology's. The primary-key PROPERTY is not named anywhere in the register, so none is asserted here: the FDE reads it off the object type in Ontology Manager and fills `primaryKey` in. Until it is filled, `isPrimaryKey` stays false, which is a statement about what is known and not about the URL."
    },
    query: {
      pageSize: null,
      sortKey: null,
      sortDirection: null,
      filter: "determination on this project where whichDetermination = det_review_level, for the pathway; document on this project for which documents exist; element then slot by traversal for each step's tabs and their completion.",
      search: "none",
      counts: "length",
      note: "Not a paged list and not a sorted one. The step set is the rule's own sequence — three shared steps and then the pathway's, at most ten (§7.1) — so it is enumerated, never ordered by a query; §2 records that all five element lists are prefaced by 'may apply any format they choose', so no ordering shown here may be presented as required. The 'n of m tabs' meta is a LENGTH over pathways.ts's own tab array, not a platform count: per-step completion is slot closure and has no address, and element holds zero rows so nothing counts elements either."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "submissionCriteria",
      mustBeOn: [
        "signature-ready-emit-document",
        "signature-ready-record-branch",
        "signature-ready-record-determination",
        "signature-ready-record-determination-outcome",
        "signature-ready-state-factor-finding"
      ],
      note: "No gate on the step list. §7.2 requires every step, tab and row to be reachable and workable without agency credentials, and a waiting step still opens. The determinations that decide WHICH steps exist are reserved to the responsible official by 1b.11(a)(46), but their arbiter belongs to the row that records them, not to this surface. The one refusal the platform actually holds on this spine is record-determination's ordering — it refuses attribution while outcome is empty, and record-determination-outcome refuses a new outcome once actorPrincipal is set (§1) — and it is a sequencing rule, not a credential."
    },
    freshness: {
      afterWrite: "immediate",
      invalidatedBy: [
        "signature-ready-emit-document",
        "signature-ready-open-determination",
        "signature-ready-open-document",
        "signature-ready-publish-under-compulsion",
        "signature-ready-record-branch",
        "signature-ready-record-determination",
        "signature-ready-record-determination-outcome",
        "signature-ready-state-factor-finding"
      ],
      note: "Step 2 fixes the pathway and populates Steps 3 and beyond, and §7.8 records that a reopened level-of-review determination REPLACES the step set — so the rail cannot be stale across that write. open-determination is deliberately not in the list: it creates the row and changes nothing the rail shows, because the outcome is what fixes the pathway. Marks and completion would additionally be staled by adopt, freeze-slot-disposition, record-branch and emit-document, and each of those stales state with no address today, so refetching on them buys nothing until C9 lands."
    },
    needed: [
      "anything that creates a slot row — eleven of the seventeen acts are keyed on one and nothing creates any (§1)",
      "element rows; the document → element → slot → claim spine traverses and all four types hold zero rows",
      "per-step completion state, which is the same pathway state usePathway waits on",
      "pathway state — which document types remain possible given screening so far. document.documentType names the type of a document that exists, not the set still open, and 1b.2(f)(2) is an ordered elimination (C9)",
      "the branch set for 1b.2(f)(2)(i)–(iv), so the limb that answered is recorded; branch and record-branch exist and nothing creates a branch row",
      "uniqueness over (project, whichDetermination); nothing refuses a second det_review_level"
    ],
    notes: [
      "Element counts are frozen at FANEC 6 / EA 7 / FONSI 5 / EIS 8 / ROD 8 = 34 and §2 re-derives every one from the current text (§7.10).",
      "Steps 0–2 are shared and exist before any pathway is fixed; Steps 3 and beyond are the pathway's and do not exist until Step 2 determines it (§7.1). Unknown significance routes to P3, not P4 — 1b.2(f)(2)(iv)(A).",
      "The rail is three segments in one sequence, and the wiring must preserve the distinction. Steps 0–2 are shared and exist from the start. The pathway's own steps exist only once Step 2 fixes a pathway and are generated from that determination. §7.7's ten items are shared by every pathway, so each is a step of its own and they follow the pathway's steps.",
      "A step is a phase; its tabs are the parts of that phase. Nothing that appears in the rail may also appear in the tab strip — a step with one part renders no strip at all."
    ]
  },
  useElement: {
    serves: "one tab: its rows, their answers and the one act that closes it",
    requires: [
      "§7.3–§7.7",
      "§7.8 retrieval pushes",
      "§1 functions and AIP logic"
    ],
    status: "backlog",
    objectTypes: [
      {
        name: "adoption",
        status: "confirmed",
        note: "§1 names it among those same rows, and materialized.adoption is one of the five object-dataset materializations that hold zero rows — so an adoption can be written and no transform can read it back."
      },
      {
        name: "claim",
        status: "confirmed",
        note: "The answer written against a slot, and what a verdict is stamped on. §1 names it among the rows the eleven unreachable acts key on."
      },
      {
        name: "dispositionMix",
        status: "proposed",
        note: "Declared because the link manifest.dispositionMix ends here."
      },
      {
        name: "document",
        status: "confirmed",
        note: "One row on the platform, synthetic, documentType=FANEC on the tracer project, regulationVersion NULL (§1). The tab's title and its submit label are the document's, so the panel reads it."
      },
      {
        name: "element",
        status: "confirmed",
        note: "§1's spine — project → document → element → slot → claim — traverses today. Zero rows, and nothing creates an element."
      },
      {
        name: "enumset",
        status: "proposed",
        note: "Declared because the link element_cites_enumset ends here."
      },
      {
        name: "manifest",
        status: "confirmed",
        note: "What closureHolds and manifestHash are about, and where the still-pending list hangs. §1 names it among the rows the unreachable acts key on and among the C1 singletons."
      },
      {
        name: "project",
        status: "proposed",
        note: "Declared because the link project.documents starts here."
      },
      {
        name: "slot",
        status: "confirmed",
        note: "Eleven of the seventeen acts are keyed on a slot and nothing creates one (§1). §4 also has slot.reference waiting to be retyped and its 56 multi-valued rows split (C9)."
      },
      {
        name: "unsatisfiedElement",
        status: "proposed",
        note: "Declared because the link manifest.unsatisfiedElements ends here."
      }
    ],
    properties: [
      {
        name: "adoptedValue",
        objectType: "adoption",
        status: "confirmed",
        note: "Must be present unless adoptionState is 'rejected'. That conditional is over another parameter's nullity, it is not expressible without a Function, and an 'adopted' with no value can be recorded today (§1)."
      },
      {
        name: "adoptionState",
        objectType: "adoption",
        status: "confirmed",
        note: "Closed 3, written by signature-ready-adopt."
      },
      {
        name: "adoptedAt",
        objectType: "adoption",
        status: "confirmed",
        note: "Written in the same act as the value and the actor."
      },
      {
        name: "actorPrincipal",
        objectType: "adoption",
        status: "confirmed",
        note: "From current_user_id since 2026-08-31. The ^(?!service:) regex is gone and nothing replaces it, but the record can no longer misstate who acted, which makes the actor decidable against Multipass rather than trusted at write time (§1)."
      },
      {
        name: "disposition",
        objectType: "slot",
        status: "confirmed",
        note: "Closed 3. §1's action table names the parameter without naming its object type; the act's own name — signature-ready-freeze-slot-disposition — is the attribution taken here."
      },
      {
        name: "emittedAt",
        objectType: "manifest",
        status: "confirmed",
        note: "Written by emit-document. §1 names the object type only for emittedAt — \"the manifests emittedAt\", in stamp-verifier-verdicts not_before — and §3 records that document carries no date-issued and no signatory property, so these do not sit on document. The other three are the same acts target object and are proposed on that ground, not measured. Written by signature-ready-emit-document, and the timestamp a verdict's not_before would be compared against if anything held that comparison (§1)."
      },
      {
        name: "closureHolds",
        objectType: "manifest",
        status: "proposed",
        note: "Written by emit-document. §1 names the object type only for emittedAt — \"the manifests emittedAt\", in stamp-verifier-verdicts not_before — and §3 records that document carries no date-issued and no signatory property, so these do not sit on document. The other three are the same acts target object and are proposed on that ground, not measured. A parameter, not a computed fact: intent-predicate clause 1 is recorded enforcedAt 'none' and a false value is not refused (§1). The panel must not render it as evidence that closure holds."
      },
      {
        name: "manifestHash",
        objectType: "manifest",
        status: "proposed",
        note: "Written by emit-document. §1 names the object type only for emittedAt — \"the manifests emittedAt\", in stamp-verifier-verdicts not_before — and §3 records that document carries no date-issued and no signatory property, so these do not sit on document. The other three are the same acts target object and are proposed on that ground, not measured. Written by signature-ready-emit-document."
      },
      {
        name: "emittedBy",
        objectType: "manifest",
        status: "proposed",
        note: "Written by emit-document. §1 names the object type only for emittedAt — \"the manifests emittedAt\", in stamp-verifier-verdicts not_before — and §3 records that document carries no date-issued and no signatory property, so these do not sit on document. The other three are the same acts target object and are proposed on that ground, not measured. From current_user_id. Who issued is decidable; whether that caller is the responsible official is not, because no platform predicate marks a user's class (§1)."
      },
      {
        name: "verdict",
        objectType: "claim",
        status: "confirmed",
        note: "pass / fail. The default is still pass and can only be cleared by hand in Ontology Manager, so the valuable answer is the harder click (§1). §1's table names the parameter without naming the object type; §3's 'letting a failed claim into a signed document' is the attribution taken here."
      },
      {
        name: "verdictStampedAt",
        objectType: "claim",
        status: "confirmed",
        note: "not_before — a verdict at or after the manifest's emittedAt — is a cross-object comparison and is held by nothing (§1)."
      }
    ],
    acts: [
      {
        name: "signature-ready-adopt",
        status: "confirmed",
        note: "modify — adoptedValue, adoptionState (closed 3), adoptedAt, actorPrincipal from current_user_id. A prefilled row is a proposal until adopt records what the officer did with it (§7.8)."
      },
      {
        name: "signature-ready-freeze-slot-disposition",
        status: "confirmed",
        note: "modify — disposition (closed 3), no actor. frozen_upstream is not expressible: the act cannot tell a faithful replay of a frozen disposition from a fresh choice made at submission, which is the guarantee that stops work migrating during assembly (§1)."
      },
      {
        name: "signature-ready-emit-document",
        status: "confirmed",
        note: "modify — emittedAt, closureHolds, manifestHash, emittedBy from current_user_id. The submit bar's act on a document tab."
      },
      {
        name: "signature-ready-stamp-verifier-verdict",
        status: "confirmed",
        note: "modify — verdict (pass / fail), verdictStampedAt, no actor. Since the act widened to accept fail on 2026-09-01, clause 3's pass-only requirement is held by nothing (§1)."
      }
    ],
    datasets: [],
    links: [
      {
        name: "project.documents",
        status: "proposed",
        from: "project",
        to: "document",
        why: "signature-ready-open-document writes project as a parameter into the edits layer and signatureReady.document holds zero rows, so there is no column a dataset filter could scope on; a filter on documentType alone returns every document of that type in the ontology. §1 names project → document as traversing today and prints no link type API name."
      },
      {
        name: "document.elements",
        status: "proposed",
        from: "document",
        to: "element",
        why: "Which six elements are this FANEC's is the edge and not a property: the counts are frozen at FANEC 6 / EA 7 / FONSI 5 / EIS 8 / ROD 8 (§7.10) and every document of a type carries the same set, so a scan over element cannot say whose. §1 names document → element as traversing and prints no link type API name."
      },
      {
        name: "element.slots",
        status: "proposed",
        from: "element",
        to: "slot",
        why: "Eleven of the seventeen acts key on a slot (§1), and the slot a row acts on is the one hanging off that row's element. A scan cannot tell which element a slot answers, and with slot at zero rows an empty scan is indistinguishable from a mis-bound type (§1)."
      },
      {
        name: "slot.claims",
        status: "proposed",
        from: "slot",
        to: "claim",
        why: "The answer of record is the claim and the verdict is stamped on it, so the panel must read a verdict back against the slot it renders rather than against a claim it found by scanning. §1 names slot → claim as traversing and prints no link type API name."
      },
      {
        name: "element_cites_enumset",
        status: "confirmed",
        from: "element",
        to: "enumset",
        why: "The closed choice list behind a select or a choice row. §1 names it exactly and records it as vacuous at the target end — the link holds 0 rows and so does enumset — so it resolves to nothing today and that emptiness must not render as 'there are no choices'."
      },
      {
        name: "document.manifest",
        status: "confirmed",
        from: "document",
        to: "manifest",
        why: "A C1 singleton, named exactly in §1. closureHolds and manifestHash are emit-document parameters; what they are about lives on the manifest, and there is exactly one per document, so the edge is the address and a lookup is not."
      },
      {
        name: "manifest.unsatisfiedElements",
        status: "confirmed",
        from: "manifest",
        to: "unsatisfiedElement",
        why: "§3 states it directly: the still-pending list is unsatisfiedElement rows via manifest.unsatisfiedElements, written in the same transaction rather than as a facet. So the outstanding set behind the submit bar, and behind compelled publication at 1b.5(f) and 1b.7(l), is read off the edge and never recomputed as a filter over elements."
      },
      {
        name: "manifest.dispositionMix",
        status: "confirmed",
        from: "manifest",
        to: "dispositionMix",
        why: "A C1 singleton, named exactly in §1. Intent-predicate clause 2 turns on the disposition mix equalling its pinned expectation in disposition_mix.pin.json, and the comparison is per manifest — so the mix is reached from the manifest and never aggregated over slots by the client."
      }
    ],
    identity: {
      routeParam: ":tabId",
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: null,
      resolver: null,
      note: "The panel is addressed by three segments — /projects/:projectRef/steps/:stepId/:tabId — and none of them is an ontology key. :stepId and :tabId are ids from pathways.ts, derived from the rule rather than from data, so they say which element set is being worked and never which element row; the element and slot keys are not in the URL at all. :projectRef is the ambiguous one (src/ui/routes.ts): projectPath encodes whatever it is handed. Put the project's primary key there. uniqueIdentificationNumber is a display number and not a key — 1b.9(u) makes it discretionary for a FANEC, submit-intake writes it with no uniqueness criterion and no Function exists to hold one (§1) — so where one must be resolved the query is a filter on project.uniqueIdentificationNumber and uniqueIdentificationNumberIssuer that handles more than one match rather than taking the first. The primary-key PROPERTY is not named anywhere in the register, so none is asserted here: the FDE reads it off the object type in Ontology Manager and fills `primaryKey` in. Until it is filled, `isPrimaryKey` stays false, which is a statement about what is known and not about the URL."
    },
    query: {
      pageSize: null,
      sortKey: null,
      sortDirection: null,
      filter: "Not a filter: the rows are the slots of one element of one document of this project, reached down the spine. Adoption and claim rows are read per slot, never scanned.",
      search: "none",
      counts: "length",
      note: "The progress line and the submit bar's outstanding count are computed over rows already in hand, and the denominator is the frozen element set at §7.10 — bounded at eight — so nothing here pages and nothing needs aggregating. Order is not a backend concern: §2 records that all five element lists are prefaced by 'may apply any format they choose', so the rule fixes contents and fixes nothing about arrangement, and pathways.ts holds the order. A sort key here would invent a constraint. The one count that is not a length is the still-pending list behind emit-document, which is manifest.unsatisfiedElements rows (§3) and not a client count over the panel."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "submissionCriteria",
      mustBeOn: [
        "signature-ready-emit-document",
        "signature-ready-record-branch",
        "signature-ready-record-determination",
        "signature-ready-record-determination-outcome",
        "signature-ready-state-factor-finding"
      ],
      note: "The gate this panel renders is the signature row — 1b.3(g)(2)(vi), 1b.6(b)(5), 1b.8(b)(8) — and the act behind it is emit-document, so that is where the arbiter belongs. It is not there yet: §1 records intent-predicate clauses 1 and 2 as enforcedAt 'none', closureHolds is a parameter and a false value is not refused, and clause 3's pass-only requirement has been held by nothing since stamp-verifier-verdict widened to accept fail on 2026-09-01. There is no Foundry Function and no AIP Logic in this project, which is what all three wait on (§1). Wire the row to the act's refusal rather than to the client: §7.2 — a gate held only in the client is not a gate, the surface withholds the act and the platform refuses the write. The actor half is already decidable and the class half is not: emittedBy comes from current_user_id, while no platform predicate marks a caller as the responsible official."
    },
    freshness: {
      afterWrite: "immediate",
      invalidatedBy: [
        "signature-ready-adopt",
        "signature-ready-emit-document",
        "signature-ready-freeze-slot-disposition",
        "signature-ready-open-determination",
        "signature-ready-open-document",
        "signature-ready-publish-under-compulsion",
        "signature-ready-record-branch",
        "signature-ready-record-determination",
        "signature-ready-record-determination-outcome",
        "signature-ready-stamp-verifier-verdict",
        "signature-ready-state-factor-finding"
      ],
      note: "A row's answer and the submit bar's count are the same read, so a stale panel shows an answered row as outstanding and leaves a closed tab open. The last four are the acts §7.3 and §7.4 name as closing Step 1, Step 2 and the P1/P2 extraordinary-circumstances tab, all of which this hook renders as element panels; record-determination is also what fixes the pathway, so it restates which tabs exist at all (§7.8)."
    },
    needed: [
      "the submission-time Function; eight named preconditions wait on one, including adopt's rule that adoptedValue must be present unless adoptionState is 'rejected'",
      "element and slot rows, as above",
      "an address for the six grounds at 1b.2(e)(1)–(6) and for the 1b.2(f)(2) sequence; neither records which limb answered"
    ],
    notes: [
      "An 'adopted' with no value can be recorded today — the conditional is over another parameter's nullity and is not expressible without a Function (§1).",
      "A prefilled row is a proposal until adopt records what the officer did with it (§7.8)."
    ]
  },
  useGate: {
    serves: "the three signature surfaces the regulation reserves, and the route-to-holder action offered instead",
    requires: [
      "§7.2 drafting authority and the signature gate",
      "§3 the documents"
    ],
    status: "partial",
    objectTypes: [
      {
        name: "delegation",
        status: "confirmed",
        note: "Exists, zero rows (§3). 1b.9(n)(2)'s multiple-signature rule and 1b.2(b)(2)'s delegation of the Senior Agency Official's authority both land here and neither is populated."
      },
      {
        name: "dispositionMix",
        status: "proposed",
        note: "Declared because the link manifest.dispositionMix ends here."
      },
      {
        name: "document",
        status: "confirmed",
        note: "Carries no date-issued and no signatory property (§3), so the thing the rule actually requires at 1b.3(g)(2)(vi), 1b.6(b)(5) and 1b.8(b)(8) has no column."
      },
      {
        name: "manifest",
        status: "confirmed",
        note: "Added: closure is the manifest's, not the document's. §1 names document.manifest as a C1 singleton and names 'the manifest's emittedAt' when it states stamp-verifier-verdict's not_before clause. Zero rows."
      },
      {
        name: "project",
        status: "proposed",
        note: "Declared because the link project.documents starts here."
      },
      {
        name: "responsibleOfficial",
        status: "confirmed",
        note: "Exists, zero rows (§3). Nothing joins it to a caller and no platform predicate marks a caller's class."
      },
      {
        name: "unsatisfiedElement",
        status: "confirmed",
        note: "Added: the only thing on the platform that says WHAT is missing when closure does not hold. §1 names manifest → unsatisfiedElement as traversing; §3 records the rows as written in the same transaction as the emission."
      }
    ],
    properties: [
      {
        name: "emittedAt",
        objectType: "manifest",
        status: "confirmed",
        note: "§1 writes it in emit-document's row and then names it as 'the manifest's emittedAt' in stamp-verifier-verdict's not_before clause, which is where the carrier is settled. That comparison is cross-object and waits on a Function."
      },
      {
        name: "emittedBy",
        objectType: "manifest",
        status: "confirmed",
        note: "§1's exact string; the principal comes from current_user_id. The CARRIER is inferred from emittedAt sitting on the manifest — §1 never says which object emit-document modifies — so verify it against the ontology before binding. It is an emitter, never a signatory."
      },
      {
        name: "closureHolds",
        objectType: "manifest",
        status: "confirmed",
        note: "Same carrier question as emittedAt. It is a PARAMETER and a false value is not refused (§1), so it records an assertion rather than enforcing one; intent-predicate clause 1 is recorded enforcedAt 'none'."
      },
      {
        name: "manifestHash",
        objectType: "manifest",
        status: "confirmed",
        note: "Same carrier question as emittedAt. Reach the manifest by the document.manifest singleton and never by looking one up by hash."
      },
      {
        name: "documentType",
        objectType: "document",
        status: "confirmed",
        note: "Added: it is what decides whether this surface has a gate at all. FANEC, FONSI and ROD are gated; EA and EIS are not, and that is the rule's own split (§5, §7.2)."
      }
    ],
    acts: [
      {
        name: "signature-ready-emit-document",
        status: "confirmed",
        note: "Modify, writing emittedAt, closureHolds, manifestHash and emittedBy with the principal from current_user_id. It is emission and NOT a signature: §3 records no signature concept and §5 names the signature as the corpus's largest gap. The register never equates the two and neither should the adapter."
      }
    ],
    datasets: [],
    links: [
      {
        name: "document.manifest",
        status: "confirmed",
        from: "document",
        to: "manifest",
        why: "One of the five C1 singletons §1 names by string. Closure lives on the manifest, so the gate reaches it by the singleton — one document, one manifest — rather than by matching manifestHash, which would be a lookup by content on a type holding zero rows."
      },
      {
        name: "manifest.unsatisfiedElements",
        status: "confirmed",
        from: "manifest",
        to: "unsatisfiedElement",
        why: "§3 names this exact traversal and says the rows are WRITTEN IN THE SAME TRANSACTION rather than computed as a facet — so it is the manifest's own record of what was outstanding at emission, and a scan for unclosed elements would be a second and different answer taken at a different moment. It is also the list the gate has to show when closureHolds is false, and the same list 1b.5(f) and 1b.7(l) compel a publication to carry."
      },
      {
        name: "manifest.dispositionMix",
        status: "confirmed",
        from: "manifest",
        to: "dispositionMix",
        why: "The other C1 singleton §1 names by string, and the address of intent-predicate clause 2: the mix is compared against disposition_mix.pin.json. It is declared here because the gate's second precondition lives on it, and it is recorded enforcedAt 'none' — a surface that shows a signature as ready must not imply the comparison ran."
      },
      {
        name: "project.documents",
        status: "proposed",
        from: "project",
        to: "document",
        why: "The gate is per document while the route addresses a project, so the document carrying the signature is reached by the spine's first edge. Normalised name — §1 names the traversal and not the link type — and it must be matched against the 38 link type resources before it is bound."
      }
    ],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: null,
      resolver: null,
      note: "The hook takes no route parameter today: it reads ?gate=held, which is the fixture's way of showing both faces of a gate the interface can never decide. When it binds it is addressed by the document the signature belongs to — reached from :projectRef by project.documents — and by the row's own citation, 1b.3(g)(2)(vi), 1b.6(b)(5) or 1b.8(b)(8). There is no number to show and none to resolve: a signed document has no identity of its own in the ontology, and 1b.9(u)'s number sits on project and is discretionary for a FANEC."
    },
    query: {
      pageSize: null,
      sortKey: null,
      sortDirection: null,
      filter: "document on this project where documentType is FANEC, FONSI or ROD. EA and EIS are excluded by the rule and not by preference — 1b.5(c)(6) and 1b.7(h)(8) state that the certifying statement requires no signature and that approval to publish indicates concurrence, so a gate there would assert a signature the rule does not ask for (§7.2).",
      search: "none",
      counts: "none",
      note: "Not a list. What it needs beyond the document is the manifest's closure and, where closure fails, the unsatisfiedElement rows behind it — a list, but the manifest's own and never a page or a facet (§3). Three gated surfaces exist in the whole application and §7.2 enumerates them; they are not discovered by a query."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "submissionCriteria",
      mustBeOn: [
        "signature-ready-emit-document"
      ],
      note: "This is where the doctrine bites, and the honest answer is that nothing holds the gate today. responsibleOfficial and delegation hold zero rows; §1 records no platform predicate for a caller's class; document carries no signatory and no date-issued property; closureHolds is a parameter whose false value is not refused, with intent-predicate clauses 1 and 2 recorded enforcedAt 'none'; and since stamp-verifier-verdict widened to accept fail on 2026-09-01, clause 3's pass-only requirement is held by nothing. The only refusal any act carries is INTERSECTS(organization_marking_ids, 0f8a25fe-a7f1-4679-9d9b-9df86ee0f07e), which decides whether this caller may write at all and says nothing about whether they are the responsible official — so it is not this gate's arbiter and must not be wired as one. Where the arbiter must land is a submission-time Function on signature-ready-emit-document; §1 lists it among the eight named preconditions waiting on a Function that does not exist in this project. Until it does, the surface withholds the act and offers the routing, and the FDE wires the refusal rather than a client boolean: a gate held only in the client is not a gate (§7.2)."
    },
    freshness: {
      afterWrite: "immediate",
      invalidatedBy: [
        "signature-ready-emit-document"
      ],
      note: "A gate may never show a stale answer: what is withheld and what is offered instead both turn on closure, and closure moves under adopt and freeze-slot-disposition long before anyone reaches the signature row. stamp-verifier-verdict is in the list for the reason §1 gives — the act widened to accept fail and only an emission gate can tell a recorded fail from a signable claim — so a fail stamped after the gate was drawn has to reach it. There is no routing act at all: §3 records no record of a routing, so the one thing this surface offers a caller without the credential stales nothing and persists nowhere, and the FDE should not expect a write to come back from it. (Dropped from an earlier draft of this list: signature-ready-adopt, signature-ready-freeze-slot-disposition, signature-ready-stamp-verifier-verdict. This list is DERIVED from acts.ts and not authored here, because a surface cannot know about an act it never heard of — three of those names are not among the seventeen at all.)"
    },
    needed: [
      "a signature concept; document carries no date-issued and no signatory property, and §5 records a signature as the corpus's largest gap",
      "a platform predicate for the caller's class; the interface presents the gate and cannot verify a credential",
      "a record of a routing — that a document was referred to a holder for signature"
    ],
    notes: [
      "Gated: FANEC signature 1b.3(g)(2)(vi), FONSI signature 1b.6(b)(5), ROD signature 1b.8(b)(8). The EA and the EIS carry no gate — 1b.5(c)(6) and 1b.7(h)(8) state that the certifying statement needs no signature.",
      "A gate held only in the client is not a gate: the surface withholds the act, the platform refuses the write (§7.2)."
    ]
  },
  useSource: {
    serves: "the overlay that opens the primary source behind a value",
    requires: [
      "§5 document production",
      "§6.6 the viewer"
    ],
    status: "partial",
    objectTypes: [
      {
        name: "corpusArtifact",
        status: "confirmed",
        note: "312 rows, the joined object type, queryable — the only real rows in the build. 283 practice / 4 regulation / 25 undeclared (§1)."
      },
      {
        name: "incorporatedByReference",
        status: "confirmed",
        note: "Zero rows; exists with documentId and page (C11). The rule's operative duty — that the material be reasonably available for review by potentially interested parties, 1b.9(e)(7) — is a duty about the world and nothing in the ontology can hold it (§3)."
      },
      {
        name: "proposalRecordItem",
        status: "confirmed",
        note: "Zero rows; gained documentId and page in C11. The proposal record at 1b.9(a)(1)–(11) is partial and none of the eleven categories is individually addressable (§3)."
      }
    ],
    properties: [
      {
        name: "documentId",
        objectType: "proposalRecordItem",
        status: "confirmed",
        note: "Refers to a pinned corpus artifact and never to a document object. §1 records it as deliberately not an edge: a link there would be wrong, not merely empty."
      },
      {
        name: "documentId",
        objectType: "incorporatedByReference",
        status: "confirmed",
        note: "The same trap, recorded in the same sentence of §1 and repeated in §5."
      },
      {
        name: "page",
        objectType: "proposalRecordItem",
        status: "confirmed",
        note: "Added with documentId in C11. §5 fixes the resolvable unit as a page range in a held artifact, which matches the corpus grain."
      },
      {
        name: "page",
        objectType: "incorporatedByReference",
        status: "confirmed",
        note: "Added with documentId in C11."
      },
      {
        name: "sha256",
        objectType: "corpusArtifact",
        status: "confirmed",
        note: "Carried on every census row with byte length, and pinned in both directions: 287 of 287 declared artifacts match on digest and length (§1)."
      },
      {
        name: "byteLength",
        objectType: "corpusArtifact",
        status: "proposed",
        note: "The camelCase string is nowhere in the register: §1 and §6.6 both write 'byte length' as two words. types.ts and support.ts already use byteLength, so the front end has settled on a spelling the register has not."
      }
    ],
    acts: [],
    datasets: [
      {
        name: "corpus.census",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "corpus.text",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      }
    ],
    links: [],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: null,
      resolver: null,
      note: "The overlay takes a SourceKind — rule, record, document or inputs (types.ts) — and nothing else. That is a category, not an address: none of the four carries a corpusArtifact primary key or a page range, so the hook returns the same markers whichever row opened it and cannot open a particular document at all. §5 and §6.6 fix the addressable unit as a page range inside an artifact — one corpus FONSI occupies pages 31–34 of a 155-page file — so the signature the adapter needs is the artifact's primary key plus a start and an end page alongside the kind, and it should be the same key useReferenceArtifact(id) already takes. A person is not a source kind: an officer's name has no primary source behind it and those lines are text that open nothing."
    },
    query: {
      pageSize: null,
      sortKey: null,
      sortDirection: null,
      filter: "corpusArtifact by primary key, then a page range inside it. The citation side is matched by equality on proposalRecordItem.documentId and incorporatedByReference.documentId and never traversed — §1 records both columns as deliberately not edges, because they refer to a pinned corpus artifact and never to a document object, so a link there would be wrong rather than merely empty. This is the one surface in the five where a link is the wrong instrument.",
      search: "none",
      counts: "none",
      note: "corpus.text holds 17 rows and zero PDF body text — every one is a MANIFEST.json, a regulation XML, a drift witness, a forest-plan JSON or a cover note — so an excerpt cannot be quoted from a dataset today and ⟨source.excerpt⟩ stays a marker until a media-set read route exists (§1, §6.6). Whatever the overlay eventually renders as selectable text carries §5's hazard: on the 1990 Umatilla ROD the cover reads 'Forest Service' in the page image and 'Forest %Nice' in the text layer, on all three extractors, with no error and no signal."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "none",
      mustBeOn: [],
      note: "Nothing here is reserved and nothing here writes. None of the seventeen acts adds or removes a corpus artifact, nothing syncs, and the build account is Viewer only and permanently so (§1, §6.6). The one judgement the surface still owes is what add means — an upload, or recording an intent to add — and §6.6 puts that to the AI FDE as a decision, not as a gate."
    },
    freshness: {
      afterWrite: "tolerant",
      invalidatedBy: [],
      note: "Two of the four kinds cannot go stale. rule reads the pin, which is byte-identical to its independent drift witness at eCFR issue date 2026-08-25; document reads the corpus, where 287 of 287 declared artifacts match on digest and length in both directions and nothing syncs (§1, §2). The other two can: record and inputs quote the project record, and the acts above change what they quote. The overlay is mounted only while a source is open and unmounts on close, so a read per open is already the behaviour and staleness is bounded by one open. (Dropped from an earlier draft of this list: signature-ready-submit-intake, signature-ready-adopt, signature-ready-record-determination-outcome, signature-ready-record-determination. This list is DERIVED from acts.ts and not authored here, because a surface cannot know about an act it never heard of — three of those names are not among the seventeen at all.)"
    },
    needed: [
      "a media-set read route, so the overlay can show the cited page rather than its metadata"
    ],
    notes: [
      "corpus.text holds 17 rows and zero PDF body text, so an excerpt cannot be quoted from a dataset today.",
      "proposalRecordItem.documentId and incorporatedByReference.documentId refer to a pinned corpus artifact and never to a document object — a link there would be wrong, not merely empty (§1).",
      "A person is not a source kind. An officer's name has no primary source behind it, so those lines are text and open nothing."
    ]
  },
  useArchive: {
    serves: "recently-deleted projects, ordered by archived date, with restore and purge",
    requires: [
      "§6.3",
      "§6.7"
    ],
    status: "absent",
    objectTypes: [
      {
        name: "project",
        status: "confirmed",
        note: "Two rows, both synthetic, both in the edits layer — 'C5 write-path tracer — safe to delete' (TRACER-C5-0001) and one named 'lk' with every other field null; signatureReady.project holds zero rows (§1). Anything that counts projects counts them, Archive included (§6.3)."
      }
    ],
    properties: [
      {
        name: "name",
        objectType: "project",
        status: "confirmed",
        note: "Written by signature-ready-submit-intake. §6.3 asks Archive for the same fields as the inbox and adds only when it was archived and by whom."
      },
      {
        name: "uniqueIdentificationNumber",
        objectType: "project",
        status: "confirmed",
        note: "Written by submit-intake alongside its issuer, which is a closed 2 (§1). §3 records modelling it on project as a divergence rather than a defect: 1b.9(u) attaches the number to the EA and the EIS and makes it discretionary for a FANEC."
      },
      {
        name: "synthetic",
        objectType: "project",
        status: "confirmed",
        note: "Both existing rows carry synthetic=true (§1). The archive count is a count of projects, so it counts them unless the flag is used to exclude them — and §4 asks you whether the two rows should be deleted at all."
      },
      {
        name: "archived",
        objectType: "project",
        status: "proposed",
        note: "Does not exist. §3 records no deleted and no archivedAt property on project, and §6.3 asks for an archived state. The name is normalised from support.ts's absent query, ⟨project.archived = true⟩, and must not be matched against the ontology."
      },
      {
        name: "archivedAt",
        objectType: "project",
        status: "proposed",
        note: "The exact string appears in §6.3 and §6.7, but only in the list of what is needed — no such property exists, so it is proposed here."
      },
      {
        name: "archivedBy",
        objectType: "project",
        status: "proposed",
        note: "§6.3 asks for it 'if that becomes recordable', and until it is the row renders 'Archived by ⟨not recorded⟩'. No act writes an archiver; the four acts that write an actor take it from current_user_id (§1), which is the shape this one would follow."
      }
    ],
    acts: [
      {
        name: "signature-ready-archive-project",
        status: "proposed",
        note: "Does not exist. §1 lists 17 acts and none of them deletes or restores; §6.7 asks for archive, restore and purge acts. The name is a normalisation onto the signature-ready- convention and must not be matched against the ontology."
      },
      {
        name: "signature-ready-restore-project",
        status: "proposed",
        note: "Does not exist. Same source and the same warning."
      },
      {
        name: "signature-ready-purge-project",
        status: "proposed",
        note: "Does not exist. Same source and the same warning. This is the one act in the packet that destroys a record, so its submission criteria are worth writing before the act is."
      }
    ],
    datasets: [],
    links: [],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: "uniqueIdentificationNumber",
      resolver: "project where uniqueIdentificationNumber = ⟨n⟩ and uniqueIdentificationNumberIssuer = ⟨issuer⟩, taking the primary key; it must handle more than one match rather than take the first, because no Function exists to refuse a duplicate (§1).",
      note: "/archive takes no segment (src/ui/routes.ts). On this surface the number is output — it travels with the row and needs no resolution — and the resolver above is declared for the case where one arrives as input. Restore and permanently delete must address the project by its primary key and never by the number: 1b.9(u) makes it discretionary, submit-intake writes it with no uniqueness criterion, and a destructive act keyed on a display number is a destructive act keyed on something two projects can share."
    },
    query: {
      pageSize: 25,
      sortKey: "archivedAt",
      sortDirection: "desc",
      filter: "project where archived = true. Both the property and the predicate are proposed. A filter and not a traversal: project is the root of §1's spine and nothing links down to it, so there is no edge by which an archived project could be reached.",
      search: "none",
      counts: "aggregation",
      note: "⟨n⟩ archived is a count over the whole archived set and not the length of a page — a paged list would under-report it — and §6.3 records that anything counting projects counts the two synthetic rows. The page size is a proposal: nothing in the register, §6.3 or the screen states one. Three of the row's meta fields have no property to propose and are left as markers: §3 records that no object type carries a USDA subcomponent identity, project status is pathway state and is not built, and nothing carries a modified-at or a started-at."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "none",
      mustBeOn: [],
      note: "No surface here is reserved. Archiving is not one of the five determinations at 1b.11(a)(46), part 1b says nothing about deleting a record, and §7.2's gated list is the three signatures and nothing else. The confirmation dialog on permanently delete is a courtesy and not a gate — §7.2: a gate held only in the client is not a gate — so if purge is ever to be reserved, the reservation belongs in the purge act's submission criteria, and there is neither an act nor a Function to hold one today (§1)."
    },
    freshness: {
      afterWrite: "immediate",
      invalidatedBy: [],
      note: "Restore and permanently delete each remove a row from this list and from the count with it, so a stale read offers Restore on a project already restored and Delete permanently on one already gone; the second is unrecoverable, which is why this surface tolerates no staleness. All three names above are proposed and none of the seventeen acts exists, so nothing stales this surface today and the page renders empty until they do. (Dropped from an earlier draft of this list: signature-ready-archive-project, signature-ready-restore-project, signature-ready-purge-project. This list is DERIVED from acts.ts and not authored here, because a surface cannot know about an act it never heard of — three of those names are not among the seventeen at all.)"
    },
    needed: [
      "an archived state on project",
      "an archive act",
      "a restore act",
      "a purge act",
      "an archivedAt property, and an archivedBy if that becomes recordable"
    ],
    notes: [
      "§1 lists 17 acts and none of them deletes or restores; §3 records no deleted or archivedAt property on project. Archive has no backend address at all (§6.3).",
      "Built against the port shape and renders empty until those exist."
    ]
  },
  useExpertQueue: {
    serves: "the open expert requests, overdue first, and what came back",
    requires: [
      "§6.4",
      "§6.7",
      "§7.8 level 2 → level 4"
    ],
    status: "backlog",
    objectTypes: [
      {
        name: "assignment",
        status: "confirmed",
        note: "Zero rows. §1 names it among the ten wave-2 edges and package-expert-request writes assignment.sentAt and assignment.expectedReturnDate onto it."
      },
      {
        name: "discipline",
        status: "confirmed",
        note: "Exists and is empty, named in §3's interdisciplinary-preparation row alongside holder, attestation, assignment, engagement and receivedArtifact."
      },
      {
        name: "document",
        status: "proposed",
        note: "Declared because the link element.document ends here."
      },
      {
        name: "element",
        status: "proposed",
        note: "Declared because the link slot.element ends here."
      },
      {
        name: "engagement",
        status: "confirmed",
        note: "Zero rows. package-expert-request writes engagement.outcome='open'; accept-artifact writes engagement.gapsFound and outcome='artifact_received' (§1). materialized.engagement holds zero rows, so no transform can read an engagement back."
      },
      {
        name: "factor",
        status: "confirmed",
        note: "Exists and is empty. state-factor-finding closes at clear / present / undetermined, and present or undetermined is the condition that drafts a request and holds it in the queue (§6.4)."
      },
      {
        name: "holder",
        status: "confirmed",
        note: "Exists and is empty (§3). Nothing joins a holder to the slot needing one — B.5.12, still open — so a recipient is a suggestion the officer confirms, never a routing the system made (§6.4)."
      },
      {
        name: "project",
        status: "confirmed",
        note: "The row's Project column. project rows live in the edits layer and signatureReady.project holds zero rows, so the column is reached by traversal and never by a dataset join (§1)."
      },
      {
        name: "receivedArtifact",
        status: "confirmed",
        note: "Zero rows, created by record-artifact-arrival, and one of the five empty object-dataset materializations (§1)."
      },
      {
        name: "slot",
        status: "confirmed",
        note: "Both expert acts key on a slot and nothing creates one — the queue is built and empty until that changes (§6.4). Eleven of seventeen acts wait on the same row (§6.7)."
      }
    ],
    properties: [
      {
        name: "sentAt",
        objectType: "assignment",
        status: "confirmed",
        note: "Written by package-expert-request, which writes no actor — so the Sent column has a date and no sender (§1, §6.4)."
      },
      {
        name: "expectedReturnDate",
        objectType: "assignment",
        status: "confirmed",
        note: "Written in the same act. The queue's default sort key and the only thing overdue is computed from."
      },
      {
        name: "outcome",
        objectType: "engagement",
        status: "confirmed",
        note: "Written twice and only twice: package-expert-request sets 'open', accept-artifact sets 'artifact_received' (§1). The four statuses the screen shows are derived from this plus the date and the arrival, not read off it."
      },
      {
        name: "gapsFound",
        objectType: "engagement",
        status: "confirmed",
        note: "Written by accept-artifact. §6.4 requires it visible on the row rather than buried."
      },
      {
        name: "artifactType",
        objectType: "receivedArtifact",
        status: "confirmed",
        note: "Deliberately unconstrained on the act (§1), and yet accept-artifact refuses a delivered artifactType that is not slot.artifactAwaited (§3) — the constraint is on acceptance and not on arrival."
      },
      {
        name: "receivedAt",
        objectType: "receivedArtifact",
        status: "confirmed",
        note: "Written by record-artifact-arrival, which writes no actor."
      },
      {
        name: "targetKind",
        objectType: "assignment",
        status: "confirmed",
        note: "Closed at three, written by identify-expert-requirement. The act is a create that writes slot, and §1 names the edge an act writes as assignment.slot — so the row it creates is an assignment, not an engagement. That is an inference from one line and not a measurement: §1's action table names what each act writes and never the object type a create produces. Read it off the action's edit set before binding it. Note also that nothing in the seventeen creates an engagement at all, while package-expert-request modifies one."
      },
      {
        name: "targetName",
        objectType: "assignment",
        status: "confirmed",
        note: "Written by identify-expert-requirement, which is a create writing slot; §1 names the edge an act writes as assignment.slot, so the row it creates is an assignment and not an engagement. Written by identify-expert-requirement. Carries the same unattributed-object-type caveat as targetKind, and with no holder-to-slot join it is what a proposed recipient is drafted from (§6.7)."
      },
      {
        name: "identifiedAt",
        objectType: "assignment",
        status: "confirmed",
        note: "Written by identify-expert-requirement, which is a create writing slot; §1 names the edge an act writes as assignment.slot, so the row it creates is an assignment and not an engagement. Written by identify-expert-requirement. Same caveat, and it is the only timestamp on a request before it is sent."
      },
      {
        name: "artifactAwaited",
        objectType: "slot",
        status: "confirmed",
        note: "The Awaited column while a request is open. §3: accept-artifact refuses a delivered artifactType that is not slot.artifactAwaited — the one real refusal in the expert chain."
      },
      {
        name: "finding",
        objectType: "factor",
        status: "confirmed",
        note: "Closed 3: clear / present / undetermined. §3 records the three-member set as correctly encoding 1b.3(f)(2) — mere presence is not an extraordinary circumstance — where a yes/no set would have made the stopping rule invisible."
      },
      {
        name: "name",
        objectType: "project",
        status: "confirmed",
        note: "The Project column. Written by submit-intake."
      }
    ],
    acts: [
      {
        name: "signature-ready-identify-expert-requirement",
        status: "confirmed",
        note: "create — identifiedAt, targetKind (closed 3), targetName, slot; no actor (§1)."
      },
      {
        name: "signature-ready-package-expert-request",
        status: "confirmed",
        note: "modify ×2 — assignment.sentAt, assignment.expectedReturnDate, engagement.outcome='open'. Writes no actor, which §1 records as a named asymmetry, so the queue cannot show who sent a request (§6.4)."
      },
      {
        name: "signature-ready-record-artifact-arrival",
        status: "confirmed",
        note: "create — artifactType (deliberately unconstrained), assignment, receivedAt; no actor. At most one arrival per assignment is a guarantee waiting on the submission-time Function, so a second arrival can be recorded today (§1)."
      },
      {
        name: "signature-ready-accept-artifact",
        status: "confirmed",
        note: "modify — engagement.gapsFound, engagement.outcome='artifact_received'; no actor. The return leg belongs on this page (§6.4)."
      },
      {
        name: "signature-ready-state-factor-finding",
        status: "confirmed",
        note: "modify — finding (closed 3: clear / present / undetermined). §1 marks the missing actor here as a named gap, and §6.4 makes this act the Level 4 hook: on present or undetermined, draft the request and hold it pending."
      }
    ],
    datasets: [],
    links: [
      {
        name: "assignment.slot",
        status: "confirmed",
        from: "assignment",
        to: "slot",
        why: "§1 names the edge exactly and names it as the one edge that has never been tested and cannot be yet: it is written by an act into the edits layer while the backing column is null, and whether the link resolves in that state is unknown. Settle it by traversing the edge and never by reading the property back — the property reads correctly either way, which is what makes the failure silent. The Awaited column is slot.artifactAwaited, so if the edge does not resolve the column empties while the row still looks correct."
      },
      {
        name: "assignment.engagement",
        status: "proposed",
        from: "assignment",
        to: "engagement",
        why: "The row's dates are assignment.sentAt and expectedReturnDate while its status is engagement.outcome, and package-expert-request writes all three in one modify ×2 (§1) — so the two objects are one row and must be joined by an edge. Read as two filtered lists they drift, and a row can show a sent date with no outcome. §1 names assignment among the ten wave-2 edges by its target end only and prints neither the link type API name nor the source end."
      },
      {
        name: "assignment.receivedArtifact",
        status: "proposed",
        from: "assignment",
        to: "receivedArtifact",
        why: "returned and accepted are told apart by whether an arrival exists against the assignment, and record-artifact-arrival takes assignment as a parameter. A scan over receivedArtifact cannot say which assignment it answers, and §1 records that nothing refuses a second arrival per assignment — so duplicates must be seen on the row rather than deduped away by a filter. §1 names receivedArtifact among the wave-2 edges by its target end only."
      },
      {
        name: "slot.element",
        status: "proposed",
        from: "slot",
        to: "element",
        why: "The Project column is four edges above the assignment and there is no shortcut: §1 names the spine in prose — project → document → element → slot → claim — and prints no link type API name at either end, and a Foundry link type carries a different name at each end. This is the first edge of the climb."
      },
      {
        name: "element.document",
        status: "proposed",
        from: "element",
        to: "document",
        why: "The second edge of the same climb. A dataset join cannot substitute for it: signatureReady.project and signatureReady.document both hold zero rows and their rows live only in the edits layer (§1), so nothing outside the ontology can connect a slot to a project."
      },
      {
        name: "document.project",
        status: "proposed",
        from: "document",
        to: "project",
        why: "The last edge of the climb, and what makes the Project column possible at all. open-document writes project as a parameter so the relation exists; §1 names project → document as traversing today and does not print the link type API name in either direction."
      }
    ],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: null,
      resolver: null,
      note: "/experts takes no segment (src/ui/routes.ts). Selecting a row is client state — ExpertQScreen holds the open request in `composing` — so a request has no URL and cannot be linked to or reopened, and the fixture's q1–q4 are fixture ids and not keys. If a request is to be addressable the route needs an assignment primary key segment, and useExpertRequest needs to take it, which it does not today. The row shows the project's name and not its number, so nothing on this surface resolves a display number."
    },
    query: {
      pageSize: 25,
      sortKey: "expectedReturnDate",
      sortDirection: "asc",
      filter: "engagement.outcome = 'open' for the queue proper. The five filter options are derived states and not stored ones: awaiting is outcome 'open' with expectedReturnDate on or after today; overdue is outcome 'open' with expectedReturnDate before today; returned is an arrival recorded against the assignment while outcome is still 'open'; accepted is outcome 'artifact_received'. Only two of the four values are ever written — package-expert-request writes 'open' and accept-artifact writes 'artifact_received' (§1) — so the filter must be expressed over outcome, expectedReturnDate and the arrival edge, and never over a status column, which does not exist.",
      search: "none",
      counts: "aggregation",
      note: "⟨n⟩ open · ⟨n⟩ overdue are two counts over the whole queue and not lengths of the page, and overdue needs a date comparison as well, so it is an aggregation with a predicate rather than a count of rows in hand. Sorting expectedReturnDate ascending within outcome = 'open' puts the most overdue first, which is what §6.4 asks for by default — so overdue-first is a real server sort and not a client re-order. The page size is a proposal: nothing in the register, §6.4 or the screen states one."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "submissionCriteria",
      mustBeOn: [
        "signature-ready-state-factor-finding"
      ],
      note: "No surface on the queue is reserved. §7.2 gates the three signatures and nothing else, and it names Senior Agency Official concurrences as outbound requests rather than gates — a request to a specialist is the same shape, recorded and sent by a regular user. There would be nothing to check a caller against in any case: neither identify-expert-requirement, package-expert-request nor state-factor-finding writes an actor (§1, §6.7), so the queue cannot show who sent a request. The one real refusal in the chain sits on the data and not on the caller — §3 records that accept-artifact refuses a delivered artifactType that is not slot.artifactAwaited — and it belongs on the platform: surface the refusal rather than pre-empting it in the client."
    },
    freshness: {
      afterWrite: "immediate",
      invalidatedBy: [
        "signature-ready-accept-artifact",
        "signature-ready-identify-expert-requirement",
        "signature-ready-package-expert-request",
        "signature-ready-record-artifact-arrival",
        "signature-ready-state-factor-finding"
      ],
      note: "Each of the five moves a row between the four statuses or puts one in the queue, and both counts restate with it — so the count is re-aggregated after a write and never decremented locally. state-factor-finding is the one that arrives from outside this page: a finding of present or undetermined is what drafts a request and holds it here (§6.4), so a write on the project page's extraordinary-circumstances tab stales the queue. gapsFound arrives with accept-artifact and §6.4 requires it on the row, so a stale read hides the very thing the return leg exists for."
    },
    needed: [
      "anything that creates a slot row — eleven of seventeen acts wait on this, and the queue is empty until it exists",
      "an actor on identify-expert-requirement, package-expert-request and state-factor-finding; none writes one, so the queue cannot show who sent a request",
      "a holder-to-slot join (B.5.12); nothing joins a holder to the slot needing one, so a recipient is a suggestion the officer confirms",
      "a record that an interdisciplinary review occurred — precisely what 1b.3(g)(2)(v) requires a FANEC to assert"
    ],
    notes: [
      "state-factor-finding closes at clear / present / undetermined. Present or undetermined is the condition that drafts a request and holds it in the queue (§6.4).",
      "assignment.slot is written into the edits layer while the backing column is null; whether the edge resolves in that state is unknown and must be settled by traversing it, never by reading the property back (§1)."
    ]
  },
  useExpertRequest: {
    serves: "the drafted request in the compose overlay, and sending it",
    requires: [
      "§6.4 the overlay",
      "§6.7"
    ],
    status: "backlog",
    objectTypes: [
      {
        name: "assignment",
        status: "confirmed",
        note: "The row the overlay sends on. package-expert-request writes assignment.sentAt and assignment.expectedReturnDate (§1)."
      },
      {
        name: "document",
        status: "proposed",
        note: "Declared because the link element.document ends here."
      },
      {
        name: "element",
        status: "proposed",
        note: "Declared because the link slot.element ends here."
      },
      {
        name: "engagement",
        status: "confirmed",
        note: "The other half of the same act: package-expert-request sets engagement.outcome='open' in the same modify ×2 (§1)."
      },
      {
        name: "factor",
        status: "confirmed",
        note: "The trigger. A finding of present or undetermined is what drafts this request (§6.4)."
      },
      {
        name: "holder",
        status: "confirmed",
        note: "The proposed recipient, rendered as ⟨holder.name, qualification⟩. Exists and is empty, and nothing joins it to the slot needing one — B.5.12, still open (§6.7) — so the recipient is a suggestion the officer confirms."
      },
      {
        name: "project",
        status: "confirmed",
        note: "The overlay's header line — the project's name and its unique identification number (§6.4)."
      },
      {
        name: "screen",
        status: "proposed",
        note: "Declared because the link screen.factor starts here."
      },
      {
        name: "slot",
        status: "confirmed",
        note: "What the request attaches to, and where artifactAwaited lives. Nothing creates a slot, so the overlay has nothing to open onto until that changes (§6.4, §6.7)."
      }
    ],
    properties: [
      {
        name: "sentAt",
        objectType: "assignment",
        status: "confirmed",
        note: "Written when the overlay sends. Nothing records who sent it: the act writes no actor (§1)."
      },
      {
        name: "expectedReturnDate",
        objectType: "assignment",
        status: "confirmed",
        note: "The overlay's Expected return field, and the queue's sort key once the request is sent."
      },
      {
        name: "artifactAwaited",
        objectType: "slot",
        status: "confirmed",
        note: "The overlay's Artifact awaited line, and the value accept-artifact later refuses a mismatched arrival against (§3)."
      },
      {
        name: "finding",
        objectType: "factor",
        status: "confirmed",
        note: "Closed 3: clear / present / undetermined. The Trigger line is this finding, and §3 records that the finding carries no actor and no timestamp."
      },
      {
        name: "outcome",
        objectType: "engagement",
        status: "confirmed",
        note: "Set to 'open' by the same act that writes the two dates, so the send is one transaction across two objects (§1)."
      },
      {
        name: "name",
        objectType: "project",
        status: "confirmed",
        note: "The overlay's header, with the number beside it."
      },
      {
        name: "uniqueIdentificationNumber",
        objectType: "project",
        status: "confirmed",
        note: "Printed in the overlay header. §3 records its placement on project as a divergence rather than a defect: 1b.9(u) attaches the number to the EA and the EIS and makes it discretionary for a FANEC."
      },
      {
        name: "targetKind",
        objectType: "assignment",
        status: "confirmed",
        note: "Written by identify-expert-requirement, which is a create writing slot; §1 names the edge an act writes as assignment.slot, so the row it creates is an assignment and not an engagement. Closed 3, written by identify-expert-requirement. Carries the queue's unattributed-object-type caveat: §1's action table names the parameter without naming the type the create writes, and it is either assignment or engagement."
      },
      {
        name: "targetName",
        objectType: "assignment",
        status: "confirmed",
        note: "Written by identify-expert-requirement, which is a create writing slot; §1 names the edge an act writes as assignment.slot, so the row it creates is an assignment and not an engagement. What the proposed recipient is drafted from, because no holder-to-slot join exists (§6.7). Same unattributed-object-type caveat."
      }
    ],
    acts: [
      {
        name: "signature-ready-package-expert-request",
        status: "confirmed",
        note: "modify ×2 — assignment.sentAt, assignment.expectedReturnDate, engagement.outcome='open'. Writes no actor, which §1 records as a named asymmetry. It does not write the body the officer edited: that has no ontology address at all."
      }
    ],
    datasets: [],
    links: [
      {
        name: "assignment.slot",
        status: "confirmed",
        from: "assignment",
        to: "slot",
        why: "Named exactly in §1, and named there as the one edge that has never been tested and cannot be yet — written by an act into the edits layer while the backing column is null. Settle it by traversing it, never by reading the property back, because the property reads correctly either way. artifactAwaited is read across this edge, so a silently unresolved edge drafts a request for nothing while the overlay looks correct."
      },
      {
        name: "assignment.engagement",
        status: "proposed",
        from: "assignment",
        to: "engagement",
        why: "Sending is one act across two objects — assignment.sentAt, assignment.expectedReturnDate and engagement.outcome in a single modify ×2 (§1) — so the overlay must hold both from one row and cannot address them as two independent reads. §1 names assignment among the ten wave-2 edges by its target end only and prints no link type API name."
      },
      {
        name: "slot.element",
        status: "proposed",
        from: "slot",
        to: "element",
        why: "The header's project name and unique identification number are not on the assignment; they are three edges above the slot. §1 names the spine in prose only, and a dataset join cannot substitute — project rows live in the edits layer and signatureReady.project holds zero rows (§1)."
      },
      {
        name: "element.document",
        status: "proposed",
        from: "element",
        to: "document",
        why: "The second edge of the same climb, and the same absence of a printed link type API name."
      },
      {
        name: "document.project",
        status: "proposed",
        from: "document",
        to: "project",
        why: "The edge that reaches the header. open-document writes project as a parameter, so the relation exists; §1 names project → document as traversing and prints no link type API name in either direction."
      },
      {
        name: "screen.factor",
        status: "proposed",
        from: "screen",
        to: "factor",
        why: "Declared so the edge is looked for, not because the register names it. §1 names screen and factor among the ten wave-2 edges by their target end only, and §3 records that nothing joins a factor finding to the clause that required the discipline — so the overlay's Trigger line is assembled by the caller rather than reached by a traversal, and its regulatory-basis line has no address at all."
      }
    ],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: "uniqueIdentificationNumber",
      resolver: "project where uniqueIdentificationNumber = ⟨n⟩ and uniqueIdentificationNumberIssuer = ⟨issuer⟩, taking the primary key; the issuer is carried because the number is a subcomponent's own series and its set is closed at two (§1, submit-intake), and the query must handle more than one match rather than take the first, because no Function exists to refuse a duplicate (§1).",
      note: "useExpertRequest takes no argument at all today (src/ui/data/port.ts): the overlay is mounted by ExpertQScreen's `composing` state and returns the same draft whichever row was clicked, so the hook cannot address a request. What the adapter needs in the signature is the assignment's primary key. On this surface the unique identification number is output — read off the project the traversal already reached — and the resolver above is for the input case, a pasted URL or a typed number."
    },
    query: {
      pageSize: null,
      sortKey: null,
      sortDirection: null,
      filter: "One assignment by primary key, with its engagement, its slot, and the project reached by climbing the spine from the slot. Not a list, and never a scan.",
      search: "none",
      counts: "none",
      note: "The body is not a read. §7.8 records that retrieval which cannot run reports unresolved and not absent — the lane could not have answered, which is a different claim from finding nothing — and support.ts's expertDraftUnresolved says exactly that. §1 records that no model call has happened and none can: the only configured provider host is an RFC-2606 .invalid domain and LiveHTTPTransport.invoke raises even with a credential set. So a filled body today is template substitution, which is what all 103 grounding claims are (§0, §6.5). The proposed recipient is a suggestion and not a routing, because nothing joins a holder to the slot needing one (B.5.12, §6.7)."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "submissionCriteria",
      mustBeOn: [
        "signature-ready-state-factor-finding"
      ],
      note: "Sending is not a reserved surface. §7.2 gates the three signatures and nothing else and names Senior Agency Official concurrences as outbound requests rather than gates; an expert request is the same shape. package-expert-request writes no actor at all — §1's named asymmetry — so there would be nothing on the row to check a caller against even if a gate were wanted. Expert identities are notional for this build and nothing is transmitted (§6.4): Send records an act, it does not deliver a message."
    },
    freshness: {
      afterWrite: "immediate",
      invalidatedBy: [
        "signature-ready-identify-expert-requirement",
        "signature-ready-package-expert-request",
        "signature-ready-state-factor-finding"
      ],
      note: "The send writes both dates and the outcome in one act, so the overlay closes onto a re-read row rather than onto its own optimistic copy, and the queue behind it restates at the same moment. A changed finding changes the trigger the draft is assembled from, and identify-expert-requirement's targetKind and targetName are what the recipient is proposed from. What must not survive the close is the edited body: it is a proposal until an act records it, and no act records it."
    },
    needed: [
      "the same slot row the queue waits on",
      "an actor on package-expert-request",
      "an address for the regulatory basis of a request; the trigger is a factor finding and nothing joins it to the clause that required the discipline"
    ],
    notes: [
      "package-expert-request is a modify ×2 — assignment.sentAt and expectedReturnDate, engagement.outcome='open' — and writes no actor. §1 records that as a named asymmetry.",
      "Expert identities are notional for this build; nothing is transmitted (§6.4)."
    ]
  },
  useLearning: {
    serves: "what the system proposed, what a human did with it, and whether it is calibrated",
    requires: [
      "§6.5",
      "§6.7"
    ],
    status: "backlog",
    objectTypes: [
      {
        name: "adoption",
        status: "confirmed",
        note: "§1 names it as one of the five object-dataset materializations and §6.5 makes it tile 3. The rows adopt writes live in the edits layer."
      },
      {
        name: "claim",
        status: "proposed",
        note: "Declared because this surface reads verdict off it. The object type exists; whether this exact API name is the platforms is not measured here."
      },
      {
        name: "determination",
        status: "confirmed",
        note: "added to the existing four: the absent state declares its query as ⟨adoption.byProject · determination.byProject⟩, so the surface reads it. §1's action table writes it and it is one of the five materializations that hold zero rows."
      },
      {
        name: "determinationEvidence",
        status: "confirmed",
        note: "§1: a declared evidence set for two of the five determinations and none for the other three, so those three report unresolved under the filled fixture. Tile 6 must list them as the distinction working, never filter them out as noise."
      },
      {
        name: "dispositionMix",
        status: "proposed",
        note: "Declared because the link manifest.dispositionMix ends here."
      },
      {
        name: "document",
        status: "proposed",
        note: "Declared because the link document.manifest starts here."
      },
      {
        name: "factor",
        status: "confirmed",
        note: "§3 records screen + factor + state-factor-finding as existing. factor.finding is closed at clear / present / undetermined, and §6.4 makes present or undetermined the Level 4 trigger, so the same rows are counted here and queued there."
      },
      {
        name: "manifest",
        status: "proposed",
        note: "Declared because the link document.manifest ends here."
      },
      {
        name: "ratification",
        status: "confirmed",
        note: "§1: it projects over acts that write to the edits layer and nothing can read one, so it can never populate. Level 3 has its shape and not its mechanism."
      },
      {
        name: "slot",
        status: "confirmed",
        note: "the carrier of the disposition tile. §1: eleven of the seventeen acts are keyed on a slot, claim, manifest, adoption, factor, branch or consistencyDetermination row, and nothing creates any of those."
      }
    ],
    properties: [
      {
        name: "adoptedValue",
        objectType: "adoption",
        status: "confirmed",
        note: "written by signature-ready-adopt (§1). An 'adopted' carrying no value must be surfaced rather than filtered: the rule that adoptedValue is present unless adoptionState is 'rejected' is a conditional over another parameter's nullity, it is not expressible without the absent submission-time Function, and such a row can be recorded today (§1, §6.5)."
      },
      {
        name: "adoptionState",
        objectType: "adoption",
        status: "confirmed",
        note: "closed 3 (§1). The tile rates by state, so the three members are the group-by key and not a filter."
      },
      {
        name: "disposition",
        objectType: "slot",
        status: "confirmed",
        note: "written by signature-ready-freeze-slot-disposition, closed 3 (§1). The register names the property in the action table and never names its carrier; slot is taken from the act's own name and from §1's list of the rows the eleven acts are keyed on. Note the collision — §3 also records issue.disposition, single-valued where an issue may carry several (G134), and that is a different property on a different type."
      },
      {
        name: "verdict",
        objectType: "claim",
        status: "confirmed",
        note: "written by signature-ready-stamp-verifier-verdict, pass / fail, default still pass (§1). The carrier is not stated anywhere; claim is taken from §1's 'letting a failed claim into a signed document' and from the same list of act keys. Confirm the carrier before binding — with 76 of 79 types empty, a near-miss carrier reads exactly like an empty type."
      },
      {
        name: "verdictStampedAt",
        objectType: "claim",
        status: "confirmed",
        note: "same act, same carrier caveat. §1's not_before rule compares it against the manifest's emittedAt and calls it a cross-object comparison, which is one of the eight preconditions waiting on a Function — so a verdict stamped before its manifest can exist in the data and the tile will count it."
      }
    ],
    acts: [
      {
        name: "signature-ready-adopt",
        status: "confirmed",
        note: "§1's action table. §7.8: adopt on a drafted row is what records the adoption diff on Learning."
      },
      {
        name: "signature-ready-freeze-slot-disposition",
        status: "confirmed",
        note: "§1's action table. §7.8: it is what fires the comparison of the disposition mix against disposition_mix.pin.json."
      },
      {
        name: "signature-ready-stamp-verifier-verdict",
        status: "confirmed",
        note: "§1's action table. Writes no actor, and its default is still pass and can only be cleared by hand in Ontology Manager."
      }
    ],
    datasets: [
      {
        name: "corpus.manifestStatus",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "check.regulationDrift",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "materialized.adoption",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "materialized.assignment",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "materialized.determination",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "materialized.engagement",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "materialized.receivedArtifact",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      }
    ],
    links: [
      {
        name: "document.manifest",
        status: "confirmed",
        from: "document",
        to: "manifest",
        why: "a diverging mix has to say which document it belongs to. §1 names this as one of the C1 singletons — one manifest per document — so the drill-in traverses the edge instead of scanning manifests for one whose document field matches. The register writes the singletons as object-dot-link paths and never gives the link type's own API name, so match the path and read the type name off the ontology."
      },
      {
        name: "manifest.dispositionMix",
        status: "confirmed",
        from: "manifest",
        to: "dispositionMix",
        why: "tile 4 compares the mix against its pin, and intent-predicate clause 2 turns on that comparison (§1, §6.5). The mix is a single object hanging off the manifest, so it is reached by the singleton link; a mix recomputed in the client by aggregating slot dispositions is a second definition of the same number and will drift from the one the clause compares against, silently and in the direction that looks healthy."
      }
    ],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: null,
      resolver: null,
      note: "The page is app-wide: /learning carries no parameter (src/ui/routes.ts) and every tile is a figure about the build rather than about a project. The absent state already names a per-project cut — ⟨adoption.byProject · determination.byProject⟩ — and if that lands the parameter is project's primary key and never uniqueIdentificationNumber: §3 records modelling that number on project as a divergence, 1b.9(u) makes it discretionary for a FANEC, and one of the two existing project rows is null on every field but its name."
    },
    query: {
      pageSize: null,
      sortKey: null,
      sortDirection: null,
      filter: "none. Every tile is a group-by over the whole build — adoption by adoptionState, verdicts by verdict, unresolved by lane, corpus shortfalls by corpus — and no tile takes a facet or a date range, because there is no series to cut.",
      search: "none",
      counts: "aggregation",
      note: "Nothing on this page is a list, so nothing on it may be a length. 0 / 0 / 103 is GROUNDING-CONTRACT.md's count and is a repository artifact rather than an ontology read (§0); 6 is a count over signatureReady.corpus.manifestStatus and must be counted server-side rather than taken as the length of what was fetched; 0 is check.regulationDrift's noDriftDetected. The tiles whose figures read ⟨n⟩ are the ones no count exists for, because the materializations hold zero rows — an aggregation that returns zero and an aggregation that could not run are different answers and §6.5 tile 2 is the banner that says which this is. No sparklines: §6.5 forbids a series over data that does not exist."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "none",
      mustBeOn: [],
      note: "Learning reserves nothing and writes nothing; it reports. The gate-shaped fact it must carry is that a gate went missing: since signature-ready-stamp-verifier-verdict widened to accept fail on 2026-09-01, clause 3's pass-only requirement is held by nothing (§1), so a pass count here is a tally and never an assurance that no failed claim reached a signed document. Only an emission gate could tell those apart, and it does not exist."
    },
    freshness: {
      afterWrite: "tolerant",
      invalidatedBy: [
        "signature-ready-adopt",
        "signature-ready-freeze-slot-disposition",
        "signature-ready-stamp-verifier-verdict"
      ],
      note: "Tolerant, and it has no choice. §7.8 names those three as the Level 2 → Level 3 triggers, but the path from any of them to a tile runs through the five object-dataset materializations, and all five hold zero rows, so no transform can read an act-written row and nothing an officer does today reaches this page (§1). A tile that appeared to update the moment an act returned would be reading the edits layer directly and claiming a mechanism the build does not have."
    },
    needed: [
      "the five object-dataset materializations — adoption, assignment, determination, engagement, receivedArtifact — all hold zero rows, so no transform can read an act-written row and ratification can never populate",
      "the submission-time Function, which holds eight named preconditions including two intent-predicate clauses"
    ],
    notes: [
      "Grounding is 0 live-model, 0 cassette, 103 template-substitution claims. No model call has happened and none can: the only configured provider host is an RFC-2606 .invalid domain and LiveHTTPTransport.invoke raises even with a credential set. The tile displays the real number (§6.5).",
      "stamp-verifier-verdict still defaults to pass and can only be cleared by hand in Ontology Manager; since the act widened to accept fail on 2026-09-01, clause 3's pass-only requirement is held by nothing.",
      "determinationEvidence has a declared evidence set for two of the five determinations and none for the other three, so those three report that nothing was asked rather than that nothing was found. That is the distinction working (§1).",
      "Named as a future tile and not built: 1b.3(h) reliance on a prior CE determination is a genuine regulation-backed learning loop. §3 records precedent and prior_coverage in the spec and 51 artifacts in the prior-coverage corpus, and no object type records a reliance (§6.5)."
    ]
  },
  useReference: {
    serves: "the corpus, faceted and searchable — the only page in the application with real data in it",
    requires: [
      "§6.6",
      "§6.7"
    ],
    status: "answerable",
    objectTypes: [
      {
        name: "corpusArtifact",
        status: "confirmed",
        note: "§1: the joined object type, 312 rows, queryable — and the only type in the build with real rows in it. Everything else outside the two synthetic project rows and one synthetic document is empty."
      }
    ],
    properties: [
      {
        name: "title",
        objectType: "corpusArtifact",
        status: "proposed",
        note: "§6.6 lists Title as a row field and §1 says search covers titles and metadata; no section names a property. The exact string in guidance is only ever title-7, title-level or 'the EIS title as filed'."
      },
      {
        name: "corpus",
        objectType: "corpusArtifact",
        status: "proposed",
        note: "the primary grouping (§6.6) and a row field, never named as a property. The values are firmer than the name: §1 and §5 name four of the seven media sets exactly — nepa-decided, prior-coverage-ipnf-knf, forest-plan-raw and reg-36cfr220 — so bind the values first and let them tell you the column."
      },
      {
        name: "documentType",
        objectType: "corpusArtifact",
        status: "proposed",
        note: "the exact string is measured on a different type: §1's action table writes document.documentType (closed 5) on document. On the corpus side §6.6 writes 'document type' and gives the facet counts FANEC 4, DM 32, EA 29, FONSI 34, EIS 51, ROD 47. Same word, different carrier — this is precisely the near-miss the register warns about, and Decision Memo is in the corpus set and not in document's closed five, because the current text has no such document (§5)."
      },
      {
        name: "ruleVintage",
        objectType: "corpusArtifact",
        status: "proposed",
        note: "§5's table is headed 'rule vintage' and its values are measured — unknown 169, 36 CFR 220 (2024-12-31) 100, older 36 CFR 220 vintages 11, 7CFR1b-2025-07-03 5, 7 CFR 1b (2026-08-25) 2, null 25. The screen's facet labels are not those values: 'Current rule — 2026-04-03' matches nothing §5 measured, because there are zero practice exemplars under the current rule and the only current-vintage artifacts are two copies of the rule itself."
      },
      {
        name: "authorityClass",
        objectType: "corpusArtifact",
        status: "confirmed",
        note: "§0 and §1: two reg-36cfr220 rows declare authorityClass=regulation. The class facet's three options — 283 practice, 4 regulation, 25 undeclared — are this property plus the undeclared case, which is classDeclared and not a third class value."
      },
      {
        name: "classDeclared",
        objectType: "corpusArtifact",
        status: "confirmed",
        note: "§1: 25 rows carry classDeclared=false — 17 forest-plan-raw plus 8 manifests and cover notes. C11 gave this property the treatment citable did not get, so it is the predicate that separates not-declared from not-citable and it is the only one that does."
      },
      {
        name: "citable",
        objectType: "corpusArtifact",
        status: "confirmed",
        note: "§1 names it as corpusArtifact.citable and records three values, not two. The adapter's rule is exact: citable=true → 'yes', citable=false → 'no', classDeclared=false with a NULL citable → 'not-declared'. A filter written as NOT citable folds the 25 undeclared rows into the refusal, which is the null being asked to carry a meaning it does not have."
      },
      {
        name: "supersededButClassedCurrent",
        objectType: "corpusArtifact",
        status: "confirmed",
        note: "§1: true on the two reg-36cfr220 rows, which also declare authorityClass=regulation and citable=true, while 36 CFR 220 was superseded on 2025-07-03 and 111 corpus artifacts are written under it. Render the row warning from this property and never from a hard-coded id — it is a WARN today and becomes a FAIL when a corrected manifest lands, and that flip is the point."
      },
      {
        name: "extractability",
        objectType: "corpusArtifact",
        status: "proposed",
        note: "§6.6's facet and row-field label. §1 names the dataset that classifies it — signatureReady.corpus.textProvenance, 271 rows — and its four values, 253 born-digital, 14 image-only, 2 unreadable, 2 ocr-derived, but never the column, so the carrier may be a property on corpusArtifact or a join to that dataset. The fixture's strings (Born-digital, Image-only, OCR-derived, Unreadable) are display labels and not the measured values."
      },
      {
        name: "minCharsOnAPage",
        objectType: "corpusArtifact",
        status: "confirmed",
        note: "§1 and §5: recorded on every row and deliberately not wired into the classifier, because a threshold is a determination nobody wrote down. It is on screen so the born-digital verdict — which rests on marker absence, with only 2 of 271 documents firing a marker at all — is investigable by the reader rather than trusted."
      },
      {
        name: "sha256",
        objectType: "corpusArtifact",
        status: "confirmed",
        note: "§1 names it as a column of signatureReady.corpus.census, which carries sha256 and byte length for every artifact in every grounding media set. It is half of check.corpusPin's match, 287 of 287 in both directions."
      },
      {
        name: "byteLength",
        objectType: "corpusArtifact",
        status: "proposed",
        note: "the register writes 'byte length' throughout and never the camelCase identifier. It is the other half of the pin check, and length matching in both directions is what makes a digest match mean something."
      }
    ],
    acts: [],
    datasets: [
      {
        name: "corpus.census",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "corpus.manifest",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "corpus.manifestStatus",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "corpus.textProvenance",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      }
    ],
    links: [],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: "sha256",
      resolver: null,
      note: "/reference takes no parameter (src/ui/routes.ts): the corpus / regulation / catalogue groups, the facet selection and the open artifact are all component state. The digest is on every row and must stay there — it is the evidence the integrity strip is about — but the list resolves nothing, because the row it displays already carries the object. The fix belongs in the adapter's favour rather than the screen's: a faceted view over 312 artifacts that cannot be linked to cannot be cited in a review, so facets and search belong in the query string and the open artifact's primary key belongs in a path segment, which is useReferenceArtifact's parameter."
    },
    query: {
      pageSize: 50,
      sortKey: "corpus",
      sortDirection: "asc",
      filter: "Facet selection over documentType, authorityClass, ruleVintage, extractability and citable, plus the seven chips the screen offers — All artifacts, Citable, Not citable, Not declared, Superseded authority, Rescinded, Will not open. Three of those are not one property each: Not declared is classDeclared=false, Superseded authority is supersededButClassedCurrent=true, and Will not open is the unreadable extractability value, 2 rows truncated at source.",
      search: "server",
      counts: "aggregation",
      note: "No section fixes a page size, so 50 is proposed; the fixture's seven rows are one per condition and not a page. Corpus is the primary grouping (§6.6) and no secondary order is specified anywhere — propose title as the tiebreak, because 312 rows grouped with no tiebreak re-order between pages. Search is server-side, and the reason is the counts rather than the volume: 312 rows would fetch, but a client filter leaves the header count and every facet count to be recomputed from what was fetched, at which point they stop being aggregations. They are aggregations over the whole corpus — 312 artifacts, 7 media sets, 283 practice / 4 regulation / 25 undeclared, FANEC 4 / DM 32 / EA 29 / FONSI 34 / EIS 51 / ROD 47, born-digital 253 / image-only 14 / ocr-derived 2 / unreadable 2, not-declared 25 — and no page size may change one of them. Search covers titles and metadata only: corpus.text holds 17 rows and zero PDF body text, so a box that promises full text lies. One chip has no property behind it at all — Rescinded, for the 26 FSH 1909.15 chapters rescinded in their entirety by WO Amendment 1909.15-2026-1 effective 2026-03-26 (§5, §6.6); no section names a column that carries it, so the FDE has to ground it. And no link type reaches corpusArtifact: §1's 38 link type resources are the project → document → element → slot → claim spine, manifest → unsatisfiedElement, the five C1 singletons and the ten wave-2 edges, none of which touches the corpus — so this page is a filter over one type, and the two columns that look like edges, proposalRecordItem.documentId and incorporatedByReference.documentId, point at a pinned corpus artifact and never at a document object, which makes resolving one a value lookup and a link there wrong rather than merely empty."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "none",
      mustBeOn: [],
      note: "Nothing here is reserved. The corpus is evidence, and all five determinations the rule reserves at 1b.11(a)(46) are elsewhere. The two things that look like gates are not: no act among §1's 17 adds or removes a corpus artifact, and the build account is Viewer-only and permanently so, so an Add control is not a withheld permission but an undecided one — §6.6 asks whether add means upload or means recording an intent to add, and the page must be built for whichever answer comes back rather than faking the other."
    },
    freshness: {
      afterWrite: "tolerant",
      invalidatedBy: [],
      note: "No act stales this surface: none of the 17 writes a corpusArtifact. The corpus changes only out of band — uploaded to a media set and verified by digest in a build, a route proven over 287 artifacts — and nothing syncs, every data connection source has code-repository, Pipeline Builder and compute-module usage disabled (§1). What can move under the page without any write is the pin and the drift witness, and that is a scheduled build rather than a user action."
    },
    needed: [
      "a decision on what add means — upload, or recording an intent to add. No act adds or removes a corpus artifact, nothing syncs, and the build account is Viewer-only and permanently so"
    ],
    notes: [
      "312 artifacts across seven media sets: 283 practice, 4 regulation, 25 undeclared.",
      "citable carries three values, not two: 25 rows have classDeclared=false and a NULL citable, and the null is being asked to carry a refusal. Not-declared renders distinctly from not-citable (§1, §6.6).",
      "Free-text search covers titles and metadata only. corpus.text holds 17 rows and zero PDF body text, so there is no body to search.",
      "Integrity, from check.corpusPin, check.forestPlanPin, check.regulationPin and check.regulationDrift: 287 of 287 declared artifacts match on digest and length in both directions; 11 forest-plan sources pinned; regulation pin green; drift clean at 2026-08-25.",
      "reg-36cfr220 is a WARN and not a FAIL: two rows declare authorityClass=regulation and citable=true with supersededButClassedCurrent=true, while 36 CFR 220 was superseded on 2025-07-03 and 111 corpus artifacts are written under it."
    ]
  },
  useReferenceArtifact: {
    serves: "one artifact in the viewer, opened at a cited page range",
    requires: [
      "§6.6 the viewer",
      "§6.7",
      "§5"
    ],
    status: "partial",
    objectTypes: [
      {
        name: "corpusArtifact",
        status: "confirmed",
        note: "§1: the joined object type, 312 rows, queryable. The viewer opens one of them, and it is the one read in the application that can fail loudly rather than emptily."
      }
    ],
    properties: [
      {
        name: "sha256",
        objectType: "corpusArtifact",
        status: "confirmed",
        note: "§1 names it as a column of signatureReady.corpus.census. On the card it is not decoration: it is the reason a page-range citation can be trusted while the bytes are unreachable."
      },
      {
        name: "byteLength",
        objectType: "corpusArtifact",
        status: "proposed",
        note: "the register writes 'byte length' and never the camelCase identifier. check.corpusPin matches 287 of 287 on digest and length in both directions, so the two travel together and neither alone is the check."
      },
      {
        name: "extractability",
        objectType: "corpusArtifact",
        status: "proposed",
        note: "§6.6's label. §1 names signatureReady.corpus.textProvenance and its four values — 253 born-digital, 14 image-only, 2 unreadable, 2 ocr-derived — and never the column. The viewer branches on it: an unreadable artifact reports unresolved because the lane could not have answered, and an image-only one opens but has no text layer, one of the 14 legitimately so because it is a map."
      },
      {
        name: "minCharsOnAPage",
        objectType: "corpusArtifact",
        status: "confirmed",
        note: "§1: recorded on every row, deliberately not wired into the classifier. It belongs on the card because the born-digital verdict rests on marker absence and only 2 of 271 documents fired a marker at all — the field is how a reader investigates a document the classifier believes."
      }
    ],
    acts: [],
    datasets: [
      {
        name: "corpus.textProvenance",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "corpus.census",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      }
    ],
    links: [],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: "sha256",
      resolver: "⟨corpusArtifact · filter sha256 eq ⟨digest⟩⟩ — proposed, and safe only over the 287 declared artifacts: check.corpusPin matches 287 of 287 on digest and length in both directions, which is what makes the digest a key over that set, and the 25 undeclared rows sit outside the check",
      note: "The hook takes an id and the screen passes the row's own — setViewing(row.id) — so nothing about the open artifact is in the URL and no cited page range in this application is linkable. Address by corpusArtifact's primary key, and if the id is promoted to a route segment it is the primary key that goes there, never the title. The addressable unit is a page range and not a document (§5, §6.6), so the linkable thing is a pair — the artifact and the pages — and the range is not a property of the artifact: it comes from the citation that opened it. §1 records page alongside documentId on incorporatedByReference and proposalRecordItem, and both documentId columns refer to a pinned corpus artifact and never to a document object."
    },
    query: {
      pageSize: null,
      sortKey: null,
      sortDirection: null,
      filter: "one artifact, by primary key. Nothing is filtered and nothing is listed; the only branch is on extractability, which decides whether the card opens, opens without a text layer, or reports that the file will not open at all.",
      search: "none",
      counts: "none",
      note: "Not a list, so no count on the card is either an aggregation or a length: the page range and the total — ⟨pages.start⟩–⟨pages.end⟩ of ⟨pages.total⟩ — are values read off the artifact and its citation, and §5's worked case is a corpus FONSI at pages 31–34 of a 155-page file, which is why the document is the wrong unit. The default region is blocked and not absent, and the distinction is the surface's whole content: the query did not run and find nothing, a precondition is unmet — the media-set read route (§6.6, §6.7). An artifact truncated at source reports unresolved instead, because the lane could not have answered; 2 of the 271 classified PDFs are. Anything the viewer ever offers as selectable text carries §5's caveat, that extracted text can be wrong while announcing nothing — on the 1990 Umatilla ROD the cover reads Forest Service in the page image and 'Forest %Nice' in the text layer, on all three extractors."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "none",
      mustBeOn: [],
      note: "Nothing on the viewer is reserved to anyone: an artifact is evidence, not a determination, and no act writes one. What is withheld is the bytes, and that is a missing route rather than a gate — the difference matters, because a gate renders as an act the caller may not perform while a missing route renders as blocked, naming what it waits on."
    },
    freshness: {
      afterWrite: "tolerant",
      invalidatedBy: [],
      note: "A pinned artifact is immutable by construction: if the bytes moved, the digest and length check would fail, which is what the pin is for. Nothing an officer does in this application writes one, and the card may be cached for as long as the pin stands."
    },
    needed: [
      "a media-set read route for the viewer. Whether an OSDK front end can read those bytes, and by what route, is not answerable from the interface side; until it is, the card carries metadata, digest and page-range citation and the viewer is a slot that lights up later"
    ],
    notes: [
      "The addressable unit is a page range, not a document: one corpus FONSI occupies pages 31–34 of a 155-page file, so sufficiency lives at a page range (§5).",
      "14 artifacts are image-only, one legitimately so because it is a map; 2 are truncated at source and will not open.",
      "The 253 born-digital verdicts rest on marker absence and only 2 documents fired a marker at all, so a scanned document whose producer string is not in the conservative list reads as born-digital. minCharsOnAPage is exposed as a field so the suspicion is investigable.",
      "Extracted text can be wrong while announcing nothing: on the 1990 Umatilla ROD the cover reads 'Forest Service' in the page image and 'Forest %Nice' in the text layer, on all three extractors."
    ]
  },
  useRegulation: {
    serves: "the pinned 7 CFR part 1b, browsable by section, with per-section amendment dates",
    requires: [
      "§6.6 the regulation",
      "§2 currency"
    ],
    status: "answerable",
    objectTypes: [],
    properties: [],
    acts: [],
    datasets: [
      {
        name: "corpus.text",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "check.regulationPin",
        status: "confirmed",
        note: "Named in §1s platform-side register list, which is regenerated by a build rather than maintained by hand."
      },
      {
        name: "check.regulationDrift",
        status: "confirmed",
        note: "One row: an independently retrieved part 1b at eCFR issue date 2026-08-25, byte-identical to the 2026-08-11 pin, noDriftDetected = true. A dataset column, which is why it is here and not among the properties (§1)."
      }
    ],
    links: [],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: "section number — 1b.1 through 1b.12",
      resolver: null,
      note: "The regulation is a group inside /reference selected by component state, so no section is addressable and every citation this application produces — 1b.3(g)(2)(vi), 1b.6(b)(5), 1b.8(b)(8) and the rest — points at a section the page cannot be opened at. The section number is the identity and there is nothing behind it to resolve to: no object type carries the regulation, so there is no primary key, and the number is the key. Four citations in the current text resolve to nothing at all and are shown as found; a resolver that quietly repairs them hides a finding (§2, §4)."
    },
    query: {
      pageSize: null,
      sortKey: "section number",
      sortDirection: "asc",
      filter: "none. All twelve sections are shown, and the fixture's own note is that a section is expanded rather than fetched — the page is the part, not a window onto it.",
      search: "none",
      counts: "length",
      note: "The order is the rule's own and is not a sort the reader may change: 1b.9 precedes 1b.10 because the regulation says so and not because a string comparison agrees. The one figure on the page — '4 found' over the citations that do not resolve — really is a length rather than an aggregation, because those four are the complete enumerated set from §2 and not a sample of a larger population; every other number is a pinned value, eCFR title-7 subtitle A part 1b at issue date 2026-08-11, 222,131 bytes, sha256 a8097af3…fea6db20. The section bodies come from the pinned XML, one of signatureReady.corpus.text's 17 rows, and the per-section amendment dates from the version history §2 tabulates — 1b.9 at 2026-07-02, 1b.12 alone still at 2025-07-03, everything else 2026-04-03. Search is not built, and this is the one place it could honestly be: unlike the corpus, the text is actually present in a dataset. Note before wiring one that §4 leaves reg/version.json's latest_amended_on at 2026-08-17 unreconciled against the part-level 2026-07-02, and that the two have never been reconciled in writing."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "none",
      mustBeOn: [],
      note: "Nothing is reserved: the regulation is read by everyone and written by no one, and it is the only surface in the set where that is the end of the matter rather than a gap. The nearest thing to an arbiter is currency, and it is not held on the platform either — the pin and its independent drift witness both reach eCFR issue date 2026-08-25 while the stated currency line is 2026-09-01, so seven days are unverified and the page says so rather than rounding it off (§2, §4)."
    },
    freshness: {
      afterWrite: "tolerant",
      invalidatedBy: [],
      note: "No act touches the regulation — none of §1's 17 writes it, which is why this is the one binding in the set whose needed list is empty. What changes under it is a retrieval and not a write: §1 calls the drift check the one thing in this build that would ever want to run on a schedule, and when noDriftDetected flips the page is wrong until the pin is replaced. The currency line is therefore this surface's freshness indicator, and it belongs beside the pin rather than on a screen of its own."
    },
    needed: [],
    notes: [
      "The pin is eCFR title-7 part 1b at issue date 2026-08-11, 222,131 bytes; the independent drift witness at 2026-08-25 is byte-identical. The stated currency line is 2026-09-01, so seven days are unverified (§2).",
      "1b.12 Severability alone still carries interim-rule text from 2025-07-03; 1b.9 was amended 2026-07-02; everything else 2026-04-03.",
      "Four places in the current text cite a paragraph that does not exist. They are shown as found. A resolver that quietly repairs them hides a finding (§4)."
    ]
  },
  useCatalogue: {
    serves: "the categorical-exclusion catalogue, and the 1b.4(c) / 1b.4(d) split",
    requires: [
      "§6.6 the CE catalogue",
      "§6.7",
      "§3 the categorical-exclusion machinery"
    ],
    status: "backlog",
    objectTypes: [
      {
        name: "category",
        status: "confirmed",
        note: "§3: exists WITH citation and descriptionVerbatim, added 2026-08-28, and holds zero rows. §1 records it as vacuous at the target end of project_screened_against_category — the link type is correct and its target is empty, which are different failures and must not be reported as one."
      },
      {
        name: "project",
        status: "proposed",
        note: "Declared because the link project_screened_against_category starts here."
      }
    ],
    properties: [
      {
        name: "citation",
        objectType: "category",
        status: "confirmed",
        note: "§3 names it on the type. It also is the split: an entry under 1b.4(c) requires no NEPA documentation and one under 1b.4(d) requires documentation completed as set forth at 1b.3(g), and nothing else on the type tells them apart."
      },
      {
        name: "descriptionVerbatim",
        objectType: "category",
        status: "confirmed",
        note: "§3 names it on the type. Verbatim is load-bearing rather than stylistic: 1b.3(g)(2)(ii) requires the FANEC to state the category, so this text is quoted into a signed document and must not be normalised — not for display, not for search, not for matching."
      },
      {
        name: "documentationRequired",
        objectType: "category",
        status: "proposed",
        note: "no property carries the 1b.4(c) / 1b.4(d) split; the fixture's CatalogueRow.documentationRequired is a UI field. §7.4 records that the P1 / P2 fork is decided by catalogue data and not by the officer, so this is derived from the citation's limb and must be derived in exactly one place — added upstream in the same projection that lands the 87 rows, or computed in the adapter and nowhere else. Two places is two answers to whether a FANEC exists."
      }
    ],
    acts: [],
    datasets: [],
    links: [
      {
        name: "project_screened_against_category",
        status: "confirmed",
        from: "project",
        to: "category",
        why: "§1 names it as one of the two many-to-many link types and records both ends as holding zero rows. The catalogue page itself is a plain list, but the screening result — which categories this project was screened against, which 1b.2(f)(2)(i) requires and 1b.3(g)(2)(ii) makes a FANEC state — is reached by this link and never by filtering category on a project field, because there is no such field: the edge is the shape the ontology has, and inventing a filter invents a different one. It is vacuous at the target end today, so the traversal returns absent and that is the correct answer until category is populated."
      }
    ],
    identity: {
      routeParam: null,
      primaryKey: null,
      isPrimaryKey: false,
      displayNumber: "citation — 1b.4(c)(n) and 1b.4(d)(n)",
      resolver: "⟨category · filter citation eq ⟨1b.4(d)(n)⟩⟩ — proposed, and not one-to-one: §2 records 1b.4(d)(24) as a chapeau expanding into three lettered categories, USDA-24-1d-RD, -24-2d-RD and -24-3d-RD, so that citation resolves to three rows",
      note: "The catalogue is a group inside /reference selected by component state, so no category is linkable. The citation is the human-readable address — it is what a FANEC states under 1b.3(g)(2)(ii) and what a screening result records — but it is not a key: (d)(24) covers three lettered categories, and the numbering carries deliberate gaps, (27) [Reserved] in 1b.4(c) and (25) [Reserved] in 1b.4(d), which is how 40 entries make 39 live and 47 make 48. §2 names the three lettered codes and no section names the property that holds them, so the primary key is the FDE's to settle in the same projection that lands the rows."
    },
    query: {
      pageSize: null,
      sortKey: "citation",
      sortDirection: "asc",
      filter: "the 1b.4 limb — (c) requires no NEPA documentation, (d) requires it completed as set forth at 1b.3(g). That is the only facet the register supports: category carries two properties and neither of them is anything else to cut by.",
      search: "none",
      counts: "aggregation",
      note: "Not paged, and that is a decision rather than an omission: 87 rows, and the whole of it is the point, because §2 re-derives 87 from the pinned text independently of ce_categories.json — so the file and the rule agree, and a page that shows fewer breaks the one check this surface can run on itself. The count line, 87 categories with 39 at 1b.4(c) and 48 at 1b.4(d), must be counted over the table and never read off what was rendered. Sorting the citation as a string misorders it — 1b.4(c)(10) sorts before 1b.4(c)(2) — so the key is the numeric entry within its limb, and the [Reserved] gaps stay visible rather than being closed up. Search is not built; if it is added it runs over the 87 loaded rows and searches descriptionVerbatim, which is regulation text and must be matched as it stands."
    },
    authority: {
      heldBy: "none",
      heldByName: null,
      mustBe: "none",
      mustBeOn: [],
      note: "The catalogue reserves nothing — it is reference data, and no act among §1's 17 creates or edits a category. It is load-bearing all the same: the 1b.4 limb decides P1 from P2 and so decides whether a FANEC exists at all, which is why the split is read from the data and is never editable on this page. The determination the data feeds — that one or more categorical exclusions apply — is reserved to the responsible official at 1b.11(a)(46) and is gated on the project page, not here."
    },
    freshness: {
      afterWrite: "tolerant",
      invalidatedBy: [],
      note: "Nothing an officer does changes the catalogue. The rows land by a projection from ce_categories.json — 87 rows already in the repository, no egress and no retrieval, which §3 names the single cheapest high-value population in the build with five obligations blocked behind it — and that is a deploy rather than a write, so the page must not offer a refresh that implies an officer can cause it. Until it runs the section renders empty and says why (§6.6), and project_screened_against_category stays vacuous at the target end."
    },
    needed: [
      "category populated from ce_categories.json — 87 rows already in the repository, no egress and no retrieval. §3 names it the single cheapest high-value population in the build, with five obligations blocked behind it"
    ],
    notes: [
      "39 categories at 1b.4(c) require no documentation; 48 at 1b.4(d) require a FANEC. §2 re-derives 87 from the pinned text, so the file and the rule agree.",
      "project_screened_against_category is the correct link type and is vacuous at the target end: both it and category hold zero rows.",
      "Until the rows land the section renders empty and says why (§6.6)."
    ]
  }
};
