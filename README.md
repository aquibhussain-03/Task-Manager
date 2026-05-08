# ⚡ TaskFlow — Team Task Manager

A full-stack MERN application for managing projects, assigning tasks, and tracking progress with role-based access control.

## 🚀 Live Demo
> [Live URL will be here after Railway deployment]

## 🛠 Tech Stack
- **Frontend:** React 18 + Vite, React Router v6, Recharts, Lucide Icons
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Deployment:** Railway (single service)

## 📋 Features
- ✅ JWT Authentication (Register / Login / Logout)
- ✅ Role-Based Access Control (Admin / Member)
- ✅ Project creation with color, deadline, member assignment
- ✅ Kanban board per project (To Do → In Progress → Review → Done)
- ✅ Task creation, assignment, priority, due date, tags
- ✅ Overdue task highlighting
- ✅ Dashboard with stats charts (Pie + Bar via Recharts)
- ✅ Task comments system
- ✅ Admin: user management, role toggle, delete
- ✅ Profile & password update

## 🔑 Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskmanager.com | password123 |
| Member | bob@taskmanager.com | password123 |
| Member | carol@taskmanager.com | password123 |

## ⚙️ Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier)

### 1. Clone & Install
```bash
git clone <your-repo-url>
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
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed Database (optional)
```bash
cd server
npm run seed
```

### 4. Run Development
```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

App runs at: http://localhost:5173

## 🚢 Railway Deployment

### Build & Deploy
```bash
# Build React client (outputs to server/public)
cd client && npm run build

# Push to GitHub, then connect to Railway
# Set environment variables in Railway dashboard:
# MONGO_URI, JWT_SECRET, JWT_EXPIRE, NODE_ENV=production, CLIENT_URL
```

### Environment Variables (Railway)
| Variable | Value |
|---|---|
| `PORT` | (Railway sets automatically) |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string |
| `JWT_EXPIRE` | `7d` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | Your Railway app URL |

## 📁 Project Structure
```
task-manager/
├── client/                  ← React (Vite)
│   └── src/
│       ├── api/             ← axiosInstance + API calls
│       ├── components/      ← Sidebar, Modal, Badge, Spinner, RouteGuards
│       ├── context/         ← AuthContext
│       ├── hooks/           ← useAuth
│       ├── pages/           ← Login, Register, Dashboard, Projects, Tasks, Users, Profile
│       └── utils/           ← helpers
└── server/                  ← Node/Express
    ├── config/db.js
    ├── controllers/         ← auth, project, task, user
    ├── middleware/          ← authMiddleware, roleMiddleware, errorMiddleware
    ├── models/              ← User, Project, Task, Team
    ├── routes/              ← auth, project, task, user
    ├── scripts/seed.js
    └── utils/generateToken.js
```

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
| POST | `/api/tasks` | Protected |
| GET | `/api/tasks/dashboard` | Protected |
| GET | `/api/tasks/:id` | Protected |
| PUT | `/api/tasks/:id` | Assigned/Admin |
| PATCH | `/api/tasks/:id/status` | Assigned/Admin |
| DELETE | `/api/tasks/:id` | Creator/Admin |
| POST | `/api/tasks/:id/comments` | Protected |
