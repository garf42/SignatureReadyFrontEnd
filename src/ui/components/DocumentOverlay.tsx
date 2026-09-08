import { Button } from "@blueprintjs/core";
import { Link, useLocation } from "react-router-dom";

import type { DocumentPreview } from "@/ui/data/port";
import { Overlay, OverlayActions } from "@/ui/components/Overlay";
import { slots } from "@/ui/data/template";
import { tabPath, withSearch } from "@/ui/routes";

import css from "@/ui/components/DocumentOverlay.module.css";

/** The review document, as it will be laid out.
 *
 *  WHAT THIS IS NOT is the load-bearing part. It is not an editor. An element's
 *  words are what the officer adopted on the step that produces them, and a
 *  document view that let them be changed would create a second, unrecorded
 *  place where a federal document's text comes from — so a section here carries
 *  no field, and its only act is a link back to the one place its words are
 *  authored.
 *
 *  ARRANGEMENT is a different question and the rule is unusually explicit about
 *  it: 1b.3(g)(2), 1b.5(c), 1b.6(b), 1b.7(h) and 1b.8(b) each preface their
 *  contents with "may apply any format they choose". Ordering, page breaks and
 *  figures are therefore AUTHORISED and must never be presented as required.
 *  None of them is wired here — see the note at the foot, which says so on the
 *  surface rather than leaving a reader to discover it by dragging.
 *
 *  A PENDING SECTION IS IN THE DOCUMENT. It is drawn, in order, with nothing in
 *  it — because a section whose tab is still open is a different thing from a
 *  section that will be empty, and a viewer that hid the unfinished ones would
 *  show a shorter document than the one being written. */
export function DocumentOverlay({
  preview,
  projectRef,
  onClose
}: {
  preview: DocumentPreview;
  projectRef: string;
  onClose: () => void;
}) {
  const { search } = useLocation();
  const filled = preview.sections.filter((s) => s.state === "filled").length;

  return (
    <Overlay
      title={preview.title}
      onClose={onClose}
      footer={
        <OverlayActions>
          <Button onClick={onClose}>Close</Button>
        </OverlayActions>
      }
    >
      {/* No preamble. What stood here explained the design — that contents are
          authored elsewhere, that arrangement is permitted — which is reasoning
          for whoever builds this, not information anyone reading the document
          can act on. The absence of a single field says the first, and the
          second belongs in the handoff. What is left is the one line that is
          actually state. */}
      <p className={css.count}>
        {filled} of {preview.sections.length} sections submitted
      </p>

      {/* THE DOCUMENT, not an inspector over it. The templates already carry
          their own numbered headings — "1. PURPOSE AND NEED" — so a second
          heading per section, and a chip naming the document on every
          paragraph, made a cohesive document read as something patched
          together. The document's name is said once, where it starts.

          The citation goes in the margin rather than the flow: provenance a
          reader needs and a document does not have. It is the link back to
          where the words are authored, which is the section's only act. */}
      <div className={css.page}>
        {preview.sections.map((section, i) => (
          <div key={section.id}>
            {i === 0 || preview.sections[i - 1].documentType !== section.documentType ? (
              <h3 className={css.document}>{section.documentType}</h3>
            ) : null}
            <section className={css.section} data-state={section.state}>
              <div className={css.body}>
                {section.template ? (
                  <p className={css.flow}>
                    {/* A marker is where a value arrives, not text anyone
                        wrote, so it is drawn as a slot rather than set as
                        prose — otherwise a reader has to work out which words
                        are the document's and which are the build's. */}
                    {slots(section.template).map((part, at) =>
                      part.slot ? (
                        <span key={at} className={css.slot}>
                          {part.text}
                        </span>
                      ) : (
                        <span key={at}>{part.text}</span>
                      )
                    )}
                  </p>
                ) : (
                  <p className={css.notemplate}>
                    No layout yet — the rule&rsquo;s own words for this item are not in the build.
                  </p>
                )}
              </div>
              <Link
                className={css.cite}
                title={`${section.name} — ${
                  section.state === "filled" ? "submitted" : "written"
                } at ${section.tabId}`}
                to={withSearch(tabPath(projectRef, section.stepKey, section.tabId), search)}
                onClick={onClose}
              >
                {section.ref}
              </Link>
            </section>
          </div>
        ))}
      </div>

    </Overlay>
  );
}


