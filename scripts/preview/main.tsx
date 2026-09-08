/** The review harness. NOT part of the application.
 *
 *  It mounts the real tree — the real `App`, the real screens, the real fixture
 *  port — inside a MemoryRouter, and puts a bar above it that drives the URL
 *  knobs the application already has. Nothing here is imported by anything
 *  under `src/ui/`, so the packet is still one directory rename and none of
 *  this travels.
 *
 *  Why a bar rather than the address bar. A published page has no address bar
 *  the reviewer can edit: it renders inside a frame, and its own URL is the
 *  artifact's, not the application's. The knobs are the whole demo surface —
 *  `?levels=`, `?state=`, `?shell=`, `?rail=`, `?gate=`, `?retrieval=`,
 *  `?session=` — so the harness turns them into controls. The bar reads the
 *  same `PATHWAY_IDS`, `railFor` and `CROSS_CUTTING` the screens do, so the
 *  step and tab pickers cannot list a step the application does not have.
 */
import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";

import { App } from "@/ui/App";
import { PATHWAY_IDS, railFor } from "@/ui/data/port";
import type { PathwayId } from "@/ui/data/port";

import "./harness.css";

/* --- the knobs, as the application declares them ------------------------- */

const LEVEL_SETS: { label: string; value: string; note: string }[] = [
  { label: "none", value: "", note: "Before Step 2 decides anything. Only the shared steps exist." },
  { label: "P0", value: "P0", note: "NEPA does not apply. Terminates at the threshold determination." },
  { label: "P1", value: "P1", note: "A categorical exclusion applies and the category needs no documentation." },
  { label: "P2", value: "P2", note: "A categorical exclusion applies and the category requires a FANEC." },
  { label: "P3", value: "P3", note: "An environmental assessment, then a finding of no significant impact." },
  { label: "P4", value: "P4", note: "An environmental impact statement, then a record of decision." },
  {
    label: "P1 › P3",
    value: "P1,P3",
    note: "T2 — an extraordinary circumstance was not cured, so the exclusion cannot be applied and 1b.2(f)(2)(iv) engages. Derived, not a choice."
  },
  {
    label: "P3 › P4",
    value: "P3,P4",
    note: "The escalation. P3 is superseded and still readable; its environmental assessment is still there."
  },
  {
    label: "P3 › P4 › P4",
    value: "P3,P4,P4",
    note: "T3 — a supplemental statement under 1b.9(r)(3). One proposal occupying the same level twice, which is why the history is a list and not a set."
  }
];

const STATES = ["filled", "pending", "absent", "blocked", "unresolved"] as const;

const PAGES = [
  { label: "Inbox", path: "/" },
  { label: "Archive", path: "/archive" },
  { label: "Expert Q", path: "/experts" },
  { label: "Learning", path: "/learning" },
  { label: "Reference", path: "/reference" }
];

/* --- the bar ------------------------------------------------------------- */

function useKnobs() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  /* Several knobs at once, in ONE navigate. Two `set` calls in a row could not
     work: each builds its query from the `search` of the render it was created
     in, so the second navigate discards whatever the first wrote. That is why
     the pathway picker did nothing — it set `levels` and then cleared the legacy
     `pathway` key, and the second call navigated back over the first. */
  const setMany = (changes: Record<string, string | null>, path?: string) => {
    const next = new URLSearchParams(search);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    const q = next.toString();
    navigate((path ?? pathname) + (q ? `?${q}` : ""));
  };

  const set = (key: string, value: string | null) => {
    setMany({ [key]: value });
  };

  const go = (path: string) => {
    const q = params.toString();
    navigate(path + (q ? `?${q}` : ""));
  };

  return { pathname, params, set, setMany, go };
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="hgroup">
      <span className="hlabel">{label}</span>
      <div className="hseg">{children}</div>
    </div>
  );
}

