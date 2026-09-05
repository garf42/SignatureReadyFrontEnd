import type { SourceKind, SourceRef } from "@/ui/data/port";

import css from "@/ui/components/SourceLine.module.css";

/** Plain monospace, never a badge. Where a value came from, stated on the line
 *  under it.
 *
 *  A source with a kind is a citation and opens its primary source, so the
 *  officer never leaves the page to check where a value came from. A source
 *  without one is a name, and a name opens nothing. */
export function SourceLine({
  source,
  onOpen
}: {
  source: SourceRef;
  onOpen?: (kind: SourceKind) => void;
}) {
  const kind = source.kind;
  if (!kind || !onOpen) {
    return (
      <p className={css.line}>
        {source.lead}
        <span className={css.label}>{source.label}</span>
      </p>
    );
  }
  return (
    <p className={css.line}>
      {source.lead}
      <a
        href={"#" + kind}
        onClick={(event) => {
          event.preventDefault();
          onOpen(kind);
        }}
      >
        {source.label}
      </a>
    </p>
  );
}
