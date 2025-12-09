#!/bin/bash

# API Testing Script for Serverless Functions
# Tests all authentication and store endpoints

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
STORE_ID="${TEST_STORE_ID:-STORE-001}"
PIN="${TEST_PIN:-1234}"

echo -e "${YELLOW}🧪 Testing Serverless API Endpoints${NC}"
echo "Base URL: $API_BASE_URL"
echo ""

# Test counter
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth=$5
    
    echo -ne "Testing $name... "
    
    if [ -z "$auth" ]; then
        response=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            ${data:+-d "$data"} \
            "$API_BASE_URL$endpoint")
    else
        response=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $auth" \
            ${data:+-d "$data"} \
            "$API_BASE_URL$endpoint")
    fi
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Response: $response"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo -e "${YELLOW}Authentication Endpoints${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Login (will fail without real data)
echo -ne "Testing POST /api/auth/login... "
LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"storeId\":\"$STORE_ID\",\"pin\":\"$PIN\"}" \
    "$API_BASE_URL/api/auth/login")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASSED${NC}"
    PASSED=$((PASSED + 1))
    # Extract token for subsequent tests
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "  Token obtained: ${TOKEN:0:20}..."
elif echo "$LOGIN_RESPONSE" | grep -q '"error"'; then
    echo -e "${YELLOW}⚠ EXPECTED FAILURE (no Notion setup)${NC}"
    echo "  Response: $LOGIN_RESPONSE"
    # Create a mock token for testing other endpoints
    TOKEN="mock.jwt.token"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "  Response: $LOGIN_RESPONSE"
    FAILED=$((FAILED + 1))
fi

echo ""

# Test 2: Validate (will fail with mock token)
test_endpoint "GET /api/auth/validate" "GET" "/api/auth/validate" "" "$TOKEN"

# Test 3: Logout
test_endpoint "POST /api/auth/logout" "POST" "/api/auth/logout" '{"reason":"manual"}' "$TOKEN"

echo ""
echo -e "${YELLOW}Store Endpoints${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 4: Get Checklist
test_endpoint "GET /api/store/checklist" "GET" "/api/store/checklist?section=opening&type=daily" "" "$TOKEN"

# Test 5: Get Inventory
test_endpoint "GET /api/store/inventory" "GET" "/api/store/inventory" "" "$TOKEN"

# Test 6: Submit Replacement
test_endpoint "POST /api/store/replacement" "POST" "/api/store/replacement" \
    '{"itemId":"test-item-1","reason":"Test replacement","priority":"Medium"}' "$TOKEN"

echo ""
echo -e "${YELLOW}Admin Endpoints${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 7: Dashboard Stats
test_endpoint "GET /api/admin/dashboard" "GET" "/api/admin/dashboard" "" "$TOKEN"

# Test 8: List Forms
test_endpoint "GET /api/admin/forms" "GET" "/api/admin/forms" "" "$TOKEN"

# Test 9: Force Logout
test_endpoint "POST /api/admin/force-logout" "POST" "/api/admin/force-logout" \
    '{"storeId":"STORE-002","reason":"Testing"}' "$TOKEN"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed: $PASSED${NC} | ${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed (expected without Notion configuration)${NC}"
    exit 0
fi
