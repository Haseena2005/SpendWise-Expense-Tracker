const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spendwise';
    const isProduction = process.env.NODE_ENV === 'production';
    const useMemoryDB = process.env.USE_MEMORY_DB === 'true' || process.env.NODE_ENV === 'test';

    // In-Memory MongoDB for local development or automated tests
    if (useMemoryDB) {
      console.log('Starting In-Memory MongoDB Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] In-Memory MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }

    // Connect to primary MongoDB instance (MongoDB Atlas or Local MongoDB)
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      if (isProduction) {
        // In production, fail immediately with clear diagnostic logs (avoid silent fallback)
        const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
        console.error(`[Database Error] Production connection to MongoDB failed: ${err.message}`);
        console.error(`[Database Error] Target URI: ${maskedUri}`);
        throw err;
      }

      // Development-only fallback: only attempt if not in production
      console.warn(`[Database] Primary Mongo connection failed (${err.message}). Falling back to In-Memory MongoDB for dev...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Fallback In-Memory MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer && typeof mongoMemoryServer.stop === 'function') {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
  } catch (error) {
    console.error(`[Database Disconnect Error] ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
