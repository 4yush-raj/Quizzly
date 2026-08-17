const prisma = require('../config/db');
const { store } = require('../store/memoryStore');

// GET LEADERBOARD
const getLeaderboard = async (req, res) => {
  try {
    const { categoryId, sortBy } = req.query;
    const catId = categoryId ? parseInt(categoryId, 10) : null;
    let students = [];
    let prismaSucceeded = false;

    if (prisma) {
      try {
        const rawStudents = await prisma.user.findMany({
          where: { role: 'STUDENT', status: 'ACTIVE' },
          include: {
            attempts: {
              include: { quiz: true }
            }
          }
        });

        students = rawStudents.map((u) => {
          let userAttempts = u.attempts || [];
          if (catId) {
            userAttempts = userAttempts.filter((a) => a.quiz && a.quiz.categoryId === catId);
          }

          const completed = userAttempts.length;
          const sumScore = userAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
          const avgScore = completed > 0 ? Math.round((sumScore / completed) * 10) / 10 : 0;
          const highestScore = completed > 0 ? Math.max(...userAttempts.map((a) => a.score || 0)) : 0;

          return {
            studentId: u.id,
            studentName: u.name,
            email: u.email,
            quizzesCompleted: completed,
            averageScore: avgScore,
            highestScore: highestScore
          };
        });

        prismaSucceeded = true;
      } catch (e) {
        console.error('Prisma Leaderboard Error:', e);
      }
    }

    if (!prismaSucceeded) {
      const activeStudents = (store.users || []).filter((u) => u.role === 'STUDENT' && u.status === 'ACTIVE');

      students = activeStudents.map((u) => {
        let userAttempts = (store.attempts || []).filter((a) => a.userId === u.id);

        if (catId) {
          const quizIds = (store.quizzes || []).filter((q) => q.categoryId === catId).map((q) => q.id);
          userAttempts = userAttempts.filter((a) => quizIds.includes(a.quizId));
        }

        const completed = userAttempts.length;
        const sumScore = userAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
        const avgScore = completed > 0 ? Math.round((sumScore / completed) * 10) / 10 : 0;
        const highestScore = completed > 0 ? Math.max(...userAttempts.map((a) => a.score || 0)) : 0;

        return {
          studentId: u.id,
          studentName: u.name,
          email: u.email,
          quizzesCompleted: completed,
          averageScore: avgScore,
          highestScore: highestScore
        };
      });
    }

    // Sort leaderboard
    if (sortBy === 'highest') {
      students.sort((a, b) => b.highestScore - a.highestScore || b.quizzesCompleted - a.quizzesCompleted);
    } else if (sortBy === 'completed') {
      students.sort((a, b) => b.quizzesCompleted - a.quizzesCompleted || b.averageScore - a.averageScore);
    } else {
      // Default: sort by average score
      students.sort((a, b) => b.averageScore - a.averageScore || b.quizzesCompleted - a.quizzesCompleted);
    }

    // Assign Ranks
    leaderboard = students.map((s, index) => ({
      rank: index + 1,
      ...s
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
};

module.exports = {
  getLeaderboard
};
