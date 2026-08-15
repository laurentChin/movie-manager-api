const gql = require("graphql-tag");

const typeDef = gql`
  type Movie {
    id: ID
    title: String
    direction: String
    releaseDate: String
    poster: String
    formats: [Format]
  }

  type ExplorationResult {
    title: String
    releaseDate: String
    direction: String
    poster: String
  }
`;

module.exports = typeDef;
