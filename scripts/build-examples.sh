#!/usr/bin/env bash
for d in examples/*/ ; do
    npx graphql-codegen --config "./$d/codegen.yml"
done