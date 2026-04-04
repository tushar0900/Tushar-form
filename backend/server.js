import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import auditTrailRoutes from "./routes/auditTrailRoutes.js";
import User from "./models/User.js";
import AuditTrail from "./models/AuditTrail.js";
import AuthService from "./services/AuthService.js";
import { resolveMongoUri } from "./config/runtime.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const { mongoUri: MONGO_URI, usingLocalFallback } = resolveMongoUri();

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/employees", employeeRoutes);
app.use("/salary-master", salaryRoutes);
app.use("/audit-trail", auditTrailRoutes);

// Basic health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(
      `MongoDB connected (${mongoose.connection.host}/${mongoose.connection.name})`
    );

    if (usingLocalFallback) {
      console.warn(
        "Using the local MongoDB fallback because MONGO_URI is missing or still set to the placeholder."
      );
    }

    await User.syncIndexes();
    console.log("User indexes synced");
    await AuditTrail.syncIndexes();
    console.log("Audit trail indexes synced");
    await AuthService.bootstrapSuperAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

startServer();
