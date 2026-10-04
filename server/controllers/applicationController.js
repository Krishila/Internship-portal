const db = require("../config/db");
const promiseDb = db.promise();


// ======================================================
// HELPER: NORMALIZE APPLICATION STATUS
// ======================================================

const normalizeStatus = (status) => {
    const allowedStatuses = [
        "Pending",
        "Submitted",
        "Accepted",
        "Rejected"
    ];

    if (!status) {
        return "Pending";
    }

    const found = allowedStatuses.find(
        item => item.toLowerCase() === String(status).toLowerCase()
    );

    return found || "Pending";
};


// ======================================================
// HELPER: CREATE NOTIFICATION
// ======================================================

const createNotification = async (
    userId,
    title,
    message,
    type = "application"
) => {

    try {

        if (!userId) {
            console.log("Notification skipped: user ID missing");
            return null;
        }

        const notificationUserId = Number(userId);

        if (!notificationUserId) {
            console.log(
                "Notification skipped: invalid user ID:",
                userId
            );
            return null;
        }

        const [result] = await promiseDb.query(
            `
            INSERT INTO notifications
            (
                user_id,
                title,
                message,
                type,
                is_read,
                created_at
            )
            VALUES (?, ?, ?, ?, 0, NOW())
            `,
            [
                notificationUserId,
                title,
                message,
                type
            ]
        );

        console.log(
            `Notification created successfully. ID: ${result.insertId}, User ID: ${notificationUserId}`
        );

        return result.insertId;

    } catch (error) {

        console.error(
            "CREATE NOTIFICATION ERROR:",
            error
        );

        return null;
    }
};


// ======================================================
// HELPER: CHECK INTERNSHIP APPROVAL
// ======================================================

const isInternshipApproved = (internship) => {

    const approved =
        Number(internship.is_approved) === 1;

    const verified =
        String(
            internship.verification_status || ""
        ).toLowerCase() === "verified";

    return approved && verified;
};


// ======================================================
// 1. APPLY TO INTERNSHIP
// ======================================================

