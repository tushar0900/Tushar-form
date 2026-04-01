import AuthService from "../services/AuthService.js";

export const login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  res.status(200).json({ user: req.user });
};

export const changePassword = async (req, res) => {
  try {
    const user = await AuthService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );

    res.status(200).json({
      message: "Password changed successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
