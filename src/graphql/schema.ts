import { gql } from 'apollo-server-express';

const typeDefs = gql`
type Query {
    user(address: String!): User
    me: User
}

type Mutation {
    signUp(input: UserInput!): User
    updateMe(input: UserInput!): User
}


type User {
    id: ID! # chainId:address
    chainId: Int!
    address: String!
    username: String
    name: String
    twitter: String
}

input UserInput {
    username: String
    name: String
    twitter: String
}
`;

export default typeDefs;
