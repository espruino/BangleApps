/* Note: This file was automatically generated. */

/**
 * This library allows you to write to Neopixel/WS281x/APA10x/SK6812 LED strips
 * These use a high speed single-wire protocol which needs platform-specific
 * implementation on some devices - hence this library to simplify things.
 * @url http://www.espruino.com/Reference#l_neopixel_undefined
 */
declare function neopixel(): void;

/**
 * This library provides TV out capability on the Espruino and Espruino Pico.
 * See the [Television](https://espruino.com//Television) page for more information.
 * @url http://www.espruino.com/Reference#l_tv_undefined
 */
declare function tv(): void;

/**
 * The NRF class is for controlling functionality of the Nordic nRF51/nRF52 chips.
 * Most functionality is related to Bluetooth Low Energy, however there are also some functions related to NFC that apply to NRF52-based devices.
 * @url http://www.espruino.com/Reference#NRF
 */
declare function NRF(): void;

declare namespace NRF {
  /**
   * @url http://www.espruino.com/Reference#l_NRF_getSecurityStatus
   */
  function getSecurityStatus(): any;

  /**
   * Get this device's default Bluetooth MAC address.
   * For Puck.js, the last 5 characters of this (eg. `ee:ff`)
   * are used in the device's advertised Bluetooth name.
   * @url http://www.espruino.com/Reference#l_NRF_getAddress
   */
  function getAddress(): any;

  /**
   * @url http://www.espruino.com/Reference#l_NRF_setServices
   */
  function setServices(data: any, options: any): void;

  /**
   * @url http://www.espruino.com/Reference#l_NRF_setAdvertising
   */
  function setAdvertising(data: any, options: any): void;

  /**
   * If a device is connected to Espruino, disconnect from it.
   * @url http://www.espruino.com/Reference#l_NRF_disconnect
   */
  function disconnect(): void;

  /**
   * Disable Bluetooth advertising and disconnect from any device that
   * connected to Puck.js as a peripheral (this won't affect any devices
   * that Puck.js initiated connections to).
   * This makes Puck.js undiscoverable, so it can't be connected to.
   * Use `NRF.wake()` to wake up and make Puck.js connectable again.
   * @url http://www.espruino.com/Reference#l_NRF_sleep
   */
  function sleep(): void;

  /**
   * Enable Bluetooth advertising (this is enabled by default), which
   * allows other devices to discover and connect to Puck.js.
   * Use `NRF.sleep()` to disable advertising.
   * @url http://www.espruino.com/Reference#l_NRF_wake
   */
  function wake(): void;

  /**
   * Restart the Bluetooth softdevice (if there is currently a BLE connection,
   * it will queue a restart to be done when the connection closes).
   * You shouldn't need to call this function in normal usage. However, Nordic's
   * BLE softdevice has some settings that cannot be reset. For example there
   * are only a certain number of unique UUIDs. Once these are all used the
   * only option is to restart the softdevice to clear them all out.
   * @url http://www.espruino.com/Reference#l_NRF_restart
   */
  function restart(callback: any): void;

  /**
   * Get the battery level in volts (the voltage that the NRF chip is running off of).
   * This is the battery level of the device itself - it has nothing to with any
   * device that might be connected.
   * @url http://www.espruino.com/Reference#l_NRF_getBattery
   */
  function getBattery(): number;

  /**
   * This is just like `NRF.setAdvertising`, except instead of advertising
   * the data, it returns the packet that would be advertised as an array.
   * @url http://www.espruino.com/Reference#l_NRF_getAdvertisingData
   */
  function getAdvertisingData(data: any, options: any): any;

  /**
   * Set the BLE radio transmit power. The default TX power is 0 dBm, and
   * @url http://www.espruino.com/Reference#l_NRF_setTxPower
   */
  function setTxPower(power: number): void;

  /**
   * **THIS IS DEPRECATED** - please use `NRF.setConnectionInterval` for
   * peripheral and `NRF.connect(addr, options)`/`BluetoothRemoteGATTServer.connect(options)`
   * for central connections.
   * This sets the connection parameters - these affect the transfer speed and
   * power usage when the device is connected.
   *
   * - When not low power, the connection interval is between 7.5 and 20ms
   * - When low power, the connection interval is between 500 and 1000ms
   *
   * When low power connection is enabled, transfers of data over Bluetooth
   * will be very slow, however power usage while connected will be drastically
   * decreased.
   * This will only take effect after the connection is disconnected and
   * re-established.
   * @url http://www.espruino.com/Reference#l_NRF_setLowPowerConnection
   */
  function setLowPowerConnection(lowPower: boolean): void;

  /**
   * Send a USB HID report. HID must first be enabled with `NRF.setServices({}, {hid: hid_report})`
   * @url http://www.espruino.com/Reference#l_NRF_sendHIDReport
   */
  function sendHIDReport(data: any, callback: any): void;

  /**
   * Check if Apple Notification Center Service (ANCS) is currently active on the BLE connection
   * @url http://www.espruino.com/Reference#l_NRF_ancsIsActive
   */
  function ancsIsActive(): boolean;

  /**
   * Send an ANCS action for a specific Notification UID. Corresponds to posaction/negaction in the 'ANCS' event that was received
   * @url http://www.espruino.com/Reference#l_NRF_ancsAction
   */
  function ancsAction(uid: number, positive: boolean): void;

  /**
   * Get ANCS info for a notification, eg:
   * @url http://www.espruino.com/Reference#l_NRF_ancsGetNotificationInfo
   */
  function ancsGetNotificationInfo(uid: number): Promise<any>;

  /**
   * Check if Apple Media Service (AMS) is currently active on the BLE connection
   * @url http://www.espruino.com/Reference#l_NRF_amsIsActive
   */
  function amsIsActive(): boolean;

  /**
   * Get Apple Media Service (AMS) info for the current media player.
   * "playbackinfo" returns a concatenation of three comma-separated values:
   *
   * - PlaybackState: a string that represents the integer value of the playback state:
   * - PlaybackStatePaused = 0
   * - PlaybackStatePlaying = 1
   * - PlaybackStateRewinding = 2
   * - PlaybackStateFastForwarding = 3
   *
   *
   * - PlaybackRate: a string that represents the floating point value of the playback rate.
   * - ElapsedTime: a string that represents the floating point value of the elapsed time of the current track, in seconds
   *
   * @url http://www.espruino.com/Reference#l_NRF_amsGetPlayerInfo
   */
  function amsGetPlayerInfo(id: any): Promise<any>;

  /**
   * Get Apple Media Service (AMS) info for the currently-playing track
   * @url http://www.espruino.com/Reference#l_NRF_amsGetTrackInfo
   */
  function amsGetTrackInfo(id: any): Promise<any>;

  /**
   * Send an AMS command to an Apple Media Service device to control music playback
   * Command is one of play, pause, playpause, next, prev, volup, voldown, repeat, shuffle, skipforward, skipback, like, dislike, bookmark
   * @url http://www.espruino.com/Reference#l_NRF_amsCommand
   */
  function amsCommand(id: any): void;

  /**
   * If set to true, whenever a device bonds it will be added to the
   * whitelist.
   * When set to false, the whitelist is cleared and newly bonded
   * devices will not be added to the whitelist.
   * **Note:** This is remembered between `reset()`s but isn't
   * remembered after power-on (you'll have to add it to `onInit()`.
   * @url http://www.espruino.com/Reference#l_NRF_setWhitelist
   */
  function setWhitelist(whitelisting: boolean): void;

  /**
   * When connected, Bluetooth LE devices communicate at a set interval.
   * Lowering the interval (eg. more packets/second) means a lower delay when
   * sending data, higher bandwidth, but also more power consumption.
   * By default, when connected as a peripheral Espruino automatically adjusts the
   * connection interval. When connected it's as fast as possible (7.5ms) but when idle
   * for over a minute it drops to 200ms. On continued activity (>1 BLE operation) the
   * interval is raised to 7.5ms again.
   * The options for `interval` are:
   *
   * - `undefined` / `"auto"` : (default) automatically adjust connection interval
   * - `100` : set min and max connection interval to the same number (between 7.5ms and 4000ms)
   * - `{minInterval:20, maxInterval:100}` : set min and max connection interval as a range
   *
   * This configuration is not remembered during a `save()` - you will have to
   * re-set it via `onInit`.
   * **Note:** If connecting to another device (as Central), you can use
   * an extra argument to `NRF.connect` or `BluetoothRemoteGATTServer.connect`
   * to specify a connection interval.
   * **Note:** This overwrites any changes imposed by the deprecated `NRF.setLowPowerConnection`
   * @url http://www.espruino.com/Reference#l_NRF_setConnectionInterval
   */
  function setConnectionInterval(interval: any): void;

  /**
   * @url http://www.espruino.com/Reference#l_NRF_startBonding
   */
  function startBonding(forceRepair: boolean): any;

}

/**
 * The Bluetooth Serial port - used when data is sent or received over Bluetooth Smart on nRF51/nRF52 chips.
 * @url http://www.espruino.com/Reference#l__global_Bluetooth
 */
declare const Bluetooth: Serial & {
  /**
   * @url http://www.espruino.com/Reference#l_Bluetooth_setConsole
   */
  setConsole: () => void;

};

/**
 * Class containing utility functions for the Seeed WIO LTE board
 * @url http://www.espruino.com/Reference#WioLTE
 */
declare function WioLTE(): void;

declare namespace WioLTE {
  /**
   * Set the WIO's LED
   * @url http://www.espruino.com/Reference#l_WioLTE_LED
   */
  function LED(red: number, green: number, blue: number): void;

  /**
   * Set the power of Grove connectors, except for `D38` and `D39` which are always on.
   * @url http://www.espruino.com/Reference#l_WioLTE_setGrovePower
   */
  function setGrovePower(onoff: boolean): void;

  /**
   * Turn power to the WIO's LED on or off.
   * Turning the LED on won't immediately display a color - that must be done with `WioLTE.LED(r,g,b)`
   * @url http://www.espruino.com/Reference#l_WioLTE_setLEDPower
   */
  function setLEDPower(onoff: boolean): void;

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_D38
   */
  const D38: any;

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_D20
   */
  const D20: any;

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_A6
   */
  const A6: any;

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_I2C
   */
  const I2C: any;

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_UART
   */
  const UART: any;

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_A4
   */
  const A4: any;

}

/**
 * This class provides Graphics operations that can be applied to a surface.
 * Use Graphics.createXXX to create a graphics object that renders in the way you want. See [the Graphics page](https://www.espruino.com/Graphics) for more information.
 * **Note:** On boards that contain an LCD, there is a built-in 'LCD' object of type Graphics. For instance to draw a line you'd type: `LCD.drawLine(0,0,100,100)`
 * @url http://www.espruino.com/Reference#Graphics
 */
declare function Graphics(): void;

declare namespace Graphics {
  /**
   * On devices like Pixl.js or HYSTM boards that contain a built-in display
   * this will return an instance of the graphics class that can be used to
   * access that display.
   * Internally, this is stored as a member called `gfx` inside the 'hiddenRoot'.
   * @url http://www.espruino.com/Reference#l_Graphics_getInstance
   */
  function getInstance(): any;

  /**
   * Create a Graphics object that renders to an Array Buffer. This will have a field called 'buffer' that can get used to get at the buffer itself
   * @url http://www.espruino.com/Reference#l_Graphics_createArrayBuffer
   */
  function createArrayBuffer(width: number, height: number, bpp: number, options: any): Graphics;

  /**
   * Create a Graphics object that renders by calling a JavaScript callback function to draw pixels
   * @url http://www.espruino.com/Reference#l_Graphics_createCallback
   */
  function createCallback(width: number, height: number, bpp: number, callback: any): Graphics;

  /**
   * Create a Graphics object that renders to SDL window (Linux-based devices only)
   * @url http://www.espruino.com/Reference#l_Graphics_createSDL
   */
  function createSDL(width: number, height: number, bpp: number): Graphics;

}

