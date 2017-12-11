function FacebookAuthError (message) {
  this.name = 'FacebookAuthError';
  this.message = message;
}

FacebookAuthError.prototype = Object.create(Error.prototype);

export default FacebookAuthError;
