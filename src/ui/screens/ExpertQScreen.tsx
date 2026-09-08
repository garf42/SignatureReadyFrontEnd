import { useState } from "react";
import { Button, Callout, FormGroup, HTMLTable, InputGroup, TextArea } from "@blueprintjs/core";

import type { ExpertStatus } from "@/ui/data/port";
import { PAGES, usePort } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { ListControls } from "@/ui/components/ListControls";
import { PageHead } from "@/ui/components/PageHead";
import { Overlay, OverlayActions } from "@/ui/components/Overlay";
import { Region } from "@/ui/components/Region";
import { SourceLine } from "@/ui/components/SourceLine";
import { markSeen } from "@/ui/data/seen";

import css from "@/ui/screens/Support.module.css";

const STATUS: Record<ExpertStatus, string> = {
  drafted: "Drafted, not sent",
  overdue: "Overdue",
  awaiting: "Awaiting return",
  returned: "Returned",
  accepted: "Accepted"
};

/** §6.4, Level 4. The system recognises that a discipline is needed and drafts
 *  the request; a person sends it. Selecting a row opens the compose overlay
 *  above the queue, and closing it returns to the table. */
export function ExpertQScreen() {
  const queue = usePort().useExpertQueue();
  const [composing, setComposing] = useState<string | null>(null);

  /* Opening the drafted request is what clears its dot. Not hovering it, not
     visiting the page — the dot points at a message somebody has to read, and
     it goes out when they have read it. */
  const open = (id: string) => {
    markSeen(id);
    setComposing(id);
  };

  return (
    <AppFrame current="experts">
      <div className={css.stack}>
        <PageHead
          title={PAGES.experts.title}
          count={queue.state === "filled" ? queue.value.count : undefined}
          help={PAGES.experts.help}
        >
          {queue.state === "filled" ? (
            <ListControls filters={queue.value.filters} sorts={queue.value.sorts} />
          ) : null}
        </PageHead>

        <Region region={queue} variant="page">
          {(page) => (
            <>
              <HTMLTable className={css.table + " " + css.queueTable}>
                <thead>
                  <tr>
                    <th>Expert</th>
                    <th>Discipline</th>
                    <th>Project</th>
                    <th>Awaited</th>
                    <th>Sent</th>
                    <th>Expected</th>
                    <th>Status</th>
                    <th>Gaps found</th>
                    <th />
                  </tr>
                </thead>
                {page.rows.map((row) => (
                  <tbody key={row.id} className={css.group} data-status={row.status}>
                    <tr className={css.clickable} onClick={() => open(row.id)}>
                      <td className={css.name}>
                        {row.expert}
                        <p className={css.meta}>{row.qualification}</p>
                        {row.sentBy ? (
                          <SourceLine source={row.sentBy} />
                        ) : (
                          <p className={css.cell + " " + css.faint}>Sender not recorded</p>
                        )}
                      </td>
                      <td className={css.cell}>{row.discipline}</td>
                      <td className={css.cell}>{row.project}</td>
                      <td className={css.cell}>{row.awaiting}</td>
                      <td className={css.cell}>{row.sent}</td>
                      <td className={css.cell}>{row.expectedReturn}</td>
                      <td
                        className={
                          css.cell +
                          " " +
                          (row.status === "overdue"
                            ? css.bad
                            : row.status === "accepted"
                              ? css.ok
                              : css.faint)
                        }
                      >
                        {STATUS[row.status]}
                      </td>
                      <td className={css.cell}>
                        {row.gapsFound ?? <span className={css.faint}>—</span>}
                      </td>
                      <td>
                        <div className={css.rowActions}>
                          <Button
                            className={css.secondary}
                            onClick={(event) => {
                              event.stopPropagation();
                              open(row.id);
                            }}
                          >
                            {/* One word, the same on every row. The object is
                                the row it sits in, and the Status column beside
                                it already says which kind of request this is —
                                varying the label made two identical acts look
                                like two different ones. */}
                            Open
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                ))}
              </HTMLTable>

            </>
          )}
        </Region>

      </div>

      {composing ? (
        <ComposeOverlay onClose={() => setComposing(null)} />
      ) : null}
    </AppFrame>
  );
}

