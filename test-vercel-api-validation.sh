#!/bin/bash
# ============================================
# TEST COMPLET VERCEL API (validation technique)
# ============================================
# Ce script valide l'infrastructure sans JWT réel

API_URL="https://ankilang-api-monorepo.vercel.app"
ORIGIN="https://ankilang.com"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
TOTAL=0

test_result() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  local body="$4"

  TOTAL=$((TOTAL + 1))

  if [ "$expected" = "$actual" ]; then
    PASS=$((PASS + 1))
    echo -e "${GREEN}✅ PASS${NC} - $name (HTTP $actual)"
    if [ -n "$body" ]; then
      echo "$body" | jq -C '.' 2>/dev/null || echo "$body"
    fi
  else
    FAIL=$((FAIL + 1))
    echo -e "${RED}❌ FAIL${NC} - $name (expected $expected, got $actual)"
    if [ -n "$body" ]; then
      echo "$body"
    fi
  fi
  echo ""
}

echo -e "${BLUE}🚀 Vercel API Validation Tests${NC}"
echo "================================"
echo "API URL: $API_URL"
echo "Origin: $ORIGIN"
echo ""

# Test 1: API accessible
echo "🧪 Test 1: API Endpoint Reachable"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/api/deepl" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -d '{}' --max-time 10 2>&1)

http_code=$(echo "$response" | grep HTTP_CODE | cut -d':' -f2 | tr -d ' \n\r')
body=$(echo "$response" | grep -v HTTP_CODE)

if [ -z "$http_code" ] || [ "$http_code" = "000" ]; then
  test_result "API Reachable" "401" "TIMEOUT/ERROR" "$response"
else
  test_result "API Reachable" "401" "$http_code" "$body"
fi

# Test 2: CORS headers présents
echo "🧪 Test 2: CORS Headers"
cors_response=$(curl -s -I -X OPTIONS "$API_URL/api/deepl" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  --max-time 10 2>&1)

if echo "$cors_response" | grep -i "access-control-allow-origin" > /dev/null; then
  PASS=$((PASS + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${GREEN}✅ PASS${NC} - CORS headers present"
  echo "$cors_response" | grep -i "access-control"
else
  FAIL=$((FAIL + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${YELLOW}⚠️  WARN${NC} - CORS headers not found (may be conditional)"
fi
echo ""

# Test 3: Format d'erreur RFC 7807
echo "🧪 Test 3: RFC 7807 Error Format"
response=$(curl -s -X POST "$API_URL/api/deepl" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -d '{}' --max-time 10 2>&1)

has_type=$(echo "$response" | jq -r '.type' 2>/dev/null)
has_title=$(echo "$response" | jq -r '.title' 2>/dev/null)
has_status=$(echo "$response" | jq -r '.status' 2>/dev/null)
has_detail=$(echo "$response" | jq -r '.detail' 2>/dev/null)

if [ "$has_type" != "null" ] && [ "$has_title" != "null" ] && [ "$has_status" != "null" ] && [ "$has_detail" != "null" ]; then
  PASS=$((PASS + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${GREEN}✅ PASS${NC} - RFC 7807 format valid"
  echo "$response" | jq -C '{type, title, status, detail, code}' 2>/dev/null
else
  FAIL=$((FAIL + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${RED}❌ FAIL${NC} - RFC 7807 format invalid"
  echo "$response"
fi
echo ""

# Test 4: Tous les endpoints répondent
echo "🧪 Test 4-9: All Endpoints Respond"

endpoints=(
  "deepl:DeepL Translation"
  "revirada:Revirada Occitan"
  "votz:Votz TTS"
  "elevenlabs:ElevenLabs TTS"
  "pexels:Pexels Search"
  "pexels-optimize:Pexels Optimize"
)

for endpoint_info in "${endpoints[@]}"; do
  IFS=':' read -r endpoint name <<< "$endpoint_info"

  response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/api/$endpoint" \
    -H "Content-Type: application/json" \
    -H "Origin: $ORIGIN" \
    -d '{}' --max-time 10 2>&1)

  http_code=$(echo "$response" | grep HTTP_CODE | cut -d':' -f2 | tr -d ' \n\r')

  # 401 (unauthorized) ou 400 (bad request) sont acceptables
  if [ "$http_code" = "401" ] || [ "$http_code" = "400" ]; then
    PASS=$((PASS + 1))
    TOTAL=$((TOTAL + 1))
    echo -e "${GREEN}✅ PASS${NC} - $name endpoint (HTTP $http_code)"
  elif [ -z "$http_code" ] || [ "$http_code" = "000" ]; then
    FAIL=$((FAIL + 1))
    TOTAL=$((TOTAL + 1))
    echo -e "${RED}❌ FAIL${NC} - $name endpoint (TIMEOUT)"
  else
    FAIL=$((FAIL + 1))
    TOTAL=$((TOTAL + 1))
    echo -e "${YELLOW}⚠️  UNEXPECTED${NC} - $name endpoint (HTTP $http_code)"
  fi
done
echo ""

# Test 10: Validation des types TypeScript
echo "🧪 Test 10: TypeScript Types Exist"
if [ -f "apps/web/src/types/ankilang-vercel-api.ts" ]; then
  PASS=$((PASS + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${GREEN}✅ PASS${NC} - Types file exists"
  wc -l apps/web/src/types/ankilang-vercel-api.ts
else
  FAIL=$((FAIL + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${RED}❌ FAIL${NC} - Types file missing"
fi
echo ""

# Test 11: Client API existe
echo "🧪 Test 11: Vercel API Client Exists"
if [ -f "apps/web/src/lib/vercel-api-client.ts" ]; then
  PASS=$((PASS + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${GREEN}✅ PASS${NC} - Client file exists"
  wc -l apps/web/src/lib/vercel-api-client.ts
else
  FAIL=$((FAIL + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${RED}❌ FAIL${NC} - Client file missing"
fi
echo ""

# Test 12: Service translate migré
echo "🧪 Test 12: Translate Service Migrated"
if grep -q "createVercelApiClient" apps/web/src/services/translate.ts 2>/dev/null; then
  PASS=$((PASS + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${GREEN}✅ PASS${NC} - translate.ts uses Vercel API"
  grep -n "createVercelApiClient" apps/web/src/services/translate.ts | head -1
else
  FAIL=$((FAIL + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${RED}❌ FAIL${NC} - translate.ts not migrated"
fi
echo ""

# Test 13: Variables d'environnement
echo "🧪 Test 13: Environment Variables"
if grep -q "VITE_VERCEL_API_URL" apps/web/.env 2>/dev/null; then
  PASS=$((PASS + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${GREEN}✅ PASS${NC} - Vercel API URL configured"
  grep "VITE_VERCEL_API" apps/web/.env
else
  FAIL=$((FAIL + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${RED}❌ FAIL${NC} - Environment variables missing"
fi
echo ""

# Résumé
echo "================================"
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "================================"
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"

success_rate=$(awk "BEGIN {printf \"%.1f\", ($PASS/$TOTAL)*100}")
echo "Success Rate: $success_rate%"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 All validation tests passed!${NC}"
  echo ""
  echo "✅ Infrastructure is ready"
  echo "✅ API endpoints are accessible"
  echo "✅ Error handling is RFC 7807 compliant"
  echo "✅ Code migration is complete"
  echo ""
  echo "⏭️  Next step: Test with real JWT in browser"
  echo "   See TEST-TRANSLATE.md for instructions"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed${NC}"
  echo ""
  echo "Please review the failures above"
  exit 1
fi