type Graphics = {
  /**
   * Set the current font
   * @url http://www.espruino.com/Reference#l_Graphics_setFont6x15
   */
  setFont6x15: (scale: number) => Graphics;

  /**
   * On instances of graphics that drive a display with
   * an offscreen buffer, calling this function will
   * copy the contents of the offscreen buffer to the
   * screen.
   * Call this when you have drawn something to Graphics
   * and you want it shown on the screen.
   * If a display does not have an offscreen buffer,
   * it may not have a `g.flip()` method.
   * On Bangle.js 1, there are different graphics modes
   * chosen with `Bangle.setLCDMode()`. The default mode
   * is unbuffered and in this mode `g.flip()` does not
   * affect the screen contents.
   * On some devices, this command will attempt to
   * only update the areas of the screen that have
   * changed in order to increase speed. If you have
   * accessed the `Graphics.buffer` directly then you
   * may need to use `Graphics.flip(true)` to force
   * a full update of the screen.
   * @url http://www.espruino.com/Reference#l_Graphics_flip
   */
  flip: (all: boolean) => void;

  /**
   * The width of this Graphics instance
   * @url http://www.espruino.com/Reference#l_Graphics_getWidth
   */
  getWidth: () => number;

  /**
   * The height of this Graphics instance
   * @url http://www.espruino.com/Reference#l_Graphics_getHeight
   */
  getHeight: () => number;

  /**
   * The number of bits per pixel of this Graphics instance
   * **Note:** Bangle.js 2 behaves a little differently here. The display
   * is 3 bit, so `getBPP` returns 3 and `asBMP`/`asImage`/etc return 3 bit images.
   * However in order to allow dithering, the colors returned by `Graphics.getColor` and `Graphics.theme`
   * are actually 16 bits.
   * @url http://www.espruino.com/Reference#l_Graphics_getBPP
   */
  getBPP: () => number;

  /**
   * Reset the state of Graphics to the defaults (eg. Color, Font, etc)
   * that would have been used when Graphics was initialised.
   * @url http://www.espruino.com/Reference#l_Graphics_reset
   */
  reset: () => Graphics;

  /**
   * Clear the LCD with the Background Color
   * @url http://www.espruino.com/Reference#l_Graphics_clear
   */
  clear: (reset: boolean) => Graphics;

  /**
   * Fill a rectangular area in the Foreground Color
   * On devices with enough memory, you can specify `{x,y,x2,y2,r}` as the first
   * argument, which allows you to draw a rounded rectangle.
   * @url http://www.espruino.com/Reference#l_Graphics_fillRect
   */
  fillRect: (x1: any, y1: number, x2: number, y2: number) => Graphics;

  /**
   * Fill a rectangular area in the Background Color
   * On devices with enough memory, you can specify `{x,y,x2,y2,r}` as the first
   * argument, which allows you to draw a rounded rectangle.
   * @url http://www.espruino.com/Reference#l_Graphics_clearRect
   */
  clearRect: (x1: any, y1: number, x2: number, y2: number) => Graphics;

  /**
   * Draw an unfilled rectangle 1px wide in the Foreground Color
   * @url http://www.espruino.com/Reference#l_Graphics_drawRect
   */
  drawRect: (x1: any, y1: number, x2: number, y2: number) => Graphics;

  /**
   * Draw a filled circle in the Foreground Color
   * @url http://www.espruino.com/Reference#l_Graphics_fillCircle
   */
  fillCircle: (x: number, y: number, rad: number) => Graphics;

  /**
   * Draw an unfilled circle 1px wide in the Foreground Color
   * @url http://www.espruino.com/Reference#l_Graphics_drawCircle
   */
  drawCircle: (x: number, y: number, rad: number) => Graphics;

  /**
   * Draw a circle, centred at (x,y) with radius r in the current foreground color
   * @url http://www.espruino.com/Reference#l_Graphics_drawCircleAA
   */
  drawCircleAA: (x: number, y: number, r: number) => Graphics;

  /**
   * Draw a filled ellipse in the Foreground Color
   * @url http://www.espruino.com/Reference#l_Graphics_fillEllipse
   */
  fillEllipse: (x1: number, y1: number, x2: number, y2: number) => Graphics;

  /**
   * Draw an ellipse in the Foreground Color
   * @url http://www.espruino.com/Reference#l_Graphics_drawEllipse
   */
  drawEllipse: (x1: number, y1: number, x2: number, y2: number) => Graphics;

  /**
   * Get a pixel's color
   * @url http://www.espruino.com/Reference#l_Graphics_getPixel
   */
  getPixel: (x: number, y: number) => number;

  /**
   * Set a pixel's color
   * @url http://www.espruino.com/Reference#l_Graphics_setPixel
   */
  setPixel: (x: number, y: number, col: any) => Graphics;

  /**
   * Set the color to use for subsequent drawing operations.
   * If just `r` is specified as an integer, the numeric value will be written directly into a pixel. eg. On a 24 bit `Graphics` instance you set bright blue with either `g.setColor(0,0,1)` or `g.setColor(0x0000FF)`.
   * A good shortcut to ensure you get white on all platforms is to use `g.setColor(-1)`
   * The mapping is as follows:
   *
   * - 32 bit: `r,g,b` => `0xFFrrggbb`
   * - 24 bit: `r,g,b` => `0xrrggbb`
   * - 16 bit: `r,g,b` => `0brrrrrggggggbbbbb` (RGB565)
   * - Other bpp: `r,g,b` => white if `r+g+b > 50%`, otherwise black (use `r` on its own as an integer)
   *
   * If you specified `color_order` when creating the `Graphics` instance, `r`,`g` and `b` will be swapped as you specified.
   * **Note:** On devices with low flash memory, `r` **must** be an integer representing the color in the current bit depth. It cannot
   * be a floating point value, and `g` and `b` are ignored.
   * @url http://www.espruino.com/Reference#l_Graphics_setColor
   */
  setColor: (r: any, g: any, b: any) => Graphics;

  /**
   * Set the background color to use for subsequent drawing operations.
   * See `Graphics.setColor` for more information on the mapping of `r`, `g`, and `b` to pixel values.
   * **Note:** On devices with low flash memory, `r` **must** be an integer representing the color in the current bit depth. It cannot
   * be a floating point value, and `g` and `b` are ignored.
   * @url http://www.espruino.com/Reference#l_Graphics_setBgColor
   */
  setBgColor: (r: any, g: any, b: any) => Graphics;

  /**
   * Get the color to use for subsequent drawing operations
   * @url http://www.espruino.com/Reference#l_Graphics_getColor
   */
  getColor: () => number;

  /**
   * Get the background color to use for subsequent drawing operations
   * @url http://www.espruino.com/Reference#l_Graphics_getBgColor
   */
  getBgColor: () => number;

  /**
   * This sets the 'clip rect' that subsequent drawing operations are clipped to
   * sit between.
   * These values are inclusive - eg `g.setClipRect(1,0,5,0)` will ensure that only
   * pixel rows 1,2,3,4,5 are touched on column 0.
   * **Note:** For maximum flexibility on Bangle.js 1, the values here are not range checked. For normal
   * use, X and Y should be between 0 and `getWidth()-1`/`getHeight()-1`.
   * **Note:** The x/y values here are rotated, so that if `Graphics.setRotation` is used
   * they correspond to the coordinates given to the draw functions, *not to the
   * physical device pixels*.
   * @url http://www.espruino.com/Reference#l_Graphics_setClipRect
   */
  setClipRect: (x1: number, y1: number, x2: number, y2: number) => Graphics;

  /**
   * Make subsequent calls to `drawString` use the built-in 4x6 pixel bitmapped Font
   * It is recommended that you use `Graphics.setFont("4x6")` for more flexibility.
   * @url http://www.espruino.com/Reference#l_Graphics_setFontBitmap
   */
  setFontBitmap: () => Graphics;

  /**
   * Make subsequent calls to `drawString` use a Vector Font of the given height.
   * It is recommended that you use `Graphics.setFont("Vector", size)` for more flexibility.
   * @url http://www.espruino.com/Reference#l_Graphics_setFontVector
   */
  setFontVector: (size: number) => Graphics;

  /**
   * Make subsequent calls to `drawString` use a Custom Font of the given height. See the [Fonts page](http://www.espruino.com/Fonts) for more
   * information about custom fonts and how to create them.
   * For examples of use, see the [font modules](https://www.espruino.com/Fonts#font-modules).
   * **Note:** while you can specify the character code of the first character with `firstChar`,
   * the newline character 13 will always be treated as a newline and not rendered.
   * @url http://www.espruino.com/Reference#l_Graphics_setFontCustom
   */
  setFontCustom: (bitmap: any, firstChar: number, width: any, height: number) => Graphics;

  /**
   * Set the alignment for subsequent calls to `drawString`
   * @url http://www.espruino.com/Reference#l_Graphics_setFontAlign
   */
  setFontAlign: (x: number, y: number, rotation: number) => Graphics;

  /**
   * Set the font by name. Various forms are available:
   *
   * - `g.setFont("4x6")` - standard 4x6 bitmap font
   * - `g.setFont("Vector:12")` - vector font 12px high
   * - `g.setFont("4x6:2")` - 4x6 bitmap font, doubled in size
   * - `g.setFont("6x8:2x3")` - 6x8 bitmap font, doubled in width, tripled in height
   *
   * You can also use these forms, but they are not recommended:
   *
   * - `g.setFont("Vector12")` - vector font 12px high
   * - `g.setFont("4x6",2)` - 4x6 bitmap font, doubled in size
   *
   * `g.getFont()` will return the current font as a String.
   * For a list of available font names, you can use `g.getFonts()`.
   * @url http://www.espruino.com/Reference#l_Graphics_setFont
   */
  setFont: (name: any, size: number) => Graphics;

  /**
   * Get the font by name - can be saved and used with `Graphics.setFont`.
   * Normally this might return something like `"4x6"`, but if a scale
   * factor is specified, a colon and then the size is reported, like "4x6:2"
   * **Note:** For custom fonts, `Custom` is currently
   * reported instead of the font name.
   * @url http://www.espruino.com/Reference#l_Graphics_getFont
   */
  getFont: () => string;

  /**
   * Return an array of all fonts currently in the Graphics library.
   * **Note:** Vector fonts are specified as `Vector#` where `#` is the font height. As there
   * are effectively infinite fonts, just `Vector` is included in the list.
   * @url http://www.espruino.com/Reference#l_Graphics_getFonts
   */
  getFonts: () => any[];

  /**
   * Return the height in pixels of the current font
   * @url http://www.espruino.com/Reference#l_Graphics_getFontHeight
   */
  getFontHeight: () => number;

  /**
   * Return the size in pixels of a string of text in the current font
   * @url http://www.espruino.com/Reference#l_Graphics_stringWidth
   */
  stringWidth: (str: any) => number;

  /**
   * Return the width and height in pixels of a string of text in the current font
   * @url http://www.espruino.com/Reference#l_Graphics_stringMetrics
   */
  stringMetrics: (str: any) => any;

  /**
   * Draw a line between x1,y1 and x2,y2 in the current foreground color
   * @url http://www.espruino.com/Reference#l_Graphics_drawLine
   */
  drawLine: (x1: number, y1: number, x2: number, y2: number) => Graphics;

  /**
   * Draw a line between x1,y1 and x2,y2 in the current foreground color
   * @url http://www.espruino.com/Reference#l_Graphics_drawLineAA
   */
  drawLineAA: (x1: number, y1: number, x2: number, y2: number) => Graphics;

  /**
   * Draw a line from the last position of lineTo or moveTo to this position
   * @url http://www.espruino.com/Reference#l_Graphics_lineTo
   */
  lineTo: (x: number, y: number) => Graphics;

  /**
   * Move the cursor to a position - see lineTo
   * @url http://www.espruino.com/Reference#l_Graphics_moveTo
   */
  moveTo: (x: number, y: number) => Graphics;

  /**
   * Draw a polyline (lines between each of the points in `poly`) in the current foreground color
   * **Note:** there is a limit of 64 points (128 XY elements) for polygons
   * @url http://www.espruino.com/Reference#l_Graphics_drawPoly
   */
  drawPoly: (poly: any, closed: boolean) => Graphics;

  /**
   * Draw an **antialiased** polyline (lines between each of the points in `poly`) in the current foreground color
   * **Note:** there is a limit of 64 points (128 XY elements) for polygons
   * @url http://www.espruino.com/Reference#l_Graphics_drawPolyAA
   */
  drawPolyAA: (poly: any, closed: boolean) => Graphics;

  /**
   * Set the current rotation of the graphics device.
   * @url http://www.espruino.com/Reference#l_Graphics_setRotation
   */
  setRotation: (rotation: number, reflect: boolean) => Graphics;

  /**
   * Return the width and height in pixels of an image (either Graphics, Image Object, Image String or ArrayBuffer). Returns
   * `undefined` if image couldn't be decoded.
   * `frames` is also included is the image contains more information than you'd expect for a single bitmap. In
   * this case the bitmap might be an animation with multiple frames
   * @url http://www.espruino.com/Reference#l_Graphics_imageMetrics
   */
  imageMetrics: (str: any) => any;

  /**
   * Return this Graphics object as an Image that can be used with `Graphics.drawImage`.
   * Check out [the Graphics reference page](http://www.espruino.com/Graphics#images-bitmaps)
   * for more information on images.
   * Will return undefined if data can't be allocated for the image.
   * The image data itself will be referenced rather than copied if:
   *
   * - An image `object` was requested (not `string`)
   * - The Graphics instance was created with `Graphics.createArrayBuffer`
   * - Is 8 bpp *OR* the `{msb:true}` option was given
   * - No other format options (zigzag/etc) were given
   *
   * Otherwise data will be copied, which takes up more space and
   * may be quite slow.
   * @url http://www.espruino.com/Reference#l_Graphics_asImage
   */
  asImage: (type: any) => any;

  /**
   * Return the area of the Graphics canvas that has been modified, and optionally clear
   * the modified area to 0.
   * For instance if `g.setPixel(10,20)` was called, this would return `{x1:10, y1:20, x2:10, y2:20}`
   * @url http://www.espruino.com/Reference#l_Graphics_getModified
   */
  getModified: (reset: boolean) => any;

  /**
   * Scroll the contents of this graphics in a certain direction. The remaining area
   * is filled with the background color.
   * Note: This uses repeated pixel reads and writes, so will not work on platforms that
   * don't support pixel reads.
   * @url http://www.espruino.com/Reference#l_Graphics_scroll
   */
  scroll: (x: number, y: number) => Graphics;

  /**
   * Create a Windows BMP file from this Graphics instance, and return it as a String.
   * @url http://www.espruino.com/Reference#l_Graphics_asBMP
   */
  asBMP: () => any;

  /**
   * Create a URL of the form `data:image/bmp;base64,...` that can be pasted into the browser.
   * The Espruino Web IDE can detect this data on the console and render the image inline automatically.
   * @url http://www.espruino.com/Reference#l_Graphics_asURL
   */
  asURL: () => any;

  /**
   * Output this image as a bitmap URL of the form `data:image/bmp;base64,...`. The Espruino Web IDE will detect this on the console and will render the image inline automatically.
   * This is identical to `console.log(g.asURL())` - it is just a convenient function for easy debugging and producing screenshots of what is currently in the Graphics instance.
   * **Note:** This may not work on some bit depths of Graphics instances. It will also not work for the main Graphics instance
   * of Bangle.js 1 as the graphics on Bangle.js 1 are stored in write-only memory.
   * @url http://www.espruino.com/Reference#l_Graphics_dump
   */
  dump: () => void;

  /**
   * Calculate the square area under a Bezier curve.
   *  x0,y0: start point
   *  x1,y1: control point
   *  y2,y2: end point
   *  Max 10 points without start point.
   * @url http://www.espruino.com/Reference#l_Graphics_quadraticBezier
   */
  quadraticBezier: (arr: any, options: any) => any;

  /**
   * Set the current font
   * @url http://www.espruino.com/Reference#l_Graphics_setFont12x20
   */
  setFont12x20: (scale: number) => Graphics;

}

/**
 * A simple VT100 terminal emulator.
 * When data is sent to the `Terminal` object, `Graphics.getInstance()`
 * is called and if an instance of `Graphics` is found then characters
 * are written to it.
 * @url http://www.espruino.com/Reference#l__global_Terminal
 */
declare const Terminal: Serial;

/**
 * Class containing utility functions for accessing IO on the hexagonal badge
 * @url http://www.espruino.com/Reference#Badge
 */
declare function Badge(): void;

declare namespace Badge {
  /**
   * Capacitive sense - the higher the capacitance, the higher the number returned.
   * Supply a corner number between 1 and 6, and an integer value will be returned that is proportional to the capacitance
   * @url http://www.espruino.com/Reference#l_Badge_capSense
   */
  function capSense(corner: number): number;

  /**
   * Return an approximate battery percentage remaining based on
   * a normal CR2032 battery (2.8 - 2.2v)
   * @url http://www.espruino.com/Reference#l_Badge_getBatteryPercentage
   */
  function getBatteryPercentage(): number;

  /**
   * Set the LCD's contrast
   * @url http://www.espruino.com/Reference#l_Badge_setContrast
   */
  function setContrast(c: number): void;

}

/**
 * @url http://www.espruino.com/Reference#l_tensorflow_undefined
 */
declare function tensorflow(): void;

declare namespace tensorflow {
  /**
   * @url http://www.espruino.com/Reference#l_tensorflow_create
   */
  function create(arenaSize: number, model: any): TFMicroInterpreter;

}

/**
 * Class containing an instance of TFMicroInterpreter
 * @url http://www.espruino.com/Reference#TFMicroInterpreter
 */
declare function TFMicroInterpreter(): void;

type TFMicroInterpreter = {
  /**
   * @url http://www.espruino.com/Reference#l_TFMicroInterpreter_getInput
   */
  getInput: () => EspruinoArrayBufferView;

  /**
   * @url http://www.espruino.com/Reference#l_TFMicroInterpreter_getOutput
   */
  getOutput: () => EspruinoArrayBufferView;

  /**
   * @url http://www.espruino.com/Reference#l_TFMicroInterpreter_invoke
   */
  invoke: () => void;

}

/**
 * Cryptographic functions
 * **Note:** This library is currently only included in builds for boards where there is space. For other boards there is `crypto.js` which implements SHA1 in JS.
 * @url http://www.espruino.com/Reference#l_crypto_undefined
 */
declare function Espruinocrypto(): void;

declare namespace Espruinocrypto {
  /**
   * Class containing AES encryption/decryption
   * @url http://www.espruino.com/Reference#l_crypto_AES
   */
  const AES: any;

  /**
   * Performs a SHA1 hash and returns the result as a 20 byte ArrayBuffer.
   * **Note:** On some boards (currently only Espruino Original) there
   * isn't space for a fully unrolled SHA1 implementation so a slower
   * all-JS implementation is used instead.
   * @url http://www.espruino.com/Reference#l_crypto_SHA1
   */
  function SHA1(message: any): ArrayBuffer;

  /**
   * Performs a SHA224 hash and returns the result as a 28 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA224
   */
  function SHA224(message: any): ArrayBuffer;

  /**
   * Performs a SHA256 hash and returns the result as a 32 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA256
   */
  function SHA256(message: any): ArrayBuffer;

  /**
   * Performs a SHA384 hash and returns the result as a 48 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA384
   */
  function SHA384(message: any): ArrayBuffer;

  /**
   * Performs a SHA512 hash and returns the result as a 64 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA512
   */
  function SHA512(message: any): ArrayBuffer;

  /**
   * Password-Based Key Derivation Function 2 algorithm, using SHA512
   * @url http://www.espruino.com/Reference#l_crypto_PBKDF2
   */
  function PBKDF2(passphrase: any, salt: any, options: any): ArrayBuffer;

}

/**
 * Class containing AES encryption/decryption
 * **Note:** This library is currently only included in builds for boards where there is space. For other boards there is `crypto.js` which implements SHA1 in JS.
 * @url http://www.espruino.com/Reference#AES
 */
declare function AES(): void;

declare namespace AES {
  /**
   * @url http://www.espruino.com/Reference#l_AES_encrypt
   */
  function encrypt(passphrase: any, key: any, options: any): ArrayBuffer;

  /**
   * @url http://www.espruino.com/Reference#l_AES_decrypt
   */
  function decrypt(passphrase: any, key: any, options: any): ArrayBuffer;

}

/**
 * Class containing utility functions for the [Bangle.js Smart Watch](http://www.espruino.com/Bangle.js)
 * @url http://www.espruino.com/Reference#Bangle
 */
declare function Bangle(): void;

declare namespace Bangle {
  /**
   * This function can be used to adjust the brightness of Bangle.js's display, and
   * hence prolong its battery life.
   * Due to hardware design constraints, software PWM has to be used which
   * means that the display may flicker slightly when Bluetooth is active
   * and the display is not at full power.
   * **Power consumption**
   *
   * - 0 = 7mA
   * - 0.1 = 12mA
   * - 0.2 = 18mA
   * - 0.5 = 28mA
   * - 0.9 = 40mA (switching overhead)
   * - 1 = 40mA
   *
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDBrightness
   */
  function setLCDBrightness(brightness: number): void;

  /**
   * This function can be used to change the way graphics is handled on Bangle.js.
   * Available options for `Bangle.setLCDMode` are:
   *
   * - `Bangle.setLCDMode()` or `Bangle.setLCDMode("direct")` (the default) - The drawable area is 240x240 16 bit. Unbuffered, so draw calls take effect immediately. Terminal and vertical scrolling work (horizontal scrolling doesn't).
   * - `Bangle.setLCDMode("doublebuffered")` - The drawable area is 240x160 16 bit, terminal and scrolling will not work. `g.flip()` must be called for draw operations to take effect.
   * - `Bangle.setLCDMode("120x120")` - The drawable area is 120x120 8 bit, `g.getPixel`, terminal, and full scrolling work. Uses an offscreen buffer stored on Bangle.js, `g.flip()` must be called for draw operations to take effect.
   * - `Bangle.setLCDMode("80x80")` - The drawable area is 80x80 8 bit, `g.getPixel`, terminal, and full scrolling work. Uses an offscreen buffer stored on Bangle.js, `g.flip()` must be called for draw operations to take effect.
   *
   * You can also call `Bangle.setLCDMode()` to return to normal, unbuffered `"direct"` mode.
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDMode
   */
  function setLCDMode(mode: any): void;

  /**
   * The current LCD mode.
   * See `Bangle.setLCDMode` for examples.
   * @url http://www.espruino.com/Reference#l_Bangle_getLCDMode
   */
  function getLCDMode(): any;

  /**
   * This can be used to move the displayed memory area up or down temporarily. It's
   * used for displaying notifications while keeping the main display contents
   * intact.
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDOffset
   */
  function setLCDOffset(y: number): void;

  /**
   * This function can be used to turn Bangle.js's LCD power saving on or off.
   * With power saving off, the display will remain in the state you set it with `Bangle.setLCDPower`.
   * With power saving on, the display will turn on if a button is pressed, the watch is turned face up, or the screen is updated (see `Bangle.setOptions` for configuration). It'll turn off automatically after the given timeout.
   * **Note:** This function also sets the Backlight and Lock timeout (the time at which the touchscreen/buttons start being ignored). To set both separately, use `Bangle.setOptions`
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDTimeout
   */
  function setLCDTimeout(isOn: number): void;

  /**
   * Set how often the watch should poll for new acceleration/gyro data and kick the Watchdog timer. It isn't
   * recommended that you make this interval much larger than 1000ms, but values up to 4000ms are allowed.
   * Calling this will set `Bangle.setOptions({powerSave: false})` - disabling the dynamic adjustment of
   * poll interval to save battery power when Bangle.js is stationary.
   * @url http://www.espruino.com/Reference#l_Bangle_setPollInterval
   */
  function setPollInterval(interval: number): void;

  /**
   * Set internal options used for gestures, etc...
   *
   * - `wakeOnBTN1` should the LCD turn on when BTN1 is pressed? default = `true`
   * - `wakeOnBTN2` (Bangle.js 1) should the LCD turn on when BTN2 is pressed? default = `true`
   * - `wakeOnBTN3` (Bangle.js 1) should the LCD turn on when BTN3 is pressed? default = `true`
   * - `wakeOnFaceUp` should the LCD turn on when the watch is turned face up? default = `false`
   * - `wakeOnTouch` should the LCD turn on when the touchscreen is pressed? default = `false`
   * - `wakeOnTwist` should the LCD turn on when the watch is twisted? default = `true`
   * - `twistThreshold`  How much acceleration to register a twist of the watch strap? Can be negative for oppsite direction. default = `800`
   * - `twistMaxY` Maximum acceleration in Y to trigger a twist (low Y means watch is facing the right way up). default = `-800`
   * - `twistTimeout`  How little time (in ms) must a twist take from low->high acceleration? default = `1000`
   * - `gestureStartThresh` how big a difference before we consider a gesture started? default = `sqr(800)`
   * - `gestureEndThresh` how small a difference before we consider a gesture ended? default = `sqr(2000)`
   * - `gestureInactiveCount` how many samples do we keep after a gesture has ended? default = `4`
   * - `gestureMinLength` how many samples must a gesture have before we notify about it? default = `10`
   * - `powerSave` after a minute of not being moved, Bangle.js will change the accelerometer poll interval down to 800ms (10x accelerometer samples).
   *  On movement it'll be raised to the default 80ms. If `Bangle.setPollInterval` is used this is disabled, and for it to work the poll interval
   *  must be either 80ms or 800ms. default = `true`
   * - `lockTimeout` how many milliseconds before the screen locks
   * - `lcdPowerTimeout` how many milliseconds before the screen turns off
   * - `backlightTimeout` how many milliseconds before the screen's backlight turns off
   * - `hrmPollInterval` set the requested poll interval (in milliseconds) for the heart rate monitor. On Bangle.js 2 only 10,20,40,80,160,200 ms are supported, and polling rate may not be exact. The algorithm's filtering is tuned for 20-40ms poll intervals, so higher/lower intervals may effect the reliability of the BPM reading.
   * - `seaLevelPressure` (Bangle.js 2) Normally 1013.25 millibars - this is used for calculating altitude with the pressure sensor
   *
   * Where accelerations are used they are in internal units, where `8192 = 1g`
   * @url http://www.espruino.com/Reference#l_Bangle_setOptions
   */
  function setOptions(options: any): void;

  /**
   * Return the current state of options as set by `Bangle.setOptions`
   * @url http://www.espruino.com/Reference#l_Bangle_getOptions
   */
  function getOptions(): any;

  /**
   * Also see the `Bangle.lcdPower` event
   * @url http://www.espruino.com/Reference#l_Bangle_isLCDOn
   */
  function isLCDOn(): boolean;

  /**
   * This function can be used to lock or unlock Bangle.js
   * (eg whether buttons and touchscreen work or not)
   * @url http://www.espruino.com/Reference#l_Bangle_setLocked
   */
  function setLocked(isLocked: boolean): void;

  /**
   * Also see the `Bangle.lock` event
   * @url http://www.espruino.com/Reference#l_Bangle_isLocked
   */
  function isLocked(): boolean;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_isCharging
   */
  function isCharging(): boolean;

  /**
   * Writes a command directly to the ST7735 LCD controller
   * @url http://www.espruino.com/Reference#l_Bangle_lcdWr
   */
  function lcdWr(cmd: number, data: any): void;

