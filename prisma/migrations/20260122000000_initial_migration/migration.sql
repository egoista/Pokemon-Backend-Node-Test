-- CreateTable
CREATE TABLE "pokemons" (
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
