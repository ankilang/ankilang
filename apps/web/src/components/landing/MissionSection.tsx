import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle"; // On réutilise notre composant de titre

const MissionSection = () => {
  // Variants pour l'animation en cascade du paragraphe
  const paragraphContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Délai entre chaque partie du texte
      },
    },
  };

  const textPart = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="mission-container">
      <SectionTitle>Òc ben ! Per la lenga nòstra.</SectionTitle>
      
      <motion.p 
        className="mission-paragraph"
        variants={paragraphContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
      >
        <motion.span variants={textPart}>
          Nous croyons que la technologie doit servir toutes les langues. C'est pourquoi Ankilang offre un <strong className="highlight">accès gratuit et illimité</strong> pour l'apprentissage de l'occitan.
        </motion.span>
        
        <motion.span className="occitan-text" variants={textPart}>
          (Perqué la tecnologia deu servir totas las lengas. Es per aquò qu'Ankilang prepausa un accès a gratis e illimitat per l'aprendissatge de l'occitan.)
        </motion.span>
      </motion.p>
    </section>
  );
};

export default MissionSection;
