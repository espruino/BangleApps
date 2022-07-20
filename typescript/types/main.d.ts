/* Note: This file was automatically generated. */

/**
 * This library allows you to write to Neopixel/WS281x/APA10x/SK6812 LED strips
 * <p>These use a high speed single-wire protocol which needs platform-specific
 * implementation on some devices - hence this library to simplify things.</p>
 * @url http://www.espruino.com/Reference#l_neopixel_undefined
 */
declare function neopixel(): void;

/**
 * This library provides TV out capability on the Espruino and Espruino Pico.
 * See the <a href="/Television">Television</a> page for more information.
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
   * Get this device&#39;s default Bluetooth MAC address.
   * <p>For Puck.js, the last 5 characters of this (eg. <code>ee:ff</code>)
   * are used in the device&#39;s advertised Bluetooth name.</p>
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
   * <p>Disable Bluetooth advertising and disconnect from any device that
   * connected to Puck.js as a peripheral (this won&#39;t affect any devices
   * that Puck.js initiated connections to).</p>
   * This makes Puck.js undiscoverable, so it can&#39;t be connected to.
   * Use <code>NRF.wake()</code> to wake up and make Puck.js connectable again.
   * @url http://www.espruino.com/Reference#l_NRF_sleep
   */
  function sleep(): void;

  /**
   * <p>Enable Bluetooth advertising (this is enabled by default), which
   * allows other devices to discover and connect to Puck.js.</p>
   * Use <code>NRF.sleep()</code> to disable advertising.
   * @url http://www.espruino.com/Reference#l_NRF_wake
   */
  function wake(): void;

  /**
   * <p>Restart the Bluetooth softdevice (if there is currently a BLE connection,
   * it will queue a restart to be done when the connection closes).</p>
   * <p>You shouldn&#39;t need to call this function in normal usage. However, Nordic&#39;s
   * BLE softdevice has some settings that cannot be reset. For example there
   * are only a certain number of unique UUIDs. Once these are all used the
   * only option is to restart the softdevice to clear them all out.</p>
   * @url http://www.espruino.com/Reference#l_NRF_restart
   */
  function restart(callback: any): void;

  /**
   * Get the battery level in volts (the voltage that the NRF chip is running off of).
   * <p>This is the battery level of the device itself - it has nothing to with any
   * device that might be connected.</p>
   * @url http://www.espruino.com/Reference#l_NRF_getBattery
   */
  function getBattery(): number;

  /**
   * <p>This is just like <code>NRF.setAdvertising</code>, except instead of advertising
   * the data, it returns the packet that would be advertised as an array.</p>
   * @url http://www.espruino.com/Reference#l_NRF_getAdvertisingData
   */
  function getAdvertisingData(data: any, options: any): any;

  /**
   * Set the BLE radio transmit power. The default TX power is 0 dBm, and
   * @url http://www.espruino.com/Reference#l_NRF_setTxPower
   */
  function setTxPower(power: number): void;

  /**
   * <p><strong>THIS IS DEPRECATED</strong> - please use <code>NRF.setConnectionInterval</code> for
   * peripheral and <code>NRF.connect(addr, options)</code>/<code>BluetoothRemoteGATTServer.connect(options)</code>
   * for central connections.</p>
   * <p>This sets the connection parameters - these affect the transfer speed and
   * power usage when the device is connected.</p>
   * <ul>
   * <li>When not low power, the connection interval is between 7.5 and 20ms</li>
   * <li>When low power, the connection interval is between 500 and 1000ms</li>
   * </ul>
   * <p>When low power connection is enabled, transfers of data over Bluetooth
   * will be very slow, however power usage while connected will be drastically
   * decreased.</p>
   * <p>This will only take effect after the connection is disconnected and
   * re-established.</p>
   * @url http://www.espruino.com/Reference#l_NRF_setLowPowerConnection
   */
  function setLowPowerConnection(lowPower: boolean): void;

  /**
   * Send a USB HID report. HID must first be enabled with <code>NRF.setServices({}, {hid: hid_report})</code>
   * @url http://www.espruino.com/Reference#l_NRF_sendHIDReport
   */
  function sendHIDReport(data: any, callback: any): void;

  /**
   * Check if Apple Notification Center Service (ANCS) is currently active on the BLE connection
   * @url http://www.espruino.com/Reference#l_NRF_ancsIsActive
   */
  function ancsIsActive(): boolean;

  /**
   * Send an ANCS action for a specific Notification UID. Corresponds to posaction/negaction in the &#39;ANCS&#39; event that was received
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
   * <p>Get Apple Media Service (AMS) info for the current media player.
   * &quot;playbackinfo&quot; returns a concatenation of three comma-separated values:</p>
   * <ul>
   * <li>PlaybackState: a string that represents the integer value of the playback state:<ul>
   * <li>PlaybackStatePaused = 0</li>
   * <li>PlaybackStatePlaying = 1</li>
   * <li>PlaybackStateRewinding = 2</li>
   * <li>PlaybackStateFastForwarding = 3</li>
   * </ul>
   * </li>
   * <li>PlaybackRate: a string that represents the floating point value of the playback rate.</li>
   * <li>ElapsedTime: a string that represents the floating point value of the elapsed time of the current track, in seconds</li>
   * </ul>
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
   * <p>If set to true, whenever a device bonds it will be added to the
   * whitelist.</p>
   * <p>When set to false, the whitelist is cleared and newly bonded
   * devices will not be added to the whitelist.</p>
   * <p><strong>Note:</strong> This is remembered between <code>reset()</code>s but isn&#39;t
   * remembered after power-on (you&#39;ll have to add it to <code>onInit()</code>.</p>
   * @url http://www.espruino.com/Reference#l_NRF_setWhitelist
   */
  function setWhitelist(whitelisting: boolean): void;

  /**
   * <p>When connected, Bluetooth LE devices communicate at a set interval.
   * Lowering the interval (eg. more packets/second) means a lower delay when
   * sending data, higher bandwidth, but also more power consumption.</p>
   * <p>By default, when connected as a peripheral Espruino automatically adjusts the
   * connection interval. When connected it&#39;s as fast as possible (7.5ms) but when idle
   * for over a minute it drops to 200ms. On continued activity (&gt;1 BLE operation) the
   * interval is raised to 7.5ms again.</p>
   * The options for <code>interval</code> are:
   * <ul>
   * <li><code>undefined</code> / <code>&quot;auto&quot;</code> : (default) automatically adjust connection interval</li>
   * <li><code>100</code> : set min and max connection interval to the same number (between 7.5ms and 4000ms)</li>
   * <li><code>{minInterval:20, maxInterval:100}</code> : set min and max connection interval as a range</li>
   * </ul>
   * <p>This configuration is not remembered during a <code>save()</code> - you will have to
   * re-set it via <code>onInit</code>.</p>
   * <p><strong>Note:</strong> If connecting to another device (as Central), you can use
   * an extra argument to <code>NRF.connect</code> or <code>BluetoothRemoteGATTServer.connect</code>
   * to specify a connection interval.</p>
   * <strong>Note:</strong> This overwrites any changes imposed by the deprecated <code>NRF.setLowPowerConnection</code>
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
   * Set the WIO&#39;s LED
   * @url http://www.espruino.com/Reference#l_WioLTE_LED
   */
  function LED(red: number, green: number, blue: number): void;

  /**
   * Set the power of Grove connectors, except for <code>D38</code> and <code>D39</code> which are always on.
   * @url http://www.espruino.com/Reference#l_WioLTE_setGrovePower
   */
  function setGrovePower(onoff: boolean): void;

  /**
   * Turn power to the WIO&#39;s LED on or off.
   * Turning the LED on won&#39;t immediately display a color - that must be done with <code>WioLTE.LED(r,g,b)</code>
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
 * Use Graphics.createXXX to create a graphics object that renders in the way you want. See <a href="https://www.espruino.com/Graphics">the Graphics page</a> for more information.
 * <strong>Note:</strong> On boards that contain an LCD, there is a built-in &#39;LCD&#39; object of type Graphics. For instance to draw a line you&#39;d type: <code>LCD.drawLine(0,0,100,100)</code>
 * @url http://www.espruino.com/Reference#Graphics
 */
declare function Graphics(): void;

declare namespace Graphics {
  /**
   * <p>On devices like Pixl.js or HYSTM boards that contain a built-in display
   * this will return an instance of the graphics class that can be used to
   * access that display.</p>
   * Internally, this is stored as a member called <code>gfx</code> inside the &#39;hiddenRoot&#39;.
   * @url http://www.espruino.com/Reference#l_Graphics_getInstance
   */
  function getInstance(): any;

  /**
   * Create a Graphics object that renders to an Array Buffer. This will have a field called &#39;buffer&#39; that can get used to get at the buffer itself
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
   * <p>On instances of graphics that drive a display with
   * an offscreen buffer, calling this function will
   * copy the contents of the offscreen buffer to the
   * screen.</p>
   * <p>Call this when you have drawn something to Graphics
   * and you want it shown on the screen.</p>
   * <p>If a display does not have an offscreen buffer,
   * it may not have a <code>g.flip()</code> method.</p>
   * <p>On Bangle.js 1, there are different graphics modes
   * chosen with <code>Bangle.setLCDMode()</code>. The default mode
   * is unbuffered and in this mode <code>g.flip()</code> does not
   * affect the screen contents.</p>
   * <p>On some devices, this command will attempt to
   * only update the areas of the screen that have
   * changed in order to increase speed. If you have
   * accessed the <code>Graphics.buffer</code> directly then you
   * may need to use <code>Graphics.flip(true)</code> to force
   * a full update of the screen.</p>
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
   * <p><strong>Note:</strong> Bangle.js 2 behaves a little differently here. The display
   * is 3 bit, so <code>getBPP</code> returns 3 and <code>asBMP</code>/<code>asImage</code>/etc return 3 bit images.
   * However in order to allow dithering, the colors returned by <code>Graphics.getColor</code> and <code>Graphics.theme</code>
   * are actually 16 bits.</p>
   * @url http://www.espruino.com/Reference#l_Graphics_getBPP
   */
  getBPP: () => number;

  /**
   * <p>Reset the state of Graphics to the defaults (eg. Color, Font, etc)
   * that would have been used when Graphics was initialised.</p>
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
   * <p>On devices with enough memory, you can specify <code>{x,y,x2,y2,r}</code> as the first
   * argument, which allows you to draw a rounded rectangle.</p>
   * @url http://www.espruino.com/Reference#l_Graphics_fillRect
   */
  fillRect: (x1: any, y1: number, x2: number, y2: number) => Graphics;

  /**
   * Fill a rectangular area in the Background Color
   * <p>On devices with enough memory, you can specify <code>{x,y,x2,y2,r}</code> as the first
   * argument, which allows you to draw a rounded rectangle.</p>
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
   * Get a pixel&#39;s color
   * @url http://www.espruino.com/Reference#l_Graphics_getPixel
   */
  getPixel: (x: number, y: number) => number;

  /**
   * Set a pixel&#39;s color
   * @url http://www.espruino.com/Reference#l_Graphics_setPixel
   */
  setPixel: (x: number, y: number, col: any) => Graphics;

  /**
   * Set the color to use for subsequent drawing operations.
   * If just <code>r</code> is specified as an integer, the numeric value will be written directly into a pixel. eg. On a 24 bit <code>Graphics</code> instance you set bright blue with either <code>g.setColor(0,0,1)</code> or <code>g.setColor(0x0000FF)</code>.
   * A good shortcut to ensure you get white on all platforms is to use <code>g.setColor(-1)</code>
   * The mapping is as follows:
   * <ul>
   * <li>32 bit: <code>r,g,b</code> =&gt; <code>0xFFrrggbb</code></li>
   * <li>24 bit: <code>r,g,b</code> =&gt; <code>0xrrggbb</code></li>
   * <li>16 bit: <code>r,g,b</code> =&gt; <code>0brrrrrggggggbbbbb</code> (RGB565)</li>
   * <li>Other bpp: <code>r,g,b</code> =&gt; white if <code>r+g+b &gt; 50%</code>, otherwise black (use <code>r</code> on its own as an integer)</li>
   * </ul>
   * If you specified <code>color_order</code> when creating the <code>Graphics</code> instance, <code>r</code>,<code>g</code> and <code>b</code> will be swapped as you specified.
   * <p><strong>Note:</strong> On devices with low flash memory, <code>r</code> <strong>must</strong> be an integer representing the color in the current bit depth. It cannot
   * be a floating point value, and <code>g</code> and <code>b</code> are ignored.</p>
   * @url http://www.espruino.com/Reference#l_Graphics_setColor
   */
  setColor: (r: any, g: any, b: any) => Graphics;

  /**
   * Set the background color to use for subsequent drawing operations.
   * See <code>Graphics.setColor</code> for more information on the mapping of <code>r</code>, <code>g</code>, and <code>b</code> to pixel values.
   * <p><strong>Note:</strong> On devices with low flash memory, <code>r</code> <strong>must</strong> be an integer representing the color in the current bit depth. It cannot
   * be a floating point value, and <code>g</code> and <code>b</code> are ignored.</p>
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
   * <p>This sets the &#39;clip rect&#39; that subsequent drawing operations are clipped to
   * sit between.</p>
   * <p>These values are inclusive - eg <code>g.setClipRect(1,0,5,0)</code> will ensure that only
   * pixel rows 1,2,3,4,5 are touched on column 0.</p>
   * <p><strong>Note:</strong> For maximum flexibility on Bangle.js 1, the values here are not range checked. For normal
   * use, X and Y should be between 0 and <code>getWidth()-1</code>/<code>getHeight()-1</code>.</p>
   * <p><strong>Note:</strong> The x/y values here are rotated, so that if <code>Graphics.setRotation</code> is used
   * they correspond to the coordinates given to the draw functions, <em>not to the
   * physical device pixels</em>.</p>
   * @url http://www.espruino.com/Reference#l_Graphics_setClipRect
   */
  setClipRect: (x1: number, y1: number, x2: number, y2: number) => Graphics;

  /**
   * Make subsequent calls to <code>drawString</code> use the built-in 4x6 pixel bitmapped Font
   * It is recommended that you use <code>Graphics.setFont(&quot;4x6&quot;)</code> for more flexibility.
   * @url http://www.espruino.com/Reference#l_Graphics_setFontBitmap
   */
  setFontBitmap: () => Graphics;

  /**
   * Make subsequent calls to <code>drawString</code> use a Vector Font of the given height.
   * It is recommended that you use <code>Graphics.setFont(&quot;Vector&quot;, size)</code> for more flexibility.
   * @url http://www.espruino.com/Reference#l_Graphics_setFontVector
   */
  setFontVector: (size: number) => Graphics;

  /**
   * <p>Make subsequent calls to <code>drawString</code> use a Custom Font of the given height. See the <a href="http://www.espruino.com/Fonts">Fonts page</a> for more
   * information about custom fonts and how to create them.</p>
   * For examples of use, see the <a href="https://www.espruino.com/Fonts#font-modules">font modules</a>.
   * <p><strong>Note:</strong> while you can specify the character code of the first character with <code>firstChar</code>,
   * the newline character 13 will always be treated as a newline and not rendered.</p>
   * @url http://www.espruino.com/Reference#l_Graphics_setFontCustom
   */
  setFontCustom: (bitmap: any, firstChar: number, width: any, height: number) => Graphics;

  /**
   * Set the alignment for subsequent calls to <code>drawString</code>
   * @url http://www.espruino.com/Reference#l_Graphics_setFontAlign
   */
  setFontAlign: (x: number, y: number, rotation: number) => Graphics;

