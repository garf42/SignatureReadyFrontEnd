import { useState } from "react";
import { useParams } from "react-router-dom";

import type { ElementPanel, SourceKind } from "@/ui/data/port";
import { useElement, useGate } from "@/ui/data/port";
import { ActionBar } from "@/ui/components/ActionBar";
import { QuestionRow } from "@/ui/components/QuestionRow";
import { Region } from "@/ui/components/Region";
import { SourceOverlay } from "@/ui/components/SourceOverlay";

import css from "@/ui/screens/ElementScreen.module.css";

/** One part of the document: its questions, and the one action that closes it.
 *  On submit the rows above lock and the button becomes an undo. */
export function ElementScreen() {
  const params = useParams();
  const panel = useElement(params.tabId ?? "");
  const gate = useGate();
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
              {gatedRow(element)?.gate ? (
                <Region region={gate}>
                  {(caller) => (
                    <p className={css.gate} data-held={caller.held ? "yes" : "no"}>
                      This part carries a surface reserved to the{" "}
                      {gatedRow(element)?.gate?.reservedTo} — {gatedRow(element)?.gate?.citation}.{" "}
                      {caller.held
                        ? "You hold it."
                        : `The row stays in place; the act it offers is to ${(gatedRow(element)?.gate?.routeLabel ?? "").toLowerCase()}.`}
                    </p>
                  )}
                </Region>
              ) : null}
            </header>
            <div className={css.rows} data-locked={submitted ? "yes" : "no"}>
              {element.rows.map((row) => (
                <QuestionRow
                  key={row.id}
                  row={row}
                  open={!!open[row.id]}
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
