/** §7 as data. Steps, tabs and rows come from 7 CFR part 1b and are therefore
 *  known — every `ref` below is a citation the register's §2 re-derived from
 *  the pinned text. Project values are not known and never appear here; they
 *  arrive through `port.ts` as register markers.
 *
 *  Read this file as the surface spec: a screen that wants a row asks for it
 *  here rather than writing markup, so adding a tab is an edit to a list and
 *  not a new component. §7.9's discretions are carried as `discretionary`
 *  precisely so nothing downstream can harden a permission into a gate.
 */

/** §7.2. P0 terminates at the threshold determination; P1 is terminal at
 *  implementation clearance; the rest end in a document. */
export type PathwayId = "P0" | "P1" | "P2" | "P3" | "P4";

export type DocumentType = "FANEC" | "EA" | "FONSI" | "EIS" | "ROD";

/** Who the regulation reserves a surface to. The interface presents the gate
 *  and cannot verify a credential: the surface withholds the act and offers
 *  the routing instead, and the platform refuses the write. */
export interface GateSpec {
  reservedTo: "responsible official" | "Senior Agency Official";
  citation: string;
  /** What a user without the credential does instead. Never a dead end. */
  routeLabel: string;
}

/* --------------------------------------------------------------------------
 * The Levels framework.
 *
 * The capstone scale this build is assessed against, and a different thing
 * entirely from a LEVEL OF NEPA REVIEW at 1b.2(f)(2). The two words collide and
 * the collision is the design: this application is a LEVEL 2 instrument whose
 * job is to drive a non-specialist to the correct LEVEL OF REVIEW.
 *
 * Lower levels enable higher ones and a level is never forced. Declared per tab
 * so the audit can show the Level 0 and 1 foundations were not neglected, and
 * so any surface can say which level it carries and why.
 * ------------------------------------------------------------------------ */

export type Level = 0 | 1 | 2 | 3 | 4;

export const LEVELS: Record<Level, { name: string; question: string }> = {
  0: {
    name: "Data processing",
    question: "Is raw or unstructured material turned into something usable?"
  },
  1: {
    name: "Search and visualisation",
    question: "Is information made findable, or a pattern made visible?"
  },
  2: {
    name: "Decision guidance",
    question: "Is a recommendation surfaced that helps someone decide or act?"
  },
  3: {
    name: "Feedback loops",
    question: "Is knowledge captured, or something learned from an outcome?"
  },
  4: { name: "Automation", question: "Is a workflow automated, with human oversight?" }
};

export const LEVEL_IDS: Level[] = [0, 1, 2, 3, 4];

/** What the rule does with this row, in the rule's own force.
 *
 *  One flag cannot carry this. `discretionary` was doing three jobs at once and
 *  the submit gate dropped every flagged row, so a mandatory element and a bare
 *  permission were the same value. The dangerous direction is reading a duty as
 *  a permission, so `derived` is a member of its own: a consequence the rule
 *  compels without stating in one paragraph is not a choice. */
export type Modality =
  /** The rule requires the thing itself. Holds the submit bar. */
  | "duty"
  /** The rule requires that it be CONSIDERED; the outcome stays a judgement.
   *  1b.9(r)(2) is the only one in part 1b. Holds the submit bar. */
  | "duty-to-consider"
  /** No single paragraph states it; a chain of them compels it. Rendered with
   *  every citation in the chain and the word on the surface. Holds the bar. */
  | "derived"
  /** §7.9: a permission in the rule. NEVER holds the bar, never a gate. */
  | "permission"
  /** A concurrence or referral the rule requires of someone else. This
   *  application records and sends it; it never blocks on it, because a client
   *  cannot verify a credential. */
  | "outbound-request";

/** Where the row's words come from. `placeholder` means the rule's text for
 *  this item is not in this repository — the label is its own citation ordinal
 *  and no non-specialist can answer it. Counted, never hidden. */
export type TextState = "verbatim" | "restated" | "placeholder";

/** Where a row's members come from. `open` is structurally distinct because
 *  1b.3(f)(1)'s resources "may include, but are not limited to" the eight
 *  classes — a closed enum there is a false constraint that would have to be
 *  found again. `unstated` says the members are not in this repository, which
 *  is a countable gap rather than a silent one. */
export type Options =
  | { kind: "closed"; members: string[] }
  | { kind: "open"; seed: string[]; why: string }
  | { kind: "catalogue"; source: string }
  | { kind: "register"; source: string }
  | { kind: "unstated"; why: string };

export type RowForm = "quote" | "value" | "draft" | "select" | "choice" | "sourcesOnly";

interface RowBase {
  ref: string;
  label: string;
  help?: string;
  /** Overrides the tab's level where this row carries a different one. */
  level?: Level;
  /** What the rule does with it. Required: an omission is a type error. */
  modality: Modality;
  /** Where the words come from. Required, for the same reason. */
  text: TextState;
  gate?: GateSpec;
  /** The `rid` of the canonical asking, where this row echoes one asked
   *  elsewhere. A person asked the same question twice assumes they got it
   *  wrong the first time. */
  restates?: string;
  /** Set where ONE row stands in for several enumerated items in the rule.
   *  The file expands enumerations at three different granularities and had no
   *  rule saying which; this makes each collapse a declared, countable choice
   *  rather than a silent one. Expanding an enumeration nobody can name would
   *  only produce more rows whose label is their own ordinal. */
  expands?: { count: number; ref: string; why: string };
  /** The ref of the element this row QUALIFIES. A sub-paragraph saying HOW an
   *  element may be satisfied is not itself an element, so it must have a
   *  surface — a permission with no row cannot be exercised or recorded — and
   *  must not move the frozen totals: FANEC 6 / EA 7 / FONSI 5 / EIS 8 /
   *  ROD 8 = 34. */
  subOf?: string;
}

/** A row that offers members must say where they come from. The union makes
 *  that a compile error rather than a review habit. */
export type RowSpec =
  | (RowBase & { form: "select" | "choice"; options: Options })
  | (RowBase & { form: "quote" | "value" | "draft" | "sourcesOnly"; options?: undefined });

/** §7.9's permissions are exactly the rows whose modality is `permission`.
 *  Derived, so the two can never disagree. */
/** The rows of a document tab that are ELEMENTS. A sub-paragraph
 *  qualification is a row and is not an element. */
export function elementRows(tab: TabSpec): RowSpec[] {
  return tab.rows.filter((row) => !row.subOf);
}

export function isPermission(row: RowSpec): boolean {
  return row.modality === "permission";
}

/** A row the submit bar may wait on. An outbound request is excluded: the
 *  client cannot verify a concurrence and must not hold work on one. */
export function isBinding(row: RowSpec): boolean {
  return row.modality !== "permission" && row.modality !== "outbound-request";
}

export interface TabSpec {
  id: string;
  name: string;
  /** Set where the tab assembles a document, so element counts are checkable. */
  documentType?: DocumentType;
  /** Which Level this tab carries. Required. */
  level: Level;
  /** Answered once for the proposal, or once per level of review. The rule
   *  makes the split: 1b.2(e) is about the proposal, 1b.2(f)(2) about the
   *  review. It is what answers "do I have to do intake again" structurally. */
  scope: "proposal" | "review";
  rows: RowSpec[];
}

export interface StepSpec {
  id: string;
  n: number;
  name: string;
  tabs: TabSpec[];
  /** P0 after Step 1, P1 after Step 4: no further step exists. */
  terminal?: boolean;
}

export interface PathwaySpec {
  id: PathwayId;
  name: string;
  reachedWhen: string;
  terminalOutput: string;
  /** Steps 3 and beyond. Steps 0–2 are shared and live in SHARED_STEPS. */
  steps: StepSpec[];
}

const SIGN_FANEC: GateSpec = {
  reservedTo: "responsible official",
  citation: "1b.3(g)(2)(vi)",
  routeLabel: "Route for signature"
};
const SIGN_FONSI: GateSpec = {
  reservedTo: "responsible official",
  citation: "1b.6(b)(5)",
  routeLabel: "Route for signature"
};
const SIGN_ROD: GateSpec = {
  reservedTo: "responsible official",
  citation: "1b.8(b)(8)",
  routeLabel: "Route for signature"
};

/* --------------------------------------------------------------------------
 * §7.3 — shared steps. Every project has these three, on every pathway.
 * ------------------------------------------------------------------------ */

