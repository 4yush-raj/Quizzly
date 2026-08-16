const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Supabase database with initial Quizzly data...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // 1. Create Admin User
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

  // 2. Create Student User
  const student = await prisma.user.upsert({
    where: { email: 'student@quizzly.com' },
    update: {},
    create: {
      name: 'Rahul Sharma',
      email: 'student@quizzly.com',
      password: studentPassword,
      role: 'STUDENT',
      status: 'ACTIVE'
    }
  });

  // 3. Create Categories
  const jsCategory = await prisma.category.create({
    data: {
      name: 'JavaScript',
      description: 'Core JavaScript concepts, ES6 features, async/await, and browser DOM manipulation.'
    }
  });

  const reactCategory = await prisma.category.create({
    data: {
      name: 'React.js',
      description: 'Component lifecycles, hooks, virtual DOM, and modern state management.'
    }
  });

  const dbCategory = await prisma.category.create({
    data: {
      name: 'Databases & SQL',
      description: 'Relational database schema design, indexing, queries, and transactions.'
    }
  });

  // 4. Create Sample Quizzes
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'JavaScript Core Fundamentals',
      description: 'Test your grasp of variables, scope, closures, event loop, and data structures in JS.',
      categoryId: jsCategory.id,
      difficulty: 'INTERMEDIATE',
      durationMinutes: 20,
      passingPercentage: 60,
      maxAttempts: 3,
      status: 'PUBLISHED',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=80',
      questions: {
        create: [
          {
            questionText: 'What is the output of typeof NaN in JavaScript?',
            options: JSON.stringify(['"number"', '"nan"', '"undefined"', '"object"']),
            correctAnswer: '"number"',
            explanation: 'In JavaScript, NaN (Not-a-Number) is a primitive numeric value, so typeof NaN evaluates to "number".',
            marks: 1
          },
          {
            questionText: 'Which keyword declares a block-scoped variable that cannot be reassigned?',
            options: JSON.stringify(['var', 'let', 'const', 'static']),
            correctAnswer: 'const',
            explanation: 'The const keyword creates block-scoped read-only references to values.',
            marks: 1
          },
          {
            questionText: 'What method converts a JSON string into a JavaScript object?',
            options: JSON.stringify(['JSON.parse()', 'JSON.stringify()', 'JSON.objectify()', 'JSON.toObject()']),
            correctAnswer: 'JSON.parse()',
            explanation: 'JSON.parse() parses a string written in JSON format and produces a JS object.',
            marks: 1
          }
        ]
      }
    }
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'React Hooks & State Mastery',
      description: 'Demonstrate proficiency in useState, useEffect, useMemo, and custom hooks.',
      categoryId: reactCategory.id,
      difficulty: 'HARD',
      durationMinutes: 15,
      passingPercentage: 70,
      maxAttempts: 2,
      status: 'PUBLISHED',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      questions: {
        create: [
          {
            questionText: 'When does the effect cleanup function returned by useEffect execute?',
            options: JSON.stringify(['Before every re-render and on unmount', 'Only when component unmounts', 'Before initial render', 'Never']),
            correctAnswer: 'Before every re-render and on unmount',
            explanation: 'Cleanup runs before the component is unmounted and before re-running the effect on subsequent renders.',
            marks: 1
          }
        ]
      }
    }
  });

  console.log('✅ Supabase database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
