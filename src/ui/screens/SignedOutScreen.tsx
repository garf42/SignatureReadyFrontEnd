import { NonIdealState } from "@blueprintjs/core";

import type { Region as RegionData, Session } from "@/ui/data/port";
import { Region } from "@/ui/components/Region";

import css from "@/ui/screens/SignedOutScreen.module.css";

/** Shown whenever the session is anything other than filled.
 *
 *  A session that has not answered yet is NOT a signed-out session. Telling a
 *  federal officer they are logged out because a lookup is slow is the worst
 *  thing this screen can do, and it is what happens if pending inherits these
 *  words. So the title is withheld while the question is still out, and the
 *  region carries the only thing there is to say — what is being asked. */
export function SignedOutScreen({ session }: { session: RegionData<Session> }) {
  return (
    <main className={css.screen}>
      <div className={css.inner}>
        {session.state === "pending" ? null : (
          <NonIdealState icon="log-in" title="You are signed out" />
        )}
        <Region region={session}>
          {() => null}
        </Region>
      </div>
    </main>
  );
}
