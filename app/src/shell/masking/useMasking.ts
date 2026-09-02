import { useSyncExternalStore, useCallback } from "react";
import { maskingStore } from "./masking-store.js";
import type { MaskingState } from "./types.js";

export function useMasking(): MaskingState {
  const isMasked = useSyncExternalStore(
    useCallback((onStoreChange) => maskingStore.subscribe(onStoreChange), []),
    () => maskingStore.isMasked,
    () => false
  );

  const setMasked = useCallback((masked: boolean) => {
    maskingStore.setMasked(masked);
  }, []);

  const toggleMasked = useCallback(() => {
    maskingStore.toggleMasked();
  }, []);

  return {
    isMasked,
    setMasked,
    toggleMasked,
  };
}
