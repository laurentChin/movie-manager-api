import Sequelize from 'sequelize';

import validator from './validator';
import { movieSelectOptions } from '../models';

async function createMovie (movieModel, userModel, formatModel, request, response) {
  if (!validator.validate(request.body)) {
    return response
      .status(400)
      .send({message: 'The movie you are trying to create is not valid'});
  }
  try {
    const {title, releaseDate, director, formats} = request.body;
    const user = await userModel.findById(request.user.id);
    let [movie] = await movieModel.findOrCreate({
      where: {
        title,
        releaseDate,
        director,
        UserId: user.get('id')
      }
    });
    const formatInstances = await getFormatInstanceFromRequest(formatModel, formats);
    formatInstances.forEach(format => {
      movie.addFormat(format);
    });
    movie = await movie.save();
    response
      .status(200)
      .send(await movieModel.findById(movie.get('id'), movieSelectOptions));
  } catch (e) {
    response
      .status(400)
      .send({message: 'Your attempt to create a movie failed.'});
  }
}

async function updateMovie (movieModel, formatModel, request, response) {
  const { id } = request.params;
  const {title, releaseDate, director, formats} = request.body;

  try {
    const movie = await movieModel.findById(
      id,
      movieSelectOptions);
    // makes sure the authenticated user own the movie
    if (request.user.id !== movie.get('UserId')) {
      return response
        .status(403)
        .send({message: `You are not allowed to update this content`});
    }

    const formatInstances = await getFormatInstanceFromRequest(formatModel, formats);

    // use an array of IDs to ease the search
    const movieInstanceFormatIDs = movie.get('formats').map(format => {
      return format.id;
    });
    // iterate over request formats to add the missing ones
    formatInstances.forEach(format => {
      if (!movieInstanceFormatIDs.includes(format.id)) {
        movie.addFormat(format);
      }
    });

    // iterate over movie formats to remove formats if needed
    const requestFormatIDs = formats.map(format => {
      return format.id;
    });

    movie.get('formats').forEach(format => {
      if (!requestFormatIDs.includes(format.id)) {
        movie.removeFormat(format);
      }
    });

    await movie.update({
      title,
      releaseDate,
      director
    });

    return response
      .status(200)
      .send(await movieModel.findById(movie.get('id'), movieSelectOptions));
  } catch (e) {
    return response
      .status(500)
      .send({message: `Your attempt to update '${title}' from (${director}) failed.`});
  }
}

async function listMovie (movieModel, userModel, request, response) {
  try {
    const user = await userModel.findById(request.user.id);
    const movies = await movieModel.findAll({
      where: {UserId: user.get('id')},
      ...movieSelectOptions
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

async function getMovie (movieModel, request, response) {
  try {
    const movie = await movieModel.findById(request.params.id, movieSelectOptions);

    // makes sure the authenticated user own the movie
    if (request.user.id !== movie.get('UserId')) {
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

async function getFormatInstanceFromRequest (formatModel, formats) {
  const formatIDs = formats.map(format => {
    return format.id;
  });
  const formatQueryResponse = await formatModel.findAll({where: {id: {[Sequelize.Op.in]: formatIDs}}});

  return formatQueryResponse;
}

export default {
  createMovie,
  listMovie,
  getMovie,
  updateMovie
};
