#!/bin/bash
cd `dirname $0`/..
find apps -name metadata.json | xargs -I {} grep '\["BANGLEJS"\]' -A 100 -B 100 {}
