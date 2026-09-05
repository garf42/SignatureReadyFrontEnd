import type { ReactNode } from "react";

import css from "@/ui/components/PageHead.module.css";

/** The one heading line the inbox already uses, lifted so the four supporting
 *  pages carry it identically rather than each inventing one. */
export function PageHead({
  title,
  count,
  help,
  children
}: {
  title: string;
  count?: string;
  help?: string;
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
    </header>
  );
}
