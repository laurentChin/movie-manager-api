const { GraphQLError } = require("graphql");
const isAfter = require("date-fns/isAfter");
const parseISO = require("date-fns/parseISO");
const jwt = require("jsonwebtoken");

const passwordEncoder = require("./passwordEncoder");

module.exports = {
  Query: {
    login: async (
      parent,
      { email: emailArg, password },
      { user, model, environment }
    ) => {
      const userInstance = await model.user.findOne({
        where: { email: emailArg },
      });

      if (!userInstance)
        throw new GraphQLError("Authentication failed.", {
          extensions: { code: "UNAUTHENTICATED" },
        });

      const {
        dataValues: { active, passwordHash, salt, email },
      } = userInstance;

      if (!active)
        throw new GraphQLError("Account not validated", {
          extensions: { code: "FORBIDDEN" },
        });

      if (passwordEncoder.encode(password, salt) !== passwordHash)
        throw new GraphQLError("Authentication failed.", {
          extensions: { code: "UNAUTHENTICATED" },
        });

      try {
        await userInstance.update({ lastLogin: new Date() });

        return {
          jwt: jwt.sign({ email }, environment.jwtSecretKey),
          user: {
            email,
          },
        };
      } catch (e) {
        throw new Error("Error during login process");
      }
    },
  },
  Mutation: {
    validateToken: async (parent, { token }, { user, model }) => {
      const userInstance = await model.user.findOne({
        where: { signInToken: token },
      });

      if (!userInstance)
        throw new GraphQLError("Invalid token given", {
          extensions: { code: "BAD_USER_INPUT" },
        });

      const {
        dataValues: { email, signInTokenExpirationDate },
      } = userInstance;

      if (
        isAfter(new Date(), parseISO(signInTokenExpirationDate.toISOString()))
      )
        throw new GraphQLError("Invalid token given", {
          extensions: { code: "BAD_USER_INPUT" },
        });

      try {
        await userInstance.update({
          active: true,
          signInToken: null,
        });

        return {
          email,
        };
      } catch (e) {
        throw new Error("Error during user update process");
      }
    },
  },
};
