#!/usr/bin/env node

import { chromium } from 'playwright'
import lighthouse from 'lighthouse'
import { writeFileSync } from 'fs'
import { join } from 'path'

const PORT = process.env.PORT || 3000
const BASE_URL = `http://localhost:${PORT}`

async function runLighthouseAudit() {
  console.log('🔍 Démarrage de l\'audit Lighthouse...')
  
  // Lancer le serveur de développement si nécessaire
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Naviguer vers la page
    console.log(`📱 Test de la page d'accueil: ${BASE_URL}`)
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Attendre que la page soit complètement chargée
    await page.waitForTimeout(3000)

    // Configuration Lighthouse
    const options = {
      logLevel: 'info',
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: 9222,
      settings: {
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        },
        formFactor: 'desktop'
      }
    }

    // Exécuter l'audit
    console.log('⚡ Exécution de l\'audit Lighthouse...')
    const runnerResult = await lighthouse(BASE_URL, options)

    // Sauvegarder le rapport
    const reportPath = join(process.cwd(), 'reports', 'lighthouse-report.html')
    writeFileSync(reportPath, runnerResult.report)

    // Afficher les scores
    const scores = {
      performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
      accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
      'best-practices': Math.round(runnerResult.lhr.categories['best-practices'].score * 100),
      seo: Math.round(runnerResult.lhr.categories.seo.score * 100)
    }

    console.log('\n📊 Résultats de l\'audit Lighthouse:')
    console.log('================================')
    console.log(`🚀 Performance: ${scores.performance}/100`)
    console.log(`♿ Accessibilité: ${scores.accessibility}/100`)
    console.log(`✅ Bonnes pratiques: ${scores['best-practices']}/100`)
    console.log(`🔍 SEO: ${scores.seo}/100`)
    console.log('================================')

    // Vérifier les seuils
    const thresholds = {
      performance: 90,
      accessibility: 95,
      'best-practices': 90,
      seo: 90
    }

    let allPassed = true
    for (const [category, score] of Object.entries(scores)) {
      const threshold = thresholds[category]
      const status = score >= threshold ? '✅' : '❌'
      console.log(`${status} ${category}: ${score}/${threshold}`)
      if (score < threshold) allPassed = false
    }

    console.log(`\n📄 Rapport détaillé sauvegardé: ${reportPath}`)

    if (allPassed) {
      console.log('\n🎉 Tous les seuils sont atteints !')
      process.exit(0)
    } else {
      console.log('\n⚠️  Certains seuils ne sont pas atteints.')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error.message)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

// Fonction pour tester les Core Web Vitals
async function testCoreWebVitals() {
  console.log('\n📈 Test des Core Web Vitals...')
  
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    
    // Mesurer les métriques
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const metrics = {}
          
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry
              metrics.TTFB = navEntry.responseStart - navEntry.requestStart
            }
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.LCP = entry.startTime
            }
          })
          
          resolve(metrics)
        })
        
        observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint'] })
        
        // Timeout après 5 secondes
        setTimeout(() => resolve({}), 5000)
      })
    })

    console.log('📊 Métriques mesurées:', metrics)
    
  } catch (error) {
    console.error('❌ Erreur lors du test des Core Web Vitals:', error.message)
  } finally {
    await browser.close()
  }
}

// Exécuter les audits
if (import.meta.url === `file://${process.argv[1]}`) {
  runLighthouseAudit()
    .then(() => testCoreWebVitals())
    .catch(console.error)
}
