import { PrismaClient, WishlistStatus } from "@prisma/client";

const prisma = new PrismaClient();

const id = "dca619cb-be67-44e2-a276-a385958f2f39";

const wishlist = [
  {
    userId: id,
    gameId: "f99bf82e-73dd-4e1e-9039-c62996840b48",
  },
  {
    userId: id,
    gameId: "7271ed5d-2786-46cd-b4d0-0da03fdb35a1",
    status: WishlistStatus.PURCHASED,
  },
  {
    userId: id,
    gameId: "2828662b-d54e-42bd-8400-e8f0132dd858",
  },
];

async function main() {
  for (const item of wishlist) {
    await prisma.wishlist.create({ data: item });
    console.log(`Created wishlist item for gameId: ${item.gameId}`);
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
