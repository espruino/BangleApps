# Puzzle15 - A 15-puzzle for the Bangle.js 2

This is a Bangle.js 2 adoption of the famous 15 puzzle.

## The game

A board of n x n fields is filled with n²-1 numbered stones.
Bring them in the correct order so that the gap is finally at the bottom right of the playing field.
The less moves you need, the better you are.

## How to play

Select whether you want to play on a board with 3 x 3, 4 x 4, or 5 x 5 fields.
Move the stones with drag gestures on the screen.
If you want to move the stone below the gap upward, drag from the bottom of the screen upward.
The drag gestures can be performed anywhere on the screen, there is no need to start or end them on the stone to be moved.

If you managed to order the stones correctly, a success message appears.
You can continue with another game, go to the game's main menu, or quit the game entirely.

There is a menu button right of the board. It opens the game's main menu.

## Implemenation notes

The game engine always generates 15 puzzles which can be solved.

Have fun!
