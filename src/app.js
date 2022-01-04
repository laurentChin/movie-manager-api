const express = require("express");
const jwt = require("express-jwt");
const jsonwebtoken = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const http = require("http");
const ase = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { graphqlUploadExpress } = require("graphql-upload");

const environment = require("../environment");

const { User, Format, Log } = require("./models");
const { formatRouterFactory } = require("./format/index");

const { typeDefs, resolvers } = require("./graphql");

async function startApolloServer(typeDefs, resolvers) {
  const app = express();

  const httpServer = http.createServer(app);
  const server = new ase.ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({ req }) => ({
      user: req.headers.authorization
        ? jsonwebtoken.decode(req.headers.authorization.replace("Bearer ", ""))
        : null,
      model: {
        user: User,
        Log,
        Format,
      },
      environment,
    }),
  });

  await server.start();

  app
    .use(bodyParser.json({ limit: "8mb" }))
    .use(cors())
    .use(graphqlUploadExpress())
    .use(
      server.getMiddleware({
        cors: false,
      })
    )
    .use(
      jwt({ secret: environment.jwtSecretKey, algorithms: ["HS256"] }).unless({
        path: [/^\/uploads/, /^\/assets/, /^\/graphql/],
      })
    )
    .use("/formats", formatRouterFactory(express.Router(), Format))
    .use(express.static("public", { fallthrough: false }))
    .use((err, request, response, next) => {
      if (/^\/uploads/.test(request.url)) {
        const posterFallback = fs.createReadStream(
          path.join(environment.assetsPath, "assets", "poster-placeholder.png")
        );
        posterFallback.pipe(response);
      } else {
        next(err);
      }
    });

  await new Promise(resolve =>
    httpServer.listen({ port: environment.port }, resolve)
  );

  console.log(
    `Server listening on localhost:${environment.port} with config :`
  );

  console.log(environment);

  return { server, app };
}

module.exports = startApolloServer(typeDefs, resolvers);
