import type { LearningTile } from "@/ui/data/port";
import { PAGES, usePort } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { PageHead } from "@/ui/components/PageHead";
import { Region } from "@/ui/components/Region";

import css from "@/ui/screens/LearningScreen.module.css";
import shared from "@/ui/screens/Support.module.css";

/** §6.5, Level 3 — the feedback-loop instrument.
 *
 *  It used to be one flat grid of eight cards, and two of them were not
 *  measurements at all: they said the mechanism the other six depend on is not
 *  connected. Rendered identically, "nothing is learning" read as one more
 *  number beside six numbers it invalidates.
 *
 *  A loop has three legs — the system PROPOSES, a person CORRECTS, and the
 *  correction IMPROVES what comes next — and this build performs the first two
 *  on every drafted row and keeps neither. So the page states that once, in
 *  words, and then reports each leg with what holds it open. Every figure says
 *  whether it was measured or is waiting, because a measured zero and a count
 *  that never ran are not the same fact and were drawn the same way. */
export function LearningScreen() {
  const learning = usePort().useLearning();

  return (
    <AppFrame current="learning">
      <div className={shared.stack}>
        <PageHead title={PAGES.learning.title} help={PAGES.learning.help} />

        <Region region={learning} variant="page">
          {(page) => (
            <>
              <section className={css.standing}>
                <h2 className={css.headline}>{page.headline}</h2>
                <p className={css.says}>{page.says}</p>
                {page.trend ? <p className={css.trend}>{page.trend}</p> : null}
              </section>

              {page.legs.map((leg) => (
                <section key={leg.id} className={css.leg} data-state={leg.state}>
                  <header className={css.legHead}>
                    <h3 className={css.legName}>{leg.name}</h3>
                    <p className={css.legSays}>{leg.says}</p>
                    {/* What holds it open, named. Every other surface in this
                        build names the address it waits on; this page reported
                        a blockage and never said what it was. */}
                    {leg.breaks ? <p className={css.breaks}>{leg.breaks}</p> : null}
                  </header>
                  <div className={css.grid}>
                    {leg.tiles.map((tile) => (
                      <Card key={tile.id} tile={tile} />
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </Region>
      </div>
    </AppFrame>
  );
}

function Card({ tile }: { tile: LearningTile }) {
  return (
    <div className={css.card} data-tone={tile.tone} data-state={tile.state}>
      <p className={css.title}>{tile.title}</p>
      <p className={css.figure}>{tile.figure}</p>
      <p className={css.unit}>{tile.unit}</p>
      <p className={css.note}>{tile.note}</p>
      {/* Measured on a date, or waiting on a named thing. Never neither: a
          figure with no provenance is a figure a reader has to trust. */}
      {tile.state === "measured" ? (
        <p className={css.when}>Counted {tile.measuredOn}</p>
      ) : (
        <p className={css.waiting}>Not counted — {tile.waitingOn}</p>
      )}
    </div>
  );
}
