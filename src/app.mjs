import express from "express";
import jwt from "express-jwt";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import ase from "apollo-server-express";
import jsonwebtoken from "jsonwebtoken";

import environment from "../environment";

import { User, Movie, Format } from "./models/index";
import { securityRouterFactory } from "./security/index";
import { movieRouterFactory } from "./movie/index";
import { formatRouterFactory } from "./format/index";

import { typeDefs, resolvers } from "./graphql";

const apolloServer = new ase.ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    user: req.headers.authorization
      ? jsonwebtoken.decode(req.headers.authorization.replace("Bearer ", ""))
      : null,
    model: {
      user: User
    },
    environment
  })
});

const app = express();

apolloServer.applyMiddleware({ app });

app
  .use(bodyParser.json({ limit: "8mb" }))
  .use(cors())
  .use(
    jwt({ secret: environment.jwtSecretKey }).unless({
      path: [/^\/security/, /^\/uploads/, /^\/graphql/]
    })
  )
  .use(
    "/security",
    securityRouterFactory(express.Router(), User, environment.jwtSecretKey)
  )
  .use("/movies", movieRouterFactory(express.Router(), Movie, User, Format))
  .use("/formats", formatRouterFactory(express.Router(), Format))
  .use(express.static("public", { fallthrough: false }))
  .use((err, request, response, next) => {
    if (/^\/uploads/.test(request.url)) {
      const posterFallback = fs.createReadStream(
        path.join(process.env.PWD, "public", "assets", "poster-placeholder.png")
      );
      posterFallback.pipe(response);
    } else {
      next(err);
    }
  })
  .listen(environment.port, () => {
    console.log(`Server listening on localhost:${environment.port}`);
    console.log(`GraphQL endpoint : ${apolloServer.graphqlPath}`);
  });

export default app;
