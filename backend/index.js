const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const { connectDB } = require('./db');
const apiRoutes = require('./routes');

const app = express();

app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Mount API routes under /api prefix
app.use('/api', apiRoutes);

// Connect to database
connectDB().catch((error) => {
  console.error("Critical database connection failure:", error);
});

// Start server if run directly (e.g. node index.js)
if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`Backend server is running on http://localhost:${config.PORT}`);
  });
}

module.exports = app;
