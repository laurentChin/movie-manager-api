const ase  = require("apollo-server-express");

module.exports = ase.gql`
  type LoginResult {
    jwt: String,
    user: User
  }
`;
