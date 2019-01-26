import ase from "apollo-server-express";
import isAfter from "date-fns/is_after";
import parse from "date-fns/parse";

export default {
  Mutation: {
    validateToken: async (parent, { token }, { user, model }) => {
      const userInstance = await model.user.findOne({ where: { token } });

      if (!userInstance) throw new ase.UserInputError("Invalid token given");

      const {
        dataValues: { email, tokenExpirationDate }
      } = userInstance;

      if (isAfter(new Date(), parse(tokenExpirationDate)))
        throw new ase.UserInputError("Invalid token given");

      try {
        await userInstance.update({
          active: true,
          token: null
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
