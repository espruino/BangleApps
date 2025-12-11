# Loading Animation (beta)
This is a test to make the UI feel more responsive and fluid, by adding an animation when loading from the clock to a launcher. This app is still in beta, and is in regards to [this discussion](https://github.com/orgs/espruino/discussions/7871).

This modifies the boot code for `Bangle.load()` function, and first shows a 0.3 second animation of an expanding circle, transitioning smoothly between current and the next loaded app. This takes up minimal battery and processing power.

Give it a try, and tag `@RKBoss6` with any improvements or ideas!

You should see an animation:
* If you have a clock that supports fast-loading
* From a launcher that also supports fast-loading or calls Bangle.load

If you don't see an animation, try using a clock with fast loading, or install fastload utils and see if that works.

## Known bugs
* Memory can run out slightly faster
* A hang will result in a blank screen until the user long-presses the button
## Creator
RKBoss6

