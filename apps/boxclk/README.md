# Box Clock

Box Clock is a customizable clock app for Bangle.js 2 that features an interactive drag and drop interface and easy JSON configuration.

## Unique Features

__Drag & Drop:__

This intuitive feature allows you to reposition any element (box) on the clock face with ease. Tap on the box(s) you want to move and the border will show, drag into position and tap outside of the boxes to finish placing.

__JSON Configuration:__

Each box can be customized extensively via a simple JSON configuration. Here's what an example configuration might look like:

```
{
  "time": {
    "font": "BrunoAce",
    "fontSize": 1,
    "outline": 2,
    "color": "#000",
    "outlineColor": "#fff",
    "border": "#000",
    "xPadding": 1,
    "yPadding": -4,
    "xOffset": 0,
    "yOffset": 3,
    "boxPos": { "x": 0.5, "y": 0.5 }
  },
  "bg": {
    "img": "YourImageName.img"
  }
}
```
* **font:** The font name given to g.setFont()

* **fontSize:** The size of the font.

* **outline:** The thickness of the outline around the text.

* **color:** The color of the text.

* **outlineColor:** The color of the text outline.

* **border:** The color of the box border when moving.

* **xPadding, yPadding:** Additional padding around the text inside the box.

* **xOffset, yOffset:** Offsets the text position within the box.

* **boxPos:** Initial position of the box on the screen. Values are fractions of the screen width (x) and height (y), so { "x": 0.5, "y": 0.5 } would be in the middle of the screen.

* **bg:** This specifies a custom background image, with the img property defining the name of the image file on the Bangle.js storage.

## Compatibility

This app was built and tested with Bangle.js 2.

## Feedback

If you have any issues or suggestions, please open an issue on this GitHub repository. Contributions to improve the application are also welcomed.

## Creator

[stweedo](https://github.com/stweedo)
