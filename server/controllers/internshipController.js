const db = require('../config/db');


// ======================================================
// 1. GET ALL INTERNSHIPS
//
// STUDENT  -> Admin Approved internships only
// EMPLOYER -> Own internships immediately
// ADMIN    -> All internships
// ======================================================

exports.getAllInternships = (req, res) => {

    const userId = req.user.id;

    const userRole =
        String(req.user.role || '').toLowerCase();

    let query = '';
    let params = [];

    // ==================================================
    // STUDENT
    // Only Admin Approved internships
    // ==================================================

    if (userRole === 'student') {

        query = `
            SELECT
                id,
                title,
                company,
                location,
                description,
                stipend,
                deadline,
                education_requirement,
                required_skills,
                minimum_gpa,
                experience_requirement,
                posted_by
            FROM internships
            WHERE is_approved = 1
            AND verification_status = 'Approved'
            AND (
                deadline >= CURDATE()
                OR deadline IS NULL
            )
            ORDER BY id DESC
        `;
    }

    // ==================================================
    // EMPLOYER
    // Own internships immediately visible
    //
    // IMPORTANT:
    // No approval condition here.
    // ==================================================

    else if (userRole === 'employer') {

        query = `
            SELECT
                id,
                title,
                company,
                location,
                description,
                stipend,
                deadline,
                education_requirement,
                required_skills,
                minimum_gpa,
                experience_requirement,
                posted_by
            FROM internships
            WHERE posted_by = ?
            ORDER BY id DESC
        `;

        params = [userId];
    }

    // ==================================================
    // ADMIN
    // Admin sees all
    // ==================================================

    else if (userRole === 'admin') {

        query = `
            SELECT *
            FROM internships
            ORDER BY id DESC
        `;
    }

    else {

        return res.status(403).json({
            message: 'Unauthorized role.'
        });
    }


    // ==================================================
    // DATABASE
    // ==================================================

    db.query(
        query,
        params,
        (err, rows) => {

            if (err) {

                console.error(
                    'Get Internships Error:',
                    err
                );

                return res.status(500).json({
                    message:
                        'Database error: ' +
                        err.message
                });
            }

            return res.json(rows);
        }
    );
};


// ======================================================
// 2. CREATE INTERNSHIP
//
// Employer:
//   - Immediately visible to employer
//   - Hidden from students
//   - Goes to admin pending list
//
// Admin:
//   - Also created as pending
// ======================================================

exports.createInternship = (req, res) => {

    const {
        title,
        company,
        location,
        description,
        stipend,
        deadline,
        education_requirement,
        required_skills,
        minimum_gpa,
        experience_requirement
    } = req.body;


    const userId =
        req.user ? req.user.id : null;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        !title ||
        !company ||
        !location ||
        !description
    ) {

        return res.status(400).json({
            message:
                'Title, company, location and description are required.'
        });
    }


    if (!userId) {

        return res.status(401).json({
            message:
                'User authentication required.'
        });
    }


    // ==================================================
    // DEADLINE
    // ==================================================

    const finalDeadline =
        !deadline ||
        (
            typeof deadline === 'string' &&
            deadline.trim() === ''
        )
            ? null
            : deadline;


    // ==================================================
    // CREATE
    //
    // Important:
    // Employer does NOT need approval to see own post.
    //
    // But Student DOES need Admin approval.
    // ==================================================

    const query = `
        INSERT INTO internships
        (
            title,
            company,
            location,
            description,
            stipend,
            deadline,
            education_requirement,
            required_skills,
            minimum_gpa,
            experience_requirement,
            posted_by,
            is_approved,
            verification_status
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, 0, 'Pending'
        )
    `;


    db.query(
        query,
        [
            title,
            company,
            location,
            description,
            stipend || null,
            finalDeadline,

            education_requirement || null,
            required_skills || null,
            minimum_gpa || null,
            experience_requirement || null,

            userId
        ],
        (err, result) => {

            if (err) {

                console.error(
                    'Create Internship Error:',
                    err
                );

                return res.status(500).json({
                    message:
                        'Database error: ' +
                        err.message
                });
            }


            const internshipId =
                result.insertId;


            // ==================================================
            // NOTIFY ADMIN
            // ==================================================

            const adminQuery = `
                SELECT id
                FROM users
                WHERE LOWER(role) = 'admin'
            `;


            db.query(
                adminQuery,
                (adminErr, admins) => {

                    if (adminErr) {

                        console.error(
                            'Admin Query Error:',
                            adminErr
                        );

                        // Internship already created.
                        return res.status(201).json({

                            message:
                                'Internship posted successfully.',

                            internshipId
                        });
                    }


                    // ==================================================
                    // NO ADMIN FOUND
                    // ==================================================

                    if (
                        !admins ||
                        admins.length === 0
                    ) {

                        return res.status(201).json({

                            message:
                                'Internship posted successfully.',

                            internshipId
                        });
                    }


                    // ==================================================
                    // ADMIN NOTIFICATION
                    //
                    // Keep this compatible with the existing
                    // notifications table.
                    // ==================================================

                    const notificationQuery = `
                        INSERT INTO notifications
                        (
                            user_id,
                            title,
                            message
                        )
                        VALUES (?, ?, ?)
                    `;


                    let completed = 0;


                    admins.forEach((admin) => {

                        const message =
                            `New internship "${title}" has been posted and is waiting for admin approval.`;


                        db.query(
                            notificationQuery,
                            [
                                admin.id,
                                'New Internship Pending',
                                message
                            ],
                            (notificationErr) => {

                                if (notificationErr) {

                                    console.error(
                                        'Admin Notification Error:',
                                        notificationErr
                                    );
                                }


                                completed++;


                                if (
                                    completed ===
                                    admins.length
                                ) {

                                    return res.status(201).json({

                                        message:
                                            'Internship posted successfully.',

                                        internshipId
                                    });
                                }
                            }
                        );
                    });
                }
            );
        }
    );
};


