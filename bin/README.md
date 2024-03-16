BangleApps Utilities
====================

* `sanitycheck.js` - this is run as a CI check (or when `npm test` is used) and checks for common issues with apps or their `metadata.json`
* `create_apps_json.sh` - create the `apps.json` file - this is an aggregation of all `metadata.json` files and is used to speed up loading of BangleApps (or where the server it is hosted on doesn't support directory listing)
* `find_banglejs1_only_apps.sh` - show apps that only work on Bangle.js 1 (and not 2)
* `firmwaremaker_c.js` - create the binary blob needed for the Bangle.js firmware (containing default apps)
* `pre-publish.sh` - this is run before we publish to https://banglejs.com/apps/ - it works out how recently all the apps were updated and writes it to `appdates.csv`
* `font_creator.js` - creates PBF-format fonts for font libraries like `apps/fontsall`

**You should also check out https://github.com/espruino/EspruinoAppLoaderCore/tree/master/tools** (available in `core/tools` in this repo) - this contains tools for handling languages, as well as a command-line based app loader

Related to Linting code:

* `bulk-update-apps.mjs` - use this script to bump the version of many apps with the same changes
* `exempt-lint.mjs` - exempt an app file from a specific eslint rule
* `sync-lint-exemptions.mjs` - Run this to ensure that the lint exemptions are all valid. If any of the exempt app files have been changed, this script will remove the exemption for that file.

Prototypes:

* `runapptests.js` - **PROTOTYPE** - runs tests for apps (where defined) in an emulator so apps can be tested offline
* `thumbnailer.js` - **PROTOTYPE** - runs all apps in an emulator and automatically outputs thumbnails for them

Legacy:

* `firmwaremaker.js` - **LEGACY** create a JS file  containing all the commands needed to write firmware to a Bangle. Was used for Bangle.js 1 factory programming
