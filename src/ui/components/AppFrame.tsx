import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

/** The frame every page sits in: wordmark, the section pane, and the page's own
 *  column. The section list is application structure rather than data, so it
 *  does not travel through a region — a page that cannot load its own contents
 *  still shows the way out of itself.
 *
 *  The pane opens collapsed and stays reachable everywhere, the project page
 *  included. `href` is kept for the affordance a link should have — middle
 *  click, copy link — but the click is handled by the router, because a plain
 *  href reloads the document and drops the shell with it. */
export function AppFrame({
  current,
  padded = true,
  children
}: {
  current: string;
  padded?: boolean;
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const { search } = useLocation();
  const navigate = useNavigate();
  const sections = sectionsFor(current);

  return (
    <main className={css.screen}>
      <header className={css.top}>
        <button
          type="button"
          className={css.paneToggle}
          aria-label={navOpen ? "Hide the sections" : "Show the sections"}
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          {navOpen ? "«" : "»"}
        </button>
        <Link className={css.wordmark} to={withSearch(INBOX, search)}>
          SignatureReady
        </Link>
      </header>

      <div className={css.split} data-nav={navOpen ? "open" : "closed"}>
        <aside className={css.nav} aria-label="Sections">
          <Menu>
            {sections.map((section) => {
              const to = withSearch(section.href, search);
              return (
                <MenuItem
                  key={section.id}
                  className={css.section + (section.current ? " " + css.current : "")}
                  icon={ICONS[section.icon]}
                  text={navOpen ? section.name : ""}
                  title={section.name}
                  href={to}
                  onClick={(event: MouseEvent<HTMLElement>) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                    event.preventDefault();
                    navigate(to);
                  }}
                />
              );
            })}
          </Menu>
        </aside>

        <section className={css.content} data-padded={padded ? "yes" : "no"}>
          {children}
        </section>
      </div>
    </main>
  );
}
