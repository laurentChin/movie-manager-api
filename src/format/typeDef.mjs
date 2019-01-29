import ase from "apollo-server-express";

const typeDef = ase.gql`
  type Format {
    id: ID,
    name: String
  }
`;

export default typeDef;
