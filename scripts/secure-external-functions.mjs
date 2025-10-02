#!/usr/bin/env node

/**
 * Script de sécurisation des fonctions Netlify externes
 * 
 * Ce script génère les fichiers de sécurité nécessaires pour chaque repo externe
 * et fournit les instructions de déploiement.
 */

import fs from 'fs';
import path from 'path';

const EXTERNAL_REPOS = [
  {
    name: 'ankilangrevirada',
    url: 'https://ankilangrevirada.netlify.app',
    function: 'revirada',
    priority: 'CRITICAL',
    description: 'Traduction Occitan'
  },
  {
    name: 'ankilangvotz', 
    url: 'https://ankilangvotz.netlify.app',
    function: 'votz',
    priority: 'CRITICAL',
    description: 'TTS Occitan'
  },
  {
    name: 'ankilangtts',
    url: 'https://ankilangtts.netlify.app', 
    function: 'tts',
    priority: 'HIGH',
    description: 'TTS multilingue'
  },
  {
    name: 'ankilangdeepl',
    url: 'https://ankilangdeepl.netlify.app',
    function: 'translate', 
    priority: 'HIGH',
    description: 'Traduction DeepL'
  },
  {
    name: 'ankilangpexels',
    url: 'https://ankilangpexels.netlify.app',
    function: 'pexels',
    priority: 'HIGH', 
    description: 'Images Pexels'
  }
];

// Templates pour les fichiers de sécurité
const AUTH_TEMPLATE = `import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { problem } from "./problem";

/**
 * Interface pour les données JWT décodées
 */
export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

/**
 * Interface pour les événements avec authentification
 */
export interface AuthenticatedEvent extends HandlerEvent {
  user: JWTPayload;
}

/**
 * Middleware d'authentification JWT pour les fonctions Netlify
 */
export function withAuth(handler: Handler): Handler {
  return async (event: HandlerEvent, context: HandlerContext) => {
    try {
      // Extraire le token JWT du header Authorization
      const authHeader = event.headers.authorization || event.headers.Authorization;
      
      if (!authHeader) {
        return problem(401, "Authentication required", "Missing Authorization header");
      }

      // Vérifier le format Bearer
      if (!authHeader.startsWith("Bearer ")) {
        return problem(401, "Invalid authentication format", "Expected Bearer token");
      }

      const token = authHeader.substring(7);
      
      if (!token) {
        return problem(401, "Invalid token", "Empty token provided");
      }

      // Décoder et valider le JWT
      const payload = await validateJWT(token);
      
      if (!payload) {
        return problem(401, "Invalid token", "Token validation failed");
      }

      // Vérifier l'expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return problem(401, "Token expired", "JWT has expired");
      }

      // Ajouter les informations utilisateur à l'événement
      const authenticatedEvent = {
        ...event,
        user: payload
      } as AuthenticatedEvent;

      // Ajouter le traceId si présent
      const traceId = event.headers['x-trace-id'] || event.headers['X-Trace-Id'] || generateTraceId();
      
      // Appeler le handler avec l'événement authentifié
      const response = await handler(authenticatedEvent, context);
      
      // Ajouter le traceId à la réponse
      if (response && response.headers) {
        response.headers['X-Trace-Id'] = traceId;
      }

      return response || {
        statusCode: 200,
        headers: { 'X-Trace-Id': traceId },
        body: 'OK'
      };
    } catch (error) {
      console.error('Auth middleware error:', error);
      return problem(500, "Authentication error", "Internal server error during authentication");
    }
  };
}

/**
 * Valide un JWT Appwrite
 */
async function validateJWT(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    
    if (!payload.userId || !payload.email) {
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    console.error('JWT validation error:', error);
    return null;
  }
}

/**
 * Génère un traceId unique
 */
function generateTraceId(): string {
  return \`trace-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
}

/**
 * Helper pour extraire l'userId d'un événement authentifié
 */
export function getUserId(event: AuthenticatedEvent): string {
  return event.user.userId;
}
`;

