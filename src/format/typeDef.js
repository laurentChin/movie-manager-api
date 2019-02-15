const ase = require("apollo-server-express");

const typeDef = ase.gql`
  type Format {
    id: ID,
    name: String,
    logo: String
  }
`;

module.exports = typeDef;
