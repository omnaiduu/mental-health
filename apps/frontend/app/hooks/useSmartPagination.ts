import { useState, useRef, useCallback, useEffect } from "react";

type CallbackFunction<T> = (data: T, signal: AbortSignal) => Promise<T[]> | T[];

export function useSmartPagination<T>({
	initialItems,
	itemsToRemove,
	onFirstItemVisible,
	onLastItemVisible,
	rootRef,
	initialItemCount, // New parameter
}: {

	initialItems: T[];
	itemsToRemove: number;
	onFirstItemVisible: CallbackFunction<T>;
	onLastItemVisible: CallbackFunction<T>;
	rootRef?: React.RefObject<HTMLDivElement>;
	initialItemCount: number;
}) {
	const [items, setItems] = useState<T[]>(initialItems);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [isPaginationActive, setIsPaginationActive] = useState(false);

	const firstItemRef = useRef<HTMLDivElement | null>(null);
	const lastItemRef = useRef<HTMLDivElement | null>(null);

	const firstItemDataRef = useRef<T | null>(null);
	const lastItemDataRef = useRef<T | null>(null);

	const firstObserverRef = useRef<IntersectionObserver | null>(null);
	const lastObserverRef = useRef<IntersectionObserver | null>(null);

	const firstAbortControllerRef = useRef<AbortController | null>(null);
	const lastAbortControllerRef = useRef<AbortController | null>(null);

	const subscribeFirstItem = useCallback(
		(data: T) => {
			if (isPaginationActive) {
				firstItemDataRef.current = data;
			}
		},
		[isPaginationActive],
	);

	const subscribeLastItem = useCallback(
		(data: T) => {
			if (isPaginationActive) {
				lastItemDataRef.current = data;
			}
		},
		[isPaginationActive],
	);

	const updateItems = useCallback(
		(isFirst: boolean, newItems: T[]) => {
			setItems((prevItems) => {
				if (isFirst) {
					return [...newItems, ...prevItems.slice(0, -itemsToRemove)];
				} else {
					return [...prevItems.slice(itemsToRemove), ...newItems];
				}
			});
		},
		[itemsToRemove],
	);

	const handleIntersection = useCallback(
		async (isFirst: boolean) => {
			if (isLoading || !isPaginationActive) return;

			setIsLoading(true);
			setError(null);

			// Abort any ongoing requests
			if (isFirst) {
				firstAbortControllerRef.current?.abort();
			} else {
				lastAbortControllerRef.current?.abort();
			}

			// Create a new AbortController
			const abortController = new AbortController();
			if (isFirst) {
				firstAbortControllerRef.current = abortController;
			} else {
				lastAbortControllerRef.current = abortController;
			}

			try {
				const data = isFirst
					? firstItemDataRef.current
					: lastItemDataRef.current;
				if (data) {
					const callback = isFirst ? onFirstItemVisible : onLastItemVisible;
					const newItems = await callback(data, abortController.signal);
					if (newItems.length > 0) { updateItems(isFirst, newItems);}
					
				}
			} catch (err) {
				if (err instanceof Error && err.name === "AbortError") {
					// Ignore aborted requests
					return;
				}
				setError(err instanceof Error ? err : new Error("An error occurred"));
			} finally {
				setIsLoading(false);
			}
		},
		[
			isLoading,
			isPaginationActive,
			onFirstItemVisible,
			onLastItemVisible,
			updateItems,
		],
	);

	useEffect(() => {
		const observerOptions = {
			
			rootMargin: "0px",
			threshold: 0.1,
		};

		if (rootRef !== undefined) {
			// @ts-ignore
			observerOptions.root = rootRef.current;
		}

		firstObserverRef.current = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting && isPaginationActive) {
				console.log("first item int");
				handleIntersection(true);
			}
		}, observerOptions);

		lastObserverRef.current = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting && isPaginationActive) {
				console.log("last item int");
				handleIntersection(false);
			}
		}, observerOptions);

		return () => {
			firstObserverRef.current?.disconnect();
			lastObserverRef.current?.disconnect();
		};
	}, [ isPaginationActive]);

	useEffect(() => {
		if (isPaginationActive) {
			if (firstItemRef.current) {
				firstObserverRef.current?.observe(firstItemRef.current);
			}
			if (lastItemRef.current) {
				lastObserverRef.current?.observe(lastItemRef.current);
			}
		}

		return () => {
			if (firstItemRef.current) {
				firstObserverRef.current?.unobserve(firstItemRef.current);
			}
			if (lastItemRef.current) {
				lastObserverRef.current?.unobserve(lastItemRef.current);
			}
		};
	}, [items, isPaginationActive]);

	useEffect(() => {
		return () => {
			firstAbortControllerRef.current?.abort();
			lastAbortControllerRef.current?.abort();
		};
	}, []);

	useEffect(() => {
		if (items.length >= initialItemCount && !isPaginationActive) {
			setIsPaginationActive(true);
		}

		if (items.length > 0 && isPaginationActive) {
			subscribeFirstItem(items[0]);
			subscribeLastItem(items[items.length - 1]);
		}
	}, [
		items,
	
		isPaginationActive,
	
	]);

	return {
		items,
		isLoading,
		error,
		firstItemRef,
		lastItemRef,
		
		isPaginationActive,
	};
}

