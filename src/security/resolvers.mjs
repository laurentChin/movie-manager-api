import ase from "apollo-server-express";
import isAfter from "date-fns/is_after";
import parse from "date-fns/parse";

export default {
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
