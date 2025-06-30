const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./db/connect');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userEventRoutes = require('./routes/userEvents');

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Onusthan API is running');
  });  
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/myevents', userEventRoutes);


connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
