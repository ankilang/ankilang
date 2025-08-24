import type { ReactNode } from 'react'

type BentoGridProps = {
  children: ReactNode
  className?: string
}

export function BentoGrid({ children, className = '' }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  )
}

type BentoTileProps = {
  children: ReactNode
  className?: string
  colSpan?: number
  rowSpan?: number
  smColSpan?: number
  lgColSpan?: number
}

export function BentoTile({ 
  children, 
  className = '', 
  colSpan = 4, 
  rowSpan = 1,
  smColSpan,
  lgColSpan 
}: BentoTileProps) {
  // Mapping des classes de grille pour éviter les classes dynamiques
  const getColSpanClass = (span: number) => {
    const spanMap: Record<number, string> = {
      1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
      5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
      9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12'
    }
    return spanMap[span] || 'col-span-4'
  }

  const getSmColSpanClass = (span?: number) => {
    if (!span) return ''
    const spanMap: Record<number, string> = {
      1: 'sm:col-span-1', 2: 'sm:col-span-2', 3: 'sm:col-span-3', 4: 'sm:col-span-4',
      5: 'sm:col-span-5', 6: 'sm:col-span-6', 7: 'sm:col-span-7', 8: 'sm:col-span-8',
      9: 'sm:col-span-9', 10: 'sm:col-span-10', 11: 'sm:col-span-11', 12: 'sm:col-span-12'
    }
    return spanMap[span] || ''
  }

  const getLgColSpanClass = (span?: number) => {
    if (!span) return ''
    const spanMap: Record<number, string> = {
      1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4',
      5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8',
      9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12'
    }
    return spanMap[span] || ''
  }

  const getRowSpanClass = (span: number) => {
    if (span <= 1) return ''
    const spanMap: Record<number, string> = {
      2: 'row-span-2', 3: 'row-span-3', 4: 'row-span-4', 5: 'row-span-5', 6: 'row-span-6'
    }
    return spanMap[span] || ''
  }
  
  return (
    <div className={`
      surface-quiet card-hairline shadow-soft rounded-2xl p-6 sm:p-8
      transition-all duration-200 hover:shadow-soft-lg hover:-translate-y-[1px]
      ${getColSpanClass(colSpan)} ${getSmColSpanClass(smColSpan)} ${getLgColSpanClass(lgColSpan)} ${getRowSpanClass(rowSpan)}
      ${className}
    `}>
      {children}
    </div>
  )
}

// =========================================================
// VARIANTES BENTO - Tuiles spécialisées
// =========================================================

type StatementTileProps = {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  colSpan?: number
  smColSpan?: number
  lgColSpan?: number
}

export function StatementTile({ 
  title, 
  subtitle, 
  children, 
  className = '',
  colSpan = 4,
  smColSpan = 6,
  lgColSpan = 6
}: StatementTileProps) {
  return (
    <BentoTile 
      colSpan={colSpan} 
      smColSpan={smColSpan} 
      lgColSpan={lgColSpan}
      className={`tile-bento bento-accent ${className}`}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {subtitle}
            </p>
          )}
          <div className="text-gray-700 dark:text-gray-300">
            {children}
          </div>
        </div>
      </div>
    </BentoTile>
  )
}

type DataTileProps = {
  metric: string
  label: string
  icon?: ReactNode
  className?: string
  colSpan?: number
  smColSpan?: number
  lgColSpan?: number
}

export function DataTile({ 
  metric, 
  label, 
  icon, 
  className = '',
  colSpan = 2,
  smColSpan = 3,
  lgColSpan = 3
}: DataTileProps) {
  return (
    <BentoTile 
      colSpan={colSpan} 
      smColSpan={smColSpan} 
      lgColSpan={lgColSpan}
      className={`tile-bento bento-accent text-center ${className}`}
    >
      <div className="flex flex-col items-center justify-center h-full">
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-3">
            {icon}
          </div>
        )}
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {metric}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </div>
      </div>
    </BentoTile>
  )
}

type FeatureTileProps = {
  icon: ReactNode
  title: string
  description: string
  className?: string
  colSpan?: number
  smColSpan?: number
  lgColSpan?: number
}

export function FeatureTile({ 
  icon, 
  title, 
  description, 
  className = '',
  colSpan = 4,
  smColSpan = 6,
  lgColSpan = 4
}: FeatureTileProps) {
  return (
    <BentoTile 
      colSpan={colSpan} 
      smColSpan={smColSpan} 
      lgColSpan={lgColSpan}
      className={`tile-bento bento-accent ${className}`}
    >
      <div className="text-center h-full flex flex-col justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </BentoTile>
  )
}

type IllustrationPlaceholderProps = {
  ratio?: '4/3' | '16/9' | 'square'
  className?: string
  children?: ReactNode
}

export function IllustrationPlaceholder({ 
  ratio = '4/3', 
  className = '',
  children 
}: IllustrationPlaceholderProps) {
  const ratioClasses = {
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    'square': 'aspect-square'
  }
  
  return (
    <div className={`
      ${ratioClasses[ratio]} rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50
      border border-violet-100/50 flex items-center justify-center
      dark:from-violet-900/20 dark:to-fuchsia-900/20 dark:border-violet-800/30
      ${className}
    `}>
      {children || (
        <div className="text-center text-violet-600 dark:text-violet-300">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="1.5"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <span className="text-sm font-medium">Illustration à venir</span>
        </div>
      )}
    </div>
  )
}
