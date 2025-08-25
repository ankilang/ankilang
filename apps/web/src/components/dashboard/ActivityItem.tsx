import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface ActivityItemProps {
  theme: {
    id: string;
    name: string;
    cardCount: number;
    shareStatus: 'private' | 'community';
  };
  delay?: number;
}

export default function ActivityItem({ theme, delay = 0 }: ActivityItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-pastel-purple/50 transition-colors"
    >
      <div className="w-12 h-12 bg-pastel-green rounded-xl flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-dark-charcoal" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-inter font-medium text-dark-charcoal truncate">
          {theme.name}
        </h3>
        <p className="font-inter text-sm text-dark-charcoal/70">
          {theme.cardCount} cartes
        </p>
      </div>
      
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        theme.shareStatus === 'community' 
          ? 'bg-pastel-green text-dark-charcoal' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {theme.shareStatus === 'community' ? 'Partagé' : 'Privé'}
      </span>
    </motion.div>
  );
}
