# TheBinWatch

Binary watch to train Your brain
Inspired by the 80's LCD wrist watch from RALtec

![](app.png)

## Usage

- swipe to left or right to change displayed text (date, time, ...)
- currently only available for BangeJs2
- Widgets will not be shown
- If bluetooth connection is not established an icon will show up

## How it works
binary means that every digit can represent 2 states: 0 or 1, displayed by a black bar.
The principle is the same linke in out daily used decimal system with values from 0 to 9:

We start from the right with the least significant bit (binary digit) which can have the value 0 or 1
The 2nd bit from the right can have the value 0 or 2 (sum of all bits to the right set to 1).
This principle is valid for all the remaining bits.
Mathematically spoken: the value of a digit is the base number of the system (10 for decimal or 2 for binary)
to the power of the position (from the right, starting with 0).
that means in numbers: 32 - 16 - 8 - 4 - 2 - 1

The upper row represents the hours with 4 bit (16 possible values in total, 12 are used: 1 to 12)
2nd row represents the minutes with 6 bit (64 possible values in total, 60 are used: 0 to 59).
Same holds for the thrid row: 0-59 seconds

To read the values of a row we summ up the vaules of set bits (black bars).
E.g. 1010 is 1 * 8 + 0 * 4 + 1 * 2 + 0 * 1 = 10

