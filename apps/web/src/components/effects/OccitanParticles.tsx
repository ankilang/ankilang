import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface OccitanParticlesProps {
  children: React.ReactNode;
}

const OccitanParticles = ({ children }: OccitanParticlesProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Stabilize random values with useMemo to prevent re-calculation on every render
  // eslint-disable-next-line react-hooks/purity -- Intentionally using Math.random() in useMemo for stable random values
  const particleData = useMemo(() =>
    Array.from({ length: 8 }, () => ({
      x: Math.random() * 40 - 20,
      y: Math.random() * 40 - 20,
      left: Math.random() * 100,
      top: Math.random() * 100,
    })),
    []
  );

  const particles = particleData.map((data, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-yellow-400 rounded-full"
      initial={{ opacity: 0, scale: 0 }}
      animate={isHovered ? {
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        x: [0, data.x],
        y: [0, data.y],
      } : {}}
      transition={{
        duration: 1.5,
        delay: i * 0.1,
        repeat: isHovered ? Infinity : 0,
        repeatDelay: 2
      }}
      style={{
        left: `${data.left}%`,
        top: `${data.top}%`,
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
