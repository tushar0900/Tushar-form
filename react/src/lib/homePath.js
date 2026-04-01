export const getHomePathForRole = (role) => {
  if (role === "super_admin") {
    return "/users";
  }

  if (role === "employee") {
    return "/my-salary";
  }

  return "/employees";
};

export const getDefaultPathForUser = (user) => {
  if (user?.mustChangePassword) {
    return "/change-password";
  }

  return getHomePathForRole(user?.role);
};
