import { httpServer, startServer } from "./app";
import { initializeRedis, closeRedisConnection } from "./config/redis";
import * as cron from "node-cron";
import { syncCharacters } from "./services/characterSync.service";

const PORT = process.env.PORT || 3000;

// Store cron job reference for graceful shutdown
let characterSyncJob: cron.ScheduledTask | null = null;

/**
 * Setup scheduled jobs
 */
const setupCronJobs = (): void => {
  characterSyncJob = cron.schedule('0 */12 * * *', async () => {
    const startTime = new Date();
    console.log(`[${startTime.toISOString()}] ⏱ Starting character sync...`);

    try {
      await syncCharacters();
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      console.log(
        `[${endTime.toISOString()}] ✓ Character sync completed in ${duration}ms`
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] ✗ Character sync failed:`,
        error
      );
    }
  });

  console.log("✓ Cron jobs scheduled");
};

/**
 * Initialize application
 */
const startApplication = async (): Promise<void> => {
  try {
    // Initialize Redis connection
    await initializeRedis();
    console.log("✓ Redis initialized successfully");

    // Start the GraphQL server
    await startServer();
    console.log("✓ GraphQL server started");

    // Setup cron jobs
    setupCronJobs();

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server running at http://localhost:${PORT}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`📖 Swagger docs: http://localhost:${PORT}/api-docs\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n⛔ Received ${signal}, shutting down gracefully...`);

  try {
    // Stop cron jobs
    if (characterSyncJob) {
      characterSyncJob.stop();
      console.log("✓ Cron jobs stopped");
    }

    // Close Redis connection
    await closeRedisConnection();
    console.log("✓ Redis connection closed");

    // Close HTTP server
    httpServer.close(() => {
      console.log("✓ HTTP server closed");
      console.log("👋 Application shutdown complete");
      process.exit(0);
    });

    // Force exit after timeout (prevent hanging)
    setTimeout(() => {
      console.warn("⚠ Forced shutdown after timeout");
      process.exit(1);
    }, 10000); // 10 second timeout
  } catch (error) {
    console.error("✗ Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the application
startApplication();