# Bordle

The Bangle version of a popular word guessing game. The goal is to guess a 5 letter word in 6 tries or less. After each guess, the letters in the guess are
marked in colors: yellow for a letter that appears in the to-be-guessed word, but in a different location and green for a letter in the correct position.

Only words contained in the internal dictionary are allowed as valid guesses. At app launch, a target word is picked from the dictionary at random.

On startup, a grid of 6 lines with 5 (empty) letter boxes is displayed. Swiping left or right at any time switches between grid view and keyboard view.
The keyboad was inspired by the 'Scribble' app (it is a simplified version using the layout library). The letter group "Z ..." contains the delete key and
the enter key. Hitting enter after the 5th letter will add the guess to the grid view and color mark it.

The internal dictionary contains all valid Wordle words.

It is contained in the file 'wordlencr.txt' which contains one long string (no newline characters) of all the words concatenated. It would not be too difficult to swap it
out for a different language version. The keyboard currently only supports the 26 characters of the latin alphabet (no accents or umlauts).



