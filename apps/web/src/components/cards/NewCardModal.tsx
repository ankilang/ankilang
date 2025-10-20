import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { 
  X, Brain, Type, Sparkles, AlertCircle, Check, 
  Languages, Image as ImageIcon,
  Volume2, Trash2, Search
} from 'lucide-react'
import { AudioCard } from './AudioCard'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubscription } from '../../contexts/SubscriptionContext'
import PremiumTeaser from '../PremiumTeaser'
import { translate as deeplTranslate, type TranslateResponse as DeeplResponse } from '../../services/deepl'
import { generateTTS, persistTTS } from '../../services/tts'
import { ttsToTempURL, type VotzLanguage } from '../../services/votz'
import { pexelsSearchPhotos, pexelsCurated, pexelsOptimizePreview, pexelsOptimizePersist } from '../../services/pexels'
import type { PexelsPhoto } from '../../types/ankilang-vercel-api'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { reviradaTranslate, toReviCode } from '../../services/revirada'

// Type pour le formulaire (sans validation Zod)
interface CardFormData {
  type: 'basic' | 'cloze'
  recto?: string
  verso?: string
  versoImage?: string
  versoImageType?: 'appwrite' | 'external'
  versoAudio?: string
  clozeTextTarget?: string
  clozeImage?: string
  clozeImageType?: 'appwrite' | 'external'
  extra?: string
  tags?: string
}

// Stockage temporaire des métadonnées d'image pour upload différé
// Plus de cache image: on gère uniquement une photo sélectionnée + Object URL de preview

interface NewCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading?: boolean
  error?: string
  themeId: string
  themeLanguage: string
  themeColors: {
    primary: string
    secondary: string
    accent: string
    gradient: string
  }
}

