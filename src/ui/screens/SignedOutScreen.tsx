import { NonIdealState } from "@blueprintjs/core";

import type { Region as RegionData, Session } from "@/ui/data/port";
import { Region } from "@/ui/components/Region";

import css from "@/ui/screens/SignedOutScreen.module.css";

/** Shown whenever the session is anything other than filled. */
export function SignedOutScreen({ session }: { session: RegionData<Session> }) {
  return (
    <main className={css.screen}>
      <div className={css.inner}>
        <NonIdealState icon="log-in" title="You are signed out" />
        <Region region={session}>
          {() => null}
        </Region>
      </div>
    </main>
  );
}
