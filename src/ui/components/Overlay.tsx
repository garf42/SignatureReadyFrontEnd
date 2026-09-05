import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Dialog } from "@blueprintjs/core";

/** Every overlay in the application opens through here.
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
  children
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const seen = useRef(false);

  useEffect(() => {
    if (seen.current) return;
    seen.current = true;
    const frame = window.requestAnimationFrame(() => {
      const dialog = document.querySelector(".bp6-dialog");
      dialog?.scrollIntoView({ block: "center", inline: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <Dialog isOpen title={title} onClose={onClose}>
      {children}
    </Dialog>
  );
}
