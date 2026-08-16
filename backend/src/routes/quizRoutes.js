const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/quizController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, getQuizzes);
router.get('/:id', authenticateToken, getQuizById);
router.post('/', authenticateToken, requireAdmin, createQuiz);
router.put('/:id', authenticateToken, requireAdmin, updateQuiz);
router.delete('/:id', authenticateToken, requireAdmin, deleteQuiz);

// Questions management under quiz
router.post('/:quizId/questions', authenticateToken, requireAdmin, addQuestion);
router.put('/questions/:id', authenticateToken, requireAdmin, updateQuestion);
router.delete('/questions/:id', authenticateToken, requireAdmin, deleteQuestion);

module.exports = router;
