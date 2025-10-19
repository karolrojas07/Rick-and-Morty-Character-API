import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import { typeDefs } from "./schema/types";
import { resolvers } from "./resolvers";

export const createGraphQLServer = async (httpServer: any) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  return server;
};

export const applyGraphQLMiddleware = (app: any, server: any) => {
  // Ensure JSON body parsing is applied for GraphQL route specifically
  app.use("/graphql", express.json(), expressMiddleware(server));
};