exports.applyToInternship = async (req, res) => {

    console.log("\n========================================");
    console.log("APPLY TO INTERNSHIP");
    console.log("========================================");

    try {

        // --------------------------------------------------
        // LOGIN USER
        // --------------------------------------------------

        const loggedInUserId = req.user?.id;

        console.log(
            "Logged in user ID:",
            loggedInUserId
        );

        if (!loggedInUserId) {

            return res.status(401).json({
                success: false,
                message: "Please login first."
            });
        }


        // --------------------------------------------------
        // REQUEST BODY
        // --------------------------------------------------

        console.log(
            "Request body:",
            req.body
        );

        const {
            internship_id,
            full_name,
            phone,
            address,
            education,
            skills,
            experience,
            gpa,
            resume_link
        } = req.body;


        // --------------------------------------------------
        // BASIC VALIDATION
        // --------------------------------------------------

        if (!internship_id) {

            return res.status(400).json({
                success: false,
                message: "Internship ID is required."
            });
        }

        if (!full_name) {

            return res.status(400).json({
                success: false,
                message: "Full name is required."
            });
        }

        if (!phone) {

            return res.status(400).json({
                success: false,
                message: "Phone number is required."
            });
        }

        if (!resume_link) {

            return res.status(400).json({
                success: false,
                message: "Resume is required."
            });
        }


        // ==================================================
        // FIND STUDENT
        // ==================================================

        const [studentRows] = await promiseDb.query(
            `
            SELECT
                s.id AS student_id,
                s.user_id,
                u.id AS user_id_from_users,
                u.name AS user_name,
                u.email AS user_email
            FROM students s
            INNER JOIN users u
                ON s.user_id = u.id
            WHERE s.user_id = ?
            LIMIT 1
            `,
            [loggedInUserId]
        );


        if (studentRows.length === 0) {

            console.log(
                "Student not found for user:",
                loggedInUserId
            );

            return res.status(404).json({
                success: false,
                message: "Student profile not found."
            });
        }


        const student = studentRows[0];

        console.log(
            "Student found:",
            student
        );


        // IMPORTANT:
        // Always use users.id for notifications
        const studentUserId =
            Number(student.user_id_from_users);


        // ==================================================
        // FIND INTERNSHIP
        // ==================================================

        const [internshipRows] = await promiseDb.query(
            `
            SELECT
                id,
                title,
                company,
                location,
                stipend,
                deadline,
                posted_by,
                is_approved,
                verification_status
            FROM internships
            WHERE id = ?
            LIMIT 1
            `,
            [internship_id]
        );


        if (internshipRows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Internship not found."
            });
        }


        const internship =
            internshipRows[0];


        console.log(
            "Internship found:",
            internship
        );


        // ==================================================
        // CHECK ADMIN APPROVAL
        // ==================================================

        if (!isInternshipApproved(internship)) {

            return res.status(403).json({
                success: false,
                message:
                    "This internship has not been approved by admin."
            });
        }


        // ==================================================
        // CHECK DEADLINE
        // ==================================================

        if (internship.deadline) {

            const currentDate = new Date();

            const deadlineDate =
                new Date(internship.deadline);

            if (
                !isNaN(deadlineDate.getTime()) &&
                currentDate > deadlineDate
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Application deadline has passed."
                });
            }
        }


        // ==================================================
        // CHECK DUPLICATE APPLICATION
        // ==================================================

        const [existingApplications] =
            await promiseDb.query(
                `
                SELECT id
                FROM applications
                WHERE student_id = ?
                AND internship_id = ?
                LIMIT 1
                `,
                [
                    student.student_id,
                    internship_id
                ]
            );


        if (existingApplications.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "You have already applied for this internship."
            });
        }


        // ==================================================
        // SAFE DEFAULT VALUES
        // ==================================================

        const safeAddress =
            address || "N/A";

        const safeEducation =
            education || "N/A";

        const safeSkills =
            skills || "N/A";

        const safeExperience =
            experience || "N/A";


        let safeGpa = 0;

        if (
            gpa !== undefined &&
            gpa !== null &&
            gpa !== ""
        ) {

            safeGpa = Number(gpa);

            if (
                isNaN(safeGpa) ||
                safeGpa < 0 ||
                safeGpa > 4
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "GPA must be between 0 and 4."
                });
            }
        }


        // ==================================================
        // CREATE APPLICATION
        // ==================================================

        const applicationStatus =
            "Pending";


        const [applicationResult] =
            await promiseDb.query(
                `
                INSERT INTO applications
                (
                    student_id,
                    internship_id,
                    full_name,
                    phone,
                    address,
                    education,
                    skills,
                    experience,
                    gpa,
                    resume_link,
                    status,
                    applied_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `,
                [
                    student.student_id,
                    internship_id,
                    full_name,
                    phone,
                    safeAddress,
                    safeEducation,
                    safeSkills,
                    safeExperience,
                    safeGpa,
                    resume_link,
                    applicationStatus
                ]
            );


        const applicationId =
            applicationResult.insertId;


        console.log(
            "Application created successfully. ID:",
            applicationId
        );


        // ==================================================
        // APPLICATION STATUS HISTORY
        // ==================================================

        try {

            await promiseDb.query(
                `
                INSERT INTO application_status_history
                (
                    application_id,
                    old_status,
                    new_status,
                    changed_by,
                    changed_at
                )
                VALUES (?, ?, ?, ?, NOW())
                `,
                [
                    applicationId,
                    null,
                    applicationStatus,
                    loggedInUserId
                ]
            );

        } catch (historyError) {

            console.error(
                "STATUS HISTORY ERROR:",
                historyError
            );
        }


        // ==================================================
        // NOTIFY EMPLOYER
        // ==================================================

        try {

            if (internship.posted_by) {

                console.log(
                    "Creating employer notification for user:",
                    internship.posted_by
                );

                await createNotification(
                    internship.posted_by,
                    "New Application",
                    `${full_name} has applied for your internship "${internship.title}".`,
                    "application"
                );

            } else {

                console.log(
                    "Employer notification skipped: posted_by missing."
                );
            }

        } catch (employerNotificationError) {

            console.error(
                "EMPLOYER NOTIFICATION ERROR:",
                employerNotificationError
            );
        }


        // ==================================================
        // NOTIFY STUDENT
        // ==================================================

        try {

            console.log(
                "Creating student notification for user:",
                studentUserId
            );

            const studentNotificationId =
                await createNotification(
                    studentUserId,
                    "Application Submitted",
                    `Your application for "${internship.title}" has been submitted successfully.`,
                    "application"
                );


            console.log(
                "Student notification created successfully. Notification ID:",
                studentNotificationId
            );

            console.log(
                "Student notification user ID:",
                studentUserId
            );

        } catch (studentNotificationError) {

            console.error(
                "STUDENT NOTIFICATION ERROR:",
                studentNotificationError
            );
        }


        // ==================================================
        // NOTIFY ALL ADMINS
        // ==================================================

        try {

            const [admins] =
                await promiseDb.query(
                    `
                    SELECT id
                    FROM users
                    WHERE LOWER(role) = 'admin'
                    `
                );


            for (const admin of admins) {

                await createNotification(
                    admin.id,
                    "New Internship Application",
                    `${full_name} applied for "${internship.title}".`,
                    "application"
                );
            }


        } catch (adminNotificationError) {

            console.error(
                "ADMIN NOTIFICATION ERROR:",
                adminNotificationError
            );
        }


        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(201).json({
            success: true,
            message:
                "Application submitted successfully.",
            application_id:
                applicationId
        });


    } catch (error) {

        console.error(
            "\nAPPLY INTERNSHIP ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to submit application.",
            error:
                error.message
        });
    }
};


