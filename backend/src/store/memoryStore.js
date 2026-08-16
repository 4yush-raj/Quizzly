const bcrypt = require('bcryptjs');

// In-Memory Data Store Fallback & Pre-populated Demo Dataset
const initialPasswordHash = bcrypt.hashSync('admin123', 10);
const studentPasswordHash = bcrypt.hashSync('student123', 10);

const store = {
  users: [
    {
      id: 1,
      name: 'System Admin',
      email: 'admin@quizzly.com',
      password: initialPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01').toISOString()
    },
    {
      id: 2,
      name: 'Rahul Sharma',
      email: 'rahul@quizzly.com',
      password: studentPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: new Date('2026-02-01').toISOString()
    },
    {
      id: 3,
      name: 'Priya Patel',
      email: 'priya@quizzly.com',
      password: studentPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: new Date('2026-02-05').toISOString()
    },
    {
      id: 4,
      name: 'Amit Kumar',
      email: 'student@quizzly.com',
      password: studentPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: new Date('2026-02-10').toISOString()
    }
  ],

  categories: [
    { id: 1, name: 'JavaScript', description: 'Core JavaScript programming language concepts, ES6+, async JS', createdAt: new Date().toISOString() },
    { id: 2, name: 'React', description: 'Components, hooks, state management, and virtual DOM', createdAt: new Date().toISOString() },
    { id: 3, name: 'HTML & CSS', description: 'Web semantics, layout, flexbox, grid, and responsiveness', createdAt: new Date().toISOString() },
    { id: 4, name: 'Python', description: 'Python syntax, data structures, and OOP concepts', createdAt: new Date().toISOString() },
    { id: 5, name: 'Database', description: 'SQL queries, relational modeling, indexing, and PostgreSQL', createdAt: new Date().toISOString() },
    { id: 6, name: 'Node.js', description: 'Backend JavaScript, Express framework, and REST API design', createdAt: new Date().toISOString() }
  ],

  quizzes: [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Test your understanding of JavaScript core syntax, variables, scope, functions, and object manipulation.',
      categoryId: 1,
      difficulty: 'INTERMEDIATE',
      durationMinutes: 15,
      passingPercentage: 60.0,
      maxAttempts: 3,
      status: 'PUBLISHED',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500&auto=format&fit=crop&q=60',
      createdAt: new Date('2026-02-01').toISOString()
    },
    {
      id: 2,
      title: 'React Hooks & State Mastery',
      description: 'Comprehensive evaluation on useState, useEffect, useMemo, custom hooks, and context API.',
      categoryId: 2,
      difficulty: 'HARD',
      durationMinutes: 20,
      passingPercentage: 70.0,
      maxAttempts: 2,
      status: 'PUBLISHED',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
      createdAt: new Date('2026-02-05').toISOString()
    },
    {
      id: 3,
      title: 'CSS Grid & Flexbox Masterclass',
      description: 'Test modern layout techniques, media queries, flexbox alignment, and CSS grid template areas.',
      categoryId: 3,
      difficulty: 'EASY',
      durationMinutes: 10,
      passingPercentage: 50.0,
      maxAttempts: 5,
      status: 'PUBLISHED',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60',
      createdAt: new Date('2026-02-08').toISOString()
    },
    {
      id: 4,
      title: 'Python Basics & Data Structures',
      description: 'Lists, dictionaries, tuples, sets, list comprehensions, and control flow in Python 3.',
      categoryId: 4,
      difficulty: 'EASY',
      durationMinutes: 15,
      passingPercentage: 60.0,
      maxAttempts: 3,
      status: 'DRAFT',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60',
      createdAt: new Date('2026-02-12').toISOString()
    }
  ],

  questions: [
    // JS Quiz Questions
    {
      id: 1,
      quizId: 1,
      questionText: 'Which method converts a JSON string into a JavaScript object?',
      options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.object()'],
      correctAnswer: 'JSON.parse()',
      explanation: 'JSON.parse() parses a JSON string, constructing the JavaScript value or object described by the string.',
      marks: 1,
      difficulty: 'INTERMEDIATE'
    },
    {
      id: 2,
      quizId: 1,
      questionText: 'Which keyword is used to declare a constant variable in ES6?',
      options: ['var', 'let', 'const', 'static'],
      correctAnswer: 'const',
      explanation: 'The const keyword creates block-scoped constants whose values cannot be reassigned.',
      marks: 1,
      difficulty: 'EASY'
    },
    {
      id: 3,
      quizId: 1,
      questionText: 'What is the output of typeof null in JavaScript?',
      options: ['"null"', '"undefined"', '"object"', '"boolean"'],
      correctAnswer: '"object"',
      explanation: 'In JavaScript, typeof null is a legacy bug in the language where it returns "object".',
      marks: 1,
      difficulty: 'INTERMEDIATE'
    },
    {
      id: 4,
      quizId: 1,
      questionText: 'Which of the following is NOT a JavaScript primitive data type?',
      options: ['String', 'Number', 'Array', 'Symbol'],
      correctAnswer: 'Array',
      explanation: 'Array is an Object in JavaScript, whereas String, Number, and Symbol are primitive types.',
      marks: 1,
      difficulty: 'EASY'
    },
    {
      id: 5,
      quizId: 1,
      questionText: 'What will Array.prototype.map() return?',
      options: ['A single accumulated value', 'A new array populated with the results of calling a provided function', 'Boolean true/false', 'Modifies original array in place'],
      correctAnswer: 'A new array populated with the results of calling a provided function',
      explanation: 'map() creates a new array populated with the results of calling a provided function on every element in the calling array.',
      marks: 1,
      difficulty: 'INTERMEDIATE'
    },

    // React Quiz Questions
    {
      id: 6,
      quizId: 2,
      questionText: 'Which hook should be used to execute side effects in functional components?',
      options: ['useState', 'useReducer', 'useEffect', 'useCallback'],
      correctAnswer: 'useEffect',
      explanation: 'useEffect lets you synchronize a component with an external system and run side-effects.',
      marks: 1,
      difficulty: 'INTERMEDIATE'
    },
    {
      id: 7,
      quizId: 2,
      questionText: 'What does the dependency array in useEffect control?',
      options: ['Component props validation', 'When the effect callback re-runs', 'The state mutation speed', 'Redux store updates'],
      correctAnswer: 'When the effect callback re-runs',
      explanation: 'The effect re-runs whenever any dependency value specified in the dependency array changes.',
      marks: 1,
      difficulty: 'HARD'
    },
    {
      id: 8,
      quizId: 2,
      questionText: 'How can you prevent unnecessary re-renders of child components in React?',
      options: ['React.memo', 'useRef', 'dangerouslySetInnerHTML', 'forceUpdate'],
      correctAnswer: 'React.memo',
      explanation: 'React.memo is a higher-order component that skips re-rendering when props have not changed.',
      marks: 1,
      difficulty: 'HARD'
    },

    // CSS Quiz Questions
    {
      id: 9,
      quizId: 3,
      questionText: 'Which CSS property flexbox container property aligns items along the cross axis?',
      options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
      correctAnswer: 'align-items',
      explanation: 'align-items defines how flex items are aligned along the cross axis.',
      marks: 1,
      difficulty: 'EASY'
    },
    {
      id: 10,
      quizId: 3,
      questionText: 'What is the default value of the position property in CSS?',
      options: ['relative', 'absolute', 'static', 'fixed'],
      correctAnswer: 'static',
      explanation: 'Elements are positioned static by default, following the normal page flow.',
      marks: 1,
      difficulty: 'EASY'
    }
  ],

  attempts: [
    {
      id: 1,
      userId: 2, // Rahul
      quizId: 1,
      score: 96.0,
      obtainedMarks: 5.0,
      totalMarks: 5.0,
      totalQuestions: 5,
      correctAnswers: 5,
      incorrectAnswers: 0,
      unanswered: 0,
      timeTakenSeconds: 320,
      status: 'PASSED',
      answers: JSON.stringify([
        { questionId: 1, selectedAnswer: 'JSON.parse()', isCorrect: true },
        { questionId: 2, selectedAnswer: 'const', isCorrect: true },
        { questionId: 3, selectedAnswer: '"object"', isCorrect: true },
        { questionId: 4, selectedAnswer: 'Array', isCorrect: true },
        { questionId: 5, selectedAnswer: 'A new array populated with the results of calling a provided function', isCorrect: true }
      ]),
      startedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 4 + 320000).toISOString()
    },
    {
      id: 2,
      userId: 3, // Priya
      quizId: 1,
      score: 93.0,
      obtainedMarks: 4.0,
      totalMarks: 5.0,
      totalQuestions: 5,
      correctAnswers: 4,
      incorrectAnswers: 1,
      unanswered: 0,
      timeTakenSeconds: 450,
      status: 'PASSED',
      answers: JSON.stringify([
        { questionId: 1, selectedAnswer: 'JSON.parse()', isCorrect: true },
        { questionId: 2, selectedAnswer: 'const', isCorrect: true },
        { questionId: 3, selectedAnswer: '"null"', isCorrect: false },
        { questionId: 4, selectedAnswer: 'Array', isCorrect: true },
        { questionId: 5, selectedAnswer: 'A new array populated with the results of calling a provided function', isCorrect: true }
      ]),
      startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 3 + 450000).toISOString()
    },
    {
      id: 3,
      userId: 4, // Amit
      quizId: 1,
      score: 80.0,
      obtainedMarks: 4.0,
      totalMarks: 5.0,
      totalQuestions: 5,
      correctAnswers: 4,
      incorrectAnswers: 1,
      unanswered: 0,
      timeTakenSeconds: 512,
      status: 'PASSED',
      answers: JSON.stringify([
        { questionId: 1, selectedAnswer: 'JSON.parse()', isCorrect: true },
        { questionId: 2, selectedAnswer: 'const', isCorrect: true },
        { questionId: 3, selectedAnswer: '"object"', isCorrect: true },
        { questionId: 4, selectedAnswer: 'String', isCorrect: false },
        { questionId: 5, selectedAnswer: 'A new array populated with the results of calling a provided function', isCorrect: true }
      ]),
      startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 2 + 512000).toISOString()
    }
  ]
};

let nextId = {
  users: 5,
  categories: 7,
  quizzes: 5,
  questions: 11,
  attempts: 4
};

module.exports = {
  store,
  nextId
};
