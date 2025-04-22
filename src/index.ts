import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import courseRoutes from "./routes/courseRoutes";

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/course-management")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.use("/", courseRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
