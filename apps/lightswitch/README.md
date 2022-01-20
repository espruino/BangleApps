# Light Switch Widget

This widget

## Control



## Settings

### Widget - Change the apperance of the widget:
* __Bulb col:__  _red / yellow / green / cyan / blue / magenta_  
  Define the color used for the lightbulbs inner circle.  
  The selected color will be dimmed depending on the aktual brigtness value.
* __Image:__ _defaut / random / ..._  
  Set your favourite lock icon image. (If no image file is found _no image_ will be displayed.)
    * _random_ -> Select a random image on each time the widget is drawn.

### Control - Change when and how to use the widget:
* __Touch:__ _on def clk / on all clk / clk+launch / always on_  
  Select when you can touch the widget to en-/disable the backlight.
    * _on def clk_ -> only on your selected main clock face
    * _on all clk_ -> on all apps of the type _clock_
    * _clk+launch_ -> on all apps of the types _clock_ and _lanch_
* Drag Delay: int // drag listener reset time in ms
      // time until a drag is needed to activate backlight changing mode
      0   -> disabled
      500 -> (default)
* Min Value: float // minimal brightness level that can be set by dragging
      0.05 to 1, 0.1 as default

### Unlock - Setup unlock function:
* TapSide: off / side to double tap on to unlock your Bangle

### Flash

* TapSide: string // side of the watch to double tap on to flash backlight
      0/false/undefined             -> backlight flash disabled
      right/left/up/down/front/back -> side to tap on (default: right)
* Tap: string // select when tap to flash backlight is active
      "locked"   -> only when locked
      "unlocked" -> only when unlocked (default)
      "always"   -> always
 * Timeout: int // backlight flash timeout in ms
      3000 (default)
 * Min Value: float // minimal brightness level when 
      0.05 to 1, 0.2 as default


## Images
