const express = require('express');
const { hashPassword, verifyPassword } = require('../utils/hash');
const { generateToken } = require('../utils/token');
const { client } = require('../db/connect');

const router = express.Router();
const usersCollection = client.db(process.env.DB_NAME).collection('users');

// 🔐 Register
router.post('/register', async (req, res) => {
  const { name, email, password, photoURL } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    const existing = await usersCollection.findOne({ email });

    if (existing) {
      return res.status(409).json({ message: 'Email already exists' }); // 409 Conflict
    }

    const hashedPassword = await hashPassword(password);

    const user = {
      name,
      email,
      password: hashedPassword,
      photoURL: photoURL || "", // optional
      createdAt: new Date()
    };

    await usersCollection.insertOne(user);

    return res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// 🔓 Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Sign JWT (you can use user._id too if needed)
    const token = generateToken({
      email: user.email,
      name: user.name
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        photoURL: user.photoURL || ""
      }
    });

  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;