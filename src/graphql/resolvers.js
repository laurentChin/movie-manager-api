const { resolvers: userResolvers } = require("../user");
const{ resolvers: securityResolver } = require("../security");
const{ resolvers: movieResolver } = require("../movie");

module.exports = {
  Query: {
    ...userResolvers.Query,
    ...securityResolver.Query,
    ...movieResolver.Query
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...securityResolver.Mutation,
    ...movieResolver.Mutation
  },

  User: userResolvers.User,
  Movie: movieResolver.Movie
};
