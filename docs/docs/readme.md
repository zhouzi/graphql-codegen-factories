---
sidebar_position: 1
---

# Introduction

`graphql-codegen-factories` is a set of plugins for [GraphQL Code Generator](https://www.graphql-code-generator.com/). It automatically generates factories based on a GraphQL schema and/or operations.

![](../../example.png)

## Examples

- Demo: [Code](./packages/demo) / [Open in StackBlitz](https://stackblitz.com/github/zhouzi/graphql-codegen-factories/blob/main/packages/demo?file=/src/schema.graphql)

## How to

<details>
<summary>How can I use it with <code>near-operation-file-preset</code>?</summary>

By default the plugin only generates factories based on the schema. To generate factories for operations, you need to use the `graphql-codegen-factories/operations` entry point.

```yml
overwrite: true
schema: ./schema.graphql
documents: ./src/**/*.graphql
generates:
  ./src/types.ts:
    plugins:
      - typescript
      - graphql-codegen-factories
  ./src/:
    preset: near-operation-file
    presetConfig:
      extension: .generated.ts
      baseTypesPath: types.ts
    plugins:
      - typescript-operations
      - graphql-codegen-factories/operations
```

</details>
