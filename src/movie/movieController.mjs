import fs from 'fs';
import path from 'path';
import util from 'util';

import Sequelize from 'sequelize';
import uuid from 'uuid';

import validator from './validator';
import { movieSelectOptions } from '../models';

async function createMovie (movieModel, userModel, formatModel, request, response) {
  const {body, file} = request;

  // multer doesn't inject a complete JS Object, some prototype functions are missing
  if (!validator.validate(Object.setPrototypeOf(body, {}))) {
    return response
      .status(400)
      .send({message: 'The movie you are trying to create is not valid'});
  }

  try {
    const {title, releaseDate, director, formats} = body;

    let poster = null;
    if (file) {
      poster = await handleFile(file, uuid, fs);
    }

    const user = await userModel.findById(request.user.id);
    let [movie] = await movieModel.findOrCreate({
      where: {
        title,
        releaseDate,
        director,
        UserId: user.get('id'),
        poster
      }
    });

    const formatInstances = formats ? await getFormatInstanceFromRequest(formatModel, JSON.parse(formats)) : [];
    formatInstances.forEach(format => {
      movie.addFormat(format);
    });
    movie = await movie.save();
    response
      .status(201)
      .send(await movieModel.findById(movie.get('id'), movieSelectOptions));
  } catch (e) {
    response
      .status(400)
      .send({message: 'Your attempt to create a movie failed.'});
  }
}

async function updateMovie (movieModel, formatModel, request, response) {
  const { body, file, params } = request;
  const { id } = params;
  const { title, releaseDate, director, formats } = body;

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

    const formatInstances = await getFormatInstanceFromRequest(formatModel, JSON.parse(formats));

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
    const requestFormatIDs = JSON.parse(formats).map(format => {
      return format.id;
    });

    movie.get('formats').forEach(format => {
      if (!requestFormatIDs.includes(format.id)) {
        movie.removeFormat(format);
      }
    });

    let updatePayload = {
      title,
      releaseDate,
      director
    };

    if (file) {
      if (movie.get('poster')) {
        await util.promisify(fs.unlink)(
          movie.get(
            path.join(
              process.env.PWD,
              'public/uploads',
              movie.get('poster')
            )
          )
        );
      }

      const poster = await handleFile(file, uuid, fs);
      updatePayload.poster = poster;
    }

    await movie.update(updatePayload);

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
      order: [
        ['title', 'ASC']
      ],
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

async function deleteMovie (movieModel, request, response) {
  const {id} = request.params;
  try {
    const movie = await movieModel.findById(id);

    // makes sure the authenticated user own the movie
    if (request.user.id !== movie.get('UserId')) {
      return response
        .status(403)
        .send({message: `You are not allowed to delete this movie`});
    }

    if (movie.get('poster')) {
      await util.promisify(fs.unlink)(path.join(process.env.PWD, 'public/uploads', movie.get('poster')));
    }

    const destroyResult = await movie.destroy();
    response
      .status(204)
      .send(destroyResult);
  } catch (e) {
    response
      .status(500)
      .send({message: `Your attempt to delete '${id}' failed.`});
  }
}

async function getFormatInstanceFromRequest (formatModel, formats) {
  const formatIDs = formats.map(format => {
    return format.id;
  });
  const formatQueryResponse = await formatModel.findAll({where: {id: {[Sequelize.Op.in]: formatIDs}}});

  return formatQueryResponse;
}

async function handleFile (file, uuid, fs) {
  const { originalname, path: source } = file;
  const [extension] = /(.[a-z]{2,})$/.exec(originalname);
  const filename = `${uuid.v4()}${extension}`;
  const root = filename.slice(0, 2);
  const sub = filename.slice(2, 4);
  const uploadDir = path.join(process.env.PWD, 'public', 'uploads');
  const access = util.promisify(fs.access);
  const mkdir = util.promisify(fs.mkdir);

  try {
    await access(path.join(uploadDir, root));
  } catch (e) {
    await mkdir(path.join(uploadDir, root));
  }

  try {
    await access(path.join(uploadDir, root, sub));
  } catch (e) {
    await mkdir(path.join(uploadDir, root, sub));
  }

  const readStream = fs.createReadStream(source);
  const writeStream = fs.createWriteStream(path.join(uploadDir, root, sub, filename));
  readStream.pipe(writeStream);

  return path.join(root, sub, filename);
}

export default {
  createMovie,
  listMovie,
  getMovie,
  updateMovie,
  deleteMovie
};
