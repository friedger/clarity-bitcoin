#!/bin/sh
mkdir -p .test
mkdir -p .coverage
rm -rf .test/*
cp -r tests .test
clarinet run --allow-write --allow-read ext/generate-tests.ts
clarinet test --coverage .coverage/lcov.info .test
