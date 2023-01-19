# Changelog

## Unreleased

## 1.1.0 - 2023-01-19

### Added

- Add `maybeValueDefault` option to customize the nullable fields' default value
- Add `inputMaybeValueDefault` option to customize the nullable inputs' fields' default value
- Add `disableDescriptions` option to toggle on/off objects and inputs' description added above the factory functions

## Changed

- Add objects' and inputs' description above the factory functions

## 1.0.0 - 2022-05-07

### Added

- Add a plugin that generates factories for operations

### Changed

- Add default value for factories overrides

## 1.0.0-beta.4 - 2022-04-24

### Added

- Add support for unions
- Generate factories for the root types: Query, Mutation and Subscription
- Generate factories for operations and each of their selections

## 1.0.0-beta.3 - 2022-04-11

### Fixed

- Fix support for external fragments

## 1.0.0-beta.2 - 2022-03-27

### Fixed

- Fix support for unnamed operations
- Fix support for lists and nullable fields
- Fix fragments support by stripping them from the output
- Fix support for aliased primitive fields

## 1.0.0-beta.1 - 2022-03-26

### Added

- Add the `graphql-codegen-factories/operations` entry point to generate factories for operations

### Fixed

- Fix the factories output when the schema has directives

## 1.0.0-beta.0 - 2022-02-22

### Added

- Add `config.typesPath` to generate the factories in a different file than the types
- Add `config.importTypesNamespace` to customize the name of the import namespace

### Removed

- Upgrade dependencies and drop support for Node 10 in the process

## 0.0.10 - 2021-04-08

### Added

- Add support for interfaces default value generation

## 0.0.9 - 2021-04-06

### Added

- Add support for unions default value generation

## 0.0.8 - 2021-01-20

### Fixed

- Fix default value generation for enums that contain an underscore in their name
