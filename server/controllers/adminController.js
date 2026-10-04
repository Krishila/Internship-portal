const db = require('../config/db');

const getPendingVerifications = (req, res) => {
  const internshipsQuery = `SELECT * FROM internships WHERE verification_status = 'Pending' OR verification_status IS NULL`;
  const employersQuery = `SELECT * FROM employers WHERE verification_status = 'Pending' OR verification_status IS NULL`;

  db.query(internshipsQuery, (err, internships) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    db.query(employersQuery, (err, employers) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ internships, employers });
    });
  });
};

const verifyInternship = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `UPDATE internships SET verification_status = ? WHERE id = ?`;
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to update internship status' });

    const notifSql = `
      INSERT INTO notifications (user_id, message, type)
      SELECT posted_by, ?, 'verification'
      FROM internships WHERE id = ?
    `;
    db.query(notifSql, [`Your internship posting has been ${status.toLowerCase()}.`, id]);

    res.json({ message: `Internship ${status.toLowerCase()} successfully` });
  });
};

const verifyEmployer = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `UPDATE employers SET verification_status = ? WHERE id = ?`;
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to update employer status' });

    const notifSql = `
      INSERT INTO notifications (user_id, message, type)
      VALUES (?, ?, 'verification')
    `;
    db.query(notifSql, [id, `Your employer account has been ${status.toLowerCase()}.`]);

    res.json({ message: `Employer ${status.toLowerCase()} successfully` });
  });
};

module.exports = {
  getPendingVerifications,
  verifyInternship,
  verifyEmployer
};