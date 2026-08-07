import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const NavigationContext = createContext(null);

function normalizePath(path) {
  if (!path || path === '') {
    return '/';
  }

  return path.startsWith('/') ? path : '/' + path;
}

export function NavigationProvider({ children }) {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    function syncPath() {
      setPath(normalizePath(window.location.pathname));
    }

    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  const value = useMemo(
    () => ({
      path,
      navigate(to, { replace = false } = {}) {
        const nextPath = normalizePath(to);

        if (nextPath === window.location.pathname) {
          return;
        }

        if (replace) {
          window.history.replaceState({}, '', nextPath);
        } else {
          window.history.pushState({}, '', nextPath);
        }

        setPath(nextPath);
      }
    }),
    [path]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error('useNavigation must be used inside NavigationProvider');
  }

  return context;
}
