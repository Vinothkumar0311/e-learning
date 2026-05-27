const { sequelize, Course, CourseSection, CourseModule } = require('./models');

const data = {
  "courseTitle": "Data Structures & Algorithms",
  "sections": [
    {
      "title": "Introduction",
      "subsections": [
        {
          "title": "Overview",
          "modules": [
            {
              "title": "What is Data Structure?",
              "type": "Video",
              "duration": 12,
              "youtubeUrl": "https://www.youtube.com/watch?v=bum_19loj9A",
              "order": 1,
              "accessType": "Free"
            },
            {
              "title": "Types of Data Structures",
              "type": "Video",
              "duration": 18,
              "youtubeUrl": "https://www.youtube.com/watch?v=RBSGKlAvoiM",
              "order": 2,
              "accessType": "Free"
            },
            {
              "title": "Time Complexity Basics",
              "type": "Video",
              "duration": 20,
              "youtubeUrl": "https://www.youtube.com/watch?v=V6mKVRU1evU",
              "order": 3,
              "accessType": "Premium"
            }
          ]
        }
      ]
    },
    {
      "title": "Datatypes",
      "subsections": [
        {
          "title": "Primitive Datatypes",
          "modules": [
            {
              "title": "Integer and Float",
              "type": "Video",
              "duration": 10,
              "youtubeUrl": "https://www.youtube.com/watch?v=zOjov-2OZ0E",
              "order": 1,
              "accessType": "Free"
            },
            {
              "title": "Boolean and Character",
              "type": "Video",
              "duration": 8,
              "youtubeUrl": "https://www.youtube.com/watch?v=8PopR3x-VMY",
              "order": 2,
              "accessType": "Premium"
            }
          ]
        }
      ]
    },
    {
      "title": "Arrays",
      "subsections": [
        {
          "title": "Array Basics",
          "modules": [
            {
              "title": "Introduction to Arrays",
              "type": "Video",
              "duration": 15,
              "youtubeUrl": "https://www.youtube.com/watch?v=QJNwK2uJyGs",
              "order": 1,
              "accessType": "Free"
            },
            {
              "title": "Array Operations",
              "type": "Video",
              "duration": 22,
              "youtubeUrl": "https://www.youtube.com/watch?v=FiFiNvM29ps",
              "order": 2,
              "accessType": "Premium"
            }
          ]
        }
      ]
    },
    {
      "title": "Linked List",
      "subsections": [
        {
          "title": "Singly Linked List",
          "modules": [
            {
              "title": "Introduction to Linked List",
              "type": "Video",
              "duration": 25,
              "youtubeUrl": "https://www.youtube.com/watch?v=N6dOwBde7-M",
              "order": 1,
              "accessType": "Free"
            },
            {
              "title": "Insertion Operations",
              "type": "Video",
              "duration": 30,
              "youtubeUrl": "https://www.youtube.com/watch?v=58YbpRDc4yw",
              "order": 2,
              "accessType": "Premium"
            }
          ]
        }
      ]
    },
    {
      "title": "Stack & Queue",
      "subsections": [
        {
          "title": "Stack",
          "modules": [
            {
              "title": "Stack Introduction",
              "type": "Video",
              "duration": 18,
              "youtubeUrl": "https://www.youtube.com/watch?v=wjI1WNcIntg",
              "order": 1,
              "accessType": "Free"
            }
          ]
        },
        {
          "title": "Queue",
          "modules": [
            {
              "title": "Queue Data Structure",
              "type": "Video",
              "duration": 20,
              "youtubeUrl": "https://www.youtube.com/watch?v=XuCbpw6Bj1U",
              "order": 1,
              "accessType": "Premium"
            }
          ]
        }
      ]
    }
  ]
};

const seedDSA = async () => {
  try {
    // 1. Authenticate connection
    await sequelize.authenticate();
    console.log('🔌 Database connected successfully.');

    // 2. Clean existing Course if any with same name
    const existingCourse = await Course.findOne({ where: { title: data.courseTitle } });
    if (existingCourse) {
      console.log(`⚠️ Existing course "${data.courseTitle}" found. Deleting to avoid duplicates...`);
      await existingCourse.destroy();
      console.log('🗑️ Deleted old course data.');
    }

    // 3. Create fresh Course
    const course = await Course.create({
      title: data.courseTitle,
      description: "Master Data Structures & Algorithms (DSA) from scratch! This comprehensive course covers foundational concepts, time and space complexity, arrays, linked lists, stacks, queues, primitive datatypes, and operational strategies to ace your technical coding interviews.",
      price: 1499.00,
      thumbnail: "/uploads/dsa_course.png",
      category: "Computer Science",
      level: "intermediate",
      status: "published",
      instructor_name: "Dr. Vinoth Kumar"
    });
    console.log(`✨ Created Course: "${course.title}" (ID: ${course.id})`);

    // 4. Create Sections, Subsections, and Modules
    for (let sIdx = 0; sIdx < data.sections.length; sIdx++) {
      const sectionData = data.sections[sIdx];
      const section = await CourseSection.create({
        course_id: course.id,
        title: sectionData.title,
        order: sIdx + 1,
        parent_id: null
      });
      console.log(`  📂 Created Section: "${section.title}" (ID: ${section.id})`);

      if (sectionData.subsections) {
        for (let subIdx = 0; subIdx < sectionData.subsections.length; subIdx++) {
          const subData = sectionData.subsections[subIdx];
          const subsection = await CourseSection.create({
            course_id: course.id,
            title: subData.title,
            order: subIdx + 1,
            parent_id: section.id
          });
          console.log(`    ↳ 📂 Created Subsection: "${subsection.title}" (ID: ${subsection.id})`);

          if (subData.modules) {
            for (let mIdx = 0; mIdx < subData.modules.length; mIdx++) {
              const modData = subData.modules[mIdx];
              const module = await CourseModule.create({
                course_id: course.id,
                section_id: subsection.id,
                title: modData.title,
                type: modData.type.toLowerCase(),
                duration: modData.duration,
                youtube_url: modData.youtubeUrl,
                order: modData.order || (mIdx + 1),
                is_preview: modData.accessType.toLowerCase() === 'free',
                is_free: modData.accessType.toLowerCase() === 'free'
              });
              console.log(`      🎬 Created Module: "${module.title}" (${modData.accessType})`);
            }
          }
        }
      }
    }

    console.log('🎉 Data Structures & Algorithms course successfully seeded into Database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    process.exit(1);
  }
};

seedDSA();
