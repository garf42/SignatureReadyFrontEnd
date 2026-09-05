import { useState } from "react";
import type { ReactNode } from "react";
import { HTMLTable, Icon } from "@blueprintjs/core";

import type { Mark, SourceRef } from "@/ui/data/port";
import { StatusMark } from "@/ui/components/StatusMark";

import css from "@/ui/components/RecordTable.module.css";

export interface RecordCell {
  id: string;
  text: string;
  faint?: boolean;
}

export interface RecordRow {
  id: string;
  name: string;
  mark: Mark;
  /** The two columns between the name and the status. */
  cells: RecordCell[];
  summary: string;
  meta: string;
  /** Who started or archived it. Null where nothing records that. */
  source: SourceRef | null;
  /** Shown in place of the source line where there is none. */
  sourceNote?: string;
}

/** One project, closed to a line and open to itself. §6.3 asks Archive to
 *  carry the same row component and the same fields as the inbox, so both
 *  pages render through here and neither can drift from the other.
 *
 *  Open, a row is one box and not two: the summary row gives up its bottom
 *  edge and the detail its top, so the border runs around both.
 *
 *  Who started or archived a record reads as plain text here. It is a name,
 *  not a citation: there is no primary source behind it to open. */
export function RecordTable({
  heads,
  records,
  actions
}: {
  heads: [string, string, string, string];
  records: RecordRow[];
  actions: (record: RecordRow) => ReactNode;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <HTMLTable className={css.table}>
      <thead>
        <tr>
          {heads.map((head) => (
            <th key={head}>{head}</th>
          ))}
          <th />
        </tr>
      </thead>
      {records.map((record) => (
        <tbody
          key={record.id}
          className={css.group}
          data-mark={record.mark}
          data-open={open[record.id] ? "yes" : "no"}
        >
          <tr>
            <td className={css.name}>{record.name}</td>
            {record.cells.map((cell) => (
              <td key={cell.id} className={cell.faint ? css.changed : css.position}>
                {cell.text}
              </td>
            ))}
            <td>
              <StatusMark mark={record.mark} />
            </td>
            <td className={css.glyph}>
              <button
                type="button"
                className={css.glyphButton}
                aria-expanded={!!open[record.id]}
                aria-label={open[record.id] ? "Hide the details" : "Show the details"}
                onClick={() => setOpen((state) => ({ ...state, [record.id]: !state[record.id] }))}
              >
                <Icon icon={open[record.id] ? "minus" : "plus"} />
              </button>
            </td>
          </tr>
          {open[record.id] ? (
            <tr>
              <td colSpan={heads.length + 1}>
                <div className={css.detail}>
                  <p className={css.summary}>{record.summary}</p>
                  <p className={css.meta}>{record.meta}</p>
                  {record.source ? (
                    <p className={css.meta}>
                      {record.source.lead}
                      {record.source.label}
                    </p>
                  ) : record.sourceNote ? (
                    <p className={css.meta}>{record.sourceNote}</p>
                  ) : null}
                  <div className={css.actions}>{actions(record)}</div>
                </div>
              </td>
            </tr>
          ) : null}
        </tbody>
      ))}
    </HTMLTable>
  );
}
