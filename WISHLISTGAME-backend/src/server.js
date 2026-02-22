import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
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

dotenv.config({ path: path.join(__dirname, "..", ".env") });

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

const ensureDBConnection = async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (error) {
      console.error("Database connection failed:", error);
      dbConnected = false;
      return res.status(500).json({ error: "Database connection failed" });
    }
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
