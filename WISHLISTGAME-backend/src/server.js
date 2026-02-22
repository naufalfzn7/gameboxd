import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import gameRouter from "./routes/game.routes.js";
import wishListRouter from "./routes/wishList.routes.js";
import reviewRouter from "./routes/review.routes.js";
import favoriteRouter from "./routes/favorite.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file only if it exists (for local development)
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✓ Loaded .env file");
} else {
  console.log("ℹ .env file not found (using environment variables)");
}

// Debug: log what DATABASE_URL we have
console.log("DATABASE_URL at server startup:", {
  exists: !!process.env.DATABASE_URL,
  value: process.env.DATABASE_URL
    ? process.env.DATABASE_URL.substring(0, 50) + "..."
    : "NOT SET",
});

const app = express();

app.use(
  cors({
    origin: "*", // sementara biar aman dulu
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection only once
let dbConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

const ensureDBConnection = async (req, res, next) => {
  if (!dbConnected && connectionAttempts < MAX_RETRIES) {
    try {
      connectionAttempts++;
      console.log(
        `Database connection attempt ${connectionAttempts}/${MAX_RETRIES}`,
      );
      await connectDB();
      dbConnected = true;
      connectionAttempts = 0; // Reset on success
    } catch (error) {
      console.error(
        `Connection attempt ${connectionAttempts} failed:`,
        error.message,
      );

      if (connectionAttempts >= MAX_RETRIES) {
        console.error("Max connection attempts reached");
      }

      return res.status(500).json({
        error: "Database connection failed",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  } else if (!dbConnected) {
    return res.status(500).json({
      error: "Database connection failed after retries",
    });
  }

  next();
};

app.use(ensureDBConnection);

app.get("/", (req, res) => {
  res.send("Welcome to the Wishlist Game API");
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/games", gameRouter);
app.use("/api/wishlist", wishListRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/favorites", favoriteRouter);

export default app;
