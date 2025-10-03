import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";
import OccitanParticles from "../effects/OccitanParticles";
import OcFlag from "../../assets/flags/oc.webp";

const VibrantMissionSection = () => {
  // Variants pour l'animation du texte de premier plan
  const sentenceContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5,
        staggerChildren: 0.15,
      },
    },
  };

  const word = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="vibrant-mission-container">
      <div className="title-wrapper">
        <SectionTitle className="final-cta">Òc ben !</SectionTitle>
        <div className="occitan-flag-wrapper">
          <img 
            src={OcFlag} 
            alt="Drapeau occitan" 
            className="occitan-flag"
            loading="lazy"
          />
        </div>
      </div>
      
      <div className="content-wrapper">
        <motion.div 
          className="background-text"
          animate={{ y: ["0%", "-25%"] }}
          transition={{ 
            ease: "linear", 
            duration: 40, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        >
          Per la lenga nòstra Per la lenga nòstra Per la lenga nòstra
        </motion.div>
        
        <motion.p 
          className="foreground-text"
          variants={sentenceContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
        >
          <motion.span variants={word}>Sur</motion.span>{" "}
          <motion.span variants={word}>Ankilang,</motion.span>{" "}
          <motion.span variants={word}>l'apprentissage</motion.span>{" "}
          <motion.span variants={word}>de</motion.span>{" "}
          <motion.span variants={word}>l'</motion.span>
          <OccitanParticles>
            <motion.span 
              variants={word}
              className="text-gradient-occitan"
              data-text="occitan"
            >
              occitan
            </motion.span>
          </OccitanParticles>{" "}
          <motion.span variants={word}>est</motion.span>{" "}
          <span className="highlight-box">
            <motion.span 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              gratuit.
            </motion.span>
          </span>{" "}
          <motion.span variants={word}>Pour</motion.span>{" "}
          <motion.span variants={word}>toujours.</motion.span>
        </motion.p>
      </div>
    </section>
  );
};

export default VibrantMissionSection;
