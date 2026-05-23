const { Student } = require('../models');

const seedStudent = async () => {
  try {
    const student = await Student.findOne({ where: { email: 'student@example.com' } });
    if (!student) {
      await Student.create({
        name: 'Demo Student',
        email: 'student@example.com',
        password: 'password123',
        phone: '1234567890',
        is_active: true
      });
      console.log('✅ Demo student seeded successfully');
    } else {
      console.log('ℹ️ Demo student already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding student:', error);
  }
};

module.exports = seedStudent;
