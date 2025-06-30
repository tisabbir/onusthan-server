const express = require('express');
const { client } = require('../db/connect');
const {ObjectId } = require('mongodb')
const auth = require('../middleware/auth');
const router = express.Router();

const events = client.db(process.env.DB_NAME).collection('events');

// Get
router.get('/', auth, async (req, res) => {
  const myEvents = await events.find({ createdBy: req.user.email }).toArray();
  res.json(myEvents);
});

// Update
router.put('/:id', auth, async (req, res) => {
  const { title, location, description, dateTime } = req.body;
  await events.updateOne(
    { _id: new ObjectId(req.params.id), createdBy: req.user.email },
    { $set: { title, location, description, dateTime: new Date(dateTime) } }
  );
  res.json({ message: 'Updated successfully' });
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  await events.deleteOne({ _id: new ObjectId(req.params.id), createdBy: req.user.email });
  res.json({ message: 'Deleted successfully' });
});

module.exports = router;
