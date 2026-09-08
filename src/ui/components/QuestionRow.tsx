import { useState } from "react";
import { Button, Card, HTMLSelect, Icon, Radio, RadioGroup } from "@blueprintjs/core";

import type { Answer, Modality, QuestionRow as Row, SourceKind } from "@/ui/data/port";
import { FILL_SAYS } from "@/ui/data/port";
import { Region } from "@/ui/components/Region";
import { ReferenceBrowser } from "@/ui/components/ReferenceBrowser";
import { StatusMark } from "@/ui/components/StatusMark";

import css from "@/ui/components/QuestionRow.module.css";

/** What the rule does with this row, said in plain words.
 *
 *  One branch per member of the union, and the default throws — so adding a
 *  modality without deciding what it SAYS is a failure at the point of use
 *  rather than a row that silently says nothing. `derived` is the branch that
 *  matters most: a consequence the rule compels without stating in one
 *  paragraph is not a choice, and reading it as one is the dangerous
 *  direction. */
function Modality({ modality }: { modality: Modality }) {
  switch (modality) {
    case "permission":
      return (
        <p className={css.permission}>
          A permission in the rule, not a duty. Nothing here turns it into a requirement, and leaving
          it unanswered does not hold the element open.
        </p>
      );
    case "duty-to-consider":
      return (
        <p className={css.consider}>
          The rule requires that this be considered. It does not decide the answer — the conclusion
          stays the responsible official&rsquo;s.
        </p>
      );
    case "derived":
      return (
        <p className={css.derived}>
          No single paragraph states this. It follows from the chain of paragraphs cited above, and
          it is a consequence rather than a choice.
        </p>
      );
    case "outbound-request":
      return (
        <p className={css.outbound}>
          Reserved to someone else. This records the request and sends it; nothing here waits on the
          reply, because this application cannot verify a credential.
        </p>
      );
    case "duty":
      return null;
    default: {
      const never: never = modality;
      throw new Error(`unhandled modality: ${String(never)}`);
    }
  }
}

/** One question. Closed, it shows its name and where it stands; open, it hands
 *  its answer to Region, which decides the shape. */
export function QuestionRow({
  row,
  open,
  onToggle,
  onSource
}: {
  row: Row;
  open: boolean;
  onToggle: (id: string) => void;
  onSource: (kind: SourceKind) => void;
}) {
  return (
    <Card
      id={row.rid}
      className={css.row}
      data-mark={row.mark}
      data-gated={row.gate ? (row.gate.held ? "held" : "withheld") : undefined}
      data-discretionary={row.discretionary ? "yes" : undefined}
      data-modality={row.modality}
      data-text={row.textState}
      data-level={row.level}
      data-rid={row.rid}
    >
      <button
        type="button"
        className={css.header}
        aria-expanded={open}
        onClick={() => onToggle(row.rid)}
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
          {/* The anchor. A comment left on this row resolves to this string,
              and so does per-row state a backend eventually joins on — one
              address, computed in one place. The ordinal is load-bearing: a
              citation repeats inside a single tab in twelve places. */}
          <p className={css.rid}>{row.rid}</p>
          {row.help ? <p className={css.help}>{row.help}</p> : null}
          <Modality modality={row.modality} />

          {/* How this element gets its value, and what it becomes on the page
              that is filed. Both are on the surface because both are what
              "is this built?" actually asks: an element nobody can say how to
              fill is not designed, and one with no template is one the
              document cannot carry. */}
          <dl className={css.build}>
            <dt>How it fills</dt>
            <dd>
              <span className={css.fill} data-fill={row.fill}>
                {FILL_SAYS[row.fill].short}
              </span>{" "}
              {FILL_SAYS[row.fill].long}
              {row.filledFrom ? <em> {row.filledFrom}</em> : null}
            </dd>
            <dt>In the document</dt>
            <dd>
              {/* Two different facts, and the line used to state them as an
                  "or" and leave the reader to guess which. They are told
                  apart by the element's own text state, so the surface tells
                  them apart too. */}
              {row.produces.template === null ? (
                <span className={css.notemplate}>
                  {row.textState === "placeholder"
                    ? "No layout yet — the rule's own words for this item are not in the build, so there is nothing to lay out."
                    : "This answer is kept in the proposal record and informs the determination. It does not appear in a document."}
                </span>
              ) : (
                <>
                  <span className={css.section}>{row.produces.section}</span>
                  <pre className={css.template}>{row.produces.template}</pre>
                </>
              )}
            </dd>
          </dl>
          {row.restates ? (
            <p className={css.echo}>
              Asked once, elsewhere. This is the answer given there — change it where it was asked.
            </p>
          ) : null}
          {row.gate ? (
            <p className={css.gate}>
              Reserved to the {row.gate.reservedTo} — {row.gate.citation}.
              {row.gate.held ? " You hold this." : null}
            </p>
          ) : null}
          <Region region={row.answer} onSource={onSource}>
            {(answer) => <AnswerBody answer={answer} />}
          </Region>
        </div>
      ) : null}
    </Card>
  );
}

function AnswerBody({ answer }: { answer: Answer }) {
  const [picked, setPicked] = useState(answer.form === "select" ? answer.options[0] : "");
  const [browsing, setBrowsing] = useState(false);

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

    /* Answered by NAMING documents, not by writing anything — so the row has
       no field, and until now it had no way to name one either. The browse
       control is the affordance: the corpus comes to the element instead of the
       element's reader going to the reference page and losing their place. */
    case "sourcesOnly":
      return (
        <div className={css.browseRow}>
          <Button className={css.browse} icon="search-template" onClick={() => setBrowsing(true)}>
            Browse
          </Button>
          {browsing ? <ReferenceBrowser onClose={() => setBrowsing(false)} /> : null}
        </div>
      );

    default:
      return assertNever(answer);
  }
}

function assertNever(x: never): never {
  throw new Error("unhandled answer form: " + JSON.stringify(x));
}
