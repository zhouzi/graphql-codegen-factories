#!/usr/bin/env bash
for directory in examples/*/ ; do
    if [[ $1 = "" || "$directory" == *$1* ]]; then
        npx graphql-codegen --config "./$directory/codegen.yml"
    fi
done