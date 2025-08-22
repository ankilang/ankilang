interface SkeletonProps {
  variant: 'card' | 'list' | 'detail'
  ariaLabel?: string
  className?: string
}

export default function Skeleton({ variant, ariaLabel = 'Chargement...', className = '' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  switch (variant) {
    case 'card':
      return (
        <div 
          className={`${baseClasses} h-48 p-4 ${className}`}
          aria-label={ariaLabel}
          role="status"
          aria-busy="true"
        >
          <div className="h-4 bg-gray-300 rounded mb-3 w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded mb-2 w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded mb-4 w-2/3"></div>
          <div className="flex gap-2 mb-3">
            <div className="h-6 bg-gray-300 rounded w-16"></div>
            <div className="h-6 bg-gray-300 rounded w-20"></div>
          </div>
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        </div>
      )
    
    case 'list':
      return (
        <div 
          className={`${baseClasses} p-4 ${className}`}
          aria-label={ariaLabel}
          role="status"
          aria-busy="true"
        >
          <div className="h-6 bg-gray-300 rounded mb-3 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 rounded w-full"></div>
            ))}
          </div>
        </div>
      )
    
    case 'detail':
      return (
        <div 
          className={`${baseClasses} p-6 ${className}`}
          aria-label={ariaLabel}
          role="status"
          aria-busy="true"
        >
          <div className="h-8 bg-gray-300 rounded mb-4 w-2/3"></div>
          <div className="h-4 bg-gray-300 rounded mb-3 w-1/2"></div>
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/5"></div>
          </div>
          <div className="h-32 bg-gray-300 rounded"></div>
        </div>
      )
    
    default:
      return null
  }
}
