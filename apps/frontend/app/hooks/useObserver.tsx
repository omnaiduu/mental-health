import { useRef, useEffect, useCallback } from "react";

export function useObserver({
  callback,
  options,
}: {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
}) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const callbackRef = useRef<IntersectionObserverCallback>(callback);

  // Use useCallback to memoize the ref setter function
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node) {
        observerRef.current = new IntersectionObserver(
          callbackRef.current,
          options
        );
        observerRef.current.observe(node);
      } else {
        observerRef.current = null;
      }
    },
    [options]
  );

  // Update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clean up the observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return setRef;
}
