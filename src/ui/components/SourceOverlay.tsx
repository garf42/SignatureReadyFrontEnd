import { Button } from "@blueprintjs/core";

import type { SourceKind } from "@/ui/data/port";
import { sourceTitle, useSource } from "@/ui/data/port";
import { Overlay } from "@/ui/components/Overlay";
import { Region } from "@/ui/components/Region";

import css from "@/ui/components/SourceOverlay.module.css";

/** Mounted only while a source is open, so the hook below runs unconditionally.
 *  Opens through the same wrapper as every other overlay, so it is capped and
 *  scrolls itself into view like the rest. */
export function SourceOverlay({ kind, onClose }: { kind: SourceKind; onClose: () => void }) {
  const source = useSource(kind);

  return (
    <Overlay title={sourceTitle[kind]} onClose={onClose}>
      <div className={css.body}>
        <Region region={source}>
          {(doc) => (
            <>
              <p className={css.reference}>{doc.reference}</p>
              <blockquote className={css.primary}>{doc.primary}</blockquote>
              <p className={css.full}>
                <a href={doc.full.href}>{doc.full.label}</a>
              </p>
            </>
          )}
        </Region>
      </div>
      <div className={css.footer}>
        <Button className={css.close} onClick={onClose}>
          Close
        </Button>
      </div>
    </Overlay>
  );
}
