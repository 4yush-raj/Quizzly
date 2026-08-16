const prisma = require('../config/db');
const { store, nextId } = require('../store/memoryStore');

// SUBMIT QUIZ ATTEMPT & SECURE BACKEND SCORING
const submitAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId, userAnswers, timeTakenSeconds } = req.body;

    if (!quizId || !Array.isArray(userAnswers)) {
      return res.status(400).json({ error: 'Quiz ID and user answers array are required.' });
    }

    const quizIdInt = parseInt(quizId, 10);

    // Fetch quiz and its questions
    let quiz = null;
    let questions = [];

    if (prisma) {
      try {
        quiz = await prisma.quiz.findUnique({ where: { id: quizIdInt } });
        if (quiz) {
          questions = await prisma.question.findMany({ where: { quizId: quizIdInt } });
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!quiz) {
      quiz = store.quizzes.find((q) => q.id === quizIdInt);
      questions = store.questions.filter((quest) => quest.quizId === quizIdInt);
    }

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    // Process & Evaluate Answers Server-Side
    let correctAnswersCount = 0;
    let incorrectAnswersCount = 0;
    let unansweredCount = 0;
    let obtainedMarks = 0;
    let totalMarks = 0;

    const detailedAnswers = questions.map((q) => {
      totalMarks += q.marks || 1;
      const ua = userAnswers.find((ans) => ans.questionId === q.id);
      const selected = ua ? ua.selectedAnswer : null;

      let isCorrect = false;
      if (!selected) {
        unansweredCount++;
      } else if (selected === q.correctAnswer) {
        isCorrect = true;
        correctAnswersCount++;
        obtainedMarks += q.marks || 1;
      } else {
        incorrectAnswersCount++;
      }

      return {
        questionId: q.id,
        questionText: q.questionText,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: q.marks || 1,
        isCorrect
      };
    });

    const totalQuestions = questions.length;
    const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 10000) / 100 : 0;
    const passedStatus = percentage >= quiz.passingPercentage ? 'PASSED' : 'FAILED';
    const elapsedSeconds = parseInt(timeTakenSeconds, 10) || 0;

    const attemptData = {
      userId,
      quizId: quizIdInt,
      score: percentage,
      obtainedMarks,
      totalMarks,
      totalQuestions,
      correctAnswers: correctAnswersCount,
      incorrectAnswers: incorrectAnswersCount,
      unanswered: unansweredCount,
      timeTakenSeconds: elapsedSeconds,
      status: passedStatus,
      answers: JSON.stringify(detailedAnswers),
      completedAt: new Date().toISOString()
    };

    let createdAttempt = null;

    if (prisma) {
      try {
        createdAttempt = await prisma.quizAttempt.create({
          data: {
            userId: attemptData.userId,
            quizId: attemptData.quizId,
            score: attemptData.score,
            obtainedMarks: attemptData.obtainedMarks,
            totalMarks: attemptData.totalMarks,
            totalQuestions: attemptData.totalQuestions,
            correctAnswers: attemptData.correctAnswers,
            incorrectAnswers: attemptData.incorrectAnswers,
            unanswered: attemptData.unanswered,
            timeTakenSeconds: attemptData.timeTakenSeconds,
            status: attemptData.status,
            answers: attemptData.answers
          }
        });
      } catch (e) {
        // Fallback
      }
    }

    if (!createdAttempt) {
      createdAttempt = {
        id: nextId.attempts++,
        ...attemptData,
        startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString()
      };
      store.attempts.push(createdAttempt);
    }

    res.status(201).json({
      message: 'Quiz submitted successfully!',
      attemptId: createdAttempt.id,
      result: {
        id: createdAttempt.id,
        quizTitle: quiz.title,
        score: percentage,
        obtainedMarks,
        totalMarks,
        totalQuestions,
        correctAnswers: correctAnswersCount,
        incorrectAnswers: incorrectAnswersCount,
        unanswered: unansweredCount,
        timeTakenSeconds: elapsedSeconds,
        status: passedStatus,
        passingPercentage: quiz.passingPercentage,
        detailedAnswers
      }
    });
  } catch (error) {
    console.error('Submit Attempt Error:', error);
    res.status(500).json({ error: 'Failed to submit quiz attempt.' });
  }
};

