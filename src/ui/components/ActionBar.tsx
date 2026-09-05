import { Button } from "@blueprintjs/core";

import type { SourceKind, SubmitBar } from "@/ui/data/port";
import { SourceLine } from "@/ui/components/SourceLine";

import css from "@/ui/components/ActionBar.module.css";

/** One action per panel. When it is unavailable the reason sits on the left of
 *  the same bar, with a link to where it resolves. */
export function ActionBar({
  bar,
  submitted,
  onToggle,
  onSource
}: {
  bar: SubmitBar;
  submitted: boolean;
  onToggle: () => void;
  onSource: (kind: SourceKind) => void;
}) {
  return (
    <div className={css.bar}>
      <div className={css.left}>
        {bar.source ? <SourceLine source={bar.source} onOpen={onSource} /> : null}
        {bar.note ? (
          <p className={css.meta}>
            {bar.note}
            {bar.destination ? (
              <>
                {" · "}
                <a href={bar.destination.href}>{bar.destination.label}</a>
              </>
            ) : null}
          </p>
        ) : null}
      </div>
      <Button
        className={submitted ? css.secondary : css.primary}
        disabled={!bar.enabled}
        onClick={onToggle}
      >
        {submitted ? bar.undoLabel : bar.label}
      </Button>
    </div>
  );
}
