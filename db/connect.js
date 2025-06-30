const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log('MongoDB Connected');
    return client.db(process.env.DB_NAME);
  } catch (err) {
    console.error('DB Connection Failed:', err);
    process.exit(1);
  }
}

module.exports = { connectDB, client };
