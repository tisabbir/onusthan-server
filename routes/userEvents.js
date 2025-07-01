const express = require('express');
const { client } = require('../db/connect');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

const router = express.Router();
const events = client.db(process.env.DB_NAME).collection('events');

// 🧾 GET: My Events
router.get('/', auth, async (req, res) => {
  try {
    const myEvents = await events
      .find({ createdBy: req.user.email })
      .sort({ dateTime: -1 }) // Optional: newest first
      .toArray();

    res.json(myEvents);

  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your events', error: err.message });
  }
});

// ✏️ PUT: Update Event
router.put('/:id', auth, async (req, res) => {
  const { title, location, description, dateTime } = req.body;

  if (!title || !location || !description || !dateTime) {
    return res.status(400).json({ message: 'All fields are required to update an event.' });
  }

  try {
    const result = await events.updateOne(
      {
        _id: new ObjectId(req.params.id),
        createdBy: req.user.email
      },
      {
        $set: {
          title,
          location,
          description,
          dateTime: new Date(dateTime)
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Event not found or not owned by user.' });
    }

    res.json({ message: 'Updated successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to update event', error: err.message });
  }
});

// 🗑️ DELETE: My Event
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await events.deleteOne({
      _id: new ObjectId(req.params.id),
      createdBy: req.user.email
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Event not found or not owned by user.' });
    }

    res.json({ message: 'Deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to delete event', error: err.message });
  }
});

module.exports = router;