const ase = require("apollo-server-express");
const isAfter = require("date-fns/is_after");
const parse = require("date-fns/parse");
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
        where: { email: emailArg }
      });

      if (!userInstance)
        throw new ase.AuthenticationError("Authentication failed.");

      const {
        dataValues: { active, passwordHash, salt, email }
      } = userInstance;

      if (!active) throw new ase.ForbiddenError("Account not validated");

      console.log(passwordEncoder);
      if (passwordEncoder.encode(password, salt) !== passwordHash)
        throw new ase.AuthenticationError("Authentication failed.");

      try {
        await userInstance.update({ lastLogin: new Date() });

        return {
          jwt: jwt.sign({ email }, environment.jwtSecretKey),
          user: {
            email
          }
        };
      } catch (e) {
        throw new Error("Error during login process");
      }
    }
  },
  Mutation: {
    validateToken: async (parent, { token }, { user, model }) => {
      const userInstance = await model.user.findOne({
        where: { signInToken: token }
      });

      if (!userInstance) throw new ase.UserInputError("Invalid token given");

      const {
        dataValues: { email, signInTokenExpirationDate }
      } = userInstance;

      if (isAfter(new Date(), parse(signInTokenExpirationDate)))
        throw new ase.UserInputError("Invalid token given");

      try {
        await userInstance.update({
          active: true,
          signInToken: null
        });

        return {
          email
        };
      } catch (e) {
        throw new Error("Error during user update process");
      }
    }
  }
};