// ======================================================
// 3. GET PENDING INTERNSHIPS
// ADMIN ONLY
// ======================================================

exports.getPendingInternships = (req, res) => {

    const query = `
        SELECT
            i.*,
            u.name AS posted_by_name,
            u.email AS posted_by_email
        FROM internships i

        LEFT JOIN users u
            ON i.posted_by = u.id

        WHERE i.is_approved = 0
        AND i.verification_status = 'Pending'

        ORDER BY i.id DESC
    `;


    db.query(
        query,
        (err, rows) => {

            if (err) {

                console.error(
                    'Get Pending Internships Error:',
                    err
                );

                return res.status(500).json({
                    message:
                        'Database error: ' +
                        err.message
                });
            }


            return res.json(rows);
        }
    );
};


// ======================================================
// 4. ADMIN APPROVE / REJECT
// ======================================================

exports.updateInternshipVerification = (
    req,
    res
) => {

    const internshipId =
        req.params.id;

    const { status } =
        req.body;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        !['Approved', 'Rejected']
            .includes(status)
    ) {

        return res.status(400).json({
            message:
                'Status must be Approved or Rejected.'
        });
    }


    // ==================================================
    // GET INTERNSHIP
    // ==================================================

    const getInternshipQuery = `
        SELECT
            id,
            title,
            company,
            posted_by,
            is_approved,
            verification_status
        FROM internships
        WHERE id = ?
    `;


    db.query(
        getInternshipQuery,
        [internshipId],
        (err, results) => {

            if (err) {

                console.error(
                    'Get Internship Error:',
                    err
                );

                return res.status(500).json({
                    message:
                        'Database error: ' +
                        err.message
                });
            }


            if (
                results.length === 0
            ) {

                return res.status(404).json({
                    message:
                        'Internship not found.'
                });
            }


            const internship =
                results[0];


            // ==================================================
            // APPROVE
            // ==================================================

            if (status === 'Approved') {

                const approveQuery = `
                    UPDATE internships
                    SET
                        is_approved = 1,
                        verification_status = 'Approved'
                    WHERE id = ?
                `;


                db.query(
                    approveQuery,
                    [internshipId],
                    (updateErr) => {

                        if (updateErr) {

                            console.error(
                                'Approve Internship Error:',
                                updateErr
                            );

                            return res.status(500).json({
                                message:
                                    'Failed to approve internship.',
                                error:
                                    updateErr.message
                            });
                        }


                        // ==================================================
                        // NOTIFY ALL STUDENTS
                        //
                        // Uses only:
                        // user_id
                        // title
                        // message
                        //
                        // So it matches your existing application
                        // notification code.
                        // ==================================================

                        const notificationQuery = `
                            INSERT INTO notifications
                            (
                                user_id,
                                title,
                                message
                            )

                            SELECT
                                id,
                                ?,
                                ?

                            FROM users

                            WHERE LOWER(role) = 'student'
                        `;


                        const notificationTitle =
                            'New Internship Available';


                        const notificationMessage =
                            `A new internship "${internship.title}" at "${internship.company}" is now available. You can apply from the internships page.`;


                        db.query(
                            notificationQuery,
                            [
                                notificationTitle,
                                notificationMessage
                            ],
                            (notificationErr) => {

                                if (notificationErr) {

                                    console.error(
                                        'Student Notification Error:',
                                        notificationErr
                                    );

                                    // Approval already succeeded.
                                    // Do not return 500 because
                                    // notification failed.
                                }


                                return res.json({

                                    message:
                                        'Internship approved successfully and students have been notified.',

                                    internshipId:
                                        internshipId,

                                    status:
                                        'Approved'
                                });
                            }
                        );
                    }
                );

                return;
            }


            // ==================================================
            // REJECT
            // ==================================================

            const rejectQuery = `
                UPDATE internships
                SET
                    is_approved = 0,
                    verification_status = 'Rejected'
                WHERE id = ?
            `;


            db.query(
                rejectQuery,
                [internshipId],
                (updateErr) => {

                    if (updateErr) {

                        console.error(
                            'Reject Internship Error:',
                            updateErr
                        );

                        return res.status(500).json({
                            message:
                                'Failed to reject internship.',
                            error:
                                updateErr.message
                        });
                    }


                    // ==================================================
                    // NOTIFY EMPLOYER
                    // ==================================================

                    const notificationQuery = `
                        INSERT INTO notifications
                        (
                            user_id,
                            title,
                            message
                        )
                        VALUES (?, ?, ?)
                    `;


                    const message =
                        `Your internship "${internship.title}" has been rejected by admin.`;


                    db.query(
                        notificationQuery,
                        [
                            internship.posted_by,
                            'Internship Rejected',
                            message
                        ],
                        (notificationErr) => {

                            if (notificationErr) {

                                console.error(
                                    'Employer Notification Error:',
                                    notificationErr
                                );
                            }


                            return res.json({

                                message:
                                    'Internship rejected successfully.',

                                internshipId:
                                    internshipId,

                                status:
                                    'Rejected'
                            });
                        }
                    );
                }
            );
        }
    );
};