/* Employee Service - Business Logic Layer */
import EmployeeRepository from "../repositories/EmployeeRepository.js";
import { generateEmployeeCode } from "../utils/generateCode.js";

class EmployeeService {
  async getNextEmployeeCode() {
    return await generateEmployeeCode();
  }

  // Create new employee with validation
  async createEmployee(employeeData) {
    const { dob, joiningDate, employeeCode: requestedEmployeeCode } = employeeData;

    // Age validation (18+)
    const dobDate = new Date(dob);
    const minJoiningDate = new Date(dobDate);
    minJoiningDate.setFullYear(minJoiningDate.getFullYear() + 18);

    if (new Date(joiningDate) < minJoiningDate) {
      throw new Error("Employee must be at least 18 years old at joining");
    }

    let employeeCode = Number(requestedEmployeeCode);

    if (!Number.isInteger(employeeCode) || employeeCode < 1000 || employeeCode > 9999) {
      employeeCode = await generateEmployeeCode();
    } else {
      const exists = await EmployeeRepository.existsByCode(employeeCode);

      if (exists) {
        employeeCode = await generateEmployeeCode();
      }
    }

    return await EmployeeRepository.create({
      ...employeeData,
      employeeCode,
    });
  }

  // Get employee by ID
  async getEmployeeById(id) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new Error("Employee not found");
    }
    return employee;
  }

  // Get employee by code
  async getEmployeeByCode(code) {
    const employee = await EmployeeRepository.findByEmployeeCode(code);
    if (!employee) {
      throw new Error("Employee not found");
    }
    return employee;
  }

  // Get all employees with pagination
  async getAllEmployees(page = 1, limit = 5) {
    return await EmployeeRepository.findAll(page, limit);
  }

  // Get all employees (dropdown format)
  async getEmployeeDropdown() {
    return await EmployeeRepository.findAllSimple();
  }

  // Update employee by ID
  async updateEmployee(id, updateData) {
    // Validate age if updating DOB or joining date
    if (updateData.dob || updateData.joiningDate) {
      const employee = await this.getEmployeeById(id);
      const dob = updateData.dob || employee.dob;
      const joiningDate = updateData.joiningDate || employee.joiningDate;

      const dobDate = new Date(dob);
      const minJoiningDate = new Date(dobDate);
      minJoiningDate.setFullYear(minJoiningDate.getFullYear() + 18);

      if (new Date(joiningDate) < minJoiningDate) {
        throw new Error("Employee must be at least 18 years old at joining");
      }
    }

    const updated = await EmployeeRepository.updateById(id, updateData);
    if (!updated) {
      throw new Error("Employee not found");
    }
    return updated;
  }

  // Delete employee by ID
  async deleteEmployee(id) {
    const deleted = await EmployeeRepository.deleteById(id);
    if (!deleted) {
      throw new Error("Employee not found");
    }
    return deleted;
  }

  // Check if employee code exists
  async employeeCodeExists(code) {
    return await EmployeeRepository.existsByCode(code);
  }
}

export default new EmployeeService();
