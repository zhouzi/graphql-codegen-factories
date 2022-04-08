import { buildSchema, parse, FragmentDefinitionNode } from "graphql";
import { plugin } from "../plugin";

describe("plugin", () => {
  it("should generate factory for a simple operation", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        username: String!
      }

      type Mutation {
        createUser(username: String): User!
      }
    `);
    const ast = parse(/* GraphQL */ `
      mutation CreateUser($username: String) {
        createUser(username: $username) {
          id
          username
        }
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "CreateUser.graphql", document: ast }],
      {}
    );
    expect(output).toMatchSnapshot();
  });

  it("should support aliases", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        username: String!
      }

      type Mutation {
        createUser(username: String): User!
      }
    `);
    const ast = parse(/* GraphQL */ `
      mutation CreateUser($username: String) {
        createUser(username: $username) {
          id
          email: username
        }
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "CreateUser.graphql", document: ast }],
      {}
    );
    expect(output).toMatchSnapshot();
  });

  it("should ignore the namespace for the operations types", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        username: String!
      }

      type Mutation {
        createUser(username: String): User!
      }
    `);
    const ast = parse(/* GraphQL */ `
      mutation CreateUser($username: String) {
        createUser(username: $username) {
          id
          username
        }
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "CreateUser.graphql", document: ast }],
      { namespacedImportName: "types.ts" }
    );
    expect(output).toMatchSnapshot();
  });

  it("should support fragments", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        username: String!
      }

      type Query {
        me: User!
      }
    `);
    const ast = parse(/* GraphQL */ `
      query GetMe {
        me {
          ...UserFragment
        }
      }
      fragment UserFragment on User {
        id
        username
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "GetMe.graphql", document: ast }],
      {}
    );
    expect(output).toMatchSnapshot();
  });

  it("should support external fragments", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        username: String!
      }

      type Query {
        me: User!
      }
    `);

    const externalFragment = parse(/* GraphQL */ `
      fragment UserFragment on User {
        id
        username
      }
    `).definitions[0] as unknown as FragmentDefinitionNode;

    const ast = parse(/* GraphQL */ `
      query GetMe {
        me {
          ...UserFragment
        }
      }
    `);

    console.log({
      externalFragment
    })

    const output = await plugin(
      schema,
      [{ location: "GetMe.graphql", document: ast }],
      {
        externalFragments: [
          {
            node: externalFragment,
            name: externalFragment.name.value,
            onType: externalFragment.typeCondition.name.value,
            isExternal: true,
          }
        ]
      }
    );
    expect(output).toMatchSnapshot();
  })

  it("should support unnamed operations", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        username: String!
      }

      type Query {
        me: User
      }
    `);
    const ast = parse(/* GraphQL */ `
      query {
        me {
          id
          username
        }
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "GetMe.graphql", document: ast }],
      {}
    );
    expect(output).toMatchSnapshot();
  });

  it("should support lists", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        username: String!
      }

      type Query {
        users: [User!]!
      }
    `);
    const ast = parse(/* GraphQL */ `
      query GetUsers {
        users {
          id
          username
        }
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "GetUsers.graphql", document: ast }],
      {}
    );
    expect(output).toMatchSnapshot();
  });
});
