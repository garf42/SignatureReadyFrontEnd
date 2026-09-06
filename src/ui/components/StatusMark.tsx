import type { Mark } from "@/ui/data/port";

import css from "@/ui/components/StatusMark.module.css";

const TEXT: Record<Mark, string> = {
  accepted: "Accepted",
  review: "Needs review",
  waiting: "Waiting",
  error: "Error",
  ready: "Signature ready"
};

export function StatusMark({ mark }: { mark: Mark }) {
  return (
    <span className={css.mark} data-mark={mark}>
      {TEXT[mark]}
    </span>
  );
}
