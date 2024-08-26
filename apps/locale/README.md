Languages (locale)
==================

Country-specific app internationalisation.

This is not an app, but instead it is a library that can be used by
other applications or widgets to provide locale-friendly

- Dates
- Time (12h/24h)
- Days of the Week
- Months
- Distances/Lengths/Speed (metric/imperial)
- Temperature (°C/°F)

Usage
-----

If you're writing an application you can use the `locale` library to
do all the translation for you.

See https://www.espruino.com/Bangle.js+Locale for full examples.

```JS
// Date to date string (long)
>require("locale").date(new Date())
="Donnerstag, 02. April 2020"

// Date to date string (short)
>require("locale").date(new Date(), 1)
="02.04.2020"
```

Bangle.js has a `locale` library built in that is just a standard
British English (`en_GB`) localisation - so you can use `locale`
in your apps without requiring users to have this Language library 
installed.
