import { httpServer, startServer } from "./app";
import { initializeRedis, closeRedisConnection } from "./config/redis";

const PORT = process.env.PORT || 3000;

// Initialize Redis and start server
const startApplication = async () => {
  try {
    // Initialize Redis connection
    await initializeRedis();
    console.log("Redis initialized successfully");

    // Start the GraphQL server
    await startServer();

    httpServer.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
  } catch (error: any) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  await closeRedisConnection();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await closeRedisConnection();
  process.exit(0);
});

startApplication();
