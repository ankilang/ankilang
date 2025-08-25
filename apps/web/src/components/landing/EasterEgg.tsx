import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EasterEggProps {
  children: React.ReactNode;
}

const EasterEgg = ({ children }: EasterEggProps) => {
  const [clickCount, setClickCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
    
    if (clickCount === 4) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setClickCount(0);
    }
  };

  const confettiColors = ['#D2B4DE', '#F7FAFC', '#E2E8F0', '#CBD5E0'];

  return (
    <div className="relative">
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
      
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: confettiColors[i % confettiColors.length],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ 
                  opacity: 1, 
                  y: 0, 
                  x: 0,
                  scale: 1,
                  rotate: 0
                }}
                animate={{ 
                  opacity: 0, 
                  y: -100 - Math.random() * 200, 
                  x: (Math.random() - 0.5) * 200,
                  scale: 0,
                  rotate: 360
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EasterEgg;
