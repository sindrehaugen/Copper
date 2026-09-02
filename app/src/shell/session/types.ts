export interface SessionContextType {
  actor: string;
  currentNamespace: string;
  allowedNamespaces: string[];
  isAuthenticated: boolean;
}

export interface NamespaceSwitcherProps {
  currentNamespace?: string;
  allowedNamespaces?: string[];
  onSwitchNamespace?: (namespace: string) => boolean | void;
  className?: string;
}