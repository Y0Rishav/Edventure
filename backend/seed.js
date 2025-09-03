require('dotenv').config();

const mongoose = require('mongoose');
const Course = require('./models/Course');
const Chapter = require('./models/Chapter');

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  // Clear existing data
  await Course.deleteMany({});
  await Chapter.deleteMany({});

  const subjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology'];
  const coursesData = [];

  // Create courses for classes 1-12 for each subject
  for (let cls = 1; cls <= 12; cls++) {
    for (const subject of subjects) {
      const course = new Course({
        title: `${subject} for Class ${cls}`,
        subject: subject,
        class: cls,
        description: `${subject} concepts for class ${cls} students`
      });
      coursesData.push(course);
      await course.save();
    }
  }

  // Create sample chapters for multiple classes
  const mathCourse1 = coursesData.find(c => c.subject === 'Mathematics' && c.class === 1);
  const mathCourse4 = coursesData.find(c => c.subject === 'Mathematics' && c.class === 4);
  const mathCourse6 = coursesData.find(c => c.subject === 'Mathematics' && c.class === 6);
  const mathCourse8 = coursesData.find(c => c.subject === 'Mathematics' && c.class === 8);
  const mathCourse10 = coursesData.find(c => c.subject === 'Mathematics' && c.class === 10);

  const scienceCourse1 = coursesData.find(c => c.subject === 'Science' && c.class === 1);
  const scienceCourse4 = coursesData.find(c => c.subject === 'Science' && c.class === 4);
  const scienceCourse6 = coursesData.find(c => c.subject === 'Science' && c.class === 6);

  const physicsCourse1 = coursesData.find(c => c.subject === 'Physics' && c.class === 1);
  const physicsCourse4 = coursesData.find(c => c.subject === 'Physics' && c.class === 4);
  const physicsCourse6 = coursesData.find(c => c.subject === 'Physics' && c.class === 6);

  const chemistryCourse1 = coursesData.find(c => c.subject === 'Chemistry' && c.class === 1);
  const chemistryCourse4 = coursesData.find(c => c.subject === 'Chemistry' && c.class === 4);
  const chemistryCourse6 = coursesData.find(c => c.subject === 'Chemistry' && c.class === 6);

  const biologyCourse1 = coursesData.find(c => c.subject === 'Biology' && c.class === 1);
  const biologyCourse4 = coursesData.find(c => c.subject === 'Biology' && c.class === 4);
  const biologyCourse6 = coursesData.find(c => c.subject === 'Biology' && c.class === 6);

  // Sample chapters
  const mathChapter1 = new Chapter({
    title: 'Numbers 1-10',
    course: mathCourse1._id,
    description: 'Learn to count from 1 to 10',
    order: 1,
    quiz: {
      questions: [
        {
          question: 'What is 1 + 1?',
          options: ['1', '2', '3', '4'],
          correctAnswer: 1
        },
        {
          question: 'What is 2 + 2?',
          options: ['2', '3', '4', '5'],
          correctAnswer: 2
        },
        {
          question: 'What is 3 + 3?',
          options: ['5', '6', '7', '8'],
          correctAnswer: 1
        }
      ]
    }
  });
  await mathChapter1.save();

  const mathChapter2 = new Chapter({
    title: 'Addition and Subtraction',
    course: mathCourse1._id,
    description: 'Basic addition and subtraction operations',
    order: 2,
    quiz: {
      questions: [
        {
          question: 'What is 5 + 3?',
          options: ['7', '8', '9', '10'],
          correctAnswer: 1
        },
        {
          question: 'What is 10 - 4?',
          options: ['5', '6', '7', '8'],
          correctAnswer: 1
        }
      ]
    }
  });
  await mathChapter2.save();

  const scienceChapter1 = new Chapter({
    title: 'What is Science?',
    course: scienceCourse1._id,
    description: 'Introduction to the world of science',
    order: 1,
    quiz: {
      questions: [
        {
          question: 'Science is the study of...',
          options: ['Art', 'Nature', 'Music', 'Sports'],
          correctAnswer: 1
        }
      ]
    }
  });
  await scienceChapter1.save();

  const physicsChapter1 = new Chapter({
    title: 'What is Physics?',
    course: physicsCourse1._id,
    description: 'Introduction to the world of physics',
    order: 1,
    quiz: {
      questions: [
        {
          question: 'Physics studies...',
          options: ['Living things', 'Matter and energy', 'History', 'Art'],
          correctAnswer: 1
        }
      ]
    }
  });
  await physicsChapter1.save();

  const chemistryChapter1 = new Chapter({
    title: 'Introduction to Chemistry',
    course: chemistryCourse1._id,
    description: 'Basic concepts in chemistry',
    order: 1,
    quiz: {
      questions: [
        {
          question: 'Chemistry is the study of...',
          options: ['Stars', 'Substances', 'Sound', 'Light'],
          correctAnswer: 1
        }
      ]
    }
  });
  await chemistryChapter1.save();

  const biologyChapter1 = new Chapter({
    title: 'What is Life?',
    course: biologyCourse1._id,
    description: 'Understanding living organisms',
    order: 1,
    quiz: {
      questions: [
        {
          question: 'Biology studies...',
          options: ['Rocks', 'Living things', 'Machines', 'Weather'],
          correctAnswer: 1
        }
      ]
    }
  });
  await biologyChapter1.save();

  // Additional chapters for Physics
  const physicsChapter2 = new Chapter({
    title: 'Motion and Force',
    course: physicsCourse1._id,
    description: 'Understanding movement and forces',
    order: 2,
    quiz: {
      questions: [
        {
          question: 'Force is measured in...',
          options: ['Meters', 'Seconds', 'Newtons', 'Liters'],
          correctAnswer: 2
        }
      ]
    }
  });
  await physicsChapter2.save();

  // Additional chapters for Chemistry
  const chemistryChapter2 = new Chapter({
    title: 'Elements and Compounds',
    course: chemistryCourse1._id,
    description: 'Building blocks of matter',
    order: 2,
    quiz: {
      questions: [
        {
          question: 'Water is a...',
          options: ['Element', 'Compound', 'Mixture', 'Atom'],
          correctAnswer: 1
        }
      ]
    }
  });
  await chemistryChapter2.save();

  // Additional chapters for Biology
  const biologyChapter2 = new Chapter({
    title: 'Cells: The Building Blocks',
    course: biologyCourse1._id,
    description: 'Introduction to cell biology',
    order: 2,
    quiz: {
      questions: [
        {
          question: 'The control center of a cell is the...',
          options: ['Cell wall', 'Nucleus', 'Cytoplasm', 'Membrane'],
          correctAnswer: 1
        }
      ]
    }
  });
  await biologyChapter2.save();

  // Chapters for Class 4
  const mathChapter4_1 = new Chapter({
    title: 'Advanced Multiplication',
    course: mathCourse4._id,
    description: 'Multiplication tables and division concepts',
    order: 1,
    quiz: {
      questions: [
        {
          question: 'What is 12 × 8?',
          options: ['96', '88', '104', '80'],
          correctAnswer: 0
        }
      ]
    }
  });
  await mathChapter4_1.save();

  const mathChapter4_2 = new Chapter({
    title: 'Fractions and Decimals',
    course: mathCourse4._id,
    description: 'Understanding fractions, decimals, and percentages',
    order: 2,
    quiz: {
      questions: [
        {
          question: 'What is 3/4 as a decimal?',
          options: ['0.34', '0.75', '0.25', '0.5'],
          correctAnswer: 1
        }
      ]
    }
  });
  await mathChapter4_2.save();

  // Chapters for Class 6
  const mathChapter6_1 = new Chapter({
    title: 'Introduction to Algebra',
    course: mathCourse6._id,
    description: 'Understanding variables, expressions, and basic equations',
    order: 1,
    quiz: {
      questions: [
        {
          question: 'Solve: x + 5 = 12',
          options: ['x = 7', 'x = 17', 'x = 5', 'x = 12'],
          correctAnswer: 0
        }
      ]
    }
  });
  await mathChapter6_1.save();

  const mathChapter6_2 = new Chapter({
    title: 'Ratio and Proportion',
    course: mathCourse6._id,
    description: 'Ratios, proportions and their applications',
    order: 2,
    quiz: {
      questions: [
        {
          question: 'If a:b = 3:4, then b:a = ?',
          options: ['4:3', '3:7', '7:3', '1:1'],
          correctAnswer: 0
        }
      ]
    }
  });
  await mathChapter6_2.save();

  // Chapters for Class 8
  const mathChapter8_1 = new Chapter({
    title: 'Linear Equations',
    course: mathCourse8._id,
    description: 'Solving linear equations in one variable',
    order: 1,
    quiz: {
      questions: [
        {
          question: 'Solve: 2x + 3 = 11',
          options: ['x = 4', 'x = 7', 'x = 3', 'x = 8'],
          correctAnswer: 0
        }
      ]
    }
  });
  await mathChapter8_1.save();

  // Chapters for Class 10
  const mathChapter10_1 = new Chapter({
    title: 'Quadratic Equations',
    course: mathCourse10._id,
    description: 'Solving quadratic equations and their applications',
    order: 1,
    quiz: {
      questions: [
        {
          question: 'Solve: x² - 5x + 6 = 0',
          options: ['(2,3)', '(1,6)', '(3,2)', '(6,1)'],
          correctAnswer: 0
        }
      ]
    }
  });
  await mathChapter10_1.save();

  const mathChapter10_2 = new Chapter({
    title: 'Trigonometry',
    course: mathCourse10._id,
    description: 'Trigonometric functions and identities',
    order: 2,
    quiz: {
      questions: [
        {
          question: 'What is sin(90°)?',
          options: ['0', '1', '0.5', '-1'],
          correctAnswer: 1
        }
      ]
    }
  });
  await mathChapter10_2.save();

  // Update courses with chapters
  mathCourse1.chapters = [mathChapter1._id, mathChapter2._id];
  await mathCourse1.save();

  scienceCourse1.chapters = [scienceChapter1._id];
  await scienceCourse1.save();

  physicsCourse1.chapters = [physicsChapter1._id, physicsChapter2._id];
  await physicsCourse1.save();

  chemistryCourse1.chapters = [chemistryChapter1._id, chemistryChapter2._id];
  await chemistryCourse1.save();

  biologyCourse1.chapters = [biologyChapter1._id, biologyChapter2._id];
  await biologyCourse1.save();

  // Update higher class courses
  mathCourse4.chapters = [mathChapter4_1._id, mathChapter4_2._id];
  await mathCourse4.save();

  mathCourse6.chapters = [mathChapter6_1._id, mathChapter6_2._id];
  await mathCourse6.save();

  mathCourse8.chapters = [mathChapter8_1._id];
  await mathCourse8.save();

  mathCourse10.chapters = [mathChapter10_1._id, mathChapter10_2._id];
  await mathCourse10.save();

  // Add some chapters for other subjects
  const scienceChapter4_1 = new Chapter({
    title: 'Ecosystems and Environment',
    course: scienceCourse4._id,
    description: 'Understanding food chains, habitats, and environmental balance',
    order: 1,
    quiz: {
      questions: [
        {
          question: 'What is the top level of a food chain called?',
          options: ['Producer', 'Consumer', 'Decomposer', 'Apex predator'],
          correctAnswer: 3
        }
      ]
    }
  });
  await scienceChapter4_1.save();

  scienceCourse4.chapters = [scienceChapter4_1._id];
  await scienceCourse4.save();

  const physicsChapter4_1 = new Chapter({
    title: 'Light and Reflection',
    course: physicsCourse4._id,
    description: 'Discover how light works, reflection, and optical instruments',
    order: 1,
    quiz: {
      questions: [
        {
          question: 'What type of reflection makes us see ourselves in a mirror?',
          options: ['Diffuse', 'Regular', 'Scattered', 'Absorbed'],
          correctAnswer: 1
        }
      ]
    }
  });
  await physicsChapter4_1.save();

  physicsCourse4.chapters = [physicsChapter4_1._id];
  await physicsCourse4.save();

  console.log('Sample data seeded successfully!');
  process.exit();
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});
