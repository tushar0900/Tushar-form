/* Salary Service - Business Logic Layer */
import SalaryRepository from "../repositories/SalaryRepository.js";
import EmployeeRepository from "../repositories/EmployeeRepository.js";

class SalaryService {
  normalizeNumericFields(salaryData) {
    const normalizedData = {
      employeeCode: Number(salaryData.employeeCode),
      basic: Number(salaryData.basic || 0),
      hra: Number(salaryData.hra || 0),
      conveyance: Number(salaryData.conveyance || 0),
      otherAllowance: Number(salaryData.otherAllowance || 0),
    };

    if (!normalizedData.employeeCode) {
      throw new Error("Employee code is required");
    }

    if (normalizedData.basic <= 0) {
      throw new Error("Basic salary must be greater than 0");
    }

    if (normalizedData.hra < 0 || normalizedData.conveyance < 0 || normalizedData.otherAllowance < 0) {
      throw new Error("Salary values cannot be negative");
    }

    return normalizedData;
  }

  calculateSalaryFields(salaryData) {
    const normalizedData = this.normalizeNumericFields(salaryData);
    const grossSalary =
      normalizedData.basic +
      normalizedData.hra +
      normalizedData.conveyance +
      normalizedData.otherAllowance;

    const employeePF = normalizedData.basic * 0.12;
    const employerPF = normalizedData.basic * 0.12;
    const eps = normalizedData.basic * 0.0833;
    const epf = employerPF - eps;
    const employeeESIC = grossSalary <= 21000 ? grossSalary * 0.0075 : 0;
    const employerESIC = grossSalary <= 21000 ? grossSalary * 0.0325 : 0;
    const netSalary = grossSalary - employeePF - employeeESIC;
    const ctc = grossSalary + employerPF + employerESIC;

    return {
      ...normalizedData,
      grossSalary,
      employeePF,
      employerPF,
      eps,
      epf,
      employeeESIC,
      employerESIC,
      netSalary,
      ctc,
    };
  }

  async ensureEmployeeExists(employeeCode) {
    const employee = await EmployeeRepository.findByEmployeeCode(employeeCode);
    if (!employee) {
      throw new Error("Employee not found for the provided employee code");
    }
  }

  async createSalary(salaryData) {
    const salaryPayload = this.calculateSalaryFields(salaryData);
    await this.ensureEmployeeExists(salaryPayload.employeeCode);

    const existing = await SalaryRepository.existsByCode(salaryPayload.employeeCode);
    if (existing) {
      throw new Error("Salary master already exists for this employee");
    }

    return SalaryRepository.create(salaryPayload);
  }

  async getSalaryById(id) {
    const salary = await SalaryRepository.findById(id);
    if (!salary) {
      throw new Error("Salary record not found");
    }
    return salary;
  }

  async getSalaryByEmployeeCode(code) {
    const salary = await SalaryRepository.findByEmployeeCode(code);
    if (!salary) {
      throw new Error("Salary record not found");
    }
    return salary;
  }

  async getAllSalaries(page = 1, limit = 10) {
    return SalaryRepository.findAll(page, limit);
  }

  async updateSalary(id, updateData) {
    const currentSalary = await this.getSalaryById(id);
    const mergedData = {
      employeeCode: updateData.employeeCode ?? currentSalary.employeeCode,
      basic: updateData.basic ?? currentSalary.basic,
      hra: updateData.hra ?? currentSalary.hra,
      conveyance: updateData.conveyance ?? currentSalary.conveyance,
      otherAllowance: updateData.otherAllowance ?? currentSalary.otherAllowance,
    };

    const salaryPayload = this.calculateSalaryFields(mergedData);
    await this.ensureEmployeeExists(salaryPayload.employeeCode);

    if (salaryPayload.employeeCode !== currentSalary.employeeCode) {
      const existing = await SalaryRepository.existsByCode(salaryPayload.employeeCode);
      if (existing) {
        throw new Error("Salary master already exists for this employee");
      }
    }

    const updated = await SalaryRepository.updateById(id, salaryPayload);
    if (!updated) {
      throw new Error("Salary record not found");
    }
    return updated;
  }

  async updateSalaryByCode(code, updateData) {
    const currentSalary = await this.getSalaryByEmployeeCode(code);
    return this.updateSalary(currentSalary._id, updateData);
  }

  async deleteSalary(id) {
    const deleted = await SalaryRepository.deleteById(id);
    if (!deleted) {
      throw new Error("Salary record not found");
    }
    return deleted;
  }

  async deleteSalaryByCode(code) {
    const deleted = await SalaryRepository.deleteByEmployeeCode(code);
    if (!deleted) {
      throw new Error("Salary record not found");
    }
    return deleted;
  }
}

export default new SalaryService();
