#!/usr/bin/env bash
for directory in examples/*/; do
  if [[ $1 = "" || "$directory" == *$1* ]]; then
    cd "./$directory"
    npm install
    npm run generate
    cd -
  fi
done
