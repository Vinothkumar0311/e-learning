const { Student } = require('./models');
const bcrypt = require('bcryptjs');

const testLogin = async () => {
  const email = 'student@example.com';
  const password = 'password123';
  
  try {
    const student = await Student.findOne({ where: { email } });
    if (!student) {
      console.log('Student not found');
      return;
    }
    
    const isMatch = await student.matchPassword(password);
    console.log(`Password test for ${email}: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    
    // Test direct comparison
    const directMatch = await bcrypt.compare(password, student.password);
    console.log(`Direct bcrypt.compare test: ${directMatch ? 'SUCCESS' : 'FAILED'}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testLogin();
