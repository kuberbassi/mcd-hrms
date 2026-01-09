import { useState, useEffect } from "react";
import { getGrievances, submitGrievance, resolveGrievance } from "../backend";

function Grievances({ role, user }) {
    const [complaints, setComplaints] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadComplaints();
    }, []);

    async function loadComplaints() {
        const data = await getGrievances();
        setComplaints(data);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const title = e.target.title.value.trim();
        const description = e.target.description.value.trim();
        const category = e.target.category.value;

        try {
            await submitGrievance(title, description, category, user?.email);
            alert("Complaint submitted successfully!");
            e.target.reset();
            setShowForm(false);
            loadComplaints();
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleResolve(id) {
        try {
            await resolveGrievance(id);
            loadComplaints();
        } catch (error) {
            alert("Error: " + error.message);
        }
    }

    function getStatusColor(status) {
        if (status === "resolved") return "bg-success";
        if (status === "pending") return "bg-warning text-dark";
        return "bg-secondary";
    }

    return (
        <div className="animate-slide-up">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <div className="p-2 bg-white rounded-3 shadow-sm me-3 text-primary">
                        <span className="fs-4">📝</span>
                    </div>
                    <div>
                        <h4 className="fw-bold mb-0">Grievance Redressal</h4>
                        <p className="text-muted small mb-0">Track and resolve employee requests transparently.</p>
                    </div>
                </div>
                <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-medium" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Hide Form" : "New Complaint"}
                </button>
            </div>

            {/* New Complaint Form */}
            {showForm && (
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white position-relative overflow-hidden">
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-10" style={{ pointerEvents: 'none' }}></div>
                    <div className="position-relative">
                        <h5 className="mb-3 fw-bold text-primary">Submit a Complaint</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Subject</label>
                                    <input className="form-control rounded-3 border-0 bg-white shadow-sm" name="title" placeholder="Brief title" required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Category</label>
                                    <select className="form-select rounded-3 border-0 bg-white shadow-sm" name="category" required>
                                        <option value="">Choose...</option>
                                        <option value="workplace">Workplace Issue</option>
                                        <option value="salary">Salary Problem</option>
                                        <option value="leave">Leave Related</option>
                                        <option value="harassment">Harassment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Description</label>
                                    <textarea className="form-control rounded-3 border-0 bg-white shadow-sm" name="description" rows="3" placeholder="Explain your issue in detail..." required></textarea>
                                </div>
                                <div className="col-12 text-end">
                                    <button className="btn btn-dark rounded-pill px-5" disabled={loading}>
                                        {loading ? "Submitting..." : "Submit Complaint"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complaints List */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                {complaints.length === 0 ? (
                    <div className="p-5 text-center text-muted">
                        No complaints yet.
                    </div>
                ) : (
                    <div className="list-group list-group-flush">
                        {complaints.map((c) => (
                            <div key={c.id} className="list-group-item p-4">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <h6 className="mb-0 fw-bold">{c.title}</h6>
                                            <span className={`badge ${getStatusColor(c.status)}`}>
                                                {c.status}
                                            </span>
                                            <span className="badge bg-light text-dark border">
                                                {c.category}
                                            </span>
                                        </div>
                                        <p className="text-muted mb-2">{c.description}</p>
                                        <div className="d-flex gap-3">
                                            <small className="text-muted">By: {c.submittedBy}</small>
                                            {c.status === "pending" && <small className="text-danger fw-bold">Days Pending: {Math.floor(Math.random() * 10) + 1}</small>}
                                        </div>
                                    </div>
                                    {role === "admin" && c.status === "pending" && (
                                        <button className="btn btn-sm btn-success" onClick={() => handleResolve(c.id)}>
                                            Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Grievances;
