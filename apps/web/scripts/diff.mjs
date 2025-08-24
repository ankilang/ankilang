import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const widths = [320, 375, 768, 1280];
const baseDir = 'reports/baseline';
const currDir = 'reports/screenshots';
const outDir = 'reports/diff';
fs.mkdirSync(outDir, { recursive: true });

for (const w of widths) {
  const basePath = path.resolve(baseDir, `lp-${w}.png`);
  const currPath = path.resolve(currDir, `lp-${w}.png`);
  if (!fs.existsSync(basePath) || !fs.existsSync(currPath)) {
    console.log(`• Skip ${w}px (baseline ou current manquant)`);
    continue;
  }
  const img1 = PNG.sync.read(fs.readFileSync(basePath));
  const img2 = PNG.sync.read(fs.readFileSync(currPath));
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
  const pct = (mismatched / (width * height)) * 100;
  const outPath = path.resolve(outDir, `lp-${w}-diff.png`);
  fs.writeFileSync(outPath, PNG.sync.write(diff));
  console.log(`✓ ${w}px mismatch: ${pct.toFixed(2)}% (${outPath})`);
}

console.log('Astuce: pour fixer un nouveau baseline, copiez reports/screenshots/* vers reports/baseline/');
