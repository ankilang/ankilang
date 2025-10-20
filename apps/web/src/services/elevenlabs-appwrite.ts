import { Functions, Storage, Databases } from 'appwrite';
import client from './appwrite';
import { CacheManager } from './cache-manager';

const functions = new Functions(client);
const storage = new Storage(client);
const db = new Databases(client);

const FUNCTION_ID = import.meta.env.VITE_APPWRITE_ELEVENLABS_FUNCTION_ID || "68e3951700118da88425";
const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID || "ankilang-main";
const CARDS_COL = import.meta.env.VITE_APPWRITE_CARDS_COLLECTION_ID || "cards";
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || "flashcard-images";

// Types pour ElevenLabs
// Langues principales supportées par ElevenLabs (nettoyées des doublons)
export type ElevenLabsLanguage = 
  | 'en' | 'fr' | 'de' | 'es' | 'it' | 'pt' | 'pl' | 'tr' | 'ru' | 'ja' | 'ko' | 'zh'
  | 'ar' | 'hi' | 'th' | 'vi' | 'nl' | 'sv' | 'da' | 'no' | 'fi' | 'cs' | 'hu' | 'ro'
  | 'bg' | 'hr' | 'sk' | 'sl' | 'et' | 'lv' | 'lt' | 'el' | 'he' | 'uk' | 'be'
  | 'hy' | 'az' | 'kk' | 'ky' | 'uz' | 'tg' | 'mn' | 'ne' | 'si' | 'my' | 'km' | 'lo'
  | 'am' | 'sw' | 'zu' | 'af' | 'sq' | 'eu' | 'is' | 'ga' | 'cy' | 'mt' | 'mk' | 'sr' | 'bs' | 'me';

/**
 * Convertit une langue en ISO 639-1 (fr-FR → fr, de-DE → de)
 */
function toISO639_1(lang?: string): string | undefined {
  if (!lang) return undefined;
  const parts = lang.toLowerCase().split('-');
  const two = parts[0];
  return two?.length === 2 ? two : undefined;
}

/**
 * Convertit base64 en Blob
 */
function b64ToBlob(b64: string, type = 'audio/mpeg'): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

/**
 * NOUVELLE INTERFACE UNIFIÉE - Fonction principale ElevenLabs
 * Retour unifié avec url, mimeType, provider
 */
export async function ttsViaAppwrite(params: {
  text: string;
  language_code: string;       // ex: 'de' ou 'de-DE'
  voice_id?: string;           // par défaut Rachel
  save_to_storage?: boolean;   // true => upload Storage
  output_format?: string;     // ex: 'mp3_22050_64' (léger) ou 'mp3_44100_128'
}): Promise<{ url: string; mimeType: string; provider: 'elevenlabs' }> {
  if (!params.text?.trim()) throw new Error('Le texte est vide');

  const language_code = toISO639_1(params.language_code);
  
  const payload = {
    text: params.text.trim(),
    voice_id: params.voice_id ?? '21m00Tcm4TlvDq8ikWAM', // Rachel par défaut
    language_code,                             // ISO 639-1
    save_to_storage: params.save_to_storage === true,
    output_format: params.output_format || 'mp3_22050_64'
    // NB: on laisse la fonction choisir le modèle (turbo vs multilingual) selon la langue
  };

  console.log('🎵 [ElevenLabs] Appel de la fonction Appwrite:', {
    functionId: FUNCTION_ID,
    text: payload.text,
    voice_id: payload.voice_id,
    language_code: payload.language_code,
    save_to_storage: payload.save_to_storage,
    output_format: payload.output_format
  });

  // Démarre l'exécution
  const exec = await functions.createExecution(FUNCTION_ID, JSON.stringify(payload));

  console.log('📡 [ElevenLabs] Exécution créée:', {
    executionId: exec.$id,
    status: exec.status
  });

  // Polling simple (si jamais la réponse n'est pas immédiate)
  let final = exec;
  if (exec.status !== 'completed' && exec.$id) {
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 400));
      final = await functions.getExecution(FUNCTION_ID, exec.$id);
      if (final.status === 'completed' || final.status === 'failed') break;
    }
  }

  console.log('📡 [ElevenLabs] Réponse finale reçue:', {
    status: final.status,
    executionId: final.$id
  });

  if (final.status === 'failed') {
    throw new Error(`Échec TTS (executionId=${final.$id}): ${(final as any).response || 'Pas de réponse'}`);
  }

  // Lecture tolérante de la réponse (response ou responseBody)
  const raw =
    (final as any).response !== undefined ? (final as any).response :
    (final as any).responseBody !== undefined ? (final as any).responseBody :
    '';

  console.log('[ElevenLabs] exec response (first 200):', String(raw).slice(0, 200));

  let data: any = {};
  try {
    data = raw ? JSON.parse(String(raw)) : {};
  } catch (e) {
    throw new Error(`Réponse JSON invalide: ${String(raw).slice(0, 200)}`);
  }
  
  if (!data?.success) throw new Error(data?.error || 'TTS failed');

  if (payload.save_to_storage) {
    if (!data.fileUrl) throw new Error('Upload demandé mais fileUrl manquant');
    console.log('✅ [ElevenLabs] Fichier sauvegardé:', {
      fileUrl: data.fileUrl,
      fileId: data.fileId,
      executionId: final.$id
    });
    return { 
      url: data.fileUrl, 
      mimeType: data.contentType || 'audio/mpeg', 
      provider: 'elevenlabs' as const 
    };
  }

  if (!data.audio) throw new Error('Audio manquant');
  
  // Retour unifié avec data URL pour lecture immédiate
  const dataUrl = `data:audio/mpeg;base64,${data.audio}`;
  
  console.log('✅ [ElevenLabs] Audio généré:', {
    audioLength: data.audio.length,
    executionId: final.$id
  });

  return { 
    url: dataUrl, 
    mimeType: data.contentType || 'audio/mpeg', 
    provider: 'elevenlabs' as const 
  };
}

