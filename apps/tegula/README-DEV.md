# Tegula - Digital Art Clock for Bangle.js 2

A clock face as a mosaic (Latin *tegula*: tile). The 176 × 176 px screen is divided into a grid of 11 × 11 square tiles of 16 px. The tiles form a random **Lohse square**, a color arrangement named after the Swiss painter Richard Paul Lohse. The time is drawn over it as **HH above MM** with a 4 × 5-tile digit font derived from the seven-segment display. The square has no gaps. The digit tiles are black and drawn slightly smaller than their cells, so a frame in the color of the square underneath separates them.

A new image (Lohse square, color palette and colors) appears on swipe up and whenever the clock starts. The algorithm can generate 20 846 892 different background images (see [Number of images](#number-of-images)). While the watch is unlocked, the mosaic turns paler for 2 s and back for 1 s, two thin white lines show the view and the time until the screen locks, and gestures show the date or the seconds, switch on a flash light and show the widgets.

![Tegula at 12:34](screenshot.png)

## Gestures

The touchscreen only reacts while the watch is unlocked. Press the button to unlock it.

| Gesture | Effect | Ends |
|---|---|---|
| Swipe right | DD/MM: day above month | Screen locks, or swipe left |
| Swipe left | MM/SS: minutes above seconds | Screen locks, or swipe right |
| Swipe up | New image | Next new image |
| Double tap bottom left | Flash light | Any tap |
| Swipe down | Widget bar (only with `FAST_LOAD`, the default) | After 2 s, or swipe up |

### Light pulse

While the watch is unlocked, in all three views, all tiles turn pale for 2 s (`PULSE_PALE`): they are drawn in their colors blended with white (`LIGHTEN`, 0.25), with the black squares of the digits on top. Then they show their own colors for 1 s (`PULSE_NORMAL`), and so on.

- The pale colors are computed with `g.blendColor(color, "#fff", LIGHTEN)` once per image. They are 16-bit colors like the others, and the firmware dithers them as usual.
- The pulse starts pale on every unlock, after every swipe and when the flash light goes off. Its start is rounded to the nearest full second, so it switches on whole seconds, and the first pale phase lasts 1.5 to 2.5 s.
- While unlocked, all three views are redrawn every second, as MM/SS always was for its seconds: `drawTiles()` draws all tiles in one of the two color sets in a single pass, then the [white lines](#white-lines) follow. There is no separate pulse timer. `pulsePale()` takes the phase from the time since the start, rounded to whole seconds, so a timer that fires a little early or late does not shift it.
- An earlier attempt made only the tiles next to the digits paler. In the 11 × 11 grid these were nearly all tiles anyway (105 of 121 at 10:30), so the whole grid is simpler and looks more even.
- When the screen locks, the pulse goes off. The locked face is pixel-identical to the face without pulse.

### White lines

While the watch is unlocked, `drawLines()` draws two lines after the tiles, each 2 px of white on the edge of the screen with 2 px of black inside, as white alone vanishes on pale tiles (1 px was too thin to see on the watch):

| Line | White | Black | Extent |
|---|---|---|---|
| View | y = 0..1 | y = 2..3 | DD/MM x 0..58, HH/MM x 59..117, MM/SS x 118..175 |
| Lock countdown | x = 174..175 | x = 172..173 | 2h px centered on y = 88, from y = 88 - h to 87 + h |

- **Countdown:** h = round(88 × remaining / timeout), from 88 (176 px, the full height) down to 0. The timeout is `Bangle.getOptions().lockTimeout` in ms, which the LCD Timeout of the system sets (`Bangle.setLCDTimeout()` sets the backlight and the lock timeout together). With 0 (never lock), there is no countdown line.
- **Restart:** on unlock and on every touch. The firmware restarts its lock timer at every change on the touchscreen, so the clock listens to the `drag` event, which comes for every such change, taps and swipes included. A button press restarts the firmware timer too, but in clock mode it opens the launcher at once.
- **The lock always wins:** the line only shows the remaining time and never locks or delays anything. If the firmware locks before the line has run out, for example after the launcher, whose last touch came a moment before the clock started, the line goes with the lock. If something else restarts the firmware timer, for example `Bangle.setLCDPower(1)` from a widget, the line runs out before the lock.
- **Drawing:** every second, the tiles are drawn first and the lines on top, so a line that shrinks or moves leaves no trace. Both black lines come before both white ones: with MM/SS and the full countdown, they meet in the top right corner as a frame (white outside, black inside). The black of the view line (y = 2..3) runs along the top of the digit squares of the upper row (y = 2..13) and merges with them. The countdown stays within column 10, which never holds a digit.
- **Locked and flash light:** no lines. The locked face is pixel-identical to the face without lines.
- With the widget bar shown, the bar covers the top line.

### Date and seconds

- Swipe right shows DD/MM, swipe left shows MM/SS, both in the same layout as HH/MM. Swiping the other way returns to HH/MM. A second swipe in the same direction has no effect.
- Unlocked, every view is redrawn every second (pulse and lines), so the seconds of MM/SS change every second and the date changes at midnight. Locked, HH/MM is redrawn every minute.
- When the screen locks, the clock returns to HH/MM.
- As there is no separator, 11 October looks the same as 11:10.

### New image

- Every image has a random color palette (1, 2 or 3, each with a probability of 1/3), a random Lohse square and a random start color and direction on the color wheel.
- **Swipe up** shows a new image at once, in the current view (HH/MM, DD/MM or MM/SS).
- **Every start** of the clock also shows a new image, for example when coming back from the launcher or an app.
- While the widget bar is visible, swipe up only hides the bar. While the flash light is on, swipe up is ignored.

### Flash light

- Tap twice within 500 ms in the left half of the bottom quarter (x < 88, y > 132).
- The screen turns white at full brightness. The backlight and lock timeouts are switched off, so the light stays on.
- Any tap switches it off and brings back the previous view with the same image. The timeouts and the brightness from the system settings (`setting.json`) are restored. This also happens if the clock is left while the light is on.
- Left, right and up swipes are ignored while the light is on.

### Widgets

- Only with `FAST_LOAD = true` (default). With `false`, no widgets are loaded and swipe down has no effect, see [Fast loading and widgets](#fast-loading-and-widgets).
- Swipe down: the widget bar slides in over the top tiles and slides out again after 2 s. Swipe up hides it at once.
- This is `swipeOn()` from the BangleApps module `widget_utils`, which also moves bottom widgets into the top bar.
- Left and right swipes, and up swipes while the bar is hidden, are handled by the clock only (`Bangle.prependListener`, `E.stopEventPropagation()`). Passed on to `widget_utils`, left and right swipes would cancel the auto-hide, and the bar would stay visible.
- An up swipe while the bar is visible (`require("widget_utils").offset > -24`) is passed on to `widget_utils`, which hides the bar.

## Lohse rules

The background displays random Lohse squares, named after the Swiss artist, Richard Paul Lohse.

1. Every color appears exactly once in each row and column ('Latin square').
2. Tiles that touch at a corner never have the same color.
3. These rules also apply to the edges.

The image is built from the top down by shifting:

1. The clock uses 11×11 tiles and three color palettes of 11 colors each.
2. The first row randomly selects one out of the palettes.
3. Each subsequent row is the previous row shifted sideways, wrapping around at the end so that it starts with a color that no earlier row started with.

## Algorithm

In the code, `a` is `ROW_SHIFT`, drawn by `newSquare()`; `newColors()` fills the colors of the image.

- Tile (column j, row i) gets color `(a[i] + j) mod N`, with N = 11. Each row is the color wheel, cyclically shifted by `a[i]` (horizontal permutations only).
- `a` is a permutation of `0..N-1` with `a[0] = 0`, in which every jump `a[i+1] - a[i]` (mod N) lies in `2..N-2`. This makes the square Latin and keeps diagonal neighbors different. The jump from the last row back to the first must also lie in `2..N-2`, so the rules hold across the edges too.
- `a` is drawn without backtracking: each step picks a random unused value, excluding predecessor +1 and -1. As at most two values are excluded, dead ends can only occur in the last two steps, and the draw then restarts, also if the jump back to the first row is invalid (1.42 attempts on average).
- Random per image: the color palette, `a`, and the start color and direction on the 11-color wheel of the palette. Bangle.js dithers the colors.
- `a[0]` is not drawn at random: a random first value would only rotate the colors on the wheel once more, which the start color already does. It would cost random numbers without adding a single image.
- The same construction appears in some of Lohse's 6 × 6 squares (`Z_6`). Non-cyclic groups, such as `A_4` in one of his 12 × 12 squares, are not used.
- The black digit tiles cover part of the square. The rules apply to the complete square underneath.

### Number of images

Four random choices fix a background image, and different choices always give different images: the direction shows in every row, the start color is the top left tile (as `a[0] = 0`), and `a` then follows from the first column.

| Choice | Options |
|---|---|
| Color palette | 3 |
| Direction on the color wheel | 2 |
| Start color | 11 |
| Jump sequence `a` | 315 862 |

- The jump sequences are the closed tours through the 11 positions of the color wheel that never step to a neighboring position: 157 931 tours ([OEIS A002816](https://oeis.org/A002816), n = 11), each in two directions, all starting at `a[0] = 0`.
- In total, the algorithm can generate 3 × 2 × 11 × 315 862 = **20 846 892** different background images. They also look different on the display: no two palettes share the same set of dither patterns, and in palette 3, where yellow and golden yellow look alike, each row is already fixed by the positions of its other 9 colors.
- The images are not equally likely, as each value of `a` is drawn from the values still allowed: the most likely jump sequence is 3.9 times as likely as the least likely one. With 24.27 bits, the entropy per image stays close to the 24.31 bits of a uniform choice.
- The same image appears twice within about 5 200 images with a probability of 50 %.

### Random numbers

- `Math.random()` in Espruino is a multiply-with-carry generator with two 16-bit halves (`rand()` in `src/jsutils.c`). On the Bangle.js 2, the firmware seeds it once at boot from the hardware random number generator. In the emulator, it starts from the same fixed state every time.
- The clock seeds it again on every start:
  ```js
  E.srand((E.hwRand() ^ (Date.now() * 1000)) | 0x10001);
  ```
- `E.hwRand()`: 32 bits of hardware noise. On nRF5x chips such as the nRF52840 of the Bangle.js 2, it comes from the random number generator of the chip, on STM32 F1/F4 boards from the noise of the internal voltage reference. In the emulator, it returns the next value of `rand()` itself.
- `Date.now() * 1000`: the time in µs. The XOR uses its low 32 bits, whose high half changes every 65.5 ms (in milliseconds, it would only change every 65.5 s). This keeps two starts apart even where the hardware noise is weak.
- `| 0x10001`: `E.srand()` puts the low 16 bits of the seed into one half of the generator and the high 16 bits into the other. A half that starts at 0 stays 0, and with the high half at 0, `Math.random()` would never exceed 0.55. Setting the lowest bit of both halves rules this out.
- In the emulator, 400 starts 1 to 5 s apart gave the same palette as the previous start in 35 % of cases (by chance: 33 %) and 400 different images.
- An image takes 20.5 calls to `Math.random()` on average: one each for the palette, the start color and the direction, and 17.5 for `a` (1.42 attempts of 12.3 calls, including the repeated draws when an excluded neighbor comes up). With a random `a[0]`, as up to version 0.06, it took 1.42 calls more.

## Color palettes

Three 11-color wheels. Every image uses one of them at random and shows all of its 11 colors in wheel order, from a random start color, in one of the two directions. As the wheels have as many colors as the grid has columns, no colors are interpolated. The code only interpolates evenly spaced colors between the key colors if their number differs from N.

| Palette | Source |
|---|---|
| 1 | Sampled from a 12 × 12 square by Lohse (original), reduced to 11 colors |
| 2 | Fully saturated HSV wheel in 30° steps, from yellow (60°) through red, blue and cyan to chartreuse (90°), spring green (150°) omitted |
| 3 | Measured from Lohse's 8 × 8 painting (1955/1969), reduced to 11 colors |

The display of the Bangle.js 2 shows 8 colors (3 bit). All other colors are dithered in a 2 × 2 pixel pattern, which gives 5 levels per channel. Two neighbors on the wheel can therefore end up with the same pattern and look identical. As every image of a palette shows the same 11 colors, such a pair appears in all of its images or in none:

| Palette | Display colors (no dithering) | Look-alike neighbors |
|---|---|---|
| 1 | yellow | none |
| 2 | yellow, red, magenta, blue, cyan, green | none |
| 3 | none | yellow and golden yellow, in every image |

In palette 2, the other five colors (orange, rose, violet, azure, chartreuse) are dithered as 50 % mixtures of their two neighbors. In palette 3, the Lohse rules still hold for the color numbers, but as neighbors on the wheel are also neighbors within the rows, the yellow pair looks like a double tile.

## The digit font

### From seven segments to 4 × 5 tiles

A seven-segment digit drawn with tiles needs 5 rows: top bar, upper verticals, middle bar, lower verticals, bottom bar. Two rows of digits and one spacing row make 5 + 1 + 5 = 11 rows, exactly the height of the grid.

```
a  a  a  a      a        top bar, row 1, full width
f  ·  ·  b      f, b     upper verticals, rows 1-3
*  g  g  *      g        middle bar, row 3, inner two tiles only
e  ·  ·  c      e, c     lower verticals, rows 3-5
d  d  d  d      d        bottom bar, row 5, full width
```

- **Closed segments:** The bars run across the full width, and the corner tiles belong to two segments at once (a+f, a+b, e+d, c+d). A tile is black if any of its segments is on.
- **Vertical segments:** Each one is 3 tiles long. The upper and lower verticals share the tile in the middle row (`*`: f+e on the left, b+c on the right).
- **Middle bar:** It only covers the inner two tiles, the outer tiles of the middle row come from the verticals. This gives the 3 a short middle bar, while 2, 4, 5, 6, 8 and 9 get a full one.
- **The digit 1:** It is segments b + c, so it fills the full right column.

```
 0      1      2      3      4
████   ···█   ████   ████   █··█
█··█   ···█   ···█   ···█   █··█
█··█   ···█   ████   ·███   ████
█··█   ···█   █···   ···█   ···█
████   ···█   ████   ████   ···█

 5      6      7      8      9
████   █···   ████   ████   ████
█···   █···   ···█   █··█   █··█
████   ████   ···█   ████   ████
···█   █··█   ···█   █··█   ···█
████   ████   ···█   ████   ···█
```

The fifth row gives every digit a row of its own between the middle bar and the bottom bar. The bottoms of 2, 3, 5, 6 and 8 are therefore open instead of solid blocks: 2, 3 and 5 have a single vertical tile there (`█···` or `···█`), 6 and 8 an inner hole (`█··█`).

### Tail-less 6 and 9

The 6 has no top bar and the 9 has no bottom bar, as on classic TTL decoders such as the 7447. With these "tails", the 6 would differ from 5 and 8 by a single tile, and the 9 from 5 and 8 as well. Without them, every pair of digits differs by at least 2 tiles.

The short middle bar of the 3 works the same way: with a full one, the 3 would differ from 2, 5 and 8 by only 2 tiles. With the short one, it differs from every other digit by at least 3 tiles.

The closest pairs, 2 tiles apart, are 0/8, 2/8, 4/9 and 5/8.

### Known weaknesses

- The 1 leaves the three left columns of its cell empty. This is most noticeable when it is the first digit, from 10:00 to 19:59.
- Dark colors such as purple contrast less with the black digit tiles than light ones. While the watch is unlocked, the pulse makes them paler for 2 s out of 3.

## Layout

- HH sits in the upper half and MM in the lower half. There is no colon. DD/MM and MM/SS use the same layout.
- Every digit is 4 tiles wide and 5 tiles high. The space between the two digits of a number and between HH and MM is 1 tile.
- Vertically, 5 + 1 + 5 = 11 rows: the digits fill the full height of the screen.
- Horizontally, 4 + 1 + 4 = 9 columns: the digit block is centred with a margin of 1 column left and right.

| Grid | Tile size | Digit tile (gap 4 px) | Digit size | Digit spacing | Margin |
|---|---|---|---|---|---|
| 11 × 11 | 16 px | 12 × 12 px | 60 × 76 px | 1 tile | 1 column left and right, none above and below |

## Tiles and gaps

- **Tile boundaries:** 11 divides 176 evenly, so every tile is exactly 16 × 16 px.
- **Gaps:** The tiles of the Lohse square fill their cells completely. Each digit tile is drawn GAP px (default 4) smaller than its cell, which leaves a frame of 2 px on every side and a gap of 4 px between two digit tiles. For an even gap, the space is split equally between the two sides; for an odd gap, the extra pixel goes right and below. The gap is transparent: it shows the color of the cell underneath, so two adjacent digit tiles are separated by the colors of their own cells.
- **Colors:** The digit tiles are black, everything else shows the color of the Lohse square (paler during the pulse while unlocked), apart from the [white lines](#white-lines) while unlocked. The system theme is ignored. With GAP = 0, the digit tiles fill their cells and touch.

## Configuration

There are no user settings. Six constants at the top of `app.js`:

```js
const FAST_LOAD = true;       // widgets on swipe down and fast loading (false: neither)
const N = 11;                 // grid size: 11 x 11 tiles, two rows of 5-tile digits + 1 row
const GAP = 4;                // gap between digit tiles in px (0 to 4): a border of GAP/2 px
const PULSE_PALE = 2000;      // unlocked: all tiles pale for 2 s,
const PULSE_NORMAL = 1000;    //   then in their own colors for 1 s (both whole seconds)
const LIGHTEN = 0.25;         // pale: blended with white by 0.25 (0.5: paler)
```

- **FAST_LOAD:** see [Fast loading and widgets](#fast-loading-and-widgets).
- **N:** The 4 × 5 font and the layout are made for 11 × 11 tiles. Other grid sizes are not supported.
- **GAP:** see [Tiles and gaps](#tiles-and-gaps).
- **PULSE_PALE, PULSE_NORMAL:** milliseconds of the pale and of the normal phase of the pulse, whole seconds only: the pulse switches with the redraw every second, see [Light pulse](#light-pulse).
- **LIGHTEN:** how much the pale colors are blended with white, from 0 (unchanged) to 1 (white).

The color palette is chosen at random for every image.

## Installation

Requirements:

- Bangle.js 2 firmware 2v19 or later (for `Bangle.prependListener`).
- The BangleApps module `widget_utils`, used with `FAST_LOAD = true` only. The Web IDE adds it to the code when uploading from the editor. It loads it from `https://banglejs.com/apps/modules`, which is part of the default Module URL setting. The App Loader bundles it automatically.

Steps:

1. **App Loader:** Copy this folder to `apps/tegula` of a fork of [BangleApps](https://github.com/espruino/BangleApps) and install Tegula from the App Loader of that fork (or a local one). It stores `app.js` as `tegula.app.js` and the icon as `tegula.img`, and writes `tegula.info`.
2. **Try it out without installing:** Open the [Espruino Web IDE](https://www.espruino.com/ide/), connect the watch and upload `app.js` to RAM.
3. **Install by hand:**
   - Upload `app.js` from the editor to Storage as `tegula.app.js`.
   - Run in the console:
     ```js
     require("Storage").writeJSON("tegula.info", {id:"tegula", name:"Tegula", type:"clock", src:"tegula.app.js"});
     ```
   - Select it under Settings → System → Clock.

## Fast loading and widgets

`FAST_LOAD` at the top of `app.js` switches fast loading and the widgets on or off together. They depend on each other: fast loading keeps the widgets of one app in memory for the next one.

**`FAST_LOAD = true`** (default): The clock loads the widgets and keeps them hidden until they are swiped down. Its `remove` handler stops the timers, removes the event listeners, switches the flash light off (restoring timeouts and brightness) and shows the widgets again. All variables are block-scoped and freed on unload. The launcher therefore starts without a reset, and so does the clock on the way back. This includes the Fastload Utils app (now deprecated), which only fast loads apps that call `Bangle.loadWidgets()`.

**`FAST_LOAD = false`**: The clock loads no widgets and does not use `widget_utils`, so swipe down has no effect. The widgets, their timers and the 16-bit buffer of the hidden widget bar (176 × 26 px, 9 KB) need neither memory nor processor time. As the clock has no `remove` handler, the launcher starts with a full reset, which also restores the timeouts and the brightness if the flash light is on.

A launcher that supports fast loading still starts the clock without a reset. To decide whether this is safe, the boot loader and Fastload Utils only search the code of the clock for the text `Bangle.loadWidgets`, which `app.js` contains in both cases. If widgets of the previous app are still in memory, the clock therefore reloads itself with a full reset (`load(__FILE__)`), as the boot loader does for clocks without widgets. After a launcher without widgets (for example the Launcher app in full screen mode), it keeps running.

In the emulator with its 5 default widgets, the whole system used 1467 memory blocks of 14 bytes with the clock running and `FAST_LOAD = true`, and 508 with `false`.

## Testing

Version 0.02 (light pulse, no hourly image) was checked in a Node.js simulation of the screen and the timers (in the pale phase all 121 tiles pale and the black squares intact, pale for 2 s and normal for 1 s in all three views, the normal phase pixel-identical to the drawing without pulse, the flash light, the screen lock, no timers left after `remove`), and the locked screen was compared pixel by pixel with version 0.01 over 30 minutes: identical. In the official Bangle.js 2 emulator, it ran without errors or warnings: locked, no pulse; unlocked, pale for 2 s and normal for 1 s in all three views (the first pale phase 1.5 to 2.5 s), the digits stayed black; after `remove`, only the timers of the system and of the battery widget were left. The BangleApps sanity check and the BangleApps ESLint rules for the app folder gave no errors or warnings. The full test run described next was made with the earlier development version 0.07 and has not been repeated for 0.02.

The two lines of 0.02 (white, 2 px) were checked in the Node.js simulation: at every redraw, every pixel of the screen against a model of the tiles, the digit squares and both lines in their drawing order, in all three views, with the countdown length 2 × round(88 × remaining / timeout) every second, the corner, the restart by a touch, no countdown with a timeout of 0, no lines with the flash light or when locked, no timers or listeners left after `remove`, and the same with timers firing up to 40 ms late or 0.4 ms early. The locked screen stayed pixel-identical to version 0.01 over 30 minutes. The emulator checks were made with the earlier red lines of 1 px: with taps and swipes through its touch controller, the view line in all three views, the countdown from 176 px to 0 in 10 s, restarted by a tap and by swipes, the shape of both lines against the tiles and their 2 × 2 dither pattern, LCD timeout 0, the flash light, and the locked screen pixel-identical before unlocking and after locking. The emulator does not lock by itself, so the screen was locked with `Bangle.setLocked(true)`.

Version 0.07 was run on the official Bangle.js 2 emulator (Espruino firmware 2v29.74, compiled to JavaScript, from the Espruino Web IDE) in Node.js, together with the current Bootloader (0.69), Launcher (0.27) and Fastload Utils (0.07) from BangleApps. It was installed through the BangleApps App Loader library, pretokenised as by default and with `widget_utils` bundled. The emulator took its time from a simulated clock, touches and swipes went through its touch controller and button presses through its pin events. The digit tiles were compared with a separately derived copy of the font, and every checked screen was compared pixel by pixel with a model built from the Lohse square, the digit tiles and the 2 × 2 dither pattern of the firmware.

Covered with `FAST_LOAD = true` and `false`:

- 3000 images by swipe up: all Lohse squares valid (`a[0] = 0`, Latin, diagonal neighbors different, also across the edges), all different; palettes 977, 1033 and 990 times, each start color 257 to 289 times, the two directions 1514 and 1486 times
- HH/MM for every minute of a day in UTC+2, 1 ms after the start and 1 ms before the end of each minute: all digit tiles correct, no pixel differences; the image changed at the 23 full hours and at midnight, and at no other time
- DD/MM and MM/SS across New Year, a second swipe in the same direction, the return to HH/MM when the screen locks
- the blinking tile in its 500 ms rhythm, the return to normal when the screen locks
- flash light: white screen, timeouts off, swipes ignored, the same image afterwards; double taps that are too slow or outside the area
- swipe down: `true` shows the widget bar, which hides after 2 s, also after a right swipe, and swipe up only hides it; `false` does nothing. Swipe up with the bar hidden: new image
- 20 cycles clock → launcher (button) → clock (back): `true` without a reset in both directions, `false` with a full reset when leaving and a reload when the launcher fast loads the clock with its widgets; each time only the timers and the 3 listeners of the clock while it runs and none in the launcher; memory unchanged over the cycles. The same with Fastload Utils, also when the launcher starts the clock as an app
- the Launcher in full screen mode (no widgets): with `false`, the clock keeps running after the fast load, without widgets
- leaving the clock with the flash light on: timeouts restored in the launcher
- memory of the whole system with the clock running: 1508 blocks with version 0.06, 1467 with `true` (the font strings are freed after the start), 508 with `false`
- the views, the blinking tile, the flash light, the widgets, the 20 cycles and the memory also with the plain source instead of the pretokenised one

Also covered:

- seeding: 400 starts 1 to 5 s apart, all images different (see [Random numbers](#random-numbers))
- the dither patterns of the three palettes (see [Color palettes](#color-palettes))
- the BangleApps sanity check and the BangleApps ESLint rules for the app folder: no errors or warnings

No errors occurred. Drawing time and battery use were not measured on a watch.

## Notice

The background images of the clock face are generated programmatically using random numbers and are therefore independent 'creations'. They do not constitute reproductions of Richard Paul Lohse's works.

## Files

| File | Content |
|---|---|
| `app.js` | Clock face (`tegula.app.js` on the watch) |
| `app-icon.js` | Launcher icon, 48 × 48 px (`tegula.img`) |
| `app.png` | Icon for the App Loader |
| `metadata.json` | App Loader metadata |
| `ChangeLog` | Version history |
| `screenshot.png` | Screenshot for the App Loader |
| `preview.png` | Preview at 12:34, all three color palettes |
