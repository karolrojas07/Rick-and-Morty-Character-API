import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { createServer } from "http";
import { createGraphQLServer, applyGraphQLMiddleware } from "./graphql/server";
import { requestLogger } from "./middleware/requestLogger";
import { setupSwagger } from "./config/swagger";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(requestLogger);

// Initialize Swagger
setupSwagger(app); // Call the setupSwagger function

// Initialize GraphQL server
export const startServer = async () => {
  const graphQLServer = await createGraphQLServer(httpServer);
  applyGraphQLMiddleware(app, graphQLServer);
  return { app, httpServer };
};

export default app;
export { httpServer };
