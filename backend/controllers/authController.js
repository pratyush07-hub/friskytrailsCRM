const authService = require('../services/authService');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    res.cookie('token', result.token, cookieOptions);
    res.status(201).json({ user: result.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie('token', result.token, cookieOptions);
    res.json({ user: result.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ message: 'Logged out successfully' });
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

module.exports = {
  register,
  login,
  logout,
  getProfile
};
