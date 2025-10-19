# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ankilang is a modern React PWA for creating flashcards (Basic & Cloze types) with Anki export functionality, focused on language learning with special support for Occitan and regional languages.

**Tech Stack**: React 18 + TypeScript (strict) + Vite + Tailwind CSS + TanStack Query + Appwrite (auth & database) + SQL.js (Anki export)

## Commands

### Development
```bash
pnpm dev              # Start web app dev server (localhost:5173)
pnpm build            # Build web app only
pnpm build:all        # Build all packages in monorepo
pnpm typecheck        # TypeScript validation across all packages
pnpm preview          # Preview production build (localhost:4173)
```

### Testing & Quality
```bash
pnpm test             # Run tests across all packages
# Lint not yet configured - echo placeholder exists
```

### Installation
```bash
pnpm install          # Install all dependencies (uses frozen lockfile in CI)
```

**Requirements**: Node.js ≥20, pnpm ≥10.0.0

## Architecture

### Monorepo Structure
This is a **pnpm workspace** monorepo:
- `apps/web/` - React PWA (main application)
- `packages/shared/` - Zod schemas and shared TypeScript types
- `packages/shared-cache/` - Multi-tier caching system (memory LRU → IndexedDB → Appwrite Storage)
- `apps/functions/` - Netlify Functions (planned, not yet implemented)
- `services/exporter/` - FastAPI + genanki service (planned, not yet implemented)

### Data Model & Database

**Primary Entities**:
1. **Theme** (`packages/shared/src/schemas/theme.ts`) - Groups flashcards by learning domain
   - Fields: `id`, `userId`, `name`, `category` (language/other), `targetLang`, `tags`, `cardCount`, `shareStatus`
   - Stored in Appwrite database collection `themes`
   - Service: `apps/web/src/services/themes.service.ts` (ThemesService)

2. **Card** (`packages/shared/src/schemas/card.ts`) - Individual flashcard
   - Types: `basic` (front/back) or `cloze` (fill-in-the-blank with `{{cN::...}}` syntax)
   - Fields: `id`, `userId`, `themeId`, `type`, `frontFR`, `backText`, `clozeTextTarget`, `extra`, `imageUrl`, `audioUrl`, `tags`
   - Stored in Appwrite database collection `cards`
   - Service: `apps/web/src/services/cards.service.ts` (CardsService)

**Database Pattern**: All services use `DatabaseService` (`apps/web/src/services/database.service.ts`), a generic CRUD wrapper around Appwrite's database SDK. Permissions are owner-only (set via `Permission.read/write/delete(Role.user(userId))`).

### State Management with React Query

**Query Keys** (`apps/web/src/hooks/queryKeys.ts`): Standardized keys prevent unnecessary refetches
- `themes(userId)` - List of user's themes
- `theme(themeId, userId)` - Single theme
- `cards(themeId)` - Cards for a theme
- `themeData(themeId, userId)` - Combined theme + cards

**Key Hooks**:
- `useThemeData(themeId, userId)` - Loads theme and cards in parallel, returns combined state
- `useThemes(userId)` - Loads user's theme list
- `useThemeMutations()` - Provides create/update/delete mutations with optimistic updates and cache invalidation

**Configuration**: QueryClient configured in `main.tsx` with `staleTime: 5min`, `retry: 1`

### Authentication & Authorization

**Context**: `AuthContext` (`apps/web/src/contexts/AuthContext.tsx`) wraps the app in `App.tsx`
- Appwrite session-based auth (email/password)
- Provides: `user`, `isLoading`, `login`, `signup`, `logout`, `updateEmail`
- Session check on mount, blocks render until `isLoading: false`

**Protected Routes**: `ProtectedRoute` component redirects to `/auth/login` if not authenticated

**JWT Generation**: `getSessionJWT()` in `apps/web/src/services/appwrite.ts` creates JWT for authenticating with future Netlify Functions (not yet implemented)

### Routing Architecture

