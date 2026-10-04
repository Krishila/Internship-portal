import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

export default function AdminDashboard({ onNavigate }) {

    // =====================================================
    // STATS
    // =====================================================

    const [stats, setStats] = useState({
        users: 0,
        companies: 0,
        internships: 0,
        applications: 0,
        pending: 0,
        pendingInternships: 0,
        pendingCompanies: 0,
    });

    // =====================================================
    // PENDING DATA
    // =====================================================

    const [pendingInternships, setPendingInternships] = useState([]);
    const [pendingEmployers, setPendingEmployers] = useState([]);

    // =====================================================
    // LOADING
    // =====================================================

    const [loading, setLoading] = useState(true);
    const [pendingLoading, setPendingLoading] = useState(true);

    // =====================================================
    // ERROR
    // =====================================================

    const [error, setError] = useState("");

    // =====================================================
    // FETCH ON PAGE LOAD
    // =====================================================

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // =====================================================
    // FETCH DASHBOARD DATA
    // =====================================================

    const fetchDashboardData = async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Admin login session not found.");
            setLoading(false);
            setPendingLoading(false);
            return;
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        // =================================================
        // FETCH STATS
        // =================================================

        try {

            setLoading(true);

            const response = await axios.get(
                "http://localhost:5000/api/admin/stats",
                config
            );

            const data = response.data || {};

            setStats({
                users: Number(data.users) || 0,
                companies: Number(data.companies) || 0,
                internships: Number(data.internships) || 0,
                applications: Number(data.applications) || 0,
                pending: Number(data.pending) || 0,
                pendingInternships:
                    Number(data.pendingInternships) || 0,
                pendingCompanies:
                    Number(data.pendingCompanies) || 0,
            });

        } catch (err) {

            console.error(
                "Admin stats error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to load dashboard statistics."
            );

        } finally {

            setLoading(false);
        }

        // =================================================
        // FETCH PENDING APPROVALS
        // =================================================

        try {

            setPendingLoading(true);

            const response = await axios.get(
                "http://localhost:5000/api/admin/pending",
                config
            );

            const data = response.data || {};

            const internships =
                Array.isArray(data.internships)
                    ? data.internships
                    : [];

            const employers =
                Array.isArray(data.employers)
                    ? data.employers
                    : [];

            setPendingInternships(internships);
            setPendingEmployers(employers);

            // Keep pending numbers synchronized
            setStats((previous) => ({
                ...previous,

                pending:
                    internships.length +
                    employers.length,

                pendingInternships:
                    internships.length,

                pendingCompanies:
                    employers.length,
            }));

        } catch (err) {

            console.error(
                "Pending approvals error:",
                err.response?.data || err.message
            );

        } finally {

            setPendingLoading(false);
        }
    };

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = () => {
        fetchDashboardData();
    };

    // =====================================================
    // NAVIGATION HELPER
    // =====================================================

    const navigateTo = (page) => {

        if (typeof onNavigate === "function") {
            onNavigate(page);
        }

    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        try {

            return new Date(date).toLocaleDateString();

        } catch {

            return "N/A";
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="admin-dashboard">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="admin-page-header">

                <div>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Manage companies, internships,
                        users and applications.
                    </p>

                </div>

                <button
                    className="refresh-btn"
                    onClick={handleRefresh}
                    disabled={loading || pendingLoading}
                >
                    🔄 Refresh
                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="admin-stats-grid">


                {/* =================================================
                    USERS
                ================================================= */}

                <button
                    type="button"
                    className="admin-stat-card clickable-card"
                    onClick={() =>
                        navigateTo("admin-users")
                    }
                >

                    <div className="stat-icon">
                        👥
                    </div>

                    <div>

                        <span>
                            Total Users
                        </span>

                        <h2>
                            {loading
                                ? "..."
                                : stats.users}
                        </h2>

                    </div>

                </button>


                {/* =================================================
                    COMPANIES
                ================================================= */}

                <button
                    type="button"
                    className="admin-stat-card clickable-card"
                    onClick={() =>
                        navigateTo("admin-employers")
                    }
                >

                    <div className="stat-icon">
                        🏢
                    </div>

                    <div>

                        <span>
                            Companies
                        </span>

                        <h2>
                            {loading
                                ? "..."
                                : stats.companies}
                        </h2>

                    </div>

                </button>


                {/* =================================================
                    INTERNSHIPS
                ================================================= */}

                <button
                    type="button"
                    className="admin-stat-card clickable-card"
                    onClick={() =>
                        navigateTo("admin-verification")
                    }
                >

                    <div className="stat-icon">
                        💼
                    </div>

                    <div>

                        <span>
                            Internships
                        </span>

                        <h2>
                            {loading
                                ? "..."
                                : stats.internships}
                        </h2>

                    </div>

                </button>


                {/* =================================================
                    APPLICATIONS
                ================================================= */}

                <button
                    type="button"
                    className="admin-stat-card clickable-card"
                    onClick={() =>
                        navigateTo("admin-applications")
                    }
                >

                    <div className="stat-icon">
                        📄
                    </div>

                    <div>

                        <span>
                            Applications
                        </span>

                        <h2>
                            {loading
                                ? "..."
                                : stats.applications}
                        </h2>

                    </div>

                </button>


                {/* =================================================
                    PENDING
                ================================================= */}

                <button
                    type="button"
                    className="admin-stat-card pending-card clickable-card"
                    onClick={() =>
                        navigateTo("admin-verification")
                    }
                >

                    <div className="stat-icon">
                        ⏳
                    </div>

                    <div>

                        <span>
                            Pending Approvals
                        </span>

                        <h2>
                            {loading
                                ? "..."
                                : stats.pending}
                        </h2>

                    </div>

                </button>

            </div>


            {/* =================================================
                MANAGEMENT
            ================================================= */}

            <div className="admin-section">

                <div className="section-heading">

                    <h2>
                        Management
                    </h2>

                    <p>
                        Quick access to administration pages.
                    </p>

                </div>


                <div className="admin-menu-grid">


                    {/* =================================================
                        COMPANIES
                    ================================================= */}

                    <button
                        type="button"
                        className="admin-menu-card"
                        onClick={() =>
                            navigateTo("admin-employers")
                        }
                    >

                        <div className="menu-icon">
                            🏢
                        </div>

                        <div>

                            <h3>
                                Companies
                            </h3>

                            <p>
                                Verify and manage employers
                            </p>

                        </div>

                    </button>


                    {/* =================================================
                        INTERNSHIPS
                    ================================================= */}

                    <button
                        type="button"
                        className="admin-menu-card"
                        onClick={() =>
                            navigateTo("admin-verification")
                        }
                    >

                        <div className="menu-icon">
                            💼
                        </div>

                        <div>

                            <h3>
                                Internships
                            </h3>

                            <p>
                                Approve and manage listings
                            </p>

                        </div>

                    </button>


                    {/* =================================================
                        USERS
                    ================================================= */}

                    <button
                        type="button"
                        className="admin-menu-card"
                        onClick={() =>
                            navigateTo("admin-users")
                        }
                    >

                        <div className="menu-icon">
                            👥
                        </div>

                        <div>

                            <h3>
                                Users
                            </h3>

                            <p>
                                Manage students and employers
                            </p>

                        </div>

                    </button>


                    {/* =================================================
                        APPLICATIONS
                    ================================================= */}

                    <button
                        type="button"
                        className="admin-menu-card"
                        onClick={() =>
                            navigateTo("admin-applications")
                        }
                    >

                        <div className="menu-icon">
                            📄
                        </div>

                        <div>

                            <h3>
                                Applications
                            </h3>

                            <p>
                                Monitor all applications
                            </p>

                        </div>

                    </button>


                    {/* =================================================
                        NOTIFICATIONS
                    ================================================= */}

                    <button
                        type="button"
                        className="admin-menu-card"
                        onClick={() =>
                            navigateTo("notifications")
                        }
                    >

                        <div className="menu-icon">
                            🔔
                        </div>

                        <div>

                            <h3>
                                Notifications
                            </h3>

                            <p>
                                View system notifications
                            </p>

                        </div>

                    </button>

                </div>

            </div>


            {/* =================================================
                PENDING APPROVALS
            ================================================= */}

            <div className="admin-section">

                {/* HEADER */}

                <div className="approval-header">

                    <div>

                        <h2>
                            Pending Approvals
                        </h2>

                        <p>
                            Review companies and internship
                            listings waiting for approval.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="view-all-btn"
                        onClick={() =>
                            navigateTo("admin-verification")
                        }
                    >
                        View All
                    </button>

                </div>


                {/* =================================================
                    PENDING CONTENT
                ================================================= */}

                <div className="approval-box">


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {pendingLoading && (

                        <div className="approval-empty">

                            <span>
                                Loading pending approvals...
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        NO PENDING DATA
                    ================================================= */}

                    {!pendingLoading &&
                        pendingInternships.length === 0 &&
                        pendingEmployers.length === 0 && (

                            <div className="approval-empty">

                                <div className="empty-icon">
                                    ✅
                                </div>

                                <h3>
                                    No Pending Approvals
                                </h3>

                                <p>
                                    There are currently no companies
                                    or internships waiting for approval.
                                </p>

                            </div>

                        )}


                    {/* =================================================
                        PENDING INTERNSHIPS
                    ================================================= */}

                    {!pendingLoading &&
                        pendingInternships.length > 0 && (

                            <>

                                <div className="approval-subheading">

                                    <h3>
                                        💼 Internship Listings
                                    </h3>

                                    <span>
                                        {pendingInternships.length}
                                    </span>

                                </div>


                                {pendingInternships.map(
                                    (internship) => (

                                        <div
                                            className="approval-item"
                                            key={
                                                internship.id ||
                                                internship._id
                                            }
                                        >

                                            <div className="approval-left">

                                                <div className="approval-icon">
                                                    💼
                                                </div>

                                                <div>

                                                    <h3>
                                                        {
                                                            internship.title ||
                                                            "Untitled Internship"
                                                        }
                                                    </h3>

                                                    <p>
                                                        <strong>
                                                            Company:
                                                        </strong>{" "}
                                                        {
                                                            internship.company ||
                                                            "N/A"
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Location:
                                                        </strong>{" "}
                                                        {
                                                            internship.location ||
                                                            "N/A"
                                                        }
                                                    </p>

                                                    <p className="approval-date">
                                                        Posted:{" "}
                                                        {
                                                            formatDate(
                                                                internship.created_at
                                                            )
                                                        }
                                                    </p>

                                                </div>

                                            </div>


                                            <button
                                                type="button"
                                                className="approve-page-btn"
                                                onClick={() =>
                                                    navigateTo(
                                                        "admin-verification"
                                                    )
                                                }
                                            >
                                                Review
                                            </button>

                                        </div>

                                    )
                                )}

                            </>

                        )}


                    {/* =================================================
                        PENDING COMPANIES
                    ================================================= */}

                    {!pendingLoading &&
                        pendingEmployers.length > 0 && (

                            <>

                                <div className="approval-subheading">

                                    <h3>
                                        🏢 Company Verification
                                    </h3>

                                    <span>
                                        {pendingEmployers.length}
                                    </span>

                                </div>


                                {pendingEmployers.map(
                                    (employer) => (

                                        <div
                                            className="approval-item"
                                            key={
                                                employer.id ||
                                                employer._id
                                            }
                                        >

                                            <div className="approval-left">

                                                <div className="approval-icon">
                                                    🏢
                                                </div>

                                                <div>

                                                    <h3>
                                                        {
                                                            employer.company_name ||
                                                            employer.name ||
                                                            employer.company ||
                                                            "Company"
                                                        }
                                                    </h3>

                                                    <p>
                                                        <strong>
                                                            Email:
                                                        </strong>{" "}
                                                        {
                                                            employer.email ||
                                                            "N/A"
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Status:
                                                        </strong>{" "}
                                                        {
                                                            employer.verification_status ||
                                                            "Pending"
                                                        }
                                                    </p>

                                                </div>

                                            </div>


                                            <button
                                                type="button"
                                                className="approve-page-btn"
                                                onClick={() =>
                                                    navigateTo(
                                                        "admin-employers"
                                                    )
                                                }
                                            >
                                                Review
                                            </button>

                                        </div>

                                    )
                                )}

                            </>

                        )}

                </div>

            </div>

        </div>
    );
}