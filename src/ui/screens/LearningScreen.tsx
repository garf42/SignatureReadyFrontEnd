import type { LearningTile } from "@/ui/data/port";
import { PAGES, useLearning } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { PageHead } from "@/ui/components/PageHead";
import { Region } from "@/ui/components/Region";

import css from "@/ui/screens/LearningScreen.module.css";
import shared from "@/ui/screens/Support.module.css";

/** §6.5, Level 3. One card per measurement: the figure, what it counts, and a
 *  sentence saying what it measures. Nothing collapses and nothing is hidden —
 *  these are eight facts about the build and they all fit on the page. */
export function LearningScreen() {
  const learning = useLearning();

  return (
    <AppFrame current="learning">
      <div className={shared.stack}>
        <PageHead title={PAGES.learning.title} help={PAGES.learning.help} />

        <Region region={learning} variant="page">
          {(page) => (
            <div className={css.grid}>
              {[...page.status, ...page.tiles].map((tile) => (
                <Card key={tile.id} tile={tile} />
              ))}
            </div>
          )}
        </Region>
      </div>
    </AppFrame>
  );
}

function Card({ tile }: { tile: LearningTile }) {
  return (
    <div className={css.card} data-tone={tile.tone}>
      <p className={css.title}>{tile.title}</p>
      <p className={css.figure}>{tile.figure}</p>
      <p className={css.unit}>{tile.unit}</p>
      <p className={css.note}>{tile.note}</p>
    </div>
  );
}
