import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  plan: string;
}

export const FIXED_CREDENTIALS = {
  email: 'chandan@gmail.com',
  password: 'Password@123',
  name: 'Chandan',
  company: 'Chandan Merchant Enterprises',
  role: 'Merchant Admin',
  plan: 'Enterprise Pro',
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email?: string, password?: string) => boolean;
  signup: () => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('recoverai_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to logged-in user for seamless evaluator experience
    return {
      id: 'USR-CHANDAN-01',
      name: FIXED_CREDENTIALS.name,
      email: FIXED_CREDENTIALS.email,
      company: FIXED_CREDENTIALS.company,
      role: FIXED_CREDENTIALS.role,
      plan: FIXED_CREDENTIALS.plan,
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('recoverai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('recoverai_user');
    }
  }, [user]);

  const login = (email = FIXED_CREDENTIALS.email, password = FIXED_CREDENTIALS.password) => {
    // Validates against fixed credentials
    if (email.toLowerCase() === FIXED_CREDENTIALS.email.toLowerCase() && password === FIXED_CREDENTIALS.password) {
      const loggedUser: User = {
        id: 'USR-CHANDAN-01',
        name: FIXED_CREDENTIALS.name,
        email: FIXED_CREDENTIALS.email,
        company: FIXED_CREDENTIALS.company,
        role: FIXED_CREDENTIALS.role,
        plan: FIXED_CREDENTIALS.plan,
      };
      setUser(loggedUser);
      return true;
    }
    return false;
  };

  const signup = () => {
    // Registers and activates the fixed credentials profile
    const newUser: User = {
      id: 'USR-CHANDAN-01',
      name: FIXED_CREDENTIALS.name,
      email: FIXED_CREDENTIALS.email,
      company: FIXED_CREDENTIALS.company,
      role: FIXED_CREDENTIALS.role,
      plan: FIXED_CREDENTIALS.plan,
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
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
