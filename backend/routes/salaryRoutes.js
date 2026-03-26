import express from "express";
import {
  createSalary,
  getAllSalaries,
  getSalaryById,
  getSalaryByEmployeeCode,
  getMySalary,
  updateSalary,
  deleteSalary
} from "../controllers/salarycontroller.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole("admin", "super_admin"), createSalary);
router.get("/", requireRole("admin", "super_admin"), getAllSalaries);
router.get("/my-salary", requireRole("employee"), getMySalary);
router.get("/employee/:employeeCode", requireRole("admin", "super_admin"), getSalaryByEmployeeCode);
router.get("/:id", requireRole("admin", "super_admin"), getSalaryById);
router.put("/:id", requireRole("admin", "super_admin"), updateSalary);
router.delete("/:id", requireRole("super_admin"), deleteSalary);

export default router;
