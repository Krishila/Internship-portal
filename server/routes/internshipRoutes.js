const express = require('express');
const router = express.Router();

const Internship = require('../models/Internship');

const {
    verifyToken,
    checkRole
} = require('../middleware/authMiddleware');

const db = require('../config/db');
const promiseDb = db.promise();


// ======================================================
// GET INTERNSHIPS
// ======================================================

router.get('/', verifyToken, async (req, res) => {
    try {
        const internships = await Internship.getForUser(
            req.user.id,
            req.user.role
        );

        return res.json(internships);

    } catch (err) {
        console.error('Get internships error:', err);

        return res.status(500).json({
            message: 'Error fetching internships',
            error: err.message
        });
    }
});


// ======================================================
// CREATE INTERNSHIP
// EMPLOYER / ADMIN
// ======================================================

router.post(
    '/',
    verifyToken,
    checkRole(['employer', 'admin']),
    async (req, res) => {
        try {
            const {
                title,
                company,
                location,
                stipend,
                description,
                deadline,
                education_requirement,
                required_skills,
                minimum_gpa,
                experience_requirement
            } = req.body;

            if (!title || !company || !location || !description) {
                return res.status(400).json({
                    message: 'Title, company, location and description are required.'
                });
            }

            // Create internship
            const newId = await Internship.create({
                title,
                company,
                location,
                stipend,
                description,
                deadline,
                education_requirement,
                required_skills,
                minimum_gpa,
                experience_requirement,
                posted_by: req.user.id
            });

            // Notify admins when employer posts an internship
            if (
                String(req.user.role).trim().toLowerCase() === 'employer'
            ) {
                await promiseDb.query(
                    `INSERT INTO notifications
                    (
                        user_id,
                        title,
                        message,
                        type,
                        is_read,
                        created_at
                    )
                    SELECT
                        id,
                        ?,
                        ?,
                        ?,
                        0,
                        NOW()
                    FROM users
                    WHERE LOWER(TRIM(COALESCE(role, ''))) = 'admin'`,
                    [
                        'New Internship Pending',
                        `A new internship "${title}" at "${company}" is waiting for your approval.`,
                        'internship'
                    ]
                );
            }

            return res.status(201).json({
                message: 'Internship posted successfully. It is waiting for admin verification.',
                internshipId: newId,
                verification_status: 'Pending',
                is_approved: 0
            });

        } catch (err) {
            console.error('Create internship error:', err);

            return res.status(500).json({
                message: 'Failed to create internship',
                error: err.message
            });
        }
    }
);


// ======================================================
// ADMIN GET PENDING INTERNSHIPS
// ======================================================

router.get(
    '/admin/pending',
    verifyToken,
    checkRole(['admin']),
    async (req, res) => {
        try {
            const internships = await Internship.getAll();

            const pending = internships.filter(item => {
                const status = String(
                    item.verification_status || ''
                ).trim().toLowerCase();

                return status === 'pending';
            });

            return res.json(pending);

        } catch (err) {
            console.error('Get pending internships error:', err);

            return res.status(500).json({
                message: 'Failed to load pending internships',
                error: err.message
            });
        }
    }
);


// ======================================================
// ADMIN VERIFY / REJECT INTERNSHIP
// ======================================================

router.put(
    '/admin/:id/verify',
    verifyToken,
    checkRole(['admin']),
    async (req, res) => {
        try {
            const { id } = req.params;

            const rawStatus = String(
                req.body.status || ''
            ).trim().toLowerCase();

            let status;

            if (
                rawStatus === 'verified' ||
                rawStatus === 'approved'
            ) {
                status = 'Verified';

            } else if (rawStatus === 'rejected') {
                status = 'Rejected';

            } else {
                return res.status(400).json({
                    message: 'Status must be Verified or Rejected.'
                });
            }

            // Get internship
            const internship = await Internship.getById(id);

            if (!internship) {
                return res.status(404).json({
                    message: 'Internship not found.'
                });
            }

            // Update internship status
            await Internship.updateVerification(id, status);

            // Notify students after verification
            if (status === 'Verified') {
                const [notificationResult] = await promiseDb.query(
                    `INSERT INTO notifications
                    (
                        user_id,
                        title,
                        message,
                        type,
                        is_read,
                        created_at
                    )
                    SELECT
                        id,
                        ?,
                        ?,
                        ?,
                        0,
                        NOW()
                    FROM users
                    WHERE LOWER(TRIM(COALESCE(role, ''))) = 'student'`,
                    [
                        'New Internship Available',
                        `A new internship "${internship.title}" at "${internship.company}" is now available. You can apply from the internships page.`,
                        'internship'
                    ]
                );

                return res.json({
                    message: 'Internship verified successfully and students have been notified.',
                    internshipId: id,
                    verification_status: 'Verified',
                    is_approved: 1,
                    notificationsCreated: notificationResult.affectedRows || 0
                });
            }

            // Rejected response
            return res.json({
                message: 'Internship rejected successfully.',
                internshipId: id,
                verification_status: 'Rejected',
                is_approved: 0
            });

        } catch (err) {
            console.error('Verify internship error:', err);

            return res.status(500).json({
                message: 'Failed to update internship verification',
                error: err.message
            });
        }
    }
);


module.exports = router;