**Router**: React Router v6 with lazy-loaded routes in `apps/web/src/routes/RootRoutes.tsx`

**Route Structure**:
- `/` - Public (Landing, Abonnement, Offline)
- `/auth/*` - Auth pages (Login, Register, ForgotPassword, VerifyEmail) with `AuthLayout`
- `/legal/*` - Terms, Privacy with `LegalLayout`
- `/app/*` - Protected routes with `AppLayout` (has TabBar navigation for mobile)
  - `/app` - Dashboard
  - `/app/themes` - Theme list
  - `/app/themes/new` - Create theme
  - `/app/themes/:id` - Theme detail (card list)
  - `/app/themes/:id/export` - Export theme to Anki
  - `/app/tips`, `/app/workshop`, `/app/library` - Resources (workshop/library are Pro-only)
  - `/app/account` - User account settings

**Prefetching**: `App.tsx` preloads frequently-used routes on idle (themes/Index, themes/Detail, account/Index) unless on slow connection or data-saver mode

### Anki Export System

**Location**: `apps/web/src/exporter/` (JavaScript, not TypeScript)

**Architecture**:
- `core/exporter.js` - Main `AnkiLangExporter` class
- `utils/genanki.js` - Port of genanki (Python library) to JS using SQL.js
- `utils/cloze.js` - Cloze syntax parsing (`{{cN::answer}}` or `{{cN::answer::hint}}`)
- `hooks/useAnkiLang.js` - React hook wrapping exporter

**Export Flow**:
1. Initialize SQL.js (loads WASM from `/node_modules/sql.js/dist/`)
2. Create `FlexibleClozeModel` with Anki fields
3. Convert cards to Anki notes
4. Build SQLite database + ZIP package (.apkg)
5. Trigger browser download

**Cloze Support**: Supports multiple cloze deletions per card with optional hints. Cloze numbers extracted via regex `/\{\{c(\d+)::[^}]+\}\}/g`

### Language Support & Localization

**Supported Languages** (`apps/web/src/constants/languages.ts`):
- **41 languages total**: 39 DeepL languages + 2 Occitan dialects
- **DeepL languages**: All codes in UPPERCASE (AR, BG, CS, DA, DE, EL, EN-GB, EN-US, ES, ES-419, ET, FI, FR, HE, HU, ID, IT, JA, KO, LT, LV, NB, NL, PL, PT-BR, PT-PT, RO, RU, SK, SL, SV, TH, TR, UK, VI, ZH-HANS, ZH-HANT)
- **Occitan variants**: lowercase (oc, oc-gascon)
- Each language has: `code`, `label`, `nativeName`, `flag`, `color` (Tailwind gradient)

**Flag System** (`apps/web/src/components/ui/FlagIcon.tsx`):
- **38 SVG flags**: 37 from Twemoji (CC-BY 4.0) + 1 custom Occitan flag (Public Domain)
- **Location**: `apps/web/src/assets/flags/*.svg`
- **Format**: All flags 36×36 viewBox with rounded corners (rx="4") for visual consistency
- **Mapping**: `COUNTRY_MAP` handles language code → country code conversions (e.g., ar→sa, cs→cz, ja→jp)
- **Occitan dialects**: Same base flag (croix occitane) with orange "G" badge overlay for gascon variant
- **License attribution**: See `apps/web/src/assets/flags/README.md`

**Flag Icon Component**:
```typescript
<FlagIcon languageCode="EN-US" size={24} />  // US flag
<FlagIcon languageCode="oc" size={24} />      // Occitan flag
<FlagIcon languageCode="oc-gascon" size={24} /> // Occitan flag + "G" badge
```

### External Service Integration

**Translation** (`apps/web/src/services/translate.ts`):
- **Endpoint**: Vercel API (`ankilang-api-monorepo`)
- **Providers**: Revirada (Occitan), DeepL (39 languages)
- **Language code normalization**: UPPERCASE for DeepL, lowercase for Occitan
- **Auto-routing**: `shouldUseRevirada()` detects if translation involves Occitan
- **Functions**:
  - `translate(req)` - Auto-detects provider based on language codes
  - `translateOccitan(text, direction, dialect)` - Direct Revirada wrapper
  - `translateMultilingual(text, sourceLang, targetLang)` - Direct DeepL wrapper

