const db = require('../config/db');

const Internship = {

    // ======================================================
    // STUDENT
    // ONLY VERIFIED + APPROVED + NOT EXPIRED
    // ======================================================

    getApproved: () => {

        return new Promise((resolve, reject) => {

            const query = `
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
                    posted_by,
                    verification_status,
                    is_approved
                FROM internships
                WHERE
                    is_approved = 1
                    AND LOWER(TRIM(verification_status)) = 'verified'
                    AND (
                        deadline >= CURDATE()
                        OR deadline IS NULL
                    )
                ORDER BY id DESC
            `;

            db.query(
                query,
                (err, results) => {

                    if (err) {

                        console.error(
                            'getApproved error:',
                            err
                        );

                        return reject(err);
                    }

                    resolve(
                        results || []
                    );
                }
            );
        });
    },


    // ======================================================
    // EMPLOYER
    // OWN POSTS ONLY
    // ======================================================

    getByEmployer: (employerId) => {

        return new Promise((resolve, reject) => {

            const query = `
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
                    posted_by,
                    verification_status,
                    is_approved
                FROM internships
                WHERE posted_by = ?
                ORDER BY id DESC
            `;

            db.query(
                query,
                [employerId],
                (err, results) => {

                    if (err) {

                        console.error(
                            'getByEmployer error:',
                            err
                        );

                        return reject(err);
                    }

                    resolve(
                        results || []
                    );
                }
            );
        });
    },


    // ======================================================
    // ADMIN
    // ALL INTERNSHIPS
    // ======================================================

    getAll: () => {

        return new Promise((resolve, reject) => {

            const query = `
                SELECT *
                FROM internships
                ORDER BY id DESC
            `;

            db.query(
                query,
                (err, results) => {

                    if (err) {

                        console.error(
                            'getAll error:',
                            err
                        );

                        return reject(err);
                    }

                    resolve(
                        results || []
                    );
                }
            );
        });
    },


    // ======================================================
    // GET ONE
    // ======================================================

    getById: (id) => {

        return new Promise((resolve, reject) => {

            const query = `
                SELECT *
                FROM internships
                WHERE id = ?
            `;

            db.query(
                query,
                [id],
                (err, results) => {

                    if (err) {

                        console.error(
                            'getById error:',
                            err
                        );

                        return reject(err);
                    }

                    resolve(
                        results[0] || null
                    );
                }
            );
        });
    },


    // ======================================================
    // GET FOR USER
    //
    // STUDENT  -> VERIFIED + APPROVED + NOT EXPIRED
    // EMPLOYER -> OWN POSTS
    // ADMIN    -> ALL
    // ======================================================

    getForUser: (userId, role) => {

        return new Promise((resolve, reject) => {

            const userRole =
                String(role || '')
                    .trim()
                    .toLowerCase();

            console.log(
                '================================'
            );

            console.log(
                'Internship getForUser'
            );

            console.log(
                'User ID:',
                userId
            );

            console.log(
                'User Role:',
                userRole
            );

            console.log(
                '================================'
            );


            let query = '';
            let params = [];


            // ==================================================
            // STUDENT
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
                        posted_by,
                        verification_status,
                        is_approved
                    FROM internships
                    WHERE
                        is_approved = 1
                        AND LOWER(
                            TRIM(verification_status)
                        ) = 'verified'
                        AND (
                            deadline >= CURDATE()
                            OR deadline IS NULL
                        )
                    ORDER BY id DESC
                `;

                params = [];
            }


            // ==================================================
            // EMPLOYER
            // OWN POSTS ONLY
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
                        posted_by,
                        verification_status,
                        is_approved
                    FROM internships
                    WHERE posted_by = ?
                    ORDER BY id DESC
                `;

                params = [userId];
            }


            // ==================================================
            // ADMIN
            // ALL POSTS
            // ==================================================

            else if (userRole === 'admin') {

                query = `
                    SELECT *
                    FROM internships
                    ORDER BY id DESC
                `;

                params = [];
            }


            // ==================================================
            // INVALID ROLE
            // ==================================================

            else {

                console.error(
                    'Invalid role:',
                    role
                );

                return reject(
                    new Error(
                        'Unauthorized role.'
                    )
                );
            }


            // ==================================================
            // EXECUTE QUERY
            // ==================================================

            db.query(
                query,
                params,
                (err, results) => {

                    if (err) {

                        console.error(
                            'getForUser SQL Error:',
                            err
                        );

                        return reject(err);
                    }

                    console.log(
                        'Internships returned:',
                        results.length
                    );

                    resolve(
                        results || []
                    );
                }
            );
        });
    },


    // ======================================================
    // CREATE
    //
    // NEW INTERNSHIP:
    // Pending
    // is_approved = 0
    // ======================================================

    create: (data) => {

        return new Promise((resolve, reject) => {

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
                experience_requirement,
                posted_by
            } = data;


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
                    deadline || null,
                    education_requirement || null,
                    required_skills || null,
                    minimum_gpa || null,
                    experience_requirement || null,
                    posted_by
                ],
                (err, result) => {

                    if (err) {

                        console.error(
                            'Create Internship DB Error:',
                            err
                        );

                        return reject(err);
                    }

                    resolve(
                        result.insertId
                    );
                }
            );
        });
    },


    // ======================================================
    // ADMIN VERIFY / REJECT
    //
    // Verified -> is_approved = 1
    // Rejected -> is_approved = 0
    // ======================================================

    updateVerification: (id, status) => {

        return new Promise((resolve, reject) => {

            const isApproved =
                status === 'Verified'
                    ? 1
                    : 0;


            const query = `
                UPDATE internships
                SET
                    verification_status = ?,
                    is_approved = ?
                WHERE id = ?
            `;


            db.query(
                query,
                [
                    status,
                    isApproved,
                    id
                ],
                (err, result) => {

                    if (err) {

                        console.error(
                            'Update verification error:',
                            err
                        );

                        return reject(err);
                    }

                    resolve(result);
                }
            );
        });
    }

};


module.exports = Internship;