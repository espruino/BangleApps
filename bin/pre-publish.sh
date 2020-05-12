#!/bin/bash

cd `dirname $0`/..
node bin/sanitycheck.js || exit 1

echo "Sanity check passed."

echo "Finding most recent apps..."

cd apps
for appfolder in *; do
  echo "$(git log --follow --format=%ai $appfolder),$appfolder" | tail -n 1 ; 
done | grep -v _example_ | sort -r > ../recent.csv
cd ..

echo "Ready to publish"
