const Project = require('../models/Project');

// ── Basic role guard ───────────────────────────────────────────────────────────
const authorizeRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Requires role: ${roles.join(' or ')}.`,
    });
  }
  next();
};

// ── Project membership guard ───────────────────────────────────────────────────
// Reads project from req.params.projectId OR req.body.project
// Attaches req.project so controllers skip a second DB call
const isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isMember = project.members.some((id) => id.equals(req.user._id));
    const isOwner  = project.owner.equals(req.user._id);
    const isAdmin  = req.user.role === 'admin';

    if (!isMember && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project.',
      });
    }

    req.project = project; // attach for reuse in controllers
    next();
  } catch (error) {
    next(error);
  }
};

// ── Assignment guard ───────────────────────────────────────────────────────────
// Admin → can assign to anyone
// Member → can only self-assign (or leave unassigned)
const canAssignTask = (req, res, next) => {
  const assignedTo = req.body.assignedTo || req.body.assignee;

  // No assignment provided — fine for everyone
  if (!assignedTo) return next();

  const isSelfAssign = assignedTo.toString() === req.user._id.toString();
  if (req.user.role === 'admin' || isSelfAssign) return next();

  return res.status(403).json({
    success: false,
    message: 'Members can only assign tasks to themselves. Ask an admin to assign to others.',
  });
};

module.exports = { authorizeRole, isProjectMember, canAssignTask };
