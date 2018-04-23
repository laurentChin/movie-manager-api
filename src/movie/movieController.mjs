import Sequelize from "sequelize";

import validator from './validator';
import { Format } from '../models';

async function createMovie (movieModel, userModel, formatModel, request, response) {
  if (!validator.validate(request.body)) {
    return response
      .status(400)
      .send({message: 'The movie you are trying to create is not valid'});
  }
  try {
    const {title, releaseDate, director} = request.body;
    const user = await userModel.findById(request.user.id);
    let [movie] = await movieModel.findOrCreate({where: {title, releaseDate, director, UserId: user.get('id')}});
    const formats = await formatModel.findAll({where: {id: {[Sequelize.Op.in]: request.body.formats }}});
    formats.forEach(format => {
      movie.addFormat(format);
    });
    movie = await movie.save();
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
    const user = await userModel.findById(request.user.id);
    const movies = await movieModel.findAll({
      where: {UserId: user.get('id')},
      include: [{
        model: Format,
        as: 'formats'
      }]
    });
    response
      .status(200)
      .send(movies);
  } catch (e) {
    response
      .status(500)
      .send({message: 'Your attempt to list your movies failed.'});
  }
}

async function getMovie(movieModel, request, response) {
  try {
    const movie = await movieModel.findById(request.params.id, {include: [{model: Format, as: 'formats'}]});

    // makes sure the authenticated user own the movie
    if(request.user.id !== movie.get('UserId')) {
      return response
        .status(403)
        .send({message: `You are not allowed to see this content`});
    }

    response
      .status(200)
      .send(movie);

  } catch (e) {
    response
      .status(500)
      .send({message: 'Your attempt to list your movies failed.'});
  }
}

export default {
  createMovie,
  listMovie,
  getMovie
};
