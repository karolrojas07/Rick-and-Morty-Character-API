import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { createServer } from "http";
import { createGraphQLServer, applyGraphQLMiddleware } from "./graphql/server";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());

// Initialize GraphQL server
let graphQLServer: any;

const initializeGraphQL = async () => {
  graphQLServer = await createGraphQLServer(httpServer);
  applyGraphQLMiddleware(app, graphQLServer);
};

// Initialize GraphQL when app starts
initializeGraphQL();

export default app;
export { httpServer };
