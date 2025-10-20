import { motion } from "framer-motion";
import { useState } from "react";

interface OccitanParticlesProps {
  children: React.ReactNode;
}

const OccitanParticles = ({ children }: OccitanParticlesProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const particles = Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-yellow-400 rounded-full"
      initial={{ opacity: 0, scale: 0 }}
      animate={isHovered ? {
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        x: [0, Math.random() * 40 - 20],
        y: [0, Math.random() * 40 - 20],
      } : {}}
      transition={{
        duration: 1.5,
        delay: i * 0.1,
        repeat: isHovered ? Infinity : 0,
        repeatDelay: 2
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ));

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={() => { setIsHovered(true); }}
      onMouseLeave={() => { setIsHovered(false); }}
    >
      {children}
      {particles}
    </span>
  );
};

export default OccitanParticles;
