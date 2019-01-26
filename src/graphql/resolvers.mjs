import { resolvers as userResolvers } from "../user";
import { resolvers as securityResolver } from "../security";

export default {
  Query: {
    ...userResolvers.Query,
    ...securityResolver.Query
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...securityResolver.Mutation
  }
};
