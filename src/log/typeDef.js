const ase = require("apollo-server-express");

const typeDef = ase.gql`
  type Log {
    id: ID,
    action: String,
    model: String,
    payload: String,
    createdAt: String
  }
`;

module.exports = typeDef;
