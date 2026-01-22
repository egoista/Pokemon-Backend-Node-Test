import prisma from './prisma.client';
import { pokemons } from './data/pokemon';

async function main() {
  // Extract unique types from pokemons data
  const uniqueTypes = [
    ...new Set(pokemons.map((pokemon) => pokemon.type)),
  ];

  console.log('Creating types...');
  // Create types first
  for (const typeName of uniqueTypes) {
    await prisma.type.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });
  }

  console.log('Deleting existing pokemons...');
  await prisma.pokemon.deleteMany();

  console.log('Creating pokemons...');
  // Create pokemons with their type connections
  for (const pokemon of pokemons) {
    await prisma.pokemon.create({
      data: {
        id: pokemon.id,
        name: pokemon.name,
        types: {
          connect: {
            name: pokemon.type,
          },
        },
      },
    });
  }

  console.log(`Created ${pokemons.length} pokemons with ${uniqueTypes.length} types`);
}

main()
  .catch((error) => {
    console.error('Error seeding the database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seeding completed successfully');
  });
