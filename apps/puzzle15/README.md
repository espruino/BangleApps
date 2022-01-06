# Puzzle15 - A 15-puzzle for the Bangle.js 2

This is a Bangle.js 2 adoption of the famous 15 puzzle.

## The game

A board of _n_ by _n_ fields is filled with _n^2-1_ numbered stones. So, one field, the "gap", is left free.

Bring them in the correct order so that the gap is finally at the bottom right of the playing field.
The less moves you need, the better you are.

If _n_ is 4, the number of stones is _16-1=15_. Hence the name of the game.

## How to play

If you start the game, it shows a splash screen and then generates a shuffled 4x4 board with a 15 puzzle.
Move the stones with drag gestures on the screen.
If you want to move the stone below the gap upward, drag from the bottom of the screen upward.
The drag gestures can be performed anywhere on the screen, there is no need to start or end them on the stone to be moved.

If you managed to order the stones correctly, a success message appears.
You can continue with another game, go to the game's main menu, or quit the game entirely.

There is a grey menu button right of the board containing the well-known three-bar menu symbol ("Hamburger menu").
It opens the game's main menu directly from within the game.

## The main menu

Puzzle15 has a main menu which can be reached from the in-game menu button or the end-of-game message window.
It features the following options:

* **Continue** - Continue the currently running game. _This option is only shown if the main menu is opened during an open game._
* **Start 3x3**, **Start 4x4**, **Start 5x5** - Start a new game on a board with the respective dimension. Any currently open game is dropped.
* **About** Show a small "About" info box.
* **Exit** Exit Puzzle15 and return to the default watch face.

## Game settings

The game has some global settings which can be accessed on the usual way through the Bangle.js' app settings user interface.
Currently it has the following options:

* **Splash** - Define whether the game should open with a splash screen. **long** shows the splash screen for five seconds, **short** shows it for two seconds. **off** starts the app _without_ a splash screen, it directly comes up with whatever the "Start with" option says.
* **Start with** - What should happen after the splash screen (or, if it is disabled, directly at app start): **3x3**, **4x4** and **5x5** start the game with a board of the respective dimension, **menu** shows the main menu which allows to select the board size.

## Implementation notes

The game engine always generates puzzles which can be solved.

Solvability is detected by counting inversions,
i.e. pairs of stones where the stone at the earlier field (row-wise, left to right, top to bottom) has a number _greater than_ the stone on the later field, with all pairs of stones compared.
The algorithm is described at https://www.geeksforgeeks.org/check-instance-15-puzzle-solvable/ .

## The splash screen

The Splash screen shows a part of the illustration "The 14-15-puzzle in puzzleland" from Sam Loyd. Other than Puzzle15, it depicts a 15 puzzle with the stones "14" and "15" swapped. This puzzle is indeed *not* solvable.

Have fun!
