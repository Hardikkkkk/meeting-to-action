
import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import {
  loginUser,
  registerUser,
  getUserProfile
} from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem('access_token')
  );
  const [loading, setLoading] = useState(true);

  // Restore the user's session when the app reloads
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(token);
        setUser(profile);
      } catch (error) {
        localStorage.removeItem('access_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [token]);

  // Login
  const login = async (credentials) => {
    const data = await loginUser(credentials);

    localStorage.setItem('access_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);

    return data;
  };

  // Register
  const register = async (userData) => {
    const data = await registerUser(userData);

    localStorage.setItem('access_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);

    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(token && user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
