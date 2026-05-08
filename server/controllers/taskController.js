const Task = require('../models/Task');
const Project = require('../models/Project');
const { sendTaskAssignedEmail } = require('../utils/emailService');

const APP_URL = process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:5173';

// @desc   Get tasks (filter by project, status, assignee)
// @route  GET /api/tasks
// @access Protected
const getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, assignedTo, search } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.title = { $regex: search, $options: 'i' };

    // Non-admins only see tasks in their projects
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      filter.project = filter.project
        ? filter.project
        : { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

// @desc   Create task
// @route  POST /api/tasks
// @access Project member (enforced by isProjectMember middleware)
const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate, tags } = req.body;

    // req.project is attached by isProjectMember middleware — no extra DB call needed
    const proj = req.project || await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // If assignee is provided, make sure they're actually in the project
    if (assignedTo) {
      const assigneeInProject = proj.members.some((m) => m.toString() === assignedTo.toString());
      if (!assigneeInProject) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a member of this project.',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags || [],
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('project', 'name color');

    // Send assignment email (non-blocking — runs after response)
    if (task.assignedTo && task.assignedTo._id.toString() !== req.user._id.toString()) {
      setImmediate(() => {
        sendTaskAssignedEmail({
          assignee: task.assignedTo,
          assigner: req.user,
          task,
          project: task.project,
          appUrl: APP_URL,
        }).catch((err) => console.error('Email error:', err.message));
      });
    }

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single task
// @route  GET /api/tasks/:id
// @access Protected
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color members')
      .populate('comments.user', 'name avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc   Update task
// @route  PUT /api/tasks/:id
// @access Assigned user or Admin
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (!isAssigned && !isCreator && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { title, description, assignedTo, status, priority, dueDate, tags } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags) task.tags = tags;

    await task.save();
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('project', 'name color');

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc   Update task status only
// @route  PATCH /api/tasks/:id/status
// @access Any project member or Admin (so full team can use the kanban board)
const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Allow admin OR any member of the project that owns this task
    if (req.user.role !== 'admin') {
      const project = await Project.findById(task.project).select('members');
      const isProjectMember = project?.members.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isProjectMember) {
        return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this project.' });
      }
    }

    const { status } = req.body;
    if (!['todo', 'in-progress', 'review', 'done'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    task.status = status;
    await task.save();

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete task
// @route  DELETE /api/tasks/:id
// @access Creator or Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (!isCreator && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the task creator or an admin can delete this task.',
      });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc   Add comment to task
// @route  POST /api/tasks/:id/comments
// @access Protected
const addComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text required.' });
    }

    task.comments.push({ user: req.user._id, text: text.trim() });
    await task.save();
    await task.populate('comments.user', 'name avatar');

    res.status(201).json({ success: true, comments: task.comments });
  } catch (error) {
    next(error);
  }
};

// @desc   Get dashboard stats
// @route  GET /api/tasks/dashboard
// @access Protected
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    let projectFilter = {};
    let taskFilter = {};

    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      projectFilter = { _id: { $in: projectIds } };
      taskFilter = { project: { $in: projectIds } };
    }

    const [
      totalProjects,
      activeProjects,
      totalTasks,
      todoCount,
      inProgressCount,
      reviewCount,
      doneCount,
      overdueCount,
      myTasks,
    ] = await Promise.all([
      Project.countDocuments(projectFilter),
      Project.countDocuments({ ...projectFilter, status: 'active' }),
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'todo' }),
      Task.countDocuments({ ...taskFilter, status: 'in-progress' }),
      Task.countDocuments({ ...taskFilter, status: 'review' }),
      Task.countDocuments({ ...taskFilter, status: 'done' }),
      Task.countDocuments({ ...taskFilter, status: { $ne: 'done' }, dueDate: { $lt: now } }),
      Task.find({ assignedTo: req.user._id, status: { $ne: 'done' } })
        .populate('project', 'name color')
        .sort('dueDate')
        .limit(5),
    ]);

    // Recent tasks
    const recentTasks = await Task.find(taskFilter)
      .populate('assignedTo', 'name avatar')
      .populate('project', 'name color')
      .sort('-createdAt')
      .limit(8);

    res.json({
      success: true,
      stats: {
        totalProjects,
        activeProjects,
        totalTasks,
        todoCount,
        inProgressCount,
        reviewCount,
        doneCount,
        overdueCount,
      },
      myTasks,
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, getTask, updateTask, updateTaskStatus, deleteTask, addComment, getDashboardStats };
