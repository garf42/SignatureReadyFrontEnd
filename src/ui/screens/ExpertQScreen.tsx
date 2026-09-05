import { useState } from "react";
import { Button, Dialog, FormGroup, HTMLTable, InputGroup, TextArea } from "@blueprintjs/core";

import type { ExpertStatus, SourceKind } from "@/ui/data/port";
import { EXPERT_RETURN, EXPERT_TRIGGER, PAGES, useExpertQueue, useExpertRequest } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { ListControls } from "@/ui/components/ListControls";
import { PageHead } from "@/ui/components/PageHead";
import { Region } from "@/ui/components/Region";
import { SourceLine } from "@/ui/components/SourceLine";
import { SourceOverlay } from "@/ui/components/SourceOverlay";

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
  const [source, setSource] = useState<SourceKind | null>(null);
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

        <Region region={queue} onSource={setSource} variant="page">
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
                          <SourceLine source={row.sentBy} onOpen={setSource} />
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

              <div className={css.notes}>
                <p className={css.notesTitle}>What this queue cannot show</p>
                {page.limits.map((limit) => (
                  <p key={limit} className={css.note}>
                    {limit}
                  </p>
                ))}
              </div>
            </>
          )}
        </Region>

        <div className={css.notes}>
          <p className={css.notesTitle}>How a request gets here, and how it closes</p>
          <p className={css.note}>{EXPERT_TRIGGER}</p>
          <p className={css.note}>{EXPERT_RETURN}</p>
        </div>
      </div>

      {composing ? (
        <ComposeOverlay onClose={() => setComposing(null)} onSource={setSource} />
      ) : null}
      {source ? <SourceOverlay kind={source} onClose={() => setSource(null)} /> : null}
    </AppFrame>
  );
}

/** Mounted only while a request is open, so the hook below runs unconditionally. */
function ComposeOverlay({
  onClose,
  onSource
}: {
  onClose: () => void;
  onSource: (kind: SourceKind) => void;
}) {
  const draft = useExpertRequest();
  const [body, setBody] = useState("");

  return (
    <Dialog isOpen title="Request from a specialist" onClose={onClose}>
      <Region region={draft} onSource={onSource}>
        {(request) => (
          <>
            <div className={css.dialogBody}>
              <p className={css.meta}>
                {request.project} · {request.uniqueIdentificationNumber}
              </p>
              <FormGroup className={css.field} label="Trigger">
                <InputGroup readOnly value={request.trigger} />
              </FormGroup>
              <FormGroup className={css.field} label="Artifact awaited">
                <InputGroup readOnly value={request.artifactAwaited} />
              </FormGroup>
              <FormGroup className={css.field} label="Expected return">
                <InputGroup readOnly value={request.expectedReturn} />
              </FormGroup>
              <FormGroup className={css.field} label="Proposed recipient">
                <InputGroup defaultValue={request.proposedRecipient} />
              </FormGroup>
              <p className={css.meta}>{request.recipientNote}</p>
              <FormGroup className={css.field} label="Request">
                <TextArea
                  rows={8}
                  placeholder={request.body}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </FormGroup>
              <SourceLine source={request.regulatoryBasis} onOpen={onSource} />
            </div>
            <div className={css.dialogFooter}>
              <span className={css.meta}>
                Sending performs signature-ready-package-expert-request
              </span>
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
    </Dialog>
  );
}
