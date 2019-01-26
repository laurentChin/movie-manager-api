import ase from "apollo-server-express";

import { typeDef as userTypeDef } from "../user";
import { typeDef as movieTypeDef } from "../movie";
import { typeDef as securityTypeDef } from "../security";

export default ase.gql`
  ${userTypeDef}
  ${movieTypeDef}
  ${securityTypeDef}

  type Query {
    getUser(email: String): User
    login(email: String, password: String): LoginResult
  }
  type Mutation {
    addUser(email: String, password: String): User
    validateToken(token: String): User
  }
`;
