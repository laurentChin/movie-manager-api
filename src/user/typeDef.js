const { gql } = require("apollo-server-express");

const typeDef = gql`
  type User {
    email: String,
    count: Int,
    lastLogin: String,
    movies: [Movie]
  }
`;

module.exports = typeDef;
