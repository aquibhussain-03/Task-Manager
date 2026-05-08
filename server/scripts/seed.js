require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Team = require('../models/Team');

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  // Clear existing data
  await User.deleteMany();
  await Project.deleteMany();
  await Task.deleteMany();
  await Team.deleteMany();

  // Create users
  const admin = await User.create({
    name: 'Alice Admin',
    email: 'admin@taskmanager.com',
    password: 'password123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  });

  const member1 = await User.create({
    name: 'Bob Smith',
    email: 'bob@taskmanager.com',
    password: 'password123',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  });

  const member2 = await User.create({
    name: 'Carol Jones',
    email: 'carol@taskmanager.com',
    password: 'password123',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
  });

  const member3 = await User.create({
    name: 'Dan Brown',
    email: 'dan@taskmanager.com',
    password: 'password123',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dan',
  });

  // Create projects
  const project1 = await Project.create({
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design.',
    owner: admin._id,
    members: [admin._id, member1._id, member2._id],
    status: 'active',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    color: '#6366f1',
  });

  const project2 = await Project.create({
    name: 'Mobile App v2.0',
    description: 'Next generation mobile application with new features.',
    owner: admin._id,
    members: [admin._id, member2._id, member3._id],
    status: 'active',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    color: '#ec4899',
  });

  const project3 = await Project.create({
    name: 'API Integration',
    description: 'Integrate third-party payment and analytics APIs.',
    owner: admin._id,
    members: [admin._id, member1._id, member3._id],
    status: 'active',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    color: '#10b981',
  });

  // Create Team records
  const teamEntries = [
    { project: project1._id, user: admin._id, role: 'owner' },
    { project: project1._id, user: member1._id, role: 'member' },
    { project: project1._id, user: member2._id, role: 'member' },
    { project: project2._id, user: admin._id, role: 'owner' },
    { project: project2._id, user: member2._id, role: 'member' },
    { project: project2._id, user: member3._id, role: 'member' },
    { project: project3._id, user: admin._id, role: 'owner' },
    { project: project3._id, user: member1._id, role: 'member' },
    { project: project3._id, user: member3._id, role: 'member' },
  ];
  await Team.insertMany(teamEntries);

  // Create tasks
  const tasks = [
    // Project 1
    { title: 'Design homepage mockup', project: project1._id, assignedTo: member1._id, createdBy: admin._id, status: 'done', priority: 'high', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), tags: ['design', 'ui'] },
    { title: 'Implement navigation menu', project: project1._id, assignedTo: member1._id, createdBy: admin._id, status: 'in-progress', priority: 'high', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), tags: ['frontend'] },
    { title: 'Set up CMS integration', project: project1._id, assignedTo: member2._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), tags: ['backend', 'cms'] },
    { title: 'Write content for About page', project: project1._id, assignedTo: member2._id, createdBy: admin._id, status: 'review', priority: 'low', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), tags: ['content'] },
    { title: 'Mobile responsive testing', project: project1._id, assignedTo: member1._id, createdBy: admin._id, status: 'todo', priority: 'critical', dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), tags: ['testing', 'mobile'] },
    // Project 2
    { title: 'User authentication flow', project: project2._id, assignedTo: member3._id, createdBy: admin._id, status: 'done', priority: 'critical', dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), tags: ['auth', 'security'] },
    { title: 'Push notifications setup', project: project2._id, assignedTo: member2._id, createdBy: admin._id, status: 'in-progress', priority: 'high', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), tags: ['notifications'] },
    { title: 'Dark mode implementation', project: project2._id, assignedTo: member3._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), tags: ['ui', 'theme'] },
    { title: 'Performance optimization', project: project2._id, assignedTo: member2._id, createdBy: admin._id, status: 'review', priority: 'high', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), tags: ['performance'] },
    // Project 3
    { title: 'Stripe payment integration', project: project3._id, assignedTo: member1._id, createdBy: admin._id, status: 'in-progress', priority: 'critical', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), tags: ['payment', 'stripe'] },
    { title: 'Analytics dashboard setup', project: project3._id, assignedTo: member3._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), tags: ['analytics'] },
    { title: 'API documentation', project: project3._id, assignedTo: member1._id, createdBy: admin._id, status: 'todo', priority: 'low', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), tags: ['docs'] },
  ];

  await Task.insertMany(tasks);

  console.log('✅ Seed complete!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin:   admin@taskmanager.com  / password123');
  console.log('  Member:  bob@taskmanager.com    / password123');
  console.log('  Member:  carol@taskmanager.com  / password123');
  console.log('  Member:  dan@taskmanager.com    / password123');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
