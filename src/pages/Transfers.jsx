import { useState, useEffect } from "react";
import { showStaff, requestTransfer, getTransfers, updateTransferStatus } from "../backend";

function Transfers({ role, user }) {
    const [employees, setEmployees] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = showStaff((list) => {
            setEmployees(list);
        });
        return () => {
            if (typeof unsubscribe === "function") unsubscribe();
        };
    }, []);

    useEffect(() => {
        loadTransfers();
    }, []);

    async function loadTransfers() {
        const data = await getTransfers();
        setTransfers(data);
    }

    async function handleRequest(e) {
        e.preventDefault();
        setLoading(true);
        const empId = e.target.empId.value;
        const toDept = e.target.toDept.value.trim();
        const reason = e.target.reason.value.trim();

        const emp = employees.find((e) => e.id === empId);

        try {
            await requestTransfer(empId, emp?.name, emp?.dept, toDept, reason, user?.email);
            alert("Transfer request submitted!");
            e.target.reset();
            setShowForm(false);
            loadTransfers();
        } catch (error) {
            console.error("Transfer request error:", error);
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(transferId, status) {
        try {
            await updateTransferStatus(transferId, status);
            loadTransfers();
        } catch (error) {
            console.error("Status update error:", error);
            alert("Error: " + error.message);
        }
    }

    return (
        <div className="animate-slide-up">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <div className="p-2 bg-white rounded-3 shadow-sm me-3 text-primary">
                        <span className="fs-4">🔄</span>
                    </div>
                    <div>
                        <h4 className="fw-bold mb-0">Transfer Requests</h4>
                        <p className="text-muted small mb-0">Digitally tracked transfers for administrative transparency.</p>
                    </div>
                </div>
                <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-medium" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Hide Form" : "New Request"}
                </button>
            </div>

            {showForm && (
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white position-relative overflow-hidden">
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-10" style={{ pointerEvents: 'none' }}></div>
                    <div className="position-relative">
                        <h5 className="mb-3 fw-bold text-primary">Request Transfer</h5>
                        <form className="row g-3" onSubmit={handleRequest}>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase">Select Employee</label>
                                <select
                                    className="form-select rounded-3 border-0 bg-white shadow-sm"
                                    name="empId"
                                    required
                                    defaultValue={role === "employee" ? employees.find(e => e.email === user?.email)?.id : ""}
                                    disabled={role === "employee"}
                                >
                                    <option value="">Choose...</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} ({emp.dept})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase">New Department</label>
                                <input className="form-control rounded-3 border-0 bg-white shadow-sm" name="toDept" placeholder="e.g. Finance" required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase">Reason</label>
                                <input className="form-control rounded-3 border-0 bg-white shadow-sm" name="reason" placeholder="e.g. Closer to home" required />
                            </div>
                            <div className="col-12 text-end">
                                <button className="btn btn-dark rounded-pill px-5" disabled={loading}>
                                    {loading ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Employee</th>
                            <th className="py-3">From</th>
                            <th className="py-3">To</th>
                            <th className="py-3">Reason</th>
                            <th className="py-3">Status</th>
                            {role === "admin" && <th className="py-3 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {transfers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-muted">
                                    No transfer requests.
                                </td>
                            </tr>
                        ) : (
                            transfers.map((t) => (
                                <tr key={t.id} className="align-middle">
                                    <td className="px-4 fw-medium">{t.empName}</td>
                                    <td>{t.fromDept}</td>
                                    <td>{t.toDept}</td>
                                    <td className="text-truncate" style={{ maxWidth: "150px" }}>{t.reason}</td>
                                    <td>
                                        <span className={`badge ${t.status === "approved" ? "bg-success" : t.status === "rejected" ? "bg-danger" : "bg-warning"}`}>
                                            {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                                        </span>
                                    </td>
                                    {role === "admin" && (
                                        <td className="text-center">
                                            {t.status === "pending" && (
                                                <div className="btn-group btn-group-sm">
                                                    <button className="btn btn-outline-success" onClick={() => handleStatusChange(t.id, "approved")}>
                                                        Approve
                                                    </button>
                                                    <button className="btn btn-outline-danger" onClick={() => handleStatusChange(t.id, "rejected")}>
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Transfers;
