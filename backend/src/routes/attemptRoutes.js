const express = require('express');
const router = express.Router();
const { submitAttempt, getUserAttempts, getAttemptById } = require('../controllers/attemptController');
const { authenticateToken } = require('../middleware/auth');

router.post('/submit', authenticateToken, submitAttempt);
router.get('/history', authenticateToken, getUserAttempts);
router.get('/:id', authenticateToken, getAttemptById);

module.exports = router;
