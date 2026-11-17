
import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const username = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('role');

    if (!username || !role || !sessionStorage.getItem('token')) {
      return null;
    }

    return { username, role };
  });

  const login = async (username, password) => {
    const response = await api.post('/auth/login', {
      username,
      password
    });

    const { token, tokenType, username: loggedInUsername, role } = response.data;

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('tokenType', tokenType);
    sessionStorage.setItem('username', loggedInUsername);
    sessionStorage.setItem('role', role);

    setUser({
      username: loggedInUsername,
      role
    });

    return response.data;
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
