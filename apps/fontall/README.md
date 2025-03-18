# Fonts (all languages)

This library provides an international font that can be used to display messages.

The font is the 16px high [GNU Unifont](https://unifoundry.com/unifont/index.html).
All characters from Unicode codepoint 32 up until codepoint 65535 (U+FFFF) are included here,
which should be enough for most languages.

**The font is 2MB and takes a while to upload** - if you don't require all the languages
it provides, consider installing another Font library like [extended fonts](https://banglejs.com/apps/?id=fontsext)
that contains just the characters you need instead.

## Usage

See [the BangleApps README file](https://github.com/espruino/BangleApps/blob/master/README.md#api-reference)
for more information on fonts.


## Recreating font.pbf

* Go to `bin` directory
* Run `./font_creator.js "All" ../apps/fontall/font.pbf`