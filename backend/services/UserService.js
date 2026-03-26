import bcrypt from "bcryptjs";
import UserRepository from "../repositories/UserRepository.js";
import { sanitizeUser } from "./AuthService.js";

const VALID_ROLES = new Set(["admin", "super_admin"]);
const VALID_STATUSES = new Set(["active", "inactive"]);

class UserService {
  async listUsers() {
    const users = await UserRepository.findAll();
    return users.map(sanitizeUser);
  }

  async createUser(userData) {
    const { name, email, password, role = "admin", status = "active" } = userData;

    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required");
    }

    if (!VALID_ROLES.has(role)) {
      throw new Error("Invalid user role");
    }

    if (!VALID_STATUSES.has(status)) {
      throw new Error("Invalid user status");
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      status,
    });

    return sanitizeUser(user);
  }

  async updateUser(userId, updates, actorId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const nextRole = updates.role ?? user.role;
    const nextStatus = updates.status ?? user.status;

    if (updates.role && !VALID_ROLES.has(updates.role)) {
      throw new Error("Invalid user role");
    }

    if (updates.status && !VALID_STATUSES.has(updates.status)) {
      throw new Error("Invalid user status");
    }

    if (String(user._id) === actorId && updates.status === "inactive") {
      throw new Error("You cannot deactivate your own account");
    }

    if (
      user.role === "super_admin" &&
      (nextRole !== "super_admin" || nextStatus !== "active")
    ) {
      const activeSuperAdminCount = await UserRepository.countActiveByRole(
        "super_admin"
      );

      if (activeSuperAdminCount <= 1) {
        throw new Error("At least one active super admin must remain");
      }
    }

    if (updates.email && updates.email.toLowerCase().trim() !== user.email) {
      const existingUser = await UserRepository.findByEmail(updates.email);
      if (existingUser) {
        throw new Error("A user with this email already exists");
      }
    }

    const updatePayload = {};

    if (updates.name) {
      updatePayload.name = updates.name.trim();
    }

    if (updates.email) {
      updatePayload.email = updates.email.toLowerCase().trim();
    }

    if (updates.role) {
      updatePayload.role = updates.role;
    }

    if (updates.status) {
      updatePayload.status = updates.status;
    }

    if (updates.password) {
      updatePayload.passwordHash = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await UserRepository.updateById(userId, updatePayload);
    return sanitizeUser(updatedUser);
  }
}

export default new UserService();
