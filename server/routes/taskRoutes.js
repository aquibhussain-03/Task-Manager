const express = require('express');
const router = express.Router();
const {
  getTasks, createTask, getTask,
  updateTask, updateTaskStatus,
  deleteTask, addComment, getDashboardStats,
} = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isProjectMember, canAssignTask } = require('../middleware/roleMiddleware');

router.use(verifyToken); // all task routes require auth

// Dashboard stats — must be before /:id to avoid route collision
router.get('/dashboard', getDashboardStats);

// List all tasks (filtered by role in controller)
router.get('/', getTasks);

// Create task — must be project member + assignment check
router.post('/', isProjectMember, canAssignTask, createTask);

// Single task CRUD
router.get('/:id',    getTask);
router.put('/:id',    canAssignTask, updateTask);   // assignment check on edit too
router.delete('/:id', deleteTask);                  // ownership check in controller

// Status change — any project member (checked in controller)
router.patch('/:id/status', updateTaskStatus);

// Comments — any authenticated project member (checked in controller)
router.post('/:id/comments', addComment);

module.exports = router;
