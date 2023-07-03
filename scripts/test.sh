#!/bin/sh
mkdir -p .test
mkdir -p .coverage
clarinet run --allow-write ext/generate-tests.ts
clarinet test --coverage .coverage/lcov.info .test
