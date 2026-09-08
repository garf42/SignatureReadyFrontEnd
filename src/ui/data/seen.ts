import { useCallback, useSyncExternalStore } from "react";

/** Which drafted expert requests this person has already opened.
 *
 *  CLIENT STATE, and deliberately so. Whether a request exists is the
 *  backend's fact and travels through `useExpertQueue`; whether this person
 *  has looked at it is not a fact about the review at all. Part 1b has nothing
 *  to say about it, no act writes it, and putting it in the ontology would
 *  invent a property the rule never asks for. So the notification dot is the
 *  intersection of one backend fact — a request is drafted and not yet sent —
 *  with one local one, and only the first half needs an address.
 *
 *  `sessionStorage` rather than `localStorage`: a dot that stays cleared
 *  forever on one machine hides work from the next person to sit down, and the
 *  session is the honest lifetime for "I have seen this". Every access is
 *  wrapped, because a private window, a blocked-storage setting, or a
 *  thumbnail capture makes the accessor itself throw. */
const KEY = "signatureready.seen.expert-requests";

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

export function markSeen(id: string): void {
  if (snapshot.includes(id)) {return;}
  snapshot = [...snapshot, id];
  try {
    sessionStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* The dot still clears for this page's lifetime; only the reload is lost. */
  }
  for (const listener of listeners) {listener();}
}

/** Test seam. Nothing in the application calls it. */
export function forgetSeen(): void {
  snapshot = [];
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
  for (const listener of listeners) {listener();}
}

export function useSeen(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** How many drafted requests this person has not opened. The number the dot
 *  shows, and the only thing the frame needs from the queue. */
export function useUnopened(ids: string[]): number {
  const seen = useSeen();
  const count = useCallback(() => ids.filter((id) => !seen.includes(id)).length, [ids, seen]);
  return count();
}
