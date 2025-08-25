import { motion } from "framer-motion";

interface AnkilangLogoProps {
  size?: "small" | "default" | "large";
  animated?: boolean;
}

const AnkilangLogo = ({ size = "default", animated = true }: AnkilangLogoProps) => {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-10 h-10", 
    large: "w-16 h-16"
  };

  return (
    <div className="relative">
      {/* Carte principale */}
      <motion.div 
        className={`${sizeClasses[size]} bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden`}
        whileHover={animated ? { scale: 1.05, rotate: 2 } : {}}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Effet de brillance */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
          animate={animated ? {
            x: ["-100%", "100%"],
            opacity: [0, 1, 0]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        />
        
        {/* Logo sans lettre */}
        <div className="relative z-10 w-4 h-4 bg-white/20 rounded-sm"></div>
        
        {/* Petit point d'accent (représente une carte) */}
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
      </motion.div>
      
      {/* Cartes en arrière-plan (effet de pile) */}
      <motion.div 
        className={`absolute -bottom-1 -right-1 bg-gradient-to-br from-violet-500/70 to-violet-600/70 rounded-lg transform rotate-12`}
        style={{ 
          width: size === "small" ? "60%" : size === "large" ? "60%" : "60%", 
          height: size === "small" ? "80%" : size === "large" ? "80%" : "80%" 
        }}
        whileHover={animated ? { rotate: 15, scale: 1.02 } : {}}
      />
      <motion.div 
        className={`absolute -bottom-2 -right-2 bg-gradient-to-br from-violet-400/50 to-violet-500/50 rounded-lg transform rotate-24`}
        style={{ 
          width: size === "small" ? "40%" : size === "large" ? "40%" : "40%", 
          height: size === "small" ? "60%" : size === "large" ? "60%" : "60%" 
        }}
        whileHover={animated ? { rotate: 28, scale: 1.03 } : {}}
      />
    </div>
  );
};

export default AnkilangLogo;
