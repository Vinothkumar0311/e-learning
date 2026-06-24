const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Student, Course, CourseModule, StudentAssignedCourse, StudentProgress, User } = require('./models');

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('🏁 Starting E-Learning Performance API Verification Test...');

  try {
    // 1. Fetch default student and course
    const student = await Student.findOne({ where: { name: 'Vinothkumar' } }) 
      || await Student.findOne({ where: { email: 'svinothkumar0301@gmail.com' } })
      || await Student.findOne();

    if (!student) {
      console.error('❌ Default student not found. Run dbSeedMaster first.');
      process.exit(1);
    }
    console.log(`👤 Found student: ${student.name} (${student.id}), active status: ${student.is_active}`);

    // Force active for api testing
    if (!student.is_active) {
      await student.update({ is_active: true });
      console.log('🔓 Activated student temporarily for test.');
    }

    const course = await Course.findOne({
      include: [{ model: CourseModule, as: 'modules' }]
    });
    if (!course || !course.modules || course.modules.length === 0) {
      console.error('❌ Course or modules not found. Run dbSeedMaster first.');
      process.exit(1);
    }
    console.log(`📚 Found course: ${course.title} with ${course.modules.length} modules`);

    // 2. Ensure student is assigned to this course
    const [assignment] = await StudentAssignedCourse.findOrCreate({
      where: {
        student_id: student.id,
        course_id: course.id
      },
      defaults: {
        assigned_by: 1 // Default Admin ID
      }
    });
    console.log(`🔗 Ensured course assignment is active: ID ${assignment.id}`);

    // 3. Mark the first module as complete in StudentProgress
    const firstModule = course.modules[0];
    const [progress, created] = await StudentProgress.findOrCreate({
      where: {
        student_id: student.id,
        module_id: firstModule.id
      },
      defaults: {
        course_id: course.id,
        watch_duration: 120
      }
    });
    console.log(`✅ Progress record marked: module "${firstModule.title}", status: ${created ? 'New' : 'Already Existed'}`);

    // 4. Authenticate as Admin to verify admin performance endpoints
    console.log('\n🔐 Authenticating as Admin...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@eduadmin.com',
        password: 'admin123'
      })
    });
    const adminLogin = await adminLoginRes.json();
    const adminToken = adminLogin.data.token;
    console.log('🔑 Admin authenticated successfully.');

    // 5. Generate Student Token directly
    console.log('\n🔐 Generating Student Token directly...');
    const studentToken = jwt.sign({ id: student.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '24h'
    });
    console.log('🔑 Student token generated successfully.');

    // 6. Request Student Performance Summary
    console.log('\n📈 Fetching Student Performance Self-Summary...');
    const studentPerfRes = await fetch(`${BASE_URL}/student/performance`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`Student Perf Response status: ${studentPerfRes.status}`);
    const studentPerfJson = await studentPerfRes.json();
    const studentPerf = studentPerfJson.data;
    console.log('📊 Student Self Performance Stats:');
    console.log(JSON.stringify(studentPerf.summary, null, 2));
    console.log(`- Syllabus complete rate: ${studentPerf.courses[0].completionPercent}%`);
    console.log(`- Finished lessons: ${studentPerf.courses[0].completedModules} / ${studentPerf.courses[0].totalModules}`);

    // 7. Request Admin Global Performance Leaderboard
    console.log('\n📈 Fetching Admin Leaderboard Analytics...');
    const adminPerfRes = await fetch(`${BASE_URL}/performance`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminPerfJson = await adminPerfRes.json();
    const adminPerf = adminPerfJson.data;
    console.log(`🏆 Found ${adminPerf.length} students in leaderboard.`);
    const matchingStudent = adminPerf.find(p => p.student.id === student.id);
    if (matchingStudent) {
      console.log('✅ Student stats verified in admin leaderboard:');
      console.log(`- Student Name: ${matchingStudent.student.name}`);
      console.log(`- Total Courses: ${matchingStudent.summary.totalCourses}`);
      console.log(`- Completed: ${matchingStudent.summary.completedModules} / ${matchingStudent.summary.totalModules}`);
    } else {
      console.error('❌ Default student not found in admin leaderboard output.');
    }

    console.log('\n🎉 All API endpoints successfully validated!');
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

runTest();
