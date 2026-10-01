import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // =====================================================
    // FETCH MY APPLICATIONS
    // =====================================================

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setApplications([]);
                setLoading(false);
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/applications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("Applications:", response.data);

            setApplications(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {
            console.error(
                "Failed to load applications:",
                error.response?.data || error.message
            );

            setApplications([]);
        } finally {
            setLoading(false);
        }
    };


    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    useEffect(() => {
        fetchApplications();

        const interval = setInterval(() => {
            fetchApplications();
        }, 5000);

        return () => clearInterval(interval);
    }, []);


    // =====================================================
    // STATUS INDEX
    // =====================================================

    const getStatusIndex = (status) => {
        const statuses = [
            "Pending",
            "Submitted",
            "Accepted",
            "Rejected"
        ];

        return statuses.indexOf(status);
    };


    // =====================================================
    // STATUS BADGE CLASS
    // =====================================================

    const getStatusClass = (status) => {
        if (status === "Accepted") {
            return "accepted";
        }

        if (status === "Rejected") {
            return "rejected";
        }

        if (status === "Submitted") {
            return "submitted";
        }

        return "pending";
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <>
                <style>{styles}</style>

                <div className="applications-page">
                    <div className="applications-container">

                        <div className="applications-header">
                            <h1>My Applications</h1>
                            <p>
                                Track the progress of your internship
                                applications.
                            </p>
                        </div>

                        <div className="loading-box">
                            Loading applications...
                        </div>

                    </div>
                </div>
            </>
        );
    }


    // =====================================================
    // MAIN
    // =====================================================

    return (
        <>
            <style>{styles}</style>

            <div className="applications-page">

                <div className="applications-container">

                    {/* PAGE HEADER */}

                    <div className="applications-header">

                        <h1>
                            My Applications
                        </h1>

                        <p>
                            Track the progress of your internship
                            applications.
                        </p>

                    </div>


                    {/* =================================================
                        NO APPLICATIONS
                    ================================================= */}

                    {applications.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                📄
                            </div>

                            <h3>
                                No Applications Yet
                            </h3>

                            <p>
                                You haven't applied for any internships yet.
                            </p>

                        </div>

                    ) : (

                        /* =================================================
                           APPLICATION CARDS
                        ================================================= */

                        applications.map((application) => {

                            const status =
                                application.status || "Pending";

                            const currentIndex =
                                getStatusIndex(status);

                            const steps = [
                                "Pending",
                                "Submitted",
                                "Accepted",
                                "Rejected"
                            ];


                            return (

                                <div
                                    className="application-card"
                                    key={application.id}
                                >

                                    {/* =====================================
                                        APPLICATION INFORMATION
                                    ====================================== */}

                                    <div className="application-top">

                                        <div className="application-main-info">

                                            <h2 className="application-title">
                                                {
                                                    application.internship_title ||
                                                    application.title ||
                                                    application.internship_name ||
                                                    "Internship"
                                                }
                                            </h2>


                                            <div className="application-info">

                                                <div>
                                                    <strong>
                                                        Company:
                                                    </strong>{" "}

                                                    {
                                                        application.company ||
                                                        application.company_name ||
                                                        application.employer_name ||
                                                        "N/A"
                                                    }
                                                </div>


                                                <div>
                                                    <strong>
                                                        Location:
                                                    </strong>{" "}

                                                    {
                                                        application.location ||
                                                        application.internship_location ||
                                                        "N/A"
                                                    }
                                                </div>


                                                <div>
                                                    <strong>
                                                        Applied Date:
                                                    </strong>{" "}

                                                    {
                                                        application.applied_at
                                                            ? new Date(
                                                                  application.applied_at
                                                              ).toLocaleDateString()

                                                            : application.applied_date
                                                            ? new Date(
                                                                  application.applied_date
                                                              ).toLocaleDateString()

                                                            : application.created_at
                                                            ? new Date(
                                                                  application.created_at
                                                              ).toLocaleDateString()

                                                            : "N/A"
                                                    }

                                                </div>

                                            </div>

                                        </div>


                                        {/* CURRENT STATUS */}

                                        <span
                                            className={`status-badge ${getStatusClass(
                                                status
                                            )}`}
                                        >
                                            {status}
                                        </span>

                                    </div>


                                    {/* =====================================
                                        APPLICATION PROGRESS
                                    ====================================== */}

                                    <div className="timeline-section">

                                        <div className="timeline-title">
                                            Application Progress
                                        </div>


                                        <div className="status-timeline">

                                            {steps.map(
                                                (step, index) => {

                                                    const completed =
                                                        currentIndex >= index;

                                                    const active =
                                                        status === step;

                                                    const rejected =
                                                        status === "Rejected" &&
                                                        step === "Rejected";


                                                    return (

                                                        <div
                                                            key={step}
                                                            className={`
                                                                timeline-step
                                                                ${completed ? "completed" : ""}
                                                                ${active ? "active" : ""}
                                                                ${rejected ? "rejected" : ""}
                                                            `}
                                                        >

                                                            {/* NUMBER CIRCLE */}

                                                            <div className="timeline-circle">
                                                                {index + 1}
                                                            </div>


                                                            {/* STATUS NAME */}

                                                            <div className="timeline-label">
                                                                {step}
                                                            </div>

                                                        </div>

                                                    );
                                                }
                                            )}

                                        </div>

                                    </div>

                                </div>

                            );
                        })

                    )}

                </div>

            </div>
        </>
    );
}


// =====================================================
// CSS
// =====================================================

