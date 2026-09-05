import { useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Menu, MenuItem } from "@blueprintjs/core";

import type { SourceKind, StepEntry } from "@/ui/data/port";
import { CROSS_CUTTING, usePathway, useProject, useSteps } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { Region } from "@/ui/components/Region";
import { SourceOverlay } from "@/ui/components/SourceOverlay";
import { TabStrip } from "@/ui/components/TabStrip";
import { CROSS_STEP, crossPath, tabPath, withSearch } from "@/ui/routes";

import css from "@/ui/screens/ProjectScreen.module.css";

/** The project: band, pathway line, step list, the tabs of the step in hand,
 *  and the panel the element screen renders into. It sits inside the same
 *  frame as every other page, so the section pane is reachable from here too.
 *
 *  Every step is reachable. §7.2 requires the build to be walkable end to end
 *  as a regular user — every step, tab and row workable without agency
 *  credentials — so a step that is waiting reads as waiting and still opens. */
export function ProjectScreen() {
  const params = useParams();
  const projectRef = params.projectRef ?? "";
  const stepId = params.stepId ?? "";
  const tabId = params.tabId ?? "";
  const navigate = useNavigate();
  const { search } = useLocation();
  const project = useProject();
  const pathway = usePathway();
  const steps = useSteps();
  const [railShut, setRailShut] = useState(false);
  const [source, setSource] = useState<SourceKind | null>(null);

  const go = (path: string) => navigate(withSearch(path, search));
  const onCross = stepId === CROSS_STEP;

  return (
    <AppFrame current="inbox" padded={false}>
      <div className={css.band}>
        <Region region={project} onSource={setSource}>
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
        <Region region={pathway} onSource={setSource}>
          {(state) => (
            <p className={css.pathway} data-pathway={state.pathway ?? "none"}>
              <span className={css.pathwayName}>{state.note}</span>
              <span className={css.pathwayMeta}>
                {state.reachedWhen} · ends in {state.terminalOutput}
              </span>
            </p>
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
          <Region region={steps} onSource={setSource}>
            {(list) => (
              <Menu>
                {list.map((step) => (
                  <MenuItem
                    key={step.id}
                    className={css.step + " " + css[step.mark]}
                    title={step.name}
                    text={
                      railShut ? (
                        <span className={css.number}>{step.n}</span>
                      ) : (
                        <>
                          <span className={css.number}>{step.n}</span>
                          {step.name}
                        </>
                      )
                    }
                    label={railShut ? undefined : step.meta}
                    onClick={() => go(tabPath(projectRef, step.id, step.tabs[0]?.id ?? tabId))}
                  />
                ))}
              </Menu>
            )}
          </Region>

          {/* One entry, not ten. §7.7's tabs are the parts of this parent, and
              they belong in the tab strip with every other step's parts — the
              rail lists parents only, so nothing appears in both places. */}
          <Menu>
            <MenuItem
              className={css.step + " " + css.cross + (onCross ? " " + css.active : "")}
              title="Across the project"
              text={railShut ? <span className={css.number}>§</span> : "Across the project"}
              label={railShut ? undefined : `${CROSS_CUTTING.length} tabs`}
              onClick={() => go(crossPath(projectRef, CROSS_CUTTING[0].id))}
            />
          </Menu>
        </aside>

        <section className={css.panel}>
          <Region region={steps} onSource={setSource}>
            {(list) => (
              <TabStrip
                id="element-tabs"
                tabs={tabsFor(list, stepId)}
                selected={tabId}
                onSelect={(next) =>
                  go(onCross ? crossPath(projectRef, next) : tabPath(projectRef, stepId, next))
                }
              />
            )}
          </Region>
          <div className={css.panelBox}>
            <Outlet />
          </div>
        </section>
      </div>

      {source ? <SourceOverlay kind={source} onClose={() => setSource(null)} /> : null}
    </AppFrame>
  );
}

function tabsFor(steps: StepEntry[], stepId: string) {
  if (stepId === CROSS_STEP) {
    return CROSS_CUTTING.map((tab) => ({ id: tab.id, name: tab.name, done: false }));
  }
  const step = steps.find((entry) => entry.id === stepId);
  return step ? step.tabs : [];
}
