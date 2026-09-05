import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Dialog, FormGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";

import type { SourceKind } from "@/ui/data/port";
import { useSession } from "@/ui/data/port";
import { Region } from "@/ui/components/Region";
import { SourceLine } from "@/ui/components/SourceLine";
import { FIRST_TAB, projectPath, withSearch } from "@/ui/routes";

import css from "@/ui/components/IntakeDialog.module.css";

/** §7.3. General administrative information only, and exactly what
 *  signature-ready-submit-intake writes: name, the unique identification
 *  number and its issuer (a closed two-member set), and the anticipated
 *  implementation start. Submitting creates the project and opens its page;
 *  these fields display in the project band thereafter, editable there.
 *
 *  The overlay and Step 0 are different things and are not merged. Step 0 is
 *  a step in the step list like any other, and carries the detail the review
 *  itself needs. */
export function IntakeDialog({
  onClose,
  onSource
}: {
  onClose: () => void;
  onSource: (kind: SourceKind) => void;
}) {
  const session = useSession();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [name, setName] = useState("");
  const [uin, setUin] = useState("");
  const [start, setStart] = useState("");

  return (
    <Dialog isOpen title="Start a project" onClose={onClose}>
      <div className={css.body}>
        <FormGroup className={css.field} label="Project name">
          <InputGroup
            placeholder="⟨project.name⟩"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormGroup>
        <FormGroup className={css.field} label="Unique identification number">
          <InputGroup
            placeholder="⟨project.uniqueIdentificationNumber⟩"
            value={uin}
            onChange={(e) => setUin(e.target.value)}
          />
        </FormGroup>
        <FormGroup className={css.field} label="Issued by">
          <HTMLSelect>
            <option>⟨issuer.1⟩</option>
            <option>⟨issuer.2⟩</option>
          </HTMLSelect>
        </FormGroup>
        <FormGroup className={css.field} label="Anticipated implementation start">
          <InputGroup
            placeholder="⟨project.anticipatedImplementationStart⟩"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </FormGroup>
        <p className={css.note}>
          1b.9(u) attaches the unique identification number to the EA and the EIS and makes it
          discretionary for a FANEC. It is carried on the project here, which is a divergence and is
          recorded as one.
        </p>
      </div>
      <div className={css.footer}>
        <Region region={session} onSource={onSource}>
          {(who) => <SourceLine source={{ ...who.officer, lead: "Starting as " }} onOpen={onSource} />}
        </Region>
        <div className={css.buttons}>
          <Button className={css.secondary} onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={css.primary}
            onClick={() =>
              navigate(withSearch(projectPath("⟨project.ref⟩") + "/" + FIRST_TAB, search))
            }
          >
            Start project
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
