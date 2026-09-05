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

export interface RowSpec {
  ref: string;
  label: string;
  help?: string;
  /** How a filled answer is written down, when one arrives. */
  form: "quote" | "value" | "draft" | "select" | "choice" | "sourcesOnly";
  /** §7.9: a permission in the rule. Recorded so it is not built as a gate. */
  discretionary?: boolean;
  gate?: GateSpec;
}

export interface TabSpec {
  id: string;
  name: string;
  /** Set where the tab assembles a document, so element counts are checkable. */
  documentType?: DocumentType;
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
        rows: [
          { ref: "1b.9(a)", label: "Description of the proposed action", form: "draft" },
          {
            ref: "1b.4(d)(24)",
            label: "Components and connected actions",
            help: "All components and connected actions, so the action is described as a whole.",
            form: "draft"
          },
          { ref: "1b.9(a)", label: "Anticipated implementation start", form: "value" }
        ]
      },
      {
        id: "location",
        name: "Location and jurisdiction",
        rows: [
          { ref: "1b.2(f)", label: "Geographic extent and acreage", form: "value" },
          { ref: "1b.9(a)", label: "Administrative unit", form: "select" },
          {
            ref: "1b.9(a)",
            label: "Applicable land management plan",
            help: "Selected from the forest plan register once the administrative unit is known.",
            form: "select"
          },
          {
            ref: "1b.4(d)(24)",
            label: "Detailed site plans and location maps",
            help:
              "Where 1b.4(d)(24) applies: the specific location on detailed site plans and maps equivalent to a USGS quadrangle, accurate, complete and capable of verification.",
            form: "sourcesOnly"
          }
        ]
      },
      {
        id: "authority",
        name: "Authority",
        rows: [
          { ref: "1b.2(e)(1)", label: "Federal nexus", form: "draft" },
          { ref: "1b.2(e)(2)", label: "Statutory or regulatory authority for the action", form: "quote" },
          {
            ref: "1b.2(e)(4)",
            label: "Whether decisional criteria leave residual discretion",
            help:
              "Congress may have prescribed decisional criteria with sufficient completeness and precision that no residual discretion remains to alter the action on environmental grounds.",
            form: "choice"
          },
          {
            ref: "1b.2(e)(6)",
            label: "Whether another statute's requirements serve the compliance function",
            form: "choice"
          }
        ]
      },
      {
        id: "timing",
        name: "Timing",
        rows: [
          {
            ref: "1b.5(e) · 1b.7(k)",
            label: "Deadline trigger event and its date",
            help: "Where a deadline applies. The soonest of the three triggers fixes the date.",
            form: "select"
          },
          { ref: "1b.9(u)", label: "Unique identification number and issuer", form: "value" }
        ]
      },
      {
        id: "participants",
        name: "Participants",
        rows: [
          { ref: "1b.4(a)", label: "USDA subcomponent", form: "select" },
          { ref: "1b.11(a)(46)", label: "Responsible official", form: "value" },
          {
            ref: "1b.10(a)(5)",
            label: "Whether an applicant or third party is involved",
            help:
              "With the disclosure statement of financial or other interest in the outcome, where one is.",
            form: "choice"
          },
          { ref: "1b.9(m)", label: "Lead, joint and cooperating agencies", form: "value" }
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
        rows: [
          {
            ref: "1b.2(e)(1)",
            label: "Not a major Federal action",
            help:
              "'Major' and 'Federal action' each have independent force and NEPA applies only when both are met. Reserved to the judgment of the subcomponent in each instance.",
            form: "choice"
          },
          { ref: "1b.2(e)(2)", label: "Exempted from NEPA by law", form: "choice" },
          {
            ref: "1b.2(e)(3)",
            label: "No final Federal agency action",
            help: "Under the Administrative Procedure Act, 5 U.S.C. 704, or another statute with a finality requirement.",
            form: "choice"
          },
          { ref: "1b.2(e)(4)", label: "Nondiscretionary — no residual discretion remains", form: "choice" },
          {
            ref: "1b.2(e)(5)",
            label: "Compliance would clearly and fundamentally conflict with another provision of law",
            form: "choice"
          },
          {
            ref: "1b.2(e)(6)",
            label: "Another statute's requirements serve the compliance function",
            form: "choice"
          },
          { ref: "1b.2(e)", label: "Which ground answered", form: "select" },
          {
            ref: "1b.2(e)",
            label: "Justification record",
            help:
              "Record keeping of the justification is advisable, not required. Nothing here may force one.",
            form: "draft",
            discretionary: true
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
        rows: [
          {
            ref: "1b.4(a)",
            label: "Whether the subcomponent is one of the nine listed",
            help:
              "Their actions are excluded from the preparation of an EA or EIS outright, unless an extraordinary circumstance exists for the individual action.",
            form: "choice"
          },
          {
            ref: "1b.4(a)",
            label: "Whether an extraordinary circumstance exists for this action",
            form: "choice"
          },
          {
            ref: "1b.4(a)",
            label: "Senior Agency Official concurrence",
            help: "An outbound request, recorded and sent. Not a gate on this surface.",
            form: "value"
          }
        ]
      },
      {
        // Named for what it divides, not for its step: a tab that repeats its
        // own step's name reads as a clone of it rather than a part of it.
        id: "level-of-review",
        name: "Sequence and significance",
        rows: [
          {
            ref: "1b.2(f)(2)(i)",
            label: "An established or adopted categorical exclusion covers the action",
            help: "Limbs evaluate in order and the first applicable wins.",
            form: "choice"
          },
          {
            ref: "1b.2(f)(2)(ii)",
            label: "Another agency's categorical exclusion is adopted under 1b.3(c)",
            form: "choice"
          },
          {
            ref: "1b.2(f)(2)(iii)",
            label: "Establishing or revising a categorical exclusion",
            help: "Rulemaking, and out of scope here. Recorded as considered and not pursued.",
            form: "choice"
          },
          {
            ref: "1b.2(f)(2)(iv)",
            label: "Reasonably foreseeable significant impacts",
            help:
              "Reachable only on the failure of (i)–(iii). Impacts not likely significant, or of unknown significance, develop an environmental assessment; likely significant, an environmental impact statement.",
            form: "choice"
          },
          {
            ref: "1b.2(f)(3)(ii)",
            label: "Degree of effects — the five considerations",
            help:
              "Short- and long-term effects; beneficial and adverse effects; effects on public health and safety; economic effects; effects on the quality of life. Subcomponents should consider these, as appropriate.",
            form: "draft",
            discretionary: true
          },
          {
            ref: "1b.2(f)(3)(iii)(A)",
            label: "How unavoidable impacts of implementing compare to not implementing",
            help: "Responsible officials shall consider this in providing rationale.",
            form: "draft"
          },
          {
            ref: "1b.2(f)(3)(iii)(B)",
            label:
              "How irreversible and irretrievable commitment of a Federal resource contributes to loss of long-term productivity",
            form: "draft"
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
      rows: [
        {
          ref: "1b.4",
          label: "Category or categories applied",
          help: "With citation and the verbatim description from the catalogue.",
          form: "select"
        },
        {
          ref: "1b.3(g)(2)(ii)",
          label: "Whether adopted from a non-USDA agency",
          help: "A FANEC must specify that the category was adopted.",
          form: "choice"
        },
        {
          ref: "1b.3(h)",
          label: "Reliance on a prior determination",
          help:
            "With the explanation of substantial sameness — of the activities, and of the affected environment where no extraordinary circumstance is also relied on.",
          form: "draft"
        },
        {
          ref: "1b.4(d)(24)",
          label: "Applicant documentation",
          help:
            "Where (d)(24) applies: components and connected actions, location on detailed site plans and USGS-equivalent maps, and authoritative confirmation of the presence or absence of sensitive resources.",
          form: "sourcesOnly"
        }
      ]
    },
    {
      id: "extraordinary-circumstances",
      name: "Extraordinary circumstances",
      rows: [
        {
          ref: "1b.3(f)",
          label: "Resources selected for consideration",
          help:
            "At the responsible official's sole discretion, as informed by interdisciplinary review. The eight classes at (f)(1) are open-ended — 'may include, but are not limited to' — and are not a closed set.",
          form: "select",
          discretionary: true
        },
        { ref: "1b.3(f)(1)", label: "Per-resource finding", form: "choice" },
        {
          ref: "1b.3(f)(2)",
          label: "Whether reasonable uncertainty or certainty of significance exists",
          help:
            "Mere presence of a listed resource does not mean an extraordinary circumstance exists. One exists only where there is reasonable uncertainty whether the degree of effect is significant, or certainty that it is.",
          form: "choice"
        },
        {
          ref: "1b.3(f)(3)",
          label: "Modification of the action to cure",
          help:
            "An extraordinary circumstance is not terminal. Where the action is modified so that certainty is created that the effect is not significant, the circumstance no longer exists and the exclusion may proceed.",
          form: "draft",
          discretionary: true
        },
        { ref: "1b.3(f)(4)", label: "Reliance on other-law effects analysis", form: "draft", discretionary: true },
        { ref: "1b.3(g)(2)(v)", label: "Interdisciplinary review record", form: "value" }
      ]
    }
  ]
};

export const PATHWAYS: Record<PathwayId, PathwaySpec> = {
  P0: {
    id: "P0",
    name: "NEPA does not apply",
    reachedWhen: "1b.2(e) — NEPA does not apply",
    terminalOutput: "None; record keeping advisable only",
    steps: []
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
            rows: [
              { ref: "1b.3(j)", label: "A categorical exclusion applies", form: "value" },
              { ref: "1b.3(j)", label: "No extraordinary circumstance exists", form: "value" },
              {
                ref: "1b.3(j)",
                label: "Other necessary environmental review documentation completed",
                form: "value"
              },
              {
                ref: "1b.3(j)",
                label: "No other statute or regulation requires otherwise",
                form: "choice"
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
            documentType: "FANEC",
            rows: [
              {
                ref: "1b.3(g)(2)(i)",
                label: "Incorporate by reference other relevant documentation in the proposal record",
                form: "sourcesOnly"
              },
              {
                ref: "1b.3(g)(2)(ii)",
                label:
                  "State the category or categories and, if adopted from a non-USDA agency, specify that it was adopted",
                form: "quote"
              },
              {
                ref: "1b.3(g)(2)(iii)",
                label: "Describe the proposed action and state how the categories apply",
                form: "draft"
              },
              { ref: "1b.3(g)(2)(iv)", label: "State the resources considered", form: "draft" },
              {
                ref: "1b.3(g)(2)(v)",
                label:
                  "State that no extraordinary circumstances exist, as informed by the interdisciplinary review",
                form: "draft"
              },
              {
                ref: "1b.3(g)(2)(vi)",
                label: "Date issued and signature of the responsible official",
                help:
                  "Format is free and there is no page limit or deadline. 1b.3(i) permits items required by another statute or regulation.",
                form: "value",
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
            rows: [
              { ref: "1b.3(g)(2)(vi)", label: "Date issued", form: "value" },
              {
                ref: "1b.3(g)(2)(vi)",
                label: "Signature of the responsible official",
                form: "value",
                gate: SIGN_FANEC
              },
              {
                ref: "1b.9(u)",
                label: "Unique identification number",
                help: "Mandatory for an EA and an EIS; discretionary for a FANEC.",
                form: "value",
                discretionary: true
              },
              {
                ref: "1b.3",
                label: "Disposition of the signed document",
                help: "No publication or notification duty attaches to a FANEC.",
                form: "select"
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
            rows: [
              { ref: "1b.5(b)(1)", label: "Scope of analysis — first duty", form: "draft" },
              { ref: "1b.5(b)(2)", label: "Scope of analysis — second duty", form: "draft" },
              { ref: "1b.5(b)(3)", label: "Scope of analysis — third duty", form: "draft" }
            ]
          },
          {
            id: "deadline",
            name: "Deadline",
            rows: [
              {
                ref: "1b.5(e)",
                label: "The three deadline triggers, and the soonest applicable",
                help:
                  "One year runs from the soonest of the three. deadlineDays, deadlineTriggerName and deadlineTriggerDate exist and are null; nothing computes soonest-of-three.",
                form: "select"
              },
              { ref: "1b.5(e)", label: "Resulting deadline date", form: "value" },
              {
                ref: "1b.5(g)",
                label: "Extension — cause, applicant consultation and the written record",
                form: "draft",
                discretionary: true
              },
              {
                ref: "1b.5(g)(2)",
                label: "Senior Agency Official coordination on the extension",
                form: "value",
                discretionary: true
              }
            ]
          },
          {
            id: "public-involvement",
            name: "Public involvement",
            rows: [
              {
                ref: "1b.5(e)(3)(ii)",
                label: "Whether a notice of intent is published",
                help: "Sole discretion. Never a requirement.",
                form: "choice",
                discretionary: true
              },
              {
                ref: "1b.5(e)(3)(iii)",
                label: "Whether comment is solicited",
                help: "Sole discretion. Never a requirement.",
                form: "choice",
                discretionary: true
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
            documentType: "EA",
            rows: [
              { ref: "1b.5(c)(1)", label: "Purpose and need", form: "draft" },
              {
                ref: "1b.5(c)(2)",
                label: "No action, the proposed action and alternatives",
                help:
                  "(c)(2)(i) makes no action optional as a stand-alone alternative while still requiring its consequences in the impacts analysis; (c)(2)(ii) permits an EA analysing only the proposed action where there are no unresolved conflicts. Neither may be built as a requirement.",
                form: "draft",
                discretionary: true
              },
              {
                ref: "1b.5(c)(3)",
                label: "Potentially affected environment and environmental impacts",
                form: "draft"
              },
              { ref: "1b.5(c)(4)", label: "Agencies and persons consulted", form: "value" },
              { ref: "1b.5(c)(5)", label: "Other environmental reviews", form: "sourcesOnly" },
              {
                ref: "1b.5(c)(6)",
                label: "Certifying statements for the page limit and the deadline",
                help:
                  "No signature is required. Approval to publish indicates the responsible official's concurrence. Appendices do not count toward the limit and may not carry substantive analysis — 1b.5(d)(2).",
                form: "quote"
              },
              { ref: "1b.5(c)(7)", label: "Unique identification number", form: "value" }
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
            rows: [
              {
                ref: "1b.5(d)",
                label: "Page count against the 75-page limit",
                help: "Text only; citations and appendices are excluded. pageCount and pageLimit are null and nothing computes either.",
                form: "value"
              },
              { ref: "1b.5(c)(6)", label: "Certifying statement — page limit", form: "quote" },
              { ref: "1b.5(c)(6)", label: "Deadline certification", form: "quote" },
              {
                ref: "1b.5(f)",
                label: "Publication to a USDA website",
                help:
                  "Publication completes the EA and stops the clock. Where the deadline elapses first, 1b.5(f) compels publication that day in as substantially complete form as is possible.",
                form: "value"
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
            documentType: "FONSI",
            rows: [
              {
                ref: "1b.6(b)(1)",
                label: "Incorporate by reference the EA and note other related documentation",
                form: "sourcesOnly"
              },
              {
                ref: "1b.6(b)(2)",
                label: "State the selected alternative, if others were analysed in detail",
                form: "value"
              },
              {
                ref: "1b.6(b)(3)",
                label:
                  "Reasons for the finding, concluding that for these reasons an EIS will not be prepared",
                help:
                  "Where the finding rests on mitigation, state the statutory or regulatory authority for it and any monitoring or enforcement provisions.",
                form: "draft"
              },
              {
                ref: "1b.6(b)(4)",
                label: "Statement regarding when implementation is anticipated to begin",
                form: "value"
              },
              {
                ref: "1b.6(b)(5)",
                label: "Date issued and signature of the responsible official",
                help:
                  "May be combined with the EA under 1b.6(a) and does not count toward its page limit. May be retitled as a decision document where a statute or regulation requires one.",
                form: "value",
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
            rows: [
              {
                ref: "1b.6(e)",
                label: "Every agency and person consulted, as identified in the EA",
                form: "value"
              },
              {
                ref: "1b.6(e)",
                label: "The manner of communication used to consult",
                help: "The channel is part of the obligation, not a detail of it.",
                form: "select"
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
            rows: [
              { ref: "1b.7(b)(1)(i)", label: "Notice of intent — content (i)", form: "draft" },
              { ref: "1b.7(b)(1)(ii)", label: "Notice of intent — content (ii)", form: "draft" },
              { ref: "1b.7(b)(1)(iii)", label: "Notice of intent — content (iii)", form: "draft" },
              { ref: "1b.7(b)(1)(iv)", label: "Notice of intent — content (iv)", form: "draft" },
              { ref: "1b.7(b)(1)(v)", label: "Notice of intent — content (v)", form: "draft" },
              { ref: "1b.7(b)(1)(vi)", label: "Notice of intent — content (vi)", form: "draft" },
              { ref: "1b.7(b)(1)(vii)", label: "Notice of intent — content (vii)", form: "draft" },
              { ref: "1b.7(b)(1)(viii)", label: "Notice of intent — content (viii)", form: "draft" },
              { ref: "1b.7(b)(1)(ix)", label: "Notice of intent — content (ix)", form: "draft" },
              {
                ref: "1b.7(b)(1)(x)",
                label: "Notice of intent — content (x)",
                help:
                  "The notice fixes the website every later publication must use — 1b.7(n)(2), 1b.8(c).",
                form: "draft"
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
            rows: [{ ref: "1b.7(g)", label: "Scope of analysis duties", form: "draft" }]
          },
          {
            id: "deadline",
            name: "Deadline",
            rows: [
              {
                ref: "1b.7(k)",
                label: "The three deadline triggers, and the soonest applicable",
                help: "Two years runs from the soonest of the three.",
                form: "select"
              },
              { ref: "1b.7(k)", label: "Resulting deadline date", form: "value" },
              {
                ref: "1b.7(l)(1)",
                label: "Extension, and its written documentation",
                form: "draft",
                discretionary: true
              }
            ]
          },
          {
            id: "scoping",
            name: "Scoping",
            rows: [
              {
                ref: "1b.7(c)",
                label: "Whether a scoping process is applied",
                help: "Not statutorily required, and no process is prescribed.",
                form: "choice",
                discretionary: true
              },
              { ref: "1b.7(c)(1)", label: "Where applied — (c)(1)", form: "draft", discretionary: true },
              { ref: "1b.7(c)(2)", label: "Where applied — (c)(2)", form: "draft", discretionary: true },
              { ref: "1b.7(c)(3)", label: "Where applied — (c)(3)", form: "draft", discretionary: true }
            ]
          },
          {
            id: "comments",
            name: "Comment timing",
            rows: [
              {
                ref: "1b.7(d)(3)",
                label: "When comment is requested",
                help: "At any time deemed reasonable.",
                form: "select",
                discretionary: true
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
            documentType: "EIS",
            rows: [
              {
                ref: "1b.7(h)(1)",
                label: "Cover",
                help:
                  "Five sub-items and a two-page limit, including the unique identification number.",
                form: "draft"
              },
              { ref: "1b.7(h)(2)", label: "Purpose and need", form: "draft" },
              { ref: "1b.7(h)(3)", label: "Proposed action and alternatives", form: "draft" },
              { ref: "1b.7(h)(4)", label: "Potentially affected environment", form: "draft" },
              {
                ref: "1b.7(h)(5)",
                label: "Environmental impacts",
                help: "Seven sub-items.",
                form: "draft"
              },
              {
                ref: "1b.7(h)(6)",
                label:
                  "Environmental review and consultation requirements, agencies and persons consulted, and all Federal permits, licences and other authorisations",
                form: "value"
              },
              {
                ref: "1b.7(h)(7)",
                label: "Appendices, if any",
                form: "sourcesOnly",
                discretionary: true
              },
              {
                ref: "1b.7(h)(8)",
                label: "Certifying statements",
                help:
                  "No signature. Page limit 150, or 300 on a determination of extraordinary complexity, which requires Senior Agency Official coordination per 1b.7(i)(2). A draft EIS is optional — 1b.7(n)(1).",
                form: "quote"
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
            rows: [
              { ref: "1b.7(e)", label: "Comments received", form: "value" },
              {
                ref: "1b.7(a)",
                label: "Whether each issue is substantive",
                help: "The responsible official's expert judgment, at sole discretion.",
                form: "choice"
              },
              {
                ref: "1b.7(f)(2)",
                label: "Action taken",
                help:
                  "One of the six types at (f)(2)(i)–(vi). The sixth is no action needed, and it carries the rationale.",
                form: "select"
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
            rows: [
              {
                ref: "1b.7(h)(8)",
                label: "Certifying statements",
                help: "No signature. Approval to publish indicates concurrence.",
                form: "quote"
              },
              {
                ref: "1b.7(n)(2)",
                label: "Publication to the website named in the notice of intent",
                form: "value"
              },
              { ref: "1b.7(o)", label: "Filing with EPA", form: "value" },
              {
                ref: "1b.7(l)",
                label: "EPA's Federal Register notice of availability",
                help:
                  "1b.7(l) compels publication at deadline expiry on the same terms as 1b.5(f).",
                form: "value"
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
            documentType: "ROD",
            rows: [
              { ref: "1b.8(b)(1)", label: "Incorporate by reference the EIS", form: "sourcesOnly" },
              {
                ref: "1b.8(b)(2)",
                label:
                  "Certify consideration of all substantive alternatives, information and analyses submitted by State, Tribal and local governments and public commenters",
                form: "quote"
              },
              { ref: "1b.8(b)(3)", label: "State the decision — the alternative selected", form: "value" },
              {
                ref: "1b.8(b)(4)",
                label: "Explain how significance was considered per 1b.2(f)(3)",
                form: "draft"
              },
              {
                ref: "1b.8(b)(5)",
                label:
                  "Identify and discuss all factors balanced, including any essential considerations of national policy, and how they informed the decision",
                form: "draft"
              },
              {
                ref: "1b.8(b)(6)",
                label:
                  "State any mitigation and, if adopted, its statutory or regulatory authority, with an adopted and summarised monitoring and enforcement programme",
                help:
                  "NEPA neither requires nor authorises the imposition of mitigation, so the authority is the load-bearing field.",
                form: "draft"
              },
              {
                ref: "1b.8(b)(7)",
                label: "Statement regarding when implementation is anticipated to begin",
                form: "value"
              },
              {
                ref: "1b.8(b)(8)",
                label: "Date issued and signature of the responsible official",
                help:
                  "May be combined with the EIS under 1b.8(a), in which case the cover is updated and the combined document is filed.",
                form: "value",
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
            rows: [
              {
                ref: "1b.8(c)",
                label: "Publication to the website named in the notice of intent",
                form: "value"
              },
              {
                ref: "1b.8(d)",
                label:
                  "Notification of agencies and persons consulted as listed in the EIS, and of any party that commented, in the manner used to consult",
                form: "value"
              },
              {
                ref: "1b.8(e)",
                label: "EPA notice of availability",
                help: "A precondition of lawful implementation.",
                form: "value"
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
    rows: [
      {
        ref: "1b.9(a)(1)–(11)",
        label: "The eleven categories of material the record should include",
        help:
          "From internal communications capturing rationale through to any other information deemed applicable by the responsible official.",
        form: "value"
      }
    ]
  },
  {
    id: "incorporation",
    name: "Incorporation by reference",
    rows: [
      { ref: "1b.9(e)(7)", label: "Cited so the content is identified", form: "sourcesOnly" },
      {
        ref: "1b.9(e)(7)",
        label: "Reasonably available for review by potentially interested parties",
        help: "A duty about the world rather than about a link, and unrepresentable in the ontology.",
        form: "choice"
      },
      {
        ref: "1b.9(e)(7)",
        label: "Privileged, classified or withheld material excluded",
        form: "choice"
      }
    ]
  },
  {
    id: "reliance",
    name: "Reliance on existing documents",
    rows: [
      {
        ref: "1b.9(e)(8)",
        label: "Explanation of quantitative and qualitative substantial sameness",
        form: "draft"
      },
      {
        ref: "1b.9(e)(8)(vi)(A)",
        label: "Not final within the preparing agency",
        form: "choice"
      },
      { ref: "1b.9(e)(8)(vi)(B)", label: "Subject to an adequacy referral", form: "choice" },
      { ref: "1b.9(e)(8)(vi)(C)", label: "Subject to a non-final judicial action", form: "choice" }
    ]
  },
  {
    id: "agencies",
    name: "Agencies",
    rows: [
      { ref: "1b.9(m)", label: "Lead, joint and cooperating agency roles", form: "value" },
      {
        ref: "1b.9(m)(3)(ii)",
        label: "Documented reason for any cooperating-agency denial",
        help: "A reasoned act that must be documented in the proposal record.",
        form: "draft"
      }
    ]
  },
  {
    id: "interdisciplinary",
    name: "Interdisciplinary preparation",
    rows: [
      {
        ref: "1b.9(g)",
        label: "Disciplines engaged",
        help: "Which disciplines prepare is at the responsible official's sole discretion.",
        form: "value",
        discretionary: true
      },
      {
        ref: "1b.3(g)(2)(v)",
        label: "That the review occurred",
        help: "Precisely what a FANEC must assert. Nothing in the ontology records it.",
        form: "choice"
      }
    ]
  },
  {
    id: "withholding",
    name: "Withholding",
    rows: [
      { ref: "1b.9(c)", label: "Privileged and classified material", form: "value" },
      {
        ref: "1b.9(d)",
        label: "Segregation, and withholding where segregation would leave meaningless material",
        form: "choice"
      }
    ]
  },
  {
    id: "programmatic",
    name: "Programmatic reliance",
    rows: [
      { ref: "1b.9(q)", label: "The five-year clock", form: "value" },
      { ref: "1b.9(q)", label: "The reevaluation", form: "value" },
      { ref: "1b.9(q)", label: "Documentation that the analysis remains valid", form: "draft" }
    ]
  },
  {
    id: "reevaluation",
    name: "Reevaluation",
    rows: [
      {
        ref: "1b.9(r)(1)",
        label: "No update needed",
        help: "Whether a finding of no update needed is documented is discretionary.",
        form: "choice",
        discretionary: true
      },
      { ref: "1b.9(r)(2)", label: "Supplementation", form: "choice" },
      {
        ref: "1b.9(r)(3)",
        label: "Errata sheet",
        help: "Eight mandatory contents at (r)(3)(i)(A)–(H).",
        form: "draft"
      }
    ]
  },
  {
    id: "emergency",
    name: "Emergency",
    rows: [
      {
        ref: "1b.9(v)(2)(i)–(v)",
        label: "The agency-specific channels",
        help:
          "For the Forest Service, the Chief or Associate Chief may grant alternative arrangements. Absent from the ontology entirely.",
        form: "select"
      }
    ]
  },
  {
    id: "applicant",
    name: "Applicant or third party",
    rows: [
      { ref: "1b.10(a)", label: "Supervision", form: "value" },
      {
        ref: "1b.10(a)(4)",
        label: "Independent evaluation, and responsibility for the contents",
        form: "draft"
      },
      {
        ref: "1b.10(a)(5)",
        label: "Disclosure statement of financial or other interest",
        form: "sourcesOnly"
      },
      {
        ref: "1b.10(a)(7)",
        label: "The schedule, with major changes documented in writing",
        form: "value"
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

/* --- lookups the screens use, so no screen walks the structure by hand --- */

export function stepsFor(pathway: PathwayId | null): StepSpec[] {
  return pathway ? [...SHARED_STEPS, ...PATHWAYS[pathway].steps] : SHARED_STEPS;
}

export function findStep(pathway: PathwayId | null, stepId: string): StepSpec | undefined {
  return stepsFor(pathway).find((step) => step.id === stepId);
}

export function findTab(
  pathway: PathwayId | null,
  stepId: string,
  tabId: string
): TabSpec | undefined {
  const step = findStep(pathway, stepId);
  const own = step?.tabs.find((tab) => tab.id === tabId);
  return own ?? CROSS_CUTTING.find((tab) => tab.id === tabId);
}

export const PATHWAY_IDS: PathwayId[] = ["P0", "P1", "P2", "P3", "P4"];
