import { Button } from "@blueprintjs/core";
import { Link, useLocation } from "react-router-dom";

import type { DocumentPreview } from "@/ui/data/port";
import { Overlay, OverlayActions } from "@/ui/components/Overlay";
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
      <p className={css.says}>{preview.says}</p>
      <p className={css.count}>
        {filled} of {preview.sections.length} sections submitted
      </p>

      <div className={css.page}>
        {preview.sections.map((section, i) => (
          <section key={section.id} className={css.section} data-state={section.state}>
            <header className={css.head}>
              <span className={css.order}>{i + 1}</span>
              <span className={css.name}>{section.name}</span>
              <span className={css.ref}>{section.ref}</span>
            </header>
            {section.template ? (
              <pre className={css.template}>{section.template}</pre>
            ) : (
              <p className={css.notemplate}>
                No layout yet — the rule&rsquo;s own words for this item are not in the build.
              </p>
            )}
            {/* The one act a section offers: go to where its words are written.
                Never a field — see the note above the component. */}
            <p className={css.authored}>
              {section.state === "filled" ? "Submitted at" : "Written at"}{" "}
              <Link
                to={withSearch(tabPath(projectRef, section.stepKey, section.tabId), search)}
                onClick={onClose}
              >
                {section.tabId}
              </Link>
            </p>
          </section>
        ))}
      </div>

      <p className={css.layoutNote}>
        Arrangement is not wired yet. Reordering sections, page breaks, and dropping in a figure or
        a table are all permitted by the rule and none of them is built — so what you see is the
        order the element list is frozen in, which is one of the arrangements allowed and not the
        required one.
      </p>
    </Overlay>
  );
}
