#!/usr/bin/env bash

cd `dirname $0`/..
ls tests/*.js | xargs -I{} bin/runtest.sh {}
