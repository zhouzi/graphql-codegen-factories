# graphql-codegen-factories

![](https://img.shields.io/github/license/zhouzi/graphql-codegen-factories?style=for-the-badge) ![](https://img.shields.io/github/workflow/status/zhouzi/graphql-codegen-factories/CI/main?style=for-the-badge) ![](https://img.shields.io/npm/v/graphql-codegen-factories?style=for-the-badge)

`graphql-codegen-factories` is a plugin for [GraphQL Code Generator](https://www.graphql-code-generator.com/) that generates factories based on a GraphQL schema and operations.
Those factories can then be used to create objects that match the schema, for example to mock data in tests or to seed a database.

```graphql
type User {
  id: ID!
  username: String!
}
```

```typescript
export function createUserMock(props: Partial<User>): User {
  return {
    id: "",
    username: "",
    ...props,
  };
}
```

<p style="text-align: center;">

[Documentation](https://gabinaureche.com/graphql-codegen-factories/) · [Examples](https://gabinaureche.com/graphql-codegen-factories/#examples) · [Changelog](./changelog.md) · License: [MIT](./license)

</p>

## Contributors

<a href="https://github.com/zhouzi">
<img src="https://github.com/zhouzi.png?size=50" alt="zhouzi" style="border-radius: 50%;" />
</a>
<a href="https://github.com/ertrzyiks">
<img src="https://github.com/ertrzyiks.png?size=50" alt="ertrzyiks" style="border-radius: 50%;" />
</a>
