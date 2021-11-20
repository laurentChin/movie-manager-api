function validate(movie) {
  if (!movie.title) {
    return false;
  }

  return !(
    movie.releaseDate &&
    !/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}/.test(movie.releaseDate)
  );
}

module.exports = {
  validate,
};
