QR Code Library
=================

A library that allows a QR code to be rendered on the Bangle.js, directly from a text string.

**NOTE:** This library uses Inline C that is automatically compiled by the Bangle.js App Loader
via a web service on [espruino.com](https://www.espruino.com)

Usage:

```JS
require("libqr").getImage("https://banglejs.com/apps");
```

And add this to your metadata to ensure the library is automatically installed:

```"dependencies" : { "libqr":"module" }
```




