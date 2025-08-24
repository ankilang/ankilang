import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const URL = process.env.LP_URL || 'http://localhost:4173/';
const outDir = resolve('reports/lighthouse');
mkdirSync(outDir, { recursive: true });
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const outBase = resolve(outDir, `lp-mobile-${ts}`);

// Utilise la CLI via npx pour éviter d'ajouter chrome-launcher
const cmd = [
  'npx',
  'lighthouse',
  URL,
  '--preset=mobile',
  '--only-categories=performance,accessibility,seo,best-practices',
  '--throttling-method=devtools',
  '--screenEmulation.mobile',
  `--output=json`,
  `--output=html`,
  `--output-path="${outBase}"`
].join(' ');

console.log('> Lighthouse mobile…');
execSync(cmd, { stdio: 'inherit' });
console.log(`✓ Rapports: ${outBase}.html / ${outBase}.json`);
