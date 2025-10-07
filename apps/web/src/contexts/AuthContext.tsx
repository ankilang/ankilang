import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { account } from '../services/appwrite';
import { AppwriteException, ID } from 'appwrite';
import type { Models } from 'appwrite';
import type { LoginData, SignupData } from '../types/shared';

export interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<Models.Session>;
  signup: (data: SignupData) => Promise<Models.User<Models.Preferences>>;
  logout: () => Promise<void>;
  updateEmail: (newEmail: string, password: string) => Promise<Models.User<Models.Preferences>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserSession = async () => {
    try {
      console.log('🔍 [AuthContext] Vérification de la session utilisateur...');
      const currentUser = await account.get();
      console.log('✅ [AuthContext] Utilisateur connecté:', {
        id: currentUser.$id,
        email: currentUser.email,
        name: currentUser.name,
        emailVerification: currentUser.emailVerification,
        phoneVerification: currentUser.phoneVerification
      });
      setUser(currentUser);
    } catch (error) {
      if ((error as AppwriteException).code !== 401) {
        console.error('❌ [AuthContext] Échec de récupération de la session:', error);
      } else {
        console.log('🔒 [AuthContext] Utilisateur non authentifié (401)');
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
    console.log('🔐 [AuthContext] Tentative de connexion pour:', data.email);
    const session = await account.createEmailPasswordSession(
      data.email,
      data.password
    );
    console.log('✅ [AuthContext] Connexion réussie, session créée:', {
      sessionId: session.$id,
      userId: session.userId,
      provider: session.provider
    });
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

  const updateEmail = async (newEmail: string, password: string) => {
    const updatedUser = await account.updateEmail(newEmail, password);
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
