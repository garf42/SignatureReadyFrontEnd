import { useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Menu, MenuItem } from "@blueprintjs/core";

import type { BandEntry, BandRef, StepEntry, StepRail } from "@/ui/data/port";
import { usePort } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { Region } from "@/ui/components/Region";
import { TabStrip } from "@/ui/components/TabStrip";
import { CROSS_STEP, crossPath, tabPath, withSearch } from "@/ui/routes";

import css from "@/ui/screens/ProjectScreen.module.css";

/** The project: band, level line, banded step rail, the tabs of the step in
 *  hand, and the panel the element screen renders into.
 *
 *  THE RAIL ACCUMULATES. A level of review that has been superseded keeps its
 *  steps, readable and read-only: 1b.9(a) keeps the work in the proposal record
 *  and 1b.6(b)(1) and 1b.8(b)(1) incorporate it into whatever comes next. The
 *  rail is computed from the rule over the levels the proposal has occupied, so
 *  a backend that answers wrongly can mislabel a level and can never delete a
 *  step.
 *
 *  Only the LIVE band is expanded. A proposal that has been P1, then P3, then
 *  P4 is eighteen steps, and a rail that shows all eighteen at once is not a
 *  rail; a superseded band collapses to one line that still names its step
 *  count and its documents, so a reader who never expands it is not misled
 *  about what is inside.
 *
 *  Levels a determination FORECLOSED are not in the rail at all. They are shown
 *  once, under the level line, as a statement of the 1b.2(f)(2) elimination —
 *  never as a set of lanes, because the primary user is not the responsible
 *  official and must not read the decision tree as a menu they pick from. */
