import { Outlet, Link, NavLink } from 'react-router-dom'
import { BookOpen, Settings, User } from 'lucide-react'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link 
                to="/app" 
                className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                <BookOpen className="w-6 h-6" />
                Ankilang
              </Link>
              <nav className="flex items-center gap-4">
                <NavLink 
                  to="/app/themes" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-blue-600 font-medium" 
                      : "text-gray-600 hover:text-gray-900"
                  }
                >
                  Mes thèmes
                </NavLink>
                <NavLink 
                  to="/app/community" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-blue-600 font-medium" 
                      : "text-gray-600 hover:text-gray-900"
                  }
                >
                  Communauté
                </NavLink>
                <NavLink 
                  to="/app/lessons" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-blue-600 font-medium" 
                      : "text-gray-600 hover:text-gray-900"
                  }
                >
                  Leçons
                </NavLink>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Link 
                to="/app/account" 
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <User size={20} />
              </Link>
              <Link 
                to="/app/account/billing" 
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Settings size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-dvh">
        <Outlet />
      </main>
    </div>
  )
}