// Fonction de compatibilité avec l'ancien système (pré-écoute)
export async function ttsToBlob(text: string, language: string, voice?: string): Promise<Blob> {
  const result = await ttsViaAppwrite({
    text,
    language_code: language,
    voice_id: voice,
    save_to_storage: false,
    output_format: 'mp3_22050_64' // Léger pour pré-écoute
  });
  
  // Convertir data URL en Blob pour compatibilité
  if (result.url.startsWith('data:')) {
    const response = await fetch(result.url);
    return await response.blob();
  }
  
  throw new Error('Format de retour inattendu');
}

// Fonction pour la sauvegarde (export Anki)
export async function ttsToStorage(text: string, language: string, voice?: string): Promise<{ fileUrl: string; fileId: string }> {
  const result = await ttsViaAppwrite({
    text,
    language_code: language,
    voice_id: voice,
    save_to_storage: true,
    output_format: 'mp3_44100_128' // Qualité pour export
  });
  
  // Extraire fileId de l'URL si nécessaire
  const fileId = result.url.split('/').pop()?.split('?')[0] || 'unknown';
  
  return { fileUrl: result.url, fileId };
}

/**
 * @deprecated Utiliser ttsViaAppwrite() à la place
 * 1) PREVIEW : pas d'upload, retour Blob + URL locale
 * Utilisé pour la pré-écoute avant sauvegarde
 */
export async function ttsPreview({
  text,
  language,
  voiceId = '21m00Tcm4TlvDq8ikWAM',
  outputFormat = 'mp3_22050_64'
}: {
  text: string;
  language: string;
  voiceId?: string;
  outputFormat?: string;
}): Promise<{ blob: Blob; url: string; mime: string }> {
  if (!text?.trim()) throw new Error('Le texte est vide');

  const language_code = toISO639_1(language);
  
  const payload = {
        text: text.trim(),
    language_code,
        voice_id: voiceId,
    output_format: outputFormat,
        save_to_storage: false
  };

  console.log('🎵 [TTS Preview] Génération audio pour pré-écoute:', {
    text: payload.text,
    language_code: payload.language_code,
    voice_id: payload.voice_id,
    output_format: payload.output_format
  });

  const exec = await functions.createExecution(FUNCTION_ID, JSON.stringify(payload));
  
  let res = await functions.getExecution(FUNCTION_ID, exec.$id);
  let attempts = 0;
  const maxAttempts = 15; // Limite pour UX plus snappy
  while ((res.status === 'waiting' || res.status === 'processing') && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 350));
    res = await functions.getExecution(FUNCTION_ID, exec.$id);
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('TTS timeout: La génération audio prend trop de temps');
  }

  if (res.status === 'failed') {
    throw new Error(`TTS Preview failed: ${(res as any).response || 'No response'}`);
  }

  // Lecture tolérante de la réponse (response ou responseBody)
  const raw =
    (res as any).response !== undefined ? (res as any).response :
    (res as any).responseBody !== undefined ? (res as any).responseBody :
    '';

  console.log('[TTS Preview] exec response (first 200):', String(raw).slice(0, 200));

  let data: any = {};
  try {
    data = raw ? JSON.parse(String(raw)) : {};
  } catch (e) {
    throw new Error(`Réponse JSON invalide: ${String(raw).slice(0, 200)}`);
  }
  
  if (data?.success !== true || !data.audio) {
    throw new Error(data?.error || 'Pré-écoute échouée');
  }

  const blob = b64ToBlob(data.audio, data.contentType || 'audio/mpeg');
  const url = URL.createObjectURL(blob);
  CacheManager.trackObjectUrl(url);
  
  console.log('✅ [TTS Preview] Audio généré:', {
      size: blob.size, 
      type: blob.type,
    mime: data.contentType || 'audio/mpeg'
  });

  return { 
    blob, 
    url, 
    mime: data.contentType || 'audio/mpeg' 
  };
}

