const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spendwise';
    const useMemoryDB = process.env.USE_MEMORY_DB === 'true' || process.env.NODE_ENV === 'test';

    if (useMemoryDB) {
      console.log('Starting In-Memory MongoDB Server...');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] In-Memory MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }

    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] Primary Mongo connection failed (${err.message}). Falling back to In-Memory MongoDB...`);
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
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (error) {
    console.error(`[Database Disconnect Error] ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
