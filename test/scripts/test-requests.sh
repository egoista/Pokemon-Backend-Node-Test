#!/bin/bash

BASE_URL="http://localhost:4000"

echo "--------------------------------------------------"
echo "🧪 Testing REST API"
echo "--------------------------------------------------"

echo "1. Creating Pokemon (Charizard-X) via REST..."
curl -X POST "$BASE_URL/pokemons" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 901,
    "name": "Charizard-X",
    "types": ["Fire", "Dragon"]
  }'
echo -e "\n"

echo "2. Listing Pokemons (Filter by type Fire)..."
curl -X GET "$BASE_URL/pokemons?type=Fire&limit=5"
echo -e "\n"

echo "3. Updating Pokemon (Charizard-X) types via REST (PATCH)..."
curl -X PATCH "$BASE_URL/pokemons/901" \
  -H "Content-Type: application/json" \
  -d '{
    "types": ["Fire", "Flying"]
  }'
echo -e "\n"

echo "4. Getting Pokemon by ID (901)..."
curl -X GET "$BASE_URL/pokemons/901"
echo -e "\n"

echo "5. Deleting Pokemon (901) via REST..."
curl -X DELETE "$BASE_URL/pokemons/901"
echo -e "\n"

echo "--------------------------------------------------"
echo "🧪 Testing GraphQL API"
echo "--------------------------------------------------"

echo "6. Creating Pokemon (Mewtwo-Y) via GraphQL..."
curl -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createPokemon(input: { id: 902, name: \"Mewtwo-Y\", types: [\"Psychic\"] }) { ... on Pokemon { id name types { name } } ... on PokemonAlreadyExistsError { message } } }"
  }'
echo -e "\n"

echo "7. Listing Pokemons via GraphQL..."
curl -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { pokemons(pagination: { limit: 5 }) { data { id name types { name } } pagination { totalCount } } }"
  }'
echo -e "\n"

echo "8. Updating Pokemon (Mewtwo-Y) types via GraphQL..."
curl -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updatePokemon(input: { id: 902, types: [\"Psychic\", \"Fighting\"] }) { id name types { name } } }"
  }'
echo -e "\n"

echo "9. Deleting Pokemon (902) via GraphQL..."
curl -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { deletePokemon(id: 902) }"
  }'
echo -e "\n"
