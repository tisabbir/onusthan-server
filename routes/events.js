const express = require('express');
const { client } = require('../db/connect');
const auth = require('../middleware/auth');
const { ObjectId } = require('mongodb');

const router = express.Router();
const events = client.db(process.env.DB_NAME).collection('events');

// ➕ Add Event (Only if authenticated)
router.post('/', auth, async (req, res) => {
  try {
    const { title, location, description, dateTime } = req.body;

    if (!title || !location || !description || !dateTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const event = {
      title,
      location,
      description,
      dateTime: new Date(dateTime),
      attendeeCount: 0,
      createdBy: req.user.email,
      createdAt: new Date(),
      joined: {}
    };

    await events.insertOne(event);
    res.status(201).json({ message: 'Event added successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to add event', error: err.message });
  }
});

// 🔍 Get Events (Search + Filter)
router.get('/', auth, async (req, res) => {
  try {
    const { search, filter } = req.query;
    const now = new Date();
    let query = {};

    // Search by title (case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Filter options
    if (filter === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      query.dateTime = { $gte: start, $lte: end };
    }

    // 🔧 Easily extend later for week/month filters
    const allEvents = await events.find(query).sort({ dateTime: -1 }).toArray();
    res.status(200).json(allEvents);

  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events', error: err.message });
  }
});

// ➕ Join Event (Only once per user)
router.patch('/join/:id', auth, async (req, res) => {
  try {
    const eventId = new ObjectId(req.params.id);
    const userEmail = req.user.email;

    const alreadyJoined = await events.findOne({
      _id: eventId,
      [`joined.${userEmail}`]: true
    });

    if (alreadyJoined) {
      return res.status(400).json({ message: 'You have already joined this event' });
    }

    await events.updateOne(
      { _id: eventId },
      {
        $inc: { attendeeCount: 1 },
        $set: { [`joined.${userEmail}`]: true }
      }
    );

    res.json({ message: 'Successfully joined the event' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to join event', error: err.message });
  }
});

module.exports = router;