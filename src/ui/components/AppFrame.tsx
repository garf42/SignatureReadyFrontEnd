import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, MenuItem } from "@blueprintjs/core";

import type { SectionIcon } from "@/ui/data/port";
import { sectionsFor } from "@/ui/data/port";
import { INBOX, withSearch } from "@/ui/routes";

import css from "@/ui/components/AppFrame.module.css";

const ICONS: Record<SectionIcon, "inbox" | "document" | "box" | "grid-view" | "people"> = {
  inbox: "inbox",
  documents: "document",
  archive: "box",
  grid: "grid-view",
  people: "people"
};

/** The frame the inbox and the four supporting pages share: wordmark, the
 *  section pane, and the page's own column. The section list is application
 *  structure rather than data, so it does not travel through a region — a
 *  page that cannot load its own contents still shows the way out of itself. */
export function AppFrame({ current, children }: { current: string; children: ReactNode }) {
  const [navShut, setNavShut] = useState(false);
  const { search } = useLocation();
  const sections = sectionsFor(current);

  return (
    <main className={css.screen}>
      <header className={css.top}>
        <button
          type="button"
          className={css.paneToggle}
          aria-label={navShut ? "Show the sections" : "Hide the sections"}
          onClick={() => setNavShut((v) => !v)}
        >
          {navShut ? "»" : "«"}
        </button>
        <Link className={css.wordmark} to={withSearch(INBOX, search)}>
          SignatureReady
        </Link>
      </header>

      <div className={css.split} data-nav={navShut ? "closed" : "open"}>
        <aside className={css.nav}>
          <Menu>
            {sections.map((section) => (
              <MenuItem
                key={section.id}
                className={css.section + (section.current ? " " + css.current : "")}
                icon={ICONS[section.icon]}
                text={navShut ? "" : section.name}
                href={withSearch(section.href, search)}
              />
            ))}
          </Menu>
        </aside>

        <section className={css.content}>{children}</section>
      </div>
    </main>
  );
}
