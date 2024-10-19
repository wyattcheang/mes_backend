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
import path from 'path';
import cors from 'cors';

dotenv.config();

const compression = require("compression");
const helmet = require("helmet");
const app = express();
const port = process.env.PORT || 3000;

async function getAllProduct() {
  return await db.query.products.findMany(); // Added return statement
}

const { schema } = buildSchema(db);
const server = new ApolloServer({ schema, introspection: process.env.NODE_ENV === "development" });
const main = async () => {
  await server.start();

  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));

  app.use(compression()); // Compress all routes
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
      },
    }),
  );
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

