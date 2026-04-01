import SalaryService from "../services/SalaryService.js";
import AuditTrailService from "../services/AuditTrailService.js";
import {
  buildActorSnapshot,
  buildAuditChanges,
  buildRequestMetadata,
  buildSalarySnapshot,
} from "../utils/auditTrail.js";

export const createSalary = async (req, res) => {
  try {
    const salary = await SalaryService.createSalary(req.body);
    await AuditTrailService.recordEvent({
      actor: buildActorSnapshot(req.user),
      action: "create",
      entityType: "salary",
      entityId: salary._id.toString(),
      entityLabel: `Salary for employee #${salary.employeeCode}`,
      summary: `${req.user.name} created salary master for employee #${salary.employeeCode}`,
      changes: buildAuditChanges(null, buildSalarySnapshot(salary)),
      metadata: buildRequestMetadata(req),
    });
    res.status(201).json(salary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllSalaries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const result = await SalaryService.getAllSalaries(page, limit);

    res.status(200).json({
      data: result.salaries,
      currentPage: result.page,
      totalPages: Math.ceil(result.total / result.limit),
      totalSalaries: result.total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalaryById = async (req, res) => {
  try {
    const salary = await SalaryService.getSalaryById(req.params.id);
    res.status(200).json(salary);
  } catch (error) {
    const statusCode = error.message === "Salary record not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

export const getSalaryByEmployeeCode = async (req, res) => {
  try {
    const salary = await SalaryService.getSalaryByEmployeeCode(req.params.employeeCode);
    res.status(200).json(salary);
  } catch (error) {
    const statusCode = error.message === "Salary record not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

export const getMySalary = async (req, res) => {
  try {
    if (!req.user?.employeeCode) {
      return res.status(403).json({ message: "No employee record is linked to this account" });
    }

    const salary = await SalaryService.getSalaryByEmployeeCode(req.user.employeeCode);
    res.status(200).json(salary);
  } catch (error) {
    const statusCode = error.message === "Salary record not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

export const updateSalary = async (req, res) => {
  try {
    const currentSalary = await SalaryService.getSalaryById(req.params.id);
    const salary = await SalaryService.updateSalary(req.params.id, req.body);
    await AuditTrailService.recordEvent({
      actor: buildActorSnapshot(req.user),
      action: "update",
      entityType: "salary",
      entityId: salary._id.toString(),
      entityLabel: `Salary for employee #${salary.employeeCode}`,
      summary: `${req.user.name} updated salary master for employee #${salary.employeeCode}`,
      changes: buildAuditChanges(
        buildSalarySnapshot(currentSalary),
        buildSalarySnapshot(salary)
      ),
      metadata: buildRequestMetadata(req),
    });
    res.status(200).json(salary);
  } catch (error) {
    const statusCode = error.message === "Salary record not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

export const deleteSalary = async (req, res) => {
  try {
    const currentSalary = await SalaryService.getSalaryById(req.params.id);
    const salary = await SalaryService.deleteSalary(req.params.id);
    await AuditTrailService.recordEvent({
      actor: buildActorSnapshot(req.user),
      action: "delete",
      entityType: "salary",
      entityId: currentSalary._id.toString(),
      entityLabel: `Salary for employee #${currentSalary.employeeCode}`,
      summary: `${req.user.name} deleted salary master for employee #${currentSalary.employeeCode}`,
      changes: buildAuditChanges(
        buildSalarySnapshot(currentSalary),
        null
      ),
      metadata: buildRequestMetadata(req),
    });
    res.status(200).json({ message: "Salary record deleted successfully", salary });
  } catch (error) {
    const statusCode = error.message === "Salary record not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};
