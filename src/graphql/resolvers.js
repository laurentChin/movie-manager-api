const { GraphQLUpload } = require("graphql-upload");

const { resolvers: userResolvers } = require("../user");
const { resolvers: securityResolver } = require("../security");
const { resolvers: movieResolver } = require("../movie");
const { resolvers: formatResolver } = require("../format");
const { resolvers: logResolvers } = require("../log");

module.exports = {
  Upload: GraphQLUpload,

  Query: {
    ...userResolvers.Query,
    ...securityResolver.Query,
    ...movieResolver.Query,
    ...formatResolver.Query,
    ...logResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...securityResolver.Mutation,
    ...movieResolver.Mutation,
  },

  User: userResolvers.User,
  Movie: movieResolver.Movie,
};