export const SHARED_STEPS: StepSpec[] = [
  {
    id: "0",
    n: 0,
    name: "Intake",
    tabs: [
      {
        id: "proposed-action",
        name: "Proposed action",
    level: 0,
    scope: "proposal",
        rows: [
          { ref: "1b.9(a)", label: "Description of the proposed action", form: "draft", modality: "duty", text: "restated" },
          {
            ref: "1b.4(d)(24)",
            label: "Components and connected actions",
            help: "All components and connected actions, so the action is described as a whole.",
            form: "draft", modality: "duty", text: "restated"
          },
          { ref: "1b.9(a)", label: "Anticipated implementation start", form: "value", modality: "duty", text: "restated" }
        ]
      },
      {
        id: "location",
        name: "Location and jurisdiction",
    level: 1,
    scope: "proposal",
        rows: [
          { ref: "1b.2(f)", label: "Geographic extent and acreage", form: "value", modality: "duty", text: "restated" },
          { ref: "1b.9(a)", label: "Administrative unit", form: "select", modality: "duty", text: "restated", options: { kind: "unstated", why: "The members are not stated in this repository." } },
          {
            ref: "1b.9(a)",
            label: "Applicable land management plan",
            help: "Selected from the forest plan register once the administrative unit is known.",
            form: "select", modality: "duty", text: "restated", options: { kind: "unstated", why: "The members are not stated in this repository." }
          },
          {
            ref: "1b.4(d)(24)",
            label: "Detailed site plans and location maps",
            help:
              "Where 1b.4(d)(24) applies: the specific location on detailed site plans and maps equivalent to a USGS quadrangle, accurate, complete and capable of verification.",
            form: "sourcesOnly", modality: "duty", text: "restated"
          }
        ]
      },
      {
        id: "authority",
        name: "Authority",
    level: 0,
    scope: "proposal",
        rows: [
          { ref: "1b.2(e)(1)", label: "Federal nexus", form: "draft", modality: "duty", text: "restated" },
          { ref: "1b.2(e)(2)", label: "Statutory or regulatory authority for the action", form: "quote", modality: "duty", text: "restated" },
          {
            ref: "1b.2(e)(4)",
            label: "Whether decisional criteria leave residual discretion",
            help:
              "Congress may have prescribed decisional criteria with sufficient completeness and precision that no residual discretion remains to alter the action on environmental grounds.",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          },
          {
            ref: "1b.2(e)(6)",
            label: "Whether another statute's requirements serve the compliance function",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          }
        ]
      },
      {
        id: "timing",
        name: "Timing",
    level: 0,
    scope: "proposal",
        rows: [
          {
            ref: "1b.5(e) · 1b.7(k)",
            label: "Deadline trigger event and its date",
            help: "Where a deadline applies. The soonest of the three triggers fixes the date.",
            form: "select", modality: "duty", text: "restated", options: { kind: "unstated", why: "The members are not stated in this repository." }
          },
          { ref: "1b.9(u)", label: "Unique identification number and issuer", form: "value", modality: "duty", text: "restated" }
        ]
      },
      {
        id: "participants",
        name: "Participants",
    level: 0,
    scope: "proposal",
        rows: [
          {
            ref: "1b.4(a)",
            label: "USDA subcomponent",
            help:
              "Decides whether 1b.4(a)'s third limb applies at Step 2 — whether this subcomponent's actions are excluded from preparing an EA or EIS outright. Nothing in the ontology carries a subcomponent identity.",
            form: "select",
            modality: "duty",
            text: "restated",
            options: {
              kind: "unstated",
              why:
                "1b.4(a) names a closed set, and the set cannot be derived from anything in this repository: the source sentence enumerates eight services plus a block of general offices while calling the total nine. Building a nine-member picker that silently folds the offices is the near-miss that ships and is never found again."
            }
          },
          { ref: "1b.11(a)(46)", label: "Responsible official", form: "value", modality: "duty", text: "restated" },
          {
            ref: "1b.10(a)(5)",
            label: "Whether an applicant or third party is involved",
            help:
              "With the disclosure statement of financial or other interest in the outcome, where one is.",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          },
          { ref: "1b.9(m)", label: "Lead, joint and cooperating agencies", form: "value", modality: "duty", text: "restated" }
        ]
      }
    ]
  },
  {
    id: "1",
    n: 1,
    name: "Threshold determination",
    tabs: [
      {
        id: "does-nepa-apply",
        name: "Does NEPA apply",
    level: 2,
    scope: "proposal",
        rows: [
          {
            ref: "1b.2(e)(1)",
            label: "Not a major Federal action",
            help:
              "'Major' and 'Federal action' each have independent force and NEPA applies only when both are met. Reserved to the judgment of the subcomponent in each instance.",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          },
          { ref: "1b.2(e)(2)", label: "Exempted from NEPA by law", form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] } },
          {
            ref: "1b.2(e)(3)",
            label: "No final Federal agency action",
            help: "Under the Administrative Procedure Act, 5 U.S.C. 704, or another statute with a finality requirement.",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          },
          { ref: "1b.2(e)(4)", label: "Nondiscretionary — no residual discretion remains", form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] } },
          {
            ref: "1b.2(e)(5)",
            label: "Compliance would clearly and fundamentally conflict with another provision of law",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          },
          {
            ref: "1b.2(e)(6)",
            label: "Another statute's requirements serve the compliance function",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          },
          { ref: "1b.2(e)", label: "Which ground answered", form: "select", modality: "duty", text: "restated", options: { kind: "unstated", why: "The members are not stated in this repository." } },
          {
            ref: "1b.2(e)",
            label: "Justification record",
            help:
              "Record keeping of the justification is advisable, not required. Nothing here may force one.",
            form: "draft", modality: "permission", text: "restated",
          }
        ]
      }
    ]
  },
  {
    id: "2",
    n: 2,
    name: "Level of review",
    tabs: [
      {
        id: "subcomponent-exclusion",
        name: "Subcomponent exclusion",
    level: 2,
    scope: "review",
        rows: [
          {
            ref: "1b.4(a)",
            label: "Whether the subcomponent is one of the nine listed",
            help:
              "Their actions are excluded from the preparation of an EA or EIS outright, unless an extraordinary circumstance exists for the individual action.",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          },
          {
            ref: "1b.4(a)",
            label: "Whether an extraordinary circumstance exists for this action",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          },
          {
            ref: "1b.4(a)",
            label: "Senior Agency Official concurrence",
            help:
              "Where the subcomponent is one of the nine and an extraordinary circumstance exists for the individual action, an EA or EIS becomes available only on the concurrence of the USDA Senior Agency Official or their designee. The rule makes it a precondition; this application cannot verify a credential, so the row records the request and sends it and never holds work on it.",
            form: "value", modality: "outbound-request", text: "restated"
          }
        ]
      },
      {
        // Named for what it divides, not for its step: a tab that repeats its
        // own step's name reads as a clone of it rather than a part of it.
        id: "level-of-review",
        name: "Sequence and significance",
    level: 2,
    scope: "review",
        rows: [
          {
            ref: "1b.2(f)(2)(i)",
            label: "An established or adopted categorical exclusion covers the action",
            help: "Limbs evaluate in order and the first applicable wins.",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          },
          {
            ref: "1b.2(f)(2)(ii)",
            label: "Another agency's categorical exclusion is adopted under 1b.3(c)",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          },
          {
            ref: "1b.2(f)(2)(iii)",
            label: "Establishing or revising a categorical exclusion",
            help: "Rulemaking, and out of scope here. Recorded as considered and not pursued.",
            form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
          },
          {
            ref: "1b.2(f)(2)(iv)",
            label: "Reasonably foreseeable significant impacts",
            help:
              "Reachable only on the failure of (i)–(iii), and this is where the pathway is fixed. Note (iv)(A) carefully: UNKNOWN significance develops an environmental assessment. Uncertainty is an EA trigger, not an escalation.",
            form: "choice",
            modality: "duty",
            text: "restated",
            options: {
              kind: "closed",
              members: [
                "(iv)(A) not likely significant — environmental assessment",
                "(iv)(A) significance unknown — environmental assessment",
                "(iv)(B) likely significant — environmental impact statement"
              ]
            }
          },
          {
            ref: "1b.2(f)(3)(ii)",
            label: "Degree of effects — the five considerations",
            help:
              "Short- and long-term effects; beneficial and adverse effects; effects on public health and safety; economic effects; effects on the quality of life. Subcomponents SHOULD consider these, as appropriate — the two rationale items below are SHALL.",
            form: "draft",
            modality: "permission",
            text: "verbatim",
            expands: {
              count: 5,
              ref: "1b.2(f)(3)(ii)",
              why: "The five are named in full in the help, so this is a collapse of cardinality and not of content."
            },
          },
          {
            ref: "1b.2(f)(3)(iii)(A)",
            label: "How unavoidable impacts of implementing compare to not implementing",
            help: "Responsible officials shall consider this in providing rationale.",
            form: "draft", modality: "duty", text: "restated"
          },
          {
            ref: "1b.2(f)(3)(iii)(B)",
            label:
              "How irreversible and irretrievable commitment of a Federal resource contributes to loss of long-term productivity",
            form: "draft", modality: "duty", text: "restated"
          },
          {
            /* The conclusion the whole sequence is for, and it had no row on
               any pathway. Its twin — whether an ISSUE is substantive — is
               built on P4 Step 6; this half, whether an EFFECT is significant,
               was the one hidden by a formatting slip in the source list. */
            ref: "1b.7(a)",
            label: "Whether the action rises to the level of significant",
            help:
              "Whether an action rises to the level of significant is a matter of the responsible official's expert judgment, as informed by interdisciplinary analysis. This application guides the judgement and never makes it. Unknown significance routes to an environmental assessment — 1b.2(f)(2)(iv)(A) — not to an environmental impact statement: uncertainty is an EA trigger, not an escalation.",
            form: "choice",
            modality: "duty",
            text: "verbatim",
            options: {
              kind: "closed",
              members: [
                "Not likely to have reasonably foreseeable significant impacts — 1b.2(f)(2)(iv)(A)",
                "The significance of the impacts is unknown — 1b.2(f)(2)(iv)(A)",
                "Likely to have reasonably foreseeable significant impacts — 1b.2(f)(2)(iv)(B)"
              ]
            }
          }
        ]
      }
    ]
  }
];

/* --------------------------------------------------------------------------
 * §7.4–§7.6 — pathway steps. Steps 3 and beyond do not exist until Step 2
 * fixes the pathway, and before then the left pane names none of them.
 * ------------------------------------------------------------------------ */

const CE_SCREEN_STEP: StepSpec = {
  id: "3",
  n: 3,
  name: "Category and extraordinary circumstances",
  tabs: [
    {
      id: "category",
      name: "Category",
    level: 1,
    scope: "review",
      rows: [
        {
          ref: "1b.4",
          label: "Category or categories applied",
          help: "With citation and the verbatim description from the catalogue.",
          form: "select", modality: "duty", text: "restated", options: { kind: "unstated", why: "The members are not stated in this repository." }
        },
        {
          ref: "1b.3(g)(2)(ii)",
          label: "Whether adopted from a non-USDA agency",
          help: "A FANEC must specify that the category was adopted.",
          form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
        },
        {
          ref: "1b.3(h)",
          label: "Reliance on a prior determination",
          help:
            "With the explanation of substantial sameness — of the activities, and of the affected environment where no extraordinary circumstance is also relied on.",
          form: "draft", modality: "duty", text: "restated"
        },
{
          ref: "1b.3(g)(1)",
          label: "Whether a FANEC is required at all",
          help:
            "Documentation is required only where all three hold: (i) the action is categorically excluded, (ii) no extraordinary circumstance exists, and (iii) the category requires documentation. 39 of the 87 categories require none, so this test decides whether the document exists.",
          form: "choice",
          modality: "duty",
          text: "restated",
          options: {
            kind: "closed",
            members: [
              "All three hold — documentation required",
              "(i) fails — no categorical exclusion applies",
              "(ii) fails — an extraordinary circumstance exists",
              "(iii) fails — the category is at 1b.4(c) and requires no documentation"
            ]
          }
        },
        {
          ref: "1b.4(d)(24)",
          label: "Applicant documentation",
          help:
            "Where (d)(24) applies: components and connected actions, location on detailed site plans and USGS-equivalent maps, and authoritative confirmation of the presence or absence of sensitive resources.",
          form: "sourcesOnly", modality: "duty", text: "restated"
        }
      ]
    },
    {
      id: "extraordinary-circumstances",
      name: "Extraordinary circumstances",
    level: 2,
    scope: "review",
      rows: [
        {
          ref: "1b.3(f)",
          label: "Resources selected for consideration",
          help:
            "1b.3(e) makes the evaluation mandatory: where a categorical exclusion applies, the subcomponent WILL evaluate the action for extraordinary circumstances. Which resources are considered is at the responsible official's sole discretion, as informed by interdisciplinary review — so the duty is to answer, and the content is free.",
          form: "select",
          modality: "duty",
          text: "verbatim",
          options: {
            kind: "open",
            seed: [
              "Federally listed species and designated critical habitat",
              "Flood plains and wetlands",
              "Special sources of water",
              "Formally designated areas",
              "Specially managed areas",
              "Prime, unique or important farmland",
              "Property of historic, archeological or architectural significance",
              "American Indian and Alaska Native religious or cultural sites"
            ],
            why:
              "1b.3(f)(1) prefaces its eight classes with 'may include, but are not limited to', and the set is determined at the responsible official's sole discretion. A closed enum here would be a false constraint someone would have to find again."
          },
        },
        {
          ref: "1b.3(f)(1)",
          label: "Per-resource finding",
          help:
            "Closed at three, not two. A two-member yes/no would make 1b.3(f)(2)'s stopping rule invisible — the mere presence of a listed resource does not mean an extraordinary circumstance exists.",
          form: "choice",
          modality: "duty",
          text: "restated",
          options: { kind: "closed", members: ["Clear", "Present", "Undetermined"] }
        },
        {
          ref: "1b.3(f)(2)",
          label: "Whether reasonable uncertainty or certainty of significance exists",
          help:
            "Mere presence of a listed resource does not mean an extraordinary circumstance exists. One exists only where there is reasonable uncertainty whether the degree of effect is significant, or certainty that it is. THE TWO MEMBERS ARE THE ROUTE: an uncured extraordinary circumstance means the exclusion cannot be applied consistent with 1b.2(f)(2)(i), so (f)(2)(iv) engages by its own condition, and (iv)(A) sends unknown significance to an environmental assessment while (iv)(B) sends likely significance to an environmental impact statement. This value carries the route, never the three-member per-resource finding above — 'present' there is ambiguous between the two.",
          form: "choice",
          modality: "duty",
          text: "verbatim",
          options: {
            kind: "closed",
            members: [
              "Reasonable uncertainty whether the degree of effect is significant",
              "Certainty that the degree of effect is significant",
              "Neither — no extraordinary circumstance exists"
            ]
          }
        },
        {
          ref: "1b.3(f)(3)",
          label: "Modification of the action to cure",
          help:
            "An extraordinary circumstance is not terminal. Where the action is modified so that certainty is created that the effect is not significant, the circumstance no longer exists and the exclusion may proceed.",
          form: "draft", modality: "permission", text: "restated",
        },
        { ref: "1b.3(f)(4)", label: "Reliance on other-law effects analysis", form: "draft", modality: "permission", text: "restated",},
        { ref: "1b.3(g)(2)(v)", label: "Interdisciplinary review record", form: "value", modality: "duty", text: "restated" }
      ]
    }
  ]
};

