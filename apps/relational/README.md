# Relational Digital Art Clock

> **Time, in relation.**

Relational turns your Bangle.js 2 into a small abstract painting. The screen shows a random composition inspired by the Relational Paintings of the Swiss Concrete artist Fritz Glarner: rectangles, each cut by a slanted line into two trapezoids, in white, grays, red, blue, yellow and black. The lines continue from one rectangle into the next. The time is laid over it with two bold black hands. While the watch is unlocked, a black dot runs round the edge for the seconds, the date appears below the center, and a thin black line on the right edge shows the time until the screen locks. A small piece of Concrete Art on your wrist, new with every swipe up.

![Relational at 10:09](screenshot.png)

## Features

- **A new image anytime you swipe up** and after using other apps, including the launcher
- **More than 1 billion different images**
- **Bold black hands** with round tips, a short hour hand (30 px) and a long minute hand (59 px), without a dial that would hide the image
- **Seconds and date** when the watch is unlocked: a black dot runs round the edge, the date (e.g. Sun 11 Oct) shows below the center on top of the hands and switches between black and white with every second
- **A thin black line** on the right edge when the watch is unlocked, which shrinks until the screen locks
- **Flashlight**, double tap the bottom left
- **Widgets on demand**, hidden until you swipe down
- **Light on the battery**, the image is drawn in full only once, afterwards only the spots where hands, dot or date change are redrawn, and only with the rectangles there

---

## System Settings

### Waking Up the Clock

Under _Settings → System → LCD_, configure which interactions wake the clock from sleep: Button, Tap, Double Tap, FaceUp or Twist. By default, only Button is switched on.

### LCD Timeout

Found under _Settings → System → LCD_. Determines how long the watch waits before going to sleep, which locks the touchscreen and switches off the backlight to save power. Default: 10 seconds. While the watch is unlocked, the black line on the right edge shrinks over this time.

### LCD Brightness

Found under _Settings → System → LCD_. Accepts a value between 0.0 and 1.0. A value of 0.3 is a good practical starting point.

### Time Sync, Summer and Winter Time

The Bangle only detects time changes when synced with a smartphone. If the time is off, correct it manually by adjusting the time zone under _Settings → System → Locale_.

GPS Time is a separate app, available in the App Loader. It sets the exact time from the built-in GPS and does not need a smartphone. Open it outdoors, wait until it shows the time and press Set. As it does not change the time zone, summer and winter time still require the setting above.

### Default Clock

Multiple watch faces can be installed on the Bangle. Make Relational your default clock under _Settings → System → Clock_.

---

## Fritz Glarner

The painter Fritz Glarner (1899 to 1972), born in Zurich, developed the Relational Painting in New York from the 1940s on, starting from Mondrian's Neoplasticism: rectangles divided into two trapezoids by a slightly slanted line. His subject is the relation between these forms and the colors red, blue, yellow, white, gray and black; one of his major works is the Rockefeller Dining Room (1963/64), today in the Museum Haus Konstruktiv in Zurich.

## Principle

1. **Split:** the square is cut in two, and each part again, at most five times in a row, always across the longer side, at 32 to 68 % of it. Every side keeps at least 26 px, and some rectangles stay large: mostly 10 to 20 rectangles.
2. **Slant:** a line between the two long sides divides every rectangle into two trapezoids. Where the line of the rectangle above or to the left ends, the next line starts, so the lines relate to each other across the image. The slant is 5, 9, 14, 20 or 27°, and every trapezoid is at least 5 px wide.
3. **Palette:** red, blue and yellow, and white, pale gray, gray and black.
4. **Color:** every trapezoid gets a color at random, weighted so that colorful accents lie rather at the top, the two trapezoids of a rectangle mostly contrast (colorful and neutral), and no color dominates. Two trapezoids side by side practically never share a color. Black only appears in small trapezoids, as the hands are black. As a result, white and grays cover about 70 % of the image, the colors almost 30 %, black about 1 %.

Not taken up from Glarner: the brushwork that raking light reveals, and the alignment of the composition to the seat height in the room.

## How Many Images Are There?

The rules alone allow an unimaginable number of images: a number with far more than 50 zeros. The watch, however, can only show as many as its random number generator has starting values, namely 2 to the power of 30, or about 1.07 billion. Every starting value gives a different image, though many differ only in small details.

At 100 new images a day, it would take about 29,000 years to see them all once. After about 39,000 images, the chance that some image has already appeared before is as high as a coin toss. A particular image, however, practically never comes back.

## Notice

The background image is created by program code and random numbers. It is therefore an original creation and not a reproduction of works by Glarner.
