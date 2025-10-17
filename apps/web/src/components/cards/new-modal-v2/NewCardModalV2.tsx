import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import StepperHeader from './StepperHeader'
import StepType from './StepType'
import StepContent from './StepContent'
import StepEnhance from './StepEnhance'
import PreviewCard from './PreviewCard'
import FooterActions from './FooterActions'
import { translate as deeplTranslate } from '../../../services/deepl'
import { reviradaTranslate, toReviCode } from '../../../services/revirada'

export type ThemeColors = {
  primary: string
  secondary: string
  accent: string
  gradient: string
}

export interface NewCardModalV2Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  themeId: string
  themeLanguage: string
  themeColors: ThemeColors
}

export default function NewCardModalV2({
  isOpen,
  onClose,
  onSubmit,
  themeId,
  themeLanguage,
  themeColors,
}: NewCardModalV2Props) {
  useEffect(() => {
    // Focus trap / scroll lock minimal (placeholder — à compléter à l'implémentation)
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedType, setSelectedType] = useState<'basic' | 'cloze' | null>(null)
  const [recto, setRecto] = useState('')
  const [verso, setVerso] = useState('')
  const [clozeText, setClozeText] = useState('')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageType, setImageType] = useState<'appwrite' | 'external'>('external')
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translateError, setTranslateError] = useState<string | undefined>(undefined)

  // Validation minimaliste
  const isBasicValid = useMemo(() => recto.trim().length > 0 && verso.trim().length > 0, [recto, verso])
  const isClozeValid = useMemo(() => /\{\{c\d+::[^}]+\}\}/.test(clozeText), [clozeText])
  const canNext = useMemo(() => {
    if (step === 1) return Boolean(selectedType)
    if (step === 2) {
      if (selectedType === 'basic') return isBasicValid
      if (selectedType === 'cloze') return isClozeValid
      return false
    }
    return true
  }, [step, selectedType, isBasicValid, isClozeValid])

  const handleClose = () => {
    // reset minimal à la fermeture
    setStep(1)
    setSelectedType(null)
    setRecto('')
    setVerso('')
    setClozeText('')
    setTags('')
    onClose()
  }

  const handleSave = () => {
    if (!selectedType) return
    if (selectedType === 'basic' && !isBasicValid) return
    if (selectedType === 'cloze' && !isClozeValid) return

    const common = { imageUrl: imageUrl || undefined, imageUrlType: imageUrl ? imageType : undefined, audioUrl: audioUrl || undefined, tags: tagsToArray(tags) }
    const payload =
      selectedType === 'basic'
        ? { type: 'basic', frontFR: recto, backText: verso, themeId, ...common }
        : { type: 'cloze', clozeTextTarget: clozeText, themeId, ...common }

    onSubmit(payload)
  }

  async function handleTranslate() {
    if (selectedType !== 'basic') return
    const text = recto.trim()
    if (!text) return
    setIsTranslating(true)
    setTranslateError(undefined)
    try {
      const isOccitan = themeLanguage === 'oc' || themeLanguage === 'oc-gascon'
      if (isOccitan) {
        const res = await reviradaTranslate({
          text,
          sourceLang: toReviCode('fr'),
          targetLang: toReviCode(themeLanguage)
        })
        if (res.success) {
          const translated = Array.isArray(res.translated) ? res.translated[0] : res.translated
          setVerso(translated)
        } else {
          setTranslateError(res.error)
        }
      } else {
        const res = await deeplTranslate(text, themeLanguage, 'fr')
        if (res.success) {
          const item = Array.isArray(res.result) ? (res.result[0] ?? null) : res.result
          if (item) setVerso(item.translated)
        } else {
          setTranslateError(res.error)
        }
      }
    } catch (e) {
      setTranslateError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsTranslating(false)
    }
  }

  function tagsToArray(s: string): string[] {
    return s
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          aria-modal
          role="dialog"
        >
          <div className="absolute inset-0 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.98, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden"
          >
            <div className="bg-white/95 rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
              <StepperHeader step={step} selectedType={selectedType} themeLanguage={themeLanguage} themeColors={themeColors} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(92vh-180px)]">
                  {step === 1 && (
                    <StepType
                      selectedType={selectedType}
                      onSelectType={(t) => {
                        setSelectedType(t)
                        setStep(2)
                      }}
                      themeLanguage={themeLanguage}
                      themeColors={themeColors}
                    />
                  )}
                  {step === 2 && selectedType && (
                    <StepContent
                      selectedType={selectedType}
                      recto={recto}
                      verso={verso}
                      clozeText={clozeText}
                      onRectoChange={setRecto}
                      onVersoChange={setVerso}
                      onClozeChange={setClozeText}
                      onTranslate={handleTranslate}
                      isTranslating={isTranslating}
                      translateError={translateError}
                      themeLanguage={themeLanguage}
                      themeColors={themeColors}
                    />
                  )}
                  {step === 3 && (
                    <StepEnhance
                      themeId={themeId}
                      themeLanguage={themeLanguage}
                      themeColors={themeColors}
                      recto={recto}
                      verso={verso}
                      clozeText={clozeText}
                      imageUrl={imageUrl}
                      onChangeImage={(url, type) => { setImageUrl(url); setImageType(type) }}
                      onRemoveImage={() => { setImageUrl(''); setImageType('external') }}
                      audioUrl={audioUrl}
                      onChangeAudio={(url) => setAudioUrl(url)}
                      onRemoveAudio={() => setAudioUrl('')}
                      tags={tags}
                      onChangeTags={setTags}
                    />
                  )}
                </div>
                <div className="p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/70 overflow-y-auto max-h-[calc(92vh-180px)]">
                  <PreviewCard
                    themeColors={themeColors}
                    selectedType={selectedType}
                    recto={recto}
                    verso={verso}
                    clozeText={clozeText}
                    imageUrl={imageUrl}
                    audioUrl={audioUrl}
                  />
                </div>
              </div>

              <FooterActions
                step={step}
                canNext={canNext}
                canSave={step >= 2 && canNext}
                onPrev={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
                onNext={() => setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s))}
                onClose={handleClose}
                onSubmit={handleSave}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
