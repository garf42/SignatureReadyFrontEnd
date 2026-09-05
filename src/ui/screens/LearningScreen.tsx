import { useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "@blueprintjs/core";

import type { LearningTile, SourceKind } from "@/ui/data/port";
import { useLearning, useUnresolved } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { PageHead } from "@/ui/components/PageHead";
import { Region } from "@/ui/components/Region";
import { SourceOverlay } from "@/ui/components/SourceOverlay";

import css from "@/ui/screens/LearningScreen.module.css";
import shared from "@/ui/screens/Support.module.css";

/** §6.5, Level 3. Tiles 1 and 2 sit across the top as status; the rest are a
 *  grid, each drilling into a list. No sparklines over series that do not
 *  exist — every figure here is one measurement, not a trend. */
export function LearningScreen() {
  const learning = useLearning();
  const lanes = useUnresolved();
  const [source, setSource] = useState<SourceKind | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setOpen((state) => ({ ...state, [id]: !state[id] }));

  return (
    <AppFrame current="learning">
      <div className={shared.stack}>
        <Region region={learning} onSource={setSource}>
          {(page) => (
            <>
              <PageHead title={page.heading} help={page.help} />

              <div className={css.status}>
                {page.status.map((tile) => (
                  <Tile key={tile.id} tile={tile} open={!!open[tile.id]} onToggle={toggle} />
                ))}
              </div>

              <div className={css.grid}>
                {page.tiles.map((tile) => (
                  <Tile key={tile.id} tile={tile} open={!!open[tile.id]} onToggle={toggle}>
                    {tile.id === "unresolved" ? (
                      <Region region={lanes} onSource={setSource}>
                        {(rows) => (
                          <>
                            {rows.map((lane) => (
                              <div key={lane.lane} className={css.lane}>
                                <p className={css.laneName}>{lane.lane}</p>
                                <p className={css.detailLine}>{lane.reason}</p>
                                <p className={shared.meta}>
                                  {lane.correct
                                    ? "Correct: the distinction working, not a failure."
                                    : "A defect. Report it."}
                                </p>
                              </div>
                            ))}
                          </>
                        )}
                      </Region>
                    ) : null}
                  </Tile>
                ))}
              </div>

              <div className={shared.notes}>
                <p className={shared.notesTitle}>Named, and not built here</p>
                <p className={shared.note}>{page.notBuilt}</p>
              </div>
            </>
          )}
        </Region>
      </div>

      {source ? <SourceOverlay kind={source} onClose={() => setSource(null)} /> : null}
    </AppFrame>
  );
}

function Tile({
  tile,
  open,
  onToggle,
  children
}: {
  tile: LearningTile;
  open: boolean;
  onToggle: (id: string) => void;
  children?: ReactNode;
}) {
  return (
    <div className={css.tile} data-tone={tile.tone}>
      <button
        type="button"
        className={css.tileHead}
        aria-expanded={open}
        onClick={() => onToggle(tile.id)}
      >
        <span className={css.tileTitle}>
          <span>{tile.title}</span>
          <span className={css.glyph}>
            <Icon icon={open ? "minus" : "plus"} />
          </span>
        </span>
        <span className={css.figure}>{tile.figure}</span>
        <span className={css.unit}>{tile.unit}</span>
        <span className={css.tileNote}>{tile.note}</span>
      </button>
      {open ? (
        <div className={css.detail}>
          {tile.detail.map((line) => (
            <p key={line} className={css.detailLine}>
              {line}
            </p>
          ))}
          {children}
        </div>
      ) : null}
    </div>
  );
}
