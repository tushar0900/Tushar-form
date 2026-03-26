import UserService from "../services/UserService.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserService.listUsers();
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await UserService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await UserService.updateUser(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(200).json(user);
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};
