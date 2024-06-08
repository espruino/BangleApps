# Snappy Button (BETA)

Make your Bangle.js 2 watch react quicker when you press the hardware button.

## Usage

Just install it from the app loader to enable the behaviour on your watch.

## Features

The Bangle.js 2 often reacts at first when the hardware button is released. **Snappy Button** changes this so it reacts as soon as the button is pressed down.

When installed the app highjacks the `setWatch` function and changes the `edge` option from `"falling"` to `"rising"`.

Snappy button can be incompatible with some apps **(breaking them!)** that uses long presses of the hardware button. This is worked around by hardcoding Snappy Button to not interfere with these apps. **Please if you encounter problems report them as per below!**

## TODO

- Disable for more incompatible apps as they are found.
- Enable for Bangle.js 1? **Help with testing needed!**

## Requests

Mention @thyttan in an issue on the espruino/BangleApps repository if you encounter problems or have an idea for improving Snappy Button.

Pull requests always welcome!

This app was proposed on the espruino/BangleApps repository: [Discussion: HW buttons should act on 'rising' edge](https://github.com/espruino/BangleApps/issues/3435) .

## Creator

gfwilliams, thyttan
