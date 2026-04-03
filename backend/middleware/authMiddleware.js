import AuthService from "../services/AuthService.js";

const getBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice(7).trim();
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Authentication token is required" });
    }

    const payload = AuthService.verifyToken(token);
    const user = await AuthService.getCurrentUser(payload.sub);

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired authentication token" });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication is required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }

    next();
  };
};

export const requireCompletedPasswordChange = (req, res, next) => {
  if (req.user?.mustChangePassword) {
    return res.status(403).json({
      message: "You must change your password before accessing Employee Payroll System",
    });
  }

  next();
};
