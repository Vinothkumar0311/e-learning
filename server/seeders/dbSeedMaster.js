const { sequelize, User, Student, Course, CourseSection, CourseModule } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🔄 Drop and recreate all database tables...');
    await sequelize.sync({ force: true });
    console.log('✅ Database schema cleared and reconstructed successfully.');

    // 1. Seed Admin
    console.log('🌱 Seeding Super Admin...');
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@eduadmin.com',
      password: 'admin123',
      role: 'super_admin'
    });
    console.log('✅ Admin seeded: admin@eduadmin.com / admin123');

    // 2. Seed Student
    console.log('🌱 Seeding default student...');
    const student = await Student.create({
      name: 'vinothkumar S',
      email: 'svinothkumar0301@gmail.com',
      phone: '9876543210',
      password: '123456'
    });
    console.log('✅ Student seeded: svinothkumar0301@gmail.com / 123456');

    // 3. Seed Course 1: Data Structures & Algorithms
    console.log('🌱 Seeding Course 1: Data Structures & Algorithms...');
    const course1 = await Course.create({
      title: 'Data Structures & Algorithms',
      description: 'Master the fundamental building blocks of software engineering. Learn to analyze time & space complexity, design optimized algorithmic paths, and structure complex computational datasets.',
      price: 1500.00,
      thumbnail: '/uploads/dsa_course.png',
      category: 'Computer Science',
      level: 'intermediate',
      status: 'published',
      instructor_name: 'Dr. Vinoth Kumar'
    });

    // Sections & modules for Course 1
    const dsaData = [
      {
        title: "Introduction",
        subsections: [
          {
            title: "Overview",
            modules: [
              {
                title: "What is Data Structure?",
                type: "video",
                duration: 12,
                youtube_url: "https://www.youtube.com/watch?v=bum_19loj9A",
                order: 1,
                is_free: true
              },
              {
                title: "Types of Data Structures",
                type: "video",
                duration: 18,
                youtube_url: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
                order: 2,
                is_free: true
              },
              {
                title: "Time Complexity Basics",
                type: "video",
                duration: 20,
                youtube_url: "https://www.youtube.com/watch?v=V6mKVRU1evU",
                order: 3,
                is_free: false
              }
            ]
          }
        ]
      },
      {
        title: "Datatypes",
        subsections: [
          {
            title: "Primitive Datatypes",
            modules: [
              {
                title: "Integer and Float",
                type: "video",
                duration: 10,
                youtube_url: "https://www.youtube.com/watch?v=zOjov-2OZ0E",
                order: 1,
                is_free: true
              },
              {
                title: "Boolean and Character",
                type: "video",
                duration: 8,
                youtube_url: "https://www.youtube.com/watch?v=8PopR3x-VMY",
                order: 2,
                is_free: false
              }
            ]
          }
        ]
      },
      {
        title: "Arrays",
        subsections: [
          {
            title: "Array Basics",
            modules: [
              {
                title: "Introduction to Arrays",
                type: "video",
                duration: 15,
                youtube_url: "https://www.youtube.com/watch?v=QJNwK2uJyGs",
                order: 1,
                is_free: true
              },
              {
                title: "Array Operations",
                type: "video",
                duration: 22,
                youtube_url: "https://www.youtube.com/watch?v=FiFiNvM29ps",
                order: 2,
                is_free: false
              }
            ]
          }
        ]
      },
      {
        title: "Linked List",
        subsections: [
          {
            title: "Singly Linked List",
            modules: [
              {
                title: "Introduction to Linked List",
                type: "video",
                duration: 25,
                youtube_url: "https://www.youtube.com/watch?v=N6dOwBde7-M",
                order: 1,
                is_free: true
              },
              {
                title: "Insertion Operations",
                type: "video",
                duration: 30,
                youtube_url: "https://www.youtube.com/watch?v=58YbpRDc4yw",
                order: 2,
                is_free: false
              }
            ]
          }
        ]
      },
      {
        title: "Stack & Queue",
        subsections: [
          {
            title: "Stack",
            modules: [
              {
                title: "Stack Introduction",
                type: "video",
                duration: 18,
                youtube_url: "https://www.youtube.com/watch?v=wjI1WNcIntg",
                order: 1,
                is_free: true
              }
            ]
          },
          {
            title: "Queue",
            modules: [
              {
                title: "Queue Data Structure",
                type: "video",
                duration: 20,
                youtube_url: "https://www.youtube.com/watch?v=XuCbpw6Bj1U",
                order: 1,
                is_free: false
              }
            ]
          }
        ]
      }
    ];

    let sectionOrder = 1;
    for (const sec of dsaData) {
      // Create top-level section
      const parentSection = await CourseSection.create({
        course_id: course1.id,
        title: sec.title,
        order: sectionOrder++
      });

      let subsecOrder = 1;
      for (const sub of sec.subsections) {
        // Create child sub-section
        const childSection = await CourseSection.create({
          course_id: course1.id,
          title: sub.title,
          parent_id: parentSection.id,
          order: subsecOrder++
        });

        // Create modules in the child sub-section
        for (const mod of sub.modules) {
          await CourseModule.create({
            course_id: course1.id,
            section_id: childSection.id,
            title: mod.title,
            type: mod.type,
            duration: mod.duration,
            youtube_url: mod.youtube_url,
            order: mod.order,
            is_free: mod.is_free
          });
        }
      }
    }
    console.log('✅ Course 1 seeded successfully with complete sections and modules.');

    // 4. Seed Course 2: React Masterclass
    console.log('🌱 Seeding Course 2: React & Next.js Masterclass...');
    const course2 = await Course.create({
      title: 'React & Next.js Masterclass',
      description: 'Build premium, production-ready web applications with React 18, Vite, Next.js, and modern state management patterns.',
      price: 5000.00,
      thumbnail: '/uploads/react_course.png',
      category: 'Web Development',
      level: 'beginner',
      status: 'published',
      instructor_name: 'Testing Instructor'
    });

    // Setup basic sections
    const secReact = await CourseSection.create({
      course_id: course2.id,
      title: 'Getting Started',
      order: 1
    });

    const subsecReact = await CourseSection.create({
      course_id: course2.id,
      title: 'Introduction to React',
      parent_id: secReact.id,
      order: 1
    });

    await CourseModule.create({
      course_id: course2.id,
      section_id: subsecReact.id,
      title: 'React Introduction & Virtual DOM',
      type: 'video',
      duration: 15,
      youtube_url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      order: 1,
      is_free: true
    });

    await CourseModule.create({
      course_id: course2.id,
      section_id: subsecReact.id,
      title: 'Next.js App Router Setup & Routing',
      type: 'video',
      duration: 25,
      youtube_url: 'https://www.youtube.com/watch?v=Sklc_fQBmcs',
      order: 2,
      is_free: false
    });
    console.log('✅ Course 2 seeded successfully.');

    // 5. Seed Course 3: Node.js Backend
    console.log('🌱 Seeding Course 3: Node.js Backend & API Development...');
    const course3 = await Course.create({
      title: 'Node.js Backend & API Development',
      description: 'Develop high-performance REST APIs and real-time backend structures using Node.js, Express, Sequelize, and MySQL databases.',
      price: 3500.00,
      thumbnail: '/uploads/nodejs_course.png',
      category: 'Backend Development',
      level: 'advanced',
      status: 'published',
      instructor_name: 'Dr. Vinoth Kumar'
    });

    const secNode = await CourseSection.create({
      course_id: course3.id,
      title: 'Express Core',
      order: 1
    });

    const subsecNode = await CourseSection.create({
      course_id: course3.id,
      title: 'Routing & Middlewares',
      parent_id: secNode.id,
      order: 1
    });

    await CourseModule.create({
      course_id: course3.id,
      section_id: subsecNode.id,
      title: 'Express Hello World Setup',
      type: 'video',
      duration: 20,
      youtube_url: 'https://www.youtube.com/watch?v=L72fhGm1tf0',
      order: 1,
      is_free: true
    });

    await CourseModule.create({
      course_id: course3.id,
      section_id: subsecNode.id,
      title: 'Writing Custom Middlewares & Error Handlers',
      type: 'video',
      duration: 30,
      youtube_url: 'https://www.youtube.com/watch?v=lY6icfhap2o',
      order: 2,
      is_free: false
    });
    console.log('✅ Course 3 seeded successfully.');

    console.log('🎉 Database initialized with complete clean seed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding database:', error);
    throw error;
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedDatabase;
