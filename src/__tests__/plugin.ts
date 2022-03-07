import { buildSchema } from "graphql";
import { plugin } from "../plugin";

describe("plugin", () => {
  it("should create factories with built-in types", async () => {
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

    const output = await plugin(schema, [], {});
    expect(output).toMatchSnapshot();
  });

  it("should use enums as types", async () => {
    const schema = buildSchema(`
      type User {
        status: UserStatus!
      }

      enum UserStatus {
        Activated
        Created
      }
    `);

    const output = await plugin(schema, [], { enumsAsTypes: true });
    expect(output).toMatchSnapshot();
  });

  it("should use the custom scalar defaults", async () => {
    const schema = buildSchema(`
      type User {
        createdAt: Date!
      }
      
      scalar Date
    `);

    const output = await plugin(schema, [], {
      scalarDefaults: { Date: "new Date()" },
    });
    expect(output).toMatchSnapshot();
  });

  it("should create factories for inputs", async () => {
    const schema = buildSchema(`
      input PostInput {
        id: ID
        title: String!
      }
    `);

    const output = await plugin(schema, [], {});
    expect(output).toMatchSnapshot();
  });

  it("should not create factories for Query and Mutation", async () => {
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

    const output = await plugin(schema, [], {});
    expect(output).toMatchSnapshot();
  });

  it("should customize the factory name", async () => {
    const schema = buildSchema(`
      type User {
        id: ID!
      }
    `);

    const output = await plugin(schema, [], { factoryName: "new{Type}" });
    expect(output).toMatchSnapshot();
  });

  it("should support enums with an underscore", async () => {
    const schema = buildSchema(`
      enum UserRole {
        SUPER_ADMIN
        ADMIN
      }
      type User {
        role: UserRole!
      }
    `);

    const output = await plugin(schema, [], {});
    expect(output).toMatchSnapshot();
  });

  it("should import types from other file", async () => {
    const schema = buildSchema(`
      type User {
        id: ID!
      }
    `);

    const output = await plugin(schema, [], {
      typesPath: "./types.ts",
      importTypesNamespace: "SharedTypes",
    });
    expect(output).toMatchSnapshot();
  });
});
