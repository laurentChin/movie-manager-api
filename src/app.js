const express = require("express");
const jwt = require("express-jwt");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const ase = require("apollo-server-express");
const jsonwebtoken = require("jsonwebtoken");

const environment = require("../environment");

const { User, Format, Log } = require("./models");
const { formatRouterFactory } = require("./format/index");

const { typeDefs, resolvers } = require("./graphql");

const apolloServer = new ase.ApolloServer({
  typeDefs,
  resolvers,
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

const app = express();

apolloServer.applyMiddleware({ app });

app
  .use(bodyParser.json({ limit: "8mb" }))
  .use(cors())
  .use(
    jwt({ secret: environment.jwtSecretKey }).unless({
      path: [/^\/uploads/, /^\/assets/, /^\/graphql/],
    })
  )
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

module.exports = app;
