import UserService from "../services/UserService.js";
import AuditTrailService from "../services/AuditTrailService.js";
import {
  buildActorSnapshot,
  buildAuditChanges,
  buildRequestMetadata,
  buildUserSnapshot,
} from "../utils/auditTrail.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserService.listUsers();
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await UserService.createUser(req.body);
    await AuditTrailService.recordEvent({
      actor: buildActorSnapshot(req.user),
      action: "create",
      entityType: "user",
      entityId: user.id,
      entityLabel: user.email,
      summary: `${req.user.name} created ${user.role.replace("_", " ")} account for ${user.name}`,
      changes: buildAuditChanges(null, buildUserSnapshot(user)),
      metadata: buildRequestMetadata(req),
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const currentUser = await UserService.getUserById(req.params.id);
    const user = await UserService.updateUser(
      req.params.id,
      req.body,
      req.user.id
    );
    const passwordResetText = req.body.password ? " and reset the password" : "";
    await AuditTrailService.recordEvent({
      actor: buildActorSnapshot(req.user),
      action: "update",
      entityType: "user",
      entityId: user.id,
      entityLabel: user.email,
      summary: `${req.user.name} updated user ${user.name}${passwordResetText}`,
      changes: buildAuditChanges(
        buildUserSnapshot(currentUser),
        buildUserSnapshot(user)
      ),
      metadata: buildRequestMetadata(req),
    });
    res.status(200).json(user);
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const currentUser = await UserService.getUserById(req.params.id);
    const user = await UserService.deleteUser(req.params.id, req.user.id);
    await AuditTrailService.recordEvent({
      actor: buildActorSnapshot(req.user),
      action: "delete",
      entityType: "user",
      entityId: currentUser.id,
      entityLabel: currentUser.email,
      summary: `${req.user.name} deleted user ${currentUser.name}`,
      changes: buildAuditChanges(
        buildUserSnapshot(currentUser),
        null
      ),
      metadata: buildRequestMetadata(req),
    });
    res.status(200).json({
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};
