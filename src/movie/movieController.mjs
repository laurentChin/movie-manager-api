import validator from './validator';

async function createMovie (movieModel, userModel, request, response) {
  if (!validator.validate(request.body)) {
    response
      .status(400)
      .send({message: 'The movie you are trying to create is not valid'});
  }
  try {
    const {title, releaseDate, director} = request.body;
    const user = await userModel.findById(request.user.user[0].id);
    const movie = await movieModel.findOrCreate({where: {title, releaseDate, director, UserId: user.get('id')}});
    response
      .status(200)
      .send(movie);
  } catch (e) {
    response
      .status(400)
      .send({message: 'Your attempt to create a movie failed.'});
  }
}

async function listMovie (movieModel, userModel, request, response) {
  try {
    const user = await userModel.findById(request.user.user[0].id);
    const movies = await movieModel.findAll({where: {UserId: user.get('id')}});
    response
      .status(200)
      .send(movies);
  } catch (e) {
    response
      .status(500)
      .send({message: 'Your attempt to list your movies failed.'});
  }
}

export default {
  createMovie,
  listMovie
};
