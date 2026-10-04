const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Inline handler to bypass any controller import crashes
router.get('/applications', authMiddleware, (req, res) => {
    const employerId = req.user.id;
    const query = `
        SELECT a.id as app_id, u.name as student_name, u.email as student_email, 
               i.title as internship_title, a.applied_date, a.status 
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN internships i ON a.internship_id = i.id
        WHERE i.posted_by = ?
    `;
    db.query(query, [employerId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.put('/applications/:id/status', authMiddleware, (req, res) => {
    const appId = req.params.id;
    const { status } = req.body;
    const query = "UPDATE applications SET status = ? WHERE id = ?";
    db.query(query, [status, appId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Status updated successfully" });
    });
});

module.exports = router;