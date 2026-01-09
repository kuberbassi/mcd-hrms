import { useState, useEffect } from "react";
import { showStaff, getPerformanceData, savePerformance, getMyProfile } from "../backend";

function Performance({ role, user }) {
    const [employees, setEmployees] = useState([]); // List of employees to manage
    const [myProfile, setMyProfile] = useState(null); // Own profile for "My Performance"
    const [ratings, setRatings] = useState({});
    const [saving, setSaving] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState("");

    useEffect(() => {
        let unsubscribe;

        // 1. Fetch own profile (for HR & Employee)
        if (user?.email && (role === "hr" || role === "employee")) {
            getMyProfile(user.email).then((profile) => {
                setMyProfile(profile);
            });
        }

        // 2. Fetch staff list (for Admin & HR)
        if (role === "admin" || role === "hr") {
            unsubscribe = showStaff((list) => {
                setEmployees(list);
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
        if (role !== "admin" && role !== "hr") return;
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

    function getBadge(rating) {
        if (!rating) return { label: "Not Rated", color: "bg-light text-muted", icon: "○" };
        if (rating === 5) return { label: "Top Performer", color: "bg-warning bg-opacity-10 text-warning", icon: "🏆" };
        if (rating === 4) return { label: "Excellent", color: "bg-success bg-opacity-10 text-success", icon: "🌟" };
        if (rating === 3) return { label: "Good", color: "bg-primary bg-opacity-10 text-primary", icon: "✅" };
        return { label: "Needs Improvement", color: "bg-danger bg-opacity-10 text-danger", icon: "⚠️" };
    }

    const canManage = role === "admin" || role === "hr";

    // Reusable Card Component
    const PerformanceCard = ({ emp, isManagementView }) => {
        const rData = ratings[emp.id] || {};
        const badge = getBadge(rData.rating);
        const progress = (rData.rating || 0) * 20;

        return (
            <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden hover-shadow transition-all group">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle p-1 me-3">
                                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center fw-bold text-secondary shadow-sm" style={{ width: "42px", height: "42px" }}>
                                    {emp.name.charAt(0)}
                                </div>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0 text-dark">{emp.name}</h6>
                                <div className="small text-muted">{emp.dept}</div>
                            </div>
                        </div>
                        <span className={`badge rounded-pill px-3 py-2 ${badge.color}`}>
                            <span className="me-1">{badge.icon}</span> {badge.label}
                        </span>
                    </div>

                    <div className="mb-3">
                        <div className="d-flex justify-content-between small fw-bold text-muted mb-1">
                            <span>Rating</span>
                            <span>{rData.rating || 0}/5</span>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                            <div
                                className={`progress-bar rounded-pill ${rData.rating >= 4 ? "bg-success" : rData.rating >= 3 ? "bg-primary" : "bg-warning"}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {rData.comment ? (
                        <div className="bg-light rounded-3 p-3 mb-3 position-relative">
                            <div className="position-absolute top-0 start-0 ms-2 mt-n2 bg-white px-1 text-muted small" style={{ lineHeight: 1 }}>💬</div>
                            <p className="small text-muted mb-0 fst-italic">"{rData.comment}"</p>
                        </div>
                    ) : (
                        <div className="mb-3 pb-4"></div>
                    )}

                    {isManagementView && (
                        emp.email === user.email ? (
                            <div className="text-center py-1">
                                <span className="badge bg-secondary opacity-50 rounded-pill px-3">Self (Read-Only)</span>
                            </div>
                        ) : (
                            <button
                                className="btn btn-outline-primary w-100 rounded-pill fw-medium btn-sm opacity-0 group-hover-opacity-100 transition-all"
                                onClick={() => openEdit(emp)}
                                style={{ opacity: rData.rating ? 0.8 : 1 }}
                            >
                                {rData.rating ? "Update Review" : "Write Review"}
                            </button>
                        )
                    )}
                </div>
                <div className={`h-1 w-100 ${rData.rating >= 4 ? "bg-success" : rData.rating >= 3 ? "bg-primary" : rData.rating ? "bg-warning" : "bg-light"}`}></div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Performance Indicators</h4>
                    <p className="text-muted small mb-0">Indicators derived from measurable attendance, deployment, and task completion records.</p>
                </div>
            </div>

            {/* Edit Modal */}
            {editingEmp && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 9999 }}>
                    <div className="bg-white rounded-4 shadow-lg overflow-hidden animate-slide-up" style={{ width: "90%", maxWidth: "450px" }}>
                        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Evaluate Performance</h5>
                            <button onClick={() => setEditingEmp(null)} className="btn btn-sm btn-light rounded-circle shadow-sm">✕</button>
                        </div>

                        <div className="p-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 me-3" style={{ width: "48px", height: "48px" }}>
                                    {editingEmp.name.charAt(0)}
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0 text-dark">{editingEmp.name}</h6>
                                    <div className="text-muted small">{editingEmp.post}</div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small text-muted fw-bold text-uppercase ls-1">Rating</label>
                                <div className="d-flex justify-content-between bg-light p-2 rounded-3">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            className={`btn btn-lg border-0 rounded-3 flex-fill mx-1 transition-all ${editRating === num ? "bg-white shadow text-primary" : "text-muted opacity-50"}`}
                                            onClick={() => setEditRating(num)}
                                            style={{ transform: editRating === num ? 'scale(1.05)' : 'scale(1)' }}
                                        >
                                            <div className="h4 mb-0">{num === 5 ? "🏆" : "⭐"}</div>
                                            <div className="small fw-bold">{num}</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="text-center mt-2 small fw-bold" style={{ color: getBadge(editRating).color.includes('warning') ? '#f57c00' : '#666' }}>
                                    {getBadge(editRating).label}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small text-muted fw-bold text-uppercase ls-1">Feedback</label>
                                <textarea
                                    className="form-control bg-light border-0"
                                    rows="4"
                                    placeholder="Enter detailed feedback and goals..."
                                    value={editComment}
                                    onChange={(e) => setEditComment(e.target.value)}
                                    style={{ resize: "none" }}
                                    disabled={editingEmp.email === user.email} // Disable if employee is current user
                                />
                            </div>

                            <div className="d-flex gap-2">
                                <button className="btn btn-light flex-grow-1 fw-bold" onClick={() => setEditingEmp(null)}>Cancel</button>
                                <button className="btn btn-primary flex-grow-1 fw-bold" onClick={saveEdit} disabled={saving}>
                                    {saving ? "Saving..." : "Submit Review"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 1: My Performance (HR & Employee) */}
            {myProfile && (
                <div className="mb-5 animate-slide-up">
                    <h6 className="text-uppercase text-muted fw-bold small ls-1 mb-3">My Performance</h6>
                    <div className="row">
                        <div className="col-md-6 col-lg-4">
                            <PerformanceCard emp={myProfile} isManagementView={false} />
                        </div>
                    </div>
                </div>
            )}

            {/* Section 2: Team Performance (Admin & HR) */}
            {canManage && (
                <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                    {myProfile && <h6 className="text-uppercase text-muted fw-bold small ls-1 mb-3">Team Performance</h6>}

                    <div className="row g-4">
                        {employees.length === 0 ? (
                            <div className="col-12 py-5 text-center text-muted">No employees found.</div>
                        ) : (
                            employees.map((emp) => (
                                <div key={emp.id} className="col-md-6 col-lg-4">
                                    <PerformanceCard emp={emp} isManagementView={true} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .hover-shadow:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
                .group:hover .group-hover-opacity-100 { opacity: 1 !important; }
                .transition-all { transition: all 0.2s ease; }
            `}</style>
        </div>
    );
}

export default Performance;
