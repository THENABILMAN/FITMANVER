import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, getErrorMessage, type ApiResponse } from './api';

export interface User {
  id: string;
  username: string;
  email?: string;
  display_name?: string;
  onboarding_completed: boolean;
  profile?: Record<string, unknown>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, confirmPassword: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<User>>('/auth/me');
      if (res.data.success && res.data.data) {
        setUser(res.data.data as User);
        localStorage.setItem('fitman_user', JSON.stringify(res.data.data));
      }
    } catch {
      setUser(null);
      localStorage.removeItem('fitman_user');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('fitman_access_token');
    const stored = localStorage.getItem('fitman_user');
    if (stored) setUser(JSON.parse(stored));
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    const res = await api.post<ApiResponse>('/auth/login', { username, password });
    if (!res.data.success) throw new Error(res.data.error?.message || 'Login failed');
    const data = res.data.data as { access_token: string; refresh_token: string; user: User };
    localStorage.setItem('fitman_access_token', data.access_token);
    localStorage.setItem('fitman_refresh_token', data.refresh_token);
    localStorage.setItem('fitman_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (username: string, password: string, confirmPassword: string, email?: string) => {
    const res = await api.post<ApiResponse>('/auth/register', {
      username, password, confirm_password: confirmPassword, email: email || undefined,
    });
    if (!res.data.success) throw new Error(res.data.error?.message || 'Registration failed');
    const data = res.data.data as { access_token: string; refresh_token: string; user: User };
    localStorage.setItem('fitman_access_token', data.access_token);
    localStorage.setItem('fitman_refresh_token', data.refresh_token);
    localStorage.setItem('fitman_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('fitman_access_token');
    localStorage.removeItem('fitman_refresh_token');
    localStorage.removeItem('fitman_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { getErrorMessage };
