/* Note: This file was automatically generated. */

/**
 * This library allows you to write to Neopixel/WS281x/APA10x/SK6812 LED strips
 * These use a high speed single-wire protocol which needs platform-specific
 * implementation on some devices - hence this library to simplify things.
 * @url http://www.espruino.com/Reference#l_neopixel_undefined
 */
declare const neopixel: {
  /**
   * Write to a strip of NeoPixel/WS281x/APA104/APA106/SK6812-style LEDs
   * attached to the given pin.
   * <pre>`<span class="hljs-comment">// set just one pixel, red, green, blue</span>
   * <span class="hljs-built_in">require</span>("neopixel")<span class="hljs-selector-class">.write</span>(B15, [<span class="hljs-number">255</span>,<span class="hljs-number">0</span>,<span class="hljs-number">0</span>]);
   * `</pre>
   * <pre>`<span class="hljs-comment">// Produce an animated rainbow over 25 LEDs</span>
   * <span class="hljs-keyword">var</span> rgb = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8ClampedArray</span>(<span class="hljs-number">25</span>*<span class="hljs-number">3</span>);
   * <span class="hljs-keyword">var</span> pos = <span class="hljs-number">0</span>;
   * <span class="hljs-keyword">function</span> <span class="hljs-title function_">getPattern</span>(<span class="hljs-params"></span>) {
   *   pos++;
   *   <span class="hljs-keyword">for</span> (<span class="hljs-keyword">var</span> i=<span class="hljs-number">0</span>;i<rgb.<span class="hljs-property">length</span>;) {
   *     rgb[i++] = (<span class="hljs-number">1</span> + <span class="hljs-title class_">Math</span>.<span class="hljs-title function_">sin</span>((i+pos)*<span class="hljs-number">0.1324</span>)) * <span class="hljs-number">127</span>;
   *     rgb[i++] = (<span class="hljs-number">1</span> + <span class="hljs-title class_">Math</span>.<span class="hljs-title function_">sin</span>((i+pos)*<span class="hljs-number">0.1654</span>)) * <span class="hljs-number">127</span>;
   *     rgb[i++] = (<span class="hljs-number">1</span> + <span class="hljs-title class_">Math</span>.<span class="hljs-title function_">sin</span>((i+pos)*<span class="hljs-number">0.1</span>)) * <span class="hljs-number">127</span>;
   *   }
   *   <span class="hljs-keyword">return</span> rgb;
   * }
   * <span class="hljs-built_in">setInterval</span>(<span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
   *   <span class="hljs-built_in">require</span>(<span class="hljs-string">"neopixel"</span>).<span class="hljs-title function_">write</span>(<span class="hljs-variable constant_">B15</span>, <span class="hljs-title function_">getPattern</span>());
   * }, <span class="hljs-number">100</span>);
   * `</pre>
   * **Note:**
   *
   * - Different types of LED have the data in different orders - so don't
   * be surprised by RGB or BGR orderings!
   *
   * - Some LED strips (SK6812) actually take 4 bytes per LED (red, green, blue and white).
   * These are still supported but the array of data supplied must still be a multiple of 3
   * bytes long. Just round the size up - it won't cause any problems.
   *
   * - On some platforms like STM32, pins capable of hardware SPI MOSI
   * are required.
   *
   * - Espruino devices tend to have 3.3v IO, while WS2812/etc run
   * off of 5v. Many WS2812 will only register a logic '1' at 70%
   * of their input voltage - so if powering them off 5v you will not
   * be able to send them data reliably. You can work around this by
   * powering the LEDs off a lower voltage (for example 3.7v from a LiPo
   * battery), can put the output into the `af_opendrain` state and use
   * a pullup resistor to 5v on STM32 based boards (nRF52 are not 5v tolerant
   * so you can't do this), or can use a level shifter to shift the voltage up
   * into the 5v range.
   *
   *
   * @url http://www.espruino.com/Reference#l_neopixel_write
   */
  write: (pin: Pin, data: any) => void;

};

/**
 * This library provides TV out capability on the Espruino and Espruino Pico.
 * See the [Television](https://espruino.com//Television) page for more information.
 * @url http://www.espruino.com/Reference#l_tv_undefined
 */
declare const tv: {
  /**
   * This initialises the TV output. Options for PAL are as follows:
   * <pre>`<span class="hljs-built_in">var</span> g = <span class="hljs-keyword">require</span>(<span class="hljs-string">&#x27;tv&#x27;</span>).setup({ <span class="hljs-keyword">type</span> : <span class="hljs-string">"pal"</span>,
   *   video : A7, <span class="hljs-comment">// Pin - SPI MOSI Pin for Video output (MUST BE SPI1)</span>
   *   sync : A6, <span class="hljs-comment">// Pin - Timer pin to use for video sync</span>
   *   width : <span class="hljs-number">384</span>,
   *   height : <span class="hljs-number">270</span>, <span class="hljs-comment">// max 270</span>
   * });
   * `</pre>
   * and for VGA:
   * <pre>`<span class="hljs-built_in">var</span> g = <span class="hljs-keyword">require</span>(<span class="hljs-string">&#x27;tv&#x27;</span>).setup({ <span class="hljs-keyword">type</span> : <span class="hljs-string">"vga"</span>,
   *   video : A7, <span class="hljs-comment">// Pin - SPI MOSI Pin for Video output (MUST BE SPI1)</span>
   *   hsync : A6, <span class="hljs-comment">// Pin - Timer pin to use for video sync</span>
   *   vsync : A5, <span class="hljs-comment">// Pin - pin to use for video sync</span>
   *   width : <span class="hljs-number">220</span>,
   *   height : <span class="hljs-number">240</span>,
   *   repeat : <span class="hljs-number">2</span>, <span class="hljs-comment">// amount of times to repeat each line</span>
   * });
   * `</pre>
   * or
   * <pre>`<span class="hljs-built_in">var</span> g = <span class="hljs-keyword">require</span>(<span class="hljs-string">&#x27;tv&#x27;</span>).setup({ <span class="hljs-keyword">type</span> : <span class="hljs-string">"vga"</span>,
   *   video : A7, <span class="hljs-comment">// Pin - SPI MOSI Pin for Video output (MUST BE SPI1)</span>
   *   hsync : A6, <span class="hljs-comment">// Pin - Timer pin to use for video sync</span>
   *   vsync : A5, <span class="hljs-comment">// Pin - pin to use for video sync</span>
   *   width : <span class="hljs-number">220</span>,
   *   height : <span class="hljs-number">480</span>,
   *   repeat : <span class="hljs-number">1</span>, <span class="hljs-comment">// amount of times to repeat each line</span>
   * });
   * `</pre>
   * See the [Television](https://espruino.com//Television) page for more information.
   * @url http://www.espruino.com/Reference#l_tv_setup
   */
  setup: (options: any, width: number) => any;

};

/**
 * This class provides functionality to recognise gestures drawn
 * on a touchscreen. It is only built into Bangle.js 2.
 * Usage:
 * <pre>`var strokes = {
 *   stroke1 : <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Unistroke</span>.</span></span><span class="hljs-keyword">new</span>(<span class="hljs-keyword">new</span> <span class="hljs-constructor">Uint8Array([<span class="hljs-params">x1</span>, <span class="hljs-params">y1</span>, <span class="hljs-params">x2</span>, <span class="hljs-params">y2</span>, <span class="hljs-params">x3</span>, <span class="hljs-params">y3</span>, <span class="hljs-operator">...</span>])</span>),
 *   stroke2 : <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Unistroke</span>.</span></span><span class="hljs-keyword">new</span>(<span class="hljs-keyword">new</span> <span class="hljs-constructor">Uint8Array([<span class="hljs-params">x1</span>, <span class="hljs-params">y1</span>, <span class="hljs-params">x2</span>, <span class="hljs-params">y2</span>, <span class="hljs-params">x3</span>, <span class="hljs-params">y3</span>, <span class="hljs-operator">...</span>])</span>),
 *   stroke3 : <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Unistroke</span>.</span></span><span class="hljs-keyword">new</span>(<span class="hljs-keyword">new</span> <span class="hljs-constructor">Uint8Array([<span class="hljs-params">x1</span>, <span class="hljs-params">y1</span>, <span class="hljs-params">x2</span>, <span class="hljs-params">y2</span>, <span class="hljs-params">x3</span>, <span class="hljs-params">y3</span>, <span class="hljs-operator">...</span>])</span>)
 * };
 * var r = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Unistroke</span>.</span></span>recognise(strokes,<span class="hljs-keyword">new</span> <span class="hljs-constructor">Uint8Array([<span class="hljs-params">x1</span>, <span class="hljs-params">y1</span>, <span class="hljs-params">x2</span>, <span class="hljs-params">y2</span>, <span class="hljs-params">x3</span>, <span class="hljs-params">y3</span>, <span class="hljs-operator">...</span>])</span>)
 * print(r); <span class="hljs-comment">// stroke1/stroke2/stroke3</span>
 * `</pre>
 * @url http://www.espruino.com/Reference#Unistroke
 */
declare const Unistroke: {
  /**
   * Create a new Unistroke based on XY coordinates
   * @url http://www.espruino.com/Reference#l_Unistroke_new
   */
  new: (xy: any) => any;

  /**
   * Recognise based on an object of named strokes, and a list of XY coordinates
   * @url http://www.espruino.com/Reference#l_Unistroke_recognise
   */
  recognise: (strokes: any, xy: any) => any;

};

/**
 * The NRF class is for controlling functionality of the Nordic nRF51/nRF52 chips.
 * Most functionality is related to Bluetooth Low Energy, however there are also some functions related to NFC that apply to NRF52-based devices.
 * @url http://www.espruino.com/Reference#NRF
 */
