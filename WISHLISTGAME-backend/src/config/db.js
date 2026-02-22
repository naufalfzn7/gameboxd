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
    const url = process.env.DATABASE_URL;
    console.log("DATABASE_URL exists:", !!url);
    if (url) {
      console.log("DATABASE_URL format:", url.substring(0, 50) + "...");
    }

    await prisma.$connect();
    console.log("✓ Database connected successfully");
  } catch (error) {
    console.error("✗ Database connection failed:", {
      message: error.message,
      code: error.code,
    });

    // Provide helpful error message
    if (!process.env.DATABASE_URL) {
      console.error(
        "💡 ACTION REQUIRED: Set DATABASE_URL in Vercel dashboard → Settings → Environment Variables",
      );
    }

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