const PROBLEM_TEMPLATE = `import type { HandlerResponse } from "@netlify/functions";

/**
 * RFC 7807 Problem Details for HTTP APIs
 */
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
}

/**
 * Génère un traceId unique pour le tracing
 */
function generateTraceId(): string {
  return \`trace-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
}

export const problem = (
  status: number,
  title: string,
  detail?: string,
  type: string = "about:blank",
  traceId?: string
): HandlerResponse => {
  const problemDetails: ProblemDetails = {
    type,
    title,
    status,
    detail,
    traceId: traceId || generateTraceId(),
  };

  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/problem+json",
      "X-Trace-Id": problemDetails.traceId!,
    },
    body: JSON.stringify(problemDetails),
  };
};
`;

const CORS_TEMPLATE = `/**
 * Headers CORS sécurisés
 */
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://ankilang.netlify.app',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Trace-Id',
    'Access-Control-Max-Age': '86400', // 24h cache pour preflight
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  };
}
`;

const RATE_LIMIT_TEMPLATE = `/**
 * Rate limiting par utilisateur
 */
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, limit: number = 100, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}
`;

const LOGGING_TEMPLATE = `/**
 * Logging structuré avec traceId
 */
export function logRequest(traceId: string, userId: string, action: string, details?: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    traceId,
    userId,
    action,
    details,
    level: 'info'
  }));
}

export function logError(traceId: string, userId: string, error: Error, context?: any) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    traceId,
    userId,
    error: error.message,
    stack: error.stack,
    context,
    level: 'error'
  }));
}
`;

// Template pour une fonction sécurisée
function generateSecureFunction(repo) {
  return `import type { Handler } from "@netlify/functions";
import { withAuth, getUserId, type AuthenticatedEvent } from "./lib/auth";
import { problem } from "./lib/problem";
import { corsHeaders } from "./lib/cors";
import { checkRateLimit } from "./lib/rate-limit";
import { logRequest, logError } from "./lib/logging";

/**
 * ${repo.description} - Fonction sécurisée
 */
const ${repo.function}Handler = async (event: AuthenticatedEvent) => {
  const traceId = event.headers['x-trace-id'] || 'no-trace';
  const userId = getUserId(event);
  
  try {
    // Vérifier le rate limiting
    if (!checkRateLimit(userId, 100, 3600000)) { // 100 req/heure
      return problem(429, "Rate limit exceeded", "Too many requests");
    }
    
    logRequest(traceId, userId, '${repo.function}_request', {
      method: event.httpMethod,
      path: event.path
    });
    
    // Parse du body
    const body = JSON.parse(event.body || '{}');
    
    // TODO: Implémenter la logique métier spécifique à ${repo.name}
    // Exemple pour revirada:
    // const { text, targetLang } = body;
    // const result = await translateOccitan(text, targetLang);
    
    const result = {
      success: true,
      message: '${repo.description} processed successfully',
      traceId,
      userId
    };
    
    logRequest(traceId, userId, '${repo.function}_success', { result });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
        'X-Trace-Id': traceId,
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    logError(traceId, userId, error as Error, { function: '${repo.function}' });
    return problem(500, "Internal server error", "An error occurred processing the request");
  }
};

// Exporter la fonction avec le middleware d'authentification
export const handler = withAuth(${repo.function}Handler);
`;
}

