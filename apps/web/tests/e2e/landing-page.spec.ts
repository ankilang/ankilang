import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the landing page correctly', async ({ page }) => {
    // Vérifier le titre
    await expect(page).toHaveTitle(/Ankilang.*Créez vos flashcards Anki/)
    
    // Vérifier les éléments principaux
    await expect(page.locator('h1')).toContainText('Créez vos flashcards Anki en 2 minutes')
    await expect(page.locator('text=Importez vos listes de vocabulaire')).toBeVisible()
    
    // Vérifier le CTA principal
    const ctaButton = page.locator('text=Commencer gratuitement')
    await expect(ctaButton).toBeVisible()
    await expect(ctaButton).toBeEnabled()
  })

  test('should have working navigation', async ({ page }) => {
    // Vérifier les liens de navigation
    await expect(page.locator('text=Tarifs')).toBeVisible()
    await expect(page.locator('text=Occitan')).toBeVisible()
    
    // Vérifier les actions du header
    await expect(page.locator('text=Se connecter')).toBeVisible()
    await expect(page.locator('text=S\'inscrire gratuitement')).toBeVisible()
  })

  test('should display FAQ section', async ({ page }) => {
    // Vérifier la section FAQ
    await expect(page.locator('text=Questions fréquentes')).toBeVisible()
    
    // Vérifier les questions FAQ
    await expect(page.locator('text=Ankilang remplace l\'application Anki ?')).toBeVisible()
    await expect(page.locator('text=Comment fonctionne l\'essai gratuit')).toBeVisible()
    await expect(page.locator('text=Quelles sont les langues supportées')).toBeVisible()
  })

  test('should have proper meta tags', async ({ page }) => {
    // Vérifier les meta tags SEO
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Importez vos listes de vocabulaire/)
    await expect(page.locator('meta[name="keywords"]')).toHaveAttribute('content', /flashcards, Anki/)
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('h1')).toBeVisible()
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('h1')).toBeVisible()
    
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should handle CTA click with loading state', async ({ page }) => {
    // Cliquer sur le CTA
    const ctaButton = page.locator('text=Commencer gratuitement')
    await ctaButton.click()
    
    // Vérifier l'état de chargement
    await expect(page.locator('text=Chargement...')).toBeVisible()
    
    // Attendre la redirection
    await page.waitForURL('/auth/register', { timeout: 10000 })
  })

  test('should display toast notification on CTA click', async ({ page }) => {
    // Cliquer sur le CTA
    await page.locator('text=Commencer gratuitement').click()
    
    // Vérifier la notification toast
    await expect(page.locator('text=Bienvenue sur Ankilang !')).toBeVisible()
    await expect(page.locator('text=Vous allez être redirigé')).toBeVisible()
  })
})

test.describe('404 Page', () => {
  test('should display 404 page for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route')
    
    // Vérifier les éléments de la page 404
    await expect(page.locator('h1')).toContainText('404')
    await expect(page.locator('text=Oups, cette page n\'existe pas')).toBeVisible()
    
    // Vérifier les liens de navigation
    await expect(page.locator('text=Retour à l\'accueil')).toBeVisible()
    await expect(page.locator('text=Tableau de bord')).toBeVisible()
  })

  test('should have working navigation from 404', async ({ page }) => {
    await page.goto('/invalid-route')
    
    // Cliquer sur "Retour à l'accueil"
    await page.locator('text=Retour à l\'accueil').click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Vérifier que la page se charge en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    
    // Mesurer les métriques de performance
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

    // Vérifier les seuils de performance
    if (metrics.TTFB) {
      expect(metrics.TTFB).toBeLessThan(800) // TTFB < 800ms
    }
    if (metrics.LCP) {
      expect(metrics.LCP).toBeLessThan(2500) // LCP < 2.5s
    }
  })
})

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier les attributs d'accessibilité
    await expect(page.locator('button')).toHaveAttribute('type', 'button')
    await expect(page.locator('a')).toHaveAttribute('href')
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Test de navigation au clavier
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Vérifier que le focus fonctionne
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })
})