// GET USER ATTEMPTS (or all attempts for admin)
const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const targetUserId = req.query.userId ? parseInt(req.query.userId, 10) : null;

    let attempts = [];

    const queryUserId = role === 'ADMIN' && targetUserId ? targetUserId : userId;

    if (prisma) {
      try {
        const raw = await prisma.quizAttempt.findMany({
          where: role === 'ADMIN' && !targetUserId ? {} : { userId: queryUserId },
          include: {
            quiz: { select: { title: true, category: { select: { name: true } } } },
            user: { select: { name: true, email: true } }
          },
          orderBy: { completedAt: 'desc' }
        });

        attempts = raw.map((att) => ({
          id: att.id,
          quizId: att.quizId,
          quizTitle: att.quiz.title,
          categoryName: att.quiz.category ? att.quiz.category.name : 'General',
          studentName: att.user.name,
          studentEmail: att.user.email,
          score: att.score,
          status: att.status,
          correctAnswers: att.correctAnswers,
          totalQuestions: att.totalQuestions,
          timeTakenSeconds: att.timeTakenSeconds,
          completedAt: att.completedAt
        }));

        return res.json(attempts);
      } catch (e) {
        // Fallback
      }
    }

    // Memory Store Fallback
    let raw = [...store.attempts];

    if (role !== 'ADMIN' || targetUserId) {
      raw = raw.filter((att) => att.userId === queryUserId);
    }

    attempts = raw.map((att) => {
      const q = store.quizzes.find((quiz) => quiz.id === att.quizId);
      const u = store.users.find((user) => user.id === att.userId);
      const cat = q ? store.categories.find((c) => c.id === q.categoryId) : null;

      return {
        id: att.id,
        quizId: att.quizId,
        quizTitle: q ? q.title : 'Quiz',
        categoryName: cat ? cat.name : 'General',
        studentName: u ? u.name : 'Student',
        studentEmail: u ? u.email : '',
        score: att.score,
        status: att.status,
        correctAnswers: att.correctAnswers,
        totalQuestions: att.totalQuestions,
        timeTakenSeconds: att.timeTakenSeconds,
        completedAt: att.completedAt
      };
    });

    attempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attempts.' });
  }
};

// GET ATTEMPT DETAILS BY ID (FOR ANSWER REVIEW)
const getAttemptById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const role = req.user.role;

    let attempt = null;

    if (prisma) {
      try {
        const att = await prisma.quizAttempt.findUnique({
          where: { id },
          include: {
            quiz: { select: { title: true, passingPercentage: true } },
            user: { select: { name: true, email: true } }
          }
        });

        if (att && (role === 'ADMIN' || att.userId === userId)) {
          return res.json({
            id: att.id,
            quizTitle: att.quiz.title,
            studentName: att.user.name,
            score: att.score,
            obtainedMarks: att.obtainedMarks,
            totalMarks: att.totalMarks,
            totalQuestions: att.totalQuestions,
            correctAnswers: att.correctAnswers,
            incorrectAnswers: att.incorrectAnswers,
            unanswered: att.unanswered,
            timeTakenSeconds: att.timeTakenSeconds,
            status: att.status,
            passingPercentage: att.quiz.passingPercentage,
            completedAt: att.completedAt,
            detailedAnswers: typeof att.answers === 'string' ? JSON.parse(att.answers) : att.answers
          });
        }
      } catch (e) {
        // Fallback
      }
    }

    // Memory Store
    const att = store.attempts.find((a) => a.id === id);
    if (!att) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }

    if (role !== 'ADMIN' && att.userId !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const q = store.quizzes.find((quiz) => quiz.id === att.quizId);
    const u = store.users.find((user) => user.id === att.userId);

    res.json({
      id: att.id,
      quizTitle: q ? q.title : 'Quiz',
      studentName: u ? u.name : 'Student',
      score: att.score,
      obtainedMarks: att.obtainedMarks,
      totalMarks: att.totalMarks,
      totalQuestions: att.totalQuestions,
      correctAnswers: att.correctAnswers,
      incorrectAnswers: att.incorrectAnswers,
      unanswered: att.unanswered,
      timeTakenSeconds: att.timeTakenSeconds,
      status: att.status,
      passingPercentage: q ? q.passingPercentage : 60,
      completedAt: att.completedAt,
      detailedAnswers: typeof att.answers === 'string' ? JSON.parse(att.answers) : att.answers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attempt result.' });
  }
};

module.exports = {
  submitAttempt,
  getUserAttempts,
  getAttemptById
};