declare const NRF: {
  /**
   * Return an object with information about the security
   * state of the current peripheral connection:
   * <pre>`{
   *   connected       // The <span class="hljs-keyword">connection</span> <span class="hljs-keyword">is</span> active (<span class="hljs-keyword">not</span> disconnected).
   *   <span class="hljs-keyword">encrypted</span>       // Communication <span class="hljs-keyword">on</span> this link <span class="hljs-keyword">is</span> <span class="hljs-keyword">encrypted</span>.
   *   mitm_protected  // The <span class="hljs-keyword">encrypted</span> communication <span class="hljs-keyword">is</span> <span class="hljs-keyword">also</span> protected against man-<span class="hljs-keyword">in</span>-the-middle attacks.
   *   bonded          // The peer <span class="hljs-keyword">is</span> bonded <span class="hljs-keyword">with</span> us
   *   connected_addr  // <span class="hljs-keyword">If</span> connected=<span class="hljs-keyword">true</span>, the MAC address <span class="hljs-keyword">of</span> the currently connected device
   * }
   * `</pre>
   * If there is no active connection, `{connected:false}` will be returned.
   * See `NRF.setSecurity` for information about negotiating a secure connection.
   * @url http://www.espruino.com/Reference#l_NRF_getSecurityStatus
   */
  getSecurityStatus: () => any;

  /**
   * Get this device's default Bluetooth MAC address.
   * For Puck.js, the last 5 characters of this (eg. `ee:ff`)
   * are used in the device's advertised Bluetooth name.
   * @url http://www.espruino.com/Reference#l_NRF_getAddress
   */
  getAddress: () => any;

  /**
   * Change the services and characteristics Espruino advertises.
   * If you want to **change** the value of a characteristic, you need
   * to use `NRF.updateServices()` instead
   * To expose some information on Characteristic `ABCD` on service `BCDE` you could do:
   * <pre>`<span class="hljs-string">NRF.setServices({</span>
   *   <span class="hljs-attr">0xBCDE :</span> {
   *     <span class="hljs-attr">0xABCD :</span> {
   *       <span class="hljs-attr">value :</span> <span class="hljs-string">"Hello"</span>,
   *       <span class="hljs-attr">readable :</span> <span class="hljs-literal">true</span>
   *     }
   *   }
   * <span class="hljs-string">});</span>
   * `</pre>
   * Or to allow the 3 LEDs to be controlled by writing numbers 0 to 7 to a
   * characteristic, you can do the following. `evt.data` is an ArrayBuffer.
   * <pre>`NRF<span class="hljs-selector-class">.setServices</span>({
   *   <span class="hljs-number">0</span>xBCDE : {
   *     <span class="hljs-number">0</span>xABCD : {
   *       writable : true,
   *       onWrite : <span class="hljs-built_in">function</span>(evt) {
   *         digitalWrite(<span class="hljs-selector-attr">[LED3,LED2,LED1]</span>, evt<span class="hljs-selector-class">.data</span><span class="hljs-selector-attr">[0]</span>);
   *       }
   *     }
   *   }
   * });
   * `</pre>
   * You can supply many different options:
   * <pre>`NRF.setServices({
   *   <span class="hljs-number">0</span>xBCDE : {
   *     <span class="hljs-number">0</span>xABCD : {
   *       value : <span class="hljs-string">"Hello"</span>, <span class="hljs-regexp">//</span> optional
   *       maxLen : <span class="hljs-number">5</span>, <span class="hljs-regexp">//</span> optional (otherwise is length of initial value)
   *       broadcast : false, <span class="hljs-regexp">//</span> optional, default is false
   *       readable : true,   <span class="hljs-regexp">//</span> optional, default is false
   *       writable : true,   <span class="hljs-regexp">//</span> optional, default is false
   *       notify : true,   <span class="hljs-regexp">//</span> optional, default is false
   *       indicate : true,   <span class="hljs-regexp">//</span> optional, default is false
   *       description: <span class="hljs-string">"My Characteristic"</span>,  <span class="hljs-regexp">//</span> optional, default is null,
   *       security: { <span class="hljs-regexp">//</span> optional - see NRF.setSecurity
   *         read: { <span class="hljs-regexp">//</span> optional
   *           encrypted: false, <span class="hljs-regexp">//</span> optional, default is false
   *           mitm: false, <span class="hljs-regexp">//</span> optional, default is false
   *           lesc: false, <span class="hljs-regexp">//</span> optional, default is false
   *           signed: false <span class="hljs-regexp">//</span> optional, default is false
   *         },
   *         write: { <span class="hljs-regexp">//</span> optional
   *           encrypted: true, <span class="hljs-regexp">//</span> optional, default is false
   *           mitm: false, <span class="hljs-regexp">//</span> optional, default is false
   *           lesc: false, <span class="hljs-regexp">//</span> optional, default is false
   *           signed: false <span class="hljs-regexp">//</span> optional, default is false
   *         }
   *       },
   *       onWrite : <span class="hljs-keyword">function</span>(evt) { <span class="hljs-regexp">//</span> optional
   *         console.log(<span class="hljs-string">"Got "</span>, evt.data); <span class="hljs-regexp">//</span> an ArrayBuffer
   *       },
   *       onWriteDesc : <span class="hljs-keyword">function</span>(evt) { <span class="hljs-regexp">//</span> optional - called when the <span class="hljs-string">&#x27;cccd&#x27;</span> descriptor is written
   *         <span class="hljs-regexp">//</span> <span class="hljs-keyword">for</span> example this is called when notifications are requested by the client:
   *         console.log(<span class="hljs-string">"Notifications enabled = "</span>, evt.data[<span class="hljs-number">0</span>]&<span class="hljs-number">1</span>);
   *       }
   *     }
   *     <span class="hljs-regexp">//</span> more characteristics allowed
   *   }
   *   <span class="hljs-regexp">//</span> more services allowed
   * });
   * `</pre>
   * **Note:** UUIDs can be integers between `0` and `0xFFFF`, strings of
   * the form `"ABCD"`, or strings of the form `"ABCDABCD-ABCD-ABCD-ABCD-ABCDABCDABCD"`
   * `options` can be of the form:
   * <pre>`NRF.setServices(<span class="hljs-literal">undefined</span>, {
   *   <span class="hljs-attr">hid</span> : <span class="hljs-keyword">new</span> Uint8Array(...), <span class="hljs-comment">// optional, default is undefined. Enable BLE HID support</span>
   *   uart : <span class="hljs-literal">true</span>, <span class="hljs-comment">// optional, default is true. Enable BLE UART support</span>
   *   advertise: [ <span class="hljs-string">&#x27;180D&#x27;</span> ] <span class="hljs-comment">// optional, list of service UUIDs to advertise</span>
   *   ancs : <span class="hljs-literal">true</span>, <span class="hljs-comment">// optional, Bangle.js-only, enable Apple ANCS support for notifications</span>
   *   ams : <span class="hljs-literal">true</span> <span class="hljs-comment">// optional, Bangle.js-only, enable Apple AMS support for media control</span>
   * });
   * `</pre>
   * To enable BLE HID, you must set `hid` to an array which is the BLE report
   * descriptor. The easiest way to do this is to use the `ble_hid_controls`
   * or `ble_hid_keyboard` modules.
   * **Note:** Just creating a service doesn't mean that the service will
   * be advertised. It will only be available after a device connects. To
   * advertise, specify the UUIDs you wish to advertise in the `advertise`
   * field of the second `options` argument. For example this will create
   * and advertise a heart rate service:
   * <pre>`<span class="hljs-string">NRF.setServices({</span>
   *   <span class="hljs-attr">0x180D:</span> { <span class="hljs-string">//</span> <span class="hljs-string">heart_rate</span>
   *     <span class="hljs-attr">0x2A37:</span> { <span class="hljs-string">//</span> <span class="hljs-string">heart_rate_measurement</span>
   *       <span class="hljs-attr">notify:</span> <span class="hljs-literal">true</span>,
   *       <span class="hljs-attr">value :</span> [<span class="hljs-number">0x06</span>, <span class="hljs-string">heartrate</span>],
   *     }
   *   }
   * <span class="hljs-string">},</span> { <span class="hljs-attr">advertise:</span> [ <span class="hljs-string">&#x27;180D&#x27;</span> ] }<span class="hljs-string">);</span>
   * `</pre>
   * You may specify 128 bit UUIDs to advertise, however you may get a `DATA_SIZE`
   * exception because there is insufficient space in the Bluetooth LE advertising
   * packet for the 128 bit UART UUID as well as the UUID you specified. In this
   * case you can add `uart:false` after the `advertise` element to disable the
   * UART, however you then be unable to connect to Puck.js's console via Bluetooth.
   * If you absolutely require two or more 128 bit UUIDs then you will have to
   * specify your own raw advertising data packets with `NRF.setAdvertising`
   * **Note:** The services on Espruino can only be modified when there is
   * no device connected to it as it requires a restart of the Bluetooth stack.
   * **iOS devices will 'cache' the list of services** so apps like
   * NRF Connect may incorrectly display the old services even after you
   * have modified them. To fix this, disable and re-enable Bluetooth on your
   * iOS device, or use an Android device to run NRF Connect.
   * **Note:** Not all combinations of security configuration values are valid, the valid combinations are: encrypted,
   * encrypted + mitm, lesc, signed, signed + mitm. See `NRF.setSecurity` for more information.
   * @url http://www.espruino.com/Reference#l_NRF_setServices
   */
  setServices: (data: any, options: any) => void;

  /**
   * Change the data that Espruino advertises.
   * Data can be of the form `{ UUID : data_as_byte_array }`. The UUID should be
   * a [Bluetooth Service ID](https://developer.bluetooth.org/gatt/services/Pages/ServicesHome.aspx).
   * For example to return battery level at 95%, do:
   * <pre>`NRF.setAdvertising({
   *   <span class="hljs-number">0</span>x180F : [<span class="hljs-number">95</span>] <span class="hljs-regexp">//</span> Service data <span class="hljs-number">0</span>x180F = <span class="hljs-number">95</span>
   * });
   * `</pre>
   * Or you could report the current temperature:
   * <pre>`setInterval(<span class="hljs-name">function</span>() {
   *   NRF.setAdvertising({
   *     <span class="hljs-number">0</span>x1809 : [Math.round(<span class="hljs-name">E</span>.getTemperature())]
   *   })<span class="hljs-comment">;</span>
   * }, <span class="hljs-number">30000</span>)<span class="hljs-comment">;</span>
   * `</pre>
   * If you specify a value for the object key, Service Data is advertised. However
   * if you specify `undefined`, the Service UUID is advertised:
   * <pre>`NRF.setAdvertising({
   *   <span class="hljs-number">0x180D</span> : <span class="hljs-literal">undefined</span> <span class="hljs-comment">// Advertise service UUID 0x180D (HRM)</span>
   * });
   * `</pre>
   * Service UUIDs can also be supplied in the second argument of
   * `NRF.setServices`, but those go in the scan response packet.
   * You can also supply the raw advertising data in an array. For example
   * to advertise as an Eddystone beacon:
   * <pre>`NRF.setAdvertising([<span class="hljs-number">0</span>x03,  <span class="hljs-regexp">//</span> Length of Service List
   *   <span class="hljs-number">0</span>x03,  <span class="hljs-regexp">//</span> Param: Service List
   *   <span class="hljs-number">0</span>xAA, <span class="hljs-number">0</span>xFE,  <span class="hljs-regexp">//</span> Eddystone ID
   *   <span class="hljs-number">0</span>x13,  <span class="hljs-regexp">//</span> Length of Service Data
   *   <span class="hljs-number">0</span>x16,  <span class="hljs-regexp">//</span> Service Data
   *   <span class="hljs-number">0</span>xAA, <span class="hljs-number">0</span>xFE, <span class="hljs-regexp">//</span> Eddystone ID
   *   <span class="hljs-number">0</span>x10,  <span class="hljs-regexp">//</span> Frame type: URL
   *   <span class="hljs-number">0</span>xF8, <span class="hljs-regexp">//</span> Power
   *   <span class="hljs-number">0</span>x03, <span class="hljs-regexp">//</span> https:<span class="hljs-regexp">//</span>
   *   <span class="hljs-string">&#x27;g&#x27;</span>,<span class="hljs-string">&#x27;o&#x27;</span>,<span class="hljs-string">&#x27;o&#x27;</span>,<span class="hljs-string">&#x27;.&#x27;</span>,<span class="hljs-string">&#x27;g&#x27;</span>,<span class="hljs-string">&#x27;l&#x27;</span>,<span class="hljs-string">&#x27;/&#x27;</span>,<span class="hljs-string">&#x27;B&#x27;</span>,<span class="hljs-string">&#x27;3&#x27;</span>,<span class="hljs-string">&#x27;J&#x27;</span>,<span class="hljs-string">&#x27;0&#x27;</span>,<span class="hljs-string">&#x27;O&#x27;</span>,<span class="hljs-string">&#x27;c&#x27;</span>],
   *     {interval:<span class="hljs-number">100</span>});
   * `</pre>
   * (However for Eddystone we'd advise that you use the [Espruino Eddystone library](https://espruino.com//Puck.js+Eddystone))
   * **Note:** When specifying data as an array, certain advertising options such as
   * `discoverable` and `showName` won't have any effect.
   * **Note:** The size of Bluetooth LE advertising packets is limited to 31 bytes. If
   * you want to advertise more data, consider using an array for `data` (See below), or
   * `NRF.setScanResponse`.
   * You can even specify an array of arrays or objects, in which case each advertising packet
   * will be used in turn - for instance to make your device advertise battery level and its name
   * as well as both Eddystone and iBeacon :
   * <pre>`NRF<span class="hljs-selector-class">.setAdvertising</span>([
   *   {<span class="hljs-number">0</span>x180F : [Puck.getBatteryPercentage()]}, <span class="hljs-comment">// normal advertising, with battery %</span>
   *   <span class="hljs-built_in">require</span>("ble_ibeacon")<span class="hljs-selector-class">.get</span>(...), <span class="hljs-comment">// iBeacon</span>
   *   <span class="hljs-built_in">require</span>("ble_eddystone")<span class="hljs-selector-class">.get</span>(...), <span class="hljs-comment">// eddystone</span>
   * ], {interval:<span class="hljs-number">300</span>});
   * `</pre>
   * `options` is an object, which can contain:
   * <pre>`{
   *   <span class="hljs-built_in">name</span>: <span class="hljs-string">"Hello"</span> <span class="hljs-comment">// The name of the device</span>
   *   showName: <span class="hljs-literal">true</span>/<span class="hljs-literal">false</span> <span class="hljs-comment">// include full name, or nothing</span>
   *   discoverable: <span class="hljs-literal">true</span>/<span class="hljs-literal">false</span> <span class="hljs-comment">// general discoverable, or limited - default is limited</span>
   *   connectable: <span class="hljs-literal">true</span>/<span class="hljs-literal">false</span> <span class="hljs-comment">// whether device is connectable - default is true</span>
   *   scannable : <span class="hljs-literal">true</span>/<span class="hljs-literal">false</span> <span class="hljs-comment">// whether device can be scanned for scan response packets - default is true</span>
   *   interval: <span class="hljs-number">600</span> <span class="hljs-comment">// Advertising interval in msec, between 20 and 10000 (default is 375ms)</span>
   *   manufacturer: <span class="hljs-number">0</span>x0590 <span class="hljs-comment">// IF sending manufacturer data, this is the manufacturer ID</span>
   *   manufacturerData: [...] <span class="hljs-comment">// IF sending manufacturer data, this is an array of data</span>
   * }
   * `</pre>
   * Setting `connectable` and `scannable` to false gives the lowest power consumption
   * as the BLE radio doesn't have to listen after sending advertising.
   * **NOTE:** Non-`connectable` advertising can't have an advertising interval less than 100ms
   * according to the BLE spec.
   * So for instance to set the name of Puck.js without advertising any
   * other data you can just use the command:
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>set<span class="hljs-constructor">Advertising({},{<span class="hljs-params">name</span>:<span class="hljs-string">"Hello"</span>})</span>;
   * `</pre>
   * You can also specify 'manufacturer data', which is another form of advertising data.
   * We've registered the Manufacturer ID 0x0590 (as Pur3 Ltd) for use with *Official
   * Espruino devices* - use it to advertise whatever data you'd like, but we'd recommend
   * using JSON.
   * For example by not advertising a device name you can send up to 24 bytes of JSON on
   * Espruino's manufacturer ID:
   * <pre>`<span class="hljs-title">var</span> <span class="hljs-class"><span class="hljs-keyword">data</span> = {<span class="hljs-title">a</span>:1,<span class="hljs-title">b</span>:2};</span>
   * <span class="hljs-type">NRF</span>.setAdvertising({},{
   *   showName:false,
   *   manufacturer:<span class="hljs-number">0x0590</span>,
   *   manufacturerData:<span class="hljs-type">JSON</span>.stringify(<span class="hljs-class"><span class="hljs-keyword">data</span>)</span>
   * });
   * `</pre>
   * If you're using [EspruinoHub](https://github.com/espruino/EspruinoHub) then it will
   * automatically decode this into the folling MQTT topics:
   *
   * - `/ble/advertise/ma:c_:_a:dd:re:ss/espruino` -> `{"a":10,"b":15}`
   * - `/ble/advertise/ma:c_:_a:dd:re:ss/a` -> `1`
   * - `/ble/advertise/ma:c_:_a:dd:re:ss/b` -> `2`
   *
   * Note that **you only have 24 characters available for JSON**, so try to use
   * the shortest field names possible and avoid floating point values that can
   * be very long when converted to a String.
   * @url http://www.espruino.com/Reference#l_NRF_setAdvertising
   */
  setAdvertising: (data: any, options: any) => void;

  /**
   * If a device is connected to Espruino, disconnect from it.
   * @url http://www.espruino.com/Reference#l_NRF_disconnect
   */
  disconnect: () => void;

  /**
   * Disable Bluetooth advertising and disconnect from any device that
   * connected to Puck.js as a peripheral (this won't affect any devices
   * that Puck.js initiated connections to).
   * This makes Puck.js undiscoverable, so it can't be connected to.
   * Use `NRF.wake()` to wake up and make Puck.js connectable again.
   * @url http://www.espruino.com/Reference#l_NRF_sleep
   */
  sleep: () => void;

  /**
   * Enable Bluetooth advertising (this is enabled by default), which
   * allows other devices to discover and connect to Puck.js.
   * Use `NRF.sleep()` to disable advertising.
   * @url http://www.espruino.com/Reference#l_NRF_wake
   */
  wake: () => void;

  /**
   * Restart the Bluetooth softdevice (if there is currently a BLE connection,
   * it will queue a restart to be done when the connection closes).
   * You shouldn't need to call this function in normal usage. However, Nordic's
   * BLE softdevice has some settings that cannot be reset. For example there
   * are only a certain number of unique UUIDs. Once these are all used the
   * only option is to restart the softdevice to clear them all out.
   * @url http://www.espruino.com/Reference#l_NRF_restart
   */
  restart: (callback: any) => void;

  /**
   * Set this device's default Bluetooth MAC address:
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>set<span class="hljs-constructor">Address(<span class="hljs-string">"ff:ee:dd:cc:bb:aa random"</span>)</span>;
   * `</pre>
   * Addresses take the form:
   *
   * - `"ff:ee:dd:cc:bb:aa"` or `"ff:ee:dd:cc:bb:aa public"` for a public address
   * - `"ff:ee:dd:cc:bb:aa random"` for a random static address (the default for Espruino)
   *
   * This may throw a `INVALID_BLE_ADDR` error if the upper two bits
   * of the address don't match the address type.
   * To change the address, Espruino must restart the softdevice. It will only do
   * so when it is disconnected from other devices.
   * @url http://www.espruino.com/Reference#l_NRF_setAddress
   */
  setAddress: (addr: any) => void;

  /**
   * Get the battery level in volts (the voltage that the NRF chip is running off of).
   * This is the battery level of the device itself - it has nothing to with any
   * device that might be connected.
   * @url http://www.espruino.com/Reference#l_NRF_getBattery
   */
  getBattery: () => number;

  /**
   * This is just like `NRF.setAdvertising`, except instead of advertising
   * the data, it returns the packet that would be advertised as an array.
   * @url http://www.espruino.com/Reference#l_NRF_getAdvertisingData
   */
  getAdvertisingData: (data: any, options: any) => any;

  /**
   * The raw scan response data should be supplied as an array. For example to return "Sample" for the device name:
   * <pre>`NRF.setScanResponse([<span class="hljs-number">0</span>x07,  <span class="hljs-regexp">//</span> Length of Data
   *   <span class="hljs-number">0</span>x09,  <span class="hljs-regexp">//</span> Param: Complete Local Name
   *   <span class="hljs-string">&#x27;S&#x27;</span>, <span class="hljs-string">&#x27;a&#x27;</span>, <span class="hljs-string">&#x27;m&#x27;</span>, <span class="hljs-string">&#x27;p&#x27;</span>, <span class="hljs-string">&#x27;l&#x27;</span>, <span class="hljs-string">&#x27;e&#x27;</span>]);
   * `</pre>
   * **Note:** `NRF.setServices(..., {advertise:[ ... ]})` writes advertised
   * services into the scan response - so you can't use both `advertise`
   * and `NRF.setServices` or one will overwrite the other.
   * @url http://www.espruino.com/Reference#l_NRF_setScanResponse
   */
  setScanResponse: (data: any) => void;

  /**
   * Update values for the services and characteristics Espruino advertises.
   * Only services and characteristics previously declared using `NRF.setServices` are affected.
   * To update the '0xABCD' characteristic in the '0xBCDE' service:
   * <pre>`NRF<span class="hljs-selector-class">.updateServices</span>({
   *   <span class="hljs-number">0</span>xBCDE : {
   *     <span class="hljs-number">0</span>xABCD : {
   *       value : <span class="hljs-string">"World"</span>
   *     }
   *   }
   * });
   * `</pre>
   * You can also use 128 bit UUIDs, for example `"b7920001-3c1b-4b40-869f-3c0db9be80c6"`.
   * To define a service and characteristic and then notify connected clients of a
   * change to it when a button is pressed:
   * <pre>`<span class="hljs-string">NRF.setServices({</span>
   *   <span class="hljs-attr">0xBCDE :</span> {
   *     <span class="hljs-attr">0xABCD :</span> {
   *       <span class="hljs-attr">value :</span> <span class="hljs-string">"Hello"</span>,
   *       <span class="hljs-attr">maxLen :</span> <span class="hljs-number">20</span>,
   *       <span class="hljs-attr">notify:</span> <span class="hljs-literal">true</span>
   *     }
   *   }
   * <span class="hljs-string">});</span>
   * <span class="hljs-string">setWatch(function()</span> {
   *   <span class="hljs-string">NRF.updateServices(</span>{
   *     <span class="hljs-attr">0xBCDE :</span> {
   *       <span class="hljs-attr">0xABCD :</span> {
   *         <span class="hljs-attr">value :</span> <span class="hljs-string">"World!"</span>,
   *         <span class="hljs-attr">notify:</span> <span class="hljs-literal">true</span>
   *       }
   *     }
   *   }<span class="hljs-string">);</span>
   * }<span class="hljs-string">,</span> <span class="hljs-string">BTN,</span> { <span class="hljs-string">repeat:true</span>, <span class="hljs-string">edge:"rising"</span>, <span class="hljs-attr">debounce:</span> <span class="hljs-number">50</span> }<span class="hljs-string">);</span>
   * `</pre>
   * This only works if the characteristic was created with `notify: true` using `NRF.setServices`,
   * otherwise the characteristic will be updated but no notification will be sent.
   * Also note that `maxLen` was specified. If it wasn't then the maximum length of
   * the characteristic would have been 5 - the length of `"Hello"`.
   * To indicate (i.e. notify with ACK) connected clients of a change to the '0xABCD' characteristic in the '0xBCDE' service:
   * <pre>`<span class="hljs-string">NRF.updateServices({</span>
   *   <span class="hljs-attr">0xBCDE :</span> {
   *     <span class="hljs-attr">0xABCD :</span> {
   *       <span class="hljs-attr">value :</span> <span class="hljs-string">"World"</span>,
   *       <span class="hljs-attr">indicate:</span> <span class="hljs-literal">true</span>
   *     }
   *   }
   * <span class="hljs-string">});</span>
   * `</pre>
   * This only works if the characteristic was created with `indicate: true` using `NRF.setServices`,
   * otherwise the characteristic will be updated but no notification will be sent.
   * **Note:** See `NRF.setServices` for more information
   * @url http://www.espruino.com/Reference#l_NRF_updateServices
   */
  updateServices: (data: any) => void;

  /**
   * Start/stop listening for BLE advertising packets within range. Returns a
   * `BluetoothDevice` for each advertsing packet. **By default this is not an active scan, so
   * Scan Response advertising data is not included (see below)**
   * <pre>`<span class="hljs-comment">// Start scanning</span>
   * packets=<span class="hljs-number">10</span>;
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>set<span class="hljs-constructor">Scan(<span class="hljs-params">function</span>(<span class="hljs-params">d</span>)</span> {
   *   packets--;
   *   <span class="hljs-keyword">if</span> (packets<=<span class="hljs-number">0</span>)
   *     <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>set<span class="hljs-constructor">Scan()</span>; <span class="hljs-comment">// stop scanning</span>
   *   <span class="hljs-keyword">else</span>
   *     console.log(d); <span class="hljs-comment">// print packet info</span>
   * });
   * `</pre>
   * Each `BluetoothDevice` will look a bit like:
   * <pre>`BluetoothDevice {
   *   <span class="hljs-string">"id"</span>: <span class="hljs-string">"aa:bb:cc:dd:ee:ff"</span>, <span class="hljs-comment">// address</span>
   *   <span class="hljs-string">"rssi"</span>: -<span class="hljs-number">89</span>,               <span class="hljs-comment">// signal strength</span>
   *   <span class="hljs-string">"services"</span>: <span class="hljs-selector-attr">[ <span class="hljs-string">"128bit-uuid"</span>, ... ]</span>,     <span class="hljs-comment">// zero or more service UUIDs</span>
   *   <span class="hljs-string">"data"</span>: new <span class="hljs-built_in">Uint8Array</span>(<span class="hljs-selector-attr">[ ... ]</span>)<span class="hljs-selector-class">.buffer</span>, <span class="hljs-comment">// ArrayBuffer of returned data</span>
   *   <span class="hljs-string">"serviceData"</span> : { <span class="hljs-string">"0123"</span> : <span class="hljs-selector-attr">[ 1 ]</span> }, <span class="hljs-comment">// if service data is in &#x27;data&#x27;, it&#x27;s extracted here</span>
   *   <span class="hljs-string">"manufacturer"</span> : <span class="hljs-number">0</span>x1234, <span class="hljs-comment">// if manufacturer data is in &#x27;data&#x27;, the 16 bit manufacturer ID is extracted here</span>
   *   <span class="hljs-string">"manufacturerData"</span> : <span class="hljs-selector-attr">[...]</span>, <span class="hljs-comment">// if manufacturer data is in &#x27;data&#x27;, the data is extracted here</span>
   *   <span class="hljs-string">"name"</span>: <span class="hljs-string">"DeviceName"</span>       <span class="hljs-comment">// the advertised device name</span>
   *  }
   * `</pre>
   * You can also supply a set of filters (as described in `NRF.requestDevice`) as a second argument, which will
   * allow you to filter the devices you get a callback for. This helps
   * to cut down on the time spent processing JavaScript code in areas with
   * a lot of Bluetooth advertisements. For example to find only devices
   * with the manufacturer data `0x0590` (Espruino's ID) you could do:
   * <pre>`NRF.setScan(<span class="hljs-keyword">function</span>(<span class="hljs-params">d</span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(d.manufacturerData);
   * }, { <span class="hljs-attr">filters</span>: [{ <span class="hljs-attr">manufacturerData</span>:{<span class="hljs-number">0x0590</span>:{}} }] });
   * `</pre>
   * You can also specify `active:true` in the second argument to perform
   * active scanning (this requests scan response packets) from any
   * devices it finds.
   * **Note:** Using a filter in `setScan` filters each advertising packet individually. As
   * a result, if you filter based on a service UUID and a device advertises with multiple packets
   * (or a scan response when `active:true`) only the packets matching the filter are returned. To
   * aggregate multiple packets you can use `NRF.findDevices`.
   * **Note:** BLE advertising packets can arrive quickly - faster than you'll
   * be able to print them to the console. It's best only to print a few, or
   * to use a function like `NRF.findDevices(..)` which will collate a list
   * of available devices.
   * **Note:** Using setScan turns the radio's receive mode on constantly. This
   * can draw a *lot* of power (12mA or so), so you should use it sparingly or
   * you can run your battery down quickly.
   * @url http://www.espruino.com/Reference#l_NRF_setScan
   */
  setScan: (callback: any, options: any) => void;

  /**
   * This function can be used to quickly filter through Bluetooth devices.
   * For instance if you wish to scan for multiple different types of device at the same time
   * then you could use `NRF.findDevices` with all the filters you're interested in. When scanning
   * is finished you can then use `NRF.filterDevices` to pick out just the devices of interest.
   * <pre>`<span class="hljs-comment">// the two types of device we&#x27;re interested in</span>
   * var filter1 = <span class="hljs-literal">[{<span class="hljs-identifier">serviceData</span>:{"<span class="hljs-identifier">fe95</span>":{}}}]</span>;
   * var filter2 = <span class="hljs-literal">[{<span class="hljs-identifier">namePrefix</span>:"P<span class="hljs-identifier">ixl</span>.<span class="hljs-identifier">js</span>"}]</span>;
   * <span class="hljs-comment">// the following filter will return both types of device</span>
   * var allFilters = filter1.concat(filter2);
   * <span class="hljs-comment">// now scan for both types of device, and filter them out afterwards</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>find<span class="hljs-constructor">Devices(<span class="hljs-params">function</span>(<span class="hljs-params">devices</span>)</span> {
   *   var devices1 = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>filter<span class="hljs-constructor">Devices(<span class="hljs-params">devices</span>, <span class="hljs-params">filter1</span>)</span>;
   *   var devices2 = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>filter<span class="hljs-constructor">Devices(<span class="hljs-params">devices</span>, <span class="hljs-params">filter2</span>)</span>;
   *   <span class="hljs-comment">// ...</span>
   * }, {filters : allFilters});
   * `</pre>
   * @url http://www.espruino.com/Reference#l_NRF_filterDevices
   */
  filterDevices: (devices: any, filters: any) => any;

  /**
   * Utility function to return a list of BLE devices detected in range. Behind the scenes,
   * this uses `NRF.setScan(...)` and collates the results.
   * <pre>`NRF.findDevices(<span class="hljs-keyword">function</span>(<span class="hljs-params">devices</span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(devices);
   * }, <span class="hljs-number">1000</span>);
   * `</pre>
   * prints something like:
   * <pre>`[
   *   BluetoothDevice {
   *     <span class="hljs-string">"id"</span>: <span class="hljs-string">"e7:e0:57:ad:36:a2 random"</span>,
   *     <span class="hljs-string">"rssi"</span>: <span class="hljs-number">-45</span>,
   *     <span class="hljs-string">"services"</span>: [ <span class="hljs-string">"4567"</span> ],
   *     <span class="hljs-string">"serviceData"</span> : { <span class="hljs-string">"0123"</span> : [ <span class="hljs-number">1</span> ] },
   *     <span class="hljs-string">"manufacturerData"</span> : [<span class="hljs-name"><span class="hljs-built_in">...</span></span>],
   *     <span class="hljs-string">"data"</span>: new ArrayBuffer([ ... ]),
   *     <span class="hljs-string">"name"</span>: <span class="hljs-string">"Puck.js 36a2"</span>
   *    },
   *   BluetoothDevice {
   *     <span class="hljs-string">"id"</span>: <span class="hljs-string">"c0:52:3f:50:42:c9 random"</span>,
   *     <span class="hljs-string">"rssi"</span>: <span class="hljs-number">-65</span>,
   *     <span class="hljs-string">"data"</span>: new ArrayBuffer([ ... ]),
   *     <span class="hljs-string">"name"</span>: <span class="hljs-string">"Puck.js 8f57"</span>
   *    }
   *  ]
   * `</pre>
   * For more information on the structure returned, see `NRF.setScan`.
   * If you want to scan only for specific devices you can replace the timeout with an object
   * of the form `{filters: ..., timeout : ..., active: bool}` using the filters
   * described in `NRF.requestDevice`. For example to search for devices with Espruino's `manufacturerData`:
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>find<span class="hljs-constructor">Devices(<span class="hljs-params">function</span>(<span class="hljs-params">devices</span>)</span> {<span class="hljs-operator">
   *   ...
   * </span>}, {timeout : <span class="hljs-number">2000</span>, filters : <span class="hljs-literal">[{ <span class="hljs-identifier">manufacturerData</span>:{<span class="hljs-number">0x0590</span>:{}} }]</span> });
   * `</pre>
   * You could then use [`BluetoothDevice.gatt.connect(...)`](https://espruino.com//Reference#l_BluetoothRemoteGATTServer_connect) on
   * the device returned to make a connection.
   * You can also use [`NRF.connect(...)`](https://espruino.com//Reference#l_NRF_connect) on just the `id` string returned, which
   * may be useful if you always want to connect to a specific device.
   * **Note:** Using findDevices turns the radio's receive mode on for 2000ms (or however long you specify). This
   * can draw a *lot* of power (12mA or so), so you should use it sparingly or you can run your battery down quickly.
   * **Note:** The 'data' field contains the data of *the last packet received*. There may have been more
   * packets. To get data for each packet individually use `NRF.setScan` instead.
   * @url http://www.espruino.com/Reference#l_NRF_findDevices
   */
  findDevices: (callback: any, options: any) => void;

  /**
   * Start/stop listening for RSSI values on the currently active connection
   * (where This device is a peripheral and is being connected to by a 'central' device)
   * <pre>`<span class="hljs-comment">// Start scanning</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>set<span class="hljs-constructor">RSSIHandler(<span class="hljs-params">function</span>(<span class="hljs-params">rssi</span>)</span> {
   *   console.log(rssi); <span class="hljs-comment">// prints -85 (or similar)</span>
   * });
   * <span class="hljs-comment">// Stop Scanning</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>set<span class="hljs-constructor">RSSIHandler()</span>;
   * `</pre>
   * RSSI is the 'Received Signal Strength Indication' in dBm
   * @url http://www.espruino.com/Reference#l_NRF_setRSSIHandler
   */
  setRSSIHandler: (callback: any) => void;

  /**
   * Set the BLE radio transmit power. The default TX power is 0 dBm, and
   * @url http://www.espruino.com/Reference#l_NRF_setTxPower
   */
  setTxPower: (power: number) => void;

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
  setLowPowerConnection: (lowPower: boolean) => void;

  /**
   * Enables NFC and starts advertising the given URL. For example:
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>nfc<span class="hljs-constructor">URL(<span class="hljs-string">"http://espruino.com"</span>)</span>;
   * `</pre>
   * @url http://www.espruino.com/Reference#l_NRF_nfcURL
   */
  nfcURL: (url: any) => void;

  /**
   * Enables NFC and with an out of band 16 byte pairing key.
   * For example the following will enable out of band pairing on BLE
   * such that the device will pair when you tap the phone against it:
   * <pre>`var bleKey = <span class="hljs-literal">[<span class="hljs-number">0xAA</span>, <span class="hljs-number">0xBB</span>, <span class="hljs-number">0xCC</span>, <span class="hljs-number">0xDD</span>, <span class="hljs-number">0xEE</span>, <span class="hljs-number">0xFF</span>, <span class="hljs-number">0x99</span>, <span class="hljs-number">0x88</span>, <span class="hljs-number">0x77</span>, <span class="hljs-number">0x66</span>, <span class="hljs-number">0x55</span>, <span class="hljs-number">0x44</span>, <span class="hljs-number">0x33</span>, <span class="hljs-number">0x22</span>, <span class="hljs-number">0x11</span>, <span class="hljs-number">0x00</span>]</span>;
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>on(&#x27;security&#x27;,s=>print(<span class="hljs-string">"security"</span>,<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">JSON</span>.</span></span>stringify(s)));
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>nfc<span class="hljs-constructor">Pair(<span class="hljs-params">bleKey</span>)</span>;
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>set<span class="hljs-constructor">Security({<span class="hljs-params">oob</span>:<span class="hljs-params">bleKey</span>, <span class="hljs-params">mitm</span>:<span class="hljs-params">true</span>})</span>;
   * `</pre>
   * @url http://www.espruino.com/Reference#l_NRF_nfcPair
   */
  nfcPair: (key: any) => void;

  /**
   * Enables NFC with a record that will launch the given android app.
   * For example:
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>nfc<span class="hljs-constructor">AndroidApp(<span class="hljs-string">"no.nordicsemi.android.nrftoolbox"</span>)</span>
   * `</pre>
   * @url http://www.espruino.com/Reference#l_NRF_nfcAndroidApp
   */
  nfcAndroidApp: (app: any) => void;

  /**
   * Enables NFC and starts advertising with Raw data. For example:
   * <pre>`NRF.nfcRaw(<span class="hljs-keyword">new</span> <span class="hljs-built_in">Uint8Array</span>([<span class="hljs-number">193</span>, <span class="hljs-number">1</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">13</span>, <span class="hljs-number">85</span>, <span class="hljs-number">3</span>, <span class="hljs-number">101</span>, <span class="hljs-number">115</span>, <span class="hljs-number">112</span>, <span class="hljs-number">114</span>, <span class="hljs-number">117</span>, <span class="hljs-number">105</span>, <span class="hljs-number">110</span>, <span class="hljs-number">111</span>, <span class="hljs-number">46</span>, <span class="hljs-number">99</span>, <span class="hljs-number">111</span>, <span class="hljs-number">109</span>]));
   * <span class="hljs-regexp">//</span> same <span class="hljs-keyword">as</span> NRF.nfcURL(<span class="hljs-string">"http://espruino.com"</span>);
   * `</pre>
   * @url http://www.espruino.com/Reference#l_NRF_nfcRaw
   */
  nfcRaw: (payload: any) => void;

  /**
   * **Advanced NFC Functionality.** If you just want to advertise a URL, use `NRF.nfcURL` instead.
   * Enables NFC and starts advertising. `NFCrx` events will be
   * fired when data is received.
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>nfc<span class="hljs-constructor">Start()</span>;
   * `</pre>
   * @url http://www.espruino.com/Reference#l_NRF_nfcStart
   */
  nfcStart: (payload: any) => any;

  /**
   * **Advanced NFC Functionality.** If you just want to advertise a URL, use `NRF.nfcURL` instead.
   * Disables NFC.
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>nfc<span class="hljs-constructor">Stop()</span>;
   * `</pre>
   * @url http://www.espruino.com/Reference#l_NRF_nfcStop
   */
  nfcStop: () => void;

  /**
   * **Advanced NFC Functionality.** If you just want to advertise a URL, use `NRF.nfcURL` instead.
   * Acknowledges the last frame and optionally transmits a response.
   * If payload is an array, then a array.length byte nfc frame is sent.
   * If payload is a int, then a 4bit ACK/NACK is sent.
   * **Note:** `nfcSend` should always be called after an `NFCrx` event.
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>nfc<span class="hljs-constructor">Send(<span class="hljs-params">new</span> Uint8Array([0x01, 0x02, <span class="hljs-operator">...</span>])</span>);
   * <span class="hljs-comment">// or</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>nfc<span class="hljs-constructor">Send(0x0A)</span>;
   * <span class="hljs-comment">// or</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>nfc<span class="hljs-constructor">Send()</span>;
   * `</pre>
   * @url http://www.espruino.com/Reference#l_NRF_nfcSend
   */
  nfcSend: (payload: any) => void;

  /**
   * Send a USB HID report. HID must first be enabled with `NRF.setServices({}, {hid: hid_report})`
   * @url http://www.espruino.com/Reference#l_NRF_sendHIDReport
   */
  sendHIDReport: (data: any, callback: any) => void;

  /**
   * Check if Apple Notification Center Service (ANCS) is currently active on the BLE connection
   * @url http://www.espruino.com/Reference#l_NRF_ancsIsActive
   */
  ancsIsActive: () => boolean;

  /**
   * Send an ANCS action for a specific Notification UID. Corresponds to posaction/negaction in the 'ANCS' event that was received
   * @url http://www.espruino.com/Reference#l_NRF_ancsAction
   */
  ancsAction: (uid: number, positive: boolean) => void;

  /**
   * Get ANCS info for a notification, eg:
   * @url http://www.espruino.com/Reference#l_NRF_ancsGetNotificationInfo
   */
  ancsGetNotificationInfo: (uid: number) => Promise<any>;

  /**
   * Get ANCS info for an app (add id is available via `ancsGetNotificationInfo`)
   * Promise returns:
   * <pre>`{
   *   <span class="hljs-string">"uid"</span> : <span class="hljs-type">int</span>,
   *   <span class="hljs-string">"appId"</span> : <span class="hljs-type">string</span>,
   *   <span class="hljs-string">"title"</span> : <span class="hljs-type">string</span>,
   *   <span class="hljs-string">"subtitle"</span> : <span class="hljs-type">string</span>,
   *   <span class="hljs-string">"message"</span> : <span class="hljs-type">string</span>,
   *   <span class="hljs-string">"messageSize"</span> : <span class="hljs-type">string</span>,
   *   <span class="hljs-string">"date"</span> : <span class="hljs-type">string</span>,
   *   <span class="hljs-string">"posAction"</span> : <span class="hljs-type">string</span>,
   *   <span class="hljs-string">"negAction"</span> : <span class="hljs-type">string</span>,
   *   <span class="hljs-string">"name"</span> : <span class="hljs-type">string</span>,
   * }
   * `</pre>
   * @url http://www.espruino.com/Reference#l_NRF_ancsGetAppInfo
   */
  ancsGetAppInfo: (id: any) => Promise<any>;

  /**
   * Check if Apple Media Service (AMS) is currently active on the BLE connection
   * @url http://www.espruino.com/Reference#l_NRF_amsIsActive
   */
  amsIsActive: () => boolean;

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
  amsGetPlayerInfo: (id: any) => Promise<any>;

  /**
   * Get Apple Media Service (AMS) info for the currently-playing track
   * @url http://www.espruino.com/Reference#l_NRF_amsGetTrackInfo
   */
  amsGetTrackInfo: (id: any) => Promise<any>;

  /**
   * Send an AMS command to an Apple Media Service device to control music playback
   * Command is one of play, pause, playpause, next, prev, volup, voldown, repeat, shuffle, skipforward, skipback, like, dislike, bookmark
   * @url http://www.espruino.com/Reference#l_NRF_amsCommand
   */
  amsCommand: (id: any) => void;

  /**
   * Search for available devices matching the given filters. Since we have no UI here,
   * Espruino will pick the FIRST device it finds, or it'll call `catch`.
   * `options` can have the following fields:
   *
   * - `filters` - a list of filters that a device must match before it is returned (see below)
   * - `timeout` - the maximum time to scan for in milliseconds (scanning stops when a match
   * is found. eg. `NRF.requestDevice({ timeout:2000, filters: [ ... ] })`
   * - `active` - whether to perform active scanning (requesting 'scan response' packets from any
   * devices that are found). eg. `NRF.requestDevice({ active:true, filters: [ ... ] })`
   *
   * **NOTE:** `timeout` and `active` are not part of the Web Bluetooth standard.
   * The following filter types are implemented:
   *
   * - `services` - list of services as strings (all of which must match). 128 bit services must be in the form '01230123-0123-0123-0123-012301230123'
   * - `name` - exact device name
   * - `namePrefix` - starting characters of device name
   * - `id` - exact device address (`id:"e9:53:86:09:89:99 random"`) (this is Espruino-specific, and is not part of the Web Bluetooth spec)
   * - `serviceData` - an object containing service characteristics which must all match (`serviceData:{"1809":{}}`). Matching of actual service data is not supported yet.
   * - `manufacturerData` - an object containing manufacturer UUIDs which must all match (`manufacturerData:{0x0590:{}}`). Matching of actual manufacturer data is not supported yet.
   *
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>request<span class="hljs-constructor">Device({ <span class="hljs-params">filters</span>: [{ <span class="hljs-params">namePrefix</span>: &#x27;Puck.<span class="hljs-params">js</span>&#x27; }] })</span>.<span class="hljs-keyword">then</span>(<span class="hljs-keyword">function</span>(device) {<span class="hljs-operator"> ... </span>});
   * <span class="hljs-comment">// or</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>request<span class="hljs-constructor">Device({ <span class="hljs-params">filters</span>: [{ <span class="hljs-params">services</span>: [&#x27;1823&#x27;] }] })</span>.<span class="hljs-keyword">then</span>(<span class="hljs-keyword">function</span>(device) {<span class="hljs-operator"> ... </span>});
   * <span class="hljs-comment">// or</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>request<span class="hljs-constructor">Device({ <span class="hljs-params">filters</span>: [{ <span class="hljs-params">manufacturerData</span>:{0x0590:{}} }] })</span>.<span class="hljs-keyword">then</span>(<span class="hljs-keyword">function</span>(device) {<span class="hljs-operator"> ... </span>});
   * `</pre>
   * As a full example, to send data to another Puck.js to turn an LED on:
   * <pre>`<span class="hljs-keyword">var</span> gatt;
   * NRF.requestDevice({ <span class="hljs-attr">filters</span>: [{ <span class="hljs-attr">namePrefix</span>: <span class="hljs-string">&#x27;Puck.js&#x27;</span> }] }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">device</span>) {
   *   <span class="hljs-keyword">return</span> device.gatt.connect();
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">g</span>) {
   *   gatt = g;
   *   <span class="hljs-keyword">return</span> gatt.getPrimaryService(<span class="hljs-string">"6e400001-b5a3-f393-e0a9-e50e24dcca9e"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">service</span>) {
   *   <span class="hljs-keyword">return</span> service.getCharacteristic(<span class="hljs-string">"6e400002-b5a3-f393-e0a9-e50e24dcca9e"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">characteristic</span>) {
   *   <span class="hljs-keyword">return</span> characteristic.writeValue(<span class="hljs-string">"LED1.set()\n"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
   *   gatt.disconnect();
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Done!"</span>);
   * });
   * `</pre>
   * Or slightly more concisely, using ES6 arrow functions:
   * <pre>`<span class="hljs-keyword">var</span> gatt;
   * NRF.requestDevice({ <span class="hljs-attr">filters</span>: [{ <span class="hljs-attr">namePrefix</span>: <span class="hljs-string">&#x27;Puck.js&#x27;</span> }]}).then(
   *   <span class="hljs-function"><span class="hljs-params">device</span> =></span> device.gatt.connect()).then(
   *   <span class="hljs-function"><span class="hljs-params">g</span> =></span> (gatt=g).getPrimaryService(<span class="hljs-string">"6e400001-b5a3-f393-e0a9-e50e24dcca9e"</span>)).then(
   *   <span class="hljs-function"><span class="hljs-params">service</span> =></span> service.getCharacteristic(<span class="hljs-string">"6e400002-b5a3-f393-e0a9-e50e24dcca9e"</span>)).then(
   *   <span class="hljs-function"><span class="hljs-params">characteristic</span> =></span> characteristic.writeValue(<span class="hljs-string">"LED1.reset()\n"</span>)).then(
   *   <span class="hljs-function"><span class="hljs-params">()</span> =></span> { gatt.disconnect(); <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Done!"</span>); } );
   * `</pre>
   * Note that you have to keep track of the `gatt` variable so that you can
   * disconnect the Bluetooth connection when you're done.
   * **Note:** Using a filter in `NRF.requestDevice` filters each advertising packet individually. As
   * soon as a matching advertisement is received,  `NRF.requestDevice` resolves the promise and stops
   * scanning. This means that if you filter based on a service UUID and a device advertises with multiple packets
   * (or a scan response when `active:true`) only the packet matching the filter is returned - you may not
   * get the device's name is that was in a separate packet. To aggregate multiple packets you can use `NRF.findDevices`.
   * @url http://www.espruino.com/Reference#l_NRF_requestDevice
   */
  requestDevice: (options: any) => Promise<any>;

  /**
   * Connect to a BLE device by MAC address. Returns a promise,
   * the argument of which is the `BluetoothRemoteGATTServer` connection.
   * <pre>`<span class="hljs-variable">NRF</span>.<span class="hljs-property">connect</span>(<span class="hljs-string">"aa:bb:cc:dd:ee"</span>).<span class="hljs-property">then</span>(<span class="hljs-title function_">function</span>(<span class="hljs-params">server</span>) {
   *   <span class="hljs-comment">// ...</span>
   * });
   * `</pre>
   * This has the same effect as calling `BluetoothDevice.gatt.connect` on a `BluetoothDevice` requested
   * using `NRF.requestDevice`. It just allows you to specify the address directly (without having to scan).
   * You can use it as follows - this would connect to another Puck device and turn its LED on:
   * <pre>`<span class="hljs-keyword">var</span> gatt;
   * NRF.connect(<span class="hljs-string">"aa:bb:cc:dd:ee random"</span>).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">g</span>) {
   *   gatt = g;
   *   <span class="hljs-keyword">return</span> gatt.getPrimaryService(<span class="hljs-string">"6e400001-b5a3-f393-e0a9-e50e24dcca9e"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">service</span>) {
   *   <span class="hljs-keyword">return</span> service.getCharacteristic(<span class="hljs-string">"6e400002-b5a3-f393-e0a9-e50e24dcca9e"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">characteristic</span>) {
   *   <span class="hljs-keyword">return</span> characteristic.writeValue(<span class="hljs-string">"LED1.set()\n"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
   *   gatt.disconnect();
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Done!"</span>);
   * });
   * `</pre>
   * **Note:** Espruino Bluetooth devices use a type of BLE address known as 'random static',
   * which is different to a 'public' address. To connect to an Espruino device you'll need
   * to use an address string of the form `"aa:bb:cc:dd:ee random"` rather than just
   * `"aa:bb:cc:dd:ee"`. If you scan for devices with `NRF.findDevices`/`NRF.setScan` then
   * addresses are already reported in the correct format.
   * @url http://www.espruino.com/Reference#l_NRF_connect
   */
  connect: (mac: any, options: any) => Promise<any>;

  /**
   * If set to true, whenever a device bonds it will be added to the
   * whitelist.
   * When set to false, the whitelist is cleared and newly bonded
   * devices will not be added to the whitelist.
   * **Note:** This is remembered between `reset()`s but isn't
   * remembered after power-on (you'll have to add it to `onInit()`.
   * @url http://www.espruino.com/Reference#l_NRF_setWhitelist
   */
  setWhitelist: (whitelisting: boolean) => void;

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
  setConnectionInterval: (interval: any) => void;

  /**
   * Sets the security options used when connecting/pairing. This applies to both central
   * *and* peripheral mode.
   * <pre>`NRF.setSecurity({
   *   display : <span class="hljs-type">bool</span>  // <span class="hljs-keyword">default</span> <span class="hljs-keyword">false</span>, can this device display a passkey
   *                   // - sent via the `BluetoothDevice.passkey` event
   *   keyboard : <span class="hljs-type">bool</span> // <span class="hljs-keyword">default</span> <span class="hljs-keyword">false</span>, can this device enter a passkey
   *                   // - request sent via the `BluetoothDevice.passkeyRequest` event
   *   bond : <span class="hljs-type">bool</span> // <span class="hljs-keyword">default</span> <span class="hljs-keyword">true</span>, <span class="hljs-keyword">Perform</span> bonding
   *   mitm : <span class="hljs-type">bool</span> // <span class="hljs-keyword">default</span> <span class="hljs-keyword">false</span>, Man <span class="hljs-keyword">In</span> The Middle protection
   *   lesc : <span class="hljs-type">bool</span> // <span class="hljs-keyword">default</span> <span class="hljs-keyword">false</span>, LE Secure Connections
   *   passkey : // <span class="hljs-keyword">default</span> "", <span class="hljs-keyword">or</span> a <span class="hljs-number">6</span> digit passkey <span class="hljs-keyword">to</span> use
   *   oob : [<span class="hljs-number">0.</span><span class="hljs-number">.15</span>] // <span class="hljs-keyword">if</span> specified, <span class="hljs-keyword">Out</span> <span class="hljs-keyword">Of</span> Band pairing <span class="hljs-keyword">is</span> enabled <span class="hljs-keyword">and</span>
   *                 // the <span class="hljs-number">16</span> byte pairing code supplied here <span class="hljs-keyword">is</span> used
   *   encryptUart : <span class="hljs-type">bool</span> // <span class="hljs-keyword">default</span> <span class="hljs-keyword">false</span> (unless oob <span class="hljs-keyword">or</span> passkey specified)
   *                      // This sets the BLE UART service such that it
   *                      // <span class="hljs-keyword">is</span> <span class="hljs-keyword">encrypted</span> <span class="hljs-keyword">and</span> can <span class="hljs-keyword">only</span> be used <span class="hljs-keyword">from</span> a bonded <span class="hljs-keyword">connection</span>
   * });
   * `</pre>
   * **NOTE:** Some combinations of arguments will cause an error. For example
   * supplying a passkey without `display:1` is not allowed. If `display:1` is set
   * you do not require a physical display, the user just needs to know
   * the passkey you supplied.
   * For instance, to require pairing and to specify a passkey, use:
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>set<span class="hljs-constructor">Security({<span class="hljs-params">passkey</span>:<span class="hljs-string">"123456"</span>, <span class="hljs-params">mitm</span>:1, <span class="hljs-params">display</span>:1})</span>;
   * `</pre>
   * However, while most devices will request a passkey for pairing at
   * this point it is still possible for a device to connect without
   * requiring one (eg. using the 'NRF Connect' app).
   * To force a passkey you need to protect each characteristic
   * you define with `NRF.setSecurity`. For instance the following
   * code will *require* that the passkey `123456` is entered
   * before the characteristic `9d020002-bf5f-1d1a-b52a-fe52091d5b12`
   * can be read.
   * <pre>`NRF.setSecurity({passkey:"123456", mitm:<span class="hljs-number">1</span>, display:<span class="hljs-number">1</span>});
   * NRF.setServices({
   *   "9d020001-bf5f-1d1a-b52a-fe52091d5b12" : {
   *     "9d020002-bf5f-1d1a-b52a-fe52091d5b12" : {
   *       // readable <span class="hljs-keyword">always</span>
   *       <span class="hljs-keyword">value</span> : "Not Secret"
   *     },
   *     "9d020003-bf5f-1d1a-b52a-fe52091d5b12" : {
   *       // readable <span class="hljs-keyword">only</span> once bonded
   *       <span class="hljs-keyword">value</span> : "Secret",
   *       readable : <span class="hljs-keyword">true</span>,
   *       <span class="hljs-keyword">security</span>: {
   *         <span class="hljs-keyword">read</span>: {
   *           mitm: <span class="hljs-keyword">true</span>,
   *           <span class="hljs-keyword">encrypted</span>: <span class="hljs-keyword">true</span>
   *         }
   *       }
   *     },
   *     "9d020004-bf5f-1d1a-b52a-fe52091d5b12" : {
   *       // readable <span class="hljs-keyword">always</span>
   *       // writable <span class="hljs-keyword">only</span> once bonded
   *       <span class="hljs-keyword">value</span> : "Readable",
   *       readable : <span class="hljs-keyword">true</span>,
   *       writable : <span class="hljs-keyword">true</span>,
   *       onWrite : <span class="hljs-keyword">function</span>(evt) {
   *         console.log("Wrote ", evt.data);
   *       },
   *       <span class="hljs-keyword">security</span>: {
   *         <span class="hljs-keyword">write</span>: {
   *           mitm: <span class="hljs-keyword">true</span>,
   *           <span class="hljs-keyword">encrypted</span>: <span class="hljs-keyword">true</span>
   *         }
   *       }
   *     }
   *   }
   * });
   * `</pre>
   * **Note:** If `passkey` or `oob` is specified, the Nordic UART service (if enabled)
   * will automatically be set to require encryption, but otherwise it is open.
   * @url http://www.espruino.com/Reference#l_NRF_setSecurity
   */
  setSecurity: (options: any) => void;

  /**
   * @url http://www.espruino.com/Reference#l_NRF_startBonding
   */
  startBonding: (forceRepair: boolean) => any;

};

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
declare const WioLTE: {
  /**
   * Set the WIO's LED
   * @url http://www.espruino.com/Reference#l_WioLTE_LED
   */
  LED: (red: number, green: number, blue: number) => void;

  /**
   * Set the power of Grove connectors, except for `D38` and `D39` which are always on.
   * @url http://www.espruino.com/Reference#l_WioLTE_setGrovePower
   */
  setGrovePower: (onoff: boolean) => void;

  /**
   * Turn power to the WIO's LED on or off.
   * Turning the LED on won't immediately display a color - that must be done with `WioLTE.LED(r,g,b)`
   * @url http://www.espruino.com/Reference#l_WioLTE_setLEDPower
   */
  setLEDPower: (onoff: boolean) => void;

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_D38
   */
  D38: any

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_D20
   */
  D20: any

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_A6
   */
  A6: any

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_I2C
   */
  I2C: any

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_UART
   */
  UART: any

  /**
   * @url http://www.espruino.com/Reference#l_WioLTE_A4
   */
  A4: any

};

