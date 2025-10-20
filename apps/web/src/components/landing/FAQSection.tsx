import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import SectionTitle from "./SectionTitle";

const faqData = [
  {
    id: 1,
    question: "Comment fonctionne l'export vers Anki ?",
    answer: "Ankilang génère automatiquement un fichier .apkg compatible avec Anki 2.1+. Il suffit de télécharger le fichier et de l'importer dans Anki. Tous vos médias (images, audio) sont inclus et organisés automatiquement."
  },
  {
    id: 2,
    question: "L'occitan est-il vraiment gratuit ?",
    answer: "Absolument ! Toutes les fonctionnalités d'Ankilang sont gratuites pour l'occitan. Nous croyons que la technologie doit servir toutes les langues, c'est pourquoi nous offrons un accès complet et illimité pour l'apprentissage de l'occitan."
  },
  {
    id: 3,
    question: "Puis-je utiliser mes propres images et audio ?",
    answer: "Oui ! Vous pouvez importer vos propres fichiers médias ou laisser notre IA générer automatiquement des images et de l'audio pertinents pour vos cartes. Vous gardez le contrôle total sur votre contenu."
  },
  {
    id: 4,
    question: "Les cartes sont-elles compatibles avec Anki ?",
    answer: "Parfaitement ! Ankilang génère des fichiers .apkg 100% compatibles avec Anki 2.1+. Tous les types de cartes (texte, cloze, image, audio) sont supportés et fonctionnent exactement comme si vous les aviez créées directement dans Anki."
  },
  {
    id: 5,
    question: "Puis-je partager mes paquets de cartes ?",
    answer: "Oui ! Avec le plan Pro, vous pouvez partager vos paquets de cartes avec la communauté Ankilang et télécharger ceux des autres utilisateurs. C'est un excellent moyen de découvrir de nouveaux contenus d'apprentissage."
  }
];

const FAQSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Titre de la Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>Questions fréquentes.</SectionTitle>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-sans-normal">
            Tout ce que vous devez savoir sur Ankilang
          </p>
        </motion.div>

        {/* Accordéon FAQ */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <motion.div 
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <button 
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                onClick={() => { toggleItem(item.id); }}
              >
                <h3 className="text-lg font-sans-medium text-dark-charcoal dark:text-white">
                  {item.question}
                </h3>
                <motion.svg 
                  className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: openItems.includes(item.id) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {openItems.includes(item.id) && (
                  <motion.div 
                    className="px-6 pb-4 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p className="text-slate-600 dark:text-slate-400 font-sans-normal leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