  /**
   * Is the Heart rate monitor powered?
   * Set power with `Bangle.setHRMPower(...);`
   * @url http://www.espruino.com/Reference#l_Bangle_isHRMOn
   */
  function isHRMOn(): boolean;

  /**
   * Is the GPS powered?
   * Set power with `Bangle.setGPSPower(...);`
   * @url http://www.espruino.com/Reference#l_Bangle_isGPSOn
   */
  function isGPSOn(): boolean;

  /**
   * Get the last available GPS fix info (or `undefined` if GPS is off).
   * The fix info received is the same as you'd get from the `Bangle.GPS` event.
   * @url http://www.espruino.com/Reference#l_Bangle_getGPSFix
   */
  function getGPSFix(): any;

  /**
   * Is the compass powered?
   * Set power with `Bangle.setCompassPower(...);`
   * @url http://www.espruino.com/Reference#l_Bangle_isCompassOn
   */
  function isCompassOn(): boolean;

  /**
   * Resets the compass minimum/maximum values. Can be used if the compass isn't
   * providing a reliable heading any more.
   * @url http://www.espruino.com/Reference#l_Bangle_resetCompass
   */
  function resetCompass(): void;

  /**
   * Set the power to the barometer IC. Once enbled, `Bangle.pressure` events
   * are fired each time a new barometer reading is available.
   * When on, the barometer draws roughly 50uA
   * @url http://www.espruino.com/Reference#l_Bangle_setBarometerPower
   */
  function setBarometerPower(isOn: boolean, appID: any): boolean;

  /**
   * Is the Barometer powered?
   * Set power with `Bangle.setBarometerPower(...);`
   * @url http://www.espruino.com/Reference#l_Bangle_isBarometerOn
   */
  function isBarometerOn(): boolean;

  /**
   * Returns the current amount of steps recorded by the step counter
   * @url http://www.espruino.com/Reference#l_Bangle_getStepCount
   */
  function getStepCount(): number;

  /**
   * Sets the current value of the step counter
   * @url http://www.espruino.com/Reference#l_Bangle_setStepCount
   */
  function setStepCount(count: number): void;

  /**
   * Get the most recent Magnetometer/Compass reading. Data is in the same format as the `Bangle.on('mag',` event.
   * Returns an `{x,y,z,dx,dy,dz,heading}` object
   *
   * - `x/y/z` raw x,y,z magnetometer readings
   * - `dx/dy/dz` readings based on calibration since magnetometer turned on
   * - `heading` in degrees based on calibrated readings (will be NaN if magnetometer hasn't been rotated around 360 degrees)
   *
   * To get this event you must turn the compass on
   * with `Bangle.setCompassPower(1)`.
   * @url http://www.espruino.com/Reference#l_Bangle_getCompass
   */
  function getCompass(): any;

  /**
   * Get the most recent accelerometer reading. Data is in the same format as the `Bangle.on('accel',` event.
   *
   * - `x` is X axis (left-right) in `g`
   * - `y` is Y axis (up-down) in `g`
   * - `z` is Z axis (in-out) in `g`
   * - `diff` is difference between this and the last reading in `g` (calculated by comparing vectors, not magnitudes)
   * - `td` is the elapsed
   * - `mag` is the magnitude of the acceleration in `g`
   *
   * @url http://www.espruino.com/Reference#l_Bangle_getAccel
   */
  function getAccel(): any;

  /**
   * `range` is one of:
   *
   * - `undefined` or `'current'` - health data so far in the last 10 minutes is returned,
   * - `'last'` - health data during the last 10 minutes
   * - `'day'` - the health data so far for the day
   *
   * `getHealthStatus` returns an object containing:
   *
   * - `movement` is the 32 bit sum of all `acc.diff` readings since power on (and rolls over). It is the difference in accelerometer values as `g*8192`
   * - `steps` is the number of steps during this period
   * - `bpm` the best BPM reading from HRM sensor during this period
   * - `bpmConfidence` best BPM confidence (0-100%) during this period
   *
   * @url http://www.espruino.com/Reference#l_Bangle_getHealthStatus
   */
  function getHealthStatus(range: any): any;

  /**
   * Feature flag - If true, this Bangle.js firmware reads `setting.json` and
   * modifies beep & buzz behaviour accordingly (the bootloader
   * doesn't need to do it).
   * @url http://www.espruino.com/Reference#l_Bangle_F_BEEPSET
   */
  const F_BEEPSET: boolean;

  /**
   * Reads debug info
   * @url http://www.espruino.com/Reference#l_Bangle_dbg
   */
  function dbg(): any;

  /**
   * Writes a register on the accelerometer
   * @url http://www.espruino.com/Reference#l_Bangle_accelWr
   */
  function accelWr(reg: number, data: number): void;

  /**
   * Reads a register from the accelerometer
   * **Note:** On Espruino 2v06 and before this function only returns a number (`cnt` is ignored).
   * @url http://www.espruino.com/Reference#l_Bangle_accelRd
   */
  function accelRd(reg: number, cnt: number): any;

  /**
   * Writes a register on the barometer IC
   * @url http://www.espruino.com/Reference#l_Bangle_barometerWr
   */
  function barometerWr(reg: number, data: number): void;

  /**
   * Reads a register from the barometer IC
   * @url http://www.espruino.com/Reference#l_Bangle_barometerRd
   */
  function barometerRd(reg: number, cnt: number): any;

  /**
   * Writes a register on the Magnetometer/Compass
   * @url http://www.espruino.com/Reference#l_Bangle_compassWr
   */
  function compassWr(reg: number, data: number): void;

  /**
   * Read a register on the Magnetometer/Compass
   * @url http://www.espruino.com/Reference#l_Bangle_compassRd
   */
  function compassRd(reg: number, cnt: number): any;

  /**
   * Writes a register on the Heart rate monitor
   * @url http://www.espruino.com/Reference#l_Bangle_hrmWr
   */
  function hrmWr(reg: number, data: number): void;

  /**
   * Read a register on the Heart rate monitor
   * @url http://www.espruino.com/Reference#l_Bangle_hrmRd
   */
  function hrmRd(reg: number, cnt: number): any;

  /**
   * Changes a pin state on the IO expander
   * @url http://www.espruino.com/Reference#l_Bangle_ioWr
   */
  function ioWr(mask: number, isOn: number): void;

  /**
   * Perform a Spherical [Web Mercator projection](https://en.wikipedia.org/wiki/Web_Mercator_projection)
   * of latitude and longitude into `x` and `y` coordinates, which are roughly
   * equivalent to meters from `{lat:0,lon:0}`.
   * This is the formula used for most online mapping and is a good way
   * to compare GPS coordinates to work out the distance between them.
   * @url http://www.espruino.com/Reference#l_Bangle_project
   */
  function project(latlong: any): any;

  /**
   * Use the piezo speaker to Beep for a certain time period and frequency
   * @url http://www.espruino.com/Reference#l_Bangle_beep
   */
  function beep(time: number, freq: number): Promise<any>;

  /**
   * Use the vibration motor to buzz for a certain time period
   * @url http://www.espruino.com/Reference#l_Bangle_buzz
   */
  function buzz(time: number, strength: number): Promise<any>;

  /**
   * Turn Bangle.js off. It can only be woken by pressing BTN1.
   * @url http://www.espruino.com/Reference#l_Bangle_off
   */
  function off(): void;

  /**
   * Turn Bangle.js (mostly) off, but keep the CPU in sleep
   * mode until BTN1 is pressed to preserve the RTC (current time).
   * @url http://www.espruino.com/Reference#l_Bangle_softOff
   */
  function softOff(): void;

  /**
   *
   * - On platforms with an LCD of >=8bpp this is 222 x 104 x 2 bits
   * - Otherwise it's 119 x 56 x 1 bits
   *
   * @url http://www.espruino.com/Reference#l_Bangle_getLogo
   */
  function getLogo(): any;

  /**
   * Load all widgets from flash Storage. Call this once at the beginning
   * of your application if you want any on-screen widgets to be loaded.
   * They will be loaded into a global `WIDGETS` array, and
   * can be rendered with `Bangle.drawWidgets`.
   * @url http://www.espruino.com/Reference#l_Bangle_loadWidgets
   */
  function loadWidgets(): void;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_drawWidgets
   */
  function drawWidgets(): void;

  /**
   * Load the Bangle.js app launcher, which will allow the user
   * to select an application to launch.
   * @url http://www.espruino.com/Reference#l_Bangle_showLauncher
   */
  function showLauncher(): void;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_setUI
   */
  function setUI(): void;

  /**
   * Erase all storage and reload it with the default
   * contents.
   * This is only available on Bangle.js 2.0. On Bangle.js 1.0
   * you need to use `Install Default Apps` under the `More...` tab
   * of [http://banglejs.com/apps](http://banglejs.com/apps)
   * @url http://www.espruino.com/Reference#l_Bangle_factoryReset
   */
  function factoryReset(): void;

  /**
   * Returns the rectangle on the screen that is currently
   * reserved for the app.
   * @url http://www.espruino.com/Reference#l_Bangle_appRect
   */
  const appRect: any;

}

/**
 * Class containing [micro:bit's](https://www.espruino.com/MicroBit) utility functions.
 * @url http://www.espruino.com/Reference#Microbit
 */
declare function Microbit(): void;

declare namespace Microbit {
  /**
   * The micro:bit's speaker pin
   * @url http://www.espruino.com/Reference#l_Microbit_SPEAKER
   */
  const SPEAKER: Pin;

  /**
   * The micro:bit's microphone pin
   * `MIC_ENABLE` should be set to 1 before using this
   * @url http://www.espruino.com/Reference#l_Microbit_MIC
   */
  const MIC: Pin;

  /**
   * The micro:bit's microphone enable pin
   * @url http://www.espruino.com/Reference#l_Microbit_MIC_ENABLE
   */
  const MIC_ENABLE: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Microbit_mag
   */
  function mag(): any;

  /**
   * @url http://www.espruino.com/Reference#l_Microbit_accel
   */
  function accel(): any;

  /**
   * **Note:** This function is only available on the [BBC micro:bit](https://espruino.com//MicroBit) board
   * Write the given value to the accelerometer
   * @url http://www.espruino.com/Reference#l_Microbit_accelWr
   */
  function accelWr(addr: number, data: number): void;

  /**
   * Turn on the accelerometer, and create `Microbit.accel` and `Microbit.gesture` events.
   * **Note:** The accelerometer is currently always enabled - this code
   * just responds to interrupts and reads
   * @url http://www.espruino.com/Reference#l_Microbit_accelOn
   */
  function accelOn(): void;

  /**
   * Turn off events from  the accelerometer (started with `Microbit.accelOn`)
   * @url http://www.espruino.com/Reference#l_Microbit_accelOff
   */
  function accelOff(): void;

  /**
   * Play a waveform on the Micro:bit's speaker
   * @url http://www.espruino.com/Reference#l_Microbit_play
   */
  function play(waveform: any, samplesPerSecond: any, callback: any): void;

  /**
   * Records sound from the micro:bit's onboard microphone and returns the result
   * @url http://www.espruino.com/Reference#l_Microbit_record
   */
  function record(samplesPerSecond: any, callback: any, samples: any): void;

}

/**
 * This is the File object - it allows you to stream data to and from files (As opposed to the `require('fs').readFile(..)` style functions that read an entire file).
 * To create a File object, you must type `var fd = E.openFile('filepath','mode')` - see [E.openFile](#l_E_openFile) for more information.
 * **Note:** If you want to remove an SD card after you have started using it, you *must* call `E.unmountSD()` or you may cause damage to the card.
 * @url http://www.espruino.com/Reference#File
 */
declare function EspruinoFile(): void;

type EspruinoFile = {
  /**
   * Close an open file.
   * @url http://www.espruino.com/Reference#l_File_close
   */
  close: () => void;

  /**
   * Write data to a file.
   * **Note:** By default this function flushes all changes to the
   * SD card, which makes it slow (but also safe!). You can use
   * `E.setFlags({unsyncFiles:1})` to disable this behaviour and
   * really speed up writes - but then you must be sure to close
   * all files you are writing before power is lost or you will
   * cause damage to your SD card's filesystem.
   * @url http://www.espruino.com/Reference#l_File_write
   */
  write: (buffer: any) => number;

  /**
   * Read data in a file in byte size chunks
   * @url http://www.espruino.com/Reference#l_File_read
   */
  read: (length: number) => any;

  /**
   * Skip the specified number of bytes forward in the file
   * @url http://www.espruino.com/Reference#l_File_skip
   */
  skip: (nBytes: number) => void;

  /**
   * Seek to a certain position in the file
   * @url http://www.espruino.com/Reference#l_File_seek
   */
  seek: (nBytes: number) => void;

  /**
   * Pipe this file to a stream (an object with a 'write' method)
   * @url http://www.espruino.com/Reference#l_File_pipe
   */
  pipe: (destination: any, options: any) => void;

}

/**
 * This library handles interfacing with a FAT32 filesystem on an SD card. The API is designed to be similar to node.js's - However Espruino does not currently support asynchronous file IO, so the functions behave like node.js's xxxxSync functions. Versions of the functions with 'Sync' after them are also provided for compatibility.
 * To use this, you must type `var fs = require('fs')` to get access to the library
 * See [the page on File IO](http://www.espruino.com/File+IO) for more information, and for examples on wiring up an SD card if your device doesn't come with one.
 * **Note:** If you want to remove an SD card after you have started using it, you *must* call `E.unmountSD()` or you may cause damage to the card.
 * @url http://www.espruino.com/Reference#l_fs_undefined
 */
declare function fs(): void;

declare namespace fs {
  /**
   * List all files in the supplied directory, returning them as an array of strings.
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_readdir
   */
  function readdir(path: any): any;

  /**
   * List all files in the supplied directory, returning them as an array of strings.
   * @url http://www.espruino.com/Reference#l_fs_readdirSync
   */
  function readdirSync(path: any): any;

  /**
   * Write the data to the given file
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_writeFile
   */
  function writeFile(path: any, data: any): boolean;

  /**
   * Write the data to the given file
   * @url http://www.espruino.com/Reference#l_fs_writeFileSync
   */
  function writeFileSync(path: any, data: any): boolean;

  /**
   * Append the data to the given file, created a new file if it doesn't exist
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_appendFile
   */
  function appendFile(path: any, data: any): boolean;

  /**
   * Append the data to the given file, created a new file if it doesn't exist
   * @url http://www.espruino.com/Reference#l_fs_appendFileSync
   */
  function appendFileSync(path: any, data: any): boolean;

  /**
   * Read all data from a file and return as a string
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_readFile
   */
  function readFile(path: any): any;

  /**
   * Read all data from a file and return as a string.
   * **Note:** The size of files you can load using this method is limited by the amount of available RAM. To read files a bit at a time, see the `File` class.
   * @url http://www.espruino.com/Reference#l_fs_readFileSync
   */
  function readFileSync(path: any): any;

  /**
   * Delete the given file
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_unlink
   */
  function unlink(path: any): boolean;

  /**
   * Delete the given file
   * @url http://www.espruino.com/Reference#l_fs_unlinkSync
   */
  function unlinkSync(path: any): boolean;

  /**
   * Return information on the given file. This returns an object with the following
   * fields:
   * size: size in bytes
   * dir: a boolean specifying if the file is a directory or not
   * mtime: A Date structure specifying the time the file was last modified
   * @url http://www.espruino.com/Reference#l_fs_statSync
   */
  function statSync(path: any): any;

  /**
   * Create the directory
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_mkdir
   */
  function mkdir(path: any): boolean;

  /**
   * Create the directory
   * @url http://www.espruino.com/Reference#l_fs_mkdirSync
   */
  function mkdirSync(path: any): boolean;

  /**
   * @url http://www.espruino.com/Reference#l_fs_pipe
   */
  function pipe(source: any, destination: any, options: any): void;

}

/**
 * Class containing utility functions for [Pixl.js](http://www.espruino.com/Pixl.js)
 * @url http://www.espruino.com/Reference#Pixl
 */
declare function Pixl(): void;

declare namespace Pixl {
  /**
   * DEPRECATED - Please use `E.getBattery()` instead.
   * Return an approximate battery percentage remaining based on
   * a normal CR2032 battery (2.8 - 2.2v)
   * @url http://www.espruino.com/Reference#l_Pixl_getBatteryPercentage
   */
  function getBatteryPercentage(): number;

  /**
   * Set the LCD's contrast
   * @url http://www.espruino.com/Reference#l_Pixl_setContrast
   */
  function setContrast(c: number): void;

  /**
   * This function can be used to turn Pixl.js's LCD off or on.
   *
   * - With the LCD off, Pixl.js draws around 0.1mA
   * - With the LCD on, Pixl.js draws around 0.25mA
   *
   * @url http://www.espruino.com/Reference#l_Pixl_setLCDPower
   */
  function setLCDPower(isOn: boolean): void;

  /**
   * Writes a command directly to the ST7567 LCD controller
   * @url http://www.espruino.com/Reference#l_Pixl_lcdw
   */
  function lcdw(c: number): void;

  /**
   * Display a menu on Pixl.js's screen, and set up the buttons to navigate through it.
   * DEPRECATED: Use `E.showMenu`
   * @url http://www.espruino.com/Reference#l_Pixl_menu
   */
  function menu(menu: any): any;

}

/**
 * Web Bluetooth-style GATT server - get this using `NRF.connect(address)`
 * or `NRF.requestDevice(options)` and `response.gatt.connect`
 * [https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattserver](https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattserver)
 * @url http://www.espruino.com/Reference#BluetoothRemoteGATTServer
 */
declare function BluetoothRemoteGATTServer(): void;

type BluetoothRemoteGATTServer = {
  /**
   * Disconnect from a previously connected BLE device connected with
   * `BluetoothRemoteGATTServer.connect` - this does not disconnect from something that has
   * connected to the Espruino.
   * **Note:** While `.disconnect` is standard Web Bluetooth, in the spec it
   * returns undefined not a `Promise` for implementation reasons. In Espruino
   * we return a `Promise` to make it easier to detect when Espruino is free
   * to connect to something else.
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_disconnect
   */
  disconnect: () => Promise<any>;

  /**
   * See `NRF.connect` for usage examples.
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getPrimaryService
   */
  getPrimaryService: (service: any) => Promise<any>;

  /**
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getPrimaryServices
   */
  getPrimaryServices: () => Promise<any>;

}

/**
 * Web Bluetooth-style GATT service - get this using `BluetoothRemoteGATTServer.getPrimaryService(s)`
 * [https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattservice](https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattservice)
 * @url http://www.espruino.com/Reference#BluetoothRemoteGATTService
 */
declare function BluetoothRemoteGATTService(): void;

type BluetoothRemoteGATTService = {
  /**
   * See `NRF.connect` for usage examples.
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTService_getCharacteristic
   */
  getCharacteristic: (characteristic: any) => Promise<any>;

  /**
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTService_getCharacteristics
   */
  getCharacteristics: () => Promise<any>;

}

/**
 * Web Bluetooth-style GATT characteristic - get this using `BluetoothRemoteGATTService.getCharacteristic(s)`
 * [https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattcharacteristic](https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattcharacteristic)
 * @url http://www.espruino.com/Reference#BluetoothRemoteGATTCharacteristic
 */
declare function BluetoothRemoteGATTCharacteristic(): void;

type BluetoothRemoteGATTCharacteristic = {
  /**
   * Stop notifications (that were requested with `BluetoothRemoteGATTCharacteristic.startNotifications`)
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_stopNotifications
   */
  stopNotifications: () => Promise<any>;

}

/**
 * This class exists in order to interface Espruino with fast-moving trigger wheels. Trigger wheels are physical discs with evenly spaced teeth cut into them, and often with one or two teeth next to each other missing. A sensor sends a signal whenever a tooth passed by, and this allows a device to measure not only RPM, but absolute position.
 * This class is currently in testing - it is NOT AVAILABLE on normal boards.
 * @url http://www.espruino.com/Reference#Trig
 */
