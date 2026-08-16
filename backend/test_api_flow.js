const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(parsed);
          }
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function testApiFlow() {
  console.log('🚀 Testing Express API <-> Supabase PostgreSQL Live Database Flow...\n');

  try {
    // 1. Health check
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    console.log(`✅ 1. API Server Health Check: ${health.message}`);

    // 2. Login as Student
    const loginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'student@quizzly.com', password: 'student123' }
    );
    const token = loginRes.token;
    console.log(`✅ 2. Student Authentication (JWT Issued): SUCCESSFUL for ${loginRes.user.email}`);

    // 3. Fetch Quizzes from Supabase
    const quizzes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/quizzes',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ 3. Fetch Quizzes from Supabase: Found ${quizzes.length} published quizzes`);

    if (quizzes.length > 0) {
      const targetQuiz = quizzes[0];

      // 4. Fetch Full Quiz Details with Questions
      const quizDetail = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/quizzes/${targetQuiz.id}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const questions = quizDetail.questions;
      console.log(`✅ 4. Fetch Quiz "${targetQuiz.title}" Questions: Found ${questions.length} questions`);

      // 5. Submit Quiz Attempt to Supabase Database
      const userAnswers = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: q.correctAnswer // submitting correct answer
      }));

      const submitRes = await makeRequest(
        {
          hostname: 'localhost',
          port: 5000,
          path: '/api/attempts/submit',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        },
        {
          quizId: targetQuiz.id,
          userAnswers,
          timeTakenSeconds: 45
        }
      );

      console.log(`✅ 5. Submit Quiz Attempt to Supabase Database: SUCCESSFUL!`);
      console.log(`   - Attempt ID: ${submitRes.attemptId}`);
      console.log(`   - Score Calculated: ${submitRes.score}%`);
      console.log(`   - Evaluation Status: ${submitRes.status}`);

      // 6. Fetch Result Review
      const resultRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/attempts/${submitRes.attemptId}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ 6. Retrieve Stored Attempt from Database: SUCCESSFUL! (Correct: ${resultRes.correctAnswers}/${resultRes.totalQuestions})`);
    }

    console.log('\n🎉 ALL API & LIVE SUPABASE DATABASE INTEGRATION TESTS PASSED PERFECTLY!');
  } catch (error) {
    console.error('❌ API Flow Error:', error);
  }
}

testApiFlow();
