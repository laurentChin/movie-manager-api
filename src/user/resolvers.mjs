import crypto from "crypto";
import ase from "apollo-server-express";
import addHours from "date-fns/add_hours";

import { User, Movie } from "../models";
import { passwordEncoder } from "../security";
import { transporter } from "../core/mailer";
import { helpers as movieHelpers } from "../movie";
import { generateNaturalOrder } from "../models/helpers";

const resolvers = {
  Query: {
    getUser: async (parent, args, { user }) => {
      const { email } = args;
      if (!user || user.email !== args.email)
        throw new ase.ForbiddenError(
          "You are not allowed to process this action."
        );

      const userInstance = await User.findOne({
        where: {
          email
        }
      });

      const count = await Movie.count({
        include: [
          {
            model: User,
            as: "User",
            where: {
              email
            }
          }
        ]
      });

      return {
        email,
        lastLogin: userInstance.get("lastLogin"),
        count
      };
    }
  },
  User: {
    async movies(user) {
      const movies = await Movie.findAll({
        order: generateNaturalOrder("title"),
        include: [
          {
            model: User,
            as: "User",
            where: {
              email: user.email
            }
          }
        ]
      });

      return movies.map(movieHelpers.mapDataValues);
    }
  },
  Mutation: {
    addUser: async (
      parent,
      { email, password },
      {
        user,
        model,
        environment: {
          frontUrl,
          signIn: { sender, subject, validationPath }
        }
      }
    ) => {
      if (!email || !password) return null;
      const existingUser = await model.user.findOne({
        where: { email }
      });

      if (existingUser) throw new ase.UserInputError("Cannot create the user");

      const salt = crypto
        .randomBytes(Math.round(Math.random() * 100))
        .toString("hex");

      const token = crypto.createHash("sha256").digest("hex");

      try {
        await model.user.create({
          email,
          salt,
          passwordHash: passwordEncoder.encode(password, salt),
          active: false,
          signInToken: token,
          signInTokenExpirationDate: addHours(new Date(), 48)
        });

        transporter.sendMail({
          from: sender,
          to: email,
          subject,
          text: `${frontUrl}/${validationPath}?token=${token}`
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
