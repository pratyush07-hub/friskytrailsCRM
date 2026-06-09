require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://rishabhdutt792_db_user:mcx5fvkrKBJuBzal@cluster0.yp38jp8.mongodb.net/?appName=Cluster0",
  JWT_SECRET: process.env.JWT_SECRET || 'friskytrails_super_secret_key_12345',
};
