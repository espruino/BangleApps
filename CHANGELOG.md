App Loader ChangeLog
====================

Changed for individual apps are listed in `apps/appname/ChangeLog`

* `Remove All Apps` now doesn't perform a reset before erase - fixes inability to update firmware if settings are wrong
* Added optional `README.md` file for apps
* Remove 2v04 version warning, add links in About to official/developer versions
* Fix issue removing an app that was just installed (fix #253)
* Add `Favourite` functionality
* Version number now clickable even when you're at the latest version (fix #291)
* Rewrite 'getInstalledApps' to minimize RAM usage
* Added code to handle Settings
* Added espruinotools.js for pretokenisation
* Included image and compression tools in repo
* Added better upload of large files (incl. compression)
