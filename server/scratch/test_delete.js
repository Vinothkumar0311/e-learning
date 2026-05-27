const { CourseModule } = require('../models');

async function testDelete() {
  try {
    console.log('Creating test module...');
    const testMod = await CourseModule.create({
      title: 'Temporary Test Module',
      type: 'video',
      course_id: 2,
      youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
    });
    console.log('Created successfully. ID:', testMod.id);

    console.log('Attempting to delete module...');
    await testMod.destroy();
    console.log('Deleted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during module database actions:', err.message);
    process.exit(1);
  }
}

testDelete();
