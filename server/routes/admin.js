const express = require("express");
const router = express.Router();

const db = require("../config/db");

const {
    verifyToken,
    checkRole
} = require("../middleware/authMiddleware");


// =====================================================
// ADMIN DASHBOARD STATISTICS
// GET /api/admin/stats
// =====================================================

router.get(
    "/stats",
    verifyToken,
    checkRole(["admin"]),
    (req, res) => {

        const queries = {

            users: `
                SELECT COUNT(*) AS total
                FROM users
            `,

            companies: `
                SELECT COUNT(*) AS total
                FROM employers
            `,

            internships: `
                SELECT COUNT(*) AS total
                FROM internships
            `,

            applications: `
                SELECT COUNT(*) AS total
                FROM applications
            `,

            pendingInternships: `
                SELECT COUNT(*) AS total
                FROM internships
                WHERE verification_status = 'Pending'
                   OR verification_status IS NULL
            `,

            pendingCompanies: `
                SELECT COUNT(*) AS total
                FROM employers
                WHERE verification_status = 'Pending'
                   OR verification_status IS NULL
            `
        };


        db.query(queries.users, (err, userResult) => {

            if (err) {
                console.error("Admin users stats error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Error fetching user statistics"
                });
            }


            db.query(queries.companies, (err, companyResult) => {

                if (err) {
                    console.error("Admin company stats error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Error fetching company statistics"
                    });
                }


                db.query(
                    queries.internships,
                    (err, internshipResult) => {

                        if (err) {
                            console.error(
                                "Admin internship stats error:",
                                err
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Error fetching internship statistics"
                            });
                        }


                        db.query(
                            queries.applications,
                            (err, applicationResult) => {

                                if (err) {
                                    console.error(
                                        "Admin application stats error:",
                                        err
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Error fetching application statistics"
                                    });
                                }


                                db.query(
                                    queries.pendingInternships,
                                    (err, pendingInternshipResult) => {

                                        if (err) {
                                            console.error(
                                                "Pending internship stats error:",
                                                err
                                            );

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Error fetching pending internship statistics"
                                            });
                                        }


                                        db.query(
                                            queries.pendingCompanies,
                                            (err, pendingCompanyResult) => {

                                                if (err) {
                                                    console.error(
                                                        "Pending company stats error:",
                                                        err
                                                    );

                                                    return res.status(500).json({
                                                        success: false,
                                                        message:
                                                            "Error fetching pending company statistics"
                                                    });
                                                }


                                                const totalUsers =
                                                    Number(
                                                        userResult[0]?.total
                                                    ) || 0;

                                                const totalCompanies =
                                                    Number(
                                                        companyResult[0]?.total
                                                    ) || 0;

                                                const totalInternships =
                                                    Number(
                                                        internshipResult[0]?.total
                                                    ) || 0;

                                                const totalApplications =
                                                    Number(
                                                        applicationResult[0]?.total
                                                    ) || 0;

                                                const pendingInternships =
                                                    Number(
                                                        pendingInternshipResult[0]?.total
                                                    ) || 0;

                                                const pendingCompanies =
                                                    Number(
                                                        pendingCompanyResult[0]?.total
                                                    ) || 0;

                                                const totalPending =
                                                    pendingInternships +
                                                    pendingCompanies;


                                                return res.json({
                                                    success: true,

                                                    users:
                                                        totalUsers,

                                                    companies:
                                                        totalCompanies,

                                                    internships:
                                                        totalInternships,

                                                    applications:
                                                        totalApplications,

                                                    pending:
                                                        totalPending,

                                                    pendingInternships:
                                                        pendingInternships,

                                                    pendingCompanies:
                                                        pendingCompanies
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            });
        });
    }
);


// =====================================================
// GET PENDING INTERNSHIPS AND EMPLOYERS
// GET /api/admin/pending
// =====================================================

router.get(
    "/pending",
    verifyToken,
    checkRole(["admin"]),
    (req, res) => {

        const internshipsQuery = `
            SELECT *
            FROM internships
            WHERE verification_status = 'Pending'
               OR verification_status IS NULL
            ORDER BY id DESC
        `;


        const employersQuery = `
            SELECT *
            FROM employers
            WHERE verification_status = 'Pending'
               OR verification_status IS NULL
            ORDER BY id DESC
        `;


        db.query(
            internshipsQuery,
            (err, pendingInternships) => {

                if (err) {
                    console.error(
                        "Pending internships error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Error fetching pending internships: " +
                            err.message
                    });
                }


                const formattedInternships =
                    (pendingInternships || []).map(item => ({
                        ...item,
                        _id: item.id
                    }));


                db.query(
                    employersQuery,
                    (err, pendingEmployers) => {

                        if (err) {
                            console.error(
                                "Pending employers error:",
                                err
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Error fetching pending employers: " +
                                    err.message
                            });
                        }


                        const formattedEmployers =
                            (pendingEmployers || []).map(item => ({
                                ...item,
                                _id: item.id
                            }));


                        return res.json({
                            success: true,

                            internships:
                                formattedInternships,

                            employers:
                                formattedEmployers
                        });
                    }
                );
            }
        );
    }
);


// =====================================================
// GET ALL USERS
// GET /api/admin/users
// =====================================================

router.get(
    "/users",
    verifyToken,
    checkRole(["admin"]),
    (req, res) => {

        const query = `
            SELECT
                id,
                name,
                email,
                role
            FROM users
            ORDER BY id DESC
        `;


        db.query(
            query,
            (err, users) => {

                if (err) {
                    console.error(
                        "Get users error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Error fetching users: " +
                            err.message
                    });
                }


                const formattedUsers =
                    (users || []).map(user => ({
                        ...user,
                        _id: user.id
                    }));


                return res.json({
                    success: true,
                    users: formattedUsers
                });
            }
        );
    }
);


// =====================================================
// GET ALL EMPLOYERS
// GET /api/admin/employers
// =====================================================

router.get(
    "/employers",
    verifyToken,
    checkRole(["admin"]),
    (req, res) => {

        const query = `
            SELECT *
            FROM employers
            ORDER BY id DESC
        `;


        db.query(
            query,
            (err, employers) => {

                if (err) {
                    console.error(
                        "Get employers error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Error fetching employers: " +
                            err.message
                    });
                }


                const formattedEmployers =
                    (employers || []).map(employer => ({
                        ...employer,
                        _id: employer.id
                    }));


                return res.json({
                    success: true,
                    employers: formattedEmployers
                });
            }
        );
    }
);


