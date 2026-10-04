const express = require('express');

const router = express.Router();

const Internship = require('../models/Internship');

const {
    verifyToken,
    checkRole
} = require('../middleware/authMiddleware');


// ======================================================
// GET INTERNSHIPS
//
// Student  -> Approved only
// Employer -> Own posts
// Admin    -> All posts
// ======================================================

router.get(
    '/',
    verifyToken,
    async (req, res) => {

        try {

            const internships =
                await Internship.getForUser(
                    req.user.id,
                    req.user.role
                );

            res.json(internships);

        } catch (err) {

            console.error(
                'Get internships error:',
                err
            );

            res.status(500).json({
                message:
                    'Error fetching internships',
                error:
                    err.message
            });
        }
    }
);


// ======================================================
// CREATE INTERNSHIP
// EMPLOYER / ADMIN ONLY
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


            // ==================================================
            // CREATE
            // ==================================================

            const newId =
                await Internship.create({

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

                    posted_by:
                        req.user.id

                });


            // ==================================================
            // SUCCESS
            // ==================================================

            res.status(201).json({

                message:
                    'Internship posted successfully.',

                internshipId:
                    newId

            });

        } catch (err) {

            console.error(
                'Create internship error:',
                err
            );

            res.status(500).json({

                message:
                    'Failed to create internship',

                error:
                    err.message
            });
        }
    }
);


// ======================================================
// ADMIN - PENDING INTERNSHIPS
// ======================================================

router.get(
    '/admin/pending',
    verifyToken,
    checkRole(['admin']),
    async (req, res) => {

        try {

            const internships =
                await Internship.getAll();


            const pending =
                internships.filter(
                    item =>
                        item.verification_status ===
                        'Pending'
                );


            res.json(pending);

        } catch (err) {

            console.error(
                'Get pending internships error:',
                err
            );

            res.status(500).json({

                message:
                    'Failed to load pending internships',

                error:
                    err.message
            });
        }
    }
);


// ======================================================
// ADMIN - APPROVE / REJECT
// ======================================================

router.put(
    '/admin/:id/verify',
    verifyToken,
    checkRole(['admin']),
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { status } =
                req.body;


            if (
                !['Approved', 'Rejected']
                    .includes(status)
            ) {

                return res.status(400).json({

                    message:
                        'Status must be Approved or Rejected.'

                });
            }


            const internship =
                await Internship.getById(id);


            if (!internship) {

                return res.status(404).json({

                    message:
                        'Internship not found.'

                });
            }


            await Internship.updateVerification(
                id,
                status
            );


            res.json({

                message:
                    `Internship ${status.toLowerCase()} successfully.`,

                internshipId:
                    id,

                verification_status:
                    status,

                is_approved:
                    status === 'Approved'
                        ? 1
                        : 0

            });

        } catch (err) {

            console.error(
                'Verify internship error:',
                err
            );

            res.status(500).json({

                message:
                    'Failed to update internship verification',

                error:
                    err.message

            });
        }
    }
);


module.exports = router;