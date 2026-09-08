import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Icon, Menu, MenuItem } from "@blueprintjs/core";

import type { Assembly, BandEntry, BandRef, StepEntry, StepRail } from "@/ui/data/port";
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
  const { pathname, search } = useLocation();
  const port = usePort();
  const project = port.useProject(projectRef);
  const levels = port.useLevels(projectRef);
  const rail = port.useSteps(projectRef, stepId);
  const [railWidth, setRailWidth] = useState(RAIL_DEFAULT);
  /* Both open. The three sentences are what teach a non-specialist which review
     they are doing, and a reader who has to find them is a reader who was not
     told. Closing is theirs to choose; it is not the state they arrive in. */
  const [levelOpen, setLevelOpen] = useState(true);
  const [hereOpen, setHereOpen] = useState(true);
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
              {/* The top line is the one that has to be read, so it is what
                  stays when the rest is put away — and it doubles as the
                  control, in the same chevron the rail's bands use. */}
              <Fold
                open={levelOpen}
                onToggle={() => setLevelOpen((v) => !v)}
                head={
                  <span className={css.levelSays}>
                    {history.plain ? history.plain.says : history.note}
                  </span>
                }
              >
                {history.plain ? (
                  <>
                    <p className={css.levelWhy}>{history.plain.because}</p>
                    <p className={css.levelEnds}>{history.plain.ends}</p>
                  </>
                ) : null}
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
              </Fold>
            </div>
          )}
        </Region>

        {/* Where you are standing, and what this step is for. Authored per step
            on `StepSpec.purpose`, so it is unique to the step and no screen has
            to synthesise a description out of the step's name. */}
        <Region region={rail}>
          {(value: StepRail) => {
            const here = stepIn(value, stepId);
            /* Counted inside the step's own band, so it agrees with the rail.
               The two sequences are separated by the seam, and the seam names
               the level the second one belongs to. */
            const own = here
              ? value.steps.filter((step) => bandId(step.band) === bandId(here.band))
              : [];
            return here ? (
              <div className={css.here}>
                <Fold
                  open={hereOpen}
                  onToggle={() => setHereOpen((v) => !v)}
                  head={
                    <span className={css.hereWhere}>
                      Step {String(here.n)} of {String(own.length)} · {here.name}
                    </span>
                  }
                >
                  <p className={css.herePurpose}>{here.purpose}</p>
                </Fold>
              </div>
            ) : null;
          }}
        </Region>
      </div>

      <div
        className={css.split}
        style={{ "--rail-width": `${String(railWidth)}px` } as CSSProperties}
      >
        <aside className={css.rail} aria-label="Steps">

          <Region region={rail}>
            {(value: StepRail) => {
              const episodes = value.bands.filter(
                (entry) => entry.band.kind === "episode"
              ).length;
              return (
              <>
                {value.bands
                  .filter((band) => band.band.kind !== "cross")
                  .map((band, index) => {
                    const key = bandId(band.band);
                    /* A band header earns its place only where there is
                       something to tell it apart FROM: two or more levels of
                       review, one of them superseded and read-only. The shared
                       band never qualifies — there is only ever one of it, it
                       is always the same three steps, and "Every review · 3
                       steps · intake, the threshold determination and the level
                       of review" restated the steps listed directly beneath it.
                       So the shared band is never headed, and the level bands
                       are headed only once there is more than one. */
                    const banded = episodes > 1 && band.band.kind === "episode";
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
                      <Fragment key={key}>
                      {index === 1 ? (
                        <AssembleGate
                          assembly={value.assembly}
                          banded={banded}
                          onAssembled={() => go(pathname)}
                        />
                      ) : null}
                      <section className={css.bandGroup} data-status={band.status}>
                        {banded ? (
                          <button
                            type="button"
                            className={css.bandHeader}
                            aria-expanded={open}
                            onClick={() => setOpenBands((state) => ({ ...state, [key]: !open }))}
                          >
                            {/* The chevron. These headers nest a band's steps
                                and collapse them, and nothing on them said so —
                                a title with a summary under it reads as a
                                caption, not as a control. It turns with the
                                band, so its direction is the state. */}
                            <Icon
                              className={css.bandChevron}
                              icon={open ? "chevron-down" : "chevron-right"}
                              size={12}
                            />
                            {/* The same two lines the seam sets on a project
                                that has occupied one level, so an escalated
                                proposal reads like an ordinary one with more
                                than one of them rather than like another
                                screen. */}
                            <span className={css.bandWords}>
                              {band.overline ? (
                                <span className={css.gateOverline}>{band.overline}</span>
                              ) : null}
                              <span className={css.gateLevel}>{band.heading}</span>
                              <span className={css.bandSummary}>{band.summary}</span>
                            </span>
                          </button>
                        ) : null}
                        {open ? (
                          <Menu>
                            {steps.map((step) => (
                              <StepItem
                                key={step.key}
                                step={step}
                                active={step.key === stepId || step.id === stepId}
                                onOpen={() =>
                                  go(tabPath(projectRef, step.key, step.tabs[0]?.id ?? tabId))
                                }
                              />
                            ))}
                          </Menu>
                        ) : null}
                      </section>
                      </Fragment>
                    );
                  })}
                {/* The gate belongs IN the break, not after the rail, so it
                    is rendered before the first episode band above. Where a
                    level has not been fixed at all there is no second band, so
                    it is drawn here instead — it is the only thing that says
                    what the shared steps are leading to. */}
                {value.bands.filter((entry) => entry.band.kind === "episode").length === 0 ? (
                  <AssembleGate
                    assembly={value.assembly}
                    banded={false}
                    onAssembled={() => go(pathname)}
                  />
                ) : null}
              </>
              );
            }}
          </Region>

          {/* Nothing here but steps. The rail used to carry an eleventh entry
              — "across the project" — holding ten tabs that belonged to no step
              and no level of review. Those duties are inside the steps they
              condition now, so the rail is the pathway and nothing else. */}
        </aside>

        <RailHandle width={railWidth} onWidth={setRailWidth} />

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
  active,
  onOpen
}: {
  step: StepEntry;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <MenuItem
      className={css.step + " " + css[active ? "active" : step.mark]}
      title={step.waitingOn ? `${step.name} — waits on ${step.waitingOn}` : step.name}
      /* The number is an address and is always shown — swapping it for the
         tick cost the reader the one thing they use to find a step again. The
         tick goes to the right edge instead, in the slot the rail already had
         for a step's own word, so the row still gains no column. */
      text={
        <>
          <span className={css.number}>{step.n}</span>
          {step.name}
          {step.done ? <span className={css.only}> — done</span> : null}
        </>
      }
      labelElement={
        (
          <>
            {step.meta}
            {/* The claim is exact and comes from the same rows the panel
                renders: every tab in this step has nothing outstanding and no
                text missing from the build. An unticked step is therefore
                never one this screen merely could not read. */}
            {step.done ? (
              <span className={css.tick} data-done="yes">
                ✓
              </span>
            ) : null}
          </>
        )
      }
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


/** The act at the seam between the shared steps and the pathway steps.
 *
 *  WHY A BUTTON AND NOT A STATE FLIP. Steps 3 and beyond used to appear: the
 *  level history gained an entry and the rail grew. That reads as a toggle, and
 *  the work at that boundary is the opposite of a toggle — the documents the
 *  level requires get opened, the references they incorporate get pulled, and
 *  drafting runs against everything answered above. It takes real time, and a
 *  transition a person cannot see themselves start, and cannot see running, is
 *  one they cannot tell apart from a hang.
 *
 *  `waiting` names the step it waits on rather than being a grey button with no
 *  stated reason. `running` is local to this component and lasts until the port
 *  answers with steps — the backend owns whether a review is assembled, and the
 *  only thing the screen owns is saying that it asked. */
function AssembleGate({
  assembly,
  banded,
  onAssembled
}: {
  assembly: Assembly;
  /* On an escalated proposal each band already carries its own level heading,
     and a seam that also names one would name the LIVE level while sitting
     above a superseded band. There it stays the quiet line. */
  banded: boolean;
  onAssembled: () => void;
}) {
  const [running, setRunning] = useState(false);
  const state = running ? "running" : assembly.state;

  return (
    <section className={css.gate} data-state={state}>
      {state === "done" ? (
        /* A HEADING, not a footnote. This is the boundary of the whole page:
           above it, the three steps every review has; below it, the steps this
           determination created and nothing else. Naming the level here is the
           only place that boundary gets said, and the steps under it read as
           belonging to it rather than as a continuation of the list above. */
        <>
          {assembly.level && !banded ? (
            <>
              <p className={css.gateOverline}>Level of review</p>
              <h2 className={css.gateLevel}>{assembly.level}</h2>
            </>
          ) : null}
          <p className={css.gateDone}>{assembly.says}</p>
        </>
      ) : state === "running" ? (
        <>
          {/* Announced, not merely animated: a spinner is not information to a
              reader who cannot see it, and the wait is the whole point. */}
          <p className={css.gateRunning} role="status" aria-live="polite">
            Assembling the review
            <span className={css.dots} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </p>
          <p className={css.gateSays}>
            Opening the documents, pulling the references they incorporate, and drafting from the
            answers above.
          </p>
        </>
      ) : (
        <>
          <Button
            className={css.gateButton}
            intent={state === "ready" ? "primary" : "none"}
            disabled={state !== "ready"}
            onClick={() => {
              setRunning(true);
              /* Long enough to be seen for what it is. The real wait is the
                 backend's; this is the demo standing in for it. */
              window.setTimeout(() => {
                setRunning(false);
                onAssembled();
              }, 1400);
            }}
          >
            {assembly.label}
          </Button>
          <p className={css.gateSays}>{assembly.says}</p>
          {assembly.waitingOn ? (
            <p className={css.gateWaiting}>Waiting on {assembly.waitingOn}</p>
          ) : null}
        </>
      )}
    </section>
  );
}


/* The rail's width, in pixels. Wide enough for the longest step name at the
   default, and clamped so a drag can neither hide the steps nor crowd out the
   panel they open into. */
const RAIL_MIN = 120;
const RAIL_DEFAULT = 280;
const RAIL_MAX = 420;

const clampRail = (px: number) => Math.min(RAIL_MAX, Math.max(RAIL_MIN, px));

/** The divider between the rail and the panel, dragged to resize.
 *
 *  REPLACES A COLLAPSE TOGGLE. That button had two states and the reader
 *  wanted neither of them: full width crowds the panel on a narrow screen, and
 *  collapsed-to-icons hides the step names, which are the only thing the rail
 *  is for. A drag gives every width between, and it is the same gesture people
 *  already use on every editor pane they have ever met.
 *
 *  Keyboard reaches it too, and this is not decoration: a divider that only
 *  answers to a pointer is a control half this application's users cannot
 *  operate. Arrows nudge, Home and End go to the stops, and the element
 *  announces itself as a separator with its current and limit values. */
function RailHandle({ width, onWidth }: { width: number; onWidth: (px: number) => void }) {
  const bar = useRef<HTMLButtonElement>(null);
  const [dragging, setDragging] = useState(false);

  const move = useCallback(
    (clientX: number) => {
      const left = bar.current?.parentElement?.getBoundingClientRect().left ?? 0;
      onWidth(clampRail(clientX - left));
    },
    [onWidth]
  );

  useEffect(() => {
    if (!dragging) {
      return;
    }
    const onMove = (event: PointerEvent) => {
      event.preventDefault();
      move(event.clientX);
    };
    const stop = () => {
      setDragging(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging, move]);

  /* role="slider" on a button, not role="separator" on a div. The ARIA
     window-splitter pattern is a focusable separator that "behaves like a
     slider", and of the two halves the SLIDER half is the one that carries
     what a user needs told: a value, its limits, and arrow keys that change
     it. A plain separator announces a line. Horizontal because the value moves
     along x — the divider is what stands vertically, not the scale. */
  return (
    <button
      ref={bar}
      type="button"
      role="slider"
      aria-label="Width of the steps pane"
      aria-valuenow={width}
      aria-valuemin={RAIL_MIN}
      aria-valuemax={RAIL_MAX}
      className={css.handle}
      data-dragging={dragging ? "yes" : "no"}
      onPointerDown={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDoubleClick={() => {
        onWidth(RAIL_DEFAULT);
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 48 : 16;
        if (event.key === "ArrowLeft") {
          onWidth(clampRail(width - step));
        } else if (event.key === "ArrowRight") {
          onWidth(clampRail(width + step));
        } else if (event.key === "Home") {
          onWidth(RAIL_MIN);
        } else if (event.key === "End") {
          onWidth(RAIL_MAX);
        } else {
          return;
        }
        event.preventDefault();
      }}
    />
  );
}


/** A top line that is also the control, over a body that can be put away.
 *
 *  The same chevron the rail's bands use, turning the same way, because they
 *  are the same act: a reader who has learned it once in the rail should not
 *  have to learn it again six inches above. The head stays whatever the state
 *  is — it is the sentence that has to be read, and hiding it would leave a
 *  collapsed block saying nothing at all. */
function Fold({
  open,
  onToggle,
  head,
  children
}: {
  open: boolean;
  onToggle: () => void;
  head: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={css.fold} data-open={open ? "yes" : "no"}>
      <button type="button" className={css.foldHead} aria-expanded={open} onClick={onToggle}>
        <Icon
          className={css.bandChevron}
          icon={open ? "chevron-down" : "chevron-right"}
          size={12}
        />
        {head}
      </button>
      {open ? <div className={css.foldBody}>{children}</div> : null}
    </div>
  );
}
