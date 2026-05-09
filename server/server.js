require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { startTaskReminderJob } = require('./utils/taskReminder');

// Connect to DB then start background jobs
connectDB().then(() => startTaskReminderJob());

const app = express();

// Middleware
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting — brute-force protection on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,                  // max 15 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again in 15 minutes.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 100,                 // general API cap
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
});

// API Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api', apiLimiter);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running 🚀', env: process.env.NODE_ENV });
});

// Serve React build — works in production (Railway) AND when public/ exists locally
// This runs regardless of NODE_ENV so Railway doesn't need the env var to be set
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Catch-all: serve index.html for any non-API route (React SPA routing)
app.get('*', (req, res, next) => {
  // If the request is for an API route, fall through to the 404 handler
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(publicPath, 'index.html');
  // Only send index.html if the build exists; otherwise show a dev-friendly message
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).json({
        success: true,
        message: '⚡ TaskFlow API is running.',
        hint: 'Build the React client and copy to server/public to serve the frontend.',
      });
    }
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
