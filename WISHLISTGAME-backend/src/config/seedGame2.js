import { PrismaClient, Genre } from "@prisma/client";

const prisma = new PrismaClient();

const games = [
  {
    title: "Red Dead Redemption 2",
    genre: [Genre.ACTION, Genre.ADVENTURE],
    releaseDate: new Date("2018-10-26"),
    urlPicture:
      "https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg",
    description: "Epic open-world western adventure with deep storytelling.",
    developer: "Rockstar Games",
    publisher: "Rockstar Games",
  },
  {
    title: "The Witcher 3: Wild Hunt",
    genre: [Genre.RPG, Genre.ADVENTURE],
    releaseDate: new Date("2015-05-19"),
    urlPicture:
      "https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg",
    description: "Story-driven RPG set in a rich fantasy world.",
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
  },
  {
    title: "Sekiro: Shadows Die Twice",
    genre: [Genre.ACTION],
    releaseDate: new Date("2019-03-22"),
    urlPicture: "https://upload.wikimedia.org/wikipedia/en/6/6e/Sekiro_art.jpg",
    description: "Challenging action game with samurai combat mechanics.",
    developer: "FromSoftware",
    publisher: "Activision",
  },
  {
    title: "Hades",
    genre: [Genre.ACTION, Genre.RPG],
    releaseDate: new Date("2020-09-17"),
    urlPicture:
      "https://upload.wikimedia.org/wikipedia/en/c/cc/Hades_cover_art.jpg",
    description:
      "Fast-paced roguelike dungeon crawler based on Greek mythology.",
    developer: "Supergiant Games",
    publisher: "Supergiant Games",
  },
  {
    title: "Stardew Valley",
    genre: [Genre.SIMULATION],
    releaseDate: new Date("2016-02-26"),
    urlPicture:
      "https://upload.wikimedia.org/wikipedia/en/f/fd/Stardew_Valley.png",
    description: "Relaxing farming simulation with RPG elements.",
    developer: "ConcernedApe",
    publisher: "ConcernedApe",
  },
  {
    title: "Call of Duty: Modern Warfare II",
    genre: [Genre.ACTION],
    releaseDate: new Date("2022-10-28"),
    urlPicture:
      "https://upload.wikimedia.org/wikipedia/en/4/4a/Call_of_Duty_Modern_Warfare_II_Key_Art.jpg",
    description: "Modern FPS with cinematic campaign and multiplayer modes.",
    developer: "Infinity Ward",
    publisher: "Activision",
  },
  {
    title: "Among Us",
    genre: [Genre.SIMULATION],
    releaseDate: new Date("2018-06-15"),
    urlPicture:
      "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg",
    description: "Multiplayer social deduction game set in space.",
    developer: "Innersloth",
    publisher: "Innersloth",
  },
  {
    title: "Dark Souls III",
    genre: [Genre.ACTION, Genre.RPG],
    releaseDate: new Date("2016-03-24"),
    urlPicture:
      "https://upload.wikimedia.org/wikipedia/en/b/bb/Dark_souls_3_cover_art.jpg",
    description: "Dark fantasy action RPG with challenging combat.",
    developer: "FromSoftware",
    publisher: "Bandai Namco",
  },
  {
    title: "The Sims 4",
    genre: [Genre.SIMULATION],
    releaseDate: new Date("2014-09-02"),
    urlPicture:
      "https://upload.wikimedia.org/wikipedia/en/7/78/The_Sims_4_cover_art.jpg",
    description:
      "Life simulation game allowing players to create virtual people.",
    developer: "Maxis",
    publisher: "Electronic Arts",
  },
  {
    title: "Outlast",
    genre: [Genre.HORROR],
    releaseDate: new Date("2013-09-04"),
    urlPicture:
      "https://upload.wikimedia.org/wikipedia/en/4/4c/Outlast_cover.jpg",
    description: "First-person survival horror set in an abandoned asylum.",
    developer: "Red Barrels",
    publisher: "Red Barrels",
  },
];

async function main() {
  for (const game of games) {
    await prisma.game.create({
      data: game,
    });
    console.log(`Created game: ${game.title}`);
  }

  console.log("Seeder with real images completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
