import express from "express";
// import connectDB from "./config/database";
// import logger from "./config/logger";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error.middleware.js";
import router from "./routes/index.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Error handling
app.use(errorMiddleware);

// Route jika tidak ada route yang terdaftar
app.use((req, res) => {
  res.status(404).json({
    status: "Failed",
    message: "Resource not found",
  });
});

export default app;
