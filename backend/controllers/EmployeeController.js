/* Employee Controller - API endpoints */
import EmployeeService from "../services/EmployeeService.js";

export const createEmployee = async (req, res) => {
  try {
    const employee = await EmployeeService.createEmployee(req.body);
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
    const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
    res.status(200).json(employee);
  } catch (error) {
    const statusCode = error.message === "Employee not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await EmployeeService.deleteEmployee(req.params.id);
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