// =====================================================
// GET ALL APPLICATIONS
// GET /api/admin/applications
// =====================================================

router.get(
    "/applications",
    verifyToken,
    checkRole(["admin"]),
    (req, res) => {

        const query = `
            SELECT

                a.id,
                a.student_id,
                a.internship_id,

                a.full_name,
                a.address,
                a.phone,
                a.education,
                a.gpa,
                a.skills,
                a.experience,
                a.resume_link,
                a.status,
                a.applied_at,

                s.user_id,

                u.name AS student_name,
                u.email AS student_email,

                i.title AS internship_title,
                i.company AS company,
                i.location AS location,
                i.stipend AS stipend,
                i.deadline AS deadline

            FROM applications a

            LEFT JOIN students s
                ON a.student_id = s.id

            LEFT JOIN users u
                ON s.user_id = u.id

            LEFT JOIN internships i
                ON a.internship_id = i.id

            ORDER BY a.id DESC
        `;


        db.query(
            query,
            (err, applications) => {

                if (err) {
                    console.error(
                        "Admin applications error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Error fetching applications: " +
                            err.message
                    });
                }


                const formattedApplications =
                    (applications || []).map(application => ({

                        ...application,

                        _id:
                            application.id,

                        application_id:
                            application.id,

                        candidate:
                            application.student_name ||
                            application.full_name ||
                            "N/A",

                        email:
                            application.student_email ||
                            "N/A",

                        internship:
                            application.internship_title ||
                            "N/A",

                        applied_date:
                            application.applied_at,

                        resume:
                            application.resume_link,

                        status:
                            application.status ||
                            "Pending"
                    }));


                return res.json({

                    success: true,

                    applications:
                        formattedApplications
                });
            }
        );
    }
);


