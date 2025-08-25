import { motion } from 'framer-motion';
import { Plus, BookOpen, Users, GraduationCap, User, Settings } from 'lucide-react';
import PageMeta from '../../components/seo/PageMeta';
import StatCard from '../../components/dashboard/StatCard';
import ActionCard from '../../components/dashboard/ActionCard';

import { mockThemes } from '../../data/mockData';

export default function Dashboard() {
  // Calculer les statistiques
  const totalCards = mockThemes.reduce((sum, theme) => sum + theme.cardCount, 0);
  const totalThemes = mockThemes.length;
  const avgCards = totalThemes > 0 ? Math.round(totalCards / totalThemes) : 0;

  return (
    <>
      <PageMeta 
        title="Tableau de bord — Ankilang" 
        description="Vue d'ensemble de vos thèmes et statistiques d'apprentissage." 
      />
      
      {/* Hero Section - Pleine largeur */}
      <section className="bg-pastel-green relative overflow-hidden min-h-[60vh] flex items-center">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pastel-purple/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pastel-rose/20 rounded-full blur-2xl" />
        
        <div className="relative w-full px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-dark-charcoal mb-4">
                Bonjour, <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Marie</span> 👋
              </h1>
              
              <p className="font-inter text-lg sm:text-xl text-dark-charcoal/70 mb-8 sm:mb-12 max-w-3xl">
                Continuez votre progression sereinement. Voici un aperçu de votre activité.
              </p>
              
              {/* Statistiques - Plus grandes et mieux espacées */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl">
                <StatCard number={totalThemes} label="Thèmes créés" color="purple" delay={0.2} />
                <StatCard number={totalCards} label="Cartes totales" color="green" delay={0.4} />
                <StatCard number={avgCards} label="Moyenne/thème" color="rose" delay={0.6} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Actions Rapides - Pleine largeur */}
      <section className="py-16 bg-white">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="font-playfair text-4xl font-semibold text-dark-charcoal mb-12 text-center"
            >
              Actions rapides
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              <ActionCard 
                icon={Plus} 
                title="Nouveau thème" 
                subtitle="Créer des flashcards"
                to="/app/themes/new"
                color="purple"
                delay={1.0}
              />
              <ActionCard 
                icon={BookOpen} 
                title="Mes thèmes" 
                subtitle="Gérer vos créations"
                to="/app/themes"
                color="green"
                delay={1.1}
              />
              <ActionCard 
                icon={Users} 
                title="Communauté" 
                subtitle="Découvrir des decks"
                to="/app/community"
                color="rose"
                delay={1.2}
              />
              <ActionCard 
                icon={GraduationCap} 
                title="Leçons" 
                subtitle="Apprendre l'occitan"
                to="/app/lessons"
                color="purple"
                delay={1.3}
              />
              <ActionCard 
                icon={User} 
                title="Mon compte" 
                subtitle="Profil et abonnement"
                to="/app/account"
                color="green"
                delay={1.4}
              />
              <ActionCard 
                icon={Settings} 
                title="Paramètres" 
                subtitle="Configuration"
                to="/app/settings"
                color="rose"
                delay={1.5}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
