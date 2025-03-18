Service that allows you to use an app's back button using left to right swipe gesture.

## Settings

Mode: Blacklist/Whitelist/Always On/Disabled
App List: Black-/whitelisted apps
Standard # of swipe handlers: 0-10 (Default: 0, must be changed for backswipe to work at all)
Standard # of drag handlers: 0-10 (Default: 0, must be changed for backswipe to work at all)


Standard # of handlers settings are used to fine tune when backswipe should trigger the back function. E.g. when using a keyboard that works on drags, we don't want the backswipe to trigger when we just wanted to select a letter. This might not be able to cover all cases however.

To get an indication for standard # of handlers `Bangle["#onswipe"]` and `Bangle["#ondrag"]` can be entered in the [Espruino Web IDE](https://www.espruino.com/ide) console field. They return `undefined` if no handler is active, a function if one is active, or a list of functions if multiple are active. Calling this on the clock app is a good start.

## TODO

- Possibly add option to tweak standard # of handlers on per app basis. 

## Creator
Kedlub

## Contributors
thyttan
