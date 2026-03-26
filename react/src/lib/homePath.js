export const getHomePathForRole = (role) => {
  if (role === "super_admin") {
    return "/users";
  }

  if (role === "employee") {
    return "/my-salary";
  }

  return "/employees";
};
