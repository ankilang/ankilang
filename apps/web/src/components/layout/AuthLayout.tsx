import { Outlet, Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <BookOpen className="w-6 h-6" />
              Ankilang
            </Link>
            <nav className="flex items-center gap-4">
              <Link 
                to="/auth/login" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Connexion
              </Link>
              <Link 
                to="/auth/register" 
                className="btn-primary text-sm"
              >
                Inscription
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="min-h-dvh">
        <Outlet />
      </main>
    </div>
  )
}
