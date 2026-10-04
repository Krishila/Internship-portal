import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyApplications.css";

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
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Applications:", response.data);

            // =================================================
            // IMPORTANT FIX
            // Backend response:
            // {
            //     success: true,
            //     applications: [...]
            // }
            // =================================================

            if (response.data?.success) {

                setApplications(
                    Array.isArray(response.data.applications)
                        ? response.data.applications
                        : []
                );

            } else if (Array.isArray(response.data)) {

                // Supports direct array response also
                setApplications(response.data);

            } else {

                setApplications([]);

            }

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

        // Refresh every 5 seconds
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
            "Rejected",
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
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        const formattedDate = new Date(date);

        if (isNaN(formattedDate.getTime())) {
            return "N/A";
        }

        return formattedDate.toLocaleDateString();

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="applications-page">

                <div className="applications-container">

                    <div className="applications-header">

                        <h1>
                            My Applications
                        </h1>

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

        );

    }


    // =====================================================
    // MAIN
    // =====================================================

    return (

        <div className="applications-page">

            <div className="applications-container">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

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

                    <div className="applications-list">

                        {applications.map((application) => {

                            const status =
                                application.status || "Pending";


                            const currentIndex =
                                getStatusIndex(status);


                            const steps = [
                                "Pending",
                                "Submitted",
                                "Accepted",
                                "Rejected",
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


                                            {/* INTERNSHIP TITLE */}

                                            <h2 className="application-title">

                                                {
                                                    application.internship_title ||
                                                    application.title ||
                                                    application.internship_name ||
                                                    "Internship"
                                                }

                                            </h2>


                                            {/* APPLICATION INFORMATION */}

                                            <div className="application-info">


                                                {/* COMPANY */}

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


                                                {/* LOCATION */}

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


                                                {/* APPLIED DATE */}

                                                <div>

                                                    <strong>
                                                        Applied Date:
                                                    </strong>{" "}

                                                    {
                                                        formatDate(
                                                            application.applied_at ||
                                                            application.applied_date ||
                                                            application.created_at
                                                        )
                                                    }

                                                </div>


                                            </div>


                                        </div>


                                        {/* =================================
                                            CURRENT STATUS
                                        ================================== */}

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

                        })}

                    </div>

                )}

            </div>

        </div>

    );

}