import { useSessionStore } from '../../store/sessionStore';

export function useSession() {
  const actor = useSessionStore((s) => s.actor);
  const currentNamespace = useSessionStore((s) => s.currentNamespace);
  const allowedNamespaces = useSessionStore((s) => s.allowedNamespaces);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const isLoading = useSessionStore((s) => s.isLoading);
  const error = useSessionStore((s) => s.error);
  const setSession = useSessionStore((s) => s.setSession);
  const switchNamespace = useSessionStore((s) => s.switchNamespace);
  const resetSession = useSessionStore((s) => s.resetSession);
  const hardReset = useSessionStore((s) => s.hardReset);

  return {
    actor,
    currentNamespace,
    allowedNamespaces,
    isAuthenticated,
    isLoading,
    error,
    setSession,
    switchNamespace,
    resetSession,
    hardReset,
  };
}