declare function Trig(): void;

declare namespace Trig {
  /**
   * Get the position of the trigger wheel at the given time (from getTime)
   * @url http://www.espruino.com/Reference#l_Trig_getPosAtTime
   */
  function getPosAtTime(time: number): number;

  /**
   * Initialise the trigger class
   * @url http://www.espruino.com/Reference#l_Trig_setup
   */
  function setup(pin: Pin, options: any): void;

  /**
   * Set a trigger for a certain point in the cycle
   * @url http://www.espruino.com/Reference#l_Trig_setTrigger
   */
  function setTrigger(num: number, pos: number, pins: any, pulseLength: number): void;

  /**
   * Disable a trigger
   * @url http://www.espruino.com/Reference#l_Trig_killTrigger
   */
  function killTrigger(num: number): void;

  /**
   * Get the current state of a trigger
   * @url http://www.espruino.com/Reference#l_Trig_getTrigger
   */
  function getTrigger(num: number): any;

  /**
   * Get the RPM of the trigger wheel
   * @url http://www.espruino.com/Reference#l_Trig_getRPM
   */
  function getRPM(): number;

  /**
   * Get the current error flags from the trigger wheel - and zero them
   * @url http://www.espruino.com/Reference#l_Trig_getErrors
   */
  function getErrors(): number;

  /**
   * Get the current error flags from the trigger wheel - and zero them
   * @url http://www.espruino.com/Reference#l_Trig_getErrorArray
   */
  function getErrorArray(): any;

}

/**
 * Class containing [Puck.js's](http://www.puck-js.com) utility functions.
 * @url http://www.espruino.com/Reference#Puck
 */
declare function Puck(): void;

declare namespace Puck {
  /**
   * Turn on the magnetometer, take a single reading, and then turn it off again.
   * An object of the form `{x,y,z}` is returned containing magnetometer readings.
   * Due to residual magnetism in the Puck and magnetometer itself, with
   * no magnetic field the Puck will not return `{x:0,y:0,z:0}`.
   * Instead, it's up to you to figure out what the 'zero value' is for your
   * Puck in your location and to then subtract that from the value returned. If
   * you're not trying to measure the Earth's magnetic field then it's a good idea
   * to just take a reading at startup and use that.
   * With the aerial at the top of the board, the `y` reading is vertical, `x` is
   * horizontal, and `z` is through the board.
   * Readings are in increments of 0.1 micro Tesla (uT). The Earth's magnetic field
   * varies from around 25-60 uT, so the reading will vary by 250 to 600 depending
   * on location.
   * @url http://www.espruino.com/Reference#l_Puck_mag
   */
  function mag(): any;

  /**
   * Turn on the magnetometer, take a single temperature reading from the MAG3110 chip, and then turn it off again.
   * (If the magnetometer is already on, this just returns the last reading obtained)
   * `E.getTemperature()` uses the microcontroller's temperature sensor, but this uses the magnetometer's.
   * The reading obtained is an integer (so no decimal places), but the sensitivity is factory trimmed. to 1°C, however the temperature
   * offset isn't - so absolute readings may still need calibrating.
   * @url http://www.espruino.com/Reference#l_Puck_magTemp
   */
  function magTemp(): number;

  /**
   * Turn the magnetometer off
   * @url http://www.espruino.com/Reference#l_Puck_magOff
   */
  function magOff(): void;

  /**
   * Writes a register on the LIS3MDL / MAX3110 Magnetometer. Can be used for configuring advanced functions.
   * Check out [the Puck.js page on the magnetometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information and links to modules that use this function.
   * @url http://www.espruino.com/Reference#l_Puck_magWr
   */
  function magWr(reg: number, data: number): void;

  /**
   * Reads a register from the LIS3MDL / MAX3110 Magnetometer. Can be used for configuring advanced functions.
   * Check out [the Puck.js page on the magnetometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information and links to modules that use this function.
   * @url http://www.espruino.com/Reference#l_Puck_magRd
   */
  function magRd(reg: number): number;

  /**
   * On Puck.js v2.0 this will use the on-board PCT2075TP temperature sensor, but on Puck.js the less accurate on-chip Temperature sensor is used.
   * @url http://www.espruino.com/Reference#l_Puck_getTemperature
   */
  function getTemperature(): number;

  /**
   * Turn the accelerometer off after it has been turned on by `Puck.accelOn()`.
   * Check out [the Puck.js page on the accelerometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information.
   * @url http://www.espruino.com/Reference#l_Puck_accelOff
   */
  function accelOff(): void;

  /**
   * Turn on the accelerometer, take a single reading, and then turn it off again.
   * The values reported are the raw values from the chip. In normal configuration:
   *
   * - accelerometer: full-scale (32768) is 4g, so you need to divide by 8192 to get correctly scaled values
   * - gyro: full-scale (32768) is 245 dps, so you need to divide by 134 to get correctly scaled values
   *
   * If taking more than one reading, we'd suggest you use `Puck.accelOn()` and the `Puck.accel` event.
   * @url http://www.espruino.com/Reference#l_Puck_accel
   */
  function accel(): any;

  /**
   * Writes a register on the LSM6DS3TR-C Accelerometer. Can be used for configuring advanced functions.
   * Check out [the Puck.js page on the accelerometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information and links to modules that use this function.
   * @url http://www.espruino.com/Reference#l_Puck_accelWr
   */
  function accelWr(reg: number, data: number): void;

  /**
   * Reads a register from the LSM6DS3TR-C Accelerometer. Can be used for configuring advanced functions.
   * Check out [the Puck.js page on the accelerometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information and links to modules that use this function.
   * @url http://www.espruino.com/Reference#l_Puck_accelRd
   */
  function accelRd(reg: number): number;

  /**
   * Transmit the given set of IR pulses - data should be an array of pulse times
   * in milliseconds (as `[on, off, on, off, on, etc]`).
   * For example `Puck.IR(pulseTimes)` - see [http://www.espruino.com/Puck.js+Infrared](http://www.espruino.com/Puck.js+Infrared)
   * for a full example.
   * You can also attach an external LED to Puck.js, in which case
   * you can just execute `Puck.IR(pulseTimes, led_cathode, led_anode)`
   * It is also possible to just supply a single pin for IR transmission
   * with `Puck.IR(pulseTimes, led_anode)` (on 2v05 and above).
   * @url http://www.espruino.com/Reference#l_Puck_IR
   */
  function IR(data: any, cathode: Pin, anode: Pin): void;

  /**
   * Capacitive sense - the higher the capacitance, the higher the number returned.
   * If called without arguments, a value depending on the capacitance of what is
   * attached to pin D11 will be returned. If you attach a length of wire to D11,
   * you'll be able to see a higher value returned when your hand is near the wire
   * than when it is away.
   * You can also supply pins to use yourself, however if you do this then
   * the TX pin must be connected to RX pin and sense plate via a roughly 1MOhm
   * resistor.
   * When not supplying pins, Puck.js uses an internal resistor between D12(tx)
   * and D11(rx).
   * @url http://www.espruino.com/Reference#l_Puck_capSense
   */
  function capSense(tx: Pin, rx: Pin): number;

  /**
   * Return a light value based on the light the red LED is seeing.
   * **Note:** If called more than 5 times per second, the received light value
   * may not be accurate.
   * @url http://www.espruino.com/Reference#l_Puck_light
   */
  function light(): number;

  /**
   * DEPRECATED - Please use `E.getBattery()` instead.
   * Return an approximate battery percentage remaining based on
   * a normal CR2032 battery (2.8 - 2.2v).
   * @url http://www.espruino.com/Reference#l_Puck_getBatteryPercentage
   */
  function getBatteryPercentage(): number;

  /**
   * Run a self-test, and return true for a pass. This checks for shorts
   * between pins, so your Puck shouldn't have anything connected to it.
   * **Note:** This self-test auto starts if you hold the button on your Puck
   * down while inserting the battery, leave it pressed for 3 seconds (while
   * the green LED is lit) and release it soon after all LEDs turn on. 5
   * red blinks is a fail, 5 green is a pass.
   * If the self test fails, it'll set the Puck.js Bluetooth advertising name
   * to `Puck.js !ERR` where ERR is a 3 letter error code.
   * @url http://www.espruino.com/Reference#l_Puck_selfTest
   */
  function selfTest(): boolean;

}

/**
 * @url http://www.espruino.com/Reference#l_CC3000_undefined
 */
declare function CC3000(): void;

declare namespace CC3000 {
  /**
   * Initialise the CC3000 and return a WLAN object
   * @url http://www.espruino.com/Reference#l_CC3000_connect
   */
  function connect(spi: any, cs: Pin, en: Pin, irq: Pin): WLAN;

}

/**
 * An instantiation of a WiFi network adaptor
 * @url http://www.espruino.com/Reference#WLAN
 */
declare function WLAN(): void;

type WLAN = {
  /**
   * Connect to a wireless network
   * @url http://www.espruino.com/Reference#l_WLAN_connect
   */
  connect: (ap: any, key: any, callback: any) => boolean;

  /**
   * Completely uninitialise and power down the CC3000. After this you'll have to use `require("CC3000").connect()` again.
   * @url http://www.espruino.com/Reference#l_WLAN_disconnect
   */
  disconnect: () => void;

  /**
   * Completely uninitialise and power down the CC3000, then reconnect to the old access point.
   * @url http://www.espruino.com/Reference#l_WLAN_reconnect
   */
  reconnect: () => void;

  /**
   * Get the current IP address
   * @url http://www.espruino.com/Reference#l_WLAN_getIP
   */
  getIP: () => any;

  /**
   * Set the current IP address for get an IP from DHCP (if no options object is specified).
   * **Note:** Changes are written to non-volatile memory, but will only take effect after calling `wlan.reconnect()`
   * @url http://www.espruino.com/Reference#l_WLAN_setIP
   */
  setIP: (options: any) => boolean;

}

/**
 * This library implements a telnet console for the Espruino interpreter. It requires a network
 * connection, e.g. Wifi, and **currently only functions on the ESP8266 and on Linux **. It uses
 * port 23 on the ESP8266 and port 2323 on Linux.
 * **Note:** To enable on Linux, run `./espruino --telnet`
 * @url http://www.espruino.com/Reference#l_TelnetServer_undefined
 */
declare function TelnetServer(): void;

declare namespace TelnetServer {
  /**
   * @url http://www.espruino.com/Reference#l_TelnetServer_setOptions
   */
  function setOptions(options: any): void;

}

/**
 * Class containing utility functions for the [ESP8266](http://www.espruino.com/EspruinoESP8266)
 * @url http://www.espruino.com/Reference#ESP8266
 */
declare function ESP8266(): void;

declare namespace ESP8266 {
  /**
   * **DEPRECATED** - please use `Wifi.ping` instead.
   * Perform a network ping request. The parameter can be either a String or a numeric IP address.
   * @url http://www.espruino.com/Reference#l_ESP8266_ping
   */
  function ping(ipAddr: any, pingCallback: any): void;

  /**
   * Perform a hardware reset/reboot of the esp8266.
   * @url http://www.espruino.com/Reference#l_ESP8266_reboot
   */
  function reboot(): void;

  /**
   * At boot time the esp8266's firmware captures the cause of the reset/reboot.  This function returns this information in an object with the following fields:
   *
   * - `reason`: "power on", "wdt reset", "exception", "soft wdt", "restart", "deep sleep", or "reset pin"
   * - `exccause`: exception cause
   * - `epc1`, `epc2`, `epc3`: instruction pointers
   * - `excvaddr`: address being accessed
   * - `depc`: (?)
   *
   * @url http://www.espruino.com/Reference#l_ESP8266_getResetInfo
   */
  function getResetInfo(): RstInfo;

  /**
   * Enable or disable the logging of debug information.  A value of `true` enables debug logging while a value of `false` disables debug logging.  Debug output is sent to UART1 (gpio2).
   * @url http://www.espruino.com/Reference#l_ESP8266_logDebug
   */
  function logDebug(enable: boolean): void;

  /**
   * Set the debug logging mode. It can be disabled (which frees ~1.2KB of heap), enabled in-memory only, or in-memory and output to a UART.
   * @url http://www.espruino.com/Reference#l_ESP8266_setLog
   */
  function setLog(mode: number): void;

  /**
   * Prints the contents of the debug log to the console.
   * @url http://www.espruino.com/Reference#l_ESP8266_printLog
   */
  function printLog(): void;

  /**
   * Returns one line from the log or up to 128 characters.
   * @url http://www.espruino.com/Reference#l_ESP8266_readLog
   */
  function readLog(): void;

  /**
   * Dumps info about all sockets to the log. This is for troubleshooting the socket implementation.
   * @url http://www.espruino.com/Reference#l_ESP8266_dumpSocketInfo
   */
  function dumpSocketInfo(): void;

  /**
   * **Note:** This is deprecated. Use `E.setClock(80/160)`
   * **Note:**
   * Set the operating frequency of the ESP8266 processor. The default is 160Mhz.
   * **Warning**: changing the cpu frequency affects the timing of some I/O operations, notably of software SPI and I2C, so things may be a bit slower at 80Mhz.
   * @url http://www.espruino.com/Reference#l_ESP8266_setCPUFreq
   */
  function setCPUFreq(freq: any): void;

  /**
   * Returns an object that contains details about the state of the ESP8266 with the following fields:
   *
   * - `sdkVersion`   - Version of the SDK.
   * - `cpuFrequency` - CPU operating frequency in Mhz.
   * - `freeHeap`     - Amount of free heap in bytes.
   * - `maxCon`       - Maximum number of concurrent connections.
   * - `flashMap`     - Configured flash size&map: '512KB:256/256' .. '4MB:512/512'
   * - `flashKB`      - Configured flash size in KB as integer
   * - `flashChip`    - Type of flash chip as string with manufacturer & chip, ex: '0xEF 0x4016`
   *
   * @url http://www.espruino.com/Reference#l_ESP8266_getState
   */
  function getState(): any;

  /**
   * **Note:** This is deprecated. Use `require("Flash").getFree()`
   * @url http://www.espruino.com/Reference#l_ESP8266_getFreeFlash
   */
  function getFreeFlash(): any;

  /**
   * @url http://www.espruino.com/Reference#l_ESP8266_crc32
   */
  function crc32(arrayOfData: any): any;

  /**
   * **This function is deprecated.** Please use `require("neopixel").write(pin, data)` instead
   * @url http://www.espruino.com/Reference#l_ESP8266_neopixelWrite
   */
  function neopixelWrite(pin: Pin, arrayOfData: any): void;

  /**
   * Put the ESP8266 into 'deep sleep' for the given number of microseconds,
   * reducing power consumption drastically.
   * meaning of option values:
   * 0 - the 108th Byte of init parameter decides whether RF calibration will be performed or not.
   * 1 - run RF calibration after waking up. Power consumption is high.
   * 2 - no RF calibration after waking up. Power consumption is low.
   * 4 - no RF after waking up. Power consumption is the lowest.
   * **Note:** unlike normal Espruino boards' 'deep sleep' mode, ESP8266 deep sleep actually turns off the processor. After the given number of microseconds have elapsed, the ESP8266 will restart as if power had been turned off and then back on. *All contents of RAM will be lost*.
   * Connect GPIO 16 to RST to enable wakeup.
   * **Special:** 0 microseconds cause sleep forever until external wakeup RST pull down occurs.
   * @url http://www.espruino.com/Reference#l_ESP8266_deepSleep
   */
  function deepSleep(micros: any, option: any): void;

}

/**
 * This library allows you to create http servers and make http requests
 * In order to use this, you will need an extra module to get network connectivity such as the [WIZnet W5500](https://espruino.com//CC3000">TI CC3000</a> or <a href="/WIZnet).
 * This is designed to be a cut-down version of the [Internet](http://nodejs.org/api/http.html">node.js library</a>. Please see the <a href="/Internet) page for more information on how to use it.
 * @url http://www.espruino.com/Reference#l_http_undefined
 */
declare function http(): void;

declare namespace http {
  /**
   * Create an HTTP Server
   * When a request to the server is made, the callback is called. In the callback you can use the methods on the response (`httpSRs`) to send data. You can also add `request.on('data',function() { ... })` to listen for POSTed data
   * @url http://www.espruino.com/Reference#l_http_createServer
   */
  function createServer(callback: any): httpSrv;

}

/**
 * The HTTP server created by `require('http').createServer`
 * @url http://www.espruino.com/Reference#httpSrv
 */
declare function httpSrv(): void;

type httpSrv = {
  /**
   * Start listening for new HTTP connections on the given port
   * @url http://www.espruino.com/Reference#l_httpSrv_listen
   */
  listen: (port: number) => any;

  /**
   * Stop listening for new HTTP connections
   * @url http://www.espruino.com/Reference#l_httpSrv_close
   */
  close: () => void;

}

/**
 * The HTTP server request
 * @url http://www.espruino.com/Reference#httpSRq
 */
declare function httpSRq(): void;

type httpSRq = {
  /**
   * The headers to sent to the server with this HTTP request.
   * @url http://www.espruino.com/Reference#l_httpSRq_headers
   */
  headers: any

  /**
   * The HTTP method used with this request. Often `"GET"`.
   * @url http://www.espruino.com/Reference#l_httpSRq_method
   */
  method: any

  /**
   * The URL requested in this HTTP request, for instance:
   *
   * - `"/"` - the main page
   * - `"/favicon.ico"` - the web page's icon
   *
   * @url http://www.espruino.com/Reference#l_httpSRq_url
   */
  url: any

  /**
   * Return how many bytes are available to read. If there is already a listener for data, this will always return 0.
   * @url http://www.espruino.com/Reference#l_httpSRq_available
   */
  available: () => number;

  /**
   * Return a string containing characters that have been received
   * @url http://www.espruino.com/Reference#l_httpSRq_read
   */
  read: (chars: number) => any;

  /**
   * Pipe this to a stream (an object with a 'write' method)
   * @url http://www.espruino.com/Reference#l_httpSRq_pipe
   */
  pipe: (destination: any, options: any) => void;

}

/**
 * The HTTP server response
 * @url http://www.espruino.com/Reference#httpSRs
 */
declare function httpSRs(): void;

type httpSRs = {
  /**
   * This function writes the `data` argument as a string. Data that is passed in
   * (including arrays) will be converted to a string with the normal JavaScript
   * `toString` method. For more information about sending binary data see `Socket.write`
   * @url http://www.espruino.com/Reference#l_httpSRs_write
   */
  write: (data: any) => boolean;

  /**
   * See `Socket.write` for more information about the data argument
   * @url http://www.espruino.com/Reference#l_httpSRs_end
   */
  end: (data: any) => void;

  /**
   * Send the given status code and headers. If not explicitly called
   * this will be done automatically the first time data is written
   * to the response.
   * This cannot be called twice, or after data has already been sent
   * in the response.
   * @url http://www.espruino.com/Reference#l_httpSRs_writeHead
   */
  writeHead: (statusCode: number, headers: any) => void;

  /**
   * Set a value to send in the header of this HTTP response. This updates the `httpSRs.headers` property.
   * Any headers supplied to `writeHead` will overwrite any headers with the same name.
   * @url http://www.espruino.com/Reference#l_httpSRs_setHeader
   */
  setHeader: (name: any, value: any) => void;

}

/**
 * The HTTP client request, returned by `http.request()` and `http.get()`.
 * @url http://www.espruino.com/Reference#httpCRq
 */
declare function httpCRq(): void;

