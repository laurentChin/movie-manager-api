import ase from "apollo-server-express";

import { typeDef as userTypeDef } from "../user";
import { typeDef as movieTypeDef } from "../movie";
import { typeDef as securityTypeDef } from "../security";
import { typeDef as formatTypeDef } from "../format";

export default ase.gql`
  ${userTypeDef}
  ${movieTypeDef}
  ${securityTypeDef}
  ${formatTypeDef}

  type Query {
    getUser(email: String): User
    login(email: String, password: String): LoginResult
    movies(offset: Int, limit: Int): [Movie]
  }
  type Mutation {
    addUser(email: String, password: String): User
    validateToken(token: String): User
    addMovie(title: String, director: String, releaseDate: String, poster: Upload, formats: [ID]): Movie
    updateMovie(id: ID, title: String, director: String, releaseDate: String, poster: Upload, formats: [ID]): Movie
    deleteMovie(id: ID): Movie
  }
`;
