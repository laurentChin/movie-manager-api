import { Movie } from "../models";

const resolvers = {
  getUser: async (parent, args, { user, model }) => {
    const { email } = args;
    if (!user || user.email !== args.email) return null;

    const userResult = await model.user.findOne({
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

    const { Movies } = userResult.dataValues;

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
};

export default resolvers;
