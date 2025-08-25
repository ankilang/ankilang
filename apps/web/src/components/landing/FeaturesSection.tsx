import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";
import { UploadCloud, LayoutTemplate, Users, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: <UploadCloud />,
    title: "IMPORT EN LOTS (CSV)",
    description: "Générez des dizaines de cartes en quelques secondes à partir d'une simple liste.",
    gridClass: "feature-card-large",
  },
  {
    icon: <LayoutTemplate />,
    title: "MODÈLES PERSONNALISÉS",
    description: "Ajoutez vos propres champs pour des cartes qui correspondent à votre méthode.",
    gridClass: "feature-card-small",
  },
  {
    icon: <Users />,
    title: "COMMUNAUTÉ",
    description: "Partagez vos paquets de cartes et téléchargez ceux des autres apprenants.",
    gridClass: "feature-card-small",
  },
  {
    icon: <ShieldCheck />,
    title: "SAUVEGARDE CLOUD",
    description: "Toutes vos créations sont synchronisées et sécurisées. Ne perdez plus jamais votre travail.",
    gridClass: "feature-card-large",
  },
];

const FeaturesSection = () => {
  return (
    <section className="features-container">
      <SectionTitle>Conçu pour la fluidité.</SectionTitle>
      
      <motion.div 
        className="features-grid"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {features.map((feature, index) => (
          <motion.div 
            key={index} 
            className={`feature-card ${feature.gridClass}`}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ backgroundColor: "#FFFFFF" }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon-enhanced">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default FeaturesSection;