export const PATHWAYS: Record<PathwayId, PathwaySpec> = {
  /* P0 is the negative branch of the 1b.2(e) gate rather than a peer of the
     other four — 1b.2(f)(2) is reached only "if a USDA subcomponent determines
     under § 1b.2(e) that NEPA applies". It still needs somewhere to END. With
     no step at all a project that closes at the threshold could never be marked
     finished and could never be archived from its own page, and 1b.2(e) leaves
     something real to record: record keeping of the justification is ADVISABLE,
     so both rows here are permissions and neither holds the bar. */
  P0: {
    id: "P0",
    name: "NEPA does not apply",
    reachedWhen: "1b.2(e) — NEPA does not apply",
    terminalOutput: "None; record keeping advisable only",
    steps: [
      {
        id: "3",
        n: 3,
        name: "Close the review",
        terminal: true,
        tabs: [
          {
            id: "close",
            name: "Close",
            level: 2,
            scope: "proposal",
            rows: [
              {
                ref: "1b.2(e)",
                label: "Which ground answered",
                help: "The limb of 1b.2(e)(1)–(6) the threshold determination rested on.",
                form: "choice",
                modality: "permission",
                text: "restated",
                restates: "S.1/does-nepa-apply/1b.2(e)#2",
                options: {
                  kind: "closed",
                  members: [
                    "(1) not a major Federal action",
                    "(2) exempted from NEPA by law",
                    "(3) no final Federal agency action",
                    "(4) nondiscretionary",
                    "(5) clear and fundamental conflict with another law",
                    "(6) another statute's requirements serve the compliance function"
                  ]
                }
              },
              {
                ref: "1b.2(e)",
                label: "Whether the justification is recorded",
                help:
                  "Record keeping of the justification for a threshold determination is advisable, not required. Nothing here may force one.",
                form: "choice",
                modality: "permission",
                text: "verbatim",
                options: { kind: "closed", members: ["Recorded", "Not recorded"] }
              },
              {
                ref: "1b.9(a)",
                label: "Disposition of the closed review",
                help: "Where the record of this determination is kept. No document, no publication, no signature.",
                form: "value",
                modality: "permission",
                text: "restated"
              }
            ]
          }
        ]
      }
    ]
  },

  P1: {
    id: "P1",
    name: "Categorical exclusion, no documentation",
    reachedWhen: "A categorical exclusion applies and the category sits at 1b.4(c)",
    terminalOutput: "None; implementation clearance under 1b.3(j)",
    steps: [
      CE_SCREEN_STEP,
      {
        id: "4",
        n: 4,
        name: "Disposition",
        terminal: true,
        tabs: [
          {
            id: "implementation-clearance",
            name: "Implementation clearance",
    level: 2,
    scope: "review",
            rows: [
              { ref: "1b.3(j)", label: "A categorical exclusion applies", form: "value", modality: "duty", text: "restated" },
              { ref: "1b.3(j)", label: "No extraordinary circumstance exists", form: "value", modality: "duty", text: "restated" },
              {
                ref: "1b.3(j)",
                label: "Other necessary environmental review documentation completed",
                form: "value", modality: "duty", text: "restated"
              },
              {
                ref: "1b.3(j)",
                label: "No other statute or regulation requires otherwise",
                form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
              }
            ]
          }
        ]
      }
    ]
  },

  P2: {
    id: "P2",
    name: "Categorical exclusion requiring documentation",
    reachedWhen: "A categorical exclusion applies and the category sits at 1b.4(d)",
    terminalOutput: "FANEC",
    steps: [
      CE_SCREEN_STEP,
      {
        id: "4",
        n: 4,
        name: "Disposition",
        tabs: [
          {
            id: "fanec",
            name: "FANEC",
    level: 2,
    scope: "review",
            documentType: "FANEC",
            rows: [
              {
                ref: "1b.3(g)(2)(i)",
                label: "Incorporate by reference other relevant documentation in the proposal record",
                form: "sourcesOnly", modality: "duty", text: "restated"
              },
              {
                ref: "1b.3(g)(2)(ii)",
                label:
                  "State the category or categories and, if adopted from a non-USDA agency, specify that it was adopted",
                form: "quote", modality: "duty", text: "restated"
              },
              {
                ref: "1b.3(g)(2)(iii)",
                label: "Describe the proposed action and state how the categories apply",
                form: "draft", modality: "duty", text: "restated"
              },
              { ref: "1b.3(g)(2)(iv)", label: "State the resources considered", form: "draft", modality: "duty", text: "restated" },
              {
                ref: "1b.3(g)(2)(v)",
                label:
                  "State that no extraordinary circumstances exist, as informed by the interdisciplinary review",
                form: "draft", modality: "duty", text: "restated"
              },
              {
                ref: "1b.3(g)(2)(vi)",
                label: "Date issued and signature of the responsible official",
                help:
                  "Format is free and there is no page limit or deadline. 1b.3(i) permits items required by another statute or regulation.",
                form: "value", modality: "duty", text: "restated",
                gate: SIGN_FANEC
              }
            ]
          }
        ]
      },
      {
        id: "5",
        n: 5,
        name: "Issue",
        terminal: true,
        tabs: [
          {
            id: "issue",
            name: "Issue",
    level: 2,
    scope: "review",
            rows: [
              {
                ref: "1b.3(g)(2)(vi)",
                label: "Date issued",
                form: "value",
                modality: "duty",
                text: "restated",
                restates: "E1.P2.4/fanec/1b.3(g)(2)(vi)#1"
              },
              {
                /* Echoes the FANEC's own element (vi). One regulation element
                   carries ONE gate: the act of signing lives where the document
                   is assembled, and this row shows the result. */
                ref: "1b.3(g)(2)(vi)",
                label: "Signature of the responsible official",
                help: "Asked once, on the FANEC itself. Shown here as the record of what was signed.",
                form: "value",
                modality: "duty",
                text: "restated",
                restates: "E1.P2.4/fanec/1b.3(g)(2)(vi)#1"
              },
              {
                ref: "1b.9(n)(2)",
                label: "Where more than one responsible official signs, what each is approving",
                help:
                  "Where multiple signature blocks are included, the document shall specify what each signing responsible official is approving or authorizing, given the nature of the actions proposed and that official's statutory authority.",
                form: "draft",
                modality: "duty",
                text: "verbatim"
              },
              {
                ref: "1b.9(u)",
                label: "Unique identification number",
                help: "Mandatory for an EA and an EIS; discretionary for a FANEC.",
                form: "value", modality: "permission", text: "restated",
              },
              {
                ref: "1b.3",
                label: "Disposition of the signed document",
                help: "No publication or notification duty attaches to a FANEC.",
                form: "select", modality: "duty", text: "restated", options: { kind: "unstated", why: "The members are not stated in this repository." }
              }
            ]
          }
        ]
      }
    ]
  },

  P3: {
    id: "P3",
    name: "Environmental assessment",
    reachedWhen: "1b.2(f)(2)(iv)(A) — impacts not likely significant, or of unknown significance",
    terminalOutput: "EA, then FONSI",
    steps: [
      {
        id: "3",
        n: 3,
        name: "Scope, clock and public involvement",
        tabs: [
          {
            id: "scope",
            name: "Scope of analysis",
    level: 2,
    scope: "review",
            rows: [
              { ref: "1b.5(b)(1)", label: "Scope of analysis — first duty", form: "draft", modality: "duty", text: "placeholder" },
              { ref: "1b.5(b)(2)", label: "Scope of analysis — second duty", form: "draft", modality: "duty", text: "placeholder" },
              { ref: "1b.5(b)(3)", label: "Scope of analysis — third duty", form: "draft", modality: "duty", text: "placeholder" }
            ]
          },
          {
            id: "deadline",
            name: "Deadline",
    level: 4,
    scope: "review",
            rows: [
              {
                ref: "1b.5(e)",
                label: "The three deadline triggers, and the soonest applicable",
                help:
                  "One year runs from the soonest of the three. deadlineDays, deadlineTriggerName and deadlineTriggerDate exist and are null; nothing computes soonest-of-three.",
                form: "select", modality: "duty", text: "restated", options: { kind: "unstated", why: "The members are not stated in this repository." }
              },
              { ref: "1b.5(e)", label: "Resulting deadline date", form: "value", modality: "duty", text: "restated" },
              {
                ref: "1b.5(g)",
                label: "Whether a new deadline is established",
                help: "Establishing a new deadline is permitted, not required.",
                form: "choice",
                modality: "permission",
                text: "restated",
                options: { kind: "closed", members: ["Established", "Not established"] }
              },
              {
                ref: "1b.5(g)(1)",
                label: "Whether cause exists for a new deadline",
                help:
                  "In the responsible official's judgment. A reserved judgement that had no surface anywhere in the build.",
                form: "draft",
                modality: "duty",
                text: "restated"
              },
              {
                ref: "1b.5(g)",
                label: "Extension — applicant consultation and the written record",
                help:
                  "Consultation with the applicant precedes a new deadline, and the reason it could not be met, the new date and the applicant's position all go into the proposal record. Mandatory once an extension is sought.",
                form: "draft",
                modality: "duty",
                text: "restated"
              },
              {
                ref: "1b.5(g)(2)",
                label: "Senior Agency Official coordination on the extension",
                help:
                  "Required once an extension is sought — the coordination is not itself discretionary. Recorded and sent; never a gate on this surface.",
                form: "value",
                modality: "outbound-request",
                text: "restated"
              }
            ]
          },
          {
            id: "public-involvement",
            name: "Public involvement",
    level: 2,
    scope: "review",
            rows: [
              {
                ref: "1b.5(e)(3)(ii)",
                label: "Whether a notice of intent is published",
                help: "Sole discretion. Never a requirement.",
                form: "choice", modality: "permission", text: "restated", options: { kind: "closed", members: ["Yes", "No"] },
              },
              {
                ref: "1b.5(e)(3)(iii)",
                label: "Whether comment is solicited",
                help: "Sole discretion. Never a requirement.",
                form: "choice", modality: "permission", text: "restated", options: { kind: "closed", members: ["Yes", "No"] },
              }
            ]
          }
        ]
      },
      {
        id: "4",
        n: 4,
        name: "Assembly",
        tabs: [
          {
            id: "ea",
            name: "Environmental assessment",
    level: 2,
    scope: "review",
            documentType: "EA",
            rows: [
              { ref: "1b.5(c)(1)", label: "Purpose and need", form: "draft", modality: "duty", text: "restated" },
              {
                ref: "1b.5(c)(2)",
                label: "No action, the proposed action and alternatives",
                help:
                  "The ELEMENT is mandatory — 1b.5(c) requires the seven at a minimum. What is discretionary is its content, and the two permissions below say how.",
                form: "draft",
                modality: "duty",
                text: "restated"
              },
              {
                ref: "1b.5(c)(2)(i)",
                subOf: "1b.5(c)(2)",
                label: "Whether no action is listed as a stand-alone alternative",
                help:
                  "No action MAY be listed as a stand-alone alternative but is not required — though its consequences shall be included in the environmental impacts analysis either way.",
                form: "choice",
                modality: "permission",
                text: "verbatim",
                options: { kind: "closed", members: ["Listed", "Not listed"] }
              },
              {
                ref: "1b.5(c)(2)(ii)",
                subOf: "1b.5(c)(2)",
                label: "Whether alternatives are analysed at all",
                help:
                  "Where there are no unresolved conflicts concerning alternative uses of available resources, the environmental assessment need only analyze the proposed action and may proceed without consideration of additional alternatives.",
                form: "choice",
                modality: "permission",
                text: "verbatim",
                options: {
                  kind: "closed",
                  members: [
                    "Alternatives analysed",
                    "No unresolved conflicts — proposed action only"
                  ]
                }
              },
              {
                ref: "1b.5(c)(3)",
                label: "Potentially affected environment and environmental impacts",
                form: "draft", modality: "duty", text: "restated"
              },
              { ref: "1b.5(c)(4)", label: "Agencies and persons consulted", form: "value", modality: "duty", text: "restated" },
              { ref: "1b.5(c)(5)", label: "Other environmental reviews", form: "sourcesOnly", modality: "duty", text: "restated" },
              {
                ref: "1b.5(c)(6)",
                label: "Certifying statements for the page limit and the deadline",
                help:
                  "No signature is required. Approval to publish indicates the responsible official's concurrence. Appendices do not count toward the limit and may not carry substantive analysis — 1b.5(d)(2).",
                form: "quote", modality: "duty", text: "restated"
              },
              { ref: "1b.5(c)(7)", label: "Unique identification number", form: "value", modality: "duty", text: "restated" }
            ]
          }
        ]
      },
      {
        id: "5",
        n: 5,
        name: "Publication",
        tabs: [
          {
            id: "publish",
            name: "Publish",
    level: 4,
    scope: "review",
            rows: [
              {
                ref: "1b.5(d)",
                label: "Page count against the 75-page limit",
                help: "Text only; citations and appendices are excluded. pageCount and pageLimit are null and nothing computes either.",
                form: "value", modality: "duty", text: "restated"
              },
              {
                ref: "1b.5(c)(6)",
                label: "Certifying statement — page limit",
                form: "quote",
                modality: "duty",
                text: "restated",
                restates: "E1.P3.4/ea/1b.5(c)(6)#1"
              },
              {
                ref: "1b.5(c)(6)",
                label: "Deadline certification",
                form: "quote",
                modality: "duty",
                text: "restated",
                restates: "E1.P3.4/ea/1b.5(c)(6)#1"
              },
              {
                ref: "1b.5",
                label: "Publication to a USDA website",
                help:
                  "Publication completes the environmental assessment and stops the clock. The paragraph that states the ORDINARY publication duty is not identified in this repository; this row deliberately does not borrow 1b.5(f), which is the COMPELLED publication rule, because reusing it would make a met deadline and a missed one the same record.",
                form: "value",
                modality: "duty",
                text: "placeholder"
              },
              {
                ref: "1b.5(f)",
                label: "Publication compelled by the deadline elapsing",
                help:
                  "Where the deadline elapses first, publication is compelled at the latest on the day it elapses, in as substantially complete form as is possible. Part 1b compels publication in exactly two places — here and 1b.7(l) — and nowhere else.",
                form: "choice",
                modality: "duty",
                text: "verbatim",
                options: {
                  kind: "closed",
                  members: ["Published within the deadline", "Published under compulsion — 1b.5(f)"]
                }
              }
            ]
          }
        ]
      },
      {
        id: "6",
        n: 6,
        name: "Finding",
        tabs: [
          {
            id: "fonsi",
            name: "Finding of no significant impact",
    level: 2,
    scope: "review",
            documentType: "FONSI",
            rows: [
              {
                ref: "1b.6(b)(1)",
                label: "Incorporate by reference the EA and note other related documentation",
                form: "sourcesOnly", modality: "duty", text: "restated"
              },
              {
                ref: "1b.6(b)(2)",
                label: "State the selected alternative, if others were analysed in detail",
                form: "value", modality: "duty", text: "restated"
              },
              {
                ref: "1b.6(b)(3)",
                label:
                  "Reasons for the finding, concluding that for these reasons an EIS will not be prepared",
                help:
                  "Where the finding rests on mitigation, state the statutory or regulatory authority for it and any monitoring or enforcement provisions.",
                form: "draft", modality: "duty", text: "restated"
              },
              {
                ref: "1b.6(b)(4)",
                label: "Statement regarding when implementation is anticipated to begin",
                form: "value", modality: "duty", text: "restated"
              },
              {
                ref: "1b.6(b)(5)",
                label: "Date issued and signature of the responsible official",
                help:
                  "May be combined with the EA under 1b.6(a) and does not count toward its page limit. May be retitled as a decision document where a statute or regulation requires one.",
                form: "value", modality: "duty", text: "restated",
                gate: SIGN_FONSI
              }
            ]
          }
        ]
      },
      {
        id: "7",
        n: 7,
        name: "Notification",
        terminal: true,
        tabs: [
          {
            id: "notify",
            name: "Notify",
    level: 4,
    scope: "review",
            rows: [
              {
                ref: "1b.6(e)",
                label: "Every agency and person consulted, as identified in the EA",
                form: "value", modality: "duty", text: "restated"
              },
              {
                ref: "1b.6(e)",
                label: "The manner of communication used to consult",
                help: "The channel is part of the obligation, not a detail of it — notification shall be in the manner used to consult.",
                form: "select",
                modality: "duty",
                text: "verbatim",
                options: {
                  kind: "unstated",
                  why: "The channels are per consulted party and come from the record, not from a list in the rule."
                }
              },
              {
                ref: "1b.6(d)",
                label: "Publication of the finding to the same USDA website as the EA",
                help:
                  "Unless the finding is combined into one document with the environmental assessment under 1b.6(a), in which case there is one artifact and one publication.",
                form: "choice",
                modality: "duty",
                text: "restated",
                options: {
                  kind: "closed",
                  members: ["Published separately", "Combined with the environmental assessment — 1b.6(a)"]
                }
              }
            ]
          }
        ]
      }
    ]
  },

  P4: {
    id: "P4",
    name: "Environmental impact statement",
    reachedWhen: "1b.2(f)(2)(iv)(B) — impacts likely significant",
    terminalOutput: "EIS, then ROD",
    steps: [
      {
        id: "3",
        n: 3,
        name: "Notice of intent",
        tabs: [
          {
            id: "noi",
            name: "Notice of intent",
    level: 2,
    scope: "review",
            rows: [
              { ref: "1b.7(b)(1)(i)", label: "Notice of intent — content (i)", form: "draft", modality: "duty", text: "placeholder" },
              { ref: "1b.7(b)(1)(ii)", label: "Notice of intent — content (ii)", form: "draft", modality: "duty", text: "placeholder" },
              { ref: "1b.7(b)(1)(iii)", label: "Notice of intent — content (iii)", form: "draft", modality: "duty", text: "placeholder" },
              { ref: "1b.7(b)(1)(iv)", label: "Notice of intent — content (iv)", form: "draft", modality: "duty", text: "placeholder" },
              { ref: "1b.7(b)(1)(v)", label: "Notice of intent — content (v)", form: "draft", modality: "duty", text: "placeholder" },
              { ref: "1b.7(b)(1)(vi)", label: "Notice of intent — content (vi)", form: "draft", modality: "duty", text: "placeholder" },
              { ref: "1b.7(b)(1)(vii)", label: "Notice of intent — content (vii)", form: "draft", modality: "duty", text: "placeholder" },
              { ref: "1b.7(b)(1)(viii)", label: "Notice of intent — content (viii)", form: "draft", modality: "duty", text: "placeholder" },
              { ref: "1b.7(b)(1)(ix)", label: "Notice of intent — content (ix)", form: "draft", modality: "duty", text: "placeholder" },
              {
                ref: "1b.7(b)(1)(x)",
                label: "Notice of intent — content (x)",
                help:
                  "The notice fixes the website every later publication must use — 1b.7(n)(2), 1b.8(c). Which of the ten contents carries it is not stated in this repository.",
                form: "draft", modality: "duty", text: "placeholder"
              }
            ]
          }
        ]
      },
      {
        id: "4",
        n: 4,
        name: "Scope, clock and scoping",
        tabs: [
          {
            id: "scope",
            name: "Scope of analysis",
    level: 2,
    scope: "review",
            rows: [{
                ref: "1b.7(g)",
                label: "Scope of analysis duties",
                help:
                  "1b.7(g) is not enumerated anywhere in this repository, so this is one row standing in for an unknown number. Its P3 counterpart at 1b.5(b) gets three.",
                form: "draft",
                modality: "duty",
                text: "placeholder"
              }]
          },
          {
            id: "deadline",
            name: "Deadline",
    level: 4,
    scope: "review",
            rows: [
              {
                ref: "1b.7(k)",
                label: "The three deadline triggers, and the soonest applicable",
                help: "Two years runs from the soonest of the three.",
                form: "select", modality: "duty", text: "restated", options: { kind: "unstated", why: "The members are not stated in this repository." }
              },
              { ref: "1b.7(k)", label: "Resulting deadline date", form: "value", modality: "duty", text: "restated" },
              {
                ref: "1b.7(l)(1)",
                label: "Extension, and its written documentation",
                form: "draft", modality: "permission", text: "restated",
              }
            ]
          },
          {
            id: "scoping",
            name: "Scoping",
    level: 2,
    scope: "review",
            rows: [
              {
                ref: "1b.7(c)",
                label: "Whether a scoping process is applied",
                help: "Not statutorily required, and no process is prescribed.",
                form: "choice", modality: "permission", text: "restated", options: { kind: "closed", members: ["Yes", "No"] },
              },
              { ref: "1b.7(c)(1)", label: "Where applied — (c)(1)", form: "draft", modality: "permission", text: "placeholder",},
              { ref: "1b.7(c)(2)", label: "Where applied — (c)(2)", form: "draft", modality: "permission", text: "placeholder",},
              { ref: "1b.7(c)(3)", label: "Where applied — (c)(3)", form: "draft", modality: "permission", text: "placeholder",}
            ]
          },
          {
            id: "comments",
            name: "Comment timing",
    level: 2,
    scope: "review",
            rows: [
              {
                ref: "1b.7(d)(3)",
                label: "When comment is requested",
                help: "At any time deemed reasonable.",
                form: "select", modality: "permission", text: "restated", options: { kind: "unstated", why: "The members are not stated in this repository." },
              }
            ]
          }
        ]
      },
      {
        id: "5",
        n: 5,
        name: "Assembly",
        tabs: [
          {
            id: "eis",
            name: "Environmental impact statement",
    level: 2,
    scope: "review",
            documentType: "EIS",
            rows: [
              {
                ref: "1b.7(h)(1)",
                label: "Cover",
                help:
                  "Two-page limit. Five sub-items, one of which is the unique identification number the rule attaches to the statement itself — 1b.7(h)(1)(v).",
                form: "draft",
                modality: "duty",
                text: "restated",
                expands: {
                  count: 5,
                  ref: "1b.7(h)(1)(i)–(v)",
                  why: "The five sub-items are named by count and not by content anywhere in this repository."
                }
              },
              { ref: "1b.7(h)(2)", label: "Purpose and need", form: "draft", modality: "duty", text: "restated" },
              { ref: "1b.7(h)(3)", label: "Proposed action and alternatives", form: "draft", modality: "duty", text: "restated" },
              { ref: "1b.7(h)(4)", label: "Potentially affected environment", form: "draft", modality: "duty", text: "restated" },
              {
                ref: "1b.7(h)(5)",
                label: "Environmental impacts",
                help: "Seven sub-items, and the longest element of the longest document.",
                form: "draft",
                modality: "duty",
                text: "restated",
                expands: {
                  count: 7,
                  ref: "1b.7(h)(5)(i)–(vii)",
                  why: "The seven sub-items are named by count and not by content anywhere in this repository."
                }
              },
              {
                ref: "1b.7(h)(6)",
                label:
                  "Environmental review and consultation requirements, agencies and persons consulted, and all Federal permits, licences and other authorisations",
                form: "value", modality: "duty", text: "restated"
              },
              {
                ref: "1b.7(h)(7)",
                label: "Appendices, if any",
                form: "sourcesOnly", modality: "permission", text: "restated",
              },
              {
                ref: "1b.7(h)(8)",
                label: "Certifying statements",
                help:
                  "No signature. Page limit 150, or 300 on a determination of extraordinary complexity, which requires Senior Agency Official coordination per 1b.7(i)(2). A draft EIS is optional — 1b.7(n)(1).",
                form: "quote", modality: "duty", text: "restated"
              }
            ]
          }
        ]
      },
      {
        id: "6",
        n: 6,
        name: "Comments",
        tabs: [
          {
            id: "substantive-comments",
            name: "Substantive comments",
    level: 2,
    scope: "review",
            rows: [
              { ref: "1b.7(e)", label: "Comments received", form: "value", modality: "duty", text: "restated" },
              {
                ref: "1b.7(a)",
                label: "Whether each issue is substantive",
                help: "The responsible official's expert judgment, at sole discretion.",
                form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
              },
              {
                ref: "1b.7(f)(2)",
                label: "Action taken",
                help:
                  "One of the six types at (f)(2)(i)–(vi). The sixth is no action needed, and it is the one a drafter drops and the one that carries the rationale.",
                form: "select",
                modality: "duty",
                text: "placeholder",
                options: {
                  kind: "unstated",
                  why:
                    "Six members at 1b.7(f)(2)(i)–(vi). Only the sixth, no action needed, is described anywhere in this repository; the other five are not."
                }
              }
            ]
          }
        ]
      },
      {
        id: "7",
        n: 7,
        name: "Publication and filing",
        tabs: [
          {
            id: "publish-and-file",
            name: "Publish and file",
    level: 4,
    scope: "review",
            rows: [
              {
                ref: "1b.7(h)(8)",
                label: "Certifying statements",
                help: "No signature. Approval to publish indicates concurrence.",
                form: "quote", modality: "duty", text: "restated"
              },
              {
                ref: "1b.7(n)(2)",
                label: "Publication to the website named in the notice of intent",
                form: "value", modality: "duty", text: "restated"
              },
              { ref: "1b.7(o)", label: "Filing with EPA", form: "value", modality: "duty", text: "restated" },
              {
                ref: "1b.8(e)",
                label: "EPA's Federal Register notice of availability",
                help:
                  "EPA publishes a weekly notice of availability once the statement is filed. The notice is a precondition of lawful implementation.",
                form: "value",
                modality: "duty",
                text: "restated"
              },
              {
                ref: "1b.7(l)",
                label: "Publication compelled by the deadline elapsing",
                help:
                  "1b.7(l) compels publication at deadline expiry on the same terms as 1b.5(f) — at the latest on the day the deadline elapses, in as substantially complete form as is possible. It is the deadline rule and not the filing rule; the two were one row.",
                form: "choice",
                modality: "duty",
                text: "verbatim",
                options: {
                  kind: "closed",
                  members: ["Published within the deadline", "Published under compulsion — 1b.7(l)"]
                }
              },
              {
                ref: "1b.7(i)",
                label: "Page count against the 150-page limit",
                help:
                  "Or 300 on a determination of extraordinary complexity. P3 carried this row and P4 did not, though the EIS is the document with the tighter constraint and the longer text.",
                form: "value",
                modality: "duty",
                text: "restated"
              },
              {
                ref: "1b.7(i)(2)",
                label: "Extraordinary complexity — Senior Agency Official coordination",
                help:
                  "A determination of extraordinary complexity raises the limit from 150 pages to 300 and requires coordination with the Senior Agency Official. Recorded and sent; never a gate on this surface.",
                form: "value",
                modality: "outbound-request",
                text: "restated"
              }
            ]
          }
        ]
      },
      {
        id: "8",
        n: 8,
        name: "Record of decision",
        tabs: [
          {
            id: "rod",
            name: "Record of decision",
    level: 2,
    scope: "review",
            documentType: "ROD",
            rows: [
              { ref: "1b.8(b)(1)", label: "Incorporate by reference the EIS", form: "sourcesOnly", modality: "duty", text: "restated" },
              {
                ref: "1b.8(b)(2)",
                label:
                  "Certify consideration of all substantive alternatives, information and analyses submitted by State, Tribal and local governments and public commenters",
                form: "quote", modality: "duty", text: "restated"
              },
              { ref: "1b.8(b)(3)", label: "State the decision — the alternative selected", form: "value", modality: "duty", text: "restated" },
              {
                ref: "1b.8(b)(4)",
                label: "Explain how significance was considered per 1b.2(f)(3)",
                form: "draft", modality: "duty", text: "restated"
              },
              {
                ref: "1b.8(b)(5)",
                label:
                  "Identify and discuss all factors balanced, including any essential considerations of national policy, and how they informed the decision",
                form: "draft", modality: "duty", text: "restated"
              },
              {
                ref: "1b.8(b)(6)",
                label:
                  "State any mitigation and, if adopted, its statutory or regulatory authority, with an adopted and summarised monitoring and enforcement programme",
                help:
                  "NEPA neither requires nor authorises the imposition of mitigation, so the authority is the load-bearing field.",
                form: "draft", modality: "duty", text: "restated"
              },
              {
                ref: "1b.8(b)(7)",
                label: "Statement regarding when implementation is anticipated to begin",
                form: "value", modality: "duty", text: "restated"
              },
              {
                ref: "1b.8(b)(8)",
                label: "Date issued and signature of the responsible official",
                help:
                  "May be combined with the EIS under 1b.8(a), in which case the cover is updated and the combined document is filed.",
                form: "value", modality: "duty", text: "restated",
                gate: SIGN_ROD
              }
            ]
          }
        ]
      },
      {
        id: "9",
        n: 9,
        name: "Notification and implementation clearance",
        terminal: true,
        tabs: [
          {
            id: "notify-and-clear",
            name: "Notify and clear",
    level: 4,
    scope: "review",
            rows: [
              {
                ref: "1b.8(c)",
                label: "Publication to the website named in the notice of intent",
                form: "value", modality: "duty", text: "restated"
              },
              {
                ref: "1b.8(d)",
                label:
                  "Notification of agencies and persons consulted as listed in the EIS, and of any party that commented, in the manner used to consult",
                form: "value", modality: "duty", text: "restated"
              },
              {
                ref: "1b.8(e)",
                label: "EPA notice of availability",
                help: "A precondition of lawful implementation.",
                form: "value", modality: "duty", text: "restated"
              }
            ]
          }
        ]
      }
    ]
  }
};

