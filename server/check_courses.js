const { Course } = require('./models');

const checkCourses = async () => {
  try {
    const courses = await Course.findAll();
    console.log('--- Courses ---');
    courses.forEach(c => {
      console.log(`ID: ${c.id} | Title: ${c.title} | Status: ${c.status} | Price: ${c.price}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkCourses();