/** The compose overlay.
 *
 *  NOTHING IS SENT FROM HERE, and the surface used to say otherwise. This
 *  application has no mail transport and no address book: the specialist is
 *  reached through the officer's own mail client, so what this page can honestly
 *  produce is a finished message and a way to get it into that client. A button
 *  labelled "Send request" promised a delivery that could never happen, and
 *  would have left the officer believing a specialist had been contacted.
 *
 *  So the act is: copy the whole message — recipient, subject, body — and then
 *  hold that exact version, on the assumption it has now gone out. The lock is
 *  the record: what is on screen afterwards is what was copied, so a person
 *  coming back to the row can see the words that were sent rather than a field
 *  they might have typed into since. It reverses in one click, because the
 *  assumption can be wrong — a copy that never reached the mail client, a
 *  recipient corrected on second thought — and a lock that cannot be undone
 *  turns a wrong guess into a dead row.
 *
 *  Clipboard access can be refused (an insecure origin, a sandboxed frame, a
 *  browser setting) and the refusal is silent unless it is caught. On failure
 *  the message is shown in full, selected, with a line saying to copy it by
 *  hand — and the version is NOT locked, because nothing was copied. */
function ComposeOverlay({ onClose }: { onClose: () => void }) {
  const draft = usePort().useExpertRequest();
  const [recipient, setRecipient] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  return (
    <Region region={draft}>
      {(request) => {
        const to = recipient ?? request.proposedRecipient;
        const text = body ?? request.body;
        const message = `To: ${to}\nSubject: ${request.subject}\n\n${text}`;
        const locked = copied !== null;

        const copy = () => {
          void (async () => {
            try {
              await navigator.clipboard.writeText(message);
              setFailed(false);
              setCopied(message);
            } catch {
              /* Refused. Say so and leave the version unlocked — locking would
                 record a send that did not happen. */
              setFailed(true);
            }
          })();
        };

        return (
          <Overlay
            title="Request specialist input"
            onClose={onClose}
            footer={
              <OverlayActions>
                <Button className={css.secondary} onClick={onClose}>
                  Close
                </Button>
                {locked ? (
                  <Button className={css.secondary} onClick={() => setCopied(null)}>
                    Reopen for edits
                  </Button>
                ) : (
                  <Button className={css.primary} onClick={copy}>
                    Copy message to clipboard
                  </Button>
                )}
              </OverlayActions>
            }
          >
            <p className={css.meta}>
              {request.project} · {request.uniqueIdentificationNumber}
            </p>

            {locked ? (
              <Callout className={css.field} intent="success" title="Copied — this version is held">
                These are the words that went to your clipboard, kept as the record of what was
                sent. Nothing here reaches the specialist on its own: paste it into your mail
                client and send it from there. Reopen for edits to change it and copy again.
              </Callout>
            ) : failed ? (
              <Callout className={css.field} intent="warning" title="The clipboard was refused">
                Your browser would not let this page write to the clipboard. The whole message is
                below — select it and copy it by hand. Nothing has been held as sent.
              </Callout>
            ) : null}

            {/* The three facts the request is assembled from are read, not
                edited, so they are a list rather than three disabled fields. */}
            <dl className={css.facts}>
              <dt>Trigger</dt>
              <dd>{request.trigger}</dd>
              <dt>Artifact awaited</dt>
              <dd>{request.artifactAwaited}</dd>
              <dt>Expected return</dt>
              <dd>{request.expectedReturn}</dd>
            </dl>

            {failed ? (
              <FormGroup className={css.field} label="The whole message, to copy by hand">
                <TextArea
                  rows={9}
                  readOnly
                  value={message}
                  onFocus={(event) => event.currentTarget.select()}
                />
              </FormGroup>
            ) : (
              <>
                <FormGroup className={css.field} label="Recipient">
                  <InputGroup
                    readOnly={locked}
                    value={to}
                    onChange={(event) => setRecipient(event.target.value)}
                  />
                </FormGroup>
                <FormGroup className={css.field} label="Subject">
                  <InputGroup readOnly value={request.subject} />
                </FormGroup>
                <FormGroup className={css.field} label="Message">
                  <TextArea
                    rows={7}
                    readOnly={locked}
                    value={text}
                    onChange={(event) => setBody(event.target.value)}
                  />
                </FormGroup>
              </>
            )}
            <SourceLine source={request.regulatoryBasis} />
          </Overlay>
        );
      }}
    </Region>
  );
}
