#!/usr/bin/env bash
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
#
# You can pass an optional filename to this script, and it will write
# to that instead, apps.local.json is used when opening the loader on localhost
outfile="${1:-apps.json}"

cd `dirname $0`/..
echo "[" > "$outfile"
first=1
for app in apps/*/; do 
  echo "Processing $app..."; 
  if [[ "$app" =~ ^apps/_example.* ]] || [ ! -e "$app/"metadata.json ]; then
    echo "Ignoring $app"
  else
    if [ $first -eq 1 ]; then
      first=0;
    else
      echo "," >> "$outfile"
    fi;
    cat ${app}metadata.json >> "$outfile"
#    echo ",\"$app\"," >> apps.json # DEBUG ONLY
  fi
done
echo "]" >> "$outfile"

if [ -z "$1" ]; then
  # Running with no arguments: prevent accidental commit of modified apps.json.
  # You can use `create_apps.json.sh apps.json` if you really want to both
  # overwrite and still commit apps.json
  git update-index --skip-worktree apps.json
  echo "Told git to ignore modified apps.json."
  # If you want to unignore it, use
  #   'git update-index --no-skip-worktree apps.json'
fi
