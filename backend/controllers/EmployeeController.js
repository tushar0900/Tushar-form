/* Employee Controller - API endpoints */
import EmployeeService from "../services/EmployeeService.js";
import AuditTrailService from "../services/AuditTrailService.js";
import {
  buildActorSnapshot,
  buildAuditChanges,
  buildEmployeeSnapshot,
  buildRequestMetadata,
} from "../utils/auditTrail.js";

export const getNextEmployeeCode = async (_req, res) => {
  try {
    const employeeCode = await EmployeeService.getNextEmployeeCode();
    res.status(200).json({ employeeCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const employee = await EmployeeService.createEmployee(req.body);
    await AuditTrailService.recordEvent({
      actor: buildActorSnapshot(req.user),
      action: "create",
      entityType: "employee",
      entityId: employee._id.toString(),
      entityLabel: `${employee.employeeName} (#${employee.employeeCode})`,
      summary: `${req.user.name} created employee ${employee.employeeName}`,
      changes: buildAuditChanges(null, buildEmployeeSnapshot(employee)),
      metadata: buildRequestMetadata(req),
    });
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await EmployeeService.getEmployeeById(req.params.id);
    res.status(200).json(employee);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    // Check for dropdown request
    if (req.query.dropdown === "true") {
      const employees = await EmployeeService.getEmployeeDropdown();
      return res.status(200).json(employees);
    }

    // Paginated list
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const result = await EmployeeService.getAllEmployees(page, limit);
    
    res.status(200).json({
      data: result.employees,
      currentPage: result.page,
      totalPages: Math.ceil(result.total / result.limit),
      totalEmployees: result.total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const currentEmployee = await EmployeeService.getEmployeeById(req.params.id);
    const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
    await AuditTrailService.recordEvent({
      actor: buildActorSnapshot(req.user),
      action: "update",
      entityType: "employee",
      entityId: employee._id.toString(),
      entityLabel: `${employee.employeeName} (#${employee.employeeCode})`,
      summary: `${req.user.name} updated employee ${employee.employeeName}`,
      changes: buildAuditChanges(
        buildEmployeeSnapshot(currentEmployee),
        buildEmployeeSnapshot(employee)
      ),
      metadata: buildRequestMetadata(req),
    });
    res.status(200).json(employee);
  } catch (error) {
    const statusCode = error.message === "Employee not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const currentEmployee = await EmployeeService.getEmployeeById(req.params.id);
    const employee = await EmployeeService.deleteEmployee(req.params.id);
    await AuditTrailService.recordEvent({
      actor: buildActorSnapshot(req.user),
      action: "delete",
      entityType: "employee",
      entityId: currentEmployee._id.toString(),
      entityLabel: `${currentEmployee.employeeName} (#${currentEmployee.employeeCode})`,
      summary: `${req.user.name} deleted employee ${currentEmployee.employeeName}`,
      changes: buildAuditChanges(
        buildEmployeeSnapshot(currentEmployee),
        null
      ),
      metadata: buildRequestMetadata(req),
    });
    res.status(200).json({ message: "Employee deleted successfully", employee });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const checkEmployeeCodeExists = async (req, res) => {
  try {
    const exists = await EmployeeService.employeeCodeExists(req.params.code);
    res.status(200).json({ exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
