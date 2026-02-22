import { PrismaClient } from "@prisma/client";

// Reuse Prisma Client in serverless environment
const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Cache in all environments for serverless
globalForPrisma.prisma = prisma;

const connectDB = async () => {
  try {
    console.log("Attempting database connection...");
    console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);
    await prisma.$connect();
    console.log("✓ Database connected successfully");
  } catch (error) {
    console.error("✗ Database connection failed:", {
      message: error.message,
      code: error.code,
      clientVersion: error.clientVersion,
    });
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("Database disconnected successfully");
  } catch (error) {
    console.error("Database disconnection failed:", error);
  }
};

export { connectDB, disconnectDB };
