import { useState, useCallback, useRef } from "react";

type FetchFn<TParams, TData> = (params: TParams) => Promise<TData>;

interface UseFetchResult<TParams, TData> {
  fetch: (params: TParams) => Promise<void>;
  isLoading: boolean;
  data: TData | null;
  error: Error | null;
  abort: () => void;
}

export function useFetch<TParams = void, TData = any>(
  fetchFn: FetchFn<TParams, TData>
): UseFetchResult<TParams, TData> {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const fetch = useCallback(
    async (params: TParams) => {
      abort();

      setIsLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const result = await fetchFn({
          ...params,
          signal: abortControllerRef.current.signal,
        } as TParams);

        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [abort, fetchFn]
  );

  return {
    fetch,
    isLoading,
    data,
    error,
    abort,
  };
}
