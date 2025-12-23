# MCD HRMS

A modern Human Resource Management System for the Municipal Corporation of Delhi. Built with **React**, **Vite**, and **Firebase**.

## Features

### For Employees
- View attendance stats, salary, and profile info
- Mark daily attendance
- Submit transfer requests
- File grievances and track status

### For HR Managers
- Access employee directory with search
- Mark attendance for staff
- View department analytics
- Permissions configurable by Admin

### For Administrators
- Complete system control
- Manage employee accounts (add, edit, delete)
- Configure HR permissions via Settings
- Track performance and payroll
- Real-time dashboard with stats

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

Open [http://localhost:5173](http://localhost:5173)

## Admin Access

1. Sign in to create your profile in Firestore
2. Go to **Firebase Console** → **Firestore Database**
3. Find `users` collection → locate your email
4. Change `role` from `"employee"` to `"admin"`
5. Refresh the app

## Demo Accounts

Admins can generate demo accounts via the **"Demo Data"** button.  
Password for all demo accounts: `demo123`

| Email            | Department |
|------------------|------------|
| raj@mcd.in       | IT         |
| sonia@mcd.in     | HR         |
| amit@mcd.in      | Finance    |
| priya@mcd.in     | IT         |
| vikram@mcd.in    | Admin      |

## Commands

| Command           | Description          |
|-------------------|----------------------|
| `npm run dev`     | Start dev server     |
| `npm run build`   | Build for production |
| `npm run preview` | Preview production   |

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy with one click

### Firebase Configuration
Update `src/firebase.js` with your Firebase project credentials.

## Tech Stack

- **Frontend**: React 18, Bootstrap 5
- **Build Tool**: Vite
- **Backend**: Firebase (Auth, Firestore)
- **Theme**: Modern Indian Government Design

## Team

- **Bhaskar & Smarth**: Frontend
- **Kuber & Smarth**: Backend
- **Kuber**: Design
- **Akshara**: Testing & QA