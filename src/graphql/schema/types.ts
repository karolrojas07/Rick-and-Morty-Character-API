import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Origin {
    id: Int!
    api_id: Int!
    name: String!
    createdAt: String!
    updatedAt: String!
  }

  type Character {
    id: Int!
    api_id: Int!
    status: String!
    species: String!
    gender: String!
    name: String!
    origin_id: Int
    origin: Origin
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    characters(
      name: String
      status: String
      species: String
      gender: String
      origin_id: Int
      limit: Int
      offset: Int
    ): [Character!]!

    character(id: Int!): Character
    characterByApiId(api_id: Int!): Character
  }
`;
