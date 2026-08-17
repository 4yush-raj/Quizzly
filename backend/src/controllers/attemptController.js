const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { store, nextId } = require('../store/memoryStore');

// SUBMIT QUIZ ATTEMPT & SECURE BACKEND SCORING
const submitAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
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
        console.error('Prisma Fetch Quiz/Questions Error:', e);
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
        // Resolve database user ID dynamically by email to avoid Foreign Key constraint error
        let dbUserId = userId;
        if (userEmail) {
          const dbUser = await prisma.user.findUnique({ where: { email: userEmail.toLowerCase() } });
          if (dbUser) {
            dbUserId = dbUser.id;
          } else {
            const hashedPassword = await bcrypt.hash('defaultStudentPass123', 10);
            const createdUser = await prisma.user.create({
              data: {
                name: req.user.name || 'Student',
                email: userEmail.toLowerCase(),
                password: hashedPassword,
                role: req.user.role || 'STUDENT',
                status: 'ACTIVE'
              }
            });
            dbUserId = createdUser.id;
          }
        }

        createdAttempt = await prisma.quizAttempt.create({
          data: {
            userId: dbUserId,
            quizId: quizIdInt,
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
        console.error('Prisma QuizAttempt Create Error:', e);
      }
    }

    if (!createdAttempt) {
      createdAttempt = {
        id: nextId.attempts++,
        userId,
        quizId: quizIdInt,
        ...attemptData,
        startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString()
      };
      store.attempts.push(createdAttempt);
    } else {
      // Sync created attempt to memory store
      if (!store.attempts.some((a) => a.id === createdAttempt.id)) {
        store.attempts.push({
          id: createdAttempt.id,
          userId: createdAttempt.userId,
          quizId: createdAttempt.quizId,
          score: createdAttempt.score,
          obtainedMarks: createdAttempt.obtainedMarks,
          totalMarks: createdAttempt.totalMarks,
          totalQuestions: createdAttempt.totalQuestions,
          correctAnswers: createdAttempt.correctAnswers,
          incorrectAnswers: createdAttempt.incorrectAnswers,
          unanswered: createdAttempt.unanswered,
          timeTakenSeconds: createdAttempt.timeTakenSeconds,
          status: createdAttempt.status,
          answers: createdAttempt.answers,
          startedAt: createdAttempt.startedAt ? createdAttempt.startedAt.toISOString() : new Date().toISOString(),
          completedAt: createdAttempt.completedAt ? createdAttempt.completedAt.toISOString() : new Date().toISOString()
        });
      }
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
    const userEmail = req.user.email;
    const role = req.user.role;
    const targetUserId = req.query.userId ? parseInt(req.query.userId, 10) : null;

    let attempts = [];

    if (prisma) {
      try {
        let dbUserId = userId;
        if (userEmail) {
          const dbUser = await prisma.user.findUnique({ where: { email: userEmail.toLowerCase() } });
          if (dbUser) {
            dbUserId = dbUser.id;
          }
        }

        const queryUserId = role === 'ADMIN' && targetUserId ? targetUserId : dbUserId;

        const raw = await prisma.quizAttempt.findMany({
          where: role === 'ADMIN' && !targetUserId ? {} : { userId: queryUserId },
          include: {
            quiz: { select: { title: true, category: { select: { name: true } } } },
            user: { select: { name: true, email: true } }
          },
          orderBy: { completedAt: 'desc' }
        });

        if (raw) {
          attempts = raw.map((att) => ({
            id: att.id,
            quizId: att.quizId,
            quizTitle: att.quiz ? att.quiz.title : 'Quiz',
            categoryName: att.quiz && att.quiz.category ? att.quiz.category.name : 'General',
            studentName: att.user ? att.user.name : 'Student',
            studentEmail: att.user ? att.user.email : '',
            score: att.score,
            status: att.status,
            correctAnswers: att.correctAnswers,
            totalQuestions: att.totalQuestions,
            timeTakenSeconds: att.timeTakenSeconds,
            completedAt: att.completedAt
          }));
          return res.json(attempts);
        }
      } catch (e) {
        console.error('Prisma getUserAttempts Error:', e);
      }
    }

    // Memory Store Fallback
    let raw = [...store.attempts];

    const queryUserId = role === 'ADMIN' && targetUserId ? targetUserId : userId;
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
    console.error('getUserAttempts Error:', error);
    res.status(500).json({ error: 'Failed to fetch attempts.' });
  }
};

// GET ATTEMPT DETAILS BY ID (FOR ANSWER REVIEW)
const getAttemptById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const userEmail = req.user.email;
    const role = req.user.role;

    if (prisma) {
      try {
        const att = await prisma.quizAttempt.findUnique({
          where: { id },
          include: {
            quiz: { select: { title: true, passingPercentage: true } },
            user: { select: { name: true, email: true } }
          }
        });

        if (att && (role === 'ADMIN' || att.userId === userId || (att.user && att.user.email.toLowerCase() === (userEmail || '').toLowerCase()))) {
          return res.json({
            id: att.id,
            quizTitle: att.quiz ? att.quiz.title : 'Quiz',
            studentName: att.user ? att.user.name : 'Student',
            score: att.score,
            obtainedMarks: att.obtainedMarks,
            totalMarks: att.totalMarks,
            totalQuestions: att.totalQuestions,
            correctAnswers: att.correctAnswers,
            incorrectAnswers: att.incorrectAnswers,
            unanswered: att.unanswered,
            timeTakenSeconds: att.timeTakenSeconds,
            status: att.status,
            passingPercentage: att.quiz ? att.quiz.passingPercentage : 60,
            completedAt: att.completedAt,
            detailedAnswers: typeof att.answers === 'string' ? JSON.parse(att.answers) : att.answers
          });
        }
      } catch (e) {
        console.error('Prisma getAttemptById Error:', e);
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
    console.error('getAttemptById Error:', error);
    res.status(500).json({ error: 'Failed to fetch attempt result.' });
  }
};

module.exports = {
  submitAttempt,
  getUserAttempts,
  getAttemptById
};
