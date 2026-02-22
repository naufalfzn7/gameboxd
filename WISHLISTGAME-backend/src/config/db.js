import { PrismaClient } from "@prisma/client";

const logDatabaseConfig = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("DATABASE_URL is not set");
    return;
  }

  try {
    const parsed = new URL(url);
    const safeHost = parsed.host;
    const safeDb = parsed.pathname.replace("/", "");
    const params = parsed.searchParams.toString();
    console.log(
      `Database config: host=${safeHost}, db=${safeDb}, params=${params}`,
    );
  } catch (error) {
    console.warn("Unable to parse DATABASE_URL");
  }
};

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    logDatabaseConfig();
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
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

export { connectDB, disconnectDB, prisma };

export default prisma;
