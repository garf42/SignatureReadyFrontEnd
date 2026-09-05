import { useState } from "react";
import { Button, FormGroup, HTMLTable, InputGroup, TextArea } from "@blueprintjs/core";

import type { ExpertStatus } from "@/ui/data/port";
import { PAGES, useExpertQueue, useExpertRequest } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { ListControls } from "@/ui/components/ListControls";
import { PageHead } from "@/ui/components/PageHead";
import { Overlay } from "@/ui/components/Overlay";
import { Region } from "@/ui/components/Region";
import { SourceLine } from "@/ui/components/SourceLine";

import css from "@/ui/screens/Support.module.css";

const STATUS: Record<ExpertStatus, string> = {
  overdue: "Overdue",
  awaiting: "Awaiting return",
  returned: "Returned",
  accepted: "Accepted"
};

/** §6.4, Level 4. The system recognises that a discipline is needed and drafts
 *  the request; a person sends it. Selecting a row opens the compose overlay
 *  above the queue, and closing it returns to the table. */
export function ExpertQScreen() {
  const queue = useExpertQueue();
  const [composing, setComposing] = useState<string | null>(null);

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
                    <tr className={css.clickable} onClick={() => setComposing(row.id)}>
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
                          css.cell + " " + (row.status === "overdue" ? css.bad : row.status === "accepted" ? css.ok : css.faint)
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
                              setComposing(row.id);
                            }}
                          >
                            Open request
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

/** Mounted only while a request is open, so the hook below runs unconditionally. */
function ComposeOverlay({
  onClose,
}: {
  onClose: () => void;
}) {
  const draft = useExpertRequest();
  const [body, setBody] = useState("");

  return (
    <Overlay title="Request specialist input" onClose={onClose}>
      <Region region={draft}>
        {(request) => (
          <>
            <div className={css.dialogBody}>
              <p className={css.meta}>
                {request.project} · {request.uniqueIdentificationNumber}
              </p>
              {/* The three facts the request is assembled from are read, not
                  edited, so they are a list rather than three disabled fields
                  taking a form row each. */}
              <dl className={css.facts}>
                <dt>Trigger</dt>
                <dd>{request.trigger}</dd>
                <dt>Artifact awaited</dt>
                <dd>{request.artifactAwaited}</dd>
                <dt>Expected return</dt>
                <dd>{request.expectedReturn}</dd>
              </dl>
              <FormGroup className={css.field} label="Proposed recipient">
                <InputGroup defaultValue={request.proposedRecipient} />
              </FormGroup>
              <FormGroup className={css.field} label="Request">
                <TextArea
                  rows={5}
                  placeholder={request.body}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </FormGroup>
              <SourceLine source={request.regulatoryBasis} />
            </div>
            <div className={css.dialogFooter}>
              <span />
              <div className={css.buttons}>
                <Button className={css.secondary} onClick={onClose}>
                  Cancel
                </Button>
                <Button className={css.primary} onClick={onClose}>
                  Send request
                </Button>
              </div>
            </div>
          </>
        )}
      </Region>
    </Overlay>
  );
}