// ======================================================
// 2. GET STUDENT APPLICATIONS
// ======================================================

exports.getStudentApplications = async (req, res) => {

    try {

        const userId =
            req.user?.id;


        if (!userId) {

            return res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
        }


        const [rows] =
            await promiseDb.query(
                `
                SELECT
                    a.id,
                    a.student_id,
                    a.internship_id,

                    a.full_name,
                    a.phone,
                    a.address,
                    a.education,
                    a.skills,
                    a.experience,
                    a.gpa,

                    a.resume_link,
                    a.resume_link AS resume,

                    a.status,

                    a.applied_at,
                    a.applied_at AS applied_date,

                    i.title,
                    i.company,
                    i.location,
                    i.stipend,
                    i.deadline

                FROM applications a

                INNER JOIN students s
                    ON a.student_id = s.id

                INNER JOIN users u
                    ON s.user_id = u.id

                INNER JOIN internships i
                    ON a.internship_id = i.id

                WHERE s.user_id = ?

                ORDER BY a.applied_at DESC
                `,
                [userId]
            );


        return res.status(200).json({
            success: true,
            applications: rows
        });


    } catch (error) {

        console.error(
            "GET STUDENT APPLICATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch applications.",
            error:
                error.message
        });
    }
};


// ======================================================
// 3. GET APPLICATION STATUS HISTORY
// ======================================================

exports.getApplicationStatusHistory =
    async (req, res) => {

        try {

            const userId =
                req.user?.id;

            const applicationId =
                req.params.id;


            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "Unauthorized."
                });
            }


            // ------------------------------------------------
            // CHECK APPLICATION OWNER
            // ------------------------------------------------

            const [applicationRows] =
                await promiseDb.query(
                    `
                    SELECT a.id
                    FROM applications a
                    INNER JOIN students s
                        ON a.student_id = s.id
                    WHERE a.id = ?
                    AND s.user_id = ?
                    LIMIT 1
                    `,
                    [
                        applicationId,
                        userId
                    ]
                );


            if (applicationRows.length === 0) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not allowed to view this application."
                });
            }


            // ------------------------------------------------
            // GET HISTORY
            // ------------------------------------------------

            const [historyRows] =
                await promiseDb.query(
                    `
                    SELECT
                        id,
                        application_id,
                        old_status,
                        new_status,
                        changed_by,
                        changed_at
                    FROM application_status_history
                    WHERE application_id = ?
                    ORDER BY changed_at ASC
                    `,
                    [applicationId]
                );


            return res.status(200).json({
                success: true,
                history: historyRows
            });


        } catch (error) {

            console.error(
                "GET APPLICATION HISTORY ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to fetch application history.",
                error:
                    error.message
            });
        }
    };


// ======================================================
// 4. UPDATE APPLICATION STATUS
// ======================================================

