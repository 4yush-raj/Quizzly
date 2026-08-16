const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  prisma = new PrismaClient();
} catch (err) {
  console.warn('Prisma Client failed to initialize. Make sure DATABASE_URL is set correctly in .env.');
}

module.exports = prisma;
