import { SHARED_STEPS } from "@/ui/data/pathways";

export const INBOX = "/";
export const ARCHIVE = "/archive";
export const EXPERTS = "/experts";
export const LEARNING = "/learning";
export const REFERENCE = "/reference";

/** Step 0, first tab. The first thing an officer works on is intake, and the
 *  route says so rather than opening on a step the project has not reached. */
export const FIRST_TAB = `steps/${SHARED_STEPS[0].id}/${SHARED_STEPS[0].tabs[0].id}`;

/** Step 0's first tab. The first thing an officer works on is intake, and the
 *  route says so rather than opening on a step no project has reached.
 *
 *  There is no longer a segment for surfaces that belong to no step. Every tab
 *  is inside the step whose completion it conditions, so a step key and a tab
 *  id address everything the project page has.  */

/** `:projectRef` is the project's PRIMARY KEY, not its unique identification
 *  number. The number is a display value: §1 records a live project row whose
 *  uniqueIdentificationNumber is null, which on its own settles that the number
 *  cannot address every project. Where a number has to appear on screen it is
 *  resolved to a key first — bindings.ts declares that resolver as its own
 *  binding rather than leaving the route parameter to mean two things.
 *
 *  The primary-key PROPERTY is not named anywhere in the register, so the
 *  binding leaves `primaryKey` null and the FDE fills it in. */
export function projectPath(projectRef: string): string {
  return "/projects/" + encodeURIComponent(projectRef);
}

export function tabPath(projectRef: string, stepId: string, tabId: string): string {
  return projectPath(projectRef) + "/steps/" + stepId + "/" + tabId;
}

/** Query keeps the state the officer is looking at when a link moves them.
 *
 *  Merges rather than concatenates, because a destination may carry its own
 *  query — `/reference?view=<id>` opens that document in the viewer — and
 *  gluing a second `?` on the end produces an address that parses as one key
 *  called `view` whose value swallows everything after it. The destination's
 *  own keys win: they are what the link is FOR, and the carried search is only
 *  the state the reader happened to be in. */
export function withSearch(path: string, search: string): string {
  if (!search || search === "?") {
    return path;
  }
  const [base, own] = path.split("?");
  const merged = new URLSearchParams(search);
  for (const [key, value] of new URLSearchParams(own ?? "")) {
    merged.set(key, value);
  }
  const q = merged.toString();
  return q ? base + "?" + q : base;
}
