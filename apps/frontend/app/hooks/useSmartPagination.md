# useSmartPagination

## Overview

`useSmartPagination` is a custom React hook that implements smart pagination for efficient rendering of large lists. It manages the visibility of items, removes items that aren't in view, and handles fetching new data when the first or last item comes into view.

## Features

- Smart pagination with automatic item removal
- Intersection Observer API for detecting when items enter/exit the viewport
- Race condition handling with AbortController
- Separate subscription for first and last items
- Error handling and loading state management

## Installation

This hook is custom-made and not available as a package. Copy the `useSmartPagination.ts` file into your project's `hooks` directory.

## API

### Parameters

The `useSmartPagination` hook accepts the following parameters:

1. `initialItems: T[]`: An array of initial items to populate the list.
2. `itemsToRemove: number`: The number of items to remove from the opposite end when new items are added.
3. `onFirstItemVisible: (data: T, signal: AbortSignal) => Promise<T[]>`: A callback function that fetches previous items when the first item becomes visible.
4. `onLastItemVisible: (data: T, signal: AbortSignal) => Promise<T[]>`: A callback function that fetches next items when the last item becomes visible.
5. `rootRef: React.RefObject<HTMLElement>`: A ref object for the scrollable container.

### Return Value

The hook returns an object with the following properties:

1. `items: T[]`: The current array of items to render.
2. `isLoading: boolean`: Indicates whether new items are being fetched.
3. `error: Error | null`: Contains any error that occurred during fetching.
4. `firstItemRef: React.RefObject<HTMLElement>`: A ref to be applied to the first item in the list.
5. `lastItemRef: React.RefObject<HTMLElement>`: A ref to be applied to the last item in the list.
6. `subscribeFirstItem: (data: T) => void`: A function to subscribe the first item's data.
7. `subscribeLastItem: (data: T) => void`: A function to subscribe the last item's data.

## Usage

Here's an example of how to use the `useSmartPagination` hook:

```tsx
import React, { useRef } from 'react';
import { useSmartPagination } from '../hooks/useSmartPagination';

interface Item {
  id: number;
  title: string;
}

const fetchItems = async (lastId: number | null, direction: 'next' | 'previous', signal: AbortSignal): Promise<Item[]> => {
  // Implement your API call here
};

export function InfiniteList() {
  const rootRef = useRef<HTMLDivElement>(null);

  const fetchPreviousItems = async (firstItem: Item, signal: AbortSignal) => {
    return await fetchItems(firstItem.id, 'previous', signal);
  };

  const fetchNextItems = async (lastItem: Item, signal: AbortSignal) => {
    return await fetchItems(lastItem.id, 'next', signal);
  };

  const {
    items,
    isLoading,
    error,
    firstItemRef,
    lastItemRef,
    subscribeFirstItem,
    subscribeLastItem,
  } = useSmartPagination<Item>(
    [], // Start with an empty array
    5, // Remove 5 items when paginating
    fetchPreviousItems,
    fetchNextItems,
    rootRef
  );

  return (
    <div ref={rootRef} className="h-screen overflow-auto">
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      <ul>
        {items.map((item, index) => (
          <li
            key={item.id}
            ref={index === 0 ? firstItemRef : index === items.length - 1 ? lastItemRef : null}
          >
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