  /**
   * Set the font by name. Various forms are available:
   * <ul>
   * <li><code>g.setFont(&quot;4x6&quot;)</code> - standard 4x6 bitmap font</li>
   * <li><code>g.setFont(&quot;Vector:12&quot;)</code> - vector font 12px high</li>
   * <li><code>g.setFont(&quot;4x6:2&quot;)</code> - 4x6 bitmap font, doubled in size</li>
   * <li><code>g.setFont(&quot;6x8:2x3&quot;)</code> - 6x8 bitmap font, doubled in width, tripled in height</li>
   * </ul>
   * You can also use these forms, but they are not recommended:
   * <ul>
   * <li><code>g.setFont(&quot;Vector12&quot;)</code> - vector font 12px high</li>
   * <li><code>g.setFont(&quot;4x6&quot;,2)</code> - 4x6 bitmap font, doubled in size</li>
   * </ul>
   * <code>g.getFont()</code> will return the current font as a String.
   * For a list of available font names, you can use <code>g.getFonts()</code>.
   * @url http://www.espruino.com/Reference#l_Graphics_setFont
   */
  setFont: (name: any, size: number) => Graphics;

  /**
   * Get the font by name - can be saved and used with <code>Graphics.setFont</code>.
   * <p>Normally this might return something like <code>&quot;4x6&quot;</code>, but if a scale
   * factor is specified, a colon and then the size is reported, like &quot;4x6:2&quot;</p>
   * <p><strong>Note:</strong> For custom fonts, <code>Custom</code> is currently
   * reported instead of the font name.</p>
   * @url http://www.espruino.com/Reference#l_Graphics_getFont
   */
  getFont: () => string;

  /**
   * Return an array of all fonts currently in the Graphics library.
   * <p><strong>Note:</strong> Vector fonts are specified as <code>Vector#</code> where <code>#</code> is the font height. As there
   * are effectively infinite fonts, just <code>Vector</code> is included in the list.</p>
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
   * Draw a polyline (lines between each of the points in <code>poly</code>) in the current foreground color
   * <strong>Note:</strong> there is a limit of 64 points (128 XY elements) for polygons
   * @url http://www.espruino.com/Reference#l_Graphics_drawPoly
   */
  drawPoly: (poly: any, closed: boolean) => Graphics;

  /**
   * Draw an <strong>antialiased</strong> polyline (lines between each of the points in <code>poly</code>) in the current foreground color
   * <strong>Note:</strong> there is a limit of 64 points (128 XY elements) for polygons
   * @url http://www.espruino.com/Reference#l_Graphics_drawPolyAA
   */
  drawPolyAA: (poly: any, closed: boolean) => Graphics;

  /**
   * Set the current rotation of the graphics device.
   * @url http://www.espruino.com/Reference#l_Graphics_setRotation
   */
  setRotation: (rotation: number, reflect: boolean) => Graphics;

  /**
   * <p>Return the width and height in pixels of an image (either Graphics, Image Object, Image String or ArrayBuffer). Returns
   * <code>undefined</code> if image couldn&#39;t be decoded.</p>
   * <p><code>frames</code> is also included is the image contains more information than you&#39;d expect for a single bitmap. In
   * this case the bitmap might be an animation with multiple frames</p>
   * @url http://www.espruino.com/Reference#l_Graphics_imageMetrics
   */
  imageMetrics: (str: any) => any;

  /**
   * <p>Return this Graphics object as an Image that can be used with <code>Graphics.drawImage</code>.
   * Check out <a href="http://www.espruino.com/Graphics#images-bitmaps">the Graphics reference page</a>
   * for more information on images.</p>
   * Will return undefined if data can&#39;t be allocated for the image.
   * The image data itself will be referenced rather than copied if:
   * <ul>
   * <li>An image <code>object</code> was requested (not <code>string</code>)</li>
   * <li>The Graphics instance was created with <code>Graphics.createArrayBuffer</code></li>
   * <li>Is 8 bpp <em>OR</em> the <code>{msb:true}</code> option was given</li>
   * <li>No other format options (zigzag/etc) were given</li>
   * </ul>
   * <p>Otherwise data will be copied, which takes up more space and
   * may be quite slow.</p>
   * @url http://www.espruino.com/Reference#l_Graphics_asImage
   */
  asImage: (type: any) => any;

  /**
   * <p>Return the area of the Graphics canvas that has been modified, and optionally clear
   * the modified area to 0.</p>
   * For instance if <code>g.setPixel(10,20)</code> was called, this would return <code>{x1:10, y1:20, x2:10, y2:20}</code>
   * @url http://www.espruino.com/Reference#l_Graphics_getModified
   */
  getModified: (reset: boolean) => any;

  /**
   * <p>Scroll the contents of this graphics in a certain direction. The remaining area
   * is filled with the background color.</p>
   * <p>Note: This uses repeated pixel reads and writes, so will not work on platforms that
   * don&#39;t support pixel reads.</p>
   * @url http://www.espruino.com/Reference#l_Graphics_scroll
   */
  scroll: (x: number, y: number) => Graphics;

  /**
   * Create a Windows BMP file from this Graphics instance, and return it as a String.
   * @url http://www.espruino.com/Reference#l_Graphics_asBMP
   */
  asBMP: () => any;

  /**
   * Create a URL of the form <code>data:image/bmp;base64,...</code> that can be pasted into the browser.
   * The Espruino Web IDE can detect this data on the console and render the image inline automatically.
   * @url http://www.espruino.com/Reference#l_Graphics_asURL
   */
  asURL: () => any;

  /**
   * Output this image as a bitmap URL of the form <code>data:image/bmp;base64,...</code>. The Espruino Web IDE will detect this on the console and will render the image inline automatically.
   * This is identical to <code>console.log(g.asURL())</code> - it is just a convenient function for easy debugging and producing screenshots of what is currently in the Graphics instance.
   * <p><strong>Note:</strong> This may not work on some bit depths of Graphics instances. It will also not work for the main Graphics instance
   * of Bangle.js 1 as the graphics on Bangle.js 1 are stored in write-only memory.</p>
   * @url http://www.espruino.com/Reference#l_Graphics_dump
   */
  dump: () => void;

  /**
   * Calculate the square area under a Bezier curve.
   * <p> x0,y0: start point
   *  x1,y1: control point
   *  y2,y2: end point</p>
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
 * <p>When data is sent to the <code>Terminal</code> object, <code>Graphics.getInstance()</code>
 * is called and if an instance of <code>Graphics</code> is found then characters
 * are written to it.</p>
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
   * <p>Return an approximate battery percentage remaining based on
   * a normal CR2032 battery (2.8 - 2.2v)</p>
   * @url http://www.espruino.com/Reference#l_Badge_getBatteryPercentage
   */
  function getBatteryPercentage(): number;

  /**
   * Set the LCD&#39;s contrast
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
 * <strong>Note:</strong> This library is currently only included in builds for boards where there is space. For other boards there is <code>crypto.js</code> which implements SHA1 in JS.
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
   * <p><strong>Note:</strong> On some boards (currently only Espruino Original) there
   * isn&#39;t space for a fully unrolled SHA1 implementation so a slower
   * all-JS implementation is used instead.</p>
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
 * <strong>Note:</strong> This library is currently only included in builds for boards where there is space. For other boards there is <code>crypto.js</code> which implements SHA1 in JS.
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
 * Class containing utility functions for the <a href="http://www.espruino.com/Bangle.js">Bangle.js Smart Watch</a>
 * @url http://www.espruino.com/Reference#Bangle
 */
declare function Bangle(): void;

declare namespace Bangle {
  /**
   * <p>This function can be used to adjust the brightness of Bangle.js&#39;s display, and
   * hence prolong its battery life.</p>
   * <p>Due to hardware design constraints, software PWM has to be used which
   * means that the display may flicker slightly when Bluetooth is active
   * and the display is not at full power.</p>
   * <strong>Power consumption</strong>
   * <ul>
   * <li>0 = 7mA</li>
   * <li>0.1 = 12mA</li>
   * <li>0.2 = 18mA</li>
   * <li>0.5 = 28mA</li>
   * <li>0.9 = 40mA (switching overhead)</li>
   * <li>1 = 40mA</li>
   * </ul>
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDBrightness
   */
  function setLCDBrightness(brightness: number): void;

  /**
   * This function can be used to change the way graphics is handled on Bangle.js.
   * Available options for <code>Bangle.setLCDMode</code> are:
   * <ul>
   * <li><code>Bangle.setLCDMode()</code> or <code>Bangle.setLCDMode(&quot;direct&quot;)</code> (the default) - The drawable area is 240x240 16 bit. Unbuffered, so draw calls take effect immediately. Terminal and vertical scrolling work (horizontal scrolling doesn&#39;t).</li>
   * <li><code>Bangle.setLCDMode(&quot;doublebuffered&quot;)</code> - The drawable area is 240x160 16 bit, terminal and scrolling will not work. <code>g.flip()</code> must be called for draw operations to take effect.</li>
   * <li><code>Bangle.setLCDMode(&quot;120x120&quot;)</code> - The drawable area is 120x120 8 bit, <code>g.getPixel</code>, terminal, and full scrolling work. Uses an offscreen buffer stored on Bangle.js, <code>g.flip()</code> must be called for draw operations to take effect.</li>
   * <li><code>Bangle.setLCDMode(&quot;80x80&quot;)</code> - The drawable area is 80x80 8 bit, <code>g.getPixel</code>, terminal, and full scrolling work. Uses an offscreen buffer stored on Bangle.js, <code>g.flip()</code> must be called for draw operations to take effect.</li>
   * </ul>
   * You can also call <code>Bangle.setLCDMode()</code> to return to normal, unbuffered <code>&quot;direct&quot;</code> mode.
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDMode
   */
  function setLCDMode(mode: any): void;

  /**
   * The current LCD mode.
   * See <code>Bangle.setLCDMode</code> for examples.
   * @url http://www.espruino.com/Reference#l_Bangle_getLCDMode
   */
  function getLCDMode(): any;

  /**
   * <p>This can be used to move the displayed memory area up or down temporarily. It&#39;s
   * used for displaying notifications while keeping the main display contents
   * intact.</p>
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDOffset
   */
  function setLCDOffset(y: number): void;

  /**
   * This function can be used to turn Bangle.js&#39;s LCD power saving on or off.
   * With power saving off, the display will remain in the state you set it with <code>Bangle.setLCDPower</code>.
   * With power saving on, the display will turn on if a button is pressed, the watch is turned face up, or the screen is updated (see <code>Bangle.setOptions</code> for configuration). It&#39;ll turn off automatically after the given timeout.
   * <strong>Note:</strong> This function also sets the Backlight and Lock timeout (the time at which the touchscreen/buttons start being ignored). To set both separately, use <code>Bangle.setOptions</code>
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDTimeout
   */
  function setLCDTimeout(isOn: number): void;

  /**
   * <p>Set how often the watch should poll for new acceleration/gyro data and kick the Watchdog timer. It isn&#39;t
   * recommended that you make this interval much larger than 1000ms, but values up to 4000ms are allowed.</p>
   * <p>Calling this will set <code>Bangle.setOptions({powerSave: false})</code> - disabling the dynamic adjustment of
   * poll interval to save battery power when Bangle.js is stationary.</p>
   * @url http://www.espruino.com/Reference#l_Bangle_setPollInterval
   */
  function setPollInterval(interval: number): void;

  /**
   * Set internal options used for gestures, etc...
   * <ul>
   * <li><code>wakeOnBTN1</code> should the LCD turn on when BTN1 is pressed? default = <code>true</code></li>
   * <li><code>wakeOnBTN2</code> (Bangle.js 1) should the LCD turn on when BTN2 is pressed? default = <code>true</code></li>
   * <li><code>wakeOnBTN3</code> (Bangle.js 1) should the LCD turn on when BTN3 is pressed? default = <code>true</code></li>
   * <li><code>wakeOnFaceUp</code> should the LCD turn on when the watch is turned face up? default = <code>false</code></li>
   * <li><code>wakeOnTouch</code> should the LCD turn on when the touchscreen is pressed? default = <code>false</code></li>
   * <li><code>wakeOnTwist</code> should the LCD turn on when the watch is twisted? default = <code>true</code></li>
   * <li><code>twistThreshold</code>  How much acceleration to register a twist of the watch strap? Can be negative for oppsite direction. default = <code>800</code></li>
   * <li><code>twistMaxY</code> Maximum acceleration in Y to trigger a twist (low Y means watch is facing the right way up). default = <code>-800</code></li>
   * <li><code>twistTimeout</code>  How little time (in ms) must a twist take from low-&gt;high acceleration? default = <code>1000</code></li>
   * <li><code>gestureStartThresh</code> how big a difference before we consider a gesture started? default = <code>sqr(800)</code></li>
   * <li><code>gestureEndThresh</code> how small a difference before we consider a gesture ended? default = <code>sqr(2000)</code></li>
   * <li><code>gestureInactiveCount</code> how many samples do we keep after a gesture has ended? default = <code>4</code></li>
   * <li><code>gestureMinLength</code> how many samples must a gesture have before we notify about it? default = <code>10</code></li>
   * <li><code>powerSave</code> after a minute of not being moved, Bangle.js will change the accelerometer poll interval down to 800ms (10x accelerometer samples).
   *  On movement it&#39;ll be raised to the default 80ms. If <code>Bangle.setPollInterval</code> is used this is disabled, and for it to work the poll interval
   *  must be either 80ms or 800ms. default = <code>true</code></li>
   * <li><code>lockTimeout</code> how many milliseconds before the screen locks</li>
   * <li><code>lcdPowerTimeout</code> how many milliseconds before the screen turns off</li>
   * <li><code>backlightTimeout</code> how many milliseconds before the screen&#39;s backlight turns off</li>
   * <li><code>hrmPollInterval</code> set the requested poll interval (in milliseconds) for the heart rate monitor. On Bangle.js 2 only 10,20,40,80,160,200 ms are supported, and polling rate may not be exact. The algorithm&#39;s filtering is tuned for 20-40ms poll intervals, so higher/lower intervals may effect the reliability of the BPM reading.</li>
   * <li><code>seaLevelPressure</code> (Bangle.js 2) Normally 1013.25 millibars - this is used for calculating altitude with the pressure sensor</li>
   * </ul>
   * Where accelerations are used they are in internal units, where <code>8192 = 1g</code>
   * @url http://www.espruino.com/Reference#l_Bangle_setOptions
   */
  function setOptions(options: any): void;

  /**
   * Return the current state of options as set by <code>Bangle.setOptions</code>
   * @url http://www.espruino.com/Reference#l_Bangle_getOptions
   */
  function getOptions(): any;

  /**
   * Also see the <code>Bangle.lcdPower</code> event
   * @url http://www.espruino.com/Reference#l_Bangle_isLCDOn
   */
  function isLCDOn(): boolean;

  /**
   * <p>This function can be used to lock or unlock Bangle.js
   * (eg whether buttons and touchscreen work or not)</p>
   * @url http://www.espruino.com/Reference#l_Bangle_setLocked
   */
  function setLocked(isLocked: boolean): void;

  /**
   * Also see the <code>Bangle.lock</code> event
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
   * Set power with <code>Bangle.setHRMPower(...);</code>
   * @url http://www.espruino.com/Reference#l_Bangle_isHRMOn
   */
  function isHRMOn(): boolean;

  /**
   * Is the GPS powered?
   * Set power with <code>Bangle.setGPSPower(...);</code>
   * @url http://www.espruino.com/Reference#l_Bangle_isGPSOn
   */
  function isGPSOn(): boolean;

  /**
   * Get the last available GPS fix info (or <code>undefined</code> if GPS is off).
   * The fix info received is the same as you&#39;d get from the <code>Bangle.GPS</code> event.
   * @url http://www.espruino.com/Reference#l_Bangle_getGPSFix
   */
  function getGPSFix(): any;

  /**
   * Is the compass powered?
   * Set power with <code>Bangle.setCompassPower(...);</code>
   * @url http://www.espruino.com/Reference#l_Bangle_isCompassOn
   */
  function isCompassOn(): boolean;

