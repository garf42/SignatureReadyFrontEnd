import { Link } from "react-router-dom";
import { NonIdealState } from "@blueprintjs/core";

import { INBOX } from "@/ui/routes";

import css from "@/ui/screens/NotFoundScreen.module.css";

export function NotFoundScreen() {
  return (
    <main className={css.screen}>
      <NonIdealState
        icon="search"
        title="That page is not here"
        action={<Link to={INBOX}>Go to your projects ›</Link>}
      />
    </main>
  );
}
