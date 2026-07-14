# Pure Numerals Clock

> **Time, reduced to digits.**

Pure Numerals is a digital watch face that strips away all unnecessary elements and translates time into two bold blocks of numbers. Hours at the top, minutes at the bottom — in vivid contrasting colors against a deep black background. Radically simple, extremely easy to read, and looking like a digital neon sign on your wrist.

## Features

- **Oversized, softly rounded numerals** for maximum readability at a glance
- **Strong contrasting colors** on a deep black background
- **Radically focused** on the time — no distractions, no clutter
- **Optimized for Bangle.js** — smooth, responsive, and power-efficient
- **For users who love typographic presence** and the beauty of pure digital numerals

---

## System Settings

### LCD Timeout

Found under _Settings → System → LCD_. Determines how long the watch waits before going to sleep — switching off the touchscreen and backlight to save power. Default: 10 seconds.

### Waking Up the Clock

Under _Settings → System → LCD_, configure which interactions wake the clock from sleep:

- Wake on Button
- Wake on Tap
- Wake on Double Tap
- Wake on FaceUp
- Wake on Twist

### LCD Brightness

Found under _Settings → System → LCD_. Accepts a value between 0.0 and 1.0. A value of 0.3 is a good practical starting point.

### Summer and Winter Time

The Bangle only detects time changes when synced with a smartphone. If the time is off, correct it manually by adjusting the time zone under _Settings → System → Adjust Local_.

### Default Clock

Multiple watch faces can be installed on the Bangle. Set which one launches by default under _Settings → System → Clock_.

---

## Primary Views

Primary views show the date, time, step count, and pulse. Switch between them using carousel navigation: swipe left for the next view, swipe right for the previous.

### Day/Month
Displays the date in European format — day in the upper half, month in the lower half.

### Hours/Minutes
Displays hours and minutes. This is the default view shown on startup and after waking from sleep.

### Minutes/Seconds
Displays minutes and seconds, using the same color for minutes as the Hours/Minutes view.

### Pedometer
Displays the step count for the current day. Resets at midnight. Font size scales automatically.

### Pulse Measurement
Activates the heart rate sensor when opened and displays the measured pulse once available. Font size scales automatically.

The first reading takes approximately 20 seconds. To allow for this, the LCD timeout is disabled in this view and re-enabled when you leave it.

---

## Secondary Views

Secondary views are accessed by tapping specific areas of the display. Exiting returns you to the last active primary view.

### Battery Indicator

Access by tapping the **upper right corner**. The charge bar uses the following color coding:

- **Green**: > 40%
- **Orange**: 20–40%
- **Red**: < 20%

Closes automatically after 3 seconds.

### Flashlight

Access by **double-tapping the lower left corner**. Displays a full-brightness white screen.

The LCD timeout is disabled while active. Tap anywhere to exit, which restores the previous brightness and re-enables the timeout.
