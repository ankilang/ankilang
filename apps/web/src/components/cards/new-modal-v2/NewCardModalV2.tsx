import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import StepperHeader from './StepperHeader'
import StepType from './StepType'
import StepContent from './StepContent'
import StepEnhance from './StepEnhance'
import PreviewCard from './PreviewCard'
import FooterActions from './FooterActions'

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
              <StepperHeader themeLanguage={themeLanguage} themeColors={themeColors} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(92vh-180px)]">
                  {/* Étapes placeholders – l’état et la logique seront ajoutés ensuite */}
                  <StepType themeLanguage={themeLanguage} themeColors={themeColors} />
                  <div className="h-6" />
                  <StepContent themeLanguage={themeLanguage} themeColors={themeColors} />
                  <div className="h-6" />
                  <StepEnhance themeId={themeId} themeLanguage={themeLanguage} themeColors={themeColors} />
                </div>
                <div className="p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/70 overflow-y-auto max-h-[calc(92vh-180px)]">
                  <PreviewCard themeColors={themeColors} />
                </div>
              </div>

              <FooterActions onClose={onClose} onSubmit={() => onSubmit({})} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

