#!/bin/bash
# ============================================
# TEST DIRECT VERCEL API (sans JWT)
# ============================================
# Ce script teste directement l'API Vercel
# ATTENTION: Nécessite un JWT valide

API_URL="https://ankilang-api-monorepo.vercel.app"
ORIGIN="https://ankilang.com"

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Testing Vercel API Endpoints"
echo "================================"
echo ""

# Vérifier si JWT est fourni
if [ -z "$JWT_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  JWT_TOKEN not set${NC}"
  echo "To test with authentication, run:"
  echo "export JWT_TOKEN='your-jwt-token'"
  echo "Then re-run this script"
  echo ""
  echo "Continuing with unauthenticated tests..."
  echo ""
fi

# Test 1: DeepL (devrait échouer sans JWT, mais on vérifie le endpoint)
echo "🧪 Test 1: DeepL Endpoint"
echo "------------------------"
if [ -n "$JWT_TOKEN" ]; then
  response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/api/deepl" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Origin: $ORIGIN" \
    -d '{
      "text": "Hello world",
      "sourceLang": "EN",
      "targetLang": "FR"
    }')

  http_code=$(echo "$response" | grep HTTP_CODE | cut -d':' -f2)
  body=$(echo "$response" | grep -v HTTP_CODE)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
    echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
  else
    echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
    echo "Response: $body"
  fi
else
  echo -e "${YELLOW}⏭️  SKIP${NC} (no JWT_TOKEN)"
fi
echo ""

# Test 2: Revirada (devrait échouer sans JWT, mais on vérifie le endpoint)
echo "🧪 Test 2: Revirada Endpoint"
echo "------------------------"
if [ -n "$JWT_TOKEN" ]; then
  response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/api/revirada" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Origin: $ORIGIN" \
    -d '{
      "text": "Bonjour",
      "direction": "fr-oc",
      "dialect": "lengadocian"
    }')

  http_code=$(echo "$response" | grep HTTP_CODE | cut -d':' -f2)
  body=$(echo "$response" | grep -v HTTP_CODE)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
    echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
  else
    echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
    echo "Response: $body"
  fi
else
  echo -e "${YELLOW}⏭️  SKIP${NC} (no JWT_TOKEN)"
fi
echo ""

# Test 3: Vérifier que l'API répond (sans JWT - devrait retourner 401)
echo "🧪 Test 3: API Health Check (expect 401)"
echo "------------------------"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/api/deepl" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -d '{"text":"test","sourceLang":"EN","targetLang":"FR"}')

http_code=$(echo "$response" | grep HTTP_CODE | cut -d':' -f2)
body=$(echo "$response" | grep -v HTTP_CODE)

if [ "$http_code" = "401" ]; then
  echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code - API requires auth)"
  echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
elif [ "$http_code" = "403" ]; then
  echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code - CORS/Auth check working)"
  echo "Response: $body"
else
  echo -e "${YELLOW}⚠️  UNEXPECTED${NC} (HTTP $http_code)"
  echo "Response: $body"
fi
echo ""

# Résumé
echo "================================"
echo "📊 Summary"
echo "================================"
if [ -n "$JWT_TOKEN" ]; then
  echo "✅ All tests completed with JWT"
else
  echo "⚠️  Tests run without JWT (limited)"
  echo ""
  echo "To run full tests:"
  echo "1. Get JWT from browser console:"
  echo "   await import('./src/services/appwrite').then(m => m.getSessionJWT())"
  echo ""
  echo "2. Export JWT:"
  echo "   export JWT_TOKEN='your-jwt-token'"
  echo ""
  echo "3. Re-run this script"
fi
echo ""
