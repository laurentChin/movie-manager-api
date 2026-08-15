const gql = require("graphql-tag");

const typeDef = gql`
  type Log {
    id: ID
    action: String
    model: String
    payload: String
    createdAt: String
  }
`;

module.exports = typeDef;
