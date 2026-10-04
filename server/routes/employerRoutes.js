const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// =====================================================
// GET EMPLOYER APPLICATIONS
// =====================================================

router.get("/applications", verifyToken, (req, res) => {
    const employerId = req.user.id;

    const query = `
        SELECT
            a.id AS id,
            a.full_name AS full_name,
            a.phone AS phone,
            a.education AS education,
            a.gpa AS gpa,
            a.skills AS skills,
            a.experience AS experience,
            a.resume_link AS resume_link,
            a.status AS status,
            u.email AS email,
            i.title AS internship_title,
            a.applied_date AS applied_at
        FROM applications a
        JOIN internships i
            ON a.internship_id = i.id
        LEFT JOIN students s
            ON a.student_id = s.id
        LEFT JOIN users u
            ON s.user_id = u.id
        WHERE i.posted_by = ?
        ORDER BY a.id DESC
    `;

    db.query(query, [employerId], (err, results) => {
        if (err) {
            console.error(
                "GET EMPLOYER APPLICATIONS ERROR:",
                err
            );

            return res.status(500).json({
                message: "Failed to load applications.",
                error: err.message
            });
        }

        res.json(results);
    });
});


// =====================================================
// UPDATE APPLICATION STATUS
// =====================================================

router.put(
    "/applications/:id/status",
    verifyToken,
    (req, res) => {

        const appId = req.params.id;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Submitted",
            "Accepted",
            "Rejected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid application status."
            });
        }

        // First get the application + student
        const getApplicationQuery = `
            SELECT
                a.id,
                a.student_id,
                a.full_name,
                i.title AS internship_title,
                i.posted_by
            FROM applications a
            JOIN internships i
                ON a.internship_id = i.id
            WHERE a.id = ?
              AND i.posted_by = ?
        `;

        db.query(
            getApplicationQuery,
            [appId, req.user.id],
            (getErr, applications) => {

                if (getErr) {
                    console.error(
                        "GET APPLICATION ERROR:",
                        getErr
                    );

                    return res.status(500).json({
                        message: "Failed to find application.",
                        error: getErr.message
                    });
                }

                if (
                    !applications ||
                    applications.length === 0
                ) {
                    return res.status(404).json({
                        message:
                            "Application not found or does not belong to this employer."
                    });
                }

                const application = applications[0];

                // ==========================================
                // UPDATE STATUS
                // ==========================================

                const updateQuery = `
                    UPDATE applications
                    SET status = ?
                    WHERE id = ?
                `;

                db.query(
                    updateQuery,
                    [status, appId],
                    (updateErr, result) => {

                        if (updateErr) {
                            console.error(
                                "UPDATE APPLICATION STATUS ERROR:",
                                updateErr
                            );

                            return res.status(500).json({
                                message:
                                    "Failed to update application status.",
                                error: updateErr.message
                            });
                        }

                        // ==========================================
                        // CREATE STUDENT NOTIFICATION
                        // ==========================================

                        const notificationTitle =
                            "Application Status Updated";

                        const notificationMessage =
                            `Your application for "${application.internship_title}" has been ${status.toLowerCase()}.`;

                        const notificationQuery = `
                            INSERT INTO notifications
                            (
                                user_id,
                                title,
                                message
                            )
                            SELECT
                                s.user_id,
                                ?,
                                ?
                            FROM students s
                            WHERE s.id = ?
                        `;

                        db.query(
                            notificationQuery,
                            [
                                notificationTitle,
                                notificationMessage,
                                application.student_id
                            ],
                            (notificationErr) => {

                                if (notificationErr) {
                                    console.error(
                                        "STUDENT NOTIFICATION ERROR:",
                                        notificationErr
                                    );

                                    // Status was already updated,
                                    // so don't fail the whole request.
                                    return res.json({
                                        message:
                                            "Status updated successfully, but notification could not be created.",
                                        status: status
                                    });
                                }

                                return res.json({
                                    message:
                                        "Status updated successfully and student notified.",
                                    status: status
                                });
                            }
                        );
                    }
                );
            }
        );
    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;