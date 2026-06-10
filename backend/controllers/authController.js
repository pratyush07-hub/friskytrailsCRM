const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getProfile(req, res) {
  try {
    const profile = await authService.getProfile(req.user.userId);
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.updatePassword(req.user.userId, currentPassword, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updatePassword
};
