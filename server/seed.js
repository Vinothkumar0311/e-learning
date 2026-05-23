const db = require('./models');
const seedAdmin = require('./seeders/adminSeeder');
const seedStudent = require('./seeders/studentSeeder');

const runSeeders = async () => {
  try {
    // Sync DB without dropping (unless needed)
    await db.sequelize.sync();
    
    await seedAdmin();
    await seedStudent();
    
    console.log('✨ All seeders completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
};

runSeeders();
