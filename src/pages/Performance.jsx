import { useState, useEffect } from "react";
import { showStaff, getPerformanceData, savePerformance, getMyProfile } from "../backend";

function Performance({ role, user }) {
    const [employees, setEmployees] = useState([]);
    const [ratings, setRatings] = useState({});
    const [saving, setSaving] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState("");

    useEffect(() => {
        let unsubscribe;
        if (role === "admin") {
            unsubscribe = showStaff((list) => {
                setEmployees(list);
            });
        } else if (user?.email) {
            // For regular employees, only show their own card
            getMyProfile(user.email).then((profile) => {
                if (profile) {
                    setEmployees([profile]);
                }
            });
        }
        return () => {
            if (typeof unsubscribe === "function") unsubscribe();
        };
    }, [role, user]);

    useEffect(() => {
        loadRatings();
    }, []);

    async function loadRatings() {
        const data = await getPerformanceData();
        setRatings(data);
    }

    async function handleRate(empId, rating, comment) {
        if (role !== "admin") return;
        setSaving(true);

        try {
            await savePerformance(empId, rating, comment);
            setRatings((old) => ({
                ...old,
                [empId]: { rating, comment },
            }));
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setSaving(false);
        }
    }

    function openEdit(emp) {
        setEditingEmp(emp);
        setEditRating(ratings[emp.id]?.rating || 0);
        setEditComment(ratings[emp.id]?.comment || "");
    }

    async function saveEdit() {
        if (!editingEmp) return;
        await handleRate(editingEmp.id, editRating, editComment);
        setEditingEmp(null);
    }

    function showStars(count) {
        let stars = "";
        for (let i = 0; i < 5; i++) {
            if (i < count) {
                stars += "⭐";
            } else {
                stars += "☆";
            }
        }
        return stars;
    }

    return (
        <div>
            <h4 className="fw-bold mb-4">📈 Performance Tracking</h4>

            {/* Edit Modal */}
            {editingEmp && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 9999 }}>
                    <div className="bg-white rounded-4 shadow-lg p-4" style={{ width: "90%", maxWidth: "400px" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 fw-bold text-primary">Edit Rating</h5>
                            <button onClick={() => setEditingEmp(null)} className="btn btn-sm btn-light rounded-circle">✕</button>
                        </div>

                        <div className="mb-3">
                            <div className="fw-bold">{editingEmp.name}</div>
                            <div className="text-muted small">{editingEmp.dept} • {editingEmp.post}</div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small text-muted fw-bold">Rating</label>
                            <div className="btn-group w-100">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={num}
                                        className={`btn ${editRating === num ? "btn-warning" : "btn-outline-warning"}`}
                                        onClick={() => setEditRating(num)}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label small text-muted fw-bold">Comment</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Add feedback..."
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button className="btn btn-light" onClick={() => setEditingEmp(null)}>Cancel</button>
                            <button className="btn btn-primary px-4" onClick={saveEdit} disabled={saving}>
                                {saving ? "Saving..." : "Save Rating"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="row g-4">
                {employees.length === 0 ? (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: "15px" }}>
                            <p className="text-muted mb-0">No employees found.</p>
                        </div>
                    </div>
                ) : (
                    employees.map((emp) => (
                        <div key={emp.id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "15px" }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h5 className="fw-bold mb-1">{emp.name}</h5>
                                            <p className="text-muted small mb-3">{emp.dept} • {emp.post}</p>
                                        </div>
                                        {role === "admin" && ratings[emp.id]?.rating > 0 && (
                                            <button
                                                className="btn btn-sm btn-outline-primary rounded-pill"
                                                onClick={() => openEdit(emp)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    {/* Current Rating */}
                                    <div className="mb-3">
                                        <span className="fs-4">{showStars(ratings[emp.id]?.rating || 0)}</span>
                                        <span className="ms-2 text-muted">({ratings[emp.id]?.rating || 0}/5)</span>
                                    </div>

                                    {/* Comment */}
                                    {ratings[emp.id]?.comment && (
                                        <p className="text-muted small fst-italic mb-3">
                                            "{ratings[emp.id].comment}"
                                        </p>
                                    )}

                                    {/* Admin can rate (quick buttons for new ratings) */}
                                    {role === "admin" && !ratings[emp.id]?.rating && (
                                        <div className="border-top pt-3">
                                            <div className="btn-group mb-2">
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                    <button
                                                        key={num}
                                                        className="btn btn-sm btn-outline-warning"
                                                        onClick={() => openEdit({ ...emp, initialRating: num })}
                                                        disabled={saving}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="small text-muted">Click to add rating</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Performance;
