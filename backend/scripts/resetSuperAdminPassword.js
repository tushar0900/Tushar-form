import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import { resolveMongoUri } from "../config/runtime.js";

dotenv.config();

const DEFAULT_SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL || "superadmin@payroll.local";
const DEFAULT_SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@123";

const parseArgs = (argv) => {
  const options = {
    email: DEFAULT_SUPER_ADMIN_EMAIL,
    password: DEFAULT_SUPER_ADMIN_PASSWORD,
    listOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--list") {
      options.listOnly = true;
      continue;
    }

    if (argument === "--email" && argv[index + 1]) {
      options.email = argv[index + 1];
      index += 1;
      continue;
    }

    if (argument === "--password" && argv[index + 1]) {
      options.password = argv[index + 1];
      index += 1;
    }
  }

  return options;
};

const listSuperAdmins = async () => {
  const users = await User.find({ role: "super_admin" })
    .sort({ createdAt: 1 })
    .select("name email status mustChangePassword lastLoginAt createdAt")
    .lean();

  if (users.length === 0) {
    console.log("No super admin accounts were found.");
    return;
  }

  console.log("Available super admin accounts:");

  users.forEach((user) => {
    console.log(
      [
        `- ${user.name}`,
        `<${user.email}>`,
        `status=${user.status}`,
        `mustChangePassword=${Boolean(user.mustChangePassword)}`,
        `lastLoginAt=${user.lastLoginAt || "never"}`,
      ].join(" ")
    );
  });
};

const resetSuperAdminPassword = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    console.error(`No user found for email ${normalizedEmail}.`);
    console.error("Run the script with --list to see available super admins.");
    process.exitCode = 1;
    return;
  }

  if (user.role !== "super_admin") {
    console.error(`${normalizedEmail} exists, but it is not a super admin account.`);
    process.exitCode = 1;
    return;
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.status = "active";
  user.mustChangePassword = true;
  await user.save();

  console.log(`Password reset complete for ${normalizedEmail}.`);
  console.log("The account has been marked active and will require a password change after sign-in.");
  console.log(`Temporary password: ${password}`);
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
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

    if (options.listOnly) {
      await listSuperAdmins();
      return;
    }

    await resetSuperAdminPassword(options);
  } catch (error) {
    console.error(`Unable to complete super admin recovery: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

await main();
