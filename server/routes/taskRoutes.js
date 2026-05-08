const express = require('express');
const router = express.Router();
const {
  getTasks, createTask, getTask,
  updateTask, updateTaskStatus, deleteTask,
  addComment, getDashboardStats,
} = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/dashboard', getDashboardStats);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/status', updateTaskStatus);
router.post('/:id/comments', addComment);

module.exports = router;
