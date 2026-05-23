const { Student } = require('./models');

const checkStudent = async () => {
  try {
    const students = await Student.findAll();
    console.log('--- Registered Students ---');
    students.forEach(s => {
      console.log(`ID: ${s.id} | Name: ${s.name} | Email: ${s.email} | PwdHash: ${s.password.substring(0, 10)}...`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkStudent();
