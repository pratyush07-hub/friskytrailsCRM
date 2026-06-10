const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

async function register(name, email, password) {
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    isAdmin: false,
    createdAt: new Date()
  };

  const result = await User.insertUser(newUser);
  const token = jwt.sign(
    { userId: result.insertedId.toString(), isAdmin: false },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: result.insertedId.toString(),
      name,
      email: email.toLowerCase(),
      isAdmin: false
    }
  };
}

async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user._id.toString(), isAdmin: !!user.isAdmin },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: !!user.isAdmin
    }
  };
}

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: !!user.isAdmin
  };
}

async function updatePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new Error("Current and new passwords are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Incorrect current password");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
}

async function updateProfile(userId, name, email) {
  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if email is already taken by another user
  if (email.toLowerCase() !== user.email) {
    const existing = await User.findByEmail(email);
    if (existing && existing._id.toString() !== userId) {
      throw new Error("Email is already in use");
    }
  }

  user.name = name;
  user.email = email.toLowerCase();
  await user.save();

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: !!user.isAdmin
  };
}

module.exports = {
  register,
  login,
  getProfile,
  updatePassword,
  updateProfile
};
