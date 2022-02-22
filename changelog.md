# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 - Unreleased

### Added

- Add `config.typesPath` to generate the factories in a different file than the types
- Add `config.importTypesNamespace` to customize the name of the import namespace

### Changed

- Upgrade dependencies and drop support for Node 10 in the process

### Breaking change

## 0.0.10 - 2021-04-08

### Added

- Add support for interfaces default value generation

## 0.0.9 - 2021-04-06

### Added

- Add support for unions default value generation

## 0.0.8 - 2021-01-20

### Fixed

- Fix default value generation for enums that contain an underscore in their name