function Seg({
  on,
  onClick,
  title,
  children
}: {
  on: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className="hbtn" data-on={on ? "yes" : "no"} title={title} onClick={onClick}>
      {children}
    </button>
  );
}

/** Keeps the page's own fragment in step with where the harness is, so a
 *  reviewer can copy the address and land a colleague on exactly this state.
 *  The router is in memory — a published page's URL belongs to the publishing
 *  surface, not to the application — so the fragment is the only part of the
 *  address this page may write, and it is read back on load. */
function useShareableHash() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const next = `#${pathname}${search}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [pathname, search]);
}

function Harness({ children }: { children: React.ReactNode }) {
  const { pathname, params, set, setMany, go } = useKnobs();
  const [open, setOpen] = useState(true);
  useShareableHash();

  const levels = (params.get("levels") ?? params.get("pathway") ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter((p): p is PathwayId => PATHWAY_IDS.some((id) => id === p));

  const onProject = pathname.startsWith("/projects/");
  const rail = useMemo(
    () => railFor(levels.map((pathway, i) => ({ seq: i + 1, pathway }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levels.join(",")]
  );

  const stepKey = onProject ? (pathname.split("/steps/")[1]?.split("/")[0] ?? "") : "";
  const tabId = onProject ? (pathname.split("/steps/")[1]?.split("/")[1] ?? "") : "";
  const active = rail.find((entry) => entry.key === stepKey);
  const tabs = active?.step.tabs ?? [];

  const levelValue = levels.join(",");
  const note = LEVEL_SETS.find((s) => s.value === levelValue)?.note;

  return (
    <div className="hshell">
      <header className="hbar" data-open={open ? "yes" : "no"}>
        <div className="hbarhead">
          <span className="hmark">Review harness</span>
          <span className="hsay">
            Not part of the application. These are the URL knobs the build already has, as
            controls — a published page has no address bar to type them into.
          </span>
          <button
            type="button"
            className="hfold"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide" : "Show controls"}
          </button>
        </div>

        {open ? (
          <div className="hrows">
            <Group label="Page">
              {PAGES.map((p) => (
                <Seg key={p.path} on={pathname === p.path} onClick={() => go(p.path)}>
                  {p.label}
                </Seg>
              ))}
              <Seg
                on={onProject}
                onClick={() => go("/projects/p1/steps/S.0/proposed-action")}
                title="The project page — pathways, steps, tabs, rows"
              >
                Project
              </Seg>
            </Group>

            <Group label="Pathway — the levels of review this proposal has occupied">
              {LEVEL_SETS.map((s) => (
                <Seg
                  key={s.label}
                  on={levelValue === s.value}
                  title={s.note}
                  onClick={() => {
                    /* Changing the level set changes which steps exist, so the
                       step in the address usually stops existing — E1.P3.5 is
                       not a step of a P4 proposal. Landing back on the first
                       step of the new rail is what makes the picker appear to
                       work at all; without it the panel goes empty and the
                       control reads as broken. */
                    const nextRail = railFor(
                      s.value
                        .split(",")
                        .filter(Boolean)
                        .map((p, i) => ({ seq: i + 1, pathway: p as PathwayId }))
                    );
                    const first = nextRail[0];
                    setMany(
                      { levels: s.value, pathway: null },
                      onProject && first
                        ? `/projects/p1/steps/${first.key}/${first.step.tabs[0].id}`
                        : undefined
                    );
                  }}
                >
                  {s.label}
                </Seg>
              ))}
            </Group>

            {onProject ? (
              <>
                <Group label="Step">
                  {rail.map((entry) => (
                    <Seg
                      key={entry.key}
                      on={entry.key === stepKey}
                      title={`${entry.key} — ${entry.step.name}`}
                      onClick={() => go(`/projects/p1/steps/${entry.key}/${entry.step.tabs[0].id}`)}
                    >
                      <span className="hkey">{entry.key}</span>
                      {entry.step.name}
                    </Seg>
                  ))}
                </Group>

                {tabs.length > 1 ? (
                  <Group label="Tab">
                    {tabs.map((tab) => (
                      <Seg
                        key={tab.id}
                        on={tab.id === tabId}
                        onClick={() => go(`/projects/p1/steps/${stepKey}/${tab.id}`)}
                      >
                        {tab.name}
                      </Seg>
                    ))}
                  </Group>
                ) : null}
              </>
            ) : null}

            <div className="hrow">
              <Group label="This screen's region">
                {STATES.map((s) => (
                  <Seg
                    key={s}
                    on={(params.get("state") ?? "filled") === s}
                    onClick={() => set("state", s === "filled" ? null : s)}
                  >
                    {s}
                  </Seg>
                ))}
              </Group>

              <Group label="Band">
                {STATES.map((s) => (
                  <Seg
                    key={s}
                    on={(params.get("shell") ?? "filled") === s}
                    onClick={() => set("shell", s === "filled" ? null : s)}
                  >
                    {s}
                  </Seg>
                ))}
              </Group>

              <Group label="Rail">
                {STATES.map((s) => (
                  <Seg
                    key={s}
                    on={(params.get("rail") ?? params.get("shell") ?? "filled") === s}
                    onClick={() => set("rail", s === "filled" ? null : s)}
                  >
                    {s}
                  </Seg>
                ))}
              </Group>
            </div>

            <div className="hrow">
              <Group label="Review assembled">
                <Seg
                  on={params.get("assembled") !== "no"}
                  title="The documents are open and the pathway steps exist."
                  onClick={() => set("assembled", null)}
                >
                  yes
                </Seg>
                <Seg
                  on={params.get("assembled") === "no"}
                  title="Step 2 has fixed a level and nothing has been built from it yet — the state the assemble control at the seam exists for. Pick a pathway above to see it offered."
                  onClick={() => set("assembled", "no")}
                >
                  not yet
                </Seg>
              </Group>

              <Group label="Signature credential">
                <Seg on={params.get("gate") !== "held"} onClick={() => set("gate", null)}>
                  not held
                </Seg>
                <Seg
                  on={params.get("gate") === "held"}
                  title="What the responsible official sees. The reserved row offers the act itself instead of the routing."
                  onClick={() => set("gate", "held")}
                >
                  held
                </Seg>
              </Group>

              <Group label="Drafting lane">
                <Seg on={params.get("retrieval") !== "down"} onClick={() => set("retrieval", null)}>
                  up
                </Seg>
                <Seg
                  on={params.get("retrieval") === "down"}
                  title="The lane could not have answered — unresolved, which is a different claim from finding nothing."
                  onClick={() => set("retrieval", "down")}
                >
                  down
                </Seg>
              </Group>

              <Group label="Session">
                <Seg on={!params.get("session")} onClick={() => set("session", null)}>
                  in
                </Seg>
                <Seg on={params.get("session") === "pending"} onClick={() => set("session", "pending")}>
                  resolving
                </Seg>
                <Seg on={params.get("session") === "out"} onClick={() => set("session", "out")}>
                  out
                </Seg>
              </Group>
            </div>

            {note ? <p className="hnote">{note}</p> : null}
          </div>
        ) : null}
      </header>

      <div className="happ">{children}</div>
    </div>
  );
}

const host = document.getElementById("root");
if (!host) {
  throw new Error("Missing #root");
}

/** Opens where the fragment says, and on Step 0 of the project page otherwise —
 *  intake is the first thing an officer works on, and the route should say so
 *  rather than opening on a step no project has reached. */
const opening = window.location.hash.startsWith("#/")
  ? window.location.hash.slice(1)
  : "/projects/p1/steps/S.0/proposed-action";

createRoot(host).render(
  <StrictMode>
    <MemoryRouter initialEntries={[opening]}>
      <Harness>
        <App />
      </Harness>
    </MemoryRouter>
  </StrictMode>
);
