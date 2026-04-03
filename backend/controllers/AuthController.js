import AuthService from "../services/AuthService.js";
import AuditTrailService from "../services/AuditTrailService.js";
import {
  buildActorSnapshot,
  buildAuditChanges,
  buildRequestMetadata,
  buildUserSnapshot,
} from "../utils/auditTrail.js";

export const login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    await AuditTrailService.recordEvent({
      actor: buildActorSnapshot(result.user),
      action: "login",
      entityType: "auth",
      entityId: result.user.id,
      entityLabel: result.user.email,
      summary: `${result.user.name} signed in to Employee Payroll System`,
      changes: [],
      metadata: buildRequestMetadata(req),
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  res.status(200).json({ user: req.user });
};

export const changePassword = async (req, res) => {
  try {
    const previousUser = req.user;
    const user = await AuthService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );

    await AuditTrailService.recordEvent({
      actor: buildActorSnapshot(user),
      action: "change_password",
      entityType: "user",
      entityId: user.id,
      entityLabel: user.email,
      summary: `${user.name} changed the account password`,
      changes: buildAuditChanges(
        buildUserSnapshot(previousUser),
        buildUserSnapshot(user)
      ),
      metadata: buildRequestMetadata(req),
    });

    res.status(200).json({
      message: "Password changed successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
