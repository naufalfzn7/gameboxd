import { PrismaClient, Genre } from "@prisma/client";

const prisma = new PrismaClient();

const games = [
  {
    title: "Elden Ring",
    genre: [Genre.ACTION, Genre.RPG],
    releaseDate: new Date("2022-02-25"),
    urlPicture: "https://example.com/eldenring.jpg",
    description: "Open-world action RPG with vast landscapes and deep lore.",
    developer: "FromSoftware",
    publisher: "Bandai Namco",
  },
  {
    title: "FIFA 24",
    genre: [Genre.SPORTS],
    releaseDate: new Date("2023-09-27"),
    urlPicture: "https://example.com/fifa24.jpg",
    description: "Latest installment in the FIFA soccer franchise.",
    developer: "EA Sports",
    publisher: "Electronic Arts",
  },
  {
    title: "Minecraft",
    genre: [Genre.ADVENTURE, Genre.SIMULATION],
    releaseDate: new Date("2011-11-18"),
    urlPicture: "https://example.com/minecraft.jpg",
    description: "Sandbox game about building and exploration.",
    developer: "Mojang",
    publisher: "Mojang",
  },
  {
    title: "Resident Evil Village",
    genre: [Genre.HORROR, Genre.ACTION],
    releaseDate: new Date("2021-05-07"),
    urlPicture: "https://example.com/revillage.jpg",
    description: "Survival horror game with intense story and combat.",
    developer: "Capcom",
    publisher: "Capcom",
  },
  {
    title: "Civilization VI",
    genre: [Genre.STRATEGY, Genre.SIMULATION],
    releaseDate: new Date("2016-10-21"),
    urlPicture: "https://example.com/civ6.jpg",
    description: "Turn-based strategy game about building a civilization.",
    developer: "Firaxis Games",
    publisher: "2K Games",
  },
  {
    title: "The Legend of Zelda: Breath of the Wild",
    genre: [Genre.ADVENTURE, Genre.ACTION],
    releaseDate: new Date("2017-03-03"),
    urlPicture: "https://example.com/zelda_botw.jpg",
    description: "Open-world adventure game with exploration and puzzles.",
    developer: "Nintendo",
    publisher: "Nintendo",
  },
  {
    title: "God of War Ragnarok",
    genre: [Genre.ACTION, Genre.ADVENTURE],
    releaseDate: new Date("2022-11-09"),
    urlPicture: "https://example.com/gow_ragnarok.jpg",
    description: "Epic action-adventure with Norse mythology setting.",
    developer: "Santa Monica Studio",
    publisher: "Sony Interactive Entertainment",
  },
  {
    title: "Halo Infinite",
    genre: [Genre.RPG, Genre.ACTION],
    releaseDate: new Date("2021-12-08"),
    urlPicture: "https://example.com/halo_infinite.jpg",
    description: "Sci-fi FPS continuing the Halo saga.",
    developer: "343 Industries",
    publisher: "Xbox Game Studios",
  },
  {
    title: "Cyberpunk 2077",
    genre: [Genre.RPG, Genre.ACTION],
    releaseDate: new Date("2020-12-10"),
    urlPicture: "https://example.com/cyberpunk2077.jpg",
    description: "Open-world RPG set in a dystopian future city.",
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
  },
];

async function main() {
  for (const game of games) {
    await prisma.game.create({ data: game });
    console.log(`Created game: ${game.title}`);
  }
  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
