import { useState } from "react";
import { Button, Callout, FileInput, HTMLTable } from "@blueprintjs/core";

import type { ReferenceRow } from "@/ui/data/port";
import { Overlay, OverlayActions } from "@/ui/components/Overlay";
import { TabStrip } from "@/ui/components/TabStrip";

import css from "@/ui/components/LibraryOverlay.module.css";

/** Adding to the library, re-pinning the regulation, and retiring what has gone
 *  stale — the three acts that change what the corpus holds.
 *
 *  NOTHING HERE WRITES, and every act says so where it is offered rather than
 *  once at the top. That is the same rule the expert request follows: a control
 *  that looks live and does nothing is worse than one that says it is not.
 *
 *  THE FILING PROPOSAL IS A PROPOSAL. Reading a document, naming it to the
 *  convention and recording its metadata is a drafting act, and the drafting
 *  lane cannot run in this build — no model has been reachable from it. So the
 *  preview shows what the convention WOULD produce from fields the corpus
 *  already carries, marked as proposed, and never as a name something has. */
const GROUPS = [
  { id: "file", name: "File new documents", done: false },
  { id: "regulation", name: "Re-pin the regulation", done: false },
  { id: "retire", name: "Retire what is stale", done: false }
];

export function LibraryOverlay({
  rows,
  onClose
}: {
  rows: ReferenceRow[];
  onClose: () => void;
}) {
  const [group, setGroup] = useState("file");
  const stale = rows.filter((row) => row.warnings.length > 0);

  return (
    <Overlay
      title="Manage the library"
      onClose={onClose}
      footer={
        <OverlayActions>
          <Button onClick={onClose}>Close</Button>
        </OverlayActions>
      }
    >
      <TabStrip id="library-acts" tabs={GROUPS} selected={group} onSelect={setGroup} />

      {group === "file" ? (
        <div className={css.pane}>
          <p className={css.says}>
            Hand it a document and it reads it, names it to the convention, files it to a
            collection and records what it found. Everything it writes is a proposal until
            someone accepts it — an artifact filed under the wrong rule vintage is worse than one
            not filed at all, because it will be cited.
          </p>
          <FileInput className={css.file} disabled text="Choose documents…" />
          <Callout className={css.callout} intent="warning" title="The reading cannot run">
            Naming and classifying a document is a drafting act, and no model has been reachable
            from this build. The convention below is what it would apply; nothing has been read.
          </Callout>
          <dl className={css.convention}>
            <dt>Name</dt>
            <dd className={css.mono}>
              &lt;corpus&gt;__&lt;documentType&gt;__&lt;ruleVintage&gt;__&lt;sha256 first 8&gt;
            </dd>
            <dt>Recorded with it</dt>
            <dd>
              The rule vintage it was written under, whether it may be cited, how its text was
              obtained, its digest and its byte length — the five facts every row on this page
              already carries, so a filed artifact is indistinguishable from one that was always
              here.
            </dd>
            <dt>Proposed, not measured</dt>
            <dd>
              No naming convention is recorded anywhere in this repository. The shape above is
              built from the fields the corpus already holds and is this interface&rsquo;s
              proposal — check it against the real one before wiring it.
            </dd>
          </dl>
        </div>
      ) : null}

      {group === "regulation" ? (
        <div className={css.pane}>
          <p className={css.says}>
            Every determination in this application is reasoned against one pinned copy of 7 CFR
            part 1b. Re-pinning replaces that copy, and it is the single change here with the
            widest reach: a project already under way is answered against the text it started on
            until it is re-checked.
          </p>
          <dl className={css.convention}>
            <dt>Pinned now</dt>
            <dd className={css.mono}>7 CFR part 1b — 2026-04-03, the final rule at 91 FR 17092</dd>
            <dt>Drift</dt>
            <dd>
              None detected. The Learning page reports this, and it is the one measurement there
              that moves on its own.
            </dd>
            <dt>What re-pinning must carry</dt>
            <dd>
              The new vintage, the date it was pinned, and which projects were mid-review when it
              changed. None of the three has an address today.
            </dd>
          </dl>
          <Button className={css.act} disabled>
            Re-pin
          </Button>
        </div>
      ) : null}

      {group === "retire" ? (
        <div className={css.pane}>
          <p className={css.says}>
            {stale.length} artifacts carry a warning. Retiring one takes it out of citation
            without deleting it — a document relied on in an issued review has to stay readable,
            because 1b.9(e)(8) makes the reliance part of the record.
          </p>
          <div className={css.scroll}>
            <HTMLTable className={css.table} compact>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Why it is stale</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {stale.map((row) => (
                  <tr key={row.id}>
                    <td className={css.title}>{row.title}</td>
                    <td className={css.why}>{row.warnings.join(" · ")}</td>
                    <td>
                      <Button small disabled>
                        Retire
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </HTMLTable>
          </div>
        </div>
      ) : null}
    </Overlay>
  );
}
