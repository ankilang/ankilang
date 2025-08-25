import { motion } from "framer-motion";
import { Star, Zap, BrainCircuit, Heart } from "lucide-react";

// Le contenu est défini une seule fois pour être facilement modifiable
const marqueeContent = [
  { text: "EXPORT ANKI PARFAIT", icon: <Star className="w-8 h-8" /> },
  { text: "GAIN DE TEMPS MASSIF", icon: <Zap className="w-8 h-8" /> },
  { text: "QUALITÉ D'APPRENTISSAGE SUPÉRIEURE", icon: <BrainCircuit className="w-8 h-8" /> },
  { text: "OCCITAN GRATUIT & ILLIMITÉ", icon: <Heart className="w-8 h-8" /> },
];

const BenefitsMarquee = () => {
  return (
    <div className="marquee-container">
      {/* Nous rendons le contenu deux fois pour la boucle */}
      <motion.div 
        className="marquee-content"
        initial={{ x: "0%" }}
        animate={{ x: "-50%" }}
        transition={{
          ease: "linear",
          duration: 25,
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        {marqueeContent.map((item, index) => (
          <div key={index} className="marquee-item">
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
        {marqueeContent.map((item, index) => (
          <div key={`duplicate-${index}`} className="marquee-item">
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default BenefitsMarquee;