const styles = `

/* =====================================================
   PAGE
===================================================== */

.applications-page {
    min-height: 100vh;
    background: #f8fafc;
    padding: 45px 20px 70px;
}


/* =====================================================
   CONTAINER
===================================================== */

.applications-container {
    max-width: 1100px;
    margin: 0 auto;
}


/* =====================================================
   PAGE HEADER
===================================================== */

.applications-header {
    margin-bottom: 30px;
}

.applications-header h1 {
    margin: 0;
    font-size: 36px;
    font-weight: 700;
    color: #0f172a;
}

.applications-header p {
    margin-top: 8px;
    margin-bottom: 0;
    color: #64748b;
    font-size: 16px;
}


/* =====================================================
   APPLICATION CARD
===================================================== */

.application-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;

    padding: 28px 30px;
    margin-bottom: 24px;

    box-shadow:
        0 4px 15px rgba(15, 23, 42, 0.06);

    transition: 0.2s ease;
}

.application-card:hover {
    box-shadow:
        0 8px 24px rgba(15, 23, 42, 0.09);

    transform: translateY(-1px);
}


/* =====================================================
   APPLICATION TOP
===================================================== */

.application-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    gap: 20px;

    padding-bottom: 22px;

    border-bottom: 1px solid #e2e8f0;
}


/* =====================================================
   TITLE
===================================================== */

.application-title {
    font-size: 25px;
    font-weight: 700;

    color: #0f172a;

    margin: 0 0 16px;
}


/* =====================================================
   APPLICATION INFORMATION
===================================================== */

.application-info {
    display: grid;
    gap: 9px;

    color: #475569;

    font-size: 15px;
}

.application-info strong {
    color: #334155;
}


/* =====================================================
   STATUS BADGES
===================================================== */

.status-badge {
    display: inline-flex;

    align-items: center;
    justify-content: center;

    padding: 8px 17px;

    border-radius: 999px;

    font-size: 14px;
    font-weight: 700;

    white-space: nowrap;
}


/* Pending */

.status-badge.pending {
    background: #fef3c7;
    color: #92400e;
}


/* Submitted */

.status-badge.submitted {
    background: #dbeafe;
    color: #1d4ed8;
}


/* Accepted */

.status-badge.accepted {
    background: #dcfce7;
    color: #166534;
}


/* Rejected */

.status-badge.rejected {
    background: #fee2e2;
    color: #b91c1c;
}


/* =====================================================
   TIMELINE SECTION
===================================================== */

.timeline-section {
    padding-top: 28px;
}


/* =====================================================
   TIMELINE TITLE
===================================================== */

.timeline-title {
    font-size: 15px;
    font-weight: 700;

    color: #334155;

    margin-bottom: 25px;
}


/* =====================================================
   TIMELINE
===================================================== */

.status-timeline {
    display: flex;

    align-items: flex-start;

    position: relative;

    width: 100%;
}


/* =====================================================
   TIMELINE STEP
===================================================== */

.timeline-step {
    flex: 1;

    position: relative;

    text-align: center;
}


/* =====================================================
   CONNECTING LINE
===================================================== */

.timeline-step:not(:last-child)::after {

    content: "";

    position: absolute;

    top: 17px;

    left: 50%;

    width: 100%;

    height: 3px;

    background: #e2e8f0;

    z-index: 0;
}


/* Completed line */

.timeline-step.completed:not(:last-child)::after {
    background: #14b8a6;
}


/* =====================================================
   NUMBER CIRCLE
===================================================== */

.timeline-circle {

    width: 38px;
    height: 38px;

    margin: 0 auto 11px;

    border-radius: 50%;

    background: #ffffff;

    border: 3px solid #cbd5e1;

    display: flex;

    align-items: center;
    justify-content: center;

    position: relative;

    z-index: 2;

    font-size: 14px;

    font-weight: 700;

    color: #64748b;

    box-sizing: border-box;
}


/* Completed / Active */

.timeline-step.completed .timeline-circle,
.timeline-step.active .timeline-circle {

    background: #14b8a6;

    border-color: #14b8a6;

    color: #ffffff;
}


/* Rejected */

.timeline-step.rejected .timeline-circle {

    background: #dc2626;

    border-color: #dc2626;

    color: #ffffff;
}


/* =====================================================
   TIMELINE LABEL
===================================================== */

.timeline-label {

    font-size: 13px;

    font-weight: 600;

    color: #64748b;

    white-space: nowrap;
}


/* Active / Completed label */

.timeline-step.completed .timeline-label,
.timeline-step.active .timeline-label {

    color: #0f766e;
}


/* Rejected label */

.timeline-step.rejected .timeline-label {

    color: #b91c1c;
}


/* =====================================================
   EMPTY STATE
===================================================== */

.empty-state {

    background: #ffffff;

    border: 1px solid #e2e8f0;

    border-radius: 16px;

    padding: 55px 30px;

    text-align: center;

    box-shadow:
        0 4px 15px rgba(15, 23, 42, 0.05);
}


.empty-icon {

    font-size: 42px;

    margin-bottom: 12px;
}


.empty-state h3 {

    margin: 0 0 8px;

    color: #0f172a;
}


.empty-state p {

    color: #64748b;

    margin: 0;
}


/* =====================================================
   LOADING
===================================================== */

.loading-box {

    background: #ffffff;

    border-radius: 14px;

    padding: 40px;

    text-align: center;

    color: #64748b;
}


/* =====================================================
   MOBILE
===================================================== */

@media (max-width: 700px) {

    .applications-page {
        padding: 30px 14px;
    }


    .applications-header h1 {
        font-size: 29px;
    }


    .application-card {
        padding: 22px 18px;
    }


    .application-top {
        flex-direction: column;
    }


    .status-badge {
        align-self: flex-start;
    }


    .timeline-label {
        font-size: 11px;
    }


    .timeline-circle {

        width: 34px;
        height: 34px;

        font-size: 13px;
    }


    .timeline-step:not(:last-child)::after {
        top: 15px;
    }

}
`;