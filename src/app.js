const express = require("express");
const { expressjwt: jwt } = require("express-jwt");
const jsonwebtoken = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const http = require("http");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const graphqlUploadExpress = require("graphql-upload/graphqlUploadExpress.js");

const environment = require("../environment");

const { User, Format, Log } = require("./models");
const { formatRouterFactory } = require("./format/index");

const { typeDefs, resolvers } = require("./graphql");

async function startApolloServer(typeDefs, resolvers) {
  const app = express();

  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    // Apollo's default CSRF prevention blocks "simple request" content
    // types (multipart/form-data, x-www-form-urlencoded, text/plain)
    // unless a preflight-triggering header is present. It guards against
    // CSRF via ambient credentials (cookies) attached automatically by the
    // browser -- this API has none: auth is a bearer JWT the client sets
    // explicitly, never sent automatically cross-origin. graphql-upload's
    // multipart uploads (and apollo-upload-client on the PWA side) don't
    // add that header, so leaving this on would block real uploads too.
    csrfPrevention: false,
  });

  const context = async ({ req }) => ({
    user: req.headers.authorization
      ? jsonwebtoken.decode(req.headers.authorization.replace("Bearer ", ""))
      : null,
    model: {
      user: User,
      Log,
      Format,
    },
    environment,
  });

  await server.start();

  app
    .use(bodyParser.json({ limit: "8mb" }))
    .use(cors())
    .use(graphqlUploadExpress())
    .use("/graphql", expressMiddleware(server, { context }))
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
