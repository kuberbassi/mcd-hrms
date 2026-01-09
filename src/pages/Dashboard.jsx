import { useState, useEffect } from "react";
import { showStaff, getAttendanceForEmployee, getMyPayroll, getMyProfile } from "../backend";
import { seedDatabase } from "../utils/SeedData";

const THEME = {
    primary: "#1a237e",
    secondary: "#ff9933",
    success: "#138808",
    danger: "#d32f2f",
    warning: "#fbc02d",
};

function Dashboard({ role, user, setTab }) {
    const [stats, setStats] = useState({
        total: 0,
        departments: {},
    });
    const [myAttendance, setMyAttendance] = useState({ present: 0, absent: 0, leave: 0 });
    const [mySalary, setMySalary] = useState(null);
    const [myProfile, setMyProfile] = useState(null);
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        if (role === "admin" || role === "hr") {
            const unsubscribe = showStaff((list) => {
                const deptCount = {};
                list.forEach((emp) => {
                    const dept = emp.dept || "Unknown";
                    deptCount[dept] = (deptCount[dept] || 0) + 1;
                });
                setStats({
                    total: list.length,
                    departments: deptCount,
                });
            });
            return () => {
                if (typeof unsubscribe === "function") unsubscribe();
            };
        }
    }, [role]);

    useEffect(() => {
        if (user) {
            // Load personal data for EVERYONE (Admin needs it for "My Personal Record", Employee needs it for dashboard)
            loadMyData();
        }
    }, [user]);

    async function loadMyData() {
        // Parallel fetch for better performance
        const [attData, payData, profileData] = await Promise.all([
            getAttendanceForEmployee(user.email),
            getMyPayroll(user.email),
            getMyProfile(user.email)
        ]);
        setMyAttendance(attData);
        setMySalary(payData);
        setMyProfile(profileData);
    }

    // Admin & HR Dashboard - Premium Redesign
    if (role === "admin" || role === "hr") {
        return (
            <div className="animate-fade-in">
                {/* Welcome Banner */}
                <div className="rounded-4 p-4 p-md-5 mb-4 mb-md-5 text-white position-relative overflow-hidden shadow-sm animate-slide-up" style={{ backgroundColor: role === "admin" ? "#263238" : THEME.secondary, animationDelay: "0.1s" }}>
                    <div className="position-absolute end-0 top-0 h-100" style={{ width: "250px", background: `linear-gradient(135deg, transparent 40%, #000 20%)`, opacity: 0.1 }}></div>
                    <div className="position-absolute start-0 bottom-0 mb-n5 ms-n5 rounded-circle bg-white" style={{ width: "200px", height: "200px", opacity: 0.1 }}></div>

                    <div className="position-relative z-1">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase ls-2 mb-2 opacity-75 fw-bold" style={{ fontSize: "0.8rem" }}>{role === "admin" ? "Administrative Control Center" : "Management Portal"}</h6>
                                <h1 className="display-5 fw-bold mb-1">{role === "admin" ? "Workforce Accountability Platform" : "HR Manager Dashboard"}</h1>
                                <p className="mb-0 opacity-75">Real-time visibility into workforce presence, deployment, and accountability across MCD.</p>
                            </div>
                            <div className="d-none d-md-block text-end">
                                <div className="display-4 fw-bold">{stats.total}</div>
                                <div className="small text-uppercase ls-1 opacity-75">Active Staff</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mb-4">
                    {/* Key Metrics */}
                    <div className="col-md-8">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-scale animate-slide-up" style={{ animationDelay: "0.2s" }}>
                                    <div className="card-body p-4 position-relative d-flex flex-column justify-content-between">
                                        <div className="position-absolute top-0 end-0 p-3 opacity-10">
                                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        </div>
                                        <div>
                                            <h6 className="text-muted text-uppercase fw-bold small ls-1 mb-3">Workforce</h6>
                                            <h2 className="display-4 fw-bold text-dark mb-0">{stats.total}</h2>
                                        </div>
                                        <div className="d-flex align-items-center mt-3">
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 small">● System Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-scale animate-slide-up" style={{ animationDelay: "0.3s" }}>
                                    <div className="card-body p-4 position-relative d-flex flex-column justify-content-between">
                                        <div className="position-absolute top-0 end-0 p-3 opacity-10">
                                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-warning"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                        </div>
                                        <div>
                                            <h6 className="text-muted text-uppercase fw-bold small ls-1 mb-3">Departments</h6>
                                            <h2 className="display-4 fw-bold text-dark mb-0">{Object.keys(stats.departments).length}</h2>
                                        </div>
                                        <div className="mt-3 small text-muted">
                                            Most active: <span className="fw-bold text-dark">{Object.entries(stats.departments).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* NEW GIDGETS FOR GOVERNANCE */}
                            <div className="col-md-4">
                                <div className="card h-100 border-0 shadow-sm rounded-4 bg-danger bg-opacity-10 animate-slide-up" style={{ animationDelay: "0.35s" }}>
                                    <div className="card-body p-3">
                                        <h6 className="fw-bold text-danger text-uppercase small ls-1 mb-2">Attendance Anomalies</h6>
                                        <div className="display-6 fw-bold text-danger">12</div>
                                        <small className="text-muted">High value for today</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card h-100 border-0 shadow-sm rounded-4 bg-warning bg-opacity-10 animate-slide-up" style={{ animationDelay: "0.36s" }}>
                                    <div className="card-body p-3">
                                        <h6 className="fw-bold text-warning text-uppercase small ls-1 mb-2">Pending Grievances</h6>
                                        <div className="display-6 fw-bold text-warning text-dark">5</div>
                                        <small className="text-muted">{">"} 7 days pending</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card h-100 border-0 shadow-sm rounded-4 bg-info bg-opacity-10 animate-slide-up" style={{ animationDelay: "0.37s" }}>
                                    <div className="card-body p-3">
                                        <h6 className="fw-bold text-info text-dark text-uppercase small ls-1 mb-2">Under-deployed</h6>
                                        <div className="display-6 fw-bold text-info text-dark">2</div>
                                        <small className="text-muted">Departments below 60%</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <small className="text-muted fst-italic">* Designed to help administrators identify workforce and governance issues at a glance.</small>
                            </div>

                            {/* Department Breakdown Bar */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm rounded-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                                    <div className="card-header bg-white border-0 py-3">
                                        <h6 className="fw-bold mb-0">Department Distribution</h6>
                                    </div>
                                    <div className="card-body pt-0">
                                        <div className="row g-2">
                                            {Object.entries(stats.departments).map(([dept, count], index) => (
                                                <div key={dept} className="col-6 col-md-3">
                                                    <div className="p-3 bg-light rounded-3 h-100 d-flex flex-column justify-content-between">
                                                        <div className="fw-bold text-dark mb-1">{dept}</div>
                                                        <div className="d-flex align-items-end justify-content-between">
                                                            <div className="display-6 fw-bold text-primary" style={{ fontSize: "1.5rem" }}>{count}</div>
                                                            <div className="small text-muted">Staff</div>
                                                        </div>
                                                        <div className="progress mt-2" style={{ height: "4px" }}>
                                                            <div className="progress-bar" style={{ width: `${(count / stats.total) * 100}%`, backgroundColor: Object.values(THEME)[index % 4] }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm rounded-4 bg-primary text-white position-relative overflow-hidden animate-slide-up" style={{ backgroundColor: THEME.primary, animationDelay: "0.5s" }}>
                            {/* Decor */}
                            <div className="position-absolute top-0 end-0 p-5 rounded-circle bg-white me-n5 mt-n5" style={{ width: "200px", height: "200px", opacity: 0.1 }}></div>

                            <div className="card-body p-4 d-flex flex-column position-relative z-1">
                                <div className="mb-4">
                                    <h5 className="fw-bold">Administrative Console</h5>
                                    <p className="opacity-75 small">Manage system resources, personnel access, and global settings from here.</p>

                                    <div className="mt-4 pt-4 border-top border-white border-opacity-25 flex-grow-1 d-flex flex-column justify-content-end">
                                        {/* My Personal Record (Hybrid View) */}
                                        <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-3">
                                            <h6 className="text-uppercase small fw-bold opacity-75 ls-1 mb-2">My Personal Record</h6>
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className="small opacity-75">My Salary:</span>
                                                <span className="fw-bold">₹{mySalary ? (mySalary.total || 0).toLocaleString() : "..."}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="small opacity-75">Performance:</span>
                                                <span className="badge bg-success bg-opacity-25 text-white">Example Rating</span>
                                            </div>
                                        </div>
                                        <h6 className="text-uppercase small fw-bold opacity-75 ls-1 mb-3">System Activity Log</h6>
                                        <div className="d-flex flex-column gap-2 small opacity-75 font-monospace">
                                            <div><span className="text-success">●</span> 09:45 AM - Database Backup Complete</div>
                                            <div><span className="text-info">●</span> 10:12 AM - New Patch Deployed (v2.4)</div>
                                            <div><span className="text-warning">●</span> 11:30 AM - Server Load: Normal</div>
                                            <div><span className="text-white">●</span> 12:15 PM - Payroll Sync Initiated</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-grid gap-3 mt-auto">
                                    <button
                                        className="btn btn-light fw-bold py-3 text-start px-4 rounded-3 shadow-sm d-flex align-items-center justify-content-between btn-hover-effect"
                                        onClick={() => setTab("employees")}
                                    >
                                        <span>Manage Employees</span>
                                        <span>→</span>
                                    </button>

                                    {role === "admin" && (
                                        <button
                                            className="btn btn-light fw-bold py-3 text-start px-4 rounded-3 shadow-sm d-flex align-items-center justify-content-between btn-hover-effect"
                                            style={{ background: "rgba(255,255,255,0.9)" }}
                                            onClick={() => setTab("settings")}
                                        >
                                            <span>System Settings</span>
                                            <span>→</span>
                                        </button>
                                    )}

                                    <div className="p-3 rounded-3 bg-black bg-opacity-25 mt-2">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="bg-success rounded-circle p-1 me-2" style={{ width: "8px", height: "8px" }}></div>
                                            <small className="fw-bold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>System Status</small>
                                        </div>
                                        <div className="small opacity-75">All systems operational. End-to-end encryption active.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Governance Impact Section (Static Pitch Slide) */}
                <div className="card border-0 shadow-sm rounded-4 text-white mb-4 animate-slide-up" style={{ backgroundColor: "#263238", animationDelay: "0.6s" }}>
                    <div className="card-body p-5">
                        <div className="d-flex align-items-center mb-4">
                            <div className="p-2 bg-white bg-opacity-10 rounded-3 me-3">
                                <span className="fs-3">🏛️</span>
                            </div>
                            <div>
                                <h5 className="fw-bold mb-1 ls-1 text-uppercase small opacity-75">Platform Impact</h5>
                                <h3 className="fw-bold mb-0">Governance Enhancement Matrix</h3>
                            </div>
                        </div>

                        <div className="row g-4">
                            <div className="col-md-4">
                                <div className="d-flex align-items-start p-3 rounded-3 h-100" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                                    <div className="bg-success bg-opacity-25 rounded-circle p-2 me-3 fs-5 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>✔️</div>
                                    <div>
                                        <div className="fw-bold mb-1">Workforce Accountability</div>
                                        <div className="small opacity-75">Real-time attendance & presence tracking</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="d-flex align-items-start p-3 rounded-3 h-100" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                                    <div className="bg-info bg-opacity-25 rounded-circle p-2 me-3 fs-5 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>👁️</div>
                                    <div>
                                        <div className="fw-bold mb-1">Ward-Level Transparency</div>
                                        <div className="small opacity-75">Granular visibility into field operations</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="d-flex align-items-start p-3 rounded-3 h-100" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                                    <div className="bg-warning bg-opacity-25 rounded-circle p-2 me-3 fs-5 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>⚖️</div>
                                    <div>
                                        <div className="fw-bold mb-1">Dispute Reduction</div>
                                        <div className="small opacity-75">Data-backed payroll processing</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="d-flex align-items-start p-3 rounded-3 h-100" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                                    <div className="bg-danger bg-opacity-25 rounded-circle p-2 me-3 fs-5 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>⚡</div>
                                    <div>
                                        <div className="fw-bold mb-1">Rapid Grievance Redressal</div>
                                        <div className="small opacity-75">SLA-based tracking of employee requests</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="d-flex align-items-start p-3 rounded-3 h-100" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                                    <div className="bg-primary bg-opacity-25 rounded-circle p-2 me-3 fs-5 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>📊</div>
                                    <div>
                                        <div className="fw-bold mb-1">Data-Driven Decisions</div>
                                        <div className="small opacity-75">Deployment analytics & optimization</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="d-flex align-items-start p-3 rounded-3 h-100" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                                    <div className="bg-secondary bg-opacity-25 rounded-circle p-2 me-3 fs-5 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>🔒</div>
                                    <div>
                                        <div className="fw-bold mb-1">Secure & Audit-Ready</div>
                                        <div className="small opacity-75">Role-based access & immutable logs</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Employee Dashboard - Modern Govt Style
    return (
        <div>
            {/* Welcome Banner - Clean & Official */}
            <div className="rounded-4 p-5 mb-5 text-white position-relative overflow-hidden shadow-sm" style={{ backgroundColor: THEME.primary }}>
                {/* Abstract Saffron Decor */}
                <div className="position-absolute end-0 top-0 h-100" style={{ width: "200px", background: `linear-gradient(45deg, transparent 50%, ${THEME.secondary} 50%)`, opacity: 0.9 }}></div>

                <div className="position-relative z-1 row align-items-center">
                    <div className="col-md-8">
                        <p className="mb-2 opacity-75 small text-uppercase ls-2 fw-bold">Official Dashboard</p>
                        <h1 className="fw-bold mb-2 display-5">Welcome, {user?.email?.split("@")[0]}</h1>
                        <p className="mb-0 opacity-75">Municipal Corporation of Delhi • Government of India</p>
                    </div>
                    <div className="col-md-4 text-md-end mt-4 mt-md-0">
                        <div className="d-inline-block bg-white bg-opacity-10 px-4 py-3 rounded-3 text-end backdrop-blur">
                            <div className="small opacity-75 text-uppercase fw-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
                            <div className="fw-bold fs-4">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Main Content - Financials (New Feature) */}
                <div className="col-md-5">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0 text-secondary text-uppercase small ls-1">Financial Overview</h6>
                            {mySalary && <span className="badge bg-success bg-opacity-10 text-success">Verified</span>}
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center">
                            {!mySalary ? (
                                <div className="text-center py-5">
                                    <div className="d-inline-block p-4 rounded-circle bg-light mb-3">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </div>
                                    <h6 className="text-muted fw-bold">Fetching latest salary details...</h6>
                                    <p className="small text-muted mb-0">Securely retrieving from payroll servers</p>
                                </div>
                            ) : (
                                <div className="text-center py-2">
                                    <div className="small text-muted mb-1 text-uppercase fw-bold">Total Monthly Salary</div>
                                    <h1 className="display-4 fw-bold text-dark mb-3">₹{(mySalary.basic + mySalary.da + mySalary.hra).toLocaleString()}</h1>

                                    <div className="row g-0 mt-4 rounded-3 bg-light overflow-hidden">
                                        <div className="col-4 border-end border-white py-3">
                                            <div className="small text-muted fw-bold" style={{ fontSize: "0.7rem" }}>BASIC</div>
                                            <div className="fw-bold text-primary">₹{mySalary.basic.toLocaleString()}</div>
                                        </div>
                                        <div className="col-4 border-end border-white py-3">
                                            <div className="small text-muted fw-bold" style={{ fontSize: "0.7rem" }}>DA</div>
                                            <div className="fw-bold text-primary">₹{mySalary.da.toLocaleString()}</div>
                                        </div>
                                        <div className="col-4 py-3">
                                            <div className="small text-muted fw-bold" style={{ fontSize: "0.7rem" }}>HRA</div>
                                            <div className="fw-bold text-primary">₹{mySalary.hra.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-muted small fst-italic">
                                        * Salary credited on last working day
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Attendance Stats */}
                <div className="col-md-7">
                    <div className="row g-3 h-100">
                        <div className="col-md-4">
                            <div className="p-4 rounded-4 border-0 text-center bg-white shadow-sm h-100 position-relative overflow-hidden">
                                <div className="position-absolute top-0 start-0 w-100 h-1 bg-success"></div>
                                <div className="mb-3 text-success p-3 rounded-circle bg-success bg-opacity-10 d-inline-block">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </div>
                                <h3 className="fw-bold mb-0 text-dark display-6">{myAttendance.present}</h3>
                                <div className="small text-muted fw-bold text-uppercase mt-2">Present</div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="p-4 rounded-4 border-0 text-center bg-white shadow-sm h-100 position-relative overflow-hidden">
                                <div className="position-absolute top-0 start-0 w-100 h-1 bg-danger"></div>
                                <div className="mb-3 text-danger p-3 rounded-circle bg-danger bg-opacity-10 d-inline-block">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                </div>
                                <h3 className="fw-bold mb-0 text-dark display-6">{myAttendance.absent}</h3>
                                <div className="small text-muted fw-bold text-uppercase mt-2">Absent</div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="p-4 rounded-4 border-0 text-center bg-white shadow-sm h-100 position-relative overflow-hidden">
                                <div className="position-absolute top-0 start-0 w-100 h-1 bg-warning"></div>
                                <div className="mb-3 text-warning p-3 rounded-circle bg-warning bg-opacity-10 d-inline-block">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </div>
                                <h3 className="fw-bold mb-0 text-dark display-6">{myAttendance.leave}</h3>
                                <div className="small text-muted fw-bold text-uppercase mt-2">Leaves</div>
                            </div>
                        </div>

                        <div className="col-12 mt-3">
                            <div className="p-4 rounded-4 border-0 bg-white shadow-sm d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <div className="text-white rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: "50px", height: "50px", backgroundColor: THEME.primary }}>
                                        {user?.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ms-3">
                                        <div className="fw-bold text-dark">{user?.email}</div>
                                        <div className="small text-muted">Authenticated User • Active Employee</div>
                                    </div>
                                </div>
                                <div className="d-none d-md-block">
                                    <button
                                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                        onClick={() => setShowProfile(true)}
                                    >
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Modal - OUTSIDE main container for full-page blur */}
            {showProfile && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 9999 }}>
                    <div className="bg-white rounded-4 shadow-lg overflow-hidden position-relative" style={{ width: "90%", maxWidth: "400px", animation: "slideUp 0.3s ease" }}>
                        {/* Close Button */}
                        <button
                            onClick={() => setShowProfile(false)}
                            className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow-sm z-2"
                            style={{ width: "32px", height: "32px" }}
                        >✕</button>

                        {!myProfile ? (
                            <div className="p-5 text-center">
                                <div className="spinner-border text-primary mb-3"></div>
                                <p>Loading profile...</p>
                            </div>
                        ) : (
                            <div>
                                {/* ID Card Header */}
                                <div className="p-4 text-center text-white" style={{ backgroundColor: THEME.primary }}>
                                    <div className="bg-white rounded-circle p-1 d-inline-block shadow mb-3">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center bg-light text-primary fw-bold" style={{ width: "80px", height: "80px", fontSize: "2rem" }}>
                                            {myProfile.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <h4 className="fw-bold mb-0">{myProfile.name || "Employee"}</h4>
                                    <div className="opacity-75 small">{myProfile.post || "Staff Member"}</div>
                                </div>

                                {/* ID Card Body */}
                                <div className="p-4">
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.7rem" }}>Employee ID</div>
                                            <div className="fw-medium text-dark">{myProfile.empId || "N/A"}</div>
                                        </div>
                                        <div className="col-6">
                                            <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.7rem" }}>Department</div>
                                            <div className="fw-medium text-dark">{myProfile.dept || "General"}</div>
                                        </div>
                                        <div className="col-12">
                                            <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.7rem" }}>Email</div>
                                            <div className="fw-medium text-dark">{myProfile.email}</div>
                                        </div>
                                        <div className="col-12">
                                            <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.7rem" }}>Joined</div>
                                            <div className="fw-medium text-dark">
                                                {myProfile.time ? new Date(myProfile.time.seconds * 1000).toLocaleDateString() : "Recently"}
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4 opacity-25" />

                                    <div className="text-center">
                                        <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                                            ● Active Employee
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
