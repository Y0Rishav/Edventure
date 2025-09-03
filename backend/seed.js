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

  // Create sample chapters for class 1 courses
  const mathCourse = coursesData.find(c => c.subject === 'Mathematics' && c.class === 1);
  const scienceCourse = coursesData.find(c => c.subject === 'Science' && c.class === 1);
  const physicsCourse = coursesData.find(c => c.subject === 'Physics' && c.class === 1);
  const chemistryCourse = coursesData.find(c => c.subject === 'Chemistry' && c.class === 1);
  const biologyCourse = coursesData.find(c => c.subject === 'Biology' && c.class === 1);

  // Sample chapters
  const mathChapter1 = new Chapter({
    title: 'Numbers 1-10',
    course: mathCourse._id,
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
    course: mathCourse._id,
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
    course: scienceCourse._id,
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
    course: physicsCourse._id,
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
    course: chemistryCourse._id,
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
    course: biologyCourse._id,
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
    course: physicsCourse._id,
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
    course: chemistryCourse._id,
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
    course: biologyCourse._id,
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

  // Update courses with chapters
  mathCourse.chapters = [mathChapter1._id, mathChapter2._id];
  await mathCourse.save();

  scienceCourse.chapters = [scienceChapter1._id];
  await scienceCourse.save();

  physicsCourse.chapters = [physicsChapter1._id, physicsChapter2._id];
  await physicsCourse.save();

  chemistryCourse.chapters = [chemistryChapter1._id, chemistryChapter2._id];
  await chemistryCourse.save();

  biologyCourse.chapters = [biologyChapter1._id, biologyChapter2._id];
  await biologyCourse.save();

  console.log('Sample data seeded successfully!');
  process.exit();
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});
