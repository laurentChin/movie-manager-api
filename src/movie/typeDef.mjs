import ase from "apollo-server-express";

const typeDef = ase.gql`
  type Movie {
    id: ID,
    title: String,
    director: String,
    releaseDate: String,
    poster: String,
    formats: [Format]
  }

  type ExplorationResult {
    title: String,
    releaseDate: String,
    director: String,
    poster: String
  }
`;

export default typeDef;
