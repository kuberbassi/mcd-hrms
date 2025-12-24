# MCD HRMS

A modern Employee Management System built for the Municipal Corporation of Delhi.

## 🚀 Features

- **Employee Dashboard**: View attendance, salary, and profile.
- **HR Tools**: Manage employees, mark attendance, and view analytics.
- **Admin Control**: Full system access and configuration.

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

## ☁️ Deployment

This project is deployed on **Firebase**.

To deploy updates:
1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy to Firebase:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy
   ```

## 👥 Team
- **Bhaskar & Smarth**: Frontend
- **Kuber & Smarth**: Backend
- **Kuber**: Design
- **Akshara**: Testing & QA