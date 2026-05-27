const { deleteModule } = require('../controllers/courseController');
const { CourseModule } = require('../models');

async function runTest() {
  try {
    // 1. Create a temporary module to delete
    const tempMod = await CourseModule.create({
      title: 'API Test Video',
      type: 'video',
      course_id: 2,
      youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
    });
    console.log('Created temporary module ID:', tempMod.id);

    // 2. Mock request & response
    const req = {
      params: {
        courseId: '2',
        id: String(tempMod.id)
      }
    };

    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        console.log('Response JSON (status ' + this.statusCode + '):', data);
      }
    };

    // 3. Call controller
    console.log('Calling deleteModule controller...');
    await deleteModule(req, res);
    
    process.exit(0);
  } catch (err) {
    console.error('Unhandled test error:', err);
    process.exit(1);
  }
}

runTest();
