import app, { httpServer } from "./app";

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
