import { useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Menu, MenuItem } from "@blueprintjs/core";

import type { SourceKind, StepEntry } from "@/ui/data/port";
import { useIntake, usePathway, useProject, useSteps } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { Region } from "@/ui/components/Region";
import { SourceOverlay } from "@/ui/components/SourceOverlay";
import { TabStrip } from "@/ui/components/TabStrip";
import { tabPath, withSearch } from "@/ui/routes";

import css from "@/ui/screens/ProjectScreen.module.css";

/** The project: band, pathway line, step list, the tabs of the step in hand,
 *  and the panel the element screen renders into. It sits inside the same
 *  frame as every other page, so the section pane is reachable from here too.
 *
 *  The rail lists parents only. A step is a phase; its tabs are the parts of
 *  that phase. Nothing appears in both places.
 *
 *  Locking here is a sequence lock and never a credential one: §7.2 requires
 *  every step, tab and row to be workable without agency credentials, and a
 *  step is greyed only while the inputs that populate it do not exist. */
export function ProjectScreen() {
  const params = useParams();
  const projectRef = params.projectRef ?? "";
  const stepId = params.stepId ?? "";
  const tabId = params.tabId ?? "";
  const navigate = useNavigate();
  const { search } = useLocation();
  const project = useProject();
  const intake = useIntake();
  const pathway = usePathway();
  const steps = useSteps();
  const [railShut, setRailShut] = useState(false);
  const [source, setSource] = useState<SourceKind | null>(null);

  const go = (path: string) => navigate(withSearch(path, search));

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
        <Region region={intake} onSource={setSource}>
          {(state) => (state.complete ? null : <p className={css.lockNote}>{state.note}</p>)}
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
                    className={
                      css.step +
                      " " +
                      css[step.mark] +
                      (step.locked ? " " + css.locked : "") +
                      (step.shared ? " " + css.shared : "")
                    }
                    disabled={step.locked}
                    title={step.locked ? step.lockedReason : step.name}
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
                    onClick={
                      step.locked
                        ? undefined
                        : () => go(tabPath(projectRef, step.id, step.tabs[0]?.id ?? tabId))
                    }
                  />
                ))}
              </Menu>
            )}
          </Region>
        </aside>

        <section className={css.panel}>
          <Region region={steps} onSource={setSource}>
            {(list) => (
              <TabStrip
                id="element-tabs"
                tabs={tabsFor(list, stepId)}
                selected={tabId}
                onSelect={(next) => go(tabPath(projectRef, stepId, next))}
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
  const step = steps.find((entry) => entry.id === stepId);
  return step ? step.tabs : [];
}
