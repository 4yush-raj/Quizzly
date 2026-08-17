const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Supabase database with comprehensive Quizzly data...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quizzly.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@quizzly.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  const rahul = await prisma.user.upsert({
    where: { email: 'rahul@quizzly.com' },
    update: {},
    create: {
      name: 'Rahul Sharma',
      email: 'rahul@quizzly.com',
      password: studentPassword,
      role: 'STUDENT',
      status: 'ACTIVE'
    }
  });

  const priya = await prisma.user.upsert({
    where: { email: 'priya@quizzly.com' },
    update: {},
    create: {
      name: 'Priya Patel',
      email: 'priya@quizzly.com',
      password: studentPassword,
      role: 'STUDENT',
      status: 'ACTIVE'
    }
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@quizzly.com' },
    update: {},
    create: {
      name: 'Amit Kumar',
      email: 'student@quizzly.com',
      password: studentPassword,
      role: 'STUDENT',
      status: 'ACTIVE'
    }
  });

  // 2. Create Categories (upsert by name isn't built-in without unique index on name, so we use findFirst/create)
  const categoryNames = [
    { name: 'JavaScript', description: 'Core JavaScript concepts, ES6 features, async/await, and browser DOM manipulation.' },
    { name: 'React.js', description: 'Component lifecycles, hooks, virtual DOM, and modern state management.' },
    { name: 'HTML & CSS', description: 'Web semantics, layout, flexbox, grid, and responsiveness.' },
    { name: 'Python', description: 'Python syntax, data structures, and OOP concepts.' },
    { name: 'Databases & SQL', description: 'Relational database schema design, indexing, queries, and transactions.' },
    { name: 'Node.js', description: 'Backend JavaScript, Express framework, and REST API design.' }
  ];

  const catMap = {};
  for (const cat of categoryNames) {
    let existing = await prisma.category.findFirst({ where: { name: cat.name } });
    if (!existing) {
      existing = await prisma.category.create({ data: cat });
    }
    catMap[cat.name] = existing;
  }

  // 3. Create Quizzes & Questions
  const quizzesData = [
    {
      title: 'JavaScript Core Fundamentals',
      description: 'Test your understanding of JavaScript core syntax, variables, scope, functions, and object manipulation.',
      categoryName: 'JavaScript',
      difficulty: 'INTERMEDIATE',
      durationMinutes: 15,
      passingPercentage: 60,
      maxAttempts: 3,
      status: 'PUBLISHED',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=80',
      questions: [
        {
          questionText: 'What is the output of typeof NaN in JavaScript?',
          options: JSON.stringify(['"number"', '"nan"', '"undefined"', '"object"']),
          correctAnswer: '"number"',
          explanation: 'In JavaScript, NaN (Not-a-Number) is a primitive numeric value, so typeof NaN evaluates to "number".',
          marks: 1,
          difficulty: 'INTERMEDIATE'
        },
        {
          questionText: 'Which keyword declares a block-scoped variable that cannot be reassigned?',
          options: JSON.stringify(['var', 'let', 'const', 'static']),
          correctAnswer: 'const',
          explanation: 'The const keyword creates block-scoped read-only references to values.',
          marks: 1,
          difficulty: 'EASY'
        },
        {
          questionText: 'What method converts a JSON string into a JavaScript object?',
          options: JSON.stringify(['JSON.parse()', 'JSON.stringify()', 'JSON.objectify()', 'JSON.toObject()']),
          correctAnswer: 'JSON.parse()',
          explanation: 'JSON.parse() parses a string written in JSON format and produces a JS object.',
          marks: 1,
          difficulty: 'INTERMEDIATE'
        }
      ]
    },
    {
      title: 'React Hooks & State Mastery',
      description: 'Comprehensive evaluation on useState, useEffect, useMemo, custom hooks, and context API.',
      categoryName: 'React.js',
      difficulty: 'HARD',
      durationMinutes: 20,
      passingPercentage: 70,
      maxAttempts: 2,
      status: 'PUBLISHED',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      questions: [
        {
          questionText: 'Which hook should be used to execute side effects in functional components?',
          options: JSON.stringify(['useState', 'useReducer', 'useEffect', 'useCallback']),
          correctAnswer: 'useEffect',
          explanation: 'useEffect lets you synchronize a component with an external system and run side-effects.',
          marks: 1,
          difficulty: 'INTERMEDIATE'
        },
        {
          questionText: 'When does the effect cleanup function returned by useEffect execute?',
          options: JSON.stringify(['Before every re-render and on unmount', 'Only when component unmounts', 'Before initial render', 'Never']),
          correctAnswer: 'Before every re-render and on unmount',
          explanation: 'Cleanup runs before the component is unmounted and before re-running the effect on subsequent renders.',
          marks: 1,
          difficulty: 'HARD'
        },
        {
          questionText: 'How can you prevent unnecessary re-renders of child components in React?',
          options: JSON.stringify(['React.memo', 'useRef', 'dangerouslySetInnerHTML', 'forceUpdate']),
          correctAnswer: 'React.memo',
          explanation: 'React.memo is a higher-order component that skips re-rendering when props have not changed.',
          marks: 1,
          difficulty: 'HARD'
        }
      ]
    },
    {
      title: 'CSS Grid & Flexbox Masterclass',
      description: 'Test modern layout techniques, media queries, flexbox alignment, and CSS grid template areas.',
      categoryName: 'HTML & CSS',
      difficulty: 'EASY',
      durationMinutes: 10,
      passingPercentage: 50,
      maxAttempts: 5,
      status: 'PUBLISHED',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      questions: [
        {
          questionText: 'Which CSS flexbox property aligns flex items along the cross axis?',
          options: JSON.stringify(['justify-content', 'align-items', 'flex-direction', 'align-content']),
          correctAnswer: 'align-items',
          explanation: 'align-items defines how flex items are aligned along the cross axis.',
          marks: 1,
          difficulty: 'EASY'
        },
        {
          questionText: 'What is the default value of the position property in CSS?',
          options: JSON.stringify(['relative', 'absolute', 'static', 'fixed']),
          correctAnswer: 'static',
          explanation: 'Elements are positioned static by default, following the normal page flow.',
          marks: 1,
          difficulty: 'EASY'
        }
      ]
    },
    {
      title: 'Python Basics & Data Structures',
      description: 'Lists, dictionaries, tuples, sets, list comprehensions, and control flow in Python 3.',
      categoryName: 'Python',
      difficulty: 'EASY',
      durationMinutes: 15,
      passingPercentage: 60,
      maxAttempts: 3,
      status: 'PUBLISHED',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      questions: [
        {
          questionText: 'Which data structure in Python is ordered, mutable, and allows duplicate elements?',
          options: JSON.stringify(['Tuple', 'Set', 'List', 'Dictionary']),
          correctAnswer: 'List',
          explanation: 'Lists in Python are mutable ordered sequences.',
          marks: 1,
          difficulty: 'EASY'
        }
      ]
    }
  ];

  for (const qData of quizzesData) {
    const category = catMap[qData.categoryName];
    if (!category) continue;

    let quiz = await prisma.quiz.findFirst({ where: { title: qData.title } });
    if (!quiz) {
      quiz = await prisma.quiz.create({
        data: {
          title: qData.title,
          description: qData.description,
          categoryId: category.id,
          difficulty: qData.difficulty,
          durationMinutes: qData.durationMinutes,
          passingPercentage: qData.passingPercentage,
          maxAttempts: qData.maxAttempts,
          status: qData.status,
          thumbnailUrl: qData.thumbnailUrl,
          questions: {
            create: qData.questions
          }
        }
      });
      console.log(`Created Quiz: ${quiz.title}`);
    }
  }

  console.log('✅ Supabase database seed completed successfully with all quizzes & categories!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