/**
 * This class provides Graphics operations that can be applied to a surface.
 * Use Graphics.createXXX to create a graphics object that renders in the way you want. See [the Graphics page](https://www.espruino.com/Graphics) for more information.
 * **Note:** On boards that contain an LCD, there is a built-in 'LCD' object of type Graphics. For instance to draw a line you'd type: `LCD.drawLine(0,0,100,100)`
 * @url http://www.espruino.com/Reference#Graphics
 */
declare const Graphics: {
  /**
   * On devices like Pixl.js or HYSTM boards that contain a built-in display
   * this will return an instance of the graphics class that can be used to
   * access that display.
   * Internally, this is stored as a member called `gfx` inside the 'hiddenRoot'.
   * @url http://www.espruino.com/Reference#l_Graphics_getInstance
   */
  getInstance: () => any;

  /**
   * Create a Graphics object that renders to an Array Buffer. This will have a field called 'buffer' that can get used to get at the buffer itself
   * @url http://www.espruino.com/Reference#l_Graphics_createArrayBuffer
   */
  createArrayBuffer: (width: number, height: number, bpp: number, options: any) => Graphics;

  /**
   * Create a Graphics object that renders by calling a JavaScript callback function to draw pixels
   * @url http://www.espruino.com/Reference#l_Graphics_createCallback
   */
  createCallback: (width: number, height: number, bpp: number, callback: any) => Graphics;

  /**
   * Create a Graphics object that renders to SDL window (Linux-based devices only)
   * @url http://www.espruino.com/Reference#l_Graphics_createSDL
   */
  createSDL: (width: number, height: number, bpp: number) => Graphics;

  /**
   * Create a simple Black and White image for use with `Graphics.drawImage`.
   * Use as follows:
   * <pre>`var img = Graphics.createImage(`
   * XXXXXXXXX
   * <span class="hljs-keyword">X</span>       <span class="hljs-keyword">X</span>
   * <span class="hljs-keyword">X</span>   <span class="hljs-keyword">X</span>   <span class="hljs-keyword">X</span>
   * <span class="hljs-keyword">X</span>   <span class="hljs-keyword">X</span>   <span class="hljs-keyword">X</span>
   * <span class="hljs-keyword">X</span>       <span class="hljs-keyword">X</span>
   * XXXXXXXXX
   * `);
   * g.drawImage(img, x,y);
   * `</pre>
   * If the characters at the beginning and end of the string are newlines, they
   * will be ignored. Spaces are treated as `0`, and any other character is a `1`
   * @url http://www.espruino.com/Reference#l_Graphics_createImage
   */
  createImage: (str: any) => any;

};

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
   * On Graphics instances with an offscreen buffer, this
   * is an `ArrayBuffer` that provides access to the underlying
   * pixel data.
   * <pre>`<span class="hljs-attribute">g</span>=Graphics.createArrayBuffer(<span class="hljs-number">8</span>,<span class="hljs-number">8</span>,<span class="hljs-number">8</span>)
   * <span class="hljs-attribute">g</span>.drawLine(<span class="hljs-number">0</span>,<span class="hljs-number">0</span>,<span class="hljs-number">7</span>,<span class="hljs-number">7</span>)
   * <span class="hljs-attribute">print</span>(new Uint8Array(g.buffer))
   * <span class="hljs-attribute">new</span> Uint8Array([
   * <span class="hljs-attribute">255</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>,
   * <span class="hljs-attribute">0</span>, <span class="hljs-number">255</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>,
   * <span class="hljs-attribute">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">255</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>,
   * <span class="hljs-attribute">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">255</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>,
   * <span class="hljs-attribute">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">255</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>,
   * <span class="hljs-attribute">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">255</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>,
   * <span class="hljs-attribute">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">255</span>, <span class="hljs-number">0</span>,
   * <span class="hljs-attribute">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">255</span>])
   * `</pre>
   * @url http://www.espruino.com/Reference#l_Graphics_buffer
   */
  buffer: any

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
   * Work out the color value to be used in the current bit depth based on the arguments.
   * This is used internally by setColor and setBgColor
   * <pre>`<span class="hljs-comment">// 1 bit</span>
   * g.<span class="hljs-keyword">to</span><span class="hljs-constructor">Color(1,1,1)</span> => <span class="hljs-number">1</span>
   * <span class="hljs-comment">// 16 bit</span>
   * g.<span class="hljs-keyword">to</span><span class="hljs-constructor">Color(1,0,0)</span> => <span class="hljs-number">0xF800</span>
   * `</pre>
   * @url http://www.espruino.com/Reference#l_Graphics_toColor
   */
  toColor: (r: any, g: any, b: any) => number;

  /**
   * Blend between two colors, and return the result.
   * <pre>`<span class="hljs-comment">// dark yellow - halfway between red and green</span>
   * var col = g.blend<span class="hljs-constructor">Color(<span class="hljs-string">"#f00"</span>,<span class="hljs-string">"#0f0"</span>, 0.5)</span>;
   * <span class="hljs-comment">// Get a color 25% brighter than the theme&#x27;s background colour</span>
   * var col = g.blend<span class="hljs-constructor">Color(<span class="hljs-params">g</span>.<span class="hljs-params">theme</span>.<span class="hljs-params">fg</span>,<span class="hljs-params">g</span>.<span class="hljs-params">theme</span>.<span class="hljs-params">bg</span>, 0.75)</span>;
   * <span class="hljs-comment">// then...</span>
   * g.set<span class="hljs-constructor">Color(<span class="hljs-params">col</span>)</span>.fill<span class="hljs-constructor">Rect(10,10,100,100)</span>;
   * `</pre>
   * @url http://www.espruino.com/Reference#l_Graphics_blendColor
   */
  blendColor: (col_a: any, col_b: any, amt: any) => number;

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
   * Wrap a string to the given pixel width using the current font, and return the
   * lines as an array.
   * To render within the screen's width you can do:
   * <pre>`g.draw<span class="hljs-constructor">String(<span class="hljs-params">g</span>.<span class="hljs-params">wrapString</span>(<span class="hljs-params">text</span>, <span class="hljs-params">g</span>.<span class="hljs-params">getWidth</span>()</span>).join(<span class="hljs-string">"\n"</span>)),
   * `</pre>
   * @url http://www.espruino.com/Reference#l_Graphics_wrapString
   */
  wrapString: (str: any, maxWidth: number) => any;

  /**
   * Draw a string of text in the current font.
   * <pre>`<span class="hljs-attribute">g</span>.drawString(<span class="hljs-string">"Hello World"</span>, <span class="hljs-number">10</span>, <span class="hljs-number">10</span>);
   * `</pre>
   * Images may also be embedded inside strings (eg to render Emoji or characters not in the current font).
   * To do this, just add `0` then the image string ([about Images](http://www.espruino.com/Graphics#images-bitmaps))
   * For example:
   * <pre>`g.drawString(<span class="hljs-string">"Hi \0\7\5\1\x82 D\x17\xC0"</span>);
   * <span class="hljs-regexp">//</span> draws:
   * <span class="hljs-regexp">//</span> <span class="hljs-comment"># #  #      #     #</span>
   * <span class="hljs-regexp">//</span> <span class="hljs-comment"># #            #</span>
   * <span class="hljs-regexp">//</span> <span class="hljs-comment">### ##         #</span>
   * <span class="hljs-regexp">//</span> <span class="hljs-comment"># #  #      #     #</span>
   * <span class="hljs-regexp">//</span> <span class="hljs-comment"># # ###      #####</span>
   * `</pre>
   * @url http://www.espruino.com/Reference#l_Graphics_drawString
   */
  drawString: (str: any, x: number, y: number, solid: boolean) => Graphics;

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
   * Draw a filled polygon in the current foreground color.
   * <pre>`<span class="hljs-attribute">g</span>.fillPoly([
   *   <span class="hljs-attribute">16</span>, <span class="hljs-number">0</span>,
   *   <span class="hljs-attribute">31</span>, <span class="hljs-number">31</span>,
   *   <span class="hljs-attribute">26</span>, <span class="hljs-number">31</span>,
   *   <span class="hljs-attribute">16</span>, <span class="hljs-number">12</span>,
   *   <span class="hljs-attribute">6</span>, <span class="hljs-number">28</span>,
   *   <span class="hljs-attribute">0</span>, <span class="hljs-number">27</span> ]);
   * `</pre>
   * This fills from the top left hand side of the polygon (low X, low Y)
   * *down to but not including* the bottom right. When placed together polygons
   * will align perfectly without overdraw - but this will not fill the
   * same pixels as `drawPoly` (drawing a line around the edge of the polygon).
   * **Note:** there is a limit of 64 points (128 XY elements) for polygons
   * @url http://www.espruino.com/Reference#l_Graphics_fillPoly
   */
  fillPoly: (poly: any) => Graphics;

  /**
   * Draw a filled polygon in the current foreground color.
   * <pre>`<span class="hljs-attribute">g</span>.fillPolyAA([
   *   <span class="hljs-attribute">16</span>, <span class="hljs-number">0</span>,
   *   <span class="hljs-attribute">31</span>, <span class="hljs-number">31</span>,
   *   <span class="hljs-attribute">26</span>, <span class="hljs-number">31</span>,
   *   <span class="hljs-attribute">16</span>, <span class="hljs-number">12</span>,
   *   <span class="hljs-attribute">6</span>, <span class="hljs-number">28</span>,
   *   <span class="hljs-attribute">0</span>, <span class="hljs-number">27</span> ]);
   * `</pre>
   * This fills from the top left hand side of the polygon (low X, low Y)
   * *down to but not including* the bottom right. When placed together polygons
   * will align perfectly without overdraw - but this will not fill the
   * same pixels as `drawPoly` (drawing a line around the edge of the polygon).
   * **Note:** there is a limit of 64 points (128 XY elements) for polygons
   * @url http://www.espruino.com/Reference#l_Graphics_fillPolyAA
   */
  fillPolyAA: (poly: any) => Graphics;

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
   * Image can be:
   *
   * - An object with the following fields `{ width : int, height : int, bpp : optional int, buffer : ArrayBuffer/String, transparent: optional int, palette : optional Uint16Array(2/4/16) }`. bpp = bits per pixel (default is 1), transparent (if defined) is the colour that will be treated as transparent, and palette is a color palette that each pixel will be looked up in first
   * - A String where the the first few bytes are: `width,height,bpp,[transparent,]image_bytes...`. If a transparent colour is specified the top bit of `bpp` should be set.
   * - An ArrayBuffer Graphics object (if `bpp<8`, `msb:true` must be set) - this is disabled on devices without much flash memory available
   *
   * Draw an image at the specified position.
   *
   * - If the image is 1 bit, the graphics foreground/background colours will be used.
   * - If `img.palette` is a Uint16Array or 2/4/16 elements, color data will be looked from the supplied palette
   * - On Bangle.js, 2 bit images blend from background(0) to foreground(1) colours
   * - On Bangle.js, 4 bit images use the Apple Mac 16 color palette
   * - On Bangle.js, 8 bit images use the Web Safe 216 color palette
   * - Otherwise color data will be copied as-is. Bitmaps are rendered MSB-first
   *
   * If `options` is supplied, `drawImage` will allow images to be rendered at any scale or angle. If `options.rotate` is set it will
   * center images at `x,y`. `options` must be an object of the form:
   * <pre>`{
   *   <span class="hljs-keyword">rotate</span> : <span class="hljs-keyword">float</span>, <span class="hljs-comment">// the amount to rotate the image in radians (default 0)</span>
   *   <span class="hljs-keyword">scale</span> : <span class="hljs-keyword">float</span>, <span class="hljs-comment">// the amount to scale the image up (default 1)</span>
   *   frame : <span class="hljs-keyword">int</span>    <span class="hljs-comment">// if specified and the image has frames of data</span>
   *                  <span class="hljs-comment">//  after the initial frame, draw one of those frames from the image</span>
   * }
   * `</pre>
   * For example:
   * <pre>`<span class="hljs-comment">// In the top left of the screen</span>
   * g.draw<span class="hljs-constructor">Image(<span class="hljs-params">img</span>,0,0)</span>;
   * <span class="hljs-comment">// In the top left of the screen, twice as big</span>
   * g.draw<span class="hljs-constructor">Image(<span class="hljs-params">img</span>,0,0,{<span class="hljs-params">scale</span>:2})</span>;
   * <span class="hljs-comment">// In the center of the screen, twice as big, 45 degrees</span>
   * g.draw<span class="hljs-constructor">Image(<span class="hljs-params">img</span>, <span class="hljs-params">g</span>.<span class="hljs-params">getWidth</span>()</span>/<span class="hljs-number">2</span>, g.get<span class="hljs-constructor">Height()</span>/<span class="hljs-number">2</span>,
   *             {scale:<span class="hljs-number">2</span>, rotate:Math.PI/<span class="hljs-number">4</span>});
   * `</pre>
   * @url http://www.espruino.com/Reference#l_Graphics_drawImage
   */
  drawImage: (image: any, x: number, y: number, options: any) => Graphics;

  /**
   * Draws multiple images *at once* - which avoids flicker on unbuffered systems
   * like Bangle.js. Maximum layer count right now is 4.
   * <pre>`layers = [ {
   *   {x : <span class="hljs-type">int</span>, <span class="hljs-comment">// x start position</span>
   *    y : <span class="hljs-type">int</span>, <span class="hljs-comment">// y start position</span>
   *    image : string/object,
   *    scale : <span class="hljs-type">float</span>, <span class="hljs-comment">// scale factor, default 1</span>
   *    rotate : <span class="hljs-type">float</span>, <span class="hljs-comment">// angle in radians</span>
   *    center : <span class="hljs-type">bool</span> <span class="hljs-comment">// center on x,y? default is top left</span>
   *    repeat : should <span class="hljs-keyword">this</span> image be <span class="hljs-built_in">repeated</span> (tiled?)
   *    nobounds : <span class="hljs-type">bool</span> <span class="hljs-comment">// if true, the bounds of the image are not used to work out the default area to draw</span>
   *   }
   * ]
   * options = { <span class="hljs-comment">// the area to render. Defaults to rendering just enough to cover what&#x27;s requested</span>
   *  x,y,
   *  width,height
   * }
   * `</pre>
   * @url http://www.espruino.com/Reference#l_Graphics_drawImages
   */
  drawImages: (layers: any, options: any) => Graphics;

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
   * Blit one area of the screen (x1,y1 w,h) to another (x2,y2 w,h)
   * <pre>`g.<span class="hljs-title function_ invoke__">blit</span>({
   *   <span class="hljs-attr">x1</span>:<span class="hljs-number">0</span>, <span class="hljs-attr">y1</span>:<span class="hljs-number">0</span>,
   *   <span class="hljs-attr">w</span>:<span class="hljs-number">32</span>, <span class="hljs-attr">h</span>:<span class="hljs-number">32</span>,
   *   <span class="hljs-attr">x2</span>:<span class="hljs-number">100</span>, <span class="hljs-attr">y2</span>:<span class="hljs-number">100</span>,
   *   setModified : <span class="hljs-literal">true</span> // should we set the modified area?
   * });
   * `</pre>
   * Note: This uses repeated pixel reads and writes, so will not work on platforms that
   * don't support pixel reads.
   * @url http://www.espruino.com/Reference#l_Graphics_blit
   */
  blit: (options: any) => Graphics;

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
   * Transformation can be:
   *
   * - An object of the form
   *
   * <pre>`{
   *   x: <span class="hljs-keyword">float</span>, <span class="hljs-comment">// x offset (default 0)</span>
   *   y: <span class="hljs-keyword">float</span>, <span class="hljs-comment">// y offset (default 0)</span>
   *   <span class="hljs-keyword">scale</span>: <span class="hljs-keyword">float</span>, <span class="hljs-comment">// scale factor (default 1)</span>
   *   <span class="hljs-keyword">rotate</span>: <span class="hljs-keyword">float</span>, <span class="hljs-comment">// angle in radians (default 0)</span>
   * }
   * `</pre>
   *
   * - A six-element array of the form `[a,b,c,d,e,f]`, which represents the 2D transformation matrix
   *
   * <pre>`<span class="hljs-attribute">a</span> c e
   * <span class="hljs-attribute">b</span> d f
   * <span class="hljs-attribute">0</span> <span class="hljs-number">0</span> <span class="hljs-number">1</span>
   * `</pre>
   *  Apply a transformation to an array of vertices.
   * @url http://www.espruino.com/Reference#l_Graphics_transformVertices
   */
  transformVertices: (verts: any, transformation: any) => any;

  /**
   * Returns an object of the form:
   * <pre>`{
   *   fg : <span class="hljs-number">0</span>xFFFF,  <span class="hljs-regexp">//</span> foreground colour
   *   bg : <span class="hljs-number">0</span>,       <span class="hljs-regexp">//</span> background colour
   *   fg2 : <span class="hljs-number">0</span>xFFFF,  <span class="hljs-regexp">//</span> accented foreground colour
   *   bg2 : <span class="hljs-number">0</span>x0007,  <span class="hljs-regexp">//</span> accented background colour
   *   fgH : <span class="hljs-number">0</span>xFFFF,  <span class="hljs-regexp">//</span> highlighted foreground colour
   *   bgH : <span class="hljs-number">0</span>x02F7,  <span class="hljs-regexp">//</span> highlighted background colour
   *   dark : true,  <span class="hljs-regexp">//</span> Is background dark (eg. foreground should be a light colour)
   * }
   * `</pre>
   * These values can then be passed to `g.setColor`/`g.setBgColor` for example `g.setColor(g.theme.fg2)`. When the Graphics
   * instance is reset, the background color is automatically set to `g.theme.bg` and foreground is set to `g.theme.fg`.
   * On Bangle.js these values can be changed by writing updated values to `theme` in `settings.js` and reloading the app - or they can
   * be changed temporarily by calling `Graphics.setTheme`
   * @url http://www.espruino.com/Reference#l_Graphics_theme
   */
  theme: any

  /**
   * Set the global colour scheme. On Bangle.js, this is reloaded from `settings.json` for each new app loaded.
   * See `Graphics.theme` for the fields that can be provided. For instance you can change
   * the background to red using:
   * <pre>`g.set<span class="hljs-constructor">Theme({<span class="hljs-params">bg</span>:<span class="hljs-string">"#f00"</span>})</span>;
   * `</pre>
   * @url http://www.espruino.com/Reference#l_Graphics_setTheme
   */
  setTheme: (theme: any) => Graphics;

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
declare const Badge: {
  /**
   * Capacitive sense - the higher the capacitance, the higher the number returned.
   * Supply a corner number between 1 and 6, and an integer value will be returned that is proportional to the capacitance
   * @url http://www.espruino.com/Reference#l_Badge_capSense
   */
  capSense: (corner: number) => number;

  /**
   * Return an approximate battery percentage remaining based on
   * a normal CR2032 battery (2.8 - 2.2v)
   * @url http://www.espruino.com/Reference#l_Badge_getBatteryPercentage
   */
  getBatteryPercentage: () => number;

  /**
   * Set the LCD's contrast
   * @url http://www.espruino.com/Reference#l_Badge_setContrast
   */
  setContrast: (c: number) => void;

};

/**
 * @url http://www.espruino.com/Reference#l_tensorflow_undefined
 */
declare const tensorflow: {
  /**
   * @url http://www.espruino.com/Reference#l_tensorflow_create
   */
  create: (arenaSize: number, model: any) => TFMicroInterpreter;

};

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
declare const Espruinocrypto: {
  /**
   * Class containing AES encryption/decryption
   * @url http://www.espruino.com/Reference#l_crypto_AES
   */
  AES: any

  /**
   * Performs a SHA1 hash and returns the result as a 20 byte ArrayBuffer.
   * **Note:** On some boards (currently only Espruino Original) there
   * isn't space for a fully unrolled SHA1 implementation so a slower
   * all-JS implementation is used instead.
   * @url http://www.espruino.com/Reference#l_crypto_SHA1
   */
  SHA1: (message: any) => ArrayBuffer;

  /**
   * Performs a SHA224 hash and returns the result as a 28 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA224
   */
  SHA224: (message: any) => ArrayBuffer;

  /**
   * Performs a SHA256 hash and returns the result as a 32 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA256
   */
  SHA256: (message: any) => ArrayBuffer;

  /**
   * Performs a SHA384 hash and returns the result as a 48 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA384
   */
  SHA384: (message: any) => ArrayBuffer;

  /**
   * Performs a SHA512 hash and returns the result as a 64 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA512
   */
  SHA512: (message: any) => ArrayBuffer;

  /**
   * Password-Based Key Derivation Function 2 algorithm, using SHA512
   * @url http://www.espruino.com/Reference#l_crypto_PBKDF2
   */
  PBKDF2: (passphrase: any, salt: any, options: any) => ArrayBuffer;

};

/**
 * Class containing AES encryption/decryption
 * **Note:** This library is currently only included in builds for boards where there is space. For other boards there is `crypto.js` which implements SHA1 in JS.
 * @url http://www.espruino.com/Reference#AES
 */
declare const AES: {
  /**
   * @url http://www.espruino.com/Reference#l_AES_encrypt
   */
  encrypt: (passphrase: any, key: any, options: any) => ArrayBuffer;

  /**
   * @url http://www.espruino.com/Reference#l_AES_decrypt
   */
  decrypt: (passphrase: any, key: any, options: any) => ArrayBuffer;

};

/**
 * Class containing utility functions for the [Bangle.js Smart Watch](http://www.espruino.com/Bangle.js)
 * @url http://www.espruino.com/Reference#Bangle
 */
