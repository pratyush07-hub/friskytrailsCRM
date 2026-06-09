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

    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /\.vercel\.app$/,
      /\.onrender\.com$/
    ];

    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
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
