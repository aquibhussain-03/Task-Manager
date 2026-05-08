const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already registered.' });
    }

    // Only allow admin role if explicitly specified and no admins exist yet
    let assignedRole = 'member';
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists) {
        assignedRole = 'admin'; // First user can be admin
      }
    }

    const user = await User.create({ name, email, password, role: assignedRole });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (error) {
    console.error('[register error]', error.message);
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[login error]', error.message);
    next(error);
  }
};

// @desc   Logout user
// @route  POST /api/auth/logout
// @access Protected
const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully.' });
};

// @desc   Get current user
// @route  GET /api/auth/me
// @access Protected
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, logout, getMe };