type httpCRq = {
  /**
   * This function writes the `data` argument as a string. Data that is passed in
   * (including arrays) will be converted to a string with the normal JavaScript
   * `toString` method. For more information about sending binary data see `Socket.write`
   * @url http://www.espruino.com/Reference#l_httpCRq_write
   */
  write: (data: any) => boolean;

  /**
   * Finish this HTTP request - optional data to append as an argument
   * See `Socket.write` for more information about the data argument
   * @url http://www.espruino.com/Reference#l_httpCRq_end
   */
  end: (data: any) => void;

}

/**
 * The HTTP client response, passed to the callback of `http.request()` an `http.get()`.
 * @url http://www.espruino.com/Reference#httpCRs
 */
declare function httpCRs(): void;

type httpCRs = {
  /**
   * The headers received along with the HTTP response
   * @url http://www.espruino.com/Reference#l_httpCRs_headers
   */
  headers: any

  /**
   * The HTTP response's status code - usually `"200"` if all went well
   * @url http://www.espruino.com/Reference#l_httpCRs_statusCode
   */
  statusCode: any

  /**
   * The HTTP response's status message - Usually `"OK"` if all went well
   * @url http://www.espruino.com/Reference#l_httpCRs_statusMessage
   */
  statusMessage: any

  /**
   * The HTTP version reported back by the server - usually `"1.1"`
   * @url http://www.espruino.com/Reference#l_httpCRs_httpVersion
   */
  httpVersion: any

  /**
   * Return how many bytes are available to read. If there is a 'data' event handler, this will always return 0.
   * @url http://www.espruino.com/Reference#l_httpCRs_available
   */
  available: () => number;

  /**
   * Return a string containing characters that have been received
   * @url http://www.espruino.com/Reference#l_httpCRs_read
   */
  read: (chars: number) => any;

  /**
   * Pipe this to a stream (an object with a 'write' method)
   * @url http://www.espruino.com/Reference#l_httpCRs_pipe
   */
  pipe: (destination: any, options: any) => void;

}

/**
 * Library that initialises a network device that calls into JavaScript
 * @url http://www.espruino.com/Reference#l_NetworkJS_undefined
 */
declare function NetworkJS(): void;

/**
 * Library for communication with the WIZnet Ethernet module
 * @url http://www.espruino.com/Reference#l_WIZnet_undefined
 */
declare function WIZnet(): void;

declare namespace WIZnet {
  /**
   * Initialise the WIZnet module and return an Ethernet object
   * @url http://www.espruino.com/Reference#l_WIZnet_connect
   */
  function connect(spi: any, cs: Pin): Ethernet;

}

/**
 * An instantiation of an Ethernet network adaptor
 * @url http://www.espruino.com/Reference#Ethernet
 */
declare function Ethernet(): void;

type Ethernet = {
  /**
   * Get the current IP address, subnet, gateway and mac address.
   * @url http://www.espruino.com/Reference#l_Ethernet_getIP
   */
  getIP: (options: any) => any;

  /**
   * Set the current IP address or get an IP from DHCP (if no options object is specified)
   * If 'mac' is specified as an option, it must be a string of the form `"00:01:02:03:04:05"`
   * The default mac is 00:08:DC:01:02:03.
   * @url http://www.espruino.com/Reference#l_Ethernet_setIP
   */
  setIP: (options: any, callback: any) => boolean;

  /**
   * Set hostname allow to set the hosname used during the dhcp request.
   * min 8 and max 12 char, best set before calling `eth.setIP()`
   * Default is WIZnet010203, 010203 is the default nic as part of the mac.
   * Best to set the hosname before calling setIP().
   * @url http://www.espruino.com/Reference#l_Ethernet_setHostname
   */
  setHostname: (hostname: any, callback: any) => boolean;

  /**
   * Returns the hostname
   * @url http://www.espruino.com/Reference#l_Ethernet_getHostname
   */
  getHostname: (callback: any) => any;

  /**
   * Get the current status of the ethernet device
   * @url http://www.espruino.com/Reference#l_Ethernet_getStatus
   */
  getStatus: (options: any) => any;

}

/**
 * This class helps to convert URLs into Objects of information ready for http.request/get
 * @url http://www.espruino.com/Reference#url
 */
declare function url(): void;

declare namespace url {
  /**
   * A utility function to split a URL into parts
   * This is useful in web servers for instance when handling a request.
   * For instance `url.parse("/a?b=c&d=e",true)` returns `{"method":"GET","host":"","path":"/a?b=c&d=e","pathname":"/a","search":"?b=c&d=e","port":80,"query":{"b":"c","d":"e"}}`
   * @url http://www.espruino.com/Reference#l_url_parse
   */
  function parse(urlStr: any, parseQuery: boolean): any;

}

/**
 * This library allows you to create TCPIP servers and clients
 * In order to use this, you will need an extra module to get network connectivity.
 * This is designed to be a cut-down version of the [Internet](http://nodejs.org/api/net.html">node.js library</a>. Please see the <a href="/Internet) page for more information on how to use it.
 * @url http://www.espruino.com/Reference#l_net_undefined
 */
declare function net(): void;

declare namespace net {
  /**
   * Create a Server
   * When a request to the server is made, the callback is called. In the callback you can use the methods on the connection to send data. You can also add `connection.on('data',function() { ... })` to listen for received data
   * @url http://www.espruino.com/Reference#l_net_createServer
   */
  function createServer(callback: any): Server;

  /**
   * Create a TCP socket connection
   * @url http://www.espruino.com/Reference#l_net_connect
   */
  function connect(options: any, callback: any): Socket;

}

/**
 * The socket server created by `require('net').createServer`
 * @url http://www.espruino.com/Reference#Server
 */
declare function Server(): void;

type Server = {
  /**
   * Start listening for new connections on the given port
   * @url http://www.espruino.com/Reference#l_Server_listen
   */
  listen: (port: number) => any;

  /**
   * Stop listening for new connections
   * @url http://www.espruino.com/Reference#l_Server_close
   */
  close: () => void;

}

/**
 * An actual socket connection - allowing transmit/receive of TCP data
 * @url http://www.espruino.com/Reference#Socket
 */
declare function Socket(): void;

type Socket = {
  /**
   * Return how many bytes are available to read. If there is already a listener for data, this will always return 0.
   * @url http://www.espruino.com/Reference#l_Socket_available
   */
  available: () => number;

  /**
   * Return a string containing characters that have been received
   * @url http://www.espruino.com/Reference#l_Socket_read
   */
  read: (chars: number) => any;

  /**
   * Pipe this to a stream (an object with a 'write' method)
   * @url http://www.espruino.com/Reference#l_Socket_pipe
   */
  pipe: (destination: any, options: any) => void;

  /**
   * Close this socket - optional data to append as an argument.
   * See `Socket.write` for more information about the data argument
   * @url http://www.espruino.com/Reference#l_Socket_end
   */
  end: (data: any) => void;

}

/**
 * This library allows you to create UDP/DATAGRAM servers and clients
 * In order to use this, you will need an extra module to get network connectivity.
 * This is designed to be a cut-down version of the [Internet](http://nodejs.org/api/dgram.html">node.js library</a>. Please see the <a href="/Internet) page for more information on how to use it.
 * @url http://www.espruino.com/Reference#l_dgram_undefined
 */
declare function dgram(): void;

declare namespace dgram {
  /**
   * Create a UDP socket
   * @url http://www.espruino.com/Reference#l_dgram_createSocket
   */
  function createSocket(type: any, callback: any): dgramSocket;

}

/**
 * An actual socket connection - allowing transmit/receive of TCP data
 * @url http://www.espruino.com/Reference#dgramSocket
 */
declare function dgramSocket(): void;

type dgramSocket = {
  /**
   * @url http://www.espruino.com/Reference#l_dgramSocket_send
   */
  send: (buffer: any, offset: any, length: any, args: any) => void;

  /**
   * @url http://www.espruino.com/Reference#l_dgramSocket_bind
   */
  bind: (port: number, callback: any) => any;

  /**
   * Close the socket
   * @url http://www.espruino.com/Reference#l_dgramSocket_close
   */
  close: () => void;

  /**
   * @url http://www.espruino.com/Reference#l_dgramSocket_addMembership
   */
  addMembership: (group: any, ip: any) => void;

}

/**
 * This library allows you to create TCPIP servers and clients using TLS encryption
 * In order to use this, you will need an extra module to get network connectivity.
 * This is designed to be a cut-down version of the [Internet](http://nodejs.org/api/tls.html">node.js library</a>. Please see the <a href="/Internet) page for more information on how to use it.
 * @url http://www.espruino.com/Reference#l_tls_undefined
 */
declare function tls(): void;

/**
 * Simple library for compression/decompression using [LZSS](https://github.com/atomicobject/heatshrink">heatshrink</a>, an <a href="https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Storer%E2%80%93Szymanski) compression tool.
 * Espruino uses heatshrink internally to compress RAM down to fit in Flash memory when `save()` is used. This just exposes that functionality.
 * Functions here take and return buffers of data. There is no support for streaming, so both the compressed and decompressed data must be able to fit in memory at the same time.
 * @url http://www.espruino.com/Reference#l_heatshrink_undefined
 */
declare function heatshrink(): void;

declare namespace heatshrink {
  /**
   * @url http://www.espruino.com/Reference#l_heatshrink_compress
   */
  function compress(data: any): ArrayBuffer;

  /**
   * @url http://www.espruino.com/Reference#l_heatshrink_decompress
   */
  function decompress(data: any): ArrayBuffer;

}

/**
 * Creates a Queue Object
 * @url http://www.espruino.com/Reference#l_Queue_Queue
 */
declare function Queue(queueName: any): any;

type Queue = {
  /**
   * reads one character from queue, if available
   * @url http://www.espruino.com/Reference#l_Queue_read
   */
  read: () => void;

  /**
   * Writes one character to queue
   * @url http://www.espruino.com/Reference#l_Queue_writeChar
   */
  writeChar: (char: any) => void;

  /**
   * logs list of queues
   * @url http://www.espruino.com/Reference#l_Queue_log
   */
  log: () => void;

}

/**
 * Creates a Task Object
 * @url http://www.espruino.com/Reference#l_Task_Task
 */
declare function Task(taskName: any): any;

type Task = {
  /**
   * Suspend task, be careful not to suspend Espruino task itself
   * @url http://www.espruino.com/Reference#l_Task_suspend
   */
  suspend: () => void;

  /**
   * Resumes a suspended task
   * @url http://www.espruino.com/Reference#l_Task_resume
   */
  resume: () => void;

  /**
   * returns name of actual task
   * @url http://www.espruino.com/Reference#l_Task_getCurrent
   */
  getCurrent: () => any;

  /**
   * Sends a binary notify to task
   * @url http://www.espruino.com/Reference#l_Task_notify
   */
  notify: () => void;

  /**
   * logs list of tasks
   * @url http://www.espruino.com/Reference#l_Task_log
   */
  log: () => void;

}

/**
 * Creates a Timer Object
 * @url http://www.espruino.com/Reference#l_Timer_Timer
 */
declare function Timer(timerName: any, group: number, index: number, isrIndex: number): any;

type Timer = {
  /**
   * Starts a timer
   * @url http://www.espruino.com/Reference#l_Timer_start
   */
  start: (duration: number) => void;

  /**
   * Reschedules a timer, needs to be started at least once
   * @url http://www.espruino.com/Reference#l_Timer_reschedule
   */
  reschedule: (duration: number) => void;

  /**
   * logs list of timers
   * @url http://www.espruino.com/Reference#l_Timer_log
   */
  log: () => void;

}

/**
 * Class containing utility functions for the [ESP32](http://www.espruino.com/ESP32)
 * @url http://www.espruino.com/Reference#ESP32
 */
declare function ESP32(): void;

declare namespace ESP32 {
  /**
   * @url http://www.espruino.com/Reference#l_ESP32_setAtten
   */
  function setAtten(pin: Pin, atten: number): void;

  /**
   * Perform a hardware reset/reboot of the ESP32.
   * @url http://www.espruino.com/Reference#l_ESP32_reboot
   */
  function reboot(): void;

  /**
   * Put device in deepsleep state for "us" microseconds.
   * @url http://www.espruino.com/Reference#l_ESP32_deepSleep
   */
  function deepSleep(us: number): void;

  /**
   * Returns an object that contains details about the state of the ESP32 with the following fields:
   *
   * - `sdkVersion`   - Version of the SDK.
   * - `freeHeap`     - Amount of free heap in bytes.
   * - `BLE`             - Status of BLE, enabled if true.
   * - `Wifi`         - Status of Wifi, enabled if true.
   * - `minHeap`      - Minimum heap, calculated by heap_caps_get_minimum_free_size
   *
   * @url http://www.espruino.com/Reference#l_ESP32_getState
   */
  function getState(): any;

  /**
   * @url http://www.espruino.com/Reference#l_ESP32_setBLE_Debug
   */
  function setBLE_Debug(level: number): void;

  /**
   * Switches Bluetooth off/on, removes saved code from Flash, resets the board,
   * and on restart creates jsVars depending on available heap (actual additional 1800)
   * @url http://www.espruino.com/Reference#l_ESP32_enableBLE
   */
  function enableBLE(enable: boolean): void;

  /**
   * Switches Wifi off/on, removes saved code from Flash, resets the board,
   * and on restart creates jsVars depending on available heap (actual additional 3900)
   * @url http://www.espruino.com/Reference#l_ESP32_enableWifi
   */
  function enableWifi(enable: boolean): void;

}

/**
 * This is the built-in class for the Arduino-style pin namings on ST Nucleo boards
 * @url http://www.espruino.com/Reference#Nucleo
 */
declare function Nucleo(): void;

declare namespace Nucleo {
  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A0
   */
  const A0: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A1
   */
  const A1: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A2
   */
  const A2: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A3
   */
  const A3: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A4
   */
  const A4: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A5
   */
  const A5: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D0
   */
  const D0: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D1
   */
  const D1: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D2
   */
  const D2: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D3
   */
  const D3: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D4
   */
  const D4: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D5
   */
  const D5: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D6
   */
  const D6: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D7
   */
  const D7: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D8
   */
  const D8: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D9
   */
  const D9: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D10
   */
  const D10: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D11
   */
  const D11: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D12
   */
  const D12: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D13
   */
  const D13: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D14
   */
  const D14: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D15
   */
  const D15: Pin;

}

/**
 * This is a built-in class to allow you to use the ESP8266 NodeMCU boards's pin namings to access pins. It is only available on ESP8266-based boards.
 * @url http://www.espruino.com/Reference#NodeMCU
 */
declare function NodeMCU(): void;

declare namespace NodeMCU {
  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_A0
   */
  const A0: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D0
   */
  const D0: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D1
   */
  const D1: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D2
   */
  const D2: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D3
   */
  const D3: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D4
   */
  const D4: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D5
   */
  const D5: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D6
   */
  const D6: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D7
   */
  const D7: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D8
   */
  const D8: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D9
   */
  const D9: Pin;

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D10
   */
  const D10: Pin;

}

/**
 * Create a software Serial port. This has limited functionality (only low baud rates), but it can work on any pins.
 * Use `Serial.setup` to configure this port.
 * @url http://www.espruino.com/Reference#l_Serial_Serial
 */
declare function Serial(): any;

declare namespace Serial {
  /**
   * Try and find a USART (Serial) hardware device that will work on this pin (eg. `Serial1`)
   * May return undefined if no device can be found.
   * @url http://www.espruino.com/Reference#l_Serial_find
   */
  function find(pin: Pin): any;

}

type Serial = {
  /**
   * Set this Serial port as the port for the JavaScript console (REPL).
   * Unless `force` is set to true, changes in the connection state of the board
   * (for instance plugging in USB) will cause the console to change.
   * See `E.setConsole` for a more flexible version of this function.
   * @url http://www.espruino.com/Reference#l_Serial_setConsole
   */
  setConsole: (force: boolean) => void;

  /**
   * If the serial (or software serial) device was set up,
   * uninitialise it.
   * @url http://www.espruino.com/Reference#l_Serial_unsetup
   */
  unsetup: () => void;

  /**
   * Print a string to the serial port - without a line feed
   *  **Note:** This function replaces any occurances of `\n` in the string with `\r\n`. To avoid this, use `Serial.write`.
   * @url http://www.espruino.com/Reference#l_Serial_print
   */
  print: (string: any) => void;

  /**
   * Print a line to the serial port with a newline (`\r\n`) at the end of it.
   *  **Note:** This function converts data to a string first, eg `Serial.print([1,2,3])` is equivalent to `Serial.print("1,2,3"). If you'd like to write raw bytes, use`Serial.write`.
   * @url http://www.espruino.com/Reference#l_Serial_println
   */
  println: (string: any) => void;

  /**
   * Write a character or array of data to the serial port
   * This method writes unmodified data, eg `Serial.write([1,2,3])` is equivalent to `Serial.write("\1\2\3")`. If you'd like data converted to a string first, use `Serial.print`.
   * @url http://www.espruino.com/Reference#l_Serial_write
   */
  write: (data: any) => void;

  /**
   * Return how many bytes are available to read. If there is already a listener for data, this will always return 0.
   * @url http://www.espruino.com/Reference#l_Serial_available
   */
  available: () => number;

  /**
   * Return a string containing characters that have been received
   * @url http://www.espruino.com/Reference#l_Serial_read
   */
  read: (chars: number) => any;

  /**
   * Pipe this USART to a stream (an object with a 'write' method)
   * @url http://www.espruino.com/Reference#l_Serial_pipe
   */
  pipe: (destination: any, options: any) => void;

}

/**
 * The USB Serial port
 * @url http://www.espruino.com/Reference#l__global_USB
 */
declare const USB: Serial;

/**
 * The first Serial (USART) port
 * @url http://www.espruino.com/Reference#l__global_Serial1
 */
declare const Serial1: Serial;

/**
 * The second Serial (USART) port
 * @url http://www.espruino.com/Reference#l__global_Serial2
 */
declare const Serial2: Serial;

/**
 * The third Serial (USART) port
 * @url http://www.espruino.com/Reference#l__global_Serial3
 */
declare const Serial3: Serial;

/**
 * The fourth Serial (USART) port
 * @url http://www.espruino.com/Reference#l__global_Serial4
 */
declare const Serial4: Serial;

/**
 * The fifth Serial (USART) port
 * @url http://www.espruino.com/Reference#l__global_Serial5
 */
declare const Serial5: Serial;

/**
 * The sixth Serial (USART) port
 * @url http://www.espruino.com/Reference#l__global_Serial6
 */
declare const Serial6: Serial;

/**
 * A loopback serial device. Data sent to `LoopbackA` comes out of `LoopbackB` and vice versa
 * @url http://www.espruino.com/Reference#l__global_LoopbackA
 */
declare const LoopbackA: Serial;

/**
 * A loopback serial device. Data sent to `LoopbackA` comes out of `LoopbackB` and vice versa
 * @url http://www.espruino.com/Reference#l__global_LoopbackB
 */
declare const LoopbackB: Serial;

/**
 * A telnet serial device that maps to the built-in telnet console server (devices that have built-in wifi only).
 * @url http://www.espruino.com/Reference#l__global_Telnet
 */
declare const Telnet: any;

/**
 * This is the built-in JavaScript class that is the prototype for:
 *
 * - [Uint8Array](https://espruino.com//Reference#Uint8Array)
 * - [UintClamped8Array](https://espruino.com//Reference#UintClamped8Array)
 * - [Int8Array](https://espruino.com//Reference#Int8Array)
 * - [Uint16Array](https://espruino.com//Reference#Uint16Array)
 * - [Int16Array](https://espruino.com//Reference#Int16Array)
 * - [Uint24Array](https://espruino.com//Reference#Uint24Array) (Espruino-specific - not standard JS)
 * - [Uint32Array](https://espruino.com//Reference#Uint32Array)
 * - [Int32Array](https://espruino.com//Reference#Int32Array)
 * - [Float32Array](https://espruino.com//Reference#Float32Array)
 * - [Float64Array](https://espruino.com//Reference#Float64Array)
 *
 * If you want to access arrays of differing types of data
 * you may also find `DataView` useful.
 * @url http://www.espruino.com/Reference#ArrayBufferView
 */
