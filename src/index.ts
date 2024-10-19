import dotenv from "dotenv";
import bodyParser from "body-parser";

import { buildSchema } from 'drizzle-graphql';
import { drizzle } from "drizzle-orm/neon-http";

import { db } from "./db";
// import * as schema from "./db/schema";

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express, { Request, Response } from "express";
import http from 'http';
import cors from 'cors';
import { int } from "drizzle-orm/mysql-core";
import { introspectionFromSchema } from "graphql";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

async function getAllProduct() {
  return await db.query.products.findMany(); // Added return statement
}

// // Define your GraphQL schema using the gql template literal
// const typeDefs = `
//   type Product {
//     productId: ID!
//     productName: String!
//     description: String!
//     createdAt: String!
//     updatedAt: String!
//   }

//   type Query {
//     products: [Product!]!
//   }

//   type Mutation {
//     addProduct(productName: String!, description: String!): String!
//   }
// `;

// // Define your resolvers
// const resolvers = {
//   Query: {
//     products: async () => {
//       return await db.query.products.findMany();
//     },
//   },
//   Mutation: {
//     addProduct: async (_: any, { productName, description }: { productName: string; description: string }) => {
//       await db.insert(schema.products).values({
//         productName,
//         description,
//       }).execute();
//       return "Product added successfully"; // Return success message
//     },
//   },
// };

const { schema } = buildSchema(db);
const server = new ApolloServer({ schema, introspection: true });
const main = async () => {
  await server.start();

  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));

  app.use(express.json());
  app.use("/graphql", expressMiddleware(server));
  const httpServer = http.createServer(app);
}

main().then(() => {
  app.get("/", async (req: Request, res: Response) => {
    res.send("Hello World!");
  });
  
  app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});

