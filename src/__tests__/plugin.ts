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

    const { content } = await plugin(schema, [], {});
    expect(content).toMatchSnapshot();
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

    const { content } = await plugin(schema, [], { enumsAsTypes: true });
    expect(content).toMatchSnapshot();
  });

  it("should use the custom scalar defaults", async () => {
    const schema = buildSchema(`
      type User {
        createdAt: Date!
      }
      
      scalar Date
    `);

    const { content } = await plugin(schema, [], {
      scalarDefaults: { Date: "new Date()" },
    });
    expect(content).toMatchSnapshot();
  });

  it("should create factories for inputs", async () => {
    const schema = buildSchema(`
      input PostInput {
        id: ID
        title: String!
      }
    `);

    const { content } = await plugin(schema, [], {});
    expect(content).toMatchSnapshot();
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

    const { content } = await plugin(schema, [], {});
    expect(content).toMatchSnapshot();
  });

  it("should customize the factory name", async () => {
    const schema = buildSchema(`
      type User {
        id: ID!
      }
    `);

    const { content } = await plugin(schema, [], { factoryName: "new{Type}" });
    expect(content).toMatchSnapshot();
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

    const { content } = await plugin(schema, [], {});
    expect(content).toMatchSnapshot();
  });
});
