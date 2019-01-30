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
`;

export default typeDef;