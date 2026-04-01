import bcrypt from "bcryptjs";
import UserRepository from "../repositories/UserRepository.js";
import EmployeeRepository from "../repositories/EmployeeRepository.js";
import { sanitizeUser } from "./AuthService.js";

const VALID_ROLES = new Set(["admin", "super_admin", "employee"]);
const VALID_STATUSES = new Set(["active", "inactive"]);
const ROLES_REQUIRING_PASSWORD_CHANGE = new Set(["admin", "super_admin"]);

const buildUsernameBase = (value = "") => {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18);

  return base || "user";
};

class UserService {
  roleRequiresPasswordChange(role) {
    return ROLES_REQUIRING_PASSWORD_CHANGE.has(role);
  }

  normalizeEmployeeCode(value) {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const employeeCode = Number(value);
    return Number.isInteger(employeeCode) ? employeeCode : Number.NaN;
  }

  async resolveEmployeeAccount(employeeCode, userIdToIgnore = null) {
    const normalizedEmployeeCode = this.normalizeEmployeeCode(employeeCode);

    if (!Number.isInteger(normalizedEmployeeCode)) {
      throw new Error("Employee users must be linked to a valid employee code");
    }

    const employee = await EmployeeRepository.findByEmployeeCode(normalizedEmployeeCode);

    if (!employee) {
      throw new Error("Selected employee does not exist");
    }

    const linkedUser = await UserRepository.findByEmployeeCode(normalizedEmployeeCode);

    if (linkedUser && String(linkedUser._id) !== String(userIdToIgnore)) {
      throw new Error("This employee already has a login account");
    }

    return {
      employeeCode: normalizedEmployeeCode,
      employee,
    };
  }

  async validateEmployeeLink(role, employeeCode, userIdToIgnore = null) {
    if (role !== "employee") {
      return null;
    }

    const employeeAccount = await this.resolveEmployeeAccount(
      employeeCode,
      userIdToIgnore
    );

    return employeeAccount.employeeCode;
  }

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

  async listUsers() {
    const users = await UserRepository.findAll();
    return users.map(sanitizeUser);
  }

  async createUser(userData) {
    const {
      name,
      email,
      password,
      role = "admin",
      status = "active",
      employeeCode,
    } = userData;

    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required");
    }

    if (!VALID_ROLES.has(role)) {
      throw new Error("Invalid user role");
    }

    if (!VALID_STATUSES.has(status)) {
      throw new Error("Invalid user status");
    }

    const employeeAccount =
      role === "employee"
        ? await this.resolveEmployeeAccount(employeeCode)
        : null;
    const normalizedEmployeeCode = employeeAccount?.employeeCode ?? null;
    const finalName =
      role === "employee"
        ? employeeAccount.employee.employeeName.trim()
        : name.trim();
    const finalEmail =
      role === "employee"
        ? employeeAccount.employee.employeeEmail.toLowerCase().trim()
        : email.toLowerCase().trim();

    const existingUser = await UserRepository.findByEmail(finalEmail);
    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const username = await this.generateUniqueUsername(finalEmail);
    const user = await UserRepository.create({
      username,
      name: finalName,
      email: finalEmail,
      passwordHash,
      role,
      employeeCode: normalizedEmployeeCode,
      status,
      mustChangePassword: this.roleRequiresPasswordChange(role),
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

    const nextEmployeeCode = Object.prototype.hasOwnProperty.call(updates, "employeeCode")
      ? updates.employeeCode
      : user.employeeCode;
    const employeeAccount =
      nextRole === "employee"
        ? await this.resolveEmployeeAccount(nextEmployeeCode, userId)
        : null;
    const normalizedEmployeeCode = employeeAccount?.employeeCode ?? null;

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

    const finalEmail =
      nextRole === "employee"
        ? employeeAccount.employee.employeeEmail.toLowerCase().trim()
        : updates.email
          ? updates.email.toLowerCase().trim()
          : user.email;

    if (finalEmail !== user.email) {
      const existingUser = await UserRepository.findByEmail(finalEmail);
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

      if (!this.roleRequiresPasswordChange(updates.role) && !updates.password) {
        updatePayload.mustChangePassword = false;
      }
    }

    if (nextRole !== "employee" && user.employeeCode !== null) {
      updatePayload.employeeCode = null;
    }

    if (nextRole === "employee") {
      updatePayload.employeeCode = normalizedEmployeeCode;
      updatePayload.name = employeeAccount.employee.employeeName.trim();
      updatePayload.email =
        employeeAccount.employee.employeeEmail.toLowerCase().trim();
    }

    if (updates.status) {
      updatePayload.status = updates.status;
    }

    if (updates.password) {
      updatePayload.passwordHash = await bcrypt.hash(updates.password, 10);
      updatePayload.mustChangePassword =
        String(user._id) === String(actorId)
          ? false
          : this.roleRequiresPasswordChange(nextRole);
    }

    const updatedUser = await UserRepository.updateById(userId, updatePayload);
    return sanitizeUser(updatedUser);
  }

  async deleteUser(userId, actorId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (String(user._id) === actorId) {
      throw new Error("You cannot delete your own account");
    }

    if (user.role === "super_admin" && user.status === "active") {
      const activeSuperAdminCount = await UserRepository.countActiveByRole(
        "super_admin"
      );

      if (activeSuperAdminCount <= 1) {
        throw new Error("At least one active super admin must remain");
      }
    }

    const deletedUser = await UserRepository.deleteById(userId);
    return sanitizeUser(deletedUser);
  }
}

export default new UserService();