  /**
   * <p>Resets the compass minimum/maximum values. Can be used if the compass isn&#39;t
   * providing a reliable heading any more.</p>
   * @url http://www.espruino.com/Reference#l_Bangle_resetCompass
   */
  function resetCompass(): void;

  /**
   * <p>Set the power to the barometer IC. Once enbled, <code>Bangle.pressure</code> events
   * are fired each time a new barometer reading is available.</p>
   * When on, the barometer draws roughly 50uA
   * @url http://www.espruino.com/Reference#l_Bangle_setBarometerPower
   */
  function setBarometerPower(isOn: boolean, appID: any): boolean;

  /**
   * Is the Barometer powered?
   * Set power with <code>Bangle.setBarometerPower(...);</code>
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
   * Get the most recent Magnetometer/Compass reading. Data is in the same format as the <code>Bangle.on(&#39;mag&#39;,</code> event.
   * Returns an <code>{x,y,z,dx,dy,dz,heading}</code> object
   * <ul>
   * <li><code>x/y/z</code> raw x,y,z magnetometer readings</li>
   * <li><code>dx/dy/dz</code> readings based on calibration since magnetometer turned on</li>
   * <li><code>heading</code> in degrees based on calibrated readings (will be NaN if magnetometer hasn&#39;t been rotated around 360 degrees)</li>
   * </ul>
   * <p>To get this event you must turn the compass on
   * with <code>Bangle.setCompassPower(1)</code>.</p>
   * @url http://www.espruino.com/Reference#l_Bangle_getCompass
   */
  function getCompass(): any;

  /**
   * Get the most recent accelerometer reading. Data is in the same format as the <code>Bangle.on(&#39;accel&#39;,</code> event.
   * <ul>
   * <li><code>x</code> is X axis (left-right) in <code>g</code></li>
   * <li><code>y</code> is Y axis (up-down) in <code>g</code></li>
   * <li><code>z</code> is Z axis (in-out) in <code>g</code></li>
   * <li><code>diff</code> is difference between this and the last reading in <code>g</code> (calculated by comparing vectors, not magnitudes)</li>
   * <li><code>td</code> is the elapsed</li>
   * <li><code>mag</code> is the magnitude of the acceleration in <code>g</code></li>
   * </ul>
   * @url http://www.espruino.com/Reference#l_Bangle_getAccel
   */
  function getAccel(): any;

  /**
   * <code>range</code> is one of:
   * <ul>
   * <li><code>undefined</code> or <code>&#39;current&#39;</code> - health data so far in the last 10 minutes is returned,</li>
   * <li><code>&#39;last&#39;</code> - health data during the last 10 minutes</li>
   * <li><code>&#39;day&#39;</code> - the health data so far for the day</li>
   * </ul>
   * <code>getHealthStatus</code> returns an object containing:
   * <ul>
   * <li><code>movement</code> is the 32 bit sum of all <code>acc.diff</code> readings since power on (and rolls over). It is the difference in accelerometer values as <code>g*8192</code></li>
   * <li><code>steps</code> is the number of steps during this period</li>
   * <li><code>bpm</code> the best BPM reading from HRM sensor during this period</li>
   * <li><code>bpmConfidence</code> best BPM confidence (0-100%) during this period</li>
   * </ul>
   * @url http://www.espruino.com/Reference#l_Bangle_getHealthStatus
   */
  function getHealthStatus(range: any): any;

  /**
   * <p>Feature flag - If true, this Bangle.js firmware reads <code>setting.json</code> and
   * modifies beep &amp; buzz behaviour accordingly (the bootloader
   * doesn&#39;t need to do it).</p>
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
   * <strong>Note:</strong> On Espruino 2v06 and before this function only returns a number (<code>cnt</code> is ignored).
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
   * <p>Perform a Spherical <a href="https://en.wikipedia.org/wiki/Web_Mercator_projection">Web Mercator projection</a>
   * of latitude and longitude into <code>x</code> and <code>y</code> coordinates, which are roughly
   * equivalent to meters from <code>{lat:0,lon:0}</code>.</p>
   * <p>This is the formula used for most online mapping and is a good way
   * to compare GPS coordinates to work out the distance between them.</p>
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
   * <p>Turn Bangle.js (mostly) off, but keep the CPU in sleep
   * mode until BTN1 is pressed to preserve the RTC (current time).</p>
   * @url http://www.espruino.com/Reference#l_Bangle_softOff
   */
  function softOff(): void;

  /**
   * <ul>
   * <li>On platforms with an LCD of &gt;=8bpp this is 222 x 104 x 2 bits</li>
   * <li>Otherwise it&#39;s 119 x 56 x 1 bits</li>
   * </ul>
   * @url http://www.espruino.com/Reference#l_Bangle_getLogo
   */
  function getLogo(): any;

  /**
   * <p>Load all widgets from flash Storage. Call this once at the beginning
   * of your application if you want any on-screen widgets to be loaded.</p>
   * <p>They will be loaded into a global <code>WIDGETS</code> array, and
   * can be rendered with <code>Bangle.drawWidgets</code>.</p>
   * @url http://www.espruino.com/Reference#l_Bangle_loadWidgets
   */
  function loadWidgets(): void;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_drawWidgets
   */
  function drawWidgets(): void;

  /**
   * <p>Load the Bangle.js app launcher, which will allow the user
   * to select an application to launch.</p>
   * @url http://www.espruino.com/Reference#l_Bangle_showLauncher
   */
  function showLauncher(): void;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_setUI
   */
  function setUI(): void;

  /**
   * <p>Erase all storage and reload it with the default
   * contents.</p>
   * <p>This is only available on Bangle.js 2.0. On Bangle.js 1.0
   * you need to use <code>Install Default Apps</code> under the <code>More...</code> tab
   * of <a href="http://banglejs.com/apps">http://banglejs.com/apps</a></p>
   * @url http://www.espruino.com/Reference#l_Bangle_factoryReset
   */
  function factoryReset(): void;

  /**
   * <p>Returns the rectangle on the screen that is currently
   * reserved for the app.</p>
   * @url http://www.espruino.com/Reference#l_Bangle_appRect
   */
  const appRect: any;

}

/**
 * Class containing <a href="https://www.espruino.com/MicroBit">micro:bit&#39;s</a> utility functions.
 * @url http://www.espruino.com/Reference#Microbit
 */
declare function Microbit(): void;

declare namespace Microbit {
  /**
   * The micro:bit&#39;s speaker pin
   * @url http://www.espruino.com/Reference#l_Microbit_SPEAKER
   */
  const SPEAKER: Pin;

  /**
   * The micro:bit&#39;s microphone pin
   * <code>MIC_ENABLE</code> should be set to 1 before using this
   * @url http://www.espruino.com/Reference#l_Microbit_MIC
   */
  const MIC: Pin;

  /**
   * The micro:bit&#39;s microphone enable pin
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
   * <strong>Note:</strong> This function is only available on the <a href="/MicroBit">BBC micro:bit</a> board
   * Write the given value to the accelerometer
   * @url http://www.espruino.com/Reference#l_Microbit_accelWr
   */
  function accelWr(addr: number, data: number): void;

  /**
   * Turn on the accelerometer, and create <code>Microbit.accel</code> and <code>Microbit.gesture</code> events.
   * <p><strong>Note:</strong> The accelerometer is currently always enabled - this code
   * just responds to interrupts and reads</p>
   * @url http://www.espruino.com/Reference#l_Microbit_accelOn
   */
  function accelOn(): void;

  /**
   * Turn off events from  the accelerometer (started with <code>Microbit.accelOn</code>)
   * @url http://www.espruino.com/Reference#l_Microbit_accelOff
   */
  function accelOff(): void;

  /**
   * Play a waveform on the Micro:bit&#39;s speaker
   * @url http://www.espruino.com/Reference#l_Microbit_play
   */
  function play(waveform: any, samplesPerSecond: any, callback: any): void;

  /**
   * Records sound from the micro:bit&#39;s onboard microphone and returns the result
   * @url http://www.espruino.com/Reference#l_Microbit_record
   */
  function record(samplesPerSecond: any, callback: any, samples: any): void;

}

/**
 * This is the File object - it allows you to stream data to and from files (As opposed to the <code>require(&#39;fs&#39;).readFile(..)</code> style functions that read an entire file).
 * To create a File object, you must type <code>var fd = E.openFile(&#39;filepath&#39;,&#39;mode&#39;)</code> - see <a href="#l_E_openFile">E.openFile</a> for more information.
 * <strong>Note:</strong> If you want to remove an SD card after you have started using it, you <em>must</em> call <code>E.unmountSD()</code> or you may cause damage to the card.
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
   * <p><strong>Note:</strong> By default this function flushes all changes to the
   * SD card, which makes it slow (but also safe!). You can use
   * <code>E.setFlags({unsyncFiles:1})</code> to disable this behaviour and
   * really speed up writes - but then you must be sure to close
   * all files you are writing before power is lost or you will
   * cause damage to your SD card&#39;s filesystem.</p>
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
   * Pipe this file to a stream (an object with a &#39;write&#39; method)
   * @url http://www.espruino.com/Reference#l_File_pipe
   */
  pipe: (destination: any, options: any) => void;

}

/**
 * This library handles interfacing with a FAT32 filesystem on an SD card. The API is designed to be similar to node.js&#39;s - However Espruino does not currently support asynchronous file IO, so the functions behave like node.js&#39;s xxxxSync functions. Versions of the functions with &#39;Sync&#39; after them are also provided for compatibility.
 * To use this, you must type <code>var fs = require(&#39;fs&#39;)</code> to get access to the library
 * See <a href="http://www.espruino.com/File+IO">the page on File IO</a> for more information, and for examples on wiring up an SD card if your device doesn&#39;t come with one.
 * <strong>Note:</strong> If you want to remove an SD card after you have started using it, you <em>must</em> call <code>E.unmountSD()</code> or you may cause damage to the card.
 * @url http://www.espruino.com/Reference#l_fs_undefined
 */
declare function fs(): void;

declare namespace fs {
  /**
   * List all files in the supplied directory, returning them as an array of strings.
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the &#39;Sync&#39; version.
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
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the &#39;Sync&#39; version.
   * @url http://www.espruino.com/Reference#l_fs_writeFile
   */
  function writeFile(path: any, data: any): boolean;

  /**
   * Write the data to the given file
   * @url http://www.espruino.com/Reference#l_fs_writeFileSync
   */
  function writeFileSync(path: any, data: any): boolean;

  /**
   * Append the data to the given file, created a new file if it doesn&#39;t exist
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the &#39;Sync&#39; version.
   * @url http://www.espruino.com/Reference#l_fs_appendFile
   */
  function appendFile(path: any, data: any): boolean;

  /**
   * Append the data to the given file, created a new file if it doesn&#39;t exist
   * @url http://www.espruino.com/Reference#l_fs_appendFileSync
   */
  function appendFileSync(path: any, data: any): boolean;

  /**
   * Read all data from a file and return as a string
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the &#39;Sync&#39; version.
   * @url http://www.espruino.com/Reference#l_fs_readFile
   */
  function readFile(path: any): any;

  /**
   * Read all data from a file and return as a string.
   * <strong>Note:</strong> The size of files you can load using this method is limited by the amount of available RAM. To read files a bit at a time, see the <code>File</code> class.
   * @url http://www.espruino.com/Reference#l_fs_readFileSync
   */
  function readFileSync(path: any): any;

  /**
   * Delete the given file
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the &#39;Sync&#39; version.
   * @url http://www.espruino.com/Reference#l_fs_unlink
   */
  function unlink(path: any): boolean;

  /**
   * Delete the given file
   * @url http://www.espruino.com/Reference#l_fs_unlinkSync
   */
  function unlinkSync(path: any): boolean;

  /**
   * <p>Return information on the given file. This returns an object with the following
   * fields:</p>
   * <p>size: size in bytes
   * dir: a boolean specifying if the file is a directory or not
   * mtime: A Date structure specifying the time the file was last modified</p>
   * @url http://www.espruino.com/Reference#l_fs_statSync
   */
  function statSync(path: any): any;

  /**
   * Create the directory
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the &#39;Sync&#39; version.
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
 * Class containing utility functions for <a href="http://www.espruino.com/Pixl.js">Pixl.js</a>
 * @url http://www.espruino.com/Reference#Pixl
 */
declare function Pixl(): void;

declare namespace Pixl {
  /**
   * DEPRECATED - Please use <code>E.getBattery()</code> instead.
   * <p>Return an approximate battery percentage remaining based on
   * a normal CR2032 battery (2.8 - 2.2v)</p>
   * @url http://www.espruino.com/Reference#l_Pixl_getBatteryPercentage
   */
  function getBatteryPercentage(): number;

  /**
   * Set the LCD&#39;s contrast
   * @url http://www.espruino.com/Reference#l_Pixl_setContrast
   */
  function setContrast(c: number): void;

  /**
   * This function can be used to turn Pixl.js&#39;s LCD off or on.
   * <ul>
   * <li>With the LCD off, Pixl.js draws around 0.1mA</li>
   * <li>With the LCD on, Pixl.js draws around 0.25mA</li>
   * </ul>
   * @url http://www.espruino.com/Reference#l_Pixl_setLCDPower
   */
  function setLCDPower(isOn: boolean): void;

  /**
   * Writes a command directly to the ST7567 LCD controller
   * @url http://www.espruino.com/Reference#l_Pixl_lcdw
   */
  function lcdw(c: number): void;

