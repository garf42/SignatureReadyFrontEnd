import { useCallback, useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "@blueprintjs/core";

import css from "@/ui/components/TabStrip.module.css";

export interface StripTab {
  id: string;
  name: string;
  done: boolean;
}

/** One step's parts, as tabs above the panel that holds them.
 *
 *  A step with a single part renders no strip at all: a lone tab repeating the
 *  step's own name says nothing the panel heading does not, and reads as if
 *  the step and the tab were the same object. They are not — the step is the
 *  parent and the tabs divide the work inside it. */
export function TabStrip({
  tabs,
  selected,
  onSelect
}: {
  tabs: StripTab[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 });
  }, []);

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, tabs]);

  if (tabs.length < 2) return null;

  return (
    <div
      className={css.wrap}
      data-overflow-left={edges.left ? "yes" : "no"}
      data-overflow-right={edges.right ? "yes" : "no"}
    >
      <div className={css.scroller} ref={scroller} onScroll={measure}>
        <Tabs id="element-tabs" selectedTabId={selected} onChange={(next) => onSelect(String(next))}>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              id={tab.id}
              title={
                <>
                  {tab.name}
                  {tab.done ? <span className={css.done}>✓</span> : null}
                </>
              }
            />
          ))}
        </Tabs>
      </div>
      <div className={css.fade + " " + css.fadeLeft} />
      <div className={css.fade + " " + css.fadeRight} />
    </div>
  );
}
