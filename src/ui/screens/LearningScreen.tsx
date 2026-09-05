import { useState } from "react";
import type { ReactNode } from "react";

import type { LearningTile, SourceKind } from "@/ui/data/port";
import { PAGES, useLearning, useUnresolved } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { PageHead } from "@/ui/components/PageHead";
import { Region } from "@/ui/components/Region";
import { SourceOverlay } from "@/ui/components/SourceOverlay";

import css from "@/ui/screens/LearningScreen.module.css";
import shared from "@/ui/screens/Support.module.css";

/** §6.5, Level 3. One measurement per row, top to bottom: the figure against a
 *  fixed left edge, and beside it the prose that qualifies it.
 *
 *  Nothing here collapses. These are eight facts about the build, all of them
 *  short, and hiding them behind a control only made a reader work to find out
 *  that a zero is honest. §6.5 suggested a grid; §6 leaves layout to the
 *  builder, and rows keep the figures on one scanline. No sparklines: there
 *  are no series behind these numbers. */
export function LearningScreen() {
  const learning = useLearning();
  const lanes = useUnresolved();
  const [source, setSource] = useState<SourceKind | null>(null);

  return (
    <AppFrame current="learning">
      <div className={shared.stack}>
        <PageHead title={PAGES.learning.title} help={PAGES.learning.help} />

        <Region region={learning} onSource={setSource}>
          {(page) => (
            <>
              <div className={css.rows}>
                {[...page.status, ...page.tiles].map((tile) => (
                  <Row key={tile.id} tile={tile}>
                    {tile.id === "unresolved" ? (
                      <Region region={lanes} onSource={setSource}>
                        {(rows) => (
                          <div className={css.lanes}>
                            {rows.map((lane) => (
                              <div key={lane.lane} className={css.lane}>
                                <p className={css.laneName}>{lane.lane}</p>
                                <p className={css.detailLine}>{lane.reason}</p>
                                <p className={css.laneMeta}>
                                  {lane.correct
                                    ? "Correct: the distinction working, not a failure."
                                    : "A defect. Report it."}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </Region>
                    ) : null}
                  </Row>
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

function Row({ tile, children }: { tile: LearningTile; children?: ReactNode }) {
  return (
    <div className={css.row} data-tone={tile.tone}>
      <div className={css.metric}>
        <p className={css.title}>{tile.title}</p>
        <p className={css.figure}>{tile.figure}</p>
        <p className={css.unit}>{tile.unit}</p>
      </div>
      <div className={css.prose}>
        <p className={css.note}>{tile.note}</p>
        {tile.detail.map((line) => (
          <p key={line} className={css.detailLine}>
            {line}
          </p>
        ))}
        {children}
      </div>
    </div>
  );
}
