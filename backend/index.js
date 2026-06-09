const express = require('express');
const cors = require('cors');
const config = require('./config');
const { connectDB } = require('./db');
const apiRoutes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

// Ensure database is connected before handling API routes
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Critical database connection failure:", error);
    res.status(500).json({ error: "Database connection failed. Check your MongoDB Atlas IP Access List." });
  }
}, apiRoutes);

// Start server if run directly (e.g. node index.js)
if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`Backend server is running on http://localhost:${config.PORT}`);
  });
}

module.exports = app;