/* --------------------------------------------------------------------------
 * §7.7 — cross-cutting. Reachable from every step on every pathway.
 * ------------------------------------------------------------------------ */

export const CROSS_CUTTING: TabSpec[] = [
  {
    id: "proposal-record",
    name: "Proposal record",
    level: 0,
    scope: "proposal",
    rows: [
      {
        ref: "1b.9(a)",
        label: "The eleven categories of material the record should include",
        help:
          "From internal communications capturing rationale through to any other information deemed applicable by the responsible official. The rule says the record SHOULD include them, so this does not hold the element open.",
        form: "value",
        modality: "permission",
        text: "restated",
        expands: {
          count: 11,
          ref: "1b.9(a)(1)–(11)",
          why:
            "Only the first and the eleventh are described anywhere in this repository. Eleven rows would be nine labels that are their own ordinals."
        }
      }
    ]
  },
  {
    id: "incorporation",
    name: "Incorporation by reference",
    level: 1,
    scope: "proposal",
    rows: [
      {
        ref: "1b.9(e)(7)(i)",
        label: "Cited in a manner that identifies the content it contains",
        form: "sourcesOnly",
        modality: "duty",
        text: "verbatim"
      },
      {
        ref: "1b.9(e)(7)(i)",
        label: "Reasonably available for review by potentially interested parties",
        help: "A duty about the world rather than about a link, and unrepresentable in the ontology.",
        form: "choice",
        modality: "duty",
        text: "verbatim",
        options: { kind: "closed", members: ["Available", "Not available"] }
      },
      {
        ref: "1b.9(e)(7)(ii)",
        label: "Where comment is invited, available for inspection within the comment period",
        help: "A distinct duty from general availability, and it had no row.",
        form: "choice",
        modality: "duty",
        text: "restated",
        options: { kind: "closed", members: ["Available in period", "Not applicable — no comment invited"] }
      },
      {
        ref: "1b.9(e)(7)(iii)",
        label: "Privileged, classified or withheld material not incorporated unredacted",
        help: "Because such material is not available for review, which is the condition incorporation rests on.",
        form: "choice",
        modality: "duty",
        text: "restated",
        options: { kind: "closed", members: ["Excluded", "None present"] }
      }
    ]
  },
  {
    id: "reliance",
    name: "Reliance on existing documents",
    level: 1,
    scope: "proposal",
    rows: [
      {
        ref: "1b.9(e)(8)",
        label: "Explanation of quantitative and qualitative substantial sameness",
        form: "draft", modality: "duty", text: "restated"
      },
      {
        ref: "1b.9(e)(8)(vi)(A)",
        label: "Not final within the preparing agency",
        form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
      },
      { ref: "1b.9(e)(8)(vi)(B)", label: "Subject to an adequacy referral", form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] } },
      { ref: "1b.9(e)(8)(vi)(C)", label: "Subject to a non-final judicial action", form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] } }
    ]
  },
  {
    id: "agencies",
    name: "Agencies",
    level: 0,
    scope: "proposal",
    rows: [
      { ref: "1b.9(m)", label: "Lead, joint and cooperating agency roles", form: "value", modality: "duty", text: "restated" },
      {
        ref: "1b.9(m)(3)(ii)",
        label: "Documented reason for any cooperating-agency denial",
        help: "A reasoned act that must be documented in the proposal record.",
        form: "draft", modality: "duty", text: "restated"
      }
    ]
  },
  {
    id: "interdisciplinary",
    name: "Interdisciplinary preparation",
    level: 0,
    scope: "proposal",
    rows: [
      {
        ref: "1b.9(g)",
        label: "Disciplines engaged",
        help:
          "Subcomponents SHALL prepare environmental documents using an interdisciplinary approach. The approach is required; which disciplines prepare is at the responsible official's sole discretion — so the duty is to answer and the content is free.",
        form: "value",
        modality: "duty",
        text: "verbatim",
      },
      {
        ref: "1b.3(g)(2)(v)",
        label: "That the review occurred",
        help: "Precisely what a FANEC must assert. Nothing in the ontology records it.",
        form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
      }
    ]
  },
  {
    id: "withholding",
    name: "Withholding",
    level: 0,
    scope: "proposal",
    rows: [
      { ref: "1b.9(c)", label: "Privileged and classified material", form: "value", modality: "duty", text: "restated" },
      {
        ref: "1b.9(d)",
        label: "Segregation, and withholding where segregation would leave meaningless material",
        form: "choice", modality: "duty", text: "restated", options: { kind: "closed", members: ["Yes", "No"] }
      }
    ]
  },
  {
    id: "programmatic",
    name: "Programmatic reliance",
    level: 4,
    scope: "review",
    rows: [
      { ref: "1b.9(q)", label: "The five-year clock", form: "value", modality: "duty", text: "restated" },
      { ref: "1b.9(q)", label: "The reevaluation", form: "value", modality: "duty", text: "restated" },
      { ref: "1b.9(q)", label: "Documentation that the analysis remains valid", form: "draft", modality: "duty", text: "restated" }
    ]
  },
  /* Level 3. This is the one tab on the project page that learns from an
     outcome rather than guiding a decision, and it is where part 1b's ONLY
     express escalation instruction lives. It carried three rows and none of
     them was it. */
  {
    id: "reevaluation",
    name: "Reevaluation",
    level: 3,
    scope: "review",
    rows: [
      {
        ref: "1b.9(r)",
        label: "Whether the reevaluation duty is engaged",
        help:
          "A subcomponent shall reevaluate where a major Federal action or a portion of it is incomplete and ongoing AND there are substantial changes, or new circumstances or information with relevance bearing on the action such that there is potential to alter the disclosure of adverse effects. Both halves must hold.",
        form: "choice",
        modality: "duty",
        text: "verbatim",
        options: { kind: "closed", members: ["Engaged", "Not engaged"] }
      },
      {
        ref: "1b.9(r)",
        label: "Which published document is being reevaluated",
        help: "1b.9(r) operates on a published environmental document. Where a proposal has published more than one, the reevaluation names which.",
        form: "select",
        modality: "duty",
        text: "restated",
        options: { kind: "register", source: "the documents opened on this proposal" }
      },
      {
        ref: "1b.9(r)(1)",
        label: "No update needed",
        help:
          "Implementation may continue. The determination MAY be documented in the proposal record in a format the responsible official deems sufficient — so nothing here may force one.",
        form: "choice",
        modality: "permission",
        text: "restated",
        options: { kind: "closed", members: ["Documented", "Not documented"] }
      },
      {
        ref: "1b.9(r)(2)",
        label: "Minor corrections to a document other than a filed EIS",
        help:
          "Continue, document the reevaluation in the proposal record, and post the reevaluation documentation to the USDA website alongside the original.",
        form: "draft",
        modality: "duty",
        text: "restated"
      },
      {
        ref: "1b.9(r)(2)",
        label: "Stop the affected portions",
        help:
          "On substantial changes, work on the affected portions stops unless an emergency authority or exemption is invoked — see the Emergency tab.",
        form: "choice",
        modality: "duty",
        text: "restated",
        options: {
          kind: "closed",
          members: ["Stopped", "Emergency authority invoked", "Exemption invoked"]
        }
      },
      {
        ref: "1b.9(r)(2)",
        label: "Supplement the published document",
        form: "draft",
        modality: "duty",
        text: "restated"
      },
      {
        /* THE ONE EXPRESS ESCALATION INSTRUCTION IN PART 1b, and it had no row
           anywhere in this build. Its verb is CONSIDER, so the modality is
           duty-to-consider and never duty: the outcome remains the responsible
           official's under 1b.11(a)(46) and nothing here escalates by itself. */
        ref: "1b.9(r)(2)",
        label: "Whether a higher level of NEPA review is warranted",
        help:
          "Where the changes are substantial, the subcomponent shall CONSIDER whether a higher level of NEPA review is warranted. The rule requires the consideration; the conclusion is the responsible official's judgement.",
        form: "choice",
        modality: "duty-to-consider",
        text: "verbatim",
        options: {
          kind: "closed",
          members: [
            "Considered — a higher level is warranted",
            "Considered — the current level remains appropriate"
          ]
        }
      },
      {
        ref: "1b.9(r)(2)",
        label: "Post the supplement as a separate version from the original",
        help: "A supplement attaches to the original and is posted as a separate version of it, never in place of it.",
        form: "value",
        modality: "duty",
        text: "verbatim"
      },
      {
        ref: "1b.9(r)(3)",
        label: "Minor update to a FILED environmental impact statement — errata sheet",
        help:
          "An errata sheet is filed with EPA. It is defined by what it does NOT do: it must state that the updates do not substantially change the action, do not add disclosure of additional significant adverse impacts, and do not change the determinations made in the record of decision. So an errata can never open a new level of review.",
        form: "draft",
        modality: "duty",
        text: "verbatim"
      },
      {
        ref: "1b.9(r)(3)(i)(A)",
        label: "Errata — the environmental impact statement title as filed",
        form: "value",
        modality: "duty",
        text: "restated"
      },
      {
        ref: "1b.9(r)(3)(i)(B)",
        label: "Errata — citation to EPA's Federal Register notice of availability",
        form: "quote",
        modality: "duty",
        text: "restated"
      },
      {
        ref: "1b.9(r)(3)(i)(C)",
        label: "Errata — citations to the pages and sections being updated",
        form: "value",
        modality: "duty",
        text: "restated"
      },
      {
        ref: "1b.9(r)(3)(i)(D)",
        label: "Errata — clear descriptions of the updates",
        form: "draft",
        modality: "duty",
        text: "restated"
      },
      {
        ref: "1b.9(r)(3)(i)(E)",
        label: "Errata — an explanation of why each update is made",
        form: "draft",
        modality: "duty",
        text: "restated"
      },
      {
        ref: "1b.9(r)(3)(i)(F)",
        label: "Errata — date issued and signature of the responsible official",
        help:
          "The rule requires a signature here. §7.2 fixes the gated surfaces at three — FANEC, FONSI and ROD — so this one is recorded as a known divergence and is NOT built as a fourth gate. Raised in §8 rather than resolved silently.",
        form: "value",
        modality: "duty",
        text: "restated"
      },
      {
        ref: "1b.9(r)(3)(i)(G)",
        label: "Errata — publication to the USDA website",
        form: "value",
        modality: "duty",
        text: "restated"
      },
      {
        ref: "1b.9(r)(3)(i)(H)",
        label: "Errata — notification where necessary",
        form: "value",
        modality: "duty",
        text: "restated"
      },
      {
        ref: "1b.9(r)(3)",
        label: "Substantial update to a filed environmental impact statement — supplemental EIS",
        help:
          "A supplemental environmental impact statement under 1b.7. It runs the whole of that section again on the same proposal: its own notice of intent, its own clock, its own filing. It is a second level-of-review episode, not an amendment to the first.",
        form: "choice",
        modality: "duty",
        text: "restated",
        options: { kind: "closed", members: ["Required", "Not required"] }
      }
    ]
  },
  /* Level 2. Expanded because 1b.9(r)(2)'s stop-work duty has an express
     emergency exception, and a single select row gave that exception nothing to
     attach to. The five channels ARE stated in the register, so they are a
     closed set rather than an unstated one. */
  {
    id: "emergency",
    name: "Emergency",
    level: 2,
    scope: "review",
    rows: [
      {
        ref: "1b.9(v)(1)",
        label: "Emergency action taken without NEPA analysis",
        help: "Reserved to the responsible official. Recorded here; nothing on this surface authorises it.",
        form: "choice",
        modality: "permission",
        text: "restated",
        options: { kind: "closed", members: ["Taken", "Not taken"] }
      },
      {
        ref: "1b.9(v)(2)",
        label: "Which agency-specific channel applies",
        help:
          "For the Forest Service, the Chief or Associate Chief may grant emergency alternative arrangements for categorical exclusions, environmental assessments and associated findings.",
        form: "select",
        modality: "duty",
        text: "restated",
        options: {
          kind: "closed",
          members: [
            "(i) APHIS",
            "(ii) Farm Service Agency",
            "(iii) Rural Development",
            "(iv) Forest Service",
            "(v) all other USDA subcomponents"
          ]
        }
      },
      {
        ref: "1b.2(b)(2)(vi)",
        label: "Senior Agency Official approval of alternative arrangements",
        help: "Reserved to the Senior Agency Official. Recorded and sent; never a gate on this surface.",
        form: "value",
        modality: "outbound-request",
        text: "restated"
      },
      {
        ref: "1b.9(v)(3)",
        label: "CEQ consultation where significant impacts are likely",
        form: "value",
        modality: "duty",
        text: "restated"
      }
    ]
  },
  {
    id: "applicant",
    name: "Applicant or third party",
    level: 0,
    scope: "proposal",
    rows: [
      { ref: "1b.10(a)", label: "Supervision", form: "value", modality: "duty", text: "restated" },
      {
        ref: "1b.10(a)(4)",
        label: "Independent evaluation, and responsibility for the contents",
        form: "draft", modality: "duty", text: "restated"
      },
      {
        ref: "1b.10(a)(5)",
        label: "Disclosure statement of financial or other interest",
        form: "sourcesOnly", modality: "duty", text: "restated"
      },
      {
        ref: "1b.10(a)(7)",
        label: "The schedule, with major changes documented in writing",
        form: "value", modality: "duty", text: "restated"
      }
    ]
  }
];

