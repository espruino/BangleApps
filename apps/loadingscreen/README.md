# Loading Screen Settings

This app allows you to choose the loading screen that's displayed when swapping between apps on Bangle.js.

## Usage

Go to the Launcher, then `Settings`, then `Apps` and click on `Loading Screen` - you can then click to choose the loading screen you'll see.

## Internals

When reloading an app (fast load doesn't display anything), Bangle.js looks for a file called `.loading` (in versions 2v18+)  which should be
an image. If it doesn't exist, the default `Loading...` screen is displayed. If it does exist and is less than 3 bytes long,
nothing is displayed, or if it's an image it is displayed, centered.

This app sets that image file accordingly, but you can always upload your own file.