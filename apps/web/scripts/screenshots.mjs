import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const URL = process.env.LP_URL || 'http://localhost:4173/';
const widths = [320, 375, 768, 1280];
const outDir = resolve('reports/screenshots');
mkdirSync(outDir, { recursive: true });

(async () => {
  console.log('> Screenshots LP…');
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });

  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 1000 });
    await page.waitForTimeout(600); // petit délai pour stabiliser la mise en page
    const p = resolve(outDir, `lp-${w}.png`);
    await page.screenshot({ path: p, fullPage: true });
    console.log(`✓ ${p}`);
  }

  await browser.close();
})();
