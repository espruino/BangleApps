# Anton Clock Plus - Large font digital watch with seconds and date

Anton Clock Plus uses the "Anton" bold font to show the time in a clear, easily readable manner. On the Bangle.js 2, the time can be read easily even if the screen is locked and unlit.

## Features

The basic time representation only shows hours and minutes of the current time. However, Anton clock can show additional information:

* Seconds can be shown, either always or only if the screen is unlocked.
* To help easy recognition, the seconds can be coloured in blue on the Bangle.js 2.
* Date can be shown in three different formats:
    * ISO-8601: 2021-12-19
    * short local format: 19/12/2021, 19.12.2021
    * long local format: DEC 19 2021
* Weekday can be shown (on seconds screen only instead of year)

## Usage

* Install Anton Clock Plus through the Bangle.js app loader.
* Configure it through the default Bangle.js configuration mechanism
(Settings app, "Apps" menu, "Anton clock" submenu).
* If you like it, make it your default watch face
(Settings app, "System" menu, "Clock" submenu, select "Anton clock").

## Configuration

Anton Clock is configured by the standard settings mechanism of Bangle.js's operating system:
Open the `Settings` app, then the `Apps` submenu and below it the `Anton Clock+` menu.
You configure Anton clock through several "on/off" switches in two menus.

### The main menu

The main menu contains several settings covering Anton clock in general.

* **Seconds...** - Opens the submenu for configuring the presentation of the current time's seconds.
* **Date** - Format of the date representation. Possible values are
    * **Long** - "Long" date format in the current locale. Usually with the month as name, not number.
    * **Short** - "Short" date format in the current locale. Usually with the month as number.
    * **ISO8601** - Show the date in ISO-8601 format (YYYY-MM-DD), irrespective of the current locale.
* **Show Weekday** - Weekday is shown in the time presentation without seconds.
Weekday name depends on the current locale.
If seconds are shown, the weekday is never shown as there is not enough space on the watch face.
* **Show CalWeek** - Week-number (ISO-8601) is shown. (default: Off)
If "Show Weekday" is "Off" displays the week-number as "week #<num>".
If "Show Weekday" is "On" displays "weekday name short" with " #<num>" .
If seconds are shown, the week number is never shown as there is not enough space on the watch face.
* **Vector font** - Use the built-in vector font for dates and weekday.
This can improve readability.
Otherwise, a scaled version of the built-in 6x8 pixels font is used.

### The "Seconds" submenu

The "Seconds" submenu configures how (and if) seconds are shown on the "Anton" watch face.

* **Show** - Configure when the seconds should be shown at all:
    * **Never** - Seconds are never shown.
In this case, hour and minute are a bit more centered on the screen and the clock will always only update every minute.
This saves battery power.
    * **Unlocked** - Seconds are shown if the display is unlocked.
On locked displays, only hour, minutes, date and optionally the weekday are shown.
_This option is highly recommended on the Bangle.js 2!_
    * **Always** - Seconds are _always_ shown, irrespective of the display's unlock state.
_Enabling this option increases power consumption as the watch face will update once per second instead of once per minute._
* **With ":"** - If enabled, a colon ":" is prepended to the seconds.
This resembles the usual time representation "hh:mm:ss", even though the seconds are printed on a separate line.
* **Color** - If enabled, seconds are shown in blue instead of black.
If the date is shown on the seconds screen, it is colored read instead of black.
This make the visual orientation much easier on the watch face.
* **Date** - It is possible to show the date together with the seconds:
    * **No** - Date is _not_ shown in the seconds screen.
In this case, the seconds are centered below hour and minute.
    * **Year** - Date is shown with day, month, and year. If "Date" in the main settings is configured to _ISO8601_, this is used here, too. Otherwise, the short local format is used.
    * **Weekday** - Date is shown with day, month, and weekday.

The date is coloured in red if the "Coloured" option is chosen.

## Compatibility

Anton clock makes use of core Bangle.js 2 features (coloured display, display lock state). It also runs on the Bangle.js 1 but these features are not available there due to hardware restrictions.
