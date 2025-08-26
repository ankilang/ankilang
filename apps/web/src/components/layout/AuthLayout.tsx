import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnkilangLogo from '../ui/AnkilangLogo'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-pastel-green">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-3 group"
            >
              <AnkilangLogo size="default" animated={true} />
              <span className="font-display text-xl font-bold bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent">
                Ankilang
              </span>
            </Link>
            
            <nav className="flex items-center gap-4">
              <Link 
                to="/auth/login" 
                className="text-dark-charcoal/70 hover:text-dark-charcoal transition-colors font-sans font-medium"
              >
                Connexion
              </Link>
              <Link 
                to="/auth/register" 
                className="btn-secondary text-sm"
              >
                Inscription
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
