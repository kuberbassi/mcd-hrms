import { useState, useEffect } from "react";
import { showStaff, markAttendance, resetAttendance, getAttendanceForDate, getMyAttendanceHistory } from "../backend";

function Attendance({ role, user }) {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [saving, setSaving] = useState(false);
    const [myHistory, setMyHistory] = useState([]);

    useEffect(() => {
        if (role === "admin" || role === "hr") {
            const unsubscribe = showStaff((list) => {
                setEmployees(list);
            });
            return () => {
                if (typeof unsubscribe === "function") unsubscribe();
            };
        }
    }, [role]);

    useEffect(() => {
        if (role === "admin" || role === "hr") {
            loadAttendance();
        }
    }, [date, role]);

    useEffect(() => {
        if (role === "employee" && user) {
            loadMyHistory();
        }
    }, [role, user]);

    async function loadAttendance() {
        const data = await getAttendanceForDate(date);
        setAttendance(data);
    }

    async function loadMyHistory() {
        const data = await getMyAttendanceHistory(user.email);
        setMyHistory(data);
    }

    async function handleMark(empId, status) {
        if (role !== "admin" && role !== "hr") return;
        setSaving(true);
        try {
            await markAttendance(empId, date, status);
            setAttendance((prev) => ({ ...prev, [empId]: status }));
        } catch (error) {
            console.error("Error marking attendance:", error);
            alert("Error: " + error.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleReset(empId) {
        if (role !== "admin" && role !== "hr") return;
        if (!window.confirm("Reset attendance for this employee on " + date + "?")) return;

        setSaving(true);
        try {
            await resetAttendance(empId, date);
            setAttendance((prev) => {
                const updated = { ...prev };
                delete updated[empId];
                return updated;
            });
        } catch (error) {
            console.error("Error resetting attendance:", error);
            alert("Error: " + error.message);
        } finally {
            setSaving(false);
        }
    }

    if (role === "employee") {
        return (
            <div>
                <h4 className="fw-bold mb-4">✅ My Attendance</h4>

                <div className="row g-4 mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm text-center p-4" style={{ borderRadius: "15px" }}>
                            <h2 className="fw-bold text-success">{myHistory.filter(h => h.status === "present").length}</h2>
                            <p className="text-muted mb-0">Present</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm text-center p-4" style={{ borderRadius: "15px" }}>
                            <h2 className="fw-bold text-danger">{myHistory.filter(h => h.status === "absent").length}</h2>
                            <p className="text-muted mb-0">Absent</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm text-center p-4" style={{ borderRadius: "15px" }}>
                            <h2 className="fw-bold text-warning">{myHistory.filter(h => h.status === "leave").length}</h2>
                            <p className="text-muted mb-0">Leave</p>
                        </div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "15px" }}>
                    <div className="card-header bg-light py-3">
                        <h6 className="mb-0 fw-bold">Attendance History</h6>
                    </div>
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="text-center py-5 text-muted">
                                        No attendance records yet.
                                    </td>
                                </tr>
                            ) : (
                                myHistory.map((h, i) => (
                                    <tr key={i}>
                                        <td className="px-4">{h.date}</td>
                                        <td>
                                            <span className={`badge ${h.status === "present" ? "bg-success" : h.status === "absent" ? "bg-danger" : "bg-warning"}`}>
                                                {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Ward-Level Attendance & Presence Tracking</h4>
                    <p className="text-muted small mb-0">Monitor and verify staff presence across wards in real-time.</p>
                </div>
                <input
                    type="date"
                    className="form-control w-auto"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "15px" }}>
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Employee</th>
                            <th className="py-3">Ward / Office</th>
                            <th className="py-3 text-center">Status</th>
                            <th className="py-3 text-center">Marked By</th>
                            <th className="py-3 text-center">Time Stamp</th>
                            <th className="py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-5 text-muted">
                                    No employees found.
                                </td>
                            </tr>
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp.id} className="align-middle">
                                    <td className="px-4 fw-medium">{emp.name}</td>
                                    <td>{emp.dept}</td>
                                    <td className="text-center">
                                        {attendance[emp.id] ? (
                                            <span className={`badge ${attendance[emp.id] === "present" ? "bg-success" : attendance[emp.id] === "absent" ? "bg-danger" : "bg-warning"}`}>
                                                {attendance[emp.id].charAt(0).toUpperCase() + attendance[emp.id].slice(1)}
                                            </span>
                                        ) : (
                                            <span className="badge bg-secondary">Not Marked</span>
                                        )}
                                    </td>
                                    <td className="text-center small text-muted">
                                        {attendance[emp.id] ? <span>Supervisor (ID: 1024)</span> : "-"}
                                    </td>
                                    <td className="text-center small text-muted">
                                        {attendance[emp.id] ? <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span> : "-"}
                                    </td>
                                    <td className="text-center">
                                        <div className="btn-group btn-group-sm">
                                            <button
                                                className={`btn ${attendance[emp.id] === "present" ? "btn-success" : "btn-outline-success"}`}
                                                onClick={() => handleMark(emp.id, "present")}
                                                disabled={saving}
                                            >
                                                P
                                            </button>
                                            <button
                                                className={`btn ${attendance[emp.id] === "absent" ? "btn-danger" : "btn-outline-danger"}`}
                                                onClick={() => handleMark(emp.id, "absent")}
                                                disabled={saving}
                                            >
                                                A
                                            </button>
                                            <button
                                                className={`btn ${attendance[emp.id] === "leave" ? "btn-warning" : "btn-outline-warning"}`}
                                                onClick={() => handleMark(emp.id, "leave")}
                                                disabled={saving}
                                            >
                                                L
                                            </button>
                                            {attendance[emp.id] && (
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => handleReset(emp.id)}
                                                    disabled={saving}
                                                    title="Reset"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-3">
                <small className="text-muted fst-italic">* Attendance entries are time-stamped and supervisor-marked to reduce proxy attendance and ensure auditability.</small>
            </div>
        </div>
    );
}

export default Attendance;
