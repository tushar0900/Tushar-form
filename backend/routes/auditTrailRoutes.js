import express from "express";
import { getAuditTrail } from "../controllers/AuditTrailController.js";
import {
  requireAuth,
  requireCompletedPasswordChange,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth, requireCompletedPasswordChange, requireRole("super_admin"));
router.get("/", getAuditTrail);

export default router;
