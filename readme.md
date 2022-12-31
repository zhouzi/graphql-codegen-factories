# graphql-codegen-factories

![](https://img.shields.io/github/license/zhouzi/graphql-codegen-factories?style=for-the-badge) ![](https://img.shields.io/github/workflow/status/zhouzi/graphql-codegen-factories/CI/main?style=for-the-badge) ![](https://img.shields.io/npm/v/graphql-codegen-factories?style=for-the-badge)

`graphql-codegen-factories` is a plugin for [GraphQL Code Generator](https://www.graphql-code-generator.com/) that generates factories from a GraphQL schema and operations.
The factories can then be used to mock data, e.g for testing or seeding a database.

For example, given this GraphQL schema:

```graphql
type User {
  id: ID!
  username: String!
}
```

The following factory will be generated:

```typescript
export type User = /* generated by @graphql-codegen/typescript */;

export function createUserMock(props: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: "",
    username: "",
    ...props,
  };
}
```

It is also possible to generate factories from an operation, for example:

```graphql
query GetUser {
  user {
    id
    username
  }
}
```

Will result in the following factories:

```typescript
export type GetUserQuery = /* generated by @graphql-codegen/typescript-operations */;

export function createGetUserQueryMock(props: Partial<GetUserQuery> = {}): GetUserQuery {
  return {
    __typename: "Query",
    user: createGetUserQueryMock_user({}),
    ...props,
  };
}

export function createGetUserQueryMock_user(props: Partial<GetUserQuery["user"]> = {}): GetUserQuery["user"] {
  return {
    __typename: "User",
    id: "",
    username: "",
    ...props,
  };
}
```

You can also use a fake data generator to generate realistic factories such as:

```typescript
import { faker } from "@faker-js/faker";

export function createUserMock(props: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: faker.random.alphaNumeric(16),
    username: faker.lorem.word(),
    ...props,
  };
}
```

- [Documentation](https://gabinaureche.com/graphql-codegen-factories/)
- [Examples](https://github.com/zhouzi/graphql-codegen-factories/tree/main/examples)
  - [Minimal](https://stackblitz.com/github/zhouzi/graphql-codegen-factories/tree/main/examples/minimal)
  - [Usage with near-operation-file-preset](https://stackblitz.com/github/zhouzi/graphql-codegen-factories/tree/main/examples/usage-with-near-operation-file-preset)
  - [Usage with faker](https://stackblitz.com/github/zhouzi/graphql-codegen-factories/tree/main/examples/usage-with-faker)

## Showcase

- [yummy-recipes/yummy](https://github.com/yummy-recipes/yummy)

Are you using this plugin? [Let us know!](https://github.com/zhouzi/graphql-codegen-factories/issues/new)

## Contributors

[![](https://github.com/zhouzi.png?size=50)](https://github.com/zhouzi)
[![](https://github.com/ertrzyiks.png?size=50)](https://github.com/ertrzyiks)
[![](https://github.com/jongbelegen.png?size=50)](https://github.com/jongbelegen)
