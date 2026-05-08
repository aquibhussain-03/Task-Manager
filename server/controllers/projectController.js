const Project = require('../models/Project');
const Task = require('../models/Task');
const Team = require('../models/Team');
const User = require('../models/User');

// @desc   Get all projects (admin: all, member: own)
// @route  GET /api/projects
// @access Protected
const getProjects = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort('-createdAt');

    // Attach task counts
    const projectsWithStats = await Promise.all(
      projects.map(async (p) => {
        const taskCount = await Task.countDocuments({ project: p._id });
        const doneCount = await Task.countDocuments({ project: p._id, status: 'done' });
        return { ...p.toJSON(), taskCount, doneCount };
      })
    );

    res.json({ success: true, count: projects.length, projects: projectsWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc   Create project
// @route  POST /api/projects
// @access Admin
const createProject = async (req, res, next) => {
  try {
    const { name, description, deadline, color, memberIds } = req.body;

    const project = await Project.create({
      name,
      description,
      deadline,
      color: color || '#6366f1',
      owner: req.user._id,
      members: memberIds ? [req.user._id, ...memberIds] : [req.user._id],
    });

    // Create Team entries
    await Team.create({ project: project._id, user: req.user._id, role: 'owner' });
    if (memberIds && memberIds.length > 0) {
      const teamEntries = memberIds
        .filter((id) => id.toString() !== req.user._id.toString())
        .map((id) => ({ project: project._id, user: id, role: 'member' }));
      if (teamEntries.length) await Team.insertMany(teamEntries, { ordered: false });
    }

    await project.populate('owner', 'name email avatar');
    await project.populate('members', 'name email avatar');

    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single project
// @route  GET /api/projects/:id
// @access Protected (member of project)
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Access check
    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json({ success: true, project, tasks });
  } catch (error) {
    next(error);
  }
};

// @desc   Update project
// @route  PUT /api/projects/:id
// @access Admin
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const { name, description, status, deadline, color } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (deadline !== undefined) project.deadline = deadline;
    if (color) project.color = color;

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members', 'name email avatar');

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete project
// @route  DELETE /api/projects/:id
// @access Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Cascade delete tasks and team entries
    await Task.deleteMany({ project: project._id });
    await Team.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc   Add members to project
// @route  POST /api/projects/:id/members
// @access Admin
const addMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const { memberIds } = req.body;
    if (!memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ success: false, message: 'memberIds array required.' });
    }

    // Validate users exist
    const users = await User.find({ _id: { $in: memberIds } });
    if (users.length !== memberIds.length) {
      return res.status(400).json({ success: false, message: 'One or more users not found.' });
    }

    // Add to project members
    const newMembers = memberIds.filter(
      (id) => !project.members.map((m) => m.toString()).includes(id.toString())
    );
    project.members.push(...newMembers);
    await project.save();

    // Create Team entries
    const teamEntries = newMembers.map((id) => ({
      project: project._id,
      user: id,
      role: 'member',
    }));
    if (teamEntries.length) await Team.insertMany(teamEntries, { ordered: false });

    await project.populate('members', 'name email avatar');
    res.json({ success: true, message: 'Members added.', project });
  } catch (error) {
    next(error);
  }
};

// @desc   Remove member from project
// @route  DELETE /api/projects/:id/members/:userId
// @access Admin
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove project owner.' });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();
    await Team.deleteOne({ project: project._id, user: req.params.userId });

    res.json({ success: true, message: 'Member removed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, addMembers, removeMember };
