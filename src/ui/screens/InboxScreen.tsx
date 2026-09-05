import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@blueprintjs/core";

import type { SourceKind } from "@/ui/data/port";
import { useInbox } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { IntakeDialog } from "@/ui/components/IntakeDialog";
import { ListControls } from "@/ui/components/ListControls";
import { PageHead } from "@/ui/components/PageHead";
import { RecordTable } from "@/ui/components/RecordTable";
import type { RecordRow } from "@/ui/components/RecordTable";
import { Region } from "@/ui/components/Region";
import { SourceOverlay } from "@/ui/components/SourceOverlay";
import { FIRST_TAB, projectPath, withSearch } from "@/ui/routes";

import table from "@/ui/components/RecordTable.module.css";

export function InboxScreen() {
  const inbox = useInbox();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [source, setSource] = useState<SourceKind | null>(null);
  const [intake, setIntake] = useState(false);

  return (
    <AppFrame current="inbox">
      <PageHead
        title="Your projects"
        count={inbox.state === "filled" ? inbox.value.count : undefined}
      >
        {inbox.state === "filled" ? (
          <ListControls filters={inbox.value.filters} sorts={inbox.value.sorts}>
            <Button className={table.primary} onClick={() => setIntake(true)}>
              Initiate project
            </Button>
          </ListControls>
        ) : null}
      </PageHead>

      <Region region={inbox} onSource={setSource} onAction={() => setIntake(true)} variant="page">
        {(list) => (
          <RecordTable
            heads={["Project", "Changed", "Where it is", "Status"]}
            onSource={setSource}
            records={list.projects.map(
              (project): RecordRow => ({
                id: project.id,
                name: project.name,
                mark: project.mark,
                cells: [
                  { id: "changed", text: project.changed, faint: true },
                  { id: "position", text: project.position }
                ],
                summary: project.summary,
                meta: project.meta,
                source: project.startedBy
              })
            )}
            actions={(project) => (
              <>
                <Button
                  className={table.primary}
                  onClick={() =>
                    navigate(withSearch(projectPath(project.id) + "/" + FIRST_TAB, search))
                  }
                >
                  Open project
                </Button>
                <Button className={table.secondary}>Archive</Button>
              </>
            )}
          />
        )}
      </Region>

      {source ? <SourceOverlay kind={source} onClose={() => setSource(null)} /> : null}
      {intake ? <IntakeDialog onClose={() => setIntake(false)} onSource={setSource} /> : null}
    </AppFrame>
  );
}
