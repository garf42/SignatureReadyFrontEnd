import { useState } from "react";
import { Button, Dialog, HTMLTable, InputGroup } from "@blueprintjs/core";

import type { Citable, SourceKind } from "@/ui/data/port";
import {
  CATALOGUE_EMPTY_REASON,
  PAGES,
  REGULATION_NOTE,
  useCatalogue,
  useIntegrity,
  useReference,
  useReferenceArtifact,
  useRegulation
} from "@/ui/data/port";
import { AppFrame } from "@/ui/components/AppFrame";
import { PageHead } from "@/ui/components/PageHead";
import { ListControls } from "@/ui/components/ListControls";
import { Region } from "@/ui/components/Region";
import { TabStrip } from "@/ui/components/TabStrip";
import { SourceOverlay } from "@/ui/components/SourceOverlay";

import css from "@/ui/screens/ReferenceScreen.module.css";
import shared from "@/ui/screens/Support.module.css";

/** The same strip the project page uses, so a tab is one object across the
 *  application rather than two that look alike until one is changed. */
const GROUPS = [
  { id: "corpus", name: "Corpus", done: false },
  { id: "regulation", name: "7 CFR part 1b", done: false },
  { id: "catalogue", name: "Categorical exclusions", done: false }
];

/** Three values, not two. 25 rows carry classDeclared=false and a NULL
 *  citable, and a null meaning "not declared" and a null meaning "not
 *  applicable" are the same null. They do not render the same here. */
const CITABLE: Record<Citable, string> = {
  yes: "Citable",
  no: "Not citable",
  "not-declared": "Not declared"
};

/** §6.6, Levels 0 and 1. A file organiser with a document viewer, and the only
 *  page in the application with real data in it. */
