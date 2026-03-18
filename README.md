# 🏫 Hostel Management System (HMS)

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Framework-Express.js-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/ORM-Sequelize-52B0E7?style=for-the-badge&logo=sequelize)](https://sequelize.org/)
[![Postgres](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

A comprehensive, professional web solution designed to digitize and streamline hostel operations. Built with modern technologies to deliver a seamless experience for both administrators and students.

---

## ✨ Features

### 🎓 Student Portal
- **Dashboard**: Real-time view of key metrics (payments, attendance, active notices).
- **Profile Management**: Update personal detail and upload profile pictures.
- **Payment History**: Track all fee payments and download automated receipts.
- **Complaint System**: Lodge grievances and track their resolution status.
- **Movement Tracking**: Record check-in/check-out logs for transparency.
- **Notice Board**: View important administrative announcements.
- **Document Vault**: Securely upload and store necessary identity/academic documents.

### 🛠️ Administrator Panel
- **Comprehensive Analytics**: Dashboard with occupancy rates, revenue trends, and operational stats.
- **Student Lifecycle**: Full CRUD operations for student records with automated email credential generation.
- **Room Inventory**: Manage room allocations, types (double/triple), capacity, and maintenance.
- **Financial Control**: Record offline payments, track dues, and monitor operational expenses.
- **Complaint Resolution**: Prioritize and resolve student issues with time-tracking.
- **Notice Publishing**: Create and manage targeted announcements for all or specific groups.
- **PDF Reporting**: Generate professional PDF reports for Finance, Occupancy, and Complaints using Puppeteer.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, TypeScript, Zustand (State Management), React Query (Data Fetching), Lucide icons.
- **Backend**: Node.js, Express, Sequelize (ORM), Multer (File Uploads), Puppeteer (PDF Generation), JWT (Authentication).
- **Database**: MySQL (compatible with PostgreSQL/Postgres via Sequelize).
- **Security**: Role-Based Access Control (RBAC), Password Hashing (Bcrypt), Rate Limiting.
- **DevOps**: Docker, Docker Compose, GitHub Actions (optional).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.x
- Docker & Docker Compose (optional for containerized setup)

### Option 1: Using Docker (Recommended)
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/hostel-management-system.git
   cd hostel-management-system
   ```
2. Run with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
3. The app will be available at `http://localhost:3000` (Frontend) and `http://localhost:5000` (Backend API).

### Option 2: Manual Installation

#### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (create `.env`):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_NAME=hostel_management
   DB_USER=root
   DB_PASS=yourpassword
   JWT_SECRET=your-secure-secret
   FRONTEND_URL=http://localhost:3000
   ```
4. Run migrations and seed data:
   ```bash
   npm run db:sync
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

#### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📸 Screenshots (Coming Soon)


---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📫 Contact
**Amal George**  
Project Link: [https://github.com/amg555/hostel-management-system](https://github.com/amg555/hostel-management-system)
Email: amgt503@gmail.com
