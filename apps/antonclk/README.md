# Anton Clock - Large font digital watch with seconds and date

Anton clock uses the "Anton" bold font to show the time in a clear, easily readable manner. On the Bangle.js 2, the time can be read easily even if the screen is locked and unlit.

## Features

The basic time representation only shows hours and minutes of the current time. However, Anton clock can show additional information:

* Seconds can be shown, either always or only if the screen is unlocked.
* To help easy recognition, the seconds can be coloured in blue on the Bangle.js 2.
* Date can be shown in three different formats:
    * ISO-8601: 2021-12-19
    * short local format: 19/12/2021, 19.12.2021
    * long local format (not together with seconds): DEC 19 2021
* Weekday can be shown (not together with seconds)

## Usage

Install Anton clock through the Bangle.js app loader.
Configure it through the default Bangle.js configuration mechanism
(Settings app, "Apps" menu, "Anton clock" submenu).
If you like it, make it your default watch face
(Settings app, "System" menu, "Clock" submenu, select "Anton clock").

## Configuration

Anton clock is configured by the standard settings mechanism of Bangle.js's operating system:
Open the "Settings" app, then the "Apps" submenu and below it the "Anton clock" menu.
You configure Anton clock through several "on/off" switches in two menus.

### The main menu

The main menu contains several settings covering Anton clock in general.

* **Seconds...** - Opens the submenu for configuring the presentation of the current time's seconds.
* **ISO8601 date** - Show the date in ISO-8601 format, irrespective of the current locale.
* **Long date** - Show the date in long format (usually with month in letters instead of number).
Exact format depends on the current locale. _Only evaluated if ISO8601 date is not set._
* **Show Weekday** - Weekday is shown in the time presentation without seconds.
Weekday name depends on the current locale.
If seconds are shown, the weekday is never shown as there is not enough space on the watch face.
* **Uppercase** - Weekday name and month name in the long format are converted to upper case letters.
This can improve readability.

### The "Seconds" submenu

The "Seconds" submenu configures how (and if) seconds are shown on the "Anton" watch face.

* **Always** - Seconds are _always_ shown, irrespective of the display's unlock state.
If this is enabled, weekdays will never been shown.
_Enabling this option increases power consumption as the watch face will update once per second instead of once per minute._
* **If unlocked** - Seconds are shown if the display is unlocked.
On a locked display, only hour, minutes, date and weekday are shown.
"Always" overrides this option.
_This option is highly recommended on the Bangle.js 2!_
* **Coloured** - If enabled, seconds are shown in blue instead of black.
This make the visual orientation much easier on the watch face.
* **With date** - If enabled, the date is shown together with the seconds.
Depending on the "ISO8601 date" settings, ISO8601 or short local format is used.
The date is coloured in red if the "Coloured" option is chosen.

If neither "Always" nor "If unlocked" is selected, Anton clock does _never_ show seconds.

## Compatibility

Anton clock makes use of core Bangle.js 2 features (coloured display, display lock state). It also runs on the Bangle.js 1 but these features are not available there due to the hardware features.
