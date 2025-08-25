import { motion } from "framer-motion";

const flags = "🇫🇷 🇪🇸 🇩🇪 🇮🇹 🇯🇵 🇬🇧 🇷🇺 🇨🇳 🇰🇷 🇵🇹 🇧🇷 🇦🇷 ";
const duplicatedFlags = flags.repeat(2); // Dupliquer pour la boucle

const FlagMarquee = () => {
  return (
    <div className="flag-marquee-container">
      <motion.div
        className="flag-marquee-content"
        animate={{
          x: ['0%', '-100%'], // Fait défiler de la position initiale à la fin de la première chaîne
        }}
        transition={{
          ease: 'linear',
          duration: 15, // Vitesse de défilement
          repeat: Infinity,
        }}
      >
        {duplicatedFlags}
      </motion.div>
    </div>
  );
};

export default FlagMarquee;
