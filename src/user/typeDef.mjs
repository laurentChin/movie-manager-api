import ase from "apollo-server-express";

const typeDef = ase.gql`
  type User {
    email: String,
    movies: [Movie]
  }
`;

export default typeDef;
