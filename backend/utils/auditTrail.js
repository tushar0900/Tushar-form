const toPlainObject = (value) => {
  if (!value) {
    return {};
  }

  if (typeof value.toObject === "function") {
    return value.toObject();
  }

  return value;
};

const serializeValue = (value) => {
  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, serializeValue(nestedValue)])
    );
  }

  return value;
};

export const buildActorSnapshot = (user) => {
  if (!user) {
    return {
      userId: null,
      name: "System",
      email: null,
      role: "system",
    };
  }

  return {
    userId: String(user.id || user._id || ""),
    name: user.name,
    email: user.email ?? null,
    role: user.role ?? null,
  };
};

export const buildRequestMetadata = (req) => ({
  ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
  userAgent: req.get("user-agent") || null,
});

export const buildEmployeeSnapshot = (employee) => {
  if (!employee) {
    return null;
  }

  const value = toPlainObject(employee);

  return {
    employeeCode: value.employeeCode,
    employeeName: value.employeeName,
    employeeEmail: value.employeeEmail,
    employeeNumber: value.employeeNumber,
    dob: serializeValue(value.dob),
    joiningDate: serializeValue(value.joiningDate),
  };
};

export const buildSalarySnapshot = (salary) => {
  if (!salary) {
    return null;
  }

  const value = toPlainObject(salary);

  return {
    employeeCode: value.employeeCode,
    basic: value.basic,
    hra: value.hra,
    conveyance: value.conveyance,
    otherAllowance: value.otherAllowance,
    grossSalary: value.grossSalary,
    employeePF: value.employeePF,
    employerPF: value.employerPF,
    employeeESIC: value.employeeESIC,
    employerESIC: value.employerESIC,
    netSalary: value.netSalary,
    ctc: value.ctc,
  };
};

export const buildUserSnapshot = (user) => {
  if (!user) {
    return null;
  }

  const value = toPlainObject(user);

  return {
    name: value.name,
    email: value.email,
    role: value.role,
    employeeCode: value.employeeCode ?? null,
    status: value.status,
    mustChangePassword: Boolean(value.mustChangePassword),
  };
};

export const buildAuditChanges = (beforeValue, afterValue) => {
  const beforeSnapshot = beforeValue || {};
  const afterSnapshot = afterValue || {};
  const keys = new Set([
    ...Object.keys(beforeSnapshot),
    ...Object.keys(afterSnapshot),
  ]);

  return [...keys]
    .filter((key) => {
      const beforeSerialized = JSON.stringify(serializeValue(beforeSnapshot[key]));
      const afterSerialized = JSON.stringify(serializeValue(afterSnapshot[key]));
      return beforeSerialized !== afterSerialized;
    })
    .map((key) => ({
      field: key,
      from: serializeValue(beforeSnapshot[key]),
      to: serializeValue(afterSnapshot[key]),
    }));
};
