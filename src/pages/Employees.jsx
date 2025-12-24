import { useState, useEffect, Fragment } from "react";
import { showStaff, removeStaff, createEmployeeAccount, makeFakeData, updateEmployee } from "../backend";

const DEMO_PASSWORD = "demo123";
function isDemoAccount(email) {
    const demoEmails = [
        "raj@mcd.in",
        "sonia@mcd.in",
        "amit@mcd.in",
        "priya@mcd.in",
        "vikram@mcd.in"
    ];
    return demoEmails.includes(email);
}

function Employees({ role, user }) {
    const [staffList, setStaffList] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [editEmp, setEditEmp] = useState(null);
    const [loadingDemo, setLoadingDemo] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const unsubscribe = showStaff((list) => {
            setStaffList(list);
        });
        return () => {
            if (typeof unsubscribe === "function") unsubscribe();
        };
    }, []);

    // Filter staff list
    const filteredList = staffList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.empId && s.empId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    async function handleCreateEmployee(e) {
        e.preventDefault();
        setCreating(true);

        const email = e.target.empEmail.value.trim();
        const password = e.target.empPassword.value;
        const name = e.target.empName.value.trim();
        const dept = e.target.empDept.value.trim();
        const empId = e.target.empId.value.trim();
        const post = e.target.empPost.value.trim();
        const adminPassword = e.target.adminPassword.value;

        try {
            await createEmployeeAccount(email, password, name, dept, empId, post, user.email, adminPassword);
            alert(`Employee created!\n\nEmail: ${email}\nPassword: ${password}`);
            e.target.reset();
            setShowCreateForm(false);
        } catch (error) {
            console.error("Create employee error:", error);
            if (error.code === "auth/wrong-password") {
                alert("Your admin password is incorrect.");
            } else if (error.code === "auth/email-already-in-use") {
                alert("An account with this email already exists.");
            } else {
                alert("Error: " + error.message);
            }
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm("Delete this employee?")) {
            try {
                await removeStaff(id);
            } catch (error) {
                console.error("Delete error:", error);
                alert("Error: " + error.message);
            }
        }
    }

    // Create demo accounts with real Firebase Auth
    async function handleDemoData() {
        const adminPassword = prompt("Enter your admin password to create demo accounts:");
        if (!adminPassword) return;

        setLoadingDemo(true);
        try {
            const result = await makeFakeData(user.email, adminPassword);
            alert(`Demo accounts created!\n\nNew: ${result.created}\nExisting: ${result.skipped}\n\nAll demo accounts use password: demo123`);
        } catch (error) {
            console.error("Demo data error:", error);
            if (error.code === "auth/wrong-password") {
                alert("Your admin password is incorrect.");
            } else {
                alert("Error: " + error.message);
            }
        } finally {
            setLoadingDemo(false);
        }
    }

    // Show credentials when name is clicked
    function handleNameClick(emp) {
        setSelectedEmp(selectedEmp === emp.id ? null : emp.id);
    }

    async function handleEdit(e) {
        e.preventDefault();
        if (!editEmp) return;

        try {
            await updateEmployee(editEmp.id, {
                name: e.target.editName.value.trim(),
                dept: e.target.editDept.value.trim(),
                post: e.target.editPost.value.trim(),
                empId: e.target.editId.value.trim()
            });
            alert("Employee updated successfully!");
            setEditEmp(null);
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update: " + error.message);
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Employees</h4>
                {(role === "admin" || role === "hr") && (
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
                            {showCreateForm ? "Hide Form" : "Add Employee"}
                        </button>
                        <button className="btn btn-outline-secondary" onClick={handleDemoData} disabled={loadingDemo}>
                            {loadingDemo ? "Creating..." : "Demo Data"}
                        </button>
                    </div>
                )}
            </div>

            {/* Info about demo accounts */}
            <div className="alert alert-info py-2 mb-4">
                <small>💡 <strong>Tip:</strong> Click any employee name to view login credentials. Demo accounts use password <code>demo123</code></small>
            </div>

            {/* Edit Employee Modal */}
            {(role === "admin" || role === "hr") && editEmp && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}>
                    <div className="bg-white rounded-4 shadow-lg p-4" style={{ width: "90%", maxWidth: "500px" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 fw-bold text-primary">Edit Employee</h5>
                            <button onClick={() => setEditEmp(null)} className="btn btn-sm btn-light rounded-circle">✕</button>
                        </div>
                        <form onSubmit={handleEdit}>
                            <div className="mb-3">
                                <label className="form-label small text-muted">Full Name</label>
                                <input className="form-control" name="editName" defaultValue={editEmp.name} required />
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="form-label small text-muted">Department</label>
                                    <input className="form-control" name="editDept" defaultValue={editEmp.dept} required />
                                </div>
                                <div className="col-6">
                                    <label className="form-label small text-muted">Employee ID</label>
                                    <input className="form-control" name="editId" defaultValue={editEmp.empId} required />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label small text-muted">Position</label>
                                <input className="form-control" name="editPost" defaultValue={editEmp.post} required />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-light" onClick={() => setEditEmp(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-4">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control py-3 px-4 border-0 shadow-sm rounded-pill"
                    placeholder="🔍 Search employees by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {role === "admin" || role === "hr" && showCreateForm && (
                <div className="card border-0 shadow-sm p-4 mb-4 bg-light" style={{ borderRadius: "15px" }}>
                    <h5 className="mb-3 fw-bold text-primary">Create Employee Account</h5>
                    <form className="row g-3" onSubmit={handleCreateEmployee}>
                        <div className="col-md-4">
                            <label className="form-label small">Full Name</label>
                            <input className="form-control" name="empName" placeholder="John Doe" required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small">Email</label>
                            <input className="form-control" type="email" name="empEmail" placeholder="john@mcd.in" required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small">Password</label>
                            <input className="form-control" type="password" name="empPassword" minLength="6" placeholder="Min 6 chars" required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">Department</label>
                            <input className="form-control" name="empDept" placeholder="IT" required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">Employee ID</label>
                            <input className="form-control" name="empId" placeholder="MCD001" required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">Position</label>
                            <input className="form-control" name="empPost" placeholder="Manager" required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small text-danger">Your Password</label>
                            <input className="form-control border-danger" type="password" name="adminPassword" placeholder="Confirm" required />
                        </div>
                        <div className="col-12">
                            <button className="btn btn-primary" disabled={creating}>
                                {creating ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "15px" }}>
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="py-3">Dept</th>
                            <th className="py-3">Emp ID</th>
                            <th className="py-3">Post</th>
                            {(role === "admin" || role === "hr") && <th className="py-3 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList.length === 0 ? (
                            <tr>
                                <td colSpan={(role === "admin" || role === "hr") ? "5" : "4"} className="text-center py-5 text-muted">
                                    No employees found.
                                </td>
                            </tr>
                        ) : (
                            filteredList.map((s) => (
                                <Fragment key={s.id}>
                                    <tr className="align-middle">
                                        <td className="px-4">
                                            <span
                                                className="fw-medium text-primary"
                                                style={{ cursor: "pointer", textDecoration: "underline" }}
                                                onClick={() => handleNameClick(s)}
                                            >
                                                {s.name}
                                            </span>
                                            {s.email && isDemoAccount(s.email) && (
                                                <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>Demo</span>
                                            )}
                                        </td>
                                        <td><span className="badge bg-light text-dark border">{s.dept}</span></td>
                                        <td><code>{s.empId}</code></td>
                                        <td>{s.post}</td>
                                        {(role === "admin" || role === "hr") && (
                                            <td className="text-center">
                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setEditEmp(s)}>
                                                    Edit
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                    {/* Show credentials row when clicked */}
                                    {selectedEmp === s.id && s.email && (
                                        <tr key={s.id + "-creds"} className="bg-light">
                                            <td colSpan={(role === "admin" || role === "hr") ? "5" : "4"} className="px-4 py-3">
                                                <div className="d-flex align-items-center gap-4">
                                                    <div>
                                                        <small className="text-muted">Email:</small>
                                                        <div className="fw-bold">{s.email}</div>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted">Password:</small>
                                                        <div className="fw-bold font-monospace">{isDemoAccount(s.email) ? DEMO_PASSWORD : "••••••••"}</div>
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary ms-auto"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(s.email);
                                                            alert("Email copied!");
                                                        }}
                                                    >
                                                        Copy Email
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Employees;
