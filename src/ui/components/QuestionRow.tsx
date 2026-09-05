import { useState } from "react";
import { Card, HTMLSelect, Icon, Radio, RadioGroup } from "@blueprintjs/core";

import type { Answer, QuestionRow as Row } from "@/ui/data/port";
import { Region } from "@/ui/components/Region";
import { StatusMark } from "@/ui/components/StatusMark";

import css from "@/ui/components/QuestionRow.module.css";

/** One question. Closed, it shows its name and where it stands; open, it hands
 *  its answer to Region, which decides the shape. */
export function QuestionRow({
  row,
  open,
  onToggle,
}: {
  row: Row;
  open: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <Card
      className={css.row}
      data-mark={row.mark}
      data-gated={row.gate ? (row.gate.held ? "held" : "withheld") : undefined}
      data-discretionary={row.discretionary ? "yes" : undefined}
    >
      <button
        type="button"
        className={css.header}
        aria-expanded={open}
        onClick={() => onToggle(row.id)}
      >
        <span className={css.ref}>{row.ref}</span>
        <span className={css.label}>{row.label}</span>
        <StatusMark mark={row.mark} />
        <span className={css.glyph}>
          <Icon icon={open ? "minus" : "plus"} />
        </span>
      </button>
      {open ? (
        <div className={css.body}>
          {row.help ? <p className={css.help}>{row.help}</p> : null}
          {row.discretionary ? (
            <p className={css.permission}>
              A permission in the rule, not a duty. Nothing here turns it into a requirement, and
              leaving it unanswered does not hold the element open.
            </p>
          ) : null}
          {row.gate ? (
            <p className={css.gate}>
              Reserved to the {row.gate.reservedTo} — {row.gate.citation}.{" "}
              {row.gate.held ? "You hold this." : row.gate.cannotVerify}
            </p>
          ) : null}
          <Region region={row.answer}>
            {(answer) => <AnswerBody answer={answer} />}
          </Region>
        </div>
      ) : null}
    </Card>
  );
}

function AnswerBody({ answer }: { answer: Answer }) {
  const [picked, setPicked] = useState(answer.form === "select" ? answer.options[0] : "");

  switch (answer.form) {
    case "quote":
      return <blockquote className={css.quote}>{answer.text}</blockquote>;

    case "value":
      return (
        <div className={css.fieldBox}>
          <p className={css.ofRecord}>{answer.text}</p>
        </div>
      );

    case "draft":
      return (
        <div className={css.fieldBox}>
          <p className={css.proposal}>{answer.text}</p>
        </div>
      );

    case "select":
      return (
        <HTMLSelect className={css.select} value={picked} onChange={(e) => setPicked(e.target.value)}>
          {answer.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </HTMLSelect>
      );

    case "choice":
      return (
        <div>
          <p className={css.prompt}>{answer.prompt}</p>
          <div className={css.choices}>
            <RadioGroup selectedValue={picked} onChange={(e) => setPicked(e.currentTarget.value)}>
              {answer.options.map((option, i) => (
                <Radio key={option} label={option} value={option + "-" + String(i)} />
              ))}
            </RadioGroup>
          </div>
        </div>
      );

    case "sourcesOnly":
      return null;

    default:
      return assertNever(answer);
  }
}

function assertNever(x: never): never {
  throw new Error("unhandled answer form: " + JSON.stringify(x));
}
