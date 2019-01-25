import crypto from "crypto";
import {
  ENCODER_ALGORITHM,
  ENCODER_ITERATION,
  ENCODER_LENGTH
} from "./constants";

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
export default {
  encode
};
