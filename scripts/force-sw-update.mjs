#!/usr/bin/env node

/**
 * Script pour forcer la mise à jour du Service Worker
 * À exécuter dans la console du navigateur en production
 */

console.log('🔄 Forçage de la mise à jour du Service Worker...');

// Fonction pour désactiver le Service Worker
async function unregisterServiceWorkers() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`📋 ${registrations.length} Service Worker(s) trouvé(s)`);
      
      for (const registration of registrations) {
        console.log('🗑️ Désactivation du Service Worker:', registration.scope);
        await registration.unregister();
      }
      
      console.log('✅ Service Workers désactivés');
    } catch (error) {
      console.error('❌ Erreur lors de la désactivation:', error);
    }
  } else {
    console.log('⚠️ Service Workers non supportés');
  }
}

// Fonction pour nettoyer les caches
async function clearCaches() {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      console.log(`📋 ${cacheNames.length} cache(s) trouvé(s)`);
      
      for (const cacheName of cacheNames) {
        console.log('🗑️ Suppression du cache:', cacheName);
        await caches.delete(cacheName);
      }
      
      console.log('✅ Caches nettoyés');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des caches:', error);
    }
  } else {
    console.log('⚠️ Cache API non supportée');
  }
}

// Fonction principale
async function forceServiceWorkerUpdate() {
  console.log('🚀 Début du nettoyage...');
  
  await unregisterServiceWorkers();
  await clearCaches();
  
  console.log('✅ Nettoyage terminé');
  console.log('🔄 Rechargez la page pour appliquer les changements');
  console.log('💡 Utilisez Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows) pour un hard refresh');
}

// Exécuter si dans un navigateur
if (typeof window !== 'undefined') {
  forceServiceWorkerUpdate();
} else {
  console.log('📋 Script de réinitialisation du Service Worker');
  console.log('💡 Copiez et collez ce code dans la console du navigateur :');
  console.log('');
  console.log('// Désactiver les Service Workers');
  console.log('navigator.serviceWorker.getRegistrations().then(registrations => {');
  console.log('  registrations.forEach(registration => registration.unregister());');
  console.log('});');
  console.log('');
  console.log('// Nettoyer les caches');
  console.log('caches.keys().then(cacheNames => {');
  console.log('  cacheNames.forEach(cacheName => caches.delete(cacheName));');
  console.log('});');
  console.log('');
  console.log('// Puis rechargez avec Cmd+Shift+R');
}
