import type { ReactNode } from "react";
import { HTMLSelect } from "@blueprintjs/core";

import css from "@/ui/components/ListControls.module.css";

/** A label and its select, on one baseline. The label is 11px mono and the
 *  value 12.5px sans; centring two boxes of different heights would leave
 *  their text on two different lines, which is why this aligns on baseline. */
export function ListControls({
  filters,
  sorts,
  children
}: {
  filters: string[];
  sorts: string[];
  children?: ReactNode;
}) {
  return (
    <div className={css.controls}>
      <label className={css.control}>
        <span className={css.controlLabel}>Filter</span>
        <HTMLSelect>
          {filters.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </HTMLSelect>
      </label>
      <label className={css.control}>
        <span className={css.controlLabel}>Sort</span>
        <HTMLSelect>
          {sorts.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </HTMLSelect>
      </label>
      {children}
    </div>
  );
}
