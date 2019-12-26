const test = require("ava");
const crypto = require("crypto");

const { passwordEncoder } = require("../../src/security");

test("passwordEncoder.encode must encode the right way", t => {
  const hash = crypto
    .pbkdf2Sync("password", "salt", 1000, 64, "sha512")
    .toString("hex");

  t.plan(1);
  t.is(passwordEncoder.encode("password", "salt"), hash);
});
