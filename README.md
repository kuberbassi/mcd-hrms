# MCD HRMS

This is the Employee Management System we made for the Municipal Corporation of Delhi.

## What it does

- **Hiring**: We can post jobs and see who applied.
- **Employees**: Check attendance, salary, and details.
- **HR Work**: Add staff, mark attendance, and see reports.
- **Admin**: Control everything in the app.

## 🛠️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (Download the LTS version)
- A code editor like VS Code

### 2. Setup (for Beginners)
1. **Clone the project**:
   ```bash
   git clone <repository-url>
   cd mcd-hrms
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Create a file named `.env` in the project root.
   - Add your Firebase configuration keys (ask the project lead for these keys).

4. **Start the app**:
   ```bash
   npm run dev
   ```
   Open the link shown in the terminal (usually `http://localhost:5173`).

## How to Update

This app runs on **Firebase**.

To put new changes online:
1. Make the build folder:
   ```bash
   npm run build
   ```
2. Send it to Firebase:
   ```bash
   firebase deploy
   ```


## 🧪 Testing Credentials

Use these credentials to test different roles in the application.

### 🔑 Admin Access
- **Main Admin**: `admin@mcd.in`
  - **Password**: `12345678`
- **Office Manager (Admin)**: `vikram@mcd.in`
  - **Password**: `demo123`

### 👤 Employee Access
- **Developer**: `raj@mcd.in` (Password: `demo123`)
- **HR Manager**: `sonia@mcd.in` (Password: `demo123`)
- **Accountant**: `amit@mcd.in` (Password: `demo123`)

## 👥 Team
- **Smarth & Kuber**: Frontend Development
- **Kuber**: UI/UX, Backend & Documentation
- **Akshara & Bhaskar**: PPT, Testing, Improvements & Ideas