require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  // Clear existing user data if needed
  // await User.deleteMany({}); // Uncomment if you want to clear users

  // Create sample user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const sampleUser = new User({
    name: 'Test User',
    username: 'Testuser',
    email: 'testuser@example.com',
    password: hashedPassword,
    age: 16,
    class: 10,
    subjects: ['Mathematics', 'Science', 'Physics'],
    points: 100
  });
  await sampleUser.save();

  console.log('Sample data seeded successfully!');
  process.exit();
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});