export function ProjectScreen() {
  const params = useParams();
  const projectRef = params.projectRef ?? "";
  const stepId = params.stepId ?? "";
  const tabId = params.tabId ?? "";
  const navigate = useNavigate();
  const { search } = useLocation();
  const port = usePort();
  const project = port.useProject(projectRef);
  const levels = port.useLevels(projectRef);
  const rail = port.useSteps(projectRef, stepId);
  const cross = port.useCrossCutting(projectRef);
  const [railShut, setRailShut] = useState(false);
  const [openBands, setOpenBands] = useState<Record<string, boolean>>({});

  const go = (path: string) => navigate(withSearch(path, search));
  const onCross = stepId === CROSS_STEP;
  const bandId = (band: BandRef) =>
    band.kind === "episode" ? `E${String(band.seq)}` : band.kind;

  return (
    <AppFrame current="inbox" padded={false}>
      <div className={css.band}>
        <Region region={project}>
          {(header) => (
            <>
              <div className={css.bandHead}>
                <h1 className={css.projectName}>{header.name}</h1>
                <p className={css.projectMeta}>
                  {header.ref} · {header.office} · {header.status}
                </p>
              </div>
              <p className={css.projectSummary}>{header.summary}</p>
            </>
          )}
        </Region>

        {/* The level line. A person who is never told which review they are
            doing cannot be driven to the correct one, and this is the sentence
            that tells them: which level, on what authority, and what it ends
            in. Restores what was removed when the pathway line was deleted. */}
        <Region region={levels}>
          {(history) => (
            <div className={css.levelLine} data-level={history.liveSeq === null ? "none" : "set"}>
              <p className={css.levelNote}>{history.note}</p>
              {history.documents.length > 0 ? (
                <p className={css.levelDocs}>
                  {history.documents
                    .map((entry) =>
                      [entry.documentType, entry.uniqueIdentificationNumber]
                        .filter(Boolean)
                        .join(" · ")
                    )
                    .join("   ")}
                </p>
              ) : null}
              {history.foreclosed.length > 0 ? (
                <p className={css.foreclosed}>
                  Levels this determination ruled out: {history.foreclosed.map((f) => f.pathway).join(", ")} —{" "}
                  {history.foreclosed[0].limb}
                </p>
              ) : null}
            </div>
          )}
        </Region>
      </div>

      <div className={css.split} data-rail={railShut ? "closed" : "open"}>
        <aside className={css.rail} aria-label="Steps">
          <button
            type="button"
            className={css.railHead}
            aria-expanded={!railShut}
            aria-label={railShut ? "Show the steps" : "Hide the steps"}
            onClick={() => setRailShut((v) => !v)}
          >
            <span>{railShut ? "" : "Steps"}</span>
            <span className={css.railGlyph}>{railShut ? "+" : "−"}</span>
          </button>

          <Region region={rail}>
            {(value: StepRail) => (
              <>
                {value.bands
                  .filter((band) => band.band.kind !== "cross")
                  .map((band) => {
                    const key = bandId(band.band);
                    const steps = value.steps.filter((s) => bandId(s.band) === key);
                    /* A superseded band collapses — but never the one holding
                       the step being read, or the rail would show no entry for
                       where the reader is standing. */
                    const holdsActive = steps.some(
                      (s) => s.key === stepId || s.id === stepId
                    );
                    const open = openBands[key] ?? (!band.collapsed || holdsActive);
                    return (
                      <section key={key} className={css.bandGroup} data-status={band.status}>
                        <button
                          type="button"
                          className={css.bandHeader}
                          aria-expanded={open}
                          onClick={() => setOpenBands((state) => ({ ...state, [key]: !open }))}
                        >
                          <span className={css.bandTitle}>{railShut ? key : band.title}</span>
                          {railShut ? null : (
                            <span className={css.bandSummary}>{band.summary}</span>
                          )}
                        </button>
                        {open ? (
                          <Menu>
                            {steps.map((step) => (
                              <StepItem
                                key={step.key}
                                step={step}
                                shut={railShut}
                                active={step.key === stepId || step.id === stepId}
                                onOpen={() =>
                                  go(tabPath(projectRef, step.key, step.tabs[0]?.id ?? tabId))
                                }
                              />
                            ))}
                          </Menu>
                        ) : null}
                      </section>
                    );
                  })}
              </>
            )}
          </Region>

          {/* One entry, not ten. §7.7's tabs are the parts of this parent, and
              they belong in the tab strip with every other step's parts — the
              rail lists parents only, so nothing appears in both places. */}
          <Region region={cross}>
            {(tabs) => (
              <Menu>
                <MenuItem
                  className={css.step + " " + css.cross + (onCross ? " " + css.active : "")}
                  title="Across the project"
                  text={railShut ? <span className={css.number}>§</span> : "Across the project"}
                  label={railShut ? undefined : `${String(tabs.length)} tabs`}
                  onClick={() => go(crossPath(projectRef, tabs[0].id))}
                />
              </Menu>
            )}
          </Region>
        </aside>

        <section className={css.panel}>
          <Region region={rail}>
            {(value) => (
              <Region region={cross}>
                {(tabs) => (
                  <TabStrip
                    id="element-tabs"
                    tabs={tabsFor(value, tabs, stepId)}
                    selected={tabId}
                    onSelect={(next) =>
                      go(onCross ? crossPath(projectRef, next) : tabPath(projectRef, stepId, next))
                    }
                  />
                )}
              </Region>
            )}
          </Region>
          <div className={css.panelBox}>
            <Outlet />
          </div>
        </section>
      </div>
    </AppFrame>
  );
}

/** A step in the rail. A superseded step reads as superseded and still opens; a
 *  step whose document cannot begin yet names the paragraph it waits on rather
 *  than vanishing. §7.2 requires the build to be walkable end to end, and that
 *  rule is about CREDENTIALS — conflating it with ordering is what made hiding
 *  later steps look necessary in the first place. */
function StepItem({
  step,
  shut,
  active,
  onOpen
}: {
  step: StepEntry;
  shut: boolean;
  active: boolean;
  onOpen: () => void;
}) {
  const placeholders = step.tabs.reduce((n, tab) => n + tab.placeholders, 0);
  return (
    <MenuItem
      className={css.step + " " + css[active ? "active" : step.mark]}
      title={step.waitingOn ? `${step.name} — waits on ${step.waitingOn}` : step.name}
      text={
        shut ? (
          <span className={css.number}>{step.n}</span>
        ) : (
          <>
            <span className={css.number}>{step.n}</span>
            {step.name}
          </>
        )
      }
      label={shut ? undefined : placeholders > 0 ? `${step.meta} · ${String(placeholders)} unwritten` : step.meta}
      onClick={onOpen}
    />
  );
}

function tabsFor(rail: StepRail, cross: { id: string; name: string; level: number }[], stepId: string) {
  if (stepId === CROSS_STEP) {
    return cross.map((tab) => ({ id: tab.id, name: tab.name, done: false }));
  }
  const step =
    rail.steps.find((entry) => entry.key === stepId) ??
    rail.steps.find((entry) => entry.id === stepId);
  return step ? step.tabs : [];
}

export type { BandEntry };
