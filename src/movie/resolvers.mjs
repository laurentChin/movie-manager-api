import { Format, Movie, User } from "../models/index";
import { mapDataValues } from "./helpers";
import { LIMIT } from "./constants";

const resolvers = {
  Query: {
    movies: async (parent, { offset, limit = LIMIT }, { user }) => {
      const movies = await Movie.findAll({
        offset,
        limit,
        order: [["title", "ASC"]],
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
