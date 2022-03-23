
# Play the game of 1024

Move the tiles by swiping to the lefthand, righthand or up- and downward side of the watch.

When two tiles with the same number are squashed together they will add up as exponentials:

**1 + 1 = 2** or **A + A = D**  which is a representation of  **2^1 + 2^1 = 2^1 = 4**

**2 + 2 = 3** or **B + B = C**  which is a representation of  **2^2 + 2^2 = 2^3 = 8**

**3 + 3 = 4** or **C + C = D** which is a representation of  **2^3 +  2^3 = 2^4 = 16**

After each move a new tile will be added on a random empty square. The value can be 1 or 2, and will be marked with a chevron.

So you can continue till you reach **1024** which equals **2^(10)**. So when you reach tile **10** you have won.

The score is maintained by adding the outcome of the sum of all pairs of squashed tiles (4+16+4+8 etc.)

Use the side **BTN** to exit the game, score and tile positions will be saved.

## Buttons on the screen

 - Button **U**: Undo the last move. There are currently a maximum of 4 undo levels. The level is indicated with a small number in the lower righthand corner of the Undo button
 - Button **\***:  Change the text on the tile to number, capitals or Roman numbers
 - Button **R**: Reset the game. The Higscore will be remembered. You will be prompted first.

### Credits

Game 1024 is based on Saming's 2048 and Misho M. Petkovic 1024game.org and conceptually similar to Threes by Asher Vollmer.

In Dark theme with numbers:
![Screenshot from the Banglejs 2 watch with the game in dark theme](./game1024_sc_dump_dark.png)

In Light theme with characters:
![Screenshot from the Banglejs 2 watch with the game in light theme](./game1024_sc_dump_light.png)