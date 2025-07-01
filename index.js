const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./db/connect');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userEventRoutes = require('./routes/userEvents');
const cors = require("cors");

dotenv.config();
const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://your-react.vercel.app"],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 10000;

// Routes
app.get('/', (req, res) => {
    res.send('Onusthan API is running');
  });  
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/myevents', userEventRoutes);


connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
