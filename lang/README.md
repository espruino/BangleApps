Localisation
=============

Any apps which have Strings in which are prefixed with `/*LANG*/` will be scanned, and if the
language is set in the app loader the string will be replaced with a translation from the JSON
in this directory.

See https://www.espruino.com/Bangle.js+Locale#app-translations for more information.

JSON in `unicode-based` contains characters that can't be rendered by the default font
in Bangle.js. The `language_render.js` tool (below) renders the text to bitmaps and then
writes them into the corresponding JSON file in this directory, so that the bitmaps (rather than
just text) are included in apps instead.

Check out https://github.com/espruino/EspruinoAppLoaderCore/tree/master/tools (available in `core/tools` in this repo)

* `../core/tools/language_scan.js` - scan for unhandled `/*LANG*/` strings and automatically translate them
* `../core/tools/language_render.js` - renders the JSON translations in the `unicode-based` folder to bitmaps, and writes them into the corresponding JSON file in this directory (see above)
