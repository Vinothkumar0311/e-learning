const db = require('./models');
const seedAdmin = require('./seeders/adminSeeder');
const seedStudent = require('./seeders/studentSeeder');
const seedDatabase = require('./seeders/dbSeedMaster');

const runSeeders = async () => {
  try {
    // Sync DB without dropping
    await db.sequelize.sync();
    
    await seedAdmin();
    await seedStudent();
    await seedDatabase();
    
    console.log('✨ All seeders completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
};

runSeeders();
