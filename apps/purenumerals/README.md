# Pure Numerals Clock

## System settings

This chapter describes some system settings that affect the behavior of the Pure Numerals Clock.

### LCD Timeout

The _LCD Timeout_ can be found under _Settings → System → LCD_ and determines the duration after which the watch automatically goes into "sleep" mode without user interaction. During this time, the touchscreen and backlight are switched off to prevent unwanted user interactions and reduce power consumption. The _LCD Timeout_ is set to 10 seconds by default.

### Waking up the clock

Under _Settings → System → LCD,_ you can configure one or more options to determine the user interaction used to wake the clock from sleep mode. The following options are available:

- Wake on Button
- Wake on Tap
- Wake on Double Tap
- Wake on FaceUp
- Wake on Twist

### LCD Brightness

The _LCD Brightness_ setting adjusts the brightness of the display's backlight. This setting can be found under _Settings → System → LCD_ . The brightness is set to a value between 0.0 and 1.0 and affects power consumption and therefore the watch's battery life. In practice, a value of 0.3 has proven effective.

### Summer and winter time

The Bangle only recognizes the time change if it is connected to a smartphone and synchronizes with it. Therefore, the time may need to be corrected manually. You can do this by changing the _time zone_ under _Settings →_ Adjust _System → Local accordingly._

### Setting the Default Clock

Multiple watch faces can be installed on the Bangle. Under _Settings →_ _System → Clock_ allows you to set which clock should be used by default. This clock will be displayed when you exit the app launcher.

## Primary Views

The primary views are used to display the date and time, as well as the step counter and pulse measurement. A carousel navigation was implemented for switching views. Swiping from right to left displays the next view (corresponding to scrolling forward). Swiping from left to right displays the previous view. The order of the subchapters corresponds to the order of the carousel navigation.

### Day/Month
This view displays the date. The day is shown in the upper half, the month in the lower half. This order corresponds to the European date format.

### Hours/Minutes
This view displays the hours and minutes. This view is displayed when the clock starts or when the LCD timeout has expired and the clock is put to sleep.

### Minutes/Seconds
This view displays the minutes and seconds. The same color is used for the minutes as in the Hours/Minutes view.

### Pedometer
This view displays the number of steps recorded on a given day. The counter resets to 0 when the date changes. The font size of the step count scales automatically.

### Pulse measurement
This view displays the measured pulse. The pulse measurement sensor is activated when the view is opened. As soon as measurements are available, the measured pulse is displayed. The font size is automatically scaled.

Since it takes approximately 20 seconds for the first measurement to be displayed, the LCD timeout is deactivated in this view. Therefore, the watch does not go to sleep during heart rate measurement. The LCD timeout is reactivated when the view is exited.

## Secondary Views

Secondary views are accessed from primary views through appropriate user interaction. When exiting a secondary view, the last active primary view is automatically displayed.

### Battery indicator

The battery indicator is accessed by tapping the upper right corner of the display.
The charging indicator bar is colored as follows:

- Green: Charge level > 40%
- Orange: Charge level between 20% and 40%
- Red: Charge level < 20%

The battery indicator will automatically exit after a timeout of 3 seconds.

### flashlight

The flashlight icon displays a white rectangle at full brightness. The flashlight is activated by double-tapping the lower left corner of the display. The double-tapping feature prevents accidental activation of the flashlight.

The LCD timeout is disabled while the flashlight is on. Tapping the display exits the view. This re-establishes the LCD timeout and restores the original brightness.