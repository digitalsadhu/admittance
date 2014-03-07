#!/bin/bash

./node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec ./test &&
cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js &&
rm -rf ./coverage;
