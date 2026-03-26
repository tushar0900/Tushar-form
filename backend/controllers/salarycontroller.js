import SalaryService from "../services/SalaryService.js";

export const createSalary = async (req, res) => {
  try {
    const salary = await SalaryService.createSalary(req.body);
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

export const updateSalary = async (req, res) => {
  try {
    const salary = await SalaryService.updateSalary(req.params.id, req.body);
    res.status(200).json(salary);
  } catch (error) {
    const statusCode = error.message === "Salary record not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

export const deleteSalary = async (req, res) => {
  try {
    const salary = await SalaryService.deleteSalary(req.params.id);
    res.status(200).json({ message: "Salary record deleted successfully", salary });
  } catch (error) {
    const statusCode = error.message === "Salary record not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};
