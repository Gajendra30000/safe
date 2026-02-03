import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import placesRoutes from "./routes/placesRoutes";
import aiRoutes from "./routes/aiRoutes";
import sosRoutes from "./routes/sosRoutes";
import faqRoutes from "./routes/faqRoutes";
import qnaRoutes from "./routes/qnaRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import communityRoutes from "./routes/communityRoutes";
import incidentRoutes from "./routes/incidentRoutes";

import { notFound, errorHandler } from "./middleware/errorHandler";
import { seedFAQs } from "./services/seedService";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/qna", qnaRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/incidents", incidentRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/safepath";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedFAQs();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
