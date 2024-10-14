# List of Facts

A list of hundreds of 'facts' from Google Gemini. Provides a `textsource` module that apps can use to query a random fact.

This is designed to be used by clocks that want to display interesting text (like `fact_clock`).

## Usage

In your app's metadata, add `"dependencies" : { "textsource":"module" }`

```JS
require("textsource").getCount() // return how many lines we have
require("textsource").getText(n) // return a numbered line (0..getCount()-1)
require("textsource").getRandomText()
//={ "idx": 312,
//  "txt": "The Sahara Desert is the largest hot desert in the world"
//}
```

## Adding new lists of facts

Different lists of facts could be added to this module, but if you want to add something totally different (a list of Haiku)
it's best to just copy this app, replace the text (see below), but keep the provided filenames of `textsource` the same.

Then users can just install whatever list they want from the app loader and the installed app will automatically
use whichever one is installed.

## Adding new facts

Add then to `facts.txt`, then re-run the code from inside the `getText` function in `lib.js`, paste the base64 code produced in an update the value in `getCount()`
