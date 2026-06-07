const mongoose = require('mongoose');
const config = require('../config');

async function connectDB() {
  const uri = config.MONGODB_URI;
  if (!uri) {
    console.error("CRITICAL: MONGODB_URI is not set in environment variables!");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: 'crm_website' });
    console.log("Connected to MongoDB successfully via Mongoose (crm_website)!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

module.exports = {
  connectDB
};