declare function EspruinoArrayBufferView(): void;

type EspruinoArrayBufferView = {
  /**
   * The buffer this view references
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_buffer
   */
  buffer: any

  /**
   * The length, in bytes, of the `ArrayBufferView`
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_byteLength
   */
  byteLength: number

  /**
   * The offset, in bytes, to the first byte of the view within the backing `ArrayBuffer`
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_byteOffset
   */
  byteOffset: number

  /**
   * Copy the contents of `array` into this one, mapping `this[x+offset]=array[x];`
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_set
   */
  set: (arr: any, offset: number) => void;

  /**
   * Return an array which is made from the following: `A.map(function) = [function(A[0]), function(A[1]), ...]`
   *  **Note:** This returns an `ArrayBuffer` of the same type it was called on. To get an `Array`, use `Array.map`, eg. `[].map.call(myArray, x=>x+1)`
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_map
   */
  map: (fn: any, thisArg: any) => EspruinoArrayBufferView;

  /**
   * Returns a smaller part of this array which references the same data (it doesn't copy it).
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_subarray
   */
  subarray: (begin: number, end: any) => EspruinoArrayBufferView;

  /**
   * Return the index of the value in the array, or `-1`
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_indexOf
   */
  indexOf: (value: any, startIndex: number) => any;

  /**
   * Return `true` if the array includes the value, `false` otherwise
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_includes
   */
  includes: (value: any, startIndex: number) => boolean;

  /**
   * Join all elements of this array together into one string, using 'separator' between them. eg. `[1,2,3].join(' ')=='1 2 3'`
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_join
   */
  join: (separator: any) => any;

  /**
   * Do an in-place quicksort of the array
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_sort
   */
  sort: (variable: any) => EspruinoArrayBufferView;

  /**
   * Executes a provided function once per array element.
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_forEach
   */
  forEach: (fn: any, thisArg: any) => void;

  /**
   * Execute `previousValue=initialValue` and then `previousValue = callback(previousValue, currentValue, index, array)` for each element in the array, and finally return previousValue.
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_reduce
   */
  reduce: (callback: any, initialValue: any) => any;

  /**
   * Fill this array with the given value, for every index `>= start` and `< end`
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_fill
   */
  fill: (value: any, start: number, end: any) => EspruinoArrayBufferView;

  /**
   * Return an array which contains only those elements for which the callback function returns 'true'
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_filter
   */
  filter: (fn: any, thisArg: any) => any;

  /**
   * Return the array element where `function` returns `true`, or `undefined` if it doesn't returns `true` for any element.
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_find
   */
  find: (fn: any) => any;

  /**
   * Return the array element's index where `function` returns `true`, or `-1` if it doesn't returns `true` for any element.
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_findIndex
   */
  findIndex: (fn: any) => any;

  /**
   * Reverse the contents of this `ArrayBufferView` in-place
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_reverse
   */
  reverse: () => EspruinoArrayBufferView;

  /**
   * Return a copy of a portion of this array (in a new array).
   *  **Note:** This currently returns a normal `Array`, not an `ArrayBuffer`
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_slice
   */
  slice: (start: number, end: any) => any[];

}

/**
 * Create a typed array based on the given input. Either an existing Array Buffer, an Integer as a Length, or a simple array. If an `ArrayBufferView` (eg. `Uint8Array` rather than `ArrayBuffer`) is given, it will be completely copied rather than referenced.
 * @url http://www.espruino.com/Reference#l_Uint24Array_Uint24Array
 */
declare function Uint24Array(arr: any, byteOffset: number, length: number): EspruinoArrayBufferView;

type Uint24Array = {
}

/**
 * Create a waveform class. This allows high speed input and output of waveforms. It has an internal variable called `buffer` (as well as `buffer2` when double-buffered - see `options` below) which contains the data to input/output.
 * When double-buffered, a 'buffer' event will be emitted each time a buffer is finished with (the argument is that buffer). When the recording stops, a 'finish' event will be emitted (with the first argument as the buffer).
 * @url http://www.espruino.com/Reference#l_Waveform_Waveform
 */
declare function Waveform(samples: number, options: any): any;

type Waveform = {
  /**
   * Will start outputting the waveform on the given pin - the pin must have previously been initialised with analogWrite. If not repeating, it'll emit a `finish` event when it is done.
   * @url http://www.espruino.com/Reference#l_Waveform_startOutput
   */
  startOutput: (output: Pin, freq: number, options: any) => void;

  /**
   * Will start inputting the waveform on the given pin that supports analog. If not repeating, it'll emit a `finish` event when it is done.
   * @url http://www.espruino.com/Reference#l_Waveform_startInput
   */
  startInput: (output: Pin, freq: number, options: any) => void;

  /**
   * Stop a waveform that is currently outputting
   * @url http://www.espruino.com/Reference#l_Waveform_stop
   */
  stop: () => void;

}

/**
 * This module allows you to read and write part of the nonvolatile flash
 * memory of your device using a filesystem-like API.
 * Also see the `Flash` library, which provides a low level, more dangerous way
 * to access all parts of your flash memory.
 * The `Storage` library provides two distinct types of file:
 *
 * - `require("Storage").write(...)`/`require("Storage").read(...)`/etc create simple
 * contiguous files of fixed length. This is the recommended file type.
 * - `require("Storage").open(...)` creates a `StorageFile`, which stores the file in
 * numbered chunks (`"filename\1"`/`"filename\2"`/etc). It allows data to be appended
 * and for the file to be read line by line.
 *
 * You must read a file using the same method you used to write it - eg. you can't create a
 * file with `require("Storage").open(...)` and then read it with `require("Storage").read(...)`.
 * **Note:** In firmware 2v05 and later, the maximum length for filenames
 * is 28 characters. However in 2v04 and earlier the max length is 8.
 * @url http://www.espruino.com/Reference#l_Storage_undefined
 */
declare function EspruinoStorage(): void;

declare namespace EspruinoStorage {
  /**
   * Erase the flash storage area. This will remove all files
   * created with `require("Storage").write(...)` as well
   * as any code saved with `save()` or `E.setBootCode()`.
   * @url http://www.espruino.com/Reference#l_Storage_eraseAll
   */
  function eraseAll(): void;

  /**
   * Erase a single file from the flash storage area.
   * **Note:** This function should be used with normal files, and not
   * `StorageFile`s created with `require("Storage").open(filename, ...)`
   * @url http://www.espruino.com/Reference#l_Storage_erase
   */
  function erase(name: any): void;

  /**
   * Read a file from the flash storage area that has
   * been written with `require("Storage").write(...)`.
   * This function returns a memory-mapped String that points to the actual
   * memory area in read-only memory, so it won't use up RAM.
   * As such you can check if a file exists efficiently using `require("Storage").read(filename)!==undefined`.
   * If you evaluate this string with `eval`, any functions
   * contained in the String will keep their code stored
   * in flash memory.
   * **Note:** This function should be used with normal files, and not
   * `StorageFile`s created with `require("Storage").open(filename, ...)`
   * @url http://www.espruino.com/Reference#l_Storage_read
   */
  function read(name: any, offset: number, length: number): any;

  /**
   * Read a file from the flash storage area that has
   * been written with `require("Storage").write(...)`,
   * and parse JSON in it into a JavaScript object.
   * This is identical to `JSON.parse(require("Storage").read(...))`.
   * It will throw an exception if the data in the file is not
   * valid JSON.
   * **Note:** This function should be used with normal files, and not
   * `StorageFile`s created with `require("Storage").open(filename, ...)`
   * @url http://www.espruino.com/Reference#l_Storage_readJSON
   */
  function readJSON(name: any, noExceptions: boolean): any;

  /**
   * Read a file from the flash storage area that has
   * been written with `require("Storage").write(...)`,
   * and return the raw binary data as an ArrayBuffer.
   * This can be used:
   *
   * - In a `DataView` with `new DataView(require("Storage").readArrayBuffer("x"))`
   * - In a `Uint8Array/Float32Array/etc` with `new Uint8Array(require("Storage").readArrayBuffer("x"))`
   *
   * **Note:** This function should be used with normal files, and not
   * `StorageFile`s created with `require("Storage").open(filename, ...)`
   * @url http://www.espruino.com/Reference#l_Storage_readArrayBuffer
   */
  function readArrayBuffer(name: any): any;

  /**
   * Write/create a file in the flash storage area. This is
   * nonvolatile and will not disappear when the device resets
   * or power is lost.
   * Simply write `require("Storage").writeJSON("MyFile", [1,2,3])` to write
   * a new file, and `require("Storage").readJSON("MyFile")` to read it.
   * This is equivalent to: `require("Storage").write(name, JSON.stringify(data))`
   * **Note:** This function should be used with normal files, and not
   * `StorageFile`s created with `require("Storage").open(filename, ...)`
   * @url http://www.espruino.com/Reference#l_Storage_writeJSON
   */
  function writeJSON(name: any, data: any): boolean;

  /**
   * The Flash Storage system is journaling. To make the most of the limited
   * write cycles of Flash memory, Espruino marks deleted/replaced files as
   * garbage and moves on to a fresh part of flash memory. Espruino only
   * fully erases those files when it is running low on flash, or when
   * `compact` is called.
   * `compact` may fail if there isn't enough RAM free on the stack to
   * use as swap space, however in this case it will not lose data.
   * **Note:** `compact` rearranges the contents of memory. If code is
   * referencing that memory (eg. functions that have their code stored in flash)
   * then they may become garbled when compaction happens. To avoid this,
   * call `eraseFiles` before uploading data that you intend to reference to
   * ensure that uploaded files are right at the start of flash and cannot be
   * compacted further.
   * @url http://www.espruino.com/Reference#l_Storage_compact
   */
  function compact(): void;

  /**
   * This writes information about all blocks in flash
   * memory to the console - and is only useful for debugging
   * flash storage.
   * @url http://www.espruino.com/Reference#l_Storage_debug
   */
  function debug(): void;

  /**
   * Return the amount of free bytes available in
   * Storage. Due to fragmentation there may be more
   * bytes available, but this represents the maximum
   * size of file that can be written.
   * @url http://www.espruino.com/Reference#l_Storage_getFree
   */
  function getFree(): number;

  /**
   * Open a file in the Storage area. This can be used for appending data
   * (normal read/write operations only write the entire file).
   * Please see `StorageFile` for more information (and examples).
   * **Note:** These files write through immediately - they do not need closing.
   * @url http://www.espruino.com/Reference#l_Storage_open
   */
  function open(name: any, mode: any): StorageFile;

}

/**
 * This is the built-in JavaScript class for Espruino utility functions.
 * @url http://www.espruino.com/Reference#E
 */
declare function E(): void;

declare namespace E {
  /**
   * @url http://www.espruino.com/Reference#l_E_showMenu
   */
  function showMenu(): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_showPrompt
   */
  function showPrompt(): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_showScroller
   */
  function showScroller(): void;

  /**
   * Unmount the SD card, so it can be removed. If you remove the SD card without calling this you may cause corruption, and you will be unable to access another SD card until you reset Espruino or call `E.unmountSD()`.
   * @url http://www.espruino.com/Reference#l_E_unmountSD
   */
  function unmountSD(): void;

  /**
   * Open a file
   * @url http://www.espruino.com/Reference#l_E_openFile
   */
  function openFile(path: any, mode: any): EspruinoFile;

  /**
   * Use the microcontroller's internal thermistor to work out the temperature.
   * On Puck.js v2.0 this will use the on-board PCT2075TP temperature sensor, but on other devices it may not be desperately well calibrated.
   * While this is implemented on Espruino boards, it may not be implemented on other devices. If so it'll return NaN.
   *  **Note:** This is not entirely accurate and varies by a few degrees from chip to chip. It measures the **die temperature**, so when connected to USB it could be reading 10 over degrees C above ambient temperature. When running from battery with `setDeepSleep(true)` it is much more accurate though.
   * @url http://www.espruino.com/Reference#l_E_getTemperature
   */
  function getTemperature(): number;

  /**
   * Check the internal voltage reference. To work out an actual voltage of an input pin, you can use `analogRead(pin)*E.getAnalogVRef()`
   *  **Note:** This value is calculated by reading the voltage on an internal voltage reference with the ADC.
   * It will be slightly noisy, so if you need this for accurate measurements we'd recommend that you call
   * this function several times and average the results.
   * While this is implemented on Espruino boards, it may not be implemented on other devices. If so it'll return NaN.
   * @url http://www.espruino.com/Reference#l_E_getAnalogVRef
   */
  function getAnalogVRef(): number;

  /**
   * ADVANCED: This is a great way to crash Espruino if you're not sure what you are doing
   * Create a native function that executes the code at the given address. Eg. `E.nativeCall(0x08012345,'double (double,double)')(1.1, 2.2)`
   * If you're executing a thumb function, you'll almost certainly need to set the bottom bit of the address to 1.
   * Note it's not guaranteed that the call signature you provide can be used - there are limits on the number of arguments allowed.
   * When supplying `data`, if it is a 'flat string' then it will be used directly, otherwise it'll be converted to a flat string and used.
   * @url http://www.espruino.com/Reference#l_E_nativeCall
   */
  function nativeCall(addr: number, sig: any, data: any): any;

  /**
   * Clip a number to be between min and max (inclusive)
   * @url http://www.espruino.com/Reference#l_E_clip
   */
  function clip(x: number, min: number, max: number): number;

  /**
   * Sum the contents of the given Array, String or ArrayBuffer and return the result
   * @url http://www.espruino.com/Reference#l_E_sum
   */
  function sum(arr: any): number;

  /**
   * Work out the variance of the contents of the given Array, String or ArrayBuffer and return the result. This is equivalent to `v=0;for (i in arr) v+=Math.pow(mean-arr[i],2)`
   * @url http://www.espruino.com/Reference#l_E_variance
   */
  function variance(arr: any, mean: number): number;

  /**
   * Convolve arr1 with arr2. This is equivalent to `v=0;for (i in arr1) v+=arr1[i] * arr2[(i+offset) % arr2.length]`
   * @url http://www.espruino.com/Reference#l_E_convolve
   */
  function convolve(arr1: any, arr2: any, offset: number): number;

  /**
   * Performs a Fast Fourier Transform (FFT) in 32 bit floats on the supplied data and writes it back into the
   * original arrays. Note that if only one array is supplied, the data written back is the modulus of the complex
   * result `sqrt(r*r+i*i)`.
   * In order to perform the FFT, there has to be enough room on the stack to allocate two arrays of 32 bit
   * floating point numbers - this will limit the maximum size of FFT possible to around 1024 items on
   * most platforms.
   * **Note:** on the Original Espruino board, FFTs are performed in 64bit arithmetic as there isn't
   * space to include the 32 bit maths routines (2x more RAM is required).
   * @url http://www.espruino.com/Reference#l_E_FFT
   */
  function FFT(arrReal: any, arrImage: any, inverse: boolean): void;

  /**
   * Kicks a Watchdog timer set up with `E.enableWatchdog(..., false)`. See
   * `E.enableWatchdog` for more information.
   * **NOTE:** This is only implemented on STM32 and nRF5x devices (all official Espruino boards).
   * @url http://www.espruino.com/Reference#l_E_kickWatchdog
   */
  function kickWatchdog(): void;

  /**
   * Get and reset the error flags. Returns an array that can contain:
   * `'FIFO_FULL'`: The receive FIFO filled up and data was lost. This could be state transitions for setWatch, or received characters.
   * `'BUFFER_FULL'`: A buffer for a stream filled up and characters were lost. This can happen to any stream - Serial,HTTP,etc.
   * `'CALLBACK'`: A callback (`setWatch`, `setInterval`, `on('data',...)`) caused an error and so was removed.
   * `'LOW_MEMORY'`: Memory is running low - Espruino had to run a garbage collection pass or remove some of the command history
   * `'MEMORY'`: Espruino ran out of memory and was unable to allocate some data that it needed.
   * `'UART_OVERFLOW'` : A UART received data but it was not read in time and was lost
   * @url http://www.espruino.com/Reference#l_E_getErrorFlags
   */
  function getErrorFlags(): any;

  /**
   * Get Espruino's interpreter flags that control the way it handles your JavaScript code.
   *
   * - `deepSleep` - Allow deep sleep modes (also set by setDeepSleep)
   * - `pretokenise` - When adding functions, pre-minify them and tokenise reserved words
   * - `unsafeFlash` - Some platforms stop writes/erases to interpreter memory to stop you bricking the device accidentally - this removes that protection
   * - `unsyncFiles` - When writing files, *don't* flush all data to the SD card after each command (the default is *to* flush). This is much faster, but can cause filesystem damage if power is lost without the filesystem unmounted.
   *
   * @url http://www.espruino.com/Reference#l_E_getFlags
   */
  function getFlags(): any;

  /**
   * Set the Espruino interpreter flags that control the way it handles your JavaScript code.
   * Run `E.getFlags()` and check its description for a list of available flags and their values.
   * @url http://www.espruino.com/Reference#l_E_setFlags
   */
  function setFlags(flags: any): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_pipe
   */
  function pipe(source: any, destination: any, options: any): void;

  /**
   * Create an ArrayBuffer from the given string. This is done via a reference, not a copy - so it is very fast and memory efficient.
   * Note that this is an ArrayBuffer, not a Uint8Array. To get one of those, do: `new Uint8Array(E.toArrayBuffer('....'))`.
   * @url http://www.espruino.com/Reference#l_E_toArrayBuffer
   */
  function toArrayBuffer(str: any): EspruinoArrayBufferView;

  /**
   * This performs the same basic function as `JSON.stringify`,
   * however `JSON.stringify` adds extra characters to conform
   * to the JSON spec which aren't required if outputting JS.
   * `E.toJS` will also stringify JS functions, whereas
   * `JSON.stringify` ignores them.
   * For example:
   *
   * - `JSON.stringify({a:1,b:2}) == '{"a":1,"b":2}'`
   * - `E.toJS({a:1,b:2}) == '{a:1,b:2}'`
   *
   * **Note:** Strings generated with `E.toJS` can't be
   * reliably parsed by `JSON.parse` - however they are
   * valid JS so will work with `eval` (but this has security
   * implications if you don't trust the source of the string).
   * On the desktop [JSON5 parsers](https://github.com/json5/json5)
   * will parse the strings produced by `E.toJS` without trouble.
   * @url http://www.espruino.com/Reference#l_E_toJS
   */
  function toJS(arg: any): string;

  /**
   * This creates and returns a special type of string, which actually references
   * a specific memory address. It can be used in order to use sections of
   * Flash memory directly in Espruino (for example to execute code straight
   * from flash memory with `eval(E.memoryArea( ... ))`)
   * **Note:** This is only tested on STM32-based platforms (Espruino Original
   * and Espruino Pico) at the moment.
   * @url http://www.espruino.com/Reference#l_E_memoryArea
   */
  function memoryArea(addr: number, len: number): string;

  /**
   * This writes JavaScript code into Espruino's flash memory, to be executed on
   * startup. It differs from `save()` in that `save()` saves the whole state of
   * the interpreter, whereas this just saves JS code that is executed at boot.
   * Code will be executed before `onInit()` and `E.on('init', ...)`.
   * If `alwaysExec` is `true`, the code will be executed even after a call to
   * `reset()`. This is useful if you're making something that you want to
   * program, but you want some code that is always built in (for instance
   * setting up a display or keyboard).
   * To remove boot code that has been saved previously, use `E.setBootCode("")`
   * **Note:** this removes any code that was previously saved with `save()`
   * @url http://www.espruino.com/Reference#l_E_setBootCode
   */
  function setBootCode(code: any, alwaysExec: boolean): void;

