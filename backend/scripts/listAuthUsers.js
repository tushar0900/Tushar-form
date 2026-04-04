import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import { resolveMongoUri } from "../config/runtime.js";

dotenv.config();

const parseArgs = (argv) => {
  const options = {
    email: "",
    role: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--email" && argv[index + 1]) {
      options.email = argv[index + 1].toLowerCase().trim();
      index += 1;
      continue;
    }

    if (argument === "--role" && argv[index + 1]) {
      options.role = argv[index + 1].trim();
      index += 1;
    }
  }

  return options;
};

const buildQuery = ({ email, role }) => {
  const query = {};

  if (email) {
    query.email = email;
  }

  if (role) {
    query.role = role;
  }

  return query;
};

const listAuthUsers = async (filters) => {
  const users = await User.find(buildQuery(filters))
    .sort({ createdAt: 1 })
    .select(
      "name email role status employeeCode username mustChangePassword passwordHash lastLoginAt createdAt"
    )
    .lean();

  if (users.length === 0) {
    console.log("No matching users were found in the active database.");
    return;
  }

  console.log(`Found ${users.length} user(s):`);

  users.forEach((user) => {
    console.log(
      [
        `- ${user.name}`,
        `<${user.email}>`,
        `role=${user.role}`,
        `status=${user.status}`,
        `employeeCode=${user.employeeCode ?? "-"}`,
        `username=${user.username || "-"}`,
        `hasPasswordHash=${Boolean(user.passwordHash)}`,
        `mustChangePassword=${Boolean(user.mustChangePassword)}`,
        `lastLoginAt=${user.lastLoginAt || "never"}`,
      ].join(" ")
    );
  });
};

const main = async () => {
  const filters = parseArgs(process.argv.slice(2));
  const { mongoUri, usingLocalFallback } = resolveMongoUri();

  try {
    await mongoose.connect(mongoUri);
    console.log(
      `Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`
    );

    if (usingLocalFallback) {
      console.warn(
        "Using the local MongoDB fallback because MONGO_URI is missing or still set to the placeholder."
      );
    }

    await listAuthUsers(filters);
  } catch (error) {
    console.error(`Unable to inspect auth users: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

await main();