**Text-to-Speech** (`apps/web/src/services/tts.ts`):
- Votz API for Occitan (`apps/web/src/services/votz.ts`)
- ElevenLabs via Appwrite Function for other languages (`apps/web/src/services/elevenlabs-appwrite.ts`)
- Audio stored as URLs in card `audioUrl` field
- Cached in multi-tier cache system

**Images** (`apps/web/src/services/pexels.ts`):
- Unified Pexels service using Vercel API (`ankilang-api-monorepo.vercel.app`)
- Image search via `/api/pexels` endpoint
- Image optimization via `/api/pexels-optimize` (Sharp on server, returns base64)
- Client-side upload to Appwrite Storage for optimized images
- Curated photos use fallback search ("nature landscape")
- Image URLs stored in card `imageUrl` field

### Caching Architecture

**Package**: `packages/shared-cache/` - Three-tier cache system

**Tiers**:
1. **Memory LRU** (`memory-lru.ts`) - Fast in-memory cache with size limits
2. **IndexedDB** (`browser-idb.ts`) - Persistent browser storage via localforage
3. **Appwrite Storage** (`appwrite-storage.ts`) - Cloud backup for media (images, audio)

**Key Generation** (`key.ts`): Deterministic cache keys using SHA-256 hashing of request parameters

**Usage Pattern**:
```typescript
const cache = createMemoryLRUCache(100) // or createBrowserIDBCache()
await cache.set(key, blob, { ttl: 3600 })
const result = await cache.get(key)
```

**Cache Janitor** (`apps/web/src/services/cache-janitor.function.ts`): Periodic cleanup of expired entries

### PWA Configuration

**Status**: PWA plugin currently **DISABLED** (`vite.config.ts` line 11) due to service worker regression
- Legacy SW cleanup runs on app init (`main.tsx` lines 69-89)
- Manifest served from `public/manifest.webmanifest` (not generated)

**When Re-enabled**:
- Auto-update mode with `skipWaiting` and `clientsClaim`
- Caches fonts, Appwrite media, and app bundles
- Network-first for SQL.js WASM files
- Cache-first for media and fonts

### Component Architecture

**Card Creation Flow** (V2 Modal):
- `apps/web/src/components/cards/new-modal-v2/NewCardModalV2.tsx` - Main orchestrator
- 3-step wizard: Type selection → Content input → Enhancement (translate/image/audio)
- `StepContent.tsx` - Handles Basic vs Cloze input with visual helpers (Cloze shows blue ellipses for blanks)
- `StepEnhance.tsx` - TTS generation (Votz for Occitan, ElevenLabs for others), translation, image search
- Audio preview with mini play/pause button when `audioUrl` present

**Card Display**:
- `VirtualizedCardList.tsx` - Uses `@tanstack/react-virtual` for performance with large lists
- `CardList.tsx` - Simpler non-virtualized list
- Cards show language badges, status badges, media indicators, quick actions

**Layouts**:
- `PublicLayout` - Minimal for landing/marketing
- `AuthLayout` - Centered card for auth forms
- `AppLayout` - Has TabBar (bottom nav on mobile, sticky on tablet/desktop) with Dashboard/Themes/Tips/Account tabs
- `LegalLayout` - Simple legal content wrapper

### Performance Optimization

**Code Splitting** (`vite.config.ts` lines 113-123):
- `react-vendor` - React/ReactDOM
- `router` - React Router
- `ui-vendor` - Framer Motion, Lucide icons
- `query` - TanStack Query
- `forms` - React Hook Form + Zod
- `export` - SQL.js + JSZip
- `cache` - LocalForage
- `pwa` - Workbox

