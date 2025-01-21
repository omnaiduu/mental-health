import { useEffect, RefObject } from 'react';

interface ScrollOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  delay?: number;
}

export function useScrollToBottom(
  scrollRef: RefObject<HTMLElement>,
  dependencies: any[] = [],
  options: ScrollOptions = {}
) {
  const { behavior = 'smooth', block = 'end', delay = 100 } = options;

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior, block });
    }
  };

  useEffect(() => {
    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, delay);
    return () => clearTimeout(timeoutId);
  }, dependencies);
}

