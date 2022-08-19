# Seaside utility watch

A watch that does just what I want when I am at the seaside.

Very much a work in progress. Requires location to have already been set in mylocation.json using MyLocation app.

DO NOT RELY ON THESE TIDE TIMES! This is in development.

When working, you will set the next tide time (high or low) in application settings, the watch will then calculate approximate next tide time by adding 6 hours and 12 minutes to the tide time and keep doing so until reset.

This may become very unreliable over time and will need periodic realignment.

## Many faults

- [x] app icon invisible 
- [ ] no need to check sunrise and sunset times so often
- [x] default location data doesn't show up in the simulator for some reason


## Many of the to-dos

- [x] add sun image to main screen
- [x] show alternative data on tap 
- [x] show tide times 
- [ ] write tide data back to json file when flipped to keep it up to date when app reloaded
