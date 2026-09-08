import { useState } from "react";
import { useParams } from "react-router-dom";

import type { DocumentType, ElementPanel, SourceKind } from "@/ui/data/port";
import { usePort } from "@/ui/data/port";
import { ActionBar } from "@/ui/components/ActionBar";
import { QuestionRow } from "@/ui/components/QuestionRow";
import { Region } from "@/ui/components/Region";
import { SourceOverlay } from "@/ui/components/SourceOverlay";

import css from "@/ui/screens/ElementScreen.module.css";

/** One part of the document: its questions, and the one action that closes it.
 *  On submit the rows above lock and the button becomes an undo. */
export function ElementScreen() {
  const params = useParams();
  const port = usePort();
  const panel = port.useElement(
    params.projectRef ?? "",
    params.stepId ?? "",
    params.tabId ?? ""
  );
  /* Asked about the document this tab assembles, so a FANEC tab cites
     1b.3(g)(2)(vi) and says nothing about a record of decision. */
  const gate = port.useGate(documentOf(params.tabId ?? ""));
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [source, setSource] = useState<SourceKind | null>(null);

  const toggle = (id: string) => setOpen((state) => ({ ...state, [id]: !state[id] }));

  return (
    <>
      <Region region={panel} onSource={setSource}>
        {(element) => (
          <>
            <header className={css.head}>
              <div className={css.headLine}>
                <h2 className={css.title}>{element.title}</h2>
                <p className={css.progress}>{element.progress}</p>
              </div>
              <p className={css.help}>{element.help}</p>
              {/* Said in the words of the work. It used to read "This part
                  carries a surface reserved to…", where "carries a surface" is
                  this build's own vocabulary and nobody else's, and then "the
                  row stays in place; the act it offers is to…", which describes
                  the widget instead of what happens to the reader's work. */}
              {gatedRow(element)?.gate ? (
                <Region region={gate}>
                  {(caller) => (
                    <p className={css.gate} data-held={caller.held ? "yes" : "no"}>
                      One answer on this tab can only be given by the{" "}
                      {gatedRow(element)?.gate?.reservedTo} — {gatedRow(element)?.gate?.citation}.{" "}
                      {caller.held
                        ? "You are one, so you can give it here."
                        : `Everything else is yours to fill; that one you send on — ${(gatedRow(element)?.gate?.routeLabel ?? "").toLowerCase()}.`}
                    </p>
                  )}
                </Region>
              ) : null}
            </header>
            <div className={css.rows} data-locked={submitted ? "yes" : "no"}>
              {element.rows.map((row) => (
                <QuestionRow
                  key={row.rid}
                  row={row}
                  open={!!open[row.rid]}
                  onToggle={toggle}
                  onSource={setSource}
                />
              ))}
            </div>
            <ActionBar
              bar={element.submit}
              submitted={submitted}
              onToggle={() => setSubmitted((v) => !v)}
            />
          </>
        )}
      </Region>
      {source ? <SourceOverlay kind={source} onClose={() => setSource(null)} /> : null}
    </>
  );
}

/** The gate is named by the row that carries it, never by a list of all three:
 *  a FANEC tab cites 1b.3(g)(2)(vi) and says nothing about a ROD. */
function gatedRow(element: ElementPanel) {
  return element.rows.find((row) => row.gate);
}

/** Which document this tab assembles, if any. Exactly three carry a signature
 *  the rule reserves: 1b.5(c)(6) and 1b.7(h)(8) state that the certifying
 *  statement needs no signature and that approval to publish indicates
 *  concurrence, so the EA and the EIS carry no gate at any point. */
function documentOf(tabId: string): DocumentType | null {
  switch (tabId) {
    case "fanec":
      return "FANEC";
    case "fonsi":
      return "FONSI";
    case "rod":
      return "ROD";
    case "ea":
      return "EA";
    case "eis":
      return "EIS";
    default:
      return null;
  }
}
