import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, IndianLanguage } from '../types/index.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { persistRegistrationSuccess } from '../lib/registrationStorage.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{success: boolean, error?: string}>;
  register: (details: Record<string, unknown>) => Promise<{success: boolean, error?: string, user?: User}>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  quickSwitchPersona: (personaKey: string) => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setLanguage } = useLanguage();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('agrivision_token');
        if (!token) throw new Error('No token');
        
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.user?.language) {
            setLanguage(data.user.language);
          }
          localStorage.setItem('agrivision_user', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('agrivision_user');
          localStorage.removeItem('agrivision_token');
          setUser(null);
        }
      } catch (err) {
        console.warn('Session restore failed', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'password123' }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('agrivision_user', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('agrivision_token', data.token);
        }
        if (data.user.language) {
          setLanguage(data.user.language);
        }
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err) {
      console.error('Login failed:', err);
      return { success: false, error: 'Network error during login' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (details: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      localStorage.setItem('agrivision_user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('agrivision_token', data.token);
      }
      persistRegistrationSuccess(data.user);
      if (data.user.language) {
        setLanguage(data.user.language);
      }
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Registration failed:', err);
      return { success: false, error: 'Network error during registration' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Logout request failed', err);
    } finally {
      setUser(null);
      localStorage.removeItem('agrivision_user');
      localStorage.removeItem('agrivision_token');
    }
  };

  const switchRole = async (targetRole: UserRole) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('agrivision_user', JSON.stringify(data.user));
        if (data.user.language) {
          setLanguage(data.user.language);
        }
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickSwitchPersona = async (personaKey: string) => {
    setLoading(true);
    try {
      let email = 'ramesh.farmer@agrivision.in';
      let lang: IndianLanguage = 'kn';

      if (personaKey === 'punjab_farmer') {
        email = 'harpreet.farmer@agrivision.in';
        lang = 'hi';
      } else if (personaKey === 'ap_farmer') {
        email = 'venkat.farmer@agrivision.in';
        lang = 'te';
      } else if (personaKey === 'kolar_officer') {
        email = 'officer.kolar@agrivision.in';
        lang = 'en';
      } else if (personaKey === 'sih_admin') {
        email = 'admin@agrivision.in';
        lang = 'en';
      }

      await login(email, 'password123'); // seed accounts use default dummy password
    } catch (err) {
      console.error('Persona switch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...updated };
    setUser(next);
    localStorage.setItem('agrivision_user', JSON.stringify(next));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        login,
        register,
        logout,
        switchRole,
        quickSwitchPersona,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
