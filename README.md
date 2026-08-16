# 🎯 Quizzly — Online Quiz & Assessment Platform

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com/)

**Quizzly** is a feature-rich, modern full-stack web platform designed for interactive quiz management, online tests, and real-time performance assessment. It features role-based access for Students and Admins, an intuitive quiz taking engine, instant scoring with detailed feedback, and visual analytics dashboards.

---

## ✨ Features

### 🎓 Student Portal
- **Category Browsing & Search**: Discover quizzes categorized by subjects and topics.
- **Interactive Quiz Engine**: Timed assessment interface, real-time question progress, answer toggling, and review drawer.
- **Instant Result Evaluation**: Comprehensive breakdown of correct/incorrect answers, score percentages, and detailed question reviews.
- **Performance Analytics**: Visual score graphs powered by Recharts, tracking past attempts and performance trends over time.

### 🛡️ Admin Portal
- **Category Management**: Create, update, and manage quiz categories dynamically.
- **Quiz Creator & Editor**: Build custom quizzes with custom durations, question weights, pass scores, and multiple-choice options.
- **User & Attempt Monitoring**: View overall platform usage, user attempt logs, and quiz statistics.

### 🔒 Security & Architecture
- **JWT Authentication**: Secure user login, session management, and password hashing (`bcryptjs`).
- **Role-Based Access Control (RBAC)**: Protected API endpoints and frontend route guards enforcing Student vs. Admin privileges.
- **PostgreSQL & Prisma ORM**: Relational schema powered by Prisma with Supabase PostgreSQL cloud integration.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom CSS
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts & Data Viz**: [Recharts](https://recharts.org/)
- **Routing & HTTP**: `react-router-dom` & `axios`

### Backend
- **Runtime & Server**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
- **Database & ORM**: [PostgreSQL (Supabase)](https://supabase.com/) + [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`

---

## 📁 Project Structure

```text
Quizzly/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schema definition
│   │   └── seed.js             # Initial database seed script
│   ├── src/
│   │   ├── controllers/        # Route controllers (Auth, Quiz, Category, Admin)
│   │   ├── middleware/         # Auth & Role verification middleware
│   │   ├── routes/             # API Express routers
│   │   └── server.js           # Express app entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components & Navbar
│   │   ├── context/            # Auth & State Contexts
│   │   ├── pages/              # Quiz, Student, and Admin pages
│   │   ├── services/           # Axios API Client configuration
│   │   ├── App.jsx             # Route setup & guards
│   │   └── main.jsx            # React root component
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

Follow these steps to set up and run Quizzly locally:

### 📋 Prerequisites
- **Node.js** (v18.x or higher)
- **npm** or **yarn**
- **PostgreSQL Database** (e.g. Supabase, ElephantSQL, or local PostgreSQL instance)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/4yush-raj/Quizzly.git
cd Quizzly
```

---

### 2️⃣ Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file inside the `backend` folder:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<dbname>?schema=public"
   DIRECT_URL="postgresql://<user>:<password>@<host>:5432/<dbname>?schema=public"
   JWT_SECRET="your_jwt_secret_key_here"
   ```

3. **Database Migration & Seeding**:
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Push Schema to Database
   npm run prisma:push

   # Seed Database with sample data
   npm run seed
   ```

4. **Start Backend Server**:
   ```bash
   npm run dev
   ```
   The backend API server will run at `http://localhost:5000`.

---

### 3️⃣ Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file inside the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🔑 Default Credentials (After Seeding)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@quizzly.com` | `admin123` |
| **Student** | `student@quizzly.com` | `student123` |

---

## 📝 Available Scripts

### Backend (`/backend`)
- `npm run dev` — Starts the Express server with Nodemon.
- `npm run start` — Starts the Express production server.
- `npm run prisma:generate` — Generates Prisma client types.
- `npm run prisma:push` — Synchronizes database schema with Prisma schema.
- `npm run seed` — Seeds the database with default categories, quizzes, and users.

### Frontend (`/frontend`)
- `npm run dev` — Starts Vite development server.
- `npm run build` — Builds the application for production.
- `npm run preview` — Previews the production build locally.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [Issues page](https://github.com/4yush-raj/Quizzly/issues).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
