import { useState } from "react";
import { Button, Dialog } from "@blueprintjs/core";

import type { SourceKind } from "@/ui/data/port";
import { ARCHIVE_NOTE, PAGES, useArchive } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { PageHead } from "@/ui/components/PageHead";
import { RecordTable } from "@/ui/components/RecordTable";
import type { RecordRow } from "@/ui/components/RecordTable";
import { Region } from "@/ui/components/Region";
import { SourceOverlay } from "@/ui/components/SourceOverlay";

import css from "@/ui/screens/Support.module.css";
import table from "@/ui/components/RecordTable.module.css";

/** §6.3. The inbox's recently-deleted tab, in a page: the same row component
 *  and the same fields, plus when it was archived and by whom. Nothing new is
 *  displayed. The two actions sit on the row rather than in a menu, and the
 *  second is confirmed.
 *
 *  The heading renders outside the region, so the page says what it holds in
 *  every state — including the empty one, which is the state it will be in
 *  until an archived state on `project` exists to read. */
export function ArchiveScreen() {
  const archive = useArchive();
  const [source, setSource] = useState<SourceKind | null>(null);
  const [purging, setPurging] = useState<string | null>(null);

  return (
    <AppFrame current="archive">
      <div className={css.stack}>
        <PageHead
          title={PAGES.archive.title}
          count={archive.state === "filled" ? archive.value.count : undefined}
          help={PAGES.archive.help}
        />

        <Region region={archive} onSource={setSource} variant="page">
          {(page) => (
            <RecordTable
              heads={["Project", "Archived", "Where it was", "Status"]}
              onSource={setSource}
              records={page.rows.map(
                (row): RecordRow => ({
                  id: row.id,
                  name: row.name,
                  mark: row.mark,
                  cells: [
                    { id: "archived", text: row.archived, faint: true },
                    { id: "position", text: row.position }
                  ],
                  summary: row.summary,
                  meta: row.meta,
                  source: row.archivedBy,
                  sourceNote: "Who archived it is not recorded — no act writes an actor for it."
                })
              )}
              actions={(row) => (
                <>
                  <Button className={table.secondary}>Restore</Button>
                  <Button className={table.destructive} onClick={() => setPurging(row.id)}>
                    Delete permanently
                  </Button>
                </>
              )}
            />
          )}
        </Region>

        <div className={css.notes}>
          <p className={css.notesTitle}>What counts as a project here</p>
          <p className={css.note}>{ARCHIVE_NOTE}</p>
        </div>
      </div>

      <Dialog isOpen={purging !== null} title="Delete permanently" onClose={() => setPurging(null)}>
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
