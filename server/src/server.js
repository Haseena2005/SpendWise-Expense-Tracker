const app = require('./app');
const { connectDB, disconnectDB } = require('./config/database');
const Category = require('./models/Category');
const Transaction = require('./models/Transaction');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await connectDB();

    if (process.env.USE_MEMORY_DB === 'true') {
      console.log('Running full seed on startup...');
      const { seedDatabase } = require('../scripts/seedFn');
      await seedDatabase();
    }

    server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  SpendWise Server Running on Port: ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful Shutdown Handler
const handleGracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      console.log('Database disconnected. Process terminated.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
