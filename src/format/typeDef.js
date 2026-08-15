const gql = require("graphql-tag");

const typeDef = gql`
  type Format {
    id: ID
    name: String
    logo: String
  }
`;

module.exports = typeDef;
