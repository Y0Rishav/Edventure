require('dotenv').config();

const mongoose = require('mongoose');
const Course = require('./models/Course');
const Chapter = require('./models/Chapter');

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  // Clear existing data
  await Course.deleteMany({});
  await Chapter.deleteMany({});

  // Sample courses
  const mathCourse = new Course({
    title: 'Mathematics Basics',
    subject: 'Mathematics',
    class: 1,
    description: 'Introduction to basic mathematics concepts'
  });
  await mathCourse.save();

  const scienceCourse = new Course({
    title: 'Basic Science',
    subject: 'Science',
    class: 1,
    description: 'Fundamental concepts in science'
  });
  await scienceCourse.save();

  // Sample chapters
  const mathChapter1 = new Chapter({
    title: 'Numbers 1-10',
    course: mathCourse._id,
    videoId: 'dQw4w9WgXcQ', // Sample video ID
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
    videoId: 'dQw4w9WgXcQ',
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
    videoId: 'dQw4w9WgXcQ',
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

  // Update courses with chapters
  mathCourse.chapters = [mathChapter1._id, mathChapter2._id];
  await mathCourse.save();

  scienceCourse.chapters = [scienceChapter1._id];
  await scienceCourse.save();

  console.log('Sample data seeded successfully!');
  process.exit();
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});
