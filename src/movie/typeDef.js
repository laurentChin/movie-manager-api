const ase = require("apollo-server-express");

const typeDef = ase.gql`
  type Movie {
    id: ID,
    title: String,
    direction: String,
    releaseDate: String,
    poster: String,
    formats: [Format]
  }

  type ExplorationResult {
    title: String,
    releaseDate: String,
    direction: String,
    poster: String
  }
`;

module.exports = typeDef;
