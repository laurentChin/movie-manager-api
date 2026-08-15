const gql = require("graphql-tag");

module.exports = gql`
  type LoginResult {
    jwt: String
    user: User
  }
`;
