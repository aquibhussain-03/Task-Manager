const express = require('express');
const router = express.Router();
const {
  getProjects, createProject, getProject,
  updateProject, deleteProject, addMembers, removeMember,
} = require('../controllers/projectController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.route('/')
  .get(getProjects)
  .post(authorizeRole('admin'), createProject);

router.route('/:id')
  .get(getProject)
  .put(authorizeRole('admin'), updateProject)
  .delete(authorizeRole('admin'), deleteProject);

router.post('/:id/members', authorizeRole('admin'), addMembers);
router.delete('/:id/members/:userId', authorizeRole('admin'), removeMember);

module.exports = router;
