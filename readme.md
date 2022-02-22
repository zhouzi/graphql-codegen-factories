# graphql-codegen-factories

graphql-codegen plugin to generate factories.

Heavily inspired by [@homebound-team/graphql-typescript-factories](https://github.com/homebound-team/graphql-typescript-factories/) 🙌

## Example

This plugin generates factory functions that can be used to create objects matching your GraphQL types.
Let's say you have the following schema:

```
type Author {
  id: ID!
  email: String!
  name: String
}
```

This plugin will generate the following function:

```typescript
export function createAuthorMock(props: Partial<Author>): Author {
  return {
    __typename: "Author",
    id: "",
    email: "",
    name: null,
    ...props,
  };
}
```

Which can be used to mock objects in your tests.
Note that it assumes you are using the TypeScript plugin.

Feel free to ping me and/or open a pull request if you would like to use this plugin without TypeScript or with something else.

## Usage

Install the plugin:

```sh
npm install --save-dev graphql-codegen-factories
```

Add it to your `codegen.yml` configuration file:

```yml
overwrite: true
schema: ./schema.graphql
generates:
  ./types.ts:
    plugins:
      - typescript
      - graphql-codegen-factories
```

## Documentation

- [`config.factoryName`](#configfactoryName)
- [`config.scalarDefaults`](#configscalarDefaults)
- [`config.typesPath`](#typesPath)
- [`config.importTypesNamespace`](#importTypesNamespace)

### `config.factoryName`

By default, this plugin generates factories named `create{Type}Mock`.
So for a type `Author`, the corresponding factory will be named `createAuthorMock`.

Here's an example of how you can change that to `newAuthor`:

```yml
overwrite: true
schema: ./schema.graphql
generates:
  ./types.ts:
    plugins:
      - typescript
      - graphql-codegen-factories
    config:
      factoryName: new{Type}
```

### `config.scalarDefaults`

This plugin is able to provide useful defaults for the built-in scalars but it falls short for your custom ones.
In this case, you will have to provide the plugin the desired default value.

For example, let's say you have declared a `scalar Date`, here's how you can provide the default value to be used when the plugin finds it:

```yml
overwrite: true
schema: ./schema.graphql
generates:
  ./types.ts:
    plugins:
      - typescript
      - graphql-codegen-factories
    config:
      scalarDefaults:
        Date: new Date()
```

Note that you can also override the default values for the built-in scalars.
For example, this plugin defaults `Boolean` to `false` but you can change the default to `true` as follows:

```yml
overwrite: true
schema: ./schema.graphql
generates:
  ./types.ts:
    plugins:
      - typescript
      - graphql-codegen-factories
    config:
      scalarDefaults:
        Boolean: true
```

### `config.typesPath`

By default the generated factories assume that the types are in the same file. If you want to have separate files, for example `types.ts` with the types and `factories.ts` for the factories, you need to provide the path to `config.typesPath`.

```yml
overwrite: true
schema: ./schema.graphql
generates:
  ./types.ts:
    plugins:
      - typescript
  ./factories.ts:
    plugins:
      - graphql-codegen-factories
    config:
      typesPath: ./types
```

### `config.importTypesNamespace`

With `config.typesPath`, an import statement is preprended to the factories file:

```typescript
import * as Types from "./types";
```

By default types are imported as `Types` but you can customize it by providing another name to `config.importTypesNamespace`.

```yml
overwrite: true
schema: ./schema.graphql
generates:
  ./types.ts:
    plugins:
      - typescript
  ./factories.ts:
    plugins:
      - graphql-codegen-factories
    config:
      typesPath: ./types
      importTypesNamespace: SharedTypes
```

## Changelog

[Changelog](./changelog.md)

## LICENSE

[MIT](./license)
