import crypto from "crypto";
import ase from "apollo-server-express";
import addHours from "date-fns/add_hours";

import { Movie } from "../models";
import { passwordEncoder } from "../security";

const resolvers = {
  Query: {
    getUser: async (parent, args, { user, model }) => {
      const { email } = args;
      if (!user || user.email !== args.email)
        throw new ase.ForbiddenError(
          "You are not allowed to process this action."
        );

      const {
        dataValues: { Movies }
      } = await model.user.findOne({
        where: {
          email
        },
        include: [
          {
            model: Movie,
            as: "Movies"
          }
        ]
      });

      return {
        email,
        movies: Movies.map(
          ({ dataValues: { title, director, releaseDate } }) => ({
            title,
            director,
            releaseDate
          })
        )
      };
    }
  },
  Mutation: {
    addUser: async (parent, { email, password }, { user, model }) => {
      if (!email || !password) return null;
      const existingUser = await model.user.findOne({
        where: { email }
      });

      if (existingUser) throw new ase.UserInputError("Cannot create the user");

      const salt = crypto
        .randomBytes(Math.round(Math.random() * 100))
        .toString("hex");

      try {
        await model.user.create({
          email,
          salt,
          passwordHash: passwordEncoder.encode(password, salt),
          active: false,
          token: crypto.createHash("sha256").digest("hex"),
          tokenExpirationDate: addHours(new Date(), 48)
        });

        return {
          email
        };
      } catch (e) {
        throw new ase.ApolloError("An error occured during creation process");
      }
    }
  }
};

export default resolvers;
