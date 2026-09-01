import { useEffect, useRef, useState } from "react";

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Observe an element's border-box size. Values are rounded to whole px and
 * updates are rAF-batched so continuous Foundry window drags neither loop the
 * ResizeObserver nor spam renders.
 */
export function useElementSize<T extends HTMLElement>(): [React.RefObject<T>, ElementSize] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });
  const frame = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    };

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(measure);
    });
    observer.observe(el);
    measure();

    return () => {
      cancelAnimationFrame(frame.current);
      observer.disconnect();
    };
  }, []);

  return [ref, size];
}
