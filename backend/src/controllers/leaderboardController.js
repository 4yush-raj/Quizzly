const prisma = require('../config/db');
const { store } = require('../store/memoryStore');

// GET LEADERBOARD
const getLeaderboard = async (req, res) => {
  try {
    const { categoryId, sortBy } = req.query; // sortBy: 'average' | 'highest' | 'completed'

    let leaderboard = [];

    // Get all students
    let students = [];
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
          let userAttempts = u.attempts;
          if (categoryId) {
            userAttempts = userAttempts.filter((a) => a.quiz.categoryId === parseInt(categoryId, 10));
          }

          const completed = userAttempts.length;
          const sumScore = userAttempts.reduce((acc, a) => acc + a.score, 0);
          const avgScore = completed > 0 ? Math.round((sumScore / completed) * 10) / 10 : 0;
          const highestScore = completed > 0 ? Math.max(...userAttempts.map((a) => a.score)) : 0;

          return {
            studentId: u.id,
            studentName: u.name,
            email: u.email,
            quizzesCompleted: completed,
            averageScore: avgScore,
            highestScore: highestScore
          };
        });
      } catch (e) {
        // Fallback
      }
    }

    if (students.length === 0) {
      const activeStudents = store.users.filter((u) => u.role === 'STUDENT' && u.status === 'ACTIVE');

      students = activeStudents.map((u) => {
        let userAttempts = store.attempts.filter((a) => a.userId === u.id);

        if (categoryId) {
          const catId = parseInt(categoryId, 10);
          const quizIds = store.quizzes.filter((q) => q.categoryId === catId).map((q) => q.id);
          userAttempts = userAttempts.filter((a) => quizIds.includes(a.quizId));
        }

        const completed = userAttempts.length;
        const sumScore = userAttempts.reduce((acc, a) => acc + a.score, 0);
        const avgScore = completed > 0 ? Math.round((sumScore / completed) * 10) / 10 : 0;
        const highestScore = completed > 0 ? Math.max(...userAttempts.map((a) => a.score)) : 0;

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
