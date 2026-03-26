import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/UserRepository.js";

const DEFAULT_SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL || "superadmin@hrms.local";
const DEFAULT_SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@123";
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const buildUsernameBase = (value = "") => {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18);

  return base || "user";
};

export const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  employeeCode: user.employeeCode ?? null,
  status: user.status,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

class AuthService {
  async generateUniqueUsername(seedValue) {
    const base = buildUsernameBase(seedValue);
    let candidate = base;
    let suffix = 1;

    while (await UserRepository.findByUsername(candidate)) {
      candidate = `${base}${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  async backfillMissingUsernames() {
    const users = await UserRepository.findUsersWithoutUsername();

    for (const user of users) {
      user.username = await this.generateUniqueUsername(user.email || user.name);
      await user.save({ validateBeforeSave: false });
    }
  }

  generateToken(user) {
    return jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.status !== "active") {
      throw new Error("This account is inactive");
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    user.lastLoginAt = new Date();
    await user.save();

    return {
      token: this.generateToken(user),
      user: sanitizeUser(user),
    };
  }

  async getCurrentUser(userId) {
    const user = await UserRepository.findById(userId);
    if (!user || user.status !== "active") {
      throw new Error("User not found or inactive");
    }
    return sanitizeUser(user);
  }

  async bootstrapSuperAdmin() {
    await this.backfillMissingUsernames();

    const activeSuperAdminCount = await UserRepository.countActiveByRole(
      "super_admin"
    );

    if (activeSuperAdminCount > 0) {
      return;
    }

    const passwordHash = await bcrypt.hash(DEFAULT_SUPER_ADMIN_PASSWORD, 10);
    const username = await this.generateUniqueUsername(DEFAULT_SUPER_ADMIN_EMAIL);

    await UserRepository.create({
      username,
      name: "System Super Admin",
      email: DEFAULT_SUPER_ADMIN_EMAIL,
      passwordHash,
      role: "super_admin",
      status: "active",
    });

    console.log("Bootstrap super admin created");
    console.log(`Email: ${DEFAULT_SUPER_ADMIN_EMAIL}`);
    console.log(`Password: ${DEFAULT_SUPER_ADMIN_PASSWORD}`);
  }
}

export default new AuthService();
