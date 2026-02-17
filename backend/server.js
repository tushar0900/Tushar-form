import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import salaryRoutes from "./routes/salaryRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/employeeDB";

// Routes
app.use("/employees", employeeRoutes);
app.use("/salary-master", salaryRoutes);

// Basic health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

startServer();
