const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateProfile, updateUserRole, deleteUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/', authorizeRole('admin'), getUsers);
router.put('/profile', updateProfile);
router.get('/:id', getUser);
router.put('/:id/role', authorizeRole('admin'), updateUserRole);
router.delete('/:id', authorizeRole('admin'), deleteUser);

module.exports = router;
