# Fast Reset

Reset the watch to the clock face by pressing the hardware button just a little bit longer than a click. If 'Fastload Utils' is installed this will typically be done with fastloading. A buzz acts as indicator.

Fast Reset was developed with the app history feature of 'Fastload Utils' in mind. If many apps are in the history stack, the user may want a fast way to exit directly to the clock face without using the firmwares reset function.

## Usage

Just install and it will run as boot code.

## Features

If 'Fastload Utils' is installed fastloading will be used when possible. Otherwise a standard `load(.bootcde)` is used.

If the hardware button is held for longer the standard reset functionality of the firmware is executed as well. And eventually the watchdog will be kicked.

## Controls

Press the hardware button just a little longer than a click to feel the buzz, loading the clock face.

## Requests

Mention @[thyttan](https://github.com/thyttan) in an issue to the official [BangleApps repository](https://github.com/espruino/BangleApps/issues) for feature requests and bug reports.

## Acknowledgements

<a target="_blank" href="https://icons8.com/icon/15165/rewind">Rewind</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>

## Creator

[thyttan](https://github.com/thyttan)

