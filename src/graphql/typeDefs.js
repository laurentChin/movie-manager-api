const { gql } = require("apollo-server-express");

const { typeDef: userTypeDef } = require("../user");
const { typeDef: movieTypeDef } = require("../movie");
const { typeDef: securityTypeDef } = require("../security");
const { typeDef: formatTypeDef } = require("../format");
const { typeDef: logTypeDef } = require("../log");

const typeDefs = gql`
  scalar Upload

  ${userTypeDef}
  ${movieTypeDef}
  ${securityTypeDef}
  ${formatTypeDef}
  ${logTypeDef}

  type Query {
    getUser(email: String): User
    login(email: String, password: String): LoginResult
    movies(offset: Int, limit: Int): [Movie]
    search(terms: String): [Movie]
    explore(terms: String): [ExplorationResult]
    getFormats: [Format]
    logs(createdAt: String): [Log]
  }
  type Mutation {
    addUser(email: String, password: String): User
    validateToken(token: String): User
    addMovie(
      title: String
      direction: String
      releaseDate: String
      poster: Upload
      posterUrl: String
      formats: [ID]
    ): Movie
    updateMovie(
      id: ID
      title: String
      direction: String
      releaseDate: String
      poster: Upload
      posterUrl: String
      formats: [ID]
    ): Movie
    deleteMovie(id: ID): Movie
  }
`;

module.exports = typeDefs;
