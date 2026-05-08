const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required').toLowerCase(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required').toLowerCase(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);

module.exports = router;
