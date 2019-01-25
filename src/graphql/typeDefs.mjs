import ase from "apollo-server-express";

import { typeDef as userTypeDef } from "../user";
import { typeDef as movieTypeDef } from "../movie";

export default ase.gql`
  ${userTypeDef}
  ${movieTypeDef}
  type Query {
    getUser(email: String): User
  }
  type Mutation {
    addUser(email: String, password: String): User
  }
`;
