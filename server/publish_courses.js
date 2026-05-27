const { Course } = require('./models');

const publishCourses = async () => {
  try {
    const updatedCount = await Course.update(
      { status: 'published' },
      { where: {} }
    );
    console.log(`Successfully published ${updatedCount[0]} courses.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

publishCourses();
