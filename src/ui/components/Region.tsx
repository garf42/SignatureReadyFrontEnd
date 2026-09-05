import type { ReactNode } from "react";
import { Button, Callout } from "@blueprintjs/core";

import type { Action, Region as RegionData, SourceKind, SourceRef } from "@/ui/data/port";
import { SourceLine } from "@/ui/components/SourceLine";

import css from "@/ui/components/Region.module.css";

/** The one component that knows the four states, and the only place any of
 *  them is rendered. Use it for every region on every screen — a new page
 *  inherits the distinction by using this, not by remembering a rule.
 *
 *  Pass a region, never an array: a component handed T[] will reach for
 *  length === 0 and collapse "nothing was found" into "not ready yet".
 */
interface Props<T> {
  region: RegionData<T>;
  /** Passed where the region's sources are citations. Omit it and the source
   *  lines are text. */
  onSource?: (kind: SourceKind) => void;
  onAction?: (id: string) => void;
  /** "page" centres the three non-filled states in the space the list would
   *  have occupied. The states themselves are unchanged — an empty list still
   *  carries the query it ran, because that is what makes absent an answer
   *  rather than a blank. */
  variant?: "inline" | "page";
  children: (value: T) => ReactNode;
}

export function Region<T>({ region, onSource, onAction, variant, children }: Props<T>) {
  const box = css.region + (variant === "page" && region.state !== "filled" ? " " + css.page : "");
  switch (region.state) {
    case "filled":
      return (
        <div className={box} data-state="filled">
          {children(region.value)}
          <Notes sources={region.sources} onSource={onSource} />
          <Actions actions={region.actions} onAction={onAction} />
        </div>
      );

    case "absent":
      return (
        <div className={box} data-state="absent">
          <Callout className={css.box} icon={null}>
            {region.message}
          </Callout>
          <p className={css.meta}>Searched: {region.query}</p>
          <Notes sources={region.sources} onSource={onSource} />
          <Actions actions={region.actions} onAction={onAction} />
        </div>
      );

    case "blocked":
      return (
        <div className={box} data-state="blocked">
          <Callout className={css.box + " " + css.faint} icon={null}>
            {region.message}
          </Callout>
          <p className={css.meta}>
            Waiting on {region.waitingOn}
            {region.destination ? (
              <>
                {" — "}
                <a href={region.destination.href}>{region.destination.label}</a>
              </>
            ) : null}
          </p>
          <Notes sources={region.sources} onSource={onSource} />
          <Actions actions={region.actions} onAction={onAction} />
        </div>
      );

    case "unresolved":
      return (
        <div className={box} data-state="unresolved">
          <Callout className={css.box + " " + css.error} icon={null}>
            {region.message}
          </Callout>
          <p className={css.mark}>
            <span>!</span>
            <span>Error — {region.reason}</span>
          </p>
          <Notes sources={region.sources} onSource={onSource} />
          <Actions actions={region.actions} onAction={onAction} />
        </div>
      );

    default:
      return assertNever(region);
  }
}

function Notes({
  sources,
  onSource
}: {
  sources: SourceRef[];
  onSource?: (kind: SourceKind) => void;
}) {
  if (sources.length === 0) return null;
  return (
    <>
      {sources.map((source, i) => (
        <SourceLine key={source.lead + String(i)} source={source} onOpen={onSource} />
      ))}
    </>
  );
}

export function Actions({
  actions,
  onAction
}: {
  actions: Action[];
  onAction?: (id: string) => void;
}) {
  if (actions.length === 0) return null;
  return (
    <div className={css.actions}>
      {actions.map((action) =>
        action.look === "link" ? (
          <button
            key={action.id}
            type="button"
            className={css.textAction}
            disabled={!action.enabled}
            onClick={() => onAction?.(action.id)}
          >
            {action.label}
          </button>
        ) : (
          <Button
            key={action.id}
            className={css[action.look]}
            disabled={!action.enabled}
            onClick={() => onAction?.(action.id)}
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}

function assertNever(x: never): never {
  throw new Error("unhandled region state: " + JSON.stringify(x));
}
