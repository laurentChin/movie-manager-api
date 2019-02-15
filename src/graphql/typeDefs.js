const { gql } = require("apollo-server-express");

const { typeDef: userTypeDef } = require("../user");
const { typeDef: movieTypeDef } = require("../movie");
const { typeDef: securityTypeDef } = require("../security");
const { typeDef: formatTypeDef } = require("../format");

const typeDefs = gql`
  ${userTypeDef}
  ${movieTypeDef}
  ${securityTypeDef}
  ${formatTypeDef}

  type Query {
    getUser(email: String): User
    login(email: String, password: String): LoginResult
    movies(offset: Int, limit: Int): [Movie]
    search(terms: String): [Movie]
    explore(terms: String): [ExplorationResult]
  }
  type Mutation {
    addUser(email: String, password: String): User
    validateToken(token: String): User
    addMovie(title: String, director: String, releaseDate: String, poster: Upload, formats: [ID]): Movie
    updateMovie(id: ID, title: String, director: String, releaseDate: String, poster: Upload, formats: [ID]): Movie
    deleteMovie(id: ID): Movie
  }
`;

module.exports = typeDefs;
