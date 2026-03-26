import express from "express";
import {
  createEmployee,
  getEmployeeById,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  checkEmployeeCodeExists,
} from "../controllers/EmployeeController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", requireRole("admin", "super_admin"), getAllEmployees);
router.post("/", requireRole("admin", "super_admin"), createEmployee);
router.get("/check/:code", requireRole("admin", "super_admin"), checkEmployeeCodeExists);
router.get("/:id", requireRole("admin", "super_admin"), getEmployeeById);
router.put("/:id", requireRole("admin", "super_admin"), updateEmployee);
router.delete("/:id", requireRole("super_admin"), deleteEmployee);

export default router;
