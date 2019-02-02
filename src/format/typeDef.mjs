import ase from "apollo-server-express";

const typeDef = ase.gql`
  type Format {
    id: ID,
    name: String,
    logo: String
  }
`;

export default typeDef;
