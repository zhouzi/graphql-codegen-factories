import { buildSchema } from "graphql";
import { plugin } from "../plugin";

describe("plugin", () => {
  it("should create factories with built-in types", () => {
    const schema = buildSchema(`
      type User {
        id: ID!
        organizationId: ID
        email: String!
        name: String
        age: Int!
        followers: Int
        geo: Geo!
        isUser: Boolean!
        isAdmin: Boolean
        status: UserStatus!
        favouriteFruit: Fruit
        posts: [Post!]!
        subscribers: [User!]
      }

      type Geo {
        lat: Float!
        lon: Float
      }

      type Post {
        id: ID!
      }

      enum UserStatus {
        Activated
        Created
      }

      enum Fruit {
        Pineapple
        Mango
      }
    `);
    expect(plugin(schema, [], {})).toMatchSnapshot();
  });

  it("should use enums as types", () => {
    const schema = buildSchema(`
      type User {
        status: UserStatus!
      }

      enum UserStatus {
        Activated
        Created
      }
    `);
    expect(plugin(schema, [], { enumsAsTypes: true })).toMatchSnapshot();
  });

  it("should use the custom scalar defaults", () => {
    const schema = buildSchema(`
      type User {
        createdAt: Date!
      }
      
      scalar Date
    `);
    expect(
      plugin(schema, [], {
        scalarDefaults: {
          Date: "new Date()",
        },
      })
    ).toMatchSnapshot();
  });

  it("should create factories for inputs", () => {
    const schema = buildSchema(`
      input PostInput {
        id: ID
        title: String!
      }
    `);
    expect(plugin(schema, [], {})).toMatchSnapshot();
  });

  it("should not create factories for Query and Mutation", () => {
    const schema = buildSchema(`
      type User {
        id: ID!
      }

      type Query {
        users: [User!]!
      }

      type Mutation {
        createUser(id: ID!): User!
      }
    `);
    expect(plugin(schema, [], {})).toMatchSnapshot();
  });

  it("should customize the factory name", () => {
    const schema = buildSchema(`
      type User {
        id: ID!
      }
    `);
    expect(
      plugin(schema, [], {
        factoryName: "new{Type}",
      })
    ).toMatchSnapshot();
  });
});
