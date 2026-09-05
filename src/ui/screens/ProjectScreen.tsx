import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Menu, MenuItem, Tab, Tabs } from "@blueprintjs/core";

import type { SourceKind, StepEntry } from "@/ui/data/port";
import { CROSS_CUTTING, usePathway, useProject, useSteps } from "@/ui/data/port";
import { Region } from "@/ui/components/Region";
import { SourceOverlay } from "@/ui/components/SourceOverlay";
import { CROSS_STEP, INBOX, crossPath, tabPath, withSearch } from "@/ui/routes";

import css from "@/ui/screens/ProjectScreen.module.css";

/** The shell: wordmark, project band, pathway line, step list, tab bar, and the
 *  panel the element screen renders into.
 *
 *  Every step is reachable. §7.2 requires the build to be walkable end to end
 *  as a regular user — every step, tab and row workable without agency
 *  credentials — so a step that is waiting reads as waiting and still opens.
 */
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

  return (
    <main className={css.screen}>
      <header className={css.top}>
        <button
          type="button"
          className={css.paneToggle}
          aria-label={railShut ? "Show the steps" : "Hide the steps"}
          onClick={() => setRailShut((v) => !v)}
        >
          {railShut ? "»" : "«"}
        </button>
        <Link className={css.wordmark} to={withSearch(INBOX, search)}>
          SignatureReady
        </Link>
      </header>

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
        <aside className={css.rail}>
          <button type="button" className={css.railHead} onClick={() => setRailShut((v) => !v)}>
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

          <button type="button" className={css.railHead} disabled>
            <span>{railShut ? "" : "Across the project"}</span>
          </button>
          <Menu>
            {CROSS_CUTTING.map((tab) => (
              <MenuItem
                key={tab.id}
                className={css.step + (stepId === CROSS_STEP && tabId === tab.id ? " " + css.active : "")}
                text={railShut ? "·" : tab.name}
                onClick={() => go(crossPath(projectRef, tab.id))}
              />
            ))}
          </Menu>
        </aside>

        <section className={css.panel}>
          <Region region={steps} onSource={setSource}>
            {(list) => (
              <div className={css.tabs}>
                <Tabs
                  id="element-tabs"
                  selectedTabId={tabId}
                  onChange={(next) =>
                    go(
                      stepId === CROSS_STEP
                        ? crossPath(projectRef, String(next))
                        : tabPath(projectRef, stepId, String(next))
                    )
                  }
                >
                  {tabsFor(list, stepId).map((tab) => (
                    <Tab
                      key={tab.id}
                      id={tab.id}
                      title={
                        <>
                          {tab.name}
                          {tab.done ? <span className={css.tabDone}>✓</span> : null}
                        </>
                      }
                    />
                  ))}
                </Tabs>
              </div>
            )}
          </Region>
          <div className={css.panelBox}>
            <Outlet />
          </div>
        </section>
      </div>

      {source ? <SourceOverlay kind={source} onClose={() => setSource(null)} /> : null}
    </main>
  );
}

function tabsFor(steps: StepEntry[], stepId: string) {
  if (stepId === CROSS_STEP) {
    return CROSS_CUTTING.map((tab) => ({ id: tab.id, name: tab.name, done: false }));
  }
  const step = steps.find((entry) => entry.id === stepId);
  return step ? step.tabs : [];
}