  /**
   * This sets the clock frequency of Espruino's processor. It will return `0` if
   * it is unimplemented or the clock speed cannot be changed.
   * **Note:** On pretty much all boards, UART, SPI, I2C, PWM, etc will change
   * frequency and will need setting up again in order to work.
   * <h3 id="stm32f4">STM32F4</h3>
   * Options is of the form `{ M: int, N: int, P: int, Q: int }` - see the 'Clocks'
   * section of the microcontroller's reference manual for what these mean.
   *
   * - System clock = 8Mhz * N / ( M * P )
   * - USB clock (should be 48Mhz) = 8Mhz * N / ( M * Q )
   *
   * Optional arguments are:
   *
   * - `latency` - flash latency from 0..15
   * - `PCLK1` - Peripheral clock 1 divisor (default: 2)
   * - `PCLK2` - Peripheral clock 2 divisor (default: 4)
   *
   * The Pico's default is `{M:8, N:336, P:4, Q:7, PCLK1:2, PCLK2:4}`, use
   * `{M:8, N:336, P:8, Q:7, PCLK:1, PCLK2:2}` to halve the system clock speed
   * while keeping the peripherals running at the same speed (omitting PCLK1/2
   * will lead to the peripherals changing speed too).
   * On STM32F4 boards (eg. Espruino Pico), the USB clock needs to be kept at 48Mhz
   * or USB will fail to work. You'll also experience USB instability if the processor
   * clock falls much below 48Mhz.
   * <h3 id="esp8266">ESP8266</h3>
   * Just specify an integer value, either 80 or 160 (for 80 or 160Mhz)
   * @url http://www.espruino.com/Reference#l_E_setClock
   */
  function setClock(options: any): number;

  /**
   * Returns the current console device - see `E.setConsole` for more information.
   * @url http://www.espruino.com/Reference#l_E_getConsole
   */
  function getConsole(): any;

  /**
   * Reverse the 8 bits in a byte, swapping MSB and LSB.
   * For example, `E.reverseByte(0b10010000) == 0b00001001`.
   * Note that you can reverse all the bytes in an array with: `arr = arr.map(E.reverseByte)`
   * @url http://www.espruino.com/Reference#l_E_reverseByte
   */
  function reverseByte(x: number): number;

  /**
   * Output the current list of Utility Timer Tasks - for debugging only
   * @url http://www.espruino.com/Reference#l_E_dumpTimers
   */
  function dumpTimers(): void;

  /**
   * Dump any locked variables that aren't referenced from `global` - for debugging memory leaks only.
   * @url http://www.espruino.com/Reference#l_E_dumpLockedVars
   */
  function dumpLockedVars(): void;

  /**
   * Dump any locked variables that aren't referenced from `global` - for debugging memory leaks only.
   * @url http://www.espruino.com/Reference#l_E_dumpFreeList
   */
  function dumpFreeList(): void;

  /**
   * Show fragmentation.
   *
   * - `` is free space
   * - `#` is a normal variable
   * - `L` is a locked variable (address used, cannopt be moved)
   * - `=` represents data in a Flat String (must be contiguous)
   *
   * @url http://www.espruino.com/Reference#l_E_dumpFragmentation
   */
  function dumpFragmentation(): void;

  /**
   * Dumps a comma-separated list of all allocated variables
   * along with the variables they link to. Can be used
   * to visualise where memory is used.
   * @url http://www.espruino.com/Reference#l_E_dumpVariables
   */
  function dumpVariables(): void;

  /**
   * BETA: defragment memory!
   * @url http://www.espruino.com/Reference#l_E_defrag
   */
  function defrag(): void;

  /**
   * Return the address in memory of the given variable. This can then
   * be used with `peek` and `poke` functions. However, changing data in
   * JS variables directly (flatAddress=false) will most likely result in a crash.
   * This functions exists to allow embedded targets to set up
   * peripherals such as DMA so that they write directly to
   * JS variables.
   * See [http://www.espruino.com/Internals](http://www.espruino.com/Internals) for more information
   * @url http://www.espruino.com/Reference#l_E_getAddressOf
   */
  function getAddressOf(v: any, flatAddress: boolean): number;

  /**
   * Search in an Object, Array, or Function
   * @url http://www.espruino.com/Reference#l_E_lookupNoCase
   */
  function lookupNoCase(haystack: any, needle: any, returnKey: boolean): any;

  /**
   * Get the current interpreter state in a text form such that it can be copied to a new device
   * @url http://www.espruino.com/Reference#l_E_dumpStr
   */
  function dumpStr(): string;

  /**
   * Set the seed for the random number generator used by `Math.random()`.
   * @url http://www.espruino.com/Reference#l_E_srand
   */
  function srand(v: number): void;

  /**
   * Unlike 'Math.random()' which uses a pseudo-random number generator, this
   * method reads from the internal voltage reference several times, xoring and
   * rotating to try and make a relatively random value from the noise in the
   * signal.
   * @url http://www.espruino.com/Reference#l_E_hwRand
   */
  function hwRand(): number;

  /**
   * Perform a standard 32 bit CRC (Cyclic redundancy check) on the supplied data (one byte at a time)
   * and return the result as an unsigned integer.
   * @url http://www.espruino.com/Reference#l_E_CRC32
   */
  function CRC32(data: any): any;

  /**
   * Convert hue, saturation and brightness to red, green and blue (packed into an integer if `asArray==false` or an array if `asArray==true`).
   * This replaces `Graphics.setColorHSB` and `Graphics.setBgColorHSB`. On devices with 24 bit colour it can
   * be used as: `Graphics.setColor(E.HSBtoRGB(h, s, b))`
   * You can quickly set RGB items in an Array or Typed Array using `array.set(E.HSBtoRGB(h, s, b,true), offset)`,
   * which can be useful with arrays used with `require("neopixel").write`.
   * @url http://www.espruino.com/Reference#l_E_HSBtoRGB
   */
  function HSBtoRGB(hue: number, sat: number, bri: number, asArray: boolean): any;

  /**
   * Set a password on the console (REPL). When powered on, Espruino will
   * then demand a password before the console can be used. If you want to
   * lock the console immediately after this you can call `E.lockConsole()`
   * To remove the password, call this function with no arguments.
   * **Note:** There is no protection against multiple password attempts, so someone
   * could conceivably try every password in a dictionary.
   * **Note:** This password is stored in memory in plain text. If someone is able
   * to execute arbitrary JavaScript code on the device (eg, you use `eval` on input
   * from unknown sources) or read the device's firmware then they may be able to
   * obtain it.
   * @url http://www.espruino.com/Reference#l_E_setPassword
   */
  function setPassword(password: any): void;

  /**
   * If a password has been set with `E.setPassword()`, this will lock the console
   * so the password needs to be entered to unlock it.
   * @url http://www.espruino.com/Reference#l_E_lockConsole
   */
  function lockConsole(): void;

  /**
   * Set the time zone to be used with `Date` objects.
   * For example `E.setTimeZone(1)` will be GMT+0100
   * Time can be set with `setTime`.
   * @url http://www.espruino.com/Reference#l_E_setTimeZone
   */
  function setTimeZone(zone: number): void;

  /**
   * Provide assembly to Espruino.
   * **This function is not part of Espruino**. Instead, it is detected
   * by the Espruino IDE (or command-line tools) at upload time and is
   * replaced with machine code and an `E.nativeCall` call.
   * See [the documentation on the Assembler](http://www.espruino.com/Assembler) for more information.
   * @url http://www.espruino.com/Reference#l_E_asm
   */
  function asm(callspec: any, assemblycode: any): void;

  /**
   * Provides the ability to write C code inside your JavaScript file.
   * **This function is not part of Espruino**. Instead, it is detected
   * by the Espruino IDE (or command-line tools) at upload time, is sent
   * to our web service to be compiled, and is replaced with machine code
   * and an `E.nativeCall` call.
   * See [the documentation on Inline C](http://www.espruino.com/InlineC) for more information and examples.
   * @url http://www.espruino.com/Reference#l_E_compiledC
   */
  function compiledC(code: any): void;

  /**
   * Forces a hard reboot of the microcontroller - as close as possible
   * to if the reset pin had been toggled.
   * **Note:** This is different to `reset()`, which performs a software
   * reset of Espruino (resetting the interpreter and pin states, but not
   * all the hardware)
   * @url http://www.espruino.com/Reference#l_E_reboot
   */
  function reboot(): void;

  /**
   * USB HID will only take effect next time you unplug and re-plug your Espruino. If you're
   * disconnecting it from power you'll have to make sure you have `save()`d after calling
   * this function.
   * @url http://www.espruino.com/Reference#l_E_setUSBHID
   */
  function setUSBHID(opts: any): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_sendUSBHID
   */
  function sendUSBHID(data: any): boolean;

  /**
   * In devices that come with batteries, this function returns
   * the battery charge percentage as an integer between 0 and 100.
   * **Note:** this is an estimation only, based on battery voltage.
   * The temperature of the battery (as well as the load being drawn
   * from it at the time `E.getBattery` is called) will affect the
   * readings.
   * @url http://www.espruino.com/Reference#l_E_getBattery
   */
  function getBattery(): number;

  /**
   * Gets the RTC's current prescaler value if `calibrate` is undefined or false.
   * If `calibrate` is true, the low speed oscillator's speed is calibrated against the high speed
   * oscillator (usually +/- 20 ppm) and a suggested value to be fed into `E.setRTCPrescaler(...)` is returned.
   * See `E.setRTCPrescaler` for more information.
   * @url http://www.espruino.com/Reference#l_E_getRTCPrescaler
   */
  function getRTCPrescaler(calibrate: boolean): number;

}

/**
 * Creates an InternalError object
 * @url http://www.espruino.com/Reference#l_InternalError_InternalError
 */
declare function InternalError(message: any): any;

type InternalError = {
}

/**
 * Creates a pin from the given argument (or returns undefined if no argument)
 * @url http://www.espruino.com/Reference#l_Pin_Pin
 */
declare function Pin(value: any): any;

type Pin = {
  /**
   * Returns the input state of the pin as a boolean.
   *  **Note:** if you didn't call `pinMode` beforehand then this function will also reset the pin's state to `"input"`
   * @url http://www.espruino.com/Reference#l_Pin_read
   */
  read: () => boolean;

  /**
   * Sets the output state of the pin to a 1
   *  **Note:** if you didn't call `pinMode` beforehand then this function will also reset the pin's state to `"output"`
   * @url http://www.espruino.com/Reference#l_Pin_set
   */
  set: () => void;

  /**
   * Sets the output state of the pin to a 0
   *  **Note:** if you didn't call `pinMode` beforehand then this function will also reset the pin's state to `"output"`
   * @url http://www.espruino.com/Reference#l_Pin_reset
   */
  reset: () => void;

  /**
   * Sets the output state of the pin to the parameter given
   *  **Note:** if you didn't call `pinMode` beforehand then this function will also reset the pin's state to `"output"`
   * @url http://www.espruino.com/Reference#l_Pin_write
   */
  write: (value: boolean) => void;

  /**
   * Sets the output state of the pin to the parameter given at the specified time.
   *  **Note:** this **doesn't** change the mode of the pin to an output. To do that, you need to use `pin.write(0)` or `pinMode(pin, 'output')` first.
   * @url http://www.espruino.com/Reference#l_Pin_writeAtTime
   */
  writeAtTime: (value: boolean, time: number) => void;

  /**
   * Return the current mode of the given pin. See `pinMode` for more information.
   * @url http://www.espruino.com/Reference#l_Pin_getMode
   */
  getMode: () => any;

  /**
   * Set the mode of the given pin. See [`pinMode`](#l__global_pinMode) for more information on pin modes.
   * @url http://www.espruino.com/Reference#l_Pin_mode
   */
  mode: (mode: any) => void;

  /**
   * Toggles the state of the pin from off to on, or from on to off.
   * **Note:** This method doesn't currently work on the ESP8266 port of Espruino.
   * **Note:** if you didn't call `pinMode` beforehand then this function will also reset the pin's state to `"output"`
   * @url http://www.espruino.com/Reference#l_Pin_toggle
   */
  toggle: () => boolean;

}

/**
 * Create a software OneWire implementation on the given pin
 * @url http://www.espruino.com/Reference#l_OneWire_OneWire
 */
declare function OneWire(pin: Pin): any;

type OneWire = {
  /**
   * Perform a reset cycle
   * @url http://www.espruino.com/Reference#l_OneWire_reset
   */
  reset: () => boolean;

  /**
   * Select a ROM - always performs a reset first
   * @url http://www.espruino.com/Reference#l_OneWire_select
   */
  select: (rom: any) => void;

  /**
   * Skip a ROM
   * @url http://www.espruino.com/Reference#l_OneWire_skip
   */
  skip: () => void;

  /**
   * Write one or more bytes
   * @url http://www.espruino.com/Reference#l_OneWire_write
   */
  write: (data: any, power: boolean) => void;

  /**
   * Read a byte
   * @url http://www.espruino.com/Reference#l_OneWire_read
   */
  read: (count: any) => any;

  /**
   * Search for devices
   * @url http://www.espruino.com/Reference#l_OneWire_search
   */
  search: (command: number) => any;

}

/**
 * This module allows you to read and write the nonvolatile flash memory of your device.
 * Also see the `Storage` library, which provides a safer file-like
 * interface to nonvolatile storage.
 * It should be used with extreme caution, as it is easy to overwrite parts of Flash
 * memory belonging to Espruino or even its bootloader. If you damage the bootloader
 * then you may need external hardware such as a USB-TTL converter to restore it. For
 * more information on restoring the bootloader see `Advanced Reflashing` in your
 * board's reference pages.
 * To see which areas of memory you can and can't overwrite, look at the values
 * reported by `process.memory()`.
 * **Note:** On Nordic platforms there are checks in place to help you avoid
 * 'bricking' your device be damaging the bootloader. You can disable these with `E.setFlags({unsafeFlash:1})`
 * @url http://www.espruino.com/Reference#l_Flash_undefined
 */
declare function Flash(): void;

declare namespace Flash {
  /**
   * Returns the start and length of the flash page containing the given address.
   * @url http://www.espruino.com/Reference#l_Flash_getPage
   */
  function getPage(addr: number): any;

  /**
   * This method returns an array of objects of the form `{addr : #, length : #}`, representing
   * contiguous areas of flash memory in the chip that are not used for anything.
   * The memory areas returned are on page boundaries. This means that you can
   * safely erase the page containing any address here, and you won't risk
   * deleting part of the Espruino firmware.
   * @url http://www.espruino.com/Reference#l_Flash_getFree
   */
  function getFree(): any;

  /**
   * Erase a page of flash memory
   * @url http://www.espruino.com/Reference#l_Flash_erasePage
   */
  function erasePage(addr: any): void;

  /**
   * Write data into memory at the given address
   * In flash memory you may only turn bits that are 1 into bits that are 0. If
   * you're writing data into an area that you have already written (so `read`
   * doesn't return all `0xFF`) you'll need to call `erasePage` to clear the
   * entire page.
   * @url http://www.espruino.com/Reference#l_Flash_write
   */
  function write(data: any, addr: number): void;

  /**
   * Read flash memory from the given address
   * @url http://www.espruino.com/Reference#l_Flash_read
   */
  function read(length: number, addr: number): any;

}

/**
 * Built-in class that caches the modules used by the `require` command
 * @url http://www.espruino.com/Reference#Modules
 */
declare function Modules(): void;

declare namespace Modules {
  /**
   * Return an array of module names that have been cached
   * @url http://www.espruino.com/Reference#l_Modules_getCached
   */
  function getCached(): any;

  /**
   * Remove the given module from the list of cached modules
   * @url http://www.espruino.com/Reference#l_Modules_removeCached
   */
  function removeCached(id: any): void;

  /**
   * Remove all cached modules
   * @url http://www.espruino.com/Reference#l_Modules_removeAllCached
   */
  function removeAllCached(): void;

  /**
   * Add the given module to the cache
   * @url http://www.espruino.com/Reference#l_Modules_addCached
   */
  function addCached(id: any, sourcecode: any): void;

}

/**
 * Create a software SPI port. This has limited functionality (no baud rate), but it can work on any pins.
 * Use `SPI.setup` to configure this port.
 * @url http://www.espruino.com/Reference#l_SPI_SPI
 */
declare function SPI(): any;

declare namespace SPI {
  /**
   * Try and find an SPI hardware device that will work on this pin (eg. `SPI1`)
   * May return undefined if no device can be found.
   * @url http://www.espruino.com/Reference#l_SPI_find
   */
  function find(pin: Pin): any;

}

type SPI = {
  /**
   * Send data down SPI, and return the result. Sending an integer will return an integer, a String will return a String, and anything else will return a Uint8Array.
   * Sending multiple bytes in one call to send is preferable as they can then be transmitted end to end. Using multiple calls to send() will result in significantly slower transmission speeds.
   * For maximum speeds, please pass either Strings or Typed Arrays as arguments. Note that you can even pass arrays of arrays, like `[1,[2,3,4],5]`
   * @url http://www.espruino.com/Reference#l_SPI_send
   */
  send: (data: any, nss_pin: Pin) => any;

  /**
   * Write a character or array of characters to SPI - without reading the result back.
   * For maximum speeds, please pass either Strings or Typed Arrays as arguments.
   * @url http://www.espruino.com/Reference#l_SPI_write
   */
  write: (data: any) => void;

  /**
   * Send data down SPI, using 4 bits for each 'real' bit (MSB first). This can be useful for faking one-wire style protocols
   * Sending multiple bytes in one call to send is preferable as they can then be transmitted end to end. Using multiple calls to send() will result in significantly slower transmission speeds.
   * @url http://www.espruino.com/Reference#l_SPI_send4bit
   */
  send4bit: (data: any, bit0: number, bit1: number, nss_pin: Pin) => void;

  /**
   * Send data down SPI, using 8 bits for each 'real' bit (MSB first). This can be useful for faking one-wire style protocols
   * Sending multiple bytes in one call to send is preferable as they can then be transmitted end to end. Using multiple calls to send() will result in significantly slower transmission speeds.
   * @url http://www.espruino.com/Reference#l_SPI_send8bit
   */
  send8bit: (data: any, bit0: number, bit1: number, nss_pin: Pin) => void;

}

/**
 * The first SPI port
 * @url http://www.espruino.com/Reference#l__global_SPI1
 */
declare const SPI1: SPI;

/**
 * The second SPI port
 * @url http://www.espruino.com/Reference#l__global_SPI2
 */
declare const SPI2: SPI;

/**
 * The third SPI port
 * @url http://www.espruino.com/Reference#l__global_SPI3
 */
declare const SPI3: SPI;

/**
 * Create a software I2C port. This has limited functionality (no baud rate), but it can work on any pins.
 * Use `I2C.setup` to configure this port.
 * @url http://www.espruino.com/Reference#l_I2C_I2C
 */
declare function I2C(): any;

declare namespace I2C {
  /**
   * Try and find an I2C hardware device that will work on this pin (eg. `I2C1`)
   * May return undefined if no device can be found.
   * @url http://www.espruino.com/Reference#l_I2C_find
   */
  function find(pin: Pin): any;

}

