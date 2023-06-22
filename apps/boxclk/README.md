# Box Clock

Box Clock is a customizable clock app for Bangle.js 2 that features an interactive drag and drop interface and easy JSON configuration.

## Unique Features

__Drag & Drop:__

This intuitive feature allows you to reposition any element (box) on the clock face with ease. Tap on the box(s) you want to move and the border will show, drag into position and tap outside of the boxes to finish placing. **Note:** Roll the tip of your finger slowly on the screen for fine adjustments.

__Double Tap to Save:__

After you've found the perfect position for your boxes, you can save their positions with a quick double tap on the background. This makes it easy to ensure your custom layout is stored for future use. A save icon will appear momentarily to confirm that your configuration has been saved.

__JSON Configuration:__

Each box can be customized extensively via a simple JSON configuration. You can add a custom text string to your configuration with the "string" parameter and you can match system theme colors by using "fg", "bg", "fg2", "bg2", "fgH", or "bgH" for any of the color parameters.

## Config File Structure

Here's an example of what a configuration might contain:

```
{
  "customBox": {
    "string": "Your text here",
    "font": "CustomFont", // Custom fonts must be removed in setUI
    "fontSize": 1,
    "outline": 2,
    "color": "#FF9900", // Use 6 or 3 digit hex color codes
    "outlineColor": "bgH", // Or match system theme colors like this
    "border": 65535, // Or use 16-bit RGB565 like this
    "xPadding": 1,
    "yPadding": -4,
    "xOffset": 0,
    "yOffset": 3,
    "boxPos": { "x": 0.5, "y": 0.5 },
    "prefix": "", // Adds a string to the beginning of the main string
    "suffix": "", // Adds a string to the end of the main string
    "disableSuffix": true, // Use to remove DayOfMonth suffix only
    "short": false, // Use long format of time, meridian, date, or DoW
    "shortMonth": false // Use long format of month within date

  },
  "bg": { // Can also be removed for no background
    "img": "YourImageName.img"
  }
}
```

__Breakdown of Parameters:__

* **Box Name:** The name of your text box. Box Clock includes functional support for "time", "date", "meridian" (AM/PM), "dow" (Day of Week), "batt" (Battery), and "step" (Step count). You can add additional custom boxes with unique titles.

* **string:** The text string to be displayed inside the box. This is only required for custom Box Names.

* **font:** The font name given to g.setFont().

* **fontSize:** The size of the font.

* **outline:** The thickness of the outline around the text.

* **color:** The color of the text.

* **outlineColor:** The color of the text outline.

* **border:** The color of the box border when moving.

* **xPadding, yPadding:** Additional padding around the text inside the box.

* **xOffset, yOffset:** Offsets the text position within the box.

* **boxPos:** Initial position of the box on the screen. Values are fractions of the screen width (x) and height (y), so { "x": 0.5, "y": 0.5 } would be in the middle of the screen.

* **prefix:** Adds a string to the beginning of the main string. For example, you can set "prefix": "Steps: " to display "Steps: 100" for the step count.

* **suffix:** Adds a string to the end of the main string. For example, you can set "suffix": "%" to display "80%" for the battery percentage.

* **disableSuffix:** Applies only to the "date" box. Set to true to disable the DayOfMonth suffix. This is used to remove the "st","nd","rd", or "th" from the DayOfMonth number.

* **short:** Set to false to get the long format value of time, meridian, date, or DayOfWeek. Short formats are used by default if not specified.

* **shortMonth:** Applies only to the "date" box. Set to false to get the long format value of the month. Short format is used by default if not specified.

* **bg:** This specifies a custom background image, with the img property defining the name of the image file on the Bangle.js storage.

## Multiple Configurations

__Settings Menu:__

The app includes a settings menu that allows you to switch between different configurations. The selected configuration is stored as a number in the default `boxclk.json` file using the selectedConfig property.

If the selectedConfig property is not present or is set to 0, the app will use the default configuration. To create additional configurations, create separate JSON files with the naming convention `boxclk-N.json`, where `N` is the configuration number. The settings menu will list all available configurations.

## Example Configs:

To easily try out other configs, download and place the JSON configs and/or background images from below onto your Bangle.js storage. Then go to the Box Clock settings menu to select the new config number. You can also modify them to suit your personal preferences.

__Space Theme:__

- **Config:** [boxclk-1.json](https://github.com/espruino/BangleApps/tree/master/apps/boxclk/boxclk-1.json)
- **Background:** [boxclk.space.img](https://github.com/espruino/BangleApps/tree/master/apps/boxclk/boxclk.space.img) ([Original Source](https://www.pixilart.com/art/fallin-from-outer-space-sr2e0c1a705749a))

__System Color Theme:__

- **Config:** [boxclk-2.json](https://github.com/espruino/BangleApps/tree/master/apps/boxclk/boxclk-2.json)

## Compatibility

This app was built and tested with Bangle.js 2.

## Feedback

If you have any issues or suggestions, please open an issue on this GitHub repository. Contributions to improve the application are also welcomed.

## Creator

[stweedo](https://github.com/stweedo)