**Font Loading** (`main.tsx` lines 7-48):
- Conditional loading based on network speed (skips on 2G/3G or data-saver mode)
- Inter (primary), Playfair Display (headings)
- Loads via `@fontsource` packages asynchronously

**Image Optimization**: WebP/AVIF preferred, lazy-load recommended in `.cursorrules`

### Development Rules from .cursorrules

**Critical Patterns**:
1. **Plan → Diff Workflow**: Multi-file changes require plan approval first (`.cursor/rules/plan-diff.mdc`)
2. **Zod Validation**: ALL I/O boundaries must use Zod schemas (`.cursor/rules/zod-io.mdc`)
3. **Error Format**: API errors use RFC 7807 format `{ type, title, detail, status, traceId }` (`.cursor/rules/rfc7807.mdc`)
4. **No Partial Code**: Never commit `// TODO` or `// ...` stubs
5. **TypeScript Strict Mode**: All code must pass strict type checking
6. **No Secrets in Frontend**: API keys only in functions/services, never in client code

**Naming Conventions**:
- Components: PascalCase
- Hooks: `useXxx`
- Functions/variables: camelCase
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`)

**Imports**: Use absolute imports where configured (`@/*` alias points to `apps/web/src/`)

## Key Design Decisions

1. **Monorepo over Polyrepo**: Shared types/schemas in one place, simpler versioning
2. **Appwrite over Custom Backend**: Faster development, built-in auth/permissions
3. **Client-Side Export over Server**: No backend needed for .apkg generation, works offline
4. **Multi-Tier Caching**: Reduces API calls, improves offline capability
5. **Zod at Boundaries**: Runtime validation prevents type mismatches between frontend/backend
6. **React Query for State**: Server state separate from local state, automatic refetching/caching
7. **Lazy Routes**: Faster initial load, split bundles per route

## Common Tasks

### Add a New Theme Field
1. Update `packages/shared/src/schemas/theme.ts` (add to `ThemeSchema`)
2. Run `pnpm -C packages/shared build` to regenerate types
3. Update Appwrite collection schema in cloud dashboard
4. Update `ThemesService` methods if needed
5. Update UI in `apps/web/src/components/themes/ThemeForm.tsx`

### Add a New Card Type
1. Define schema in `packages/shared/src/schemas/card.ts` (extend `CardSchema`)
2. Update `apps/web/src/components/cards/new-modal-v2/StepType.tsx` for type selection
3. Update `StepContent.tsx` for input UI
4. Update `apps/web/src/exporter/core/exporter.js` for Anki export logic

### Add External API Integration
1. Create service in `apps/web/src/services/` (use `axios` + Zod validation)
2. Add environment variables to `.env` (never commit secrets)
3. Implement caching via `@ankilang/shared-cache` if needed
4. Create React Query hook in `apps/web/src/hooks/`
5. For server-side: Plan Netlify Function in `apps/functions/` (use JWT auth, RFC 7807 errors)

### Add a New Language
1. **Check DeepL support**: Verify language is supported at https://developers.deepl.com/docs/resources/supported-languages
2. **Update language list**: Add to `LANGUAGES` array in `apps/web/src/constants/languages.ts`
   ```typescript
   { code: 'XX', label: 'Language Name', nativeName: 'Native Name', flag: 'xx', color: 'from-color-400 to-color-500' }
   ```
3. **Add flag SVG**:
   - If country flag: Download from Twemoji (https://github.com/twitter/twemoji)
   - If regional flag: Create custom SVG matching Twemoji style (36×36 viewBox, rx="4")
   - Place in `apps/web/src/assets/flags/xx.svg`
4. **Update flag mapping** (if needed): Add to `COUNTRY_MAP` in `FlagIcon.tsx` if language code ≠ country code
5. **Update API types**: Add language code to `DeepLSourceLang` and `DeepLTargetLang` in:
   - `apps/web/src/types/ankilang-vercel-api.ts` (frontend)
   - `ankilang-api-monorepo/lib/utils/validation.ts` (backend)
6. **Update normalization**: If special case (like EN → EN-US), update `normalizeDeepLLang()` in `translate.ts`
7. **Document**: Update `apps/web/src/assets/flags/README.md` if adding custom flag

### Manage Language Variants (like EN-GB/EN-US)
- **Use distinct codes**: `EN-GB` vs `EN-US` (case-sensitive, UPPERCASE for DeepL)
- **Distinct flags**: Each variant gets its own flag (`gb.svg` vs `us.svg`)
- **Mapping**: Add both to `COUNTRY_MAP` if needed
- **Example**: Portuguese has `PT-BR` (br.svg) and `PT-PT` (pt.svg)

### Debug Appwrite Issues
- Check browser console for `[Appwrite]` logs
- Verify `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID` in `.env`
- Check Appwrite dashboard for collection IDs matching service files
- Verify permissions (should be owner-only unless explicitly shared)
- Use Appwrite CLI `appwrite client` for debugging outside browser

### Fix PWA Issues
- Currently disabled - check `vite.config.ts` line 11
- If re-enabling: Test with `pnpm build && pnpm preview` (dev mode has PWA disabled)
- Clear old SWs: Open DevTools → Application → Service Workers → Unregister
- Clear caches: Application → Cache Storage → Delete all `ankilang-*` and `workbox-*`

## Important Files to Reference

- **Type Definitions**: `packages/shared/src/schemas/*.ts`
- **Service Layer**: `apps/web/src/services/{themes,cards,database}.service.ts`
- **Query Hooks**: `apps/web/src/hooks/use{ThemeData,ThemeMutations}.ts`
- **Auth Logic**: `apps/web/src/contexts/AuthContext.tsx`
- **Routing**: `apps/web/src/routes/RootRoutes.tsx`
- **Export Engine**: `apps/web/src/exporter/core/exporter.js`
- **Caching**: `packages/shared-cache/src/index.ts`
- **Build Config**: `apps/web/vite.config.ts`
- **Development Rules**: `.cursorrules`, `.cursor/rules/*.mdc`
- **Languages & Flags**:
  - `apps/web/src/constants/languages.ts` - All 41 supported languages with metadata
  - `apps/web/src/components/ui/FlagIcon.tsx` - Flag rendering component with COUNTRY_MAP
  - `apps/web/src/assets/flags/` - 38 SVG flag files (37 Twemoji + 1 Occitan custom)
  - `apps/web/src/assets/flags/README.md` - Flag sources, licenses, and attribution
- **Translation Services**:
  - `apps/web/src/services/translate.ts` - Unified translation (DeepL + Revirada auto-routing)
  - `apps/web/src/types/ankilang-vercel-api.ts` - API type definitions
  - `ankilang-api-monorepo/lib/utils/validation.ts` - Backend Zod schemas

## Notes

- **Language Support**:
  - **41 languages total**: 39 from DeepL API + 2 Occitan dialects (languedocien, gascon)
  - **Translation**: Automatic routing between DeepL (multilingual) and Revirada (Occitan)
  - **TTS**: Votz for Occitan (free/unlimited), ElevenLabs for other languages (Pro feature)
  - **Flags**: All languages have SVG flags (37 Twemoji + 1 custom Occitan croix occitane)
  - **Occitan distinction**: Gascon variant shows orange "G" badge overlay on flag
- **API Integration**:
  - **Translation API**: Deployed on Vercel (`ankilang-api-monorepo`)
  - **Language codes**: UPPERCASE for DeepL (AR, EN-US, FR, etc.), lowercase for Occitan (oc, oc-gascon)
  - **Case normalization**: `normalizeDeepLLang()` handles case conversion automatically
- **Subscription System**: `SubscriptionContext` exists but Pro features not fully implemented
- **Offline Mode**: Currently partial - export works offline but creation requires Appwrite connection
- **Testing**: Test infrastructure exists (`vitest` configured) but tests not yet written
- **CI/CD**: Planned but not yet configured (see roadmap in README)
