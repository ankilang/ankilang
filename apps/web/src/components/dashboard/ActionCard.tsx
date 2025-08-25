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
    purple: 'border-pastel-purple text-pastel-purple hover:bg-pastel-purple/10',
    green: 'border-pastel-green text-pastel-green hover:bg-pastel-green/10',
    rose: 'border-pastel-rose text-pastel-rose hover:bg-pastel-rose/10'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="action-card"
    >
      <Link 
        to={to}
        className={`block bg-white ${colorClasses[color]} border-2 rounded-2xl p-6 transition-all duration-200 shadow-md hover:shadow-lg`}
      >
        <Icon className="w-8 h-8 mb-3" />
        <h3 className="font-inter font-semibold text-dark-charcoal text-lg mb-1">
          {title}
        </h3>
        <p className="font-inter text-sm text-dark-charcoal/70">
          {subtitle}
        </p>
      </Link>
    </motion.div>
  );
}
