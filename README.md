# MCD HRMS

A modern Human Resource Management System for the Municipal Corporation of Delhi.  
Built with **React**, **Vite**, and **Firebase**.

---

## Features

### For Employees
- **Dashboard**: View personal attendance stats, salary breakdown, and profile info.
- **Attendance**: Mark daily attendance with one click.
- **Transfers**: Submit transfer requests to your desired department.
- **Grievances**: File complaints and track their status.

### For HR Managers
- **Employee Directory**: View all staff members (with search).
- **Attendance Management**: Mark attendance for any employee.
- **Access Control**: Configurable permissions set by Admin.

### For Administrators
- **Full Control**: Access all modules including Payroll and Performance.
- **Employee Management**: Add, edit, and delete employee accounts.
- **Role Management**: Promote users to HR or Admin via the Settings page.
- **System Settings**: Toggle HR permissions (View Employees, Mark Attendance, Manage Payroll, etc.) with changes persisted to the database.

---

## Quick Start

### Prerequisites
- Node.js v18+
- npm

### Installation
```bash
git clone <repository-url>
cd mcd-hrms
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Setting Up Admin Access

1. **Sign in** to the app. This creates your user profile in Firestore.
2. Go to **Firebase Console** → **Firestore Database**.
3. Find the `users` collection and locate your email.
4. Change the `role` field from `"employee"` to `"admin"`.
5. Refresh the app to see Admin features.

---

## Demo Accounts

Admins can generate demo accounts by clicking the **"Demo Data"** button on the Employees page.  
All demo accounts use the password: `demo123`

| Email            | Role     |
|------------------|----------|
| raj@mcd.in       | Employee |
| sonia@mcd.in     | Employee |
| amit@mcd.in      | Employee |
| priya@mcd.in     | Employee |
| vikram@mcd.in    | Employee |

---

## Available Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start the Vite development server    |
| `npm run build`   | Build for production                 |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

---

## Tech Stack

- **Frontend**: React 18, Bootstrap 5
- **Build Tool**: Vite
- **Backend**: Firebase (Auth, Firestore)
- **Theme**: Modern Indian Government (Navy Blue & Saffron)

---

## Team

- **Bhaskar & Smarth**: Frontend
- **Kuber & Smarth**: Backend
- **Kuber**: Design
- **Akshara**: Testing & QA