import { Client, Account } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error(
    'VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID must be defined in your .env file.'
  );
}

const client = new Client().setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);

/**
 * Récupère le JWT de la session Appwrite actuelle
 * Utilisé pour authentifier les requêtes vers l'API Vercel sécurisée
 */
export async function getSessionJWT(): Promise<string | null> {
  try {
    console.log('🔐 [Appwrite] Tentative de génération du JWT...');
    
    // Vérifier d'abord si l'utilisateur est connecté
    const currentUser = await account.get();
    console.log('👤 [Appwrite] Utilisateur connecté:', {
      id: currentUser.$id,
      email: currentUser.email,
      name: currentUser.name
    });
    
    const session = await account.createJWT();
    console.log('🎫 [Appwrite] JWT généré avec succès:', {
      jwtLength: session.jwt.length,
      jwtPreview: session.jwt.substring(0, 50) + '...'
    });
    
    return session.jwt;
  } catch (error) {
    console.error('❌ [Appwrite] Échec de génération du JWT:', error);
    
    // Logs détaillés pour le debug
    if (error instanceof Error) {
      console.error('❌ [Appwrite] Détails de l\'erreur:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return null;
  }
}

export default client;
