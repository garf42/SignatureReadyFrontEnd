import { SHARED_STEPS } from "@/ui/data/pathways";

export const INBOX = "/";
export const ARCHIVE = "/archive";
export const EXPERTS = "/experts";
export const LEARNING = "/learning";
export const REFERENCE = "/reference";

/** Step 0, first tab. The first thing an officer works on is intake, and the
 *  route says so rather than opening on a step the project has not reached. */
export const FIRST_TAB = `steps/${SHARED_STEPS[0].id}/${SHARED_STEPS[0].tabs[0].id}`;

export function projectPath(projectRef: string): string {
  return "/projects/" + encodeURIComponent(projectRef);
}

export function tabPath(projectRef: string, stepId: string, tabId: string): string {
  return projectPath(projectRef) + "/steps/" + stepId + "/" + tabId;
}

/** §7.7's items are steps of their own now, each holding one tab, so a
 *  cross-cutting route is an ordinary step route. */
export function crossPath(projectRef: string, tabId: string): string {
  return tabPath(projectRef, tabId, tabId);
}

/** Query keeps the state the officer is looking at when a link moves them. */
export function withSearch(path: string, search: string): string {
  return search && search !== "?" ? path + search : path;
}
