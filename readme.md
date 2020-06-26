# graphql-codegen-factories

graphql-codegen plugin to generate factories

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

## LICENSE

[MIT](./license)
