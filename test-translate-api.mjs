#!/usr/bin/env node
// ============================================
// SCRIPT: Test Vercel API Translation with Appwrite Auth
// ============================================

import { Client, Account } from 'node-appwrite';

const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'ankilang';
const EMAIL = 'test@ankilang.com';
const PASSWORD = 'Test2023!';
const VERCEL_API_URL = 'https://ankilang-api-monorepo.vercel.app';
const ORIGIN = 'https://ankilang.com';

async function testTranslationAPI() {
  console.log('🚀 Testing Vercel API Translation');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Step 1: Authenticate with Appwrite
    console.log('🔐 Step 1: Authenticating with Appwrite...');
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);

    const account = new Account(client);
    const session = await account.createEmailPasswordSession(EMAIL, PASSWORD);
    console.log('✅ Session created:', session.$id);
    console.log('');

    // Step 2: Try to get JWT
    console.log('🎫 Step 2: Attempting to get JWT...');
    let jwt = null;
    try {
      const jwtResponse = await account.createJWT();
      jwt = jwtResponse.jwt;
      console.log('✅ JWT obtained!');
      console.log('');
      console.log('━'.repeat(80));
      console.log('JWT TOKEN:');
      console.log('━'.repeat(80));
      console.log(jwt);
      console.log('━'.repeat(80));
      console.log('');
    } catch (jwtError) {
      console.log('⚠️  Could not get JWT (this is a known Appwrite config issue)');
      console.log('   Error:', jwtError.message);
      console.log('   We\'ll test without JWT to verify endpoint accessibility');
      console.log('');
    }

    // Step 3: Test API endpoints (without JWT since we can't get it)
    console.log('🧪 Step 3: Testing API Endpoints (without JWT)');
    console.log('─'.repeat(80));
    console.log('');

    // Test 1: DeepL endpoint (should return 401)
    console.log('Test 1: DeepL Translation Endpoint');
    console.log('   Request: POST /api/deepl');
    const deeplResponse = await fetch(`${VERCEL_API_URL}/api/deepl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': ORIGIN,
        ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {})
      },
      body: JSON.stringify({
        text: 'Hello world',
        sourceLang: 'EN',
        targetLang: 'FR'
      })
    });

    console.log(`   Status: ${deeplResponse.status} ${deeplResponse.statusText}`);
    const deeplBody = await deeplResponse.json();
    console.log('   Response:', JSON.stringify(deeplBody, null, 2));
    console.log('');

    // Test 2: Revirada endpoint (should return 401)
    console.log('Test 2: Revirada Translation Endpoint');
    console.log('   Request: POST /api/revirada');
    const reviradaResponse = await fetch(`${VERCEL_API_URL}/api/revirada`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': ORIGIN,
        ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {})
      },
      body: JSON.stringify({
        text: 'Bonjour',
        direction: 'fr-oc',
        dialect: 'lengadocian'
      })
    });

    console.log(`   Status: ${reviradaResponse.status} ${reviradaResponse.statusText}`);
    const reviradaBody = await reviradaResponse.json();
    console.log('   Response:', JSON.stringify(reviradaBody, null, 2));
    console.log('');

    // Summary
    console.log('=' .repeat(80));
    console.log('📊 Test Summary');
    console.log('=' .repeat(80));
    console.log('');
    console.log('✅ Appwrite authentication: SUCCESS');
    console.log(`${jwt ? '✅' : '⚠️ '} JWT generation: ${jwt ? 'SUCCESS' : 'FAILED (permissions issue)'}`);
    console.log(`${deeplResponse.status === 401 ? '✅' : '❌'} DeepL endpoint: ${deeplResponse.status === 401 ? 'Correctly requires auth (401)' : 'Unexpected status'}`);
    console.log(`${reviradaResponse.status === 401 ? '✅' : '❌'} Revirada endpoint: ${reviradaResponse.status === 401 ? 'Correctly requires auth (401)' : 'Unexpected status'}`);
    console.log('');

    if (!jwt) {
      console.log('⚠️  NEXT STEPS:');
      console.log('   1. Fix JWT permissions in Appwrite dashboard');
      console.log('   2. Or test in browser where JWT works correctly');
      console.log('   3. See TEST-TRANSLATE.md for browser testing instructions');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    if (error.code) console.error(`   Code: ${error.code}`);
    if (error.type) console.error(`   Type: ${error.type}`);
    process.exit(1);
  }
}

testTranslationAPI();
