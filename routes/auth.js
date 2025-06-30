const express = require('express');
const { hashPassword, verifyPassword } = require('../utils/hash');
const { generateToken } = require('../utils/token');
const { client } = require('../db/connect');

const router = express.Router();
const usersCollection = client.db(process.env.DB_NAME).collection('users');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, photoURL } = req.body;

  try {
    const existing = await usersCollection.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await hashPassword(password);
    const user = { name, email, password: hashed, photoURL };
    await usersCollection.insertOne(user);

    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await verifyPassword(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.status(200).json({ token, user: { name: user.name, email: user.email, photoURL: user.photoURL } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;
