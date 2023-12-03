#!/bin/sh
genhtml lcov.info --branch-coverage -o .coverage/
open .coverage/index.html
