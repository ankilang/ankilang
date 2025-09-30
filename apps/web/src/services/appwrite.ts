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

export default client;
