const cron = require('node-cron');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { sendDueSoonEmail, sendOverdueEmail } = require('./emailService');

const APP_URL = process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Check for tasks due within 24 hours and tasks that just became overdue.
 * Runs every hour. Fires emails to the assigned user.
 *
 * Cron expression: '0 * * * *' = top of every hour
 */
const startTaskReminderJob = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER/PASS not set — task reminder cron will not send emails.');
  }

  cron.schedule('0 * * * *', async () => {
    console.log('🕐 Running task reminder cron...');
    try {
      const now = new Date();

      // ── Due Soon (tasks due within next 24 hours, not yet done) ───────────
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const dueSoonTasks = await Task.find({
        status: { $ne: 'done' },
        dueDate: { $gt: now, $lte: in24h },
        assignedTo: { $ne: null },
      })
        .populate('assignedTo', 'name email')
        .populate('project', 'name');

      for (const task of dueSoonTasks) {
        const hoursLeft = Math.ceil((new Date(task.dueDate) - now) / (1000 * 60 * 60));
        await sendDueSoonEmail({
          assignee: task.assignedTo,
          task,
          project: task.project,
          hoursLeft,
          appUrl: APP_URL,
        });
      }

      if (dueSoonTasks.length) {
        console.log(`✉️  Sent ${dueSoonTasks.length} due-soon reminder(s)`);
      }

      // ── Overdue (tasks whose dueDate just passed in the last hour) ─────────
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const overdueTasks = await Task.find({
        status: { $ne: 'done' },
        dueDate: { $gt: oneHourAgo, $lte: now },
        assignedTo: { $ne: null },
      })
        .populate('assignedTo', 'name email')
        .populate('project', 'name');

      for (const task of overdueTasks) {
        await sendOverdueEmail({
          assignee: task.assignedTo,
          task,
          project: task.project,
          appUrl: APP_URL,
        });
      }

      if (overdueTasks.length) {
        console.log(`🔴 Sent ${overdueTasks.length} overdue alert(s)`);
      }
    } catch (err) {
      console.error('❌ Task reminder cron error:', err.message);
    }
  });

  console.log('⏰ Task reminder cron scheduled (every hour)');
};

module.exports = { startTaskReminderJob };
