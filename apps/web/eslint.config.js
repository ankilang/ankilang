import js from '@eslint/js'
import typescript from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default typescript.config(
  // Ignorer les fichiers de build et dépendances
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      '*.config.cjs',
      '*.config.mjs',
      'scripts/**',
      'public/**',
      'coverage/**',
      '.vite/**',
      'src/exporter/**', // Exporter legacy en JavaScript
      'src/scripts/**', // Test/debug scripts
      '**/*.d.ts', // Fichiers de déclaration TypeScript
    ],
  },

  // Configuration de base JavaScript
  js.configs.recommended,

  // Configuration TypeScript recommandée (moins stricte que strict)
  ...typescript.configs.recommendedTypeChecked,

  // Configuration globale
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Variables globales du navigateur
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        FileReader: 'readonly',
        IntersectionObserver: 'readonly',
        HTMLAudioElement: 'readonly',
        Audio: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        CustomEvent: 'readonly',
        ProgressEvent: 'readonly',
        // Variables Vite/Node
        process: 'readonly',
        NodeJS: 'readonly',
        // Variables globales test
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
  },

  // Configuration React
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Règles React recommandées
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // React Refresh (Fast Refresh pour HMR)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Règles TypeScript personnalisées
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/require-await': 'warn',

      // Règles React personnalisées
      'react/prop-types': 'off', // On utilise TypeScript pour les types
      'react/react-in-jsx-scope': 'off', // Pas nécessaire avec React 18
      'react/jsx-uses-react': 'off', // Pas nécessaire avec React 18
      'react/no-unescaped-entities': 'warn', // Warn au lieu d'error

      // Règles générales
      'no-console': 'warn', // Warn au lieu d'error, permet console.log en dev
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Configuration spécifique pour les fichiers JavaScript (scripts, config, etc.)
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...typescript.configs.disableTypeChecked,
  },

  // Configuration pour les fichiers de test
  {
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Configuration pour l'exporter (fichiers JavaScript legacy)
  {
    files: ['src/exporter/**/*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': 'off',
    },
  }
)
