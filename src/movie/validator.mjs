function isValid (movie) {
  if (!movie.hasOwnProperty('title') || !movie.hasOwnProperty('releaseDate') || !movie.hasOwnProperty('director')) {
    return false;
  }

  if (!/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}/.test(movie.releaseDate)) {
    return false;
  }

  return true;
}

export default {
  isValid
};
