import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, HTMLSelect, HTMLTable, Icon } from "@blueprintjs/core";

import type { SourceKind } from "@/ui/data/port";
import { useInbox } from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { IntakeDialog } from "@/ui/components/IntakeDialog";
import { Region } from "@/ui/components/Region";
import { SourceOverlay } from "@/ui/components/SourceOverlay";
import { SourceLine } from "@/ui/components/SourceLine";
import { StatusMark } from "@/ui/components/StatusMark";
import { FIRST_TAB, projectPath, withSearch } from "@/ui/routes";

import css from "@/ui/screens/InboxScreen.module.css";

export function InboxScreen() {
  const inbox = useInbox();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [source, setSource] = useState<SourceKind | null>(null);
  const [intake, setIntake] = useState(false);

  return (
    <AppFrame current="inbox">
      <Region region={inbox} onSource={setSource} onAction={() => setIntake(true)}>
        {(list) => (
          <>
            <div className={css.listHead}>
              <div className={css.heading}>
                <h1 className={css.title}>{list.heading}</h1>
                <p className={css.count}>{list.count}</p>
              </div>
              <div className={css.controls}>
                <label className={css.control}>
                  <span className={css.controlLabel}>Filter</span>
                  <HTMLSelect>
                    {list.filters.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </HTMLSelect>
                </label>
                <label className={css.control}>
                  <span className={css.controlLabel}>Sort</span>
                  <HTMLSelect>
                    {list.sorts.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </HTMLSelect>
                </label>
                <Button className={css.primary} onClick={() => setIntake(true)}>
                  Initiate project
                </Button>
              </div>
            </div>

            <HTMLTable className={css.table}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Changed</th>
                  <th>Where it is</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              {list.projects.map((project) => (
                <tbody key={project.id} className={css.group} data-mark={project.mark}>
                  <tr>
                    <td className={css.name}>{project.name}</td>
                    <td className={css.changed}>{project.changed}</td>
                    <td className={css.position}>{project.position}</td>
                    <td>
                      <StatusMark mark={project.mark} />
                    </td>
                    <td className={css.glyph}>
                      <button
                        type="button"
                        className={css.glyphButton}
                        aria-expanded={!!open[project.id]}
                        aria-label={open[project.id] ? "Hide the details" : "Show the details"}
                        onClick={() =>
                          setOpen((state) => ({ ...state, [project.id]: !state[project.id] }))
                        }
                      >
                        <Icon icon={open[project.id] ? "minus" : "plus"} />
                      </button>
                    </td>
                  </tr>
                  {open[project.id] ? (
                    <tr>
                      <td colSpan={5}>
                        <div className={css.detail}>
                          <p className={css.summary}>{project.summary}</p>
                          <p className={css.meta}>{project.meta}</p>
                          <SourceLine source={project.startedBy} onOpen={setSource} />
                          <div className={css.detailActions}>
                            <Button
                              className={css.primary}
                              onClick={() =>
                                navigate(
                                  withSearch(projectPath(project.id) + "/" + FIRST_TAB, search)
                                )
                              }
                            >
                              Open project
                            </Button>
                            <Button className={css.secondary}>Archive</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              ))}
            </HTMLTable>
          </>
        )}
      </Region>

      {source ? <SourceOverlay kind={source} onClose={() => setSource(null)} /> : null}
      {intake ? <IntakeDialog onClose={() => setIntake(false)} onSource={setSource} /> : null}
    </AppFrame>
  );
}
