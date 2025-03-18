#!/usr/bin/env bash

cd `dirname $0`/..
nodejs bin/sanitycheck.js || exit 1

echo "Sanity check passed."

echo "Finding app dates..."

# Create list of:
#   appid,created_time,modified_time
cd apps
for appfolder in *; do
  echo "$appfolder,$(git log --follow --format=%ai -- $appfolder | tail -n 1),$(git log --follow --format=%ai -- $appfolder | head -n 1)" ; 
done | grep -v _example_ | grep -v unknown.png > ../appdates.csv
cd ..

echo "Ready to publish"
