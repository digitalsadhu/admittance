#!/bin/bash

./node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha -R spec ./test;