// =====================================================
// VERIFY / APPROVE / REJECT INTERNSHIP
// PUT /api/admin/internships/:id/verify
// =====================================================

router.put(
    "/internships/:id/verify",
    verifyToken,
    checkRole(["admin"]),
    (req, res) => {

        const { id } = req.params;

        const { status } = req.body;


        let finalStatus;

        if (status === "Rejected") {
            finalStatus = "Rejected";
        } else {
            finalStatus = "Verified";
        }


        const approvalValue =
            finalStatus === "Verified"
                ? 1
                : 0;


        db.query(
            `
                SELECT
                    posted_by,
                    title
                FROM internships
                WHERE id = ?
            `,
            [id],
            (err, rows) => {

                if (err) {
                    console.error(
                        "Find internship error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to find internship: " +
                            err.message
                    });
                }


                if (!rows || rows.length === 0) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Internship not found"
                    });
                }


                const postedBy =
                    rows[0].posted_by;

                const jobTitle =
                    rows[0].title ||
                    "Internship";


                db.query(
                    `
                        UPDATE internships
                        SET
                            verification_status = ?,
                            is_approved = ?
                        WHERE id = ?
                    `,
                    [
                        finalStatus,
                        approvalValue,
                        id
                    ],
                    (err) => {

                        if (err) {
                            console.error(
                                "Update internship error:",
                                err
                            );

                            return res.status(400).json({
                                success: false,
                                message:
                                    "Failed to update internship: " +
                                    err.message
                            });
                        }


                        // -----------------------------------------
                        // NOTIFICATION
                        // -----------------------------------------

                        if (postedBy) {

                            db.query(
                                `
                                    INSERT INTO notifications
                                    (
                                        user_id,
                                        title,
                                        message,
                                        type
                                    )
                                    VALUES (?, ?, ?, ?)
                                `,
                                [
                                    postedBy,

                                    "Internship Status Updated",

                                    `Your internship listing "${jobTitle}" has been ${finalStatus.toLowerCase()}.`,

                                    "verification"
                                ],
                                notificationError => {

                                    if (notificationError) {

                                        console.error(
                                            "Internship notification error:",
                                            notificationError
                                        );
                                    }
                                }
                            );
                        }


                        return res.json({

                            success: true,

                            message:
                                finalStatus === "Verified"
                                    ? "Internship approved successfully"
                                    : "Internship rejected successfully",

                            status:
                                finalStatus
                        });
                    }
                );
            }
        );
    }
);


// =====================================================
// VERIFY / APPROVE / REJECT EMPLOYER
// PUT /api/admin/employers/:id/verify
// =====================================================

router.put(
    "/employers/:id/verify",
    verifyToken,
    checkRole(["admin"]),
    (req, res) => {

        const { id } = req.params;

        const { status } = req.body;


        let finalStatus;

        if (status === "Rejected") {
            finalStatus = "Rejected";
        } else {
            finalStatus = "Verified";
        }


        db.query(
            `
                UPDATE employers
                SET verification_status = ?
                WHERE id = ?
            `,
            [
                finalStatus,
                id
            ],
            (err) => {

                if (err) {
                    console.error(
                        "Update employer error:",
                        err
                    );

                    return res.status(400).json({
                        success: false,
                        message:
                            "Failed to update employer: " +
                            err.message
                    });
                }


                // -----------------------------------------
                // NOTIFICATION
                // -----------------------------------------

                db.query(
                    `
                        INSERT INTO notifications
                        (
                            user_id,
                            title,
                            message,
                            type
                        )
                        VALUES (?, ?, ?, ?)
                    `,
                    [
                        id,

                        "Account Verification",

                        `Your employer account has been ${finalStatus.toLowerCase()}.`,

                        "verification"
                    ],
                    notificationError => {

                        if (notificationError) {

                            console.error(
                                "Employer notification error:",
                                notificationError
                            );
                        }
                    }
                );


                return res.json({

                    success: true,

                    message:
                        finalStatus === "Verified"
                            ? "Employer approved successfully"
                            : "Employer rejected successfully",

                    status:
                        finalStatus
                });
            }
        );
    }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;