/* --------------------------------------------------------------------------
 * §7.2 — drafting authority. All five documents are creatable. What differs
 * is who may prepare one and who must sign it, and the difference lands as
 * an access gate rather than as an omission.
 * ------------------------------------------------------------------------ */

export interface DocumentAuthority {
  documentType: DocumentType;
  elements: number;
  preparationOpenTo: string;
  issuedBy: string;
  cannotBeginUntil: string;
  gate: GateSpec | null;
}

export const DOCUMENT_AUTHORITY: DocumentAuthority[] = [
  {
    documentType: "FANEC",
    elements: 6,
    preparationOpenTo:
      "the subcomponent, or an applicant or third party under supervision — 1b.10(b)",
    issuedBy: "responsible official signs — 1b.3(g)(2)(vi)",
    cannotBeginUntil:
      "all three of 1b.3(g)(1)(i)–(iii) hold, and the interdisciplinary review 1b.3(g)(2)(v) must assert has occurred",
    gate: SIGN_FANEC
  },
  {
    documentType: "EA",
    elements: 7,
    preparationOpenTo:
      "the subcomponent, or an applicant or third party under supervision — 1b.10(a)",
    issuedBy: "no signature; approval to publish indicates concurrence — 1b.5(c)(6)",
    cannotBeginUntil: "level of review resolves to 1b.2(f)(2)(iv)(A)",
    gate: null
  },
  {
    documentType: "FONSI",
    elements: 5,
    preparationOpenTo: "the subcomponent only; 1b.10 does not extend to it",
    issuedBy: "responsible official signs — 1b.6(b)(5)",
    cannotBeginUntil: "the environmental assessment exists — 1b.6(a)",
    gate: SIGN_FONSI
  },
  {
    documentType: "EIS",
    elements: 8,
    preparationOpenTo:
      "the subcomponent, or an applicant or third party under supervision — 1b.10(a)",
    issuedBy: "no signature — 1b.7(h)(8)",
    cannotBeginUntil: "level of review resolves to 1b.2(f)(2)(iv)(B)",
    gate: null
  },
  {
    documentType: "ROD",
    elements: 8,
    preparationOpenTo: "the subcomponent only; 1b.10 does not extend to it",
    issuedBy: "responsible official signs — 1b.8(b)(8)",
    cannotBeginUntil: "the environmental impact statement is complete — 1b.8(a)",
    gate: SIGN_ROD
  }
];

