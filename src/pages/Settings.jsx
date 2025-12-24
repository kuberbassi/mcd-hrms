import { useState, useEffect } from "react";
import { showStaff, updateUserRole, getAllUserRoles } from "../backend";

function Settings() {
    const [staffList, setStaffList] = useState([]);
    const [userRoles, setUserRoles] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // Load staff
        const unsubscribe = showStaff((list) => {
            setStaffList(list);
        });

        async function loadRoles() {
            try {
                const roles = await getAllUserRoles();
                setUserRoles(roles);
            } catch (err) {
                console.warn("Failed to load roles (likely missing firestore rules):", err.message);
            }
        }
        loadRoles();

        return () => {
            if (typeof unsubscribe === "function") unsubscribe();
        };
    }, []);

    async function handleRoleChange(email, newRole) {
        if (window.confirm(`Change role of ${email} to ${newRole}?`)) {
            try {
                const success = await updateUserRole(email, newRole);
                if (success) {
                    setUserRoles(prev => ({ ...prev, [email]: newRole }));
                    alert("Role updated successfully!");
                } else {
                    alert("Failed to update role. User might not exist in 'users' collection yet.");
                }
            } catch (err) {
                console.error("Role update failed:", err);
                alert("Failed to update role: " + err.message + "\n(Did you deploy the firestore rules?)");
            }
        }
    }

    const filteredList = staffList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">System Settings</h4>
                    <p className="text-muted small mb-0">Manage user roles and permissions</p>
                </div>
            </div>

            <div className="row g-4">
                {/* Role Management Card - Now Full Width */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white py-3 border-0">
                            <h6 className="fw-bold mb-0 text-primary">User Role Management</h6>
                        </div>
                        <div className="p-3 bg-light border-bottom">
                            <input
                                className="form-control border-0 shadow-sm"
                                placeholder="Search employees by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive" style={{ maxHeight: "400px" }}>
                                <table className="table table-hover mb-0">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th className="px-4 border-0">Employee</th>
                                            <th className="border-0">Current Role</th>
                                            <th className="border-0">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredList.map(emp => (
                                            <tr key={emp.id} className="align-middle">
                                                <td className="px-4">
                                                    <div className="fw-bold text-dark">{emp.name}</div>
                                                    <div className="small text-muted">{emp.email}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge border ${(userRoles[emp.email] || "employee") === "admin" ? "bg-danger text-white" :
                                                        (userRoles[emp.email] || "employee") === "hr" ? "bg-warning text-dark" :
                                                            "bg-light text-dark"
                                                        }`}>
                                                        {(userRoles[emp.email] || "employee").toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="dropdown">
                                                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                                            Change Role
                                                        </button>
                                                        <ul className="dropdown-menu">
                                                            <li><button className="dropdown-item" onClick={() => handleRoleChange(emp.email, "employee")}>Employee</button></li>
                                                            <li><button className="dropdown-item" onClick={() => handleRoleChange(emp.email, "hr")}>HR Manager</button></li>
                                                            <li><button className="dropdown-item text-danger" onClick={() => handleRoleChange(emp.email, "admin")}>Administrator</button></li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;

function Settings() {
    const [staffList, setStaffList] = useState([]);
    const [userRoles, setUserRoles] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [hrPerms, setHrPerms] = useState({
        viewEmployees: true,
        markAttendance: true,
        managePayroll: false,
        approveTransfers: false
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Load staff
        const unsubscribe = showStaff((list) => {
            setStaffList(list);
        });

        // Load permissions from database
        async function loadPerms() {
            try {
                const config = await getSystemConfig();
                if (config && config.hrAccess) {
                    setHrPerms(config.hrAccess);
                }
            } catch (err) {
                console.warn("Failed to load permissions (likely missing firestore rules):", err.message);
            }
        }
        async function loadRoles() {
            try {
                const roles = await getAllUserRoles();
                setUserRoles(roles);
            } catch (err) {
                console.warn("Failed to load roles (likely missing firestore rules):", err.message);
            }
        }
        loadPerms();
        loadRoles();

        return () => {
            if (typeof unsubscribe === "function") unsubscribe();
        };
    }, []);

    async function handleRoleChange(email, newRole) {
        if (window.confirm(`Change role of ${email} to ${newRole}?`)) {
            try {
                const success = await updateUserRole(email, newRole);
                if (success) {
                    setUserRoles(prev => ({ ...prev, [email]: newRole }));
                    alert("Role updated successfully!");
                } else {
                    alert("Failed to update role. User might not exist in 'users' collection yet.");
                }
            } catch (err) {
                console.error("Role update failed:", err);
                alert("Failed to update role: " + err.message + "\n(Did you deploy the firestore rules?)");
            }
        }
    }

    async function savePermissions() {
        setSaving(true);
        try {
            await updateSystemConfig({ hrAccess: hrPerms });
            alert("Permissions saved! Changes will apply when HR users refresh.");
        } catch (err) {
            alert("Failed to save: " + err.message);
        } finally {
            setSaving(false);
        }
    }

    const filteredList = staffList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">System Settings</h4>
                    <p className="text-muted small mb-0">Manage roles and application permissions</p>
                </div>
            </div>

            <div className="row g-4">
                {/* Role Management Card */}
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white py-3 border-0">
                            <h6 className="fw-bold mb-0 text-primary">User Role Management</h6>
                        </div>
                        <div className="p-3 bg-light border-bottom">
                            <input
                                className="form-control border-0 shadow-sm"
                                placeholder="Search employees by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive" style={{ maxHeight: "400px" }}>
                                <table className="table table-hover mb-0">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th className="px-4 border-0">Employee</th>
                                            <th className="border-0">Current Role</th>
                                            <th className="border-0">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredList.map(emp => (
                                            <tr key={emp.id} className="align-middle">
                                                <td className="px-4">
                                                    <div className="fw-bold text-dark">{emp.name}</div>
                                                    <div className="small text-muted">{emp.email}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge border ${(userRoles[emp.email] || "employee") === "admin" ? "bg-danger text-white" :
                                                        (userRoles[emp.email] || "employee") === "hr" ? "bg-warning text-dark" :
                                                            "bg-light text-dark"
                                                        }`}>
                                                        {(userRoles[emp.email] || "employee").toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="dropdown">
                                                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                                            Change Role
                                                        </button>
                                                        <ul className="dropdown-menu">
                                                            <li><button className="dropdown-item" onClick={() => handleRoleChange(emp.email, "employee")}>Employee</button></li>
                                                            <li><button className="dropdown-item" onClick={() => handleRoleChange(emp.email, "hr")}>HR Manager</button></li>
                                                            <li><button className="dropdown-item text-danger" onClick={() => handleRoleChange(emp.email, "admin")}>Administrator</button></li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions Toggles - FUNCTIONAL */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white py-3 border-0">
                            <h6 className="fw-bold mb-0 text-primary">HR Access Control</h6>
                        </div>
                        <div className="card-body">
                            <p className="small text-muted mb-4">Configure what features HR Managers can access.</p>

                            <div className="form-check form-switch mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={hrPerms.viewEmployees}
                                    onChange={(e) => setHrPerms({ ...hrPerms, viewEmployees: e.target.checked })}
                                />
                                <label className="form-check-label fw-medium">View All Employees</label>
                            </div>
                            <div className="form-check form-switch mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={hrPerms.markAttendance}
                                    onChange={(e) => setHrPerms({ ...hrPerms, markAttendance: e.target.checked })}
                                />
                                <label className="form-check-label fw-medium">Mark Attendance</label>
                            </div>
                            <div className="form-check form-switch mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={hrPerms.managePayroll}
                                    onChange={(e) => setHrPerms({ ...hrPerms, managePayroll: e.target.checked })}
                                />
                                <label className="form-check-label fw-medium">Manage Payroll</label>
                            </div>
                            <div className="form-check form-switch mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={hrPerms.approveTransfers}
                                    onChange={(e) => setHrPerms({ ...hrPerms, approveTransfers: e.target.checked })}
                                />
                                <label className="form-check-label fw-medium">Approve Transfers</label>
                            </div>

                            <div className="mt-4 pt-3 border-top text-center">
                                <button className="btn btn-primary w-100" onClick={savePermissions} disabled={saving}>
                                    {saving ? "Saving..." : "Save Settings"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
