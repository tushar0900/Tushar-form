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
const DEFAULT_SUPER_ADMIN_NAME = "System Super Admin";

const buildUsernameBase = (value = "") => {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18);

  return base || "user";
};

const generateUniqueUsername = async (seedValue) => {
  const base = buildUsernameBase(seedValue);
  let candidate = base;
  let suffix = 1;

  while (await User.findOne({ username: candidate })) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return candidate;
};

const parseArgs = (argv) => {
  const options = {
    execute: false,
    directLogin: false,
    email: DEFAULT_SUPER_ADMIN_EMAIL,
    password: DEFAULT_SUPER_ADMIN_PASSWORD,
    name: DEFAULT_SUPER_ADMIN_NAME,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--execute") {
      options.execute = true;
      continue;
    }

    if (argument === "--direct-login") {
      options.directLogin = true;
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
      continue;
    }

    if (argument === "--name" && argv[index + 1]) {
      options.name = argv[index + 1];
      index += 1;
    }
  }

  return options;
};

const summarizeCurrentUsers = async () => {
  const users = await User.find({})
    .sort({ createdAt: 1 })
    .select("name email role status mustChangePassword createdAt")
    .lean();

  if (users.length === 0) {
    console.log("No login accounts exist in the active database.");
    return;
  }

  console.log(`Current login accounts: ${users.length}`);

  users.forEach((user) => {
    console.log(
      [
        `- ${user.name}`,
        `<${user.email}>`,
        `role=${user.role}`,
        `status=${user.status}`,
        `mustChangePassword=${Boolean(user.mustChangePassword)}`,
      ].join(" ")
    );
  });
};

const resetAuthSystem = async (options) => {
  const normalizedEmail = options.email.toLowerCase().trim();
  const normalizedName = options.name.trim() || DEFAULT_SUPER_ADMIN_NAME;

  if (!options.execute) {
    console.log("Dry run only. No users were changed.");
    console.log("Run again with --execute to remove all login accounts and recreate the super admin.");
    console.log(`New super admin email: ${normalizedEmail}`);
    console.log(`Direct login after reset: ${options.directLogin ? "yes" : "no"}`);
    return;
  }

  await User.deleteMany({});

  const username = await generateUniqueUsername(normalizedEmail);
  const passwordHash = await bcrypt.hash(options.password, 10);

  await User.create({
    username,
    name: normalizedName,
    email: normalizedEmail,
    passwordHash,
    role: "super_admin",
    status: "active",
    mustChangePassword: !options.directLogin,
  });

  console.log("Auth system reset complete.");
  console.log("All existing login accounts were removed.");
  console.log(`Super admin email: ${normalizedEmail}`);
  console.log(`Temporary password: ${options.password}`);

  if (options.directLogin) {
    console.log("The new super admin can enter the dashboard directly after sign-in.");
  } else {
    console.log("The new super admin must change the password after the first sign-in.");
  }
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

    console.log("This reset only affects login accounts. Employee and salary records are preserved.");
    await summarizeCurrentUsers();
    await resetAuthSystem(options);
  } catch (error) {
    console.error(`Unable to reset auth system: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

await main();
