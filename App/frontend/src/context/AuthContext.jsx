import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('aerosec_token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('aerosec_user') || 'null'));

  function loginSession(authToken, authUser) {
    localStorage.setItem('aerosec_token', authToken);
    localStorage.setItem('aerosec_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  }

  function logoutSession() {
    localStorage.removeItem('aerosec_token');
    localStorage.removeItem('aerosec_user');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    loginSession,
    logoutSession
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