exports.updateApplicationStatus =
    async (req, res) => {

        try {

            const userId =
                req.user?.id;

            const userRole =
                String(
                    req.user?.role || ""
                ).toLowerCase();

            const applicationId =
                req.params.id;

            const requestedStatus =
                req.body?.status;


            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "Unauthorized."
                });
            }


            // ------------------------------------------------
            // ONLY EMPLOYER / ADMIN
            // ------------------------------------------------

            if (
                userRole !== "employer" &&
                userRole !== "admin"
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only employer or admin can update application status."
                });
            }


            const newStatus =
                normalizeStatus(
                    requestedStatus
                );


            // ------------------------------------------------
            // GET APPLICATION
            // ------------------------------------------------

            const [applicationRows] =
                await promiseDb.query(
                    `
                    SELECT
                        a.id,
                        a.student_id,
                        a.internship_id,
                        a.status,
                        i.title,
                        i.posted_by
                    FROM applications a
                    INNER JOIN internships i
                        ON a.internship_id = i.id
                    WHERE a.id = ?
                    LIMIT 1
                    `,
                    [applicationId]
                );


            if (applicationRows.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Application not found."
                });
            }


            const application =
                applicationRows[0];


            // ------------------------------------------------
            // EMPLOYER OWNERSHIP CHECK
            // ------------------------------------------------

            if (
                userRole === "employer" &&
                Number(application.posted_by) !==
                Number(userId)
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not allowed to update this application."
                });
            }


            const oldStatus =
                normalizeStatus(
                    application.status
                );


            // ------------------------------------------------
            // UPDATE STATUS
            // ------------------------------------------------

            await promiseDb.query(
                `
                UPDATE applications
                SET status = ?
                WHERE id = ?
                `,
                [
                    newStatus,
                    applicationId
                ]
            );


            // ------------------------------------------------
            // STATUS HISTORY
            // ------------------------------------------------

            try {

                await promiseDb.query(
                    `
                    INSERT INTO application_status_history
                    (
                        application_id,
                        old_status,
                        new_status,
                        changed_by,
                        changed_at
                    )
                    VALUES (?, ?, ?, ?, NOW())
                    `,
                    [
                        applicationId,
                        oldStatus,
                        newStatus,
                        userId
                    ]
                );

            } catch (historyError) {

                console.error(
                    "STATUS UPDATE HISTORY ERROR:",
                    historyError
                );
            }


            // ==================================================
            // FIND STUDENT USER ID
            // ==================================================

            const [studentRows] =
                await promiseDb.query(
                    `
                    SELECT
                        s.user_id,
                        u.id AS user_id_from_users
                    FROM students s
                    INNER JOIN users u
                        ON s.user_id = u.id
                    WHERE s.id = ?
                    LIMIT 1
                    `,
                    [application.student_id]
                );


            if (
                studentRows.length > 0
            ) {

                const studentUserId =
                    Number(
                        studentRows[0].user_id_from_users
                    );


                // ------------------------------------------------
                // NOTIFICATION MESSAGE
                // ------------------------------------------------

                let notificationTitle =
                    "Internship Application Updated";

                let notificationMessage =
                    `Your application for "${application.title}" has been updated to ${newStatus}.`;


                if (
                    newStatus === "Accepted"
                ) {

                    notificationTitle =
                        "Application Accepted";

                    notificationMessage =
                        `Congratulations! Your application for "${application.title}" has been accepted.`;
                }


                else if (
                    newStatus === "Rejected"
                ) {

                    notificationTitle =
                        "Application Rejected";

                    notificationMessage =
                        `Your application for "${application.title}" has been rejected.`;
                }


                else if (
                    newStatus === "Pending"
                ) {

                    notificationTitle =
                        "Application Under Review";

                    notificationMessage =
                        `Your application for "${application.title}" is currently under review.`;
                }


                else if (
                    newStatus === "Submitted"
                ) {

                    notificationTitle =
                        "Application Submitted";

                    notificationMessage =
                        `Your application for "${application.title}" has been submitted successfully.`;
                }


                // ------------------------------------------------
                // CREATE STUDENT NOTIFICATION
                // ------------------------------------------------

                console.log(
                    "Creating status notification for student:",
                    studentUserId
                );


                await createNotification(
                    studentUserId,
                    notificationTitle,
                    notificationMessage,
                    "application"
                );
            }


            // ==================================================
            // SUCCESS
            // ==================================================

            return res.status(200).json({
                success: true,
                message:
                    "Application status updated successfully.",
                status:
                    newStatus
            });


        } catch (error) {

            console.error(
                "UPDATE APPLICATION STATUS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update application status.",
                error:
                    error.message
            });
        }
    };


