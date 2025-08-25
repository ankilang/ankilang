import { motion } from "framer-motion";

// Le composant accepte le texte du titre comme une propriété (prop)
interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

const SectionTitle = ({ children, className = "" }: SectionTitleProps) => {
  return (
    <motion.h2
      className={`section-title ${className}`}
      // Animation d'apparition au défilement
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.5 }}
      
      // Animation de halo au survol
      whileHover={{
        textShadow: "0 0 10px rgba(210, 180, 222, 0.7), 0 0 25px rgba(210, 180, 222, 0.5)",
      }}
    >
      {children}
    </motion.h2>
  );
};

export default SectionTitle;
