import React, { useRef } from "react";
import { Debouncer } from "../utils/debouncer";

export const useDebouncer = (debounceTime: number) => {
  const debouncerRef = useRef<Debouncer | null>(null);

  if (!debouncerRef.current) {
    debouncerRef.current = new Debouncer(debounceTime);
  }

  React.useEffect(
    () => () => {
      debouncerRef.current?.abort();
    },
    [],
  );

  return debouncerRef.current;
};

export function useDebouncedFunc<T>(
  func: (...args: any[]) => Promise<T>,
  debounceTime: number,
) {
  const debouncer = useDebouncer(debounceTime);

  const debouncedFunc = React.useCallback(
    async (...args: any[]) => debouncer.debounce(func, ...args),
    [debouncer, func],
  );

  return debouncedFunc;
}
