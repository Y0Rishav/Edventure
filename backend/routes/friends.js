const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Search users by username or name
router.get('/search', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { name: { $regex: q, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user._id } } // Exclude current user
      ]
    }).select('name username _id').limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get friends list
router.get('/', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name username _id');
    res.json(user.friends || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add friend
router.post('/add/:friendId', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { friendId } = req.params;
  try {
    const friend = await User.findById(friendId);
    if (!friend) return res.status(404).send('User not found');

    const user = await User.findById(req.user._id);
    if (user.friends.includes(friendId)) return res.status(400).send('Already friends');

    user.friends.push(friendId);
    await user.save();

    res.send('Friend added');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove friend
router.delete('/remove/:friendId', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { friendId } = req.params;
  try {
    const user = await User.findById(req.user._id);
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    await user.save();
    res.send('Friend removed');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