/* --------------------------------------------------------------------------
 * §7.8 — trigger map. Step completion is what advances retrieval; not every
 * completion fires a push, and which do follows from what the next step
 * requires rather than from position in the sequence.
 * ------------------------------------------------------------------------ */

export interface Push {
  after: string;
  populates: string[];
}

export const RETRIEVAL_PUSHES: Push[] = [
  {
    after: "Step 0",
    populates: [
      "candidate CE categories from the catalogue",
      "applicable land management plan sections",
      "precedent and prior-coverage material",
      "regulation sections bearing on 1b.2(e) and 1b.2(f)(2)",
      "resources in the potentially affected environment"
    ]
  },
  {
    after: "Step 1",
    populates: ["nothing by itself; the outcome narrows Step 2 or terminates at P0"]
  },
  {
    after: "Step 2",
    populates: [
      "the pathway's step set",
      "the element set for each document on that pathway",
      "deadline applicability"
    ]
  },
  {
    after: "Step 3",
    populates: [
      "on P1/P2, FANEC element drafts from the category and screen findings",
      "on P3/P4, document element drafts from scope and the record"
    ]
  },
  {
    after: "Document steps",
    populates: [
      "the dependent document's drafts — a FONSI only after its EA per 1b.6(a), a ROD only after its EIS per 1b.8(a)"
    ]
  }
];

