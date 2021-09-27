This app will allow you to keep scores for most kinds of sports.

# Keybinds
*On Bangle.js 2 BTN is equivalent to BTN2 on Bangle.js 1*
| Keybinding        | Description                  |
|-------------------|------------------------------|
| `BTN1`            | Scroll up                    |
| `BTN3`            | Scroll down                  |
| `BTN2`            | Menu                         |
| tap on left side  | increment left player score  |
| tap on right side | increment right player score |

To correct a falsely awarded point simply open and close the menu within .5 seconds. This will put the app into correction mode (indicated by the `R`).
In this mode any score increments will be decrements. To move back a set, reduce both players scores to 0, then decrement one of the scores once again.

# Settings
| Setting        | Description                                                                                                                  |
|----------------|------------------------------------------------------------------------------------------------------------------------------|
| Sets to win    | How many sets a player has to win before the match is won (Maximum sets: this*2-1)                                           |
| Sets per page  | How many sets should be shown in the app. Further sets will be available by scrolling (ignored if higher than `Sets to win`) |
| Score to win   | What score ends a given set                                                                                                  |
| 2-point lead   | Does winning a set require a two-point lead                                                                                  |
| Maximum score? | Should there be a maximum score, at which point the two-point lead rule falls away                                           |
| Maximum score  | At which score should the two-point lead rule fall away (ignored if lower than Sets to win)                                  |
| Tennis scoring | If enabled, each point in a set will require a full tennis game                                                              |

The settings can be changed both from within the app by simply pressing `BTN2` (`BTN1` on Bangle.js 2) or in the `App Settings` in the `Settings` app.

If changes are made to the settings from within the app, a new match will automatically be initialized upon exiting the settings.

By default the settings will reflect Badminton rules.

## Tennis Scoring
While tennis scoring is available, correcting in this mode will reset to the beginning of the current game.
Resetting at the beginning of the current game will reset to the beginning of the previous game, leaving the user to fast-forward to the correct score once again.

This might get changed at some point.
