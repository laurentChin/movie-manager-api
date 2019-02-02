import ase from "apollo-server-express";
import { Format, Movie, User } from "../models/index";
import { handleFile, mapDataValues } from "./helpers";
import { LIMIT } from "./constants";
import { generateNaturalOrder } from "../models/helpers";

const resolvers = {
  Query: {
    movies: async (parent, { offset, limit = LIMIT }, { user }) => {
      const movies = await Movie.findAll({
        offset,
        limit,
        order: generateNaturalOrder("title"),
        include: [
          {
            model: User,
            where: {
              email: user.email
            }
          }
        ]
      });

      return movies.map(mapDataValues);
    }
  },
  Mutation: {
    addMovie: async (
      parent,
      { title, director, releaseDate, poster, formats },
      { user }
    ) => {
      if (!user) throw new ase.ForbiddenError("You must be log in to do this.");

      const { filename, createReadStream } = await poster;
      const posterFile = await handleFile({ filename, createReadStream });

      const movieInstance = await Movie.create(
        {
          title,
          director,
          releaseDate,
          poster: posterFile
        },
        {
          include: [
            {
              model: Format,
              as: "formats"
            },
            {
              model: User
            }
          ]
        }
      );

      const userInstance = await User.findOne({
        where: {
          email: user.email
        }
      });

      await movieInstance.setUser(userInstance);
      await movieInstance.addFormats(formats);

      return mapDataValues(movieInstance);
    }
  },
  Movie: {
    async formats(movie) {
      const formats = await Format.findAll({
        include: [
          {
            model: Movie,
            as: "movies",
            where: {
              id: movie.id
            }
          }
        ]
      });

      return formats.map(({ dataValues: { id, name } }) => ({
        id,
        name
      }));
    }
  }
};

export default resolvers;
