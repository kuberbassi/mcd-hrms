import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  login as firebaseLogin,
  logout as firebaseLogout,
  checkUser,
} from "./backend";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Transfers from "./pages/Transfers";
import Payroll from "./pages/Payroll";
import Performance from "./pages/Performance";
import Grievances from "./pages/Grievances";
import Settings from "./pages/Settings";

import Tasks from "./pages/Tasks";
import JobPostings from "./pages/Recruitment/JobPostings";
import Applications from "./pages/Recruitment/Applications";
import Careers from "./pages/Recruitment/Careers";

const THEME = {
  primary: "#1a237e",
  secondary: "#ff9933",
  success: "#138808",
  bg: "#f8f9fa",
  text: "#333333",
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("employee");
  const [activeTab, setActiveTab] = useState("dashboard");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCareers, setShowCareers] = useState(false);

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

  async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await firebaseLogin(email, password);
    } catch (error) {
      // console.error("Login error:", error); // Suppress console error as requested
      let message = "Login failed. Please check your credentials.";
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        message = "Invalid email or password.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later.";
      }
      alert(message);
    }
  }

  async function handleLogout() {
    try {
      await firebaseLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // --- Navigation Logic ---

  function getTabs() {
    const tabs = [{ id: "dashboard", label: "Dashboard", icon: "🏠" }];

    // Core HR Functions
    if (role === "admin" || role === "hr") {
      tabs.push({ id: "employees", label: "Employees", icon: "👥" });
      tabs.push({ id: "attendance", label: "Attendance", icon: "✓" });
    } else {
      tabs.push({ id: "attendance", label: "My Attendance", icon: "✓" });
    }

    tabs.push({ id: "tasks", label: role === "admin" ? "Assign Tasks" : "My Tasks", icon: "📝" });

    // Group 1: Recruitment (Admin/HR)
    if (role === "admin" || role === "hr") {
      tabs.push({
        id: "recruitment",
        label: "Recruitment",
        icon: "📢",
        children: [
          { id: "jobs", label: "Job Postings", icon: "📢" },
          { id: "applications", label: "Applications", icon: "📥" }
        ]
      });
    }

    // Group 2: Workforce / Personal (Payroll & Performance)
    if (role === "admin") {
      tabs.push({
        id: "workforce",
        label: "Workforce",
        icon: "💼",
        children: [
          { id: "payroll", label: "Payroll", icon: "💰" },
          { id: "performance", label: "Performance", icon: "📊" }
        ]
      });
    } else {
      // For employees, keep them separate or group them as "My Records"
      tabs.push({ id: "payroll", label: "My Salary", icon: "💰" });
      tabs.push({ id: "performance", label: "My Performance", icon: "📊" });
    }

    // Group 3: Requests & Grievances
    tabs.push({
      id: "requests",
      label: "Requests",
      icon: "💬",
      children: [
        { id: "transfers", label: role === "admin" ? "Transfers" : "Transfer Request", icon: "📋" },
        { id: "grievances", label: role === "admin" ? "Grievances" : "Submit Complaint", icon: "⚠️" } // Changed icon
      ]
    });

    if (role === "admin") {
      tabs.push({ id: "settings", label: "Settings", icon: "⚙️" });
    }

    return tabs;
  }

  function switchTab(tabId) {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  }

  function renderPage() {
    switch (activeTab) {
      case "dashboard": return <Dashboard role={role} user={user} setTab={setActiveTab} />;
      case "employees": return <Employees role={role} user={user} />;
      case "attendance": return <Attendance role={role} user={user} />;
      case "tasks": return <Tasks role={role} user={user} />;
      case "payroll": return <Payroll role={role} user={user} />;
      case "transfers": return <Transfers role={role} user={user} />;
      case "performance": return <Performance role={role} user={user} />;
      case "grievances": return <Grievances role={role} user={user} />;
      case "settings": return <Settings />;
      case "jobs": return <JobPostings />;
      case "applications": return <Applications />;
      default: return <Dashboard role={role} user={user} setTab={setActiveTab} />;
    }
  }

  // Helper to check if a group is active
  const isGroupActive = (tab) => tab.children?.some(child => child.id === activeTab);

  if (showCareers) {
    return <Careers onBack={() => setShowCareers(false)} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: `linear-gradient(135deg, ${THEME.primary} 0%, #283593 100%)` }}>
        {/* Login Form Code (Unchanged) */}
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-11 col-sm-10 col-md-8 col-lg-5">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-body p-4 p-md-5">
                  <div className="text-center mb-4">
                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}>M</div>
                    <h4 className="fw-bold mb-1">MCD HRMS</h4>
                    <p className="text-muted small mb-0">Municipal Corporation of Delhi</p>
                  </div>
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Email</label>
                      <input type="email" name="email" className="form-control form-control-lg" placeholder="Enter your email" required />
                    </div>
                    <div className="mb-4">
                      <label className="form-label small fw-bold text-muted">Password</label>
                      <input type="password" name="password" className="form-control form-control-lg" placeholder="Enter password" required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold">Sign In</button>
                    <div className="text-center mt-3">
                      <button type="button" className="btn btn-link text-decoration-none" onClick={() => setShowCareers(true)}>
                        Looking for a job? View Careers
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = getTabs();

  // Desktop Dropdown Component
  const NavItem = ({ tab }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isActive = activeTab === tab.id || isGroupActive(tab);
    let timeoutId;

    const handleMouseEnter = () => {
      if (timeoutId) clearTimeout(timeoutId);
      setIsOpen(true);
    };

    const handleMouseLeave = () => {
      timeoutId = setTimeout(() => {
        setIsOpen(false);
      }, 300); // 300ms delay
    };

    if (tab.children) {
      return (
        <div
          className="position-relative d-inline-block"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={`btn px-4 py-2 rounded-pill fw-medium border-0 d-flex align-items-center gap-2 ${isActive ? "text-white shadow-sm" : "text-muted"}`}
            style={{
              backgroundColor: isActive ? THEME.primary : "#f1f3f5",
              transition: "all 0.2s ease"
            }}
          >
            {tab.label} <small>▼</small>
          </button>
          {isOpen && (
            <div
              className="position-absolute start-0 mt-1 bg-white shadow-lg rounded-3 border overflow-hidden"
              style={{ minWidth: "200px", zIndex: 1000 }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {tab.children.map(child => (
                <button
                  key={child.id}
                  className="dropdown-item p-3 d-flex align-items-center gap-2"
                  onClick={() => switchTab(child.id)}
                  style={{
                    backgroundColor: activeTab === child.id ? "#f8f9fa" : "white",
                    color: activeTab === child.id ? THEME.primary : "#333",
                    fontWeight: activeTab === child.id ? "bold" : "normal"
                  }}
                >
                  <span>{child.icon}</span>
                  <span>{child.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        className={`btn px-4 py-2 rounded-pill fw-medium border-0 ${isActive ? "text-white shadow-sm" : "text-muted"}`}
        style={{
          backgroundColor: isActive ? THEME.primary : "#f1f3f5",
          transition: "all 0.2s ease"
        }}
        onClick={() => switchTab(tab.id)}
      >
        {tab.label}
      </button>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: THEME.bg, paddingBottom: "80px" }}>
      {/* Mobile Top Bar */}
      <nav className="navbar navbar-dark shadow-sm sticky-top d-md-none" style={{ backgroundColor: THEME.primary }}>
        <div className="container-fluid px-3">
          <button className="btn btn-link text-white p-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <span className="navbar-brand mb-0 fw-bold">MCD HRMS</span>
          <button className="btn btn-sm btn-outline-light border-0" onClick={handleLogout}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none" style={{ zIndex: 1040 }} onClick={() => setMobileMenuOpen(false)}></div>
          <div className="position-fixed top-0 start-0 h-100 bg-white shadow-lg d-md-none" style={{ width: "280px", zIndex: 1050, overflowY: "auto" }}>
            <div className="p-4" style={{ backgroundColor: THEME.primary }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-white mb-0 fw-bold">Menu</h5>
                <button className="btn btn-link text-white p-0" onClick={() => setMobileMenuOpen(false)}>✕</button>
              </div>
              <div className="text-white-50 small">{user?.email}</div>
              <div className="badge bg-white text-primary mt-2">{role === "admin" ? "ADMIN" : role === "hr" ? "HR" : "EMPLOYEE"}</div>
            </div>
            <div className="list-group list-group-flush">
              {tabs.map((tab) => (
                tab.children ? (
                  <div key={tab.id} className="border-bottom">
                    <div className="px-3 py-2 bg-light text-muted small fw-bold text-uppercase">{tab.label}</div>
                    {tab.children.map(child => (
                      <button
                        key={child.id}
                        className={`list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${activeTab === child.id ? "active" : ""}`}
                        onClick={() => switchTab(child.id)}
                      >
                        <span className="me-3" style={{ fontSize: "1.2rem" }}>{child.icon}</span>
                        <span className="fw-medium">{child.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    key={tab.id}
                    className={`list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => switchTab(tab.id)}
                    style={{ backgroundColor: activeTab === tab.id ? THEME.primary : "transparent", color: activeTab === tab.id ? "white" : THEME.text }}
                  >
                    <span className="me-3" style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
                    <span className="fw-medium">{tab.label}</span>
                  </button>
                )
              ))}
            </div>
          </div>
        </>
      )}

      {/* Desktop Top Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm py-3 d-none d-md-flex" style={{ backgroundColor: THEME.primary }}>
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
            <div className="text-end">
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

      {/* Desktop Navigation Bar (Secondary) */}
      <div className="bg-white border-bottom shadow-sm sticky-top d-none d-md-block">
        <div className="container px-4 py-2">
          {/* Changed overflow-auto to allow dropdowns to spill over, or handle z-index carefully */}
          <div className="d-flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <NavItem key={tab.id} tab={tab} />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-3 px-md-4 py-3 py-md-5">
        {renderPage()}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-muted small mt-auto" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <p className="mb-0">© {new Date().getFullYear()} Municipal Corporation of Delhi. All rights reserved.</p>
      </footer>

      {/* Mobile Bottom Bar (Simplified - top 4 items only as shortcuts) */}
      <div className="fixed-bottom bg-white border-top shadow d-md-none" style={{ zIndex: 1000 }}>
        <div className="d-flex justify-content-around py-2">
          {tabs.slice(0, 4).map((tab) => (
            /* Simplify mobile bottom bar to only show direct links, ignore groups for simplicity or show first child */
            !tab.children ? (
              <button
                key={tab.id}
                className="btn btn-link text-decoration-none flex-fill p-2"
                onClick={() => switchTab(tab.id)}
                style={{
                  color: activeTab === tab.id ? THEME.primary : "#adb5bd",
                  borderBottom: activeTab === tab.id ? `3px solid ${THEME.primary}` : "3px solid transparent"
                }}
              >
                <div className="d-flex flex-column align-items-center">
                  <span style={{ fontSize: "1.3rem" }}>{tab.icon}</span>
                  <span style={{ fontSize: "0.65rem", marginTop: "2px" }}>{tab.label.split(" ")[0]}</span>
                </div>
              </button>
            ) : null
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;