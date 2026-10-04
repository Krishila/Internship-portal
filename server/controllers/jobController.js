const db = require('../config/db');

exports.getAllJobs = (req, res) => {
   
    const currentDate = new Date().toISOString().split('T')[0];

    
    const query = 'SELECT * FROM internships WHERE deadline >= ? AND (is_approved = 1 OR is_approved = "1")';

    db.query(query, [currentDate], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

exports.createJob = (req, res) => {
    const { title, company, location, stipend, deadline } = req.body;
    const userId = req.user ? req.user.id : null;
    const query = 'INSERT INTO internships (title, company, location, stipend, deadline, posted_by, is_approved) VALUES (?, ?, ?, ?, ?, ?, 0)';
    
    db.query(query, [title, company, location, stipend, deadline, userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Job created successfully and waiting for admin approval', id: results.insertId });
    });
};

exports.applyForJob = (req, res) => {
    const { jobId, studentId } = req.body;
    
    // एप्लाई गर्नुभन्दा पहिले उक्त जबको डेडलाइन सकिएको छ कि छैन जाँच गर्ने
    const checkQuery = 'SELECT deadline FROM internships WHERE id = ?';
    
    db.query(checkQuery, [jobId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const deadline = new Date(results[0].deadline);
        const currentDate = new Date();

        if (currentDate > deadline) {
            return res.status(400).json({ error: 'The deadline for this internship has passed.' });
        }

        
        const insertQuery = 'INSERT INTO applications (job_id, student_id) VALUES (?, ?)';
        db.query(insertQuery, [jobId, studentId], (err, insertResults) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Applied successfully' });
        });
    });
};