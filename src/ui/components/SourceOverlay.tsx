import { Button, Dialog } from "@blueprintjs/core";

import type { SourceKind } from "@/ui/data/port";
import { sourceTitle, useSource } from "@/ui/data/port";
import { Region } from "@/ui/components/Region";

import css from "@/ui/components/SourceOverlay.module.css";

/** Mounted only while a source is open, so the hook below runs unconditionally.
 *  Blueprint owns the focus trap, the portal and the scroll lock. */
export function SourceOverlay({ kind, onClose }: { kind: SourceKind; onClose: () => void }) {
  const source = useSource(kind);

  return (
    <Dialog isOpen title={sourceTitle[kind]} onClose={onClose}>
      <div className={css.body}>
        <Region region={source} onSource={() => undefined}>
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
    </Dialog>
  );
}
