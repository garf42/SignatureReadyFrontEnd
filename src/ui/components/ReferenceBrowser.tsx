import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, HTMLTable, InputGroup } from "@blueprintjs/core";

import { usePort } from "@/ui/data/port";
import { Overlay, OverlayActions } from "@/ui/components/Overlay";
import { Region } from "@/ui/components/Region";
import { REFERENCE, withSearch } from "@/ui/routes";

import css from "@/ui/components/ReferenceBrowser.module.css";

/** Light browse over the corpus, opened from an element that is answered by
 *  naming documents rather than by writing prose.
 *
 *  WHY IT IS HERE AND NOT A LINK TO THE REFERENCE PAGE. Incorporation by
 *  reference — 1b.3(g)(2)(i), 1b.6(b)(1), 1b.8(b)(1) — is the one duty on this
 *  page whose answer lives in another page's data, and the officer doing it is
 *  in the middle of an element. Sending them to the reference page to find a
 *  document loses the element they were filling and everything they had not yet
 *  committed. So the corpus comes to them: title, type, rule vintage and
 *  whether the artifact is citable, which is the whole of what deciding
 *  "is this the document?" needs.
 *
 *  DELIBERATELY LIGHT. It filters and it lists. It does not reproduce the
 *  reference page's facets, sorts, warnings or artifact viewer — a second full
 *  implementation of that page is two things to keep in step, and the row that
 *  needs the full picture has a link to it that carries the reader straight to
 *  that document open in the viewer.
 *
 *  Attaching is INERT, like every other action on the project page: nothing in
 *  this build writes. The button is here because the shape of the affordance is
 *  what an FDE is being handed, and an overlay with no attach control does not
 *  say what it is for. */
export function ReferenceBrowser({ onClose }: { onClose: () => void }) {
  const reference = usePort().useReference();
  const { search } = useLocation();
  const [term, setTerm] = useState("");

  return (
    <Overlay
      title="Find a document to incorporate by reference"
      onClose={onClose}
      footer={
        <OverlayActions>
          <Button onClick={onClose}>Close</Button>
        </OverlayActions>
      }
    >
      <p className={css.say}>
        Material incorporated by reference has to be reasonably available for review by potentially
        interested parties — 1b.9(e)(7). That is a fact about the world and not about this list, so
        what is shown here is what the corpus holds, and whether it may be cited.
      </p>

      <InputGroup
        className={css.find}
        leftIcon="search"
        placeholder="Filter by title, type or corpus"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
      />

      <Region region={reference}>
        {(page) => {
          const needle = term.trim().toLowerCase();
          const rows = needle
            ? page.rows.filter((row) =>
                [row.title, row.documentType, row.corpus]
                  .join(" ")
                  .toLowerCase()
                  .includes(needle)
              )
            : page.rows;
          if (rows.length === 0) {
            return <p className={css.none}>Nothing in the corpus matches “{term}”.</p>;
          }
          return (
            <div className={css.scroll}>
              <HTMLTable className={css.table} compact interactive={false}>
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Rule vintage</th>
                    <th>Citable</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className={css.title}>{row.title}</td>
                      <td>{row.documentType}</td>
                      <td className={css.mono}>{row.ruleVintage}</td>
                      <td data-citable={row.citable}>{row.citable}</td>
                      <td className={css.acts}>
                        <Button
                          small
                          disabled
                          title="Nothing in this build writes. The FDE wires this to the incorporation record."
                        >
                          Incorporate this
                        </Button>
                        <Link
                          className={css.open}
                          to={withSearch(`${REFERENCE}?view=${row.id}`, search)}
                        >
                          Open in full ›
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </HTMLTable>
            </div>
          );
        }}
      </Region>
    </Overlay>
  );
}
