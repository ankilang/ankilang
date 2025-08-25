import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StatCardProps {
  number: number;
  label: string;
  color: 'purple' | 'green' | 'rose';
  delay?: number;
}

export default function StatCard({ number, label, color, delay = 0 }: StatCardProps) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCount(prev => {
          if (prev < number) {
            return Math.min(prev + Math.ceil(number / 20), number);
          }
          return number;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [number, delay]);
  
  const colorClasses = {
    purple: 'bg-pastel-purple border-pastel-purple',
    green: 'bg-pastel-green border-pastel-green', 
    rose: 'bg-pastel-rose border-pastel-rose'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`${colorClasses[color]} rounded-2xl p-6 border-2 shadow-lg`}
    >
      <motion.div 
        className="font-inter text-3xl font-bold text-dark-charcoal mb-1"
        key={count}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {count}
      </motion.div>
      <div className="font-inter text-sm font-medium text-dark-charcoal/70">
        {label}
      </div>
    </motion.div>
  );
}
