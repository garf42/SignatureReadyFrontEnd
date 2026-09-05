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
  footer,
  children
}: {
  title: string;
  onClose: () => void;
  /** The left of the bar; the buttons passed as `actions` sit on the right. */
  footer?: ReactNode;
  children: ReactNode;
}) {
  const seen = useRef(false);

  useEffect(() => {
    if (seen.current) return;
    seen.current = true;
    const frame = window.requestAnimationFrame(() => {
      document.querySelector(".bp6-dialog")?.scrollIntoView({ block: "center", inline: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <Dialog isOpen title={title} onClose={onClose}>
      <div className={css.body}>{children}</div>
      {footer ? <div className={css.footer}>{footer}</div> : null}
    </Dialog>
  );
}

/** The right-hand end of an overlay's footer bar. */
export function OverlayActions({ children }: { children: ReactNode }) {
  return <div className={css.buttons}>{children}</div>;
}
