import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, User } from 'lucide-react';
import PageMeta from '../../components/seo/PageMeta';
import StatCard from '../../components/dashboard/StatCard';
import ActionCard from '../../components/dashboard/ActionCard';

import { mockThemes } from '../../data/mockData';
import { getAccount } from '../../data/mockAccount';

export default function Dashboard() {
  // Calculer les statistiques
  const totalCards = mockThemes.reduce((sum, theme) => sum + theme.cardCount, 0);
  const totalThemes = mockThemes.length;
  // const avgCards = totalThemes > 0 ? Math.round(totalCards / totalThemes) : 0;
  
  // Préparer l'affichage du pseudo (username/displayName) quand connecté
  const account = getAccount();
  const username = account?.user?.username || account?.user?.displayName || 'Ankilang';

  return (
    <>
      <PageMeta 
        title="Tableau de bord — Ankilang" 
        description="Vue d'ensemble de vos thèmes et statistiques d'apprentissage." 
      />
      
      {/* Hero Section - épuré */}
      <section className="bg-pastel-green relative overflow-hidden min-h-[60vh] flex items-center">
        {/* Accent décoratif unique */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pastel-purple/20 rounded-full blur-3xl" />
        
        <div className="relative w-full px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-dark-charcoal mb-4">
                Bonjour, <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{username}</span> 👋
              </h1>
              
              <p className="font-inter text-lg sm:text-xl text-dark-charcoal/70 mb-6 sm:mb-8 max-w-3xl">
                Créez un thème ou reprenez vos révisions.
              </p>

              {/* CTAs directs pour une page simple et actionnable */}
              <div className="flex flex-wrap gap-3 mb-10">
                <Link to="/app/themes/new" className="btn-primary">Créer un thème</Link>
                <Link to="/app/themes" className="btn-secondary">Voir mes thèmes</Link>
              </div>
              
              {/* Statistiques - réduites à l'essentiel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl">
                <StatCard number={totalThemes} label="Thèmes créés" color="purple" delay={0.1} />
                <StatCard number={totalCards} label="Cartes totales" color="green" delay={0.2} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Actions Rapides - allégées */}
      <section className="py-16 bg-white">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-playfair text-4xl font-semibold text-dark-charcoal mb-12 text-center"
            >
              Actions rapides
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <ActionCard 
                icon={Plus} 
                title="Nouveau thème" 
                subtitle="Créer des flashcards"
                to="/app/themes/new"
                color="purple"
                delay={0.2}
              />
              <ActionCard 
                icon={BookOpen} 
                title="Mes thèmes" 
                subtitle="Gérer vos créations"
                to="/app/themes"
                color="green"
                delay={0.3}
              />
              <ActionCard 
                icon={User} 
                title="Mon compte" 
                subtitle="Profil et abonnement"
                to="/app/account"
                color="green"
                delay={0.4}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