// ======================================================
// 5. GET ALL APPLICATIONS
// ======================================================

exports.getAllApplications = async (req, res) => {

    try {

        const userId =
            req.user?.id;

        const userRole =
            String(
                req.user?.role || ""
            ).toLowerCase();


        if (!userId) {

            return res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
        }


        let query = `
            SELECT
                a.id,
                a.student_id,
                a.internship_id,

                a.full_name,
                a.phone,
                a.address,
                a.education,
                a.skills,
                a.experience,
                a.gpa,

                a.resume_link,
                a.resume_link AS resume,

                a.status,
                a.applied_at,

                i.title,
                i.company,
                i.location,
                i.stipend,
                i.deadline,

                s.user_id AS student_user_id,

                u.name AS student_name,
                u.email AS student_email

            FROM applications a

            INNER JOIN students s
                ON a.student_id = s.id

            INNER JOIN users u
                ON s.user_id = u.id

            INNER JOIN internships i
                ON a.internship_id = i.id
        `;


        const params = [];


        // ------------------------------------------------
        // EMPLOYER -> ONLY OWN INTERNSHIP APPLICATIONS
        // ------------------------------------------------

        if (
            userRole === "employer"
        ) {

            query += `
                WHERE i.posted_by = ?
            `;

            params.push(userId);
        }


        // ------------------------------------------------
        // STUDENT -> ONLY OWN APPLICATIONS
        // ------------------------------------------------

        else if (
            userRole === "student"
        ) {

            query += `
                WHERE s.user_id = ?
            `;

            params.push(userId);
        }


        // ------------------------------------------------
        // ADMIN -> ALL
        // ------------------------------------------------

        query += `
            ORDER BY a.applied_at DESC
        `;


        const [rows] =
            await promiseDb.query(
                query,
                params
            );


        return res.status(200).json({
            success: true,
            applications: rows
        });


    } catch (error) {

        console.error(
            "GET ALL APPLICATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch applications.",
            error:
                error.message
        });
    }
};


// ======================================================
// 6. GET APPLICATIONS BY INTERNSHIP
// ======================================================

exports.getApplicationsByInternship =
    async (req, res) => {

        try {

            const userId =
                req.user?.id;

            const userRole =
                String(
                    req.user?.role || ""
                ).toLowerCase();

            const internshipId =
                req.params.internshipId;


            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "Unauthorized."
                });
            }


            // ------------------------------------------------
            // GET INTERNSHIP
            // ------------------------------------------------

            const [internshipRows] =
                await promiseDb.query(
                    `
                    SELECT
                        id,
                        title,
                        posted_by
                    FROM internships
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [internshipId]
                );


            if (
                internshipRows.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Internship not found."
                });
            }


            const internship =
                internshipRows[0];


            // ------------------------------------------------
            // EMPLOYER OWNERSHIP
            // ------------------------------------------------

            if (
                userRole === "employer" &&
                Number(internship.posted_by) !==
                Number(userId)
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not allowed to view these applications."
                });
            }


            // ------------------------------------------------
            // STUDENT NOT ALLOWED
            // ------------------------------------------------

            if (
                userRole === "student"
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Students cannot view internship applicants."
                });
            }


            // ------------------------------------------------
            // GET APPLICATIONS
            // ------------------------------------------------

            const [rows] =
                await promiseDb.query(
                    `
                    SELECT
                        a.id,
                        a.student_id,
                        a.internship_id,

                        a.full_name,
                        a.phone,
                        a.address,
                        a.education,
                        a.skills,
                        a.experience,
                        a.gpa,

                        a.resume_link,
                        a.resume_link AS resume,

                        a.status,
                        a.applied_at,

                        s.user_id AS student_user_id,

                        u.name AS student_name,
                        u.email AS student_email

                    FROM applications a

                    INNER JOIN students s
                        ON a.student_id = s.id

                    INNER JOIN users u
                        ON s.user_id = u.id

                    WHERE a.internship_id = ?

                    ORDER BY a.applied_at DESC
                    `,
                    [internshipId]
                );


            return res.status(200).json({
                success: true,
                applications: rows
            });


        } catch (error) {

            console.error(
                "GET APPLICATIONS BY INTERNSHIP ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to fetch internship applications.",
                error:
                    error.message
            });
        }
    };