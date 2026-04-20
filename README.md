# Vingroup HRM Web

A simple employee management web application with attendance tracking, leave requests, role-based dashboards, and system settings management.

## Repository

GitHub: <https://github.com/Hunghaohan25/vin_manage_web2>

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MySQL
- ORM: Sequelize
- Authentication: JWT
- File upload: Multer

## Main Features

- Login with JWT authentication
- Employee attendance check-in and check-out
- Attendance history and team attendance tracking
- Leave request creation and approval workflow
- Role-based access for employee, manager, and admin
- User management with avatar upload
- Attendance shift and lunch break settings

## Roles

### Employee

- View personal dashboard
- Check in and check out
- View attendance history
- Create leave requests

### Manager

- View manager dashboard
- View team attendance
- Approve or reject leave requests
- Manage employee accounts

### Admin

- View admin dashboard
- Manage all users
- Update attendance and shift settings

## Project Structure

```text
vin_manage_web2/
|-- backend/
|   |-- src/
|   |-- uploads/
|   |-- package.json
|-- frontend/
|   |-- src/
|   |-- public/
|   |-- package.json
|-- README.md
```

## Local Setup

### 1. Requirements

- Node.js 18 or newer
- MySQL 8 or newer
- npm

### 2. Backend setup

Move into the backend folder:

```powershell
cd backend
```

Install dependencies:

```powershell
npm install
```

Create a `.env` file in `backend/` with this content:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=vinhrm
JWT_SECRET=vinhrm_super_secret_key_2026
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@vingroup.net
ADMIN_PASSWORD=123456
CORS_ORIGIN=http://localhost:5173
```

Create the MySQL database:

```sql
CREATE DATABASE vinhrm;
```

Start the backend:

```powershell
npm run dev
```

### 3. Frontend setup

Open a new terminal, then move into the frontend folder:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Create a `.env` file in `frontend/` with this content:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```powershell
npm run dev
```

### 4. Open the app

Frontend URL:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:5000/api/health
```

## Default Admin Account

- Email: `admin@vingroup.net`
- Password: `123456`

## Notes

- `node_modules`, `dist`, and `.env` files are excluded from GitHub.
- The backend auto-seeds a default admin account when the server starts and the account does not already exist.
- Uploaded avatars are stored in `backend/uploads/avatars`.

## Submission Note

This repository was prepared for project submission on GitHub and includes both frontend and backend source code.
