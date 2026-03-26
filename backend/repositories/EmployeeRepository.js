/* Employee Repository - Data Access Layer */
import Employee from "../models/Employee.js";

class EmployeeRepository {
  // Create a new employee
  async create(employeeData) {
    try {
      const employee = new Employee(employeeData);
      return await employee.save();
    } catch (error) {
      throw new Error(`Failed to create employee: ${error.message}`);
    }
  }

  // Find employee by ID
  async findById(id) {
    try {
      return await Employee.findById(id);
    } catch (error) {
      throw new Error(`Failed to find employee: ${error.message}`);
    }
  }

  // Find employee by Employee Code
  async findByEmployeeCode(code) {
    try {
      return await Employee.findOne({ employeeCode: code });
    } catch (error) {
      throw new Error(`Failed to find employee: ${error.message}`);
    }
  }

  // Find all employees with pagination
  async findAll(page = 1, limit = 5) {
    try {
      const skip = (page - 1) * limit;
      const employees = await Employee.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const total = await Employee.countDocuments();
      return { employees, total, page, limit };
    } catch (error) {
      throw new Error(`Failed to fetch employees: ${error.message}`);
    }
  }

  // Find all employees (for dropdown)
  async findAllSimple() {
    try {
      return await Employee.find({}, "employeeName employeeCode employeeEmail");
    } catch (error) {
      throw new Error(`Failed to fetch employees: ${error.message}`);
    }
  }

  // Update employee by ID
  async updateById(id, updateData) {
    try {
      return await Employee.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }
  }

  // Update employee by Employee Code
  async updateByEmployeeCode(code, updateData) {
    try {
      return await Employee.findOneAndUpdate(
        { employeeCode: code },
        updateData,
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }
  }

  // Delete employee by ID
  async deleteById(id) {
    try {
      return await Employee.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  }

  // Delete employee by Employee Code
  async deleteByEmployeeCode(code) {
    try {
      return await Employee.findOneAndDelete({ employeeCode: code });
    } catch (error) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  }

  // Check if employee exists by code
  async existsByCode(code) {
    try {
      return await Employee.exists({ employeeCode: code });
    } catch (error) {
      throw new Error(`Failed to check employee existence: ${error.message}`);
    }
  }
}

export default new EmployeeRepository();
