import { useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Menu, MenuItem } from "@blueprintjs/core";

import type { BandEntry, BandRef, StepEntry, StepRail } from "@/ui/data/port";
import { usePort } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { Region } from "@/ui/components/Region";
import { TabStrip } from "@/ui/components/TabStrip";
import { tabPath, withSearch } from "@/ui/routes";

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
  const [railShut, setRailShut] = useState(false);
  const [openBands, setOpenBands] = useState<Record<string, boolean>>({});

  const go = (path: string) => navigate(withSearch(path, search));
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

        {/* The level line — three sentences and then where you are standing.
            A person who is never told which review they are doing cannot be
            driven to the correct one, and this is what tells them.

            It used to read "Level 1 of 1 · P3 · EA, then FONSI". Every token in
            that is internal vocabulary: the primary user is not a NEPA
            subject-matter expert and has no idea what P3 is. So the three facts
            the determination fixes — what review this is, why it is this one,
            and what it ends in — are said in sentences, with the citation kept
            on the "why" so an expert reading over the shoulder can check it.

            The elimination is stated once, quietly, and never as a set of lanes
            — the reader must not be able to read the decision tree as a menu
            they pick from. */}
        <Region region={levels}>
          {(history) => (
            <div className={css.levelLine} data-level={history.liveSeq === null ? "none" : "set"}>
              {history.plain ? (
                <>
                  <p className={css.levelSays}>{history.plain.says}</p>
                  <p className={css.levelWhy}>{history.plain.because}</p>
                  <p className={css.levelEnds}>{history.plain.ends}</p>
                </>
              ) : (
                <p className={css.levelNote}>{history.note}</p>
              )}
              {history.plain && history.note ? (
                <p className={css.levelNote}>{history.note}</p>
              ) : null}
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
                  The other levels of review are not open to this project.{" "}
                  {history.foreclosed[0].limb} decided it.
                </p>
              ) : null}
            </div>
          )}
        </Region>

        {/* Where you are standing, and what this step is for. Authored per step
            on `StepSpec.purpose`, so it is unique to the step and no screen has
            to synthesise a description out of the step's name. */}
        <Region region={rail}>
          {(value: StepRail) => {
            const here = stepIn(value, stepId);
            /* Counted over the rail as drawn, not over the step's own `n`.
               `n` restarts inside each band, so on an escalated proposal two
               different steps both call themselves 3 — true of the pathway,
               useless as a position. */
            const at = here ? value.steps.indexOf(here) + 1 : 0;
            return here ? (
              <div className={css.here}>
                <p className={css.hereWhere}>
                  Step {String(at)} of {String(value.steps.length)} · {here.name}
                </p>
                <p className={css.herePurpose}>{here.purpose}</p>
              </div>
            ) : null;
          }}
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
            {(value: StepRail) => {
              const episodes = value.bands.filter(
                (entry) => entry.band.kind === "episode"
              ).length;
              return (
              <>
                {value.bands
                  .filter((band) => band.band.kind !== "cross")
                  .map((band) => {
                    const key = bandId(band.band);
                    /* The band header earns its place only when a level has
                       actually been SUPERSEDED and the reader has read-only
                       steps to keep apart from live ones. On the ordinary
                       project it restated the level line directly above it and
                       the step count directly below it, so it was two
                       redundancies in one control — and splitting "Every
                       review" from the level's own steps told the reader
                       nothing they could act on. Banding still exists in the
                       data and is drawn the moment it means something. */
                    const banded = episodes > 1;
                    const steps = value.steps.filter((s) => bandId(s.band) === key);
                    /* A superseded band collapses — but never the one holding
                       the step being read, or the rail would show no entry for
                       where the reader is standing. */
                    const holdsActive = steps.some(
                      (s) => s.key === stepId || s.id === stepId
                    );
                    const open = banded
                      ? (openBands[key] ?? (!band.collapsed || holdsActive))
                      : true;
                    return (
                      <section key={key} className={css.bandGroup} data-status={band.status}>
                        {banded ? (
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
                        ) : null}
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
              );
            }}
          </Region>

          {/* Nothing here but steps. The rail used to carry an eleventh entry
              — "across the project" — holding ten tabs that belonged to no step
              and no level of review. Those duties are inside the steps they
              condition now, so the rail is the pathway and nothing else. */}
        </aside>

        <section className={css.panel}>
          <Region region={rail}>
            {(value) => (
              <TabStrip
                id="element-tabs"
                tabs={tabsFor(value, stepId)}
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

function stepIn(rail: StepRail, stepId: string) {
  return (
    rail.steps.find((entry) => entry.key === stepId) ??
    rail.steps.find((entry) => entry.id === stepId)
  );
}

function tabsFor(rail: StepRail, stepId: string) {
  return stepIn(rail, stepId)?.tabs ?? [];
}

export type { BandEntry };
