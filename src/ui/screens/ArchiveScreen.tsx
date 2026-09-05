import { useState } from "react";
import { Button, Dialog, HTMLTable } from "@blueprintjs/core";

import type { SourceKind } from "@/ui/data/port";
import { ARCHIVE_NOTE, useArchive } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { PageHead } from "@/ui/components/PageHead";
import { Region } from "@/ui/components/Region";
import { SourceLine } from "@/ui/components/SourceLine";
import { SourceOverlay } from "@/ui/components/SourceOverlay";
import { StatusMark } from "@/ui/components/StatusMark";

import css from "@/ui/screens/Support.module.css";

/** §6.3. The inbox's recently-deleted tab, in a page: the same row fields, plus
 *  when it was archived and by whom. Nothing new is displayed. */
export function ArchiveScreen() {
  const archive = useArchive();
  const [source, setSource] = useState<SourceKind | null>(null);
  const [purging, setPurging] = useState<string | null>(null);

  return (
    <AppFrame current="archive">
      <div className={css.stack}>
        <Region region={archive} onSource={setSource}>
          {(page) => (
            <>
              <PageHead title={page.heading} count={page.count} help={page.help} />
              <HTMLTable className={css.table}>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Archived</th>
                    <th>Where it was</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                {page.rows.map((row) => (
                  <tbody key={row.id} className={css.group} data-mark={row.mark}>
                    <tr>
                      <td className={css.name}>
                        {row.name}
                        <p className={css.meta}>{row.meta}</p>
                        <p className={css.note}>{row.summary}</p>
                      </td>
                      <td className={css.cell}>
                        {row.archived}
                        {row.archivedBy ? (
                          <SourceLine source={row.archivedBy} onOpen={setSource} />
                        ) : (
                          <span className={css.faint}> · by whom is not recorded</span>
                        )}
                      </td>
                      <td className={css.cell}>{row.position}</td>
                      <td>
                        <StatusMark mark={row.mark} />
                      </td>
                      <td>
                        <div className={css.rowActions}>
                          <Button className={css.secondary}>Restore</Button>
                          <Button className={css.destructive} onClick={() => setPurging(row.id)}>
                            Delete permanently
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

        <div className={css.notes}>
          <p className={css.notesTitle}>What counts as a project here</p>
          <p className={css.note}>{ARCHIVE_NOTE}</p>
        </div>
      </div>

      <Dialog
        isOpen={purging !== null}
        title="Delete permanently"
        onClose={() => setPurging(null)}
      >
        <div className={css.dialogBody}>
          <p className={css.note}>
            This removes the project and everything recorded against it. It cannot be undone, and no
            act in the ontology restores it.
          </p>
        </div>
        <div className={css.dialogFooter}>
          <span className={css.meta}>⟨project.ref⟩</span>
          <div className={css.buttons}>
            <Button className={css.secondary} onClick={() => setPurging(null)}>
              Cancel
            </Button>
            <Button className={css.destructive} onClick={() => setPurging(null)}>
              Delete permanently
            </Button>
          </div>
        </div>
      </Dialog>

      {source ? <SourceOverlay kind={source} onClose={() => setSource(null)} /> : null}
    </AppFrame>
  );
}
