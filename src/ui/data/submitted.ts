import { useSyncExternalStore } from "react";

/** Which tabs have been SUBMITTED, addressed as `<stepKey>/<tabId>`.
 *
 *  CLIENT STATE, and for the same reason `seen.ts` is: nothing in this build
 *  writes, and a tab's answers being committed is a backend fact nobody has
 *  recorded yet. The alternative was to let the tick mean "could be submitted"
 *  — which is what it meant, and it read backwards: the only tabs offering
 *  Submit were the ticked ones, because a tick and an enabled Submit were the
 *  same condition said twice. A tick means finished everywhere else in this
 *  application, and it means finished here.
 *
 *  So readiness and completion are two facts now. Readiness — nothing
 *  outstanding — enables the Submit control. Completion — the officer pressed
 *  it — draws the tick, and Reopen takes it back.
 *
 *  `sessionStorage`, every access wrapped, exactly as in `seen.ts`. THE FDE
 *  REPLACES THIS with a port member: submission belongs in the proposal record
 *  under 1b.9(a), not in a browser. */
const KEY = "signatureready.submitted.tabs";

function read(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) {return [];}
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/* One snapshot object per state, cached — `useSyncExternalStore` compares
   snapshots by identity and re-parsing on every render would loop forever. */
let snapshot: string[] = read();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string[] {
  return snapshot;
}

export function markSubmitted(id: string): void {
  if (snapshot.includes(id)) {return;}
  snapshot = [...snapshot, id];
  try {
    sessionStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* The dot still clears for this page's lifetime; only the reload is lost. */
  }
  for (const listener of listeners) {listener();}
}

/** Taking a submission back. The lock is reversible by design — see the expert
 *  request overlay for the same reasoning. */
export function unsubmit(id: string): void {
  if (!snapshot.includes(id)) {
    return;
  }
  snapshot = snapshot.filter((held) => held !== id);
  try {
    sessionStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* Lost only across a reload. */
  }
  for (const listener of listeners) {
    listener();
  }
}

/** Test seam. Nothing in the application calls it. */
export function forgetSubmitted(): void {
  snapshot = [];
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
  for (const listener of listeners) {listener();}
}

export function useSubmitted(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

