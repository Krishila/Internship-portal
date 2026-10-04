import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EmployerDashboard.css";

export default function EmployerDashboard() {
    const [applications, setApplications] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(true);

    // ==========================================
    // FETCH APPLICATIONS
    // ==========================================

    const fetchApplications = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setErrorMsg("Please login again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await axios.get(
                "http://localhost:5000/api/employer/applications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("FULL APPLICATION RESPONSE:", response.data);

            // Backend response:
            // {
            //     success: true,
            //     applications: [...]
            // }

            const data = Array.isArray(response.data?.applications)
                ? response.data.applications
                : [];

            console.log("APPLICATIONS:", data);
            console.log("APPLICATION COUNT:", data.length);

            setApplications(data);
            setErrorMsg("");
        } catch (error) {
            console.error(
                "Fetch applications error:",
                error.response?.data || error.message
            );

            setErrorMsg(
                error.response?.data?.message ||
                    "Failed to load applications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // ==========================================
    // UPDATE APPLICATION STATUS
    // ==========================================

    const handleStatusChange = async (appId, newStatus) => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login again.");
            return;
        }

        if (!appId) {
            alert("Application ID is missing.");
            return;
        }

        try {
            await axios.put(
                `http://localhost:5000/api/employer/applications/${appId}/status`,
                {
                    status: newStatus,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update UI immediately
            setApplications((previousApplications) =>
                previousApplications.map((app) => {
                    const currentId = app.id ?? app.app_id;

                    if (
                        String(currentId) === String(appId)
                    ) {
                        return {
                            ...app,
                            status: newStatus,
                        };
                    }

                    return app;
                })
            );
        } catch (error) {
            console.error(
                "Update status error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                    "Failed to update application status."
            );
        }
    };

    // ==========================================
    // VIEW RESUME / CV
    // ==========================================

    const handleViewResume = (resumeData) => {
        if (!resumeData) {
            alert("No CV / Resume available.");
            return;
        }

        try {
            // ------------------------------------------
            // BASE64 FILE
            // ------------------------------------------

            if (
                typeof resumeData === "string" &&
                resumeData.startsWith("data:")
            ) {
                const parts = resumeData.split(",");

                if (parts.length < 2) {
                    throw new Error(
                        "Invalid base64 resume data"
                    );
                }

                const mimeMatch =
                    parts[0].match(/:(.*?);/);

                const mime =
                    mimeMatch?.[1] ||
                    "application/octet-stream";

                const binaryString = atob(parts[1]);

                const bytes = new Uint8Array(
                    binaryString.length
                );

                for (
                    let i = 0;
                    i < binaryString.length;
                    i++
                ) {
                    bytes[i] =
                        binaryString.charCodeAt(i);
                }

                const blob = new Blob([bytes], {
                    type: mime,
                });

                const blobUrl =
                    URL.createObjectURL(blob);

                window.open(
                    blobUrl,
                    "_blank",
                    "noopener,noreferrer"
                );

                // Clean URL later
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                }, 60000);

                return;
            }

            // ------------------------------------------
            // NORMAL URL
            // ------------------------------------------

            if (
                typeof resumeData === "string" &&
                resumeData.startsWith("http")
            ) {
                window.open(
                    resumeData,
                    "_blank",
                    "noopener,noreferrer"
                );

                return;
            }

            // ------------------------------------------
            // UPLOADED FILE NAME
            // ------------------------------------------

            const resumeUrl = `http://localhost:5000/uploads/${String(
                resumeData
            ).replace(/^\/+/, "")}`;

            window.open(
                resumeUrl,
                "_blank",
                "noopener,noreferrer"
            );
        } catch (error) {
            console.error(
                "Error opening resume:",
                error
            );

            alert("Unable to open CV / Resume.");
        }
    };

    // ==========================================
    // STATUS CLASS
    // ==========================================

    const getStatusClass = (status) => {
        const currentStatus =
            status || "Pending";

        return `app-status ${currentStatus
            .toLowerCase()
            .replace(/\s+/g, "-")}`;
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    // ==========================================
    // GET CANDIDATE NAME
    // ==========================================

    const getCandidateName = (app) => {
        return (
            app.student_name ||
            app.full_name ||
            app.name ||
            "N/A"
        );
    };

    // ==========================================
    // GET INITIAL
    // ==========================================

    const getCandidateInitial = (app) => {
        const name = getCandidateName(app);

        return name
            .charAt(0)
            .toUpperCase();
    };

    // ==========================================
    // GET EMAIL
    // ==========================================

    const getCandidateEmail = (app) => {
        return (
            app.student_email ||
            app.email ||
            "N/A"
        );
    };

    // ==========================================
    // GET PHONE
    // ==========================================

    const getCandidatePhone = (app) => {
        return (
            app.phone ||
            app.student_phone ||
            "N/A"
        );
    };

    // ==========================================
    // GET RESUME
    // ==========================================

    const getCandidateResume = (app) => {
        return (
            app.resume_link ||
            app.resume ||
            app.student_resume ||
            null
        );
    };

    // ==========================================
    // GET STATUS
    // ==========================================

    const getApplicationStatus = (app) => {
        const allowedStatuses = [
            "Pending",
            "Submitted",
            "Accepted",
            "Rejected",
        ];

        const status = app.status || "Pending";

        return allowedStatuses.includes(status)
            ? status
            : "Pending";
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="employer-dashboard">
                <div className="dashboard-header">
                    <div>
                        <h2>
                            Employer Dashboard
                        </h2>

                        <p>
                            Manage student applications
                            and applicant status.
                        </p>
                    </div>
                </div>

                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>

                    <p>
                        Loading applications...
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div className="employer-dashboard">

            {/* =====================================
                HEADER
            ====================================== */}

            <div className="dashboard-header">

                <div>
                    <h2>
                        Applicant Overview
                    </h2>

                    <p>
                        View student applications and
                        their qualifications.
                    </p>
                </div>

                <div className="application-count">
                    <span>
                        Total Applications
                    </span>

                    <strong>
                        {applications.length}
                    </strong>
                </div>

            </div>


            {/* =====================================
                ERROR
            ====================================== */}

            {errorMsg && (
                <div className="dashboard-error">
                    {errorMsg}
                </div>
            )}


            {/* =====================================
                APPLICATIONS CARD
            ====================================== */}

            <div className="applicants-card">

                <div className="applicants-card-header">

                    <div>
                        <h3>
                            Manage Applicants
                        </h3>

                        <p>
                            Review candidate information
                            and update application status.
                        </p>
                    </div>

                </div>


                {/* =================================
                    TABLE
                ================================== */}

                <div className="applicants-table-wrapper">

                    <table className="applicants-table">

                        <thead>
                            <tr>

                                <th className="col-number">
                                    #
                                </th>

                                <th className="col-candidate">
                                    Candidate
                                </th>

                                <th className="col-email">
                                    Email
                                </th>

                                <th className="col-phone">
                                    Phone
                                </th>

                                <th className="col-education">
                                    Education
                                </th>

                                <th className="col-gpa">
                                    GPA
                                </th>

                                <th className="col-skills">
                                    Skills
                                </th>

                                <th className="col-experience">
                                    Experience
                                </th>

                                <th className="col-internship">
                                    Internship
                                </th>

                                <th className="col-date">
                                    Applied
                                </th>

                                <th className="col-resume">
                                    Resume
                                </th>

                                <th className="col-status">
                                    Status
                                </th>

                                <th className="col-action">
                                    Action
                                </th>

                            </tr>
                        </thead>


                        <tbody>

                            {applications.length > 0 ? (

                                applications.map(
                                    (app, index) => {

                                        const uniqueId =
                                            app.id ??
                                            app.app_id ??
                                            index;

                                        const currentStatus =
                                            getApplicationStatus(
                                                app
                                            );

                                        const candidateName =
                                            getCandidateName(
                                                app
                                            );

                                        const email =
                                            getCandidateEmail(
                                                app
                                            );

                                        const phone =
                                            getCandidatePhone(
                                                app
                                            );

                                        const resume =
                                            getCandidateResume(
                                                app
                                            );

                                        return (
                                            <tr
                                                key={
                                                    uniqueId
                                                }
                                            >

                                                {/* NUMBER */}

                                                <td className="number-cell">
                                                    {index + 1}
                                                </td>


                                                {/* CANDIDATE */}

                                                <td>

                                                    <div className="candidate-cell">

                                                        <div className="candidate-avatar">
                                                            {
                                                                getCandidateInitial(
                                                                    app
                                                                )
                                                            }
                                                        </div>

                                                        <div className="candidate-info">

                                                            <div className="candidate-name">
                                                                {
                                                                    candidateName
                                                                }
                                                            </div>

                                                            <div className="candidate-label">
                                                                Applicant
                                                            </div>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* EMAIL */}

                                                <td>

                                                    <span className="email-text">
                                                        {
                                                            email
                                                        }
                                                    </span>

                                                </td>


                                                {/* PHONE */}

                                                <td>

                                                    <span className="phone-text">
                                                        {
                                                            phone
                                                        }
                                                    </span>

                                                </td>


                                                {/* EDUCATION */}

                                                <td>

                                                    <div className="education-text">
                                                        {
                                                            app.education &&
                                                            app.education !==
                                                                "N/A"
                                                                ? app.education
                                                                : "Not specified"
                                                        }
                                                    </div>

                                                </td>


                                                {/* GPA */}

                                                <td>

                                                    <span className="gpa-value">

                                                        {
                                                            app.gpa !==
                                                                null &&
                                                            app.gpa !==
                                                                undefined &&
                                                            app.gpa !==
                                                                "" &&
                                                            !Number.isNaN(
                                                                Number(
                                                                    app.gpa
                                                                )
                                                            )
                                                                ? Number(
                                                                      app.gpa
                                                                  ).toFixed(
                                                                      2
                                                                  )
                                                                : "N/A"
                                                        }

                                                    </span>

                                                </td>


                                                {/* SKILLS */}

                                                <td>

                                                    <div
                                                        className="table-description"
                                                        title={
                                                            app.skills ||
                                                            "Not specified"
                                                        }
                                                    >
                                                        {
                                                            app.skills &&
                                                            app.skills !==
                                                                "N/A"
                                                                ? app.skills
                                                                : "Not specified"
                                                        }
                                                    </div>

                                                </td>


                                                {/* EXPERIENCE */}

                                                <td>

                                                    <div
                                                        className="table-description"
                                                        title={
                                                            app.experience ||
                                                            "Not specified"
                                                        }
                                                    >
                                                        {
                                                            app.experience &&
                                                            app.experience !==
                                                                "N/A"
                                                                ? app.experience
                                                                : "Not specified"
                                                        }
                                                    </div>

                                                </td>


                                                {/* INTERNSHIP */}

                                                <td>

                                                    <div className="internship-title">
                                                        {
                                                            app.internship_title ||
                                                            app.title ||
                                                            "N/A"
                                                        }
                                                    </div>

                                                </td>


                                                {/* APPLIED DATE */}

                                                <td>

                                                    <span className="date-text">
                                                        {formatDate(
                                                            app.applied_at ||
                                                            app.applied_date
                                                        )}
                                                    </span>

                                                </td>


                                                {/* RESUME */}

                                                <td>

                                                    {resume ? (

                                                        <button
                                                            type="button"
                                                            className="view-cv-btn"
                                                            onClick={() =>
                                                                handleViewResume(
                                                                    resume
                                                                )
                                                            }
                                                        >

                                                            <span className="cv-icon">
                                                                ↗
                                                            </span>

                                                            View CV

                                                        </button>

                                                    ) : (

                                                        <span className="no-cv">
                                                            No CV
                                                        </span>

                                                    )}

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={getStatusClass(
                                                            currentStatus
                                                        )}
                                                    >

                                                        <span className="status-dot"></span>

                                                        {
                                                            currentStatus
                                                        }

                                                    </span>

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <select
                                                        value={
                                                            currentStatus
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleStatusChange(
                                                                uniqueId,
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        className="status-select"
                                                    >

                                                        <option value="Pending">
                                                            Pending
                                                        </option>

                                                        <option value="Submitted">
                                                            Submitted
                                                        </option>

                                                        <option value="Accepted">
                                                            Accepted
                                                        </option>

                                                        <option value="Rejected">
                                                            Rejected
                                                        </option>

                                                    </select>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="13"
                                        className="no-applications"
                                    >

                                        <div className="empty-icon">
                                            📄
                                        </div>

                                        <strong>
                                            No applications found
                                        </strong>

                                        <p>
                                            Student applications
                                            will appear here.
                                        </p>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}