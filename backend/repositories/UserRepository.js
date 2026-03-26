import User from "../models/User.js";

class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async findById(id) {
    return User.findById(id);
  }

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() });
  }

  async findAll() {
    return User.find().sort({ createdAt: -1 });
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteById(id) {
    return User.findByIdAndDelete(id);
  }

  async countActiveByRole(role) {
    return User.countDocuments({ role, status: "active" });
  }
}

export default new UserRepository();
