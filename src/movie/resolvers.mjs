import ase from "apollo-server-express";
import { Format, Movie, User } from "../models/index";
import { deletePoster, handleFile, mapDataValues } from "./helpers";
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
    },
    updateMovie: async (
      parent,
      { id, title, director, releaseDate, poster, formats },
      { user }
    ) => {
      const movieInstance = await Movie.findById(id, {
        include: [
          {
            model: User
          }
        ]
      });

      if (user.email !== movieInstance.get("User").get("email"))
        throw new ase.ForbiddenError(
          "You are not allowed to update this movie."
        );

      try {
        await movieInstance.setFormats(formats);
        let values = {
          title,
          director,
          releaseDate
        };

        if (typeof poster !== "string") {
          const { filename, createReadStream } = await poster;
          values.poster = await handleFile({ filename, createReadStream });
        }

        await movieInstance.update(values);

        return mapDataValues(movieInstance);
      } catch (e) {
        throw new Error(`Update failed for ${id}.`);
      }
    },
    deleteMovie: async (parent, { id }, { user }) => {
      const movieInstance = await Movie.findById(id, {
        include: [
          {
            model: User
          }
        ]
      });

      if (user.email !== movieInstance.get("User").get("email"))
        throw new ase.ForbiddenError(
          "You are not allowed to delete this movie."
        );

      try {
        if (movieInstance.get("poster")) {
          await deletePoster(movieInstance.get("poster"));
        }

        await movieInstance.destroy();

        return mapDataValues(movieInstance);
      } catch (e) {
        throw new Error(`Deletion failed for ${id}.`);
      }
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
