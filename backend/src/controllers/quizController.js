const prisma = require('../config/db');

// GET ALL QUIZZES (with Discovery Filters & Role checks)
const getQuizzes = async (req, res) => {
  try {
    const { search, category, difficulty, duration, sortBy, status } = req.query;
    const userRole = req.user ? req.user.role : 'STUDENT';

    const whereClause = {};

    // Students only see PUBLISHED
    if (userRole !== 'ADMIN') {
      whereClause.status = 'PUBLISHED';
    } else if (status) {
      whereClause.status = status;
    }

    if (category) {
      whereClause.categoryId = parseInt(category, 10);
    }

    if (difficulty) {
      whereClause.difficulty = difficulty;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    let rawQuizzes = await prisma.quiz.findMany({
      where: whereClause,
      include: {
        category: true,
        _count: {
          select: { questions: true, attempts: true }
        }
      },
      orderBy: sortBy === 'popular' ? { attempts: { _count: 'desc' } } : { createdAt: 'desc' }
    });

    if (duration) {
      const durInt = parseInt(duration, 10);
      rawQuizzes = rawQuizzes.filter((q) => q.durationMinutes <= durInt);
    }

    const quizzes = rawQuizzes.map((q) => ({
      ...q,
      categoryName: q.category ? q.category.name : 'General',
      questionCount: q._count.questions,
      attemptCount: q._count.attempts
    }));

    res.json(quizzes);
  } catch (error) {
    console.error('Get Quizzes Error:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
};

// GET SINGLE QUIZ BY ID
const getQuizById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'STUDENT';

    const q = await prisma.quiz.findUnique({
      where: { id },
      include: {
        category: true,
        questions: true,
        _count: { select: { attempts: true } }
      }
    });

    if (!q) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    if (userRole !== 'ADMIN' && q.status !== 'PUBLISHED') {
      return res.status(403).json({ error: 'This quiz is not currently available.' });
    }

    let userAttemptCount = 0;
    if (userId) {
      userAttemptCount = await prisma.quizAttempt.count({
        where: { quizId: id, userId }
      });
    }

    const quiz = {
      ...q,
      categoryName: q.category ? q.category.name : 'General',
      questionCount: q.questions.length,
      attemptCount: q._count.attempts,
      userAttemptsLeft: Math.max(0, q.maxAttempts - userAttemptCount),
      questions: q.questions.map((quest) => ({
        ...quest,
        options: typeof quest.options === 'string' ? JSON.parse(quest.options) : quest.options
      }))
    };

    res.json(quiz);
  } catch (error) {
    console.error('Get Quiz By ID Error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz details.' });
  }
};

// CREATE QUIZ (Admin Only)
const createQuiz = async (req, res) => {
  try {
    const { title, description, categoryId, difficulty, durationMinutes, passingPercentage, maxAttempts, status, thumbnailUrl } = req.body;

    if (!title || !description || !categoryId) {
      return res.status(400).json({ error: 'Title, description, and category are required.' });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        categoryId: parseInt(categoryId, 10),
        difficulty: difficulty || 'INTERMEDIATE',
        durationMinutes: parseInt(durationMinutes, 10) || 20,
        passingPercentage: parseFloat(passingPercentage) || 60.0,
        maxAttempts: parseInt(maxAttempts, 10) || 3,
        status: status || 'DRAFT',
        thumbnailUrl: thumbnailUrl || null
      }
    });

    res.status(201).json({ message: 'Quiz created successfully!', quiz });
  } catch (error) {
    console.error('Create Quiz Error:', error);
    res.status(500).json({ error: 'Failed to create quiz.' });
  }
};

// UPDATE QUIZ (Admin Only)
const updateQuiz = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, categoryId, difficulty, durationMinutes, passingPercentage, maxAttempts, status, thumbnailUrl } = req.body;

    const updated = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        description,
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        difficulty,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
        passingPercentage: passingPercentage ? parseFloat(passingPercentage) : undefined,
        maxAttempts: maxAttempts ? parseInt(maxAttempts, 10) : undefined,
        status,
        thumbnailUrl
      }
    });

    res.json({ message: 'Quiz updated successfully!', quiz: updated });
  } catch (error) {
    console.error('Update Quiz Error:', error);
    res.status(500).json({ error: 'Failed to update quiz.' });
  }
};

// DELETE QUIZ (Admin Only)
const deleteQuiz = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.quiz.delete({ where: { id } });
    res.json({ message: 'Quiz deleted successfully!' });
  } catch (error) {
    console.error('Delete Quiz Error:', error);
    res.status(500).json({ error: 'Failed to delete quiz.' });
  }
};

// ADD QUESTION TO QUIZ (Admin Only)
const addQuestion = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    const { questionText, options, correctAnswer, explanation, marks, difficulty } = req.body;

    if (!questionText || !options || !correctAnswer) {
      return res.status(400).json({ error: 'Question text, options array, and correct answer are required.' });
    }

    const optionsStr = typeof options === 'string' ? options : JSON.stringify(options);

    const question = await prisma.question.create({
      data: {
        quizId,
        questionText,
        options: optionsStr,
        correctAnswer,
        explanation: explanation || '',
        marks: parseInt(marks, 10) || 1,
        difficulty: difficulty || 'INTERMEDIATE'
      }
    });

    res.status(201).json({ message: 'Question added successfully!', question });
  } catch (error) {
    console.error('Add Question Error:', error);
    res.status(500).json({ error: 'Failed to add question.' });
  }
};

// UPDATE QUESTION (Admin Only)
const updateQuestion = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { questionText, options, correctAnswer, explanation, marks, difficulty } = req.body;

    const optionsStr = options ? (typeof options === 'string' ? options : JSON.stringify(options)) : undefined;

    const updated = await prisma.question.update({
      where: { id },
      data: {
        questionText,
        options: optionsStr,
        correctAnswer,
        explanation,
        marks: marks ? parseInt(marks, 10) : undefined,
        difficulty
      }
    });

    res.json({ message: 'Question updated successfully!', question: updated });
  } catch (error) {
    console.error('Update Question Error:', error);
    res.status(500).json({ error: 'Failed to update question.' });
  }
};

// DELETE QUESTION (Admin Only)
const deleteQuestion = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.question.delete({ where: { id } });
    res.json({ message: 'Question deleted successfully!' });
  } catch (error) {
    console.error('Delete Question Error:', error);
    res.status(500).json({ error: 'Failed to delete question.' });
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion
};
