import { useState, useEffect } from "react";
import { getJobPostings, submitApplication } from "../../backend";

export default function Careers({ onBack }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [application, setApplication] = useState({
        name: "",
        email: "",
        phone: "",
        resumeLink: ""
    });

    useEffect(() => {
        async function loadJobs() {
            setLoading(true);
            const data = await getJobPostings(false); // Fetch open jobs
            setJobs(data);
            setLoading(false);
        }
        loadJobs();
    }, []);

    async function handleApply(e) {
        e.preventDefault();
        if (!selectedJob) return;

        const result = await submitApplication({
            ...application,
            jobId: selectedJob.id,
            jobTitle: selectedJob.title
        });

        if (result.success) {
            alert("Application Submitted Successfully!");
            setSelectedJob(null);
            setApplication({ name: "", email: "", phone: "", resumeLink: "" });
        } else {
            alert("Error submitting application. Please try again.");
        }
    }

    return (
        <div className="min-vh-100 bg-light">
            {/* Header */}
            <div className="bg-white shadow-sm py-3 mb-5">
                <div className="container d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px", fontSize: "1.2rem", fontWeight: "bold" }}>M</div>
                        <div>
                            <h5 className="mb-0 fw-bold text-primary">MCD Careers</h5>
                            <small className="text-muted">Join our team</small>
                        </div>
                    </div>
                    {onBack && (
                        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
                            Back to Login
                        </button>
                    )}
                </div>
            </div>

            <div className="container pb-5">
                {selectedJob ? (
                    // Application Form
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <button className="btn btn-link text-decoration-none mb-3 ps-0" onClick={() => setSelectedJob(null)}>
                                ← Back to Jobs
                            </button>
                            <div className="card shadow border-0 rounded-4">
                                <div className="card-body p-5">
                                    <h3 className="fw-bold mb-1">Apply for {selectedJob.title}</h3>
                                    <p className="text-muted mb-4">{selectedJob.department} • {selectedJob.location}</p>

                                    <form onSubmit={handleApply}>
                                        <div className="mb-3">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={application.name}
                                                onChange={e => setApplication({ ...application, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Email Address</label>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-lg"
                                                    value={application.email}
                                                    onChange={e => setApplication({ ...application, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    className="form-control form-control-lg"
                                                    value={application.phone}
                                                    onChange={e => setApplication({ ...application, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label">Resume Link (Google Drive/Dropbox)</label>
                                            <input
                                                type="url"
                                                className="form-control form-control-lg"
                                                placeholder="https://..."
                                                value={application.resumeLink}
                                                onChange={e => setApplication({ ...application, resumeLink: e.target.value })}
                                                required
                                            />
                                            <div className="form-text">Please ensure the link is publicly accessible.</div>
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold">Submit Application</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Job List
                    <>
                        <div className="text-center mb-5">
                            <h1 className="fw-bold display-6">Current Openings</h1>
                            <p className="text-muted">Explore opportunities to make a difference in Delhi.</p>
                        </div>

                        {loading ? (
                            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <h4>No current openings</h4>
                                <p>Please check back later.</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {jobs.map(job => (
                                    <div key={job.id} className="col-md-6 col-lg-4">
                                        <div className="card h-100 border-0 shadow-sm hover-shadow transition-all" style={{ transition: "all 0.3s" }}>
                                            <div className="card-body p-4 d-flex flex-column">
                                                <div className="mb-3">
                                                    <span className="badge bg-light text-primary mb-2">{job.department}</span>
                                                    <h4 className="card-title fw-bold mb-1">{job.title}</h4>
                                                    <small className="text-muted">{job.location} • {job.type}</small>
                                                </div>
                                                <p className="card-text text-secondary mb-4 flex-grow-1" style={{ fontSize: "0.95rem" }}>
                                                    {job.description?.substring(0, 120)}...
                                                </p>
                                                <button
                                                    className="btn btn-outline-primary w-100 fw-bold"
                                                    onClick={() => setSelectedJob(job)}
                                                >
                                                    View & Apply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
