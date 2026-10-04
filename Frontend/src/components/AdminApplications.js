import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function AdminApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // FETCH ALL APPLICATIONS
    // =====================================================

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Admin login session not found.");
                return;
            }

            const response = await axios.get(
                `${API}/api/admin/applications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Admin applications response:", response.data);

            const data = response.data;

            if (Array.isArray(data)) {
                setApplications(data);
            } else if (Array.isArray(data?.applications)) {
                setApplications(data.applications);
            } else {
                setApplications([]);
            }

        } catch (err) {
            console.error(
                "Admin applications error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to load applications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // =====================================================
    // STATUS BADGE
    // =====================================================

    const getStatusBadge = (status) => {
        const value = String(status || "Pending").toLowerCase();

        if (value === "accepted" || value === "selected") {
            return (
                <span className="badge bg-success">
                    Accepted
                </span>
            );
        }

        if (value === "rejected") {
            return (
                <span className="badge bg-danger">
                    Rejected
                </span>
            );
        }

        if (value === "shortlisted") {
            return (
                <span className="badge bg-info text-dark">
                    Shortlisted
                </span>
            );
        }

        if (
            value === "under review" ||
            value === "review"
        ) {
            return (
                <span className="badge bg-warning text-dark">
                    Under Review
                </span>
            );
        }

        if (value === "submitted") {
            return (
                <span className="badge bg-primary">
                    Submitted
                </span>
            );
        }

        return (
            <span className="badge bg-secondary">
                Pending
            </span>
        );
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "N/A";
        }

        return parsed.toLocaleDateString();
    };

    // =====================================================
    // VIEW RESUME
    // =====================================================

    const viewResume = (resume) => {
        if (!resume) {
            alert("Resume/CV is not available.");
            return;
        }

        // Base64 / data URL
        if (resume.startsWith("data:")) {
            const newWindow = window.open();

            if (!newWindow) {
                alert("Please allow popups to view the CV.");
                return;
            }

            newWindow.document.write(`
                <html>
                    <head>
                        <title>Student CV</title>
                    </head>
                    <body style="margin:0;">
                        <iframe
                            src="${resume}"
                            style="
                                width:100%;
                                height:100vh;
                                border:none;
                            "
                        ></iframe>
                    </body>
                </html>
            `);

            newWindow.document.close();
            return;
        }

        // Normal URL
        if (
            resume.startsWith("http://") ||
            resume.startsWith("https://")
        ) {
            window.open(
                resume,
                "_blank",
                "noopener,noreferrer"
            );

            return;
        }

        // Uploaded filename
        window.open(
            `${API}/uploads/${resume}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = () => {
        fetchApplications();
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="container-fluid py-4">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="fw-bold mb-1">
                        All Applications
                    </h2>

                    <p className="text-muted mb-0">
                        View and monitor all student internship applications.
                    </p>
                </div>

                <button
                    className="btn btn-outline-primary"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    🔄 Refresh
                </button>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
                <div className="text-center py-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    ></div>

                    <p className="text-muted mt-3">
                        Loading applications...
                    </p>

                </div>
            ) : (
                <>
                    {/* =================================================
                        SUMMARY
                    ================================================= */}

                    <div className="row g-3 mb-4">

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <small className="text-muted">
                                        Total Applications
                                    </small>

                                    <h3 className="fw-bold mb-0">
                                        {applications.length}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <small className="text-muted">
                                        Pending
                                    </small>

                                    <h3 className="fw-bold mb-0 text-warning">
                                        {
                                            applications.filter(
                                                (app) =>
                                                    String(
                                                        app.status || "Pending"
                                                    ).toLowerCase() ===
                                                    "pending"
                                            ).length
                                        }
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <small className="text-muted">
                                        Accepted
                                    </small>

                                    <h3 className="fw-bold mb-0 text-success">
                                        {
                                            applications.filter(
                                                (app) =>
                                                    ["accepted", "selected"]
                                                        .includes(
                                                            String(
                                                                app.status || ""
                                                            ).toLowerCase()
                                                        )
                                            ).length
                                        }
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <small className="text-muted">
                                        Rejected
                                    </small>

                                    <h3 className="fw-bold mb-0 text-danger">
                                        {
                                            applications.filter(
                                                (app) =>
                                                    String(
                                                        app.status || ""
                                                    ).toLowerCase() ===
                                                    "rejected"
                                            ).length
                                        }
                                    </h3>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* =================================================
                        APPLICATION TABLE
                    ================================================= */}

                    <div className="card border-0 shadow-sm">

                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">
                                Student Applications
                            </h5>
                        </div>

                        <div className="card-body p-0">

                            <div className="table-responsive">

                                <table className="table table-hover align-middle mb-0">

                                    <thead className="table-light">

                                        <tr>
                                            <th>#</th>
                                            <th>Candidate</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Education</th>
                                            <th>GPA</th>
                                            <th>Skills</th>
                                            <th>Experience</th>
                                            <th>Internship</th>
                                            <th>Company</th>
                                            <th>Applied</th>
                                            <th>Resume</th>
                                            <th>Status</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {applications.length > 0 ? (

                                            applications.map(
                                                (app, index) => (

                                                    <tr
                                                        key={
                                                            app.id ||
                                                            app.application_id ||
                                                            index
                                                        }
                                                    >

                                                        {/* NUMBER */}
                                                        <td>
                                                            {index + 1}
                                                        </td>

                                                        {/* CANDIDATE */}
                                                        <td>
                                                            <strong>
                                                                {
                                                                    app.candidate ||
                                                                    app.student_name ||
                                                                    app.full_name ||
                                                                    "N/A"
                                                                }
                                                            </strong>
                                                        </td>

                                                        {/* EMAIL */}
                                                        <td>
                                                            {
                                                                app.email ||
                                                                app.student_email ||
                                                                "N/A"
                                                            }
                                                        </td>

                                                        {/* PHONE */}
                                                        <td>
                                                            {
                                                                app.phone ||
                                                                "N/A"
                                                            }
                                                        </td>

                                                        {/* EDUCATION */}
                                                        <td>
                                                            {
                                                                app.education ||
                                                                "N/A"
                                                            }
                                                        </td>

                                                        {/* GPA */}
                                                        <td>
                                                            {
                                                                app.gpa !== null &&
                                                                app.gpa !== undefined &&
                                                                app.gpa !== ""
                                                                    ? app.gpa
                                                                    : "N/A"
                                                            }
                                                        </td>

                                                        {/* SKILLS */}
                                                        <td
                                                            style={{
                                                                minWidth:
                                                                    "180px",
                                                            }}
                                                        >
                                                            {
                                                                app.skills ||
                                                                "N/A"
                                                            }
                                                        </td>

                                                        {/* EXPERIENCE */}
                                                        <td
                                                            style={{
                                                                minWidth:
                                                                    "180px",
                                                            }}
                                                        >
                                                            {
                                                                app.experience ||
                                                                "N/A"
                                                            }
                                                        </td>

                                                        {/* INTERNSHIP */}
                                                        <td>
                                                            <strong>
                                                                {
                                                                    app.internship ||
                                                                    app.internship_title ||
                                                                    app.title ||
                                                                    "N/A"
                                                                }
                                                            </strong>
                                                        </td>

                                                        {/* COMPANY */}
                                                        <td>
                                                            {
                                                                app.company ||
                                                                app.company_name ||
                                                                "N/A"
                                                            }
                                                        </td>

                                                        {/* APPLIED DATE */}
                                                        <td>
                                                            {formatDate(
                                                                app.applied_date ||
                                                                app.applied_at
                                                            )}
                                                        </td>

                                                        {/* RESUME */}
                                                        <td>

                                                            {app.resume_link ? (

                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() =>
                                                                        viewResume(
                                                                            app.resume_link
                                                                        )
                                                                    }
                                                                >
                                                                    View CV
                                                                </button>

                                                            ) : (

                                                                <span className="text-muted">
                                                                    No CV
                                                                </span>

                                                            )}

                                                        </td>

                                                        {/* STATUS */}
                                                        <td>
                                                            {
                                                                getStatusBadge(
                                                                    app.status
                                                                )
                                                            }
                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        ) : (

                                            <tr>

                                                <td
                                                    colSpan="13"
                                                    className="text-center py-5"
                                                >

                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "45px",
                                                        }}
                                                    >
                                                        📄
                                                    </div>

                                                    <h5 className="mt-2">
                                                        No applications found
                                                    </h5>

                                                    <p className="text-muted mb-0">
                                                        No students have applied
                                                        for internships yet.
                                                    </p>

                                                </td>

                                            </tr>

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>
                </>
            )}

        </div>
    );
}