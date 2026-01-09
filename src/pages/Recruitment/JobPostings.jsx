import { useState, useEffect } from "react";
import { createJobPosting, getJobPostings, deleteJobPosting } from "../../backend";

export default function JobPostings() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        department: "",
        location: "Delhi",
        type: "Full-time",
        description: ""
    });

    useEffect(() => {
        loadJobs();
    }, []);

    async function loadJobs() {
        setLoading(true);
        const data = await getJobPostings(true);
        setJobs(data);
        setLoading(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.title || !formData.department) return;

        const result = await createJobPosting(formData);
        if (result.success) {
            alert("Job Posted Successfully!");
            setShowForm(false);
            setFormData({ title: "", department: "", location: "Delhi", type: "Full-time", description: "" });
            loadJobs();
        } else {
            alert("Error posting job");
        }
    }

    async function handleDelete(id) {
        if (confirm("Are you sure you want to delete this job posting?")) {
            await deleteJobPosting(id);
            loadJobs();
        }
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <h2 className="mb-0 fw-bold">Job Postings</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Cancel" : "+ Post New Job"}
                </button>
            </div>
            <div className="alert alert-info py-2 small mb-4">
                ℹ️ This module is designed for contractual and temporary workforce hiring and is integration-ready with existing government recruitment systems.
            </div>

            {showForm && (
                <div className="card shadow-sm mb-4 border-0">
                    <div className="card-body">
                        <h5 className="mb-3">Create New Job Posting</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Job Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Department</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Location</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Employment Type</label>
                                    <select
                                        className="form-control"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="col-12 text-end">
                                    <button type="submit" className="btn btn-success px-4">Post Job</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : jobs.length === 0 ? (
                <div className="text-center text-muted py-5">
                    <h4>No Active Job Postings</h4>
                    <p>Click "Post New Job" to start recruiting.</p>
                </div>
            ) : (
                <div className="row">
                    {jobs.map(job => (
                        <div key={job.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title fw-bold mb-0">{job.title}</h5>
                                        <span className={`badge ${job.status === 'open' ? 'bg-success' : 'bg-secondary'}`}>
                                            {job.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <h6 className="card-subtitle mb-2 text-muted">{job.department} • {job.location}</h6>
                                    <p className="card-text text-secondary small mb-3">
                                        {job.description?.substring(0, 100)}...
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <small className="text-muted">{job.type}</small>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDelete(job.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
