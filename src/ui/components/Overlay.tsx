import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Dialog } from "@blueprintjs/core";

import css from "@/ui/components/Overlay.module.css";

/** Every overlay in the application opens through here, and takes its padding
 *  from here too, so the four of them cannot drift apart.
 *
 *  Blueprint centres a dialog in the viewport, which is the right answer in a
 *  browser window and the wrong one in a frame: this app is embedded, and a
 *  frame is often taller than the part of it the reader can see. Centred in
 *  the frame, a dialog opened from halfway down the page lands above the
 *  reader's view. Capping its height is not enough on its own — it has to
 *  bring itself to where the reader is looking. */
export function Overlay({
  title,
  onClose,
  wide = false,
  footer,
  children
}: {
  title: string;
  onClose: () => void;
  /** A sheet of paper, not a dialog. The shared width is set for a dialog and
   *  is the right answer for four of the five overlays; a document viewer has
   *  to hold a page at its own width or it is not showing the document, it is
   *  showing a narrower thing with the same words in it. */
  wide?: boolean;
  /** The left of the bar; the buttons passed as `actions` sit on the right. */
  footer?: ReactNode;
  children: ReactNode;
}) {
  const seen = useRef(false);

  useEffect(() => {
    if (seen.current) {
      return;
    }
    seen.current = true;
    const frame = window.requestAnimationFrame(() => {
      /* Guarded because the callback runs a frame later, outside any caller's
         reach: a throw here is an unhandled exception rather than a failed
         render, and jsdom does not implement scrollIntoView at all. Centring
         the sheet is a courtesy — never a reason to take the page down. */
      const dialog = document.querySelector(".bp6-dialog");
      if (dialog instanceof HTMLElement && typeof dialog.scrollIntoView === "function") {
        dialog.scrollIntoView({ block: "center", inline: "nearest" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <Dialog
      isOpen
      title={title}
      onClose={onClose}
      className={wide ? css.wide : undefined}
    >
      <div className={css.body}>{children}</div>
      {footer ? <div className={css.footer}>{footer}</div> : null}
    </Dialog>
  );
}

/** The right-hand end of an overlay's footer bar. */
export function OverlayActions({ children }: { children: ReactNode }) {
  return <div className={css.buttons}>{children}</div>;
}