export default function NewCardModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false, 
  error,
  themeId,
  themeLanguage,
  themeColors
}: NewCardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [selectedType, setSelectedType] = useState<'basic' | 'cloze'>('basic')
  const [isTranslating, setIsTranslating] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isOptimizingImage, setIsOptimizingImage] = useState(false)
  const [pendingPhoto, setPendingPhoto] = useState<PexelsPhoto | null>(null)
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPexelsPicker, setShowPexelsPicker] = useState(false)

  const online = useOnlineStatus()
  
  // Subscription context
  const { features, upgradeToPremium } = useSubscription()
  
  const isOccitan = themeLanguage === 'oc' || themeLanguage === 'oc-gascon'
  const occitanDialect: VotzLanguage = themeLanguage === 'oc-gascon' ? 'gascon' : 'languedoc'
  // Traduction disponible pour tous (gratuit + premium), avec exception Occitan
  const canTranslate = true
  const canAddAudio = features.canAddAudio || isOccitan

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<CardFormData>({
    // Validation manuelle au lieu de Zod pour éviter les problèmes de compatibilité
    defaultValues: {
      type: 'basic',
      recto: '',
      verso: '',
      extra: '',
      tags: ''
    },
    mode: 'onChange'
  })

  const watchedValues = watch()
  const versoHasText = !!((watchedValues as any).verso && (watchedValues as any).verso.trim().length > 0)
  
  // Validation manuelle pour remplacer Zod
  const isFormValid = (() => {
    if (watchedValues.type === 'basic') {
      return watchedValues.recto && watchedValues.recto.trim().length > 0 && 
             watchedValues.verso && watchedValues.verso.trim().length > 0
    } else if (watchedValues.type === 'cloze') {
      return watchedValues.clozeTextTarget && watchedValues.clozeTextTarget.trim().length > 0
    }
    return false
  })()

  const clozeRef = useRef<HTMLTextAreaElement>(null)
  const [clozeHint, setClozeHint] = useState('')
  const [showClozeAnswers, setShowClozeAnswers] = useState(false)
  const [imageQuery, setImageQuery] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [imagePage, setImagePage] = useState(1)

  // Preview image: on conserve uniquement l'Object URL et la photo sélectionnée

  // Nettoyage des Object URLs pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      if (previewObjectUrl) {
        console.log('🧹 Révocation de l\'Object URL:', previewObjectUrl)
        URL.revokeObjectURL(previewObjectUrl)
      }
    }
  }, [previewObjectUrl])

  // Nettoyage lors de la fermeture de la modale
  useEffect(() => {
    if (!isOpen) {
      // Révoquer l'Object URL si elle existe
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl)
      }
      // Réinitialiser
      setPreviewObjectUrl(null)
      setPendingPhoto(null)
    }
  }, [isOpen, previewObjectUrl])

  // Pré-remplir la recherche d'images avec le recto/verso ou cloze
  useEffect(() => {
    if (!imageQuery && !imageInput) {
      if (selectedType === 'basic') {
        const base = (watchedValues as any).verso || (watchedValues as any).recto || ''
        if (base) setImageInput(base)
      } else {
        const base = (watchedValues as any).clozeTextTarget || ''
        if (base) setImageInput(base.replace(/\{\{c\d+::|\}\}/g, ''))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType])

  // Debounce la recherche pour limiter les requêtes
  useEffect(() => {
    const t = setTimeout(() => {
      const q = imageInput.trim()
      setImagePage(1)
      setImageQuery(q)
    }, 500)
    return () => { clearTimeout(t); }
  }, [imageInput])

  // Recherche d'images via Vercel API (Pexels)
  const imagesQuery = useQuery({
    queryKey: ['pexels', imageQuery, imagePage],
    queryFn: () => {
      const common = { per_page: 12, page: imagePage, orientation: 'landscape', size: 'medium', locale: 'fr-FR' }
      if (imageQuery && imageQuery.trim()) {
        return pexelsSearchPhotos(imageQuery.trim(), common)
      }
      return pexelsCurated(common)
    },
    // ⚙️ Réduit les appels réseau: n'activer que si la modale est ouverte,
    // le picker Pexels visible, et l'ajout d'images autorisé
    enabled: online && features.canAddImages && isOpen && showPexelsPicker,
    staleTime: 1000 * 60 * 5,
  })

  const handlePickImage = async (photo: PexelsPhoto) => {
    setIsOptimizingImage(true)
    try {
      console.log('🖼️ Preview image Pexels (sans upload)...')
      const preview = await pexelsOptimizePreview({
        imageUrl: photo.src?.medium || photo.src?.large || photo.src?.original,
        width: 600,
        height: 400,
        quality: 80,
        format: 'webp'
      })
      const blob = await fetch(preview.optimizedImage).then(r => r.blob())
      const url = URL.createObjectURL(blob)
      setPreviewObjectUrl(url)
      setPendingPhoto(photo)
      if (selectedType === 'basic') {
        setValue('versoImage', url)
        setValue('versoImageType', 'external')
      } else {
        setValue('clozeImage', url)
        setValue('clozeImageType', 'external')
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement de l\'image:', error)

      // Fallback: utiliser l'URL Pexels directe en cas d'erreur
      console.log('⚠️ Fallback: utilisation de l\'URL Pexels directe')
      const fallbackUrl = photo.src?.large || photo.src?.medium || photo.src?.original
      if (selectedType === 'basic') {
        setValue('versoImage', fallbackUrl)
        setValue('versoImageType', 'external')
      } else {
        setValue('clozeImage', fallbackUrl)
        setValue('clozeImageType', 'external')
      }
      setPendingPhoto(null)
    } finally {
      setIsOptimizingImage(false)
    }
  }

  // Traduction via Vercel API (fallback sur mock si indisponible)

  const deeplMutation = useMutation({
    mutationFn: async (text: string) => {
      // Utilise la fonction DeepL (Vercel API) avec payload (text,targetLang)
      const target = themeLanguage === 'no' ? 'nb' : themeLanguage
      const res: DeeplResponse = await deeplTranslate(text, target, 'fr')
      return res
    }
  })

  const handleTranslate = async () => {
    if (selectedType !== 'basic') return
    const rectoText = getValues('recto')
    if (!rectoText?.trim()) return
    if (!canTranslate) { upgradeToPremium(); return }
    if (!online) return

    setIsTranslating(true)
    try {
      if (isOccitan) {
        console.log('🔄 Tentative de traduction Revirada:', {
          text: rectoText,
          sourceLang: toReviCode('fr'),
          targetLang: toReviCode(themeLanguage),
          isOccitan,
          themeLanguage
        })
        
        const r = await reviradaTranslate({
          text: rectoText,
          sourceLang: toReviCode('fr'),
          targetLang: toReviCode(themeLanguage)
        })
        
        console.log('📥 Réponse Revirada:', r)
        
        if ((r as any).success) {
          const translated = (r as any).translated
          setValue('verso', Array.isArray(translated) ? translated[0] : translated)
          console.log('✅ Traduction réussie:', translated)
        } else {
          throw new Error((r as any).error || 'Revirada error')
        }
      } else {
        const r = await deeplMutation.mutateAsync(rectoText)
        if (r.success) {
          const item = Array.isArray(r.result) ? (r.result[0] ?? null) : r.result
          if (item) setValue('verso', item.translated)
        } else {
          throw new Error(r.error)
        }
      }
    } catch (err) {
      console.error('Erreur de traduction:', err)
      // Fallback plus informatif
      setValue('verso', `[ERREUR API] ${rectoText}`)
    } finally {
      setIsTranslating(false)
    }
  }

  // Gestion des fichiers

  const ttsAbort = useRef<AbortController | null>(null)
  
  // TTS pour l'occitan via Votz
  const votzTtsMutation = useMutation({
    mutationFn: async (text: string) => {
      const audioUrl = await ttsToTempURL(text, occitanDialect)
      console.log('🎵 URL audio temporaire Votz générée:', audioUrl)
      return { audioUrl }
    }
  })
  
  // TTS générique (ElevenLabs pour autres langues, Votz pour occitan)
  const ttsMutation = useMutation({
    mutationFn: async (text: string) => {
      ttsAbort.current = new AbortController()
      try {
        // Détection automatique du provider selon la langue (géré par generateTTS)
        
        return await generateTTS({ 
          text, 
          language_code: themeLanguage
        })
      } finally {
        ttsAbort.current = null
      }
    }
  })

  const handleAudioUpload = async () => {
    if (!canAddAudio) {
      upgradeToPremium()
      return
    }
    if (!online) return
    const text = getValues('verso') || getValues('recto') || ''
    if (!text.trim()) return
    
    setIsGeneratingAudio(true)
    
    try {
      const isOccitan = themeLanguage === 'oc' || themeLanguage === 'oc-gascon'
      
      if (isOccitan) {
        // Utiliser Votz pour l'occitan (languedocien ou gascon)
        console.log(`🔊 Génération TTS Votz (${occitanDialect}):`, text)
        const res = await votzTtsMutation.mutateAsync(text)
        
        // CORRECTION GARANTIE : Stocker l'URL Votz permanente pour l'export
        // L'URL Votz est déjà permanente et sera téléchargée lors de l'export
        setValue('versoAudio', res.audioUrl)
        console.log('✅ Audio Votz stocké pour export:', { url: res.audioUrl })
      } else {
        // Utiliser ElevenLabs pour les autres langues
        console.log(`🔊 Génération TTS ElevenLabs (${themeLanguage}):`, text)
        const res = await ttsMutation.mutateAsync(text)
        setValue('versoAudio', res?.url || '')
        console.log('✅ Audio ElevenLabs généré:', { url: res?.url })
      }
    } catch (err) {
      console.error('Erreur TTS:', err)
      // Fallback mock pour éviter de bloquer l'utilisateur
      const mockAudioUrl = `audio_${Date.now()}.mp3`
      setValue('versoAudio', mockAudioUrl)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const removeMedia = (field: string) => {
    setValue(field as any, '')
    // Arrêter l'audio en cours si on supprime le média audio
    if (field === 'versoAudio') {
      if (currentAudio) {
        currentAudio.pause()
        setCurrentAudio(null)
        setAudioPlaying(false)
      }
      // Note: Pas de nettoyage nécessaire pour les URLs temporaires Votz
    }
  }

  // Fonction pour jouer/arrêter l'audio
  const toggleAudioPlayback = async (e?: React.MouseEvent) => {
    if (e) { 
      e.preventDefault() 
      e.stopPropagation() 
    }
    console.log('▶️ PLAY MANUEL (ne doit JAMAIS appeler handleFormSubmit)')
    
    const audioUrl = getValues('versoAudio')
    console.log('🎵 toggleAudioPlayback - URL audio:', audioUrl)
    
    if (!audioUrl) {
      console.warn('⚠️ Aucune URL audio disponible')
      return
    }

    try {
      if (currentAudio && !currentAudio.paused) {
        // Arrêter l'audio en cours
        console.log('⏸️ Arrêt de l\'audio en cours')
        currentAudio.pause()
        setAudioPlaying(false)
        setCurrentAudio(null)
      } else {
        // Vérifier que l'URL audio est valide (HTTP, blob:, ou data:)
        if (!audioUrl.startsWith('http') && !audioUrl.startsWith('data:audio/') && !audioUrl.startsWith('blob:')) {
          console.error('❌ URL audio invalide:', audioUrl)
          return
        }
        
        // Normaliser l'URL audio si nécessaire
        const normalizedUrl = (() => {
          // Pour les URLs data:audio/, les utiliser directement
          if (audioUrl.startsWith('data:audio/')) {
            return audioUrl
          }
          
          // Pour les URLs HTTP, normaliser Votz si nécessaire
          try {
            const u = new URL(audioUrl)
            const hasExt = /\.[a-zA-Z0-9]+$/.test(u.pathname)
            if (!hasExt) {
              u.pathname = `${u.pathname}.mp3`
              return u.toString()
            }
            return audioUrl
          } catch {
            return audioUrl
          }
        })()

        console.log('▶️ Création et lecture de l\'audio')
        const audio = new Audio(normalizedUrl)
        audio.preload = 'auto'
        
        // Ajouter plus de logs pour debug
        audio.addEventListener('loadstart', () => {
          console.log('🔄 Début du chargement audio')
        })
        
        audio.addEventListener('canplay', () => {
          console.log('✅ Audio prêt à être joué')
        })
        
        audio.addEventListener('ended', () => {
          console.log('🏁 Audio terminé')
          setAudioPlaying(false)
          setCurrentAudio(null)
        })
        
        audio.addEventListener('error', (e) => {
          console.error('❌ Erreur de lecture audio:', e)
          const target = e.target as HTMLAudioElement
          console.error('❌ Audio error details:', {
            error: target?.error,
            networkState: target?.networkState,
            readyState: target?.readyState,
            src: target?.src
          })
          setAudioPlaying(false)
          setCurrentAudio(null)
        })
        
        // Tenter de jouer l'audio
        console.log('🎵 Tentative de lecture...')
        await audio.play()
        console.log('✅ Audio en cours de lecture')
        setCurrentAudio(audio)
        setAudioPlaying(true)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la lecture audio:', error)
      if (error instanceof Error) {
        console.error('❌ Error stack:', error.stack)
      }
      setAudioPlaying(false)
      setCurrentAudio(null)
    }
  }

  useEffect(() => {
    if (isOpen) {
      // Réinitialiser le formulaire uniquement à l'ouverture de la modale
      reset()
      setSelectedType('basic')
      setValue('type', 'basic')
      // Nettoyer l'audio en cours lors de l'ouverture/fermeture du modal
      if (currentAudio) {
        currentAudio.pause()
        setCurrentAudio(null)
        setAudioPlaying(false)
      }
      // Nettoyer l'état de génération audio
      setIsGeneratingAudio(false)
      // Nettoyer l'état de soumission
      setIsSubmitting(false)
      // Note: Pas de nettoyage nécessaire pour les URLs temporaires Votz
    }
    // Important: ne pas mettre currentAudio/getValues en dépendances pour éviter
    // un reset involontaire lors du changement d'état audio (lecture/pause)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Nettoyer l'audio lors du démontage du composant
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause()
        setCurrentAudio(null)
      }
      // Note: Pas de nettoyage nécessaire pour les URLs temporaires Votz
    }
  }, [currentAudio, getValues])

  const handleTypeChange = (type: 'basic' | 'cloze') => {
    setSelectedType(type)
    setValue('type', type)
    reset()
    setValue('type', type)
  }

  // Helpers Cloze
  const nextClozeNumber = (text: string) => {
    const nums: number[] = []
    const re = /\{\{c(\d+)::/g
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) nums.push(parseInt(m[1]!, 10))
    return (nums.length ? Math.max(...nums) : 0) + 1
  }

  const insertClozeAtSelection = () => {
    const el = clozeRef.current
    if (!el) return
    const value = el.value || ''
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const selected = value.slice(start, end)
    const n = nextClozeNumber(value)
    const answer = selected || 'réponse'
    const hint = clozeHint.trim()
    const cloze = `{{c${n}::${answer}${hint ? `:${hint}` : ''}}}`
    const newText = value.slice(0, start) + cloze + value.slice(end)
    setValue('clozeTextTarget', newText, { shouldValidate: true })
    // replacer le curseur après l'insertion
    setTimeout(() => {
      const pos = start + cloze.length
      el.focus()
      el.setSelectionRange(pos, pos)
    }, 0)
  }

  // Prévisualisation des clozes (affiche les réponses ou des blancs)
  const renderClozePreview = (src: string) => {
    if (!src) return null
    const normalized = src
    const re = /\{\{c(\d+)::([^}|]+?)(?::([^}|]+?))?\}\}/g
    const out: React.ReactNode[] = []
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(normalized))) {
      const [full, _num, ans, hint] = m as unknown as [string, string, string, string?]
      if (m.index > last) {
        out.push(<span key={`txt-${last}`}>{normalized.slice(last, m.index)}</span>)
      }
      if (showClozeAnswers) {
        out.push(
          <span key={`cloze-${m.index}`} className="px-1 rounded bg-yellow-100 text-yellow-900">
            {ans}
            {hint ? <span className="opacity-70"> ({hint})</span> : null}
          </span>
        )
      } else {
        out.push(
          <span key={`blank-${m.index}`} className="px-1 rounded bg-gray-200 text-gray-600">
            {hint ? `[${hint}]` : ' [...] '}
          </span>
        )
      }
      last = m.index + full.length
    }
    if (last < normalized.length) {
      out.push(<span key={`tail-${last}`}>{normalized.slice(last)}</span>)
    }
    return out
  }



  const handleFormSubmit = async (data: CardFormData) => {
    if (isSubmitting) {
      console.log('🚫 Soumission déjà en cours, ignorée')
      return
    }

    if (isGeneratingAudio) {
      console.log('🚫 Soumission bloquée pendant la génération audio')
      return
    }

    setIsSubmitting(true)
    console.log('💾 SUBMIT MANUEL: clic Enregistrer')

    try {
      const w: any = watchedValues

      // ✨ NOUVEAU: Upload de l'image dans Appwrite uniquement au moment de la sauvegarde
      let finalImageUrl: string | undefined
      let finalImageType: 'appwrite' | 'external' = 'external'

      if (features.canAddImages && pendingPhoto) {
        // Persister l'image dans Appwrite au moment du submit
        console.log('📤 Persist de l\'image dans Appwrite (au submit)')
        const persisted = await pexelsOptimizePersist({
          imageUrl: pendingPhoto.src?.medium || pendingPhoto.src?.large || pendingPhoto.src?.original,
          width: 600,
          height: 400,
          quality: 80,
          format: 'webp'
        })
        finalImageUrl = persisted.url
        finalImageType = 'appwrite'
        console.log('✅ Image persistée via Appwrite')
      } else if (features.canAddImages && (w.versoImage || w.clozeImage)) {
        // Pas de métadonnées pending = l'utilisateur a peut-être mis une URL externe manuellement
        finalImageUrl = w.versoImage || w.clozeImage
        finalImageType = w.versoImageType || w.clozeImageType || 'external'
      }

      // Persistance audio si l'audio est un preview local (blob/data)
      let finalAudioUrl: string | undefined = w.versoAudio || undefined
      try {
        const maybe = w.versoAudio as string | undefined
        if (maybe && (maybe.startsWith('blob:') || maybe.startsWith('data:'))) {
          const textForTts = getValues('verso') || getValues('recto') || ''
          if (textForTts.trim()) {
            const persistedAudio = await persistTTS({ text: textForTts, language_code: themeLanguage })
            finalAudioUrl = persistedAudio.url
          }
        }
      } catch (_e) {
        console.warn('⚠️ Persist TTS échoué, conserver l\'URL actuelle')
      }

      const common = {
        themeId,
        extra: (data as any).extra || undefined,
        imageUrl: finalImageUrl,
        imageUrlType: finalImageType,
        audioUrl: finalAudioUrl,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      }

      const submitData = data.type === 'basic'
        ? { type: 'basic', frontFR: (data as any).recto, backText: (data as any).verso, ...common }
        : { type: 'cloze', clozeTextTarget: (data as any).clozeTextTarget, ...common }

      onSubmit(submitData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="absolute inset-0 backdrop-blur-sm" />
          
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Header */}
              <div 
                className="relative px-6 py-6 border-b border-white/20 rounded-t-3xl"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.secondary} 0%, white 100%)`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                      style={{ backgroundColor: themeColors.primary + '20' }}
                    >
                      <Sparkles className="w-6 h-6" style={{ color: themeColors.accent }} />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-dark-charcoal">
                        Nouvelle carte
                      </h2>
                      <p className="font-sans text-sm text-dark-charcoal/70">
                        Langue cible : <span className="font-medium">{themeLanguage.toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md border border-white/40 text-dark-charcoal hover:bg-white transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                  {/* Sélecteur de type */}
                  <div>
                    <label className="block font-sans text-sm font-medium text-dark-charcoal mb-3">
                      Type de carte
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        type="button"
                        onClick={() => { handleTypeChange('basic'); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                          selectedType === 'basic'
                            ? 'border-current shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: selectedType === 'basic' ? themeColors.secondary : 'white',
                          color: selectedType === 'basic' ? themeColors.accent : '#6B7280'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Brain className="w-6 h-6" />
                          <div className="text-left">
                            <div className="font-sans font-semibold">Recto/Verso</div>
                            <div className="text-xs opacity-70">Carte classique</div>
                          </div>
                        </div>
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={() => { handleTypeChange('cloze'); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                          selectedType === 'cloze'
                            ? 'border-current shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: selectedType === 'cloze' ? themeColors.secondary : 'white',
                          color: selectedType === 'cloze' ? themeColors.accent : '#6B7280'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Type className="w-6 h-6" />
                          <div className="text-left">
                            <div className="font-sans font-semibold">Cloze</div>
                            <div className="text-xs opacity-70">Texte à trous</div>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Contenu selon le type */}
                  <AnimatePresence mode="wait">
                    {selectedType === 'basic' ? (
                      <motion.div
                        key="basic"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {/* RECTO */}
                        <div className="bg-white/50 rounded-2xl p-6 border border-white/60">
                          <div className="flex items-center gap-2 mb-4">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: themeColors.secondary }}
                            >
                              <span className="text-sm font-bold" style={{ color: themeColors.accent }}>R</span>
                            </div>
                            <h3 className="font-display text-lg font-semibold text-dark-charcoal">Recto</h3>
                          </div>
                          
                          <div>
                            <label htmlFor="recto" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                              Contenu principal *
                            </label>
                            <textarea
                              id="recto"
                              {...register('recto')}
                              rows={3}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans resize-none"
                              placeholder="Texte en français à traduire..."
                            />
                                                         {(errors as any).recto && (
                               <motion.p 
                                 initial={{ opacity: 0, y: -10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className="mt-1 text-sm text-red-600 flex items-center gap-1"
                               >
                                 <AlertCircle className="w-4 h-4" />
                                 {(errors as any).recto.message}
                               </motion.p>
                             )}
                          </div>
                        </div>

                        {/* VERSO */}
                        <div className="bg-white/50 rounded-2xl p-6 border border-white/60">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: themeColors.secondary }}
                              >
                                <span className="text-sm font-bold" style={{ color: themeColors.accent }}>V</span>
                              </div>
                              <h3 className="font-display text-lg font-semibold text-dark-charcoal">Verso</h3>
                            </div>
                            
                            {/* Bouton Traduire */}
                            {canTranslate ? (
                              <motion.button
                                type="button"
                                onClick={handleTranslate}
                                disabled={!online || isTranslating || !(watchedValues as any).recto?.trim()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                style={{ 
                                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`
                                }}
                              >
                                {isTranslating ? (
                                  <>
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                    Traduction...
                                  </>
                                ) : (
                                  <>
                                    <Languages className="w-4 h-4" />
                                    {isOccitan ? 'Traduire avec Revirada' : 'Traduire automatiquement'}
                                  </>
                                )}
                              </motion.button>
                            ) : (
                              <motion.button
                                type="button"
                                onClick={upgradeToPremium}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                              >
                                <Languages className="w-4 h-4" />
                                Traduire (Premium)
                              </motion.button>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="verso" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                                Contenu traduit *
                              </label>
                              <textarea
                                id="verso"
                                {...register('verso')}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans resize-none"
                                placeholder={`Traduction en ${themeLanguage}...`}
                              />
                              {(errors as any).verso && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  {(errors as any).verso.message}
                                </motion.p>
                              )}
                              
                            </div>
                            {/* Zone actions après saisie du Verso: Audio + Image */}
                            {versoHasText && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {/* Colonne Audio */}
                                  {canAddAudio ? (
                                    <div>
                                      {(watchedValues as any).versoAudio ? (
                                        <AudioCard
                                          audioUrl={(watchedValues as any).versoAudio}
                                          onPlay={toggleAudioPlayback}
                                          onDelete={() => { removeMedia('versoAudio'); }}
                                          isPlaying={audioPlaying}
                                        />
                                      ) : (
                                        <motion.button
                                          type="button"
                                          onClick={handleAudioUpload}
                                          disabled={isGeneratingAudio || votzTtsMutation.isPending || ttsMutation.isPending}
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          className="w-full h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-3 hover:border-gray-400 transition-colors disabled:opacity-50"
                                        >
                                          {(isGeneratingAudio || votzTtsMutation.isPending || ttsMutation.isPending) ? (
                                            <div className="flex items-center gap-3">
                                              {/* Equalizer animation */}
                                              <div className="flex items-end gap-1 h-5">
                                                {[0, 0.2, 0.4, 0.6].map((d, i) => (
                                                  <motion.div
                                                    key={i}
                                                    initial={{ scaleY: 0.6 }}
                                                    animate={{ scaleY: [0.6, 1, 0.6] }}
                                                    transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: d }}
                                                    className="w-1.5 bg-gray-400 rounded"
                                                    style={{ height: '100%' }}
                                                  />
                                                ))}
                                              </div>
                                              <span className="font-sans text-sm text-gray-600">Génération audio...</span>
                                            </div>
                                          ) : (
                                            <>
                                              <Volume2 className="w-6 h-6 text-gray-500" />
                                              <span className="font-sans text-sm text-gray-600">
                                                {isOccitan ? 'Ajouter la prononciation avec Votz' : 'Ajouter la prononciation'}
                                              </span>
                                            </>
                                          )}
                                        </motion.button>
                                      )}
                                    </div>
                                  ) : (
                                    <PremiumTeaser feature="L'enregistrement audio" onUpgrade={upgradeToPremium}>
                                      <div className="w-full h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2">
                                        <Volume2 className="w-6 h-6 text-gray-400" />
                                        <span className="font-sans text-sm text-gray-500">Enregistrer la prononciation</span>
                                      </div>
                                    </PremiumTeaser>
                                  )}

                                  {/* Colonne Image (Pexels) */}
                                  <div>
                                    {features.canAddImages ? (
                                      (watchedValues as any).versoImage ? (
                                        <div className="relative w-full h-16 bg-white rounded-xl border border-gray-200 flex items-center justify-between px-3">
                                          <div className="flex items-center gap-3 overflow-hidden">
                                            <img 
                                              src={(watchedValues as any).versoImage}  
                                              alt="Illustration verso" 
                                              className="w-12 h-12 object-cover rounded"
                                              width="48"
                                              height="48"
                                              loading="lazy"
                                              decoding="async"
                                            />
                                            <span className="font-sans text-sm text-gray-600 truncate">Image sélectionnée</span>
                                          </div>
                                          <motion.button
                                            type="button"
                                            onClick={() => { removeMedia('versoImage'); }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </motion.button>
                                        </div>
                                      ) : (
                                        <motion.button
                                          type="button"
                                          onClick={() => { setShowPexelsPicker(v => !v); }}
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          className="w-full h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:border-gray-400 transition-colors"
                                        >
                                          <ImageIcon className="w-6 h-6 text-gray-500" />
                                          <span className="font-sans text-sm text-gray-600">Ajouter une image Pexels</span>
                                        </motion.button>
                                      )
                                    ) : (
                                      <PremiumTeaser feature="L'ajout d'images" onUpgrade={upgradeToPremium}>
                                        <div className="w-full h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2">
                                          <ImageIcon className="w-6 h-6 text-gray-400" />
                                          <span className="font-sans text-sm text-gray-500">Ajouter une image</span>
                                        </div>
                                      </PremiumTeaser>
                                    )}
                                  </div>
                                </div>

                                {/* Pexels Picker (déplié) */}
                                {features.canAddImages && !((watchedValues as any).versoImage) && showPexelsPicker && (
                                  <div className="space-y-3">
                                    <div className="relative">
                                      <input
                                        type="text"
                                        value={imageInput}
                                        onChange={(e) => { setImageInput(e.target.value); }}
                                        placeholder="Rechercher une image sur Pexels..."
                                        className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans text-sm"
                                      />
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="mt-1">
                                      {isOptimizingImage && (
                                        <div className="text-sm text-purple-600 font-medium mb-2 flex items-center gap-2">
                                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                                          Optimisation de l'image en cours...
                                        </div>
                                      )}
                                      {imagesQuery.isLoading && (
                                        <div className="text-sm text-gray-500">Recherche d'images…</div>
                                      )}
                                      {imagesQuery.error && (
                                        <div className="text-sm text-red-600">Erreur de recherche d'images</div>
                                      )}
                                      {imagesQuery.data?.photos?.length ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                          {imagesQuery.data.photos.map((img: any) => (
                                            <button
                                              key={img.id}
                                              type="button"
                                              className="relative group rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-purple-300"
                                              onClick={() => handlePickImage(img)}
                                            >
                                              <div className="w-full h-24 bg-white flex items-center justify-center">
                                                <img
                                                  loading="lazy"
                                                  decoding="async"
                                                  src={img.src?.medium || img.src?.small || img.src?.tiny}
                                                  alt={img.alt || ''}
                                                  width="96"
                                                  height="96"
                                                  className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-105"
                                                />
                                              </div>
                                              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </button>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2">
                                          <ImageIcon className="w-8 h-8 text-gray-400" />
                                          <span className="font-sans text-sm text-gray-500">Saisissez un mot-clé puis Entrée (ou explorez la sélection)</span>
                                        </div>
                                      )}
                                    </div>
                                    {/* Pagination */}
                                    {imagesQuery.data && (
                                      <div className="mt-3 flex items-center justify-between">
                                        <button
                                          type="button"
                                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                                          disabled={imagesQuery.data.page <= 1}
                                          onClick={() => { setImagePage(p => Math.max(1, p - 1)); }}
                                        >
                                          Précédent
                                        </button>
                                        <div className="text-xs text-gray-500">Page {imagesQuery.data.page}</div>
                                        <button
                                          type="button"
                                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                                          disabled={!imagesQuery.data.next_page}
                                          onClick={() => { setImagePage(p => p + 1); }}
                                        >
                                          Suivant
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cloze"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <div className="bg-white/50 rounded-2xl p-6 border border-white/60">
                          <div className="flex items-center gap-2 mb-4">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: themeColors.secondary }}
                            >
                              <Type className="w-4 h-4" style={{ color: themeColors.accent }} />
                            </div>
                            <h3 className="font-display text-lg font-semibold text-dark-charcoal">Texte à trous</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label htmlFor="clozeTextTarget" className="block font-sans text-sm font-medium text-dark-charcoal">
                                  Texte avec trous *
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={clozeHint}
                                    onChange={(e) => { setClozeHint(e.target.value); }}
                                    placeholder="Indice (optionnel)"
                                    className="px-2 py-1 border border-gray-200 rounded-md text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={insertClozeAtSelection}
                                    className="px-3 py-1.5 rounded-md bg-purple-600 text-white text-xs hover:bg-purple-700"
                                    title="Créer un trou autour de la sélection"
                                  >
                                    + Ajouter un trou
                                  </button>
                                </div>
                              </div>
                              {(() => {
                                const { ref: rhfRef, ...reg } = register('clozeTextTarget')
                                return (
                                  <textarea
                                    id="clozeTextTarget"
                                    {...reg}
                                    ref={(el) => { rhfRef(el); (clozeRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el }}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans resize-none"
                                    placeholder="La capitale de la France est {{c1::Paris:capitale}}."
                                  />
                                )
                              })()}
                              <p className="mt-1 text-xs text-dark-charcoal/60 font-sans">
                                Utilisez le format {'{{c1::réponse[:indice]}}'} et le bouton pour créer des trous rapidement.
                              </p>
                              

                              {/* Aperçu cloze */}
                              <div className="mt-3 p-3 border rounded-lg bg-white/60">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-dark-charcoal">Prévisualisation</span>
                                  <label className="flex items-center gap-2 text-xs text-dark-charcoal">
                                    <input
                                      type="checkbox"
                                      checked={showClozeAnswers}
                                      onChange={(e) => { setShowClozeAnswers(e.target.checked); }}
                                    />
                                    Afficher les réponses
                                  </label>
                                </div>
                                <div className="mt-2 text-sm text-dark-charcoal leading-6">
                                  {renderClozePreview(((watchedValues as any).clozeTextTarget || ''))}
                                </div>
                              </div>
                                                             {(errors as any).clozeTextTarget && (
                                 <motion.p 
                                   initial={{ opacity: 0, y: -10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   className="mt-1 text-sm text-red-600 flex items-center gap-1"
                                 >
                                   <AlertCircle className="w-4 h-4" />
                                   {(errors as any).clozeTextTarget.message}
                                 </motion.p>
                               )}
                            </div>

                            {/* Image Cloze */}
                            <div>
                              <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                                Image (optionnelle)
                              </label>
                                                             {features.canAddImages ? (
                                 (watchedValues as any).clozeImage ? (
                                  <div className="relative w-full h-40 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                                    <img 
                                      src={(watchedValues as any).clozeImage}  
                                      alt="Cloze" 
                                      className="max-w-full max-h-full object-contain"
                                      width="400"
                                      height="160"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                    <motion.button
                                      type="button"
                                      onClick={() => { removeMedia('clozeImage'); }}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                  <div className="relative">
                                      <input
                                        type="text"
                                        value={imageInput}
                                        onChange={(e) => { setImageInput(e.target.value); }}
                                        placeholder="Rechercher une image sur Pexels..."
                                        className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans text-sm"
                                      />
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="mt-1">
                                      {isOptimizingImage && (
                                        <div className="text-sm text-purple-600 font-medium mb-2 flex items-center gap-2">
                                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                                          Optimisation de l'image en cours...
                                        </div>
                                      )}
                                      {imagesQuery.isLoading && (
                                        <div className="text-sm text-gray-500">Recherche d'images…</div>
                                      )}
                                      {imagesQuery.error && (
                                        <div className="text-sm text-red-600">Erreur de recherche d'images</div>
                                      )}
                                      {imagesQuery.data?.photos?.length ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                          {imagesQuery.data.photos.map((img: any) => (
                                            <button
                                              key={img.id}
                                              type="button"
                                              className="relative group rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-purple-300"
                                              onClick={() => handlePickImage(img)}
                                            >
                                              <div className="w-full h-24 bg-white flex items-center justify-center">
                                                <img
                                                  loading="lazy"
                                                  decoding="async"
                                                  src={img.src?.medium || img.src?.small || img.src?.tiny}
                                                  alt={img.alt || ''}
                                                  width="96"
                                                  height="96"
                                                  className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-105"
                                                />
                                              </div>
                                              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </button>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2">
                                          <ImageIcon className="w-8 h-8 text-gray-400" />
                                          <span className="font-sans text-sm text-gray-500">Saisissez un mot-clé puis Entrée</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              ) : (
                                <PremiumTeaser feature="L'ajout d'images" onUpgrade={upgradeToPremium}>
                                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2">
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                    <span className="font-sans text-sm text-gray-500">Ajouter une image</span>
                                  </div>
                                </PremiumTeaser>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Section EXTRA commune */}
                  <div className="bg-white/30 rounded-2xl p-6 border border-white/40">
                    <h3 className="font-display text-lg font-semibold text-dark-charcoal mb-4">Informations supplémentaires</h3>
                    
                    <div className="space-y-4">
                      {features.canUseExtraField ? (
                        <div>
                          <label htmlFor="extra" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                            Contexte, mnémotechnique, exemple...
                          </label>
                          <textarea
                            id="extra"
                            {...register('extra')}
                            rows={2}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans resize-none"
                            placeholder="Informations complémentaires pour aider à la mémorisation"
                          />
                        </div>
                      ) : (
                        <PremiumTeaser feature="Les champs avancés" onUpgrade={upgradeToPremium}>
                          <div>
                            <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                              Contexte, mnémotechnique, exemple...
                            </label>
                            <textarea
                              disabled
                              rows={2}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-400 resize-none"
                              placeholder="Informations complémentaires (Premium)"
                            />
                          </div>
                        </PremiumTeaser>
                      )}

                      <div>
                        <label htmlFor="tags" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                          Tags (optionnel)
                        </label>
                        <input
                          id="tags"
                          type="text"
                          {...register('tags')}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans"
                          placeholder="géographie, capitale, france"
                        />
                        <p className="mt-1 text-xs text-dark-charcoal/60 font-sans">
                          Séparez les tags par des virgules
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message d'erreur */}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="font-sans text-sm text-red-700">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      type="button"
                      onClick={onClose}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 font-sans font-medium text-dark-charcoal bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      disabled={!isFormValid || isLoading || isSubmitting}
                      whileHover={{ scale: isFormValid && !isLoading && !isSubmitting ? 1.02 : 1 }}
                      whileTap={{ scale: isFormValid && !isLoading && !isSubmitting ? 0.98 : 1 }}
                      className="px-6 py-3 font-sans font-semibold text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      style={{ 
                        background: isFormValid && !isLoading && !isSubmitting
                          ? `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`
                          : '#9CA3AF'
                      }}
                    >
                      {isLoading || isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Création...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Créer la carte
                        </div>
                      )}
                    </motion.button>
                  </div>
                  
                  {/* Champs cachés pour les types d'image */}
                  <input type="hidden" {...register('versoImageType')} />
                  <input type="hidden" {...register('clozeImageType')} />
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
