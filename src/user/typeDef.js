const gql = require("graphql-tag");

const typeDef = gql`
  type User {
    email: String
    count: Int
    lastLogin: String
    movies: [Movie]
  }
`;

module.exports = typeDef;
