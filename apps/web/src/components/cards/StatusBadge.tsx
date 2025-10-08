import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: 'complete' | 'incomplete' | 'error'
  message?: string
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, message, size = 'sm' }: StatusBadgeProps) {
  const statusConfig = {
    complete: {
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700 border-green-200',
      title: 'Carte complète'
    },
    incomplete: {
      icon: AlertCircle,
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      title: 'Carte incomplète'
    },
    error: {
      icon: XCircle,
      className: 'bg-red-100 text-red-700 border-red-200',
      title: 'Erreur dans la carte'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center
        ${config.className}
        border
      `}
      title={message || config.title}
    >
      <Icon className="w-2.5 h-2.5" />
    </motion.div>
  )
}
