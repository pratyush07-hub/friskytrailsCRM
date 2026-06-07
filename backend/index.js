const express = require('express');
const cors = require('cors');
const config = require('./config');
const { connectDB } = require('./db');
const apiRoutes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

// Mount API routes under /api prefix
app.use('/api', apiRoutes);

// Start server after DB connection
connectDB().then(() => {
  app.listen(config.PORT, () => {
    console.log(`Backend server is running on http://localhost:${config.PORT}`);
  });
}).catch((error) => {
  console.error("Critical server startup failure:", error);
  process.exit(1);
});
