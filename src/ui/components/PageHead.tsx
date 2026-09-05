import type { ReactNode } from "react";

import css from "@/ui/components/PageHead.module.css";

/** The one heading line the inbox already uses, lifted so the four supporting
 *  pages carry it identically rather than each inventing one. */
export function PageHead({
  title,
  count,
  help,
  notes,
  children
}: {
  title: string;
  count?: string;
  help?: string;
  /** What the page cannot show, or what its numbers rest on. Kept up here
   *  with the standfirst rather than in a box at the foot: a caveat a reader
   *  meets after the thing it qualifies has already been read too late. */
  notes?: string[];
  children?: ReactNode;
}) {
  return (
    <header className={css.wrap}>
      <div className={css.head}>
        <div className={css.heading}>
          <h1 className={css.title}>{title}</h1>
          {count ? <p className={css.count}>{count}</p> : null}
        </div>
        {children ? <div className={css.controls}>{children}</div> : null}
      </div>
      {help ? <p className={css.help}>{help}</p> : null}
      {notes && notes.length > 0 ? (
        <div className={css.notes}>
          {notes.map((note) => (
            <p key={note} className={css.note}>
              {note}
            </p>
          ))}
        </div>
      ) : null}
    </header>
  );
}
