import { buildSchema, parse, FragmentDefinitionNode, Kind } from "graphql";
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

  it("should support inline fragments", async () => {
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
          ... on User {
            id
            username
          }
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

    const fragments = parse(/* GraphQL */ `
      fragment UserFragment on User {
        id
        username
      }
    `);

    const allFragments = fragments.definitions.filter(
      (d) => d.kind === Kind.FRAGMENT_DEFINITION
    ) as FragmentDefinitionNode[];

    const externalFragments = allFragments.map((frag) => ({
      isExternal: true,
      importFrom: frag.name.value,
      name: frag.name.value,
      onType: frag.typeCondition.name.value,
      node: frag,
    }));

    const ast = parse(/* GraphQL */ `
      query GetMe {
        me {
          ...UserFragment
        }
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "GetMe.graphql", document: ast }],
      {
        externalFragments,
      }
    );
    expect(output).toMatchSnapshot();
  });

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

  it("should support nested selections", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        username: String!
        followers: [User]
      }

      type Query {
        me: User
      }
    `);
    const ast = parse(/* GraphQL */ `
      query GetMe {
        me {
          id
          username
          followers {
            id
          }
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

  it.only("should support unions", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type ImageDimensions {
        width: Int!
        height: Int!
      }

      type Image {
        src: String!
        dimensions: ImageDimensions
      }

      type Video {
        href: String!
        dimensions: ImageDimensions
      }

      union Media = Image | Video

      type Query {
        medias: [Media!]!
      }
    `);
    const ast = parse(/* GraphQL */ `
      query GetMedias {
        medias {
          ... on Image {
            src
            dimensions {
              width
            }
          }
          ... on Video {
            href
            dimensions {
              height
            }
          }
        }
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "GetMedias.graphql", document: ast }],
      {}
    );
    expect(output).toMatchSnapshot();
  });
});
