#!/bin/bash
# ================================================================
# apps.json used to contain the metadata for every app. Now the
# metadata is stored in each apps's directory - app/yourapp/metadata.js
#
# The app loader still wants all the data in one file, so normally
# with GitHub pages, Jekyll is automatically run and creates a working
# apps.json
#
# However if you're hosting locally, or not on GitHub pages then you
# will want to create apps.json yourself. You can do that by installing
# and running Jekyll, OR the easier option is just to run this script.
#
# If you do this, please do not attempt to commit your modified
# apps.json back into the main BangleApps repository!

cd `dirname $0`/..
echo "[" > apps.json
for app in apps/*/; do 
  echo "Processing $app..."; 
  if [[ "$app" =~ ^apps/_example.* ]]; then
    echo "Ignoring $app"
  else
    cat ${app}metadata.json >> apps.json
#    echo ",\"$app\"," >> apps.json # DEBUG ONLY
    echo "," >> apps.json
  fi
done
echo "null]" >> apps.json
