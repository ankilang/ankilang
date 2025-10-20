// ============================================
// TEST SCRIPT - TRANSLATION VERCEL API
// ============================================
// Usage: Ouvrir la console du navigateur après connexion et exécuter :
// import('./scripts/test-translate-vercel').then(m => m.runTranslationTests())

import { translate, translateOccitan, translateMultilingual } from '../services/translate'

// ============================================
// Test Results Tracking
// ============================================

interface TestResult {
  name: string
  success: boolean
  input: string
  output?: string
  provider?: string
  error?: string
  duration: number
}

const results: TestResult[] = []

async function runTest(
  name: string,
  testFn: () => Promise<{ translatedText: string; provider?: string }>
): Promise<void> {
  console.log(`\n🧪 Running: ${name}`)
  const start = Date.now()

  try {
    const result = await testFn()
    const duration = Date.now() - start

    results.push({
      name,
      success: true,
      input: name,
      output: result.translatedText,
      provider: result.provider,
      duration,
    })

    console.log(`✅ PASS (${duration}ms)`)
    console.log(`   Provider: ${result.provider}`)
    console.log(`   Result: "${result.translatedText}"`)
  } catch (error) {
    const duration = Date.now() - start

    results.push({
      name,
      success: false,
      input: name,
      error: error instanceof Error ? error.message : String(error),
      duration,
    })

    console.error(`❌ FAIL (${duration}ms)`)
    console.error(`   Error:`, error)
  }
}

// ============================================
// Test Suite
// ============================================

export async function runTranslationTests() {
  console.log('🚀 Starting Translation Tests (Vercel API)')
  console.log('=' .repeat(60))

  // Test 1: DeepL EN → FR
  await runTest('DeepL: Hello World (EN → FR)', async () => {
    return translate({
      text: 'Hello world',
      sourceLang: 'EN-US',
      targetLang: 'FR',
    })
  })

  // Test 2: DeepL FR → EN
  await runTest('DeepL: Bonjour le monde (FR → EN)', async () => {
    return translate({
      text: 'Bonjour le monde',
      sourceLang: 'FR',
      targetLang: 'EN-US',
    })
  })

  // Test 3: DeepL ES → FR
  await runTest('DeepL: Hola mundo (ES → FR)', async () => {
    return translate({
      text: 'Hola mundo',
      sourceLang: 'ES',
      targetLang: 'FR',
    })
  })

  // Test 4: DeepL DE → FR
  await runTest('DeepL: Guten Tag (DE → FR)', async () => {
    return translate({
      text: 'Guten Tag',
      sourceLang: 'DE',
      targetLang: 'FR',
    })
  })

  // Test 5: Revirada FR → OC (Languedocien)
  await runTest('Revirada: Bonjour (FR → OC Languedocien)', async () => {
    return translate({
      text: 'Bonjour',
      sourceLang: 'FR',
      targetLang: 'oc',
    })
  })

  // Test 6: Revirada FR → OC (Gascon)
  await runTest('Revirada: Bonjour (FR → OC Gascon)', async () => {
    return translate({
      text: 'Bonjour',
      sourceLang: 'FR',
      targetLang: 'oc-gascon',
    })
  })

  // Test 7: Revirada OC → FR
  await runTest('Revirada: Bonjorn (OC → FR)', async () => {
    return translate({
      text: 'Bonjorn',
      sourceLang: 'oc',
      targetLang: 'FR',
    })
  })

  // Test 8: Direct Occitan Translation (Languedocien)
  await runTest('Revirada Direct: Au revoir (FR → OC Languedocien)', async () => {
    return translateOccitan('Au revoir', 'fr-oc', 'lengadocian')
  })

  // Test 9: Direct Occitan Translation (Gascon)
  await runTest('Revirada Direct: Merci (FR → OC Gascon)', async () => {
    return translateOccitan('Merci', 'fr-oc', 'gascon')
  })

  // Test 10: Direct DeepL Translation
  await runTest('DeepL Direct: Thank you (EN → FR)', async () => {
    return translateMultilingual('Thank you', 'EN-US', 'FR')
  })

  // Test 11: Long text (DeepL)
  await runTest('DeepL: Long text (EN → FR)', async () => {
    const longText = 'This is a longer text to test the translation service. It contains multiple sentences. We want to ensure that the API can handle longer inputs correctly.'
    return translate({
      text: longText,
      sourceLang: 'EN-US',
      targetLang: 'FR',
    })
  })

  // Test 12: Special characters
  await runTest('DeepL: Special chars (EN → FR)', async () => {
    return translate({
      text: 'Hello! How are you? I\'m fine, thank you.',
      sourceLang: 'EN-US',
      targetLang: 'FR',
    })
  })

  // ============================================
  // Results Summary
  // ============================================

  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('='.repeat(60))

  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const total = results.length

  console.log(`\nTotal Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total
  console.log(`Average Duration: ${avgDuration.toFixed(0)}ms`)

  // Group by provider
  const byProvider = results
    .filter(r => r.success && r.provider)
    .reduce<Record<string, TestResult[]>>((acc, r) => {
      const provider = r.provider!
      if (!acc[provider]) acc[provider] = []
      acc[provider].push(r)
      return acc
    }, {})

  console.log('\n📈 By Provider:')
  Object.entries(byProvider).forEach(([provider, tests]) => {
    const avg = tests.reduce((sum, t) => sum + t.duration, 0) / tests.length
    console.log(`  ${provider}: ${tests.length} tests, avg ${avg.toFixed(0)}ms`)
  })

  // Failed tests details
  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.name}`)
        console.log(`    Error: ${r.error}`)
      })
  }

  console.log('\n' + '='.repeat(60))

  return {
    total,
    passed,
    failed,
    results,
  }
}

// ============================================
// Quick Tests (for console)
// ============================================

export async function quickTestDeepL() {
  console.log('🧪 Quick Test: DeepL EN → FR')
  const result = await translate({
    text: 'Hello world',
    sourceLang: 'EN-US',
    targetLang: 'FR',
  })
  console.log('✅ Result:', result)
  return result
}

export async function quickTestRevirada() {
  console.log('🧪 Quick Test: Revirada FR → OC')
  const result = await translate({
    text: 'Bonjour',
    sourceLang: 'FR',
    targetLang: 'oc',
  })
  console.log('✅ Result:', result)
  return result
}

// ============================================
// Export all for console usage
// ============================================

if (typeof window !== 'undefined') {
  (window as any).testTranslate = {
    runAll: runTranslationTests,
    quickDeepL: quickTestDeepL,
    quickRevirada: quickTestRevirada,
  }
  console.log('💡 Translation tests loaded! Available commands:')
  console.log('   - testTranslate.runAll()        // Run all tests')
  console.log('   - testTranslate.quickDeepL()    // Quick DeepL test')
  console.log('   - testTranslate.quickRevirada() // Quick Revirada test')
}
