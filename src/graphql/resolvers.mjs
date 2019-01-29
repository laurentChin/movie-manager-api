import { resolvers as userResolvers } from "../user";
import { resolvers as securityResolver } from "../security";
import { resolvers as movieResolver } from "../movie";

export default {
  Query: {
    ...userResolvers.Query,
    ...securityResolver.Query
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...securityResolver.Mutation
  },

  User: userResolvers.User,
  Movie: movieResolver.Movie
};