export function ReferenceScreen() {
  const reference = useReference();
  const integrity = useIntegrity();
  const [source, setSource] = useState<SourceKind | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [group, setGroup] = useState("corpus");

  return (
    <AppFrame current="reference">
      <div className={shared.stack}>
        <Region region={integrity} onSource={setSource}>
          {(lines) => (
            <div className={shared.strip}>
              {lines.map((line) => (
                <span key={line} className={shared.stripItem}>
                  {line}
                </span>
              ))}
            </div>
          )}
        </Region>

        <PageHead
          title={PAGES.reference.title}
          count={reference.state === "filled" ? reference.value.count : undefined}
          help={PAGES.reference.help}
        />

        <TabStrip
          id="reference-groups"
          tabs={GROUPS}
          selected={group}
          onSelect={setGroup}
        />

        {group === "corpus" ? (
          <Region region={reference} onSource={setSource}>
            {(page) => (
              <>
                <p className={css.hazard}>{page.hazard}</p>
                <div className={css.split}>
                  <aside className={css.facets}>
                    {page.facets.map((facet) => (
                      <div key={facet.id} className={css.facet}>
                        <p className={css.facetName}>{facet.name}</p>
                        {facet.options.map((option) => (
                          <button key={option.label} type="button" className={css.option}>
                            <span>{option.label}</span>
                            <span className={css.optionCount}>{option.count}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </aside>

                  <div>
                    <div className={css.tableHead}>
                      <div className={css.search}>
                        <InputGroup placeholder="Search titles and metadata — there is no body text to search" />
                      </div>
                      <ListControls filters={page.filters} sorts={page.sorts} />
                    </div>
                    <HTMLTable className={shared.table + " " + css.corpusTable}>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Corpus</th>
                          <th>Type</th>
                          <th>Rule vintage</th>
                          <th>Citable</th>
                          <th>Extractability</th>
                          <th />
                        </tr>
                      </thead>
                      {page.rows.map((row) => (
                        <tbody key={row.id} className={shared.group}>
                          <tr>
                            <td className={shared.name}>
                              {row.title}
                              <p className={shared.meta}>
                                {row.sha256} · {row.byteLength} bytes · minCharsOnAPage{" "}
                                {row.minCharsOnAPage}
                              </p>
                              {row.warnings.map((warning) => (
                                <p key={warning} className={css.warning}>
                                  {warning}
                                </p>
                              ))}
                            </td>
                            <td className={shared.cell}>{row.corpus}</td>
                            <td className={shared.cell}>{row.documentType}</td>
                            <td className={shared.cell}>{row.ruleVintage}</td>
                            <td
                              className={
                                shared.cell +
                                " " +
                                (row.citable === "yes"
                                  ? shared.ok
                                  : row.citable === "not-declared"
                                    ? shared.warn
                                    : shared.faint)
                              }
                            >
                              {CITABLE[row.citable]}
                            </td>
                            <td className={shared.cell}>{row.extractability}</td>
                            <td>
                              <div className={shared.rowActions}>
                                <Button className={shared.secondary} onClick={() => setViewing(row.id)}>
                                  Open
                                </Button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      ))}
                    </HTMLTable>
                  </div>
                </div>
              </>
            )}
          </Region>
        ) : null}

        {group === "regulation" ? <RegulationPanel onSource={setSource} /> : null}
        {group === "catalogue" ? <CataloguePanel onSource={setSource} /> : null}
      </div>

      {viewing ? <ArtifactViewer id={viewing} onClose={() => setViewing(null)} /> : null}
      {source ? <SourceOverlay kind={source} onClose={() => setSource(null)} /> : null}
    </AppFrame>
  );
}

function RegulationPanel({ onSource }: { onSource: (kind: SourceKind) => void }) {
  const regulation = useRegulation();
  return (
    <Region region={regulation} onSource={onSource}>
      {(page) => (
        <>
          <PageHead title="7 CFR part 1b, as pinned" count={page.pin} help={page.currency} />
          <div>
            {page.sections.map((section) => (
              <div key={section.id} className={css.section}>
                <div className={css.sectionHead}>
                  <span className={css.sectionId}>§ {section.id}</span>
                  <span className={css.sectionName}>{section.name}</span>
                  <span className={css.amended}>amended {section.amended}</span>
                </div>
                {section.note ? <p className={shared.note}>{section.note}</p> : null}
              </div>
            ))}
          </div>
          <div className={shared.notes}>
            <p className={shared.notesTitle}>Citations in the current text that do not resolve</p>
            {page.unresolvedCitations.map((line) => (
              <p key={line} className={shared.note}>
                {line}
              </p>
            ))}
            <p className={shared.meta}>{REGULATION_NOTE}</p>
          </div>
        </>
      )}
    </Region>
  );
}

function CataloguePanel({ onSource }: { onSource: (kind: SourceKind) => void }) {
  const catalogue = useCatalogue();
  return (
    <>
      <Region region={catalogue} onSource={onSource}>
        {(page) => (
          <>
            <PageHead title="Categorical exclusions" help={page.split} />
            <HTMLTable className={shared.table}>
              <thead>
                <tr>
                  <th>Citation</th>
                  <th>Description, verbatim</th>
                  <th>Documentation</th>
                </tr>
              </thead>
              {page.rows.map((row) => (
                <tbody key={row.citation} className={shared.group}>
                  <tr>
                    <td className={shared.cell}>{row.citation}</td>
                    <td className={shared.name}>{row.descriptionVerbatim}</td>
                    <td className={shared.cell}>
                      {row.documentationRequired ? "FANEC required — 1b.3(g)" : "None required"}
                    </td>
                  </tr>
                </tbody>
              ))}
            </HTMLTable>
          </>
        )}
      </Region>
      <div className={shared.notes}>
        <p className={shared.notesTitle}>Why this is empty</p>
        <p className={shared.note}>{CATALOGUE_EMPTY_REASON}</p>
      </div>
    </>
  );
}

/** Mounted only while an artifact is open, so the hook below runs
 *  unconditionally. The addressable unit is a page range, not a document. */
function ArtifactViewer({ id, onClose }: { id: string; onClose: () => void }) {
  const view = useReferenceArtifact(id);
  return (
    <Dialog isOpen title="Corpus artifact" onClose={onClose}>
      <div className={shared.dialogBody}>
        <Region region={view} onSource={() => undefined}>
          {(artifact) => (
            <>
              <p className={shared.name}>{artifact.row.title}</p>
              <p className={shared.meta}>
                {artifact.row.corpus} · {artifact.row.documentType} · {artifact.row.ruleVintage}
              </p>
              <p className={shared.meta}>
                Pages {artifact.pageRange} · opens at {artifact.opensAt}
              </p>
              <p className={shared.meta}>
                {artifact.row.sha256} · {artifact.row.byteLength} bytes ·{" "}
                {CITABLE[artifact.row.citable]}
              </p>
              {artifact.caveats.map((caveat) => (
                <p key={caveat} className={css.warning}>
                  {caveat}
                </p>
              ))}
            </>
          )}
        </Region>
      </div>
      <div className={shared.dialogFooter}>
        <span className={shared.meta}>⟨mediaSet.read⟩</span>
        <div className={shared.buttons}>
          <Button className={shared.secondary} onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