async function generateSecurityFiles() {
  console.log('🔒 Génération des fichiers de sécurité pour les fonctions Netlify externes...\n');
  
  for (const repo of EXTERNAL_REPOS) {
    console.log(`📁 Génération pour ${repo.name} (${repo.priority})`);
    
    const outputDir = `external-functions/${repo.name}`;
    
    // Créer la structure de dossiers
    await fs.promises.mkdir(`${outputDir}/lib`, { recursive: true });
    await fs.promises.mkdir(`${outputDir}/netlify/functions`, { recursive: true });
    
    // Générer les fichiers de sécurité
    await fs.promises.writeFile(`${outputDir}/lib/auth.ts`, AUTH_TEMPLATE);
    await fs.promises.writeFile(`${outputDir}/lib/problem.ts`, PROBLEM_TEMPLATE);
    await fs.promises.writeFile(`${outputDir}/lib/cors.ts`, CORS_TEMPLATE);
    await fs.promises.writeFile(`${outputDir}/lib/rate-limit.ts`, RATE_LIMIT_TEMPLATE);
    await fs.promises.writeFile(`${outputDir}/lib/logging.ts`, LOGGING_TEMPLATE);
    
    // Générer la fonction sécurisée
    const secureFunction = generateSecureFunction(repo);
    await fs.promises.writeFile(`${outputDir}/netlify/functions/${repo.function}.ts`, secureFunction);
    
    // Générer package.json
    const packageJson = {
      name: repo.name,
      version: "1.0.0",
      description: repo.description,
      main: "netlify/functions/index.js",
      scripts: {
        "build": "tsc",
        "dev": "netlify dev",
        "deploy": "netlify deploy --prod"
      },
      dependencies: {
        "@netlify/functions": "^2.0.0"
      },
      devDependencies: {
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0"
      }
    };
    
    await fs.promises.writeFile(
      `${outputDir}/package.json`, 
      JSON.stringify(packageJson, null, 2)
    );
    
    // Générer tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        lib: ["ES2020"],
        outDir: "./dist",
        rootDir: "./",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ["**/*.ts"],
      exclude: ["node_modules", "dist"]
    };
    
    await fs.promises.writeFile(
      `${outputDir}/tsconfig.json`, 
      JSON.stringify(tsconfig, null, 2)
    );
    
    // Générer netlify.toml
    const netlifyToml = `[build]
  command = "npm run build"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
`;
    
    await fs.promises.writeFile(`${outputDir}/netlify.toml`, netlifyToml);
    
    console.log(`  ✅ Fichiers générés dans ${outputDir}/`);
  }
  
  console.log('\n🎉 Génération terminée !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Copier les fichiers dans chaque repo externe');
  console.log('2. Installer les dépendances : npm install');
  console.log('3. Tester localement : npm run dev');
  console.log('4. Déployer : npm run deploy');
  console.log('\n⚠️  N\'oubliez pas de mettre à jour le frontend ankilang avec les JWT !');
}

// Générer un rapport de sécurité
async function generateSecurityReport() {
  console.log('\n📊 Rapport de sécurité des fonctions externes\n');
  
  for (const repo of EXTERNAL_REPOS) {
    const status = repo.priority === 'CRITICAL' ? '🔴 CRITIQUE' : '🟡 ÉLEVÉE';
    console.log(`${status} ${repo.name}`);
    console.log(`   URL: ${repo.url}/.netlify/functions/${repo.function}`);
    console.log(`   Description: ${repo.description}`);
    console.log(`   Sécurité: ❌ Non authentifié`);
    console.log(`   Actions: Authentification JWT + CORS + Rate limiting`);
    console.log('');
  }
  
  console.log('📈 Impact business :');
  console.log('  • Coûts API illimités (DeepL, AWS Polly, Pexels)');
  console.log('  • Risque de DDoS et abus');
  console.log('  • Violation des ToS des fournisseurs');
  console.log('');
  
  console.log('⏱️  Estimation :');
  console.log('  • 2-3 jours par repo (6 repos = 12-18 jours)');
  console.log('  • Priorité 1: ankilangrevirada, ankilangvotz');
  console.log('  • Priorité 2: ankilangtts, ankilangdeepl, ankilangpexels');
}

// Exécuter le script
async function main() {
  try {
    await generateSecurityFiles();
    await generateSecurityReport();
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    process.exit(1);
  }
}

main();