declare const Bangle: {
  /**
   * This function can be used to turn Bangle.js's LCD off or on.
   * This function resets the Bangle's 'activity timer' (like
   * pressing a button or the screen would) so after a time period
   * of inactivity set by `Bangle.setLCDTimeout` the screen will
   * turn off.
   * If you want to keep the screen on permanently (until apps
   * are changed) you can do:
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Bangle</span>.</span></span>set<span class="hljs-constructor">LCDTimeout(0)</span>; <span class="hljs-comment">// turn off the timeout</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Bangle</span>.</span></span>set<span class="hljs-constructor">LCDPower(1)</span>; <span class="hljs-comment">// keep screen on</span>
   * `</pre>
   * **When on full, the LCD draws roughly 40mA.** You can adjust
   * When brightness using `Bange.setLCDBrightness`.
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDPower
   */
  setLCDPower: (isOn: boolean) => void;

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
  setLCDBrightness: (brightness: number) => void;

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
  setLCDMode: (mode: any) => void;

  /**
   * The current LCD mode.
   * See `Bangle.setLCDMode` for examples.
   * @url http://www.espruino.com/Reference#l_Bangle_getLCDMode
   */
  getLCDMode: () => any;

  /**
   * This can be used to move the displayed memory area up or down temporarily. It's
   * used for displaying notifications while keeping the main display contents
   * intact.
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDOffset
   */
  setLCDOffset: (y: number) => void;

  /**
   * This function can be used to turn Bangle.js's LCD power saving on or off.
   * With power saving off, the display will remain in the state you set it with `Bangle.setLCDPower`.
   * With power saving on, the display will turn on if a button is pressed, the watch is turned face up, or the screen is updated (see `Bangle.setOptions` for configuration). It'll turn off automatically after the given timeout.
   * **Note:** This function also sets the Backlight and Lock timeout (the time at which the touchscreen/buttons start being ignored). To set both separately, use `Bangle.setOptions`
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDTimeout
   */
  setLCDTimeout: (isOn: number) => void;

  /**
   * Set how often the watch should poll for new acceleration/gyro data and kick the Watchdog timer. It isn't
   * recommended that you make this interval much larger than 1000ms, but values up to 4000ms are allowed.
   * Calling this will set `Bangle.setOptions({powerSave: false})` - disabling the dynamic adjustment of
   * poll interval to save battery power when Bangle.js is stationary.
   * @url http://www.espruino.com/Reference#l_Bangle_setPollInterval
   */
  setPollInterval: (interval: number) => void;

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
   *  must be either 80ms or 800ms. default = `true`. Setting `powerSave:false` will disable this automatic power saving, but will **not** change
   *  the poll interval from its current value. If you desire a specific interval (eg the default 80ms) you must set it manually with `Bangle.setPollInterval(80)`
   *  after setting `powerSave:false`.
   * - `lockTimeout` how many milliseconds before the screen locks
   * - `lcdPowerTimeout` how many milliseconds before the screen turns off
   * - `backlightTimeout` how many milliseconds before the screen's backlight turns off
   * - `hrmPollInterval` set the requested poll interval (in milliseconds) for the heart rate monitor. On Bangle.js 2 only 10,20,40,80,160,200 ms are supported, and polling rate may not be exact. The algorithm's filtering is tuned for 20-40ms poll intervals, so higher/lower intervals may effect the reliability of the BPM reading.
   * - `seaLevelPressure` (Bangle.js 2) Normally 1013.25 millibars - this is used for calculating altitude with the pressure sensor
   *
   * Where accelerations are used they are in internal units, where `8192 = 1g`
   * @url http://www.espruino.com/Reference#l_Bangle_setOptions
   */
  setOptions: (options: any) => void;

  /**
   * Return the current state of options as set by `Bangle.setOptions`
   * @url http://www.espruino.com/Reference#l_Bangle_getOptions
   */
  getOptions: () => any;

  /**
   * Also see the `Bangle.lcdPower` event
   * @url http://www.espruino.com/Reference#l_Bangle_isLCDOn
   */
  isLCDOn: () => boolean;

  /**
   * This function can be used to lock or unlock Bangle.js
   * (eg whether buttons and touchscreen work or not)
   * @url http://www.espruino.com/Reference#l_Bangle_setLocked
   */
  setLocked: (isLocked: boolean) => void;

  /**
   * Also see the `Bangle.lock` event
   * @url http://www.espruino.com/Reference#l_Bangle_isLocked
   */
  isLocked: () => boolean;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_isCharging
   */
  isCharging: () => boolean;

  /**
   * Writes a command directly to the ST7735 LCD controller
   * @url http://www.espruino.com/Reference#l_Bangle_lcdWr
   */
  lcdWr: (cmd: number, data: any) => void;

  /**
   * Set the power to the Heart rate monitor
   * When on, data is output via the `HRM` event on `Bangle`:
   * <pre>`Bangle.setHRMPower(<span class="hljs-literal">true</span>, <span class="hljs-string">"myapp"</span>);
   * Bangle.<span class="hljs-literal">on</span>(<span class="hljs-string">&#x27;HRM&#x27;</span>,<span class="hljs-built_in">print</span>);
   * `</pre>
   * *When on, the Heart rate monitor draws roughly 5mA*
   * @url http://www.espruino.com/Reference#l_Bangle_setHRMPower
   */
  setHRMPower: (isOn: boolean, appID: any) => boolean;

  /**
   * Is the Heart rate monitor powered?
   * Set power with `Bangle.setHRMPower(...);`
   * @url http://www.espruino.com/Reference#l_Bangle_isHRMOn
   */
  isHRMOn: () => boolean;

  /**
   * Set the power to the GPS.
   * When on, data is output via the `GPS` event on `Bangle`:
   * <pre>`Bangle.setGPSPower(<span class="hljs-literal">true</span>, <span class="hljs-string">"myapp"</span>);
   * Bangle.<span class="hljs-literal">on</span>(<span class="hljs-string">&#x27;GPS&#x27;</span>,<span class="hljs-built_in">print</span>);
   * `</pre>
   * *When on, the GPS draws roughly 20mA*
   * @url http://www.espruino.com/Reference#l_Bangle_setGPSPower
   */
  setGPSPower: (isOn: boolean, appID: any) => boolean;

  /**
   * Is the GPS powered?
   * Set power with `Bangle.setGPSPower(...);`
   * @url http://www.espruino.com/Reference#l_Bangle_isGPSOn
   */
  isGPSOn: () => boolean;

  /**
   * Get the last available GPS fix info (or `undefined` if GPS is off).
   * The fix info received is the same as you'd get from the `Bangle.GPS` event.
   * @url http://www.espruino.com/Reference#l_Bangle_getGPSFix
   */
  getGPSFix: () => any;

  /**
   * Set the power to the Compass
   * When on, data is output via the `mag` event on `Bangle`:
   * <pre>`Bangle.setCompassPower(<span class="hljs-literal">true</span>, <span class="hljs-string">"myapp"</span>);
   * Bangle.<span class="hljs-literal">on</span>(<span class="hljs-string">&#x27;mag&#x27;</span>,<span class="hljs-built_in">print</span>);
   * `</pre>
   * *When on, the compass draws roughly 2mA*
   * @url http://www.espruino.com/Reference#l_Bangle_setCompassPower
   */
  setCompassPower: (isOn: boolean, appID: any) => boolean;

  /**
   * Is the compass powered?
   * Set power with `Bangle.setCompassPower(...);`
   * @url http://www.espruino.com/Reference#l_Bangle_isCompassOn
   */
  isCompassOn: () => boolean;

  /**
   * Resets the compass minimum/maximum values. Can be used if the compass isn't
   * providing a reliable heading any more.
   * @url http://www.espruino.com/Reference#l_Bangle_resetCompass
   */
  resetCompass: () => void;

  /**
   * Set the power to the barometer IC. Once enbled, `Bangle.pressure` events
   * are fired each time a new barometer reading is available.
   * When on, the barometer draws roughly 50uA
   * @url http://www.espruino.com/Reference#l_Bangle_setBarometerPower
   */
  setBarometerPower: (isOn: boolean, appID: any) => boolean;

  /**
   * Is the Barometer powered?
   * Set power with `Bangle.setBarometerPower(...);`
   * @url http://www.espruino.com/Reference#l_Bangle_isBarometerOn
   */
  isBarometerOn: () => boolean;

  /**
   * Returns the current amount of steps recorded by the step counter
   * @url http://www.espruino.com/Reference#l_Bangle_getStepCount
   */
  getStepCount: () => number;

  /**
   * Sets the current value of the step counter
   * @url http://www.espruino.com/Reference#l_Bangle_setStepCount
   */
  setStepCount: (count: number) => void;

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
  getCompass: () => any;

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
  getAccel: () => any;

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
  getHealthStatus: (range: any) => any;

  /**
   * Feature flag - If true, this Bangle.js firmware reads `setting.json` and
   * modifies beep & buzz behaviour accordingly (the bootloader
   * doesn't need to do it).
   * @url http://www.espruino.com/Reference#l_Bangle_F_BEEPSET
   */
  F_BEEPSET: boolean

  /**
   * Reads debug info
   * @url http://www.espruino.com/Reference#l_Bangle_dbg
   */
  dbg: () => any;

  /**
   * Writes a register on the accelerometer
   * @url http://www.espruino.com/Reference#l_Bangle_accelWr
   */
  accelWr: (reg: number, data: number) => void;

  /**
   * Reads a register from the accelerometer
   * **Note:** On Espruino 2v06 and before this function only returns a number (`cnt` is ignored).
   * @url http://www.espruino.com/Reference#l_Bangle_accelRd
   */
  accelRd: (reg: number, cnt: number) => any;

  /**
   * Writes a register on the barometer IC
   * @url http://www.espruino.com/Reference#l_Bangle_barometerWr
   */
  barometerWr: (reg: number, data: number) => void;

  /**
   * Reads a register from the barometer IC
   * @url http://www.espruino.com/Reference#l_Bangle_barometerRd
   */
  barometerRd: (reg: number, cnt: number) => any;

  /**
   * Writes a register on the Magnetometer/Compass
   * @url http://www.espruino.com/Reference#l_Bangle_compassWr
   */
  compassWr: (reg: number, data: number) => void;

  /**
   * Read a register on the Magnetometer/Compass
   * @url http://www.espruino.com/Reference#l_Bangle_compassRd
   */
  compassRd: (reg: number, cnt: number) => any;

  /**
   * Writes a register on the Heart rate monitor
   * @url http://www.espruino.com/Reference#l_Bangle_hrmWr
   */
  hrmWr: (reg: number, data: number) => void;

  /**
   * Read a register on the Heart rate monitor
   * @url http://www.espruino.com/Reference#l_Bangle_hrmRd
   */
  hrmRd: (reg: number, cnt: number) => any;

  /**
   * Changes a pin state on the IO expander
   * @url http://www.espruino.com/Reference#l_Bangle_ioWr
   */
  ioWr: (mask: number, isOn: number) => void;

  /**
   * Read temperature, pressure and altitude data. A promise is returned
   * which will be resolved with `{temperature, pressure, altitude}`.
   * If the Barometer has been turned on with `Bangle.setBarometerPower` then this will
   * return almost immediately with the reading. If the Barometer is off, conversions take
   * between 500-750ms.
   * Altitude assumes a sea-level pressure of 1013.25 hPa
   * <pre>`Bangle.getPressure().then(<span class="hljs-function"><span class="hljs-params">d</span>=></span>{
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(d);
   *   <span class="hljs-comment">// {temperature, pressure, altitude}</span>
   * });
   * `</pre>
   * @url http://www.espruino.com/Reference#l_Bangle_getPressure
   */
  getPressure: () => any;

  /**
   * Perform a Spherical [Web Mercator projection](https://en.wikipedia.org/wiki/Web_Mercator_projection)
   * of latitude and longitude into `x` and `y` coordinates, which are roughly
   * equivalent to meters from `{lat:0,lon:0}`.
   * This is the formula used for most online mapping and is a good way
   * to compare GPS coordinates to work out the distance between them.
   * @url http://www.espruino.com/Reference#l_Bangle_project
   */
  project: (latlong: any) => any;

  /**
   * Use the piezo speaker to Beep for a certain time period and frequency
   * @url http://www.espruino.com/Reference#l_Bangle_beep
   */
  beep: (time: number, freq: number) => Promise<any>;

  /**
   * Use the vibration motor to buzz for a certain time period
   * @url http://www.espruino.com/Reference#l_Bangle_buzz
   */
  buzz: (time: number, strength: number) => Promise<any>;

  /**
   * Turn Bangle.js off. It can only be woken by pressing BTN1.
   * @url http://www.espruino.com/Reference#l_Bangle_off
   */
  off: () => void;

  /**
   * Turn Bangle.js (mostly) off, but keep the CPU in sleep
   * mode until BTN1 is pressed to preserve the RTC (current time).
   * @url http://www.espruino.com/Reference#l_Bangle_softOff
   */
  softOff: () => void;

  /**
   *
   * - On platforms with an LCD of >=8bpp this is 222 x 104 x 2 bits
   * - Otherwise it's 119 x 56 x 1 bits
   *
   * @url http://www.espruino.com/Reference#l_Bangle_getLogo
   */
  getLogo: () => any;

  /**
   * Load all widgets from flash Storage. Call this once at the beginning
   * of your application if you want any on-screen widgets to be loaded.
   * They will be loaded into a global `WIDGETS` array, and
   * can be rendered with `Bangle.drawWidgets`.
   * @url http://www.espruino.com/Reference#l_Bangle_loadWidgets
   */
  loadWidgets: () => void;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_drawWidgets
   */
  drawWidgets: () => void;

  /**
   * Load the Bangle.js app launcher, which will allow the user
   * to select an application to launch.
   * @url http://www.espruino.com/Reference#l_Bangle_showLauncher
   */
  showLauncher: () => void;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_setUI
   */
  setUI: () => void;

  /**
   * Erase all storage and reload it with the default
   * contents.
   * This is only available on Bangle.js 2.0. On Bangle.js 1.0
   * you need to use `Install Default Apps` under the `More...` tab
   * of [http://banglejs.com/apps](http://banglejs.com/apps)
   * @url http://www.espruino.com/Reference#l_Bangle_factoryReset
   */
  factoryReset: () => void;

  /**
   * Returns the rectangle on the screen that is currently
   * reserved for the app.
   * @url http://www.espruino.com/Reference#l_Bangle_appRect
   */
  appRect: any

};

/**
 * Class containing [micro:bit's](https://www.espruino.com/MicroBit) utility functions.
 * @url http://www.espruino.com/Reference#Microbit
 */
declare const Microbit: {
  /**
   * The micro:bit's speaker pin
   * @url http://www.espruino.com/Reference#l_Microbit_SPEAKER
   */
  SPEAKER: Pin

  /**
   * The micro:bit's microphone pin
   * `MIC_ENABLE` should be set to 1 before using this
   * @url http://www.espruino.com/Reference#l_Microbit_MIC
   */
  MIC: Pin

  /**
   * The micro:bit's microphone enable pin
   * @url http://www.espruino.com/Reference#l_Microbit_MIC_ENABLE
   */
  MIC_ENABLE: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Microbit_mag
   */
  mag: () => any;

  /**
   * @url http://www.espruino.com/Reference#l_Microbit_accel
   */
  accel: () => any;

  /**
   * **Note:** This function is only available on the [BBC micro:bit](https://espruino.com//MicroBit) board
   * Write the given value to the accelerometer
   * @url http://www.espruino.com/Reference#l_Microbit_accelWr
   */
  accelWr: (addr: number, data: number) => void;

  /**
   * Turn on the accelerometer, and create `Microbit.accel` and `Microbit.gesture` events.
   * **Note:** The accelerometer is currently always enabled - this code
   * just responds to interrupts and reads
   * @url http://www.espruino.com/Reference#l_Microbit_accelOn
   */
  accelOn: () => void;

  /**
   * Turn off events from  the accelerometer (started with `Microbit.accelOn`)
   * @url http://www.espruino.com/Reference#l_Microbit_accelOff
   */
  accelOff: () => void;

  /**
   * Play a waveform on the Micro:bit's speaker
   * @url http://www.espruino.com/Reference#l_Microbit_play
   */
  play: (waveform: any, samplesPerSecond: any, callback: any) => void;

  /**
   * Records sound from the micro:bit's onboard microphone and returns the result
   * @url http://www.espruino.com/Reference#l_Microbit_record
   */
  record: (samplesPerSecond: any, callback: any, samples: any) => void;

};

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
declare const fs: {
  /**
   * List all files in the supplied directory, returning them as an array of strings.
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_readdir
   */
  readdir: (path: any) => any;

  /**
   * List all files in the supplied directory, returning them as an array of strings.
   * @url http://www.espruino.com/Reference#l_fs_readdirSync
   */
  readdirSync: (path: any) => any;

  /**
   * Write the data to the given file
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_writeFile
   */
  writeFile: (path: any, data: any) => boolean;

  /**
   * Write the data to the given file
   * @url http://www.espruino.com/Reference#l_fs_writeFileSync
   */
  writeFileSync: (path: any, data: any) => boolean;

  /**
   * Append the data to the given file, created a new file if it doesn't exist
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_appendFile
   */
  appendFile: (path: any, data: any) => boolean;

  /**
   * Append the data to the given file, created a new file if it doesn't exist
   * @url http://www.espruino.com/Reference#l_fs_appendFileSync
   */
  appendFileSync: (path: any, data: any) => boolean;

  /**
   * Read all data from a file and return as a string
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_readFile
   */
  readFile: (path: any) => any;

  /**
   * Read all data from a file and return as a string.
   * **Note:** The size of files you can load using this method is limited by the amount of available RAM. To read files a bit at a time, see the `File` class.
   * @url http://www.espruino.com/Reference#l_fs_readFileSync
   */
  readFileSync: (path: any) => any;

  /**
   * Delete the given file
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_unlink
   */
  unlink: (path: any) => boolean;

  /**
   * Delete the given file
   * @url http://www.espruino.com/Reference#l_fs_unlinkSync
   */
  unlinkSync: (path: any) => boolean;

  /**
   * Return information on the given file. This returns an object with the following
   * fields:
   * size: size in bytes
   * dir: a boolean specifying if the file is a directory or not
   * mtime: A Date structure specifying the time the file was last modified
   * @url http://www.espruino.com/Reference#l_fs_statSync
   */
  statSync: (path: any) => any;

  /**
   * Create the directory
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like the 'Sync' version.
   * @url http://www.espruino.com/Reference#l_fs_mkdir
   */
  mkdir: (path: any) => boolean;

  /**
   * Create the directory
   * @url http://www.espruino.com/Reference#l_fs_mkdirSync
   */
  mkdirSync: (path: any) => boolean;

  /**
   * @url http://www.espruino.com/Reference#l_fs_pipe
   */
  pipe: (source: any, destination: any, options: any) => void;

};

/**
 * Class containing utility functions for [Pixl.js](http://www.espruino.com/Pixl.js)
 * @url http://www.espruino.com/Reference#Pixl
 */
declare const Pixl: {
  /**
   * DEPRECATED - Please use `E.getBattery()` instead.
   * Return an approximate battery percentage remaining based on
   * a normal CR2032 battery (2.8 - 2.2v)
   * @url http://www.espruino.com/Reference#l_Pixl_getBatteryPercentage
   */
  getBatteryPercentage: () => number;

  /**
   * Set the LCD's contrast
   * @url http://www.espruino.com/Reference#l_Pixl_setContrast
   */
  setContrast: (c: number) => void;

  /**
   * This function can be used to turn Pixl.js's LCD off or on.
   *
   * - With the LCD off, Pixl.js draws around 0.1mA
   * - With the LCD on, Pixl.js draws around 0.25mA
   *
   * @url http://www.espruino.com/Reference#l_Pixl_setLCDPower
   */
  setLCDPower: (isOn: boolean) => void;

  /**
   * Writes a command directly to the ST7567 LCD controller
   * @url http://www.espruino.com/Reference#l_Pixl_lcdw
   */
  lcdw: (c: number) => void;

  /**
   * Display a menu on Pixl.js's screen, and set up the buttons to navigate through it.
   * DEPRECATED: Use `E.showMenu`
   * @url http://www.espruino.com/Reference#l_Pixl_menu
   */
  menu: (menu: any) => any;

};

/**
 * A Web Bluetooth-style device - you can request one using `NRF.requestDevice(address)`
 * For example:
 * <pre>`<span class="hljs-keyword">var</span> gatt;
 * NRF.requestDevice({ <span class="hljs-attr">filters</span>: [{ <span class="hljs-attr">name</span>: <span class="hljs-string">&#x27;Puck.js abcd&#x27;</span> }] }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">device</span>) {
 *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"found device"</span>);
 *   <span class="hljs-keyword">return</span> device.gatt.connect();
 * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">g</span>) {
 *   gatt = g;
 *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"connected"</span>);
 *   <span class="hljs-keyword">return</span> gatt.startBonding();
 * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
 *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"bonded"</span>, gatt.getSecurityStatus());
 *   gatt.disconnect();
 * }).catch(<span class="hljs-keyword">function</span>(<span class="hljs-params">e</span>) {
 *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"ERROR"</span>,e);
 * });
 * `</pre>
 * @url http://www.espruino.com/Reference#BluetoothDevice
 */
declare function BluetoothDevice(): void;

type BluetoothDevice = {
  /**
   * @url http://www.espruino.com/Reference#l_BluetoothDevice_gatt
   */
  gatt: any

  /**
   * @url http://www.espruino.com/Reference#l_BluetoothDevice_rssi
   */
  rssi: boolean

  /**
   * To be used as a response when the event `BluetoothDevice.sendPasskey` has been received.
   * **This is not part of the Web Bluetooth Specification.** It has been added
   * specifically for Espruino.
   * @url http://www.espruino.com/Reference#l_BluetoothDevice_sendPasskey
   */
  sendPasskey: (passkey: any) => void;

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
   * Connect to a BLE device - returns a promise,
   * the argument of which is the `BluetoothRemoteGATTServer` connection.
   * See [`NRF.requestDevice`](https://espruino.com//Reference#l_NRF_requestDevice) for usage examples.
   * `options` is an optional object containing:
   * <pre>`{
   *    minInterval // min connection interval <span class="hljs-keyword">in</span> milliseconds, <span class="hljs-number">7.5</span> <span class="hljs-keyword">ms</span> <span class="hljs-title">to</span> <span class="hljs-number">4</span> s
   *    maxInterval // max connection interval <span class="hljs-keyword">in</span> milliseconds, <span class="hljs-number">7.5</span> <span class="hljs-keyword">ms</span> <span class="hljs-title">to</span> <span class="hljs-number">4</span> s
   * }
   * `</pre>
   * By default the interval is 20-200ms (or 500-1000ms if `NRF.setLowPowerConnection(true)` was called.
   * During connection Espruino negotiates with the other device to find a common interval that can be
   * used.
   * For instance calling:
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NRF</span>.</span></span>request<span class="hljs-constructor">Device({ <span class="hljs-params">filters</span>: [{ <span class="hljs-params">namePrefix</span>: &#x27;Pixl.<span class="hljs-params">js</span>&#x27; }] })</span>.<span class="hljs-keyword">then</span>(<span class="hljs-keyword">function</span>(device) {
   *   return device.gatt.connect({minInterval:<span class="hljs-number">7.5</span>, maxInterval:<span class="hljs-number">7.5</span>});
   * }).<span class="hljs-keyword">then</span>(<span class="hljs-keyword">function</span>(g) {
   * `</pre>
   * will force the connection to use the fastest connection interval possible (as long as the device
   * at the other end supports it).
   * **Note:** The Web Bluetooth spec states that if a device hasn't advertised its name, when connected
   * to a device the central (in this case Espruino) should automatically retrieve the name from the
   * corresponding characteristic (`0x2a00` on service `0x1800`). Espruino does not automatically do this.
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_connect
   */
  connect: (options: any) => Promise<any>;

  /**
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_connected
   */
  connected: boolean

  /**
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_handle
   */
  handle: number

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
   * Start negotiating bonding (secure communications) with the connected device,
   * and return a Promise that is completed on success or failure.
   * <pre>`<span class="hljs-keyword">var</span> gatt;
   * NRF.requestDevice({ <span class="hljs-attr">filters</span>: [{ <span class="hljs-attr">name</span>: <span class="hljs-string">&#x27;Puck.js abcd&#x27;</span> }] }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">device</span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"found device"</span>);
   *   <span class="hljs-keyword">return</span> device.gatt.connect();
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">g</span>) {
   *   gatt = g;
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"connected"</span>);
   *   <span class="hljs-keyword">return</span> gatt.startBonding();
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"bonded"</span>, gatt.getSecurityStatus());
   *   gatt.disconnect();
   * }).catch(<span class="hljs-keyword">function</span>(<span class="hljs-params">e</span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"ERROR"</span>,e);
   * });
   * `</pre>
   * **This is not part of the Web Bluetooth Specification.** It has been added
   * specifically for Espruino.
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_startBonding
   */
  startBonding: (forceRePair: boolean) => Promise<any>;

  /**
   * Return an object with information about the security
   * state of the current connection:
   * <pre>`{
   *   connected       // The <span class="hljs-keyword">connection</span> <span class="hljs-keyword">is</span> active (<span class="hljs-keyword">not</span> disconnected).
   *   <span class="hljs-keyword">encrypted</span>       // Communication <span class="hljs-keyword">on</span> this link <span class="hljs-keyword">is</span> <span class="hljs-keyword">encrypted</span>.
   *   mitm_protected  // The <span class="hljs-keyword">encrypted</span> communication <span class="hljs-keyword">is</span> <span class="hljs-keyword">also</span> protected against man-<span class="hljs-keyword">in</span>-the-middle attacks.
   *   bonded          // The peer <span class="hljs-keyword">is</span> bonded <span class="hljs-keyword">with</span> us
   * }
   * `</pre>
   * See `BluetoothRemoteGATTServer.startBonding` for information about
   * negotiating a secure connection.
   * **This is not part of the Web Bluetooth Specification.** It has been added
   * specifically for Puck.js.
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getSecurityStatus
   */
  getSecurityStatus: () => any;

  /**
   * See `NRF.connect` for usage examples.
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getPrimaryService
   */
  getPrimaryService: (service: any) => Promise<any>;

  /**
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getPrimaryServices
   */
  getPrimaryServices: () => Promise<any>;

  /**
   * Start/stop listening for RSSI values on the active GATT connection
   * <pre>`<span class="hljs-comment">// Start listening for RSSI value updates</span>
   * gattServer.setRSSIHandler(<span class="hljs-keyword">function</span>(<span class="hljs-params">rssi</span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(rssi); <span class="hljs-comment">// prints -85 (or similar)</span>
   * });
   * <span class="hljs-comment">// Stop listening</span>
   * gattServer.setRSSIHandler();
   * `</pre>
   * RSSI is the 'Received Signal Strength Indication' in dBm
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_setRSSIHandler
   */
  setRSSIHandler: (callback: any) => void;

}

/**
 * Web Bluetooth-style GATT service - get this using `BluetoothRemoteGATTServer.getPrimaryService(s)`
 * [https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattservice](https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattservice)
 * @url http://www.espruino.com/Reference#BluetoothRemoteGATTService
 */
declare function BluetoothRemoteGATTService(): void;

type BluetoothRemoteGATTService = {
  /**
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTService_device
   */
  device: any

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
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_service
   */
  service: any

  /**
   * Write a characteristic's value
   * <pre>`<span class="hljs-keyword">var</span> device;
   * NRF.connect(device_address).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">d</span>) {
   *   device = d;
   *   <span class="hljs-keyword">return</span> d.getPrimaryService(<span class="hljs-string">"service_uuid"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">s</span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Service "</span>,s);
   *   <span class="hljs-keyword">return</span> s.getCharacteristic(<span class="hljs-string">"characteristic_uuid"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">c</span>) {
   *   <span class="hljs-keyword">return</span> c.writeValue(<span class="hljs-string">"Hello"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">d</span>) {
   *   device.disconnect();
   * }).catch(<span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Something&#x27;s broken."</span>);
   * });
   * `</pre>
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_writeValue
   */
  writeValue: (data: any) => Promise<any>;

  /**
   * Read a characteristic's value, return a promise containing a `DataView`
   * <pre>`<span class="hljs-keyword">var</span> device;
   * NRF.connect(device_address).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">d</span>) {
   *   device = d;
   *   <span class="hljs-keyword">return</span> d.getPrimaryService(<span class="hljs-string">"service_uuid"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">s</span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Service "</span>,s);
   *   <span class="hljs-keyword">return</span> s.getCharacteristic(<span class="hljs-string">"characteristic_uuid"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">c</span>) {
   *   <span class="hljs-keyword">return</span> c.readValue();
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">d</span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Got:"</span>, JSON.stringify(d.<span class="hljs-built_in">buffer</span>));
   *   device.disconnect();
   * }).catch(<span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Something&#x27;s broken."</span>);
   * });
   * `</pre>
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_readValue
   */
  readValue: () => Promise<any>;

  /**
   * Starts notifications - whenever this characteristic's value changes, a `characteristicvaluechanged` event is fired
   * and `characteristic.value` will then contain the new value as a `DataView`.
   * <pre>`<span class="hljs-keyword">var</span> device;
   * NRF.connect(device_address).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">d</span>) {
   *   device = d;
   *   <span class="hljs-keyword">return</span> d.getPrimaryService(<span class="hljs-string">"service_uuid"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">s</span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Service "</span>,s);
   *   <span class="hljs-keyword">return</span> s.getCharacteristic(<span class="hljs-string">"characteristic_uuid"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">c</span>) {
   *   c.on(<span class="hljs-string">&#x27;characteristicvaluechanged&#x27;</span>, <span class="hljs-keyword">function</span>(<span class="hljs-params">event</span>) {
   *     <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"-> "</span>,event.target.value); <span class="hljs-comment">// this is a DataView</span>
   *   });
   *   <span class="hljs-keyword">return</span> c.startNotifications();
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">d</span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Waiting for notifications"</span>);
   * }).catch(<span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Something&#x27;s broken."</span>);
   * });
   * `</pre>
   * For example, to listen to the output of another Puck.js's Nordic
   * Serial port service, you can use:
   * <pre>`<span class="hljs-keyword">var</span> gatt;
   * NRF.connect(<span class="hljs-string">"pu:ck:js:ad:dr:es random"</span>).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">g</span>) {
   *   gatt = g;
   *   <span class="hljs-keyword">return</span> gatt.getPrimaryService(<span class="hljs-string">"6e400001-b5a3-f393-e0a9-e50e24dcca9e"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">service</span>) {
   *   <span class="hljs-keyword">return</span> service.getCharacteristic(<span class="hljs-string">"6e400003-b5a3-f393-e0a9-e50e24dcca9e"</span>);
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params">characteristic</span>) {
   *   characteristic.on(<span class="hljs-string">&#x27;characteristicvaluechanged&#x27;</span>, <span class="hljs-keyword">function</span>(<span class="hljs-params">event</span>) {
   *     <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"RX: "</span>+JSON.stringify(event.target.value.<span class="hljs-built_in">buffer</span>));
   *   });
   *   <span class="hljs-keyword">return</span> characteristic.startNotifications();
   * }).then(<span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Done!"</span>);
   * });
   * `</pre>
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_startNotifications
   */
  startNotifications: () => Promise<any>;

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
declare const Trig: {
  /**
   * Get the position of the trigger wheel at the given time (from getTime)
   * @url http://www.espruino.com/Reference#l_Trig_getPosAtTime
   */
  getPosAtTime: (time: number) => number;

  /**
   * Initialise the trigger class
   * @url http://www.espruino.com/Reference#l_Trig_setup
   */
  setup: (pin: Pin, options: any) => void;

  /**
   * Set a trigger for a certain point in the cycle
   * @url http://www.espruino.com/Reference#l_Trig_setTrigger
   */
  setTrigger: (num: number, pos: number, pins: any, pulseLength: number) => void;

  /**
   * Disable a trigger
   * @url http://www.espruino.com/Reference#l_Trig_killTrigger
   */
  killTrigger: (num: number) => void;

  /**
   * Get the current state of a trigger
   * @url http://www.espruino.com/Reference#l_Trig_getTrigger
   */
  getTrigger: (num: number) => any;

  /**
   * Get the RPM of the trigger wheel
   * @url http://www.espruino.com/Reference#l_Trig_getRPM
   */
  getRPM: () => number;

  /**
   * Get the current error flags from the trigger wheel - and zero them
   * @url http://www.espruino.com/Reference#l_Trig_getErrors
   */
  getErrors: () => number;

  /**
   * Get the current error flags from the trigger wheel - and zero them
   * @url http://www.espruino.com/Reference#l_Trig_getErrorArray
   */
  getErrorArray: () => any;

};

/**
 * Class containing [Puck.js's](http://www.puck-js.com) utility functions.
 * @url http://www.espruino.com/Reference#Puck
 */
declare const Puck: {
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
  mag: () => any;

  /**
   * Turn on the magnetometer, take a single temperature reading from the MAG3110 chip, and then turn it off again.
   * (If the magnetometer is already on, this just returns the last reading obtained)
   * `E.getTemperature()` uses the microcontroller's temperature sensor, but this uses the magnetometer's.
   * The reading obtained is an integer (so no decimal places), but the sensitivity is factory trimmed. to 1°C, however the temperature
   * offset isn't - so absolute readings may still need calibrating.
   * @url http://www.espruino.com/Reference#l_Puck_magTemp
   */
  magTemp: () => number;

  /**
   * Turn the magnetometer on and start periodic sampling. Samples will then cause
   * a 'mag' event on 'Puck':
   * <pre>`Puck.magOn();
   * Puck.on(<span class="hljs-string">&#x27;mag&#x27;</span>, <span class="hljs-keyword">function</span>(<span class="hljs-params">xyz</span>) {
   *   <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(xyz);
   *   <span class="hljs-comment">// {x:..., y:..., z:...}</span>
   * });
   * <span class="hljs-comment">// Turn events off with Puck.magOff();</span>
   * `</pre>
   * This call will be ignored if the sampling is already on.
   * If given an argument, the sample rate is set (if not, it's at 0.63 Hz).
   * The sample rate must be one of the following (resulting in the given power consumption):
   *
   * - 80 Hz - 900uA
   * - 40 Hz - 550uA
   * - 20 Hz - 275uA
   * - 10 Hz - 137uA
   * - 5 Hz - 69uA
   * - 2.5 Hz - 34uA
   * - 1.25 Hz - 17uA
   * - 0.63 Hz - 8uA
   * - 0.31 Hz - 8uA
   * - 0.16 Hz - 8uA
   * - 0.08 Hz - 8uA
   *
   * When the battery level drops too low while sampling is turned on,
   * the magnetometer may stop sampling without warning, even while other
   * Puck functions continue uninterrupted.
   * Check out [the Puck.js page on the magnetometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information.
   * @url http://www.espruino.com/Reference#l_Puck_magOn
   */
  magOn: (samplerate: number) => void;

  /**
   * Turn the magnetometer off
   * @url http://www.espruino.com/Reference#l_Puck_magOff
   */
  magOff: () => void;

  /**
   * Writes a register on the LIS3MDL / MAX3110 Magnetometer. Can be used for configuring advanced functions.
   * Check out [the Puck.js page on the magnetometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information and links to modules that use this function.
   * @url http://www.espruino.com/Reference#l_Puck_magWr
   */
  magWr: (reg: number, data: number) => void;

  /**
   * Reads a register from the LIS3MDL / MAX3110 Magnetometer. Can be used for configuring advanced functions.
   * Check out [the Puck.js page on the magnetometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information and links to modules that use this function.
   * @url http://www.espruino.com/Reference#l_Puck_magRd
   */
  magRd: (reg: number) => number;

  /**
   * On Puck.js v2.0 this will use the on-board PCT2075TP temperature sensor, but on Puck.js the less accurate on-chip Temperature sensor is used.
   * @url http://www.espruino.com/Reference#l_Puck_getTemperature
   */
  getTemperature: () => number;

  /**
   * Accepted values are:
   *
   * - 1.6 Hz (no Gyro) - 40uA (2v05 and later firmware)
   * - 12.5 Hz (with Gyro)- 350uA
   * - 26 Hz (with Gyro) - 450 uA
   * - 52 Hz (with Gyro) - 600 uA
   * - 104 Hz (with Gyro) - 900 uA
   * - 208 Hz (with Gyro) - 1500 uA
   * - 416 Hz (with Gyro) (not recommended)
   * - 833 Hz (with Gyro) (not recommended)
   * - 1660 Hz (with Gyro) (not recommended)
   *
   * Once `Puck.accelOn()` is called, the `Puck.accel` event will be called each time data is received. `Puck.accelOff()` can be called to turn the accelerometer off.
   * For instance to light the red LED whenever Puck.js is face up:
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Puck</span>.</span></span>on(&#x27;accel&#x27;, <span class="hljs-keyword">function</span>(a) {
   *  digital<span class="hljs-constructor">Write(LED1, <span class="hljs-params">a</span>.<span class="hljs-params">acc</span>.<span class="hljs-params">z</span> > 0)</span>;
   * });
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Puck</span>.</span></span>accel<span class="hljs-constructor">On()</span>;
   * `</pre>
   * Check out [the Puck.js page on the accelerometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information.
   * @url http://www.espruino.com/Reference#l_Puck_accelOn
   */
  accelOn: (samplerate: number) => void;

  /**
   * Turn the accelerometer off after it has been turned on by `Puck.accelOn()`.
   * Check out [the Puck.js page on the accelerometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information.
   * @url http://www.espruino.com/Reference#l_Puck_accelOff
   */
  accelOff: () => void;

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
  accel: () => any;

  /**
   * Writes a register on the LSM6DS3TR-C Accelerometer. Can be used for configuring advanced functions.
   * Check out [the Puck.js page on the accelerometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information and links to modules that use this function.
   * @url http://www.espruino.com/Reference#l_Puck_accelWr
   */
  accelWr: (reg: number, data: number) => void;

  /**
   * Reads a register from the LSM6DS3TR-C Accelerometer. Can be used for configuring advanced functions.
   * Check out [the Puck.js page on the accelerometer](http://www.espruino.com/Puck.js#on-board-peripherals)
   * for more information and links to modules that use this function.
   * @url http://www.espruino.com/Reference#l_Puck_accelRd
   */
  accelRd: (reg: number) => number;

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
  IR: (data: any, cathode: Pin, anode: Pin) => void;

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
  capSense: (tx: Pin, rx: Pin) => number;

  /**
   * Return a light value based on the light the red LED is seeing.
   * **Note:** If called more than 5 times per second, the received light value
   * may not be accurate.
   * @url http://www.espruino.com/Reference#l_Puck_light
   */
  light: () => number;

  /**
   * DEPRECATED - Please use `E.getBattery()` instead.
   * Return an approximate battery percentage remaining based on
   * a normal CR2032 battery (2.8 - 2.2v).
   * @url http://www.espruino.com/Reference#l_Puck_getBatteryPercentage
   */
  getBatteryPercentage: () => number;

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
  selfTest: () => boolean;

};

