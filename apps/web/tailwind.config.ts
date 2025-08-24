import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      keyframes: {
        breathing: { '0%,100%': { transform:'scale(1)' }, '50%': { transform:'scale(1.012)' } },
        floatSlow: { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-8px)' } },
        glow: { '0%,100%': { opacity: .35 }, '50%': { opacity: .6 } },
      },
      animation: {
        breathing: 'breathing 4s ease-in-out infinite',
        floatSlow: 'floatSlow 16s ease-in-out infinite',
        glow: 'glow 6s ease-in-out infinite',
      }
    }
  },
  safelist: [
    // surfaces / gradients utilisés dans le wrapper
    'blur-3xl','from-violet-500','via-fuchsia-500','to-sky-500',
    'from-fuchsia-500','to-blue-500',
    'bg-white/70','dark:bg-slate-900/60','border-white/20','dark:border-slate-700/30',
    // Classes de grille pour BentoGrid
    'col-span-1','col-span-2','col-span-3','col-span-4','col-span-5','col-span-6',
    'col-span-7','col-span-8','col-span-9','col-span-10','col-span-11','col-span-12',
    'sm:col-span-1','sm:col-span-2','sm:col-span-3','sm:col-span-4','sm:col-span-5','sm:col-span-6',
    'sm:col-span-7','sm:col-span-8','sm:col-span-9','sm:col-span-10','sm:col-span-11','sm:col-span-12',
    'lg:col-span-1','lg:col-span-2','lg:col-span-3','lg:col-span-4','lg:col-span-5','lg:col-span-6',
    'lg:col-span-7','lg:col-span-8','lg:col-span-9','lg:col-span-10','lg:col-span-11','lg:col-span-12',
    'row-span-2','row-span-3','row-span-4','row-span-5','row-span-6'
  ],
  plugins: []
} satisfies Config
