import { useState } from 'react'
import { getAccount } from '../../../data/mockAccount'
import PreferencesForm from '../../../components/settings/PreferencesForm'
import Section from '../../../components/ui/Section'
import PageMeta from '../../../components/seo/PageMeta'

export default function SettingsIndex() {
  const [account, setAccount] = useState(getAccount())
  const isOffline = !navigator.onLine

  const handlePreferencesUpdate = (updatedPreferences: any) => {
    setAccount(prev => ({ ...prev, preferences: updatedPreferences }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageMeta 
        title="Paramètres — Ankilang" 
        description="Préférences d'affichage et d'étude."
      />
      
      {/* Header centré */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Paramètres</h1>
            <p className="text-gray-600 text-lg">
              Personnalisez votre expérience d'apprentissage selon vos préférences
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal centré */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Bandeau hors-ligne */}
          {isOffline && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-yellow-800 text-sm font-medium">
                    Mode hors-ligne activé. Certaines fonctionnalités peuvent être limitées.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section des préférences */}
          <Section 
            title="Préférences" 
            description="Configurez l'interface et vos habitudes d'étude"
            className="shadow-lg"
          >
            <PreferencesForm 
              preferences={account.preferences} 
              onUpdate={handlePreferencesUpdate} 
            />
          </Section>

          {/* Informations supplémentaires */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Vos préférences sont sauvegardées automatiquement
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Toutes vos modifications sont synchronisées localement et seront disponibles même hors-ligne.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
