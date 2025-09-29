import { motion } from "framer-motion";
import FlagEmoji from "../ui/FlagEmoji";

const flags = ["🇫🇷", "🇪🇸", "🇩🇪", "🇮🇹", "🇯🇵", "🇬🇧", "🇷🇺", "🇨🇳", "🇰🇷", "🇵🇹", "🇧🇷", "🇦🇷"];
const duplicatedFlags = [...flags, ...flags]; // Dupliquer pour la boucle

const FlagMarquee = () => {
  return (
    <div className="flag-marquee-container">
      <motion.div
        className="flag-marquee-content emoji-flag"
        animate={{
          x: ['0%', '-100%'], // Fait défiler de la position initiale à la fin de la première chaîne
        }}
        transition={{
          ease: 'linear',
          duration: 15, // Vitesse de défilement
          repeat: Infinity,
        }}
      >
        {duplicatedFlags.map((flag, index) => (
          <FlagEmoji key={index} flag={flag} className="mx-1" />
        ))}
      </motion.div>
    </div>
  );
};

export default FlagMarquee;
