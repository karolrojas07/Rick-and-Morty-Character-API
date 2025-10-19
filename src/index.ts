import { httpServer, startServer } from "./app";

const PORT = process.env.PORT || 3000;

startServer()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
  })
  .catch((error: any) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