/**
 * @deprecated Utiliser ttsViaAppwrite() à la place
 * 2) SAVE : upload côté fonction + lien carte (maj document)
 * Utilisé pour sauvegarder l'audio et lier à la carte
 */
export async function ttsSaveAndLink({
  cardId,
  text,
  language,
  voiceId = '21m00Tcm4TlvDq8ikWAM',
  outputFormat = 'mp3_44100_128'
}: {
  cardId: string;
  text: string;
  language: string;
  voiceId?: string;
  outputFormat?: string;
}): Promise<{ fileId: string; fileUrl: string; mime: string }> {
  if (!text?.trim()) throw new Error('Le texte est vide');
  if (!cardId) throw new Error('ID de carte manquant');

  const language_code = toISO639_1(language);
  
  const payload = {
    text: text.trim(),
    language_code,
    voice_id: voiceId,
    output_format: outputFormat,
    save_to_storage: true
  };

  console.log('💾 [TTS Save] Sauvegarde audio pour carte:', {
    cardId,
    text: payload.text,
    language_code: payload.language_code,
    voice_id: payload.voice_id,
    output_format: payload.output_format
  });

  const exec = await functions.createExecution(FUNCTION_ID, JSON.stringify(payload));
  
  let res = await functions.getExecution(FUNCTION_ID, exec.$id);
  let attempts = 0;
  const maxAttempts = 15; // Limite pour UX plus snappy
  while ((res.status === 'waiting' || res.status === 'processing') && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 350));
    res = await functions.getExecution(FUNCTION_ID, exec.$id);
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('TTS timeout: La génération audio prend trop de temps');
  }

  if (res.status === 'failed') {
    throw new Error(`TTS Save failed: ${(res as any).response || 'No response'}`);
  }

  // Lecture tolérante de la réponse (response ou responseBody)
  const raw =
    (res as any).response !== undefined ? (res as any).response :
    (res as any).responseBody !== undefined ? (res as any).responseBody :
    '';

  console.log('[TTS Save] exec response (first 200):', String(raw).slice(0, 200));

  let data: any = {};
  try {
    data = raw ? JSON.parse(String(raw)) : {};
  } catch (e) {
    throw new Error(`Réponse JSON invalide: ${String(raw).slice(0, 200)}`);
  }
  
  if (data?.success !== true || !data.fileId) {
    throw new Error(data?.error || 'Sauvegarde échouée');
  }

  // Construire une URL "view" Appwrite si la fonction ne renvoie pas déjà fileUrl
  const fileUrl = data.fileUrl ?? `${client.config.endpoint}/storage/buckets/${BUCKET_ID}/files/${data.fileId}/view?project=${client.config.project}`;

  // Mettre à jour la carte avec les informations audio
  await db.updateDocument(DB_ID, CARDS_COL, cardId, {
    audioFileId: data.fileId,
    audioMime: data.contentType || 'audio/mpeg',
    audioUrl: fileUrl, // URL de visualisation pour lecture rapide
  });

  console.log('✅ [TTS Save] Carte mise à jour avec audio:', {
    cardId,
    fileId: data.fileId,
    fileUrl,
    mime: data.contentType || 'audio/mpeg'
  });

  return { 
    fileId: data.fileId, 
    fileUrl, 
    mime: data.contentType || 'audio/mpeg' 
  };
}

/**
 * @deprecated Utiliser la suppression directe via Appwrite SDK
 * Suppression en cascade : carte + audio
 * Option A : Côté front (simple)
 */
export async function deleteCardAndAudio(card: { $id: string; audioFileId?: string }): Promise<void> {
  console.log('🗑️ [Delete] Suppression carte et audio:', {
    cardId: card.$id,
    audioFileId: card.audioFileId
  });

  // Supprimer l'audio du Storage si présent
  if (card.audioFileId) {
    try {
      await storage.deleteFile(BUCKET_ID, card.audioFileId);
      console.log('✅ [Delete] Audio supprimé:', card.audioFileId);
  } catch (error) {
      console.warn('⚠️ [Delete] Impossible de supprimer l\'audio:', error);
    }
  }

  // Supprimer la carte
  await db.deleteDocument(DB_ID, CARDS_COL, card.$id);
  console.log('✅ [Delete] Carte supprimée:', card.$id);
}

/**
 * @deprecated Utiliser la nouvelle interface via tts.ts
 */
export async function playTTS(text: string, language: string, voice?: string): Promise<HTMLAudioElement> {
  const { url } = await ttsPreview({
    text,
    language,
    voiceId: voice
  });
  
  const audio = new Audio(url);
  
  audio.addEventListener('ended', () => { URL.revokeObjectURL(url); });
  audio.addEventListener('error', () => { URL.revokeObjectURL(url); });
  
  return audio;
}