import { Format, Movie } from "../models/index";

const resolvers = {
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
