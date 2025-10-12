import sdk from 'node-appwrite'

/**
 * Fonction CRON pour nettoyer automatiquement les fichiers cache anciens
 * dans le bucket Appwrite Storage
 * 
 * Variables d'environnement requises:
 * - APPWRITE_ENDPOINT
 * - APPWRITE_PROJECT
 * - APPWRITE_API_KEY
 * - BUCKET_ID (optionnel, défaut: 'flashcard-images')
 * - TTS_TTL_DAYS (optionnel, défaut: 90)
 * - PEXELS_TTL_DAYS (optionnel, défaut: 180)
 * - DRY_RUN (optionnel, défaut: false)
 * - BATCH_SIZE (optionnel, défaut: 100)
 * - MAX_EXECUTION_TIME (optionnel, défaut: 30000ms)
 */
export default async ({ res, log, error }) => {
  const startTime = Date.now()
  
  try {
    // Configuration
    const BUCKET = process.env.BUCKET_ID || 'flashcard-images'
    const TTS_TTL_DAYS = Number(process.env.TTS_TTL_DAYS || 90)
    const PEXELS_TTL_DAYS = Number(process.env.PEXELS_TTL_DAYS || 180)
    const DRY_RUN = process.env.DRY_RUN === 'true'
    const BATCH_SIZE = Number(process.env.BATCH_SIZE || 100)
    const MAX_EXECUTION_TIME = Number(process.env.MAX_EXECUTION_TIME || 30000) // 30s

    log(`[Cache Janitor] Début du nettoyage - Bucket: ${BUCKET}, Dry Run: ${DRY_RUN}`)
    log(`[Cache Janitor] TTL - TTS: ${TTS_TTL_DAYS}j, Pexels: ${PEXELS_TTL_DAYS}j`)

    // Initialiser le client Appwrite
    const client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT)
      .setKey(process.env.APPWRITE_API_KEY)

    const storage = new sdk.Storage(client)

    // Statistiques
    let cursor = null
    let scanned = 0
    let deleted = 0
    let errors = 0
    const now = Date.now()

    // Traitement par batches pour éviter les timeouts
    while (true) {
      // Vérifier le timeout
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        log(`[Cache Janitor] Timeout atteint (${MAX_EXECUTION_TIME}ms), arrêt du traitement`)
        break
      }

      // Récupérer un batch de fichiers
      const list = await storage.listFiles(BUCKET, undefined, BATCH_SIZE, cursor)
      
      if (!list.files || list.files.length === 0) {
        log(`[Cache Janitor] Aucun fichier trouvé, fin du traitement`)
        break
      }

      // Traiter chaque fichier du batch
      for (const file of list.files) {
        scanned++
        
        try {
          // Calculer l'âge du fichier
          const fileDate = new Date(file.$createdAt).getTime()
          const ageDays = (now - fileDate) / 86400000
          
          // Déterminer le type de cache et la TTL applicable
          const fileName = file.name || ''
          const isTTS = 
            fileName.startsWith('tts:') ||
            fileName.startsWith('tts-') ||
            fileName.startsWith('cache_tts_')
            
          const isPexels = 
            fileName.startsWith('pexels:') ||
            fileName.startsWith('pexels-') ||
            fileName.startsWith('cache_pexels_')
          
          let shouldDelete = false
          let reason = ''
          
          if (isTTS && ageDays > TTS_TTL_DAYS) {
            shouldDelete = true
            reason = `TTS cache expiré (${ageDays.toFixed(1)}d > ${TTS_TTL_DAYS}d)`
          } else if (isPexels && ageDays > PEXELS_TTL_DAYS) {
            shouldDelete = true
            reason = `Pexels cache expiré (${ageDays.toFixed(1)}d > ${PEXELS_TTL_DAYS}d)`
          }
          
          if (shouldDelete) {
            log(`[Cache Janitor] ${DRY_RUN ? '[DRY RUN] ' : ''}Suppression: ${fileName} - ${reason}`)
            
            if (!DRY_RUN) {
              await storage.deleteFile(BUCKET, file.$id)
            }
            
            deleted++
          } else if (isTTS || isPexels) {
            // Fichier cache mais pas encore expiré
            log(`[Cache Janitor] Conservation: ${fileName} (${ageDays.toFixed(1)}d, type: ${isTTS ? 'TTS' : 'Pexels'})`)
          }
          
        } catch (fileError) {
          errors++
          error(`[Cache Janitor] Erreur traitement fichier ${file.name}: ${fileError.message}`)
        }
      }

      // Vérifier s'il y a d'autres fichiers
      if (!list.cursor) {
        log(`[Cache Janitor] Fin de la liste des fichiers`)
        break
      }
      
      cursor = list.cursor
    }

    // Résumé final
    const executionTime = Date.now() - startTime
    const result = {
      success: true,
      dryRun: DRY_RUN,
      executionTimeMs: executionTime,
      scanned,
      deleted,
      errors,
      bucket: BUCKET,
      ttl: {
        tts: TTS_TTL_DAYS,
        pexels: PEXELS_TTL_DAYS
      }
    }

    log(`[Cache Janitor] Nettoyage terminé en ${executionTime}ms`)
    log(`[Cache Janitor] Résultat: ${scanned} scannés, ${deleted} supprimés, ${errors} erreurs`)

    return res.json(result)

  } catch (err) {
    const executionTime = Date.now() - startTime
    error(`[Cache Janitor] Erreur fatale: ${err.message}`)
    
    return res.json({
      success: false,
      error: err.message,
      executionTimeMs: executionTime
    }, 500)
  }
}