  /**
   * Display a menu on Pixl.js&#39;s screen, and set up the buttons to navigate through it.
   * DEPRECATED: Use <code>E.showMenu</code>
   * @url http://www.espruino.com/Reference#l_Pixl_menu
   */
  function menu(menu: any): any;

}

/**
 * <p>Web Bluetooth-style GATT server - get this using <code>NRF.connect(address)</code>
 * or <code>NRF.requestDevice(options)</code> and <code>response.gatt.connect</code></p>
 * <a href="https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattserver">https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattserver</a>
 * @url http://www.espruino.com/Reference#BluetoothRemoteGATTServer
 */
declare function BluetoothRemoteGATTServer(): void;

type BluetoothRemoteGATTServer = {
  /**
   * <p>Disconnect from a previously connected BLE device connected with
   * <code>BluetoothRemoteGATTServer.connect</code> - this does not disconnect from something that has
   * connected to the Espruino.</p>
   * <p><strong>Note:</strong> While <code>.disconnect</code> is standard Web Bluetooth, in the spec it
   * returns undefined not a <code>Promise</code> for implementation reasons. In Espruino
   * we return a <code>Promise</code> to make it easier to detect when Espruino is free
   * to connect to something else.</p>
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_disconnect
   */
  disconnect: () => Promise<any>;

  /**
   * See <code>NRF.connect</code> for usage examples.
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getPrimaryService
   */
  getPrimaryService: (service: any) => Promise<any>;

  /**
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getPrimaryServices
   */
  getPrimaryServices: () => Promise<any>;

}

/**
 * Web Bluetooth-style GATT service - get this using <code>BluetoothRemoteGATTServer.getPrimaryService(s)</code>
 * <a href="https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattservice">https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattservice</a>
 * @url http://www.espruino.com/Reference#BluetoothRemoteGATTService
 */
declare function BluetoothRemoteGATTService(): void;

type BluetoothRemoteGATTService = {
  /**
   * See <code>NRF.connect</code> for usage examples.
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTService_getCharacteristic
   */
  getCharacteristic: (characteristic: any) => Promise<any>;

  /**
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTService_getCharacteristics
   */
  getCharacteristics: () => Promise<any>;

}

/**
 * Web Bluetooth-style GATT characteristic - get this using <code>BluetoothRemoteGATTService.getCharacteristic(s)</code>
 * <a href="https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattcharacteristic">https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattcharacteristic</a>
 * @url http://www.espruino.com/Reference#BluetoothRemoteGATTCharacteristic
 */
declare function BluetoothRemoteGATTCharacteristic(): void;

type BluetoothRemoteGATTCharacteristic = {
  /**
   * Stop notifications (that were requested with <code>BluetoothRemoteGATTCharacteristic.startNotifications</code>)
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
 * Class containing <a href="http://www.puck-js.com">Puck.js&#39;s</a> utility functions.
 * @url http://www.espruino.com/Reference#Puck
 */
declare function Puck(): void;

declare namespace Puck {
  /**
   * Turn on the magnetometer, take a single reading, and then turn it off again.
   * <p>An object of the form <code>{x,y,z}</code> is returned containing magnetometer readings.
   * Due to residual magnetism in the Puck and magnetometer itself, with
   * no magnetic field the Puck will not return <code>{x:0,y:0,z:0}</code>.</p>
   * <p>Instead, it&#39;s up to you to figure out what the &#39;zero value&#39; is for your
   * Puck in your location and to then subtract that from the value returned. If
   * you&#39;re not trying to measure the Earth&#39;s magnetic field then it&#39;s a good idea
   * to just take a reading at startup and use that.</p>
   * <p>With the aerial at the top of the board, the <code>y</code> reading is vertical, <code>x</code> is
   * horizontal, and <code>z</code> is through the board.</p>
   * <p>Readings are in increments of 0.1 micro Tesla (uT). The Earth&#39;s magnetic field
   * varies from around 25-60 uT, so the reading will vary by 250 to 600 depending
   * on location.</p>
   * @url http://www.espruino.com/Reference#l_Puck_mag
   */
  function mag(): any;

  /**
   * Turn on the magnetometer, take a single temperature reading from the MAG3110 chip, and then turn it off again.
   * (If the magnetometer is already on, this just returns the last reading obtained)
   * <code>E.getTemperature()</code> uses the microcontroller&#39;s temperature sensor, but this uses the magnetometer&#39;s.
   * <p>The reading obtained is an integer (so no decimal places), but the sensitivity is factory trimmed. to 1&deg;C, however the temperature
   * offset isn&#39;t - so absolute readings may still need calibrating.</p>
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
   * <p>Check out <a href="http://www.espruino.com/Puck.js#on-board-peripherals">the Puck.js page on the magnetometer</a>
   * for more information and links to modules that use this function.</p>
   * @url http://www.espruino.com/Reference#l_Puck_magWr
   */
  function magWr(reg: number, data: number): void;

  /**
   * Reads a register from the LIS3MDL / MAX3110 Magnetometer. Can be used for configuring advanced functions.
   * <p>Check out <a href="http://www.espruino.com/Puck.js#on-board-peripherals">the Puck.js page on the magnetometer</a>
   * for more information and links to modules that use this function.</p>
   * @url http://www.espruino.com/Reference#l_Puck_magRd
   */
  function magRd(reg: number): number;

  /**
   * On Puck.js v2.0 this will use the on-board PCT2075TP temperature sensor, but on Puck.js the less accurate on-chip Temperature sensor is used.
   * @url http://www.espruino.com/Reference#l_Puck_getTemperature
   */
  function getTemperature(): number;

  /**
   * Turn the accelerometer off after it has been turned on by <code>Puck.accelOn()</code>. 
   * <p>Check out <a href="http://www.espruino.com/Puck.js#on-board-peripherals">the Puck.js page on the accelerometer</a>
   * for more information.</p>
   * @url http://www.espruino.com/Reference#l_Puck_accelOff
   */
  function accelOff(): void;

  /**
   * Turn on the accelerometer, take a single reading, and then turn it off again.
   * The values reported are the raw values from the chip. In normal configuration:
   * <ul>
   * <li>accelerometer: full-scale (32768) is 4g, so you need to divide by 8192 to get correctly scaled values</li>
   * <li>gyro: full-scale (32768) is 245 dps, so you need to divide by 134 to get correctly scaled values</li>
   * </ul>
   * If taking more than one reading, we&#39;d suggest you use <code>Puck.accelOn()</code> and the <code>Puck.accel</code> event.
   * @url http://www.espruino.com/Reference#l_Puck_accel
   */
  function accel(): any;

  /**
   * Writes a register on the LSM6DS3TR-C Accelerometer. Can be used for configuring advanced functions.
   * <p>Check out <a href="http://www.espruino.com/Puck.js#on-board-peripherals">the Puck.js page on the accelerometer</a>
   * for more information and links to modules that use this function.</p>
   * @url http://www.espruino.com/Reference#l_Puck_accelWr
   */
  function accelWr(reg: number, data: number): void;

  /**
   * Reads a register from the LSM6DS3TR-C Accelerometer. Can be used for configuring advanced functions.
   * <p>Check out <a href="http://www.espruino.com/Puck.js#on-board-peripherals">the Puck.js page on the accelerometer</a>
   * for more information and links to modules that use this function.</p>
   * @url http://www.espruino.com/Reference#l_Puck_accelRd
   */
  function accelRd(reg: number): number;

  /**
   * <p>Transmit the given set of IR pulses - data should be an array of pulse times
   * in milliseconds (as <code>[on, off, on, off, on, etc]</code>).</p>
   * <p>For example <code>Puck.IR(pulseTimes)</code> - see <a href="http://www.espruino.com/Puck.js+Infrared">http://www.espruino.com/Puck.js+Infrared</a>
   * for a full example.</p>
   * <p>You can also attach an external LED to Puck.js, in which case
   * you can just execute <code>Puck.IR(pulseTimes, led_cathode, led_anode)</code></p>
   * <p>It is also possible to just supply a single pin for IR transmission
   * with <code>Puck.IR(pulseTimes, led_anode)</code> (on 2v05 and above).</p>
   * @url http://www.espruino.com/Reference#l_Puck_IR
   */
  function IR(data: any, cathode: Pin, anode: Pin): void;

  /**
   * Capacitive sense - the higher the capacitance, the higher the number returned.
   * <p>If called without arguments, a value depending on the capacitance of what is 
   * attached to pin D11 will be returned. If you attach a length of wire to D11,
   * you&#39;ll be able to see a higher value returned when your hand is near the wire
   * than when it is away.</p>
   * <p>You can also supply pins to use yourself, however if you do this then
   * the TX pin must be connected to RX pin and sense plate via a roughly 1MOhm 
   * resistor.</p>
   * <p>When not supplying pins, Puck.js uses an internal resistor between D12(tx)
   * and D11(rx).</p>
   * @url http://www.espruino.com/Reference#l_Puck_capSense
   */
  function capSense(tx: Pin, rx: Pin): number;

  /**
   * Return a light value based on the light the red LED is seeing.
   * <p><strong>Note:</strong> If called more than 5 times per second, the received light value
   * may not be accurate.</p>
   * @url http://www.espruino.com/Reference#l_Puck_light
   */
  function light(): number;

  /**
   * DEPRECATED - Please use <code>E.getBattery()</code> instead.
   * <p>Return an approximate battery percentage remaining based on
   * a normal CR2032 battery (2.8 - 2.2v).</p>
   * @url http://www.espruino.com/Reference#l_Puck_getBatteryPercentage
   */
  function getBatteryPercentage(): number;

  /**
   * <p>Run a self-test, and return true for a pass. This checks for shorts
   * between pins, so your Puck shouldn&#39;t have anything connected to it.</p>
   * <p><strong>Note:</strong> This self-test auto starts if you hold the button on your Puck
   * down while inserting the battery, leave it pressed for 3 seconds (while
   * the green LED is lit) and release it soon after all LEDs turn on. 5
   * red blinks is a fail, 5 green is a pass.</p>
   * <p>If the self test fails, it&#39;ll set the Puck.js Bluetooth advertising name
   * to <code>Puck.js !ERR</code> where ERR is a 3 letter error code.</p>
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
   * Completely uninitialise and power down the CC3000. After this you&#39;ll have to use <code>require(&quot;CC3000&quot;).connect()</code> again.
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
   * <strong>Note:</strong> Changes are written to non-volatile memory, but will only take effect after calling <code>wlan.reconnect()</code>
   * @url http://www.espruino.com/Reference#l_WLAN_setIP
   */
  setIP: (options: any) => boolean;

}

/**
 * <p>This library implements a telnet console for the Espruino interpreter. It requires a network
 * connection, e.g. Wifi, and <strong>currently only functions on the ESP8266 and on Linux </strong>. It uses
 * port 23 on the ESP8266 and port 2323 on Linux.</p>
 * <strong>Note:</strong> To enable on Linux, run <code>./espruino --telnet</code>
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
 * Class containing utility functions for the <a href="http://www.espruino.com/EspruinoESP8266">ESP8266</a>
 * @url http://www.espruino.com/Reference#ESP8266
 */
declare function ESP8266(): void;

declare namespace ESP8266 {
  /**
   * <strong>DEPRECATED</strong> - please use <code>Wifi.ping</code> instead.
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
   * At boot time the esp8266&#39;s firmware captures the cause of the reset/reboot.  This function returns this information in an object with the following fields:
   * <ul>
   * <li><code>reason</code>: &quot;power on&quot;, &quot;wdt reset&quot;, &quot;exception&quot;, &quot;soft wdt&quot;, &quot;restart&quot;, &quot;deep sleep&quot;, or &quot;reset pin&quot;</li>
   * <li><code>exccause</code>: exception cause</li>
   * <li><code>epc1</code>, <code>epc2</code>, <code>epc3</code>: instruction pointers</li>
   * <li><code>excvaddr</code>: address being accessed</li>
   * <li><code>depc</code>: (?)</li>
   * </ul>
   * @url http://www.espruino.com/Reference#l_ESP8266_getResetInfo
   */
  function getResetInfo(): RstInfo;

  /**
   * Enable or disable the logging of debug information.  A value of <code>true</code> enables debug logging while a value of <code>false</code> disables debug logging.  Debug output is sent to UART1 (gpio2).
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
   * <p><strong>Note:</strong> This is deprecated. Use <code>E.setClock(80/160)</code>
   * <strong>Note:</strong>
   * Set the operating frequency of the ESP8266 processor. The default is 160Mhz.</p>
   * <strong>Warning</strong>: changing the cpu frequency affects the timing of some I/O operations, notably of software SPI and I2C, so things may be a bit slower at 80Mhz.
   * @url http://www.espruino.com/Reference#l_ESP8266_setCPUFreq
   */
  function setCPUFreq(freq: any): void;

  /**
   * Returns an object that contains details about the state of the ESP8266 with the following fields:
   * <ul>
   * <li><code>sdkVersion</code>   - Version of the SDK.</li>
   * <li><code>cpuFrequency</code> - CPU operating frequency in Mhz.</li>
   * <li><code>freeHeap</code>     - Amount of free heap in bytes.</li>
   * <li><code>maxCon</code>       - Maximum number of concurrent connections.</li>
   * <li><code>flashMap</code>     - Configured flash size&amp;map: &#39;512KB:256/256&#39; .. &#39;4MB:512/512&#39;</li>
   * <li><code>flashKB</code>      - Configured flash size in KB as integer</li>
   * <li><code>flashChip</code>    - Type of flash chip as string with manufacturer &amp; chip, ex: &#39;0xEF 0x4016`</li>
   * </ul>
   * @url http://www.espruino.com/Reference#l_ESP8266_getState
   */
  function getState(): any;

  /**
   * <strong>Note:</strong> This is deprecated. Use <code>require(&quot;Flash&quot;).getFree()</code>
   * @url http://www.espruino.com/Reference#l_ESP8266_getFreeFlash
   */
  function getFreeFlash(): any;

  /**
   * @url http://www.espruino.com/Reference#l_ESP8266_crc32
   */
  function crc32(arrayOfData: any): any;

  /**
   * <strong>This function is deprecated.</strong> Please use <code>require(&quot;neopixel&quot;).write(pin, data)</code> instead
   * @url http://www.espruino.com/Reference#l_ESP8266_neopixelWrite
   */
  function neopixelWrite(pin: Pin, arrayOfData: any): void;

  /**
   * <p>Put the ESP8266 into &#39;deep sleep&#39; for the given number of microseconds, 
   * reducing power consumption drastically. </p>
   * meaning of option values:
   * 0 - the 108th Byte of init parameter decides whether RF calibration will be performed or not.
   * 1 - run RF calibration after waking up. Power consumption is high.
   * 2 - no RF calibration after waking up. Power consumption is low.
   * 4 - no RF after waking up. Power consumption is the lowest.
   * <p><strong>Note:</strong> unlike normal Espruino boards&#39; &#39;deep sleep&#39; mode, ESP8266 deep sleep actually turns off the processor. After the given number of microseconds have elapsed, the ESP8266 will restart as if power had been turned off and then back on. <em>All contents of RAM will be lost</em>. 
   * Connect GPIO 16 to RST to enable wakeup.</p>
   * <strong>Special:</strong> 0 microseconds cause sleep forever until external wakeup RST pull down occurs.
   * @url http://www.espruino.com/Reference#l_ESP8266_deepSleep
   */
  function deepSleep(micros: any, option: any): void;

}

/**
 * This library allows you to create http servers and make http requests
 * In order to use this, you will need an extra module to get network connectivity such as the <a href="/CC3000">TI CC3000</a> or <a href="/WIZnet">WIZnet W5500</a>.
 * This is designed to be a cut-down version of the <a href="http://nodejs.org/api/http.html">node.js library</a>. Please see the <a href="/Internet">Internet</a> page for more information on how to use it.
 * @url http://www.espruino.com/Reference#l_http_undefined
 */
declare function http(): void;

declare namespace http {
  /**
   * Create an HTTP Server
   * When a request to the server is made, the callback is called. In the callback you can use the methods on the response (<code>httpSRs</code>) to send data. You can also add <code>request.on(&#39;data&#39;,function() { ... })</code> to listen for POSTed data
   * @url http://www.espruino.com/Reference#l_http_createServer
   */
  function createServer(callback: any): httpSrv;

}

/**
 * The HTTP server created by <code>require(&#39;http&#39;).createServer</code>
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
   * The HTTP method used with this request. Often <code>&quot;GET&quot;</code>.
   * @url http://www.espruino.com/Reference#l_httpSRq_method
   */
  method: any

  /**
   * The URL requested in this HTTP request, for instance:
   * <ul>
   * <li><code>&quot;/&quot;</code> - the main page</li>
   * <li><code>&quot;/favicon.ico&quot;</code> - the web page&#39;s icon</li>
   * </ul>
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
   * Pipe this to a stream (an object with a &#39;write&#39; method)
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
   * <p>This function writes the <code>data</code> argument as a string. Data that is passed in
   * (including arrays) will be converted to a string with the normal JavaScript 
   * <code>toString</code> method. For more information about sending binary data see <code>Socket.write</code></p>
   * @url http://www.espruino.com/Reference#l_httpSRs_write
   */
  write: (data: any) => boolean;

  /**
   * See <code>Socket.write</code> for more information about the data argument
   * @url http://www.espruino.com/Reference#l_httpSRs_end
   */
  end: (data: any) => void;

  /**
   * <p>Send the given status code and headers. If not explicitly called
   * this will be done automatically the first time data is written
   * to the response.</p>
   * <p>This cannot be called twice, or after data has already been sent
   * in the response.</p>
   * @url http://www.espruino.com/Reference#l_httpSRs_writeHead
   */
  writeHead: (statusCode: number, headers: any) => void;

  /**
   * Set a value to send in the header of this HTTP response. This updates the <code>httpSRs.headers</code> property.
   * Any headers supplied to <code>writeHead</code> will overwrite any headers with the same name.
   * @url http://www.espruino.com/Reference#l_httpSRs_setHeader
   */
  setHeader: (name: any, value: any) => void;

}

/**
 * The HTTP client request, returned by <code>http.request()</code> and <code>http.get()</code>.
 * @url http://www.espruino.com/Reference#httpCRq
 */
declare function httpCRq(): void;

type httpCRq = {
  /**
   * <p>This function writes the <code>data</code> argument as a string. Data that is passed in
   * (including arrays) will be converted to a string with the normal JavaScript 
   * <code>toString</code> method. For more information about sending binary data see <code>Socket.write</code></p>
   * @url http://www.espruino.com/Reference#l_httpCRq_write
   */
  write: (data: any) => boolean;

  /**
   * Finish this HTTP request - optional data to append as an argument
   * See <code>Socket.write</code> for more information about the data argument
   * @url http://www.espruino.com/Reference#l_httpCRq_end
   */
  end: (data: any) => void;

}

/**
 * The HTTP client response, passed to the callback of <code>http.request()</code> an <code>http.get()</code>.
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
   * The HTTP response&#39;s status code - usually <code>&quot;200&quot;</code> if all went well
   * @url http://www.espruino.com/Reference#l_httpCRs_statusCode
   */
  statusCode: any

