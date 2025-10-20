import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import SectionTitle from "./SectionTitle";
import { Check, Star } from "lucide-react";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="pricing-container">
      <SectionTitle>Choisissez votre plan.</SectionTitle>
      
      {/* Toggle Annuel/Mensuel */}
      <div className="billing-toggle">
        <span className={!isAnnual ? "active" : ""}>Mensuel</span>
        <div 
          className="toggle-switch" 
          onClick={() => { setIsAnnual(!isAnnual); }}
        >
          <motion.div 
            className="toggle-handle" 
            animate={{ x: isAnnual ? 28 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
        <span className={isAnnual ? "active" : ""}>
          Annuel <span className="discount-badge">-17%</span>
        </span>
      </div>

      {/* Grille des tarifs */}
      <div className="pricing-grid">
        {/* Colonne FREE */}
        <motion.div 
          className="plan-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="plan-title">Free</h3>
          <p className="plan-description">Pour découvrir et pour l'occitan.</p>
          <div className="plan-price">0€ <span className="price-period">/ pour toujours</span></div>
          <ul className="features-list">
            <li><Check className="icon" /> Création illimitée en occitan</li>
            <li><Check className="icon" /> 20 cartes/jour (autres langues)</li>
            <li><Check className="icon" /> Export .apkg par thème</li>
            <li><Check className="icon" /> Aperçu de la Communauté</li>
          </ul>
          <button className="cta-button secondary">Commencer gratuitement</button>
        </motion.div>

        {/* Colonne PRO */}
        <motion.div 
          className="plan-card pro"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -8 }}
        >
          <h3 className="plan-title">Pro</h3>
          <p className="plan-description">Pour les apprenants sérieux.</p>
          <div className="plan-price">
            <AnimatePresence mode="wait">
              <motion.span 
                key={isAnnual ? "annual" : "monthly"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {isAnnual ? "49,99€" : "4,99€"}
              </motion.span>
            </AnimatePresence>
            <span className="price-period">
              {isAnnual ? "/ an" : "/ mois"}
            </span>
          </div>
          <ul className="features-list">
            <li><Star className="icon" /> Tout du plan Free, plus :</li>
            <li><Star className="icon" /> Création illimitée (toutes langues)</li>
            <li><Star className="icon" /> Import en lots (CSV)</li>
            <li><Star className="icon" /> Modèles de cartes personnalisés</li>
            <li><Star className="icon" /> Partage & Téléchargement Communauté</li>
          </ul>
          <button className="cta-button primary">Passer à Pro</button>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
