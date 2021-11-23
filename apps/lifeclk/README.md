# Game of Life Clock

Modification of the "Game of Life" ("life") app that also displays the current time, including seconds.

## Usage

Upon launch, the clock loads a randomly generated 27x23 grid of "cells", with a block in the middle showing the time.
Hours and minute are only displayed for 10 generations after launch, reset or after pressing the top button. After 10 generations, the cells that showed the hours and minutes become part of the game of life.

* Top button: Immediately displays hours and minutes, killing any cells underneath the time block.
* Middle button: Shows the launcher. The state of the game is not saved.
* Lower button: Resets the cells, randomly generates new ones.
