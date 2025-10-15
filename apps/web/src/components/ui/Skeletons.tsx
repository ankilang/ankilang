import { motion } from 'framer-motion'

/**
 * Skeleton de base avec animation de shimmer
 */
function SkeletonBase({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      className={`bg-gray-200 rounded-lg animate-pulse ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...(props as any)}
    />
  )
}

/**
 * Skeleton pour les cartes de thème
 */
export function ThemeCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20">
      <div className="flex items-center gap-4 mb-4">
        <SkeletonBase className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <SkeletonBase className="h-6 w-3/4 mb-2" />
          <SkeletonBase className="h-4 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-2/3" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <SkeletonBase className="h-6 w-16" />
        <SkeletonBase className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Skeleton pour les cartes de flashcard
 */
export function CardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-start gap-4 mb-4">
        <SkeletonBase className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <SkeletonBase className="h-5 w-1/3 mb-2" />
          <SkeletonBase className="h-4 w-1/4" />
        </div>
      </div>
      <div className="space-y-3">
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-4/5" />
        <SkeletonBase className="h-4 w-3/5" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <SkeletonBase className="h-6 w-12 rounded-full" />
          <SkeletonBase className="h-6 w-16 rounded-full" />
        </div>
        <SkeletonBase className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Skeleton pour la page de détail de thème
 */
export function ThemeDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple/20 via-pastel-green/10 to-pastel-rose/20">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6">
            <SkeletonBase className="w-10 h-10 rounded-xl" />
            <div className="flex gap-3">
              <SkeletonBase className="w-20 h-10 rounded-xl" />
              <SkeletonBase className="w-12 h-12 rounded-2xl" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SkeletonBase className="w-16 h-16 rounded-2xl" />
            <div>
              <SkeletonBase className="h-8 w-64 mb-2" />
              <SkeletonBase className="h-5 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tags skeleton */}
        <div className="mb-8">
          <div className="flex gap-2">
            <SkeletonBase className="h-6 w-16 rounded-full" />
            <SkeletonBase className="h-6 w-20 rounded-full" />
            <SkeletonBase className="h-6 w-14 rounded-full" />
          </div>
        </div>

        {/* Cards list skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CardSkeleton />
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

/**
 * Skeleton pour la liste des thèmes
 */
export function ThemesListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemeCardSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Skeleton pour les formulaires
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SkeletonBase className="h-4 w-32" />
        <SkeletonBase className="h-12 w-full rounded-xl" />
      </div>
      <div className="space-y-4">
        <SkeletonBase className="h-4 w-40" />
        <SkeletonBase className="h-12 w-full rounded-xl" />
      </div>
      <div className="space-y-4">
        <SkeletonBase className="h-4 w-36" />
        <SkeletonBase className="h-32 w-full rounded-xl" />
      </div>
      <SkeletonBase className="h-12 w-full rounded-2xl" />
    </div>
  )
}

/**
 * Skeleton pour les modales
 */
export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 max-w-md w-full">
        <div className="text-center mb-6">
          <SkeletonBase className="h-6 w-48 mx-auto mb-2" />
          <SkeletonBase className="h-4 w-64 mx-auto" />
        </div>
        <FormSkeleton />
      </div>
    </div>
  )
}

/**
 * Skeleton générique pour le contenu
 */
export function ContentSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          className={`h-4 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}
