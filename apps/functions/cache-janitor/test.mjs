/**
 * Script de test pour la fonction cache-janitor
 * Usage: node test.mjs
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Simuler l'environnement Appwrite Functions
const mockEnv = {
  APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  APPWRITE_PROJECT: process.env.APPWRITE_PROJECT || 'test-project',
  APPWRITE_API_KEY: process.env.APPWRITE_API_KEY || 'test-key',
  BUCKET_ID: process.env.BUCKET_ID || 'flashcard-images',
  TTS_TTL_DAYS: '7', // Test avec TTL court
  PEXELS_TTL_DAYS: '14', // Test avec TTL court
  DRY_RUN: 'true', // Mode test sécurisé
  BATCH_SIZE: '10',
  MAX_EXECUTION_TIME: '10000'
}

// Mock des fonctions Appwrite Functions
const mockRes = {
  json: (data, status = 200) => {
    console.log(`Response (${status}):`, JSON.stringify(data, null, 2))
    return { data, status }
  }
}

const mockLog = (message) => console.log(`[LOG] ${message}`)
const mockError = (message) => console.error(`[ERROR] ${message}`)

// Simuler l'import de la fonction
async function testCacheJanitor() {
  console.log('🧪 Test de la fonction cache-janitor')
  console.log('📋 Configuration:', mockEnv)
  console.log('')

  try {
    // Simuler l'environnement
    Object.assign(process.env, mockEnv)

    // Importer et exécuter la fonction
    const { default: cacheJanitor } = await import('./index.js')
    
    const result = await cacheJanitor({
      res: mockRes,
      log: mockLog,
      error: mockError
    })

    console.log('')
    console.log('✅ Test terminé avec succès')
    return result

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    throw error
  }
}

// Exécuter le test si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testCacheJanitor()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