/**
 * @url http://www.espruino.com/Reference#l_CC3000_undefined
 */
declare const CC3000: {
  /**
   * Initialise the CC3000 and return a WLAN object
   * @url http://www.espruino.com/Reference#l_CC3000_connect
   */
  connect: (spi: any, cs: Pin, en: Pin, irq: Pin) => WLAN;

};

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
declare const TelnetServer: {
  /**
   * @url http://www.espruino.com/Reference#l_TelnetServer_setOptions
   */
  setOptions: (options: any) => void;

};

/**
 * Class containing utility functions for the [ESP8266](http://www.espruino.com/EspruinoESP8266)
 * @url http://www.espruino.com/Reference#ESP8266
 */
declare const ESP8266: {
  /**
   * **DEPRECATED** - please use `Wifi.ping` instead.
   * Perform a network ping request. The parameter can be either a String or a numeric IP address.
   * @url http://www.espruino.com/Reference#l_ESP8266_ping
   */
  ping: (ipAddr: any, pingCallback: any) => void;

  /**
   * Perform a hardware reset/reboot of the esp8266.
   * @url http://www.espruino.com/Reference#l_ESP8266_reboot
   */
  reboot: () => void;

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
  getResetInfo: () => any;

  /**
   * Enable or disable the logging of debug information.  A value of `true` enables debug logging while a value of `false` disables debug logging.  Debug output is sent to UART1 (gpio2).
   * @url http://www.espruino.com/Reference#l_ESP8266_logDebug
   */
  logDebug: (enable: boolean) => void;

  /**
   * Set the debug logging mode. It can be disabled (which frees ~1.2KB of heap), enabled in-memory only, or in-memory and output to a UART.
   * @url http://www.espruino.com/Reference#l_ESP8266_setLog
   */
  setLog: (mode: number) => void;

  /**
   * Prints the contents of the debug log to the console.
   * @url http://www.espruino.com/Reference#l_ESP8266_printLog
   */
  printLog: () => void;

  /**
   * Returns one line from the log or up to 128 characters.
   * @url http://www.espruino.com/Reference#l_ESP8266_readLog
   */
  readLog: () => void;

  /**
   * Dumps info about all sockets to the log. This is for troubleshooting the socket implementation.
   * @url http://www.espruino.com/Reference#l_ESP8266_dumpSocketInfo
   */
  dumpSocketInfo: () => void;

  /**
   * **Note:** This is deprecated. Use `E.setClock(80/160)`
   * **Note:**
   * Set the operating frequency of the ESP8266 processor. The default is 160Mhz.
   * **Warning**: changing the cpu frequency affects the timing of some I/O operations, notably of software SPI and I2C, so things may be a bit slower at 80Mhz.
   * @url http://www.espruino.com/Reference#l_ESP8266_setCPUFreq
   */
  setCPUFreq: (freq: any) => void;

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
  getState: () => any;

  /**
   * **Note:** This is deprecated. Use `require("Flash").getFree()`
   * @url http://www.espruino.com/Reference#l_ESP8266_getFreeFlash
   */
  getFreeFlash: () => any;

  /**
   * @url http://www.espruino.com/Reference#l_ESP8266_crc32
   */
  crc32: (arrayOfData: any) => any;

  /**
   * **This function is deprecated.** Please use `require("neopixel").write(pin, data)` instead
   * @url http://www.espruino.com/Reference#l_ESP8266_neopixelWrite
   */
  neopixelWrite: (pin: Pin, arrayOfData: any) => void;

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
  deepSleep: (micros: any, option: any) => void;

};

/**
 * This library allows you to create http servers and make http requests
 * In order to use this, you will need an extra module to get network connectivity such as the [WIZnet W5500](https://espruino.com//CC3000">TI CC3000</a> or <a href="/WIZnet).
 * This is designed to be a cut-down version of the [Internet](http://nodejs.org/api/http.html">node.js library</a>. Please see the <a href="/Internet) page for more information on how to use it.
 * @url http://www.espruino.com/Reference#l_http_undefined
 */
