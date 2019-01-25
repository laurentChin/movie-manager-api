import { resolvers as userResolvers } from "../user";

export default {
  Query: {
    ...userResolvers.Query
  },

  Mutation: {
    ...userResolvers.Mutation
  }
};
