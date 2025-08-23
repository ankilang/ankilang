import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  isDanger?: boolean
  onConfirm: () => void
  onClose: () => void
  children?: React.ReactNode
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  isDanger = false,
  onConfirm,
  onClose,
  children
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const handleTab = (event: KeyboardEvent) => {
      if (!modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)

    // Focus initial sur le titre
    if (titleRef.current) {
      titleRef.current.focus()
    }

    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Container centré avec padding */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby={description ? "confirm-description" : undefined}
          className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-4 sm:p-6"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2
              ref={titleRef}
              id="confirm-title"
              tabIndex={-1}
              className="text-lg font-semibold text-gray-900 pr-4"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-md focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:outline-none"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          {description && (
            <p id="confirm-description" className="text-gray-600 mb-6">
              {description}
            </p>
          )}

          {/* Contenu personnalisé */}
          {children && (
            <div className="mb-6">
              {children}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-3 sm:py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:outline-none"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`px-4 py-3 sm:py-2 text-white rounded-lg transition-colors font-medium focus-visible:ring-2 focus-visible:outline-none ${
                isDanger 
                  ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500' 
                  : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
