const express = require('express');
const cors = require('cors');
const config = require('./config');
const { connectDB } = require('./db');
const apiRoutes = require('./routes');

const app = express();

app.use(cors({
  origin: "*"
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
