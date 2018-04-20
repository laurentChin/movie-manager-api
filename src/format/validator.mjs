function validate (format) {
  if (!format.hasOwnProperty('name')) {
    return false;
  }

  return true;
}

export default {
  validate
};
