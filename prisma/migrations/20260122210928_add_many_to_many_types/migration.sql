/*
  Warnings:

  - You are about to drop the column `type` on the `pokemons` table. All the data in the column will be lost.

*/

-- Step 1: Create the types table
CREATE TABLE "types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create unique index on types.name
CREATE UNIQUE INDEX "types_name_key" ON "types"("name");

-- Step 3: Populate types table with unique types from pokemons
INSERT INTO "types" ("name")
SELECT DISTINCT "type" FROM "pokemons";

-- Step 4: Create the junction table
CREATE TABLE "_PokemonToType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PokemonToType_A_fkey" FOREIGN KEY ("A") REFERENCES "pokemons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PokemonToType_B_fkey" FOREIGN KEY ("B") REFERENCES "types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 5: Create indexes on junction table
CREATE UNIQUE INDEX "_PokemonToType_AB_unique" ON "_PokemonToType"("A", "B");
CREATE INDEX "_PokemonToType_B_index" ON "_PokemonToType"("B");

-- Step 6: Populate the junction table by matching pokemon.type with types.name
INSERT INTO "_PokemonToType" ("A", "B")
SELECT p."id", t."id"
FROM "pokemons" p
INNER JOIN "types" t ON p."type" = t."name";

-- Step 7: Remove the old type column from pokemons
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pokemons" (
    "name" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_pokemons" ("created_at", "id", "name") SELECT "created_at", "id", "name" FROM "pokemons";
DROP TABLE "pokemons";
ALTER TABLE "new_pokemons" RENAME TO "pokemons";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
