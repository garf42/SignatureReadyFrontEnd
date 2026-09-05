import type { SourceRef } from "@/ui/data/port";

import css from "@/ui/components/SourceLine.module.css";

/** Plain monospace, never a badge. Where a value came from, stated on the line
 *  under it. It is a note and not a link: there is no overlay behind it. */
export function SourceLine({ source }: { source: SourceRef }) {
  return (
    <p className={css.line}>
      {source.lead}
      <span className={css.label}>{source.label}</span>
    </p>
  );
}
