const prisma = require('../config/db');
const { store, nextId } = require('../store/memoryStore');

// GET ALL QUIZZES (with Discovery Filters & Role checks)
const getQuizzes = async (req, res) => {
  try {
    const { search, category, difficulty, duration, sortBy, status } = req.query;
    const userRole = req.user ? req.user.role : 'STUDENT';

    let quizzes = [];

    if (prisma) {
      try {
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

        const rawQuizzes = await prisma.quiz.findMany({
          where: whereClause,
          include: {
            category: true,
            _count: {
              select: { questions: true, attempts: true }
            }
          },
          orderBy: sortBy === 'popular' ? { attempts: { _count: 'desc' } } : { createdAt: 'desc' }
        });

        quizzes = rawQuizzes.map((q) => ({
          ...q,
          categoryName: q.category.name,
          questionCount: q._count.questions,
          attemptCount: q._count.attempts
        }));

        return res.json(quizzes);
      } catch (e) {
        // Fallback
      }
    }

    // Memory Store fallback
    let filtered = [...store.quizzes];

    if (userRole !== 'ADMIN') {
      filtered = filtered.filter((q) => q.status === 'PUBLISHED');
    } else if (status) {
      filtered = filtered.filter((q) => q.status === status);
    }

    if (category) {
      filtered = filtered.filter((q) => q.categoryId === parseInt(category, 10));
    }

    if (difficulty) {
      filtered = filtered.filter((q) => q.difficulty === difficulty);
    }

    if (search) {
      const qLower = search.toLowerCase();
      filtered = filtered.filter(
        (q) => q.title.toLowerCase().includes(qLower) || q.description.toLowerCase().includes(qLower)
      );
    }

    if (duration) {
      const durInt = parseInt(duration, 10);
      filtered = filtered.filter((q) => q.durationMinutes <= durInt);
    }

    // Map counts
    quizzes = filtered.map((q) => {
      const cat = store.categories.find((c) => c.id === q.categoryId);
      const questionCount = store.questions.filter((quest) => quest.quizId === q.id).length;
      const attemptCount = store.attempts.filter((att) => att.quizId === q.id).length;

      return {
        ...q,
        categoryName: cat ? cat.name : 'General',
        questionCount,
        attemptCount
      };
    });

    if (sortBy === 'popular') {
      quizzes.sort((a, b) => b.attemptCount - a.attemptCount);
    } else if (sortBy === 'duration') {
      quizzes.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else {
      quizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

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
    const userId = req.user.id;
    const userRole = req.user.role;

    let quiz = null;

    if (prisma) {
      try {
        const q = await prisma.quiz.findUnique({
          where: { id },
          include: {
            category: true,
            questions: true,
            _count: { select: { attempts: true } }
          }
        });
        if (q) {
          const userAttemptCount = await prisma.quizAttempt.count({
            where: { quizId: id, userId }
          });
          quiz = {
            ...q,
            categoryName: q.category.name,
            questionCount: q.questions.length,
            attemptCount: q._count.attempts,
            userAttemptsLeft: Math.max(0, q.maxAttempts - userAttemptCount)
          };
          return res.json(quiz);
        }
      } catch (e) {
        // Fallback
      }
    }

    // Fallback
    const q = store.quizzes.find((quizItem) => quizItem.id === id);
    if (!q) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    if (userRole !== 'ADMIN' && q.status !== 'PUBLISHED') {
      return res.status(403).json({ error: 'This quiz is not currently available.' });
    }

    const cat = store.categories.find((c) => c.id === q.categoryId);
    const questions = store.questions.filter((quest) => quest.quizId === id);
    const totalAttempts = store.attempts.filter((att) => att.quizId === id).length;
    const userAttemptsCount = store.attempts.filter((att) => att.quizId === id && att.userId === userId).length;

    quiz = {
      ...q,
      categoryName: cat ? cat.name : 'General',
      questionCount: questions.length,
      attemptCount: totalAttempts,
      userAttemptsLeft: Math.max(0, q.maxAttempts - userAttemptsCount),
      questions: questions.map((quest) => ({
        ...quest,
        options: typeof quest.options === 'string' ? JSON.parse(quest.options) : quest.options
      }))
    };

    res.json(quiz);
  } catch (error) {
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

    let quiz = null;

    if (prisma) {
      try {
        quiz = await prisma.quiz.create({
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
        return res.status(201).json({ message: 'Quiz created successfully!', quiz });
      } catch (e) {
        // Fallback
      }
    }

    quiz = {
      id: nextId.quizzes++,
      title,
      description,
      categoryId: parseInt(categoryId, 10),
      difficulty: difficulty || 'INTERMEDIATE',
      durationMinutes: parseInt(durationMinutes, 10) || 20,
      passingPercentage: parseFloat(passingPercentage) || 60.0,
      maxAttempts: parseInt(maxAttempts, 10) || 3,
      status: status || 'DRAFT',
      thumbnailUrl: thumbnailUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.quizzes.push(quiz);

    res.status(201).json({ message: 'Quiz created successfully!', quiz });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quiz.' });
  }
};

// UPDATE QUIZ (Admin Only)
const updateQuiz = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, categoryId, difficulty, durationMinutes, passingPercentage, maxAttempts, status, thumbnailUrl } = req.body;

    if (prisma) {
      try {
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
        return res.json({ message: 'Quiz updated successfully!', quiz: updated });
      } catch (e) {
        // Fallback
      }
    }

    const index = store.quizzes.findIndex((q) => q.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    const current = store.quizzes[index];
    store.quizzes[index] = {
      ...current,
      title: title || current.title,
      description: description || current.description,
      categoryId: categoryId ? parseInt(categoryId, 10) : current.categoryId,
      difficulty: difficulty || current.difficulty,
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : current.durationMinutes,
      passingPercentage: passingPercentage ? parseFloat(passingPercentage) : current.passingPercentage,
      maxAttempts: maxAttempts ? parseInt(maxAttempts, 10) : current.maxAttempts,
      status: status || current.status,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : current.thumbnailUrl,
      updatedAt: new Date().toISOString()
    };

    res.json({ message: 'Quiz updated successfully!', quiz: store.quizzes[index] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update quiz.' });
  }
};

// DELETE QUIZ (Admin Only)
const deleteQuiz = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (prisma) {
      try {
        await prisma.quiz.delete({ where: { id } });
        return res.json({ message: 'Quiz deleted successfully!' });
      } catch (e) {
        // Fallback
      }
    }

    const index = store.quizzes.findIndex((q) => q.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    store.quizzes.splice(index, 1);
    store.questions = store.questions.filter((quest) => quest.quizId !== id);
    store.attempts = store.attempts.filter((att) => att.quizId !== id);

    res.json({ message: 'Quiz deleted successfully!' });
  } catch (error) {
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

    let question = null;

    if (prisma) {
      try {
        question = await prisma.question.create({
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
        return res.status(201).json({ message: 'Question added successfully!', question });
      } catch (e) {
        // Fallback
      }
    }

    question = {
      id: nextId.questions++,
      quizId,
      questionText,
      options: optionsStr,
      correctAnswer,
      explanation: explanation || '',
      marks: parseInt(marks, 10) || 1,
      difficulty: difficulty || 'INTERMEDIATE',
      createdAt: new Date().toISOString()
    };
    store.questions.push(question);

    res.status(201).json({ message: 'Question added successfully!', question });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add question.' });
  }
};

// UPDATE QUESTION (Admin Only)
const updateQuestion = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { questionText, options, correctAnswer, explanation, marks, difficulty } = req.body;

    const optionsStr = options ? (typeof options === 'string' ? options : JSON.stringify(options)) : undefined;

    if (prisma) {
      try {
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
        return res.json({ message: 'Question updated successfully!', question: updated });
      } catch (e) {
        // Fallback
      }
    }

    const index = store.questions.findIndex((q) => q.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const cur = store.questions[index];
    store.questions[index] = {
      ...cur,
      questionText: questionText || cur.questionText,
      options: optionsStr || cur.options,
      correctAnswer: correctAnswer || cur.correctAnswer,
      explanation: explanation !== undefined ? explanation : cur.explanation,
      marks: marks ? parseInt(marks, 10) : cur.marks,
      difficulty: difficulty || cur.difficulty
    };

    res.json({ message: 'Question updated successfully!', question: store.questions[index] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question.' });
  }
};

// DELETE QUESTION (Admin Only)
const deleteQuestion = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (prisma) {
      try {
        await prisma.question.delete({ where: { id } });
        return res.json({ message: 'Question deleted successfully!' });
      } catch (e) {
        // Fallback
      }
    }

    const index = store.questions.findIndex((q) => q.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    store.questions.splice(index, 1);
    res.json({ message: 'Question deleted successfully!' });
  } catch (error) {
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
