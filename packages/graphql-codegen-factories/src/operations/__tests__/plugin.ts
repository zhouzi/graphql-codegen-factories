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
      { schemaFactoriesPath: "./factories" }
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
      { schemaFactoriesPath: "./factories" }
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
      { schemaFactoriesPath: "./factories" }
    );
    expect(output).toMatchSnapshot();
  });

  it("should merge fragments with the same type condition", async () => {
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
          ...UserIDFragment
          ...UserUsernameFragment
        }
      }
      fragment UserIDFragment on User {
        id
      }
      fragment UserUsernameFragment on User {
        username
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "GetMe.graphql", document: ast }],
      { schemaFactoriesPath: "./factories" }
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
      { schemaFactoriesPath: "./factories" }
    );
    expect(output).toMatchSnapshot();
  });

  it("should merge inline fragments with the same type condition", async () => {
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
          }
          ... on User {
            username
          }
        }
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "GetMe.graphql", document: ast }],
      { schemaFactoriesPath: "./factories" }
    );
    expect(output).toMatchSnapshot();
  });

  it("should unwrap inline fragments without a type condition", async () => {
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
          ... {
            id
            ... {
              username
            }
          }
        }
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "GetMe.graphql", document: ast }],
      { schemaFactoriesPath: "./factories" }
    );
    expect(output).toMatchSnapshot();
  });

  it("should merge fragments and inline fragments with the same type condition", async () => {
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
          }
          ...UserUsernameFragment
        }
      }
      fragment UserUsernameFragment on User {
        username
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "GetMe.graphql", document: ast }],
      { schemaFactoriesPath: "./factories" }
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
        schemaFactoriesPath: "./factories",
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
      { schemaFactoriesPath: "./factories" }
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
      { schemaFactoriesPath: "./factories" }
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
      { schemaFactoriesPath: "./factories" }
    );
    expect(output).toMatchSnapshot();
  });

  it("should support unions", async () => {
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
      { schemaFactoriesPath: "./factories" }
    );
    expect(output).toMatchSnapshot();
  });

  it("should add interface's selections to the matching types", async () => {
    const schema = buildSchema(/* GraphQL */ `
      interface File {
        path: String!
      }

      type Image implements File {
        path: String!
        width: Int!
        height: Int!
      }

      type Audio implements File {
        path: String!
        length: Int!
      }

      interface Streamable {
        url: String!
      }

      type Video implements Streamable {
        url: String!
        length: Int!
      }

      union Media = Image | Audio | Video

      type Query {
        medias: [Media!]!
      }
    `);
    const ast = parse(/* GraphQL */ `
      query GetMedias {
        medias {
          ... on File {
            path
          }
          ... on Streamable {
            url
          }
          ... on Image {
            width
          }
          ... on Audio {
            length
          }
          ... on Video {
            length
          }
        }
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "GetMedias.graphql", document: ast }],
      { schemaFactoriesPath: "./factories" }
    );
    expect(output).toMatchSnapshot();
  });

  it("should dedupe fields", async () => {
    const schema = buildSchema(/* GraphQL */ `
      interface Node {
        id: ID!
      }

      type User implements Node {
        id: ID!
        username: String!
      }

      type Admin implements Node {
        id: ID!
        canDeleteUser: Boolean!
      }

      union Me = User | Admin

      type Query {
        me: Me
      }
    `);
    const ast = parse(/* GraphQL */ `
      query GetMe {
        me {
          ... on Node {
            id
          }
          ... on User {
            ...UserFragment
            id
            userId: id
            username
          }
          ... on Admin {
            id
          }
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
      { schemaFactoriesPath: "./factories" }
    );
    expect(output).toMatchSnapshot();
  });

  it("should generate union factory even when querying one type from the union", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Image {
        width: Int!
        height: Int!
      }

      type Audio {
        length: Int!
      }

      union Media = Image | Audio

      type Query {
        medias: [Media!]!
      }
    `);
    const ast = parse(/* GraphQL */ `
      query GetMedias {
        medias {
          ... on Audio {
            length
          }
        }
      }
    `);

    const output = await plugin(
      schema,
      [{ location: "GetMedias.graphql", document: ast }],
      { schemaFactoriesPath: "./factories" }
    );
    expect(output).toMatchSnapshot();
  });
});
