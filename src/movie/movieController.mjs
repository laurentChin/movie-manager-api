import fs from "fs";

import { movieSelectOptions } from "../models";
import { deletePoster, handleFile, mapDataValues } from "./helpers";

async function updateMovie(movieModel, formatModel, request, response) {
  const { body, file, params } = request;
  const { id } = params;
  const { title, releaseDate, director, formats } = body;

  try {
    const movie = await movieModel.findById(id, movieSelectOptions);
    // makes sure the authenticated user own the movie
    if (request.user.email !== movie.get("User").get("email")) {
      return response
        .status(403)
        .send({ message: `You are not allowed to update this content` });
    }

    await movie.setFormats([]);
    await movie.setFormats(JSON.parse(formats).map(format => format.id));

    let updatePayload = {
      title,
      releaseDate,
      director
    };

    if (file) {
      if (movie.get("poster")) {
        await deletePoster(movie.get("poster"));
      }

      const poster = await handleFile({
        filename: `${file.originalname}`,
        createReadStream: fs.createReadStream.bind(null, file.path)
      });
      updatePayload.poster = poster;
    }

    await movie.update(updatePayload);

    return response
      .status(200)
      .send(
        mapDataValues(
          await movieModel.findById(movie.get("id"), movieSelectOptions)
        )
      );
  } catch (e) {
    return response.status(500).send({
      message: `Your attempt to update '${title}' from (${director}) failed.`
    });
  }
}

export default {
  updateMovie
};
