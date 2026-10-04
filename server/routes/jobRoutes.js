const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', jobController.getAllJobs);
router.post('/create', verifyToken, checkRole(['employer', 'admin']), jobController.createJob); 
router.post('/apply', verifyToken, checkRole(['student']), jobController.applyForJob); 

module.exports = router;