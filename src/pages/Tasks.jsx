import React, { useState, useEffect } from 'react';
import {
    assignTask,
    getAllTasks,
    getEmployeeTasks,
    updateTaskStatus
} from '../backend';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Tasks = ({ user, role }) => {
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Form State
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignedTo: '',
        employeeName: '',
        dueDate: ''
    });

    const isAdmin = role === 'admin' || user?.email === 'admin@mcd.com';

    // --- NEW: Calculate Stats based on the loaded 'tasks' ---
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    // 'Pending' here means anything not completed (so it includes "In Progress")
    const pendingTasks = totalTasks - completedTasks;

    useEffect(() => {
        const initData = async () => {
            if (!user) return;

            try {
                if (isAdmin) {
                    const taskList = await getAllTasks();
                    setTasks(taskList);
                    const empSnapshot = await getDocs(collection(db, "employees"));
                    setEmployees(empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } else {
                    const myTasks = await getEmployeeTasks(user.email);
                    setTasks(myTasks);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setLoading(false);
        };
        initData();
    }, [user, isAdmin]);

    const openAssignModal = (employee) => {
        setNewTask({
            title: '',
            description: '',
            dueDate: '',
            assignedTo: employee.email,
            employeeName: employee.name
        });
        setSuccessMessage("");
        setErrorMessage("");
        setShowModal(true);
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!newTask.title || !newTask.dueDate) {
            setErrorMessage("Please fill in the Task Title and Due Date.");
            return;
        }

        setSubmitting(true);

        try {
            const result = await assignTask({
                ...newTask,
                assignedBy: user.email,
            });

            if (result.success) {
                setShowModal(false);
                setSuccessMessage(`✅ Task successfully assigned to ${newTask.employeeName}!`);

                const updatedTasks = await getAllTasks();
                setTasks(updatedTasks);

                setTimeout(() => setSuccessMessage(""), 4000);
            } else {
                console.error("Backend error:", result.error);
                setErrorMessage("Failed to save task. Check console for details.");
            }
        } catch (error) {
            console.error("Crash in handleAssign:", error);
            setErrorMessage("An unexpected error occurred: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (taskId, newStatus, currentNotes) => {
        const notes = prompt("Add a note for this update:", currentNotes || "");
        if (notes === null) return;

        const result = await updateTaskStatus(taskId, newStatus, notes);
        if (result.success) {
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, employeeNotes: notes } : t));
        }
    };

    const formatDeadline = (dateString) => {
        if (!dateString) return "No Deadline";
        return new Date(dateString).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    };

    if (loading) return <div className="p-5 text-center text-muted">Loading Tasks...</div>;

    return (
        <div className="container py-4">
            <h2 className="mb-1 text-dark">Daily Workforce Deployment</h2>
            <p className="text-muted border-bottom pb-3">Allocate daily duties and field deployments to staff across departments and wards.</p>

            {/* --- NEW SECTION: Status Dashboard --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm bg-primary text-white h-100">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase mb-1 opacity-75 small fw-bold">Total Tasks</h6>
                                <h2 className="mb-0 fw-bold">{totalTasks}</h2>
                            </div>
                            <div className="fs-1 opacity-50">📊</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm bg-warning text-dark h-100">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase mb-1 opacity-75 small fw-bold">Active Deployments</h6>
                                <h2 className="mb-0 fw-bold">{pendingTasks}</h2>
                            </div>
                            <div className="fs-1 opacity-50">⏳</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm bg-success text-white h-100">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase mb-1 opacity-75 small fw-bold">Completed</h6>
                                <h2 className="mb-0 fw-bold">{completedTasks}</h2>
                            </div>
                            <div className="fs-1 opacity-50">✅</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* ------------------------------------- */}

            {successMessage && (
                <div className="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
                    {successMessage}
                    <button type="button" className="btn-close" onClick={() => setSuccessMessage("")}></button>
                </div>
            )}

            {isAdmin ? (
                <div>
                    <h4 className="text-secondary mb-3">👥 Assign Tasks</h4>
                    <div className="row g-4 mb-5">
                        {employees.map(emp => (
                            <div key={emp.id} className="col-md-6 col-lg-4">
                                <div className="card h-100 shadow-sm border-0">
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title fw-bold text-dark">{emp.name}</h5>
                                        <p className="card-text text-muted small mb-1">{emp.post} • {emp.dept}</p>
                                        <p className="card-text text-muted small mb-3">{emp.email}</p>

                                        <button
                                            onClick={() => openAssignModal(emp)}
                                            className="btn btn-primary mt-auto w-100 fw-bold"
                                        >
                                            + Deploy Staff
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h4 className="text-secondary mb-3">📋 All Active Tasks</h4>
                    <div className="d-flex flex-column gap-3">
                        {tasks.length === 0 && <p className="text-muted fst-italic">No tasks assigned yet.</p>}
                        {tasks.map(task => (
                            <div key={task.id} className="card shadow-sm border-0 border-start border-4 border-primary">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h5 className="fw-bold text-dark mb-1">{task.title}</h5>
                                            <p className="text-muted small mb-2">
                                                Deployed To: <span className="fw-bold text-primary">{task.employeeName}</span>
                                                <span className="mx-2">|</span>
                                                <span className="text-danger fw-bold">Report By: {formatDeadline(task.dueDate)}</span>
                                            </p>
                                            <p className="text-secondary mb-1">{task.description}</p>
                                            {task.employeeNotes && (
                                                <div className="alert alert-light border mt-2 py-2 px-3 small">
                                                    <strong>Employee Update:</strong> {task.employeeNotes}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <span className={`badge rounded-pill ${task.status === 'Completed' ? 'bg-success' :
                                                    task.status === 'In Progress' ? 'bg-warning text-dark' : 'bg-secondary'
                                                }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {showModal && (
                        <>
                            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
                            <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content shadow-lg border-0">
                                        <div className="modal-header bg-primary text-white">
                                            <h5 className="modal-title fw-bold">Deploy Worker</h5>
                                            <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                        </div>
                                        <div className="modal-body p-4">
                                            <p className="text-muted mb-3">
                                                Deploying: <strong className="text-dark">{newTask.employeeName}</strong>
                                            </p>

                                            {errorMessage && (
                                                <div className="alert alert-danger py-2 small">
                                                    {errorMessage}
                                                </div>
                                            )}

                                            <form onSubmit={handleAssign}>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold small text-muted">Deployment Title / Duty</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={newTask.title}
                                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                                        required
                                                        autoFocus
                                                        placeholder="Enter task name..."
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold small text-muted">Reporting Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control"
                                                        value={newTask.dueDate}
                                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="form-label fw-bold small text-muted">Deployment Instructions</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="3"
                                                        value={newTask.description}
                                                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                                        placeholder="Enter task details..."
                                                    ></textarea>
                                                </div>
                                                <div className="d-grid gap-2">
                                                    <button type="submit" className="btn btn-primary fw-bold" disabled={submitting}>
                                                        {submitting ? (
                                                            <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Assigning...</span>
                                                        ) : (
                                                            "Confirm Deployment"
                                                        )}
                                                    </button>
                                                    <button type="button" className="btn btn-light text-muted" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            ) : (
                <div className="mx-auto" style={{ maxWidth: "800px" }}>
                    <h4 className="fw-bold text-secondary mb-4">My Assigned Tasks</h4>
                    {tasks.length === 0 ? (
                        <div className="text-center py-5 border rounded bg-light">
                            <p className="text-muted mb-0">No pending tasks found. Great work!</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-4">
                            {tasks.map(task => (
                                <div key={task.id} className="card shadow-sm border-0">
                                    <div className="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold text-dark mb-0">{task.title}</h5>
                                        <span className={`badge rounded-pill ${task.status === 'Completed' ? 'bg-success' :
                                                task.status === 'In Progress' ? 'bg-warning text-dark' : 'bg-secondary'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <p className="small text-muted mb-3">
                                            From Admin ({task.assignedBy})
                                        </p>

                                        <div className="alert alert-danger py-2 px-3 d-inline-block small fw-bold mb-3">
                                            ⏰ Due: {formatDeadline(task.dueDate)}
                                        </div>

                                        <div className="bg-light p-3 rounded mb-4 border">
                                            <label className="small fw-bold text-uppercase text-muted d-block mb-1">Description</label>
                                            <p className="mb-0 text-dark">{task.description}</p>
                                        </div>

                                        {task.employeeNotes && (
                                            <div className="mb-3 ps-3 border-start border-3 border-info">
                                                <small className="text-muted d-block">Your Note:</small>
                                                <span className="text-dark fst-italic">"{task.employeeNotes}"</span>
                                            </div>
                                        )}

                                        <div className="d-flex gap-2 border-top pt-3">
                                            <button
                                                onClick={() => handleUpdate(task.id, 'In Progress', task.employeeNotes)}
                                                disabled={task.status === 'Completed'}
                                                className="btn btn-outline-warning flex-fill fw-bold text-dark"
                                            >
                                                In Progress
                                            </button>
                                            <button
                                                onClick={() => handleUpdate(task.id, 'Completed', task.employeeNotes)}
                                                disabled={task.status === 'Completed'}
                                                className="btn btn-success flex-fill fw-bold text-white"
                                            >
                                                Mark Completed
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Tasks;