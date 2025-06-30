const express = require('express');
const { client } = require('../db/connect');
const auth = require('../middleware/auth');
const { ObjectId } = require('mongodb');

const router = express.Router();

const events = client.db(process.env.DB_NAME).collection('events');

// Add Event
router.post('/', auth, async (req, res) => {
  const { title, location, description, dateTime } = req.body;
  const event = {
    title,
    location,
    description,
    dateTime: new Date(dateTime),
    attendeeCount: 0,
    createdBy: req.user.email,
  };
  await events.insertOne(event);
  res.status(201).json({ message: 'Event added' });
});

// Get Search/Filter
router.get('/', auth, async (req, res) => {
  const { search, filter } = req.query;
  const now = new Date();
  let query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  if (filter === 'today') {
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    query.dateTime = { $gte: start, $lte: end };
  }



  const allEvents = await events.find(query).sort({ dateTime: -1 }).toArray();
  res.json(allEvents);
});

// Join Event
router.patch('/join/:id', auth, async (req, res) => {
  const id = req.params.id;
  const joined = await events.findOne({ _id: new ObjectId(id), [`joined.${req.user.email}`]: true });
  if (joined) return res.status(400).json({ message: 'Already joined' });

  await events.updateOne(
    { _id: new ObjectId(id) },
    {
      $inc: { attendeeCount: 1 },
      $set: { [`joined.${req.user.email}`]: true },
    }
  );
  res.json({ message: 'Joined successfully' });
});

module.exports = router;
