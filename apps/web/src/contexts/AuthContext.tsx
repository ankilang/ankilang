import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { account } from '../services/appwrite';
import { AppwriteException, ID } from 'appwrite';
import type { Models } from 'appwrite';
import type { LoginData, SignupData } from '@ankilang/shared';

export interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<Models.Session>;
  signup: (data: SignupData) => Promise<Models.User<Models.Preferences>>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserSession = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      if ((error as AppwriteException).code !== 401) {
        console.error('Failed to fetch user session:', error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const login = async (data: LoginData) => {
    const session = await account.createEmailPasswordSession(
      data.email,
      data.password
    );
    await checkUserSession();
    return session;
  };

  const signup = async (data: SignupData) => {
    await account.create(ID.unique(), data.email, data.password, data.name);
    await account.createEmailPasswordSession(data.email, data.password);
    const newUser = await account.get();
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await account.deleteSession('current');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
