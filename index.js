const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./db/connect");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const userEventRoutes = require("./routes/userEvents");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*", // Or your frontend domain
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Routes
app.get("/api", (req, res) => {
  res.send("Onusthan API is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/myevents", userEventRoutes);

console.log("⏳ Connecting to database...");
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });

module.exports = app;
module.exports.handler = serverless(app);
