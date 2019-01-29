import ase from "apollo-server-express";

export default ase.gql`
  type LoginResult {
    jwt: String,
    user: User
  }
`;
