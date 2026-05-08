const User = require('../models/User');

// @desc   Get all users
// @route  GET /api/users
// @access Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single user
// @route  GET /api/users/:id
// @access Protected
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc   Update own profile
// @route  PUT /api/users/profile
// @access Protected
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { name, avatar, currentPassword, newPassword } = req.body;
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password required.' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
      user.password = newPassword;
    }

    await user.save();
    res.json({ success: true, message: 'Profile updated.', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

// @desc   Update user role (admin only)
// @route  PUT /api/users/:id/role
// @access Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'Role updated.', user });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete user
// @route  DELETE /api/users/:id
// @access Admin
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, updateProfile, updateUserRole, deleteUser };
