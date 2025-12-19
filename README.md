🧑‍🤝‍🧑 Collaborative Task Manager

A full-stack Collaborative Task Management application built with React + TypeScript, Node.js + Express, Prisma, PostgreSQL, and Socket.IO.
This project was developed as part of a Full-Stack Engineering Assessment.


---

🚀 Live Demo

Frontend: (add your deployed frontend URL here)

Backend API: (add your deployed backend URL here)



---

🧱 Tech Stack

Frontend

React (Vite)

TypeScript

Tailwind CSS

Axios

Socket.IO Client

Framer Motion


Backend

Node.js

Express

TypeScript

Prisma ORM

PostgreSQL

JWT Authentication

Socket.IO


Testing

Jest (Backend unit tests)



---

✨ Features

🔐 Authentication & Authorization

User registration & login

Password hashing with bcrypt

JWT-based authentication

Protected routes using middleware


🗂️ Task Management (CRUD)

Create, read, update, delete tasks

Task attributes:

Title

Description

Status (OPEN, IN_PROGRESS, COMPLETED)

Priority (LOW, MEDIUM, HIGH)

Due Date

Assigned User

Overdue detection (isOverdue)


Tasks scoped to logged-in user


⏰ Due Date & Overdue Logic

Tasks automatically marked as overdue when dueDate < now

isOverdue returned from backend API

Filter overdue tasks in dashboard


🔄 Real-Time Collaboration

Live task updates using Socket.IO

Real-time create / update / delete events

All connected users see updates instantly


📊 Dashboard

Task statistics (total, open, in progress, completed)

Filters by status & priority

Sorting by created date

Responsive UI (desktop & mobile)



---

🏗️ Project Structure

collaborative-task-manager/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── tests/
│   ├── .env
│   
│
├── frontend/
│   ├── src/
│   ├── public/
│   
│
└── README.md  ← (MAIN PROJECT README)


---

🔌 API Endpoints (Backend)

Auth

Method	Endpoint	Description

POST	/api/auth/register	Register user
POST	/api/auth/login	Login user


Tasks

Method	Endpoint	Description

POST	/api/tasks	Create task
GET	/api/tasks/my	Get user tasks
PUT	/api/tasks/:id	Update task
PATCH	/api/tasks/:id/status	Update status
DELETE	/api/tasks/:id	Delete task



---

🧪 Backend Tests

Implemented 3 unit tests using Jest

Tests cover:

Task creation

Task update

Overdue logic



Run tests:

cd backend
npm test


---

⚙️ Local Setup

1️⃣ Clone Repository

git clone <your-repo-url>
cd collaborative-task-manager


---

2️⃣ Backend Setup

cd backend
npm install

Create .env:

DATABASE_URL=postgresql://user:password@localhost:5432/taskdb
JWT_SECRET=your_secret_key

Run Prisma:

npx prisma migrate dev

Start backend:

npm run dev


---

3️⃣ Frontend Setup

cd frontend
npm install
npm run dev

Frontend runs at:

http://localhost:5173

Backend runs at:

http://localhost:5000


---

🧠 Architecture & Design Decisions

Clean Architecture

Controllers → Services → Prisma


DTO-style validation

JWT middleware for secure routes

Socket.IO integrated at server & client level

Prisma chosen for type safety & schema management



---

📌 Assumptions & Trade-offs

Single role (user)

Overdue logic computed at API response time

Optimistic UI updates handled via sockets

Tests focus on business logic, not e2e



---

📦 Deployment

Frontend deployed using Vercel / Netlify

Backend deployed using Render / Railway

PostgreSQL hosted on managed cloud DB



---

👤 Author

Pooja Kalukhe
Full-Stack Developer
