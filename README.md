# ⚡ TaskFlow — Team Task Manager

A full-stack MERN application for managing projects, assigning tasks, and tracking progress with role-based access control.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green)
![Deployed on Railway](https://img.shields.io/badge/deployed%20on-Railway-purple)

---

## 🚀 Live Demo

> **[https://chic-forgiveness-production.up.railway.app](https://chic-forgiveness-production.up.railway.app)**

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, React Router v6, Recharts, Lucide Icons |
| **Drag & Drop** | @hello-pangea/dnd (Kanban board) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | JWT (jsonwebtoken) + bcryptjs + httpOnly cookies |
| **Security** | Helmet, express-rate-limit, express-validator |
| **Email** | Nodemailer + Gmail SMTP (task assignment & due-soon reminders) |
| **Scheduler** | node-cron (hourly due-soon & overdue alerts) |
| **Deployment** | Railway (single service — Express serves React build) |

---

## 📋 Features

### 🔐 Authentication & Security
- ✅ JWT Authentication (Register / Login / Logout)
- ✅ Role-Based Access Control (Admin / Member)
- ✅ Helmet security headers on every response
- ✅ Rate limiting — 15 attempts / 15 min on auth, 100 req/min on API
- ✅ Input validation via `express-validator` on all auth routes
- ✅ Global error handler (CastError, duplicate key, JWT errors)

### 📁 Projects
- ✅ Admin: create projects with color, deadline, description
- ✅ Admin: add / manage team members
- ✅ Admin: delete projects (cascades tasks)
- ✅ Progress bar per project based on task completion

### ✅ Tasks
- ✅ Create tasks with title, description, priority, due date, tags
- ✅ **Drag & Drop Kanban board** (To Do → In Progress → Review → Done)
- ✅ **"Move to..." dropdown button** as a fallback for mobile / non-drag
- ✅ Optimistic UI updates on drag — instant feedback, rollback on failure
- ✅ Overdue task highlighting (red border + ⚠️ badge)
- ✅ Task comments system
- ✅ Task detail page (edit, delete, sidebar metadata)

### 📊 Dashboard
- ✅ Stats cards (total projects, tasks, overdue count)
- ✅ Pie chart — task status breakdown
- ✅ Bar chart — tasks per project
- ✅ My Tasks list (sorted by due date)
- ✅ Recent activity feed

### 📧 Email Notifications
- ✅ **Task assigned** — email sent to assignee when a task is created
- ✅ **Due soon** — hourly cron checks for tasks due within 24 hours
- ✅ **Overdue alert** — hourly cron notifies when a task passes its deadline
- ✅ Branded HTML email templates (dark theme, responsive)
- ✅ Non-blocking — emails fire via `setImmediate` so API never slows down

### 👥 User Management (Admin)
- ✅ View all users, toggle roles (Admin ↔ Member)
- ✅ Delete users
- ✅ Profile & password update

---

## 📊 RBAC Matrix

| Action | Admin | Member |
|---|---|---|
| Create project | ✅ | ❌ |
| Add members to project | ✅ | ❌ |
| Delete project | ✅ | ❌ |
| Create task | ✅ | ✅ (own projects only) |
| Assign task to anyone | ✅ | ❌ |
| Assign task to self | ✅ | ✅ |
| Update task details | ✅ | ✅ (assigned tasks only) |
| Move task status (kanban) | ✅ | ✅ (project members) |
| Delete task | ✅ | ✅ (own tasks only) |
| Add comment | ✅ | ✅ |
| Manage users / roles | ✅ | ❌ |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskmanager.com | password123 |
| Member | bob@taskmanager.com | password123 |
| Member | carol@taskmanager.com | password123 |

> Use `npm run seed` from the `server/` folder to populate these accounts.

---

## ⚙️ Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier)

### 1. Clone & Install
```bash
git clone https://github.com/aquibhussain-03/Task-Manager.git
cd task-manager

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment
```bash
cd server
cp .env.example .env
# Edit .env — fill in MONGO_URI, JWT_SECRET, and optionally EMAIL_USER/PASS
```

**.env variables:**
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
APP_URL=http://localhost:5173

# Optional — Gmail SMTP for email notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### 3. Seed Database (optional)
```bash
cd server
npm run seed
```

### 4. Run Development
```bash
# Terminal 1 — Server (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Client (http://localhost:5173)
cd client && npm run dev
```

---

## 🚢 Railway Deployment

### How it works
`railway.toml` at the repo root tells Railway to:
1. Install deps for both `server/` and `client/`
2. Build the React app (output → `server/public/`)
3. Start the Express server which serves the built frontend

```toml
[build]
buildCommand = "npm install --prefix server && npm install --prefix client && npm run build --prefix client"

[deploy]
startCommand = "node server/server.js"
```

### Environment Variables (set in Railway dashboard)
| Variable | Value |
|---|---|
| `PORT` | Set automatically by Railway |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string |
| `JWT_EXPIRE` | `7d` |
| `CLIENT_URL` | Your Railway app URL |
| `APP_URL` | Your Railway app URL |
| `EMAIL_USER` | Gmail address (optional) |
| `EMAIL_PASS` | Gmail App Password (optional) |

> **Gmail App Password:** Google Account → Security → 2-Step Verification → App Passwords → Generate

---

## 📁 Project Structure

```
task-manager/
├── railway.toml             ← Railway build + deploy config
├── client/                  ← React (Vite)
│   └── src/
│       ├── api/             ← axiosInstance + typed API calls
│       ├── components/      ← Sidebar, Modal, Badge, Spinner, RouteGuards
│       ├── context/         ← AuthContext (user, isAdmin, login, logout)
│       ├── pages/           ← Login, Register, Dashboard, Projects, ProjectDetail, Tasks, TaskDetail, Users, Profile
│       └── utils/           ← helpers (fmtDate, isOverdue, getInitials, ...)
└── server/                  ← Node/Express
    ├── config/db.js
    ├── controllers/         ← auth, project, task, user
    ├── middleware/
    │   ├── authMiddleware.js    ← verifyToken (JWT)
    │   ├── roleMiddleware.js    ← authorizeRole, isProjectMember, canAssignTask
    │   ├── validate.js          ← express-validator factory
    │   └── errorMiddleware.js   ← notFound + global errorHandler
    ├── models/              ← User, Project, Task
    ├── routes/              ← auth, project, task, user
    ├── scripts/seed.js      ← demo data seeder
    └── utils/
        ├── emailService.js      ← Nodemailer + HTML email templates
        ├── taskReminder.js      ← node-cron hourly job
        └── generateToken.js
```

---

## 📝 API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Protected |
| GET | `/api/auth/me` | Protected |

### Projects
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/projects` | Protected |
| POST | `/api/projects` | Admin |
| GET | `/api/projects/:id` | Member |
| PUT | `/api/projects/:id` | Admin |
| DELETE | `/api/projects/:id` | Admin |
| POST | `/api/projects/:id/members` | Admin |

### Tasks
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/tasks` | Protected |
| POST | `/api/tasks` | Project member |
| GET | `/api/tasks/dashboard` | Protected |
| GET | `/api/tasks/:id` | Protected |
| PUT | `/api/tasks/:id` | Assigned / Admin |
| PATCH | `/api/tasks/:id/status` | Project member / Admin |
| DELETE | `/api/tasks/:id` | Creator / Admin |
| POST | `/api/tasks/:id/comments` | Protected |

### Users
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users` | Admin |
| PUT | `/api/users/:id/role` | Admin |
| DELETE | `/api/users/:id` | Admin |
| GET | `/api/users/profile` | Protected |
| PUT | `/api/users/profile` | Protected |

---

## 📸 Screenshots

> Kanban Board with drag & drop, project overview, dashboard stats, and email notifications.

---

## 📄 License

MIT © 2026 Aquib Hussain