declare const http: {
  /**
   * Create an HTTP Server
   * When a request to the server is made, the callback is called. In the callback you can use the methods on the response (`httpSRs`) to send data. You can also add `request.on('data',function() { ... })` to listen for POSTed data
   * @url http://www.espruino.com/Reference#l_http_createServer
   */
  createServer: (callback: any) => httpSrv;

  /**
   * Create an HTTP Request - `end()` must be called on it to complete the operation. `options` is of the form:
   * <pre>`<span class="hljs-keyword">var</span> options = {
   *     <span class="hljs-attr">host</span>: <span class="hljs-string">&#x27;example.com&#x27;</span>, <span class="hljs-comment">// host name</span>
   *     port: <span class="hljs-number">80</span>,            <span class="hljs-comment">// (optional) port, defaults to 80</span>
   *     path: <span class="hljs-string">&#x27;/&#x27;</span>,           <span class="hljs-comment">// path sent to server</span>
   *     method: <span class="hljs-string">&#x27;GET&#x27;</span>,       <span class="hljs-comment">// HTTP command sent to server (must be uppercase &#x27;GET&#x27;, &#x27;POST&#x27;, etc)</span>
   *     protocol: <span class="hljs-string">&#x27;http:&#x27;</span>,   <span class="hljs-comment">// optional protocol - https: or http:</span>
   *     headers: { <span class="hljs-attr">key</span> : value, <span class="hljs-attr">key</span> : value } <span class="hljs-comment">// (optional) HTTP headers</span>
   *   };
   * <span class="hljs-keyword">var</span> req = require(<span class="hljs-string">"http"</span>).request(options, <span class="hljs-keyword">function</span>(<span class="hljs-params">res</span>) {
   *   res.on(<span class="hljs-string">&#x27;data&#x27;</span>, <span class="hljs-keyword">function</span>(<span class="hljs-params">data</span>) {
   *     <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"HTTP> "</span>+data);
   *   });
   *   res.on(<span class="hljs-string">&#x27;close&#x27;</span>, <span class="hljs-keyword">function</span>(<span class="hljs-params">data</span>) {
   *     <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Connection closed"</span>);
   *   });
   * });
   * <span class="hljs-comment">// You can req.write(...) here if your request requires data to be sent.</span>
   * req.end(); <span class="hljs-comment">// called to finish the HTTP request and get the response</span>
   * `</pre>
   * You can easily pre-populate `options` from a URL using `var options = url.parse("http://www.example.com/foo.html")`
   * There's an example of using [`http.request` for HTTP POST here](https://espruino.com//Internet#http-post)
   * **Note:** if TLS/HTTPS is enabled, options can have `ca`, `key` and `cert` fields. See `tls.connect` for
   * more information about these and how to use them.
   * @url http://www.espruino.com/Reference#l_http_request
   */
  request: (options: any, callback: any) => httpCRq;

  /**
   * Request a webpage over HTTP - a convenience function for `http.request()` that makes sure the HTTP command is 'GET', and that calls `end` automatically.
   * <pre>`require(<span class="hljs-string">"http"</span>).get(<span class="hljs-string">"http://pur3.co.uk/hello.txt"</span>, <span class="hljs-keyword">function</span>(<span class="hljs-params">res</span>) {
   *   res.on(<span class="hljs-string">&#x27;data&#x27;</span>, <span class="hljs-keyword">function</span>(<span class="hljs-params">data</span>) {
   *     <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"HTTP> "</span>+data);
   *   });
   *   res.on(<span class="hljs-string">&#x27;close&#x27;</span>, <span class="hljs-keyword">function</span>(<span class="hljs-params">data</span>) {
   *     <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"Connection closed"</span>);
   *   });
   * });
   * `</pre>
   * See `http.request()` and [the Internet page](https://espruino.com//Internet) and ` for more usage examples.
   * @url http://www.espruino.com/Reference#l_http_get
   */
  get: (options: any, callback: any) => httpCRq;

};

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
   * The headers to send back along with the HTTP response.
   * The default contents are:
   * <pre>`<span class="hljs-punctuation">{</span>
   *   <span class="hljs-attr">"Connection"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"close"</span>
   *  <span class="hljs-punctuation">}</span>
   * `</pre>
   * @url http://www.espruino.com/Reference#l_httpSRs_headers
   */
  headers: any

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
 * The Wifi library is designed to control the Wifi interface. It supports functionality
 * such as connecting to wifi networks, getting network information, starting an access
 * point, etc.
 * It is available on these devices:
 *
 * - [Espruino WiFi](http://www.espruino.com/WiFi#using-wifi)
 * - [ESP8266](http://www.espruino.com/EspruinoESP8266)
 * - [ESP32](http://www.espruino.com/ESP32)
 *
 * **Certain features may or may not be implemented on your device** however
 * we have documented what is available and what isn't.
 * If you're not using one of the devices above, a separate WiFi library is
 * provided. For instance:
 *
 * - An [ESP8266 connected to an Espruino board](http://www.espruino.com/ESP8266#software)
 * - An [CC3000 WiFi Module](http://www.espruino.com/CC3000)
 *
 * [Other ways of connecting to the net](http://www.espruino.com/Internet#related-pages) such
 * as GSM, Ethernet and LTE have their own libraries.
 * You can use the WiFi library as follows:
 * <pre>`<span class="hljs-keyword">var</span> wifi = require(<span class="hljs-string">"Wifi"</span>);
 * wifi.connect(<span class="hljs-string">"my-ssid"</span>, {<span class="hljs-attr">password</span>:<span class="hljs-string">"my-pwd"</span>}, <span class="hljs-keyword">function</span>(<span class="hljs-params">ap</span>){ <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(<span class="hljs-string">"connected:"</span>, ap); });
 * `</pre>
 * On ESP32/ESP8266 if you want the connection to happen automatically at boot, add `wifi.save();`.
 * On other platforms, place `wifi.connect` in a function called `onInit`.
 * @url http://www.espruino.com/Reference#l_Wifi_undefined
 */
declare const Wifi: {
  /**
   * Disconnect the wifi station from an access point and disable the station mode. It is OK to call `disconnect` to turn off station mode even if no connection exists (for example, connection attempts may be failing). Station mode can be re-enabled by calling `connect` or `scan`.
   * @url http://www.espruino.com/Reference#l_Wifi_disconnect
   */
  disconnect: (callback: any) => void;

  /**
   * Stop being an access point and disable the AP operation mode. AP mode can be re-enabled by calling `startAP`.
   * @url http://www.espruino.com/Reference#l_Wifi_stopAP
   */
  stopAP: (callback: any) => void;

  /**
   * Connect to an access point as a station. If there is an existing connection to an AP it is first disconnected if the SSID or password are different from those passed as parameters. Put differently, if the passed SSID and password are identical to the currently connected AP then nothing is changed.
   * When the connection attempt completes the callback function is invoked with one `err` parameter, which is NULL if there is no error and a string message if there is an error. If DHCP is enabled the callback occurs once an IP addres has been obtained, if a static IP is set the callback occurs once the AP's network has been joined.  The callback is also invoked if a connection already exists and does not need to be changed.
   * The options properties may contain:
   *
   * - `password` - Password string to be used to access the network.
   * - `dnsServers` (array of String) - An array of up to two DNS servers in dotted decimal format string.
   * - `channel`  - Wifi channel of the access point  (integer, typ 0..14, 0 means any channel), only on ESP8266.
   * - `bssid`   -  Mac address of the access point (string, type "00:00:00:00:00:00"), only on ESP8266.
   *
   * Notes:
   *
   * - the options should include the ability to set a static IP and associated netmask and gateway, this is a future enhancement.
   * - the only error reported in the callback is "Bad password", all other errors (such as access point not found or DHCP timeout) just cause connection retries. If the reporting of such temporary errors is desired, the caller must use its own timeout and the `getDetails().status` field.
   * - the `connect` call automatically enabled station mode, it can be disabled again by calling `disconnect`.
   *
   * @url http://www.espruino.com/Reference#l_Wifi_connect
   */
  connect: (ssid: any, options: any, callback: any) => void;

  /**
   * Perform a scan for access points. This will enable the station mode if it is not currently enabled. Once the scan is complete the callback function is called with an array of APs found, each AP is an object with:
   *
   * - `ssid`: SSID string.
   * - `mac`: access point MAC address in 00:00:00:00:00:00 format.
   * - `authMode`: `open`, `wep`, `wpa`, `wpa2`, or `wpa_wpa2`.
   * - `channel`: wifi channel 1..13.
   * - `hidden`: true if the SSID is hidden (ESP32/ESP8266 only)
   * - `rssi`: signal strength in dB in the range -110..0.
   *
   * Notes:
   *
   * - in order to perform the scan the station mode is turned on and remains on, use Wifi.disconnect() to turn it off again, if desired.
   * - only one scan can be in progress at a time.
   *
   * @url http://www.espruino.com/Reference#l_Wifi_scan
   */
  scan: (callback: any) => void;

  /**
   * Create a WiFi access point allowing stations to connect. If the password is NULL or an empty string the access point is open, otherwise it is encrypted.
   * The callback function is invoked once the access point is set-up and receives one `err` argument, which is NULL on success and contains an error message string otherwise.
   * The `options` object can contain the following properties.
   *
   * - `authMode` - The authentication mode to use.  Can be one of "open", "wpa2", "wpa", "wpa_wpa2". The default is open (but open access points are not recommended).
   * - `password` - The password for connecting stations if authMode is not open.
   * - `channel` - The channel to be used for the access point in the range 1..13. If the device is also connected to an access point as a station then that access point determines the channel.
   * - `hidden` - The flag if visible or not (0:visible, 1:hidden), default is visible.
   *
   * Notes:
   *
   * - the options should include the ability to set the AP IP and associated netmask, this is a future enhancement.
   * - the `startAP` call automatically enables AP mode. It can be disabled again by calling `stopAP`.
   *
   * @url http://www.espruino.com/Reference#l_Wifi_startAP
   */
  startAP: (ssid: any, options: any, callback: any) => void;

  /**
   * Retrieve the current overall WiFi configuration. This call provides general information that pertains to both station and access point modes. The getDetails and getAPDetails calls provide more in-depth information about the station and access point configurations, respectively. The status object has the following properties:
   *
   * - `station` - Status of the wifi station: `off`, `connecting`, ...
   * - `ap` - Status of the wifi access point: `disabled`, `enabled`.
   * - `mode` - The current operation mode: `off`, `sta`, `ap`, `sta+ap`.
   * - `phy` - Modulation standard configured: `11b`, `11g`, `11n` (the esp8266 docs are not very clear, but it is assumed that 11n means b/g/n). This setting limits the modulations that the radio will use, it does not indicate the current modulation used with a specific access point.
   * - `powersave` - Power saving mode: `none` (radio is on all the time), `ps-poll` (radio is off between beacons as determined by the access point's DTIM setting). Note that in 'ap' and 'sta+ap' modes the radio is always on, i.e., no power saving is possible.
   * - `savedMode` - The saved operation mode which will be applied at boot time: `off`, `sta`, `ap`, `sta+ap`.
   *
   * @url http://www.espruino.com/Reference#l_Wifi_getStatus
   */
  getStatus: (callback: any) => any;

  /**
   * Sets a number of global wifi configuration settings. All parameters are optional and which are passed determines which settings are updated.
   * The settings available are:
   *
   * - `phy` - Modulation standard to allow: `11b`, `11g`, `11n` (the esp8266 docs are not very clear, but it is assumed that 11n means b/g/n).
   * - `powersave` - Power saving mode: `none` (radio is on all the time), `ps-poll` (radio is off between beacons as determined by the access point's DTIM setting). Note that in 'ap' and 'sta+ap' modes the radio is always on, i.e., no power saving is possible.
   *
   * Note: esp8266 SDK programmers may be missing an "opmode" option to set the sta/ap/sta+ap operation mode. Please use connect/scan/disconnect/startAP/stopAP, which all set the esp8266 opmode indirectly.
   * @url http://www.espruino.com/Reference#l_Wifi_setConfig
   */
  setConfig: (settings: any) => void;

  /**
   * Retrieve the wifi station configuration and status details. The details object has the following properties:
   *
   * - `status` - Details about the wifi station connection, one of `off`, `connecting`, `wrong_password`, `no_ap_found`, `connect_fail`, or `connected`. The off, bad_password and connected states are stable, the other states are transient. The connecting state will either result in connected or one of the error states (bad_password, no_ap_found, connect_fail) and the no_ap_found and connect_fail states will result in a reconnection attempt after some interval.
   * - `rssi` - signal strength of the connected access point in dB, typically in the range -110 to 0, with anything greater than -30 being an excessively strong signal.
   * - `ssid` - SSID of the access point.
   * - `password` - the password used to connect to the access point.
   * - `authMode` - the authentication used: `open`, `wpa`, `wpa2`, `wpa_wpa2` (not currently supported).
   * - `savedSsid` - the SSID to connect to automatically at boot time, null if none.
   *
   * @url http://www.espruino.com/Reference#l_Wifi_getDetails
   */
  getDetails: (callback: any) => any;

  /**
   * Retrieve the current access point configuration and status.  The details object has the following properties:
   *
   * - `status` - Current access point status: `enabled` or `disabled`
   * - `stations` - an array of the stations connected to the access point.  This array may be empty.  Each entry in the array is an object describing the station which, at a minimum contains `ip` being the IP address of the station.
   * - `ssid` - SSID to broadcast.
   * - `password` - Password for authentication.
   * - `authMode` - the authentication required of stations: `open`, `wpa`, `wpa2`, `wpa_wpa2`.
   * - `hidden` - True if the SSID is hidden, false otherwise.
   * - `maxConn` - Max number of station connections supported.
   * - `savedSsid` - the SSID to broadcast automatically at boot time, null if the access point is to be disabled at boot.
   *
   * @url http://www.espruino.com/Reference#l_Wifi_getAPDetails
   */
  getAPDetails: (callback: any) => any;

  /**
   * On boards where this is not available, just issue the `connect` commands you need to run at startup from an `onInit` function.
   * Save the current wifi configuration (station and access point) to flash and automatically apply this configuration at boot time, unless `what=="clear"`, in which case the saved configuration is cleared such that wifi remains disabled at boot. The saved configuration includes:
   *
   * - mode (off/sta/ap/sta+ap)
   * - SSIDs & passwords
   * - phy (11b/g/n)
   * - powersave setting
   * - DHCP hostname
   *
   * @url http://www.espruino.com/Reference#l_Wifi_save
   */
  save: (what: any) => void;

  /**
   * Restores the saved Wifi configuration from flash. See `Wifi.save()`.
   * @url http://www.espruino.com/Reference#l_Wifi_restore
   */
  restore: () => void;

  /**
   * Return the station IP information in an object as follows:
   *
   * - ip - IP address as string (e.g. "192.168.1.5")
   * - netmask - The interface netmask as string (ESP8266/ESP32 only)
   * - gw - The network gateway as string (ESP8266/ESP32 only)
   * - mac - The MAC address as string of the form 00:00:00:00:00:00
   *
   * Note that the `ip`, `netmask`, and `gw` fields are omitted if no connection is established:
   * @url http://www.espruino.com/Reference#l_Wifi_getIP
   */
  getIP: (callback: any) => any;

  /**
   * Return the access point IP information in an object which contains:
   *
   * - ip - IP address as string (typ "192.168.4.1")
   * - netmask - The interface netmask as string
   * - gw - The network gateway as string
   * - mac - The MAC address as string of the form 00:00:00:00:00:00
   *
   * @url http://www.espruino.com/Reference#l_Wifi_getAPIP
   */
  getAPIP: (callback: any) => any;

  /**
   * Lookup the hostname and invoke a callback with the IP address as integer argument. If the lookup fails, the callback is invoked with a null argument.
   * **Note:** only a single hostname lookup can be made at a time, concurrent lookups are not supported.
   * @url http://www.espruino.com/Reference#l_Wifi_getHostByName
   */
  getHostByName: (hostname: any, callback: any) => void;

  /**
   * Returns the hostname announced to the DHCP server and broadcast via mDNS when connecting to an access point.
   * @url http://www.espruino.com/Reference#l_Wifi_getHostname
   */
  getHostname: (callback: any) => any;

  /**
   * Set the hostname. Depending on implemenation, the hostname is sent with every DHCP request and is broadcast via mDNS. The DHCP hostname may be visible in the access point and may be forwarded into DNS as hostname.local.
   * If a DHCP lease currently exists changing the hostname will cause a disconnect and reconnect in order to transmit the change to the DHCP server.
   * The mDNS announcement also includes an announcement for the "espruino" service.
   * @url http://www.espruino.com/Reference#l_Wifi_setHostname
   */
  setHostname: (hostname: any, callback: any) => void;

  /**
   * Starts the SNTP (Simple Network Time Protocol) service to keep the clock synchronized with the specified server. Note that the time zone is really just an offset to UTC and doesn't handle daylight savings time.
   * The interval determines how often the time server is queried and Espruino's time is synchronized. The initial synchronization occurs asynchronously after setSNTP returns.
   * @url http://www.espruino.com/Reference#l_Wifi_setSNTP
   */
  setSNTP: (server: any, tz_offset: any) => void;

  /**
   * The `settings` object must contain the following properties.
   *
   * - `ip` IP address as string (e.g. "192.168.5.100")
   * - `gw`  The network gateway as string (e.g. "192.168.5.1")
   * - `netmask` The interface netmask as string (e.g. "255.255.255.0")
   *
   * @url http://www.espruino.com/Reference#l_Wifi_setIP
   */
  setIP: (settings: any, callback: any) => void;

  /**
   * The `settings` object must contain the following properties.
   *
   * - `ip` IP address as string (e.g. "192.168.5.100")
   * - `gw`  The network gateway as string (e.g. "192.168.5.1")
   * - `netmask` The interface netmask as string (e.g. "255.255.255.0")
   *
   * @url http://www.espruino.com/Reference#l_Wifi_setAPIP
   */
  setAPIP: (settings: any, callback: any) => void;

  /**
   * Issues a ping to the given host, and calls a callback with the time when the ping is received.
   * @url http://www.espruino.com/Reference#l_Wifi_ping
   */
  ping: (hostname: any, callback: any) => void;

  /**
   * Switch to using a higher communication speed with the WiFi module.
   *
   * - `true` = 921600 baud
   * - `false` = 115200
   * - `1843200` (or any number) = use a specific baud rate.
   * - eg. `wifi.turbo(true,callback)` or `wifi.turbo(1843200,callback)`
   *
   * @url http://www.espruino.com/Reference#l_Wifi_turbo
   */
  turbo: (enable: any, callback: any) => void;

};

/**
 * Library that initialises a network device that calls into JavaScript
 * @url http://www.espruino.com/Reference#l_NetworkJS_undefined
 */
declare const NetworkJS: {
  /**
   * Initialise the network using the callbacks given and return the first argument. For instance:
   * <pre>`<span class="hljs-title function_">require</span>(<span class="hljs-string">"NetworkJS"</span>).<span class="hljs-property">create</span>({
   *   <span class="hljs-variable">create</span> : <span class="hljs-title function_">function</span>(<span class="hljs-params">host</span>, <span class="hljs-params">port</span>, <span class="hljs-params">socketType</span>, <span class="hljs-params">options</span>) {
   *     <span class="hljs-comment">// Create a socket and return its index, host is a string, port is an integer.</span>
   *     <span class="hljs-comment">// If host isn&#x27;t defined, create a server socket</span>
   *     <span class="hljs-variable">console</span>.<span class="hljs-property">log</span>(<span class="hljs-string">"Create"</span>,<span class="hljs-variable">host</span>,<span class="hljs-variable">port</span>);
   *     <span class="hljs-keyword">return</span> <span class="hljs-number">1</span>;
   *   },
   *   <span class="hljs-variable">close</span> : <span class="hljs-title function_">function</span>(<span class="hljs-params">sckt</span>) {
   *     <span class="hljs-comment">// Close the socket. returns nothing</span>
   *   },
   *   <span class="hljs-variable">accept</span> : <span class="hljs-title function_">function</span>(<span class="hljs-params">sckt</span>) {
   *     <span class="hljs-comment">// Accept the connection on the server socket. Returns socket number or -1 if no connection</span>
   *     <span class="hljs-keyword">return</span> <span class="hljs-number">-1</span>;
   *   },
   *   <span class="hljs-variable">recv</span> : <span class="hljs-title function_">function</span>(<span class="hljs-params">sckt</span>, <span class="hljs-params">maxLen</span>, <span class="hljs-params">socketType</span>) {
   *     <span class="hljs-comment">// Receive data. Returns a string (even if empty).</span>
   *     <span class="hljs-comment">// If non-string returned, socket is then closed</span>
   *     <span class="hljs-keyword">return</span> <span class="hljs-literal">null</span>;<span class="hljs-comment">//or "";</span>
   *   },
   *   <span class="hljs-variable">send</span> : <span class="hljs-title function_">function</span>(<span class="hljs-params">sckt</span>, <span class="hljs-params">data</span>, <span class="hljs-params">socketType</span>) {
   *     <span class="hljs-comment">// Send data (as string). Returns the number of bytes sent - 0 is ok.</span>
   *     <span class="hljs-comment">// Less than 0</span>
   *     <span class="hljs-keyword">return</span> <span class="hljs-variable">data</span>.<span class="hljs-property">length</span>;
   *   }
   * });
   * `</pre>
   * `socketType` is an integer - 2 for UDP, or see SocketType in [https://github.com/espruino/Espruino/blob/master/libs/network/network.h](https://github.com/espruino/Espruino/blob/master/libs/network/network.h)
   * for more information.
   * @url http://www.espruino.com/Reference#l_NetworkJS_create
   */
  create: (obj: any) => any;

};

/**
 * Library for communication with the WIZnet Ethernet module
 * @url http://www.espruino.com/Reference#l_WIZnet_undefined
 */
declare const WIZnet: {
  /**
   * Initialise the WIZnet module and return an Ethernet object
   * @url http://www.espruino.com/Reference#l_WIZnet_connect
   */
  connect: (spi: any, cs: Pin) => Ethernet;

};

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
declare const url: {
  /**
   * A utility function to split a URL into parts
   * This is useful in web servers for instance when handling a request.
   * For instance `url.parse("/a?b=c&d=e",true)` returns `{"method":"GET","host":"","path":"/a?b=c&d=e","pathname":"/a","search":"?b=c&d=e","port":80,"query":{"b":"c","d":"e"}}`
   * @url http://www.espruino.com/Reference#l_url_parse
   */
  parse: (urlStr: any, parseQuery: boolean) => any;

};

/**
 * This library allows you to create TCPIP servers and clients
 * In order to use this, you will need an extra module to get network connectivity.
 * This is designed to be a cut-down version of the [Internet](http://nodejs.org/api/net.html">node.js library</a>. Please see the <a href="/Internet) page for more information on how to use it.
 * @url http://www.espruino.com/Reference#l_net_undefined
 */
declare const net: {
  /**
   * Create a Server
   * When a request to the server is made, the callback is called. In the callback you can use the methods on the connection to send data. You can also add `connection.on('data',function() { ... })` to listen for received data
   * @url http://www.espruino.com/Reference#l_net_createServer
   */
  createServer: (callback: any) => Server;

  /**
   * Create a TCP socket connection
   * @url http://www.espruino.com/Reference#l_net_connect
   */
  connect: (options: any, callback: any) => Socket;

};

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
   * This function writes the `data` argument as a string. Data that is passed in
   * (including arrays) will be converted to a string with the normal JavaScript
   * `toString` method.
   * If you wish to send binary data then you need to convert that data directly to a
   * String. This can be done with `String.fromCharCode`, however it's often easier
   * and faster to use the Espruino-specific `E.toString`, which will read its arguments
   * as an array of bytes and convert that to a String:
   * <pre>`<span class="hljs-attribute">socket</span>.write(E.toString([<span class="hljs-number">0</span>,<span class="hljs-number">1</span>,<span class="hljs-number">2</span>,<span class="hljs-number">3</span>,<span class="hljs-number">4</span>,<span class="hljs-number">5</span>]));
   * `</pre>
   * If you need to send something other than bytes, you can use 'Typed Arrays', or
   * even `DataView`:
   * <pre>`var d = <span class="hljs-keyword">new</span> <span class="hljs-constructor">DataView(<span class="hljs-params">new</span> ArrayBuffer(8)</span>); <span class="hljs-comment">// 8 byte array buffer</span>
   * d.set<span class="hljs-constructor">Float32(0, 765.3532564)</span>; <span class="hljs-comment">// write float at bytes 0-3</span>
   * d.set<span class="hljs-constructor">Int8(4, 42)</span>; <span class="hljs-comment">// write int8 at byte 4</span>
   * socket.write(<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span><span class="hljs-keyword">to</span><span class="hljs-constructor">String(<span class="hljs-params">d</span>.<span class="hljs-params">buffer</span>)</span>)
   * `</pre>
   * @url http://www.espruino.com/Reference#l_Socket_write
   */
  write: (data: any) => boolean;

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
declare const dgram: {
  /**
   * Create a UDP socket
   * @url http://www.espruino.com/Reference#l_dgram_createSocket
   */
  createSocket: (type: any, callback: any) => dgramSocket;

};

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
declare const tls: {
  /**
   * Create a socket connection using TLS
   * Options can have `ca`, `key` and `cert` fields, which should be the decoded content of the certificate.
   * <pre>`var <span class="hljs-keyword">options</span> = url.parse(<span class="hljs-string">"localhost:1234"</span>);
   * <span class="hljs-keyword">options</span>.<span class="hljs-keyword">key</span> = atob(<span class="hljs-string">"MIIJKQ ... OZs08C"</span>);
   * <span class="hljs-keyword">options</span>.cert = atob(<span class="hljs-string">"MIIFi ... Uf93rN+"</span>);
   * <span class="hljs-keyword">options</span>.ca = atob(<span class="hljs-string">"MIIFgDCC ... GosQML4sc="</span>);
   * require(<span class="hljs-string">"tls"</span>).connect(<span class="hljs-keyword">options</span>, ... );
   * `</pre>
   * If you have the certificates as `.pem` files, you need to load these files, take the information between the lines beginning with `----`, remove the newlines from it so you have raw base64, and then feed it into `atob` as above.
   * You can also:
   *
   * - Just specify the filename (<=100 characters) and it will be loaded and parsed if you have an SD card connected. For instance `options.key = "key.pem";`
   * - Specify a function, which will be called to retrieve the data.  For instance `options.key = function() { eeprom.load_my_info(); };
   *
   * For more information about generating and using certificates, see:
   * [https://engineering.circle.com/https-authorized-certs-with-node-js/](https://engineering.circle.com/https-authorized-certs-with-node-js/)
   * (You'll need to use 2048 bit certificates as opposed to 4096 bit shown above)
   * @url http://www.espruino.com/Reference#l_tls_connect
   */
  connect: (options: any, callback: any) => Socket;

};

/**
 * Simple library for compression/decompression using [LZSS](https://github.com/atomicobject/heatshrink">heatshrink</a>, an <a href="https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Storer%E2%80%93Szymanski) compression tool.
 * Espruino uses heatshrink internally to compress RAM down to fit in Flash memory when `save()` is used. This just exposes that functionality.
 * Functions here take and return buffers of data. There is no support for streaming, so both the compressed and decompressed data must be able to fit in memory at the same time.
 * @url http://www.espruino.com/Reference#l_heatshrink_undefined
 */
declare const heatshrink: {
  /**
   * @url http://www.espruino.com/Reference#l_heatshrink_compress
   */
  compress: (data: any) => ArrayBuffer;

  /**
   * @url http://www.espruino.com/Reference#l_heatshrink_decompress
   */
  decompress: (data: any) => ArrayBuffer;

};

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
declare const ESP32: {
  /**
   * @url http://www.espruino.com/Reference#l_ESP32_setAtten
   */
  setAtten: (pin: Pin, atten: number) => void;

  /**
   * Perform a hardware reset/reboot of the ESP32.
   * @url http://www.espruino.com/Reference#l_ESP32_reboot
   */
  reboot: () => void;

  /**
   * Put device in deepsleep state for "us" microseconds.
   * @url http://www.espruino.com/Reference#l_ESP32_deepSleep
   */
  deepSleep: (us: number) => void;

  /**
   * Returns an object that contains details about the state of the ESP32 with the following fields:
   *
   * - `sdkVersion`   - Version of the SDK.
   * - `freeHeap`     - Amount of free heap in bytes.
   * - `BLE`			 - Status of BLE, enabled if true.
   * - `Wifi`		 - Status of Wifi, enabled if true.
   * - `minHeap`      - Minimum heap, calculated by heap_caps_get_minimum_free_size
   *
   * @url http://www.espruino.com/Reference#l_ESP32_getState
   */
  getState: () => any;

  /**
   * @url http://www.espruino.com/Reference#l_ESP32_setBLE_Debug
   */
  setBLE_Debug: (level: number) => void;

  /**
   * Switches Bluetooth off/on, removes saved code from Flash, resets the board,
   * and on restart creates jsVars depending on available heap (actual additional 1800)
   * @url http://www.espruino.com/Reference#l_ESP32_enableBLE
   */
  enableBLE: (enable: boolean) => void;

  /**
   * Switches Wifi off/on, removes saved code from Flash, resets the board,
   * and on restart creates jsVars depending on available heap (actual additional 3900)
   * @url http://www.espruino.com/Reference#l_ESP32_enableWifi
   */
  enableWifi: (enable: boolean) => void;

};

/**
 * This is the built-in class for the Arduino-style pin namings on ST Nucleo boards
 * @url http://www.espruino.com/Reference#Nucleo
 */
declare const Nucleo: {
  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A0
   */
  A0: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A1
   */
  A1: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A2
   */
  A2: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A3
   */
  A3: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A4
   */
  A4: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_A5
   */
  A5: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D0
   */
  D0: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D1
   */
  D1: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D2
   */
  D2: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D3
   */
  D3: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D4
   */
  D4: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D5
   */
  D5: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D6
   */
  D6: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D7
   */
  D7: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D8
   */
  D8: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D9
   */
  D9: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D10
   */
  D10: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D11
   */
  D11: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D12
   */
  D12: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D13
   */
  D13: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D14
   */
  D14: Pin

  /**
   * @url http://www.espruino.com/Reference#l_Nucleo_D15
   */
  D15: Pin

};

/**
 * This is a built-in class to allow you to use the ESP8266 NodeMCU boards's pin namings to access pins. It is only available on ESP8266-based boards.
 * @url http://www.espruino.com/Reference#NodeMCU
 */
declare const NodeMCU: {
  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_A0
   */
  A0: Pin

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D0
   */
  D0: Pin

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D1
   */
  D1: Pin

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D2
   */
  D2: Pin

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D3
   */
  D3: Pin

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D4
   */
  D4: Pin

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D5
   */
  D5: Pin

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D6
   */
  D6: Pin

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D7
   */
  D7: Pin

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D8
   */
  D8: Pin

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D9
   */
  D9: Pin

  /**
   * @url http://www.espruino.com/Reference#l_NodeMCU_D10
   */
  D10: Pin

};

/**
 * Create a software Serial port. This has limited functionality (only low baud rates), but it can work on any pins.
 * Use `Serial.setup` to configure this port.
 * @url http://www.espruino.com/Reference#l_Serial_Serial
 */
declare const Serial: {
  /**
   * Try and find a USART (Serial) hardware device that will work on this pin (eg. `Serial1`)
   * May return undefined if no device can be found.
   * @url http://www.espruino.com/Reference#l_Serial_find
   */
  find: (pin: Pin) => any;

};

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
   * Setup this Serial port with the given baud rate and options.
   * eg.
   * <pre>`Serial1.<span class="hljs-title function_ invoke__">setup</span>(<span class="hljs-number">9600</span>,{<span class="hljs-attr">rx</span>:a_pin, <span class="hljs-attr">tx</span>:a_pin});
   * `</pre>
   * The second argument can contain:
   * <pre>`{
   *   rx:pin,                           // Receive pin (data <span class="hljs-keyword">in</span> <span class="hljs-keyword">to</span> Espruino)
   *   tx:pin,                           // Transmit pin (data <span class="hljs-keyword">out</span> <span class="hljs-keyword">of</span> Espruino)
   *   ck:pin,                           // (<span class="hljs-keyword">default</span> <span class="hljs-keyword">none</span>) Clock Pin
   *   cts:pin,                          // (<span class="hljs-keyword">default</span> <span class="hljs-keyword">none</span>) Clear <span class="hljs-keyword">to</span> Send Pin
   *   bytesize:<span class="hljs-number">8</span>,                       // (<span class="hljs-keyword">default</span> <span class="hljs-number">8</span>)How many data bits - <span class="hljs-number">7</span> <span class="hljs-keyword">or</span> <span class="hljs-number">8</span>
   *   parity:<span class="hljs-keyword">null</span>/<span class="hljs-string">&#x27;none&#x27;</span>/<span class="hljs-string">&#x27;o&#x27;</span>/<span class="hljs-string">&#x27;odd&#x27;</span>/<span class="hljs-string">&#x27;e&#x27;</span>/<span class="hljs-string">&#x27;even&#x27;</span>,
   *                                     // (<span class="hljs-keyword">default</span> <span class="hljs-keyword">none</span>) Parity <span class="hljs-type">bit</span>
   *   stopbits:<span class="hljs-number">1</span>,                       // (<span class="hljs-keyword">default</span> <span class="hljs-number">1</span>) Number <span class="hljs-keyword">of</span> stop bits <span class="hljs-keyword">to</span> use
   *   flow:<span class="hljs-keyword">null</span>/undefined/<span class="hljs-string">&#x27;none&#x27;</span>/<span class="hljs-string">&#x27;xon&#x27;</span>, // (<span class="hljs-keyword">default</span> <span class="hljs-keyword">none</span>) software flow control
   *   <span class="hljs-type">path</span>:<span class="hljs-keyword">null</span>/undefined/string        // Linux <span class="hljs-keyword">Only</span> - the <span class="hljs-type">path</span> <span class="hljs-keyword">to</span> the <span class="hljs-type">Serial</span> device <span class="hljs-keyword">to</span> use
   *   errors:<span class="hljs-keyword">false</span>                      // (<span class="hljs-keyword">default</span> <span class="hljs-keyword">false</span>) whether <span class="hljs-keyword">to</span> forward framing/parity errors
   * }
   * `</pre>
   * You can find out which pins to use by looking at [your board's reference page](#boards)
   * and searching for pins with the `UART`/`USART` markers.
   * If not specified in options, the default pins are used for rx and tx
   * (usually the lowest numbered pins on the lowest port that supports
   * this peripheral). `ck` and `cts` are not used unless specified.
   * Note that even after changing the RX and TX pins, if you have called setup
   * before then the previous RX and TX pins will still be connected to the Serial
   * port as well - until you set them to something else using `digitalWrite` or
   * `pinMode`.
   * Flow control can be xOn/xOff (`flow:'xon'`) or hardware flow control
   * (receive only) if `cts` is specified. If `cts` is set to a pin, the
   * pin's value will be 0 when Espruino is ready for data and 1 when it isn't.
   * By default, framing or parity errors don't create `framing` or `parity` events
   * on the `Serial` object because storing these errors uses up additional
   * storage in the queue. If you're intending to receive a lot of malformed
   * data then the queue might overflow `E.getErrorFlags()` would return `FIFO_FULL`.
   * However if you need to respond to `framing` or `parity` errors then
   * you'll need to use `errors:true` when initialising serial.
   * On Linux builds there is no default Serial device, so you must specify
   * a path to a device - for instance: `Serial1.setup(9600,{path:"/dev/ttyACM0"})`
   * You can also set up 'software serial' using code like:
   * <pre>`<span class="hljs-keyword">var</span> s = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Serial</span>();
   * s.<span class="hljs-title function_ invoke__">setup</span>(<span class="hljs-number">9600</span>,{<span class="hljs-attr">rx</span>:a_pin, <span class="hljs-attr">tx</span>:a_pin});
   * `</pre>
   * However software serial doesn't use `ck`, `cts`, `parity`, `flow` or `errors` parts of the initialisation object.
   * @url http://www.espruino.com/Reference#l_Serial_setup
   */
  setup: (baudrate: any, options: any) => void;

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
   *  **Note:** This function converts data to a string first, eg `Serial.print([1,2,3])` is equivalent to `Serial.print("1,2,3"). If you'd like to write raw bytes, use `Serial.write`.
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
   * Add data to this device as if it came directly from the input - it will be
   * returned via `serial.on('data', ...)`;
   * <pre>`Serial1.on(<span class="hljs-string">&#x27;data&#x27;</span>, <span class="hljs-keyword">function</span>(d) { print(<span class="hljs-string">"Got"</span>,d); });
   * Serial1.inject(<span class="hljs-string">&#x27;Hello World&#x27;</span>);
   * <span class="hljs-regexp">//</span> prints <span class="hljs-string">"Got Hel"</span>,<span class="hljs-string">"Got lo World"</span> (characters can be split over multiple callbacks)
   * `</pre>
   * This is most useful if you wish to send characters to Espruino's
   * REPL (console) while it is on another device.
   * @url http://www.espruino.com/Reference#l_Serial_inject
   */
  inject: (data: any) => void;

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
declare const EspruinoStorage: {
  /**
   * Erase the flash storage area. This will remove all files
   * created with `require("Storage").write(...)` as well
   * as any code saved with `save()` or `E.setBootCode()`.
   * @url http://www.espruino.com/Reference#l_Storage_eraseAll
   */
  eraseAll: () => void;

  /**
   * Erase a single file from the flash storage area.
   * **Note:** This function should be used with normal files, and not
   * `StorageFile`s created with `require("Storage").open(filename, ...)`
   * @url http://www.espruino.com/Reference#l_Storage_erase
   */
  erase: (name: any) => void;

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
  read: (name: any, offset: number, length: number) => any;

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
  readJSON: (name: any, noExceptions: boolean) => any;

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
  readArrayBuffer: (name: any) => any;

  /**
   * Write/create a file in the flash storage area. This is
   * nonvolatile and will not disappear when the device resets
   * or power is lost.
   * Simply write `require("Storage").write("MyFile", "Some data")` to write
   * a new file, and `require("Storage").read("MyFile")` to read it.
   * If you supply:
   *
   * - A String, it will be written as-is
   * - An array, will be written as a byte array (but read back as a String)
   * - An object, it will automatically be converted to
   * a JSON string before being written.
   *
   * **Note:** If an array is supplied it will not be converted to JSON.
   * To be explicit about the conversion you can use `Storage.writeJSON`
   * You may also create a file and then populate data later **as long as you
   * don't try and overwrite data that already exists**. For instance:
   * <pre>`var f = require(<span class="hljs-string">"Storage"</span>);
   * f.<span class="hljs-keyword">write</span>(<span class="hljs-string">"a"</span>,<span class="hljs-string">"Hello"</span>,<span class="hljs-number">0</span>,<span class="hljs-number">14</span>);
   * f.<span class="hljs-keyword">write</span>(<span class="hljs-string">"a"</span>,<span class="hljs-string">" "</span>,<span class="hljs-number">5</span>);
   * f.<span class="hljs-keyword">write</span>(<span class="hljs-string">"a"</span>,<span class="hljs-string">"World!!!"</span>,<span class="hljs-number">6</span>);
   * <span class="hljs-keyword">print</span>(f.<span class="hljs-keyword">read</span>(<span class="hljs-string">"a"</span>)); <span class="hljs-comment">// "Hello World!!!"</span>
   * f.<span class="hljs-keyword">write</span>(<span class="hljs-string">"a"</span>,<span class="hljs-string">" "</span>,<span class="hljs-number">0</span>); <span class="hljs-comment">// Writing to location 0 again will cause the file to be re-written</span>
   * <span class="hljs-keyword">print</span>(f.<span class="hljs-keyword">read</span>(<span class="hljs-string">"a"</span>)); <span class="hljs-comment">// " "</span>
   * `</pre>
   * This can be useful if you've got more data to write than you
   * have RAM available - for instance the Web IDE uses this method
   * to write large files into onboard storage.
   * **Note:** This function should be used with normal files, and not
   * `StorageFile`s created with `require("Storage").open(filename, ...)`
   * @url http://www.espruino.com/Reference#l_Storage_write
   */
  write: (name: any, data: any, offset: number, size: number) => boolean;

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
  writeJSON: (name: any, data: any) => boolean;

  /**
   * List all files in the flash storage area. An array of Strings is returned.
   * By default this lists files created by `StorageFile` (`require("Storage").open`)
   * which have a file number (`"\1"`/`"\2"`/etc) appended to them.
   * <pre>`<span class="hljs-comment">// All files</span>
   * <span class="hljs-function"><span class="hljs-title">require</span><span class="hljs-params">(<span class="hljs-string">"Storage"</span>)</span></span><span class="hljs-selector-class">.list</span>()
   * <span class="hljs-comment">// Files ending in &#x27;.js&#x27;</span>
   * <span class="hljs-function"><span class="hljs-title">require</span><span class="hljs-params">(<span class="hljs-string">"Storage"</span>)</span></span><span class="hljs-selector-class">.list</span>(/\.js$/)
   * <span class="hljs-comment">// All Storage Files</span>
   * <span class="hljs-function"><span class="hljs-title">require</span><span class="hljs-params">(<span class="hljs-string">"Storage"</span>)</span></span><span class="hljs-selector-class">.list</span>(undefined, {sf:true})
   * <span class="hljs-comment">// All normal files (eg created with Storage.write)</span>
   * <span class="hljs-function"><span class="hljs-title">require</span><span class="hljs-params">(<span class="hljs-string">"Storage"</span>)</span></span><span class="hljs-selector-class">.list</span>(undefined, {sf:false})
   * `</pre>
   * **Note:** This will output system files (eg. saved code) as well as
   * files that you may have written.
   * @url http://www.espruino.com/Reference#l_Storage_list
   */
  list: (regex: any, filter: any) => any;

  /**
   * List all files in the flash storage area matching the specfied regex (ignores StorageFiles),
   * and then hash their filenames *and* file locations.
   * Identical files may have different hashes (eg. if Storage is compacted and the file moves) but
   * the changes of different files having the same hash are extremely small.
   * <pre>`<span class="hljs-comment">// Hash files</span>
   * <span class="hljs-function"><span class="hljs-title">require</span><span class="hljs-params">(<span class="hljs-string">"Storage"</span>)</span></span><span class="hljs-selector-class">.hash</span>()
   * <span class="hljs-comment">// Files ending in &#x27;.boot.js&#x27;</span>
   * <span class="hljs-function"><span class="hljs-title">require</span><span class="hljs-params">(<span class="hljs-string">"Storage"</span>)</span></span><span class="hljs-selector-class">.hash</span>(/\.boot\.js$/)
   * `</pre>
   * **Note:** This function is used by Bangle.js as a way to cache files.
   * For instance the bootloader will add all `.boot.js` files together into
   * a single `.boot0` file, but it needs to know quickly whether anything has
   * changed.
   * @url http://www.espruino.com/Reference#l_Storage_hash
   */
  hash: (regex: any) => number;

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
  compact: () => void;

  /**
   * This writes information about all blocks in flash
   * memory to the console - and is only useful for debugging
   * flash storage.
   * @url http://www.espruino.com/Reference#l_Storage_debug
   */
  debug: () => void;

  /**
   * Return the amount of free bytes available in
   * Storage. Due to fragmentation there may be more
   * bytes available, but this represents the maximum
   * size of file that can be written.
   * @url http://www.espruino.com/Reference#l_Storage_getFree
   */
  getFree: () => number;

  /**
   * Returns:
   * <pre>`{
   *   totalBytes <span class="hljs-regexp">//</span> Amount of bytes <span class="hljs-keyword">in</span> filesystem
   *   freeBytes <span class="hljs-regexp">//</span> How many bytes are left at the end of storage?
   *   fileBytes <span class="hljs-regexp">//</span> How many bytes of allocated files <span class="hljs-keyword">do</span> we have?
   *   fileCount <span class="hljs-regexp">//</span> How many allocated files <span class="hljs-keyword">do</span> we have?
   *   trashBytes <span class="hljs-regexp">//</span> How many bytes of trash files <span class="hljs-keyword">do</span> we have?
   *   trashCount <span class="hljs-regexp">//</span> How many trash files <span class="hljs-keyword">do</span> we have?
   * }
   * `</pre>
   * @url http://www.espruino.com/Reference#l_Storage_getStats
   */
  getStats: () => any;

  /**
   * Writes a lookup table for files into Bangle.js's storage. This allows any file stored
   * up to that point to be accessed quickly.
   * @url http://www.espruino.com/Reference#l_Storage_optimise
   */
  optimise: () => void;

  /**
   * Open a file in the Storage area. This can be used for appending data
   * (normal read/write operations only write the entire file).
   * Please see `StorageFile` for more information (and examples).
   * **Note:** These files write through immediately - they do not need closing.
   * @url http://www.espruino.com/Reference#l_Storage_open
   */
  open: (name: any, mode: any) => StorageFile;

};

/**
 * These objects are created from `require("Storage").open`
 * and allow Storage items to be read/written.
 * The `Storage` library writes into Flash memory (which
 * can only be erased in chunks), and unlike a normal filesystem
 * it allocates files in one long contiguous area to allow them
 * to be accessed easily from Espruino.
 * This presents a challenge for `StorageFile` which allows you
 * to append to a file, so instead `StorageFile` stores files
 * in chunks. It uses the last character of the filename
 * to denote the chunk number (eg `"foobar\1"`, `"foobar\2"`, etc).
 * This means that while `StorageFile` files exist in the same
 * area as those from `Storage`, they should be
 * read using `Storage.open` (and not `Storage.read`).
 * <pre>`f = <span class="hljs-keyword">s</span>.<span class="hljs-keyword">open</span>(<span class="hljs-string">"foobar"</span>,<span class="hljs-string">"w"</span>)<span class="hljs-comment">;</span>
 * f.<span class="hljs-keyword">write</span>(<span class="hljs-string">"Hell"</span>)<span class="hljs-comment">;</span>
 * f.<span class="hljs-keyword">write</span>(<span class="hljs-string">"o World\n"</span>)<span class="hljs-comment">;</span>
 * f.<span class="hljs-keyword">write</span>(<span class="hljs-string">"Hello\n"</span>)<span class="hljs-comment">;</span>
 * f.<span class="hljs-keyword">write</span>(<span class="hljs-string">"World 2\n"</span>)<span class="hljs-comment">;</span>
 * <span class="hljs-comment">// there&#x27;s no need to call &#x27;close&#x27;</span>
 * <span class="hljs-comment">// then</span>
 * f = <span class="hljs-keyword">s</span>.<span class="hljs-keyword">open</span>(<span class="hljs-string">"foobar"</span>,<span class="hljs-string">"r"</span>)<span class="hljs-comment">;</span>
 * f.<span class="hljs-keyword">read</span>(<span class="hljs-number">13</span>) <span class="hljs-comment">// "Hello World\nH"</span>
 * f.<span class="hljs-keyword">read</span>(<span class="hljs-number">13</span>) <span class="hljs-comment">// "ello\nWorld 2\n"</span>
 * f.<span class="hljs-keyword">read</span>(<span class="hljs-number">13</span>) <span class="hljs-comment">// "Hello World 3"</span>
 * f.<span class="hljs-keyword">read</span>(<span class="hljs-number">13</span>) <span class="hljs-comment">// "\n"</span>
 * f.<span class="hljs-keyword">read</span>(<span class="hljs-number">13</span>) <span class="hljs-comment">// undefined</span>
 * <span class="hljs-comment">// or</span>
 * f = <span class="hljs-keyword">s</span>.<span class="hljs-keyword">open</span>(<span class="hljs-string">"foobar"</span>,<span class="hljs-string">"r"</span>)<span class="hljs-comment">;</span>
 * f.readLine() <span class="hljs-comment">// "Hello World\n"</span>
 * f.readLine() <span class="hljs-comment">// "Hello\n"</span>
 * f.readLine() <span class="hljs-comment">// "World 2\n"</span>
 * f.readLine() <span class="hljs-comment">// "Hello World 3\n"</span>
 * f.readLine() <span class="hljs-comment">// undefined</span>
 * <span class="hljs-comment">// now get rid of file</span>
 * f.erase()<span class="hljs-comment">;</span>
 * `</pre>
 * **Note:** `StorageFile` uses the fact that all bits of erased flash memory
 * are 1 to detect the end of a file. As such you should not write character
 * code 255 (`"\xFF"`) to these files.
 * @url http://www.espruino.com/Reference#StorageFile
 */
declare function StorageFile(): void;

type StorageFile = {
  /**
   * Read 'len' bytes of data from the file, and return a String containing those bytes.
   * If the end of the file is reached, the String may be smaller than the amount of bytes
   * requested, or if the file is already at the end, `undefined` is returned.
   * @url http://www.espruino.com/Reference#l_StorageFile_read
   */
  read: (len: number) => string;

  /**
   * Read a line of data from the file (up to and including `"\n"`)
   * @url http://www.espruino.com/Reference#l_StorageFile_readLine
   */
  readLine: () => string;

  /**
   * Return the length of the current file.
   * This requires Espruino to read the file from scratch,
   * which is not a fast operation.
   * @url http://www.espruino.com/Reference#l_StorageFile_getLength
   */
  getLength: () => number;

  /**
   * Append the given data to a file. You should not attempt to append  `"\xFF"` (character code 255).
   * @url http://www.espruino.com/Reference#l_StorageFile_write
   */
  write: (data: any) => void;

  /**
   * Erase this file
   * @url http://www.espruino.com/Reference#l_StorageFile_erase
   */
  erase: () => void;

}

/**
 * This is the built-in JavaScript class for Espruino utility functions.
 * @url http://www.espruino.com/Reference#E
 */
declare const E: {
  /**
   * Display a menu on the screen, and set up the buttons to navigate through it.
   * Supply an object containing menu items. When an item is selected, the
   * function it references will be executed. For example:
   * <pre>`<span class="hljs-keyword">var</span> <span class="hljs-built_in">boolean</span> = <span class="hljs-literal">false</span>;
   * <span class="hljs-keyword">var</span> <span class="hljs-built_in">number</span> = <span class="hljs-number">50</span>;
   * <span class="hljs-comment">// First menu</span>
   * <span class="hljs-keyword">var</span> mainmenu = {
   *   <span class="hljs-string">""</span> : { <span class="hljs-string">"title"</span> : <span class="hljs-string">"-- Main Menu --"</span> },
   *   <span class="hljs-string">"Backlight On"</span> : <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) { LED1.set(); },
   *   <span class="hljs-string">"Backlight Off"</span> : <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) { LED1.reset(); },
   *   <span class="hljs-string">"Submenu"</span> : <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) { E.showMenu(submenu); },
   *   <span class="hljs-string">"A Boolean"</span> : {
   *     <span class="hljs-attr">value</span> : <span class="hljs-built_in">boolean</span>,
   *     <span class="hljs-attr">format</span> : <span class="hljs-function"><span class="hljs-params">v</span> =></span> v?<span class="hljs-string">"On"</span>:<span class="hljs-string">"Off"</span>,
   *     <span class="hljs-attr">onchange</span> : <span class="hljs-function"><span class="hljs-params">v</span> =></span> { <span class="hljs-built_in">boolean</span>=v; }
   *   },
   *   <span class="hljs-string">"A Number"</span> : {
   *     <span class="hljs-attr">value</span> : <span class="hljs-built_in">number</span>,
   *     <span class="hljs-attr">min</span>:<span class="hljs-number">0</span>,<span class="hljs-attr">max</span>:<span class="hljs-number">100</span>,<span class="hljs-attr">step</span>:<span class="hljs-number">10</span>,
   *     <span class="hljs-attr">onchange</span> : <span class="hljs-function"><span class="hljs-params">v</span> =></span> { <span class="hljs-built_in">number</span>=v; }
   *   },
   *   <span class="hljs-string">"Exit"</span> : <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) { E.showMenu(); }, <span class="hljs-comment">// remove the menu</span>
   * };
   * <span class="hljs-comment">// Submenu</span>
   * <span class="hljs-keyword">var</span> submenu = {
   *   <span class="hljs-string">""</span> : { <span class="hljs-attr">title</span> : <span class="hljs-string">"-- SubMenu --"</span>,
   *          <span class="hljs-attr">back</span> : <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) { E.showMenu(mainmenu); } },
   *   <span class="hljs-string">"One"</span> : <span class="hljs-literal">undefined</span>, <span class="hljs-comment">// do nothing</span>
   *   <span class="hljs-string">"Two"</span> : <span class="hljs-literal">undefined</span> <span class="hljs-comment">// do nothing</span>
   * };
   * <span class="hljs-comment">// Actually display the menu</span>
   * E.showMenu(mainmenu);
   * `</pre>
   * The menu will stay onscreen and active until explicitly removed,
   * which you can do by calling `E.showMenu()` without arguments.
   * See [http://www.espruino.com/graphical_menu](http://www.espruino.com/graphical_menu) for more detailed information.
   * @url http://www.espruino.com/Reference#l_E_showMenu
   */
  showMenu: (menu: any) => any;

  /**
   * A utility function for displaying a full screen message on the screen.
   * Draws to the screen and returns immediately.
   * <pre>`E.showMessage(<span class="hljs-string">"These are<span class="hljs-subst">\n</span>Lots of<span class="hljs-subst">\n</span>Lines"</span>,<span class="hljs-string">"My Title"</span>)
   * `</pre>
   * @url http://www.espruino.com/Reference#l_E_showMessage
   */
  showMessage: (message: any, title: any) => void;

  /**
   * Displays a full screen prompt on the screen, with the buttons
   * requested (or `Yes` and `No` for defaults).
   * When the button is pressed the promise is resolved with the
   * requested values (for the `Yes` and `No` defaults, `true` and `false`
   * are returned).
   * <pre>`E.showPrompt(<span class="hljs-string">"Do you like fish?"</span>).the<span class="hljs-meta">n</span>(functio<span class="hljs-meta">n</span>(v) {
   *   <span class="hljs-keyword">if</span> (v) pr<span class="hljs-meta">int</span>(<span class="hljs-string">"&#x27;Yes&#x27; chosen"</span>);
   *   <span class="hljs-keyword">else</span> pr<span class="hljs-meta">int</span>(<span class="hljs-string">"&#x27;No&#x27; chosen"</span>);
   * });
   * // <span class="hljs-keyword">Or</span>
   * E.showPrompt(<span class="hljs-string">"How many fish\ndo you like?"</span>,{
   *   <span class="hljs-keyword">title</span>:<span class="hljs-string">"Fish"</span>,
   *   buttons : {<span class="hljs-string">"One"</span>:1,<span class="hljs-string">"Two"</span>:2,<span class="hljs-string">"Three"</span>:3}
   * }).the<span class="hljs-meta">n</span>(functio<span class="hljs-meta">n</span>(v) {
   *   pr<span class="hljs-meta">int</span>(<span class="hljs-string">"You like "</span>+v+<span class="hljs-string">" fish"</span>);
   * });
   * `</pre>
   * To remove the prompt, call `E.showPrompt()` with no arguments.
   * The second `options` argument can contain:
   * <pre>`{
   *   <span class="hljs-built_in">title</span>: <span class="hljs-string">"Hello"</span>,                      <span class="hljs-comment">// optional Title</span>
   *   buttons : {<span class="hljs-string">"Ok"</span>:<span class="hljs-literal">true</span>,<span class="hljs-string">"Cancel"</span>:<span class="hljs-literal">false</span>} <span class="hljs-comment">// list of button text & return value</span>
   * }
   * `</pre>
   * @url http://www.espruino.com/Reference#l_E_showPrompt
   */
  showPrompt: (message: any, options: any) => any;

  /**
   * @url http://www.espruino.com/Reference#l_E_showScroller
   */
  showScroller: () => void;

  /**
   * Displays a full screen prompt on the screen, with a single 'Ok' button.
   * When the button is pressed the promise is resolved.
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>show<span class="hljs-constructor">Alert(<span class="hljs-string">"Hello"</span>)</span>.<span class="hljs-keyword">then</span>(<span class="hljs-keyword">function</span><span class="hljs-literal">()</span> {
   *   print(<span class="hljs-string">"Ok pressed"</span>);
   * });
   * <span class="hljs-comment">// or</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>show<span class="hljs-constructor">Alert(<span class="hljs-string">"These are\nLots of\nLines"</span>,<span class="hljs-string">"My Title"</span>)</span>.<span class="hljs-keyword">then</span>(<span class="hljs-keyword">function</span><span class="hljs-literal">()</span> {
   *   print(<span class="hljs-string">"Ok pressed"</span>);
   * });
   * `</pre>
   * To remove the window, call `E.showAlert()` with no arguments.
   * @url http://www.espruino.com/Reference#l_E_showAlert
   */
  showAlert: (message: any, options: any) => any;

  /**
   * Setup the filesystem so that subsequent calls to `E.openFile` and `require('fs').*` will use an SD card on the supplied SPI device and pin.
   * It can even work using software SPI - for instance:
   * <pre>`<span class="hljs-regexp">//</span> DI/CMD = C7
   * <span class="hljs-regexp">//</span> DO/DAT0 = C8
   * <span class="hljs-regexp">//</span> CK/CLK = C9
   * <span class="hljs-regexp">//</span> CD<span class="hljs-regexp">/CS/</span>DAT3 = C6
   * var spi = new SPI();
   * spi.setup({mosi:C7, miso:C8, sck:C9});
   * E.connectSDCard(spi, C6);
   * console.log(require(<span class="hljs-string">"fs"</span>).readdirSync());
   * `</pre>
   * See [the page on File IO](http://www.espruino.com/File+IO) for more information.
   * **Note:** We'd strongly suggest you add a pullup resistor from CD/CS pin to 3.3v. It is
   * good practise to avoid accidental writes before Espruino is initialised, and some cards
   * will not work reliably without one.
   * **Note:** If you want to remove an SD card after you have started using it, you *must* call `E.unmountSD()` or you may cause damage to the card.
   * @url http://www.espruino.com/Reference#l_E_connectSDCard
   */
  connectSDCard: (spi: any, csPin: Pin) => void;

  /**
   * Unmount the SD card, so it can be removed. If you remove the SD card without calling this you may cause corruption, and you will be unable to access another SD card until you reset Espruino or call `E.unmountSD()`.
   * @url http://www.espruino.com/Reference#l_E_unmountSD
   */
  unmountSD: () => void;

  /**
   * Open a file
   * @url http://www.espruino.com/Reference#l_E_openFile
   */
  openFile: (path: any, mode: any) => EspruinoFile;

  /**
   * Change the paramters used for the flash filesystem.
   * The default address is the last 1Mb of 4Mb Flash, 0x300000, with total size of 1Mb.
   * Before first use the media needs to be formatted.
   * <pre>`fs=require(<span class="hljs-string">"fs"</span>);
   * <span class="hljs-keyword">try</span> {
   *   fs.readdir<span class="hljs-constructor">Sync()</span>;
   *  } catch (e) { <span class="hljs-comment">//&#x27;Uncaught Error: Unable to mount media : NO_FILESYSTEM&#x27;</span>
   *   console.log(&#x27;Formatting FS - only need <span class="hljs-keyword">to</span> <span class="hljs-keyword">do</span> once&#x27;);
   *   <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>flash<span class="hljs-constructor">FatFS({ <span class="hljs-params">format</span>: <span class="hljs-params">true</span> })</span>;
   * }
   * fs.write<span class="hljs-constructor">FileSync(<span class="hljs-string">"bang.txt"</span>, <span class="hljs-string">"This is the way the world ends\nnot with a bang but a whimper.\n"</span>)</span>;
   * fs.readdir<span class="hljs-constructor">Sync()</span>;
   * `</pre>
   * This will create a drive of 100 * 4096 bytes at 0x300000. Be careful with the selection of flash addresses as you can overwrite firmware!
   * You only need to format once, as each will erase the content.
   * `E.flashFatFS({ addr:0x300000,sectors:100,format:true });`
   * @url http://www.espruino.com/Reference#l_E_flashFatFS
   */
  flashFatFS: (options: any) => boolean;

  /**
   * Use the microcontroller's internal thermistor to work out the temperature.
   * On Puck.js v2.0 this will use the on-board PCT2075TP temperature sensor, but on other devices it may not be desperately well calibrated.
   * While this is implemented on Espruino boards, it may not be implemented on other devices. If so it'll return NaN.
   *  **Note:** This is not entirely accurate and varies by a few degrees from chip to chip. It measures the **die temperature**, so when connected to USB it could be reading 10 over degrees C above ambient temperature. When running from battery with `setDeepSleep(true)` it is much more accurate though.
   * @url http://www.espruino.com/Reference#l_E_getTemperature
   */
  getTemperature: () => number;

  /**
   * Check the internal voltage reference. To work out an actual voltage of an input pin, you can use `analogRead(pin)*E.getAnalogVRef()`
   *  **Note:** This value is calculated by reading the voltage on an internal voltage reference with the ADC.
   * It will be slightly noisy, so if you need this for accurate measurements we'd recommend that you call
   * this function several times and average the results.
   * While this is implemented on Espruino boards, it may not be implemented on other devices. If so it'll return NaN.
   * @url http://www.espruino.com/Reference#l_E_getAnalogVRef
   */
  getAnalogVRef: () => number;

  /**
   * ADVANCED: This is a great way to crash Espruino if you're not sure what you are doing
   * Create a native function that executes the code at the given address. Eg. `E.nativeCall(0x08012345,'double (double,double)')(1.1, 2.2)`
   * If you're executing a thumb function, you'll almost certainly need to set the bottom bit of the address to 1.
   * Note it's not guaranteed that the call signature you provide can be used - there are limits on the number of arguments allowed.
   * When supplying `data`, if it is a 'flat string' then it will be used directly, otherwise it'll be converted to a flat string and used.
   * @url http://www.espruino.com/Reference#l_E_nativeCall
   */
  nativeCall: (addr: number, sig: any, data: any) => any;

  /**
   * Clip a number to be between min and max (inclusive)
   * @url http://www.espruino.com/Reference#l_E_clip
   */
  clip: (x: number, min: number, max: number) => number;

  /**
   * Sum the contents of the given Array, String or ArrayBuffer and return the result
   * @url http://www.espruino.com/Reference#l_E_sum
   */
  sum: (arr: any) => number;

  /**
   * Work out the variance of the contents of the given Array, String or ArrayBuffer and return the result. This is equivalent to `v=0;for (i in arr) v+=Math.pow(mean-arr[i],2)`
   * @url http://www.espruino.com/Reference#l_E_variance
   */
  variance: (arr: any, mean: number) => number;

  /**
   * Convolve arr1 with arr2. This is equivalent to `v=0;for (i in arr1) v+=arr1[i] * arr2[(i+offset) % arr2.length]`
   * @url http://www.espruino.com/Reference#l_E_convolve
   */
  convolve: (arr1: any, arr2: any, offset: number) => number;

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
  FFT: (arrReal: any, arrImage: any, inverse: boolean) => void;

  /**
   * Enable the watchdog timer. This will reset Espruino if it isn't able to return to the idle loop within the timeout.
   * If `isAuto` is false, you must call `E.kickWatchdog()` yourself every so often or the chip will reset.
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>enable<span class="hljs-constructor">Watchdog(0.5)</span>; <span class="hljs-comment">// automatic mode                                                        </span>
   * <span class="hljs-keyword">while</span>(<span class="hljs-number">1</span>); <span class="hljs-comment">// Espruino will reboot because it has not been idle for 0.5 sec</span>
   * `</pre>
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>enable<span class="hljs-constructor">Watchdog(1, <span class="hljs-params">false</span>)</span>;
   * set<span class="hljs-constructor">Interval(<span class="hljs-params">function</span>()</span> {
   *   <span class="hljs-keyword">if</span> (everything_ok)
   *     <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>kick<span class="hljs-constructor">Watchdog()</span>;
   * }, <span class="hljs-number">500</span>);
   * <span class="hljs-comment">// Espruino will now reset if everything_ok is false,</span>
   * <span class="hljs-comment">// or if the interval fails to be called </span>
   * `</pre>
   * **NOTE:** This is only implemented on STM32 and nRF5x devices (all official Espruino boards).
   * **NOTE:** On STM32 (Pico, WiFi, Original) with `setDeepSleep(1)` you need to
   * explicitly wake Espruino up with an interval of less than the watchdog timeout or the watchdog will fire and
   * the board will reboot. You can do this with `setInterval("", time_in_milliseconds)`.
   * @url http://www.espruino.com/Reference#l_E_enableWatchdog
   */
  enableWatchdog: (timeout: number, isAuto: any) => void;

  /**
   * Kicks a Watchdog timer set up with `E.enableWatchdog(..., false)`. See
   * `E.enableWatchdog` for more information.
   * **NOTE:** This is only implemented on STM32 and nRF5x devices (all official Espruino boards).
   * @url http://www.espruino.com/Reference#l_E_kickWatchdog
   */
  kickWatchdog: () => void;

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
  getErrorFlags: () => any;

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
  getFlags: () => any;

  /**
   * Set the Espruino interpreter flags that control the way it handles your JavaScript code.
   * Run `E.getFlags()` and check its description for a list of available flags and their values.
   * @url http://www.espruino.com/Reference#l_E_setFlags
   */
  setFlags: (flags: any) => void;

  /**
   * @url http://www.espruino.com/Reference#l_E_pipe
   */
  pipe: (source: any, destination: any, options: any) => void;

  /**
   * Create an ArrayBuffer from the given string. This is done via a reference, not a copy - so it is very fast and memory efficient.
   * Note that this is an ArrayBuffer, not a Uint8Array. To get one of those, do: `new Uint8Array(E.toArrayBuffer('....'))`.
   * @url http://www.espruino.com/Reference#l_E_toArrayBuffer
   */
  toArrayBuffer: (str: any) => EspruinoArrayBufferView;

  /**
   * This creates a Uint8Array from the given arguments. These are handled as follows:
   *
   * - `Number` -> read as an integer, using the lowest 8 bits
   * - `String` -> use each character's numeric value (eg. `String.charCodeAt(...)`)
   * - `Array` -> Call itself on each element
   * - `ArrayBuffer` or Typed Array -> use the lowest 8 bits of each element
   * - `Object`:
   * - `{data:..., count: int}` -> call itself `object.count` times, on `object.data`
   * - `{callback : function}` -> call the given function, call itself on return value
   *
   *
   *
   * For example:
   * <pre>`E.toUint8Array([<span class="hljs-number">1</span>,<span class="hljs-number">2</span>,<span class="hljs-number">3</span>])
   * =new Uint8Array([<span class="hljs-number">1</span>, <span class="hljs-number">2</span>, <span class="hljs-number">3</span>])
   * E.toUint8Array([<span class="hljs-number">1</span>,{da<span class="hljs-symbol">ta:2</span>,cou<span class="hljs-symbol">nt:3</span>},<span class="hljs-number">3</span>])
   * =new Uint8Array([<span class="hljs-number">1</span>, <span class="hljs-number">2</span>, <span class="hljs-number">2</span>, <span class="hljs-number">2</span>, <span class="hljs-number">3</span>])
   * E.toUint8Array(<span class="hljs-string">"Hello"</span>)
   * =new Uint8Array([<span class="hljs-number">72</span>, <span class="hljs-number">101</span>, <span class="hljs-number">108</span>, <span class="hljs-number">108</span>, <span class="hljs-number">111</span>])
   * E.toUint8Array([<span class="hljs-string">"hi"</span>,{callba<span class="hljs-symbol">ck:fu</span>nction() { return [<span class="hljs-number">1</span>,<span class="hljs-number">2</span>,<span class="hljs-number">3</span>] }}])
   * =new Uint8Array([<span class="hljs-number">104</span>, <span class="hljs-number">105</span>, <span class="hljs-number">1</span>, <span class="hljs-number">2</span>, <span class="hljs-number">3</span>])
   * `</pre>
   * @url http://www.espruino.com/Reference#l_E_toUint8Array
   */
  toUint8Array: (args: any) => Uint8Array;

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
  toJS: (arg: any) => string;

  /**
   * This creates and returns a special type of string, which actually references
   * a specific memory address. It can be used in order to use sections of
   * Flash memory directly in Espruino (for example to execute code straight
   * from flash memory with `eval(E.memoryArea( ... ))`)
   * **Note:** This is only tested on STM32-based platforms (Espruino Original
   * and Espruino Pico) at the moment.
   * @url http://www.espruino.com/Reference#l_E_memoryArea
   */
  memoryArea: (addr: number, len: number) => string;

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
  setBootCode: (code: any, alwaysExec: boolean) => void;

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
  setClock: (options: any) => number;

  /**
   * Changes the device that the JS console (otherwise known as the REPL)
   * is attached to. If the console is on a device, that
   * device can be used for programming Espruino.
   * Rather than calling `Serial.setConsole` you can call
   * `E.setConsole("DeviceName")`.
   * This is particularly useful if you just want to
   * remove the console. `E.setConsole(null)` will
   * make the console completely inaccessible.
   * `device` may be `"Serial1"`,`"USB"`,`"Bluetooth"`,`"Telnet"`,`"Terminal"`,
   * any other *hardware* `Serial` device, or `null` to disable the console completely.
   * `options` is of the form:
   * <pre>`{
   *   force : <span class="hljs-built_in">bool</span> <span class="hljs-comment">// default false, force the console onto this device so it does not move</span>
   *                <span class="hljs-comment">//   if false, changes in connection state (eg USB/Bluetooth) can move</span>
   *                <span class="hljs-comment">//   the console automatically.</span>
   * }
   * `</pre>
   * @url http://www.espruino.com/Reference#l_E_setConsole
   */
  setConsole: (device: any, options: any) => void;

  /**
   * Returns the current console device - see `E.setConsole` for more information.
   * @url http://www.espruino.com/Reference#l_E_getConsole
   */
  getConsole: () => any;

  /**
   * Reverse the 8 bits in a byte, swapping MSB and LSB.
   * For example, `E.reverseByte(0b10010000) == 0b00001001`.
   * Note that you can reverse all the bytes in an array with: `arr = arr.map(E.reverseByte)`
   * @url http://www.espruino.com/Reference#l_E_reverseByte
   */
  reverseByte: (x: number) => number;

  /**
   * Output the current list of Utility Timer Tasks - for debugging only
   * @url http://www.espruino.com/Reference#l_E_dumpTimers
   */
  dumpTimers: () => void;

  /**
   * Dump any locked variables that aren't referenced from `global` - for debugging memory leaks only.
   * @url http://www.espruino.com/Reference#l_E_dumpLockedVars
   */
  dumpLockedVars: () => void;

  /**
   * Dump any locked variables that aren't referenced from `global` - for debugging memory leaks only.
   * @url http://www.espruino.com/Reference#l_E_dumpFreeList
   */
  dumpFreeList: () => void;

  /**
   * Show fragmentation.
   *
   * - ` ` is free space
   * - `#` is a normal variable
   * - `L` is a locked variable (address used, cannopt be moved)
   * - `=` represents data in a Flat String (must be contiguous)
   *
   * @url http://www.espruino.com/Reference#l_E_dumpFragmentation
   */
  dumpFragmentation: () => void;

  /**
   * Dumps a comma-separated list of all allocated variables
   * along with the variables they link to. Can be used
   * to visualise where memory is used.
   * @url http://www.espruino.com/Reference#l_E_dumpVariables
   */
  dumpVariables: () => void;

  /**
   * BETA: defragment memory!
   * @url http://www.espruino.com/Reference#l_E_defrag
   */
  defrag: () => void;

  /**
   * Return the number of variable blocks used by the supplied variable. This is
   * useful if you're running out of memory and you want to be able to see what
   * is taking up most of the available space.
   * If `depth>0` and the variable can be recursed into, an array listing all property
   * names (including internal Espruino names) and their sizes is returned. If
   * `depth>1` there is also a `more` field that inspects the objects's children's
   * children.
   * For instance `E.getSizeOf(function(a,b) { })` returns `5`.
   * But `E.getSizeOf(function(a,b) { }, 1)` returns:
   * <pre>` [
   *   {
   *     <span class="hljs-string">"name"</span>: <span class="hljs-string">"a"</span>,
   *     <span class="hljs-string">"size"</span>: <span class="hljs-number">1</span> },
   *   {
   *     <span class="hljs-string">"name"</span>: <span class="hljs-string">"b"</span>,
   *     <span class="hljs-string">"size"</span>: <span class="hljs-number">1</span> },
   *   {
   *     <span class="hljs-string">"name"</span>: <span class="hljs-string">"\xFFcod"</span>,
   *     <span class="hljs-string">"size"</span>: <span class="hljs-number">2</span> }
   *  ]
   * `</pre>
   * In this case setting depth to `2` will make no difference as there are
   * no more children to traverse.
   * See [http://www.espruino.com/Internals](http://www.espruino.com/Internals) for more information
   * @url http://www.espruino.com/Reference#l_E_getSizeOf
   */
  getSizeOf: (v: any, depth: number) => any;

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
  getAddressOf: (v: any, flatAddress: boolean) => number;

  /**
   * Take each element of the `from` array, look it up in `map` (or call `map(value,index)`
   * if it is a function), and write it into the corresponding
   * element in the `to` array.
   * You can use an array to map:
   * <pre>`var a = <span class="hljs-keyword">new</span> <span class="hljs-constructor">Uint8Array([1,2,3,1,2,3])</span>;
   * var lut = <span class="hljs-keyword">new</span> <span class="hljs-constructor">Uint8Array([128,129,130,131])</span>;
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>map<span class="hljs-constructor">InPlace(<span class="hljs-params">a</span>, <span class="hljs-params">a</span>, <span class="hljs-params">lut</span>)</span>;
   * <span class="hljs-comment">// a = [129, 130, 131, 129, 130, 131]</span>
   * `</pre>
   * Or `undefined` to pass straight through, or a function to do a normal 'mapping':
   * <pre>`var a = <span class="hljs-keyword">new</span> <span class="hljs-constructor">Uint8Array([0x12,0x34,0x56,0x78])</span>;
   * var b = <span class="hljs-keyword">new</span> <span class="hljs-constructor">Uint8Array(8)</span>;
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>map<span class="hljs-constructor">InPlace(<span class="hljs-params">a</span>, <span class="hljs-params">b</span>, <span class="hljs-params">undefined</span>)</span>; <span class="hljs-comment">// straight through</span>
   * <span class="hljs-comment">// b = [0x12,0x34,0x56,0x78,0,0,0,0]</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>map<span class="hljs-constructor">InPlace(<span class="hljs-params">a</span>, <span class="hljs-params">b</span>, (<span class="hljs-params">value</span>,<span class="hljs-params">index</span>)</span>=>index); <span class="hljs-comment">// write the index in the first 4 (because a.length==4)</span>
   * <span class="hljs-comment">// b = [0,1,2,3,4,0,0,0]</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>map<span class="hljs-constructor">InPlace(<span class="hljs-params">a</span>, <span class="hljs-params">b</span>, <span class="hljs-params">undefined</span>, 4)</span>; <span class="hljs-comment">// 4 bits from 8 bit input -> 2x as many outputs, msb-first</span>
   * <span class="hljs-comment">// b = [1, 2, 3, 4, 5, 6, 7, 8]</span>
   *  <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>map<span class="hljs-constructor">InPlace(<span class="hljs-params">a</span>, <span class="hljs-params">b</span>, <span class="hljs-params">undefined</span>, -4)</span>; <span class="hljs-comment">// 4 bits from 8 bit input -> 2x as many outputs, lsb-first</span>
   * <span class="hljs-comment">// b = [2, 1, 4, 3, 6, 5, 8, 7]</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>map<span class="hljs-constructor">InPlace(<span class="hljs-params">a</span>, <span class="hljs-params">b</span>, <span class="hljs-params">a</span>=><span class="hljs-params">a</span>+2, 4)</span>;
   * <span class="hljs-comment">// b = [3, 4, 5, 6, 7, 8, 9, 10]</span>
   * var b = <span class="hljs-keyword">new</span> <span class="hljs-constructor">Uint16Array(4)</span>;
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>map<span class="hljs-constructor">InPlace(<span class="hljs-params">a</span>, <span class="hljs-params">b</span>, <span class="hljs-params">undefined</span>, 12)</span>; <span class="hljs-comment">// 12 bits from 8 bit input, msb-first</span>
   * <span class="hljs-comment">// b = [0x123, 0x456, 0x780, 0]</span>
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>map<span class="hljs-constructor">InPlace(<span class="hljs-params">a</span>, <span class="hljs-params">b</span>, <span class="hljs-params">undefined</span>, -12)</span>; <span class="hljs-comment">// 12 bits from 8 bit input, lsb-first</span>
   * <span class="hljs-comment">// b = [0x412, 0x563, 0x078, 0]</span>
   * `</pre>
   * @url http://www.espruino.com/Reference#l_E_mapInPlace
   */
  mapInPlace: (from: any, to: any, map: any, bits: number) => void;

  /**
   * Search in an Object, Array, or Function
   * @url http://www.espruino.com/Reference#l_E_lookupNoCase
   */
  lookupNoCase: (haystack: any, needle: any, returnKey: boolean) => any;

  /**
   * Get the current interpreter state in a text form such that it can be copied to a new device
   * @url http://www.espruino.com/Reference#l_E_dumpStr
   */
  dumpStr: () => string;

  /**
   * Set the seed for the random number generator used by `Math.random()`.
   * @url http://www.espruino.com/Reference#l_E_srand
   */
  srand: (v: number) => void;

  /**
   * Unlike 'Math.random()' which uses a pseudo-random number generator, this
   * method reads from the internal voltage reference several times, xoring and
   * rotating to try and make a relatively random value from the noise in the
   * signal.
   * @url http://www.espruino.com/Reference#l_E_hwRand
   */
  hwRand: () => number;

  /**
   * Perform a standard 32 bit CRC (Cyclic redundancy check) on the supplied data (one byte at a time)
   * and return the result as an unsigned integer.
   * @url http://www.espruino.com/Reference#l_E_CRC32
   */
  CRC32: (data: any) => any;

  /**
   * Convert hue, saturation and brightness to red, green and blue (packed into an integer if `asArray==false` or an array if `asArray==true`).
   * This replaces `Graphics.setColorHSB` and `Graphics.setBgColorHSB`. On devices with 24 bit colour it can
   * be used as: `Graphics.setColor(E.HSBtoRGB(h, s, b))`
   * You can quickly set RGB items in an Array or Typed Array using `array.set(E.HSBtoRGB(h, s, b,true), offset)`,
   * which can be useful with arrays used with `require("neopixel").write`.
   * @url http://www.espruino.com/Reference#l_E_HSBtoRGB
   */
  HSBtoRGB: (hue: number, sat: number, bri: number, asArray: boolean) => any;

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
  setPassword: (password: any) => void;

  /**
   * If a password has been set with `E.setPassword()`, this will lock the console
   * so the password needs to be entered to unlock it.
   * @url http://www.espruino.com/Reference#l_E_lockConsole
   */
  lockConsole: () => void;

  /**
   * Set the time zone to be used with `Date` objects.
   * For example `E.setTimeZone(1)` will be GMT+0100
   * Note that `E.setTimeZone()` will have no effect when daylight savings time rules have been set with `E.setDST()`. The
   * timezone value will be stored, but never used so long as DST settings are in effect.
   * Time can be set with `setTime`.
   * @url http://www.espruino.com/Reference#l_E_setTimeZone
   */
  setTimeZone: (zone: number) => void;

  /**
   * Set the daylight savings time parameters to be used with `Date` objects.
   * The parameters are
   *
   * - dstOffset: The number of minutes daylight savings time adds to the clock (usually 60) - set to 0 to disable DST
   * - timezone: The time zone, in minutes, when DST is not in effect - positive east of Greenwich
   * - startDowNumber: The index of the day-of-week in the month when DST starts - 0 for first, 1 for second, 2 for third, 3 for fourth and 4 for last
   * - startDow: The day-of-week for the DST start calculation - 0 for Sunday, 6 for Saturday
   * - startMonth: The number of the month that DST starts - 0 for January, 11 for December
   * - startDayOffset: The number of days between the selected day-of-week and the actual day that DST starts - usually 0
   * - startTimeOfDay: The number of minutes elapsed in the day before DST starts
   * - endDowNumber: The index of the day-of-week in the month when DST ends - 0 for first, 1 for second, 2 for third, 3 for fourth and 4 for last
   * - endDow: The day-of-week for the DST end calculation - 0 for Sunday, 6 for Saturday
   * - endMonth: The number of the month that DST ends - 0 for January, 11 for December
   * - endDayOffset: The number of days between the selected day-of-week and the actual day that DST ends - usually 0
   * - endTimeOfDay: The number of minutes elapsed in the day before DST ends
   *
   * To determine what the `dowNumber, dow, month, dayOffset, timeOfDay` parameters should be, start with a sentence of the form
   * "DST starts on the last Sunday of March (plus 0 days) at 03:00". Since it's the last Sunday, we have startDowNumber = 4, and since
   * it's Sunday, we have startDow = 0. That it is March gives us startMonth = 2, and that the offset is zero days, we have
   * startDayOffset = 0. The time that DST starts gives us startTimeOfDay = 3*60.
   * "DST ends on the Friday before the second Sunday in November at 02:00" would give us endDowNumber=1, endDow=0, endMonth=10, endDayOffset=-2 and endTimeOfDay=120.
   * Using Ukraine as an example, we have a time which is 2 hours ahead of GMT in winter (EET) and 3 hours in summer (EEST). DST starts at 03:00 EET on the last Sunday in March,
   * and ends at 04:00 EEST on the last Sunday in October. So someone in Ukraine might call `E.setDST(60,120,4,0,2,0,180,4,0,9,0,240);`
   * Note that when DST parameters are set (i.e. when `dstOffset` is not zero), `E.setTimeZone()` has no effect.
   * @url http://www.espruino.com/Reference#l_E_setDST
   */
  setDST: (params: any) => void;

  /**
   * Create an object where every field accesses a specific 32 bit address in the microcontroller's memory. This
   * is perfect for accessing on-chip peripherals.
   * <pre>`<span class="hljs-comment">// for NRF52 based chips</span>
   * <span class="hljs-keyword">var</span> GPIO = E.<span class="hljs-title function_ invoke__">memoryMap</span>(<span class="hljs-number">0x50000000</span>,{<span class="hljs-attr">OUT</span>:<span class="hljs-number">0x504</span>, <span class="hljs-attr">OUTSET</span>:<span class="hljs-number">0x508</span>, <span class="hljs-attr">OUTCLR</span>:<span class="hljs-number">0x50C</span>, <span class="hljs-attr">IN</span>:<span class="hljs-number">0x510</span>, <span class="hljs-attr">DIR</span>:<span class="hljs-number">0x514</span>, <span class="hljs-attr">DIRSET</span>:<span class="hljs-number">0x518</span>, <span class="hljs-attr">DIRCLR</span>:<span class="hljs-number">0x51C</span>});
   * GPIO.DIRSET = <span class="hljs-number">1</span>; <span class="hljs-comment">// set GPIO0 to output</span>
   * GPIO.OUT ^= <span class="hljs-number">1</span>; <span class="hljs-comment">// toggle the output state of GPIO0</span>
   * `</pre>
   * @url http://www.espruino.com/Reference#l_E_memoryMap
   */
  memoryMap: (baseAddress: any, registers: any) => any;

  /**
   * Provide assembly to Espruino.
   * **This function is not part of Espruino**. Instead, it is detected
   * by the Espruino IDE (or command-line tools) at upload time and is
   * replaced with machine code and an `E.nativeCall` call.
   * See [the documentation on the Assembler](http://www.espruino.com/Assembler) for more information.
   * @url http://www.espruino.com/Reference#l_E_asm
   */
  asm: (callspec: any, assemblycode: any) => void;

  /**
   * Provides the ability to write C code inside your JavaScript file.
   * **This function is not part of Espruino**. Instead, it is detected
   * by the Espruino IDE (or command-line tools) at upload time, is sent
   * to our web service to be compiled, and is replaced with machine code
   * and an `E.nativeCall` call.
   * See [the documentation on Inline C](http://www.espruino.com/InlineC) for more information and examples.
   * @url http://www.espruino.com/Reference#l_E_compiledC
   */
  compiledC: (code: any) => void;

  /**
   * Forces a hard reboot of the microcontroller - as close as possible
   * to if the reset pin had been toggled.
   * **Note:** This is different to `reset()`, which performs a software
   * reset of Espruino (resetting the interpreter and pin states, but not
   * all the hardware)
   * @url http://www.espruino.com/Reference#l_E_reboot
   */
  reboot: () => void;

  /**
   * USB HID will only take effect next time you unplug and re-plug your Espruino. If you're
   * disconnecting it from power you'll have to make sure you have `save()`d after calling
   * this function.
   * @url http://www.espruino.com/Reference#l_E_setUSBHID
   */
  setUSBHID: (opts: any) => void;

  /**
   * @url http://www.espruino.com/Reference#l_E_sendUSBHID
   */
  sendUSBHID: (data: any) => boolean;

  /**
   * In devices that come with batteries, this function returns
   * the battery charge percentage as an integer between 0 and 100.
   * **Note:** this is an estimation only, based on battery voltage.
   * The temperature of the battery (as well as the load being drawn
   * from it at the time `E.getBattery` is called) will affect the
   * readings.
   * @url http://www.espruino.com/Reference#l_E_getBattery
   */
  getBattery: () => number;

  /**
   * Sets the RTC's prescaler's maximum value. This is the counter that counts up on each oscillation of the low
   * speed oscillator. When the prescaler counts to the value supplied, one second is deemed to have passed.
   * By default this is set to the oscillator's average speed as specified in the datasheet, and usually that is
   * fine. However on early [Espruino Pico](https://espruino.com//Pico) boards the STM32F4's internal oscillator could vary by as
   * much as 15% from the value in the datasheet. In that case you may want to alter this value to reflect the
   * true RTC speed for more accurate timekeeping.
   * To change the RTC's prescaler value to a computed value based on comparing against the high speed oscillator,
   * just run the following command, making sure it's done a few seconds after the board starts up:
   * <pre>`<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>set<span class="hljs-constructor">RTCPrescaler(E.<span class="hljs-params">getRTCPrescaler</span>(<span class="hljs-params">true</span>)</span>);
   * `</pre>
   * When changing the RTC prescaler, the RTC 'follower' counters are reset and it can take a second or two before
   * readings from getTime are stable again.
   * To test, you can connect an input pin to a known frequency square wave and then use `setWatch`. If you don't
   * have a frequency source handy, you can check against the high speed oscillator:
   * <pre>`<span class="hljs-comment">// connect pin B3 to B4</span>
   * <span class="hljs-built_in">analogWrite</span>(B3, <span class="hljs-number">0.5</span>, {freq:<span class="hljs-number">0.5</span>});
   * <span class="hljs-built_in">setWatch</span>(function(e) {
   *   <span class="hljs-built_in">print</span>(e.time - e.lastTime);
   * }, B4, {repeat:true});
   * `</pre>
   * **Note:** This is only used on official Espruino boards containing an STM32 microcontroller. Other boards
   * (even those using an STM32) don't use the RTC and so this has no effect.
   * @url http://www.espruino.com/Reference#l_E_setRTCPrescaler
   */
  setRTCPrescaler: (prescaler: number) => void;

  /**
   * Gets the RTC's current prescaler value if `calibrate` is undefined or false.
   * If `calibrate` is true, the low speed oscillator's speed is calibrated against the high speed
   * oscillator (usually +/- 20 ppm) and a suggested value to be fed into `E.setRTCPrescaler(...)` is returned.
   * See `E.setRTCPrescaler` for more information.
   * @url http://www.espruino.com/Reference#l_E_getRTCPrescaler
   */
  getRTCPrescaler: (calibrate: boolean) => number;

  /**
   * Decode a UTF8 string.
   *
   * - Any decoded character less than 256 gets passed straight through
   * - Otherwise if `lookup` is an array and an item with that char code exists in `lookup` then that is used
   * - Otherwise if `lookup` is an object and an item with that char code (as lowercase hex) exists in `lookup` then that is used
   * - Otherwise `replaceFn(charCode)` is called and the result used if `replaceFn` is a function
   * - If `replaceFn` is a string, that is used
   * - Or finally if nothing else matches, the character is ignored
   *
   * For instance:
   * <pre>`<span class="hljs-keyword">let</span> unicodeRemap = {
   *   <span class="hljs-number">0x20ac</span>:<span class="hljs-string">"\u0080"</span>, <span class="hljs-comment">// Euro symbol</span>
   *   <span class="hljs-number">0x2026</span>:<span class="hljs-string">"\u0085"</span>, <span class="hljs-comment">// Ellipsis</span>
   * };
   * <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">E</span>.</span></span>decode<span class="hljs-constructor">UTF8(<span class="hljs-string">"UTF-8 Euro: \u00e2\u0082\u00ac"</span>, <span class="hljs-params">unicodeRemap</span>, &#x27;[?]&#x27;)</span><span class="hljs-operator"> == </span><span class="hljs-string">"UTF-8 Euro: \u0080"</span>
   * `</pre>
   * @url http://www.espruino.com/Reference#l_E_decodeUTF8
   */
  decodeUTF8: (str: any, lookup: any, replaceFn: any) => any;

};

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

  /**
   * Get information about this pin and its capabilities. Of the form:
   * <pre>`{
   *   <span class="hljs-string">"port"</span>      : <span class="hljs-string">"A"</span>, <span class="hljs-comment">// the Pin&#x27;s port on the chip</span>
   *   <span class="hljs-string">"num"</span>       : 12, <span class="hljs-comment">// the Pin&#x27;s number</span>
   *   <span class="hljs-string">"in_addr"</span>   : 0x..., <span class="hljs-comment">// (if available) the address of the pin&#x27;s input address in bit-banded memory (can be used with peek)</span>
   *   <span class="hljs-string">"out_addr"</span>  : 0x..., <span class="hljs-comment">// (if available) the address of the pin&#x27;s output address in bit-banded memory (can be used with poke)</span>
   *   <span class="hljs-string">"analog"</span>    : { ADCs : [1], channel : 12 }, <span class="hljs-comment">// If analog input is available</span>
   *   <span class="hljs-string">"functions"</span> : {
   *     <span class="hljs-string">"TIM1"</span>:{<span class="hljs-keyword">type</span>:"CH1, af:0},
   *     <span class="hljs-string">"I2C3"</span>:{<span class="hljs-keyword">type</span>:<span class="hljs-string">"SCL"</span>, af:1}
   *   }
   * }
   * `</pre>
   * Will return undefined if pin is not valid.
   * @url http://www.espruino.com/Reference#l_Pin_getInfo
   */
  getInfo: () => any;

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
declare const Flash: {
  /**
   * Returns the start and length of the flash page containing the given address.
   * @url http://www.espruino.com/Reference#l_Flash_getPage
   */
  getPage: (addr: number) => any;

  /**
   * This method returns an array of objects of the form `{addr : #, length : #}`, representing
   * contiguous areas of flash memory in the chip that are not used for anything.
   * The memory areas returned are on page boundaries. This means that you can
   * safely erase the page containing any address here, and you won't risk
   * deleting part of the Espruino firmware.
   * @url http://www.espruino.com/Reference#l_Flash_getFree
   */
  getFree: () => any;

  /**
   * Erase a page of flash memory
   * @url http://www.espruino.com/Reference#l_Flash_erasePage
   */
  erasePage: (addr: any) => void;

  /**
   * Write data into memory at the given address
   * In flash memory you may only turn bits that are 1 into bits that are 0. If
   * you're writing data into an area that you have already written (so `read`
   * doesn't return all `0xFF`) you'll need to call `erasePage` to clear the
   * entire page.
   * @url http://www.espruino.com/Reference#l_Flash_write
   */
  write: (data: any, addr: number) => void;

  /**
   * Read flash memory from the given address
   * @url http://www.espruino.com/Reference#l_Flash_read
   */
  read: (length: number, addr: number) => any;

};

/**
 * Built-in class that caches the modules used by the `require` command
 * @url http://www.espruino.com/Reference#Modules
 */
declare const Modules: {
  /**
   * Return an array of module names that have been cached
   * @url http://www.espruino.com/Reference#l_Modules_getCached
   */
  getCached: () => any;

  /**
   * Remove the given module from the list of cached modules
   * @url http://www.espruino.com/Reference#l_Modules_removeCached
   */
  removeCached: (id: any) => void;

  /**
   * Remove all cached modules
   * @url http://www.espruino.com/Reference#l_Modules_removeAllCached
   */
  removeAllCached: () => void;

  /**
   * Add the given module to the cache
   * @url http://www.espruino.com/Reference#l_Modules_addCached
   */
  addCached: (id: any, sourcecode: any) => void;

};

/**
 * Create a software SPI port. This has limited functionality (no baud rate), but it can work on any pins.
 * Use `SPI.setup` to configure this port.
 * @url http://www.espruino.com/Reference#l_SPI_SPI
 */
declare const SPI: {
  /**
   * Try and find an SPI hardware device that will work on this pin (eg. `SPI1`)
   * May return undefined if no device can be found.
   * @url http://www.espruino.com/Reference#l_SPI_find
   */
  find: (pin: Pin) => any;

};

type SPI = {
  /**
   * Set up this SPI port as an SPI Master.
   * Options can contain the following (defaults are shown where relevant):
   * <pre>`{
   *   sck:pin,
   *   miso:pin,
   *   mosi:pin,
   *   baud:integer=<span class="hljs-number">100000</span>, <span class="hljs-regexp">//</span> ignored on software SPI
   *   mode:integer=<span class="hljs-number">0</span>, <span class="hljs-regexp">//</span> between <span class="hljs-number">0</span> and <span class="hljs-number">3</span>
   *   order:string=<span class="hljs-string">&#x27;msb&#x27;</span> <span class="hljs-regexp">//</span> can be <span class="hljs-string">&#x27;msb&#x27;</span> or <span class="hljs-string">&#x27;lsb&#x27;</span>
   *   bits:<span class="hljs-number">8</span> <span class="hljs-regexp">//</span> only available <span class="hljs-keyword">for</span> software SPI
   * }
   * `</pre>
   * If `sck`,`miso` and `mosi` are left out, they will automatically be chosen. However if one or more is specified then the unspecified pins will not be set up.
   * You can find out which pins to use by looking at [your board's reference page](#boards) and searching for pins with the `SPI` marker. Some boards such as those based on `nRF52` chips can have SPI on any pins, so don't have specific markings.
   * The SPI `mode` is between 0 and 3 - see [http://en.wikipedia.org/wiki/Serial_Peripheral_Interface_Bus#Clock_polarity_and_phase](http://en.wikipedia.org/wiki/Serial_Peripheral_Interface_Bus#Clock_polarity_and_phase)
   * On STM32F1-based parts, you cannot mix AF and non-AF pins (SPI pins are usually grouped on the chip - and you can't mix pins from two groups). Espruino will not warn you about this.
   * @url http://www.espruino.com/Reference#l_SPI_setup
   */
  setup: (options: any) => void;

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
declare const I2C: {
  /**
   * Try and find an I2C hardware device that will work on this pin (eg. `I2C1`)
   * May return undefined if no device can be found.
   * @url http://www.espruino.com/Reference#l_I2C_find
   */
  find: (pin: Pin) => any;

};

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
 * Show an image on the in-built 5x5 LED screen.
 * Image can be:
 *
 * - A number where each bit represents a pixel (so 25 bits). eg. `5` or `0x1FFFFFF`
 * - A string, eg: `show("10001")`. Newlines are ignored, and anything that is not
 * a space or `0` is treated as a 1.
 * - An array of 4 bytes (more will be ignored), eg `show([1,2,3,0])`
 *
 * For instance the following works for images:
 * <pre>`<span class="hljs-function"><span class="hljs-title">show</span>(<span class="hljs-string">"#   #"</span>+
 *      <span class="hljs-string">"  #  "</span>+
 *      <span class="hljs-string">"  #  "</span>+
 *      <span class="hljs-string">"#   #"</span>+
 *      <span class="hljs-string">" ### "</span>)</span>
 * `</pre>
 * This means you can also use Espruino's graphics library:
 * <pre>`<span class="hljs-selector-tag">var</span> g = Graphics<span class="hljs-selector-class">.createArrayBuffer</span>(<span class="hljs-number">5</span>,<span class="hljs-number">5</span>,<span class="hljs-number">1</span>)
 * g<span class="hljs-selector-class">.drawString</span>(<span class="hljs-string">"E"</span>,<span class="hljs-number">0</span>,<span class="hljs-number">0</span>)
 * <span class="hljs-function"><span class="hljs-title">show</span><span class="hljs-params">(g.buffer)</span></span>
 * `</pre>
 * @url http://www.espruino.com/Reference#l__global_show
 */
declare function show(image: any): void;

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
 *
 *  **Note:** if you didn't call `pinMode` beforehand then this function will also reset pin's state to `"output"`
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
 *
 *  **Note:** `digitalRead`/`digitalWrite`/etc set the pin mode automatically *unless* `pinMode` has been called first.
 * If you want `digitalRead`/etc to set the pin mode automatically after you have called `pinMode`, simply call it again
 * with no mode argument (`pinMode(pin)`), `auto` as the argument (`pinMode(pin, "auto")`), or with the 3rd 'automatic'
 * argument set to true (`pinMode(pin, "output", true)`).
 * @url http://www.espruino.com/Reference#l__global_pinMode
 */
declare function pinMode(pin: Pin, mode: any, automatic: boolean): void;

/**
 * Return the current mode of the given pin. See `pinMode` for more information on returned values.
 * @url http://www.espruino.com/Reference#l__global_getPinMode
 */
declare function getPinMode(pin: Pin): any;

/**
 * Shift an array of data out using the pins supplied *least significant bit first*,
 * for example:
 * <pre>`<span class="hljs-comment">// shift out to single clk+data</span>
 * shift<span class="hljs-constructor">Out(A0, { <span class="hljs-params">clk</span> : A1 }, [1,0,1,0])</span>;
 * `</pre>
 * <pre>`<span class="hljs-comment">// shift out a whole byte (like software SPI)</span>
 * shift<span class="hljs-constructor">Out(A0, { <span class="hljs-params">clk</span> : A1, <span class="hljs-params">repeat</span>: 8 }, [1,2,3,4])</span>;
 * `</pre>
 * <pre>`<span class="hljs-comment">// shift out via 4 data pins</span>
 * <span class="hljs-symbol">shiftOut</span>([<span class="hljs-built_in">A3</span>,<span class="hljs-built_in">A2</span>,<span class="hljs-built_in">A1</span>,A0], { clk : <span class="hljs-built_in">A4</span> }, [<span class="hljs-number">1</span>,<span class="hljs-number">2</span>,<span class="hljs-number">3</span>,<span class="hljs-number">4</span>])<span class="hljs-comment">;</span>
 * `</pre>
 * `options` is an object of the form:
 * <pre>`{
 *   clk : pin, // a pin <span class="hljs-keyword">to</span> use <span class="hljs-keyword">as</span> the clock (undefined = <span class="hljs-keyword">no</span> pin)
 *   clkPol : <span class="hljs-type">bool</span>, // clock polarity - <span class="hljs-keyword">default</span> <span class="hljs-keyword">is</span> <span class="hljs-number">0</span> (so <span class="hljs-number">1</span> normally, pulsing <span class="hljs-keyword">to</span> <span class="hljs-number">0</span> <span class="hljs-keyword">to</span> clock data <span class="hljs-keyword">in</span>)
 *   repeat : <span class="hljs-type">int</span>, // number <span class="hljs-keyword">of</span> clocks per <span class="hljs-keyword">array</span> item
 * }
 * `</pre>
 * Each item in the `data` array will be output to the pins, with the first
 * pin in the array being the MSB and the last the LSB, then the clock will be
 * pulsed in the polarity given.
 * `repeat` is the amount of times shift data out for each array item. For instance
 * we may want to shift 8 bits out through 2 pins - in which case we need to set
 * repeat to 4.
 * @url http://www.espruino.com/Reference#l__global_shiftOut
 */
declare function shiftOut(pins: any, options: any, data: any): void;

/**
 * Call the function specified when the pin changes. Watches set with `setWatch` can be removed using `clearWatch`.
 * If the `options` parameter is an object, it can contain the following information (all optional):
 * <pre>`{
 *    <span class="hljs-comment">// Whether to keep producing callbacks, or remove the watch after the first callback</span>
 *    repeat: <span class="hljs-keyword">true</span>/<span class="hljs-keyword">false</span>(<span class="hljs-keyword">default</span>),
 *    <span class="hljs-comment">// Trigger on the rising or falling edge of the signal. Can be a string, or 1=&#x27;rising&#x27;, -1=&#x27;falling&#x27;, 0=&#x27;both&#x27;</span>
 *    edge:<span class="hljs-string">&#x27;rising&#x27;</span>(<span class="hljs-keyword">default</span> <span class="hljs-keyword">for</span> built-in buttons)<span class="hljs-regexp">/&#x27;falling&#x27;/</span><span class="hljs-string">&#x27;both&#x27;</span>(<span class="hljs-keyword">default</span> <span class="hljs-keyword">for</span> pins),
 *    <span class="hljs-comment">// Use software-debouncing to stop multiple calls if a switch bounces</span>
 *    <span class="hljs-comment">// This is the time in milliseconds to wait for bounces to subside, or 0 to disable</span>
 *    debounce:<span class="hljs-number">10</span> (<span class="hljs-number">0</span> is <span class="hljs-keyword">default</span> <span class="hljs-keyword">for</span> pins, <span class="hljs-number">25</span> is <span class="hljs-keyword">default</span> <span class="hljs-keyword">for</span> built-in buttons),
 *    <span class="hljs-comment">// Advanced: If the function supplied is a &#x27;native&#x27; function (compiled or assembly)</span>
 *    <span class="hljs-comment">// setting irq:true will call that function in the interrupt itself</span>
 *    irq : <span class="hljs-keyword">false</span>(<span class="hljs-keyword">default</span>)
 *    <span class="hljs-comment">// Advanced: If specified, the given pin will be read whenever the watch is called</span>
 *    <span class="hljs-comment">// and the state will be included as a &#x27;data&#x27; field in the callback</span>
 *    data : pin
 *    <span class="hljs-comment">// Advanced: On Nordic devices, a watch may be &#x27;high&#x27; or &#x27;low&#x27; accuracy. By default low</span>
 *    <span class="hljs-comment">// accuracy is used (which is better for power consumption), but this means that</span>
 *    <span class="hljs-comment">// high speed pulses (less than 25us) may not be reliably received. Setting hispeed=true</span>
 *    <span class="hljs-comment">// allows for detecting high speed pulses at the expense of higher idle power consumption</span>
 *    hispeed : <span class="hljs-keyword">true</span>
 * }
 * `</pre>
 * The `function` callback is called with an argument, which is an object of type `{state:bool, time:float, lastTime:float}`.
 *
 * - `state` is whether the pin is currently a `1` or a `0`
 * - `time` is the time in seconds at which the pin changed state
 * - `lastTime` is the time in seconds at which the **pin last changed state**. When using `edge:'rising'` or `edge:'falling'`, this is not the same as when the function was last called.
 * - `data` is included if `data:pin` was specified in the options, and can be used for reading in clocked data
 *
 * For instance, if you want to measure the length of a positive pulse you could use `setWatch(function(e) { console.log(e.time-e.lastTime); }, BTN, { repeat:true, edge:'falling' });`.
 * This will only be called on the falling edge of the pulse, but will be able to measure the width of the pulse because `e.lastTime` is the time of the rising edge.
 * Internally, an interrupt writes the time of the pin's state change into a queue with the exact
 * time that it happened, and the function supplied to `setWatch` is executed only from the main
 * message loop. However, if the callback is a native function `void (bool state)` then you can
 * add `irq:true` to options, which will cause the function to be called from within the IRQ.
 * When doing this, interrupts will happen on both edges and there will be no debouncing.
 * **Note:** if you didn't call `pinMode` beforehand then this function will reset pin's state to `"input"`
 * **Note:** The STM32 chip (used in the [Pico](https://espruino.com//EspruinoBoard">Espruino Board</a> and <a href="/Pico)) cannot
 * watch two pins with the same number - eg `A0` and `B0`.
 * **Note:** On nRF52 chips (used in Puck.js, Pixl.js, MDBT42Q) `setWatch` disables the GPIO
 * output on that pin. In order to be able to write to the pin again you need to disable
 * the watch with `clearWatch`.
 * @url http://www.espruino.com/Reference#l__global_setWatch
 */
declare function setWatch(fn: any, pin: Pin, options: any): any;

/**
 * Clear the Watch that was created with setWatch. If no parameter is supplied, all watches will be removed.
 * To avoid accidentally deleting all Watches, if a parameter is supplied but is `undefined` then an Exception will be thrown.
 * @url http://www.espruino.com/Reference#l__global_clearWatch
 */
declare function clearWatch(id: any): void;

/**
 * A variable containing the arguments given to the function:
 * <pre>`function <span class="hljs-built_in">hello</span>() {
 *   console<span class="hljs-selector-class">.log</span>(arguments.length, JSON.stringify(arguments));
 * }
 * <span class="hljs-built_in">hello</span>()        <span class="hljs-comment">// 0 []</span>
 * <span class="hljs-built_in">hello</span>("Test")  <span class="hljs-comment">// 1 ["Test"]</span>
 * <span class="hljs-built_in">hello</span>(<span class="hljs-number">1</span>,<span class="hljs-number">2</span>,<span class="hljs-number">3</span>)   <span class="hljs-comment">// 3 [1,2,3]</span>
 * `</pre>
 * **Note:** Due to the way Espruino works this is doesn't behave exactly
 * the same as in normal JavaScript. The length of the arguments array
 * will never be less than the number of arguments specified in the
 * function declaration: `(function(a){ return arguments.length; })() == 1`.
 * Normal JavaScript interpreters would return `0` in the above case.
 * @url http://www.espruino.com/Reference#l__global_arguments
 */
declare const arguments: any;

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
 * Set the current system time in seconds (`time` can be a floating
 * point value).
 * This is used with `getTime`, the time reported from `setWatch`, as
 * well as when using `new Date()`.
 * `Date.prototype.getTime()` reports the time in milliseconds, so
 * you can set the time to a `Date` object using:
 * <pre>`<span class="hljs-keyword">set</span><span class="hljs-built_in">Time</span>((<span class="hljs-keyword">new</span> <span class="hljs-built_in">Date</span>(<span class="hljs-string">"Tue, 19 Feb 2019 10:57"</span>)).<span class="hljs-keyword">get</span><span class="hljs-built_in">Time</span>()/<span class="hljs-number">1000</span>)
 * `</pre>
 * To set the timezone for all new Dates, use `E.setTimeZone(hours)`.
 * @url http://www.espruino.com/Reference#l__global_setTime
 */
declare function setTime(time: number): void;

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

/**
 * Load the given module, and return the exported functions and variables.
 * For example:
 * <pre>`var s = <span class="hljs-built_in">require</span>(<span class="hljs-string">"Storage"</span>);
 * s.<span class="hljs-built_in">write</span>(<span class="hljs-string">"test"</span>, <span class="hljs-string">"hello world"</span>);
 * <span class="hljs-built_in">print</span>(s.<span class="hljs-built_in">read</span>(<span class="hljs-string">"test"</span>));
 * // prints <span class="hljs-string">"hello world"</span>
 * `</pre>
 * Check out [the page on Modules](https://espruino.com//Modules) for an explanation
 * of what modules are and how you can use them.
 * @url http://www.espruino.com/Reference#l__global_require
 */
declare function require(moduleName: any): any;
