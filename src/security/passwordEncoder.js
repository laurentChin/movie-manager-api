const crypto = require("crypto");
const {
  ENCODER_ALGORITHM,
  ENCODER_ITERATION,
  ENCODER_LENGTH
} = require("./constants");

const encode = (password, salt) =>
  crypto
    .pbkdf2Sync(
      password,
      salt,
      ENCODER_ITERATION,
      ENCODER_LENGTH,
      ENCODER_ALGORITHM
    )
    .toString("hex");
module.exports = {
  encode
};
