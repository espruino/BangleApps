# Golf GPS

I have made a few watches for golfing. See this [LINK](https://jeonlab.wordpress.com/category/golf-gps-watch/) if you are interested.
Now that I have a Bangle.js 2 watch, I wanted to port my program to it for golfing. For my previous watches I have used TFT LCD or OLED displays and they all draw a lot of current and display information only when I press a button to wake up from the black screen. One of the best feature of the Bangle.js 2, I think, is the memory LCD which consumes very small power and it is always on! 

## Features
- Play or view previously played scores
- Save your favourite course data (see below instruction)
- In play mode
  - Hole number
  - Par as background color of the hole number (red: 3, green: 4, blue: 5)
  - Distance to the center of the green (coordinates you saved)
  - Distance from the last shot (where you swiped up to add a shot)
  - Number of shots on current hole
  - Total number of shots
  - Clock
- How to change holes and add/subtract shots
  - Swipe left/right to change the hole to next/previous (you can move to any hole to update your shots in case you entered wrong number of shots by mistake)
  - Swip up/down to add/subtract the number of shots. This will update the total number of shots as well as current shots.
- After the game
  - Press the button to either finish the game or go back to the play screen (if you pressed the button by accident).
  - If you choose to finish the game, it will show the summary of the score with 3x6 matix, shots - par. For example, -1 is for birdie and 0 is for par, and +2 is for double bogey. It also shows the total shots and total par as well.


## Screenshots
![](jclock_screenshot_no_BT.png)
![](jclock_screenshot_BT.png)

## Creator

Written by [JeonLab](https://jeonlab.wordpress.com)
