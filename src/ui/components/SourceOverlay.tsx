import { Link, useLocation } from "react-router-dom";
import { Button } from "@blueprintjs/core";

import type { SourceKind } from "@/ui/data/port";
import { sourceTitle, usePort } from "@/ui/data/port";
import { Overlay, OverlayActions } from "@/ui/components/Overlay";
import { withSearch } from "@/ui/routes";
import { Region } from "@/ui/components/Region";

import css from "@/ui/components/SourceOverlay.module.css";

/** Mounted only while a source is open, so the hook below runs unconditionally.
 *  Opens through the same wrapper as every other overlay, so it is capped and
 *  scrolls itself into view like the rest. */
export function SourceOverlay({ kind, onClose }: { kind: SourceKind; onClose: () => void }) {
  const source = usePort().useSource(kind);
  const { search } = useLocation();

  return (
    <Overlay
      title={sourceTitle[kind]}
      onClose={onClose}
      footer={
        <OverlayActions>
          <Button className={css.close} onClick={onClose}>
            Close
          </Button>
        </OverlayActions>
      }
    >
      <Region region={source}>
        {(doc) => (
          <>
            <p className={css.reference}>{doc.reference}</p>
            <blockquote className={css.primary}>{doc.primary}</blockquote>
            {/* Goes somewhere. It used to be `href="#full-document"`, which
                is a link that looks live and does nothing — the worst of the
                three states a link can be in.

                The destination is the reference page with this document open in
                its viewer, and it is a router link so the shell is not torn
                down and rebuilt on the way. Nothing new was needed on the port
                for this: the reference page's open document now lives in the
                address, so an address is the whole of the integration. `search`
                is carried through because the review harness's knobs live there
                and dropping them would reset the page a reviewer is standing
                in. */}
            <p className={css.full}>
              <Link to={withSearch(doc.full.href, search)} onClick={onClose}>
                {doc.full.label}
              </Link>
            </p>
          </>
        )}
      </Region>
    </Overlay>
  );
}
