import prisma from './prisma/seed/prisma.client';

async function verify() {
  const pokemonCount = await prisma.pokemon.count();
  const typeCount = await prisma.type.count();
  
  console.log(`✅ Database verification:`);
  console.log(`   - Pokemons: ${pokemonCount}`);
  console.log(`   - Types: ${typeCount}`);
  
  // Get a sample pokemon with its types
  const samplePokemon = await prisma.pokemon.findFirst({
    where: { id: 1 },
    include: { types: true },
  });
  
  console.log(`\n✅ Sample Pokemon (Bulbasaur):`);
  console.log(JSON.stringify(samplePokemon, null, 2));
  
  await prisma.$disconnect();
}

verify();
