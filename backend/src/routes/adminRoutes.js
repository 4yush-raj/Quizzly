const express = require('express');
const router = express.Router();
const { getAdminAnalytics, getStudents, toggleUserStatus, deleteUser } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/analytics', authenticateToken, requireAdmin, getAdminAnalytics);
router.get('/students', authenticateToken, requireAdmin, getStudents);
router.put('/users/:id/status', authenticateToken, requireAdmin, toggleUserStatus);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

module.exports = router;
