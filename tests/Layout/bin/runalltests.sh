#!/bin/bash

cd `dirname $0`
cd ../tests
ls *.js | xargs ../bin/runtest.sh 
