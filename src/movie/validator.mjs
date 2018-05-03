function validate (movie) {
  if (!movie.hasOwnProperty('title')) {
    return false;
  }

  if (movie.hasOwnProperty('releaseDate') && !/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}/.test(movie.releaseDate)) {
      return false;
  }

  return true;
}

export default {
  validate
};
