# Fonts (extended)

This library provides an international font that can be used to display messages.

The font is the 16px high [GNU Unifont](https://unifoundry.com/unifont/index.html).
All characters from Unicode codepoint 32 up until codepoint 1103 (U+044F) are included here,
which should be enough for [around 90% of languages](https://arxiv.org/pdf/1801.07779.pdf#page=5)
but **not** Chinese/Japanese/Korean.

The font is 20kb so is far more sensible than the [2MB all regions](https://banglejs.com/apps/?id=fontsall) font
if you don't require non-latin languages.


https://arxiv.org/pdf/1801.07779.pdf#page=5

## Usage

See [the BangleApps README file](https://github.com/espruino/BangleApps/blob/master/README.md#api-reference)
for more information on fonts.


## Recreating font.pbf

* Go to `bin` directory
* Run `./font_creator.js "Extended" ../apps/fontext/font.pbf`