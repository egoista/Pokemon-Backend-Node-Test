#!/bin/bash

BASE_URL="http://localhost:4000"
FAILED_TESTS=()

# Function to check HTTP response and track failures
check_response() {
    local test_name="$1"
    local http_code="$2"
    local response="$3"
    
    # Check for HTTP errors (4xx, 5xx) or GraphQL errors for mutations that shouldn't fail
    if [[ "$http_code" -ge 400 ]] || [[ "$response" == *'"errors":'* && "$test_name" != *"Error"* ]]; then
        FAILED_TESTS+=("$test_name")
        echo "❌ FAILED"
    else
        echo "✅ PASSED"
    fi
}

echo "--------------------------------------------------"
echo "🧪 Testing REST API"
echo "--------------------------------------------------"

echo "1. Creating Pokemon (Charizard-X) via REST..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/pokemons" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 901,
    "name": "Charizard-X",
    "types": ["Fire", "Dragon"]
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
check_response "Test 1: Create Pokemon via REST" "$HTTP_CODE" "$BODY"
echo ""

echo "2. Listing Pokemons (Filter by type Fire)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/pokemons?type=Fire&limit=5")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
check_response "Test 2: List Pokemons via REST" "$HTTP_CODE" "$BODY"
echo ""

echo "3. Updating Pokemon (Charizard-X) types via REST (PATCH)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/api/v1/pokemons/901" \
  -H "Content-Type: application/json" \
  -d '{
    "types": ["Fire", "Flying"]
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
check_response "Test 3: Update Pokemon via REST" "$HTTP_CODE" "$BODY"
echo ""

echo "4. Getting Pokemon by ID (901)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/pokemons/901")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
check_response "Test 4: Get Pokemon by ID via REST" "$HTTP_CODE" "$BODY"
echo ""

echo "5. Deleting Pokemon (901) via REST..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/api/v1/pokemons/901")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
check_response "Test 5: Delete Pokemon via REST" "$HTTP_CODE" "$BODY"
echo ""

echo "6. Importing Pokemon (158 - Totodile) via REST..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/pokemons/import" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 158
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
check_response "Test 6: Import Pokemon via REST" "$HTTP_CODE" "$BODY"
echo ""


echo "--------------------------------------------------"
echo "🧪 Testing GraphQL API"
echo "--------------------------------------------------"


echo "7. Creating Pokemon (Mewtwo-Y) via GraphQL..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createPokemon(input: { id: 902, name: \"Mewtwo-Y\", types: [\"Psychic\"] }) { ... on Pokemon { id name types { name } } ... on PokemonAlreadyExistsError { message } } }"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
check_response "Test 7: Create Pokemon via GraphQL" "$HTTP_CODE" "$BODY"
echo ""

echo "8. Listing Pokemons via GraphQL..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { pokemons(pagination: { limit: 5 }) { data { id name types { name } } pagination { totalCount } } }"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
check_response "Test 8: List Pokemons via GraphQL" "$HTTP_CODE" "$BODY"
echo ""

echo "9. Updating Pokemon (Mewtwo-Y) types via GraphQL..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updatePokemon(input: { id: 902, types: [\"Psychic\", \"Fighting\"] }) { id name types { name } } }"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
check_response "Test 9: Update Pokemon via GraphQL" "$HTTP_CODE" "$BODY"
echo ""

echo "10. Deleting Pokemon (902) via GraphQL..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { deletePokemon(id: 902) }"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
check_response "Test 10: Delete Pokemon via GraphQL" "$HTTP_CODE" "$BODY"
echo ""

echo "11. Importing Pokemon (1 - Bulbasaur) via GraphQL..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { importPokemon(id: 1) { id name types { name } } }"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
check_response "Test 11: Import Pokemon via GraphQL" "$HTTP_CODE" "$BODY"
echo ""

echo "--------------------------------------------------"
echo "🧪 Testing GraphQL Error Handling (Exception Filter)"
echo "--------------------------------------------------"

echo "12. Testing PokemonAlreadyExistsError (union type) via GraphQL..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createPokemon(input: { id: 1, name: \"Bulbasaur\", types: [\"Grass\"] }) { ... on Pokemon { id name } ... on PokemonAlreadyExistsError { __typename message } } }"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
# This test expects a union type response with PokemonAlreadyExistsError, not a GraphQL error
if [[ "$BODY" == *'"__typename":"PokemonAlreadyExistsError"'* ]]; then
    echo "✅ PASSED - Union type error returned correctly"
else
    FAILED_TESTS+=("Test 12: PokemonAlreadyExistsError (union)")
    echo "❌ FAILED - Expected union type error"
fi
echo ""

echo "13. Testing PokemonNotFoundError (update non-existent) via GraphQL..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updatePokemon(input: { id: 99999, name: \"NonExistent\" }) { id name } }"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
# This test expects a GraphQL error
if [[ "$BODY" == *'"errors":'* && "$BODY" == *'not found'* ]]; then
    echo "✅ PASSED - GraphQL error returned correctly"
else
    FAILED_TESTS+=("Test 13: PokemonNotFoundError (update)")
    echo "❌ FAILED - Expected GraphQL error for not found"
fi
echo ""

echo "14. Testing PokemonNotFoundError (delete non-existent) via GraphQL..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { deletePokemon(id: 99999) }"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
# This test expects a GraphQL error
if [[ "$BODY" == *'"errors":'* && "$BODY" == *'not found'* ]]; then
    echo "✅ PASSED - GraphQL error returned correctly"
else
    FAILED_TESTS+=("Test 14: PokemonNotFoundError (delete)")
    echo "❌ FAILED - Expected GraphQL error for not found"
fi
echo ""

echo "15. Testing PokemonNotFoundInExternalApiError (import invalid ID) via GraphQL..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { importPokemon(id: 999999) { id name } }"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "$BODY"
# This test expects a GraphQL error
if [[ "$BODY" == *'"errors":'* && "$BODY" == *'not found'* ]]; then
    echo "✅ PASSED - GraphQL error returned correctly"
else
    FAILED_TESTS+=("Test 15: PokemonNotFoundInExternalApiError")
    echo "❌ FAILED - Expected GraphQL error for external API not found"
fi
echo ""

echo "--------------------------------------------------"
echo "📊 Test Results Summary"
echo "--------------------------------------------------"

if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
    echo "✅ All tests passed successfully! (15/15)"
    exit 0
else
    echo "❌ ${#FAILED_TESTS[@]} test(s) failed:"
    for test in "${FAILED_TESTS[@]}"; do
        echo "  - $test"
    done
    echo ""
    echo "Total: $((15 - ${#FAILED_TESTS[@]}))/15 tests passed"
    exit 1
fi
