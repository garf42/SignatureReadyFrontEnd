import type { SourceKind, SourceRef } from "@/ui/data/port";

import css from "@/ui/components/SourceLine.module.css";

/** Plain monospace, never a badge. The link opens the primary source in an
 *  overlay; the officer never leaves the page to check where a value came from. */
export function SourceLine({
  source,
  onOpen
}: {
  source: SourceRef;
  onOpen: (kind: SourceKind) => void;
}) {
  return (
    <p className={css.line}>
      {source.lead}
      <a
        href={"#" + source.kind}
        onClick={(event) => {
          event.preventDefault();
          onOpen(source.kind);
        }}
      >
        {source.label}
      </a>
    </p>
  );
}
