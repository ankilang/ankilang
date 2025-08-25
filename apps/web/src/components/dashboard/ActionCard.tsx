import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  to: string;
  color: 'purple' | 'green' | 'rose';
  delay?: number;
}

export default function ActionCard({ 
  icon: Icon, 
  title, 
  subtitle, 
  to, 
  color, 
  delay = 0 
}: ActionCardProps) {
  const colorClasses = {
    purple: 'border-pastel-purple hover:bg-pastel-purple/10 hover:border-purple-400',
    green: 'border-pastel-green hover:bg-pastel-green/10 hover:border-green-400',
    rose: 'border-pastel-rose hover:bg-pastel-rose/10 hover:border-rose-400'
  };
  
  const iconColorClasses = {
    purple: 'text-purple-600',
    green: 'text-green-600',
    rose: 'text-rose-600'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="action-card"
    >
      <Link 
        to={to}
        className={`block bg-white ${colorClasses[color]} border-2 rounded-3xl p-8 transition-all duration-300 shadow-lg hover:shadow-xl`}
      >
        <Icon className={`w-12 h-12 mb-4 ${iconColorClasses[color]}`} />
        <h3 className="font-inter font-bold text-dark-charcoal text-xl mb-2">
          {title}
        </h3>
        <p className="font-inter text-dark-charcoal/70">
          {subtitle}
        </p>
      </Link>
    </motion.div>
  );
}