export interface Trigger {
  level: "2 → 4" | "2 → 3" | "step completion";
  trigger: string;
  fires: string;
}

export const TRIGGERS: Trigger[] = [
  {
    level: "2 → 4",
    trigger: "state-factor-finding returns present or undetermined",
    fires: "expert request drafted and held in Expert Q"
  },
  {
    level: "2 → 4",
    trigger: "deadline trigger date recorded",
    fires: "soonest-of-three computed; countdown runs"
  },
  {
    level: "2 → 4",
    trigger: "deadline reaches expiry",
    fires:
      "pending-element list assembled for compelled publication under 1b.5(f) or 1b.7(l); the responsible official publishes"
  },
  {
    level: "2 → 4",
    trigger: "page count crosses the limit",
    fires: "certifying statement at 1b.5(c)(6) or 1b.7(h)(8) surfaced"
  },
  { level: "2 → 3", trigger: "adopt on a drafted row", fires: "adoption diff recorded on Learning" },
  {
    level: "2 → 3",
    trigger: "freeze-slot-disposition",
    fires: "disposition mix compared against its pin"
  },
  { level: "2 → 3", trigger: "stamp-verifier-verdict", fires: "verdict recorded" },
  {
    level: "step completion",
    trigger: "Step 0 completes",
    fires:
      "first push: retrieval across corpus, forest plan register, regulation and CE catalogue; drafted rows written into Steps 1 and 2"
  },
  {
    level: "step completion",
    trigger: "a step completes that supplies inputs the next step needs",
    fires: "a further push into that step's tabs"
  },
  { level: "step completion", trigger: "a step supplies nothing downstream", fires: "nothing" }
];

/* §7.9 — discretion that must not become requirement. Held here as text so a
 * reviewer can check the list against the rows marked `discretionary`. */
export const DISCRETIONS: string[] = [
  "Scoping and its process — 1b.7(c)",
  "Element order inside any document; all five lists permit any format",
  "Comment timing — 1b.7(d)(3)",
  "Whether a draft EIS exists — 1b.7(n)(1)",
  "Whether an NOI is published for an EA — 1b.5(e)(3)(ii)",
  "Whether comment is solicited on an EA — 1b.5(e)(3)(iii)",
  "Whether no action is a stand-alone alternative — 1b.5(c)(2)(i)",
  "Whether an EA analyses alternatives at all — 1b.5(c)(2)(ii)",
  "Whether hearings or meetings occur — 1b.9(k)",
  "Whether a threshold determination is recorded — 1b.2(e)",
  "Whether a FANEC carries a unique identification number — 1b.9(u)",
  "Whether a reevaluation finding no update needed is documented — 1b.9(r)(1)"
];

export const PATHWAY_IDS: PathwayId[] = ["P0", "P1", "P2", "P3", "P4"];

/* --------------------------------------------------------------------------
 * §8.2 — the anchor.
 * ------------------------------------------------------------------------ */

/** The stable address of one row, and the whole reason a review comment can be
 *  answered rather than merely read.
 *
 *  THE ORDINAL IS NOT DECORATION. A citation repeats inside a single tab in
 *  twelve places — four rows of implementation clearance all cite 1b.3(j),
 *  three rows of incorporation all cite 1b.9(e)(7), three of programmatic all
 *  cite 1b.9(q) — so a ref-keyed anchor collides on the first run. The ordinal
 *  is per tab and per citation, which keeps it stable when an unrelated row is
 *  added above.
 *
 *  One function computes it, and it is simultaneously the DOM id, the comment
 *  address, the audit key and the natural join key for per-row backend state.
 *  Carrying it therefore costs nothing that was not already needed. */
export function ridFor(stepKey: string, tab: TabSpec, index: number): string {
  const row = tab.rows[index];
  let ordinal = 0;
  for (let i = 0; i <= index; i++) {
    if (tab.rows[i].ref === row.ref) {
      ordinal++;
    }
  }
  return `${stepKey}/${tab.id}/${row.ref}#${String(ordinal)}`;
}

/* --------------------------------------------------------------------------
 * §8.0 — the transitions.
 *
 * Every place part 1b moves a proposal from one level of NEPA review to
 * another. There are four, their modalities differ sharply, and getting a
 * modality wrong is how a non-specialist learns a false constraint.
 *
 * What is NOT here matters as much as what is. 1b.2(f)(2)(i)–(iv) is an ordered
 * ELIMINATION on a single occasion, not a ladder: moving from limb (i) to limb
 * (iv) is one determination with four branch points, and nothing about it is a
 * transition. A 1b.3(f)(3) cure is not one either — it operates inside a level
 * and before any document exists. An errata under 1b.9(r)(3) is defined by NOT
 * changing the determinations in the record of decision, so it can never open
 * one. And there is no de-escalation: `direction` has no "lower" member, which
 * makes one unauthorable rather than merely unrecommended.
 * ------------------------------------------------------------------------ */

export interface Transition {
  id: string;
  label: string;
  /** Every citation the move rests on, in the order the chain runs. */
  citations: string[];
  modality: Modality;
  /** No "lower". The rule's asymmetry, encoded: 1b.9(r)(2) says "higher" and
   *  names no lower, and an errata expressly preserves the ROD's
   *  determinations. The surface says this is SILENCE, not prohibition. */
  direction: "higher" | "same-level-again";
  from: PathwayId[];
  to: PathwayId[];
  /** Where the affordance lives — the surface on which the RULE discovers the
   *  fact, never a button in the inbox. */
  offeredOn: string;
  statement: string;
  /** What moves to the new level, and on what citation. Rendered before the
   *  move is taken, never after. */
  carries: string[];
  /** What does not move, and why. */
  staysBehind: string[];
  /** Set where the move rests on something this repository cannot read. */
  unresolved?: string;
}

