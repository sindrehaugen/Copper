import { useState, useEffect, useCallback, useRef } from "react";
import type { Facet, FacetLoadContext } from "./types";
import { useSessionStore } from "../../store/sessionStore";

export function useFacetLoader<TData>(
  facet: Facet<TData>,
  entityType: string,
  entityId: string
) {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    const sessionState = useSessionStore.getState();
    const sessionContext: FacetLoadContext["session"] = {
      actor: sessionState.actor,
      currentNamespace: sessionState.currentNamespace,
    };

    const context: FacetLoadContext = {
      entityType,
      entityId,
      signal: controller.signal,
      session: sessionContext,
    };

    let isMounted = true;

    facet
      .load(context)
      .then((res) => {
        if (!controller.signal.aborted && isMounted) {
          setData(res);
          setIsLoading(false);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (
          controller.signal.aborted ||
          (err instanceof DOMException && err.name === "AbortError") ||
          (err instanceof Error && err.name === "AbortError")
        ) {
          return;
        }
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [facet, entityType, entityId, reloadKey]);

  return { data, isLoading, error, reload };
}