type I2C = {
  /**
   * Set up this I2C port
   * If not specified in options, the default pins are used (usually the lowest numbered pins on the lowest port that supports this peripheral)
   * @url http://www.espruino.com/Reference#l_I2C_setup
   */
  setup: (options: any) => void;

  /**
   * Transmit to the slave device with the given address. This is like Arduino's beginTransmission, write, and endTransmission rolled up into one.
   * @url http://www.espruino.com/Reference#l_I2C_writeTo
   */
  writeTo: (address: any, data: any) => void;

  /**
   * Request bytes from the given slave device, and return them as a Uint8Array (packed array of bytes). This is like using Arduino Wire's requestFrom, available and read functions.  Sends a STOP
   * @url http://www.espruino.com/Reference#l_I2C_readFrom
   */
  readFrom: (address: any, quantity: number) => Uint8Array;

}

/**
 * The first I2C port
 * @url http://www.espruino.com/Reference#l__global_I2C1
 */
declare const I2C1: I2C;

/**
 * The second I2C port
 * @url http://www.espruino.com/Reference#l__global_I2C2
 */
declare const I2C2: I2C;

/**
 * The third I2C port
 * @url http://www.espruino.com/Reference#l__global_I2C3
 */
declare const I2C3: I2C;

/**
 * Set the current font
 * @url http://www.espruino.com/Reference#l__global_setFont9x18
 */
declare function setFont9x18(scale: number): Graphics;

/**
 * Set the current font
 * @url http://www.espruino.com/Reference#l__global_setFont12x26
 */
declare function setFont12x26(scale: number): Graphics;

/**
 * Set the current font
 * @url http://www.espruino.com/Reference#l__global_setFont11x20
 */
declare function setFont11x20(scale: number): Graphics;

/**
 * The pin connected to the 'A' button. Reads as `1` when pressed, `0` when not
 * @url http://www.espruino.com/Reference#l__global_BTNA
 */
declare const BTNA: Pin;

/**
 * The pin connected to the 'B' button. Reads as `1` when pressed, `0` when not
 * @url http://www.espruino.com/Reference#l__global_BTNB
 */
declare const BTNB: Pin;

/**
 * The pin connected to the up button. Reads as `1` when pressed, `0` when not
 * @url http://www.espruino.com/Reference#l__global_BTNU
 */
declare const BTNU: Pin;

/**
 * The pin connected to the down button. Reads as `1` when pressed, `0` when not
 * @url http://www.espruino.com/Reference#l__global_BTND
 */
declare const BTND: Pin;

/**
 * The pin connected to the left button. Reads as `1` when pressed, `0` when not
 * @url http://www.espruino.com/Reference#l__global_BTNL
 */
declare const BTNL: Pin;

/**
 * The pin connected to the right button. Reads as `1` when pressed, `0` when not
 * @url http://www.espruino.com/Reference#l__global_BTNR
 */
declare const BTNR: Pin;

/**
 * The pin connected to Corner #1
 * @url http://www.espruino.com/Reference#l__global_CORNER1
 */
declare const CORNER1: Pin;

/**
 * The pin connected to Corner #2
 * @url http://www.espruino.com/Reference#l__global_CORNER2
 */
declare const CORNER2: Pin;

/**
 * The pin connected to Corner #3
 * @url http://www.espruino.com/Reference#l__global_CORNER3
 */
declare const CORNER3: Pin;

/**
 * The pin connected to Corner #4
 * @url http://www.espruino.com/Reference#l__global_CORNER4
 */
declare const CORNER4: Pin;

/**
 * The pin connected to Corner #5
 * @url http://www.espruino.com/Reference#l__global_CORNER5
 */
declare const CORNER5: Pin;

/**
 * The pin connected to Corner #6
 * @url http://www.espruino.com/Reference#l__global_CORNER6
 */
declare const CORNER6: Pin;

/**
 * The Bangle.js's vibration motor.
 * @url http://www.espruino.com/Reference#l__global_VIBRATE
 */
declare const VIBRATE: Pin;

/**
 * On most Espruino board there are LEDs, in which case `LED` will be an actual Pin.
 * On Bangle.js there are no LEDs, so to remain compatible with example code that might
 * expect an LED, this is an object that behaves like a pin, but which just displays
 * a circle on the display
 * @url http://www.espruino.com/Reference#l__global_LED
 */
declare const LED: any;

/**
 * On most Espruino board there are LEDs, in which case `LED1` will be an actual Pin.
 * On Bangle.js there are no LEDs, so to remain compatible with example code that might
 * expect an LED, this is an object that behaves like a pin, but which just displays
 * a circle on the display
 * @url http://www.espruino.com/Reference#l__global_LED1
 */
declare const LED1: any;

/**
 * On most Espruino board there are LEDs, in which case `LED2` will be an actual Pin.
 * On Bangle.js there are no LEDs, so to remain compatible with example code that might
 * expect an LED, this is an object that behaves like a pin, but which just displays
 * a circle on the display
 * @url http://www.espruino.com/Reference#l__global_LED2
 */
declare const LED2: any;

/**
 * **Note:** This function is only available on the [BBC micro:bit](https://espruino.com//MicroBit) board
 * Get the current acceleration of the micro:bit from the on-board accelerometer
 * **This is deprecated.** Please use `Microbit.accel` instead.
 * @url http://www.espruino.com/Reference#l__global_acceleration
 */
declare function acceleration(): any;

/**
 * **Note:** This function is only available on the [BBC micro:bit](https://espruino.com//MicroBit) board
 * Get the current compass position for the micro:bit from the on-board magnetometer
 * **This is deprecated.** Please use `Microbit.mag` instead.
 * @url http://www.espruino.com/Reference#l__global_compass
 */
declare function compass(): any;

/**
 * The pin marked SDA on the Arduino pin footprint. This is connected directly to pin A4.
 * @url http://www.espruino.com/Reference#l__global_SDA
 */
declare const SDA: Pin;

/**
 * The pin marked SDA on the Arduino pin footprint. This is connected directly to pin A5.
 * @url http://www.espruino.com/Reference#l__global_SCL
 */
declare const SCL: Pin;

/**
 * @url http://www.espruino.com/Reference#l__global_MOS1
 */
declare const MOS1: Pin;

/**
 * @url http://www.espruino.com/Reference#l__global_MOS2
 */
declare const MOS2: Pin;

/**
 * @url http://www.espruino.com/Reference#l__global_MOS3
 */
declare const MOS3: Pin;

/**
 * @url http://www.espruino.com/Reference#l__global_MOS4
 */
declare const MOS4: Pin;

/**
 * @url http://www.espruino.com/Reference#l__global_IOEXT0
 */
declare const IOEXT0: Pin;

/**
 * @url http://www.espruino.com/Reference#l__global_IOEXT1
 */
declare const IOEXT1: Pin;

/**
 * @url http://www.espruino.com/Reference#l__global_IOEXT2
 */
declare const IOEXT2: Pin;

/**
 * @url http://www.espruino.com/Reference#l__global_IOEXT3
 */
declare const IOEXT3: Pin;

/**
 * On Puck.js V2 (not v1.0) this is the pin that controls the FET, for high-powered outputs.
 * @url http://www.espruino.com/Reference#l__global_FET
 */
declare const FET: Pin;

/**
 * @url http://www.espruino.com/Reference#l__global_HIGH
 */
declare const HIGH: number;

/**
 * @url http://www.espruino.com/Reference#l__global_LOW
 */
declare const LOW: number;

/**
 * Read 8 bits of memory at the given location - DANGEROUS!
 * @url http://www.espruino.com/Reference#l__global_peek8
 */
declare function peek8(addr: number, count: number): any;

/**
 * Write 8 bits of memory at the given location - VERY DANGEROUS!
 * @url http://www.espruino.com/Reference#l__global_poke8
 */
declare function poke8(addr: number, value: any): void;

/**
 * Read 16 bits of memory at the given location - DANGEROUS!
 * @url http://www.espruino.com/Reference#l__global_peek16
 */
declare function peek16(addr: number, count: number): any;

/**
 * Write 16 bits of memory at the given location - VERY DANGEROUS!
 * @url http://www.espruino.com/Reference#l__global_poke16
 */
declare function poke16(addr: number, value: any): void;

/**
 * Read 32 bits of memory at the given location - DANGEROUS!
 * @url http://www.espruino.com/Reference#l__global_peek32
 */
declare function peek32(addr: number, count: number): any;

/**
 * Write 32 bits of memory at the given location - VERY DANGEROUS!
 * @url http://www.espruino.com/Reference#l__global_poke32
 */
declare function poke32(addr: number, value: any): void;

/**
 * Get the analog value of the given pin
 * This is different to Arduino which only returns an integer between 0 and 1023
 * However only pins connected to an ADC will work (see the datasheet)
 *  **Note:** if you didn't call `pinMode` beforehand then this function will also reset pin's state to `"analog"`
 * @url http://www.espruino.com/Reference#l__global_analogRead
 */
declare function analogRead(pin: Pin): number;

/**
 * Set the analog Value of a pin. It will be output using PWM.
 * Objects can contain:
 *
 * - `freq` - pulse frequency in Hz, eg. `analogWrite(A0,0.5,{ freq : 10 });` - specifying a frequency will force PWM output, even if the pin has a DAC
 * - `soft` - boolean, If true software PWM is used if hardware is not available.
 * - `forceSoft` - boolean, If true software PWM is used even if hardware PWM or a DAC is available
 * **Note:** if you didn't call `pinMode` beforehand then this function will also reset pin's state to `"output"`
 *
 *
 * @url http://www.espruino.com/Reference#l__global_analogWrite
 */
declare function analogWrite(pin: Pin, value: number, options: any): void;

/**
 * Pulse the pin with the value for the given time in milliseconds. It uses a hardware timer to produce accurate pulses, and returns immediately (before the pulse has finished). Use `digitalPulse(A0,1,0)` to wait until a previous pulse has finished.
 * eg. `digitalPulse(A0,1,5);` pulses A0 high for 5ms. `digitalPulse(A0,1,[5,2,4]);` pulses A0 high for 5ms, low for 2ms, and high for 4ms
 *  **Note:** if you didn't call `pinMode` beforehand then this function will also reset pin's state to `"output"`
 * digitalPulse is for SHORT pulses that need to be very accurate. If you're doing anything over a few milliseconds, use setTimeout instead.
 * @url http://www.espruino.com/Reference#l__global_digitalPulse
 */
declare function digitalPulse(pin: Pin, value: boolean, time: any): void;

/**
 * Set the digital value of the given pin.
 *  **Note:** if you didn't call `pinMode` beforehand then this function will also reset pin's state to `"output"`
 * If pin argument is an array of pins (eg. `[A2,A1,A0]`) the value argument will be treated
 * as an array of bits where the last array element is the least significant bit.
 * In this case, pin values are set least significant bit first (from the right-hand side
 * of the array of pins). This means you can use the same pin multiple times, for
 * example `digitalWrite([A1,A1,A0,A0],0b0101)` would pulse A0 followed by A1.
 * If the pin argument is an object with a `write` method, the `write` method will
 * be called with the value passed through.
 * @url http://www.espruino.com/Reference#l__global_digitalWrite
 */
declare function digitalWrite(pin: Pin, value: number): void;

/**
 * Get the digital value of the given pin.
 *  **Note:** if you didn't call `pinMode` beforehand then this function will also reset pin's state to `"input"`
 * If the pin argument is an array of pins (eg. `[A2,A1,A0]`) the value returned will be an number where
 * the last array element is the least significant bit, for example if `A0=A1=1` and `A2=0`, `digitalRead([A2,A1,A0]) == 0b011`
 * If the pin argument is an object with a `read` method, the `read` method will be called and the integer value it returns
 * passed back.
 * @url http://www.espruino.com/Reference#l__global_digitalRead
 */
declare function digitalRead(pin: Pin): number;

/**
 * Set the mode of the given pin.
 *
 * - `auto`/`undefined` - Don't change state, but allow `digitalWrite`/etc to automatically change state as appropriate
 * - `analog` - Analog input
 * - `input` - Digital input
 * - `input_pullup` - Digital input with internal ~40k pull-up resistor
 * - `input_pulldown` - Digital input with internal ~40k pull-down resistor
 * - `output` - Digital output
 * - `opendrain` - Digital output that only ever pulls down to 0v. Sending a logical `1` leaves the pin open circuit
 * - `opendrain_pullup` - Digital output that pulls down to 0v. Sending a logical `1` enables internal ~40k pull-up resistor
 * - `af_output` - Digital output from built-in peripheral
 * - `af_opendrain` - Digital output from built-in peripheral that only ever pulls down to 0v. Sending a logical `1` leaves the pin open circuit
 * **Note:** `digitalRead`/`digitalWrite`/etc set the pin mode automatically *unless* `pinMode` has been called first.
 * If you want `digitalRead`/etc to set the pin mode automatically after you have called `pinMode`, simply call it again
 * with no mode argument (`pinMode(pin)`), `auto` as the argument (`pinMode(pin, "auto")`), or with the 3rd 'automatic'
 * argument set to true (`pinMode(pin, "output", true)`).
 *
 *
 * @url http://www.espruino.com/Reference#l__global_pinMode
 */
declare function pinMode(pin: Pin, mode: any, automatic: boolean): void;

/**
 * Return the current mode of the given pin. See `pinMode` for more information on returned values.
 * @url http://www.espruino.com/Reference#l__global_getPinMode
 */
declare function getPinMode(pin: Pin): any;

/**
 * Clear the Watch that was created with setWatch. If no parameter is supplied, all watches will be removed.
 * To avoid accidentally deleting all Watches, if a parameter is supplied but is `undefined` then an Exception will be thrown.
 * @url http://www.espruino.com/Reference#l__global_clearWatch
 */
declare function clearWatch(id: any): void;

/**
 * When Espruino is busy, set the pin specified here high. Set this to undefined to disable the feature.
 * @url http://www.espruino.com/Reference#l__global_setBusyIndicator
 */
declare function setBusyIndicator(pin: Pin): void;

/**
 * When Espruino is asleep, set the pin specified here low (when it's awake, set it high). Set this to undefined to disable the feature.
 * Please see [http://www.espruino.com/Power+Consumption](http://www.espruino.com/Power+Consumption) for more details on this.
 * @url http://www.espruino.com/Reference#l__global_setSleepIndicator
 */
declare function setSleepIndicator(pin: Pin): void;

/**
 * Set whether we can enter deep sleep mode, which reduces power consumption to around 100uA. This only works on STM32 Espruino Boards (nRF52 boards sleep automatically).
 * Please see [http://www.espruino.com/Power+Consumption](http://www.espruino.com/Power+Consumption) for more details on this.
 * @url http://www.espruino.com/Reference#l__global_setDeepSleep
 */
declare function setDeepSleep(sleep: boolean): void;

/**
 * Output debugging information
 * Note: This is not included on boards with low amounts of flash memory, or the Espruino board.
 * @url http://www.espruino.com/Reference#l__global_trace
 */
declare function trace(root: any): void;

/**
 * Output current interpreter state in a text form such that it can be copied to a new device
 * Espruino keeps its current state in RAM (even if the function code is stored in Flash). When you type `dump()` it dumps the current state of code in RAM plus the hardware state, then if there's code saved in flash it writes "// Code saved with E.setBootCode" and dumps that too.
 * **Note:** 'Internal' functions are currently not handled correctly. You will need to recreate these in the `onInit` function.
 * @url http://www.espruino.com/Reference#l__global_dump
 */
declare function dump(): void;

/**
 * Restart and load the program out of flash - this has an effect similar to
 * completely rebooting Espruino (power off/power on), but without actually
 * performing a full reset of the hardware.
 * This command only executes when the Interpreter returns to the Idle state - for
 * instance `a=1;load();a=2;` will still leave 'a' as undefined (or what it was
 * set to in the saved program).
 * Espruino will resume from where it was when you last typed `save()`.
 * If you want code to be executed right after loading (for instance to initialise
 * devices connected to Espruino), add an `init` event handler to `E` with
 * `E.on('init', function() { ... your_code ... });`. This will then be automatically
 * executed by Espruino every time it starts.
 * **If you specify a filename in the argument then that file will be loaded
 * from Storage after reset** in much the same way as calling `reset()` then `eval(require("Storage").read(filename))`
 * @url http://www.espruino.com/Reference#l__global_load
 */
declare function load(filename: any): void;

/**
 * Save the state of the interpreter into flash (including the results of calling
 * `setWatch`, `setInterval`, `pinMode`, and any listeners). The state will then be loaded automatically
 *  every time Espruino powers on or is hard-reset. To see what will get saved you can call `dump()`.
 * **Note:** If you set up intervals/etc in `onInit()` and you have already called `onInit`
 * before running `save()`, when Espruino resumes there will be two copies of your intervals -
 * the ones from before the save, and the ones from after - which may cause you problems.
 * For more information about this and other options for saving, please see
 * the [Saving code on Espruino](https://www.espruino.com/Saving) page.
 * This command only executes when the Interpreter returns to the Idle state - for
 * instance `a=1;save();a=2;` will save 'a' as 2.
 * When Espruino powers on, it will resume from where it was when you typed `save()`.
 * If you want code to be executed right after loading (for instance to initialise
 * devices connected to Espruino), add a function called `onInit`, or add a `init`
 * event handler to `E` with `E.on('init', function() { ... your_code ... });`.
 * This will then be automatically executed by Espruino every time it starts.
 * In order to stop the program saved with this command being loaded automatically,
 * check out [the Troubleshooting guide](https://www.espruino.com/Troubleshooting#espruino-stopped-working-after-i-typed-save-)
 * @url http://www.espruino.com/Reference#l__global_save
 */
declare function save(): void;

/**
 * Reset the interpreter - clear program memory in RAM, and do not load a saved program from flash. This does NOT reset the underlying hardware (which allows you to reset the device without it disconnecting from USB).
 * This command only executes when the Interpreter returns to the Idle state - for instance `a=1;reset();a=2;` will still leave 'a' as undefined.
 * The safest way to do a full reset is to hit the reset button.
 * If `reset()` is called with no arguments, it will reset the board's state in
 * RAM but will not reset the state in flash. When next powered on (or when
 * `load()` is called) the board will load the previously saved code.
 * Calling `reset(true)` will cause *all saved code in flash memory to
 * be cleared as well*.
 * @url http://www.espruino.com/Reference#l__global_reset
 */
declare function reset(clearFlash: boolean): void;

/**
 * Print the supplied string(s) to the console
 *  **Note:** If you're connected to a computer (not a wall adaptor) via USB but **you are not running a terminal app** then when you print data Espruino may pause execution and wait until the computer requests the data it is trying to print.
 * @url http://www.espruino.com/Reference#l__global_print
 */
declare function print(text: any): void;

/**
 * Fill the console with the contents of the given function, so you can edit it.
 * NOTE: This is a convenience function - it will not edit 'inner functions'. For that, you must edit the 'outer function' and re-execute it.
 * @url http://www.espruino.com/Reference#l__global_edit
 */
declare function edit(funcName: any): void;

/**
 * Should Espruino echo what you type back to you? true = yes (Default), false = no. When echo is off, the result of executing a command is not returned. Instead, you must use 'print' to send output.
 * @url http://www.espruino.com/Reference#l__global_echo
 */
declare function echo(echoOn: boolean): void;

/**
 * Return the current system time in Seconds (as a floating point number)
 * @url http://www.espruino.com/Reference#l__global_getTime
 */
declare function getTime(): number;

/**
 * Get the serial number of this board
 * @url http://www.espruino.com/Reference#l__global_getSerial
 */
declare function getSerial(): any;

/**
 * Change the Interval on a callback created with `setInterval`, for example:
 * `var id = setInterval(function () { print('foo'); }, 1000); // every second`
 * `changeInterval(id, 1500); // now runs every 1.5 seconds`
 * This takes effect immediately and resets the timeout, so in the example above,
 * regardless of when you call `changeInterval`, the next interval will occur 1500ms
 * after it.
 * @url http://www.espruino.com/Reference#l__global_changeInterval
 */
declare function changeInterval(id: any, time: number): void;