export const TRANSITIONS: Transition[] = [
  {
    id: "T1",
    label: "Reevaluation finds a higher level of review may be warranted",
    citations: ["1b.9(r)", "1b.9(r)(2)", "1b.11(a)(46)"],
    modality: "duty-to-consider",
    direction: "higher",
    from: ["P1", "P2", "P3", "P4"],
    to: ["P3", "P4"],
    offeredOn: "x/reevaluation",
    statement:
      "Where a major Federal action or a portion of it is incomplete and ongoing AND there are substantial changes or new circumstances, the subcomponent shall CONSIDER whether a higher level of NEPA review is warranted. This is the only express escalation instruction in part 1b, and its verb is consider: the conclusion is the responsible official's under 1b.11(a)(46) and nothing here escalates by itself.",
    carries: [
      "The published document, as an authored reliance under 1b.9(e)(8) with its three (vi)(A)–(C) disclosures",
      "Every proposal-scoped tab — intake, the threshold determination and nine of the ten cross-cutting tabs"
    ],
    staysBehind: [
      "The superseded level's steps, readable and read-only; 1b.9(a) keeps them in the proposal record",
      "That document's own unique identification number — 1b.9(u) attaches it to the document, not to the proposal"
    ]
  },
  {
    id: "T2",
    label: "A categorical exclusion cannot be applied because an extraordinary circumstance was not cured",
    citations: [
      "1b.2(f)(2)(i)",
      "1b.3(g)(1)(ii)",
      "1b.3(f)(3)",
      "1b.2(f)(2)(iv)",
      "1b.3(f)(2)"
    ],
    modality: "derived",
    direction: "higher",
    from: ["P1", "P2"],
    to: ["P3", "P4"],
    offeredOn: "E1.P1.3/extraordinary-circumstances",
    statement:
      "No single paragraph states this move; a chain of four compels it. 1b.2(f)(2)(i) directs application of an exclusion per 1b.3(f) and (g); 1b.3(g)(1)(ii) requires that no extraordinary circumstance exist; a cure under 1b.3(f)(3) is permitted but not required; so where none is made the exclusion cannot be applied consistent with limb (i), and 1b.2(f)(2)(iv) engages by its own condition. Which of (iv)(A) or (iv)(B) then applies comes from 1b.3(f)(2)'s two-member test — reasonable uncertainty routes to an environmental assessment, certainty of significance to an environmental impact statement. It is a consequence, not a choice.",
    carries: [
      "The category and the per-resource findings, as the record of why the exclusion failed",
      "Every proposal-scoped tab"
    ],
    staysBehind: [
      "Nothing was published on P1 or P2, so no document carries over",
      "A FANEC begun and not issued stays with its own level"
    ]
  },
  {
    id: "T3",
    label: "A substantial update to a filed environmental impact statement",
    citations: ["1b.9(r)(3)", "1b.7", "1b.7(k)", "1b.7(o)"],
    modality: "duty",
    direction: "same-level-again",
    from: ["P4"],
    to: ["P4"],
    offeredOn: "x/reevaluation",
    statement:
      "A supplemental environmental impact statement under 1b.7. It runs that section again on the same proposal — its own notice of intent, its own clock from its own soonest-of-three, its own filing with EPA and its own notice of availability. This is why a level history is an ordered list rather than a set: one proposal can occupy P4 twice, and a shape with one slot per pathway cannot hold it.",
    carries: [
      "The filed statement, incorporated by reference under 1b.8(b)(1)",
      "Every proposal-scoped tab"
    ],
    staysBehind: [
      "The original statement and its record of decision, unchanged — a supplement is posted as a separate version from the original",
      "The original's clock; the supplement runs a new one"
    ],
    unresolved:
      "Whether a supplemental statement carries a SECOND record of decision is not stated. 1b.8(a) attaches one to a completed statement, which suggests yes, but nothing in this repository says so, and it is not asserted here."
  },
  {
    id: "T4",
    label: "The responsible official redetermines the appropriate level of review",
    citations: ["1b.11(a)(46)"],
    modality: "permission",
    direction: "higher",
    from: ["P1", "P2", "P3"],
    to: ["P3", "P4"],
    offeredOn: "E1.P3.6/fonsi",
    statement:
      "The responsible official's authority over what level of NEPA review is appropriate stays live, so a redetermination after an environmental assessment is within authority. The rule PERMITS this; it does not require it. An environmental assessment that finds significance does not, on anything readable here, oblige an environmental impact statement — 1b.2(f)(2)(iv) fires BEFORE the assessment is written, and expressly sends unknown significance to an assessment rather than to a statement.",
    carries: [
      "The published environmental assessment, as an authored reliance under 1b.9(e)(8)",
      "Every proposal-scoped tab"
    ],
    staysBehind: [
      "The environmental assessment's own identification number — 1b.5(c)(7); the statement takes its own under 1b.7(h)(1)(v)",
      "A finding of no significant impact begun and not issued: 1b.6(b)(3) requires it to conclude that no statement will be prepared, which it now cannot"
    ],
    unresolved:
      "1b.5(a) and 1b.6(c) — the two paragraphs where a rule directing an assessment that finds significance to a statement would live — are cited nowhere in this repository, and outbound retrieval of the pinned text is blocked. Until they are read, this move is carried as a permission and never as a duty."
  }
];

/** Competence conditions. Not level transitions, and kept apart from them on
 *  purpose: 1b.4(a) does not MOVE a proposal, it decides whether a level is
 *  available to that subcomponent at all. */
export const COMPETENCE_CONDITIONS: Transition[] = [
  {
    id: "C1",
    label: "An excluded subcomponent, an extraordinary circumstance, and a concurrence",
    citations: ["1b.4(a)", "1b.2(b)(2)"],
    modality: "outbound-request",
    direction: "higher",
    from: ["P1", "P2"],
    to: ["P3", "P4"],
    offeredOn: "S.2/subcomponent-exclusion",
    statement:
      "Nine named subcomponents conduct programmes that do not normally result in reasonably foreseeable significant impacts, and their actions are excluded from preparing an environmental assessment or statement outright — unless the subcomponent determines that an extraordinary circumstance exists for the individual action AND obtains the concurrence of the USDA Senior Agency Official or their designee. This application cannot verify a concurrence, so it records the request and sends it; it never blocks on one, and it never forecloses a level on the client's own authority.",
    carries: [],
    staysBehind: [],
    unresolved:
      "The nine subcomponents cannot be enumerated from this repository: the source sentence names eight services plus a block of general offices while calling the total nine. A picker must not be built until the list is read off the pinned text."
  }
];

/* --------------------------------------------------------------------------
 * §8.4 — the reopen step.
 *
 * Where a second level-of-review determination is made. Its last two tabs are
 * SHARED_STEPS[2]'s own tabs BY OBJECT IDENTITY — the same precedent as
 * CE_SCREEN_STEP, which P1 and P2 share by reference — so the 1b.2(f)(2) limb
 * sequence is literally the same rows in a reopening as in the first
 * determination. Drift between them is impossible rather than merely unlikely.
 * ------------------------------------------------------------------------ */

const WHY_REOPENED: TabSpec = {
  id: "why-reopened",
  name: "Why reopened",
  level: 2,
  scope: "review",
  rows: [
    {
      ref: "1b.11(a)(46)",
      label: "Which transition opened this level",
      help:
        "Part 1b has four. Each carries its own citations and its own force, and the difference between them is the difference between something you must do, something you must consider, something that follows whether or not you choose it, and something you may do.",
      form: "choice",
      modality: "duty",
      text: "restated",
      options: {
        kind: "closed",
        members: [
          "T1 — reevaluation, consider a higher level (1b.9(r)(2))",
          "T2 — an uncured extraordinary circumstance (derived, 1b.2(f)(2)(iv))",
          "T3 — a supplemental environmental impact statement (1b.9(r)(3))",
          "T4 — redetermination by the responsible official (1b.11(a)(46))"
        ]
      }
    },
    {
      ref: "1b.9(a)",
      label: "The record of why",
      help: "What changed, and what it changed about the level of review that was appropriate.",
      form: "draft",
      modality: "duty",
      text: "restated"
    },
    {
      ref: "1b.9(e)(8)",
      label: "What carries forward, and on what citation",
      help:
        "A document produced at the earlier level does not continue into the new one — it is INCORPORATED into it. 1b.9(e)(8) requires an explanation of substantial sameness and three disclosures at (vi)(A)–(C), so the carry-over is authored evidence rather than a convenience of the interface.",
      form: "sourcesOnly",
      modality: "duty",
      text: "restated"
    },
    {
      ref: "1b.9(r)(2)",
      label: "Whether work on the affected portions has stopped",
      help: "Unless an emergency authority or exemption is invoked — see the Emergency tab.",
      form: "choice",
      modality: "duty",
      text: "restated",
      restates: "x/reevaluation/1b.9(r)(2)#2",
      options: {
        kind: "closed",
        members: ["Stopped", "Emergency authority invoked", "Not applicable"]
      }
    }
  ]
};

export const REOPEN_STEP: StepSpec = {
  id: "R",
  n: 2,
  name: "Reopened level of review",
  tabs: [WHY_REOPENED, SHARED_STEPS[2].tabs[0], SHARED_STEPS[2].tabs[1]]
};

/* --------------------------------------------------------------------------
 * §8.4 — the rail.
 *
 * THE STRUCTURAL POINT OF THE WHOLE DESIGN. The rail is computed HERE, from
 * this file, over the levels a proposal has occupied. It is not the array an
 * adapter returned.
 *
 * That distinction is the difference between a guarantee and a hope. A readonly
 * array forbids mutation, not a SHORTER one: a live implementation written
 * against a blanket uniqueness constraint would return exactly one episode, and
 * the rail would silently lose the earlier level's steps again — undetectably,
 * because the port is the boundary. Deriving the rail from the level ids means
 * a wrong or partial response can MISLABEL a level and can never delete a step.
 * ------------------------------------------------------------------------ */

export const SHARED_KEY = (step: StepSpec) => `S.${step.id}`;
export const EPISODE_KEY = (seq: number, pathway: PathwayId, step: StepSpec) =>
  `E${String(seq)}.${pathway}.${step.id}`;

export interface RailStep {
  step: StepSpec;
  key: string;
  band: { kind: "shared" } | { kind: "episode"; seq: number; pathway: PathwayId };
}

/** Shared steps, then one band per level the proposal has occupied, in order.
 *  Only ever concatenates. A step cannot leave the rail once it has entered it,
 *  because nothing here can remove one. */
export function railFor(levels: { seq: number; pathway: PathwayId }[]): RailStep[] {
  const out: RailStep[] = SHARED_STEPS.map((step) => ({
    step,
    key: SHARED_KEY(step),
    band: { kind: "shared" as const }
  }));
  for (const level of levels) {
    if (level.seq > 1) {
      out.push({
        step: REOPEN_STEP,
        key: `E${String(level.seq)}.${level.pathway}.R`,
        band: { kind: "episode" as const, seq: level.seq, pathway: level.pathway }
      });
    }
    for (const step of PATHWAYS[level.pathway].steps) {
      out.push({
        step,
        key: EPISODE_KEY(level.seq, level.pathway, step),
        band: { kind: "episode" as const, seq: level.seq, pathway: level.pathway }
      });
    }
  }
  return out;
}

/** The single-level case, unchanged in behaviour, so every existing caller and
 *  every existing URL keeps working. */
export function stepsFor(pathway: PathwayId | null): StepSpec[] {
  return pathway ? [...SHARED_STEPS, ...PATHWAYS[pathway].steps] : SHARED_STEPS;
}

/** A step key, parsed. A BARE local id is accepted and resolved against the
 *  live level, because five step ids collide across pathways — "4" is
 *  Disposition on P1 and P2, Assembly on P3 and Scope-clock-and-scoping on P4 —
 *  so a bare id has never been an address and every existing URL carries one. */
export function parseStepKey(
  key: string,
  levels: { seq: number; pathway: PathwayId }[],
  liveSeq: number | null
): { key: string; band: RailStep["band"] } | null {
  const rail = railFor(levels);
  const exact = rail.find((entry) => entry.key === key);
  if (exact) {
    return { key: exact.key, band: exact.band };
  }
  const shared = rail.find((entry) => entry.band.kind === "shared" && entry.step.id === key);
  if (shared) {
    return { key: shared.key, band: shared.band };
  }
  const live = rail.find(
    (entry) => entry.band.kind === "episode" && entry.band.seq === liveSeq && entry.step.id === key
  );
  return live ? { key: live.key, band: live.band } : null;
}

export function findStep(pathway: PathwayId | null, stepId: string): StepSpec | undefined {
  return stepsFor(pathway).find((step) => step.id === stepId);
}

/** The cross-cutting fallback fires ONLY for the cross-cutting segment. It used
 *  to fire for any step id, so ten tab ids rendered foreign content under any
 *  segment at all — including one that does not exist. */
export function findTab(
  pathway: PathwayId | null,
  stepId: string,
  tabId: string
): TabSpec | undefined {
  if (stepId === "x") {
    return CROSS_CUTTING.find((tab) => tab.id === tabId);
  }
  if (stepId === "R") {
    return REOPEN_STEP.tabs.find((tab) => tab.id === tabId);
  }
  return findStep(pathway, stepId)?.tabs.find((tab) => tab.id === tabId);
}
