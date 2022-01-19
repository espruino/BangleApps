#!/bin/bash

cd `dirname $0`/..
echo "[" > apps.json
for app in apps/*/; do 
  echo "Processing $app..."; 
  if [[ "$app" =~ ^apps/_example.* ]]; then
    echo "Ignoring $app"
  else
    cat ${app}metadata.json >> apps.json
    echo ",\"$app\"," >> apps.json
  fi
done
echo "null]" >> apps.json
