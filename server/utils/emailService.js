const nodemailer = require('nodemailer');

// ── Transporter ────────────────────────────────────────────────────────────────
// Uses Gmail SMTP by default. Set EMAIL_HOST/PORT/USER/PASS in .env to switch
// providers (Outlook, SendGrid SMTP, Mailtrap for dev, etc.)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail: use an App Password, not your real password
    },
  });
};

// ── Shared HTML wrapper ────────────────────────────────────────────────────────
const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TaskFlow</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#13131a;border:1px solid #2a2a3d;border-radius:16px;overflow:hidden;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1,#ec4899);padding:28px 32px;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
        ⚡ TaskFlow
      </h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
        Team Task Manager
      </p>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid #2a2a3d;background:#0f0f18;">
      <p style="margin:0;font-size:12px;color:#4a5568;text-align:center;">
        You received this email because you're a member of TaskFlow.<br/>
        &copy; ${new Date().getFullYear()} TaskFlow. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

// ── Email Templates ────────────────────────────────────────────────────────────

/**
 * Task Assignment Notification
 */
const taskAssignedTemplate = ({ assigneeName, assignerName, taskTitle, taskDescription, projectName, priority, dueDate, taskUrl }) => ({
  subject: `📋 New task assigned to you: "${taskTitle}"`,
  html: emailWrapper(`
    <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:20px;">Hi ${assigneeName}! 👋</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
      <strong style="color:#f1f5f9;">${assignerName}</strong> assigned you a new task in 
      <strong style="color:#6366f1;">${projectName}</strong>.
    </p>

    <!-- Task Card -->
    <div style="background:#1c1c28;border:1px solid #2a2a3d;border-left:4px solid #6366f1;border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="margin:0 0 8px;color:#f1f5f9;font-size:17px;">${taskTitle}</h3>
      ${taskDescription ? `<p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.6;">${taskDescription}</p>` : ''}
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <span style="background:${priorityColor(priority)};color:#fff;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;">
          ${priority} priority
        </span>
        ${dueDate ? `
        <span style="background:#252535;color:#94a3b8;padding:3px 10px;border-radius:999px;font-size:12px;">
          📅 Due ${new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>` : ''}
        <span style="background:#252535;color:#94a3b8;padding:3px 10px;border-radius:999px;font-size:12px;">
          📁 ${projectName}
        </span>
      </div>
    </div>

    <a href="${taskUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:700;">
      View Task →
    </a>

    <p style="margin:24px 0 0;color:#4a5568;font-size:13px;">
      If the button doesn't work, copy this link: <a href="${taskUrl}" style="color:#6366f1;">${taskUrl}</a>
    </p>
  `),
});

/**
 * Due Soon Reminder
 */
const taskDueSoonTemplate = ({ assigneeName, taskTitle, projectName, dueDate, hoursLeft, taskUrl }) => ({
  subject: `⏰ Task due soon: "${taskTitle}"`,
  html: emailWrapper(`
    <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:20px;">Heads up, ${assigneeName}! ⏰</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
      A task assigned to you is due 
      <strong style="color:#f59e0b;">${hoursLeft <= 24 ? `in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}` : 'tomorrow'}</strong>.
    </p>

    <!-- Task Card -->
    <div style="background:#1c1c28;border:1px solid #2a2a3d;border-left:4px solid #f59e0b;border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="margin:0 0 8px;color:#f1f5f9;font-size:17px;">${taskTitle}</h3>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
        <span style="background:rgba(245,158,11,0.2);color:#f59e0b;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;">
          ⚠️ Due ${new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <span style="background:#252535;color:#94a3b8;padding:3px 10px;border-radius:999px;font-size:12px;">
          📁 ${projectName}
        </span>
      </div>
    </div>

    <a href="${taskUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:700;">
      Complete Task →
    </a>
  `),
});

/**
 * Overdue Alert
 */
const taskOverdueTemplate = ({ assigneeName, taskTitle, projectName, dueDate, taskUrl }) => ({
  subject: `🔴 Overdue task: "${taskTitle}"`,
  html: emailWrapper(`
    <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:20px;">Task Overdue, ${assigneeName}</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
      The following task in <strong style="color:#6366f1;">${projectName}</strong> is 
      <strong style="color:#ef4444;">past its due date</strong>.
    </p>

    <div style="background:#1c1c28;border:1px solid #2a2a3d;border-left:4px solid #ef4444;border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="margin:0 0 8px;color:#f1f5f9;font-size:17px;">${taskTitle}</h3>
      <span style="background:rgba(239,68,68,0.2);color:#ef4444;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;">
        🔴 Was due ${new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    </div>

    <a href="${taskUrl}" style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:700;">
      Update Task →
    </a>
  `),
});

// ── Helper: priority → colour ──────────────────────────────────────────────────
function priorityColor(priority) {
  const map = { critical: '#ef4444', high: '#f59e0b', medium: '#6366f1', low: '#64748b' };
  return map[priority] || '#6366f1';
}

// ── Main send function ─────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email not configured — skipping send. Add EMAIL_USER and EMAIL_PASS to .env');
    return;
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✉️  Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    // Non-fatal — log but don't crash the API
    console.error(`❌ Email failed to ${to}:`, err.message);
  }
};

// ── Exported helpers ───────────────────────────────────────────────────────────
const sendTaskAssignedEmail = async ({ assignee, assigner, task, project, appUrl }) => {
  const { subject, html } = taskAssignedTemplate({
    assigneeName: assignee.name,
    assignerName: assigner.name,
    taskTitle: task.title,
    taskDescription: task.description,
    projectName: project.name,
    priority: task.priority,
    dueDate: task.dueDate,
    taskUrl: `${appUrl}/tasks/${task._id}`,
  });
  await sendEmail({ to: assignee.email, subject, html });
};

const sendDueSoonEmail = async ({ assignee, task, project, hoursLeft, appUrl }) => {
  const { subject, html } = taskDueSoonTemplate({
    assigneeName: assignee.name,
    taskTitle: task.title,
    projectName: project.name,
    dueDate: task.dueDate,
    hoursLeft,
    taskUrl: `${appUrl}/tasks/${task._id}`,
  });
  await sendEmail({ to: assignee.email, subject, html });
};

const sendOverdueEmail = async ({ assignee, task, project, appUrl }) => {
  const { subject, html } = taskOverdueTemplate({
    assigneeName: assignee.name,
    taskTitle: task.title,
    projectName: project.name,
    dueDate: task.dueDate,
    taskUrl: `${appUrl}/tasks/${task._id}`,
  });
  await sendEmail({ to: assignee.email, subject, html });
};

module.exports = { sendEmail, sendTaskAssignedEmail, sendDueSoonEmail, sendOverdueEmail };
