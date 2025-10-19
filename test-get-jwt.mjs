#!/usr/bin/env node
// ============================================
// SCRIPT: Authenticate with Appwrite and get JWT
// ============================================

import { Client, Account } from 'node-appwrite';

const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'ankilang';
const EMAIL = 'test@ankilang.com';
const PASSWORD = 'Test2023!';

async function getJWT() {
  console.log('🔐 Authenticating with Appwrite...');
  console.log(`Endpoint: ${APPWRITE_ENDPOINT}`);
  console.log(`Project: ${APPWRITE_PROJECT_ID}`);
  console.log(`Email: ${EMAIL}`);
  console.log('');

  try {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);

    const account = new Account(client);

    // Login
    console.log('📝 Creating session...');
    const session = await account.createEmailPasswordSession(EMAIL, PASSWORD);
    console.log('✅ Session created:', session.$id);
    console.log('');

    // Get JWT
    console.log('🎫 Generating JWT...');
    const jwt = await account.createJWT();
    console.log('✅ JWT generated!');
    console.log('');
    console.log('━'.repeat(80));
    console.log('JWT TOKEN:');
    console.log('━'.repeat(80));
    console.log(jwt.jwt);
    console.log('━'.repeat(80));
    console.log('');
    console.log('💡 To use this JWT in tests, run:');
    console.log(`export JWT_TOKEN='${jwt.jwt}'`);
    console.log('');
    console.log(`⏰ Expires at: ${new Date(jwt.expiration * 1000).toISOString()}`);

    return jwt.jwt;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error(`   Code: ${error.code}`);
    if (error.type) console.error(`   Type: ${error.type}`);
    process.exit(1);
  }
}

getJWT();
