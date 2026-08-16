const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Diagnostics Check: Testing Supabase PostgreSQL Database Connectivity & Read/Write Capabilities...\n');

  try {
    // 1. Connection Test
    await prisma.$connect();
    console.log('✅ 1. Database Connection: SUCCESSFUL (Connected to Supabase PostgreSQL at db.tukoqwmszsxmebyrwqbq.supabase.co:5432)');

    // 2. Read Test
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const quizCount = await prisma.quiz.count();
    const questionCount = await prisma.question.count();
    const attemptCount = await prisma.quizAttempt.count();

    console.log('\n📊 2. Existing Records Count:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Quizzes: ${quizCount}`);
    console.log(`   - Questions: ${questionCount}`);
    console.log(`   - Quiz Attempts: ${attemptCount}`);

    // 3. Write Test (Create Dummy Record)
    const testCategoryName = `Test_Category_${Date.now()}`;
    const newCategory = await prisma.category.create({
      data: {
        name: testCategoryName,
        description: 'Temporary category created during connectivity verification.'
      }
    });
    console.log(`\n✍️ 3. Write Operations (INSERT): SUCCESSFUL (Created Category ID ${newCategory.id})`);

    // 4. Update Test
    const updatedCategory = await prisma.category.update({
      where: { id: newCategory.id },
      data: { description: 'Updated during connectivity verification.' }
    });
    console.log(`🔄 4. Update Operations (UPDATE): SUCCESSFUL (Updated Category ID ${updatedCategory.id})`);

    // 5. Delete Test (Clean up)
    await prisma.category.delete({
      where: { id: newCategory.id }
    });
    console.log(`🗑️ 5. Delete Operations (DELETE): SUCCESSFUL (Cleaned up Category ID ${newCategory.id})`);

    // 6. User Verification
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@quizzly.com' } });
    const studentUser = await prisma.user.findUnique({ where: { email: 'student@quizzly.com' } });

    console.log('\n👤 6. Default User Verification:');
    console.log(`   - Admin Account (admin@quizzly.com): ${adminUser ? 'FOUND (Role: ' + adminUser.role + ')' : 'NOT FOUND'}`);
    console.log(`   - Student Account (student@quizzly.com): ${studentUser ? 'FOUND (Role: ' + studentUser.role + ')' : 'NOT FOUND'}`);

    console.log('\n🎉 FINAL RESULT: Your Supabase PostgreSQL database is 100% READY to store, read, update, and delete real platform data!');
  } catch (error) {
    console.error('\n❌ Diagnostics Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
