import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
//import Routes
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import gameRouter from "./routes/game.routes.js";
import wishListRouter from "./routes/wishList.routes.js";
import reviewRouter from "./routes/review.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(
  cors({
    origin: "http://localhost:5173", // atau domain frontend-mu
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/games", gameRouter);
app.use("/api/wishlist", wishListRouter);
app.use("/api/reviews", reviewRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