  /**
   * The HTTP response&#39;s status message - Usually <code>&quot;OK&quot;</code> if all went well
   * @url http://www.espruino.com/Reference#l_httpCRs_statusMessage
   */
  statusMessage: any

  /**
   * The HTTP version reported back by the server - usually <code>&quot;1.1&quot;</code>
   * @url http://www.espruino.com/Reference#l_httpCRs_httpVersion
   */
  httpVersion: any

  /**
   * Return how many bytes are available to read. If there is a &#39;data&#39; event handler, this will always return 0.
   * @url http://www.espruino.com/Reference#l_httpCRs_available
   */
  available: () => number;

  /**
   * Return a string containing characters that have been received
   * @url http://www.espruino.com/Reference#l_httpCRs_read
   */
  read: (chars: number) => any;

  /**
   * Pipe this to a stream (an object with a &#39;write&#39; method)
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
   * <p>If &#39;mac&#39; is specified as an option, it must be a string of the form <code>&quot;00:01:02:03:04:05&quot;</code>
   * The default mac is 00:08:DC:01:02:03.</p>
   * @url http://www.espruino.com/Reference#l_Ethernet_setIP
   */
  setIP: (options: any, callback: any) => boolean;

  /**
   * <p>Set hostname allow to set the hosname used during the dhcp request.
   * min 8 and max 12 char, best set before calling <code>eth.setIP()</code>
   * Default is WIZnet010203, 010203 is the default nic as part of the mac.
   * Best to set the hosname before calling setIP().</p>
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
   * For instance <code>url.parse(&quot;/a?b=c&amp;d=e&quot;,true)</code> returns <code>{&quot;method&quot;:&quot;GET&quot;,&quot;host&quot;:&quot;&quot;,&quot;path&quot;:&quot;/a?b=c&amp;d=e&quot;,&quot;pathname&quot;:&quot;/a&quot;,&quot;search&quot;:&quot;?b=c&amp;d=e&quot;,&quot;port&quot;:80,&quot;query&quot;:{&quot;b&quot;:&quot;c&quot;,&quot;d&quot;:&quot;e&quot;}}</code>
   * @url http://www.espruino.com/Reference#l_url_parse
   */
  function parse(urlStr: any, parseQuery: boolean): any;

}

/**
 * This library allows you to create TCPIP servers and clients
 * In order to use this, you will need an extra module to get network connectivity.
 * This is designed to be a cut-down version of the <a href="http://nodejs.org/api/net.html">node.js library</a>. Please see the <a href="/Internet">Internet</a> page for more information on how to use it.
 * @url http://www.espruino.com/Reference#l_net_undefined
 */
declare function net(): void;

declare namespace net {
  /**
   * Create a Server
   * When a request to the server is made, the callback is called. In the callback you can use the methods on the connection to send data. You can also add <code>connection.on(&#39;data&#39;,function() { ... })</code> to listen for received data
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
 * The socket server created by <code>require(&#39;net&#39;).createServer</code>
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
   * Pipe this to a stream (an object with a &#39;write&#39; method)
   * @url http://www.espruino.com/Reference#l_Socket_pipe
   */
  pipe: (destination: any, options: any) => void;

  /**
   * Close this socket - optional data to append as an argument.
   * See <code>Socket.write</code> for more information about the data argument
   * @url http://www.espruino.com/Reference#l_Socket_end
   */
  end: (data: any) => void;

}

/**
 * This library allows you to create UDP/DATAGRAM servers and clients
 * In order to use this, you will need an extra module to get network connectivity.
 * This is designed to be a cut-down version of the <a href="http://nodejs.org/api/dgram.html">node.js library</a>. Please see the <a href="/Internet">Internet</a> page for more information on how to use it.
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
 * This is designed to be a cut-down version of the <a href="http://nodejs.org/api/tls.html">node.js library</a>. Please see the <a href="/Internet">Internet</a> page for more information on how to use it.
 * @url http://www.espruino.com/Reference#l_tls_undefined
 */
declare function tls(): void;

/**
 * Simple library for compression/decompression using <a href="https://github.com/atomicobject/heatshrink">heatshrink</a>, an <a href="https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Storer%E2%80%93Szymanski">LZSS</a> compression tool.
 * Espruino uses heatshrink internally to compress RAM down to fit in Flash memory when <code>save()</code> is used. This just exposes that functionality.
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
 * Class containing utility functions for the <a href="http://www.espruino.com/ESP32">ESP32</a>
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
   * Put device in deepsleep state for &quot;us&quot; microseconds.
   * @url http://www.espruino.com/Reference#l_ESP32_deepSleep
   */
  function deepSleep(us: number): void;

  /**
   * Returns an object that contains details about the state of the ESP32 with the following fields:
   * <ul>
   * <li><code>sdkVersion</code>   - Version of the SDK.</li>
   * <li><code>freeHeap</code>     - Amount of free heap in bytes.</li>
   * <li><code>BLE</code>             - Status of BLE, enabled if true.</li>
   * <li><code>Wifi</code>         - Status of Wifi, enabled if true.</li>
   * <li><code>minHeap</code>      - Minimum heap, calculated by heap_caps_get_minimum_free_size</li>
   * </ul>
   * @url http://www.espruino.com/Reference#l_ESP32_getState
   */
  function getState(): any;

  /**
   * @url http://www.espruino.com/Reference#l_ESP32_setBLE_Debug
   */
  function setBLE_Debug(level: number): void;

  /**
   * <p>Switches Bluetooth off/on, removes saved code from Flash, resets the board, 
   * and on restart creates jsVars depending on available heap (actual additional 1800)</p>
   * @url http://www.espruino.com/Reference#l_ESP32_enableBLE
   */
  function enableBLE(enable: boolean): void;

  /**
   * <p>Switches Wifi off/on, removes saved code from Flash, resets the board, 
   * and on restart creates jsVars depending on available heap (actual additional 3900)</p>
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
 * This is a built-in class to allow you to use the ESP8266 NodeMCU boards&#39;s pin namings to access pins. It is only available on ESP8266-based boards.
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
 * Use <code>Serial.setup</code> to configure this port.
 * @url http://www.espruino.com/Reference#l_Serial_Serial
 */
declare function Serial(): any;

declare namespace Serial {
  /**
   * Try and find a USART (Serial) hardware device that will work on this pin (eg. <code>Serial1</code>)
   * May return undefined if no device can be found.
   * @url http://www.espruino.com/Reference#l_Serial_find
   */
  function find(pin: Pin): any;

}

type Serial = {
  /**
   * Set this Serial port as the port for the JavaScript console (REPL).
   * <p>Unless <code>force</code> is set to true, changes in the connection state of the board
   * (for instance plugging in USB) will cause the console to change.</p>
   * See <code>E.setConsole</code> for a more flexible version of this function.
   * @url http://www.espruino.com/Reference#l_Serial_setConsole
   */
  setConsole: (force: boolean) => void;

  /**
   * <p>If the serial (or software serial) device was set up,
   * uninitialise it.</p>
   * @url http://www.espruino.com/Reference#l_Serial_unsetup
   */
  unsetup: () => void;

  /**
   * Print a string to the serial port - without a line feed
   *  <strong>Note:</strong> This function replaces any occurances of <code>\n</code> in the string with <code>\r\n</code>. To avoid this, use <code>Serial.write</code>.
   * @url http://www.espruino.com/Reference#l_Serial_print
   */
  print: (string: any) => void;

  /**
   * Print a line to the serial port with a newline (<code>\r\n</code>) at the end of it.
   *  <strong>Note:</strong> This function converts data to a string first, eg <code>Serial.print([1,2,3])</code> is equivalent to <code>Serial.print(&quot;1,2,3&quot;). If you&#39;d like to write raw bytes, use</code>Serial.write`.
   * @url http://www.espruino.com/Reference#l_Serial_println
   */
  println: (string: any) => void;

  /**
   * Write a character or array of data to the serial port
   * This method writes unmodified data, eg <code>Serial.write([1,2,3])</code> is equivalent to <code>Serial.write(&quot;\1\2\3&quot;)</code>. If you&#39;d like data converted to a string first, use <code>Serial.print</code>.
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
   * Pipe this USART to a stream (an object with a &#39;write&#39; method)
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
 * A loopback serial device. Data sent to <code>LoopbackA</code> comes out of <code>LoopbackB</code> and vice versa
 * @url http://www.espruino.com/Reference#l__global_LoopbackA
 */
declare const LoopbackA: Serial;

/**
 * A loopback serial device. Data sent to <code>LoopbackA</code> comes out of <code>LoopbackB</code> and vice versa
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
 * <ul>
 * <li><a href="/Reference#Uint8Array">Uint8Array</a></li>
 * <li><a href="/Reference#UintClamped8Array">UintClamped8Array</a></li>
 * <li><a href="/Reference#Int8Array">Int8Array</a></li>
 * <li><a href="/Reference#Uint16Array">Uint16Array</a></li>
 * <li><a href="/Reference#Int16Array">Int16Array</a></li>
 * <li><a href="/Reference#Uint24Array">Uint24Array</a> (Espruino-specific - not standard JS)</li>
 * <li><a href="/Reference#Uint32Array">Uint32Array</a></li>
 * <li><a href="/Reference#Int32Array">Int32Array</a></li>
 * <li><a href="/Reference#Float32Array">Float32Array</a></li>
 * <li><a href="/Reference#Float64Array">Float64Array</a></li>
 * </ul>
 * <p>If you want to access arrays of differing types of data
 * you may also find <code>DataView</code> useful.</p>
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
   * The length, in bytes, of the <code>ArrayBufferView</code>
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_byteLength
   */
  byteLength: number

  /**
   * The offset, in bytes, to the first byte of the view within the backing <code>ArrayBuffer</code>
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_byteOffset
   */
  byteOffset: number

  /**
   * Copy the contents of <code>array</code> into this one, mapping <code>this[x+offset]=array[x];</code>
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_set
   */
  set: (arr: any, offset: number) => void;

  /**
   * Return an array which is made from the following: <code>A.map(function) = [function(A[0]), function(A[1]), ...]</code>
   *  <strong>Note:</strong> This returns an <code>ArrayBuffer</code> of the same type it was called on. To get an <code>Array</code>, use <code>Array.map</code>, eg. <code>[].map.call(myArray, x=&gt;x+1)</code>
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_map
   */
  map: (fn: any, thisArg: any) => EspruinoArrayBufferView;

  /**
   * Returns a smaller part of this array which references the same data (it doesn&#39;t copy it).
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_subarray
   */
  subarray: (begin: number, end: any) => EspruinoArrayBufferView;

  /**
   * Return the index of the value in the array, or <code>-1</code>
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_indexOf
   */
  indexOf: (value: any, startIndex: number) => any;

  /**
   * Return <code>true</code> if the array includes the value, <code>false</code> otherwise
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_includes
   */
  includes: (value: any, startIndex: number) => boolean;

  /**
   * Join all elements of this array together into one string, using &#39;separator&#39; between them. eg. <code>[1,2,3].join(&#39; &#39;)==&#39;1 2 3&#39;</code>
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
   * Execute <code>previousValue=initialValue</code> and then <code>previousValue = callback(previousValue, currentValue, index, array)</code> for each element in the array, and finally return previousValue.
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_reduce
   */
  reduce: (callback: any, initialValue: any) => any;

  /**
   * Fill this array with the given value, for every index <code>&gt;= start</code> and <code>&lt; end</code>
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_fill
   */
  fill: (value: any, start: number, end: any) => EspruinoArrayBufferView;

  /**
   * Return an array which contains only those elements for which the callback function returns &#39;true&#39;
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_filter
   */
  filter: (fn: any, thisArg: any) => any;

  /**
   * Return the array element where <code>function</code> returns <code>true</code>, or <code>undefined</code> if it doesn&#39;t returns <code>true</code> for any element.
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_find
   */
  find: (fn: any) => any;

  /**
   * Return the array element&#39;s index where <code>function</code> returns <code>true</code>, or <code>-1</code> if it doesn&#39;t returns <code>true</code> for any element.
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_findIndex
   */
  findIndex: (fn: any) => any;

  /**
   * Reverse the contents of this <code>ArrayBufferView</code> in-place
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_reverse
   */
  reverse: () => EspruinoArrayBufferView;

  /**
   * Return a copy of a portion of this array (in a new array).
   *  <strong>Note:</strong> This currently returns a normal <code>Array</code>, not an <code>ArrayBuffer</code>
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_slice
   */
  slice: (start: number, end: any) => any[];

}

/**
 * Create a typed array based on the given input. Either an existing Array Buffer, an Integer as a Length, or a simple array. If an <code>ArrayBufferView</code> (eg. <code>Uint8Array</code> rather than <code>ArrayBuffer</code>) is given, it will be completely copied rather than referenced.
 * @url http://www.espruino.com/Reference#l_Uint24Array_Uint24Array
 */
declare function Uint24Array(arr: any, byteOffset: number, length: number): EspruinoArrayBufferView;

type Uint24Array = {
}

/**
 * Create a waveform class. This allows high speed input and output of waveforms. It has an internal variable called <code>buffer</code> (as well as <code>buffer2</code> when double-buffered - see <code>options</code> below) which contains the data to input/output.
 * When double-buffered, a &#39;buffer&#39; event will be emitted each time a buffer is finished with (the argument is that buffer). When the recording stops, a &#39;finish&#39; event will be emitted (with the first argument as the buffer).
 * @url http://www.espruino.com/Reference#l_Waveform_Waveform
 */
declare function Waveform(samples: number, options: any): any;

