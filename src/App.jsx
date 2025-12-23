import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  login as firebaseLogin,
  logout as firebaseLogout,
  checkUser,
} from "./backend";

// Import all pages
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Transfers from "./pages/Transfers";
import Payroll from "./pages/Payroll";
import Performance from "./pages/Performance";
import Grievances from "./pages/Grievances";

import Settings from "./pages/Settings";

// Theme Colors
const THEME = {
  primary: "#1a237e", // Deep Navy Blue
  secondary: "#ff9933", // Saffron Orange
  success: "#138808", // India Green
  bg: "#f8f9fa", // Clean Off-White
  text: "#333333", // Dark Grey
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("employee");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = checkUser((currentUser, userRole) => {
      setUser(currentUser);
      setRole(userRole || "employee");
      setIsLoggedIn(!!currentUser);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Handle login form submit
  async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await firebaseLogin(email, password);
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
    }
  }

  // Handle logout
  async function handleLogout() {
    try {
      await firebaseLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Get tabs based on role
  function getTabs() {
    const tabs = [{ id: "dashboard", label: "Dashboard", icon: "dashboard" }];

    if (role === "admin" || role === "hr") {
      tabs.push({ id: "employees", label: "Employees", icon: "employees" });
      tabs.push({ id: "attendance", label: "Attendance", icon: "attendance" });
    } else {
      tabs.push({ id: "attendance", label: "My Attendance", icon: "attendance" });
    }

    // Payroll access
    if (role === "admin") {
      tabs.push({ id: "payroll", label: "Payroll", icon: "payroll" });
    } else {
      tabs.push({ id: "payroll", label: "My Salary", icon: "payroll" });
    }

    if (role === "admin") {
      tabs.push({ id: "performance", label: "Performance", icon: "performance" });
    }

    // Transfers & Grievances
    tabs.push({ id: "transfers", label: role === "admin" ? "Transfers" : "Transfer Request", icon: "transfers" });
    tabs.push({ id: "grievances", label: role === "admin" ? "Grievances" : "Submit Complaint", icon: "grievances" });

    // Settings (Admin Only)
    if (role === "admin") {
      tabs.push({ id: "settings", label: "Settings", icon: "settings" });
    }

    return tabs;
  }

  // Login Page with Govt Theme
  if (!isLoggedIn) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: THEME.primary }}>
        <div className="card p-5 shadow-lg border-0" style={{ maxWidth: "420px", borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
          <div className="text-center mb-4">
            {/* Simple Logo Placeholder */}
            <div className="mb-3 d-inline-block bg-light rounded-circle p-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={THEME.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <h3 className="fw-bold mb-1" style={{ color: THEME.primary }}>MCD HRMS</h3>
            <p className="text-muted small">Municipal Corporation of Delhi</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">EMAIL OR USERNAME</label>
              <input
                type="email"
                name="email"
                className="form-control form-control-lg bg-light border-0"
                placeholder="name@mcd.gov.in"
                required
                style={{ borderRadius: "5px" }}
              />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">PASSWORD</label>
              <input
                type="password"
                name="password"
                className="form-control form-control-lg bg-light border-0"
                placeholder="••••••••"
                required
                style={{ borderRadius: "5px" }}
              />
            </div>
            <button className="btn btn-lg w-100 fw-bold text-white shadow-sm" style={{ backgroundColor: THEME.secondary, borderRadius: "5px", letterSpacing: "1px" }}>
              SIGN IN
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="badge bg-light text-muted fw-normal px-3 py-2">
              Official Government Portal
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Main App with Govt Theme
  const tabs = getTabs();

  return (
    <div className="min-vh-100" style={{ backgroundColor: THEME.bg }}>
      {/* Top Header - Deep Blue */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm py-3" style={{ backgroundColor: THEME.primary }}>
        <div className="container px-4">
          <span className="navbar-brand d-flex align-items-center fw-bold">
            <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "35px", height: "35px" }}>
              <span className="fw-bold" style={{ color: THEME.primary }}>M</span>
            </div>
            <div>
              <div style={{ lineHeight: "1", fontSize: "1.2rem" }}>MCD HRMS</div>
              <div style={{ lineHeight: "1", fontSize: "0.65rem", opacity: 0.8, letterSpacing: "1px", textTransform: "uppercase" }}>Municipal Corporation of Delhi</div>
            </div>
          </span>
          <div className="d-flex align-items-center gap-4">
            <div className="text-end d-none d-md-block">
              <div className="text-white fw-medium small mb-0">{user?.email}</div>
              <div className="badge bg-white text-dark small" style={{ fontSize: "0.6rem", padding: "3px 8px" }}>
                {role === "admin" ? "ADMINISTRATOR" : role === "hr" ? "HR MANAGER" : "EMPLOYEE"}
              </div>
            </div>
            <button className="btn btn-outline-light btn-sm px-3" onClick={handleLogout} style={{ borderRadius: "20px" }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tab Navigation - Pill Style */}
      <div className="bg-white border-bottom shadow-sm sticky-top animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="container px-4 py-2">
          <div className="d-flex overflow-auto gap-2" style={{ scrollbarWidth: "none" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`btn px-4 py-2 rounded-pill fw-medium border-0 ${activeTab === tab.id ? "text-white shadow-sm" : "text-muted"}`}
                style={{
                  backgroundColor: activeTab === tab.id ? THEME.primary : "#f1f3f5",
                  transition: "all 0.2s ease"
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container px-3 px-md-4 py-4 py-md-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        {activeTab === "dashboard" && <Dashboard role={role} user={user} setTab={setActiveTab} />}
        {activeTab === "employees" && (role === "admin" || role === "hr") && <Employees role={role} user={user} />}
        {activeTab === "attendance" && <Attendance role={role} user={user} />}
        {activeTab === "payroll" && <Payroll role={role} user={user} />}
        {activeTab === "performance" && role === "admin" && <Performance role={role} />}
        {activeTab === "transfers" && <Transfers role={role} user={user} />}
        {activeTab === "grievances" && <Grievances role={role} user={user} />}
        {activeTab === "settings" && role === "admin" && <Settings />}
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-white" style={{ backgroundColor: "#263238" }}>
        <div className="container">
          <p className="mb-0 small opacity-75">© 2025 Municipal Corporation of Delhi • Government of India</p>
          <p className="mb-0 small opacity-50" style={{ fontSize: "0.7rem" }}>Designed & Developed for Internal Management</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