type Waveform = {
  /**
   * Will start outputting the waveform on the given pin - the pin must have previously been initialised with analogWrite. If not repeating, it&#39;ll emit a <code>finish</code> event when it is done.
   * @url http://www.espruino.com/Reference#l_Waveform_startOutput
   */
  startOutput: (output: Pin, freq: number, options: any) => void;

  /**
   * Will start inputting the waveform on the given pin that supports analog. If not repeating, it&#39;ll emit a <code>finish</code> event when it is done.
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
 * <p>This module allows you to read and write part of the nonvolatile flash
 * memory of your device using a filesystem-like API.</p>
 * <p>Also see the <code>Flash</code> library, which provides a low level, more dangerous way
 * to access all parts of your flash memory.</p>
 * The <code>Storage</code> library provides two distinct types of file:
 * <ul>
 * <li><code>require(&quot;Storage&quot;).write(...)</code>/<code>require(&quot;Storage&quot;).read(...)</code>/etc create simple
 * contiguous files of fixed length. This is the recommended file type.</li>
 * <li><code>require(&quot;Storage&quot;).open(...)</code> creates a <code>StorageFile</code>, which stores the file in
 * numbered chunks (<code>&quot;filename\1&quot;</code>/<code>&quot;filename\2&quot;</code>/etc). It allows data to be appended
 * and for the file to be read line by line.</li>
 * </ul>
 * <p>You must read a file using the same method you used to write it - eg. you can&#39;t create a
 * file with <code>require(&quot;Storage&quot;).open(...)</code> and then read it with <code>require(&quot;Storage&quot;).read(...)</code>.</p>
 * <p><strong>Note:</strong> In firmware 2v05 and later, the maximum length for filenames
 * is 28 characters. However in 2v04 and earlier the max length is 8.</p>
 * @url http://www.espruino.com/Reference#l_Storage_undefined
 */
declare function EspruinoStorage(): void;

declare namespace EspruinoStorage {
  /**
   * <p>Erase the flash storage area. This will remove all files
   * created with <code>require(&quot;Storage&quot;).write(...)</code> as well
   * as any code saved with <code>save()</code> or <code>E.setBootCode()</code>.</p>
   * @url http://www.espruino.com/Reference#l_Storage_eraseAll
   */
  function eraseAll(): void;

  /**
   * Erase a single file from the flash storage area.
   * <p><strong>Note:</strong> This function should be used with normal files, and not
   * <code>StorageFile</code>s created with <code>require(&quot;Storage&quot;).open(filename, ...)</code></p>
   * @url http://www.espruino.com/Reference#l_Storage_erase
   */
  function erase(name: any): void;

  /**
   * <p>Read a file from the flash storage area that has
   * been written with <code>require(&quot;Storage&quot;).write(...)</code>.</p>
   * <p>This function returns a memory-mapped String that points to the actual
   * memory area in read-only memory, so it won&#39;t use up RAM.</p>
   * As such you can check if a file exists efficiently using <code>require(&quot;Storage&quot;).read(filename)!==undefined</code>.
   * <p>If you evaluate this string with <code>eval</code>, any functions
   * contained in the String will keep their code stored
   * in flash memory.</p>
   * <p><strong>Note:</strong> This function should be used with normal files, and not
   * <code>StorageFile</code>s created with <code>require(&quot;Storage&quot;).open(filename, ...)</code></p>
   * @url http://www.espruino.com/Reference#l_Storage_read
   */
  function read(name: any, offset: number, length: number): any;

  /**
   * <p>Read a file from the flash storage area that has
   * been written with <code>require(&quot;Storage&quot;).write(...)</code>,
   * and parse JSON in it into a JavaScript object.</p>
   * <p>This is identical to <code>JSON.parse(require(&quot;Storage&quot;).read(...))</code>.
   * It will throw an exception if the data in the file is not
   * valid JSON.</p>
   * <p><strong>Note:</strong> This function should be used with normal files, and not
   * <code>StorageFile</code>s created with <code>require(&quot;Storage&quot;).open(filename, ...)</code></p>
   * @url http://www.espruino.com/Reference#l_Storage_readJSON
   */
  function readJSON(name: any, noExceptions: boolean): any;

  /**
   * <p>Read a file from the flash storage area that has
   * been written with <code>require(&quot;Storage&quot;).write(...)</code>,
   * and return the raw binary data as an ArrayBuffer.</p>
   * This can be used:
   * <ul>
   * <li>In a <code>DataView</code> with <code>new DataView(require(&quot;Storage&quot;).readArrayBuffer(&quot;x&quot;))</code></li>
   * <li>In a <code>Uint8Array/Float32Array/etc</code> with <code>new Uint8Array(require(&quot;Storage&quot;).readArrayBuffer(&quot;x&quot;))</code></li>
   * </ul>
   * <p><strong>Note:</strong> This function should be used with normal files, and not
   * <code>StorageFile</code>s created with <code>require(&quot;Storage&quot;).open(filename, ...)</code></p>
   * @url http://www.espruino.com/Reference#l_Storage_readArrayBuffer
   */
  function readArrayBuffer(name: any): any;

  /**
   * <p>Write/create a file in the flash storage area. This is
   * nonvolatile and will not disappear when the device resets
   * or power is lost.</p>
   * <p>Simply write <code>require(&quot;Storage&quot;).writeJSON(&quot;MyFile&quot;, [1,2,3])</code> to write
   * a new file, and <code>require(&quot;Storage&quot;).readJSON(&quot;MyFile&quot;)</code> to read it.</p>
   * This is equivalent to: <code>require(&quot;Storage&quot;).write(name, JSON.stringify(data))</code>
   * <p><strong>Note:</strong> This function should be used with normal files, and not
   * <code>StorageFile</code>s created with <code>require(&quot;Storage&quot;).open(filename, ...)</code></p>
   * @url http://www.espruino.com/Reference#l_Storage_writeJSON
   */
  function writeJSON(name: any, data: any): boolean;

  /**
   * <p>The Flash Storage system is journaling. To make the most of the limited
   * write cycles of Flash memory, Espruino marks deleted/replaced files as
   * garbage and moves on to a fresh part of flash memory. Espruino only
   * fully erases those files when it is running low on flash, or when
   * <code>compact</code> is called.</p>
   * <p><code>compact</code> may fail if there isn&#39;t enough RAM free on the stack to
   * use as swap space, however in this case it will not lose data.</p>
   * <p><strong>Note:</strong> <code>compact</code> rearranges the contents of memory. If code is
   * referencing that memory (eg. functions that have their code stored in flash)
   * then they may become garbled when compaction happens. To avoid this,
   * call <code>eraseFiles</code> before uploading data that you intend to reference to
   * ensure that uploaded files are right at the start of flash and cannot be
   * compacted further.</p>
   * @url http://www.espruino.com/Reference#l_Storage_compact
   */
  function compact(): void;

  /**
   * <p>This writes information about all blocks in flash
   * memory to the console - and is only useful for debugging
   * flash storage.</p>
   * @url http://www.espruino.com/Reference#l_Storage_debug
   */
  function debug(): void;

  /**
   * <p>Return the amount of free bytes available in
   * Storage. Due to fragmentation there may be more
   * bytes available, but this represents the maximum
   * size of file that can be written.</p>
   * @url http://www.espruino.com/Reference#l_Storage_getFree
   */
  function getFree(): number;

  /**
   * <p>Open a file in the Storage area. This can be used for appending data
   * (normal read/write operations only write the entire file).</p>
   * Please see <code>StorageFile</code> for more information (and examples).
   * <strong>Note:</strong> These files write through immediately - they do not need closing.
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
   * Unmount the SD card, so it can be removed. If you remove the SD card without calling this you may cause corruption, and you will be unable to access another SD card until you reset Espruino or call <code>E.unmountSD()</code>.
   * @url http://www.espruino.com/Reference#l_E_unmountSD
   */
  function unmountSD(): void;

  /**
   * Open a file
   * @url http://www.espruino.com/Reference#l_E_openFile
   */
  function openFile(path: any, mode: any): EspruinoFile;

  /**
   * Use the microcontroller&#39;s internal thermistor to work out the temperature.
   * On Puck.js v2.0 this will use the on-board PCT2075TP temperature sensor, but on other devices it may not be desperately well calibrated.
   * While this is implemented on Espruino boards, it may not be implemented on other devices. If so it&#39;ll return NaN.
   *  <strong>Note:</strong> This is not entirely accurate and varies by a few degrees from chip to chip. It measures the <strong>die temperature</strong>, so when connected to USB it could be reading 10 over degrees C above ambient temperature. When running from battery with <code>setDeepSleep(true)</code> it is much more accurate though.
   * @url http://www.espruino.com/Reference#l_E_getTemperature
   */
  function getTemperature(): number;

  /**
   * Check the internal voltage reference. To work out an actual voltage of an input pin, you can use <code>analogRead(pin)*E.getAnalogVRef()</code>
   * <p> <strong>Note:</strong> This value is calculated by reading the voltage on an internal voltage reference with the ADC.
   * It will be slightly noisy, so if you need this for accurate measurements we&#39;d recommend that you call
   * this function several times and average the results.</p>
   * While this is implemented on Espruino boards, it may not be implemented on other devices. If so it&#39;ll return NaN.
   * @url http://www.espruino.com/Reference#l_E_getAnalogVRef
   */
  function getAnalogVRef(): number;

  /**
   * ADVANCED: This is a great way to crash Espruino if you&#39;re not sure what you are doing
   * Create a native function that executes the code at the given address. Eg. <code>E.nativeCall(0x08012345,&#39;double (double,double)&#39;)(1.1, 2.2)</code>
   * If you&#39;re executing a thumb function, you&#39;ll almost certainly need to set the bottom bit of the address to 1.
   * Note it&#39;s not guaranteed that the call signature you provide can be used - there are limits on the number of arguments allowed.
   * When supplying <code>data</code>, if it is a &#39;flat string&#39; then it will be used directly, otherwise it&#39;ll be converted to a flat string and used.
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
   * Work out the variance of the contents of the given Array, String or ArrayBuffer and return the result. This is equivalent to <code>v=0;for (i in arr) v+=Math.pow(mean-arr[i],2)</code>
   * @url http://www.espruino.com/Reference#l_E_variance
   */
  function variance(arr: any, mean: number): number;

  /**
   * Convolve arr1 with arr2. This is equivalent to <code>v=0;for (i in arr1) v+=arr1[i] * arr2[(i+offset) % arr2.length]</code>
   * @url http://www.espruino.com/Reference#l_E_convolve
   */
  function convolve(arr1: any, arr2: any, offset: number): number;

  /**
   * <p>Performs a Fast Fourier Transform (FFT) in 32 bit floats on the supplied data and writes it back into the
   * original arrays. Note that if only one array is supplied, the data written back is the modulus of the complex
   * result <code>sqrt(r*r+i*i)</code>.</p>
   * <p>In order to perform the FFT, there has to be enough room on the stack to allocate two arrays of 32 bit
   * floating point numbers - this will limit the maximum size of FFT possible to around 1024 items on
   * most platforms.</p>
   * <p><strong>Note:</strong> on the Original Espruino board, FFTs are performed in 64bit arithmetic as there isn&#39;t
   * space to include the 32 bit maths routines (2x more RAM is required).</p>
   * @url http://www.espruino.com/Reference#l_E_FFT
   */
  function FFT(arrReal: any, arrImage: any, inverse: boolean): void;

  /**
   * <p>Kicks a Watchdog timer set up with <code>E.enableWatchdog(..., false)</code>. See
   * <code>E.enableWatchdog</code> for more information.</p>
   * <strong>NOTE:</strong> This is only implemented on STM32 and nRF5x devices (all official Espruino boards).
   * @url http://www.espruino.com/Reference#l_E_kickWatchdog
   */
  function kickWatchdog(): void;

  /**
   * Get and reset the error flags. Returns an array that can contain:
   * <code>&#39;FIFO_FULL&#39;</code>: The receive FIFO filled up and data was lost. This could be state transitions for setWatch, or received characters.
   * <code>&#39;BUFFER_FULL&#39;</code>: A buffer for a stream filled up and characters were lost. This can happen to any stream - Serial,HTTP,etc.
   * <code>&#39;CALLBACK&#39;</code>: A callback (<code>setWatch</code>, <code>setInterval</code>, <code>on(&#39;data&#39;,...)</code>) caused an error and so was removed.
   * <code>&#39;LOW_MEMORY&#39;</code>: Memory is running low - Espruino had to run a garbage collection pass or remove some of the command history
   * <code>&#39;MEMORY&#39;</code>: Espruino ran out of memory and was unable to allocate some data that it needed.
   * <code>&#39;UART_OVERFLOW&#39;</code> : A UART received data but it was not read in time and was lost
   * @url http://www.espruino.com/Reference#l_E_getErrorFlags
   */
  function getErrorFlags(): any;

  /**
   * Get Espruino&#39;s interpreter flags that control the way it handles your JavaScript code.
   * <ul>
   * <li><code>deepSleep</code> - Allow deep sleep modes (also set by setDeepSleep)</li>
   * <li><code>pretokenise</code> - When adding functions, pre-minify them and tokenise reserved words</li>
   * <li><code>unsafeFlash</code> - Some platforms stop writes/erases to interpreter memory to stop you bricking the device accidentally - this removes that protection</li>
   * <li><code>unsyncFiles</code> - When writing files, <em>don&#39;t</em> flush all data to the SD card after each command (the default is <em>to</em> flush). This is much faster, but can cause filesystem damage if power is lost without the filesystem unmounted.</li>
   * </ul>
   * @url http://www.espruino.com/Reference#l_E_getFlags
   */
  function getFlags(): any;

  /**
   * Set the Espruino interpreter flags that control the way it handles your JavaScript code.
   * Run <code>E.getFlags()</code> and check its description for a list of available flags and their values.
   * @url http://www.espruino.com/Reference#l_E_setFlags
   */
  function setFlags(flags: any): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_pipe
   */
  function pipe(source: any, destination: any, options: any): void;

  /**
   * Create an ArrayBuffer from the given string. This is done via a reference, not a copy - so it is very fast and memory efficient.
   * Note that this is an ArrayBuffer, not a Uint8Array. To get one of those, do: <code>new Uint8Array(E.toArrayBuffer(&#39;....&#39;))</code>.
   * @url http://www.espruino.com/Reference#l_E_toArrayBuffer
   */
  function toArrayBuffer(str: any): EspruinoArrayBufferView;

  /**
   * <p>This performs the same basic function as <code>JSON.stringify</code>,
   * however <code>JSON.stringify</code> adds extra characters to conform
   * to the JSON spec which aren&#39;t required if outputting JS.</p>
   * <p><code>E.toJS</code> will also stringify JS functions, whereas
   * <code>JSON.stringify</code> ignores them.</p>
   * For example:
   * <ul>
   * <li><code>JSON.stringify({a:1,b:2}) == &#39;{&quot;a&quot;:1,&quot;b&quot;:2}&#39;</code></li>
   * <li><code>E.toJS({a:1,b:2}) == &#39;{a:1,b:2}&#39;</code></li>
   * </ul>
   * <p><strong>Note:</strong> Strings generated with <code>E.toJS</code> can&#39;t be
   * reliably parsed by <code>JSON.parse</code> - however they are
   * valid JS so will work with <code>eval</code> (but this has security
   * implications if you don&#39;t trust the source of the string).</p>
   * <p>On the desktop <a href="https://github.com/json5/json5">JSON5 parsers</a>
   * will parse the strings produced by <code>E.toJS</code> without trouble.</p>
   * @url http://www.espruino.com/Reference#l_E_toJS
   */
  function toJS(arg: any): string;

  /**
   * <p>This creates and returns a special type of string, which actually references
   * a specific memory address. It can be used in order to use sections of
   * Flash memory directly in Espruino (for example to execute code straight
   * from flash memory with <code>eval(E.memoryArea( ... ))</code>)</p>
   * <p><strong>Note:</strong> This is only tested on STM32-based platforms (Espruino Original
   * and Espruino Pico) at the moment.</p>
   * @url http://www.espruino.com/Reference#l_E_memoryArea
   */
  function memoryArea(addr: number, len: number): string;

  /**
   * <p>This writes JavaScript code into Espruino&#39;s flash memory, to be executed on
   * startup. It differs from <code>save()</code> in that <code>save()</code> saves the whole state of
   * the interpreter, whereas this just saves JS code that is executed at boot.</p>
   * Code will be executed before <code>onInit()</code> and <code>E.on(&#39;init&#39;, ...)</code>.
   * <p>If <code>alwaysExec</code> is <code>true</code>, the code will be executed even after a call to
   * <code>reset()</code>. This is useful if you&#39;re making something that you want to
   * program, but you want some code that is always built in (for instance
   * setting up a display or keyboard).</p>
   * To remove boot code that has been saved previously, use <code>E.setBootCode(&quot;&quot;)</code>
   * <strong>Note:</strong> this removes any code that was previously saved with <code>save()</code>
   * @url http://www.espruino.com/Reference#l_E_setBootCode
   */
  function setBootCode(code: any, alwaysExec: boolean): void;

  /**
   * <p>This sets the clock frequency of Espruino&#39;s processor. It will return <code>0</code> if
   * it is unimplemented or the clock speed cannot be changed.</p>
   * <p><strong>Note:</strong> On pretty much all boards, UART, SPI, I2C, PWM, etc will change
   * frequency and will need setting up again in order to work.</p>
   * <h3 id="stm32f4">STM32F4</h3>
   * <p>Options is of the form <code>{ M: int, N: int, P: int, Q: int }</code> - see the &#39;Clocks&#39;
   * section of the microcontroller&#39;s reference manual for what these mean.</p>
   * <ul>
   * <li>System clock = 8Mhz <em> N / ( M </em> P )</li>
   * <li>USB clock (should be 48Mhz) = 8Mhz <em> N / ( M </em> Q )</li>
   * </ul>
   * Optional arguments are:
   * <ul>
   * <li><code>latency</code> - flash latency from 0..15</li>
   * <li><code>PCLK1</code> - Peripheral clock 1 divisor (default: 2)</li>
   * <li><code>PCLK2</code> - Peripheral clock 2 divisor (default: 4)</li>
   * </ul>
   * <p>The Pico&#39;s default is <code>{M:8, N:336, P:4, Q:7, PCLK1:2, PCLK2:4}</code>, use
   * <code>{M:8, N:336, P:8, Q:7, PCLK:1, PCLK2:2}</code> to halve the system clock speed
   * while keeping the peripherals running at the same speed (omitting PCLK1/2
   * will lead to the peripherals changing speed too).</p>
   * <p>On STM32F4 boards (eg. Espruino Pico), the USB clock needs to be kept at 48Mhz
   * or USB will fail to work. You&#39;ll also experience USB instability if the processor
   * clock falls much below 48Mhz.</p>
   * <h3 id="esp8266">ESP8266</h3>
   * Just specify an integer value, either 80 or 160 (for 80 or 160Mhz)
   * @url http://www.espruino.com/Reference#l_E_setClock
   */
  function setClock(options: any): number;

  /**
   * Returns the current console device - see <code>E.setConsole</code> for more information.
   * @url http://www.espruino.com/Reference#l_E_getConsole
   */
  function getConsole(): any;

  /**
   * Reverse the 8 bits in a byte, swapping MSB and LSB.
   * For example, <code>E.reverseByte(0b10010000) == 0b00001001</code>.
   * Note that you can reverse all the bytes in an array with: <code>arr = arr.map(E.reverseByte)</code>
   * @url http://www.espruino.com/Reference#l_E_reverseByte
   */
  function reverseByte(x: number): number;

  /**
   * Output the current list of Utility Timer Tasks - for debugging only
   * @url http://www.espruino.com/Reference#l_E_dumpTimers
   */
  function dumpTimers(): void;

  /**
   * Dump any locked variables that aren&#39;t referenced from <code>global</code> - for debugging memory leaks only.
   * @url http://www.espruino.com/Reference#l_E_dumpLockedVars
   */
  function dumpLockedVars(): void;

  /**
   * Dump any locked variables that aren&#39;t referenced from <code>global</code> - for debugging memory leaks only.
   * @url http://www.espruino.com/Reference#l_E_dumpFreeList
   */
  function dumpFreeList(): void;

  /**
   * Show fragmentation.
   * <ul>
   * <li><code></code> is free space</li>
   * <li><code>#</code> is a normal variable</li>
   * <li><code>L</code> is a locked variable (address used, cannopt be moved)</li>
   * <li><code>=</code> represents data in a Flat String (must be contiguous)</li>
   * </ul>
   * @url http://www.espruino.com/Reference#l_E_dumpFragmentation
   */
  function dumpFragmentation(): void;

  /**
   * <p>Dumps a comma-separated list of all allocated variables
   * along with the variables they link to. Can be used
   * to visualise where memory is used.</p>
   * @url http://www.espruino.com/Reference#l_E_dumpVariables
   */
  function dumpVariables(): void;

  /**
   * BETA: defragment memory!
   * @url http://www.espruino.com/Reference#l_E_defrag
   */
  function defrag(): void;

  /**
   * <p>Return the address in memory of the given variable. This can then
   * be used with <code>peek</code> and <code>poke</code> functions. However, changing data in
   * JS variables directly (flatAddress=false) will most likely result in a crash.</p>
   * <p>This functions exists to allow embedded targets to set up
   * peripherals such as DMA so that they write directly to
   * JS variables.</p>
   * See <a href="http://www.espruino.com/Internals">http://www.espruino.com/Internals</a> for more information
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
   * Set the seed for the random number generator used by <code>Math.random()</code>.
   * @url http://www.espruino.com/Reference#l_E_srand
   */
  function srand(v: number): void;

  /**
   * <p>Unlike &#39;Math.random()&#39; which uses a pseudo-random number generator, this
   * method reads from the internal voltage reference several times, xoring and
   * rotating to try and make a relatively random value from the noise in the
   * signal.</p>
   * @url http://www.espruino.com/Reference#l_E_hwRand
   */
  function hwRand(): number;

  /**
   * <p>Perform a standard 32 bit CRC (Cyclic redundancy check) on the supplied data (one byte at a time)
   * and return the result as an unsigned integer.</p>
   * @url http://www.espruino.com/Reference#l_E_CRC32
   */
  function CRC32(data: any): any;

  /**
   * Convert hue, saturation and brightness to red, green and blue (packed into an integer if <code>asArray==false</code> or an array if <code>asArray==true</code>).
   * <p>This replaces <code>Graphics.setColorHSB</code> and <code>Graphics.setBgColorHSB</code>. On devices with 24 bit colour it can
   * be used as: <code>Graphics.setColor(E.HSBtoRGB(h, s, b))</code></p>
   * <p>You can quickly set RGB items in an Array or Typed Array using <code>array.set(E.HSBtoRGB(h, s, b,true), offset)</code>,
   * which can be useful with arrays used with <code>require(&quot;neopixel&quot;).write</code>.</p>
   * @url http://www.espruino.com/Reference#l_E_HSBtoRGB
   */
  function HSBtoRGB(hue: number, sat: number, bri: number, asArray: boolean): any;

  /**
   * <p>Set a password on the console (REPL). When powered on, Espruino will
   * then demand a password before the console can be used. If you want to
   * lock the console immediately after this you can call <code>E.lockConsole()</code></p>
   * To remove the password, call this function with no arguments.
   * <p><strong>Note:</strong> There is no protection against multiple password attempts, so someone
   * could conceivably try every password in a dictionary.</p>
   * <p><strong>Note:</strong> This password is stored in memory in plain text. If someone is able
   * to execute arbitrary JavaScript code on the device (eg, you use <code>eval</code> on input
   * from unknown sources) or read the device&#39;s firmware then they may be able to
   * obtain it.</p>
   * @url http://www.espruino.com/Reference#l_E_setPassword
   */
  function setPassword(password: any): void;

  /**
   * <p>If a password has been set with <code>E.setPassword()</code>, this will lock the console
   * so the password needs to be entered to unlock it.</p>
   * @url http://www.espruino.com/Reference#l_E_lockConsole
   */
  function lockConsole(): void;

  /**
   * Set the time zone to be used with <code>Date</code> objects.
   * For example <code>E.setTimeZone(1)</code> will be GMT+0100
   * Time can be set with <code>setTime</code>.
   * @url http://www.espruino.com/Reference#l_E_setTimeZone
   */
  function setTimeZone(zone: number): void;

  /**
   * Provide assembly to Espruino.
   * <p><strong>This function is not part of Espruino</strong>. Instead, it is detected
   * by the Espruino IDE (or command-line tools) at upload time and is
   * replaced with machine code and an <code>E.nativeCall</code> call.</p>
   * See <a href="http://www.espruino.com/Assembler">the documentation on the Assembler</a> for more information.
   * @url http://www.espruino.com/Reference#l_E_asm
   */
  function asm(callspec: any, assemblycode: any): void;

  /**
   * Provides the ability to write C code inside your JavaScript file.
   * <p><strong>This function is not part of Espruino</strong>. Instead, it is detected
   * by the Espruino IDE (or command-line tools) at upload time, is sent
   * to our web service to be compiled, and is replaced with machine code
   * and an <code>E.nativeCall</code> call.</p>
   * See <a href="http://www.espruino.com/InlineC">the documentation on Inline C</a> for more information and examples.
   * @url http://www.espruino.com/Reference#l_E_compiledC
   */
  function compiledC(code: any): void;

  /**
   * <p>Forces a hard reboot of the microcontroller - as close as possible
   * to if the reset pin had been toggled.</p>
   * <p><strong>Note:</strong> This is different to <code>reset()</code>, which performs a software
   * reset of Espruino (resetting the interpreter and pin states, but not
   * all the hardware)</p>
   * @url http://www.espruino.com/Reference#l_E_reboot
   */
  function reboot(): void;

  /**
   * <p>USB HID will only take effect next time you unplug and re-plug your Espruino. If you&#39;re
   * disconnecting it from power you&#39;ll have to make sure you have <code>save()</code>d after calling
   * this function.</p>
   * @url http://www.espruino.com/Reference#l_E_setUSBHID
   */
  function setUSBHID(opts: any): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_sendUSBHID
   */
  function sendUSBHID(data: any): boolean;

  /**
   * <p>In devices that come with batteries, this function returns
   * the battery charge percentage as an integer between 0 and 100.</p>
   * <p><strong>Note:</strong> this is an estimation only, based on battery voltage.
   * The temperature of the battery (as well as the load being drawn
   * from it at the time <code>E.getBattery</code> is called) will affect the
   * readings.</p>
   * @url http://www.espruino.com/Reference#l_E_getBattery
   */
  function getBattery(): number;

  /**
   * Gets the RTC&#39;s current prescaler value if <code>calibrate</code> is undefined or false.
   * <p>If <code>calibrate</code> is true, the low speed oscillator&#39;s speed is calibrated against the high speed
   * oscillator (usually +/- 20 ppm) and a suggested value to be fed into <code>E.setRTCPrescaler(...)</code> is returned.</p>
   * See <code>E.setRTCPrescaler</code> for more information.
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
   *  <strong>Note:</strong> if you didn&#39;t call <code>pinMode</code> beforehand then this function will also reset the pin&#39;s state to <code>&quot;input&quot;</code>
   * @url http://www.espruino.com/Reference#l_Pin_read
   */
  read: () => boolean;

  /**
   * Sets the output state of the pin to a 1
   *  <strong>Note:</strong> if you didn&#39;t call <code>pinMode</code> beforehand then this function will also reset the pin&#39;s state to <code>&quot;output&quot;</code>
   * @url http://www.espruino.com/Reference#l_Pin_set
   */
  set: () => void;

  /**
   * Sets the output state of the pin to a 0
   *  <strong>Note:</strong> if you didn&#39;t call <code>pinMode</code> beforehand then this function will also reset the pin&#39;s state to <code>&quot;output&quot;</code>
   * @url http://www.espruino.com/Reference#l_Pin_reset
   */
  reset: () => void;

  /**
   * Sets the output state of the pin to the parameter given
   *  <strong>Note:</strong> if you didn&#39;t call <code>pinMode</code> beforehand then this function will also reset the pin&#39;s state to <code>&quot;output&quot;</code>
   * @url http://www.espruino.com/Reference#l_Pin_write
   */
  write: (value: boolean) => void;

  /**
   * Sets the output state of the pin to the parameter given at the specified time.
   *  <strong>Note:</strong> this <strong>doesn&#39;t</strong> change the mode of the pin to an output. To do that, you need to use <code>pin.write(0)</code> or <code>pinMode(pin, &#39;output&#39;)</code> first.
   * @url http://www.espruino.com/Reference#l_Pin_writeAtTime
   */
  writeAtTime: (value: boolean, time: number) => void;

  /**
   * Return the current mode of the given pin. See <code>pinMode</code> for more information.
   * @url http://www.espruino.com/Reference#l_Pin_getMode
   */
  getMode: () => any;

  /**
   * Set the mode of the given pin. See <a href="#l__global_pinMode"><code>pinMode</code></a> for more information on pin modes.
   * @url http://www.espruino.com/Reference#l_Pin_mode
   */
  mode: (mode: any) => void;

  /**
   * Toggles the state of the pin from off to on, or from on to off.
   * <strong>Note:</strong> This method doesn&#39;t currently work on the ESP8266 port of Espruino.
   * <strong>Note:</strong> if you didn&#39;t call <code>pinMode</code> beforehand then this function will also reset the pin&#39;s state to <code>&quot;output&quot;</code>
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
 * <p>Also see the <code>Storage</code> library, which provides a safer file-like
 * interface to nonvolatile storage.</p>
 * <p>It should be used with extreme caution, as it is easy to overwrite parts of Flash
 * memory belonging to Espruino or even its bootloader. If you damage the bootloader
 * then you may need external hardware such as a USB-TTL converter to restore it. For
 * more information on restoring the bootloader see <code>Advanced Reflashing</code> in your
 * board&#39;s reference pages.</p>
 * <p>To see which areas of memory you can and can&#39;t overwrite, look at the values
 * reported by <code>process.memory()</code>.</p>
 * <p><strong>Note:</strong> On Nordic platforms there are checks in place to help you avoid
 * &#39;bricking&#39; your device be damaging the bootloader. You can disable these with <code>E.setFlags({unsafeFlash:1})</code></p>
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
   * <p>This method returns an array of objects of the form <code>{addr : #, length : #}</code>, representing
   * contiguous areas of flash memory in the chip that are not used for anything.</p>
   * <p>The memory areas returned are on page boundaries. This means that you can
   * safely erase the page containing any address here, and you won&#39;t risk
   * deleting part of the Espruino firmware.</p>
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
   * <p>In flash memory you may only turn bits that are 1 into bits that are 0. If
   * you&#39;re writing data into an area that you have already written (so <code>read</code>
   * doesn&#39;t return all <code>0xFF</code>) you&#39;ll need to call <code>erasePage</code> to clear the
   * entire page.</p>
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
 * Built-in class that caches the modules used by the <code>require</code> command
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
 * Use <code>SPI.setup</code> to configure this port.
 * @url http://www.espruino.com/Reference#l_SPI_SPI
 */
declare function SPI(): any;

declare namespace SPI {
  /**
   * Try and find an SPI hardware device that will work on this pin (eg. <code>SPI1</code>)
   * May return undefined if no device can be found.
   * @url http://www.espruino.com/Reference#l_SPI_find
   */
  function find(pin: Pin): any;

}

type SPI = {
  /**
   * Send data down SPI, and return the result. Sending an integer will return an integer, a String will return a String, and anything else will return a Uint8Array.
   * Sending multiple bytes in one call to send is preferable as they can then be transmitted end to end. Using multiple calls to send() will result in significantly slower transmission speeds.
   * For maximum speeds, please pass either Strings or Typed Arrays as arguments. Note that you can even pass arrays of arrays, like <code>[1,[2,3,4],5]</code>
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
   * Send data down SPI, using 4 bits for each &#39;real&#39; bit (MSB first). This can be useful for faking one-wire style protocols
   * Sending multiple bytes in one call to send is preferable as they can then be transmitted end to end. Using multiple calls to send() will result in significantly slower transmission speeds.
   * @url http://www.espruino.com/Reference#l_SPI_send4bit
   */
  send4bit: (data: any, bit0: number, bit1: number, nss_pin: Pin) => void;

  /**
   * Send data down SPI, using 8 bits for each &#39;real&#39; bit (MSB first). This can be useful for faking one-wire style protocols
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
 * Use <code>I2C.setup</code> to configure this port.
 * @url http://www.espruino.com/Reference#l_I2C_I2C
 */
declare function I2C(): any;

declare namespace I2C {
  /**
   * Try and find an I2C hardware device that will work on this pin (eg. <code>I2C1</code>)
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
   * Transmit to the slave device with the given address. This is like Arduino&#39;s beginTransmission, write, and endTransmission rolled up into one.
   * @url http://www.espruino.com/Reference#l_I2C_writeTo
   */
  writeTo: (address: any, data: any) => void;

  /**
   * Request bytes from the given slave device, and return them as a Uint8Array (packed array of bytes). This is like using Arduino Wire&#39;s requestFrom, available and read functions.  Sends a STOP
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
 * The pin connected to the &#39;A&#39; button. Reads as <code>1</code> when pressed, <code>0</code> when not
 * @url http://www.espruino.com/Reference#l__global_BTNA
 */
declare const BTNA: Pin;

/**
 * The pin connected to the &#39;B&#39; button. Reads as <code>1</code> when pressed, <code>0</code> when not
 * @url http://www.espruino.com/Reference#l__global_BTNB
 */
declare const BTNB: Pin;

/**
 * The pin connected to the up button. Reads as <code>1</code> when pressed, <code>0</code> when not
 * @url http://www.espruino.com/Reference#l__global_BTNU
 */
declare const BTNU: Pin;

/**
 * The pin connected to the down button. Reads as <code>1</code> when pressed, <code>0</code> when not
 * @url http://www.espruino.com/Reference#l__global_BTND
 */
declare const BTND: Pin;

/**
 * The pin connected to the left button. Reads as <code>1</code> when pressed, <code>0</code> when not
 * @url http://www.espruino.com/Reference#l__global_BTNL
 */
declare const BTNL: Pin;

/**
 * The pin connected to the right button. Reads as <code>1</code> when pressed, <code>0</code> when not
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
 * The Bangle.js&#39;s vibration motor.
 * @url http://www.espruino.com/Reference#l__global_VIBRATE
 */
declare const VIBRATE: Pin;

/**
 * On most Espruino board there are LEDs, in which case <code>LED</code> will be an actual Pin.
 * <p>On Bangle.js there are no LEDs, so to remain compatible with example code that might
 * expect an LED, this is an object that behaves like a pin, but which just displays
 * a circle on the display</p>
 * @url http://www.espruino.com/Reference#l__global_LED
 */
declare const LED: any;

/**
 * On most Espruino board there are LEDs, in which case <code>LED1</code> will be an actual Pin.
 * <p>On Bangle.js there are no LEDs, so to remain compatible with example code that might
 * expect an LED, this is an object that behaves like a pin, but which just displays
 * a circle on the display</p>
 * @url http://www.espruino.com/Reference#l__global_LED1
 */
declare const LED1: any;

/**
 * On most Espruino board there are LEDs, in which case <code>LED2</code> will be an actual Pin.
 * <p>On Bangle.js there are no LEDs, so to remain compatible with example code that might
 * expect an LED, this is an object that behaves like a pin, but which just displays
 * a circle on the display</p>
 * @url http://www.espruino.com/Reference#l__global_LED2
 */
declare const LED2: any;

/**
 * <strong>Note:</strong> This function is only available on the <a href="/MicroBit">BBC micro:bit</a> board
 * Get the current acceleration of the micro:bit from the on-board accelerometer
 * <strong>This is deprecated.</strong> Please use <code>Microbit.accel</code> instead.
 * @url http://www.espruino.com/Reference#l__global_acceleration
 */
declare function acceleration(): any;

/**
 * <strong>Note:</strong> This function is only available on the <a href="/MicroBit">BBC micro:bit</a> board
 * Get the current compass position for the micro:bit from the on-board magnetometer
 * <strong>This is deprecated.</strong> Please use <code>Microbit.mag</code> instead.
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
 *  <strong>Note:</strong> if you didn&#39;t call <code>pinMode</code> beforehand then this function will also reset pin&#39;s state to <code>&quot;analog&quot;</code>
 * @url http://www.espruino.com/Reference#l__global_analogRead
 */
declare function analogRead(pin: Pin): number;

/**
 * Set the analog Value of a pin. It will be output using PWM.
 * Objects can contain:
 * <ul>
 * <li><code>freq</code> - pulse frequency in Hz, eg. <code>analogWrite(A0,0.5,{ freq : 10 });</code> - specifying a frequency will force PWM output, even if the pin has a DAC</li>
 * <li><code>soft</code> - boolean, If true software PWM is used if hardware is not available.</li>
 * <li><p><code>forceSoft</code> - boolean, If true software PWM is used even if hardware PWM or a DAC is available</p>
 * <strong>Note:</strong> if you didn&#39;t call <code>pinMode</code> beforehand then this function will also reset pin&#39;s state to <code>&quot;output&quot;</code>
 * </li>
 * </ul>
 * @url http://www.espruino.com/Reference#l__global_analogWrite
 */
declare function analogWrite(pin: Pin, value: number, options: any): void;

/**
 * Pulse the pin with the value for the given time in milliseconds. It uses a hardware timer to produce accurate pulses, and returns immediately (before the pulse has finished). Use <code>digitalPulse(A0,1,0)</code> to wait until a previous pulse has finished.
 * eg. <code>digitalPulse(A0,1,5);</code> pulses A0 high for 5ms. <code>digitalPulse(A0,1,[5,2,4]);</code> pulses A0 high for 5ms, low for 2ms, and high for 4ms
 *  <strong>Note:</strong> if you didn&#39;t call <code>pinMode</code> beforehand then this function will also reset pin&#39;s state to <code>&quot;output&quot;</code>
 * digitalPulse is for SHORT pulses that need to be very accurate. If you&#39;re doing anything over a few milliseconds, use setTimeout instead.
 * @url http://www.espruino.com/Reference#l__global_digitalPulse
 */
declare function digitalPulse(pin: Pin, value: boolean, time: any): void;

/**
 * Set the digital value of the given pin.
 *  <strong>Note:</strong> if you didn&#39;t call <code>pinMode</code> beforehand then this function will also reset pin&#39;s state to <code>&quot;output&quot;</code>
 * <p>If pin argument is an array of pins (eg. <code>[A2,A1,A0]</code>) the value argument will be treated
 * as an array of bits where the last array element is the least significant bit.</p>
 * <p>In this case, pin values are set least significant bit first (from the right-hand side
 * of the array of pins). This means you can use the same pin multiple times, for
 * example <code>digitalWrite([A1,A1,A0,A0],0b0101)</code> would pulse A0 followed by A1.</p>
 * <p>If the pin argument is an object with a <code>write</code> method, the <code>write</code> method will
 * be called with the value passed through.</p>
 * @url http://www.espruino.com/Reference#l__global_digitalWrite
 */
declare function digitalWrite(pin: Pin, value: number): void;

/**
 * Get the digital value of the given pin.
 *  <strong>Note:</strong> if you didn&#39;t call <code>pinMode</code> beforehand then this function will also reset pin&#39;s state to <code>&quot;input&quot;</code>
 * <p>If the pin argument is an array of pins (eg. <code>[A2,A1,A0]</code>) the value returned will be an number where
 * the last array element is the least significant bit, for example if <code>A0=A1=1</code> and <code>A2=0</code>, <code>digitalRead([A2,A1,A0]) == 0b011</code></p>
 * <p>If the pin argument is an object with a <code>read</code> method, the <code>read</code> method will be called and the integer value it returns
 * passed back.</p>
 * @url http://www.espruino.com/Reference#l__global_digitalRead
 */
declare function digitalRead(pin: Pin): number;

/**
 * Set the mode of the given pin.
 * <ul>
 * <li><code>auto</code>/<code>undefined</code> - Don&#39;t change state, but allow <code>digitalWrite</code>/etc to automatically change state as appropriate</li>
 * <li><code>analog</code> - Analog input</li>
 * <li><code>input</code> - Digital input</li>
 * <li><code>input_pullup</code> - Digital input with internal ~40k pull-up resistor</li>
 * <li><code>input_pulldown</code> - Digital input with internal ~40k pull-down resistor</li>
 * <li><code>output</code> - Digital output</li>
 * <li><code>opendrain</code> - Digital output that only ever pulls down to 0v. Sending a logical <code>1</code> leaves the pin open circuit</li>
 * <li><code>opendrain_pullup</code> - Digital output that pulls down to 0v. Sending a logical <code>1</code> enables internal ~40k pull-up resistor</li>
 * <li><code>af_output</code> - Digital output from built-in peripheral</li>
 * <li><p><code>af_opendrain</code> - Digital output from built-in peripheral that only ever pulls down to 0v. Sending a logical <code>1</code> leaves the pin open circuit</p>
 * <p><strong>Note:</strong> <code>digitalRead</code>/<code>digitalWrite</code>/etc set the pin mode automatically <em>unless</em> <code>pinMode</code> has been called first.
 * If you want <code>digitalRead</code>/etc to set the pin mode automatically after you have called <code>pinMode</code>, simply call it again
 * with no mode argument (<code>pinMode(pin)</code>), <code>auto</code> as the argument (<code>pinMode(pin, &quot;auto&quot;)</code>), or with the 3rd &#39;automatic&#39;
 * argument set to true (<code>pinMode(pin, &quot;output&quot;, true)</code>).</p>
 * </li>
 * </ul>
 * @url http://www.espruino.com/Reference#l__global_pinMode
 */
declare function pinMode(pin: Pin, mode: any, automatic: boolean): void;

/**
 * Return the current mode of the given pin. See <code>pinMode</code> for more information on returned values.
 * @url http://www.espruino.com/Reference#l__global_getPinMode
 */
declare function getPinMode(pin: Pin): any;

/**
 * Clear the Watch that was created with setWatch. If no parameter is supplied, all watches will be removed.
 * To avoid accidentally deleting all Watches, if a parameter is supplied but is <code>undefined</code> then an Exception will be thrown.
 * @url http://www.espruino.com/Reference#l__global_clearWatch
 */
declare function clearWatch(id: any): void;

/**
 * When Espruino is busy, set the pin specified here high. Set this to undefined to disable the feature.
 * @url http://www.espruino.com/Reference#l__global_setBusyIndicator
 */
declare function setBusyIndicator(pin: Pin): void;

/**
 * When Espruino is asleep, set the pin specified here low (when it&#39;s awake, set it high). Set this to undefined to disable the feature.
 * Please see <a href="http://www.espruino.com/Power+Consumption">http://www.espruino.com/Power+Consumption</a> for more details on this.
 * @url http://www.espruino.com/Reference#l__global_setSleepIndicator
 */
declare function setSleepIndicator(pin: Pin): void;

/**
 * Set whether we can enter deep sleep mode, which reduces power consumption to around 100uA. This only works on STM32 Espruino Boards (nRF52 boards sleep automatically).
 * Please see <a href="http://www.espruino.com/Power+Consumption">http://www.espruino.com/Power+Consumption</a> for more details on this.
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
 * Espruino keeps its current state in RAM (even if the function code is stored in Flash). When you type <code>dump()</code> it dumps the current state of code in RAM plus the hardware state, then if there&#39;s code saved in flash it writes &quot;// Code saved with E.setBootCode&quot; and dumps that too.
 * <strong>Note:</strong> &#39;Internal&#39; functions are currently not handled correctly. You will need to recreate these in the <code>onInit</code> function.
 * @url http://www.espruino.com/Reference#l__global_dump
 */
declare function dump(): void;

/**
 * <p>Restart and load the program out of flash - this has an effect similar to
 * completely rebooting Espruino (power off/power on), but without actually
 * performing a full reset of the hardware.</p>
 * <p>This command only executes when the Interpreter returns to the Idle state - for
 * instance <code>a=1;load();a=2;</code> will still leave &#39;a&#39; as undefined (or what it was
 * set to in the saved program).</p>
 * <p>Espruino will resume from where it was when you last typed <code>save()</code>.
 * If you want code to be executed right after loading (for instance to initialise
 * devices connected to Espruino), add an <code>init</code> event handler to <code>E</code> with
 * <code>E.on(&#39;init&#39;, function() { ... your_code ... });</code>. This will then be automatically
 * executed by Espruino every time it starts.</p>
 * <p><strong>If you specify a filename in the argument then that file will be loaded
 * from Storage after reset</strong> in much the same way as calling <code>reset()</code> then <code>eval(require(&quot;Storage&quot;).read(filename))</code></p>
 * @url http://www.espruino.com/Reference#l__global_load
 */
declare function load(filename: any): void;

/**
 * <p>Save the state of the interpreter into flash (including the results of calling
 * <code>setWatch</code>, <code>setInterval</code>, <code>pinMode</code>, and any listeners). The state will then be loaded automatically
 *  every time Espruino powers on or is hard-reset. To see what will get saved you can call <code>dump()</code>.</p>
 * <p><strong>Note:</strong> If you set up intervals/etc in <code>onInit()</code> and you have already called <code>onInit</code>
 * before running <code>save()</code>, when Espruino resumes there will be two copies of your intervals -
 * the ones from before the save, and the ones from after - which may cause you problems.</p>
 * <p>For more information about this and other options for saving, please see
 * the <a href="https://www.espruino.com/Saving">Saving code on Espruino</a> page.</p>
 * <p>This command only executes when the Interpreter returns to the Idle state - for
 * instance <code>a=1;save();a=2;</code> will save &#39;a&#39; as 2.</p>
 * <p>When Espruino powers on, it will resume from where it was when you typed <code>save()</code>.
 * If you want code to be executed right after loading (for instance to initialise
 * devices connected to Espruino), add a function called <code>onInit</code>, or add a <code>init</code>
 * event handler to <code>E</code> with <code>E.on(&#39;init&#39;, function() { ... your_code ... });</code>.
 * This will then be automatically executed by Espruino every time it starts.</p>
 * <p>In order to stop the program saved with this command being loaded automatically,
 * check out <a href="https://www.espruino.com/Troubleshooting#espruino-stopped-working-after-i-typed-save-">the Troubleshooting guide</a></p>
 * @url http://www.espruino.com/Reference#l__global_save
 */
declare function save(): void;

/**
 * Reset the interpreter - clear program memory in RAM, and do not load a saved program from flash. This does NOT reset the underlying hardware (which allows you to reset the device without it disconnecting from USB).
 * This command only executes when the Interpreter returns to the Idle state - for instance <code>a=1;reset();a=2;</code> will still leave &#39;a&#39; as undefined.
 * The safest way to do a full reset is to hit the reset button.
 * <p>If <code>reset()</code> is called with no arguments, it will reset the board&#39;s state in
 * RAM but will not reset the state in flash. When next powered on (or when
 * <code>load()</code> is called) the board will load the previously saved code.</p>
 * <p>Calling <code>reset(true)</code> will cause <em>all saved code in flash memory to
 * be cleared as well</em>.</p>
 * @url http://www.espruino.com/Reference#l__global_reset
 */
declare function reset(clearFlash: boolean): void;

/**
 * Print the supplied string(s) to the console
 *  <strong>Note:</strong> If you&#39;re connected to a computer (not a wall adaptor) via USB but <strong>you are not running a terminal app</strong> then when you print data Espruino may pause execution and wait until the computer requests the data it is trying to print.
 * @url http://www.espruino.com/Reference#l__global_print
 */
declare function print(text: any): void;

/**
 * Fill the console with the contents of the given function, so you can edit it.
 * NOTE: This is a convenience function - it will not edit &#39;inner functions&#39;. For that, you must edit the &#39;outer function&#39; and re-execute it.
 * @url http://www.espruino.com/Reference#l__global_edit
 */
declare function edit(funcName: any): void;

/**
 * Should Espruino echo what you type back to you? true = yes (Default), false = no. When echo is off, the result of executing a command is not returned. Instead, you must use &#39;print&#39; to send output.
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
 * Change the Interval on a callback created with <code>setInterval</code>, for example:
 * <code>var id = setInterval(function () { print(&#39;foo&#39;); }, 1000); // every second</code>
 * <code>changeInterval(id, 1500); // now runs every 1.5 seconds</code>
 * <p>This takes effect immediately and resets the timeout, so in the example above,
 * regardless of when you call <code>changeInterval</code>, the next interval will occur 1500ms
 * after it.</p>
 * @url http://www.espruino.com/Reference#l__global_changeInterval
 */
declare function changeInterval(id: any, time: number): void;
