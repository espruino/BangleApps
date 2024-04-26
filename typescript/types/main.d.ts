// Type definitions for Espruino latest
// Project: http://www.espruino.com/, https://github.com/espruino/espruinotools// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference path="other.d.ts" />

// TYPES

/**
 * Menu item that holds a boolean value.
 */
type MenuBooleanItem = {
  value: boolean;
  format?: (value: boolean) => string;
  onchange?: (value: boolean) => void;
};

/**
 * Menu item that holds a numerical value.
 */
type MenuNumberItem = {
  value: number;
  format?: (value: number) => string;
  onchange?: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  wrap?: boolean;
};

/**
 * Options passed to a menu.
 */
type MenuOptions = {
  title?: string;
  back?: () => void;
  selected?: number;
  fontHeight?: number;
  scroll?: number;
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
  cB?: number;
  cF?: number;
  cHB?: number;
  cHF?: number;
  predraw?: (g: Graphics) => void;
  preflip?: (g: Graphics, less: boolean, more: boolean) => void;
};

/**
 * Object containing data about a menu to pass to `E.showMenu`.
 */
type Menu = {
  ""?: MenuOptions;
  [key: string]:
    | MenuOptions
    | (() => void)
    | MenuBooleanItem
    | MenuNumberItem
    | { value: string; onchange?: () => void }
    | undefined;
};

/**
 * Menu instance.
 */
type MenuInstance = {
  draw: () => void;
  move: (n: number) => void;
  select: () => void;
};

declare const BTN1: Pin;
declare const BTN2: Pin;
declare const BTN3: Pin;
declare const BTN4: Pin;
declare const BTN5: Pin;

declare const g: Graphics<false>;

type WidgetArea = "tl" | "tr" | "bl" | "br";
type Widget = {
  area: WidgetArea;
  width: number;
  sortorder?: number;
  draw: (this: Widget, w: Widget) => void;
  x?: number;
  y?: number;
};
declare const WIDGETS: { [key: string]: Widget };

type ShortBoolean = boolean | 0 | 1;

type AccelData = {
  x: number;
  y: number;
  z: number;
  diff: number;
  mag: number;
};

type HealthStatus = {
  movement: number;
  steps: number;
  bpm: number;
  bpmConfidence: number;
};

type CompassData = {
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  dz: number;
  heading: number;
};

type GPSFix = {
  lat: number;
  lon: number;
  alt: number;
  speed: number;
  course: number;
  time: Date;
  satellites: number;
  fix: number;
  hdop: number
};

type PressureData = {
  temperature: number;
  pressure: number;
  altitude: number;
}

type TapAxis = -2 | -1 | 0 | 1 | 2;

type SwipeCallback = (directionLR: -1 | 0 | 1, directionUD?: -1 | 0 | 1) => void;

type TouchCallback = (button: number, xy?: { x: number, y: number }) => void;

type DragCallback = (event: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  b: 1 | 0;
}) => void;

type LCDMode =
  | "direct"
  | "doublebuffered"
  | "120x120"
  | "80x80"

type BangleOptions<Boolean = boolean> = {
  wakeOnBTN1: Boolean;
  wakeOnBTN2: Boolean;
  wakeOnBTN3: Boolean;
  wakeOnFaceUp: Boolean;
  wakeOnTouch: Boolean;
  wakeOnDoubleTap: Boolean;
  wakeOnTwist: Boolean;
  twistThreshold: number;
  twistMaxY: number;
  twistTimeout: number;
  gestureStartThresh: number;
  gestureEndThresh: number;
  gestureInactiveCount: number;
  gestureMinLength: number;
  powerSave: boolean;
  lockTimeout: number;
  lcdPowerTimeout: number;
  backlightTimeout: number;
  btnLoadTimeout: number;
};

type SetUIArg<Mode> = Mode | {
  mode: Mode,
  back?: () => void,
  remove?: () => void,
  redraw?: () => void,
};

type NRFFilters = {
  services?: string[];
  name?: string;
  namePrefix?: string;
  id?: string;
  serviceData?: object;
  manufacturerData?: object;
};

type NRFSecurityStatus = {
  advertising: boolean,
} & (
  {
    connected: true,
    encrypted: boolean,
    mitm_protected: boolean,
    bonded: boolean,
    connected_addr?: string,
  } | {
    connected: false,
    encrypted: false,
    mitm_protected: false,
    bonded: false,
  }
);

type ImageObject = {
  width: number;
  height: number;
  bpp?: number;
  buffer: ArrayBuffer | string;
  transparent?: number;
  palette?: Uint16Array;
};

type Image = string | ImageObject | ArrayBuffer | Graphics<true>;

type ColorResolvable = number | `#${string}`;

type FontName =
  | "4x4"
  | "4x4Numeric"
  | "4x5"
  | "4x5Numeric"
  | "4x8Numeric"
  | "5x7Numeric7Seg"
  | "5x9Numeric7Seg"
  | "6x8"
  | "6x12"
  | "7x11Numeric7Seg"
  | "8x12"
  | "8x16"
  | "Dennis8"
  | "Cherry6x10"
  | "Copasectic40x58Numeric"
  | "Dylex7x13"
  | "HaxorNarrow7x17"
  | "Sinclair"
  | "Teletext10x18Mode7"
  | "Teletext5x9Ascii"
  | "Teletext5x9Mode7"
  | "Vector";

type FontNameWithScaleFactor =
  | FontName
  | `${FontName}:${number}`
  | `${FontName}:${number}x${number}`;

type Theme = {
  fg: number;
  bg: number;
  fg2: number;
  bg2: number;
  fgH: number;
  bgH: number;
  dark: boolean;
};

type IntervalId = number & { _brand: "interval" };
type TimeoutId = number & { _brand: "timeout" };

type PinMode =
  | "analog"
  | "input"
  | "input_pullup"
  | "input_pulldown"
  | "output"
  | "opendrain"
  | "af_output"
  | "af_opendrain";

interface ArrayLike<T> {
  readonly length: number;
  readonly [n: number]: T;
}

type ErrorFlag =
  | "FIFO_FULL"
  | "BUFFER_FULL"
  | "CALLBACK"
  | "LOW_MEMORY"
  | "MEMORY"
  | "UART_OVERFLOW";

type Flag =
  | "deepSleep"
  | "pretokenise"
  | "unsafeFlash"
  | "unsyncFiles";

type Uint8ArrayResolvable =
  | number
  | string
  | Uint8ArrayResolvable[]
  | ArrayBuffer
  | ArrayBufferView
  | { data: Uint8ArrayResolvable, count: number }
  | { callback: () => Uint8ArrayResolvable }

type VariableSizeInformation = {
  name: string;
  size: number;
  more?: VariableSizeInformation;
};

type PipeOptions = {
  chunkSize?: number,
  end?: boolean,
  complete?: () => void,
};


// CLASSES

/**
 * A class to support some simple Queue handling for RTOS queues
 * @url http://www.espruino.com/Reference#Queue
 */
declare class Queue {
  /**
   * Creates a Queue Object
   * @constructor
   *
   * @param {any} queueName - Name of the queue
   * @returns {any} A Queue object
   * @url http://www.espruino.com/Reference#l_Queue_Queue
   */
  static new(queueName: any): any;

  /**
   * reads one character from queue, if available
   * @url http://www.espruino.com/Reference#l_Queue_read
   */
  read(): void;

  /**
   * Writes one character to queue
   *
   * @param {any} char - char to be send
   * @url http://www.espruino.com/Reference#l_Queue_writeChar
   */
  writeChar(char: any): void;

  /**
   * logs list of queues
   * @url http://www.espruino.com/Reference#l_Queue_log
   */
  log(): void;
}

/**
 * A class to support some simple Task handling for RTOS tasks
 * @url http://www.espruino.com/Reference#Task
 */
declare class Task {
  /**
   * Creates a Task Object
   * @constructor
   *
   * @param {any} taskName - Name of the task
   * @returns {any} A Task object
   * @url http://www.espruino.com/Reference#l_Task_Task
   */
  static new(taskName: any): any;

  /**
   * Suspend task, be careful not to suspend Espruino task itself
   * @url http://www.espruino.com/Reference#l_Task_suspend
   */
  suspend(): void;

  /**
   * Resumes a suspended task
   * @url http://www.espruino.com/Reference#l_Task_resume
   */
  resume(): void;

  /**
   * returns name of actual task
   * @returns {any} Name of current task
   * @url http://www.espruino.com/Reference#l_Task_getCurrent
   */
  getCurrent(): any;

  /**
   * Sends a binary notify to task
   * @url http://www.espruino.com/Reference#l_Task_notify
   */
  notify(): void;

  /**
   * logs list of tasks
   * @url http://www.espruino.com/Reference#l_Task_log
   */
  log(): void;
}

/**
 * A class to handle Timer on base of ESP32 Timer
 * @url http://www.espruino.com/Reference#Timer
 */
declare class Timer {
  /**
   * Creates a Timer Object
   * @constructor
   *
   * @param {any} timerName - Timer Name
   * @param {number} group - Timer group
   * @param {number} index - Timer index
   * @param {number} isrIndex - isr (0 = Espruino, 1 = test)
   * @returns {any} A Timer Object
   * @url http://www.espruino.com/Reference#l_Timer_Timer
   */
  static new(timerName: any, group: number, index: number, isrIndex: number): any;

  /**
   * Starts a timer
   *
   * @param {number} duration - duration of timmer in micro secs
   * @url http://www.espruino.com/Reference#l_Timer_start
   */
  start(duration: number): void;

  /**
   * Reschedules a timer, needs to be started at least once
   *
   * @param {number} duration - duration of timmer in micro secs
   * @url http://www.espruino.com/Reference#l_Timer_reschedule
   */
  reschedule(duration: number): void;

  /**
   * logs list of timers
   * @url http://www.espruino.com/Reference#l_Timer_log
   */
  log(): void;
}

/**
 * Class containing utility functions for the
 * [ESP32](http://www.espruino.com/ESP32)
 * @url http://www.espruino.com/Reference#ESP32
 */
declare class ESP32 {
  /**
   *
   * @param {Pin} pin - Pin for Analog read
   * @param {number} atten - Attenuate factor
   * @url http://www.espruino.com/Reference#l_ESP32_setAtten
   */
  static setAtten(pin: Pin, atten: number): void;

  /**
   * Perform a hardware reset/reboot of the ESP32.
   * @url http://www.espruino.com/Reference#l_ESP32_reboot
   */
  static reboot(): void;

  /**
   * Put device in deepsleep state for "us" microseconds.
   *
   * @param {number} us - Sleeptime in us
   * @url http://www.espruino.com/Reference#l_ESP32_deepSleep
   */
  static deepSleep(us: number): void;

  /**
   * Put device in deepsleep state until interrupted by pin "pin".
   * Eligible pin numbers are restricted to those [GPIOs designated
   * as RTC GPIOs](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/gpio.html#gpio-summary).
   *
   * @param {Pin} pin - Pin to trigger wakeup
   * @param {number} level - Logic level to trigger
   * @url http://www.espruino.com/Reference#l_ESP32_deepSleepExt0
   */
  static deepSleepExt0(pin: Pin, level: number): void;

  /**
   * Put device in deepsleep state until interrupted by pins in the "pinVar" array.
   * The trigger "mode" determines the pin state which will wake up the device.
   * Valid modes are:
   * * `0: ESP_EXT1_WAKEUP_ALL_LOW` - all nominated pins must be set LOW to trigger wakeup
   * * `1: ESP_EXT1_WAKEUP_ANY_HIGH` - any of nominated pins set HIGH will trigger wakeup
   * Eligible pin numbers are restricted to those [GPIOs designated
   * as RTC GPIOs](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/gpio.html#gpio-summary).
   *
   * @param {any} pinVar - Array of Pins to trigger wakeup
   * @param {number} mode - Trigger mode
   * @url http://www.espruino.com/Reference#l_ESP32_deepSleepExt1
   */
  static deepSleepExt1(pinVar: any, mode: number): void;

  /**
   * Returns a variable identifying the cause of wakeup from deep sleep.
   * Possible causes include:
   * * `0: ESP_SLEEP_WAKEUP_UNDEFINED` - reset was not caused by exit from deep sleep
   * * `2: ESP_SLEEP_WAKEUP_EXT0` - Wakeup caused by external signal using RTC_IO
   * * `3: ESP_SLEEP_WAKEUP_EXT1` - Wakeup caused by external signal using RTC_CNTL
   * * `4: ESP_SLEEP_WAKEUP_TIMER` - Wakeup caused by timer
   * * `5: ESP_SLEEP_WAKEUP_TOUCHPAD` - Wakeup caused by touchpad
   * * `6: ESP_SLEEP_WAKEUP_ULP` - Wakeup caused by ULP program
   * @returns {number} The cause of the ESP32's wakeup from sleep
   * @url http://www.espruino.com/Reference#l_ESP32_getWakeupCause
   */
  static getWakeupCause(): number;

  /**
   * Returns an object that contains details about the state of the ESP32 with the
   * following fields:
   * * `sdkVersion` - Version of the SDK.
   * * `freeHeap` - Amount of free heap in bytes.
   * * `BLE` - Status of BLE, enabled if true.
   * * `Wifi` - Status of Wifi, enabled if true.
   * * `minHeap` - Minimum heap, calculated by heap_caps_get_minimum_free_size
   * @returns {any} The state of the ESP32
   * @url http://www.espruino.com/Reference#l_ESP32_getState
   */
  static getState(): any;

  /**
   *
   * @param {number} level - which events should be shown (GAP=1, GATTS=2, GATTC=4). Use 255 for everything
   * @url http://www.espruino.com/Reference#l_ESP32_setBLE_Debug
   */
  static setBLE_Debug(level: number): void;

  /**
   * Switches Bluetooth off/on, removes saved code from Flash, resets the board, and
   * on restart creates jsVars depending on available heap (actual additional 1800)
   *
   * @param {boolean} enable - switches Bluetooth on or off
   * @url http://www.espruino.com/Reference#l_ESP32_enableBLE
   */
  static enableBLE(enable: boolean): void;

  /**
   * Switches Wifi off/on, removes saved code from Flash, resets the board, and on
   * restart creates jsVars depending on available heap (actual additional 3900)
   *
   * @param {boolean} enable - switches Wifi on or off
   * @url http://www.espruino.com/Reference#l_ESP32_enableWifi
   */
  static enableWifi(enable: boolean): void;

  /**
   * This function is useful for ESP32 [OTA Updates](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/ota.html)
   * Normally Espruino is uploaded to the `factory` partition so this isn't so useful,
   * but it is possible to upload Espruino to the `ota_0` partition (or ota_1 if a different table has been added).
   * If this is the case, you can use this function to mark the currently running version of Espruino as good or bad.
   *  * If set as valid, Espruino will continue running, and the fact that everything is ok is written to flash
   *  * If set as invalid (false) Espruino will mark itself as not working properly and will reboot. The ESP32 bootloader
   *  will then start and will load any other partition it can find that is marked as ok.
   *
   * @param {boolean} isValid - Set whether this app is valid or not. If `isValid==false` the device will reboot.
   * @url http://www.espruino.com/Reference#l_ESP32_setOTAValid
   */
  static setOTAValid(isValid: boolean): void;


}

/**
 * This is a built-in class to allow you to use the ESP8266 NodeMCU boards' pin
 * namings to access pins. It is only available on ESP8266-based boards.
 * @url http://www.espruino.com/Reference#NodeMCU
 */
declare class NodeMCU {
  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_A0
   */
  static A0: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_D0
   */
  static D0: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_D1
   */
  static D1: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_D2
   */
  static D2: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_D3
   */
  static D3: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_D4
   */
  static D4: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_D5
   */
  static D5: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_D6
   */
  static D6: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_D7
   */
  static D7: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_D8
   */
  static D8: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_D9
   */
  static D9: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_NodeMCU_D10
   */
  static D10: Pin;


}

/**
 * This is the built-in class for the Arduino-style pin namings on ST Nucleo boards
 * @url http://www.espruino.com/Reference#Nucleo
 */
declare class Nucleo {
  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_A0
   */
  static A0: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_A1
   */
  static A1: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_A2
   */
  static A2: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_A3
   */
  static A3: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_A4
   */
  static A4: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_A5
   */
  static A5: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D0
   */
  static D0: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D1
   */
  static D1: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D2
   */
  static D2: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D3
   */
  static D3: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D4
   */
  static D4: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D5
   */
  static D5: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D6
   */
  static D6: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D7
   */
  static D7: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D8
   */
  static D8: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D9
   */
  static D9: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D10
   */
  static D10: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D11
   */
  static D11: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D12
   */
  static D12: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D13
   */
  static D13: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D14
   */
  static D14: Pin;

  /**
   * @returns {Pin} A Pin
   * @url http://www.espruino.com/Reference#l_Nucleo_D15
   */
  static D15: Pin;


}

/**
 * The NRF class is for controlling functionality of the Nordic nRF51/nRF52 chips.
 * Most functionality is related to Bluetooth Low Energy, however there are also
 * some functions related to NFC that apply to NRF52-based devices.
 * @url http://www.espruino.com/Reference#NRF
 */
declare class NRF {
  /**
   * @returns {any} An object
   * @url http://www.espruino.com/Reference#l_NRF_getSecurityStatus
   */
  static getSecurityStatus(): NRFSecurityStatus;

  /**
   * @returns {any} An object
   * @url http://www.espruino.com/Reference#l_NRF_getAddress
   */
  static getAddress(): any;

  /**
   *
   * @param {any} data - The service (and characteristics) to advertise
   * @param {any} options - Optional object containing options
   * @url http://www.espruino.com/Reference#l_NRF_setServices
   */
  static setServices(data: any, options: any): void;

  /**
   *
   * @param {any} data - The data to advertise as an object - see below for more info
   * @param {any} [options] - [optional] An object of options
   * @url http://www.espruino.com/Reference#l_NRF_setAdvertising
   */
  static setAdvertising(data: any, options?: any): void;

  /**
   * Called when a host device connects to Espruino. The first argument contains the
   * address.
   * @param {string} event - The event to listen to.
   * @param {(addr: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `addr` The address of the device that has connected
   * @url http://www.espruino.com/Reference#l_NRF_connect
   */
  static on(event: "connect", callback: (addr: any) => void): void;

  /**
   * Called when a host device disconnects from Espruino.
   * The most common reason is:
   * * 19 - `REMOTE_USER_TERMINATED_CONNECTION`
   * * 22 - `LOCAL_HOST_TERMINATED_CONNECTION`
   * @param {string} event - The event to listen to.
   * @param {(reason: number) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `reason` The reason code reported back by the BLE stack - see Nordic's [`ble_hci.h` file](https://github.com/espruino/Espruino/blob/master/targetlibs/nrf5x_12/components/softdevice/s132/headers/ble_hci.h#L71) for more information
   * @url http://www.espruino.com/Reference#l_NRF_disconnect
   */
  static on(event: "disconnect", callback: (reason: number) => void): void;

  /**
   * Called when the Nordic Bluetooth stack (softdevice) generates an error. In pretty
   * much all cases an Exception will also have been thrown.
   * @param {string} event - The event to listen to.
   * @param {(msg: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `msg` The error string
   * @url http://www.espruino.com/Reference#l_NRF_error
   */
  static on(event: "error", callback: (msg: any) => void): void;

  /**
   * (Added in 2v19) Called when a central device connects to Espruino, pairs, and sends a passkey that Espruino should display.
   * For this to be used, you'll have to specify that your device has a display using `NRF.setSecurity({mitm:1, display:1});`
   * For instance:
   * ```
   * NRF.setSecurity({mitm:1, display:1});
   * NRF.on("passkey", key => print("Enter PIN: ",passkey));
   * ```
   * It is also possible to specify a static passkey with `NRF.setSecurity({passkey:"123456", mitm:1, display:1});`
   * in which case no `passkey` event handler is needed (this method works on Espruino 2v02 and later)
   * **Note:** A similar event, [`BluetoothDevice.on("passkey", ...)`](http://www.espruino.com/Reference#l_BluetoothDevice_passkey) is available
   * for when Espruino is connecting *to* another device (central mode).
   * @param {string} event - The event to listen to.
   * @param {(passkey: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `passkey` A 6 character numeric String to be displayed
   * @url http://www.espruino.com/Reference#l_NRF_passkey
   */
  static on(event: "passkey", callback: (passkey: any) => void): void;

  /**
   * Contains updates on the security of the current Bluetooth link.
   * See Nordic's `ble_gap_evt_auth_status_t` structure for more information.
   * @param {string} event - The event to listen to.
   * @param {(status: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `status` An object containing `{auth_status,bonded,lv4,kdist_own,kdist_peer}
   * @url http://www.espruino.com/Reference#l_NRF_security
   */
  static on(event: "security", callback: (status: any) => void): void;

  /**
   * Called when Bluetooth advertising starts or stops on Espruino
   * @param {string} event - The event to listen to.
   * @param {(isAdvertising: boolean) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `isAdvertising` Whether we are advertising or not
   * @url http://www.espruino.com/Reference#l_NRF_advertising
   */
  static on(event: "advertising", callback: (isAdvertising: boolean) => void): void;

  /**
   * Called during the bonding process to update on status
   * `status` is one of:
   * * `"request"` - Bonding has been requested in code via `NRF.startBonding`
   * * `"start"` - The bonding procedure has started
   * * `"success"` - The bonding procedure has succeeded (`NRF.startBonding`'s promise resolves)
   * * `"fail"` - The bonding procedure has failed (`NRF.startBonding`'s promise rejects)
   * @param {string} event - The event to listen to.
   * @param {(status: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `status` One of `'request'/'start'/'success'/'fail'`
   * @url http://www.espruino.com/Reference#l_NRF_bond
   */
  static on(event: "bond", callback: (status: any) => void): void;

  /**
   * Called with a single byte value when Espruino is set up as a HID device and the
   * computer it is connected to sends a HID report back to Espruino. This is usually
   * used for handling indications such as the Caps Lock LED.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_NRF_HID
   */
  static on(event: "HID", callback: () => void): void;

  /**
   * Called with discovered services when discovery is finished
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_NRF_servicesDiscover
   */
  static on(event: "servicesDiscover", callback: () => void): void;

  /**
   * Called with discovered characteristics when discovery is finished
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_NRF_characteristicsDiscover
   */
  static on(event: "characteristicsDiscover", callback: () => void): void;

  /**
   * Called when an NFC field is detected
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_NRF_NFCon
   */
  static on(event: "NFCon", callback: () => void): void;

  /**
   * Called when an NFC field is no longer detected
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_NRF_NFCoff
   */
  static on(event: "NFCoff", callback: () => void): void;

  /**
   * When NFC is started with `NRF.nfcStart`, this is fired when NFC data is
   * received. It doesn't get called if NFC is started with `NRF.nfcURL` or
   * `NRF.nfcRaw`
   * @param {string} event - The event to listen to.
   * @param {(arr: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `arr` An ArrayBuffer containign the received data
   * @url http://www.espruino.com/Reference#l_NRF_NFCrx
   */
  static on(event: "NFCrx", callback: (arr: any) => void): void;

  /**
   * If a device is connected to Espruino, disconnect from it.
   * @url http://www.espruino.com/Reference#l_NRF_disconnect
   */
  static disconnect(): void;

  /**
   * Disable Bluetooth advertising and disconnect from any device that connected to
   * Puck.js as a peripheral (this won't affect any devices that Puck.js initiated
   * connections to).
   * This makes Puck.js undiscoverable, so it can't be connected to.
   * Use `NRF.wake()` to wake up and make Puck.js connectable again.
   * @url http://www.espruino.com/Reference#l_NRF_sleep
   */
  static sleep(): void;

  /**
   * Enable Bluetooth advertising (this is enabled by default), which allows other
   * devices to discover and connect to Puck.js.
   * Use `NRF.sleep()` to disable advertising.
   * @url http://www.espruino.com/Reference#l_NRF_wake
   */
  static wake(): void;

  /**
   * Restart the Bluetooth softdevice (if there is currently a BLE connection, it
   * will queue a restart to be done when the connection closes).
   * You shouldn't need to call this function in normal usage. However, Nordic's BLE
   * softdevice has some settings that cannot be reset. For example there are only a
   * certain number of unique UUIDs. Once these are all used the only option is to
   * restart the softdevice to clear them all out.
   *
   * @param {any} [callback] - [optional] A function to be called while the softdevice is uninitialised. Use with caution - accessing console/bluetooth will almost certainly result in a crash.
   * @url http://www.espruino.com/Reference#l_NRF_restart
   */
  static restart(callback?: any): void;

  /**
   * Delete all data stored for all peers (bonding data used for secure connections). This cannot be done
   * while a connection is active, so if there is a connection it will be postponed until everything is disconnected
   * (which can be done by calling `NRF.disconnect()` and waiting).
   * Booting your device while holding all buttons down together should also have the same effect.
   *
   * @param {any} [callback] - [optional] A function to be called while the softdevice is uninitialised. Use with caution - accessing console/bluetooth will almost certainly result in a crash.
   * @url http://www.espruino.com/Reference#l_NRF_eraseBonds
   */
  static eraseBonds(callback?: any): void;

  /**
   * Get this device's default Bluetooth MAC address.
   * For Puck.js, the last 5 characters of this (e.g. `ee:ff`) are used in the
   * device's advertised Bluetooth name.
   * @returns {any} MAC address - a string of the form 'aa:bb:cc:dd:ee:ff'
   * @url http://www.espruino.com/Reference#l_NRF_getAddress
   */
  static getAddress(): any;

  /**
   * Set this device's default Bluetooth MAC address:
   * ```
   * NRF.setAddress("ff:ee:dd:cc:bb:aa random");
   * ```
   * Addresses take the form:
   * * `"ff:ee:dd:cc:bb:aa"` or `"ff:ee:dd:cc:bb:aa public"` for a public address
   * * `"ff:ee:dd:cc:bb:aa random"` for a random static address (the default for
   *   Espruino)
   * This may throw a `INVALID_BLE_ADDR` error if the upper two bits of the address
   * don't match the address type.
   * To change the address, Espruino must restart the softdevice. It will only do so
   * when it is disconnected from other devices.
   *
   * @param {any} addr - The address to use (as a string)
   * @url http://www.espruino.com/Reference#l_NRF_setAddress
   */
  static setAddress(addr: any): void;

  /**
   * Try to resolve a **bonded** peer's address from a random private resolvable address. If the peer
   * is not bonded, there will be no IRK and `undefined` will be returned.
   * A bunch of devices, especially smartphones, implement address randomisation and periodically change
   * their bluetooth address to prevent being tracked.
   * If such a device uses a "random private resolvable address", that address is generated
   * with the help of an identity resolving key (IRK) that is exchanged during bonding.
   * If we know the IRK of a device, we can check if an address was potentially generated by that device.
   * The following will check an address against the IRKs of all bonded devices,
   * and return the actual address of a bonded device if the given address was likely generated using that device's IRK:
   * ```
   * NRF.on('connect',addr=> {
   *   // addr could be "aa:bb:cc:dd:ee:ff private-resolvable"
   *   if (addr.endsWith("private-resolvable")) {
   *     let resolved = NRF.resolveAddress(addr);
   *     // resolved is "aa:bb:cc:dd:ee:ff public"
   *     if (resolved) addr = resolved;
   *   }
   *   console.log("Device connected: ", addr);
   * })
   * ```
   * You can get the current connection's address using `NRF.getSecurityStatus().connected_addr`,
   * so can for instance do `NRF.resolveAddress(NRF.getSecurityStatus().connected_addr)`.
   *
   * @param {any} options - The address that should be resolved.
   * @returns {any} The resolved address, or `undefined` if it couldn't be resolved.
   * @url http://www.espruino.com/Reference#l_NRF_resolveAddress
   */
  static resolveAddress(options: any): any;

  /**
   * Get the battery level in volts (the voltage that the NRF chip is running off
   * of).
   * This is the battery level of the device itself - it has nothing to with any
   * device that might be connected.
   * @returns {number} Battery level in volts
   * @url http://www.espruino.com/Reference#l_NRF_getBattery
   */
  static getBattery(): number;

  /**
   * Change the data that Espruino advertises.
   * Data can be of the form `{ UUID : data_as_byte_array }`. The UUID should be a
   * [Bluetooth Service
   * ID](https://developer.bluetooth.org/gatt/services/Pages/ServicesHome.aspx).
   * For example to return battery level at 95%, do:
   * ```
   * NRF.setAdvertising({
   *   0x180F : [95] // Service data 0x180F = 95
   * });
   * ```
   * Or you could report the current temperature:
   * ```
   * setInterval(function() {
   *   NRF.setAdvertising({
   *     0x1809 : [Math.round(E.getTemperature())]
   *   });
   * }, 30000);
   * ```
   * If you specify a value for the object key, Service Data is advertised. However
   * if you specify `undefined`, the Service UUID is advertised:
   * ```
   * NRF.setAdvertising({
   *   0x180D : undefined // Advertise service UUID 0x180D (HRM)
   * });
   * ```
   * Service UUIDs can also be supplied in the second argument of `NRF.setServices`,
   * but those go in the scan response packet.
   * You can also supply the raw advertising data in an array. For example to
   * advertise as an Eddystone beacon:
   * ```
   * NRF.setAdvertising([0x03,  // Length of Service List
   *   0x03,  // Param: Service List
   *   0xAA, 0xFE,  // Eddystone ID
   *   0x13,  // Length of Service Data
   *   0x16,  // Service Data
   *   0xAA, 0xFE, // Eddystone ID
   *   0x10,  // Frame type: URL
   *   0xF8, // Power
   *   0x03, // https://
   *   'g','o','o','.','g','l','/','B','3','J','0','O','c'],
   *     {interval:100});
   * ```
   * (However for Eddystone we'd advise that you use the [Espruino Eddystone
   * library](/Puck.js+Eddystone))
   * **Note:** When specifying data as an array, certain advertising options such as
   * `discoverable` and `showName` won't have any effect.
   * **Note:** The size of Bluetooth LE advertising packets is limited to 31 bytes.
   * If you want to advertise more data, consider using an array for `data` (See
   * below), or `NRF.setScanResponse`.
   * You can even specify an array of arrays or objects, in which case each
   * advertising packet will be used in turn - for instance to make your device
   * advertise battery level and its name as well as both Eddystone and iBeacon :
   * ```
   * NRF.setAdvertising([
   *   {0x180F : [E.getBattery()]}, // normal advertising, with battery %
   *   require("ble_ibeacon").get(...), // iBeacon
   *   require("ble_eddystone").get(...), // eddystone
   * ], {interval:300});
   * ```
   * `options` is an object, which can contain:
   * ```
   * {
   *   name: "Hello"              // The name of the device
   *   showName: true/false       // include full name, or nothing
   *   discoverable: true/false   // general discoverable, or limited - default is limited
   *   connectable: true/false    // whether device is connectable - default is true
   *   scannable : true/false     // whether device can be scanned for scan response packets - default is true
   *   whenConnected : true/false // keep advertising when connected (nRF52 only)
   *                              // switches to advertising as non-connectable when it is connected
   *   interval: 600              // Advertising interval in msec, between 20 and 10000 (default is 375ms)
   *   manufacturer: 0x0590       // IF sending manufacturer data, this is the manufacturer ID
   *   manufacturerData: [...]    // IF sending manufacturer data, this is an array of data
   *   phy: "1mbps/2mbps/coded"   // (NRF52833/NRF52840 only) use the long-range coded phy for transmission (1mbps default)
   * }
   * ```
   * Setting `connectable` and `scannable` to false gives the lowest power
   * consumption as the BLE radio doesn't have to listen after sending advertising.
   * **NOTE:** Non-`connectable` advertising can't have an advertising interval less
   * than 100ms according to the BLE spec.
   * So for instance to set the name of Puck.js without advertising any other data
   * you can just use the command:
   * ```
   * NRF.setAdvertising({},{name:"Hello"});
   * ```
   * You can also specify 'manufacturer data', which is another form of advertising
   * data. We've registered the Manufacturer ID 0x0590 (as Pur3 Ltd) for use with
   * *Official Espruino devices* - use it to advertise whatever data you'd like, but
   * we'd recommend using JSON.
   * For example by not advertising a device name you can send up to 24 bytes of JSON
   * on Espruino's manufacturer ID:
   * ```
   * var data = {a:1,b:2};
   * NRF.setAdvertising({},{
   *   showName:false,
   *   manufacturer:0x0590,
   *   manufacturerData:JSON.stringify(data)
   * });
   * ```
   * If you're using [EspruinoHub](https://github.com/espruino/EspruinoHub) then it
   * will automatically decode this into the following MQTT topics:
   * * `/ble/advertise/ma:c_:_a:dd:re:ss/espruino` -> `{"a":10,"b":15}`
   * * `/ble/advertise/ma:c_:_a:dd:re:ss/a` -> `1`
   * * `/ble/advertise/ma:c_:_a:dd:re:ss/b` -> `2`
   * Note that **you only have 24 characters available for JSON**, so try to use the
   * shortest field names possible and avoid floating point values that can be very
   * long when converted to a String.
   *
   * @param {any} data - The service data to advertise as an object - see below for more info
   * @param {any} [options] - [optional] Object of options
   * @url http://www.espruino.com/Reference#l_NRF_setAdvertising
   */
  static setAdvertising(data: any, options?: any): void;

  /**
   * This is just like `NRF.setAdvertising`, except instead of advertising the data,
   * it returns the packet that would be advertised as an array.
   *
   * @param {any} data - The data to advertise as an object
   * @param {any} [options] - [optional] An object of options
   * @returns {any} An array containing the advertising data
   * @url http://www.espruino.com/Reference#l_NRF_getAdvertisingData
   */
  static getAdvertisingData(data: any, options?: any): any;

  /**
   * The raw scan response data should be supplied as an array. For example to return
   * "Sample" for the device name:
   * ```
   * NRF.setScanResponse([0x07,  // Length of Data
   *   0x09,  // Param: Complete Local Name
   *   'S', 'a', 'm', 'p', 'l', 'e']);
   * ```
   * **Note:** `NRF.setServices(..., {advertise:[ ... ]})` writes advertised services
   * into the scan response - so you can't use both `advertise` and `NRF.setServices`
   * or one will overwrite the other.
   *
   * @param {any} data - The data to for the scan response
   * @url http://www.espruino.com/Reference#l_NRF_setScanResponse
   */
  static setScanResponse(data: any): void;

  /**
   * Change the services and characteristics Espruino advertises.
   * If you want to **change** the value of a characteristic, you need to use
   * `NRF.updateServices()` instead
   * To expose some information on Characteristic `ABCD` on service `BCDE` you could
   * do:
   * ```
   * NRF.setServices({
   *   0xBCDE : {
   *     0xABCD : {
   *       value : "Hello",
   *       readable : true
   *     }
   *   }
   * });
   * ```
   * Or to allow the 3 LEDs to be controlled by writing numbers 0 to 7 to a
   * characteristic, you can do the following. `evt.data` is an ArrayBuffer.
   * ```
   * NRF.setServices({
   *   0xBCDE : {
   *     0xABCD : {
   *       writable : true,
   *       onWrite : function(evt) {
   *         digitalWrite([LED3,LED2,LED1], evt.data[0]);
   *       }
   *     }
   *   }
   * });
   * ```
   * You can supply many different options:
   * ```
   * NRF.setServices({
   *   0xBCDE : {
   *     0xABCD : {
   *       value : "Hello", // optional
   *       maxLen : 5, // optional (otherwise is length of initial value)
   *       broadcast : false, // optional, default is false
   *       readable : true,   // optional, default is false
   *       writable : true,   // optional, default is false
   *       notify : true,   // optional, default is false
   *       indicate : true,   // optional, default is false
   *       description: "My Characteristic",  // optional, default is null,
   *       security: { // optional - see NRF.setSecurity
   *         read: { // optional
   *           encrypted: false, // optional, default is false
   *           mitm: false, // optional, default is false
   *           lesc: false, // optional, default is false
   *           signed: false // optional, default is false
   *         },
   *         write: { // optional
   *           encrypted: true, // optional, default is false
   *           mitm: false, // optional, default is false
   *           lesc: false, // optional, default is false
   *           signed: false // optional, default is false
   *         }
   *       },
   *       onWrite : function(evt) { // optional
   *         console.log("Got ", evt.data); // an ArrayBuffer
   *       },
   *       onWriteDesc : function(evt) { // optional - called when the 'cccd' descriptor is written
   *         // for example this is called when notifications are requested by the client:
   *         console.log("Notifications enabled = ", evt.data[0]&1);
   *       }
   *     }
   *     // more characteristics allowed
   *   }
   *   // more services allowed
   * });
   * ```
   * **Note:** UUIDs can be integers between `0` and `0xFFFF`, strings of the form
   * `"ABCD"`, or strings of the form `"ABCDABCD-ABCD-ABCD-ABCD-ABCDABCDABCD"`
   * `options` can be of the form:
   * ```
   * NRF.setServices(undefined, {
   *   hid : new Uint8Array(...), // optional, default is undefined. Enable BLE HID support
   *   uart : true, // optional, default is true. Enable BLE UART support
   *   advertise: [ '180D' ] // optional, list of service UUIDs to advertise
   *   ancs : true, // optional, Bangle.js-only, enable Apple ANCS support for notifications (see `NRF.ancs*`)
   *   ams : true // optional, Bangle.js-only, enable Apple AMS support for media control (see `NRF.ams*`)
   *   cts : true // optional, Bangle.js-only, enable Apple Current Time Service support (see `NRF.ctsGetTime`)
   * });
   * ```
   * To enable BLE HID, you must set `hid` to an array which is the BLE report
   * descriptor. The easiest way to do this is to use the `ble_hid_controls` or
   * `ble_hid_keyboard` modules.
   * **Note:** Just creating a service doesn't mean that the service will be
   * advertised. It will only be available after a device connects. To advertise,
   * specify the UUIDs you wish to advertise in the `advertise` field of the second
   * `options` argument. For example this will create and advertise a heart rate
   * service:
   * ```
   * NRF.setServices({
   *   0x180D: { // heart_rate
   *     0x2A37: { // heart_rate_measurement
   *       notify: true,
   *       value : [0x06, heartrate],
   *     }
   *   }
   * }, { advertise: [ '180D' ] });
   * ```
   * You may specify 128 bit UUIDs to advertise, however you may get a `DATA_SIZE`
   * exception because there is insufficient space in the Bluetooth LE advertising
   * packet for the 128 bit UART UUID as well as the UUID you specified. In this case
   * you can add `uart:false` after the `advertise` element to disable the UART,
   * however you then be unable to connect to Puck.js's console via Bluetooth.
   * If you absolutely require two or more 128 bit UUIDs then you will have to
   * specify your own raw advertising data packets with `NRF.setAdvertising`
   * **Note:** The services on Espruino can only be modified when there is no device
   * connected to it as it requires a restart of the Bluetooth stack. **iOS devices
   * will 'cache' the list of services** so apps like NRF Connect may incorrectly
   * display the old services even after you have modified them. To fix this, disable
   * and re-enable Bluetooth on your iOS device, or use an Android device to run NRF
   * Connect.
   * **Note:** Not all combinations of security configuration values are valid, the
   * valid combinations are: encrypted, encrypted + mitm, lesc, signed, signed +
   * mitm. See `NRF.setSecurity` for more information.
   *
   * @param {any} data - The service (and characteristics) to advertise
   * @param {any} [options] - [optional] Object containing options
   * @url http://www.espruino.com/Reference#l_NRF_setServices
   */
  static setServices(data: { [key: number]: { [key: number]: { value?: string, maxLen?: number, broadcast?: boolean, readable?: boolean, writable?: boolean, notify?: boolean, indicate?: boolean, description?: string, security?: { read?: { encrypted?: boolean, mitm?: boolean, lesc?: boolean, signed?: boolean }, write?: { encrypted?: boolean, mitm?: boolean, lesc?: boolean, signed?: boolean } }, onWrite?: (evt: { data: ArrayBuffer }) => void } } }, options?: any): void;

  /**
   * Update values for the services and characteristics Espruino advertises. Only
   * services and characteristics previously declared using `NRF.setServices` are
   * affected.
   * To update the '0xABCD' characteristic in the '0xBCDE' service:
   * ```
   * NRF.updateServices({
   *   0xBCDE : {
   *     0xABCD : {
   *       value : "World"
   *     }
   *   }
   * });
   * ```
   * You can also use 128 bit UUIDs, for example
   * `"b7920001-3c1b-4b40-869f-3c0db9be80c6"`.
   * To define a service and characteristic and then notify connected clients of a
   * change to it when a button is pressed:
   * ```
   * NRF.setServices({
   *   0xBCDE : {
   *     0xABCD : {
   *       value : "Hello",
   *       maxLen : 20,
   *       notify: true
   *     }
   *   }
   * });
   * setWatch(function() {
   *   NRF.updateServices({
   *     0xBCDE : {
   *       0xABCD : {
   *         value : "World!",
   *         notify: true
   *       }
   *     }
   *   });
   * }, BTN, { repeat:true, edge:"rising", debounce: 50 });
   * ```
   * This only works if the characteristic was created with `notify: true` using
   * `NRF.setServices`, otherwise the characteristic will be updated but no
   * notification will be sent.
   * Also note that `maxLen` was specified. If it wasn't then the maximum length of
   * the characteristic would have been 5 - the length of `"Hello"`.
   * To indicate (i.e. notify with ACK) connected clients of a change to the '0xABCD'
   * characteristic in the '0xBCDE' service:
   * ```
   * NRF.updateServices({
   *   0xBCDE : {
   *     0xABCD : {
   *       value : "World",
   *       indicate: true
   *     }
   *   }
   * });
   * ```
   * This only works if the characteristic was created with `indicate: true` using
   * `NRF.setServices`, otherwise the characteristic will be updated but no
   * notification will be sent.
   * **Note:** See `NRF.setServices` for more information
   *
   * @param {any} data - The service (and characteristics) to update
   * @url http://www.espruino.com/Reference#l_NRF_updateServices
   */
  static updateServices(data: any): void;

  /**
   * Start/stop listening for BLE advertising packets within range. Returns a
   * `BluetoothDevice` for each advertising packet. **By default this is not an active
   * scan, so Scan Response advertising data is not included (see below)**
   * ```
   * // Start scanning
   * packets=10;
   * NRF.setScan(function(d) {
   *   packets--;
   *   if (packets<=0)
   *     NRF.setScan(); // stop scanning
   *   else
   *     console.log(d); // print packet info
   * });
   * ```
   * Each `BluetoothDevice` will look a bit like:
   * ```
   * BluetoothDevice {
   *   "id": "aa:bb:cc:dd:ee:ff", // address
   *   "rssi": -89,               // signal strength
   *   "services": [ "128bit-uuid", ... ],     // zero or more service UUIDs
   *   "data": new Uint8Array([ ... ]).buffer, // ArrayBuffer of returned data
   *   "serviceData" : { "0123" : [ 1 ] }, // if service data is in 'data', it's extracted here
   *   "manufacturer" : 0x1234, // if manufacturer data is in 'data', the 16 bit manufacturer ID is extracted here
   *   "manufacturerData" : new Uint8Array([...]).buffer, // if manufacturer data is in 'data', the data is extracted here as an ArrayBuffer
   *   "name": "DeviceName"       // the advertised device name
   *  }
   * ```
   * You can also supply a set of filters (as described in `NRF.requestDevice`) as a
   * second argument, which will allow you to filter the devices you get a callback
   * for. This helps to cut down on the time spent processing JavaScript code in
   * areas with a lot of Bluetooth advertisements. For example to find only devices
   * with the manufacturer data `0x0590` (Espruino's ID) you could do:
   * ```
   * NRF.setScan(function(d) {
   *   console.log(d.manufacturerData);
   * }, { filters: [{ manufacturerData:{0x0590:{}} }] });
   * ```
   * You can also specify `active:true` in the second argument to perform active
   * scanning (this requests scan response packets) from any devices it finds.
   * **Note:** Using a filter in `setScan` filters each advertising packet
   * individually. As a result, if you filter based on a service UUID and a device
   * advertises with multiple packets (or a scan response when `active:true`) only
   * the packets matching the filter are returned. To aggregate multiple packets you
   * can use `NRF.findDevices`.
   * **Note:** BLE advertising packets can arrive quickly - faster than you'll be
   * able to print them to the console. It's best only to print a few, or to use a
   * function like `NRF.findDevices(..)` which will collate a list of available
   * devices.
   * **Note:** Using setScan turns the radio's receive mode on constantly. This can
   * draw a *lot* of power (12mA or so), so you should use it sparingly or you can
   * run your battery down quickly.
   *
   * @param {any} callback - The callback to call with received advertising packets, or undefined to stop
   * @param {any} [options] - [optional] An object `{filters: ...}` (as would be passed to `NRF.requestDevice`) to filter devices by
   * @url http://www.espruino.com/Reference#l_NRF_setScan
   */
  static setScan(callback: any, options?: any): void;

  /**
   * This function can be used to quickly filter through Bluetooth devices.
   * For instance if you wish to scan for multiple different types of device at the
   * same time then you could use `NRF.findDevices` with all the filters you're
   * interested in. When scanning is finished you can then use `NRF.filterDevices` to
   * pick out just the devices of interest.
   * ```
   * // the two types of device we're interested in
   * var filter1 = [{serviceData:{"fe95":{}}}];
   * var filter2 = [{namePrefix:"Pixl.js"}];
   * // the following filter will return both types of device
   * var allFilters = filter1.concat(filter2);
   * // now scan for both types of device, and filter them out afterwards
   * NRF.findDevices(function(devices) {
   *   var devices1 = NRF.filterDevices(devices, filter1);
   *   var devices2 = NRF.filterDevices(devices, filter2);
   *   // ...
   * }, {filters : allFilters});
   * ```
   *
   * @param {any} devices - An array of `BluetoothDevice` objects, from `NRF.findDevices` or similar
   * @param {any} filters - A list of filters (as would be passed to `NRF.requestDevice`) to filter devices by
   * @returns {any} An array of `BluetoothDevice` objects that match the given filters
   * @url http://www.espruino.com/Reference#l_NRF_filterDevices
   */
  static filterDevices(devices: any, filters: any): any;

  /**
   * Utility function to return a list of BLE devices detected in range. Behind the
   * scenes, this uses `NRF.setScan(...)` and collates the results.
   * ```
   * NRF.findDevices(function(devices) {
   *   console.log(devices);
   * }, 1000);
   * ```
   * prints something like:
   * ```
   * [
   *   BluetoothDevice {
   *     "id" : "e7:e0:57:ad:36:a2 random",
   *     "rssi": -45,
   *     "services": [ "4567" ],
   *     "serviceData" : { "0123" : [ 1 ] },
   *     "manufacturer" : 1424,
   *     "manufacturerData" : new Uint8Array([ ... ]).buffer,
   *     "data": new ArrayBuffer([ ... ]).buffer,
   *     "name": "Puck.js 36a2"
   *    },
   *   BluetoothDevice {
   *     "id": "c0:52:3f:50:42:c9 random",
   *     "rssi": -65,
   *     "data": new ArrayBuffer([ ... ]),
   *     "name": "Puck.js 8f57"
   *    }
   *  ]
   * ```
   * For more information on the structure returned, see `NRF.setScan`.
   * If you want to scan only for specific devices you can replace the timeout with
   * an object of the form `{filters: ..., timeout : ..., active: bool}` using the
   * filters described in `NRF.requestDevice`. For example to search for devices with
   * Espruino's `manufacturerData`:
   * ```
   * NRF.findDevices(function(devices) {
   *   ...
   * }, {timeout : 2000, filters : [{ manufacturerData:{0x0590:{}} }] });
   * ```
   * You could then use
   * [`BluetoothDevice.gatt.connect(...)`](/Reference#l_BluetoothRemoteGATTServer_connect)
   * on the device returned to make a connection.
   * You can also use [`NRF.connect(...)`](/Reference#l_NRF_connect) on just the `id`
   * string returned, which may be useful if you always want to connect to a specific
   * device.
   * **Note:** Using findDevices turns the radio's receive mode on for 2000ms (or
   * however long you specify). This can draw a *lot* of power (12mA or so), so you
   * should use it sparingly or you can run your battery down quickly.
   * **Note:** The 'data' field contains the data of *the last packet received*.
   * There may have been more packets. To get data for each packet individually use
   * `NRF.setScan` instead.
   *
   * @param {any} callback - The callback to call with received advertising packets (as `BluetoothDevice`), or undefined to stop
   * @param {any} [options] - [optional] A time in milliseconds to scan for (defaults to 2000), Or an optional object `{filters: ..., timeout : ..., active: bool}` (as would be passed to `NRF.requestDevice`) to filter devices by
   * @url http://www.espruino.com/Reference#l_NRF_findDevices
   */
  static findDevices(callback: (devices: BluetoothDevice[]) => void, options?: number | { filters?: NRFFilters[], timeout?: number, active?: boolean }): void;

  /**
   * Start/stop listening for RSSI values on the currently active connection (where
   * This device is a peripheral and is being connected to by a 'central' device)
   * ```
   * // Start scanning
   * NRF.setRSSIHandler(function(rssi) {
   *   console.log(rssi); // prints -85 (or similar)
   * });
   * // Stop Scanning
   * NRF.setRSSIHandler();
   * ```
   * RSSI is the 'Received Signal Strength Indication' in dBm
   *
   * @param {any} callback - The callback to call with the RSSI value, or undefined to stop
   * @url http://www.espruino.com/Reference#l_NRF_setRSSIHandler
   */
  static setRSSIHandler(callback: any): void;

  /**
   * Set the BLE radio transmit power. The default TX power is 0 dBm, and
   *
   * @param {number} power - Transmit power. Accepted values are -40(nRF52 only), -30(nRF51 only), -20, -16, -12, -8, -4, 0, and 4 dBm. On nRF52840 (eg Bangle.js 2) 5/6/7/8 dBm are available too. Others will give an error code.
   * @url http://www.espruino.com/Reference#l_NRF_setTxPower
   */
  static setTxPower(power: number): void;

  /**
   * **THIS IS DEPRECATED** - please use `NRF.setConnectionInterval` for peripheral
   * and `NRF.connect(addr, options)`/`BluetoothRemoteGATTServer.connect(options)`
   * for central connections.
   * This sets the connection parameters - these affect the transfer speed and power
   * usage when the device is connected.
   * * When not low power, the connection interval is between 7.5 and 20ms
   * * When low power, the connection interval is between 500 and 1000ms
   * When low power connection is enabled, transfers of data over Bluetooth will be
   * very slow, however power usage while connected will be drastically decreased.
   * This will only take effect after the connection is disconnected and
   * re-established.
   *
   * @param {boolean} lowPower - Whether the connection is low power or not
   * @url http://www.espruino.com/Reference#l_NRF_setLowPowerConnection
   */
  static setLowPowerConnection(lowPower: boolean): void;

  /**
   * Enables NFC and starts advertising the given URL. For example:
   * ```
   * NRF.nfcURL("http://espruino.com");
   * ```
   *
   * @param {any} url - The URL string to expose on NFC, or `undefined` to disable NFC
   * @url http://www.espruino.com/Reference#l_NRF_nfcURL
   */
  static nfcURL(url: any): void;

  /**
   * Enables NFC and with an out of band 16 byte pairing key.
   * For example the following will enable out of band pairing on BLE such that the
   * device will pair when you tap the phone against it:
   * ```
   * var bleKey = [0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x99, 0x88, 0x77, 0x66, 0x55, 0x44, 0x33, 0x22, 0x11, 0x00];
   * NRF.on('security',s=>print("security",JSON.stringify(s)));
   * NRF.nfcPair(bleKey);
   * NRF.setSecurity({oob:bleKey, mitm:true});
   * ```
   *
   * @param {any} key - 16 byte out of band key
   * @url http://www.espruino.com/Reference#l_NRF_nfcPair
   */
  static nfcPair(key: any): void;

  /**
   * Enables NFC with a record that will launch the given android app.
   * For example:
   * ```
   * NRF.nfcAndroidApp("no.nordicsemi.android.nrftoolbox")
   * ```
   *
   * @param {any} app - The unique identifier of the given Android App
   * @url http://www.espruino.com/Reference#l_NRF_nfcAndroidApp
   */
  static nfcAndroidApp(app: any): void;

  /**
   * Enables NFC and starts advertising with Raw data. For example:
   * ```
   * NRF.nfcRaw(new Uint8Array([193, 1, 0, 0, 0, 13, 85, 3, 101, 115, 112, 114, 117, 105, 110, 111, 46, 99, 111, 109]));
   * // same as NRF.nfcURL("http://espruino.com");
   * ```
   *
   * @param {any} payload - The NFC NDEF message to deliver to the reader
   * @url http://www.espruino.com/Reference#l_NRF_nfcRaw
   */
  static nfcRaw(payload: any): void;

  /**
   * **Advanced NFC Functionality.** If you just want to advertise a URL, use
   * `NRF.nfcURL` instead.
   * Enables NFC and starts advertising. `NFCrx` events will be fired when data is
   * received.
   * ```
   * NRF.nfcStart();
   * ```
   *
   * @param {any} payload - Optional 7 byte UID
   * @returns {any} Internal tag memory (first 10 bytes of tag data)
   * @url http://www.espruino.com/Reference#l_NRF_nfcStart
   */
  static nfcStart(payload: any): any;

  /**
   * **Advanced NFC Functionality.** If you just want to advertise a URL, use
   * `NRF.nfcURL` instead.
   * Disables NFC.
   * ```
   * NRF.nfcStop();
   * ```
   *
   * @url http://www.espruino.com/Reference#l_NRF_nfcStop
   */
  static nfcStop(): void;

  /**
   * **Advanced NFC Functionality.** If you just want to advertise a URL, use
   * `NRF.nfcURL` instead.
   * Acknowledges the last frame and optionally transmits a response. If payload is
   * an array, then a array.length byte nfc frame is sent. If payload is a int, then
   * a 4bit ACK/NACK is sent. **Note:** ```nfcSend``` should always be called after
   * an ```NFCrx``` event.
   * ```
   * NRF.nfcSend(new Uint8Array([0x01, 0x02, ...]));
   * // or
   * NRF.nfcSend(0x0A);
   * // or
   * NRF.nfcSend();
   * ```
   *
   * @param {any} payload - Optional tx data
   * @url http://www.espruino.com/Reference#l_NRF_nfcSend
   */
  static nfcSend(payload: any): void;

  /**
   * Send a USB HID report. HID must first be enabled with `NRF.setServices({}, {hid:
   * hid_report})`
   *
   * @param {any} data - Input report data as an array
   * @param {any} callback - A callback function to be called when the data is sent
   * @url http://www.espruino.com/Reference#l_NRF_sendHIDReport
   */
  static sendHIDReport(data: number[], callback?: () => void): void

  /**
   * Check if Apple Notification Center Service (ANCS) is currently active on the BLE
   * connection
   *
   * @returns {boolean} True if Apple Notification Center Service (ANCS) has been initialised and is active
   * @url http://www.espruino.com/Reference#l_NRF_ancsIsActive
   */
  static ancsIsActive(): boolean;

  /**
   * Send an ANCS action for a specific Notification UID. Corresponds to
   * posaction/negaction in the 'ANCS' event that was received
   *
   * @param {number} uid - The UID of the notification to respond to
   * @param {boolean} positive - `true` for positive action, `false` for negative
   * @url http://www.espruino.com/Reference#l_NRF_ancsAction
   */
  static ancsAction(uid: number, positive: boolean): void;

  /**
   * Get ANCS info for a notification event received via `E.ANCS`, e.g.:
   * ```
   * E.on('ANCS', event => {
   *   NRF.ancsGetNotificationInfo( event.uid ).then(a=>print("Notify",E.toJS(a)));
   * });
   * ```
   * Returns:
   * ```
   * {
   *   "uid" : integer,
   *   "appId": string,
   *   "title": string,
   *   "subtitle": string,
   *   "message": string,
   *   "messageSize": string,
   *   "date": string,
   *   "posAction": string,
   *   "negAction": string
   * }
   * ```
   *
   * @param {number} uid - The UID of the notification to get information for
   * @returns {any} A `Promise` that is resolved (or rejected) when the connection is complete
   * @url http://www.espruino.com/Reference#l_NRF_ancsGetNotificationInfo
   */
  static ancsGetNotificationInfo(uid: number): Promise<void>;

  /**
   * Get ANCS info for an app (app id is available via `NRF.ancsGetNotificationInfo`)
   * Promise returns:
   * ```
   * {
   *   "uid" : int,
   *   "appId" : string,
   *   "title" : string,
   *   "subtitle" : string,
   *   "message" : string,
   *   "messageSize" : string,
   *   "date" : string,
   *   "posAction" : string,
   *   "negAction" : string,
   *   "name" : string,
   * }
   * ```
   *
   * @param {any} id - The app ID to get information for
   * @returns {any} A `Promise` that is resolved (or rejected) when the connection is complete
   * @url http://www.espruino.com/Reference#l_NRF_ancsGetAppInfo
   */
  static ancsGetAppInfo(id: any): Promise<void>;

  /**
   * Check if Apple Media Service (AMS) is currently active on the BLE connection
   *
   * @returns {boolean} True if Apple Media Service (AMS) has been initialised and is active
   * @url http://www.espruino.com/Reference#l_NRF_amsIsActive
   */
  static amsIsActive(): boolean;

  /**
   * Get Apple Media Service (AMS) info for the current media player. "playbackinfo"
   * returns a concatenation of three comma-separated values:
   * - PlaybackState: a string that represents the integer value of the playback
   *   state:
   *     - PlaybackStatePaused = 0
   *     - PlaybackStatePlaying = 1
   *     - PlaybackStateRewinding = 2
   *     - PlaybackStateFastForwarding = 3
   * - PlaybackRate: a string that represents the floating point value of the
   *   playback rate.
   * - ElapsedTime: a string that represents the floating point value of the elapsed
   *   time of the current track, in seconds
   *
   * @param {any} id - Either 'name', 'playbackinfo' or 'volume'
   * @returns {any} A `Promise` that is resolved (or rejected) when the connection is complete
   * @url http://www.espruino.com/Reference#l_NRF_amsGetPlayerInfo
   */
  static amsGetPlayerInfo(id: any): Promise<void>;

  /**
   * Get Apple Media Service (AMS) info for the currently-playing track
   *
   * @param {any} id - Either 'artist', 'album', 'title' or 'duration'
   * @returns {any} A `Promise` that is resolved (or rejected) when the connection is complete
   * @url http://www.espruino.com/Reference#l_NRF_amsGetTrackInfo
   */
  static amsGetTrackInfo(id: any): Promise<void>;

  /**
   * Send an AMS command to an Apple Media Service device to control music playback
   * Command is one of play, pause, playpause, next, prev, volup, voldown, repeat,
   * shuffle, skipforward, skipback, like, dislike, bookmark
   *
   * @param {any} id - For example, 'play', 'pause', 'volup' or 'voldown'
   * @url http://www.espruino.com/Reference#l_NRF_amsCommand
   */
  static amsCommand(id: any): void;

  /**
   * Check if Apple Current Time Service (CTS) is currently active on the BLE connection
   *
   * @returns {boolean} True if Apple Current Time Service (CTS) has been initialised and is active
   * @url http://www.espruino.com/Reference#l_NRF_ctsIsActive
   */
  static ctsIsActive(): boolean;

  /**
   * Returns time information from the Current Time Service
   * (if requested with `NRF.ctsGetTime` and is activated by calling `NRF.setServices(..., {..., cts:true})`)
   * ```
   * {
   *   date : // Date object with the current date
   *   day :  // if known, 0=sun,1=mon (matches JS `Date`)
   *   reason : [ // reason for the date change
   *       "external", // External time change
   *       "manual",   // Manual update
   *       "timezone", // Timezone changed
   *       "DST",      // Daylight savings
   *     ]
   *   timezone // if LTI characteristic exists, this is the timezone
   *   dst      // if LTI characteristic exists, this is the dst adjustment
   * }
   * ```
   * For instance this can be used as follows to update Espruino's time:
   * ```
   * E.on('CTS',e=>{
   *   setTime(e.date.getTime()/1000);
   * });
   * NRF.ctsGetTime(); // also returns a promise with CTS info
   * ```
   * @param {string} event - The event to listen to.
   * @param {(info: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `info` An object (see below)
   * @url http://www.espruino.com/Reference#l_NRF_CTS
   */
  static on(event: "CTS", callback: (info: any) => void): void;

  /**
   * Read the time from CTS - creates an `NRF.on('CTS', ...)` event as well
   * ```
   * NRF.ctsGetTime(); // also returns a promise
   * ```
   * @returns {any} A `Promise` that is resolved (or rejected) when time is received
   * @url http://www.espruino.com/Reference#l_NRF_ctsGetTime
   */
  static ctsGetTime(): Promise<void>;

  /**
   * Search for available devices matching the given filters. Since we have no UI
   * here, Espruino will pick the FIRST device it finds, or it'll call `catch`.
   * `options` can have the following fields:
   * * `filters` - a list of filters that a device must match before it is returned
   *   (see below)
   * * `timeout` - the maximum time to scan for in milliseconds (scanning stops when
   * a match is found. e.g. `NRF.requestDevice({ timeout:2000, filters: [ ... ] })`
   * * `active` - whether to perform active scanning (requesting 'scan response'
   * packets from any devices that are found). e.g. `NRF.requestDevice({ active:true,
   * filters: [ ... ] })`
   * * `phy` - (NRF52833/NRF52840 only) the type of Bluetooth signals to scan for (can
   *   be `"1mbps/coded/both/2mbps"`)
   *   * `1mbps` (default) - standard Bluetooth LE advertising
   *   * `coded` - long range
   *   * `both` - standard and long range
   *   * `2mbps` - high speed 2mbps (not working)
   * * `extended` - (NRF52833/NRF52840 only) support receiving extended-length advertising
   *   packets (default=true if phy isn't `"1mbps"`)
   * * `extended` - (NRF52833/NRF52840 only) support receiving extended-length advertising
   *   packets (default=true if phy isn't `"1mbps"`)
   * * `window` - (2v22+) how long we scan for in milliseconds (default 100ms)
   * * `interval` - (2v22+) how often we scan in milliseconds (default 100ms) - `window=interval=100`(default) is all the time. When
   * scanning on both `1mbps` and `coded`, `interval` needs to be twice `window`.
   * **NOTE:** `timeout` and `active` are not part of the Web Bluetooth standard.
   * The following filter types are implemented:
   * * `services` - list of services as strings (all of which must match). 128 bit
   *   services must be in the form '01230123-0123-0123-0123-012301230123'
   * * `name` - exact device name
   * * `namePrefix` - starting characters of device name
   * * `id` - exact device address (`id:"e9:53:86:09:89:99 random"`) (this is
   *   Espruino-specific, and is not part of the Web Bluetooth spec)
   * * `serviceData` - an object containing service characteristics which must all
   *   match (`serviceData:{"1809":{}}`). Matching of actual service data is not
   *   supported yet.
   * * `manufacturerData` - an object containing manufacturer UUIDs which must all
   *   match (`manufacturerData:{0x0590:{}}`). Matching of actual manufacturer data
   *   is not supported yet.
   * ```
   * NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) { ... });
   * // or
   * NRF.requestDevice({ filters: [{ services: ['1823'] }] }).then(function(device) { ... });
   * // or
   * NRF.requestDevice({ filters: [{ manufacturerData:{0x0590:{}} }] }).then(function(device) { ... });
   * ```
   * As a full example, to send data to another Puck.js to turn an LED on:
   * ```
   * var gatt;
   * NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }] }).then(function(device) {
   *   return device.gatt.connect();
   * }).then(function(g) {
   *   gatt = g;
   *   return gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
   * }).then(function(service) {
   *   return service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
   * }).then(function(characteristic) {
   *   return characteristic.writeValue("LED1.set()\n");
   * }).then(function() {
   *   gatt.disconnect();
   *   console.log("Done!");
   * });
   * ```
   * Or slightly more concisely, using ES6 arrow functions:
   * ```
   * var gatt;
   * NRF.requestDevice({ filters: [{ namePrefix: 'Puck.js' }]}).then(
   *   device => device.gatt.connect()).then(
   *   g => (gatt=g).getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e")).then(
   *   service => service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e")).then(
   *   characteristic => characteristic.writeValue("LED1.reset()\n")).then(
   *   () => { gatt.disconnect(); console.log("Done!"); } );
   * ```
   * Note that you have to keep track of the `gatt` variable so that you can
   * disconnect the Bluetooth connection when you're done.
   * **Note:** Using a filter in `NRF.requestDevice` filters each advertising packet
   * individually. As soon as a matching advertisement is received,
   * `NRF.requestDevice` resolves the promise and stops scanning. This means that if
   * you filter based on a service UUID and a device advertises with multiple packets
   * (or a scan response when `active:true`) only the packet matching the filter is
   * returned - you may not get the device's name is that was in a separate packet.
   * To aggregate multiple packets you can use `NRF.findDevices`.
   *
   * @param {any} options - Options used to filter the device to use
   * @returns {any} A `Promise` that is resolved (or rejected) when the connection is complete
   * @url http://www.espruino.com/Reference#l_NRF_requestDevice
   */
  static requestDevice(options?: { filters?: NRFFilters[], timeout?: number, active?: boolean, phy?: string, extended?: boolean }): Promise<any>;

  /**
   * Connect to a BLE device by MAC address. Returns a promise, the argument of which
   * is the `BluetoothRemoteGATTServer` connection.
   * ```
   * NRF.connect("aa:bb:cc:dd:ee").then(function(server) {
   *   // ...
   * });
   * ```
   * This has the same effect as calling `BluetoothDevice.gatt.connect` on a
   * `BluetoothDevice` requested using `NRF.requestDevice`. It just allows you to
   * specify the address directly (without having to scan).
   * You can use it as follows - this would connect to another Puck device and turn
   * its LED on:
   * ```
   * var gatt;
   * NRF.connect("aa:bb:cc:dd:ee random").then(function(g) {
   *   gatt = g;
   *   return gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
   * }).then(function(service) {
   *   return service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
   * }).then(function(characteristic) {
   *   return characteristic.writeValue("LED1.set()\n");
   * }).then(function() {
   *   gatt.disconnect();
   *   console.log("Done!");
   * });
   * ```
   * **Note:** Espruino Bluetooth devices use a type of BLE address known as 'random
   * static', which is different to a 'public' address. To connect to an Espruino
   * device you'll need to use an address string of the form `"aa:bb:cc:dd:ee
   * random"` rather than just `"aa:bb:cc:dd:ee"`. If you scan for devices with
   * `NRF.findDevices`/`NRF.setScan` then addresses are already reported in the
   * correct format.
   *
   * @param {any} mac - The MAC address to connect to
   * @param {any} options - (Espruino-specific) An object of connection options (see `BluetoothRemoteGATTServer.connect` for full details)
   * @returns {any} A `Promise` that is resolved (or rejected) when the connection is complete
   * @url http://www.espruino.com/Reference#l_NRF_connect
   */
  static connect(mac: any, options: any): Promise<void>;

  /**
   * If set to true, whenever a device bonds it will be added to the whitelist.
   * When set to false, the whitelist is cleared and newly bonded devices will not be
   * added to the whitelist.
   * **Note:** This is remembered between `reset()`s but isn't remembered after
   * power-on (you'll have to add it to `onInit()`.
   *
   * @param {boolean} whitelisting - Are we using a whitelist? (default false)
   * @url http://www.espruino.com/Reference#l_NRF_setWhitelist
   */
  static setWhitelist(whitelisting: boolean): void;

  /**
   * When connected, Bluetooth LE devices communicate at a set interval. Lowering the
   * interval (e.g. more packets/second) means a lower delay when sending data, higher
   * bandwidth, but also more power consumption.
   * By default, when connected as a peripheral Espruino automatically adjusts the
   * connection interval. When connected it's as fast as possible (7.5ms) but when
   * idle for over a minute it drops to 200ms. On continued activity (>1 BLE
   * operation) the interval is raised to 7.5ms again.
   * The options for `interval` are:
   * * `undefined` / `"auto"` : (default) automatically adjust connection interval
   * * `100` : set min and max connection interval to the same number (between 7.5ms
   *   and 4000ms)
   * * `{minInterval:20, maxInterval:100}` : set min and max connection interval as a
   *   range
   * This configuration is not remembered during a `save()` - you will have to re-set
   * it via `onInit`.
   * **Note:** If connecting to another device (as Central), you can use an extra
   * argument to `NRF.connect` or `BluetoothRemoteGATTServer.connect` to specify a
   * connection interval.
   * **Note:** This overwrites any changes imposed by the deprecated
   * `NRF.setLowPowerConnection`
   *
   * @param {any} interval - The connection interval to use (see below)
   * @url http://www.espruino.com/Reference#l_NRF_setConnectionInterval
   */
  static setConnectionInterval(interval: any): void;

  /**
   * Sets the security options used when connecting/pairing. This applies to both
   * central *and* peripheral mode.
   * ```
   * NRF.setSecurity({
   *   display : bool  // default false, can this device display a passkey on a screen/etc?
   *                   // - sent via the `BluetoothDevice.passkey` event
   *   keyboard : bool // default false, can this device enter a passkey
   *                   // - request sent via the `BluetoothDevice.passkeyRequest` event
   *   pair : bool // default true, allow other devices to pair with this device
   *   bond : bool // default true, Perform bonding
   *               // This stores info from pairing in flash and allows reconnecting without having to pair each time
   *   mitm : bool // default false, Man In The Middle protection
   *   lesc : bool // default false, LE Secure Connections
   *   passkey : // default "", or a 6 digit passkey to use (display must be true for this)
   *   oob : [0..15] // if specified, Out Of Band pairing is enabled and
   *                 // the 16 byte pairing code supplied here is used
   *   encryptUart : bool // default false (unless oob or passkey specified)
   *                      // This sets the BLE UART service such that it
   *                      // is encrypted and can only be used from a paired connection
   * });
   * ```
   * **NOTE:** Some combinations of arguments will cause an error. For example
   * supplying a passkey without `display:1` is not allowed. If `display:1` is set
   * you do not require a physical display, the user just needs to know the passkey
   * you supplied.
   * For instance, to require pairing and to specify a passkey, use:
   * ```
   * NRF.setSecurity({passkey:"123456", mitm:1, display:1});
   * ```
   * Or to require pairing and to display a PIN that the connecting device
   * provides, use:
   * ```
   * NRF.setSecurity({mitm:1, display:1});
   * NRF.on("passkey", key => print("Enter PIN: ", key));
   * ```
   * However, while most devices will request a passkey for pairing at this point it
   * is still possible for a device to connect without requiring one (e.g. using the
   * 'NRF Connect' app).
   * To force a passkey you need to protect each characteristic you define with
   * `NRF.setSecurity`. For instance the following code will *require* that the
   * passkey `123456` is entered before the characteristic
   * `9d020002-bf5f-1d1a-b52a-fe52091d5b12` can be read.
   * ```
   * NRF.setSecurity({passkey:"123456", mitm:1, display:1});
   * NRF.setServices({
   *   "9d020001-bf5f-1d1a-b52a-fe52091d5b12" : {
   *     "9d020002-bf5f-1d1a-b52a-fe52091d5b12" : {
   *       // readable always
   *       value : "Not Secret"
   *     },
   *     "9d020003-bf5f-1d1a-b52a-fe52091d5b12" : {
   *       // readable only once bonded
   *       value : "Secret",
   *       readable : true,
   *       security: {
   *         read: {
   *           mitm: true,
   *           encrypted: true
   *         }
   *       }
   *     },
   *     "9d020004-bf5f-1d1a-b52a-fe52091d5b12" : {
   *       // readable always
   *       // writable only once bonded
   *       value : "Readable",
   *       readable : true,
   *       writable : true,
   *       onWrite : function(evt) {
   *         console.log("Wrote ", evt.data);
   *       },
   *       security: {
   *         write: {
   *           mitm: true,
   *           encrypted: true
   *         }
   *       }
   *     }
   *   }
   * });
   * ```
   * **Note:** If `passkey` or `oob` is specified, the Nordic UART service (if
   * enabled) will automatically be set to require encryption, but otherwise it is
   * open.
   *
   * @param {any} options - An object containing security-related options (see below)
   * @url http://www.espruino.com/Reference#l_NRF_setSecurity
   */
  static setSecurity(options: any): void;

  /**
   * Return an object with information about the security state of the current
   * peripheral connection:
   * ```
   * {
   *   connected       // The connection is active (not disconnected).
   *   encrypted       // Communication on this link is encrypted.
   *   mitm_protected  // The encrypted communication is also protected against man-in-the-middle attacks.
   *   bonded          // The peer is bonded with us
   *   advertising     // Are we currently advertising?
   *   connected_addr  // If connected=true, the MAC address of the currently connected device
   * }
   * ```
   * If there is no active connection, `{connected:false}` will be returned.
   * See `NRF.setSecurity` for information about negotiating a secure connection.
   * @returns {any} An object
   * @url http://www.espruino.com/Reference#l_NRF_getSecurityStatus
   */
  static getSecurityStatus(): NRFSecurityStatus;

  /**
   *
   * @param {boolean} forceRepair - True if we should force repairing even if there is already valid pairing info
   * @returns {any} A promise
   * @url http://www.espruino.com/Reference#l_NRF_startBonding
   */
  static startBonding(forceRepair: boolean): any;


}

/**
 * This class provides functionality to recognise gestures drawn on a touchscreen.
 * It is only built into Bangle.js 2.
 * Usage:
 * ```
 * var strokes = {
 *   stroke1 : Unistroke.new(new Uint8Array([x1, y1, x2, y2, x3, y3, ...])),
 *   stroke2 : Unistroke.new(new Uint8Array([x1, y1, x2, y2, x3, y3, ...])),
 *   stroke3 : Unistroke.new(new Uint8Array([x1, y1, x2, y2, x3, y3, ...]))
 * };
 * var r = Unistroke.recognise(strokes,new Uint8Array([x1, y1, x2, y2, x3, y3, ...]))
 * print(r); // stroke1/stroke2/stroke3
 * ```
 * @url http://www.espruino.com/Reference#Unistroke
 */
declare class Unistroke {
  /**
   * Create a new Unistroke based on XY coordinates
   *
   * @param {any} xy - An array of interleaved XY coordinates
   * @returns {any} A string of data representing this unistroke
   * @url http://www.espruino.com/Reference#l_Unistroke_new
   */
  static new(xy: any): any;

  /**
   * Recognise based on an object of named strokes, and a list of XY coordinates
   *
   * @param {any} strokes - An object of named strokes : `{arrow:..., circle:...}`
   * @param {any} xy - An array of interleaved XY coordinates
   * @returns {any} The key name of the matched stroke
   * @url http://www.espruino.com/Reference#l_Unistroke_recognise
   */
  static recognise(strokes: any, xy: any): any;


}

/**
 * Class containing AES encryption/decryption
 * **Note:** This library is currently only included in builds for boards where
 * there is space. For other boards there is `crypto.js` which implements SHA1 in
 * JS.
 * @url http://www.espruino.com/Reference#AES
 */
declare class AES {
  /**
   *
   * @param {any} passphrase - Message to encrypt
   * @param {any} key - Key to encrypt message - must be an ArrayBuffer of 128, 192, or 256 BITS
   * @param {any} [options] - [optional] An object, may specify `{ iv : new Uint8Array(16), mode : 'CBC|CFB|CTR|OFB|ECB' }`
   * @returns {any} Returns an ArrayBuffer
   * @url http://www.espruino.com/Reference#l_AES_encrypt
   */
  static encrypt(passphrase: any, key: any, options?: any): ArrayBuffer;

  /**
   *
   * @param {any} passphrase - Message to decrypt
   * @param {any} key - Key to encrypt message - must be an ArrayBuffer of 128, 192, or 256 BITS
   * @param {any} [options] - [optional] An object, may specify `{ iv : new Uint8Array(16), mode : 'CBC|CFB|CTR|OFB|ECB' }`
   * @returns {any} Returns an ArrayBuffer
   * @url http://www.espruino.com/Reference#l_AES_decrypt
   */
  static decrypt(passphrase: any, key: any, options?: any): ArrayBuffer;


}

/**
 * Class containing utility functions for
 * [Pixl.js](http://www.espruino.com/Pixl.js)
 * @url http://www.espruino.com/Reference#Pixl
 */
declare class Pixl {
  /**
   * **DEPRECATED** - Please use `E.getBattery()` instead.
   * Return an approximate battery percentage remaining based on a normal CR2032
   * battery (2.8 - 2.2v)
   * @returns {number} A percentage between 0 and 100
   * @url http://www.espruino.com/Reference#l_Pixl_getBatteryPercentage
   */
  static getBatteryPercentage(): number;

  /**
   * Set the LCD's contrast
   *
   * @param {number} c - Contrast between 0 and 1
   * @url http://www.espruino.com/Reference#l_Pixl_setContrast
   */
  static setContrast(c: number): void;

  /**
   * This function can be used to turn Pixl.js's LCD off or on.
   * * With the LCD off, Pixl.js draws around 0.1mA
   * * With the LCD on, Pixl.js draws around 0.25mA
   *
   * @param {boolean} isOn - True if the LCD should be on, false if not
   * @url http://www.espruino.com/Reference#l_Pixl_setLCDPower
   */
  static setLCDPower(isOn: boolean): void;

  /**
   * Writes a command directly to the ST7567 LCD controller
   *
   * @param {number} c
   * @url http://www.espruino.com/Reference#l_Pixl_lcdw
   */
  static lcdw(c: number): void;

  /**
   * Display a menu on Pixl.js's screen, and set up the buttons to navigate through
   * it.
   * DEPRECATED: Use `E.showMenu`
   *
   * @param {any} menu - An object containing name->function mappings to to be used in a menu
   * @returns {any} A menu object with `draw`, `move` and `select` functions
   * @url http://www.espruino.com/Reference#l_Pixl_menu
   */
  static menu(menu: Menu): MenuInstance;


}

/**
 * This class exists in order to interface Espruino with fast-moving trigger
 * wheels. Trigger wheels are physical discs with evenly spaced teeth cut into
 * them, and often with one or two teeth next to each other missing. A sensor sends
 * a signal whenever a tooth passed by, and this allows a device to measure not
 * only RPM, but absolute position.
 * This class is currently in testing - it is NOT AVAILABLE on normal boards.
 * @url http://www.espruino.com/Reference#Trig
 */
declare class Trig {
  /**
   * Get the position of the trigger wheel at the given time (from getTime)
   *
   * @param {number} time - The time at which to find the position
   * @returns {number} The position of the trigger wheel in degrees - as a floating point number
   * @url http://www.espruino.com/Reference#l_Trig_getPosAtTime
   */
  static getPosAtTime(time: number): number;

  /**
   * Initialise the trigger class
   *
   * @param {Pin} pin - The pin to use for triggering
   * @param {any} options - Additional options as an object. defaults are: ```{teethTotal:60,teethMissing:2,minRPM:30,keyPosition:0}```
   * @url http://www.espruino.com/Reference#l_Trig_setup
   */
  static setup(pin: Pin, options: any): void;

  /**
   * Set a trigger for a certain point in the cycle
   *
   * @param {number} num - The trigger number (0..7)
   * @param {number} pos - The position (in degrees) to fire the trigger at
   * @param {any} pins - An array of pins to pulse (max 4)
   * @param {number} pulseLength - The time (in msec) to pulse for
   * @url http://www.espruino.com/Reference#l_Trig_setTrigger
   */
  static setTrigger(num: number, pos: number, pins: any, pulseLength: number): void;

  /**
   * Disable a trigger
   *
   * @param {number} num - The trigger number (0..7)
   * @url http://www.espruino.com/Reference#l_Trig_killTrigger
   */
  static killTrigger(num: number): void;

  /**
   * Get the current state of a trigger
   *
   * @param {number} num - The trigger number (0..7)
   * @returns {any} A structure containing all information about the trigger
   * @url http://www.espruino.com/Reference#l_Trig_getTrigger
   */
  static getTrigger(num: number): any;

  /**
   * Get the RPM of the trigger wheel
   * @returns {number} The current RPM of the trigger wheel
   * @url http://www.espruino.com/Reference#l_Trig_getRPM
   */
  static getRPM(): number;

  /**
   * Get the current error flags from the trigger wheel - and zero them
   * @returns {number} The error flags
   * @url http://www.espruino.com/Reference#l_Trig_getErrors
   */
  static getErrors(): number;

  /**
   * Get the current error flags from the trigger wheel - and zero them
   * @returns {any} An array of error strings
   * @url http://www.espruino.com/Reference#l_Trig_getErrorArray
   */
  static getErrorArray(): any;


}

/**
 * @url http://www.espruino.com/Reference#Dickens
 */
declare class Dickens {



}

/**
 * This class helps to convert URLs into Objects of information ready for
 * http.request/get
 * @url http://www.espruino.com/Reference#url
 */
declare class url {
  /**
   * A utility function to split a URL into parts
   * This is useful in web servers for instance when handling a request.
   * For instance `url.parse("/a?b=c&d=e",true)` returns
   * `{"method":"GET","host":"","path":"/a?b=c&d=e","pathname":"/a","search":"?b=c&d=e","port":80,"query":{"b":"c","d":"e"}}`
   *
   * @param {any} urlStr - A URL to be parsed
   * @param {boolean} parseQuery - Whether to parse the query string into an object not (default = false)
   * @returns {any} An object containing options for ```http.request``` or ```http.get```. Contains `method`, `host`, `path`, `pathname`, `search`, `port` and `query`
   * @url http://www.espruino.com/Reference#l_url_parse
   */
  static parse(urlStr: any, parseQuery: boolean): any;


}

/**
 * The socket server created by `require('net').createServer`
 * @url http://www.espruino.com/Reference#Server
 */
declare class Server {


  /**
   * Start listening for new connections on the given port
   *
   * @param {number} port - The port to listen on
   * @returns {any} The HTTP server instance that 'listen' was called on
   * @url http://www.espruino.com/Reference#l_Server_listen
   */
  listen(port: number): any;

  /**
   * Stop listening for new connections
   * @url http://www.espruino.com/Reference#l_Server_close
   */
  close(): void;
}

/**
 * An actual socket connection - allowing transmit/receive of TCP data
 * @url http://www.espruino.com/Reference#Socket
 */
declare class Socket {
  /**
   * The 'data' event is called when data is received. If a handler is defined with
   * `X.on('data', function(data) { ... })` then it will be called, otherwise data
   * will be stored in an internal buffer, where it can be retrieved with `X.read()`
   * @param {string} event - The event to listen to.
   * @param {(data: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `data` A string containing one or more characters of received data
   * @url http://www.espruino.com/Reference#l_Socket_data
   */
  static on(event: "data", callback: (data: any) => void): void;

  /**
   * Called when the connection closes.
   * @param {string} event - The event to listen to.
   * @param {(had_error: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `had_error` A boolean indicating whether the connection had an error (use an error event handler to get error details).
   * @url http://www.espruino.com/Reference#l_Socket_close
   */
  static on(event: "close", callback: (had_error: any) => void): void;

  /**
   * There was an error on this socket and it is closing (or wasn't opened in the
   * first place). If a "connected" event was issued on this socket then the error
   * event is always followed by a close event. The error codes are:
   * * -1: socket closed (this is not really an error and will not cause an error
   *   callback)
   * * -2: out of memory (typically while allocating a buffer to hold data)
   * * -3: timeout
   * * -4: no route
   * * -5: busy
   * * -6: not found (DNS resolution)
   * * -7: max sockets (... exceeded)
   * * -8: unsent data (some data could not be sent)
   * * -9: connection reset (or refused)
   * * -10: unknown error
   * * -11: no connection
   * * -12: bad argument
   * * -13: SSL handshake failed
   * * -14: invalid SSL data
   * @param {string} event - The event to listen to.
   * @param {(details: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `details` An error object with an error code (a negative integer) and a message.
   * @url http://www.espruino.com/Reference#l_Socket_error
   */
  static on(event: "error", callback: (details: any) => void): void;

  /**
   * An event that is fired when the buffer is empty and it can accept more data to
   * send.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_Socket_drain
   */
  static on(event: "drain", callback: () => void): void;

  /**
   * Return how many bytes are available to read. If there is already a listener for
   * data, this will always return 0.
   * @returns {number} How many bytes are available
   * @url http://www.espruino.com/Reference#l_Socket_available
   */
  available(): number;

  /**
   * Return a string containing characters that have been received
   *
   * @param {number} chars - The number of characters to read, or undefined/0 for all available
   * @returns {any} A string containing the required bytes.
   * @url http://www.espruino.com/Reference#l_Socket_read
   */
  read(chars: number): any;

  /**
   * Pipe this to a stream (an object with a 'write' method)
   *
   * @param {any} destination - The destination file/stream that will receive content from the source.
   * @param {any} [options]
   * [optional] An object `{ chunkSize : int=32, end : bool=true, complete : function }`
   * chunkSize : The amount of data to pipe from source to destination at a time
   * complete : a function to call when the pipe activity is complete
   * end : call the 'end' function on the destination when the source is finished
   * @url http://www.espruino.com/Reference#l_Socket_pipe
   */
  pipe(destination: any, options?: PipeOptions): void

  /**
   * This function writes the `data` argument as a string. Data that is passed in
   * (including arrays) will be converted to a string with the normal JavaScript
   * `toString` method.
   * If you wish to send binary data then you need to convert that data directly to a
   * String. This can be done with `String.fromCharCode`, however it's often easier
   * and faster to use the Espruino-specific `E.toString`, which will read its
   * arguments as an array of bytes and convert that to a String:
   * ```
   * socket.write(E.toString([0,1,2,3,4,5]));
   * ```
   * If you need to send something other than bytes, you can use 'Typed Arrays', or
   * even `DataView`:
   * ```
   * var d = new DataView(new ArrayBuffer(8)); // 8 byte array buffer
   * d.setFloat32(0, 765.3532564); // write float at bytes 0-3
   * d.setInt8(4, 42); // write int8 at byte 4
   * socket.write(E.toString(d.buffer))
   * ```
   *
   * @param {any} data - A string containing data to send
   * @returns {boolean} For node.js compatibility, returns the boolean false. When the send buffer is empty, a `drain` event will be sent
   * @url http://www.espruino.com/Reference#l_Socket_write
   */
  write(data: any): boolean;

  /**
   * Close this socket - optional data to append as an argument.
   * See `Socket.write` for more information about the data argument
   *
   * @param {any} data - A string containing data to send
   * @url http://www.espruino.com/Reference#l_Socket_end
   */
  end(data: any): void;
}

/**
 * An actual socket connection - allowing transmit/receive of TCP data
 * @url http://www.espruino.com/Reference#dgramSocket
 */
declare class dgramSocket {
  /**
   * The 'message' event is called when a datagram message is received. If a handler
   * is defined with `X.on('message', function(msg) { ... })` then it will be called`
   * @param {string} event - The event to listen to.
   * @param {(msg: any, rinfo: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `msg` A string containing the received message
   * * `rinfo` Sender address,port containing information
   * @url http://www.espruino.com/Reference#l_dgramSocket_message
   */
  static on(event: "message", callback: (msg: any, rinfo: any) => void): void;

  /**
   * Called when the connection closes.
   * @param {string} event - The event to listen to.
   * @param {(had_error: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `had_error` A boolean indicating whether the connection had an error (use an error event handler to get error details).
   * @url http://www.espruino.com/Reference#l_dgramSocket_close
   */
  static on(event: "close", callback: (had_error: any) => void): void;

  /**
   *
   * @param {any} buffer - A string containing message to send
   * @param {any} offset - Offset in the passed string where the message starts [optional]
   * @param {any} length - Number of bytes in the message [optional]
   * @param {any} args - Destination port number, Destination IP address string
   * @url http://www.espruino.com/Reference#l_dgramSocket_send
   */
  send(buffer: any, offset: any, length: any, ...args: any[]): void;

  /**
   *
   * @param {number} port - The port to bind at
   * @param {any} callback - A function(res) that will be called when the socket is bound. You can then call `res.on('message', function(message, info) { ... })` and `res.on('close', function() { ... })` to deal with the response.
   * @returns {any} The dgramSocket instance that 'bind' was called on
   * @url http://www.espruino.com/Reference#l_dgramSocket_bind
   */
  bind(port: number, callback: any): any;

  /**
   * Close the socket
   * @url http://www.espruino.com/Reference#l_dgramSocket_close
   */
  close(): void;

  /**
   *
   * @param {any} group - A string containing the group ip to join
   * @param {any} ip - A string containing the ip to join with
   * @url http://www.espruino.com/Reference#l_dgramSocket_addMembership
   */
  addMembership(group: any, ip: any): void;
}

/**
 * The HTTP server created by `require('http').createServer`
 * @url http://www.espruino.com/Reference#httpSrv
 */
declare class httpSrv {


  /**
   * Start listening for new HTTP connections on the given port
   *
   * @param {number} port - The port to listen on
   * @returns {any} The HTTP server instance that 'listen' was called on
   * @url http://www.espruino.com/Reference#l_httpSrv_listen
   */
  listen(port: number): any;

  /**
   * Stop listening for new HTTP connections
   * @url http://www.espruino.com/Reference#l_httpSrv_close
   */
  close(): void;
}

/**
 * The HTTP server request
 * @url http://www.espruino.com/Reference#httpSRq
 */
declare class httpSRq {
  /**
   * The 'data' event is called when data is received. If a handler is defined with
   * `X.on('data', function(data) { ... })` then it will be called, otherwise data
   * will be stored in an internal buffer, where it can be retrieved with `X.read()`
   * @param {string} event - The event to listen to.
   * @param {(data: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `data` A string containing one or more characters of received data
   * @url http://www.espruino.com/Reference#l_httpSRq_data
   */
  static on(event: "data", callback: (data: any) => void): void;

  /**
   * Called when the connection closes.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_httpSRq_close
   */
  static on(event: "close", callback: () => void): void;

  /**
   * The headers to sent to the server with this HTTP request.
   * @returns {any} An object mapping header name to value
   * @url http://www.espruino.com/Reference#l_httpSRq_headers
   */
  headers: any;

  /**
   * The HTTP method used with this request. Often `"GET"`.
   * @returns {any} A string
   * @url http://www.espruino.com/Reference#l_httpSRq_method
   */
  method: any;

  /**
   * The URL requested in this HTTP request, for instance:
   * * `"/"` - the main page
   * * `"/favicon.ico"` - the web page's icon
   * @returns {any} A string representing the URL
   * @url http://www.espruino.com/Reference#l_httpSRq_url
   */
  url: any;

  /**
   * Return how many bytes are available to read. If there is already a listener for
   * data, this will always return 0.
   * @returns {number} How many bytes are available
   * @url http://www.espruino.com/Reference#l_httpSRq_available
   */
  available(): number;

  /**
   * Return a string containing characters that have been received
   *
   * @param {number} chars - The number of characters to read, or undefined/0 for all available
   * @returns {any} A string containing the required bytes.
   * @url http://www.espruino.com/Reference#l_httpSRq_read
   */
  read(chars: number): any;

  /**
   * Pipe this to a stream (an object with a 'write' method)
   *
   * @param {any} destination - The destination file/stream that will receive content from the source.
   * @param {any} [options]
   * [optional] An object `{ chunkSize : int=32, end : bool=true, complete : function }`
   * chunkSize : The amount of data to pipe from source to destination at a time
   * complete : a function to call when the pipe activity is complete
   * end : call the 'end' function on the destination when the source is finished
   * @url http://www.espruino.com/Reference#l_httpSRq_pipe
   */
  pipe(dest: any, options?: PipeOptions): void
}

/**
 * The HTTP server response
 * @url http://www.espruino.com/Reference#httpSRs
 */
declare class httpSRs {
  /**
   * An event that is fired when the buffer is empty and it can accept more data to
   * send.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_httpSRs_drain
   */
  static on(event: "drain", callback: () => void): void;

  /**
   * Called when the connection closes.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_httpSRs_close
   */
  static on(event: "close", callback: () => void): void;

  /**
   * The headers to send back along with the HTTP response.
   * The default contents are:
   * ```
   * {
   *   "Connection": "close"
   *  }
   * ```
   * @returns {any} An object mapping header name to value
   * @url http://www.espruino.com/Reference#l_httpSRs_headers
   */
  headers: any;

  /**
   * This function writes the `data` argument as a string. Data that is passed in
   * (including arrays) will be converted to a string with the normal JavaScript
   * `toString` method. For more information about sending binary data see
   * `Socket.write`
   *
   * @param {any} data - A string containing data to send
   * @returns {boolean} For node.js compatibility, returns the boolean false. When the send buffer is empty, a `drain` event will be sent
   * @url http://www.espruino.com/Reference#l_httpSRs_write
   */
  write(data: any): boolean;

  /**
   * See `Socket.write` for more information about the data argument
   *
   * @param {any} data - A string containing data to send
   * @url http://www.espruino.com/Reference#l_httpSRs_end
   */
  end(data: any): void;

  /**
   * Send the given status code and headers. If not explicitly called this will be
   * done automatically the first time data is written to the response.
   * This cannot be called twice, or after data has already been sent in the
   * response.
   *
   * @param {number} statusCode - The HTTP status code
   * @param {any} headers - An object containing the headers
   * @url http://www.espruino.com/Reference#l_httpSRs_writeHead
   */
  writeHead(statusCode: number, headers: any): void;

  /**
   * Set a value to send in the header of this HTTP response. This updates the
   * `httpSRs.headers` property.
   * Any headers supplied to `writeHead` will overwrite any headers with the same
   * name.
   *
   * @param {any} name - The name of the header as a String
   * @param {any} value - The value of the header as a String
   * @url http://www.espruino.com/Reference#l_httpSRs_setHeader
   */
  setHeader(name: any, value: any): void;
}

/**
 * The HTTP client request, returned by `http.request()` and `http.get()`.
 * @url http://www.espruino.com/Reference#httpCRq
 */
declare class httpCRq {
  /**
   * An event that is fired when the buffer is empty and it can accept more data to
   * send.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_httpCRq_drain
   */
  static on(event: "drain", callback: () => void): void;

  /**
   * An event that is fired if there is an error making the request and the response
   * callback has not been invoked. In this case the error event concludes the
   * request attempt. The error event function receives an error object as parameter
   * with a `code` field and a `message` field.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_httpCRq_error
   */
  static on(event: "error", callback: () => void): void;

  /**
   * This function writes the `data` argument as a string. Data that is passed in
   * (including arrays) will be converted to a string with the normal JavaScript
   * `toString` method. For more information about sending binary data see
   * `Socket.write`
   *
   * @param {any} data - A string containing data to send
   * @returns {boolean} For node.js compatibility, returns the boolean false. When the send buffer is empty, a `drain` event will be sent
   * @url http://www.espruino.com/Reference#l_httpCRq_write
   */
  write(data: any): boolean;

  /**
   * Finish this HTTP request - optional data to append as an argument
   * See `Socket.write` for more information about the data argument
   *
   * @param {any} data - A string containing data to send
   * @url http://www.espruino.com/Reference#l_httpCRq_end
   */
  end(data: any): void;
}

/**
 * The HTTP client response, passed to the callback of `http.request()` an
 * `http.get()`.
 * @url http://www.espruino.com/Reference#httpCRs
 */
declare class httpCRs {
  /**
   * The 'data' event is called when data is received. If a handler is defined with
   * `X.on('data', function(data) { ... })` then it will be called, otherwise data
   * will be stored in an internal buffer, where it can be retrieved with `X.read()`
   * @param {string} event - The event to listen to.
   * @param {(data: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `data` A string containing one or more characters of received data
   * @url http://www.espruino.com/Reference#l_httpCRs_data
   */
  static on(event: "data", callback: (data: any) => void): void;

  /**
   * Called when the connection closes with one `hadError` boolean parameter, which
   * indicates whether an error occurred.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_httpCRs_close
   */
  static on(event: "close", callback: () => void): void;

  /**
   * An event that is fired if there is an error receiving the response. The error
   * event function receives an error object as parameter with a `code` field and a
   * `message` field. After the error event the close even will also be triggered to
   * conclude the HTTP request/response.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_httpCRs_error
   */
  static on(event: "error", callback: () => void): void;

  /**
   * The headers received along with the HTTP response
   * @returns {any} An object mapping header name to value
   * @url http://www.espruino.com/Reference#l_httpCRs_headers
   */
  headers: any;

  /**
   * The HTTP response's status code - usually `"200"` if all went well
   * @returns {any} The status code as a String
   * @url http://www.espruino.com/Reference#l_httpCRs_statusCode
   */
  statusCode: any;

  /**
   * The HTTP response's status message - Usually `"OK"` if all went well
   * @returns {any} An String Status Message
   * @url http://www.espruino.com/Reference#l_httpCRs_statusMessage
   */
  statusMessage: any;

  /**
   * The HTTP version reported back by the server - usually `"1.1"`
   * @returns {any} Th
   * @url http://www.espruino.com/Reference#l_httpCRs_httpVersion
   */
  httpVersion: any;

  /**
   * Return how many bytes are available to read. If there is a 'data' event handler,
   * this will always return 0.
   * @returns {number} How many bytes are available
   * @url http://www.espruino.com/Reference#l_httpCRs_available
   */
  available(): number;

  /**
   * Return a string containing characters that have been received
   *
   * @param {number} chars - The number of characters to read, or undefined/0 for all available
   * @returns {any} A string containing the required bytes.
   * @url http://www.espruino.com/Reference#l_httpCRs_read
   */
  read(chars: number): any;

  /**
   * Pipe this to a stream (an object with a 'write' method)
   *
   * @param {any} destination - The destination file/stream that will receive content from the source.
   * @param {any} [options]
   * [optional] An object `{ chunkSize : int=32, end : bool=true, complete : function }`
   * chunkSize : The amount of data to pipe from source to destination at a time
   * complete : a function to call when the pipe activity is complete
   * end : call the 'end' function on the destination when the source is finished
   * @url http://www.espruino.com/Reference#l_httpCRs_pipe
   */
  pipe(destination: any, options?: PipeOptions): void
}

/**
 * An instantiation of an Ethernet network adaptor
 * @url http://www.espruino.com/Reference#Ethernet
 */
declare class Ethernet {


  /**
   * Get the current IP address, subnet, gateway and mac address.
   *
   * @param {any} [options] - [optional] An `callback(err, ipinfo)` function to be called back with the IP information.
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_Ethernet_getIP
   */
  getIP(options?: any): any;

  /**
   * Set the current IP address or get an IP from DHCP (if no options object is
   * specified)
   * If 'mac' is specified as an option, it must be a string of the form
   * `"00:01:02:03:04:05"` The default mac is 00:08:DC:01:02:03.
   *
   * @param {any} options - Object containing IP address options `{ ip : '1.2.3.4', subnet : '...', gateway: '...', dns:'...', mac:':::::'  }`, or do not supply an object in order to force DHCP.
   * @param {any} [callback] - [optional] An `callback(err)` function to invoke when ip is set. `err==null` on success, or a string on failure.
   * @returns {boolean} True on success
   * @url http://www.espruino.com/Reference#l_Ethernet_setIP
   */
  setIP(options: any, callback?: any): boolean;

  /**
   * Set hostname used during the DHCP request. Minimum 8 and maximum 12 characters,
   * best set before calling `eth.setIP()`. Default is WIZnet010203, 010203 is the
   * default nic as part of the mac.
   *
   * @param {any} hostname - hostname as string
   * @param {any} [callback] - [optional] An `callback(err)` function to be called back with null or error text.
   * @returns {boolean} True on success
   * @url http://www.espruino.com/Reference#l_Ethernet_setHostname
   */
  setHostname(hostname: any, callback?: any): boolean;

  /**
   * Returns the hostname
   *
   * @param {any} [callback] - [optional] An `callback(err,hostname)` function to be called back with the status information.
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_Ethernet_getHostname
   */
  getHostname(callback?: any): any;

  /**
   * Get the current status of the ethernet device
   *
   * @param {any} [options] - [optional] An `callback(err, status)` function to be called back with the status information.
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_Ethernet_getStatus
   */
  getStatus(options?: any): any;
}

/**
 * An instantiation of a WiFi network adaptor
 * @url http://www.espruino.com/Reference#WLAN
 */
declare class WLAN {


  /**
   * Connect to a wireless network
   *
   * @param {any} ap - Access point name
   * @param {any} key - WPA2 key (or undefined for unsecured connection)
   * @param {any} callback - Function to call back with connection status. It has one argument which is one of 'connect'/'disconnect'/'dhcp'
   * @returns {boolean} True if connection succeeded, false if it didn't.
   * @url http://www.espruino.com/Reference#l_WLAN_connect
   */
  connect(ap: any, key: any, callback: any): boolean;

  /**
   * Completely uninitialise and power down the CC3000. After this you'll have to use
   * ```require("CC3000").connect()``` again.
   * @url http://www.espruino.com/Reference#l_WLAN_disconnect
   */
  disconnect(): void;

  /**
   * Completely uninitialise and power down the CC3000, then reconnect to the old
   * access point.
   * @url http://www.espruino.com/Reference#l_WLAN_reconnect
   */
  reconnect(): void;

  /**
   * Get the current IP address
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_WLAN_getIP
   */
  getIP(): any;

  /**
   * Set the current IP address for get an IP from DHCP (if no options object is
   * specified).
   * **Note:** Changes are written to non-volatile memory, but will only take effect
   * after calling `wlan.reconnect()`
   *
   * @param {any} options - Object containing IP address options `{ ip : '1,2,3,4', subnet, gateway, dns }`, or do not supply an object in otder to force DHCP.
   * @returns {boolean} True on success
   * @url http://www.espruino.com/Reference#l_WLAN_setIP
   */
  setIP(options: any): boolean;
}

/**
 * Class containing [micro:bit's](https://www.espruino.com/MicroBit) utility
 * functions.
 * @url http://www.espruino.com/Reference#Microbit
 */
declare class Microbit {
  /**
   * The micro:bit's speaker pin
   * @returns {Pin}
   * @url http://www.espruino.com/Reference#l_Microbit_SPEAKER
   */
  static SPEAKER: Pin;

  /**
   * The micro:bit's microphone pin
   * `MIC_ENABLE` should be set to 1 before using this
   * @returns {Pin}
   * @url http://www.espruino.com/Reference#l_Microbit_MIC
   */
  static MIC: Pin;

  /**
   * The micro:bit's microphone enable pin
   * @returns {Pin}
   * @url http://www.espruino.com/Reference#l_Microbit_MIC_ENABLE
   */
  static MIC_ENABLE: Pin;

  /**
   * Called when the Micro:bit is moved in a deliberate fashion, and includes data on
   * the detected gesture.
   * @param {string} event - The event to listen to.
   * @param {(gesture: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `gesture` An Int8Array containing the accelerations (X,Y,Z) from the last gesture detected by the accelerometer
   * @url http://www.espruino.com/Reference#l_Microbit_gesture
   */
  static on(event: "gesture", callback: (gesture: any) => void): void;

  /**
   * @returns {any} An Object `{x,y,z}` of magnetometer readings as integers
   * @url http://www.espruino.com/Reference#l_Microbit_mag
   */
  static mag(): any;

  /**
   * @returns {any} An Object `{x,y,z}` of acceleration readings in G
   * @url http://www.espruino.com/Reference#l_Microbit_accel
   */
  static accel(): any;

  /**
   * **Note:** This function is only available on the [BBC micro:bit](/MicroBit)
   * board
   * Write the given value to the accelerometer
   *
   * @param {number} addr - Accelerometer address
   * @param {number} data - Data to write
   * @url http://www.espruino.com/Reference#l_Microbit_accelWr
   */
  static accelWr(addr: number, data: number): void;

  /**
   * Turn on the accelerometer, and create `Microbit.accel` and `Microbit.gesture`
   * events.
   * **Note:** The accelerometer is currently always enabled - this code just
   * responds to interrupts and reads
   * @url http://www.espruino.com/Reference#l_Microbit_accelOn
   */
  static accelOn(): void;

  /**
   * Turn off events from the accelerometer (started with `Microbit.accelOn`)
   * @url http://www.espruino.com/Reference#l_Microbit_accelOff
   */
  static accelOff(): void;

  /**
   * Play a waveform on the Micro:bit's speaker
   *
   * @param {any} waveform - An array of data to play (unsigned 8 bit)
   * @param {any} samplesPerSecond - The number of samples per second for playback default is 4000
   * @param {any} callback - A function to call when playback is finished
   * @url http://www.espruino.com/Reference#l_Microbit_play
   */
  static play(waveform: any, samplesPerSecond: any, callback: any): void;

  /**
   * Records sound from the micro:bit's onboard microphone and returns the result
   *
   * @param {any} samplesPerSecond - The number of samples per second for recording - 4000 is recommended
   * @param {any} callback - A function to call with the result of recording (unsigned 8 bit ArrayBuffer)
   * @param {any} [samples] - [optional] How many samples to record (6000 default)
   * @url http://www.espruino.com/Reference#l_Microbit_record
   */
  static record(samplesPerSecond: any, callback: any, samples?: any): void;


}

interface FileConstructor {

}

interface File {
  /**
   * Close an open file.
   * @url http://www.espruino.com/Reference#l_File_close
   */
  close(): void;

  /**
   * Write data to a file.
   * **Note:** By default this function flushes all changes to the SD card, which
   * makes it slow (but also safe!). You can use `E.setFlags({unsyncFiles:1})` to
   * disable this behaviour and really speed up writes - but then you must be sure to
   * close all files you are writing before power is lost or you will cause damage to
   * your SD card's filesystem.
   *
   * @param {any} buffer - A string containing the bytes to write
   * @returns {number} the number of bytes written
   * @url http://www.espruino.com/Reference#l_File_write
   */
  write(buffer: any): number;

  /**
   * Read data in a file in byte size chunks
   *
   * @param {number} length - is an integer specifying the number of bytes to read.
   * @returns {any} A string containing the characters that were read
   * @url http://www.espruino.com/Reference#l_File_read
   */
  read(length: number): any;

  /**
   * Skip the specified number of bytes forward in the file
   *
   * @param {number} nBytes - is a positive integer specifying the number of bytes to skip forwards.
   * @url http://www.espruino.com/Reference#l_File_skip
   */
  skip(nBytes: number): void;

  /**
   * Seek to a certain position in the file
   *
   * @param {number} nBytes - is an integer specifying the number of bytes to skip forwards.
   * @url http://www.espruino.com/Reference#l_File_seek
   */
  seek(nBytes: number): void;

  /**
   * Pipe this file to a stream (an object with a 'write' method)
   *
   * @param {any} destination - The destination file/stream that will receive content from the source.
   * @param {any} [options]
   * [optional] An object `{ chunkSize : int=32, end : bool=true, complete : function }`
   * chunkSize : The amount of data to pipe from source to destination at a time
   * complete : a function to call when the pipe activity is complete
   * end : call the 'end' function on the destination when the source is finished
   * @url http://www.espruino.com/Reference#l_File_pipe
   */
  pipe(destination: any, options?: PipeOptions): void
}

/**
 * This is the File object - it allows you to stream data to and from files (As
 * opposed to the `require('fs').readFile(..)` style functions that read an entire
 * file).
 * To create a File object, you must type ```var fd =
 * E.openFile('filepath','mode')``` - see [E.openFile](#l_E_openFile) for more
 * information.
 * **Note:** If you want to remove an SD card after you have started using it, you
 * *must* call `E.unmountSD()` or you may cause damage to the card.
 * @url http://www.espruino.com/Reference#File
 */
declare const File: FileConstructor

/**
 * Class containing [Puck.js's](http://www.puck-js.com) utility functions.
 * @url http://www.espruino.com/Reference#Puck
 */
declare class Puck {
  /**
   * Turn on the magnetometer, take a single reading, and then turn it off again.
   * An object of the form `{x,y,z}` is returned containing magnetometer readings.
   * Due to residual magnetism in the Puck and magnetometer itself, with no magnetic
   * field the Puck will not return `{x:0,y:0,z:0}`.
   * Instead, it's up to you to figure out what the 'zero value' is for your Puck in
   * your location and to then subtract that from the value returned. If you're not
   * trying to measure the Earth's magnetic field then it's a good idea to just take
   * a reading at startup and use that.
   * With the aerial at the top of the board, the `y` reading is vertical, `x` is
   * horizontal, and `z` is through the board.
   * Readings are in increments of 0.1 micro Tesla (uT). The Earth's magnetic field
   * varies from around 25-60 uT, so the reading will vary by 250 to 600 depending on
   * location.
   * @returns {any} An Object `{x,y,z}` of magnetometer readings as integers
   * @url http://www.espruino.com/Reference#l_Puck_mag
   */
  static mag(): any;

  /**
   * Turn on the magnetometer, take a single temperature reading from the MAG3110
   * chip, and then turn it off again.
   * (If the magnetometer is already on, this just returns the last reading obtained)
   * `E.getTemperature()` uses the microcontroller's temperature sensor, but this
   * uses the magnetometer's.
   * The reading obtained is an integer (so no decimal places), but the sensitivity
   * is factory trimmed. to 1&deg;C, however the temperature offset isn't - so
   * absolute readings may still need calibrating.
   * @returns {number} Temperature in degrees C
   * @url http://www.espruino.com/Reference#l_Puck_magTemp
   */
  static magTemp(): number;

  /**
   * Called after `Puck.magOn()` every time magnetometer data is sampled. There is
   * one argument which is an object of the form `{x,y,z}` containing magnetometer
   * readings as integers (for more information see `Puck.mag()`).
   * Check out [the Puck.js page on the
   * magnetometer](http://www.espruino.com/Puck.js#on-board-peripherals) for more
   * information.
   * ```JS
   * Puck.magOn(10); // 10 Hz
   * Puck.on('mag', function(e) {
   *   print(e);
   * });
   * // { "x": -874, "y": -332, "z": -1938 }
   * ```
   * @param {string} event - The event to listen to.
   * @param {(xyz: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `xyz` an object of the form `{x,y,z}`
   * @url http://www.espruino.com/Reference#l_Puck_mag
   */
  static on(event: "mag", callback: (xyz: any) => void): void;

  /**
   * Only on Puck.js v2.0
   * Called after `Puck.accelOn()` every time accelerometer data is sampled. There is
   * one argument which is an object of the form `{acc:{x,y,z}, gyro:{x,y,z}}`
   * containing the data.
   * ```JS
   * Puck.accelOn(12.5); // default 12.5Hz
   * Puck.on('accel', function(e) {
   *   print(e);
   * });
   * //{
   * //  "acc": { "x": -525, "y": -112, "z": 8160 },
   * //  "gyro": { "x": 154, "y": -152, "z": -34 }
   * //}
   * ```
   * The data is as it comes off the accelerometer and is not scaled to 1g. For more
   * information see `Puck.accel()` or [the Puck.js page on the
   * magnetometer](http://www.espruino.com/Puck.js#on-board-peripherals).
   * @param {string} event - The event to listen to.
   * @param {(e: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `e` an object of the form `{acc:{x,y,z}, gyro:{x,y,z}}`
   * @url http://www.espruino.com/Reference#l_Puck_accel
   */
  static on(event: "accel", callback: (e: any) => void): void;

  /**
   * Turn the magnetometer on and start periodic sampling. Samples will then cause a
   * 'mag' event on 'Puck':
   * ```
   * Puck.magOn();
   * Puck.on('mag', function(xyz) {
   *   console.log(xyz);
   *   // {x:..., y:..., z:...}
   * });
   * // Turn events off with Puck.magOff();
   * ```
   * This call will be ignored if the sampling is already on.
   * If given an argument, the sample rate is set (if not, it's at 0.63 Hz). The
   * sample rate must be one of the following (resulting in the given power
   * consumption):
   * * 80 Hz - 900uA
   * * 40 Hz - 550uA
   * * 20 Hz - 275uA
   * * 10 Hz - 137uA
   * * 5 Hz - 69uA
   * * 2.5 Hz - 34uA
   * * 1.25 Hz - 17uA
   * * 0.63 Hz - 8uA
   * * 0.31 Hz - 8uA
   * * 0.16 Hz - 8uA
   * * 0.08 Hz - 8uA
   * When the battery level drops too low while sampling is turned on, the
   * magnetometer may stop sampling without warning, even while other Puck functions
   * continue uninterrupted.
   * Check out [the Puck.js page on the
   * magnetometer](http://www.espruino.com/Puck.js#on-board-peripherals) for more
   * information.
   *
   * @param {number} samplerate - The sample rate in Hz, or undefined
   * @url http://www.espruino.com/Reference#l_Puck_magOn
   */
  static magOn(samplerate: number): void;

  /**
   * Turn the magnetometer off
   * @url http://www.espruino.com/Reference#l_Puck_magOff
   */
  static magOff(): void;

  /**
   * Writes a register on the LIS3MDL / MAX3110 Magnetometer. Can be used for
   * configuring advanced functions.
   * Check out [the Puck.js page on the
   * magnetometer](http://www.espruino.com/Puck.js#on-board-peripherals) for more
   * information and links to modules that use this function.
   *
   * @param {number} reg
   * @param {number} data
   * @url http://www.espruino.com/Reference#l_Puck_magWr
   */
  static magWr(reg: number, data: number): void;

  /**
   * Reads a register from the LIS3MDL / MAX3110 Magnetometer. Can be used for
   * configuring advanced functions.
   * Check out [the Puck.js page on the
   * magnetometer](http://www.espruino.com/Puck.js#on-board-peripherals) for more
   * information and links to modules that use this function.
   *
   * @param {number} reg
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Puck_magRd
   */
  static magRd(reg: number): number;

  /**
   * On Puck.js v2.0 this will use the on-board PCT2075TP temperature sensor, but on
   * Puck.js the less accurate on-chip Temperature sensor is used.
   * @returns {number} Temperature in degrees C
   * @url http://www.espruino.com/Reference#l_Puck_getTemperature
   */
  static getTemperature(): number;

  /**
   * Accepted values are:
   * * 1.6 Hz (no Gyro) - 40uA (2v05 and later firmware)
   * * 12.5 Hz (with Gyro)- 350uA
   * * 26 Hz (with Gyro) - 450 uA
   * * 52 Hz (with Gyro) - 600 uA
   * * 104 Hz (with Gyro) - 900 uA
   * * 208 Hz (with Gyro) - 1500 uA
   * * 416 Hz (with Gyro) (not recommended)
   * * 833 Hz (with Gyro) (not recommended)
   * * 1660 Hz (with Gyro) (not recommended)
   * Once `Puck.accelOn()` is called, the `Puck.accel` event will be called each time
   * data is received. `Puck.accelOff()` can be called to turn the accelerometer off.
   * For instance to light the red LED whenever Puck.js is face up:
   * ```
   * Puck.on('accel', function(a) {
   *  digitalWrite(LED1, a.acc.z > 0);
   * });
   * Puck.accelOn();
   * ```
   * Check out [the Puck.js page on the
   * accelerometer](http://www.espruino.com/Puck.js#on-board-peripherals) for more
   * information.
   * **Note:** Puck.js cannot currently read every sample from the
   * accelerometer at sample rates above 208Hz.
   *
   * @param {number} samplerate - The sample rate in Hz, or `undefined` (default is 12.5 Hz)
   * @url http://www.espruino.com/Reference#l_Puck_accelOn
   */
  static accelOn(samplerate: number): void;

  /**
   * Turn the accelerometer off after it has been turned on by `Puck.accelOn()`.
   * Check out [the Puck.js page on the
   * accelerometer](http://www.espruino.com/Puck.js#on-board-peripherals) for more
   * information.
   * @url http://www.espruino.com/Reference#l_Puck_accelOff
   */
  static accelOff(): void;

  /**
   * Turn on the accelerometer, take a single reading, and then turn it off again.
   * The values reported are the raw values from the chip. In normal configuration:
   * * accelerometer: full-scale (32768) is 4g, so you need to divide by 8192 to get
   *   correctly scaled values
   * * gyro: full-scale (32768) is 245 dps, so you need to divide by 134 to get
   *   correctly scaled values
   * If taking more than one reading, we'd suggest you use `Puck.accelOn()` and the
   * `Puck.accel` event.
   * @returns {any} An Object `{acc:{x,y,z}, gyro:{x,y,z}}` of accelerometer/gyro readings
   * @url http://www.espruino.com/Reference#l_Puck_accel
   */
  static accel(): any;

  /**
   * Writes a register on the LSM6DS3TR-C Accelerometer. Can be used for configuring
   * advanced functions.
   * Check out [the Puck.js page on the
   * accelerometer](http://www.espruino.com/Puck.js#on-board-peripherals) for more
   * information and links to modules that use this function.
   *
   * @param {number} reg
   * @param {number} data
   * @url http://www.espruino.com/Reference#l_Puck_accelWr
   */
  static accelWr(reg: number, data: number): void;

  /**
   * Reads a register from the LSM6DS3TR-C Accelerometer. Can be used for configuring
   * advanced functions.
   * Check out [the Puck.js page on the
   * accelerometer](http://www.espruino.com/Puck.js#on-board-peripherals) for more
   * information and links to modules that use this function.
   *
   * @param {number} reg
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Puck_accelRd
   */
  static accelRd(reg: number): number;

  /**
   * Transmit the given set of IR pulses - data should be an array of pulse times in
   * milliseconds (as `[on, off, on, off, on, etc]`).
   * For example `Puck.IR(pulseTimes)` - see http://www.espruino.com/Puck.js+Infrared
   * for a full example.
   * You can also attach an external LED to Puck.js, in which case you can just
   * execute `Puck.IR(pulseTimes, led_cathode, led_anode)`
   * It is also possible to just supply a single pin for IR transmission with
   * `Puck.IR(pulseTimes, led_anode)` (on 2v05 and above).
   *
   * @param {any} data - An array of pulse lengths, in milliseconds
   * @param {Pin} [cathode] - [optional] pin to use for IR LED cathode - if not defined, the built-in IR LED is used
   * @param {Pin} [anode] - [optional] pin to use for IR LED anode - if not defined, the built-in IR LED is used
   * @url http://www.espruino.com/Reference#l_Puck_IR
   */
  static IR(data: any, cathode?: Pin, anode?: Pin): void;

  /**
   * Capacitive sense - the higher the capacitance, the higher the number returned.
   * If called without arguments, a value depending on the capacitance of what is
   * attached to pin D11 will be returned. If you attach a length of wire to D11,
   * you'll be able to see a higher value returned when your hand is near the wire
   * than when it is away.
   * You can also supply pins to use yourself, however if you do this then the TX pin
   * must be connected to RX pin and sense plate via a roughly 1MOhm resistor.
   * When not supplying pins, Puck.js uses an internal resistor between D12(tx) and
   * D11(rx).
   *
   * @param {Pin} tx
   * @param {Pin} rx
   * @returns {number} Capacitive sense counter
   * @url http://www.espruino.com/Reference#l_Puck_capSense
   */
  static capSense(tx: Pin, rx: Pin): number;

  /**
   * Return a light value based on the light the red LED is seeing.
   * **Note:** If called more than 5 times per second, the received light value may
   * not be accurate.
   * @returns {number} A light value from 0 to 1
   * @url http://www.espruino.com/Reference#l_Puck_light
   */
  static light(): number;

  /**
   * **DEPRECATED** - Please use `E.getBattery()` instead.
   * Return an approximate battery percentage remaining based on a normal CR2032
   * battery (2.8 - 2.2v).
   * @returns {number} A percentage between 0 and 100
   * @url http://www.espruino.com/Reference#l_Puck_getBatteryPercentage
   */
  static getBatteryPercentage(): number;

  /**
   * Run a self-test, and return true for a pass. This checks for shorts between
   * pins, so your Puck shouldn't have anything connected to it.
   * **Note:** This self-test auto starts if you hold the button on your Puck down
   * while inserting the battery, leave it pressed for 3 seconds (while the green LED
   * is lit) and release it soon after all LEDs turn on. 5 red blinks is a fail, 5
   * green is a pass.
   * If the self test fails, it'll set the Puck.js Bluetooth advertising name to
   * `Puck.js !ERR` where ERR is a 3 letter error code.
   * @returns {boolean} True if the self-test passed
   * @url http://www.espruino.com/Reference#l_Puck_selfTest
   */
  static selfTest(): boolean;


}

/**
 * Class containing utility functions for the [Jolt.js Smart Bluetooth driver](http://www.espruino.com/Jolt.js)
 * @url http://www.espruino.com/Reference#Jolt
 */
declare class Jolt {
  /**
   * `Q0` and `Q1` Qwiic connectors can have their power controlled by a 500mA FET (`Jolt.Q0.fet`) which switches GND.
   * The `sda` and `scl` pins on this port are also analog inputs - use `analogRead(Jolt.Q0.sda)`/etc
   * To turn this connector on run `Jolt.Q0.setPower(1)`
   * @returns {any} An object containing the pins for the Q0 connector on Jolt.js `{sda,scl,fet}`
   * @url http://www.espruino.com/Reference#l_Jolt_Q0
   */
  static Q0: Qwiic;

  /**
   * `Q0` and `Q1` Qwiic connectors can have their power controlled by a 500mA FET  (`Jolt.Q1.fet`) which switches GND.
   * The `sda` and `scl` pins on this port are also analog inputs - use `analogRead(Jolt.Q1.sda)`/etc
   * To turn this connector on run `Jolt.Q1.setPower(1)`
   * @returns {any} An object containing the pins for the Q1 connector on Jolt.js `{sda,scl,fet}`
   * @url http://www.espruino.com/Reference#l_Jolt_Q1
   */
  static Q1: Qwiic;

  /**
   * `Q2` and `Q3` have all 4 pins connected to Jolt.js's GPIO (including those usually used for power).
   * As such only around 8mA of power can be supplied to any connected device.
   * To use this as a normal Qwiic connector, run `Jolt.Q2.setPower(1)`
   * @returns {any} An object containing the pins for the Q2 connector on Jolt.js `{sda,scl,gnd,vcc}`
   * @url http://www.espruino.com/Reference#l_Jolt_Q2
   */
  static Q2: Qwiic;

  /**
   * `Q2` and `Q3` have all 4 pins connected to Jolt.js's GPIO (including those usually used for power).
   * As such only around 8mA of power can be supplied to any connected device.
   * To use this as a normal Qwiic connector, run `Jolt.Q3.setPower(1)`
   * @returns {any} An object containing the pins for the Q3 connector on Jolt.js `{sda,scl,gnd,vcc}`
   * @url http://www.espruino.com/Reference#l_Jolt_Q3
   */
  static Q3: Qwiic;

  /**
   * Sets the mode of the motor drivers. Jolt.js has two motor drivers,
   * one (`0`) for outputs H0..H3, and one (`1`) for outputs H4..H7. They
   * can be controlled independently.
   * Mode can be:
   * * `undefined` / `false` / `"off"` - the motor driver is off, all motor driver pins are open circuit (the motor driver still has a ~2.5k pulldown to GND)
   * * `"auto"` - (default) - if any pin in the set of 4 pins (H0..H3, H4..H7) is set as an output, the driver is turned on. Eg `H0.set()` will
   * turn the driver on with a high output, `H0.reset()` will pull the output to GND and `H0.read()` (or `H0.mode("input")` to set the state explicitly) is needed to
   * turn the motor driver off.
   * * `true` / `"output"` - **[recommended]** driver is set to "Independent bridge" mode. All 4 outputs in the bank are enabled
   * * `"motor"` - driver is set to "4 pin interface" mode where pins are paired up (H0+H1, H2+H3, etc). If both
   * in a pair are 0 the output is open circuit (motor coast), if both are 1 both otputs are 0 (motor brake), and
   * if both are different, those values are on the output:
   * `output`/`auto` mode:
   * | H0 | H1 | Out 0 | Out 1 |
   * |----|----|-------|-------|
   * | 0  | 0  | Low   | Low   |
   * | 0  | 1  | Low   | High  |
   * | 1  | 0  | High  | Low   |
   * | 1  | 1  | High  | High  |
   * `motor` mode
   * | H0 | H1 | Out 0 | Out 1 |
   * |----|----|-------|-------|
   * | 0  | 0  | Open  | Open  |
   * | 0  | 1  | Low   | High  |
   * | 1  | 0  | High  | Low   |
   * | 1  | 1  | Low   | Low   |
   *
   * @param {number} driver - The number of the motor driver (0 or 1)
   * @param {any} mode - The mode of the motor driver (see below)
   * @url http://www.espruino.com/Reference#l_Jolt_setDriverMode
   */
  static setDriverMode(driver: number, mode: any): void;

  /**
   * Run a self-test, and return true for a pass. This checks for shorts between
   * pins, so your Jolt shouldn't have anything connected to it.
   * **Note:** This self-test auto starts if you hold the button on your Jolt down
   * while inserting the battery, leave it pressed for 3 seconds (while the green LED
   * is lit) and release it soon after all LEDs turn on. 5 red blinks is a fail, 5
   * green is a pass.
   * If the self test fails, it'll set the Jolt.js Bluetooth advertising name to
   * `Jolt.js !ERR` where ERR is a 3 letter error code.
   * @returns {boolean} True if the self-test passed
   * @url http://www.espruino.com/Reference#l_Jolt_selfTest
   */
  static selfTest(): boolean;


}

/**
 * Class containing utility functions for the Qwiic connectors
 * on the [Jolt.js Smart Bluetooth driver](http://www.espruino.com/Jolt.js).
 * Each class (available from `Jolt.Q0`/`Jolt.Q1`/`Jolt.Q2`/`Jolt.Q3`)
 * has `sda` and `scl` fields with the pins for SDA and SCL on them.
 * On Jolt.js, the four Qwiic connectors can be individually powered:
 * * Q0/Q1 - GND is switched with a 500mA FET. The `fet` field contains the pin that controls the FET
 * * Q2/Q3 - all 4 pins are connected to GPIO. `gnd` and `vcc` fields contain the pins for GND and VCC
 * To control the power, use `Qwiic.setPower`, for example: `Jolt.Q0.setPower(true)`
 * @url http://www.espruino.com/Reference#Qwiic
 */
declare class Qwiic {


  /**
   * This turns power for the given Qwiic connector on or off. See `Qwiic` for more information.
   *
   * @param {boolean} isOn - Whether the Qwiic connector is to be on or not
   * @returns {any} The same Qwiic object (for call chaining)
   * @url http://www.espruino.com/Reference#l_Qwiic_setPower
   */
  setPower(isOn: boolean): any;

  /**
   * @returns {any} An I2C object using this Qwiic connector, already set up
   * @url http://www.espruino.com/Reference#l_Qwiic_i2c
   */
  i2c: any;
}

/**
 * Class containing utility functions for the [Bangle.js Smart
 * Watch](http://www.espruino.com/Bangle.js)
 * @url http://www.espruino.com/Reference#Bangle
 */
declare class Bangle {
  /**
   * @url http://www.espruino.com/Reference#l_Bangle_drawWidgets
   */
  static drawWidgets(): void;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_setUI
   */
  static setUI(): void;

  /**
   * Sets the rotation of the LCD display (relative to its nominal orientation)
   *
   * @param {number} d - The number of degrees to the LCD display (0, 90, 180 or 270)
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDRotation
   */
  static setLCDRotation(d: number): void;

  /**
   * Accelerometer data available with `{x,y,z,diff,mag}` object as a parameter.
   * * `x` is X axis (left-right) in `g`
   * * `y` is Y axis (up-down) in `g`
   * * `z` is Z axis (in-out) in `g`
   * * `diff` is difference between this and the last reading in `g`
   * * `mag` is the magnitude of the acceleration in `g`
   * You can also retrieve the most recent reading with `Bangle.getAccel()`.
   * @param {string} event - The event to listen to.
   * @param {(xyz: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `xyz`
   * @url http://www.espruino.com/Reference#l_Bangle_accel
   */
  static on(event: "accel", callback: (xyz: AccelData) => void): void;

  /**
   * Called whenever a step is detected by Bangle.js's pedometer.
   * @param {string} event - The event to listen to.
   * @param {(up: number) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `up` The number of steps since Bangle.js was last reset
   * @url http://www.espruino.com/Reference#l_Bangle_step
   */
  static on(event: "step", callback: (up: number) => void): void;

  /**
   * See `Bangle.getHealthStatus()` for more information. This is used for health
   * tracking to allow Bangle.js to record historical exercise data.
   * @param {string} event - The event to listen to.
   * @param {(info: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `info` An object containing the last 10 minutes health data
   * @url http://www.espruino.com/Reference#l_Bangle_health
   */
  static on(event: "health", callback: (info: HealthStatus) => void): void;

  /**
   * Has the watch been moved so that it is face-up, or not face up?
   * @param {string} event - The event to listen to.
   * @param {(up: boolean) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `up` `true` if face-up
   * @url http://www.espruino.com/Reference#l_Bangle_faceUp
   */
  static on(event: "faceUp", callback: (up: boolean) => void): void;

  /**
   * This event happens when the watch has been twisted around it's axis - for
   * instance as if it was rotated so someone could look at the time.
   * To tweak when this happens, see the `twist*` options in `Bangle.setOptions()`
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_Bangle_twist
   */
  static on(event: "twist", callback: () => void): void;

  /**
   * Is the battery charging or not?
   * @param {string} event - The event to listen to.
   * @param {(charging: boolean) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `charging` `true` if charging
   * @url http://www.espruino.com/Reference#l_Bangle_charging
   */
  static on(event: "charging", callback: (charging: boolean) => void): void;

  /**
   * Magnetometer/Compass data available with `{x,y,z,dx,dy,dz,heading}` object as a
   * parameter
   * * `x/y/z` raw x,y,z magnetometer readings
   * * `dx/dy/dz` readings based on calibration since magnetometer turned on
   * * `heading` in degrees based on calibrated readings (will be NaN if magnetometer
   *   hasn't been rotated around 360 degrees).
   * **Note:** In 2v15 firmware and earlier the heading is inverted (360-heading). There's
   * a fix in the bootloader which will apply a fix for those headings, but old apps may
   * still expect an inverted value.
   * To get this event you must turn the compass on with `Bangle.setCompassPower(1)`.
   * You can also retrieve the most recent reading with `Bangle.getCompass()`.
   * @param {string} event - The event to listen to.
   * @param {(xyz: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `xyz`
   * @url http://www.espruino.com/Reference#l_Bangle_mag
   */
  static on(event: "mag", callback: (xyz: CompassData) => void): void;

  /**
   * Raw NMEA GPS / u-blox data messages received as a string
   * To get this event you must turn the GPS on with `Bangle.setGPSPower(1)`.
   * @param {string} event - The event to listen to.
   * @param {(nmea: any, dataLoss: boolean) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `nmea` A string containing the raw NMEA data from the GPS
   * * `dataLoss` This is set to true if some lines of GPS data have previously been lost (eg because system was too busy to queue up a GPS-raw event)
   * @url http://www.espruino.com/Reference#l_Bangle_GPS-raw
   */
  static on(event: "GPS-raw", callback: (nmea: string, dataLoss: boolean) => void): void;

  /**
   * GPS data, as an object. Contains:
   * ```
   * { "lat": number,      // Latitude in degrees
   *   "lon": number,      // Longitude in degrees
   *   "alt": number,      // altitude in M
   *   "speed": number,    // Speed in kph
   *   "course": number,   // Course in degrees
   *   "time": Date,       // Current Time (or undefined if not known)
   *   "satellites": 7,    // Number of satellites
   *   "fix": 1            // NMEA Fix state - 0 is no fix
   *   "hdop": number,     // Horizontal Dilution of Precision
   * }
   * ```
   * If a value such as `lat` is not known because there is no fix, it'll be `NaN`.
   * `hdop` is a value from the GPS receiver that gives a rough idea of accuracy of
   * lat/lon based on the geometry of the satellites in range. Multiply by 5 to get a
   * value in meters. This is just a ballpark estimation and should not be considered
   * remotely accurate.
   * To get this event you must turn the GPS on with `Bangle.setGPSPower(1)`.
   * @param {string} event - The event to listen to.
   * @param {(fix: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `fix` An object with fix info (see below)
   * @url http://www.espruino.com/Reference#l_Bangle_GPS
   */
  static on(event: "GPS", callback: (fix: GPSFix) => void): void;

  /**
   * Heat rate data, as an object. Contains:
   * ```
   * { "bpm": number,             // Beats per minute
   *   "confidence": number,      // 0-100 percentage confidence in the heart rate
   *   "raw": Uint8Array,         // raw samples from heart rate monitor
   * }
   * ```
   * To get this event you must turn the heart rate monitor on with
   * `Bangle.setHRMPower(1)`.
   * @param {string} event - The event to listen to.
   * @param {(hrm: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `hrm` An object with heart rate info (see below)
   * @url http://www.espruino.com/Reference#l_Bangle_HRM
   */
  static on(event: "HRM", callback: (hrm: { bpm: number, confidence: number, raw: Uint8Array }) => void): void;

  /**
   * Called when heart rate sensor data is available - see `Bangle.setHRMPower(1)`.
   * `hrm` is of the form:
   * ```
   * { "raw": -1,       // raw value from sensor
   *   "filt": -1,      // bandpass-filtered raw value from sensor
   *   "bpm": 88.9,     // last BPM value measured
   *   "confidence": 0  // confidence in the BPM value
   * }
   * ```
   * @param {string} event - The event to listen to.
   * @param {(hrm: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `hrm` A object containing instant readings from the heart rate sensor
   * @url http://www.espruino.com/Reference#l_Bangle_HRM-raw
   */
  static on(event: "HRM-raw", callback: (hrm: { raw: number, filt: number, bpm: number, confidence: number }) => void): void;

  /**
   * Called when an environment sample heart rate sensor data is available (this is the amount of light received by the HRM sensor from the environment when its LED is off). On the newest VC31B based watches this is only 4 bit (0..15).
   * To get it you need to turn the HRM on with `Bangle.setHRMPower(1)` and also set `Bangle.setOptions({hrmPushEnv:true})`.
   * It is also possible to poke registers with `Bangle.hrmWr` to increase the poll rate if needed. See https://banglejs.com/apps/?id=flashcount for an example of this.
   * @param {string} event - The event to listen to.
   * @param {(env: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `env` An integer containing current environment reading (light level)
   * @url http://www.espruino.com/Reference#l_Bangle_HRM-env
   */
  static on(event: "HRM-env", callback: (env: any) => void): void;

  /**
   * When `Bangle.setBarometerPower(true)` is called, this event is fired containing
   * barometer readings.
   * Same format as `Bangle.getPressure()`
   * @param {string} event - The event to listen to.
   * @param {(e: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `e` An object containing `{temperature,pressure,altitude}`
   * @url http://www.espruino.com/Reference#l_Bangle_pressure
   */
  static on(event: "pressure", callback: (e: PressureData) => void): void;

  /**
   * Has the screen been turned on or off? Can be used to stop tasks that are no
   * longer useful if nothing is displayed. Also see `Bangle.isLCDOn()`
   * @param {string} event - The event to listen to.
   * @param {(on: boolean) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `on` `true` if screen is on
   * @url http://www.espruino.com/Reference#l_Bangle_lcdPower
   */
  static on(event: "lcdPower", callback: (on: boolean) => void): void;

  /**
   * Has the backlight been turned on or off? Can be used to stop tasks that are no
   * longer useful if want to see in sun screen only. Also see `Bangle.isBacklightOn()`
   * @param {string} event - The event to listen to.
   * @param {(on: boolean) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `on` `true` if backlight is on
   * @url http://www.espruino.com/Reference#l_Bangle_backlight
   */
  static on(event: "backlight", callback: (on: boolean) => void): void;

  /**
   * Has the screen been locked? Also see `Bangle.isLocked()`
   * @param {string} event - The event to listen to.
   * @param {(on: boolean, reason: string) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `on` `true` if screen is locked, `false` if it is unlocked and touchscreen/buttons will work
   * * `reason` (2v20 onwards) If known, the reason for locking/unlocking - 'button','js','tap','doubleTap','faceUp','twist','timeout'
   * @url http://www.espruino.com/Reference#l_Bangle_lock
   */
  static on(event: "lock", callback: (on: boolean, reason: string) => void): void;

  /**
   * If the watch is tapped, this event contains information on the way it was
   * tapped.
   * `dir` reports the side of the watch that was tapped (not the direction it was
   * tapped in).
   * ```
   * {
   *   dir : "left/right/top/bottom/front/back",
   *   double : true/false // was this a double-tap?
   *   x : -2 .. 2, // the axis of the tap
   *   y : -2 .. 2, // the axis of the tap
   *   z : -2 .. 2 // the axis of the tap
   * ```
   * @param {string} event - The event to listen to.
   * @param {(data: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `data` `{dir, double, x, y, z}`
   * @url http://www.espruino.com/Reference#l_Bangle_tap
   */
  static on(event: "tap", callback: (data: { dir: "left" | "right" | "top" | "bottom" | "front" | "back", double: boolean, x: TapAxis, y: TapAxis, z: TapAxis }) => void): void;

  /**
   * Emitted when a 'gesture' (fast movement) is detected
   * @param {string} event - The event to listen to.
   * @param {(xyz: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `xyz` An Int8Array of XYZXYZXYZ data
   * @url http://www.espruino.com/Reference#l_Bangle_gesture
   */
  static on(event: "gesture", callback: (xyz: Int8Array) => void): void;

  /**
   * Emitted when a 'gesture' (fast movement) is detected, and a Tensorflow model is
   * in storage in the `".tfmodel"` file.
   * If a `".tfnames"` file is specified as a comma-separated list of names, it will
   * be used to decode `gesture` from a number into a string.
   * @param {string} event - The event to listen to.
   * @param {(gesture: any, weights: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `gesture` The name of the gesture (if '.tfnames' exists, or the index. 'undefined' if not matching
   * * `weights` An array of floating point values output by the model
   * @url http://www.espruino.com/Reference#l_Bangle_aiGesture
   */
  static on(event: "aiGesture", callback: (gesture: string | undefined, weights: number[]) => void): void;

  /**
   * Emitted when a swipe on the touchscreen is detected (a movement from
   * left->right, right->left, down->up or up->down)
   * Bangle.js 1 is only capable of detecting left/right swipes as it only contains a
   * 2 zone touchscreen.
   * @param {string} event - The event to listen to.
   * @param {(directionLR: number, directionUD: number) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `directionLR` `-1` for left, `1` for right, `0` for up/down
   * * `directionUD` `-1` for up, `1` for down, `0` for left/right (Bangle.js 2 only)
   * @url http://www.espruino.com/Reference#l_Bangle_swipe
   */
  static on(event: "swipe", callback: SwipeCallback): void;

  /**
   * Emitted when the touchscreen is pressed
   * @param {string} event - The event to listen to.
   * @param {(button: number, xy: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `button` `1` for left, `2` for right
   * * `xy` Object of form `{x,y,type}` containing touch coordinates (if the device supports full touch). Clipped to 0..175 (LCD pixel coordinates) on firmware 2v13 and later.`type` is only available on Bangle.js 2 and is an integer, either 0 for swift touches or 2 for longer ones.
   * @url http://www.espruino.com/Reference#l_Bangle_touch
   */
  static on(event: "touch", callback: TouchCallback): void;

  /**
   * Emitted when the touchscreen is dragged or released
   * The touchscreen extends past the edge of the screen and while `x` and `y`
   * coordinates are arranged such that they align with the LCD's pixels, if your
   * finger goes towards the edge of the screen, `x` and `y` could end up larger than
   * 175 (the screen's maximum pixel coordinates) or smaller than 0. Coordinates from
   * the `touch` event are clipped.
   * @param {string} event - The event to listen to.
   * @param {(event: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `event` Object of form `{x,y,dx,dy,b}` containing touch coordinates, difference in touch coordinates, and an integer `b` containing number of touch points (currently 1 or 0)
   * @url http://www.espruino.com/Reference#l_Bangle_drag
   */
  static on(event: "drag", callback: DragCallback): void;

  /**
   * Emitted when the touchscreen is dragged for a large enough distance to count as
   * a gesture.
   * If Bangle.strokes is defined and populated with data from `Unistroke.new`, the
   * `event` argument will also contain a `stroke` field containing the most closely
   * matching stroke name.
   * For example:
   * ```
   * Bangle.strokes = {
   *   up : Unistroke.new(new Uint8Array([57, 151, ... 158, 137])),
   *   alpha : Unistroke.new(new Uint8Array([161, 55, ... 159, 161])),
   * };
   * Bangle.on('stroke',o=>{
   *   print(o.stroke);
   *   g.clear(1).drawPoly(o.xy);
   * });
   * // Might print something like
   * {
   *   "xy": new Uint8Array([149, 50, ... 107, 136]),
   *   "stroke": "alpha"
   * }
   * ```
   * @param {string} event - The event to listen to.
   * @param {(event: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `event` Object of form `{xy:Uint8Array([x1,y1,x2,y2...])}` containing touch coordinates
   * @url http://www.espruino.com/Reference#l_Bangle_stroke
   */
  static on(event: "stroke", callback: (event: { xy: Uint8Array, stroke?: string }) => void): void;

  /**
   * Emitted at midnight (at the point the `day` health info is reset to 0).
   * Can be used for housekeeping tasks that don't want to be run during the day.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_Bangle_midnight
   */
  static on(event: "midnight", callback: () => void): void;

  /**
   * This function can be used to turn Bangle.js's LCD backlight off or on.
   * This function resets the Bangle's 'activity timer' (like pressing a button or
   * the screen would) so after a time period of inactivity set by
   * `Bangle.setOptions({backlightTimeout: X});` the backlight will turn off.
   * If you want to keep the backlight on permanently (until apps are changed) you can
   * do:
   * ```
   * Bangle.setOptions({backlightTimeout: 0}) // turn off the timeout
   * Bangle.setBacklight(1); // keep screen on
   * ```
   * Of course, the backlight depends on `Bangle.setLCDPower` too, so any lcdPowerTimeout/setLCDTimeout will
   * also turn the backlight off. The use case is when you require the backlight timeout
   * to be shorter than the power timeout.
   *
   * @param {boolean} isOn - True if the LCD backlight should be on, false if not
   * @url http://www.espruino.com/Reference#l_Bangle_setBacklight
   */
  static setBacklight(isOn: boolean): void;

  /**
   * This function can be used to turn Bangle.js's LCD off or on.
   * This function resets the Bangle's 'activity timer' (like pressing a button or
   * the screen would) so after a time period of inactivity set by
   * `Bangle.setLCDTimeout` the screen will turn off.
   * If you want to keep the screen on permanently (until apps are changed) you can
   * do:
   * ```
   * Bangle.setLCDTimeout(0); // turn off the timeout
   * Bangle.setLCDPower(1); // keep screen on
   * ```
   * **When on full, the LCD draws roughly 40mA.** You can adjust When brightness
   * using `Bangle.setLCDBrightness`.
   *
   * @param {boolean} isOn - True if the LCD should be on, false if not
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDPower
   */
  static setLCDPower(isOn: boolean): void;

  /**
   * This function can be used to adjust the brightness of Bangle.js's display, and
   * hence prolong its battery life.
   * Due to hardware design constraints, software PWM has to be used which means that
   * the display may flicker slightly when Bluetooth is active and the display is not
   * at full power.
   * **Power consumption**
   * * 0 = 7mA
   * * 0.1 = 12mA
   * * 0.2 = 18mA
   * * 0.5 = 28mA
   * * 0.9 = 40mA (switching overhead)
   * * 1 = 40mA
   *
   * @param {number} brightness - The brightness of Bangle.js's display - from 0(off) to 1(on full)
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDBrightness
   */
  static setLCDBrightness(brightness: number): void;

  /**
   * This function can be used to change the way graphics is handled on Bangle.js.
   * Available options for `Bangle.setLCDMode` are:
   * * `Bangle.setLCDMode()` or `Bangle.setLCDMode("direct")` (the default) - The
   *   drawable area is 240x240 16 bit. Unbuffered, so draw calls take effect
   *   immediately. Terminal and vertical scrolling work (horizontal scrolling
   *   doesn't).
   * * `Bangle.setLCDMode("doublebuffered")` - The drawable area is 240x160 16 bit,
   *   terminal and scrolling will not work. `g.flip()` must be called for draw
   *   operations to take effect.
   * * `Bangle.setLCDMode("120x120")` - The drawable area is 120x120 8 bit,
   *   `g.getPixel`, terminal, and full scrolling work. Uses an offscreen buffer
   *   stored on Bangle.js, `g.flip()` must be called for draw operations to take
   *   effect.
   * * `Bangle.setLCDMode("80x80")` - The drawable area is 80x80 8 bit, `g.getPixel`,
   *   terminal, and full scrolling work. Uses an offscreen buffer stored on
   *   Bangle.js, `g.flip()` must be called for draw operations to take effect.
   * You can also call `Bangle.setLCDMode()` to return to normal, unbuffered
   * `"direct"` mode.
   *
   * @param {any} mode - The LCD mode (See below)
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDMode
   */
  static setLCDMode(mode?: LCDMode): void;

  /**
   * The current LCD mode.
   * See `Bangle.setLCDMode` for examples.
   * @returns {any} The LCD mode as a String
   * @url http://www.espruino.com/Reference#l_Bangle_getLCDMode
   */
  static getLCDMode(): LCDMode;

  /**
   * This can be used to move the displayed memory area up or down temporarily. It's
   * used for displaying notifications while keeping the main display contents
   * intact.
   *
   * @param {number} y - The amount of pixels to shift the LCD up or down
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDOffset
   */
  static setLCDOffset(y: number): void;

  /**
   * Overlay an image or graphics instance on top of the contents of the graphics buffer.
   * This only works on Bangle.js 2 because Bangle.js 1 doesn't have an offscreen buffer accessible from the CPU.
   * ```
   * // display an alarm clock icon on the screen
   * var img = require("heatshrink").decompress(atob(`lss4UBvvv///ovBlMyqoADv/VAwlV//1qtfAQX/BINXDoPVq/9DAP
   * /AYIKDrWq0oREAYPW1QAB1IWCBQXaBQWq04WCAQP6BQeqA4P1AQPq1WggEK1WrBAIkBBQJsCBYO///fBQOoPAcqCwP3BQnwgECCwP9
   * GwIKCngWC14sB7QKCh4CBCwN/64KDgfACwWn6vWGwYsBCwOputWJgYsCgGqytVBQYsCLYOlqtqwAsFEINVrR4BFgghBBQosDEINWIQ
   * YsDEIQ3DFgYhCG4msSYeVFgnrFhMvOAgsEkE/FhEggYWCFgIhDkEACwQKBEIYKBCwSGFBQJxCQwYhBBQTKDqohCBQhCCEIJlDXwrKE
   * BQoWHBQdaCwuqJoI4CCwgKECwJ9CJgIKDq+qBYUq1WtBQf+BYIAC3/VBQX/tQKDz/9BQY5BAAVV/4WCBQJcBKwVf+oHBv4wCAAYhB`));
   * Bangle.setLCDOverlay(img,66,66);
   * ```
   * Or use a `Graphics` instance:
   * ```
   * var ovr = Graphics.createArrayBuffer(100,100,1,{msb:true}); // 1bpp
   * ovr.drawLine(0,0,100,100);
   * ovr.drawRect(0,0,99,99);
   * Bangle.setLCDOverlay(ovr,38,38);
   * ```
   * Although `Graphics` can be specified directly, it can often make more sense to
   * create an Image from the `Graphics` instance, as this gives you access
   * to color palettes and transparent colors. For instance this will draw a colored
   * overlay with rounded corners:
   * ```
   * var ovr = Graphics.createArrayBuffer(100,100,2,{msb:true});
   * ovr.setColor(1).fillRect({x:0,y:0,w:99,h:99,r:8});
   * ovr.setColor(3).fillRect({x:2,y:2,w:95,h:95,r:7});
   * ovr.setColor(2).setFont("Vector:30").setFontAlign(0,0).drawString("Hi",50,50);
   * Bangle.setLCDOverlay({
   *   width:ovr.getWidth(), height:ovr.getHeight(),
   *   bpp:2, transparent:0,
   *   palette:new Uint16Array([0,0,g.toColor("#F00"),g.toColor("#FFF")]),
   *   buffer:ovr.buffer
   * },38,38);
   * ```
   *
   * @param {any} img - An image, or undefined to clear
   * @param {number} x - The X offset the graphics instance should be overlaid on the screen with
   * @param {number} y - The Y offset the graphics instance should be overlaid on the screen with
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDOverlay
   */
  static setLCDOverlay(img: any, x: number, y: number): void;
  static setLCDOverlay(): void;

  /**
   * This function can be used to turn Bangle.js's LCD power saving on or off.
   * With power saving off, the display will remain in the state you set it with
   * `Bangle.setLCDPower`.
   * With power saving on, the display will turn on if a button is pressed, the watch
   * is turned face up, or the screen is updated (see `Bangle.setOptions` for
   * configuration). It'll turn off automatically after the given timeout.
   * **Note:** This function also sets the Backlight and Lock timeout (the time at
   * which the touchscreen/buttons start being ignored). To set both separately, use
   * `Bangle.setOptions`
   *
   * @param {number} isOn - The timeout of the display in seconds, or `0`/`undefined` to turn power saving off. Default is 10 seconds.
   * @url http://www.espruino.com/Reference#l_Bangle_setLCDTimeout
   */
  static setLCDTimeout(isOn: number): void;

  /**
   * Set how often the watch should poll its sensors (accel/hr/mag) for new data and kick the
   * Watchdog timer. It isn't recommended that you make this interval much larger
   * than 1000ms, but values up to 4000ms are allowed.
   * Calling this will set `Bangle.setOptions({powerSave: false})` - disabling the
   * dynamic adjustment of poll interval to save battery power when Bangle.js is
   * stationary.
   *
   * @param {number} interval - Polling interval in milliseconds (Default is 80ms - 12.5Hz to match accelerometer)
   * @url http://www.espruino.com/Reference#l_Bangle_setPollInterval
   */
  static setPollInterval(interval: number): void;

  /**
   * Set internal options used for gestures, etc...
   * * `wakeOnBTN1` should the LCD turn on when BTN1 is pressed? default = `true`
   * * `wakeOnBTN2` (Bangle.js 1) should the LCD turn on when BTN2 is pressed?
   *   default = `true`
   * * `wakeOnBTN3` (Bangle.js 1) should the LCD turn on when BTN3 is pressed?
   *   default = `true`
   * * `wakeOnFaceUp` should the LCD turn on when the watch is turned face up?
   *   default = `false`
   * * `wakeOnTouch` should the LCD turn on when the touchscreen is pressed? On Bangle.js 1 this
   * is a physical press on the touchscreen, on Bangle.js 2 we have to use the accelerometer as
   * the touchscreen cannot be left powered without running the battery down. default = `false`
   * * `wakeOnDoubleTap` (2v20 onwards) should the LCD turn on when the watch is double-tapped on the screen?
   * This uses the accelerometer, not the touchscreen itself. default = `false`
   * * `wakeOnTwist` should the LCD turn on when the watch is twisted? default =
   *   `true`
   * * `twistThreshold` How much acceleration to register a twist of the watch strap?
   *   Can be negative for opposite direction. default = `800`
   * * `twistMaxY` Maximum acceleration in Y to trigger a twist (low Y means watch is
   *   facing the right way up). default = `-800`
   * * `twistTimeout` How little time (in ms) must a twist take from low->high
   *   acceleration? default = `1000`
   * * `gestureStartThresh` how big a difference before we consider a gesture
   *   started? default = `sqr(800)`
   * * `gestureEndThresh` how small a difference before we consider a gesture ended?
   *   default = `sqr(2000)`
   * * `gestureInactiveCount` how many samples do we keep after a gesture has ended?
   *   default = `4`
   * * `gestureMinLength` how many samples must a gesture have before we notify about
   *   it? default = `10`
   * * `powerSave` after a minute of not being moved, Bangle.js will change the
   *    accelerometer poll interval down to 800ms (10x accelerometer samples). On
   *    movement it'll be raised to the default 80ms. If `Bangle.setPollInterval` is
   *    used this is disabled, and for it to work the poll interval must be either
   *    80ms or 800ms. default = `true`. Setting `powerSave:false` will disable this
   *    automatic power saving, but will **not** change the poll interval from its
   *    current value. If you desire a specific interval (e.g. the default 80ms) you
   *    must set it manually with `Bangle.setPollInterval(80)` after setting
   *    `powerSave:false`.
   * * `lockTimeout` how many milliseconds before the screen locks
   * * `lcdPowerTimeout` how many milliseconds before the screen turns off
   * * `backlightTimeout` how many milliseconds before the screen's backlight turns
   *   off
   * * `btnLoadTimeout` how many milliseconds does the home button have to be pressed
   * for before the clock is reloaded? 1500ms default, or 0 means never.
   * * `hrmPollInterval` set the requested poll interval (in milliseconds) for the
   *   heart rate monitor. On Bangle.js 2 only 10,20,40,80,160,200 ms are supported,
   *   and polling rate may not be exact. The algorithm's filtering is tuned for
   *   20-40ms poll intervals, so higher/lower intervals may effect the reliability
   *   of the BPM reading. You must call this *before* `Bangle.setHRMPower` - calling
   *   when the HRM is already on will not affect the poll rate.
   * * `hrmSportMode` - on the newest Bangle.js 2 builds with with the proprietary
   *   heart rate algorithm, this is the sport mode passed to the algorithm. See `libs/misc/vc31_binary/algo.h`
   *   for more info. -1 = auto, 0 = normal (default), 1 = running, 2 = ...
   * * `hrmGreenAdjust` - (Bangle.js 2, 2v19+) if false (default is true) the green LED intensity won't be adjusted to get the HRM sensor 'exposure' correct. This is reset when the HRM is initialised with `Bangle.setHRMPower`.
   * * `hrmWearDetect` - (Bangle.js 2, 2v19+) if false (default is true) HRM readings won't be turned off if the watch isn't on your arm (based on HRM proximity sensor). This is reset when the HRM is initialised with `Bangle.setHRMPower`.
   * * `hrmPushEnv` - (Bangle.js 2, 2v19+) if true (default is false) HRM environment readings will be produced as `Bangle.on(`HRM-env`, ...)` events. This is reset when the HRM is initialised with `Bangle.setHRMPower`.
   * * `seaLevelPressure` (Bangle.js 2) Normally 1013.25 millibars - this is used for
   *   calculating altitude with the pressure sensor
   * * `lcdBufferPtr` (Bangle.js 2 2v21+) Return a pointer to the first pixel of the 3 bit graphics buffer used by Bangle.js for the screen (stride = 178 bytes)
   * * `lcdDoubleRefresh` (Bangle.js 2 2v22+) If enabled, pulses EXTCOMIN twice per poll interval (avoids off-axis flicker)
   * Where accelerations are used they are in internal units, where `8192 = 1g`
   *
   * @param {any} options
   * @url http://www.espruino.com/Reference#l_Bangle_setOptions
   */
  static setOptions(options: { [key in keyof BangleOptions]?: BangleOptions<ShortBoolean>[key] }): void;

  /**
   * Return the current state of options as set by `Bangle.setOptions`
   * @returns {any} The current state of all options
   * @url http://www.espruino.com/Reference#l_Bangle_getOptions
   */
  static getOptions(): BangleOptions;

  /**
   * Also see the `Bangle.lcdPower` event
   * @returns {boolean} Is the display on or not?
   * @url http://www.espruino.com/Reference#l_Bangle_isLCDOn
   */
  static isLCDOn(): boolean;

  /**
   * Also see the `Bangle.backlight` event
   * @returns {boolean} Is the backlight on or not?
   * @url http://www.espruino.com/Reference#l_Bangle_isBacklightOn
   */
  static isBacklightOn(): boolean;

  /**
   * This function can be used to lock or unlock Bangle.js (e.g. whether buttons and
   * touchscreen work or not)
   *
   * @param {boolean} isLocked - `true` if the Bangle is locked (no user input allowed)
   * @url http://www.espruino.com/Reference#l_Bangle_setLocked
   */
  static setLocked(isLocked: boolean): void;

  /**
   * Also see the `Bangle.lock` event
   * @returns {boolean} Is the screen locked or not?
   * @url http://www.espruino.com/Reference#l_Bangle_isLocked
   */
  static isLocked(): boolean;

  /**
   * @returns {boolean} Is the battery charging or not?
   * @url http://www.espruino.com/Reference#l_Bangle_isCharging
   */
  static isCharging(): boolean;

  /**
   * Writes a command directly to the ST7735 LCD controller
   *
   * @param {number} cmd
   * @param {any} data
   * @url http://www.espruino.com/Reference#l_Bangle_lcdWr
   */
  static lcdWr(cmd: number, data: any): void;

  /**
   * Set the power to the Heart rate monitor
   * When on, data is output via the `HRM` event on `Bangle`:
   * ```
   * Bangle.setHRMPower(true, "myapp");
   * Bangle.on('HRM',print);
   * ```
   * *When on, the Heart rate monitor draws roughly 5mA*
   *
   * @param {boolean} isOn - True if the heart rate monitor should be on, false if not
   * @param {any} appID - A string with the app's name in, used to ensure one app can't turn off something another app is using
   * @returns {boolean} Is HRM on?
   * @url http://www.espruino.com/Reference#l_Bangle_setHRMPower
   */
  static setHRMPower(isOn: ShortBoolean, appID: string): boolean;

  /**
   * Is the Heart rate monitor powered?
   * Set power with `Bangle.setHRMPower(...);`
   * @returns {boolean} Is HRM on?
   * @url http://www.espruino.com/Reference#l_Bangle_isHRMOn
   */
  static isHRMOn(): boolean;

  /**
   * Set the power to the GPS.
   * When on, data is output via the `GPS` event on `Bangle`:
   * ```
   * Bangle.setGPSPower(true, "myapp");
   * Bangle.on('GPS',print);
   * ```
   * *When on, the GPS draws roughly 20mA*
   *
   * @param {boolean} isOn - True if the GPS should be on, false if not
   * @param {any} appID - A string with the app's name in, used to ensure one app can't turn off something another app is using
   * @returns {boolean} Is the GPS on?
   * @url http://www.espruino.com/Reference#l_Bangle_setGPSPower
   */
  static setGPSPower(isOn: ShortBoolean, appID: string): boolean;

  /**
   * Is the GPS powered?
   * Set power with `Bangle.setGPSPower(...);`
   * @returns {boolean} Is the GPS on?
   * @url http://www.espruino.com/Reference#l_Bangle_isGPSOn
   */
  static isGPSOn(): boolean;

  /**
   * Get the last available GPS fix info (or `undefined` if GPS is off).
   * The fix info received is the same as you'd get from the `Bangle.GPS` event.
   * @returns {any} A GPS fix object with `{lat,lon,...}`
   * @url http://www.espruino.com/Reference#l_Bangle_getGPSFix
   */
  static getGPSFix(): GPSFix;

  /**
   * Set the power to the Compass
   * When on, data is output via the `mag` event on `Bangle`:
   * ```
   * Bangle.setCompassPower(true, "myapp");
   * Bangle.on('mag',print);
   * ```
   * *When on, the compass draws roughly 2mA*
   *
   * @param {boolean} isOn - True if the Compass should be on, false if not
   * @param {any} appID - A string with the app's name in, used to ensure one app can't turn off something another app is using
   * @returns {boolean} Is the Compass on?
   * @url http://www.espruino.com/Reference#l_Bangle_setCompassPower
   */
  static setCompassPower(isOn: ShortBoolean, appID: string): boolean;

  /**
   * Is the compass powered?
   * Set power with `Bangle.setCompassPower(...);`
   * @returns {boolean} Is the Compass on?
   * @url http://www.espruino.com/Reference#l_Bangle_isCompassOn
   */
  static isCompassOn(): boolean;

  /**
   * Resets the compass minimum/maximum values. Can be used if the compass isn't
   * providing a reliable heading any more.
   *
   * @url http://www.espruino.com/Reference#l_Bangle_resetCompass
   */
  static resetCompass(): void;

  /**
   * Set the power to the barometer IC. Once enabled, `Bangle.pressure` events are
   * fired each time a new barometer reading is available.
   * When on, the barometer draws roughly 50uA
   *
   * @param {boolean} isOn - True if the barometer IC should be on, false if not
   * @param {any} appID - A string with the app's name in, used to ensure one app can't turn off something another app is using
   * @returns {boolean} Is the Barometer on?
   * @url http://www.espruino.com/Reference#l_Bangle_setBarometerPower
   */
  static setBarometerPower(isOn: ShortBoolean, appID: string): boolean;

  /**
   * Is the Barometer powered?
   * Set power with `Bangle.setBarometerPower(...);`
   * @returns {boolean} Is the Barometer on?
   * @url http://www.espruino.com/Reference#l_Bangle_isBarometerOn
   */
  static isBarometerOn(): boolean;

  /**
   * Returns the current amount of steps recorded by the step counter
   * @returns {number} The number of steps recorded by the step counter
   * @url http://www.espruino.com/Reference#l_Bangle_getStepCount
   */
  static getStepCount(): number;

  /**
   * Sets the current value of the step counter
   *
   * @param {number} count - The value with which to reload the step counter
   * @url http://www.espruino.com/Reference#l_Bangle_setStepCount
   */
  static setStepCount(count: number): void;

  /**
   * Get the most recent Magnetometer/Compass reading. Data is in the same format as
   * the `Bangle.on('mag',` event.
   * Returns an `{x,y,z,dx,dy,dz,heading}` object
   * * `x/y/z` raw x,y,z magnetometer readings
   * * `dx/dy/dz` readings based on calibration since magnetometer turned on
   * * `heading` in degrees based on calibrated readings (will be NaN if magnetometer
   *   hasn't been rotated around 360 degrees).
   * **Note:** In 2v15 firmware and earlier the heading is inverted (360-heading). There's
   * a fix in the bootloader which will apply a fix for those headings, but old apps may
   * still expect an inverted value.
   * To get this event you must turn the compass on with `Bangle.setCompassPower(1)`.
   * @returns {any} An object containing magnetometer readings (as below)
   * @url http://www.espruino.com/Reference#l_Bangle_getCompass
   */
  static getCompass(): CompassData;

  /**
   * Get the most recent accelerometer reading. Data is in the same format as the
   * `Bangle.on('accel',` event.
   * * `x` is X axis (left-right) in `g`
   * * `y` is Y axis (up-down) in `g`
   * * `z` is Z axis (in-out) in `g`
   * * `diff` is difference between this and the last reading in `g` (calculated by
   *   comparing vectors, not magnitudes)
   * * `td` is the elapsed
   * * `mag` is the magnitude of the acceleration in `g`
   * @returns {any} An object containing accelerometer readings (as below)
   * @url http://www.espruino.com/Reference#l_Bangle_getAccel
   */
  static getAccel(): AccelData & { td: number };

  /**
   * `range` is one of:
   * * `undefined` or `'10min'` - health data so far in this 10 minute block (eg. 9:00.00 - 9:09.59)
   * * `'last'` - health data during the last 10 minute block
   * * `'day'` - the health data so far for the day
   * `getHealthStatus` returns an object containing:
   * * `movement` is the 32 bit sum of all `acc.diff` readings since power on (and
   *   rolls over). It is the difference in accelerometer values as `g*8192`
   * * `steps` is the number of steps during this period
   * * `bpm` the best BPM reading from HRM sensor during this period
   * * `bpmConfidence` best BPM confidence (0-100%) during this period
   *
   * @param {any} range - What time period to return data for, see below:
   * @returns {any} Returns an object containing various health info
   * @url http://www.espruino.com/Reference#l_Bangle_getHealthStatus
   */
  static getHealthStatus(range?: "current" | "last" | "day"): HealthStatus;

  /**
   * Reads debug info. Exposes the current values of `accHistoryIdx`, `accGestureCount`, `accIdleCount`, `pollInterval` and others.
   * Please see the declaration of this function for more information (click the `==>` link above [this description](http://www.espruino.com/Reference#l_Bangle_dbg))
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_Bangle_dbg
   */
  static dbg(): any;

  /**
   * Writes a register on the accelerometer
   *
   * @param {number} reg
   * @param {number} data
   * @url http://www.espruino.com/Reference#l_Bangle_accelWr
   */
  static accelWr(reg: number, data: number): void;

  /**
   * Reads a register from the accelerometer
   * **Note:** On Espruino 2v06 and before this function only returns a number (`cnt`
   * is ignored).
   *
   * @param {number} reg
   * @param {number} cnt - If specified, returns an array of the given length (max 128). If not (or 0) it returns a number
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_Bangle_accelRd
   */
  static accelRd(reg: number, cnt?: 0): number;
  static accelRd(reg: number, cnt: number): number[];

  /**
   * Writes a register on the barometer IC
   *
   * @param {number} reg
   * @param {number} data
   * @url http://www.espruino.com/Reference#l_Bangle_barometerWr
   */
  static barometerWr(reg: number, data: number): void;

  /**
   * Reads a register from the barometer IC
   *
   * @param {number} reg
   * @param {number} cnt - If specified, returns an array of the given length (max 128). If not (or 0) it returns a number
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_Bangle_barometerRd
   */
  static barometerRd(reg: number, cnt?: 0): number;
  static barometerRd(reg: number, cnt: number): number[];

  /**
   * Writes a register on the Magnetometer/Compass
   *
   * @param {number} reg
   * @param {number} data
   * @url http://www.espruino.com/Reference#l_Bangle_compassWr
   */
  static compassWr(reg: number, data: number): void;

  /**
   * Read a register on the Magnetometer/Compass
   *
   * @param {number} reg
   * @param {number} cnt - If specified, returns an array of the given length (max 128). If not (or 0) it returns a number
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_Bangle_compassRd
   */
  static compassRd(reg: number, cnt?: 0): number;
  static compassRd(reg: number, cnt: number): number[];

  /**
   * Writes a register on the Heart rate monitor
   *
   * @param {number} reg
   * @param {number} data
   * @url http://www.espruino.com/Reference#l_Bangle_hrmWr
   */
  static hrmWr(reg: number, data: number): void;

  /**
   * Read a register on the Heart rate monitor
   *
   * @param {number} reg
   * @param {number} cnt - If specified, returns an array of the given length (max 128). If not (or 0) it returns a number
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_Bangle_hrmRd
   */
  static hrmRd(reg: number, cnt?: 0): number;
  static hrmRd(reg: number, cnt: number): number[];

  /**
   * Changes a pin state on the IO expander
   *
   * @param {number} mask
   * @param {number} isOn
   * @url http://www.espruino.com/Reference#l_Bangle_ioWr
   */
  static ioWr(mask: number, isOn: number): void;

  /**
   * Read temperature, pressure and altitude data. A promise is returned which will
   * be resolved with `{temperature, pressure, altitude}`.
   * If the Barometer has been turned on with `Bangle.setBarometerPower` then this
   * will return with the *next* reading as of 2v21 (or the existing reading on 2v20 or earlier). If the Barometer is off,
   * conversions take between 500-750ms.
   * Altitude assumes a sea-level pressure of 1013.25 hPa
   * If there's no pressure device (for example, the emulator),
   * this returns `undefined`, rather than a Promise.
   * ```
   * Bangle.getPressure().then(d=>{
   *   console.log(d);
   *   // {temperature, pressure, altitude}
   * });
   * ```
   * @returns {any} A promise that will be resolved with `{temperature, pressure, altitude}`
   * @url http://www.espruino.com/Reference#l_Bangle_getPressure
   */
  static getPressure(): Promise<PressureData> | undefined;

  /**
   * Perform a Spherical [Web Mercator
   * projection](https://en.wikipedia.org/wiki/Web_Mercator_projection) of latitude
   * and longitude into `x` and `y` coordinates, which are roughly equivalent to
   * meters from `{lat:0,lon:0}`.
   * This is the formula used for most online mapping and is a good way to compare
   * GPS coordinates to work out the distance between them.
   *
   * @param {any} latlong - `{lat:..., lon:...}`
   * @returns {any} {x:..., y:...}
   * @url http://www.espruino.com/Reference#l_Bangle_project
   */
  static project(latlong: { lat: number, lon: number }): { x: number, y: number };

  /**
   * Use the piezo speaker to Beep for a certain time period and frequency
   *
   * @param {number} [time] - [optional] Time in ms (default 200)
   * @param {number} [freq] - [optional] Frequency in hz (default 4000)
   * @returns {any} A promise, completed when beep is finished
   * @url http://www.espruino.com/Reference#l_Bangle_beep
   */
  static beep(time?: number, freq?: number): Promise<void>;

  /**
   * Use the vibration motor to buzz for a certain time period
   *
   * @param {number} [time] - [optional] Time in ms (default 200)
   * @param {number} [strength] - [optional] Power of vibration from 0 to 1 (Default 1)
   * @returns {any} A promise, completed when vibration is finished
   * @url http://www.espruino.com/Reference#l_Bangle_buzz
   */
  static buzz(time?: number, strength?: number): Promise<void>;

  /**
   * Turn Bangle.js off. It can only be woken by pressing BTN1.
   * @url http://www.espruino.com/Reference#l_Bangle_off
   */
  static off(): void;

  /**
   * Turn Bangle.js (mostly) off, but keep the CPU in sleep mode until BTN1 is
   * pressed to preserve the RTC (current time).
   * @url http://www.espruino.com/Reference#l_Bangle_softOff
   */
  static softOff(): void;

  /**
   * * On platforms with an LCD of >=8bpp this is 222 x 104 x 2 bits
   * * Otherwise it's 119 x 56 x 1 bits
   * @returns {any} An image to be used with `g.drawImage` (as a String)
   * @url http://www.espruino.com/Reference#l_Bangle_getLogo
   */
  static getLogo(): string;

  /**
   * Load all widgets from flash Storage. Call this once at the beginning of your
   * application if you want any on-screen widgets to be loaded.
   * They will be loaded into a global `WIDGETS` array, and can be rendered with
   * `Bangle.drawWidgets`.
   * @url http://www.espruino.com/Reference#l_Bangle_loadWidgets
   */
  static loadWidgets(): void;

  /**
   * Draw any onscreen widgets that were loaded with `Bangle.loadWidgets()`.
   * Widgets should redraw themselves when something changes - you'll only need to
   * call drawWidgets if you decide to clear the entire screen with `g.clear()`.
   * @url http://www.espruino.com/Reference#l_Bangle_drawWidgets
   */
  static drawWidgets(): void;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_drawWidgets
   */
  static drawWidgets(): void;

  /**
   * Load the Bangle.js app launcher, which will allow the user to select an
   * application to launch.
   * @url http://www.espruino.com/Reference#l_Bangle_showLauncher
   */
  static showLauncher(): void;

  /**
   * Load the Bangle.js clock - this has the same effect as calling `Bangle.load()`.
   * @url http://www.espruino.com/Reference#l_Bangle_showClock
   */
  static showClock(): void;

  /**
   * Show a 'recovery' menu that allows you to perform certain tasks on your Bangle.
   * You can also enter this menu by restarting your Bangle while holding down the button.
   * @url http://www.espruino.com/Reference#l_Bangle_showRecoveryMenu
   */
  static showRecoveryMenu(): void;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_showRecoveryMenu
   */
  static showRecoveryMenu(): void;

  /**
   * (2v20 and later) Show a test screen that lights green when each sensor on the Bangle
   * works and reports within range.
   * Swipe on the screen when all items are green and the Bangle will turn bluetooth off
   * and display a `TEST PASS` screen for 60 minutes, after which it will turn off.
   * You can enter this menu by restarting your Bangle while holding down the button,
   * then choosing `Test` from the recovery menu.
   * @url http://www.espruino.com/Reference#l_Bangle_showTestScreen
   */
  static showTestScreen(): void;

  /**
   * This behaves the same as the global `load()` function, but if fast
   * loading is possible (`Bangle.setUI` was called with a `remove` handler)
   * then instead of a complete reload, the `remove` handler will be
   * called and the new app will be loaded straight after with `eval`.
   * **This should only be used if the app being loaded also uses widgets**
   * (eg it contains a `Bangle.loadWidgets()` call).
   * `load()` is slower, but safer. As such, care should be taken
   * when using `Bangle.load()` with `Bangle.setUI({..., remove:...})`
   * as if your remove handler doesn't completely clean up after your app,
   * memory leaks or other issues could occur - see `Bangle.setUI` for more
   * information.
   *
   * @param {any} [file] - [optional] A string containing the file name for the app to be loaded
   * @url http://www.espruino.com/Reference#l_Bangle_load
   */
  static load(file: string): void;
  static load(): void;

  /**
   * This puts Bangle.js into the specified UI input mode, and calls the callback
   * provided when there is user input.
   * Currently supported interface types are:
   * * 'updown' - UI input with upwards motion `cb(-1)`, downwards motion `cb(1)`,
   *   and select `cb()`
   *   * Bangle.js 1 uses BTN1/3 for up/down and BTN2 for select
   *   * Bangle.js 2 uses touchscreen swipe up/down and tap
   * * 'leftright' - UI input with left motion `cb(-1)`, right motion `cb(1)`, and
   *   select `cb()`
   *   * Bangle.js 1 uses BTN1/3 for left/right and BTN2 for select
   *   * Bangle.js 2 uses touchscreen swipe left/right and tap/BTN1 for select
   * * 'clock' - called for clocks. Sets `Bangle.CLOCK=1` and allows a button to
   *   start the launcher
   *   * Bangle.js 1 BTN2 starts the launcher
   *   * Bangle.js 2 BTN1 starts the launcher
   * * 'clockupdown' - called for clocks. Sets `Bangle.CLOCK=1`, allows a button to
   *   start the launcher, but also provides up/down functionality
   *   * Bangle.js 1 BTN2 starts the launcher, BTN1/BTN3 call `cb(-1)` and `cb(1)`
   *   * Bangle.js 2 BTN1 starts the launcher, touchscreen tap in top/bottom right
   *     hand side calls `cb(-1)` and `cb(1)`
   * * `{mode:"custom", ...}` allows you to specify custom handlers for different
   *   interactions. See below.
   * * `undefined` removes all user interaction code
   * While you could use setWatch/etc manually, the benefit here is that you don't
   * end up with multiple `setWatch` instances, and the actual input method (touch,
   * or buttons) is implemented dependent on the watch (Bangle.js 1 or 2)
   * ```
   * Bangle.setUI("updown", function (dir) {
   *   // dir is +/- 1 for swipes up/down
   *   // dir is 0 when button pressed
   * });
   * ```
   * The first argument can also be an object, in which case more options can be
   * specified with `mode:"custom"`:
   * ```
   * Bangle.setUI({
   *   mode : "custom",
   *   back : function() {}, // optional - add a 'back' icon in top-left widget area and call this function when it is pressed , also call it when the hardware button is clicked (does not override btn if defined)
   *   remove : function() {}, // optional - add a handler for when the UI should be removed (eg stop any intervals/timers here)
   *   redraw : function() {}, // optional - add a handler to redraw the UI. Not needed but it can allow widgets/etc to provide other functionality that requires the screen to be redrawn
   *   touch : function(n,e) {}, // optional - (mode:custom only) handler for 'touch' events
   *   swipe : function(dir) {}, // optional - (mode:custom only) handler for 'swipe' events
   *   drag : function(e) {}, // optional - (mode:custom only) handler for 'drag' events (Bangle.js 2 only)
   *   btn : function(n) {}, // optional - (mode:custom only) handler for 'button' events (n==1 on Bangle.js 2, n==1/2/3 depending on button for Bangle.js 1)
   *   clock : 0 // optional - if set the behavior of 'clock' mode is added (does not override btn if defined)
   * });
   * ```
   * If `remove` is specified, `Bangle.showLauncher`, `Bangle.showClock`, `Bangle.load` and some apps
   * may choose to just call the `remove` function and then load a new app without resetting Bangle.js.
   * As a result, **if you specify 'remove' you should make sure you test that after calling `Bangle.setUI()`
   * without arguments your app is completely unloaded**, otherwise you may end up with memory leaks or
   * other issues when switching apps. Please see the [Bangle.js Fast Load Tutorial](https://www.espruino.com/Bangle.js+Fast+Load) for more details on this.
   * **Note:** You can override this function in boot code to change the interaction
   * mode with the watch. For instance you could make all clocks start the launcher
   * with a swipe by using:
   * ```
   * (function() {
   *   var sui = Bangle.setUI;
   *   Bangle.setUI = function(mode, cb) {
   *     var m = ("object"==typeof mode) ? mode.mode : mode;
   *     if (m!="clock") return sui(mode,cb);
   *     sui(); // clear
   *     Bangle.CLOCK=1;
   *     Bangle.swipeHandler = Bangle.showLauncher;
   *     Bangle.on("swipe", Bangle.swipeHandler);
   *   };
   * })();
   * ```
   *
   * @param {any} type - The type of UI input: 'updown', 'leftright', 'clock', 'clockupdown' or undefined to cancel. Can also be an object (see below)
   * @param {any} callback - A function with one argument which is the direction
   * @url http://www.espruino.com/Reference#l_Bangle_setUI
   */
  static setUI(type?: undefined): void;
  static setUI(type: SetUIArg<"updown" | "leftright">, callback: (direction?: -1 | 1) => void): void;
  static setUI(type: SetUIArg<"clock">): void;
  static setUI(type: SetUIArg<"clockupdown">, callback?: (direction: -1 | 1) => void): void;
  static setUI(type: SetUIArg<"custom"> & { touch?: TouchCallback; swipe?: SwipeCallback; drag?: DragCallback; btn?: (n: 1 | 2 | 3) => void; clock?: boolean | 0 | 1 }): void;

  /**
   * @url http://www.espruino.com/Reference#l_Bangle_setUI
   */
  static setUI(): void;

  /**
   * Erase all storage and reload it with the default contents.
   * This is only available on Bangle.js 2.0. On Bangle.js 1.0 you need to use
   * `Install Default Apps` under the `More...` tab of http://banglejs.com/apps
   *
   * @param {boolean} noReboot - Do not reboot the watch when done (default false, so will reboot)
   * @url http://www.espruino.com/Reference#l_Bangle_factoryReset
   */
  static factoryReset(noReboot: boolean): void;

  /**
   * Returns the rectangle on the screen that is currently reserved for the app.
   * @returns {any} An object of the form `{x,y,w,h,x2,y2}`
   * @url http://www.espruino.com/Reference#l_Bangle_appRect
   */
  static appRect: { x: number, y: number, w: number, h: number, x2: number, y2: number };

  static CLOCK: ShortBoolean;
  static strokes: undefined | { [key: string]: Unistroke };
}

/**
 * Class containing utility functions for accessing IO on the hexagonal badge
 * @url http://www.espruino.com/Reference#Badge
 */
declare class Badge {
  /**
   * Capacitive sense - the higher the capacitance, the higher the number returned.
   * Supply a corner number between 1 and 6, and an integer value will be returned
   * that is proportional to the capacitance
   *
   * @param {number} corner - The corner to use
   * @returns {number} Capacitive sense counter
   * @url http://www.espruino.com/Reference#l_Badge_capSense
   */
  static capSense(corner: number): number;

  /**
   * **DEPRECATED** - Please use `E.getBattery()` instead.
   * Return an approximate battery percentage remaining based on a normal CR2032
   * battery (2.8 - 2.2v)
   * @returns {number} A percentage between 0 and 100
   * @url http://www.espruino.com/Reference#l_Badge_getBatteryPercentage
   */
  static getBatteryPercentage(): number;

  /**
   * Set the LCD's contrast
   *
   * @param {number} c - Contrast between 0 and 1
   * @url http://www.espruino.com/Reference#l_Badge_setContrast
   */
  static setContrast(c: number): void;


}

/**
 * A Web Bluetooth-style device - you can request one using
 * `NRF.requestDevice(address)`
 * For example:
 * ```
 * var gatt;
 * NRF.requestDevice({ filters: [{ name: 'Puck.js abcd' }] }).then(function(device) {
 *   console.log("found device");
 *   return device.gatt.connect();
 * }).then(function(g) {
 *   gatt = g;
 *   console.log("connected");
 *   return gatt.startBonding();
 * }).then(function() {
 *   console.log("bonded", gatt.getSecurityStatus());
 *   gatt.disconnect();
 * }).catch(function(e) {
 *   console.log("ERROR",e);
 * });
 * ```
 * @url http://www.espruino.com/Reference#BluetoothDevice
 */
declare class BluetoothDevice {
  /**
   * Called when the device gets disconnected.
   * To connect and then print `Disconnected` when the device is disconnected, just
   * do the following:
   * ```
   * var gatt;
   * NRF.connect("aa:bb:cc:dd:ee:ff").then(function(gatt) {
   *   gatt.device.on('gattserverdisconnected', function(reason) {
   *     console.log("Disconnected ",reason);
   *   });
   * });
   * ```
   * Or:
   * ```
   * var gatt;
   * NRF.requestDevice(...).then(function(device) {
   *   device.on('gattserverdisconnected', function(reason) {
   *     console.log("Disconnected ",reason);
   *   });
   * });
   * ```
   * @param {string} event - The event to listen to.
   * @param {(reason: number) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `reason` The reason code reported back by the BLE stack - see Nordic's `ble_hci.h` file for more information
   * @url http://www.espruino.com/Reference#l_BluetoothDevice_gattserverdisconnected
   */
  static on(event: "gattserverdisconnected", callback: (reason: number) => void): void;

  /**
   * Called when the device pairs and sends a passkey that Espruino should display.
   * For this to be used, you'll have to specify that there's a display using
   * `NRF.setSecurity`
   * **This is not part of the Web Bluetooth Specification.** It has been added
   * specifically for Espruino.
   * @param {string} event - The event to listen to.
   * @param {(passkey: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `passkey` A 6 character numeric String to be displayed
   * @url http://www.espruino.com/Reference#l_BluetoothDevice_passkey
   */
  static on(event: "passkey", callback: (passkey: any) => void): void;

  /**
   * Called when the device pairs, displays a passkey, and wants Espruino to tell it
   * what the passkey was.
   * Respond with `BluetoothDevice.sendPasskey("123456")` with a 6 character string
   * containing only `0..9`.
   * For this to be used, you'll have to specify that there's a keyboard using
   * `NRF.setSecurity`
   * **This is not part of the Web Bluetooth Specification.** It has been added
   * specifically for Espruino.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_BluetoothDevice_passkeyRequest
   */
  static on(event: "passkeyRequest", callback: () => void): void;

  /**
   * @returns {any} A `BluetoothRemoteGATTServer` for this device
   * @url http://www.espruino.com/Reference#l_BluetoothDevice_gatt
   */
  gatt: any;

  /**
   * @returns {boolean} The last received RSSI (signal strength) for this device
   * @url http://www.espruino.com/Reference#l_BluetoothDevice_rssi
   */
  rssi: boolean;

  /**
   * To be used as a response when the event `BluetoothDevice.sendPasskey` has been
   * received.
   * **This is not part of the Web Bluetooth Specification.** It has been added
   * specifically for Espruino.
   *
   * @param {any} passkey - A 6 character numeric String to be returned to the device
   * @url http://www.espruino.com/Reference#l_BluetoothDevice_sendPasskey
   */
  sendPasskey(passkey: any): void;
}

/**
 * Web Bluetooth-style GATT server - get this using `NRF.connect(address)` or
 * `NRF.requestDevice(options)` and `response.gatt.connect`
 * https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattserver
 * @url http://www.espruino.com/Reference#BluetoothRemoteGATTServer
 */
declare class BluetoothRemoteGATTServer {


  /**
   * Connect to a BLE device - returns a promise, the argument of which is the
   * `BluetoothRemoteGATTServer` connection.
   * See [`NRF.requestDevice`](/Reference#l_NRF_requestDevice) for usage examples.
   * `options` is an optional object containing:
   * ```
   * {
   *    minInterval // min connection interval in milliseconds, 7.5 ms to 4 s
   *    maxInterval // max connection interval in milliseconds, 7.5 ms to 4 s
   * }
   * ```
   * By default the interval is 20-200ms (or 500-1000ms if
   * `NRF.setLowPowerConnection(true)` was called. During connection Espruino
   * negotiates with the other device to find a common interval that can be used.
   * For instance calling:
   * ```
   * NRF.requestDevice({ filters: [{ namePrefix: 'Pixl.js' }] }).then(function(device) {
   *   return device.gatt.connect({minInterval:7.5, maxInterval:7.5});
   * }).then(function(g) {
   * ```
   * will force the connection to use the fastest connection interval possible (as
   * long as the device at the other end supports it).
   * **Note:** The Web Bluetooth spec states that if a device hasn't advertised its
   * name, when connected to a device the central (in this case Espruino) should
   * automatically retrieve the name from the corresponding characteristic (`0x2a00`
   * on service `0x1800`). Espruino does not automatically do this.
   *
   * @param {any} [options] - [optional] (Espruino-specific) An object of connection options (see below)
   * @returns {any} A `Promise` that is resolved (or rejected) when the connection is complete
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_connect
   */
  connect(options?: any): Promise<void>;

  /**
   * @returns {boolean} Whether the device is connected or not
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_connected
   */
  connected: boolean;

  /**
   * @returns {number} The handle to this device (if it is currently connected) - the handle is an internal value used by the Bluetooth Stack
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_handle
   */
  handle: number;

  /**
   * Disconnect from a previously connected BLE device connected with
   * `BluetoothRemoteGATTServer.connect` - this does not disconnect from something
   * that has connected to the Espruino.
   * **Note:** While `.disconnect` is standard Web Bluetooth, in the spec it returns
   * undefined not a `Promise` for implementation reasons. In Espruino we return a
   * `Promise` to make it easier to detect when Espruino is free to connect to
   * something else.
   * @returns {any} A `Promise` that is resolved (or rejected) when the disconnection is complete (non-standard)
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_disconnect
   */
  disconnect(): Promise<void>;

  /**
   * Start negotiating bonding (secure communications) with the connected device, and
   * return a Promise that is completed on success or failure.
   * ```
   * var gatt;
   * NRF.requestDevice({ filters: [{ name: 'Puck.js abcd' }] }).then(function(device) {
   *   console.log("found device");
   *   return device.gatt.connect();
   * }).then(function(g) {
   *   gatt = g;
   *   console.log("connected");
   *   return gatt.startBonding();
   * }).then(function() {
   *   console.log("bonded", gatt.getSecurityStatus());
   *   gatt.disconnect();
   * }).catch(function(e) {
   *   console.log("ERROR",e);
   * });
   * ```
   * **This is not part of the Web Bluetooth Specification.** It has been added
   * specifically for Espruino.
   *
   * @param {boolean} forceRePair - If the device is already bonded, re-pair it
   * @returns {any} A `Promise` that is resolved (or rejected) when the bonding is complete
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_startBonding
   */
  startBonding(forceRePair: boolean): Promise<void>;

  /**
   * Return an object with information about the security state of the current
   * connection:
   * ```
   * {
   *   connected       // The connection is active (not disconnected).
   *   encrypted       // Communication on this link is encrypted.
   *   mitm_protected  // The encrypted communication is also protected against man-in-the-middle attacks.
   *   bonded          // The peer is bonded with us
   * }
   * ```
   * See `BluetoothRemoteGATTServer.startBonding` for information about negotiating a
   * secure connection.
   * **This is not part of the Web Bluetooth Specification.** It has been added
   * specifically for Puck.js.
   * @returns {any} An object
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getSecurityStatus
   */
  getSecurityStatus(): NRFSecurityStatus;

  /**
   * See `NRF.connect` for usage examples.
   *
   * @param {any} service - The service UUID
   * @returns {any} A `Promise` that is resolved (or rejected) when the primary service is found (the argument contains a `BluetoothRemoteGATTService`)
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getPrimaryService
   */
  getPrimaryService(service: any): Promise<void>;

  /**
   * @returns {any} A `Promise` that is resolved (or rejected) when the primary services are found (the argument contains an array of `BluetoothRemoteGATTService`)
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getPrimaryServices
   */
  getPrimaryServices(): Promise<void>;

  /**
   * Start/stop listening for RSSI values on the active GATT connection
   * ```
   * // Start listening for RSSI value updates
   * gattServer.setRSSIHandler(function(rssi) {
   *   console.log(rssi); // prints -85 (or similar)
   * });
   * // Stop listening
   * gattServer.setRSSIHandler();
   * ```
   * RSSI is the 'Received Signal Strength Indication' in dBm
   *
   * @param {any} callback - The callback to call with the RSSI value, or undefined to stop
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_setRSSIHandler
   */
  setRSSIHandler(callback: any): void;
}

/**
 * Web Bluetooth-style GATT service - get this using
 * `BluetoothRemoteGATTServer.getPrimaryService(s)`
 * https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattservice
 * @url http://www.espruino.com/Reference#BluetoothRemoteGATTService
 */
declare class BluetoothRemoteGATTService {


  /**
   * @returns {any} The `BluetoothDevice` this Service came from
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTService_device
   */
  device: any;

  /**
   * See `NRF.connect` for usage examples.
   *
   * @param {any} characteristic - The characteristic UUID
   * @returns {any} A `Promise` that is resolved (or rejected) when the characteristic is found (the argument contains a `BluetoothRemoteGATTCharacteristic`)
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTService_getCharacteristic
   */
  getCharacteristic(characteristic: any): Promise<void>;

  /**
   * @returns {any} A `Promise` that is resolved (or rejected) when the characteristic is found (the argument contains an array of `BluetoothRemoteGATTCharacteristic`)
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTService_getCharacteristics
   */
  getCharacteristics(): Promise<void>;
}

/**
 * Web Bluetooth-style GATT characteristic - get this using
 * `BluetoothRemoteGATTService.getCharacteristic(s)`
 * https://webbluetoothcg.github.io/web-bluetooth/#bluetoothremotegattcharacteristic
 * @url http://www.espruino.com/Reference#BluetoothRemoteGATTCharacteristic
 */
declare class BluetoothRemoteGATTCharacteristic {
  /**
   * Called when a characteristic's value changes, *after*
   * `BluetoothRemoteGATTCharacteristic.startNotifications` has been called.
   * ```
   *   ...
   *   return service.getCharacteristic("characteristic_uuid");
   * }).then(function(c) {
   *   c.on('characteristicvaluechanged', function(event) {
   *     console.log("-> "+event.target.value);
   *   });
   *   return c.startNotifications();
   * }).then(...
   * ```
   * The first argument is of the form `{target :
   * BluetoothRemoteGATTCharacteristic}`, and
   * `BluetoothRemoteGATTCharacteristic.value` will then contain the new value (as a
   * DataView).
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_characteristicvaluechanged
   */
  static on(event: "characteristicvaluechanged", callback: () => void): void;

  /**
   * @returns {any} The `BluetoothRemoteGATTService` this Service came from
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_service
   */
  service: any;

  /**
   * Write a characteristic's value
   * ```
   * var device;
   * NRF.connect(device_address).then(function(d) {
   *   device = d;
   *   return d.getPrimaryService("service_uuid");
   * }).then(function(s) {
   *   console.log("Service ",s);
   *   return s.getCharacteristic("characteristic_uuid");
   * }).then(function(c) {
   *   return c.writeValue("Hello");
   * }).then(function(d) {
   *   device.disconnect();
   * }).catch(function() {
   *   console.log("Something's broken.");
   * });
   * ```
   *
   * @param {any} data - The data to write
   * @returns {any} A `Promise` that is resolved (or rejected) when the characteristic is written
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_writeValue
   */
  writeValue(data: any): Promise<void>;

  /**
   * Read a characteristic's value, return a promise containing a `DataView`
   * ```
   * var device;
   * NRF.connect(device_address).then(function(d) {
   *   device = d;
   *   return d.getPrimaryService("service_uuid");
   * }).then(function(s) {
   *   console.log("Service ",s);
   *   return s.getCharacteristic("characteristic_uuid");
   * }).then(function(c) {
   *   return c.readValue();
   * }).then(function(d) {
   *   console.log("Got:", JSON.stringify(d.buffer));
   *   device.disconnect();
   * }).catch(function() {
   *   console.log("Something's broken.");
   * });
   * ```
   * @returns {any} A `Promise` that is resolved (or rejected) with a `DataView` when the characteristic is read
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_readValue
   */
  readValue(): Promise<void>;

  /**
   * Starts notifications - whenever this characteristic's value changes, a
   * `characteristicvaluechanged` event is fired and `characteristic.value` will then
   * contain the new value as a `DataView`.
   * ```
   * var device;
   * NRF.connect(device_address).then(function(d) {
   *   device = d;
   *   return d.getPrimaryService("service_uuid");
   * }).then(function(s) {
   *   console.log("Service ",s);
   *   return s.getCharacteristic("characteristic_uuid");
   * }).then(function(c) {
   *   c.on('characteristicvaluechanged', function(event) {
   *     console.log("-> ",event.target.value); // this is a DataView
   *   });
   *   return c.startNotifications();
   * }).then(function(d) {
   *   console.log("Waiting for notifications");
   * }).catch(function() {
   *   console.log("Something's broken.");
   * });
   * ```
   * For example, to listen to the output of another Puck.js's Nordic Serial port
   * service, you can use:
   * ```
   * var gatt;
   * NRF.connect("pu:ck:js:ad:dr:es random").then(function(g) {
   *   gatt = g;
   *   return gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
   * }).then(function(service) {
   *   return service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
   * }).then(function(characteristic) {
   *   characteristic.on('characteristicvaluechanged', function(event) {
   *     console.log("RX: "+JSON.stringify(event.target.value.buffer));
   *   });
   *   return characteristic.startNotifications();
   * }).then(function() {
   *   console.log("Done!");
   * });
   * ```
   * @returns {any} A `Promise` that is resolved (or rejected) with data when notifications have been added
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_startNotifications
   */
  startNotifications(): Promise<void>;

  /**
   * Stop notifications (that were requested with
   * `BluetoothRemoteGATTCharacteristic.startNotifications`)
   * @returns {any} A `Promise` that is resolved (or rejected) with data when notifications have been removed
   * @url http://www.espruino.com/Reference#l_BluetoothRemoteGATTCharacteristic_stopNotifications
   */
  stopNotifications(): Promise<void>;
}

/**
 * Class containing an instance of TFMicroInterpreter
 * @url http://www.espruino.com/Reference#TFMicroInterpreter
 */
declare class TFMicroInterpreter {


  /**
   * @returns {any} An arraybuffer referencing the input data
   * @url http://www.espruino.com/Reference#l_TFMicroInterpreter_getInput
   */
  getInput(): ArrayBufferView;

  /**
   * @returns {any} An arraybuffer referencing the output data
   * @url http://www.espruino.com/Reference#l_TFMicroInterpreter_getOutput
   */
  getOutput(): ArrayBufferView;

  /**
   * @url http://www.espruino.com/Reference#l_TFMicroInterpreter_invoke
   */
  invoke(): void;
}

/**
 * This class provides Graphics operations that can be applied to a surface.
 * Use Graphics.createXXX to create a graphics object that renders in the way you
 * want. See [the Graphics page](https://www.espruino.com/Graphics) for more
 * information.
 * **Note:** On boards that contain an LCD, there is a built-in `g` object of
 * type `Graphics`. For instance to draw a line you'd type:
 * ```g.drawLine(0,0,100,100)```
 * @url http://www.espruino.com/Reference#Graphics
 */
declare class Graphics<IsBuffer extends boolean = boolean> {
  /**
   * On devices like Pixl.js or HYSTM boards that contain a built-in display this
   * will return an instance of the graphics class that can be used to access that
   * display.
   * Internally, this is stored as a member called `gfx` inside the 'hiddenRoot'.
   * @returns {any} An instance of `Graphics` or undefined
   * @url http://www.espruino.com/Reference#l_Graphics_getInstance
   */
  static getInstance(): Graphics | undefined

  /**
   * Create a Graphics object that renders to an Array Buffer. This will have a field
   * called 'buffer' that can get used to get at the buffer itself
   *
   * @param {number} width - Pixels wide
   * @param {number} height - Pixels high
   * @param {number} bpp - Number of bits per pixel
   * @param {any} options
   * An object of other options. `{ zigzag : true/false(default), vertical_byte : true/false(default), msb : true/false(default), color_order: 'rgb'(default),'bgr',etc }`
   * `zigzag` = whether to alternate the direction of scanlines for rows
   * `vertical_byte` = whether to align bits in a byte vertically or not
   * `msb` = when bits<8, store pixels most significant bit first, when bits>8, store most significant byte first
   * `interleavex` = Pixels 0,2,4,etc are from the top half of the image, 1,3,5,etc from the bottom half. Used for P3 LED panels.
   * `color_order` = re-orders the colour values that are supplied via setColor
   * @returns {any} The new Graphics object
   * @url http://www.espruino.com/Reference#l_Graphics_createArrayBuffer
   */
  static createArrayBuffer(width: number, height: number, bpp: number, options?: { zigzag?: boolean, vertical_byte?: boolean, msb?: boolean, color_order?: "rgb" | "rbg" | "brg" | "bgr" | "grb" | "gbr" }): Graphics<true>;

  /**
   * Create a Graphics object that renders by calling a JavaScript callback function
   * to draw pixels
   *
   * @param {number} width - Pixels wide
   * @param {number} height - Pixels high
   * @param {number} bpp - Number of bits per pixel
   * @param {any} callback - A function of the form ```function(x,y,col)``` that is called whenever a pixel needs to be drawn, or an object with: ```{setPixel:function(x,y,col),fillRect:function(x1,y1,x2,y2,col)}```. All arguments are already bounds checked.
   * @returns {any} The new Graphics object
   * @url http://www.espruino.com/Reference#l_Graphics_createCallback
   */
  static createCallback(width: number, height: number, bpp: number, callback: ((x: number, y: number, col: number) => void) | { setPixel: (x: number, y: number, col: number) => void; fillRect: (x1: number, y1: number, x2: number, y2: number, col: number) => void }): Graphics<false>;

  /**
   * Create a Graphics object that renders to SDL window (Linux-based devices only)
   *
   * @param {number} width - Pixels wide
   * @param {number} height - Pixels high
   * @param {number} bpp - Bits per pixel (8,16,24 or 32 supported)
   * @returns {any} The new Graphics object
   * @url http://www.espruino.com/Reference#l_Graphics_createSDL
   */
  static createSDL(width: number, height: number, bpp: number): Graphics;

  /**
   * Create a simple Black and White image for use with `Graphics.drawImage`.
   * Use as follows:
   * ```
   * var img = Graphics.createImage(`
   * XXXXXXXXX
   * X       X
   * X   X   X
   * X   X   X
   * X       X
   * XXXXXXXXX
   * `);
   * g.drawImage(img, x,y);
   * var img = Graphics.createImage(`
   * .....
   * .XXX.
   * .X.X.
   * .XXX.
   * .....
   * `);
   * g.drawImage(img, x,y);
   * ```
   * If the characters at the beginning and end of the string are newlines, they will
   * be ignored. Spaces are treated as `0`, and any other character is a `1`
   *
   * @param {any} str - A String containing a newline-separated image - space/. is 0, anything else is 1
   * @returns {any} An Image object that can be used with `Graphics.drawImage`
   * @url http://www.espruino.com/Reference#l_Graphics_createImage
   */
  static createImage(str: string): ImageObject;

  /**
   * Draw a filled arc between two angles
   *
   * @param {number} a1 - Angle 1 (radians)
   * @param {number} a2 - Angle 2 (radians)
   * @param {number} r - Radius
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_fillArc
   */
  fillArc(a1: number, a2: number, r: number): Graphics;

  /**
   * Draw rectangle between angles a-ar and a+ar, and radius r1/r2
   *
   * @param {number} a - Angle (radians)
   * @param {number} ar - Angle either side (radians)
   * @param {number} r1 - Radius
   * @param {number} r2 - Radius
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_fillSeg
   */
  fillSeg(a: number, ar: number, r1: number, r2: number): Graphics;

  /**
   * Draw A line between angles a-ar and a+ar at radius r
   *
   * @param {number} a - Angle (radians)
   * @param {number} ar - Angle either side (radians)
   * @param {number} r - Radius
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawSeg
   */
  drawSeg(a: number, ar: number, r: number): Graphics;

  /**
   * Set the current font
   *
   * @param {number} [scale] - [optional] If >1 the font will be scaled up by that amount
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setFont12x20
   */
  setFont12x20(scale?: number): Graphics;

  /**
   * Set the current font
   *
   * @param {number} scale - (optional) If >1 the font will be scaled up by that amount
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setFont6x15
   */
  setFont6x15(scale: number): Graphics;

  /**
   * On instances of graphics that drive a display with an offscreen buffer, calling
   * this function will copy the contents of the offscreen buffer to the screen.
   * Call this when you have drawn something to Graphics and you want it shown on the
   * screen.
   * If a display does not have an offscreen buffer, it may not have a `g.flip()`
   * method.
   * On Bangle.js 1, there are different graphics modes chosen with
   * `Bangle.setLCDMode()`. The default mode is unbuffered and in this mode
   * `g.flip()` does not affect the screen contents.
   * On some devices, this command will attempt to only update the areas of the
   * screen that have changed in order to increase speed. If you have accessed the
   * `Graphics.buffer` directly then you may need to use `Graphics.flip(true)` to
   * force a full update of the screen.
   *
   * @param {boolean} [all] - [optional] (only on some devices) If `true` then copy all pixels, not just those that have changed.
   * @url http://www.espruino.com/Reference#l_Graphics_flip
   */
  flip(all?: boolean): void;

  /**
   * On Graphics instances with an offscreen buffer, this is an `ArrayBuffer` that
   * provides access to the underlying pixel data.
   * ```
   * g=Graphics.createArrayBuffer(8,8,8)
   * g.drawLine(0,0,7,7)
   * print(new Uint8Array(g.buffer))
   * new Uint8Array([
   * 255, 0, 0, 0, 0, 0, 0, 0,
   * 0, 255, 0, 0, 0, 0, 0, 0,
   * 0, 0, 255, 0, 0, 0, 0, 0,
   * 0, 0, 0, 255, 0, 0, 0, 0,
   * 0, 0, 0, 0, 255, 0, 0, 0,
   * 0, 0, 0, 0, 0, 255, 0, 0,
   * 0, 0, 0, 0, 0, 0, 255, 0,
   * 0, 0, 0, 0, 0, 0, 0, 255])
   * ```
   * @returns {any} An ArrayBuffer (or not defined on Graphics instances not created with `Graphics.createArrayBuffer`)
   * @url http://www.espruino.com/Reference#l_Graphics_buffer
   */
  buffer: IsBuffer extends true ? ArrayBuffer : undefined

  /**
   * The width of this Graphics instance
   * @returns {number} The width of this Graphics instance
   * @url http://www.espruino.com/Reference#l_Graphics_getWidth
   */
  getWidth(): number;

  /**
   * The height of this Graphics instance
   * @returns {number} The height of this Graphics instance
   * @url http://www.espruino.com/Reference#l_Graphics_getHeight
   */
  getHeight(): number;

  /**
   * The number of bits per pixel of this Graphics instance
   * **Note:** Bangle.js 2 behaves a little differently here. The display is 3 bit,
   * so `getBPP` returns 3 and `asBMP`/`asImage`/etc return 3 bit images. However in
   * order to allow dithering, the colors returned by `Graphics.getColor` and
   * `Graphics.theme` are actually 16 bits.
   * @returns {number} The bits per pixel of this Graphics instance
   * @url http://www.espruino.com/Reference#l_Graphics_getBPP
   */
  getBPP(): number;

  /**
   * Reset the state of Graphics to the defaults (e.g. Color, Font, etc) that would
   * have been used when Graphics was initialised.
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_reset
   */
  reset(): Graphics;

  /**
   * Clear the LCD with the Background Color
   *
   * @param {boolean} [reset] - [optional] If `true`, resets the state of Graphics to the default (eg. Color, Font, etc) as if calling `Graphics.reset`
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_clear
   */
  clear(reset?: boolean): Graphics;

  /**
   * Fill a rectangular area in the Foreground Color
   * On devices with enough memory, you can specify `{x,y,x2,y2,r}` as the first
   * argument, which allows you to draw a rounded rectangle.
   *
   * @param {any} x1 - The left X coordinate OR an object containing `{x,y,x2,y2}` or `{x,y,w,h}`
   * @param {number} y1 - The top Y coordinate
   * @param {number} x2 - The right X coordinate
   * @param {number} y2 - The bottom Y coordinate
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_fillRect
   */
  fillRect(x1: number, y1: number, x2: number, y2: number): Graphics;
  fillRect(rect: { x: number, y: number, x2: number, y2: number } | { x: number, y: number, w: number, h: number }): Graphics;

  /**
   * Fill a rectangular area in the Background Color
   * On devices with enough memory, you can specify `{x,y,x2,y2,r}` as the first
   * argument, which allows you to draw a rounded rectangle.
   *
   * @param {any} x1 - The left X coordinate OR an object containing `{x,y,x2,y2}` or `{x,y,w,h}`
   * @param {number} y1 - The top Y coordinate
   * @param {number} x2 - The right X coordinate
   * @param {number} y2 - The bottom Y coordinate
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_clearRect
   */
  clearRect(x1: number, y1: number, x2: number, y2: number): Graphics;
  clearRect(rect: { x: number, y: number, x2: number, y2: number } | { x: number, y: number, w: number, h: number }): Graphics;

  /**
   * Draw an unfilled rectangle 1px wide in the Foreground Color
   *
   * @param {any} x1 - The left X coordinate OR an object containing `{x,y,x2,y2}` or `{x,y,w,h}`
   * @param {number} y1 - The top Y coordinate
   * @param {number} x2 - The right X coordinate
   * @param {number} y2 - The bottom Y coordinate
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawRect
   */
  drawRect(x1: number, y1: number, x2: number, y2: number): Graphics;
  drawRect(rect: { x: number, y: number, x2: number, y2: number } | { x: number, y: number, w: number, h: number }): Graphics;

  /**
   * Draw a filled circle in the Foreground Color
   *
   * @param {number} x - The X axis
   * @param {number} y - The Y axis
   * @param {number} rad - The circle radius
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_fillCircle
   */
  fillCircle(x: number, y: number, rad: number): Graphics;

  /**
   * Draw a filled annulus in the Foreground Color
   *
   * @param {number} x - The X axis
   * @param {number} y - The Y axis
   * @param {number} r1 - The annulus inner radius
   * @param {number} r2 - The annulus outer radius
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_fillAnnulus
   */
  fillAnnulus(x: number, y: number, r1: number, r2: number): Graphics;

  /**
   * Draw an unfilled circle 1px wide in the Foreground Color
   *
   * @param {number} x - The X axis
   * @param {number} y - The Y axis
   * @param {number} rad - The circle radius
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawCircle
   */
  drawCircle(x: number, y: number, rad: number): Graphics;

  /**
   * Draw a circle, centred at (x,y) with radius r in the current foreground color
   *
   * @param {number} x - Centre x-coordinate
   * @param {number} y - Centre y-coordinate
   * @param {number} r - Radius
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawCircleAA
   */
  drawCircleAA(x: number, y: number, r: number): Graphics;

  /**
   * Draw a filled ellipse in the Foreground Color
   *
   * @param {number} x1 - The left X coordinate
   * @param {number} y1 - The top Y coordinate
   * @param {number} x2 - The right X coordinate
   * @param {number} y2 - The bottom Y coordinate
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_fillEllipse
   */
  fillEllipse(x1: number, y1: number, x2: number, y2: number): Graphics;

  /**
   * Draw an ellipse in the Foreground Color
   *
   * @param {number} x1 - The left X coordinate
   * @param {number} y1 - The top Y coordinate
   * @param {number} x2 - The right X coordinate
   * @param {number} y2 - The bottom Y coordinate
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawEllipse
   */
  drawEllipse(x1: number, y1: number, x2: number, y2: number): Graphics;

  /**
   * Get a pixel's color
   *
   * @param {number} x - The left
   * @param {number} y - The top
   * @returns {number} The color
   * @url http://www.espruino.com/Reference#l_Graphics_getPixel
   */
  getPixel(x: number, y: number): number;

  /**
   * Set a pixel's color
   *
   * @param {number} x - The left
   * @param {number} y - The top
   * @param {any} col - The color (if `undefined`, the foreground color is useD)
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setPixel
   */
  setPixel(x: number, y: number, col?: ColorResolvable): Graphics;

  /**
   * Work out the color value to be used in the current bit depth based on the arguments.
   * This is used internally by setColor and setBgColor
   * ```
   * // 1 bit
   * g.toColor(1,1,1) => 1
   * // 16 bit
   * g.toColor(1,0,0) => 0xF800
   * ```
   *
   * @param {any} r - Red (between 0 and 1) **OR** an integer representing the color in the current bit depth and color order **OR** a hexidecimal color string of the form `'#rrggbb' or `'#rgb'`
   * @param {any} g - Green (between 0 and 1)
   * @param {any} b - Blue (between 0 and 1)
   * @returns {number} The color index represented by the arguments
   * @url http://www.espruino.com/Reference#l_Graphics_toColor
   */
  toColor(r: number, g: number, b: number): number;
  toColor(col: ColorResolvable): number;

  /**
   * Blend between two colors, and return the result.
   * ```
   * // dark yellow - halfway between red and green
   * var col = g.blendColor("#f00","#0f0", 0.5);
   * // Get a color 25% brighter than the theme's background colour
   * var col = g.blendColor(g.theme.fg,g.theme.bg, 0.75);
   * // then...
   * g.setColor(col).fillRect(10,10,100,100);
   * ```
   *
   * @param {any} col_a - Color to blend from (either a single integer color value, or a string)
   * @param {any} col_b - Color to blend to (either a single integer color value, or a string)
   * @param {any} amt - The amount to blend. 0=col_a, 1=col_b, 0.5=halfway between (and so on)
   * @returns {number} The color index represented by the blended colors
   * @url http://www.espruino.com/Reference#l_Graphics_blendColor
   */
  blendColor(col_a: ColorResolvable, col_b: ColorResolvable, amt: number): number;

  /**
   * Set the color to use for subsequent drawing operations.
   * If just `r` is specified as an integer, the numeric value will be written directly into a pixel. eg. On a 24 bit `Graphics` instance you set bright blue with either `g.setColor(0,0,1)` or `g.setColor(0x0000FF)`.
   * A good shortcut to ensure you get white on all platforms is to use `g.setColor(-1)`
   * The mapping is as follows:
   * * 32 bit: `r,g,b` => `0xFFrrggbb`
   * * 24 bit: `r,g,b` => `0xrrggbb`
   * * 16 bit: `r,g,b` => `0brrrrrggggggbbbbb` (RGB565)
   * * Other bpp: `r,g,b` => white if `r+g+b > 50%`, otherwise black (use `r` on its own as an integer)
   * If you specified `color_order` when creating the `Graphics` instance, `r`,`g` and `b` will be swapped as you specified.
   * **Note:** On devices with low flash memory, `r` **must** be an integer representing the color in the current bit depth. It cannot
   * be a floating point value, and `g` and `b` are ignored.
   *
   * @param {any} r - Red (between 0 and 1) **OR** an integer representing the color in the current bit depth and color order **OR** a hexidecimal color string of the form `'#012345'`
   * @param {any} [g] - [optional] Green (between 0 and 1)
   * @param {any} [b] - [optional] Blue (between 0 and 1)
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setColor
   */
  setColor(r: number, g: number, b: number): Graphics;
  setColor(col: ColorResolvable): Graphics;

  /**
   * Set the background color to use for subsequent drawing operations.
   * See `Graphics.setColor` for more information on the mapping of `r`, `g`, and `b` to pixel values.
   * **Note:** On devices with low flash memory, `r` **must** be an integer representing the color in the current bit depth. It cannot
   * be a floating point value, and `g` and `b` are ignored.
   *
   * @param {any} r - Red (between 0 and 1) **OR** an integer representing the color in the current bit depth and color order **OR** a hexidecimal color string of the form `'#012345'`
   * @param {any} g - Green (between 0 and 1)
   * @param {any} b - Blue (between 0 and 1)
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setBgColor
   */
  setBgColor(r: number, g: number, b: number): Graphics;
  setBgColor(col: ColorResolvable): Graphics;

  /**
   * Get the color to use for subsequent drawing operations
   * @returns {number} The integer value of the colour
   * @url http://www.espruino.com/Reference#l_Graphics_getColor
   */
  getColor(): number;

  /**
   * Get the background color to use for subsequent drawing operations
   * @returns {number} The integer value of the colour
   * @url http://www.espruino.com/Reference#l_Graphics_getBgColor
   */
  getBgColor(): number;

  /**
   * This sets the 'clip rect' that subsequent drawing operations are clipped to sit
   * between.
   * These values are inclusive - e.g. `g.setClipRect(1,0,5,0)` will ensure that only
   * pixel rows 1,2,3,4,5 are touched on column 0.
   * **Note:** For maximum flexibility on Bangle.js 1, the values here are not range
   * checked. For normal use, X and Y should be between 0 and
   * `getWidth()-1`/`getHeight()-1`.
   * **Note:** The x/y values here are rotated, so that if `Graphics.setRotation` is
   * used they correspond to the coordinates given to the draw functions, *not to the
   * physical device pixels*.
   *
   * @param {number} x1 - Top left X coordinate
   * @param {number} y1 - Top left Y coordinate
   * @param {number} x2 - Bottom right X coordinate
   * @param {number} y2 - Bottom right Y coordinate
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setClipRect
   */
  setClipRect(x1: number, y1: number, x2: number, y2: number): Graphics;

  /**
   * Make subsequent calls to `drawString` use the built-in 4x6 pixel bitmapped Font
   * It is recommended that you use `Graphics.setFont("4x6")` for more flexibility.
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setFontBitmap
   */
  setFontBitmap(): Graphics;

  /**
   * Make subsequent calls to `drawString` use a Vector Font of the given height.
   * It is recommended that you use `Graphics.setFont("Vector", size)` for more
   * flexibility.
   *
   * @param {number} size - The height of the font, as an integer
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setFontVector
   */
  setFontVector(size: number): Graphics;

  /**
   * Make subsequent calls to `drawString` use a Custom Font of the given height. See
   * the [Fonts page](http://www.espruino.com/Fonts) for more information about
   * custom fonts and how to create them.
   * For examples of use, see the [font
   * modules](https://www.espruino.com/Fonts#font-modules).
   * **Note:** while you can specify the character code of the first character with
   * `firstChar`, the newline character 13 will always be treated as a newline and
   * not rendered.
   *
   * @param {any} bitmap - A column-first, MSB-first, 1bpp bitmap containing the font bitmap
   * @param {number} firstChar - The first character in the font - usually 32 (space)
   * @param {any} width - The width of each character in the font. Either an integer, or a string where each character represents the width
   * @param {number} height - The height as an integer (max 255). Bits 8-15 represent the scale factor (eg. `2<<8` is twice the size). Bits 16-23 represent the BPP (0,1=1 bpp, 2=2 bpp, 4=4 bpp)
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setFontCustom
   */
  setFontCustom(bitmap: ArrayBuffer, firstChar: number, width: number | string, height: number): Graphics;

  /**
   *
   * @param {any} file - The font as a PBF file
   * @param {number} scale - The scale factor, default=1 (2=2x size)
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setFontPBF
   */
  setFontPBF(file: any, scale: number): Graphics;

  /**
   * Set the alignment for subsequent calls to `drawString`
   *
   * @param {number} x - X alignment. -1=left (default), 0=center, 1=right
   * @param {number} y - Y alignment. -1=top (default), 0=center, 1=bottom
   * @param {number} rotation - Rotation of the text. 0=normal, 1=90 degrees clockwise, 2=180, 3=270
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setFontAlign
   */
  setFontAlign(x: -1 | 0 | 1, y?: -1 | 0 | 1, rotation?: 0 | 1 | 2 | 3): Graphics;

  /**
   * Set the font by name. Various forms are available:
   * * `g.setFont("4x6")` - standard 4x6 bitmap font
   * * `g.setFont("Vector:12")` - vector font 12px high
   * * `g.setFont("4x6:2")` - 4x6 bitmap font, doubled in size
   * * `g.setFont("6x8:2x3")` - 6x8 bitmap font, doubled in width, tripled in height
   * You can also use these forms, but they are not recommended:
   * * `g.setFont("Vector12")` - vector font 12px high
   * * `g.setFont("4x6",2)` - 4x6 bitmap font, doubled in size
   * `g.getFont()` will return the current font as a String.
   * For a list of available font names, you can use `g.getFonts()`.
   *
   * @param {any} name - The name of the font to use (if undefined, the standard 4x6 font will be used)
   * @param {number} size - The size of the font (or undefined)
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setFont
   */
  setFont(name: FontNameWithScaleFactor): Graphics;
  setFont(name: FontName, size: number): Graphics;

  /**
   * Get the font by name - can be saved and used with `Graphics.setFont`.
   * Normally this might return something like `"4x6"`, but if a scale factor is
   * specified, a colon and then the size is reported, like "4x6:2"
   * **Note:** For custom fonts, `Custom` is currently reported instead of the font
   * name.
   * @returns {any} Get the name of the current font
   * @url http://www.espruino.com/Reference#l_Graphics_getFont
   */
  getFont(): FontNameWithScaleFactor | "Custom"

  /**
   * Return an array of all fonts currently in the Graphics library.
   * **Note:** Vector fonts are specified as `Vector#` where `#` is the font height.
   * As there are effectively infinite fonts, just `Vector` is included in the list.
   * @returns {any} And array of font names
   * @url http://www.espruino.com/Reference#l_Graphics_getFonts
   */
  getFonts(): FontName[];

  /**
   * Return the height in pixels of the current font
   * @returns {number} The height in pixels of the current font
   * @url http://www.espruino.com/Reference#l_Graphics_getFontHeight
   */
  getFontHeight(): number;

  /**
   * Return the size in pixels of a string of text in the current font
   *
   * @param {any} str - The string
   * @returns {number} The length of the string in pixels
   * @url http://www.espruino.com/Reference#l_Graphics_stringWidth
   */
  stringWidth(str: string): number;

  /**
   * Return the width and height in pixels of a string of text in the current font. The object returned contains:
   * ```JS
   * {
   *   width,              // Width of the string in pixels
   *   height,             // Height of the string in pixels
   *   unrenderableChars,  // If true, the string contains characters that the current font isn't able to render.
   *   imageCount,         // How many inline images are in this string?
   *   maxImageHeight,     // If there are images, what is the maximum height of all images?
   * }
   * ```
   *
   * @param {any} str - The string
   * @returns {any} An object containing `{width,height,etc}` for the string - see below
   * @url http://www.espruino.com/Reference#l_Graphics_stringMetrics
   */
  stringMetrics(str: string): { width: number, height: number, unrenderableChars: boolean, imageCount : number, maxImageHeight : number };

  /**
   * Wrap a string to the given pixel width using the current font, and return the
   * lines as an array.
   * To render within the screen's width you can do:
   * ```
   * g.drawString(g.wrapString(text, g.getWidth()).join("\n")),
   * ```
   *
   * @param {any} str - The string
   * @param {number} maxWidth - The width in pixels
   * @returns {any} An array of lines that are all less than `maxWidth`
   * @url http://www.espruino.com/Reference#l_Graphics_wrapString
   */
  wrapString(str: string, maxWidth: number): string[];

  /**
   * Draw a string of text in the current font.
   * ```
   * g.drawString("Hello World", 10, 10);
   * ```
   * Images may also be embedded inside strings (e.g. to render Emoji or characters
   * not in the current font). To do this, just add `0` then the image string ([about
   * Images](http://www.espruino.com/Graphics#images-bitmaps)) For example:
   * ```
   * g.drawString("Hi \0\7\5\1\x82 D\x17\xC0");
   * // draws:
   * // # #  #      #     #
   * // # #            #
   * // ### ##         #
   * // # #  #      #     #
   * // # # ###      #####
   * ```
   *
   * @param {any} str - The string
   * @param {number} x - The X position of the leftmost pixel
   * @param {number} y - The Y position of the topmost pixel
   * @param {boolean} solid - For bitmap fonts, should empty pixels be filled with the background color?
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawString
   */
  drawString(str: string, x: number, y: number, solid?: boolean): Graphics;

  /**
   * Return the current string as a series of polygons (using the current vector font). `options` is as follows:
   * * `x` - X offset of font (default 0)
   * * `y` - Y offset of font (default 0)
   * * `w` - Width of font (default 256) - the actual width will likely be less than this as most characters are non-square
   * * `h` - Height of font (default 256) - the actual height will likely be less than this as most characters don't fully fill the font box
   * ```
   * g.getVectorFontPolys("Hi", {x:-80,y:-128});
   * ```
   *
   * @param {any} str - The string
   * @param {any} [options] - [optional] `{x,y,w,h}` (see below)
   * @returns {any} An array of Uint8Arrays for vector font polygons
   * @url http://www.espruino.com/Reference#l_Graphics_getVectorFontPolys
   */
  getVectorFontPolys(str: any, options?: any): any[];

  /**
   * Draw a string of text as a fixed-width line font
   * `options` contains:
   * * `size`: font size in pixels (char width is half font size) - default 16
   * * `rotate`: Initial rotation in radians - default 0
   * * `twist`: Subsequent rotation per character in radians - default 0
   *
   * @param {any} str - The string
   * @param {number} x - The X position of the start of the text string
   * @param {number} y - The Y position of the middle of the text string
   * @param {any} options - Options for drawing this font (see below)
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawLineString
   */
  drawLineString(str: any, x: number, y: number, options: any): Graphics;

  /**
   * Draw a line between x1,y1 and x2,y2 in the current foreground color
   *
   * @param {number} x1 - The left
   * @param {number} y1 - The top
   * @param {number} x2 - The right
   * @param {number} y2 - The bottom
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawLine
   */
  drawLine(x1: number, y1: number, x2: number, y2: number): Graphics;

  /**
   * Draw a line between x1,y1 and x2,y2 in the current foreground color
   *
   * @param {number} x1 - The left
   * @param {number} y1 - The top
   * @param {number} x2 - The right
   * @param {number} y2 - The bottom
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawLineAA
   */
  drawLineAA(x1: number, y1: number, x2: number, y2: number): Graphics;

  /**
   * Draw a line from the last position of `lineTo` or `moveTo` to this position
   *
   * @param {number} x - X value
   * @param {number} y - Y value
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_lineTo
   */
  lineTo(x: number, y: number): Graphics;

  /**
   * Move the cursor to a position - see lineTo
   *
   * @param {number} x - X value
   * @param {number} y - Y value
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_moveTo
   */
  moveTo(x: number, y: number): Graphics;

  /**
   * Draw a polyline (lines between each of the points in `poly`) in the current
   * foreground color
   * **Note:** there is a limit of 64 points (128 XY elements) for polygons
   *
   * @param {any} poly - An array of vertices, of the form ```[x1,y1,x2,y2,x3,y3,etc]```
   * @param {boolean} closed - Draw another line between the last element of the array and the first
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawPoly
   */
  drawPoly(poly: number[], closed?: boolean): Graphics;

  /**
   * Draw an **antialiased** polyline (lines between each of the points in `poly`) in
   * the current foreground color
   * **Note:** there is a limit of 64 points (128 XY elements) for polygons
   *
   * @param {any} poly - An array of vertices, of the form ```[x1,y1,x2,y2,x3,y3,etc]```
   * @param {boolean} closed - Draw another line between the last element of the array and the first
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawPolyAA
   */
  drawPolyAA(poly: number[], closed?: boolean): Graphics;

  /**
   * Draw a filled polygon in the current foreground color.
   * ```
   * g.fillPoly([
   *   16, 0,
   *   31, 31,
   *   26, 31,
   *   16, 12,
   *   6, 28,
   *   0, 27 ]);
   * ```
   * This fills from the top left hand side of the polygon (low X, low Y) *down to
   * but not including* the bottom right. When placed together polygons will align
   * perfectly without overdraw - but this will not fill the same pixels as
   * `drawPoly` (drawing a line around the edge of the polygon).
   * **Note:** there is a limit of 64 points (128 XY elements) for polygons
   *
   * @param {any} poly - An array of vertices, of the form ```[x1,y1,x2,y2,x3,y3,etc]```
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_fillPoly
   */
  fillPoly(poly: number[]): Graphics;

  /**
   * Draw a filled polygon in the current foreground color.
   * ```
   * g.fillPolyAA([
   *   16, 0,
   *   31, 31,
   *   26, 31,
   *   16, 12,
   *   6, 28,
   *   0, 27 ]);
   * ```
   * This fills from the top left hand side of the polygon (low X, low Y) *down to
   * but not including* the bottom right. When placed together polygons will align
   * perfectly without overdraw - but this will not fill the same pixels as
   * `drawPoly` (drawing a line around the edge of the polygon).
   * **Note:** there is a limit of 64 points (128 XY elements) for polygons
   *
   * @param {any} poly - An array of vertices, of the form ```[x1,y1,x2,y2,x3,y3,etc]```
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_fillPolyAA
   */
  fillPolyAA(poly: number[]): Graphics;

  /**
   * Set the current rotation of the graphics device.
   *
   * @param {number} rotation - The clockwise rotation. 0 for no rotation, 1 for 90 degrees, 2 for 180, 3 for 270
   * @param {boolean} reflect - Whether to reflect the image
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setRotation
   */
  setRotation(rotation: 0 | 1 | 2 | 3, reflect?: boolean): Graphics;

  /**
   * Return the width and height in pixels of an image (either Graphics, Image
   * Object, Image String or ArrayBuffer). Returns `undefined` if image couldn't be
   * decoded.
   * `frames` is also included is the image contains more information than you'd
   * expect for a single bitmap. In this case the bitmap might be an animation with
   * multiple frames
   *
   * @param {any} str - The string
   * @returns {any} An object containing `{width,height,bpp,transparent}` for the image
   * @url http://www.espruino.com/Reference#l_Graphics_imageMetrics
   */
  imageMetrics(img: Image): { width: number, height: number, bpp: number, transparent: number, frames?: ArrayBuffer[] } | undefined;

  /**
   * Image can be:
   * * An object with the following fields `{ width : int, height : int, bpp :
   *   optional int, buffer : ArrayBuffer/String, transparent: optional int,
   *   palette : optional Uint16Array(2/4/16) }`. bpp = bits per pixel (default is
   *   1), transparent (if defined) is the colour that will be treated as
   *   transparent, and palette is a color palette that each pixel will be looked up
   *   in first
   * * A String where the the first few bytes are:
   *   `width,height,bpp,[transparent,]image_bytes...`. If a transparent colour is
   *   specified the top bit of `bpp` should be set.
   * * An ArrayBuffer Graphics object (if `bpp<8`, `msb:true` must be set) - this is
   *   disabled on devices without much flash memory available. If a Graphics object
   *   is supplied, it can also contain transparent/palette fields as if it were
   *   an image.
   * See https://www.espruino.com/Graphics#images-bitmaps for more information about
   * image formats.
   * Draw an image at the specified position.
   * * If the image is 1 bit, the graphics foreground/background colours will be
   *   used.
   * * If `img.palette` is a Uint16Array or 2/4/16 elements, color data will be
   *   looked from the supplied palette
   * * On Bangle.js, 2 bit images blend from background(0) to foreground(1) colours
   * * On Bangle.js, 4 bit images use the Apple Mac 16 color palette
   * * On Bangle.js, 8 bit images use the Web Safe 216 color palette
   * * Otherwise color data will be copied as-is. Bitmaps are rendered MSB-first
   * If `options` is supplied, `drawImage` will allow images to be rendered at any
   * scale or angle. If `options.rotate` is set it will center images at `x,y`.
   * `options` must be an object of the form:
   * ```
   * {
   *   rotate : float, // the amount to rotate the image in radians (default 0)
   *   scale : float, // the amount to scale the image up (default 1)
   *   frame : int    // if specified and the image has frames of data
   *                  //  after the initial frame, draw one of those frames from the image
   *   filter : bool  // (2v19+) when set, if scale<0.75 perform 2x2 supersampling to smoothly downscale the image
   * }
   * ```
   * For example:
   * ```
   * // In the top left of the screen
   * g.drawImage(img,0,0);
   * // In the top left of the screen, twice as big
   * g.drawImage(img,0,0,{scale:2});
   * // In the center of the screen, twice as big, 45 degrees
   * g.drawImage(img, g.getWidth()/2, g.getHeight()/2,
   *             {scale:2, rotate:Math.PI/4});
   * ```
   *
   * @param {any} image - An image to draw, either a String or an Object (see below)
   * @param {number} x - The X offset to draw the image
   * @param {number} y - The Y offset to draw the image
   * @param {any} options - options for scaling,rotation,etc (see below)
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawImage
   */
  drawImage(image: Image, x: number, y: number, options?: { rotate?: number, scale?: number, frame?: number }): Graphics;

  /**
   * Draws multiple images *at once* - which avoids flicker on unbuffered systems
   * like Bangle.js. Maximum layer count right now is 4.
   * ```
   * layers = [ {
   *   {x : int, // x start position
   *    y : int, // y start position
   *    image : string/object,
   *    scale : float, // scale factor, default 1
   *    rotate : float, // angle in radians
   *    center : bool // center on x,y? default is top left
   *    repeat : should this image be repeated (tiled?)
   *    nobounds : bool // if true, the bounds of the image are not used to work out the default area to draw
   *   }
   * ]
   * options = { // the area to render. Defaults to rendering just enough to cover what's requested
   *  x,y,
   *  width,height
   * }
   * ```
   *
   * @param {any} layers - An array of objects {x,y,image,scale,rotate,center} (up to 3)
   * @param {any} options - options for rendering - see below
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_drawImages
   */
  drawImages(layers: { x: number, y: number, image: Image, scale?: number, rotate?: number, center?: boolean, repeat?: boolean, nobounds?: boolean }[], options?: { x: number, y: number, width: number, height: number }): Graphics;

  /**
   * Return this Graphics object as an Image that can be used with
   * `Graphics.drawImage`. Check out [the Graphics reference
   * page](http://www.espruino.com/Graphics#images-bitmaps) for more information on
   * images.
   * Will return undefined if data can't be allocated for the image.
   * The image data itself will be referenced rather than copied if:
   * * An image `object` was requested (not `string`)
   * * The Graphics instance was created with `Graphics.createArrayBuffer`
   * * Is 8 bpp *OR* the `{msb:true}` option was given
   * * No other format options (zigzag/etc) were given
   * Otherwise data will be copied, which takes up more space and may be quite slow.
   * If the `Graphics` object contains `transparent` or `pelette` fields,
   * [as you might find in an image](http://www.espruino.com/Graphics#images-bitmaps),
   * those will be included in the generated image too.
   *
   * @param {any} type - The type of image to return. Either `object`/undefined to return an image object, or `string` to return an image string
   * @returns {any} An Image that can be used with `Graphics.drawImage`
   * @url http://www.espruino.com/Reference#l_Graphics_asImage
   */
  asImage(type?: "object"): ImageObject;
  asImage(type: "string"): string;

  /**
   * Return the area of the Graphics canvas that has been modified, and optionally
   * clear the modified area to 0.
   * For instance if `g.setPixel(10,20)` was called, this would return `{x1:10,
   * y1:20, x2:10, y2:20}`
   *
   * @param {boolean} reset - Whether to reset the modified area or not
   * @returns {any} An object {x1,y1,x2,y2} containing the modified area, or undefined if not modified
   * @url http://www.espruino.com/Reference#l_Graphics_getModified
   */
  getModified(reset?: boolean): { x1: number, y1: number, x2: number, y2: number };

  /**
   * Scroll the contents of this graphics in a certain direction. The remaining area
   * is filled with the background color.
   * Note: This uses repeated pixel reads and writes, so will not work on platforms
   * that don't support pixel reads.
   *
   * @param {number} x - X direction. >0 = to right
   * @param {number} y - Y direction. >0 = down
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_scroll
   */
  scroll(x: number, y: number): Graphics;

  /**
   * Blit one area of the screen (x1,y1 w,h) to another (x2,y2 w,h)
   * ```
   * g.blit({
   *   x1:0, y1:0,
   *   w:32, h:32,
   *   x2:100, y2:100,
   *   setModified : true // should we set the modified area?
   * });
   * ```
   * Note: This uses repeated pixel reads and writes, so will not work on platforms
   * that don't support pixel reads.
   *
   * @param {any} options - options - see below
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_blit
   */
  blit(options: { x1: number, y1: number, x2: number, y2: number, w: number, h: number, setModified?: boolean }): Graphics;

  /**
   * Create a Windows BMP file from this Graphics instance, and return it as a
   * String.
   * @returns {any} A String representing the Graphics as a Windows BMP file (or 'undefined' if not possible)
   * @url http://www.espruino.com/Reference#l_Graphics_asBMP
   */
  asBMP(): string;

  /**
   * Create a URL of the form `data:image/bmp;base64,...` that can be pasted into the
   * browser.
   * The Espruino Web IDE can detect this data on the console and render the image
   * inline automatically.
   * @returns {any} A String representing the Graphics as a URL (or 'undefined' if not possible)
   * @url http://www.espruino.com/Reference#l_Graphics_asURL
   */
  asURL(): string;

  /**
   * Output this image as a bitmap URL of the form `data:image/bmp;base64,...`. The
   * Espruino Web IDE will detect this on the console and will render the image
   * inline automatically.
   * This is identical to `console.log(g.asURL())` - it is just a convenient function
   * for easy debugging and producing screenshots of what is currently in the
   * Graphics instance.
   * **Note:** This may not work on some bit depths of Graphics instances. It will
   * also not work for the main Graphics instance of Bangle.js 1 as the graphics on
   * Bangle.js 1 are stored in write-only memory.
   * @url http://www.espruino.com/Reference#l_Graphics_dump
   */
  dump(): void;

  /**
   *
   * @param {any} filename - If supplied, a file to save, otherwise 'screenshot.img'
   * @url http://www.espruino.com/Reference#l_Graphics_saveScreenshot
   */
  saveScreenshot(filename: any): void;

  /**
   * Calculate the square area under a Bezier curve.
   *  x0,y0: start point x1,y1: control point y2,y2: end point
   *  Max 10 points without start point.
   *
   * @param {any} arr - An array of three vertices, six enties in form of ```[x0,y0,x1,y1,x2,y2]```
   * @param {any} options - number of points to calulate
   * @returns {any} Array with calculated points
   * @url http://www.espruino.com/Reference#l_Graphics_quadraticBezier
   */
  quadraticBezier(arr: [number, number, number, number, number, number], options?: number): number[];

  /**
   * Transformation can be:
   * * An object of the form
   * ```
   * {
   *   x: float, // x offset (default 0)
   *   y: float, // y offset (default 0)
   *   scale: float, // scale factor (default 1)
   *   rotate: float, // angle in radians (default 0)
   * }
   * ```
   * * A six-element array of the form `[a,b,c,d,e,f]`, which represents the 2D transformation matrix
   * ```
   * a c e
   * b d f
   * 0 0 1
   * ```
   *  Apply a transformation to an array of vertices.
   *
   * @param {any} verts - An array of vertices, of the form ```[x1,y1,x2,y2,x3,y3,etc]```
   * @param {any} transformation - The transformation to apply, either an Object or an Array (see below)
   * @returns {any} Array of transformed vertices
   * @url http://www.espruino.com/Reference#l_Graphics_transformVertices
   */
  transformVertices(arr: number[], transformation: { x?: number, y?: number, scale?: number, rotate?: number } | [number, number, number, number, number, number]): number[];

  /**
   * Flood fills the given Graphics instance out from a particular point.
   * **Note:** This only works on Graphics instances that support readback with `getPixel`. It
   * is also not capable of filling over dithered patterns (eg non-solid colours on Bangle.js 2)
   *
   * @param {number} x - X coordinate to start from
   * @param {number} y - Y coordinate to start from
   * @param {any} col - The color to fill with (if undefined, foreground is used)
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_floodFill
   */
  floodFill(x: number, y: number, col: any): Graphics;

  /**
   * Returns an object of the form:
   * ```
   * {
   *   fg : 0xFFFF,  // foreground colour
   *   bg : 0,       // background colour
   *   fg2 : 0xFFFF,  // accented foreground colour
   *   bg2 : 0x0007,  // accented background colour
   *   fgH : 0xFFFF,  // highlighted foreground colour
   *   bgH : 0x02F7,  // highlighted background colour
   *   dark : true,  // Is background dark (e.g. foreground should be a light colour)
   * }
   * ```
   * These values can then be passed to `g.setColor`/`g.setBgColor` for example
   * `g.setColor(g.theme.fg2)`. When the Graphics instance is reset, the background
   * color is automatically set to `g.theme.bg` and foreground is set to
   * `g.theme.fg`.
   * On Bangle.js these values can be changed by writing updated values to `theme` in
   * `settings.js` and reloading the app - or they can be changed temporarily by
   * calling `Graphics.setTheme`
   * @returns {any} An object containing the current 'theme' (see below)
   * @url http://www.espruino.com/Reference#l_Graphics_theme
   */
  theme: Theme;

  /**
   * Set the global colour scheme. On Bangle.js, this is reloaded from
   * `settings.json` for each new app loaded.
   * See `Graphics.theme` for the fields that can be provided. For instance you can
   * change the background to red using:
   * ```
   * g.setTheme({bg:"#f00"});
   * ```
   *
   * @param {any} theme - An object of the form returned by `Graphics.theme`
   * @returns {any} The instance of Graphics this was called on, to allow call chaining
   * @url http://www.espruino.com/Reference#l_Graphics_setTheme
   */
  setTheme(theme: { [key in keyof Theme]?: Theme[key] extends number ? ColorResolvable : Theme[key] }): Graphics;
}

/**
 * Class containing utility functions for the Seeed WIO LTE board
 * @url http://www.espruino.com/Reference#WioLTE
 */
declare class WioLTE {
  /**
   * Set the WIO's LED
   *
   * @param {number} red - 0-255, red LED intensity
   * @param {number} green - 0-255, green LED intensity
   * @param {number} blue - 0-255, blue LED intensity
   * @url http://www.espruino.com/Reference#l_WioLTE_LED
   */
  static LED(red: number, green: number, blue: number): void;

  /**
   * Set the power of Grove connectors, except for `D38` and `D39` which are always
   * on.
   *
   * @param {boolean} onoff - Whether to turn the Grove connectors power on or off (D38/D39 are always powered)
   * @url http://www.espruino.com/Reference#l_WioLTE_setGrovePower
   */
  static setGrovePower(onoff: boolean): void;

  /**
   * Turn power to the WIO's LED on or off.
   * Turning the LED on won't immediately display a color - that must be done with
   * `WioLTE.LED(r,g,b)`
   *
   * @param {boolean} onoff - true = on, false = off
   * @url http://www.espruino.com/Reference#l_WioLTE_setLEDPower
   */
  static setLEDPower(onoff: boolean): void;

  /**
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_WioLTE_D38
   */
  static D38: any;

  /**
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_WioLTE_D20
   */
  static D20: any;

  /**
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_WioLTE_A6
   */
  static A6: any;

  /**
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_WioLTE_I2C
   */
  static I2C: any;

  /**
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_WioLTE_UART
   */
  static UART: any;

  /**
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_WioLTE_A4
   */
  static A4: any;


}

/**
 * This class handles waveforms. In Espruino, a Waveform is a set of data that you
 * want to input or output.
 * @url http://www.espruino.com/Reference#Waveform
 */
declare class Waveform {
  /**
   * Create a waveform class. This allows high speed input and output of waveforms.
   * It has an internal variable called `buffer` (as well as `buffer2` when
   * double-buffered - see `options` below) which contains the data to input/output.
   * When double-buffered, a 'buffer' event will be emitted each time a buffer is
   * finished with (the argument is that buffer). When the recording stops, a
   * 'finish' event will be emitted (with the first argument as the buffer).
   * @constructor
   *
   * @param {number} samples - The number of samples
   * @param {any} options - Optional options struct `{doubleBuffer:bool, bits : 8/16}` where: `doubleBuffer` is whether to allocate two buffers or not (default false), and bits is the amount of bits to use (default 8).
   * @returns {any} An Waveform object
   * @url http://www.espruino.com/Reference#l_Waveform_Waveform
   */
  static new(samples: number, options: any): any;

  /**
   * Will start outputting the waveform on the given pin - the pin must have
   * previously been initialised with analogWrite. If not repeating, it'll emit a
   * `finish` event when it is done.
   *
   * @param {Pin} output - The pin to output on
   * @param {number} freq - The frequency to output each sample at
   * @param {any} options - Optional options struct `{time:float,repeat:bool}` where: `time` is the that the waveform with start output at, e.g. `getTime()+1` (otherwise it is immediate), `repeat` is a boolean specifying whether to repeat the give sample
   * @url http://www.espruino.com/Reference#l_Waveform_startOutput
   */
  startOutput(output: Pin, freq: number, options: any): void;

  /**
   * Will start inputting the waveform on the given pin that supports analog. If not
   * repeating, it'll emit a `finish` event when it is done.
   *
   * @param {Pin} output - The pin to output on
   * @param {number} freq - The frequency to output each sample at
   * @param {any} options - Optional options struct `{time:float,repeat:bool}` where: `time` is the that the waveform with start output at, e.g. `getTime()+1` (otherwise it is immediate), `repeat` is a boolean specifying whether to repeat the give sample
   * @url http://www.espruino.com/Reference#l_Waveform_startInput
   */
  startInput(output: Pin, freq: number, options: any): void;

  /**
   * Stop a waveform that is currently outputting
   * @url http://www.espruino.com/Reference#l_Waveform_stop
   */
  stop(): void;
}

interface DataViewConstructor {
  /**
   * Create a `DataView` object that can be used to access the data in an
   * `ArrayBuffer`.
   * ```
   * var b = new ArrayBuffer(8)
   * var v = new DataView(b)
   * v.setUint16(0,"0x1234")
   * v.setUint8(3,"0x56")
   * console.log("0x"+v.getUint32(0).toString(16))
   * // prints 0x12340056
   * ```
   * @constructor
   *
   * @param {any} buffer - The `ArrayBuffer` to base this on
   * @param {number} [byteOffset] - [optional] The offset of this view in bytes
   * @param {number} [byteLength] - [optional] The length in bytes
   * @returns {any} A `DataView` object
   * @url http://www.espruino.com/Reference#l_DataView_DataView
   */
  new(buffer: ArrayBuffer, byteOffset?: number, byteLength?: number): DataView;
}

interface DataView {
  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @returns {any} the index of the value in the array, or -1
   * @url http://www.espruino.com/Reference#l_DataView_getFloat32
   */
  getFloat32(byteOffset: number, littleEndian?: boolean): number;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @returns {any} the index of the value in the array, or -1
   * @url http://www.espruino.com/Reference#l_DataView_getFloat64
   */
  getFloat64(byteOffset: number, littleEndian?: boolean): number;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @returns {any} the index of the value in the array, or -1
   * @url http://www.espruino.com/Reference#l_DataView_getInt8
   */
  getInt8(byteOffset: number, littleEndian?: boolean): number;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @returns {any} the index of the value in the array, or -1
   * @url http://www.espruino.com/Reference#l_DataView_getInt16
   */
  getInt16(byteOffset: number, littleEndian?: boolean): number;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @returns {any} the index of the value in the array, or -1
   * @url http://www.espruino.com/Reference#l_DataView_getInt32
   */
  getInt32(byteOffset: number, littleEndian?: boolean): number;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @returns {any} the index of the value in the array, or -1
   * @url http://www.espruino.com/Reference#l_DataView_getUint8
   */
  getUint8(byteOffset: number, littleEndian?: boolean): number;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @returns {any} the index of the value in the array, or -1
   * @url http://www.espruino.com/Reference#l_DataView_getUint16
   */
  getUint16(byteOffset: number, littleEndian?: boolean): number;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @returns {any} the index of the value in the array, or -1
   * @url http://www.espruino.com/Reference#l_DataView_getUint32
   */
  getUint32(byteOffset: number, littleEndian?: boolean): number;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {any} value - The value to write
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @url http://www.espruino.com/Reference#l_DataView_setFloat32
   */
  setFloat32(byteOffset: number, value: number, littleEndian?: boolean): void;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {any} value - The value to write
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @url http://www.espruino.com/Reference#l_DataView_setFloat64
   */
  setFloat64(byteOffset: number, value: number, littleEndian?: boolean): void;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {any} value - The value to write
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @url http://www.espruino.com/Reference#l_DataView_setInt8
   */
  setInt8(byteOffset: number, value: number, littleEndian?: boolean): void;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {any} value - The value to write
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @url http://www.espruino.com/Reference#l_DataView_setInt16
   */
  setInt16(byteOffset: number, value: number, littleEndian?: boolean): void;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {any} value - The value to write
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @url http://www.espruino.com/Reference#l_DataView_setInt32
   */
  setInt32(byteOffset: number, value: number, littleEndian?: boolean): void;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {any} value - The value to write
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @url http://www.espruino.com/Reference#l_DataView_setUint8
   */
  setUint8(byteOffset: number, value: number, littleEndian?: boolean): void;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {any} value - The value to write
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @url http://www.espruino.com/Reference#l_DataView_setUint16
   */
  setUint16(byteOffset: number, value: number, littleEndian?: boolean): void;

  /**
   *
   * @param {number} byteOffset - The offset in bytes to read from
   * @param {any} value - The value to write
   * @param {boolean} [littleEndian] - [optional] Whether to read in little endian - if false or undefined data is read as big endian
   * @url http://www.espruino.com/Reference#l_DataView_setUint32
   */
  setUint32(byteOffset: number, value: number, littleEndian?: boolean): void;
}

/**
 * This class helps
 * @url http://www.espruino.com/Reference#DataView
 */
declare const DataView: DataViewConstructor

interface consoleConstructor {
  /**
   * Print the supplied string(s) to the console
   *  **Note:** If you're connected to a computer (not a wall adaptor) via USB but
   *  **you are not running a terminal app** then when you print data Espruino may
   *  pause execution and wait until the computer requests the data it is trying to
   *  print.
   *
   * @param {any} text - One or more arguments to print
   * @url http://www.espruino.com/Reference#l_console_log
   */
  log(...text: any[]): void;

  /**
   * Implemented in Espruino as an alias of `console.log`
   *
   * @param {any} text - One or more arguments to print
   * @url http://www.espruino.com/Reference#l_console_debug
   */
  debug(...text: any[]): void;

  /**
   * Implemented in Espruino as an alias of `console.log`
   *
   * @param {any} text - One or more arguments to print
   * @url http://www.espruino.com/Reference#l_console_info
   */
  info(...text: any[]): void;

  /**
   * Implemented in Espruino as an alias of `console.log`
   *
   * @param {any} text - One or more arguments to print
   * @url http://www.espruino.com/Reference#l_console_warn
   */
  warn(...text: any[]): void;

  /**
   * Implemented in Espruino as an alias of `console.log`
   *
   * @param {any} text - One or more arguments to print
   * @url http://www.espruino.com/Reference#l_console_error
   */
  error(...text: any[]): void;
}

interface console {

}

/**
 * An Object that contains functions for writing to the interactive console
 * @url http://www.espruino.com/Reference#console
 */
declare const console: consoleConstructor

interface ErrorConstructor {
  /**
   * Creates an Error object
   * @constructor
   *
   * @param {any} [message] - [optional] An message string
   * @returns {any} An Error object
   * @url http://www.espruino.com/Reference#l_Error_Error
   */
  new(message?: string): Error;
}

interface Error {
  /**
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_Error_toString
   */
  toString(): string;
}

/**
 * The base class for runtime errors
 * @url http://www.espruino.com/Reference#Error
 */
declare const Error: ErrorConstructor

interface SyntaxErrorConstructor {
  /**
   * Creates a SyntaxError object
   * @constructor
   *
   * @param {any} [message] - [optional] An message string
   * @returns {any} A SyntaxError object
   * @url http://www.espruino.com/Reference#l_SyntaxError_SyntaxError
   */
  new(message?: string): SyntaxError;
}

interface SyntaxError {
  /**
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_SyntaxError_toString
   */
  toString(): string;
}

/**
 * The base class for syntax errors
 * @url http://www.espruino.com/Reference#SyntaxError
 */
declare const SyntaxError: SyntaxErrorConstructor

interface TypeErrorConstructor {
  /**
   * Creates a TypeError object
   * @constructor
   *
   * @param {any} [message] - [optional] An message string
   * @returns {any} A TypeError object
   * @url http://www.espruino.com/Reference#l_TypeError_TypeError
   */
  new(message?: string): TypeError;
}

interface TypeError {
  /**
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_TypeError_toString
   */
  toString(): string;
}

/**
 * The base class for type errors
 * @url http://www.espruino.com/Reference#TypeError
 */
declare const TypeError: TypeErrorConstructor

/**
 * The base class for internal errors
 * @url http://www.espruino.com/Reference#InternalError
 */
declare class InternalError {
  /**
   * Creates an InternalError object
   * @constructor
   *
   * @param {any} [message] - [optional] An message string
   * @returns {any} An InternalError object
   * @url http://www.espruino.com/Reference#l_InternalError_InternalError
   */
  static new(message?: string): InternalError;

  /**
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_InternalError_toString
   */
  toString(): string;
}

interface ReferenceErrorConstructor {
  /**
   * Creates a ReferenceError object
   * @constructor
   *
   * @param {any} [message] - [optional] An message string
   * @returns {any} A ReferenceError object
   * @url http://www.espruino.com/Reference#l_ReferenceError_ReferenceError
   */
  new(message?: string): ReferenceError;
}

interface ReferenceError {
  /**
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_ReferenceError_toString
   */
  toString(): string;
}

/**
 * The base class for reference errors - where a variable which doesn't exist has
 * been accessed.
 * @url http://www.espruino.com/Reference#ReferenceError
 */
declare const ReferenceError: ReferenceErrorConstructor

interface ArrayBufferConstructor {
  /**
   * Create an Array Buffer object
   * @constructor
   *
   * @param {number} byteLength - The length in Bytes
   * @returns {any} An ArrayBuffer object
   * @url http://www.espruino.com/Reference#l_ArrayBuffer_ArrayBuffer
   */
  new(byteLength: number): ArrayBuffer;
}

interface ArrayBuffer {
  /**
   * The length, in bytes, of the `ArrayBuffer`
   * @returns {number} The Length in bytes
   * @url http://www.espruino.com/Reference#l_ArrayBuffer_byteLength
   */
  byteLength: number;
}

/**
 * This is the built-in JavaScript class for array buffers.
 * If you want to access arrays of differing types of data you may also find
 * `DataView` useful.
 * @url http://www.espruino.com/Reference#ArrayBuffer
 */
declare const ArrayBuffer: ArrayBufferConstructor

/**
 * This is the built-in JavaScript class that is the prototype for:
 * * [Uint8Array](/Reference#Uint8Array)
 * * [UintClamped8Array](/Reference#UintClamped8Array)
 * * [Int8Array](/Reference#Int8Array)
 * * [Uint16Array](/Reference#Uint16Array)
 * * [Int16Array](/Reference#Int16Array)
 * * [Uint24Array](/Reference#Uint24Array) (Espruino-specific - not standard JS)
 * * [Uint32Array](/Reference#Uint32Array)
 * * [Int32Array](/Reference#Int32Array)
 * * [Float32Array](/Reference#Float32Array)
 * * [Float64Array](/Reference#Float64Array)
 * If you want to access arrays of differing types of data you may also find
 * `DataView` useful.
 * @url http://www.espruino.com/Reference#ArrayBufferView
 */
declare class ArrayBufferView<T = ArrayBuffer> {


  /**
   * The buffer this view references
   * @returns {any} An ArrayBuffer object
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_buffer
   */
  readonly buffer: T;

  /**
   * The length, in bytes, of the `ArrayBufferView`
   * @returns {number} The Length
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_byteLength
   */
  readonly byteLength: number;

  /**
   * The offset, in bytes, to the first byte of the view within the backing
   * `ArrayBuffer`
   * @returns {number} The byte Offset
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_byteOffset
   */
  readonly byteOffset: number;

  /**
   * Copy the contents of `array` into this one, mapping `this[x+offset]=array[x];`
   *
   * @param {any} arr - Floating point index to access
   * @param {number} [offset] - [optional] The offset in this array at which to write the values
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_set
   */
  set(arr: ArrayLike<number>, offset: number): void

  /**
   * Return an array which is made from the following: ```A.map(function) =
   * [function(A[0]), function(A[1]), ...]```
   *  **Note:** This returns an `ArrayBuffer` of the same type it was called on. To
   *  get an `Array`, use `Array.map`, e.g. `[].map.call(myArray, x=>x+1)`
   *
   * @param {any} function - Function used to map one item to another
   * @param {any} [thisArg] - [optional] If specified, the function is called with 'this' set to thisArg
   * @returns {any} An array containing the results
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_map
   */
  map(callbackfn: (value: number, index: number, array: T) => number, thisArg?: any): T;

  /**
   * Returns a smaller part of this array which references the same data (it doesn't
   * copy it).
   *
   * @param {number} begin - Element to begin at, inclusive. If negative, this is from the end of the array. The entire array is included if this isn't specified
   * @param {any} end - Element to end at, exclusive. If negative, it is relative to the end of the array. If not specified the whole array is included
   * @returns {any} An `ArrayBufferView` of the same type as this one, referencing the same data
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_subarray
   */
  subarray(begin?: number, end?: number): T;

  /**
   * Return the index of the value in the array, or `-1`
   *
   * @param {any} value - The value to check for
   * @param {number} [startIndex] - [optional] the index to search from, or 0 if not specified
   * @returns {any} the index of the value in the array, or -1
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_indexOf
   */
  indexOf(value: number, startIndex?: number): number;

  /**
   * Return `true` if the array includes the value, `false` otherwise
   *
   * @param {any} value - The value to check for
   * @param {number} [startIndex] - [optional] the index to search from, or 0 if not specified
   * @returns {boolean} `true` if the array includes the value, `false` otherwise
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_includes
   */
  includes(value: number, startIndex?: number): boolean;

  /**
   * Join all elements of this array together into one string, using 'separator'
   * between them. e.g. ```[1,2,3].join(' ')=='1 2 3'```
   *
   * @param {any} separator - The separator
   * @returns {any} A String representing the Joined array
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_join
   */
  join(separator?: string): string;

  /**
   * Do an in-place quicksort of the array
   *
   * @param {any} var - A function to use to compare array elements (or undefined)
   * @returns {any} This array object
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_sort
   */
  sort(compareFn?: (a: number, b: number) => number): this;

  /**
   * Executes a provided function once per array element.
   *
   * @param {any} function - Function to be executed
   * @param {any} [thisArg] - [optional] If specified, the function is called with 'this' set to thisArg
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_forEach
   */
  forEach(callbackfn: (value: number, index: number, array: T) => void, thisArg?: any): void;

  /**
   * Execute `previousValue=initialValue` and then `previousValue =
   * callback(previousValue, currentValue, index, array)` for each element in the
   * array, and finally return previousValue.
   *
   * @param {any} callback - Function used to reduce the array
   * @param {any} initialValue - if specified, the initial value to pass to the function
   * @returns {any} The value returned by the last function called
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_reduce
   */
  reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: T) => number, initialValue?: number): number;

  /**
   * Fill this array with the given value, for every index `>= start` and `< end`
   *
   * @param {any} value - The value to fill the array with
   * @param {number} start - Optional. The index to start from (or 0). If start is negative, it is treated as length+start where length is the length of the array
   * @param {any} end - Optional. The index to end at (or the array length). If end is negative, it is treated as length+end.
   * @returns {any} This array
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_fill
   */
  fill(value: number, start?: number, end?: number): T;

  /**
   * Return an array which contains only those elements for which the callback
   * function returns 'true'
   *
   * @param {any} function - Function to be executed
   * @param {any} [thisArg] - [optional] If specified, the function is called with 'this' set to thisArg
   * @returns {any} An array containing the results
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_filter
   */
  filter(predicate: (value: number, index: number, array: T) => any, thisArg?: any): T;

  /**
   * Return the array element where `function` returns `true`, or `undefined` if it
   * doesn't returns `true` for any element.
   *
   * @param {any} function - Function to be executed
   * @returns {any} The array element where `function` returns `true`, or `undefined`
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_find
   */
  find(predicate: (value: number, index: number, obj: T) => boolean, thisArg?: any): number | undefined;

  /**
   * Return the array element's index where `function` returns `true`, or `-1` if it
   * doesn't returns `true` for any element.
   *
   * @param {any} function - Function to be executed
   * @returns {any} The array element's index where `function` returns `true`, or `-1`
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_findIndex
   */
  findIndex(predicate: (value: number, index: number, obj: T) => boolean, thisArg?: any): number;

  /**
   * Reverse the contents of this `ArrayBufferView` in-place
   * @returns {any} This array
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_reverse
   */
  reverse(): T

  /**
   * Return a copy of a portion of this array (in a new array).
   *  **Note:** This currently returns a normal `Array`, not an `ArrayBuffer`
   *
   * @param {number} start - Start index
   * @param {any} [end] - [optional] End index
   * @returns {any} A new array
   * @url http://www.espruino.com/Reference#l_ArrayBufferView_slice
   */
  slice(start?: number, end?: number): number[];

  [index: number]: number
}

interface Uint8ArrayConstructor {
  /**
   * Create a typed array based on the given input. Either an existing Array Buffer,
   * an Integer as a Length, or a simple array. If an `ArrayBufferView` (e.g.
   * `Uint8Array` rather than `ArrayBuffer`) is given, it will be completely copied
   * rather than referenced.
   * @constructor
   *
   * @param {any} arr - The array or typed array to base this off, or an integer which is the array length
   * @param {number} byteOffset - The byte offset in the ArrayBuffer  (ONLY IF the first argument was an ArrayBuffer)
   * @param {number} length - The length (ONLY IF the first argument was an ArrayBuffer)
   * @returns {any} A typed array
   * @url http://www.espruino.com/Reference#l_Uint8Array_Uint8Array
   */
  new(length: number): Uint8Array;
  new(array: ArrayLike<number>): Uint8Array;
  new(buffer: ArrayBuffer, byteOffset?: number, length?: number): Uint8Array;
}

type Uint8Array = ArrayBufferView<Uint8Array>;

declare const Uint8Array: Uint8ArrayConstructor

interface Uint8ClampedArrayConstructor {
  /**
   * Create a typed array based on the given input. Either an existing Array Buffer,
   * an Integer as a Length, or a simple array. If an `ArrayBufferView` (e.g.
   * `Uint8Array` rather than `ArrayBuffer`) is given, it will be completely copied
   * rather than referenced.
   * Clamped arrays clamp their values to the allowed range, rather than 'wrapping'.
   * e.g. after `a[0]=12345;`, `a[0]==255`.
   * @constructor
   *
   * @param {any} arr - The array or typed array to base this off, or an integer which is the array length
   * @param {number} byteOffset - The byte offset in the ArrayBuffer  (ONLY IF the first argument was an ArrayBuffer)
   * @param {number} length - The length (ONLY IF the first argument was an ArrayBuffer)
   * @returns {any} A typed array
   * @url http://www.espruino.com/Reference#l_Uint8ClampedArray_Uint8ClampedArray
   */
  new(length: number): Uint8ClampedArray;
  new(array: ArrayLike<number>): Uint8ClampedArray;
  new(buffer: ArrayBuffer, byteOffset?: number, length?: number): Uint8ClampedArray;
}

type Uint8ClampedArray = ArrayBufferView<Uint8ClampedArray>;

declare const Uint8ClampedArray: Uint8ClampedArrayConstructor

interface Int8ArrayConstructor {
  /**
   * Create a typed array based on the given input. Either an existing Array Buffer,
   * an Integer as a Length, or a simple array. If an `ArrayBufferView` (e.g.
   * `Uint8Array` rather than `ArrayBuffer`) is given, it will be completely copied
   * rather than referenced.
   * @constructor
   *
   * @param {any} arr - The array or typed array to base this off, or an integer which is the array length
   * @param {number} byteOffset - The byte offset in the ArrayBuffer  (ONLY IF the first argument was an ArrayBuffer)
   * @param {number} length - The length (ONLY IF the first argument was an ArrayBuffer)
   * @returns {any} A typed array
   * @url http://www.espruino.com/Reference#l_Int8Array_Int8Array
   */
  new(length: number): Int8Array;
  new(array: ArrayLike<number>): Int8Array;
  new(buffer: ArrayBuffer, byteOffset?: number, length?: number): Int8Array;
}

type Int8Array = ArrayBufferView<Int8Array>;

declare const Int8Array: Int8ArrayConstructor

interface Uint16ArrayConstructor {
  /**
   * Create a typed array based on the given input. Either an existing Array Buffer,
   * an Integer as a Length, or a simple array. If an `ArrayBufferView` (e.g.
   * `Uint8Array` rather than `ArrayBuffer`) is given, it will be completely copied
   * rather than referenced.
   * @constructor
   *
   * @param {any} arr - The array or typed array to base this off, or an integer which is the array length
   * @param {number} byteOffset - The byte offset in the ArrayBuffer  (ONLY IF the first argument was an ArrayBuffer)
   * @param {number} length - The length (ONLY IF the first argument was an ArrayBuffer)
   * @returns {any} A typed array
   * @url http://www.espruino.com/Reference#l_Uint16Array_Uint16Array
   */
  new(length: number): Uint16Array;
  new(array: ArrayLike<number>): Uint16Array;
  new(buffer: ArrayBuffer, byteOffset?: number, length?: number): Uint16Array;
}

type Uint16Array = ArrayBufferView<Uint16Array>;

declare const Uint16Array: Uint16ArrayConstructor

interface Int16ArrayConstructor {
  /**
   * Create a typed array based on the given input. Either an existing Array Buffer,
   * an Integer as a Length, or a simple array. If an `ArrayBufferView` (e.g.
   * `Uint8Array` rather than `ArrayBuffer`) is given, it will be completely copied
   * rather than referenced.
   * @constructor
   *
   * @param {any} arr - The array or typed array to base this off, or an integer which is the array length
   * @param {number} byteOffset - The byte offset in the ArrayBuffer  (ONLY IF the first argument was an ArrayBuffer)
   * @param {number} length - The length (ONLY IF the first argument was an ArrayBuffer)
   * @returns {any} A typed array
   * @url http://www.espruino.com/Reference#l_Int16Array_Int16Array
   */
  new(length: number): Int16Array;
  new(array: ArrayLike<number>): Int16Array;
  new(buffer: ArrayBuffer, byteOffset?: number, length?: number): Int16Array;
}

type Int16Array = ArrayBufferView<Int16Array>;

declare const Int16Array: Int16ArrayConstructor

/**
 * This is the built-in JavaScript class for a typed array of 24 bit unsigned
 * integers.
 * Instantiate this in order to efficiently store arrays of data (Espruino's normal
 * arrays store data in a map, which is inefficient for non-sparse arrays).
 * Arrays of this type include all the methods from
 * [ArrayBufferView](/Reference#ArrayBufferView)
 * @url http://www.espruino.com/Reference#Uint24Array
 */
declare class Uint24Array {
  /**
   * Create a typed array based on the given input. Either an existing Array Buffer,
   * an Integer as a Length, or a simple array. If an `ArrayBufferView` (e.g.
   * `Uint8Array` rather than `ArrayBuffer`) is given, it will be completely copied
   * rather than referenced.
   * @constructor
   *
   * @param {any} arr - The array or typed array to base this off, or an integer which is the array length
   * @param {number} byteOffset - The byte offset in the ArrayBuffer  (ONLY IF the first argument was an ArrayBuffer)
   * @param {number} length - The length (ONLY IF the first argument was an ArrayBuffer)
   * @returns {any} A typed array
   * @url http://www.espruino.com/Reference#l_Uint24Array_Uint24Array
   */
  static new(length: number): Uint24Array;
  static new(array: ArrayLike<number>): Uint24Array;
  static new(buffer: ArrayBuffer, byteOffset?: number, length?: number): Uint24Array;


}

interface Uint32ArrayConstructor {
  /**
   * Create a typed array based on the given input. Either an existing Array Buffer,
   * an Integer as a Length, or a simple array. If an `ArrayBufferView` (e.g.
   * `Uint8Array` rather than `ArrayBuffer`) is given, it will be completely copied
   * rather than referenced.
   * @constructor
   *
   * @param {any} arr - The array or typed array to base this off, or an integer which is the array length
   * @param {number} byteOffset - The byte offset in the ArrayBuffer  (ONLY IF the first argument was an ArrayBuffer)
   * @param {number} length - The length (ONLY IF the first argument was an ArrayBuffer)
   * @returns {any} A typed array
   * @url http://www.espruino.com/Reference#l_Uint32Array_Uint32Array
   */
  new(length: number): Uint32Array;
  new(array: ArrayLike<number>): Uint32Array;
  new(buffer: ArrayBuffer, byteOffset?: number, length?: number): Uint32Array;
}

type Uint32Array = ArrayBufferView<Uint32Array>;

declare const Uint32Array: Uint32ArrayConstructor

interface Int32ArrayConstructor {
  /**
   * Create a typed array based on the given input. Either an existing Array Buffer,
   * an Integer as a Length, or a simple array. If an `ArrayBufferView` (e.g.
   * `Uint8Array` rather than `ArrayBuffer`) is given, it will be completely copied
   * rather than referenced.
   * @constructor
   *
   * @param {any} arr - The array or typed array to base this off, or an integer which is the array length
   * @param {number} byteOffset - The byte offset in the ArrayBuffer  (ONLY IF the first argument was an ArrayBuffer)
   * @param {number} length - The length (ONLY IF the first argument was an ArrayBuffer)
   * @returns {any} A typed array
   * @url http://www.espruino.com/Reference#l_Int32Array_Int32Array
   */
  new(length: number): Int32Array;
  new(array: ArrayLike<number>): Int32Array;
  new(buffer: ArrayBuffer, byteOffset?: number, length?: number): Int32Array;
}

type Int32Array = ArrayBufferView<Int32Array>;

declare const Int32Array: Int32ArrayConstructor

interface Float32ArrayConstructor {
  /**
   * Create a typed array based on the given input. Either an existing Array Buffer,
   * an Integer as a Length, or a simple array. If an `ArrayBufferView` (e.g.
   * `Uint8Array` rather than `ArrayBuffer`) is given, it will be completely copied
   * rather than referenced.
   * @constructor
   *
   * @param {any} arr - The array or typed array to base this off, or an integer which is the array length
   * @param {number} byteOffset - The byte offset in the ArrayBuffer  (ONLY IF the first argument was an ArrayBuffer)
   * @param {number} length - The length (ONLY IF the first argument was an ArrayBuffer)
   * @returns {any} A typed array
   * @url http://www.espruino.com/Reference#l_Float32Array_Float32Array
   */
  new(length: number): Float32Array;
  new(array: ArrayLike<number>): Float32Array;
  new(buffer: ArrayBuffer, byteOffset?: number, length?: number): Float32Array;
}

type Float32Array = ArrayBufferView<Float32Array>;

declare const Float32Array: Float32ArrayConstructor

interface Float64ArrayConstructor {
  /**
   * Create a typed array based on the given input. Either an existing Array Buffer,
   * an Integer as a Length, or a simple array. If an `ArrayBufferView` (e.g.
   * `Uint8Array` rather than `ArrayBuffer`) is given, it will be completely copied
   * rather than referenced.
   * @constructor
   *
   * @param {any} arr - The array or typed array to base this off, or an integer which is the array length
   * @param {number} byteOffset - The byte offset in the ArrayBuffer  (ONLY IF the first argument was an ArrayBuffer). Maximum 65535.
   * @param {number} length - The length (ONLY IF the first argument was an ArrayBuffer)
   * @returns {any} A typed array
   * @url http://www.espruino.com/Reference#l_Float64Array_Float64Array
   */
  new(length: number): Float64Array;
  new(array: ArrayLike<number>): Float64Array;
  new(buffer: ArrayBuffer, byteOffset?: number, length?: number): Float64Array;
}

type Float64Array = ArrayBufferView<Float64Array>;

declare const Float64Array: Float64ArrayConstructor

interface DateConstructor {
  /**
   * Get the number of milliseconds elapsed since 1970 (or on embedded platforms,
   * since startup).
   * **Note:** Desktop JS engines return an integer value for `Date.now()`, however Espruino
   * returns a floating point value, accurate to fractions of a millisecond.
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Date_now
   */
  now(): number;

  /**
   * Parse a date string and return milliseconds since 1970. Data can be either
   * '2011-10-20T14:48:00', '2011-10-20' or 'Mon, 25 Dec 1995 13:30:00 +0430'
   *
   * @param {any} str - A String
   * @returns {number} The number of milliseconds since 1970
   * @url http://www.espruino.com/Reference#l_Date_parse
   */
  parse(str: string): number;

  /**
   * Creates a date object
   * @constructor
   *
   * @param {any} args - Either nothing (current time), one numeric argument (milliseconds since 1970), a date string (see `Date.parse`), or [year, month, day, hour, minute, second, millisecond]
   * @returns {any} A Date object
   * @url http://www.espruino.com/Reference#l_Date_Date
   */
  new(): Date;
  new(value: number | string): Date;
  new(year: number, month: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): Date;
  (arg?: any): string;
}

interface Date {
  /**
   * This returns the time-zone offset from UTC, in minutes.
   * @returns {number} The difference, in minutes, between UTC and local time
   * @url http://www.espruino.com/Reference#l_Date_getTimezoneOffset
   */
  getTimezoneOffset(): number;

  /**
   * This returns a boolean indicating whether daylight savings time is in effect.
   * @returns {number} true if daylight savings time is in effect
   * @url http://www.espruino.com/Reference#l_Date_getIsDST
   */
  getIsDST(): boolean

  /**
   * Return the number of milliseconds since 1970
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Date_getTime
   */
  getTime(): number;

  /**
   * Return the number of milliseconds since 1970
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Date_valueOf
   */
  valueOf(): number;

  /**
   * Set the time/date of this Date class
   *
   * @param {number} timeValue - the number of milliseconds since 1970
   * @returns {number} the number of milliseconds since 1970
   * @url http://www.espruino.com/Reference#l_Date_setTime
   */
  setTime(timeValue: number): number;

  /**
   * 0..23
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Date_getHours
   */
  getHours(): number;

  /**
   * 0..59
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Date_getMinutes
   */
  getMinutes(): number;

  /**
   * 0..59
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Date_getSeconds
   */
  getSeconds(): number;

  /**
   * 0..999
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Date_getMilliseconds
   */
  getMilliseconds(): number;

  /**
   * Day of the week (0=sunday, 1=monday, etc)
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Date_getDay
   */
  getDay(): number;

  /**
   * Day of the month 1..31
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Date_getDate
   */
  getDate(): number;

  /**
   * Month of the year 0..11
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Date_getMonth
   */
  getMonth(): number;

  /**
   * The year, e.g. 2014
   * @returns {number}
   * @url http://www.espruino.com/Reference#l_Date_getFullYear
   */
  getFullYear(): number;

  /**
   * 0..23
   *
   * @param {number} hoursValue - number of hours, 0..23
   * @param {any} minutesValue - number of minutes, 0..59
   * @param {any} [secondsValue] - [optional] number of seconds, 0..59
   * @param {any} [millisecondsValue] - [optional] number of milliseconds, 0..999
   * @returns {number} The number of milliseconds since 1970
   * @url http://www.espruino.com/Reference#l_Date_setHours
   */
  setHours(hoursValue: number, minutesValue?: number, secondsValue?: number, millisecondsValue?: number): number;

  /**
   * 0..59
   *
   * @param {number} minutesValue - number of minutes, 0..59
   * @param {any} [secondsValue] - [optional] number of seconds, 0..59
   * @param {any} [millisecondsValue] - [optional] number of milliseconds, 0..999
   * @returns {number} The number of milliseconds since 1970
   * @url http://www.espruino.com/Reference#l_Date_setMinutes
   */
  setMinutes(minutesValue: number, secondsValue?: number, millisecondsValue?: number): number;

  /**
   * 0..59
   *
   * @param {number} secondsValue - number of seconds, 0..59
   * @param {any} [millisecondsValue] - [optional] number of milliseconds, 0..999
   * @returns {number} The number of milliseconds since 1970
   * @url http://www.espruino.com/Reference#l_Date_setSeconds
   */
  setSeconds(secondsValue: number, millisecondsValue?: number): number;

  /**
   *
   * @param {number} millisecondsValue - number of milliseconds, 0..999
   * @returns {number} The number of milliseconds since 1970
   * @url http://www.espruino.com/Reference#l_Date_setMilliseconds
   */
  setMilliseconds(millisecondsValue: number): number;

  /**
   * Day of the month 1..31
   *
   * @param {number} dayValue - the day of the month, between 0 and 31
   * @returns {number} The number of milliseconds since 1970
   * @url http://www.espruino.com/Reference#l_Date_setDate
   */
  setDate(dayValue: number): number;

  /**
   * Month of the year 0..11
   *
   * @param {number} monthValue - The month, between 0 and 11
   * @param {any} [dayValue] - [optional] the day, between 0 and 31
   * @returns {number} The number of milliseconds since 1970
   * @url http://www.espruino.com/Reference#l_Date_setMonth
   */
  setMonth(monthValue: number, dayValue?: number): number;

  /**
   *
   * @param {number} yearValue - The full year - eg. 1989
   * @param {any} [monthValue] - [optional] the month, between 0 and 11
   * @param {any} [dayValue] - [optional] the day, between 0 and 31
   * @returns {number} The number of milliseconds since 1970
   * @url http://www.espruino.com/Reference#l_Date_setFullYear
   */
  setFullYear(yearValue: number, monthValue?: number, dayValue?: number): number;

  /**
   * Converts to a String, e.g: `Fri Jun 20 2014 14:52:20 GMT+0000`
   *  **Note:** This uses whatever timezone was set with `E.setTimeZone()` or
   *  `E.setDST()`
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_Date_toString
   */
  toString(): string;

  /**
   * Converts to a String, e.g: `Fri, 20 Jun 2014 14:52:20 GMT`
   *  **Note:** This always assumes a timezone of GMT
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_Date_toUTCString
   */
  toUTCString(): string;

  /**
   * Converts to a ISO 8601 String, e.g: `2014-06-20T14:52:20.123Z`
   *  **Note:** This always assumes a timezone of GMT
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_Date_toISOString
   */
  toISOString(): string;

  /**
   * Calls `Date.toISOString` to output this date to JSON
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_Date_toJSON
   */
  toJSON(): string;

  /**
   * Converts to a ISO 8601 String (with timezone information), e.g:
   * `2014-06-20T14:52:20.123-0500`
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_Date_toLocalISOString
   */
  toLocalISOString(): string;
}

/**
 * The built-in class for handling Dates.
 * **Note:** By default the time zone is GMT+0, however you can change the timezone
 * using the `E.setTimeZone(...)` function.
 * For example `E.setTimeZone(1)` will be GMT+0100
 * *However* if you have daylight savings time set with `E.setDST(...)` then the
 * timezone set by `E.setTimeZone(...)` will be _ignored_.
 * @url http://www.espruino.com/Reference#Date
 */
declare const Date: DateConstructor

interface MathConstructor {
  /**
   * @returns {number} The value of E - 2.718281828459045
   * @url http://www.espruino.com/Reference#l_Math_E
   */
  E: number;

  /**
   * @returns {number} The value of PI - 3.141592653589793
   * @url http://www.espruino.com/Reference#l_Math_PI
   */
  PI: number;

  /**
   * @returns {number} The natural logarithm of 2 - 0.6931471805599453
   * @url http://www.espruino.com/Reference#l_Math_LN2
   */
  LN2: number;

  /**
   * @returns {number} The natural logarithm of 10 - 2.302585092994046
   * @url http://www.espruino.com/Reference#l_Math_LN10
   */
  LN10: number;

  /**
   * @returns {number} The base 2 logarithm of e - 1.4426950408889634
   * @url http://www.espruino.com/Reference#l_Math_LOG2E
   */
  LOG2E: number;

  /**
   * @returns {number} The base 10 logarithm of e - 0.4342944819032518
   * @url http://www.espruino.com/Reference#l_Math_LOG10E
   */
  LOG10E: number;

  /**
   * @returns {number} The square root of 2 - 1.4142135623730951
   * @url http://www.espruino.com/Reference#l_Math_SQRT2
   */
  SQRT2: number;

  /**
   * @returns {number} The square root of 1/2 - 0.7071067811865476
   * @url http://www.espruino.com/Reference#l_Math_SQRT1_2
   */
  SQRT1_2: number;

  /**
   *
   * @param {number} x - A floating point value
   * @returns {number} The absolute value of x (eg, ```Math.abs(2)==2```, but also ```Math.abs(-2)==2```)
   * @url http://www.espruino.com/Reference#l_Math_abs
   */
  abs(x: number): number;

  /**
   *
   * @param {number} x - The value to get the arc cosine of
   * @returns {number} The arc cosine of x, between 0 and PI
   * @url http://www.espruino.com/Reference#l_Math_acos
   */
  acos(x: number): number;

  /**
   *
   * @param {number} x - The value to get the arc sine of
   * @returns {number} The arc sine of x, between -PI/2 and PI/2
   * @url http://www.espruino.com/Reference#l_Math_asin
   */
  asin(x: number): number;

  /**
   *
   * @param {number} x - The value to get the arc tangent of
   * @returns {number} The arc tangent of x, between -PI/2 and PI/2
   * @url http://www.espruino.com/Reference#l_Math_atan
   */
  atan(x: number): number;

  /**
   *
   * @param {number} y - The Y-part of the angle to get the arc tangent of
   * @param {number} x - The X-part of the angle to get the arc tangent of
   * @returns {number} The arctangent of Y/X, between -PI and PI
   * @url http://www.espruino.com/Reference#l_Math_atan2
   */
  atan2(y: number, x: number): number;

  /**
   *
   * @param {number} theta - The angle to get the cosine of
   * @returns {number} The cosine of theta
   * @url http://www.espruino.com/Reference#l_Math_cos
   */
  cos(theta: number): number;

  /**
   *
   * @param {number} x - The value to raise to the power
   * @param {number} y - The power x should be raised to
   * @returns {number} x raised to the power y (x^y)
   * @url http://www.espruino.com/Reference#l_Math_pow
   */
  pow(x: number, y: number): number;

  /**
   * @returns {number} A random number between 0 and 1
   * @url http://www.espruino.com/Reference#l_Math_random
   */
  random(): number;

  /**
   *
   * @param {number} x - The value to round
   * @returns {any} x, rounded to the nearest integer
   * @url http://www.espruino.com/Reference#l_Math_round
   */
  round(x: number): any;

  /**
   *
   * @param {number} theta - The angle to get the sine of
   * @returns {number} The sine of theta
   * @url http://www.espruino.com/Reference#l_Math_sin
   */
  sin(theta: number): number;

  /**
   *
   * @param {number} theta - The angle to get the tangent of
   * @returns {number} The tangent of theta
   * @url http://www.espruino.com/Reference#l_Math_tan
   */
  tan(theta: number): number;

  /**
   *
   * @param {number} x - The value to take the square root of
   * @returns {number} The square root of x
   * @url http://www.espruino.com/Reference#l_Math_sqrt
   */
  sqrt(x: number): number;

  /**
   *
   * @param {number} x - The value to round up
   * @returns {number} x, rounded upwards to the nearest integer
   * @url http://www.espruino.com/Reference#l_Math_ceil
   */
  ceil(x: number): number;

  /**
   *
   * @param {number} x - The value to round down
   * @returns {number} x, rounded downwards to the nearest integer
   * @url http://www.espruino.com/Reference#l_Math_floor
   */
  floor(x: number): number;

  /**
   *
   * @param {number} x - The value raise E to the power of
   * @returns {number} E^x
   * @url http://www.espruino.com/Reference#l_Math_exp
   */
  exp(x: number): number;

  /**
   *
   * @param {number} x - The value to take the logarithm (base E) root of
   * @returns {number} The log (base E) of x
   * @url http://www.espruino.com/Reference#l_Math_log
   */
  log(x: number): number;

  /**
   * DEPRECATED - Please use `E.clip()` instead. Clip a number to be between min and
   * max (inclusive)
   *
   * @param {number} x - A floating point value to clip
   * @param {number} min - The smallest the value should be
   * @param {number} max - The largest the value should be
   * @returns {number} The value of x, clipped so as not to be below min or above max.
   * @url http://www.espruino.com/Reference#l_Math_clip
   */
  clip(x: number, min: number, max: number): number;

  /**
   * DEPRECATED - This is not part of standard JavaScript libraries
   * Wrap a number around if it is less than 0 or greater than or equal to max. For
   * instance you might do: ```Math.wrap(angleInDegrees, 360)```
   *
   * @param {number} x - A floating point value to wrap
   * @param {number} max - The largest the value should be
   * @returns {number} The value of x, wrapped so as not to be below min or above max.
   * @url http://www.espruino.com/Reference#l_Math_wrap
   */
  wrap(x: number, max: number): number;

  /**
   * Find the minimum of a series of numbers
   *
   * @param {any} args - Floating point values to clip
   * @returns {number} The minimum of the supplied values
   * @url http://www.espruino.com/Reference#l_Math_min
   */
  min(...args: any[]): number;

  /**
   * Find the maximum of a series of numbers
   *
   * @param {any} args - Floating point values to clip
   * @returns {number} The maximum of the supplied values
   * @url http://www.espruino.com/Reference#l_Math_max
   */
  max(...args: any[]): number;

  /**
   *
   * @param {number} x - The value to get the sign from
   * @returns {number} sign on x - -1, 1, or 0
   * @url http://www.espruino.com/Reference#l_Math_sign
   */
  sign(x: number): number;
}

interface Math {

}

/**
 * This is a standard JavaScript class that contains useful Maths routines
 * @url http://www.espruino.com/Reference#Math
 */
declare const Math: MathConstructor

/**
 * Built-in class that caches the modules used by the `require` command
 * @url http://www.espruino.com/Reference#Modules
 */
declare class Modules {
  /**
   * Return an array of module names that have been cached
   * @returns {any} An array of module names
   * @url http://www.espruino.com/Reference#l_Modules_getCached
   */
  static getCached(): any;

  /**
   * Remove the given module from the list of cached modules
   *
   * @param {any} id - The module name to remove
   * @url http://www.espruino.com/Reference#l_Modules_removeCached
   */
  static removeCached(id: any): void;

  /**
   * Remove all cached modules
   * @url http://www.espruino.com/Reference#l_Modules_removeAllCached
   */
  static removeAllCached(): void;

  /**
   * Add the given module to the cache
   *
   * @param {any} id - The module name to add
   * @param {any} sourcecode - The module's sourcecode
   * @url http://www.espruino.com/Reference#l_Modules_addCached
   */
  static addCached(id: any, sourcecode: any): void;


}

/**
 * This is the built-in JavaScript class for Espruino utility functions.
 * @url http://www.espruino.com/Reference#E
 */
declare class E {
  /**
   * Display a menu on the screen, and set up the buttons to navigate through it.
   * Supply an object containing menu items. When an item is selected, the function
   * it references will be executed. For example:
   * ```
   * var boolean = false;
   * var number = 50;
   * // First menu
   * var mainmenu = {
   *   "" : { "title" : "-- Main Menu --" },
   *   "Backlight On" : function() { LED1.set(); },
   *   "Backlight Off" : function() { LED1.reset(); },
   *   "Submenu" : function() { E.showMenu(submenu); },
   *   "A Boolean" : {
   *     value : boolean,
   *     format : v => v?"On":"Off",
   *     onchange : v => { boolean=v; }
   *   },
   *   "A Number" : {
   *     value : number,
   *     min:0,max:100,step:10,
   *     // noList : true, // On Bangle.js devices this forces use of the number-chooser (and not a scrolling list)
   *     onchange : v => { number=v; }
   *   },
   *   "Exit" : function() { E.showMenu(); }, // remove the menu
   * };
   * // Submenu
   * var submenu = {
   *   "" : { title : "-- SubMenu --",
   *          back : function() { E.showMenu(mainmenu); } },
   *   "One" : undefined, // do nothing
   *   "Two" : undefined // do nothing
   * };
   * // Actually display the menu
   * E.showMenu(mainmenu);
   * ```
   * The menu will stay onscreen and active until explicitly removed, which you can
   * do by calling `E.showMenu()` without arguments.
   * See http://www.espruino.com/graphical_menu for more detailed information.
   *
   * @param {any} menu - An object containing name->function mappings to to be used in a menu
   * @returns {any} A menu object with `draw`, `move` and `select` functions
   * @url http://www.espruino.com/Reference#l_E_showMenu
   */
  static showMenu(menu: Menu): MenuInstance;
  static showMenu(): void;

  /**
   * A utility function for displaying a full screen message on the screen.
   * Draws to the screen and returns immediately.
   * ```
   * E.showMessage("These are\nLots of\nLines","My Title")
   * ```
   *
   * @param {any} message - A message to display. Can include newlines
   * @param {any} [title] - [optional] a title for the message
   * @url http://www.espruino.com/Reference#l_E_showMessage
   */
  static showMessage(message: string, title?: string): void;

  /**
   * Displays a full screen prompt on the screen, with the buttons requested (or
   * `Yes` and `No` for defaults).
   * When the button is pressed the promise is resolved with the requested values
   * (for the `Yes` and `No` defaults, `true` and `false` are returned).
   * ```
   * E.showPrompt("Do you like fish?").then(function(v) {
   *   if (v) print("'Yes' chosen");
   *   else print("'No' chosen");
   * });
   * // Or
   * E.showPrompt("How many fish\ndo you like?",{
   *   title:"Fish",
   *   buttons : {"One":1,"Two":2,"Three":3}
   * }).then(function(v) {
   *   print("You like "+v+" fish");
   * });
   * ```
   * To remove the prompt, call `E.showPrompt()` with no arguments.
   * The second `options` argument can contain:
   * ```
   * {
   *   title: "Hello",                      // optional Title
   *   buttons : {"Ok":true,"Cancel":false} // list of button text & return value
   * }
   * ```
   *
   * @param {any} message - A message to display. Can include newlines
   * @param {any} [options] - [optional] an object of options (see below)
   * @returns {any} A promise that is resolved when 'Ok' is pressed
   * @url http://www.espruino.com/Reference#l_E_showPrompt
   */
  static showPrompt<T = boolean>(message: string, options?: { title?: string, buttons?: { [key: string]: T } }): Promise<T>;
  static showPrompt(): void;

  /**
   * Displays a full screen prompt on the screen, with a single 'Ok' button.
   * When the button is pressed the promise is resolved.
   * ```
   * E.showAlert("Hello").then(function() {
   *   print("Ok pressed");
   * });
   * // or
   * E.showAlert("These are\nLots of\nLines","My Title").then(function() {
   *   print("Ok pressed");
   * });
   * ```
   * To remove the window, call `E.showAlert()` with no arguments.
   *
   * @param {any} message - A message to display. Can include newlines
   * @param {any} [options] - [optional] a title for the message
   * @returns {any} A promise that is resolved when 'Ok' is pressed
   * @url http://www.espruino.com/Reference#l_E_showAlert
   */
  static showAlert(message?: string, options?: string): Promise<void>;

  /**
   * @url http://www.espruino.com/Reference#l_E_showMenu
   */
  static showMenu(): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_showPrompt
   */
  static showPrompt(): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_showMessage
   */
  static showMessage(): void;

  /**
   * Setup the filesystem so that subsequent calls to `E.openFile` and
   * `require('fs').*` will use an SD card on the supplied SPI device and pin.
   * It can even work using software SPI - for instance:
   * ```
   * // DI/CMD = C7
   * // DO/DAT0 = C8
   * // CK/CLK = C9
   * // CD/CS/DAT3 = C6
   * var spi = new SPI();
   * spi.setup({mosi:C7, miso:C8, sck:C9});
   * E.connectSDCard(spi, C6);
   * console.log(require("fs").readdirSync());
   * ```
   * See [the page on File IO](http://www.espruino.com/File+IO) for more information.
   * **Note:** We'd strongly suggest you add a pullup resistor from CD/CS pin to
   * 3.3v. It is good practise to avoid accidental writes before Espruino is
   * initialised, and some cards will not work reliably without one.
   * **Note:** If you want to remove an SD card after you have started using it, you
   * *must* call `E.unmountSD()` or you may cause damage to the card.
   *
   * @param {any} spi - The SPI object to use for communication
   * @param {Pin} csPin - The pin to use for Chip Select
   * @url http://www.espruino.com/Reference#l_E_connectSDCard
   */
  static connectSDCard(spi: any, csPin: Pin): void;

  /**
   * Unmount the SD card, so it can be removed. If you remove the SD card without
   * calling this you may cause corruption, and you will be unable to access another
   * SD card until you reset Espruino or call `E.unmountSD()`.
   * @url http://www.espruino.com/Reference#l_E_unmountSD
   */
  static unmountSD(): void;

  /**
   * Open a file
   *
   * @param {any} path - the path to the file to open.
   * @param {any} mode - The mode to use when opening the file. Valid values for mode are 'r' for read, 'w' for write new, 'w+' for write existing, and 'a' for append. If not specified, the default is 'r'.
   * @returns {any} A File object
   * @url http://www.espruino.com/Reference#l_E_openFile
   */
  static openFile(path: any, mode: any): File;

  /**
   * Change the parameters used for the flash filesystem. The default address is the
   * last 1Mb of 4Mb Flash, 0x300000, with total size of 1Mb.
   * Before first use the media needs to be formatted.
   * ```
   * fs=require("fs");
   * try {
   *   fs.readdirSync();
   *  } catch (e) { //'Uncaught Error: Unable to mount media : NO_FILESYSTEM'
   *   console.log('Formatting FS - only need to do once');
   *   E.flashFatFS({ format: true });
   * }
   * fs.writeFileSync("bang.txt", "This is the way the world ends\nnot with a bang but a whimper.\n");
   * fs.readdirSync();
   * ```
   * This will create a drive of 100 * 4096 bytes at 0x300000. Be careful with the
   * selection of flash addresses as you can overwrite firmware! You only need to
   * format once, as each will erase the content.
   * `E.flashFatFS({ addr:0x300000,sectors:100,format:true });`
   *
   * @param {any} [options]
   * [optional] An object `{ addr : int=0x300000, sectors : int=256, format : bool=false }`
   * addr : start address in flash
   * sectors: number of sectors to use
   * format:  Format the media
   * @returns {boolean} True on success, or false on failure
   * @url http://www.espruino.com/Reference#l_E_flashFatFS
   */
  static flashFatFS(options?: any): boolean;

  /**
   * Display a menu on the screen, and set up the buttons to navigate through it.
   * Supply an object containing menu items. When an item is selected, the function
   * it references will be executed. For example:
   * ```
   * var boolean = false;
   * var number = 50;
   * // First menu
   * var mainmenu = {
   *   "" : { title : "-- Main Menu --" }, // options
   *   "LED On" : function() { LED1.set(); },
   *   "LED Off" : function() { LED1.reset(); },
   *   "Submenu" : function() { E.showMenu(submenu); },
   *   "A Boolean" : {
   *     value : boolean,
   *     format : v => v?"On":"Off",
   *     onchange : v => { boolean=v; }
   *   },
   *   "A Number" : {
   *     value : number,
   *     min:0,max:100,step:10,
   *     onchange : v => { number=v; }
   *   },
   *   "Exit" : function() { E.showMenu(); }, // remove the menu
   * };
   * // Submenu
   * var submenu = {
   *   "" : { title : "-- SubMenu --",
   *          back : function() { E.showMenu(mainmenu); } },
   *   "One" : undefined, // do nothing
   *   "Two" : undefined // do nothing
   * };
   * // Actually display the menu
   * E.showMenu(mainmenu);
   * ```
   * The menu will stay onscreen and active until explicitly removed, which you can
   * do by calling `E.showMenu()` without arguments.
   * See http://www.espruino.com/graphical_menu for more detailed information.
   * On Bangle.js there are a few additions over the standard `graphical_menu`:
   * * The options object can contain:
   *   * `back : function() { }` - add a 'back' button, with the function called when
   *     it is pressed
   *   * `remove : function() { }` - add a handler function to be called when the
   *     menu is removed
   *   * (Bangle.js 2) `scroll : int` - an integer specifying how much the initial
   *     menu should be scrolled by
   * * The object returned by `E.showMenu` contains:
   *   * (Bangle.js 2) `scroller` - the object returned by `E.showScroller` -
   *     `scroller.scroll` returns the amount the menu is currently scrolled by
   * * In the object specified for editable numbers:
   *   * (Bangle.js 2) the `format` function is called with `format(value)` in the
   *     main menu, `format(value,1)` when in a scrollable list, or `format(value,2)`
   *     when in a popup window.
   * You can also specify menu items as an array (rather than an Object). This can be
   * useful if you have menu items with the same title, or you want to `push` menu
   * items onto an array:
   * ```
   * var menu = [
   *   { title:"Something", onchange:function() { print("selected"); } },
   *   { title:"On or Off", value:false, onchange: v => print(v) },
   *   { title:"A Value", value:3, min:0, max:10, onchange: v => print(v) },
   * ];
   * menu[""] = { title:"Hello" };
   * E.showMenu(menu);
   * ```
   *
   * @param {any} menu - An object containing name->function mappings to to be used in a menu
   * @returns {any} A menu object with `draw`, `move` and `select` functions
   * @url http://www.espruino.com/Reference#l_E_showMenu
   */
  static showMenu(menu: Menu): MenuInstance;
  static showMenu(): void;

  /**
   * A utility function for displaying a full screen message on the screen.
   * Draws to the screen and returns immediately.
   * ```
   * E.showMessage("These are\nLots of\nLines","My Title")
   * ```
   * or to display an image as well as text:
   * ```
   * E.showMessage("Lots of text will wrap automatically",{
   *   title:"Warning",
   *   img:atob("FBQBAfgAf+Af/4P//D+fx/n+f5/v+f//n//5//+f//n////3//5/n+P//D//wf/4B/4AH4A=")
   * })
   * ```
   *
   * @param {any} message - A message to display. Can include newlines
   * @param {any} [options] - [optional] a title for the message, or an object of options `{title:string, img:image_string}`
   * @url http://www.espruino.com/Reference#l_E_showMessage
   */
  static showMessage(message: string, title?: string | { title?: string, img?: string }): void;

  /**
   * Displays a full screen prompt on the screen, with the buttons requested (or
   * `Yes` and `No` for defaults).
   * When the button is pressed the promise is resolved with the requested values
   * (for the `Yes` and `No` defaults, `true` and `false` are returned).
   * ```
   * E.showPrompt("Do you like fish?").then(function(v) {
   *   if (v) print("'Yes' chosen");
   *   else print("'No' chosen");
   * });
   * // Or
   * E.showPrompt("How many fish\ndo you like?",{
   *   title:"Fish",
   *   buttons : {"One":1,"Two":2,"Three":3}
   * }).then(function(v) {
   *   print("You like "+v+" fish");
   * });
   * // Or
   * E.showPrompt("Continue?", {
   *   title:"Alert",
   *   img:atob("FBQBAfgAf+Af/4P//D+fx/n+f5/v+f//n//5//+f//n////3//5/n+P//D//wf/4B/4AH4A=")}).then(function(v) {
   *   if (v) print("'Yes' chosen");
   *   else print("'No' chosen");
   * });
   * ```
   * To remove the prompt, call `E.showPrompt()` with no arguments.
   * The second `options` argument can contain:
   * ```
   * {
   *   title: "Hello",                       // optional Title
   *   buttons : {"Ok":true,"Cancel":false}, // optional list of button text & return value
   *   img: "image_string"                   // optional image string to draw
   *   remove: function() { }                // Bangle.js: optional function to be called when the prompt is removed
   * }
   * ```
   *
   * @param {any} message - A message to display. Can include newlines
   * @param {any} [options] - [optional] an object of options (see below)
   * @returns {any} A promise that is resolved when 'Ok' is pressed
   * @url http://www.espruino.com/Reference#l_E_showPrompt
   */
  static showPrompt<T = boolean>(message: string, options?: { title?: string, buttons?: { [key: string]: T }, image?: string, remove?: () => void }): Promise<T>;
  static showPrompt(): void;

  /**
   * Display a scrollable menu on the screen, and set up the buttons/touchscreen to
   * navigate through it and select items.
   * Supply an object containing:
   * ```
   * {
   *   h : 24, // height of each menu item in pixels
   *   c : 10, // number of menu items
   *   // a function to draw a menu item
   *   draw : function(idx, rect) { ... }
   *   // a function to call when the item is selected, touch parameter is only relevant
   *   // for Bangle.js 2 and contains the coordinates touched inside the selected item
   *   select : function(idx, touch) { ... }
   *   // optional function to be called when 'back' is tapped
   *   back : function() { ...}
   *   // Bangle.js: optional function to be called when the scroller should be removed
   *   remove : function() {}
   * }
   * ```
   * For example to display a list of numbers:
   * ```
   * E.showScroller({
   *   h : 40, c : 8,
   *   draw : (idx, r) => {
   *     g.setBgColor((idx&1)?"#666":"#999").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
   *     g.setFont("6x8:2").drawString("Item Number\n"+idx,r.x+10,r.y+4);
   *   },
   *   select : (idx) => console.log("You selected ", idx)
   * });
   * ```
   * To remove the scroller, just call `E.showScroller()`
   *
   * @param {any} options - An object containing `{ h, c, draw, select, back, remove }` (see below)
   * @returns {any} A menu object with `draw()` and `drawItem(itemNo)` functions
   * @url http://www.espruino.com/Reference#l_E_showScroller
   */
  static showScroller(options?: { h: number, c: number, draw: (idx: number, rect: { x: number, y: number, w: number, h: number }) => void, select: (idx: number, touch?: {x: number, y: number}) => void, back?: () => void, remove?: () => void }): { draw: () => void, drawItem: (itemNo: number) => void };
  static showScroller(): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_showMenu
   */
  static showMenu(): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_showMenu
   */
  static showMenu(): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_showPrompt
   */
  static showPrompt(): void;

  /**
   * @url http://www.espruino.com/Reference#l_E_showScroller
   */
  static showScroller(): void;

  /**
   * Displays a full screen prompt on the screen, with a single 'Ok' button.
   * When the button is pressed the promise is resolved.
   * ```
   * E.showAlert("Hello").then(function() {
   *   print("Ok pressed");
   * });
   * // or
   * E.showAlert("These are\nLots of\nLines","My Title").then(function() {
   *   print("Ok pressed");
   * });
   * ```
   * To remove the window, call `E.showAlert()` with no arguments.
   *
   * @param {any} message - A message to display. Can include newlines
   * @param {any} [options] - [optional] a title for the message or an object containing options
   * @returns {any} A promise that is resolved when 'Ok' is pressed
   * @url http://www.espruino.com/Reference#l_E_showAlert
   */
  static showAlert(message?: string, options?: string): Promise<void>;
  static showAlert(message?: string, options?: { title?: string, remove?: () => void }): Promise<void>;

  /**
   * Called when a notification arrives on an Apple iOS device Bangle.js is connected
   * to
   * ```
   * {
   * event:"add",
   * uid:42,
   * category:4,
   * categoryCnt:42,
   * silent:true,
   * important:false,
   * preExisting:true,
   * positive:false,
   * negative:true
   * }
   * ```
   * You can then get more information with `NRF.ancsGetNotificationInfo`, for instance:
   * ```
   * E.on('ANCS', event => {
   *   NRF.ancsGetNotificationInfo( event.uid ).then(a=>print("Notify",E.toJS(a)));
   * });
   * ```
   * @param {string} event - The event to listen to.
   * @param {(info: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `info` An object (see below)
   * @url http://www.espruino.com/Reference#l_E_ANCS
   */
  static on(event: "ANCS", callback: (info: any) => void): void;

  /**
   * Called when a media event arrives on an Apple iOS device Bangle.js is connected
   * to
   * ```
   * {
   * id : "artist"/"album"/"title"/"duration",
   * value : "Some text",
   * truncated : bool // the 'value' was too big to be sent completely
   * }
   * ```
   * @param {string} event - The event to listen to.
   * @param {(info: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `info` An object (see below)
   * @url http://www.espruino.com/Reference#l_E_AMS
   */
  static on(event: "AMS", callback: (info: any) => void): void;

  /**
   * This event is called right after the board starts up, and has a similar effect
   * to creating a function called `onInit`.
   * For example to write `"Hello World"` every time Espruino starts, use:
   * ```
   * E.on('init', function() {
   *   console.log("Hello World!");
   * });
   * ```
   * **Note:** that subsequent calls to `E.on('init', ` will **add** a new handler,
   * rather than replacing the last one. This allows you to write modular code -
   * something that was not possible with `onInit`.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_E_init
   */
  static on(event: "init", callback: () => void): void;

  /**
   * This event is called just before the device shuts down for commands such as
   * `reset()`, `load()`, `save()`, `E.reboot()` or `Bangle.off()`
   * For example to write `"Bye!"` just before shutting down use:
   * ```
   * E.on('kill', function() {
   *   console.log("Bye!");
   * });
   * ```
   * **NOTE:** This event is not called when the device is 'hard reset' - for example
   * by removing power, hitting an actual reset button, or via a Watchdog timer
   * reset.
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_E_kill
   */
  static on(event: "kill", callback: () => void): void;

  /**
   * This event is called when an error is created by Espruino itself (rather than JS
   * code) which changes the state of the error flags reported by `E.getErrorFlags()`
   * This could be low memory, full buffers, UART overflow, etc. `E.getErrorFlags()`
   * has a full description of each type of error.
   * This event will only be emitted when error flag is set. If the error flag was
   * already set nothing will be emitted. To clear error flags so that you do get a
   * callback each time a flag is set, call `E.getErrorFlags()`.
   * @param {string} event - The event to listen to.
   * @param {(errorFlags: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `errorFlags` An array of new error flags, as would be returned by `E.getErrorFlags()`. Error flags that were present before won't be reported.
   * @url http://www.espruino.com/Reference#l_E_errorFlag
   */
  static on(event: "errorFlag", callback: (errorFlags: ErrorFlag[]) => void): void;

  /**
   * This event is called when a full touchscreen device on an Espruino is interacted
   * with.
   * **Note:** This event is not implemented on Bangle.js because it only has a two
   * area touchscreen.
   * To use the touchscreen to draw lines, you could do:
   * ```
   * var last;
   * E.on('touch',t=>{
   *   if (last) g.lineTo(t.x, t.y);
   *   else g.moveTo(t.x, t.y);
   *   last = t.b;
   * });
   * ```
   * @param {string} event - The event to listen to.
   * @param {(x: number, y: number, b: number) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `x` X coordinate in display coordinates
   * * `y` Y coordinate in display coordinates
   * * `b` Touch count - 0 for released, 1 for pressed
   * @url http://www.espruino.com/Reference#l_E_touch
   */
  static on(event: "touch", callback: (x: number, y: number, b: number) => void): void;

  /**
   * Use the microcontroller's internal thermistor to work out the temperature.
   * On Puck.js v2.0 this will use the on-board PCT2075TP temperature sensor, but on
   * other devices it may not be desperately well calibrated.
   * While this is implemented on Espruino boards, it may not be implemented on other
   * devices. If so it'll return NaN.
   *  **Note:** This is not entirely accurate and varies by a few degrees from chip
   *  to chip. It measures the **die temperature**, so when connected to USB it could
   *  be reading 10 over degrees C above ambient temperature. When running from
   *  battery with `setDeepSleep(true)` it is much more accurate though.
   * @returns {number} The temperature in degrees C
   * @url http://www.espruino.com/Reference#l_E_getTemperature
   */
  static getTemperature(): number;

  /**
   * Check the internal voltage reference. To work out an actual voltage of an input
   * pin, you can use `analogRead(pin)*E.getAnalogVRef()`
   *  **Note:** This value is calculated by reading the voltage on an internal
   * voltage reference with the ADC. It will be slightly noisy, so if you need this
   * for accurate measurements we'd recommend that you call this function several
   * times and average the results.
   * While this is implemented on Espruino boards, it may not be implemented on other
   * devices. If so it'll return NaN.
   * @returns {number} The voltage (in Volts) that a reading of 1 from `analogRead` actually represents - usually around 3.3v
   * @url http://www.espruino.com/Reference#l_E_getAnalogVRef
   */
  static getAnalogVRef(): number;

  /**
   * ADVANCED: It's very easy to crash Espruino using this function if
   * you get the code/arguments you supply wrong!
   * Create a native function that executes the code at the given address, e.g.
   * `E.nativeCall(0x08012345,'double (double,double)')(1.1, 2.2)`
   * If you're executing a thumb function, you'll almost certainly need to set the
   * bottom bit of the address to 1.
   * Note it's not guaranteed that the call signature you provide can be used - there
   * are limits on the number of arguments allowed (5).
   * When supplying `data`, if it is a 'flat string' then it will be used directly,
   * otherwise it'll be converted to a flat string and used.
   * The argument types in `sig` are:
   * * `void` - returns nothing
   * * `bool` -  boolean value
   * * `int` - 32 bit integer
   * * `double` - 64 bit floating point
   * * `float` - 32 bit floating point (2v21 and later)
   * * `Pin` - Espruino 'pin' value (8 bit integer)
   * * `JsVar` - Pointer to an Espruino JsVar structure
   *
   * @param {number} addr - The address in memory of the function (or offset in `data` if it was supplied
   * @param {any} sig - The signature of the call, `returnType (arg1,arg2,...)`. Allowed types are `void`,`bool`,`int`,`double`,`float`,`Pin`,`JsVar`
   * @param {any} data - (Optional) A string containing the function itself. If not supplied then 'addr' is used as an absolute address.
   * @returns {any} The native function
   * @url http://www.espruino.com/Reference#l_E_nativeCall
   */
  static nativeCall(addr: number, sig: string, data?: string): any;

  /**
   * Clip a number to be between min and max (inclusive)
   *
   * @param {number} x - A floating point value to clip
   * @param {number} min - The smallest the value should be
   * @param {number} max - The largest the value should be
   * @returns {number} The value of x, clipped so as not to be below min or above max.
   * @url http://www.espruino.com/Reference#l_E_clip
   */
  static clip(x: number, min: number, max: number): number;

  /**
   * Sum the contents of the given Array, String or ArrayBuffer and return the result
   *
   * @param {any} arr - The array to sum
   * @returns {number} The sum of the given buffer
   * @url http://www.espruino.com/Reference#l_E_sum
   */
  static sum(arr: string | number[] | ArrayBuffer): number;

  /**
   * Work out the variance of the contents of the given Array, String or ArrayBuffer
   * and return the result. This is equivalent to `v=0;for (i in arr)
   * v+=Math.pow(mean-arr[i],2)`
   *
   * @param {any} arr - The array to work out the variance for
   * @param {number} mean - The mean value of the array
   * @returns {number} The variance of the given buffer
   * @url http://www.espruino.com/Reference#l_E_variance
   */
  static variance(arr: string | number[] | ArrayBuffer, mean: number): number;

  /**
   * Convolve arr1 with arr2. This is equivalent to `v=0;for (i in arr1) v+=arr1[i] *
   * arr2[(i+offset) % arr2.length]`
   *
   * @param {any} arr1 - An array to convolve
   * @param {any} arr2 - An array to convolve
   * @param {number} offset - The mean value of the array
   * @returns {number} The variance of the given buffer
   * @url http://www.espruino.com/Reference#l_E_convolve
   */
  static convolve(arr1: string | number[] | ArrayBuffer, arr2: string | number[] | ArrayBuffer, offset: number): number;

  /**
   * Performs a Fast Fourier Transform (FFT) in 32 bit floats on the supplied data
   * and writes it back into the original arrays. Note that if only one array is
   * supplied, the data written back is the modulus of the complex result
   * `sqrt(r*r+i*i)`.
   * In order to perform the FFT, there has to be enough room on the stack to
   * allocate two arrays of 32 bit floating point numbers - this will limit the
   * maximum size of FFT possible to around 1024 items on most platforms.
   * **Note:** on the Original Espruino board, FFTs are performed in 64bit arithmetic
   * as there isn't space to include the 32 bit maths routines (2x more RAM is
   * required).
   *
   * @param {any} arrReal - An array of real values
   * @param {any} arrImage - An array of imaginary values (or if undefined, all values will be taken to be 0)
   * @param {boolean} inverse - Set this to true if you want an inverse FFT - otherwise leave as 0
   * @url http://www.espruino.com/Reference#l_E_FFT
   */
  static FFT(arrReal: string | number[] | ArrayBuffer, arrImage?: string | number[] | ArrayBuffer, inverse?: boolean): any;

  /**
   * Enable the watchdog timer. This will reset Espruino if it isn't able to return
   * to the idle loop within the timeout.
   * If `isAuto` is false, you must call `E.kickWatchdog()` yourself every so often
   * or the chip will reset.
   * ```
   * E.enableWatchdog(0.5); // automatic mode
   * while(1); // Espruino will reboot because it has not been idle for 0.5 sec
   * ```
   * ```
   * E.enableWatchdog(1, false);
   * setInterval(function() {
   *   if (everything_ok)
   *     E.kickWatchdog();
   * }, 500);
   * // Espruino will now reset if everything_ok is false,
   * // or if the interval fails to be called
   * ```
   * **NOTE:** This is only implemented on STM32, nRF5x and ESP32 devices (all official
   * Espruino boards).
   * **NOTE:** On STM32 (Pico, WiFi, Original) with `setDeepSleep(1)` you need to
   * explicitly wake Espruino up with an interval of less than the watchdog timeout
   * or the watchdog will fire and the board will reboot. You can do this with
   * `setInterval("", time_in_milliseconds)`.
   * **NOTE:** On ESP32, the timeout will be rounded to the nearest second.
   *
   * @param {number} timeout - The timeout in seconds before a watchdog reset
   * @param {any} isAuto - If undefined or true, the watchdog is kicked automatically. If not, you must call `E.kickWatchdog()` yourself
   * @url http://www.espruino.com/Reference#l_E_enableWatchdog
   */
  static enableWatchdog(timeout: number, isAuto?: boolean): void;

  /**
   * Kicks a Watchdog timer set up with `E.enableWatchdog(..., false)`. See
   * `E.enableWatchdog` for more information.
   * **NOTE:** This is only implemented on STM32 and nRF5x devices (all official
   * Espruino boards).
   * @url http://www.espruino.com/Reference#l_E_kickWatchdog
   */
  static kickWatchdog(): void;

  /**
   * Get and reset the error flags. Returns an array that can contain:
   * `'FIFO_FULL'`: The receive FIFO filled up and data was lost. This could be state
   * transitions for setWatch, or received characters.
   * `'BUFFER_FULL'`: A buffer for a stream filled up and characters were lost. This
   * can happen to any stream - Serial,HTTP,etc.
   * `'CALLBACK'`: A callback (`setWatch`, `setInterval`, `on('data',...)`) caused an
   * error and so was removed.
   * `'LOW_MEMORY'`: Memory is running low - Espruino had to run a garbage collection
   * pass or remove some of the command history
   * `'MEMORY'`: Espruino ran out of memory and was unable to allocate some data that
   * it needed.
   * `'UART_OVERFLOW'` : A UART received data but it was not read in time and was
   * lost
   * @returns {any} An array of error flags
   * @url http://www.espruino.com/Reference#l_E_getErrorFlags
   */
  static getErrorFlags(): ErrorFlag[]

  /**
   * Get Espruino's interpreter flags that control the way it handles your JavaScript
   * code.
   * * `deepSleep` - Allow deep sleep modes (also set by setDeepSleep)
   * * `pretokenise` - When adding functions, pre-minify them and tokenise reserved
   *   words
   * * `unsafeFlash` - Some platforms stop writes/erases to interpreter memory to
   *   stop you bricking the device accidentally - this removes that protection
   * * `unsyncFiles` - When writing files, *don't* flush all data to the SD card
   *   after each command (the default is *to* flush). This is much faster, but can
   *   cause filesystem damage if power is lost without the filesystem unmounted.
   * @returns {any} An object containing flag names and their values
   * @url http://www.espruino.com/Reference#l_E_getFlags
   */
  static getFlags(): { [key in Flag]: boolean }

  /**
   * Set the Espruino interpreter flags that control the way it handles your
   * JavaScript code.
   * Run `E.getFlags()` and check its description for a list of available flags and
   * their values.
   *
   * @param {any} flags - An object containing flag names and boolean values. You need only specify the flags that you want to change.
   * @url http://www.espruino.com/Reference#l_E_setFlags
   */
  static setFlags(flags: { [key in Flag]?: boolean }): void

  /**
   * Pipe one stream to another.
   * This can be given any object with a `read` method as a source, and any object with a `.write(data)` method as a destination.
   * Data will be piped from `source` to `destination` in the idle loop until `source.read(...)` returns `undefined`.
   * For instance:
   * ```
   * // Print a really big string to the console, 1 character at a time and write 'Finished!' at the end
   * E.pipe("This is a really big String",
   *        {write: print},
   *        {chunkSize:1, complete:()=>print("Finished!")});
   * // Pipe the numbers 1 to 100 to a StorageFile in Storage
   * E.pipe({ n:0, read : function() { if (this.n<100) return (this.n++)+"\n"; }},
   *        require("Storage").open("testfile","w"));
   * // Pipe a StorageFile straight to the Bluetooth UART
   * E.pipe(require("Storage").open("testfile","r"), Bluetooth);
   * // Pipe a normal file in Storage (not StorageFile) straight to the Bluetooth UART
   * E.pipe(require("Storage").read("blob.txt"), Bluetooth);
   * // Pipe a normal file in Storage as a response to an HTTP request
   * function onPageRequest(req, res) {
   *   res.writeHead(200, {'Content-Type': 'text/plain'});
   *   E.pipe(require("Storage").read("webpage.txt"), res);
   * }
   * require("http").createServer(onPageRequest).listen(80);
   * ```
   *
   * @param {any} source - The source file/stream that will send content. As of 2v19 this can also be a `String`
   * @param {any} destination - The destination file/stream that will receive content from the source.
   * @param {any} [options]
   * [optional] An object `{ chunkSize : int=64, end : bool=true, complete : function }`
   * chunkSize : The amount of data to pipe from source to destination at a time
   * complete : a function to call when the pipe activity is complete
   * end : call the 'end' function on the destination when the source is finished
   * @url http://www.espruino.com/Reference#l_E_pipe
   */
  static pipe(source: any, destination: any, options?: PipeOptions): void

  /**
   * Create an ArrayBuffer from the given string. This is done via a reference, not a
   * copy - so it is very fast and memory efficient.
   * Note that this is an ArrayBuffer, not a Uint8Array. To get one of those, do:
   * `new Uint8Array(E.toArrayBuffer('....'))`.
   *
   * @param {any} str - The string to convert to an ArrayBuffer
   * @returns {any} An ArrayBuffer that uses the given string
   * @url http://www.espruino.com/Reference#l_E_toArrayBuffer
   */
  static toArrayBuffer(str: string): ArrayBuffer;

  /**
   * Returns a `String` representing the data in the arguments.
   * This creates a string from the given arguments in the same way as `E.toUint8Array`. If each argument is:
   * * A String or an Array, each element is traversed and added as an 8 bit character
   * * `{data : ..., count : N}` causes `data` to be repeated `count` times
   * * `{callback : fn}` calls the function and adds the result
   * * Anything else is converted to a character directly.
   * In the case where there's one argument which is an 8 bit typed array backed by a
   * flat string of the same length, the backing string will be returned without
   * doing a copy or other allocation. The same applies if there's a single argument
   * which is itself a flat string.
   * ```JS
   * E.toString(0,1,2,"Hi",3)
   * "\0\1\2Hi\3"
   * E.toString(1,2,{data:[3,4], count:4},5,6)
   * "\1\2\3\4\3\4\3\4\3\4\5\6"
   * >E.toString(1,2,{callback : () => "Hello World"},5,6)
   * ="\1\2Hello World\5\6"
   * ```
   * **Note:** Prior to Espruino 2v18 `E.toString` would always return a flat string,
   * or would return `undefined` if one couldn't be allocated. Now, it will return
   * a normal (fragmented) String if a contiguous chunk of memory cannot be allocated.
   * You can still check if the returned value is a Flat string using `E.getAddressOf(str, true)!=0`,
   * or can use `E.toFlatString` instead.
   *
   * @param {any} args - The arguments to convert to a String
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_E_toString
   */
  static toString(...args: any[]): string;

  /**
   * Returns a Flat `String` representing the data in the arguments, or `undefined` if one can't be allocated.
   * This provides the same behaviour that `E.toString` had in Espruino before 2v18 - see `E.toString` for
   * more information.
   *
   * @param {any} args - The arguments to convert to a Flat String
   * @returns {any} A Flat String (or undefined)
   * @url http://www.espruino.com/Reference#l_E_toFlatString
   */
  static toFlatString(...args: any[]): string | undefined;

  /**
   * By default, strings in Espruino are standard 8 bit binary strings
   * unless they contain Unicode chars or a `\u####` escape code
   * that doesn't map to the range 0..255.
   * However calling E.asUTF8 will convert one of those strings to
   * UTF8.
   * ```
   * var s = String.fromCharCode(0xF0,0x9F,0x8D,0x94);
   * var u = E.asUTF8(s);
   * s.length // 4
   * s[0] // "\xF0"
   * u.length // 1
   * u[0] // hamburger emoji
   * ```
   * **NOTE:** UTF8 is currently only available on Bangle.js devices
   *
   * @param {any} str - The string to turn into a UTF8 Unicode String
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_E_asUTF8
   */
  static asUTF8(str: any): string;

  /**
   * Given a UTF8 String (see `E.asUTF8`) this returns the underlying representation
   * of that String.
   * ```
   * E.fromUTF8("\u03C0") == "\xCF\x80"
   * ```
   * **NOTE:** UTF8 is currently only available on Bangle.js devices
   *
   * @param {any} str - The string to check
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_E_fromUTF8
   */
  static fromUTF8(str: any): string;

  /**
   * By default, strings in Espruino are standard 8 bit binary strings
   * unless they contain Unicode chars or a `\u####` escape code
   * that doesn't map to the range 0..255.
   * This checks if a String is being treated by Espruino as a UTF8 String
   * See `E.asUTF8` to convert to a UTF8 String
   * **NOTE:** UTF8 is currently only available on Bangle.js devices
   *
   * @param {any} str - The string to check
   * @returns {boolean} True if the given String is treated as UTF8 by Espruino
   * @url http://www.espruino.com/Reference#l_E_isUTF8
   */
  static isUTF8(str: any): boolean;

  /**
   * This creates a Uint8Array from the given arguments. These are handled as
   * follows:
   *  * `Number` -> read as an integer, using the lowest 8 bits
   *  * `String` -> use each character's numeric value (e.g.
   *    `String.charCodeAt(...)`)
   *  * `Array` -> Call itself on each element
   *  * `ArrayBuffer` or Typed Array -> use the lowest 8 bits of each element
   *  * `Object`:
   *    * `{data:..., count: int}` -> call itself `object.count` times, on
   *      `object.data`
   *    * `{callback : function}` -> call the given function, call itself on return
   *      value
   * For example:
   * ```
   * E.toUint8Array([1,2,3])
   * =new Uint8Array([1, 2, 3])
   * E.toUint8Array([1,{data:2,count:3},3])
   * =new Uint8Array([1, 2, 2, 2, 3])
   * E.toUint8Array("Hello")
   * =new Uint8Array([72, 101, 108, 108, 111])
   * E.toUint8Array(["hi",{callback:function() { return [1,2,3] }}])
   * =new Uint8Array([104, 105, 1, 2, 3])
   * ```
   *
   * @param {any} args - The arguments to convert to a Uint8Array
   * @returns {any} A Uint8Array
   * @url http://www.espruino.com/Reference#l_E_toUint8Array
   */
  static toUint8Array(...args: Uint8ArrayResolvable[]): Uint8Array;

  /**
   * This performs the same basic function as `JSON.stringify`, however
   * `JSON.stringify` adds extra characters to conform to the JSON spec which aren't
   * required if outputting JS.
   * `E.toJS` will also stringify JS functions, whereas `JSON.stringify` ignores
   * them.
   * For example:
   * * `JSON.stringify({a:1,b:2}) == '{"a":1,"b":2}'`
   * * `E.toJS({a:1,b:2}) == '{a:1,b:2}'`
   * **Note:** Strings generated with `E.toJS` can't be reliably parsed by
   * `JSON.parse` - however they are valid JS so will work with `eval` (but this has
   * security implications if you don't trust the source of the string).
   * On the desktop [JSON5 parsers](https://github.com/json5/json5) will parse the
   * strings produced by `E.toJS` without trouble.
   *
   * @param {any} arg - The JS variable to convert to a string
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_E_toJS
   */
  static toJS(arg: any): string;

  /**
   * This creates and returns a special type of string, which references a
   * specific address in memory. It can be used in order to use sections of
   * Flash memory directly in Espruino (for example `Storage` uses it
   * to allow files to be read directly from Flash).
   * **Note:** As of 2v21, Calling `E.memoryArea` with an address of 0 will return `undefined`
   *
   * @param {number} addr - The address of the memory area
   * @param {number} len - The length (in bytes) of the memory area
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_E_memoryArea
   */
  static memoryArea(addr: number, len: number): string;

  /**
   * This writes JavaScript code into Espruino's flash memory, to be executed on
   * startup. It differs from `save()` in that `save()` saves the whole state of the
   * interpreter, whereas this just saves JS code that is executed at boot.
   * Code will be executed before `onInit()` and `E.on('init', ...)`.
   * If `alwaysExec` is `true`, the code will be executed even after a call to
   * `reset()`. This is useful if you're making something that you want to program,
   * but you want some code that is always built in (for instance setting up a
   * display or keyboard).
   * To remove boot code that has been saved previously, use `E.setBootCode("")`
   * **Note:** this removes any code that was previously saved with `save()`
   *
   * @param {any} code - The code to execute (as a string)
   * @param {boolean} alwaysExec - Whether to always execute the code (even after a reset)
   * @url http://www.espruino.com/Reference#l_E_setBootCode
   */
  static setBootCode(code: string, alwaysExec?: boolean): void;

  /**
   * This sets the clock frequency of Espruino's processor. It will return `0` if it
   * is unimplemented or the clock speed cannot be changed.
   * **Note:** On pretty much all boards, UART, SPI, I2C, PWM, etc will change
   * frequency and will need setting up again in order to work.
   * ### STM32F4
   * Options is of the form `{ M: int, N: int, P: int, Q: int }` - see the 'Clocks'
   * section of the microcontroller's reference manual for what these mean.
   * * System clock = 8Mhz * N / ( M * P )
   * * USB clock (should be 48Mhz) = 8Mhz * N / ( M * Q )
   * Optional arguments are:
   * * `latency` - flash latency from 0..15
   * * `PCLK1` - Peripheral clock 1 divisor (default: 2)
   * * `PCLK2` - Peripheral clock 2 divisor (default: 4)
   * The Pico's default is `{M:8, N:336, P:4, Q:7, PCLK1:2, PCLK2:4}`, use `{M:8,
   * N:336, P:8, Q:7, PCLK:1, PCLK2:2}` to halve the system clock speed while keeping
   * the peripherals running at the same speed (omitting PCLK1/2 will lead to the
   * peripherals changing speed too).
   * On STM32F4 boards (e.g. Espruino Pico), the USB clock needs to be kept at 48Mhz
   * or USB will fail to work. You'll also experience USB instability if the
   * processor clock falls much below 48Mhz.
   * ### ESP8266
   * Just specify an integer value, either 80 or 160 (for 80 or 160Mhz)
   *
   * @param {any} options - Platform-specific options for setting clock speed
   * @returns {number} The actual frequency the clock has been set to
   * @url http://www.espruino.com/Reference#l_E_setClock
   */
  static setClock(options: number | { M: number, N: number, P: number, Q: number, latency?: number, PCLK?: number, PCLK2?: number }): number;

  /**
   * Changes the device that the JS console (otherwise known as the REPL) is attached
   * to. If the console is on a device, that device can be used for programming
   * Espruino.
   * Rather than calling `Serial.setConsole` you can call
   * `E.setConsole("DeviceName")`.
   * This is particularly useful if you just want to remove the console.
   * `E.setConsole(null)` will make the console completely inaccessible.
   * `device` may be `"Serial1"`,`"USB"`,`"Bluetooth"`,`"Telnet"`,`"Terminal"`, any
   * other *hardware* `Serial` device, or `null` to disable the console completely.
   * `options` is of the form:
   * ```
   * {
   *   force : bool // default false, force the console onto this device so it does not move
   *                //   if false, changes in connection state (e.g. USB/Bluetooth) can move
   *                //   the console automatically.
   * }
   * ```
   *
   * @param {any} device
   * @param {any} [options] - [optional] object of options, see below
   * @url http://www.espruino.com/Reference#l_E_setConsole
   */
  static setConsole(device: "Serial1" | "USB" | "Bluetooth" | "Telnet" | "Terminal" | Serial | null, options?: { force?: boolean }): void;

  /**
   * Returns the current console device - see `E.setConsole` for more information.
   * @returns {any} The current console device as a string, or just `null` if the console is null
   * @url http://www.espruino.com/Reference#l_E_getConsole
   */
  static getConsole(): string | null

  /**
   * Reverse the 8 bits in a byte, swapping MSB and LSB.
   * For example, `E.reverseByte(0b10010000) == 0b00001001`.
   * Note that you can reverse all the bytes in an array with: `arr =
   * arr.map(E.reverseByte)`
   *
   * @param {number} x - A byte value to reverse the bits of
   * @returns {number} The byte with reversed bits
   * @url http://www.espruino.com/Reference#l_E_reverseByte
   */
  static reverseByte(x: number): number;

  /**
   * Output the current list of Utility Timer Tasks - for debugging only
   * @url http://www.espruino.com/Reference#l_E_dumpTimers
   */
  static dumpTimers(): void;

  /**
   * Dump any locked variables that aren't referenced from `global` - for debugging
   * memory leaks only.
   * **Note:** This does a linear scan over memory, finding variables
   * that are currently locked. In some cases it may show variables
   * like `Unknown 66` which happen when *part* of a string has ended
   * up placed in memory ahead of the String that it's part of. See https://github.com/espruino/Espruino/issues/2345
   * @url http://www.espruino.com/Reference#l_E_dumpLockedVars
   */
  static dumpLockedVars(): void;

  /**
   * Dump any locked variables that aren't referenced from `global` - for debugging
   * memory leaks only.
   * @url http://www.espruino.com/Reference#l_E_dumpFreeList
   */
  static dumpFreeList(): void;

  /**
   * Show fragmentation.
   * * ` ` is free space
   * * `#` is a normal variable
   * * `L` is a locked variable (address used, cannot be moved)
   * * `=` represents data in a Flat String (must be contiguous)
   * @url http://www.espruino.com/Reference#l_E_dumpFragmentation
   */
  static dumpFragmentation(): void;

  /**
   * Dumps a comma-separated list of all allocated variables along with the variables
   * they link to. Can be used to visualise where memory is used.
   * @url http://www.espruino.com/Reference#l_E_dumpVariables
   */
  static dumpVariables(): void;

  /**
   * BETA: defragment memory!
   * @url http://www.espruino.com/Reference#l_E_defrag
   */
  static defrag(): void;

  /**
   * Return the number of variable blocks used by the supplied variable. This is
   * useful if you're running out of memory and you want to be able to see what is
   * taking up most of the available space.
   * If `depth>0` and the variable can be recursed into, an array listing all
   * property names (including internal Espruino names) and their sizes is returned.
   * If `depth>1` there is also a `more` field that inspects the objects' children's
   * children.
   * For instance `E.getSizeOf(function(a,b) { })` returns `5`.
   * But `E.getSizeOf(function(a,b) { }, 1)` returns:
   * ```
   *  [
   *   {
   *     "name": "a",
   *     "size": 1 },
   *   {
   *     "name": "b",
   *     "size": 1 },
   *   {
   *     "name": "\xFFcod",
   *     "size": 2 }
   *  ]
   * ```
   * In this case setting depth to `2` will make no difference as there are no more
   * children to traverse.
   * See http://www.espruino.com/Internals for more information
   *
   * @param {any} v - A variable to get the size of
   * @param {number} depth - The depth that detail should be provided for. If depth<=0 or undefined, a single integer will be returned
   * @returns {any} Information about the variable size - see below
   * @url http://www.espruino.com/Reference#l_E_getSizeOf
   */
  static getSizeOf(v: any, depth?: 0): number;
  static getSizeOf(v: any, depth: number): VariableSizeInformation;

  /**
   * Return the address in memory of the given variable. This can then be used with
   * `peek` and `poke` functions. However, changing data in JS variables directly
   * (flatAddress=false) will most likely result in a crash.
   * This functions exists to allow embedded targets to set up peripherals such as
   * DMA so that they write directly to JS variables.
   * See http://www.espruino.com/Internals for more information
   *
   * @param {any} v - A variable to get the address of
   * @param {boolean} flatAddress - (boolean) If `true` and a Flat String or Flat ArrayBuffer is supplied, return the address of the data inside it - otherwise 0. If `false` (the default) return the address of the JsVar itself.
   * @returns {number} The address of the given variable
   * @url http://www.espruino.com/Reference#l_E_getAddressOf
   */
  static getAddressOf(v: any, flatAddress: boolean): number;

  /**
   * Take each element of the `from` array, look it up in `map` (or call
   * `map(value,index)` if it is a function), and write it into the corresponding
   * element in the `to` array.
   * You can use an array to map:
   * ```
   * var a = new Uint8Array([1,2,3,1,2,3]);
   * var lut = new Uint8Array([128,129,130,131]);
   * E.mapInPlace(a, a, lut);
   * // a = [129, 130, 131, 129, 130, 131]
   * ```
   * Or `undefined` to pass straight through, or a function to do a normal 'mapping':
   * ```
   * var a = new Uint8Array([0x12,0x34,0x56,0x78]);
   * var b = new Uint8Array(8);
   * E.mapInPlace(a, b, undefined); // straight through
   * // b = [0x12,0x34,0x56,0x78,0,0,0,0]
   * E.mapInPlace(a, b, (value,index)=>index); // write the index in the first 4 (because a.length==4)
   * // b = [0,1,2,3,4,0,0,0]
   * E.mapInPlace(a, b, undefined, 4); // 4 bits from 8 bit input -> 2x as many outputs, msb-first
   * // b = [1, 2, 3, 4, 5, 6, 7, 8]
   *  E.mapInPlace(a, b, undefined, -4); // 4 bits from 8 bit input -> 2x as many outputs, lsb-first
   * // b = [2, 1, 4, 3, 6, 5, 8, 7]
   * E.mapInPlace(a, b, a=>a+2, 4);
   * // b = [3, 4, 5, 6, 7, 8, 9, 10]
   * var b = new Uint16Array(4);
   * E.mapInPlace(a, b, undefined, 12); // 12 bits from 8 bit input, msb-first
   * // b = [0x123, 0x456, 0x780, 0]
   * E.mapInPlace(a, b, undefined, -12); // 12 bits from 8 bit input, lsb-first
   * // b = [0x412, 0x563, 0x078, 0]
   * ```
   *
   * @param {any} from - An ArrayBuffer to read elements from
   * @param {any} to - An ArrayBuffer to write elements too
   * @param {any} map - An array or `function(value,index)` to use to map one element to another, or `undefined` to provide no mapping
   * @param {number} bits - If specified, the number of bits per element (MSB first) - otherwise use a 1:1 mapping. If negative, use LSB first.
   * @url http://www.espruino.com/Reference#l_E_mapInPlace
   */
  static mapInPlace(from: ArrayBuffer, to: ArrayBuffer, map?: number[] | ((value: number, index: number) => number) | undefined, bits?: number): void;

  /**
   * Search in an Object, Array, or Function
   *
   * @param {any} haystack - The Array/Object/Function to search
   * @param {any} needle - The key to search for
   * @param {boolean} returnKey - If true, return the key, else return the value itself
   * @returns {any} The value in the Object matching 'needle', or if `returnKey==true` the key's name - or undefined
   * @url http://www.espruino.com/Reference#l_E_lookupNoCase
   */
  static lookupNoCase(haystack: any[] | object | Function, needle: string, returnKey?: false): any;
  static lookupNoCase<T>(haystack: any[] | object | Function, needle: T, returnKey: true): T | undefined;

  /**
   * Get the current interpreter state in a text form such that it can be copied to a
   * new device
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_E_dumpStr
   */
  static dumpStr(): string;

  /**
   * Set the seed for the random number generator used by `Math.random()`.
   *
   * @param {number} v - The 32 bit integer seed to use for the random number generator
   * @url http://www.espruino.com/Reference#l_E_srand
   */
  static srand(v: number): void;

  /**
   * Unlike 'Math.random()' which uses a pseudo-random number generator, this method
   * reads from the internal voltage reference several times, XOR-ing and rotating to
   * try and make a relatively random value from the noise in the signal.
   * @returns {number} A random number
   * @url http://www.espruino.com/Reference#l_E_hwRand
   */
  static hwRand(): number;

  /**
   * Perform a standard 32 bit CRC (Cyclic redundancy check) on the supplied data
   * (one byte at a time) and return the result as an unsigned integer.
   *
   * @param {any} data - Iterable data to perform CRC32 on (each element treated as a byte)
   * @returns {any} The CRC of the supplied data
   * @url http://www.espruino.com/Reference#l_E_CRC32
   */
  static CRC32(data: any): any;

  /**
   * Convert hue, saturation and brightness to red, green and blue (packed into an
   * integer if `asArray==false` or an array if `asArray==true`).
   * This replaces `Graphics.setColorHSB` and `Graphics.setBgColorHSB`. On devices
   * with 24 bit colour it can be used as: `Graphics.setColor(E.HSBtoRGB(h, s, b))`,
   * or on devices with 26 bit colour use `Graphics.setColor(E.HSBtoRGB(h, s, b, 16))`
   * You can quickly set RGB items in an Array or Typed Array using
   * `array.set(E.HSBtoRGB(h, s, b, true), offset)`, which can be useful with arrays
   * used with `require("neopixel").write`.
   *
   * @param {number} hue - The hue, as a value between 0 and 1
   * @param {number} sat - The saturation, as a value between 0 and 1
   * @param {number} bri - The brightness, as a value between 0 and 1
   * @param {number} format - If `true` or `1`, return an array of [R,G,B] values betwen 0 and 255. If `16`, return a 16 bit number. `undefined`/`24` is the same as normal (returning a 24 bit number)
   * @returns {any} A 24 bit number containing bytes representing red, green, and blue `0xBBGGRR`. Or if `asArray` is true, an array `[R,G,B]`
   * @url http://www.espruino.com/Reference#l_E_HSBtoRGB
   */
  static HSBtoRGB(hue: number, sat: number, bri: number, format?: false): number;
  static HSBtoRGB(hue: number, sat: number, bri: number, format: 16): number;
  static HSBtoRGB(hue: number, sat: number, bri: number, format: 24): number;
  static HSBtoRGB(hue: number, sat: number, bri: number, format: true): [number, number, number];

  /**
   * Set a password on the console (REPL). When powered on, Espruino will then demand
   * a password before the console can be used. If you want to lock the console
   * immediately after this you can call `E.lockConsole()`
   * To remove the password, call this function with no arguments.
   * **Note:** There is no protection against multiple password attempts, so someone
   * could conceivably try every password in a dictionary.
   * **Note:** This password is stored in memory in plain text. If someone is able to
   * execute arbitrary JavaScript code on the device (e.g., you use `eval` on input
   * from unknown sources) or read the device's firmware then they may be able to
   * obtain it.
   *
   * @param {any} password - The password - max 20 chars
   * @url http://www.espruino.com/Reference#l_E_setPassword
   */
  static setPassword(password: string): void;

  /**
   * If a password has been set with `E.setPassword()`, this will lock the console so
   * the password needs to be entered to unlock it.
   * @url http://www.espruino.com/Reference#l_E_lockConsole
   */
  static lockConsole(): void;

  /**
   * Set the time zone to be used with `Date` objects.
   * For example `E.setTimeZone(1)` will be GMT+0100
   * Time can be set with `setTime`.
   * **Note:** If daylight savings time rules have been set with `E.setDST()`,
   * calling `E.setTimeZone()` will remove them and move back to using a static
   * timezone that doesn't change based on the time of year.
   *
   * @param {number} zone - The time zone in hours
   * @url http://www.espruino.com/Reference#l_E_setTimeZone
   */
  static setTimeZone(zone: number): void;

  /**
   * Set the daylight savings time parameters to be used with `Date` objects.
   * The parameters are
   * - dstOffset: The number of minutes daylight savings time adds to the clock
   *   (usually 60) - set to 0 to disable DST
   * - timezone: The time zone, in minutes, when DST is not in effect - positive east
   *   of Greenwich
   * - startDowNumber: The index of the day-of-week in the month when DST starts - 0
   *   for first, 1 for second, 2 for third, 3 for fourth and 4 for last
   * - startDow: The day-of-week for the DST start calculation - 0 for Sunday, 6 for
   *   Saturday
   * - startMonth: The number of the month that DST starts - 0 for January, 11 for
   *   December
   * - startDayOffset: The number of days between the selected day-of-week and the
   *   actual day that DST starts - usually 0
   * - startTimeOfDay: The number of minutes elapsed in the day before DST starts
   * - endDowNumber: The index of the day-of-week in the month when DST ends - 0 for
   *   first, 1 for second, 2 for third, 3 for fourth and 4 for last
   * - endDow: The day-of-week for the DST end calculation - 0 for Sunday, 6 for
   *   Saturday
   * - endMonth: The number of the month that DST ends - 0 for January, 11 for
   *   December
   * - endDayOffset: The number of days between the selected day-of-week and the
   *   actual day that DST ends - usually 0
   * - endTimeOfDay: The number of minutes elapsed in the day before DST ends
   * To determine what the `dowNumber, dow, month, dayOffset, timeOfDay` parameters
   * should be, start with a sentence of the form "DST starts on the last Sunday of
   * March (plus 0 days) at 03:00". Since it's the last Sunday, we have
   * startDowNumber = 4, and since it's Sunday, we have startDow = 0. That it is
   * March gives us startMonth = 2, and that the offset is zero days, we have
   * startDayOffset = 0. The time that DST starts gives us startTimeOfDay = 3*60.
   * "DST ends on the Friday before the second Sunday in November at 02:00" would
   * give us endDowNumber=1, endDow=0, endMonth=10, endDayOffset=-2 and
   * endTimeOfDay=120.
   * Using Ukraine as an example, we have a time which is 2 hours ahead of GMT in
   * winter (EET) and 3 hours in summer (EEST). DST starts at 03:00 EET on the last
   * Sunday in March, and ends at 04:00 EEST on the last Sunday in October. So
   * someone in Ukraine might call `E.setDST(60,120,4,0,2,0,180,4,0,9,0,240);`
   * Examples:
   * ```
   * // United Kingdom
   * E.setDST(60,0,4,0,2,0,60,4,0,9,0,120);
   * // California, USA
   * E.setDST(60,-480,1,0,2,0,120,0,0,10,0,120);
   * // Or adjust -480 (-8 hours) for other US states
   * // Ukraine
   * E.setDST(60,120,4,0,2,0,180,4,0,9,0,240);
   * ```
   * **Note:** This is not compatible with `E.setTimeZone()`. Calling `E.setTimeZone()`
   * after this will disable DST.
   *
   * @param {any} params - An array containing the settings for DST, or `undefined` to disable
   * @url http://www.espruino.com/Reference#l_E_setDST
   */
  static setDST(dstOffset: number, timezone: number, startDowNumber: number, startDow: number, startMonth: number, startDayOffset: number, startTimeOfDay: number, endDowNumber: number, endDow: number, endMonth: number, endDayOffset: number, endTimeOfDay: number): void

  /**
   * Create an object where every field accesses a specific 32 bit address in the
   * microcontroller's memory. This is perfect for accessing on-chip peripherals.
   * ```
   * // for NRF52 based chips
   * var GPIO = E.memoryMap(0x50000000,{OUT:0x504, OUTSET:0x508, OUTCLR:0x50C, IN:0x510, DIR:0x514, DIRSET:0x518, DIRCLR:0x51C});
   * GPIO.DIRSET = 1; // set GPIO0 to output
   * GPIO.OUT ^= 1; // toggle the output state of GPIO0
   * ```
   *
   * @param {any} baseAddress - The base address (added to every address in `registers`)
   * @param {any} registers - An object containing `{name:address}`
   * @returns {any} An object where each field is memory-mapped to a register.
   * @url http://www.espruino.com/Reference#l_E_memoryMap
   */
  static memoryMap<T extends string>(baseAddress: number, registers: { [key in T]: number }): { [key in T]: number };

  /**
   * Provide assembly to Espruino.
   * **This function is not part of Espruino**. Instead, it is detected by the
   * Espruino IDE (or command-line tools) at upload time and is replaced with machine
   * code and an `E.nativeCall` call.
   * See [the documentation on the Assembler](http://www.espruino.com/Assembler) for
   * more information.
   *
   * @param {any} callspec - The arguments this assembly takes - e.g. `void(int)`
   * @param {any} assemblycode - One of more strings of assembler code
   * @url http://www.espruino.com/Reference#l_E_asm
   */
  static asm(callspec: string, ...assemblycode: string[]): any;

  /**
   * Provides the ability to write C code inside your JavaScript file.
   * **This function is not part of Espruino**. Instead, it is detected by the
   * Espruino IDE (or command-line tools) at upload time, is sent to our web service
   * to be compiled, and is replaced with machine code and an `E.nativeCall` call.
   * See [the documentation on Inline C](http://www.espruino.com/InlineC) for more
   * information and examples.
   *
   * @param {any} code - A Templated string of C code
   * @url http://www.espruino.com/Reference#l_E_compiledC
   */
  static compiledC(code: string): any;

  /**
   * Forces a hard reboot of the microcontroller - as close as possible to if the
   * reset pin had been toggled.
   * **Note:** This is different to `reset()`, which performs a software reset of
   * Espruino (resetting the interpreter and pin states, but not all the hardware)
   * @url http://www.espruino.com/Reference#l_E_reboot
   */
  static reboot(): void;

  /**
   * USB HID will only take effect next time you unplug and re-plug your Espruino. If
   * you're disconnecting it from power you'll have to make sure you have `save()`d
   * after calling this function.
   *
   * @param {any} opts - An object containing at least reportDescriptor, an array representing the report descriptor. Pass undefined to disable HID.
   * @url http://www.espruino.com/Reference#l_E_setUSBHID
   */
  static setUSBHID(opts?: { reportDescriptor: any[] }): void;

  /**
   *
   * @param {any} data - An array of bytes to send as a USB HID packet
   * @returns {boolean} 1 on success, 0 on failure
   * @url http://www.espruino.com/Reference#l_E_sendUSBHID
   */
  static sendUSBHID(data: string | ArrayBuffer | number[]): boolean;

  /**
   * In devices that come with batteries, this function returns the battery charge
   * percentage as an integer between 0 and 100.
   * **Note:** this is an estimation only, based on battery voltage. The temperature
   * of the battery (as well as the load being drawn from it at the time
   * `E.getBattery` is called) will affect the readings.
   * @returns {number} A percentage between 0 and 100
   * @url http://www.espruino.com/Reference#l_E_getBattery
   */
  static getBattery(): number;

  /**
   * Sets the RTC's prescaler's maximum value. This is the counter that counts up on
   * each oscillation of the low speed oscillator. When the prescaler counts to the
   * value supplied, one second is deemed to have passed.
   * By default this is set to the oscillator's average speed as specified in the
   * datasheet, and usually that is fine. However on early [Espruino Pico](/Pico)
   * boards the STM32F4's internal oscillator could vary by as much as 15% from the
   * value in the datasheet. In that case you may want to alter this value to reflect
   * the true RTC speed for more accurate timekeeping.
   * To change the RTC's prescaler value to a computed value based on comparing
   * against the high speed oscillator, just run the following command, making sure
   * it's done a few seconds after the board starts up:
   * ```
   * E.setRTCPrescaler(E.getRTCPrescaler(true));
   * ```
   * When changing the RTC prescaler, the RTC 'follower' counters are reset and it
   * can take a second or two before readings from getTime are stable again.
   * To test, you can connect an input pin to a known frequency square wave and then
   * use `setWatch`. If you don't have a frequency source handy, you can check
   * against the high speed oscillator:
   * ```
   * // connect pin B3 to B4
   * analogWrite(B3, 0.5, {freq:0.5});
   * setWatch(function(e) {
   *   print(e.time - e.lastTime);
   * }, B4, {repeat:true});
   * ```
   * **Note:** This is only used on official Espruino boards containing an STM32
   * microcontroller. Other boards (even those using an STM32) don't use the RTC and
   * so this has no effect.
   *
   * @param {number} prescaler - The amount of counts for one second of the RTC - this is a 15 bit integer value (0..32767)
   * @url http://www.espruino.com/Reference#l_E_setRTCPrescaler
   */
  static setRTCPrescaler(prescaler: number): void;

  /**
   * Gets the RTC's current prescaler value if `calibrate` is undefined or false.
   * If `calibrate` is true, the low speed oscillator's speed is calibrated against
   * the high speed oscillator (usually +/- 20 ppm) and a suggested value to be fed
   * into `E.setRTCPrescaler(...)` is returned.
   * See `E.setRTCPrescaler` for more information.
   *
   * @param {boolean} calibrate - If `false`, the current value. If `true`, the calculated 'correct' value
   * @returns {number} The RTC prescaler's current value
   * @url http://www.espruino.com/Reference#l_E_getRTCPrescaler
   */
  static getRTCPrescaler(calibrate: boolean): number;

  /**
   * This function returns an object detailing the current **estimated** power usage
   * of the Espruino device in microamps (uA). It is not intended to be a replacement
   * for measuring actual power consumption, but can be useful for finding obvious power
   * draws.
   * Where an Espruino device has outputs that are connected to other things, those
   * are not included in the power usage figures.
   * Results look like:
   * ```
   * {
   *   device: {
   *     CPU : 2000, // microcontroller
   *     LCD : 100, // LCD
   *     // ...
   *   },
   *   total : 5500 // estimated usage in microamps
   * }
   * ```
   * **Note:** Currently only nRF52-based devices have variable CPU power usage
   * figures. These are based on the time passed for each SysTick event, so under heavy
   * usage the figure will update within 0.3s, but under low CPU usage it could take
   * minutes for the CPU usage figure to update.
   * **Note:** On Jolt.js we take account of internal resistance on H0/H2/H4/H6 where
   * we can measure voltage. H1/H3/H5/H7 cannot be measured.
   * @returns {any} An object detailing power usage in microamps
   * @url http://www.espruino.com/Reference#l_E_getPowerUsage
   */
  static getPowerUsage(): any;

  /**
   * Decode a UTF8 string.
   * * Any decoded character less than 256 gets passed straight through
   * * Otherwise if `lookup` is an array and an item with that char code exists in `lookup` then that is used
   * * Otherwise if `lookup` is an object and an item with that char code (as lowercase hex) exists in `lookup` then that is used
   * * Otherwise `replaceFn(charCode)` is called and the result used if `replaceFn` is a function
   * * If `replaceFn` is a string, that is used
   * * Or finally if nothing else matches, the character is ignored
   * For instance:
   * ```
   * let unicodeRemap = {
   *   0x20ac:"\u0080", // Euro symbol
   *   0x2026:"\u0085", // Ellipsis
   * };
   * E.decodeUTF8("UTF-8 Euro: \u00e2\u0082\u00ac", unicodeRemap, '[?]') == "UTF-8 Euro: \u0080"
   * ```
   *
   * @param {any} str - A string of UTF8-encoded data
   * @param {any} lookup - An array containing a mapping of character code -> replacement string
   * @param {any} replaceFn - If not in lookup, `replaceFn(charCode)` is called and the result used if it's a function, *or* if it's a string, the string value is used
   * @returns {any} A string containing all UTF8 sequences flattened to 8 bits
   * @url http://www.espruino.com/Reference#l_E_decodeUTF8
   */
  static decodeUTF8(str: string, lookup: string[], replaceFn: string | ((charCode: number) => string)): string;

  /**
   * When using events with `X.on('foo', function() { ... })`
   * and then `X.emit('foo')` you might want to stop subsequent
   * event handlers from being executed.
   * Calling this function doing the execution of events will
   * ensure that no subsequent event handlers are executed.
   * ```
   * var X = {}; // in Espruino all objects are EventEmitters
   * X.on('foo', function() { print("A"); })
   * X.on('foo', function() { print("B"); E.stopEventPropagation(); })
   * X.on('foo', function() { print("C"); })
   * X.emit('foo');
   * // prints A,B but not C
   * ```
   * @url http://www.espruino.com/Reference#l_E_stopEventPropagation
   */
  static stopEventPropagation(): void;


}

/**
 * This class provides a software-defined OneWire master. It is designed to be
 * similar to Arduino's OneWire library.
 * **Note:** OneWire commands are very timing-sensitive, and on nRF52 devices
 * (Bluetooth LE Espruino boards) the bluetooth stack can get in the way. Before
 * version 2v18 of Espruino OneWire could be unreliable, but as of firmware 2v18
 * Espruino now schedules OneWire accesses with the bluetooth stack to ensure it doesn't interfere.
 * OneWire is now reliable but some functions such as `OneWire.search` can now take
 * a while to execute (around 1 second).
 * @url http://www.espruino.com/Reference#OneWire
 */
declare class OneWire {
  /**
   * Create a software OneWire implementation on the given pin
   * @constructor
   *
   * @param {Pin} pin - The pin to implement OneWire on
   * @returns {any} A OneWire object
   * @url http://www.espruino.com/Reference#l_OneWire_OneWire
   */
  static new(pin: Pin): any;

  /**
   * Perform a reset cycle
   * @returns {boolean} True is a device was present (it held the bus low)
   * @url http://www.espruino.com/Reference#l_OneWire_reset
   */
  reset(): boolean;

  /**
   * Select a ROM - always performs a reset first
   *
   * @param {any} rom - The device to select (get this using `OneWire.search()`)
   * @url http://www.espruino.com/Reference#l_OneWire_select
   */
  select(rom: any): void;

  /**
   * Skip a ROM
   * @url http://www.espruino.com/Reference#l_OneWire_skip
   */
  skip(): void;

  /**
   * Write one or more bytes
   *
   * @param {any} data - A byte (or array of bytes) to write
   * @param {boolean} power - Whether to leave power on after write (default is false)
   * @url http://www.espruino.com/Reference#l_OneWire_write
   */
  write(data: any, power: boolean): void;

  /**
   * Read a byte
   *
   * @param {any} [count] - [optional] The amount of bytes to read
   * @returns {any} The byte that was read, or a Uint8Array if count was specified and >=0
   * @url http://www.espruino.com/Reference#l_OneWire_read
   */
  read(count?: any): any;

  /**
   * Search for devices
   *
   * @param {number} command - (Optional) command byte. If not specified (or zero), this defaults to 0xF0. This can could be set to 0xEC to perform a DS18B20 'Alarm Search Command'
   * @returns {any} An array of devices that were found
   * @url http://www.espruino.com/Reference#l_OneWire_search
   */
  search(command: number): any;
}

interface ObjectConstructor {
  /**
   * Return all enumerable keys of the given object
   *
   * @param {any} object - The object to return keys for
   * @returns {any} An array of strings - one for each key on the given object
   * @url http://www.espruino.com/Reference#l_Object_keys
   */
  keys(object: any): Array<any>;

  /**
   * Returns an array of all properties (enumerable or not) found directly on a given
   * object.
   *
   * @param {any} object - The Object to return a list of property names for
   * @returns {any} An array of the Object's own properties
   * @url http://www.espruino.com/Reference#l_Object_getOwnPropertyNames
   */
  getOwnPropertyNames(object: any): Array<any>;

  /**
   * Return all enumerable values of the given object
   *
   * @param {any} object - The object to return values for
   * @returns {any} An array of values - one for each key on the given object
   * @url http://www.espruino.com/Reference#l_Object_values
   */
  values(object: any): Array<any>;

  /**
   * Return all enumerable keys and values of the given object
   *
   * @param {any} object - The object to return values for
   * @returns {any} An array of `[key,value]` pairs - one for each key on the given object
   * @url http://www.espruino.com/Reference#l_Object_entries
   */
  entries(object: any): Array<[string, any]>;

  /**
   * Transforms an array of key-value pairs into an object
   *
   * @param {any} entries - An array of `[key,value]` pairs to be used to create an object
   * @returns {any} An object containing all the specified pairs
   * @url http://www.espruino.com/Reference#l_Object_fromEntries
   */
  fromEntries(entries: any): any;

  /**
   * Creates a new object with the specified prototype object and properties.
   * properties are currently unsupported.
   *
   * @param {any} proto - A prototype object
   * @param {any} propertiesObject - An object containing properties. NOT IMPLEMENTED
   * @returns {any} A new object
   * @url http://www.espruino.com/Reference#l_Object_create
   */
  create(proto: any, propertiesObject: any): any;

  /**
   * Get information on the given property in the object, or undefined
   *
   * @param {any} obj - The object
   * @param {any} name - The name of the property
   * @returns {any} An object with a description of the property. The values of writable/enumerable/configurable may not be entirely correct due to Espruino's implementation.
   * @url http://www.espruino.com/Reference#l_Object_getOwnPropertyDescriptor
   */
  getOwnPropertyDescriptor(obj: any, name: any): any;

  /**
   * Get information on all properties in the object (from `Object.getOwnPropertyDescriptor`), or just `{}` if no properties
   *
   * @param {any} obj - The object
   * @returns {any} An object containing all the property descriptors of an object
   * @url http://www.espruino.com/Reference#l_Object_getOwnPropertyDescriptors
   */
  getOwnPropertyDescriptors(obj: any): any;

  /**
   * Add a new property to the Object. 'Desc' is an object with the following fields:
   * * `configurable` (bool = false) - can this property be changed/deleted (not
   *   implemented)
   * * `enumerable` (bool = false) - can this property be enumerated (not
   *   implemented)
   * * `value` (anything) - the value of this property
   * * `writable` (bool = false) - can the value be changed with the assignment
   *   operator?
   * * `get` (function) - the getter function, or undefined if no getter (only
   *   supported on some platforms)
   * * `set` (function) - the setter function, or undefined if no setter (only
   *   supported on some platforms)
   * **Note:** `configurable`, `enumerable` and `writable` are not implemented and
   * will be ignored.
   *
   * @param {any} obj - An object
   * @param {any} name - The name of the property
   * @param {any} desc - The property descriptor
   * @returns {any} The object, obj.
   * @url http://www.espruino.com/Reference#l_Object_defineProperty
   */
  defineProperty(obj: any, name: any, desc: any): any;

  /**
   * Adds new properties to the Object. See `Object.defineProperty` for more
   * information
   *
   * @param {any} obj - An object
   * @param {any} props - An object whose fields represent property names, and whose values are property descriptors.
   * @returns {any} The object, obj.
   * @url http://www.espruino.com/Reference#l_Object_defineProperties
   */
  defineProperties(obj: any, props: any): any;

  /**
   * Get the prototype of the given object - this is like writing `object.__proto__`
   * but is the 'proper' ES6 way of doing it
   *
   * @param {any} object - An object
   * @returns {any} The prototype
   * @url http://www.espruino.com/Reference#l_Object_getPrototypeOf
   */
  getPrototypeOf(object: any): any;

  /**
   * Set the prototype of the given object - this is like writing `object.__proto__ =
   * prototype` but is the 'proper' ES6 way of doing it
   *
   * @param {any} object - An object
   * @param {any} prototype - The prototype to set on the object
   * @returns {any} The object passed in
   * @url http://www.espruino.com/Reference#l_Object_setPrototypeOf
   */
  setPrototypeOf(object: any, prototype: any): any;

  /**
   * Appends all keys and values in any subsequent objects to the first object
   * **Note:** Unlike the standard ES6 `Object.assign`, this will throw an exception
   * if given raw strings, bools or numbers rather than objects.
   *
   * @param {any} args - The target object, then any items objects to use as sources of keys
   * @returns {any} The target object
   * @url http://www.espruino.com/Reference#l_Object_assign
   */
  assign(...args: any[]): any;

  /**
   * Creates an Object from the supplied argument
   * @constructor
   *
   * @param {any} value - A single value to be converted to an object
   * @returns {any} An Object
   * @url http://www.espruino.com/Reference#l_Object_Object
   */
  new(value: any): any;
}

interface Object {
  /**
   * Find the length of the object
   * @returns {any} The length of the object
   * @url http://www.espruino.com/Reference#l_Object_length
   */
  length: any;

  /**
   * Returns the primitive value of this object.
   * @returns {any} The primitive value of this object
   * @url http://www.espruino.com/Reference#l_Object_valueOf
   */
  valueOf(): any;

  /**
   * Convert the Object to a string
   *
   * @param {any} [radix] - [optional] If the object is an integer, the radix (between 2 and 36) to use. NOTE: Setting a radix does not work on floating point numbers.
   * @returns {any} A String representing the object
   * @url http://www.espruino.com/Reference#l_Object_toString
   */
  toString(radix?: any): string;

  /**
   * Copy this object completely
   * @returns {any} A copy of this Object
   * @url http://www.espruino.com/Reference#l_Object_clone
   */
  clone(): any;

  /**
   * Return true if the object (not its prototype) has the given property.
   * NOTE: This currently returns false-positives for built-in functions in
   * prototypes
   *
   * @param {any} name - The name of the property to search for
   * @returns {boolean} True if it exists, false if it doesn't
   * @url http://www.espruino.com/Reference#l_Object_hasOwnProperty
   */
  hasOwnProperty(name: any): boolean;

  /**
   * Register an event listener for this object, for instance `Serial1.on('data',
   * function(d) {...})`.
   * This is the same as Node.js's [EventEmitter](https://nodejs.org/api/events.html)
   * but on Espruino the functionality is built into every object:
   * * `Object.on`
   * * `Object.emit`
   * * `Object.removeListener`
   * * `Object.removeAllListeners`
   * ```
   * var o = {}; // o can be any object...
   * // call an arrow function when the 'answer' event is received
   * o.on('answer', x => console.log(x));
   * // call a named function when the 'answer' event is received
   * function printAnswer(d) {
   *   console.log("The answer is", d);
   * }
   * o.on('answer', printAnswer);
   * // emit the 'answer' event - functions added with 'on' will be executed
   * o.emit('answer', 42);
   * // prints: 42
   * // prints: The answer is 42
   * // If you have a named function, it can be removed by name
   * o.removeListener('answer', printAnswer);
   * // Now 'printAnswer' is removed
   * o.emit('answer', 43);
   * // prints: 43
   * // Or you can remove all listeners for 'answer'
   * o.removeAllListeners('answer')
   * // Now nothing happens
   * o.emit('answer', 44);
   * // nothing printed
   * ```
   * If you have more than one handler for an event, and you'd
   * like that handler to stop the event being passed to other handlers
   * then you can call `E.stopEventPropagation()` in that handler.
   *
   * @param {any} event - The name of the event, for instance 'data'
   * @param {any} listener - The listener to call when this event is received
   * @url http://www.espruino.com/Reference#l_Object_on
   */
  on(event: any, listener: any): void;

  /**
   * Register an event listener for this object, for instance `Serial1.addListener('data', function(d) {...})`.
   * An alias for `Object.on`
   *
   * @param {any} event - The name of the event, for instance 'data'
   * @param {any} listener - The listener to call when this event is received
   * @url http://www.espruino.com/Reference#l_Object_addListener
   */
  addListener(event: any, listener: any): void;

  /**
   * Register an event listener for this object, for instance `Serial1.addListener('data', function(d) {...})`.
   * An alias for `Object.on`
   *
   * @param {any} event - The name of the event, for instance 'data'
   * @param {any} listener - The listener to call when this event is received
   * @url http://www.espruino.com/Reference#l_Object_prependListener
   */
  prependListener(event: any, listener: any): void;

  /**
   * Call any event listeners that were added to this object with `Object.on`, for
   * instance `obj.emit('data', 'Foo')`.
   * For more information see `Object.on`
   *
   * @param {any} event - The name of the event, for instance 'data'
   * @param {any} args - Optional arguments
   * @url http://www.espruino.com/Reference#l_Object_emit
   */
  emit(event: any, ...args: any[]): void;

  /**
   * Removes the specified event listener.
   * ```
   * function foo(d) {
   *   console.log(d);
   * }
   * Serial1.on("data", foo);
   * Serial1.removeListener("data", foo);
   * ```
   * For more information see `Object.on`
   *
   * @param {any} event - The name of the event, for instance 'data'
   * @param {any} listener - The listener to remove
   * @url http://www.espruino.com/Reference#l_Object_removeListener
   */
  removeListener(event: any, listener: any): void;

  /**
   * Removes all listeners (if `event===undefined`), or those of the specified event.
   * ```
   * Serial1.on("data", function(data) { ... });
   * Serial1.removeAllListeners("data");
   * // or
   * Serial1.removeAllListeners(); // removes all listeners for all event types
   * ```
   * For more information see `Object.on`
   *
   * @param {any} [event] - [optional] The name of the event, for instance `'data'`. If not specified *all* listeners are removed.
   * @url http://www.espruino.com/Reference#l_Object_removeAllListeners
   */
  removeAllListeners(event?: any): void;
}

/**
 * This is the built-in class for Objects
 * @url http://www.espruino.com/Reference#Object
 */
declare const Object: ObjectConstructor

interface FunctionConstructor {
  /**
   * Creates a function
   * @constructor
   *
   * @param {any} args - Zero or more arguments (as strings), followed by a string representing the code to run
   * @returns {any} A Number object
   * @url http://www.espruino.com/Reference#l_Function_Function
   */
  new(...args: any[]): any;
}

interface Function {
  /**
   * This replaces the function with the one in the argument - while keeping the old
   * function's scope. This allows inner functions to be edited, and is used when
   * edit() is called on an inner function.
   *
   * @param {any} newFunc - The new function to replace this function with
   * @url http://www.espruino.com/Reference#l_Function_replaceWith
   */
  replaceWith(newFunc: any): void;

  /**
   * This executes the function with the supplied 'this' argument and parameters
   *
   * @param {any} thisArg - The value to use as the 'this' argument when executing the function
   * @param {any} params - Optional Parameters
   * @returns {any} The return value of executing this function
   * @url http://www.espruino.com/Reference#l_Function_call
   */
  call(thisArg: any, ...params: any[]): any;

  /**
   * This executes the function with the supplied 'this' argument and parameters
   *
   * @param {any} thisArg - The value to use as the 'this' argument when executing the function
   * @param {any} args - Optional Array of Arguments
   * @returns {any} The return value of executing this function
   * @url http://www.espruino.com/Reference#l_Function_apply
   */
  apply(thisArg: any, args: ArrayLike<any>): any;

  /**
   * This executes the function with the supplied 'this' argument and parameters
   *
   * @param {any} thisArg - The value to use as the 'this' argument when executing the function
   * @param {any} params - Optional Default parameters that are prepended to the call
   * @returns {any} The 'bound' function
   * @url http://www.espruino.com/Reference#l_Function_bind
   */
  bind(thisArg: any, ...params: any[]): any;
}

/**
 * This is the built-in class for Functions
 * @url http://www.espruino.com/Reference#Function
 */
declare const Function: FunctionConstructor

interface ArrayConstructor {
  /**
   * Returns true if the provided object is an array
   *
   * @param {any} var - The variable to be tested
   * @returns {boolean} True if var is an array, false if not.
   * @url http://www.espruino.com/Reference#l_Array_isArray
   */
  isArray(arg: any): arg is any[];

  /**
   * Create an Array. Either give it one integer argument (>=0) which is the length
   * of the array, or any number of arguments
   * @constructor
   *
   * @param {any} args - The length of the array OR any number of items to add to the array
   * @returns {any} An Array
   * @url http://www.espruino.com/Reference#l_Array_Array
   */
  new(arrayLength?: number): any[];
  new<T>(arrayLength: number): T[];
  new<T>(...items: T[]): T[];
  (arrayLength?: number): any[];
  <T>(arrayLength: number): T[];
  <T>(...items: T[]): T[];
}

interface Array<T> {
  /**
   * Convert the Array to a string
   *
   * @param {any} radix - unused
   * @returns {any} A String representing the array
   * @url http://www.espruino.com/Reference#l_Array_toString
   */
  toString(): string;

  /**
   * Find the length of the array
   * @returns {any} The length of the array
   * @url http://www.espruino.com/Reference#l_Array_length
   */
  length: number;

  /**
   * Return the index of the value in the array, or -1
   *
   * @param {any} value - The value to check for
   * @param {number} [startIndex] - [optional] the index to search from, or 0 if not specified
   * @returns {any} the index of the value in the array, or -1
   * @url http://www.espruino.com/Reference#l_Array_indexOf
   */
  indexOf(value: T, startIndex?: number): number;

  /**
   * Return `true` if the array includes the value, `false` otherwise
   *
   * @param {any} value - The value to check for
   * @param {number} [startIndex] - [optional] the index to search from, or 0 if not specified
   * @returns {boolean} `true` if the array includes the value, `false` otherwise
   * @url http://www.espruino.com/Reference#l_Array_includes
   */
  includes(value: T, startIndex?: number): boolean;

  /**
   * Join all elements of this array together into one string, using 'separator'
   * between them. e.g. ```[1,2,3].join(' ')=='1 2 3'```
   *
   * @param {any} separator - The separator
   * @returns {any} A String representing the Joined array
   * @url http://www.espruino.com/Reference#l_Array_join
   */
  join(separator?: string): string;

  /**
   * Push a new value onto the end of this array'
   * This is the opposite of `[1,2,3].unshift(0)`, which adds one or more elements to
   * the beginning of the array.
   *
   * @param {any} arguments - One or more arguments to add
   * @returns {number} The new size of the array
   * @url http://www.espruino.com/Reference#l_Array_push
   */
  push(...arguments: T[]): number;

  /**
   * Remove and return the value on the end of this array.
   * This is the opposite of `[1,2,3].shift()`, which removes an element from the
   * beginning of the array.
   * @returns {any} The value that is popped off
   * @url http://www.espruino.com/Reference#l_Array_pop
   */
  pop(): T | undefined;

  /**
   * Return an array which is made from the following: ```A.map(function) =
   * [function(A[0]), function(A[1]), ...]```
   *
   * @param {any} function - Function used to map one item to another
   * @param {any} [thisArg] - [optional] If specified, the function is called with 'this' set to thisArg
   * @returns {any} An array containing the results
   * @url http://www.espruino.com/Reference#l_Array_map
   */
  map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];

  /**
   * Executes a provided function once per array element.
   *
   * @param {any} function - Function to be executed
   * @param {any} [thisArg] - [optional] If specified, the function is called with 'this' set to thisArg
   * @url http://www.espruino.com/Reference#l_Array_forEach
   */
  forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;

  /**
   * Return an array which contains only those elements for which the callback
   * function returns 'true'
   *
   * @param {any} function - Function to be executed
   * @param {any} [thisArg] - [optional] If specified, the function is called with 'this' set to thisArg
   * @returns {any} An array containing the results
   * @url http://www.espruino.com/Reference#l_Array_filter
   */
  filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
  filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];

  /**
   * Return the array element where `function` returns `true`, or `undefined` if it
   * doesn't returns `true` for any element.
   * ```
   * ["Hello","There","World"].find(a=>a[0]=="T")
   * // returns "There"
   * ```
   *
   * @param {any} function - Function to be executed
   * @returns {any} The array element where `function` returns `true`, or `undefined`
   * @url http://www.espruino.com/Reference#l_Array_find
   */
  find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S): S | undefined;
  find(predicate: (value: T, index: number, obj: T[]) => unknown): T | undefined;

  /**
   * Return the array element's index where `function` returns `true`, or `-1` if it
   * doesn't returns `true` for any element.
   * ```
   * ["Hello","There","World"].findIndex(a=>a[0]=="T")
   * // returns 1
   * ```
   *
   * @param {any} function - Function to be executed
   * @returns {any} The array element's index where `function` returns `true`, or `-1`
   * @url http://www.espruino.com/Reference#l_Array_findIndex
   */
  findIndex(predicate: (value: T, index: number, obj: T[]) => unknown): number;

  /**
   * Return 'true' if the callback returns 'true' for any of the elements in the
   * array
   *
   * @param {any} function - Function to be executed
   * @param {any} [thisArg] - [optional] If specified, the function is called with 'this' set to thisArg
   * @returns {any} A boolean containing the result
   * @url http://www.espruino.com/Reference#l_Array_some
   */
  some(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean;

  /**
   * Return 'true' if the callback returns 'true' for every element in the array
   *
   * @param {any} function - Function to be executed
   * @param {any} [thisArg] - [optional] If specified, the function is called with 'this' set to thisArg
   * @returns {any} A boolean containing the result
   * @url http://www.espruino.com/Reference#l_Array_every
   */
  every(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean;

  /**
   * Execute `previousValue=initialValue` and then `previousValue =
   * callback(previousValue, currentValue, index, array)` for each element in the
   * array, and finally return previousValue.
   *
   * @param {any} callback - Function used to reduce the array
   * @param {any} initialValue - if specified, the initial value to pass to the function
   * @returns {any} The value returned by the last function called
   * @url http://www.espruino.com/Reference#l_Array_reduce
   */
  reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T;

  /**
   * Both remove and add items to an array
   *
   * @param {number} index - Index at which to start changing the array. If negative, will begin that many elements from the end
   * @param {any} howMany - An integer indicating the number of old array elements to remove. If howMany is 0, no elements are removed.
   * @param {any} elements - One or more items to add to the array
   * @returns {any} An array containing the removed elements. If only one element is removed, an array of one element is returned.
   * @url http://www.espruino.com/Reference#l_Array_splice
   */
  splice(index: number, howMany?: number, ...elements: T[]): T[];

  /**
   * Remove and return the first element of the array.
   * This is the opposite of `[1,2,3].pop()`, which takes an element off the end.
   *
   * @returns {any} The element that was removed
   * @url http://www.espruino.com/Reference#l_Array_shift
   */
  shift(): T | undefined;

  /**
   * Add one or more items to the start of the array, and return its new length.
   * This is the opposite of `[1,2,3].push(4)`, which puts one or more elements on
   * the end.
   *
   * @param {any} elements - One or more items to add to the beginning of the array
   * @returns {number} The new array length
   * @url http://www.espruino.com/Reference#l_Array_unshift
   */
  unshift(...elements: T[]): number;

  /**
   * Return a copy of a portion of this array (in a new array)
   *
   * @param {number} start - Start index
   * @param {any} [end] - [optional] End index
   * @returns {any} A new array
   * @url http://www.espruino.com/Reference#l_Array_slice
   */
  slice(start?: number, end?: number): T[];

  /**
   * Do an in-place quicksort of the array
   *
   * @param {any} var - A function to use to compare array elements (or undefined)
   * @returns {any} This array object
   * @url http://www.espruino.com/Reference#l_Array_sort
   */
  sort(compareFn?: (a: T, b: T) => number): T[];

  /**
   * Create a new array, containing the elements from this one and any arguments, if
   * any argument is an array then those elements will be added.
   *
   * @param {any} args - Any items to add to the array
   * @returns {any} An Array
   * @url http://www.espruino.com/Reference#l_Array_concat
   */
  concat(...args: (T | T[])[]): T[];

  /**
   * Fill this array with the given value, for every index `>= start` and `< end`
   *
   * @param {any} value - The value to fill the array with
   * @param {number} start - Optional. The index to start from (or 0). If start is negative, it is treated as length+start where length is the length of the array
   * @param {any} end - Optional. The index to end at (or the array length). If end is negative, it is treated as length+end.
   * @returns {any} This array
   * @url http://www.espruino.com/Reference#l_Array_fill
   */
  fill(value: T, start: number, end?: number): T[];

  /**
   * Reverse all elements in this array (in place)
   * @returns {any} The array, but reversed.
   * @url http://www.espruino.com/Reference#l_Array_reverse
   */
  reverse(): T[];

  [index: number]: T
}

/**
 * This is the built-in JavaScript class for arrays.
 * Arrays can be defined with ```[]```, ```new Array()```, or ```new
 * Array(length)```
 * @url http://www.espruino.com/Reference#Array
 */
declare const Array: ArrayConstructor

interface JSONConstructor {
  /**
   * Convert the given object into a JSON string which can subsequently be parsed
   * with JSON.parse or eval.
   * **Note:** This differs from JavaScript's standard `JSON.stringify` in that:
   * * The `replacer` argument is ignored
   * * Typed arrays like `new Uint8Array(5)` will be dumped as if they were arrays,
   *   not as if they were objects (since it is more compact)
   *
   * @param {any} data - The data to be converted to a JSON string
   * @param {any} replacer - This value is ignored
   * @param {any} space - The number of spaces to use for padding, a string, or null/undefined for no whitespace
   * @returns {any} A JSON string
   * @url http://www.espruino.com/Reference#l_JSON_stringify
   */
  stringify(data: any, replacer: any, space: any): any;

  /**
   * Parse the given JSON string into a JavaScript object
   * NOTE: This implementation uses eval() internally, and as such it is unsafe as it
   * can allow arbitrary JS commands to be executed.
   *
   * @param {any} string - A JSON string
   * @returns {any} The JavaScript object created by parsing the data string
   * @url http://www.espruino.com/Reference#l_JSON_parse
   */
  parse(string: any): any;
}

interface JSON {

}

/**
 * An Object that handles conversion to and from the JSON data interchange format
 * @url http://www.espruino.com/Reference#JSON
 */
declare const JSON: JSONConstructor

/**
 * This class allows use of the built-in SPI ports. Currently it is SPI master
 * only.
 * @url http://www.espruino.com/Reference#SPI
 */
declare class SPI {
  /**
   * Try and find an SPI hardware device that will work on this pin (e.g. `SPI1`)
   * May return undefined if no device can be found.
   *
   * @param {Pin} pin - A pin to search with
   * @returns {any} An object of type `SPI`, or `undefined` if one couldn't be found.
   * @url http://www.espruino.com/Reference#l_SPI_find
   */
  static find(pin: Pin): any;

  /**
   * Create a software SPI port. This has limited functionality (no baud rate), but
   * it can work on any pins.
   * Use `SPI.setup` to configure this port.
   * @constructor
   * @returns {any} A SPI object
   * @url http://www.espruino.com/Reference#l_SPI_SPI
   */
  static new(): any;

  /**
   * Set up this SPI port as an SPI Master.
   * Options can contain the following (defaults are shown where relevant):
   * ```
   * {
   *   sck:pin,
   *   miso:pin,
   *   mosi:pin,
   *   baud:integer=100000, // ignored on software SPI
   *   mode:integer=0, // between 0 and 3
   *   order:string='msb' // can be 'msb' or 'lsb'
   *   bits:8 // only available for software SPI
   * }
   * ```
   * If `sck`,`miso` and `mosi` are left out, they will automatically be chosen.
   * However if one or more is specified then the unspecified pins will not be set
   * up.
   * You can find out which pins to use by looking at [your board's reference
   * page](#boards) and searching for pins with the `SPI` marker. Some boards such as
   * those based on `nRF52` chips can have SPI on any pins, so don't have specific
   * markings.
   * The SPI `mode` is between 0 and 3 - see
   * http://en.wikipedia.org/wiki/Serial_Peripheral_Interface_Bus#Clock_polarity_and_phase
   * On STM32F1-based parts, you cannot mix AF and non-AF pins (SPI pins are usually
   * grouped on the chip - and you can't mix pins from two groups). Espruino will not
   * warn you about this.
   *
   * @param {any} options - An Object containing extra information on initialising the SPI port
   * @url http://www.espruino.com/Reference#l_SPI_setup
   */
  setup(options: any): void;

  /**
   * Send data down SPI, and return the result. Sending an integer will return an
   * integer, a String will return a String, and anything else will return a
   * Uint8Array.
   * Sending multiple bytes in one call to send is preferable as they can then be
   * transmitted end to end. Using multiple calls to send() will result in
   * significantly slower transmission speeds.
   * For maximum speeds, please pass either Strings or Typed Arrays as arguments.
   * Note that you can even pass arrays of arrays, like `[1,[2,3,4],5]`
   *
   * @param {any} data - The data to send - either an Integer, Array, String, or Object of the form `{data: ..., count:#}`
   * @param {Pin} nss_pin - An nSS pin - this will be lowered before SPI output and raised afterwards (optional). There will be a small delay between when this is lowered and when sending starts, and also between sending finishing and it being raised.
   * @returns {any} The data that was returned
   * @url http://www.espruino.com/Reference#l_SPI_send
   */
  send(data: any, nss_pin: Pin): any;

  /**
   * Write a character or array of characters to SPI - without reading the result
   * back.
   * For maximum speeds, please pass either Strings or Typed Arrays as arguments.
   *
   * @param {any} data
   * One or more items to write. May be ints, strings, arrays, or special objects (see `E.toUint8Array` for more info).
   * If the last argument is a pin, it is taken to be the NSS pin
   * @url http://www.espruino.com/Reference#l_SPI_write
   */
  write(...data: any[]): void;

  /**
   * Send data down SPI, using 4 bits for each 'real' bit (MSB first). This can be
   * useful for faking one-wire style protocols
   * Sending multiple bytes in one call to send is preferable as they can then be
   * transmitted end to end. Using multiple calls to send() will result in
   * significantly slower transmission speeds.
   *
   * @param {any} data - The data to send - either an integer, array, or string
   * @param {number} bit0 - The 4 bits to send for a 0 (MSB first)
   * @param {number} bit1 - The 4 bits to send for a 1 (MSB first)
   * @param {Pin} nss_pin - An nSS pin - this will be lowered before SPI output and raised afterwards (optional). There will be a small delay between when this is lowered and when sending starts, and also between sending finishing and it being raised.
   * @url http://www.espruino.com/Reference#l_SPI_send4bit
   */
  send4bit(data: any, bit0: number, bit1: number, nss_pin: Pin): void;

  /**
   * Send data down SPI, using 8 bits for each 'real' bit (MSB first). This can be
   * useful for faking one-wire style protocols
   * Sending multiple bytes in one call to send is preferable as they can then be
   * transmitted end to end. Using multiple calls to send() will result in
   * significantly slower transmission speeds.
   *
   * @param {any} data - The data to send - either an integer, array, or string
   * @param {number} bit0 - The 8 bits to send for a 0 (MSB first)
   * @param {number} bit1 - The 8 bits to send for a 1 (MSB first)
   * @param {Pin} nss_pin - An nSS pin - this will be lowered before SPI output and raised afterwards (optional). There will be a small delay between when this is lowered and when sending starts, and also between sending finishing and it being raised
   * @url http://www.espruino.com/Reference#l_SPI_send8bit
   */
  send8bit(data: any, bit0: number, bit1: number, nss_pin: Pin): void;
}

/**
 * This class allows use of the built-in I2C ports. Currently it allows I2C Master
 * mode only.
 * All addresses are in 7 bit format. If you have an 8 bit address then you need to
 * shift it one bit to the right.
 * @url http://www.espruino.com/Reference#I2C
 */
declare class I2C {
  /**
   * Try and find an I2C hardware device that will work on this pin (e.g. `I2C1`)
   * May return undefined if no device can be found.
   *
   * @param {Pin} pin - A pin to search with
   * @returns {any} An object of type `I2C`, or `undefined` if one couldn't be found.
   * @url http://www.espruino.com/Reference#l_I2C_find
   */
  static find(pin: Pin): any;

  /**
   * Create a software I2C port. This has limited functionality (no baud rate), but
   * it can work on any pins.
   * Use `I2C.setup` to configure this port.
   * @constructor
   * @returns {any} An I2C object
   * @url http://www.espruino.com/Reference#l_I2C_I2C
   */
  static new(): any;

  /**
   * Set up this I2C port
   * If not specified in options, the default pins are used (usually the lowest
   * numbered pins on the lowest port that supports this peripheral)
   *
   * @param {any} [options]
   * [optional] A structure containing extra information on initialising the I2C port
   * ```{scl:pin, sda:pin, bitrate:100000}```
   * You can find out which pins to use by looking at [your board's reference page](#boards) and searching for pins with the `I2C` marker. Note that 400kHz is the maximum bitrate for most parts.
   * @url http://www.espruino.com/Reference#l_I2C_setup
   */
  setup(options?: any): void;

  /**
   * Transmit to the slave device with the given address. This is like Arduino's
   * beginTransmission, write, and endTransmission rolled up into one.
   *
   * @param {any} address - The 7 bit address of the device to transmit to, or an object of the form `{address:12, stop:false}` to send this data without a STOP signal.
   * @param {any} data - One or more items to write. May be ints, strings, arrays, or special objects (see `E.toUint8Array` for more info).
   * @url http://www.espruino.com/Reference#l_I2C_writeTo
   */
  writeTo(address: any, ...data: any[]): void;

  /**
   * Request bytes from the given slave device, and return them as a Uint8Array
   * (packed array of bytes). This is like using Arduino Wire's requestFrom,
   * available and read functions. Sends a STOP unless `{address:X, stop:false}` is used.
   *
   * @param {any} address - The 7 bit address of the device to request bytes from, or an object of the form `{address:12, stop:false}` to send this data without a STOP signal.
   * @param {number} quantity - The number of bytes to request
   * @returns {any} The data that was returned - as a Uint8Array
   * @url http://www.espruino.com/Reference#l_I2C_readFrom
   */
  readFrom(address: any, quantity: number): Uint8Array;

  /**
   * Request bytes from a register on the given I2C slave device, and return them as a Uint8Array
   * (packed array of bytes).
   * This is the same as calling `I2C.writeTo` and `I2C.readFrom`:
   * ```
   * I2C.readReg = function(address, reg, quantity) {
   *   this.writeTo({address:address, stop:false}, reg);
   *   return this.readFrom(address, quantity);
   * };
   * ```
   *
   * @param {number} address - The 7 bit address of the device to request bytes from
   * @param {number} reg - The register on the device to read bytes from
   * @param {number} quantity - The number of bytes to request
   * @returns {any} The data that was returned - as a Uint8Array
   * @url http://www.espruino.com/Reference#l_I2C_readReg
   */
  readReg(address: number, reg: number, quantity: number): Uint8Array;
}

interface PromiseConstructor {
  /**
   * Return a new promise that is resolved when all promises in the supplied array
   * are resolved.
   *
   * @param {any} promises - An array of promises
   * @returns {any} A new Promise
   * @url http://www.espruino.com/Reference#l_Promise_all
   */
  all(promises: Promise<any>[]): Promise<void>;

  /**
   * Return a new promise that is already resolved (at idle it'll call `.then`)
   *
   * @param {any} promises - Data to pass to the `.then` handler
   * @returns {any} A new Promise
   * @url http://www.espruino.com/Reference#l_Promise_resolve
   */
  resolve<T extends any>(promises?: T): Promise<T>;

  /**
   * Return a new promise that is already rejected (at idle it'll call `.catch`)
   *
   * @param {any} promises - Data to pass to the `.catch` handler
   * @returns {any} A new Promise
   * @url http://www.espruino.com/Reference#l_Promise_reject
   */
  reject(promises: any): any;

  /**
   * Create a new Promise. The executor function is executed immediately (before the
   * constructor even returns) and
   * @constructor
   *
   * @param {any} executor - A function of the form `function (resolve, reject)`
   * @returns {any} A Promise
   * @url http://www.espruino.com/Reference#l_Promise_Promise
   */
  new<T>(executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void): Promise<T>;
}

interface Promise<T> {
  /**
   *
   * @param {any} onFulfilled - A callback that is called when this promise is resolved
   * @param {any} [onRejected] - [optional] A callback that is called when this promise is rejected (or nothing)
   * @returns {any} The original Promise
   * @url http://www.espruino.com/Reference#l_Promise_then
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;

  /**
   *
   * @param {any} onRejected - A callback that is called when this promise is rejected
   * @returns {any} The original Promise
   * @url http://www.espruino.com/Reference#l_Promise_catch
   */
  catch(onRejected: any): any;
}

/**
 * This is the built-in class for ES6 Promises
 * @url http://www.espruino.com/Reference#Promise
 */
declare const Promise: PromiseConstructor

/**
 * These objects are created from `require("Storage").open` and allow Storage items
 * to be read/written.
 * The `Storage` library writes into Flash memory (which can only be erased in
 * chunks), and unlike a normal filesystem it allocates files in one long
 * contiguous area to allow them to be accessed easily from Espruino.
 * This presents a challenge for `StorageFile` which allows you to append to a
 * file, so instead `StorageFile` stores files in chunks. It uses the last
 * character of the filename to denote the chunk number (e.g. `"foobar\1"`,
 * `"foobar\2"`, etc).
 * This means that while `StorageFile` files exist in the same area as those from
 * `Storage`, they should be read using `Storage.open` (and not `Storage.read`).
 * ```
 * f = require("Storage").open("foobar","w");
 * f.write("Hell");
 * f.write("o World\n");
 * f.write("Hello\n");
 * f.write("World 2\n");
 * f.write("Hello World 3\n");
 * // there's no need to call 'close'
 * // then
 * f = require("Storage").open("foobar","r");
 * f.read(13) // "Hello World\nH"
 * f.read(13) // "ello\nWorld 2\n"
 * f.read(13) // "Hello World 3"
 * f.read(13) // "\n"
 * f.read(13) // undefined
 * // or
 * f = require("Storage").open("foobar","r");
 * f.readLine() // "Hello World\n"
 * f.readLine() // "Hello\n"
 * f.readLine() // "World 2\n"
 * f.readLine() // "Hello World 3\n"
 * f.readLine() // undefined
 * // now get rid of file
 * f.erase();
 * ```
 * **Note:** `StorageFile` uses the fact that all bits of erased flash memory are 1
 * to detect the end of a file. As such you should not write character code 255
 * (`"\xFF"`) to these files.
 * @url http://www.espruino.com/Reference#StorageFile
 */
declare class StorageFile {


  /**
   * Read 'len' bytes of data from the file, and return a String containing those
   * bytes.
   * If the end of the file is reached, the String may be smaller than the amount of
   * bytes requested, or if the file is already at the end, `undefined` is returned.
   *
   * @param {number} len - How many bytes to read
   * @returns {any} A String, or undefined
   * @url http://www.espruino.com/Reference#l_StorageFile_read
   */
  read(len: number): string;

  /**
   * Read a line of data from the file (up to and including `"\n"`)
   * @returns {any} A line of data
   * @url http://www.espruino.com/Reference#l_StorageFile_readLine
   */
  readLine(): string;

  /**
   * Return the length of the current file.
   * This requires Espruino to read the file from scratch, which is not a fast
   * operation.
   * @returns {number} The current length in bytes of the file
   * @url http://www.espruino.com/Reference#l_StorageFile_getLength
   */
  getLength(): number;

  /**
   * Append the given data to a file. You should not attempt to append `"\xFF"`
   * (character code 255).
   *
   * @param {any} data - The data to write. This should not include `'\xFF'` (character code 255)
   * @url http://www.espruino.com/Reference#l_StorageFile_write
   */
  write(data: string): void;

  /**
   * Erase this `StorageFile` - after being called this file can no longer be written to.
   * **Note:** You shouldn't call `require("Storage").erase(...)` on a `StorageFile`, but should
   * instead open the StorageFile and call `.erase` on the returned file: `require("Storage").open(..., "r").erase()`
   * @url http://www.espruino.com/Reference#l_StorageFile_erase
   */
  erase(): void;

  /**
   * Pipe this file to a stream (an object with a 'write' method)
   *
   * @param {any} destination - The destination file/stream that will receive content from the source.
   * @param {any} [options]
   * [optional] An object `{ chunkSize : int=32, end : bool=true, complete : function }`
   * chunkSize : The amount of data to pipe from source to destination at a time
   * complete : a function to call when the pipe activity is complete
   * end : call the 'end' function on the destination when the source is finished
   * @url http://www.espruino.com/Reference#l_StorageFile_pipe
   */
  pipe(destination: any, options?: PipeOptions): void
}

interface processConstructor {
  /**
   * This event is called when an exception gets thrown and isn't caught (e.g. it gets
   * all the way back to the event loop).
   * You can use this for logging potential problems that might occur during
   * execution when you might not be able to see what is written to the console, for
   * example:
   * ```
   * var lastError;
   * process.on('uncaughtException', function(e) {
   *   lastError=e;
   *   print(e,e.stack?"\n"+e.stack:"")
   * });
   * function checkError() {
   *   if (!lastError) return print("No Error");
   *   print(lastError,lastError.stack?"\n"+lastError.stack:"")
   * }
   * ```
   * **Note:** When this is used, exceptions will cease to be reported on the
   * console - which may make debugging difficult!
   * @param {string} event - The event to listen to.
   * @param {(exception: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `exception` The uncaught exception
   * @url http://www.espruino.com/Reference#l_process_uncaughtException
   */
  on(event: "uncaughtException", callback: (exception: any) => void): void;

  /**
   * Returns the version of Espruino as a String
   * @returns {any} The version of Espruino
   * @url http://www.espruino.com/Reference#l_process_version
   */
  version: any;

  /**
   * Returns an Object containing various pre-defined variables.
   * * `VERSION` - is the Espruino version
   * * `GIT_COMMIT` - is Git commit hash this firmware was built from
   * * `BOARD` - the board's ID (e.g. `PUCKJS`)
   * * `RAM` - total amount of on-chip RAM in bytes
   * * `FLASH` - total amount of on-chip flash memory in bytes
   * * `SPIFLASH` - (on Bangle.js) total amount of off-chip flash memory in bytes
   * * `HWVERSION` - For Puck.js this is the board revision (1, 2, 2.1), or for
   *   Bangle.js it's 1 or 2
   * * `STORAGE` - memory in bytes dedicated to the `Storage` module
   * * `SERIAL` - the serial number of this chip
   * * `CONSOLE` - the name of the current console device being used (`Serial1`,
   *   `USB`, `Bluetooth`, etc)
   * * `MODULES` - a list of built-in modules separated by commas
   * * `EXPTR` - The address of the `exportPtrs` structure in flash (this includes
   *   links to built-in functions that compiled JS code needs)
   * * `APP_RAM_BASE` - On nRF5x boards, this is the RAM required by the Softdevice
   *   *if it doesn't exactly match what was allocated*. You can use this to update
   *   `LD_APP_RAM_BASE` in the `BOARD.py` file
   * For example, to get a list of built-in modules, you can use
   * `process.env.MODULES.split(',')`
   * **Note:** `process.env` is not writeable - so as not to waste RAM, the contents
   * are generated on demand. If you need to be able to change them, use `process.env=process.env;`
   * first to ensure the values stay allocated.
   * @returns {any} An object
   * @url http://www.espruino.com/Reference#l_process_env
   */
  env: any;

  /**
   * Run a Garbage Collection pass, and return an object containing information on
   * memory usage.
   * * `free` : Memory that is available to be used (in blocks)
   * * `usage` : Memory that has been used (in blocks)
   * * `total` : Total memory (in blocks)
   * * `history` : Memory used for command history - that is freed if memory is low.
   *   Note that this is INCLUDED in the figure for 'free'
   * * `gc` : Memory freed during the GC pass
   * * `gctime` : Time taken for GC pass (in milliseconds)
   * * `blocksize` : Size of a block (variable) in bytes
   * * `stackEndAddress` : (on ARM) the address (that can be used with peek/poke/etc)
   *   of the END of the stack. The stack grows down, so unless you do a lot of
   *   recursion the bytes above this can be used.
   * * `stackFree` : (on ARM) how many bytes of free execution stack are there
   *   at the point of execution.
   * * `flash_start` : (on ARM) the address of the start of flash memory (usually
   *   `0x8000000`)
   * * `flash_binary_end` : (on ARM) the address in flash memory of the end of
   *   Espruino's firmware.
   * * `flash_code_start` : (on ARM) the address in flash memory of pages that store
   *   any code that you save with `save()`.
   * * `flash_length` : (on ARM) the amount of flash memory this firmware was built
   *   for (in bytes). **Note:** Some STM32 chips actually have more memory than is
   *   advertised.
   * Memory units are specified in 'blocks', which are around 16 bytes each
   * (depending on your device). The actual size is available in `blocksize`. See
   * http://www.espruino.com/Performance for more information.
   * **Note:** To find free areas of flash memory, see `require('Flash').getFree()`
   *
   * @param {any} [gc] - [optional] A boolean. If `undefined` or `true` Garbage collection is performed, if `false` it is not
   * @returns {any} Information about memory usage
   * @url http://www.espruino.com/Reference#l_process_memory
   */
  memory(gc?: any): any;
}

interface process {

}

/**
 * This class contains information about Espruino itself
 * @url http://www.espruino.com/Reference#process
 */
declare const process: processConstructor

/**
 * This class allows use of the built-in USARTs
 * Methods may be called on the `USB`, `Serial1`, `Serial2`, `Serial3`, `Serial4`,
 * `Serial5` and `Serial6` objects. While different processors provide different
 * numbers of USARTs, on official Espruino boards you can always rely on at least
 * `Serial1` being available
 * @url http://www.espruino.com/Reference#Serial
 */
declare class Serial {
  /**
   * The `data` event is called when data is received. If a handler is defined with
   * `X.on('data', function(data) { ... })` then it will be called, otherwise data
   * will be stored in an internal buffer, where it can be retrieved with `X.read()`
   * @param {string} event - The event to listen to.
   * @param {(data: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `data` A string containing one or more characters of received data
   * @url http://www.espruino.com/Reference#l_Serial_data
   */
  static on(event: "data", callback: (data: any) => void): void;

  /**
   * The `framing` event is called when there was activity on the input to the UART
   * but the `STOP` bit wasn't in the correct place. This is either because there was
   * noise on the line, or the line has been pulled to 0 for a long period of time.
   * To enable this, you must initialise Serial with `SerialX.setup(..., { ...,
   * errors:true });`
   * **Note:** Even though there was an error, the byte will still be received and
   * passed to the `data` handler.
   * **Note:** This only works on STM32 and NRF52 based devices (e.g. all official
   * Espruino boards)
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_Serial_framing
   */
  static on(event: "framing", callback: () => void): void;

  /**
   * The `parity` event is called when the UART was configured with a parity bit, and
   * this doesn't match the bits that have actually been received.
   * To enable this, you must initialise Serial with `SerialX.setup(..., { ...,
   * errors:true });`
   * **Note:** Even though there was an error, the byte will still be received and
   * passed to the `data` handler.
   * **Note:** This only works on STM32 and NRF52 based devices (e.g. all official
   * Espruino boards)
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_Serial_parity
   */
  static on(event: "parity", callback: () => void): void;

  /**
   * Try and find a USART (Serial) hardware device that will work on this pin (e.g.
   * `Serial1`)
   * May return undefined if no device can be found.
   *
   * @param {Pin} pin - A pin to search with
   * @returns {any} An object of type `Serial`, or `undefined` if one couldn't be found.
   * @url http://www.espruino.com/Reference#l_Serial_find
   */
  static find(pin: Pin): any;

  /**
   * Create a software Serial port. This has limited functionality (only low baud
   * rates), but it can work on any pins.
   * Use `Serial.setup` to configure this port.
   * @constructor
   * @returns {any} A Serial object
   * @url http://www.espruino.com/Reference#l_Serial_Serial
   */
  static new(): any;

  /**
   * Set this Serial port as the port for the JavaScript console (REPL).
   * Unless `force` is set to true, changes in the connection state of the board (for
   * instance plugging in USB) will cause the console to change.
   * See `E.setConsole` for a more flexible version of this function.
   *
   * @param {boolean} force - Whether to force the console to this port
   * @url http://www.espruino.com/Reference#l_Serial_setConsole
   */
  setConsole(force: boolean): void;

  /**
   * Setup this Serial port with the given baud rate and options.
   * e.g.
   * ```
   * Serial1.setup(9600,{rx:a_pin, tx:a_pin});
   * ```
   * The second argument can contain:
   * ```
   * {
   *   rx:pin,                           // Receive pin (data in to Espruino)
   *   tx:pin,                           // Transmit pin (data out of Espruino)
   *   ck:pin,                           // (default none) Clock Pin
   *   cts:pin,                          // (default none) Clear to Send Pin
   *   bytesize:8,                       // (default 8)How many data bits - 7 or 8
   *   parity:null/'none'/'o'/'odd'/'e'/'even',
   *                                     // (default none) Parity bit
   *   stopbits:1,                       // (default 1) Number of stop bits to use
   *   flow:null/undefined/'none'/'xon', // (default none) software flow control
   *   path:null/undefined/string        // Linux Only - the path to the Serial device to use
   *   errors:false                      // (default false) whether to forward framing/parity errors
   * }
   * ```
   * You can find out which pins to use by looking at [your board's reference
   * page](#boards) and searching for pins with the `UART`/`USART` markers.
   * If not specified in options, the default pins are used for rx and tx (usually
   * the lowest numbered pins on the lowest port that supports this peripheral). `ck`
   * and `cts` are not used unless specified.
   * Note that even after changing the RX and TX pins, if you have called setup
   * before then the previous RX and TX pins will still be connected to the Serial
   * port as well - until you set them to something else using `digitalWrite` or
   * `pinMode`.
   * Flow control can be xOn/xOff (`flow:'xon'`) or hardware flow control (receive
   * only) if `cts` is specified. If `cts` is set to a pin, the pin's value will be 0
   * when Espruino is ready for data and 1 when it isn't.
   * By default, framing or parity errors don't create `framing` or `parity` events
   * on the `Serial` object because storing these errors uses up additional storage
   * in the queue. If you're intending to receive a lot of malformed data then the
   * queue might overflow `E.getErrorFlags()` would return `FIFO_FULL`. However if
   * you need to respond to `framing` or `parity` errors then you'll need to use
   * `errors:true` when initialising serial.
   * On Linux builds there is no default Serial device, so you must specify a path to
   * a device - for instance: `Serial1.setup(9600,{path:"/dev/ttyACM0"})`
   * You can also set up 'software serial' using code like:
   * ```
   * var s = new Serial();
   * s.setup(9600,{rx:a_pin, tx:a_pin});
   * ```
   * However software serial doesn't use `ck`, `cts`, `parity`, `flow` or `errors`
   * parts of the initialisation object.
   *
   * @param {any} baudrate - The baud rate - the default is 9600
   * @param {any} [options] - [optional] A structure containing extra information on initialising the serial port - see below.
   * @url http://www.espruino.com/Reference#l_Serial_setup
   */
  setup(baudrate: any, options?: any): void;

  /**
   * If the serial (or software serial) device was set up, uninitialise it.
   * @url http://www.espruino.com/Reference#l_Serial_unsetup
   */
  unsetup(): void;

  /**
   * Print a string to the serial port - without a line feed
   *  **Note:** This function replaces any occurrences of `\n` in the string with
   *  `\r\n`. To avoid this, use `Serial.write`.
   *
   * @param {any} string - A String to print
   * @url http://www.espruino.com/Reference#l_Serial_print
   */
  print(string: any): void;

  /**
   * Print a line to the serial port with a newline (`\r\n`) at the end of it.
   *  **Note:** This function converts data to a string first, e.g.
   *  `Serial.print([1,2,3])` is equivalent to `Serial.print("1,2,3"). If you'd like
   *  to write raw bytes, use `Serial.write`.
   *
   * @param {any} string - A String to print
   * @url http://www.espruino.com/Reference#l_Serial_println
   */
  println(string: any): void;

  /**
   * Write a character or array of data to the serial port
   * This method writes unmodified data, e.g. `Serial.write([1,2,3])` is equivalent to
   * `Serial.write("\1\2\3")`. If you'd like data converted to a string first, use
   * `Serial.print`.
   *
   * @param {any} data - One or more items to write. May be ints, strings, arrays, or special objects (see `E.toUint8Array` for more info).
   * @url http://www.espruino.com/Reference#l_Serial_write
   */
  write(...data: any[]): void;

  /**
   * Add data to this device as if it came directly from the input - it will be
   * returned via `serial.on('data', ...)`;
   * ```
   * Serial1.on('data', function(d) { print("Got",d); });
   * Serial1.inject('Hello World');
   * // prints "Got Hel","Got lo World" (characters can be split over multiple callbacks)
   * ```
   * This is most useful if you wish to send characters to Espruino's REPL (console)
   * while it is on another device.
   *
   * @param {any} data - One or more items to write. May be ints, strings, arrays, or special objects (see `E.toUint8Array` for more info).
   * @url http://www.espruino.com/Reference#l_Serial_inject
   */
  inject(...data: any[]): void;

  /**
   * Return how many bytes are available to read. If there is already a listener for
   * data, this will always return 0.
   * @returns {number} How many bytes are available
   * @url http://www.espruino.com/Reference#l_Serial_available
   */
  available(): number;

  /**
   * Return a string containing characters that have been received
   *
   * @param {number} chars - The number of characters to read, or undefined/0 for all available
   * @returns {any} A string containing the required bytes.
   * @url http://www.espruino.com/Reference#l_Serial_read
   */
  read(chars: number): any;

  /**
   * Pipe this USART to a stream (an object with a 'write' method)
   *
   * @param {any} destination - The destination file/stream that will receive content from the source.
   * @param {any} [options]
   * [optional] An object `{ chunkSize : int=32, end : bool=true, complete : function }`
   * chunkSize : The amount of data to pipe from source to destination at a time
   * complete : a function to call when the pipe activity is complete
   * end : call the 'end' function on the destination when the source is finished
   * @url http://www.espruino.com/Reference#l_Serial_pipe
   */
  pipe(destination: any, options?: PipeOptions): void

  /**
   * Flush this serial stream (pause execution until all data has been sent)
   * @url http://www.espruino.com/Reference#l_Serial_flush
   */
  flush(): void;
}

/**
 * (2v21+ only) This class allows Espruino to control stepper motors.
 * ```
 * // initialise
 * var s = new Stepper({
 *   pins : [D1,D0,D2,D3],
 *   freq : 200
 * });
 * // step 1000 steps...
 * s.moveTo(1000, {turnOff:true}).then(() => {
 *   print("Done!");
 * });
 * ```
 * On Espruino before 2v20 you can still use the Stepper Motor module at https://www.espruino.com/StepperMotor - it just isn't quite as fast.
 * @url http://www.espruino.com/Reference#Stepper
 */
declare class Stepper {
  /**
   * Create a `Stepper` class. `options` can contain:
   * ```
   * ... = new Stepper({
   *   pins : [...], // required - 4 element array of pins
   *   pattern : [...], // optional - a 4/8 element array of step patterns
   *   offpattern : 0, // optional (default 0) - the pattern to output to stop driving the stepper motor
   *   freq : 500,   // optional (default 100) steps per second
   * })
   * ```
   * `pins` must be supplied as a 4 element array of pins. When created,
   * if pin state has not been set manually on each pin, the pins will
   * be set to outputs.
   * If `pattern` isn't specified, a default pattern of `[0b0001,0b0010,0b0100,0b1000]` will be used. You
   * can specify different patterns, for example `[0b1100,0b1000,0b1001,0b0001,0b0011,0b0010,0b0110,0b0100]`.
   * @constructor
   *
   * @param {any} options - options struct `{pins:[1,2,3,4]}`
   * @returns {any} An Stepper object
   * @url http://www.espruino.com/Reference#l_Stepper_Stepper
   */
  static new(options: any): any;

  /**
   * Move a a certain number of steps in either direction. `position` is remembered, so
   * `s.moveTo(1000)` will move 1000 steps forward the first time it is called, but
   * `s.moveTo(1500)` called afterwards will only move 500 steps.
   * , `options` can be:
   * ```
   * s.moveTo(steps, {
   *   freq : 100, // optional (frequency in Hz) step frequency
   *   turnOff : true, // optional (default false) turn off stepper after this movement?
   *   relative : true, // optional (default false) the step number is relative (not absolute)
   * }).then(() => {
   *   // movement finished...
   * });
   * ```
   *
   * @param {number} position - The position in steps to move to (can be either positive or negative)
   * @param {any} options - Optional options struct
   * @returns {any} A Promise that resolves when the stepper has finished moving
   * @url http://www.espruino.com/Reference#l_Stepper_moveTo
   */
  moveTo(position: number, options: any): Promise<void>;

  /**
   * Stop a stepper motor that is currently running.
   * You can specify `.stop({turnOff:true})` to force the stepper motor to turn off.
   *
   * @param {any} options - Optional options struct
   * @url http://www.espruino.com/Reference#l_Stepper_stop
   */
  stop(options: any): void;

  /**
   * Get the current position of the stepper motor in steps
   * @returns {number} The current position of the stepper motor in steps
   * @url http://www.espruino.com/Reference#l_Stepper_getPosition
   */
  getPosition(): number;
}

interface StringConstructor {
  /**
   * Return the character(s) represented by the given character code(s).
   *
   * @param {any} code - One or more character codes to create a string from (range 0-255).
   * @returns {any} The character
   * @url http://www.espruino.com/Reference#l_String_fromCharCode
   */
  fromCharCode(...code: any[]): any;

  /**
   * Create a new String
   * @constructor
   *
   * @param {any} str - A value to turn into a string. If undefined or not supplied, an empty String is created.
   * @returns {any} A String
   * @url http://www.espruino.com/Reference#l_String_String
   */
  new(...str: any[]): any;
  (arg?: any): string;
}

interface String {
  /**
   * Find the length of the string
   * @returns {any} The value of the string
   * @url http://www.espruino.com/Reference#l_String_length
   */
  length: any;

  /**
   * Return a single character at the given position in the String.
   *
   * @param {number} pos - The character number in the string. Negative values return characters from end of string (-1 = last char)
   * @returns {any} The character in the string
   * @url http://www.espruino.com/Reference#l_String_charAt
   */
  charAt(pos: number): any;

  /**
   * Return the integer value of a single character at the given position in the
   * String.
   *
   * @param {number} pos - The character number in the string. Negative values return characters from end of string (-1 = last char)
   * @returns {any} The integer value of a character in the string, or `NaN` if out of bounds
   * @url http://www.espruino.com/Reference#l_String_charCodeAt
   */
  charCodeAt(pos: number): any;

  /**
   * Return the index of substring in this string, or -1 if not found
   *
   * @param {any} substring - The string to search for
   * @param {any} fromIndex - Index to search from
   * @returns {number} The index of the string, or -1 if not found
   * @url http://www.espruino.com/Reference#l_String_indexOf
   */
  indexOf(substring: any, fromIndex: any): number;

  /**
   * Return the last index of substring in this string, or -1 if not found
   *
   * @param {any} substring - The string to search for
   * @param {any} fromIndex - Index to search from
   * @returns {number} The index of the string, or -1 if not found
   * @url http://www.espruino.com/Reference#l_String_lastIndexOf
   */
  lastIndexOf(substring: any, fromIndex: any): number;

  /**
   * Matches an occurrence `subStr` in the string.
   * Returns `null` if no match, or:
   * ```
   * "abcdef".match("b") == [
   *   "b",         // array index 0 - the matched string
   *   index: 1,    // the start index of the match
   *   input: "b"   // the input string
   *  ]
   * "abcdefabcdef".match(/bcd/) == [
   *   "bcd", index: 1,
   *   input: "abcdefabcdef"
   *  ]
   * ```
   * 'Global' RegExp matches just return an array of matches (with no indices):
   * ```
   * "abcdefabcdef".match(/bcd/g) = [
   *   "bcd",
   *   "bcd"
   *  ]
   * ```
   *
   * @param {any} substr - Substring or RegExp to match
   * @returns {any} A match array or `null` (see below):
   * @url http://www.espruino.com/Reference#l_String_match
   */
  match(substr: any): any;

  /**
   * Search and replace ONE occurrence of `subStr` with `newSubStr` and return the
   * result. This doesn't alter the original string.
   *
   * @param {any} subStr - The string (or Regular Expression) to search for
   * @param {any} newSubStr - The string to replace it with. Replacer functions are supported, but only when subStr is a `RegExp`
   * @returns {any} This string with `subStr` replaced
   * @url http://www.espruino.com/Reference#l_String_replace
   */
  replace(subStr: any, newSubStr: any): any;

  /**
   * Search and replace ALL occurrences of `subStr` with `newSubStr` and return the
   * result. This doesn't alter the original string.
   *
   * @param {any} subStr - The string (or Regular Expression) to search for
   * @param {any} newSubStr - The string to replace it with. Replacer functions are supported, but only when subStr is a `RegExp`
   * @returns {any} This string with `subStr` replaced
   * @url http://www.espruino.com/Reference#l_String_replaceAll
   */
  replaceAll(subStr: any, newSubStr: any): any;

  /**
   *
   * @param {number} start - The start character index (inclusive)
   * @param {any} end - The end character index (exclusive)
   * @returns {any} The part of this string between start and end
   * @url http://www.espruino.com/Reference#l_String_substring
   */
  substring(start: number, end: any): any;

  /**
   *
   * @param {number} start - The start character index
   * @param {any} len - The number of characters
   * @returns {any} Part of this string from start for len characters
   * @url http://www.espruino.com/Reference#l_String_substr
   */
  substr(start: number, len: any): any;

  /**
   *
   * @param {number} start - The start character index, if negative it is from the end of the string
   * @param {any} [end] - [optional] The end character index, if negative it is from the end of the string, and if omitted it is the end of the string
   * @returns {any} Part of this string from start for len characters
   * @url http://www.espruino.com/Reference#l_String_slice
   */
  slice(start: number, end?: any): any;

  /**
   * Return an array made by splitting this string up by the separator. e.g.
   * ```'1,2,3'.split(',')==['1', '2', '3']```
   * Regular Expressions can also be used to split strings, e.g. `'1a2b3
   * 4'.split(/[^0-9]/)==['1', '2', '3', '4']`.
   *
   * @param {any} separator - The separator `String` or `RegExp` to use
   * @returns {any} Part of this string from start for len characters
   * @url http://www.espruino.com/Reference#l_String_split
   */
  split(separator: any): any;

  /**
   *
   * @returns {any} The lowercase version of this string
   * @url http://www.espruino.com/Reference#l_String_toLowerCase
   */
  toLowerCase(): any;

  /**
   *
   * @returns {any} The uppercase version of this string
   * @url http://www.espruino.com/Reference#l_String_toUpperCase
   */
  toUpperCase(): any;

  /**
   * This is not a standard JavaScript function, but is provided to allow use of fonts
   * that only support ASCII (char codes 0..127, like the 4x6 font) with character input
   * that might be in the ISO8859-1 range.
   * @returns {any} This string with the accents/diacritics (such as é, ü) removed from characters in the ISO 8859-1 set
   * @url http://www.espruino.com/Reference#l_String_removeAccents
   */
  removeAccents(): any;

  /**
   * Return a new string with any whitespace (tabs, space, form feed, newline,
   * carriage return, etc) removed from the beginning and end.
   * @returns {any} A String with Whitespace removed from the beginning and end
   * @url http://www.espruino.com/Reference#l_String_trim
   */
  trim(): string;

  /**
   * Append all arguments to this `String` and return the result. Does not modify the
   * original `String`.
   *
   * @param {any} args - Strings to append
   * @returns {any} The result of appending all arguments to this string
   * @url http://www.espruino.com/Reference#l_String_concat
   */
  concat(...args: any[]): any;

  /**
   *
   * @param {any} searchString - The string to search for
   * @param {number} position - The start character index (or 0 if not defined)
   * @returns {boolean} `true` if the given characters are found at the beginning of the string, otherwise, `false`.
   * @url http://www.espruino.com/Reference#l_String_startsWith
   */
  startsWith(searchString: any, position: number): boolean;

  /**
   *
   * @param {any} searchString - The string to search for
   * @param {any} length - The 'end' of the string - if left off the actual length of the string is used
   * @returns {boolean} `true` if the given characters are found at the end of the string, otherwise, `false`.
   * @url http://www.espruino.com/Reference#l_String_endsWith
   */
  endsWith(searchString: any, length: any): boolean;

  /**
   *
   * @param {any} substring - The string to search for
   * @param {any} fromIndex - The start character index (or 0 if not defined)
   * @returns {boolean} `true` if the given characters are in the string, otherwise, `false`.
   * @url http://www.espruino.com/Reference#l_String_includes
   */
  includes(substring: any, fromIndex: any): boolean;

  /**
   * Repeat this string the given number of times.
   *
   * @param {number} count - An integer with the amount of times to repeat this String
   * @returns {any} A string containing repetitions of this string
   * @url http://www.espruino.com/Reference#l_String_repeat
   */
  repeat(count: number): string;

  /**
   * Pad this string at the beginning to the required number of characters
   * ```
   * "Hello".padStart(10) == "     Hello"
   * "123".padStart(10,".-") == ".-.-.-.123"
   * ```
   *
   * @param {number} targetLength - The length to pad this string to
   * @param {any} [padString] - [optional] The string to pad with, default is `' '`
   * @returns {any} A string containing this string padded to the correct length
   * @url http://www.espruino.com/Reference#l_String_padStart
   */
  padStart(targetLength: number, padString?: any): string;

  /**
   * Pad this string at the end to the required number of characters
   * ```
   * "Hello".padEnd(10) == "Hello     "
   * "123".padEnd(10,".-") == "123.-.-.-."
   * ```
   *
   * @param {number} targetLength - The length to pad this string to
   * @param {any} [padString] - [optional] The string to pad with, default is `' '`
   * @returns {any} A string containing this string padded to the correct length
   * @url http://www.espruino.com/Reference#l_String_padEnd
   */
  padEnd(targetLength: number, padString?: any): string;
}

/**
 * This is the built-in class for Text Strings.
 * Text Strings in Espruino are not zero-terminated, so you can store zeros in
 * them.
 * @url http://www.espruino.com/Reference#String
 */
declare const String: StringConstructor

interface RegExpConstructor {
  /**
   * Creates a RegExp object, for handling Regular Expressions
   * @constructor
   *
   * @param {any} regex - A regular expression as a string
   * @param {any} flags - Flags for the regular expression as a string
   * @returns {any} A RegExp object
   * @url http://www.espruino.com/Reference#l_RegExp_RegExp
   */
  new(...value: any[]): RegExp;
  (value: any): RegExp;
}

interface RegExp {
  /**
   * Test this regex on a string - returns a result array on success, or `null`
   * otherwise.
   * `/Wo/.exec("Hello World")` will return:
   * ```
   * [
   *  "Wo",
   *  "index": 6,
   *  "input": "Hello World"
   * ]
   * ```
   * Or with groups `/W(o)rld/.exec("Hello World")` returns:
   * ```
   * [
   *  "World",
   *  "o", "index": 6,
   *  "input": "Hello World"
   * ]
   * ```
   *
   * @param {any} str - A string to match on
   * @returns {any} A result array, or null
   * @url http://www.espruino.com/Reference#l_RegExp_exec
   */
  exec(str: any): any;

  /**
   * Test this regex on a string - returns `true` on a successful match, or `false`
   * otherwise
   *
   * @param {any} str - A string to match on
   * @returns {boolean} true for a match, or false
   * @url http://www.espruino.com/Reference#l_RegExp_test
   */
  test(str: any): boolean;
}

/**
 * The built-in class for handling Regular Expressions
 * **Note:** Espruino's regular expression parser does not contain all the features
 * present in a full ES6 JS engine. However it does contain support for the all the
 * basics.
 * @url http://www.espruino.com/Reference#RegExp
 */
declare const RegExp: RegExpConstructor

interface NumberConstructor {
  /**
   * @returns {number} Not a  Number
   * @url http://www.espruino.com/Reference#l_Number_NaN
   */
  NaN: number;

  /**
   * @returns {number} Maximum representable value
   * @url http://www.espruino.com/Reference#l_Number_MAX_VALUE
   */
  MAX_VALUE: number;

  /**
   * @returns {number} Smallest representable value
   * @url http://www.espruino.com/Reference#l_Number_MIN_VALUE
   */
  MIN_VALUE: number;

  /**
   * @returns {number} Negative Infinity (-1/0)
   * @url http://www.espruino.com/Reference#l_Number_NEGATIVE_INFINITY
   */
  NEGATIVE_INFINITY: number;

  /**
   * @returns {number} Positive Infinity (1/0)
   * @url http://www.espruino.com/Reference#l_Number_POSITIVE_INFINITY
   */
  POSITIVE_INFINITY: number;

  /**
   * Creates a number
   * @constructor
   *
   * @param {any} value - A single value to be converted to a number
   * @returns {any} A Number object
   * @url http://www.espruino.com/Reference#l_Number_Number
   */
  new(...value: any[]): Number;
  (value: any): number;
}

interface Number {
  /**
   * Format the number as a fixed point number
   *
   * @param {number} decimalPlaces - A number between 0 and 20 specifying the number of decimal digits after the decimal point
   * @returns {any} A string
   * @url http://www.espruino.com/Reference#l_Number_toFixed
   */
  toFixed(decimalPlaces: number): any;
}

/**
 * This is the built-in JavaScript class for numbers.
 * @url http://www.espruino.com/Reference#Number
 */
declare const Number: NumberConstructor

/**
 * This is the built-in class for Pins, such as D0,D1,LED1, or BTN
 * You can call the methods on Pin, or you can use Wiring-style functions such as
 * digitalWrite
 * @url http://www.espruino.com/Reference#Pin
 */
declare class Pin {
  /**
   * Creates a pin from the given argument (or returns undefined if no argument)
   * @constructor
   *
   * @param {any} value - A value to be converted to a pin. Can be a number, pin, or String.
   * @returns {any} A Pin object
   * @url http://www.espruino.com/Reference#l_Pin_Pin
   */
  static new(value: any): any;

  /**
   * Returns the input state of the pin as a boolean.
   *  **Note:** if you didn't call `pinMode` beforehand then this function will also
   *  reset the pin's state to `"input"`
   * @returns {boolean} Whether pin is a logical 1 or 0
   * @url http://www.espruino.com/Reference#l_Pin_read
   */
  read(): boolean;

  /**
   * Sets the output state of the pin to a 1
   *  **Note:** if you didn't call `pinMode` beforehand then this function will also
   *  reset the pin's state to `"output"`
   * @url http://www.espruino.com/Reference#l_Pin_set
   */
  set(): void;

  /**
   * Sets the output state of the pin to a 0
   *  **Note:** if you didn't call `pinMode` beforehand then this function will also
   *  reset the pin's state to `"output"`
   * @url http://www.espruino.com/Reference#l_Pin_reset
   */
  reset(): void;

  /**
   * Sets the output state of the pin to the parameter given
   *  **Note:** if you didn't call `pinMode` beforehand then this function will also
   *  reset the pin's state to `"output"`
   *
   * @param {boolean} value - Whether to set output high (true/1) or low (false/0)
   * @url http://www.espruino.com/Reference#l_Pin_write
   */
  write(value: boolean): void;

  /**
   * Sets the output state of the pin to the parameter given at the specified time.
   *  **Note:** this **doesn't** change the mode of the pin to an output. To do that,
   *  you need to use `pin.write(0)` or `pinMode(pin, 'output')` first.
   *
   * @param {boolean} value - Whether to set output high (true/1) or low (false/0)
   * @param {number} time - Time at which to write
   * @url http://www.espruino.com/Reference#l_Pin_writeAtTime
   */
  writeAtTime(value: boolean, time: number): void;

  /**
   * Return the current mode of the given pin. See `pinMode` for more information.
   * @returns {any} The pin mode, as a string
   * @url http://www.espruino.com/Reference#l_Pin_getMode
   */
  getMode(): any;

  /**
   * Set the mode of the given pin. See [`pinMode`](#l__global_pinMode) for more
   * information on pin modes.
   *
   * @param {any} mode - The mode - a string that is either 'analog', 'input', 'input_pullup', 'input_pulldown', 'output', 'opendrain', 'af_output' or 'af_opendrain'. Do not include this argument if you want to revert to automatic pin mode setting.
   * @url http://www.espruino.com/Reference#l_Pin_mode
   */
  mode(mode: any): void;

  /**
   * Toggles the state of the pin from off to on, or from on to off.
   * **Note:** This method doesn't currently work on the ESP8266 port of Espruino.
   * **Note:** if you didn't call `pinMode` beforehand then this function will also
   * reset the pin's state to `"output"`
   * @returns {boolean} True if the pin is high after calling the function
   * @url http://www.espruino.com/Reference#l_Pin_toggle
   */
  toggle(): boolean;

  /**
   * (Added in 2v20) Pulse the pin with the value for the given time in milliseconds.
   * ```
   * LED.pulse(1, 100); // pulse LED on for 100ms
   * LED.pulse(1, [100,1000,100]); // pulse LED on for 100ms, off for 1s, on for 100ms
   * ```
   * This is identical to `digitalPulse`.
   *
   * @param {boolean} value - Whether to pulse high (true) or low (false)
   * @param {any} time - A time in milliseconds, or an array of times (in which case a square wave will be output starting with a pulse of 'value')
   * @url http://www.espruino.com/Reference#l_Pin_pulse
   */
  pulse(value: boolean, time: any): void;

  /**
   * (Added in 2v20) Get the analogue value of the given pin. See `analogRead` for more information.
   * @returns {number} The analog Value of the Pin between 0 and 1
   * @url http://www.espruino.com/Reference#l_Pin_analog
   */
  analog(): number;

  /**
   * (Added in 2v20) Set the analog Value of a pin. It will be output using PWM.
   * See `analogWrite` for more information.
   * Objects can contain:
   * * `freq` - pulse frequency in Hz, e.g. ```analogWrite(A0,0.5,{ freq : 10 });``` -
   *   specifying a frequency will force PWM output, even if the pin has a DAC
   * * `soft` - boolean, If true software PWM is used if hardware is not available.
   * * `forceSoft` - boolean, If true software PWM is used even if hardware PWM or a
   *   DAC is available
   *
   * @param {number} value - A value between 0 and 1
   * @param {any} options
   * An object containing options for analog output - see below
   * @url http://www.espruino.com/Reference#l_Pin_pwm
   */
  pwm(value: number, options: any): void;

  /**
   * Get information about this pin and its capabilities. Of the form:
   * ```
   * {
   *   "port"      : "A", // the Pin's port on the chip
   *   "num"       : 12, // the Pin's number
   *   "in_addr"   : 0x..., // (if available) the address of the pin's input address in bit-banded memory (can be used with peek)
   *   "out_addr"  : 0x..., // (if available) the address of the pin's output address in bit-banded memory (can be used with poke)
   *   "analog"    : { ADCs : [1], channel : 12 }, // If analog input is available
   *   "functions" : {
   *     "TIM1":{type:"CH1, af:0},
   *     "I2C3":{type:"SCL", af:1}
   *   }
   * }
   * ```
   * Will return undefined if pin is not valid.
   * @returns {any} An object containing information about this pins
   * @url http://www.espruino.com/Reference#l_Pin_getInfo
   */
  getInfo(): any;
}

interface BooleanConstructor {
  /**
   * Creates a boolean
   * @constructor
   *
   * @param {any} value - A single value to be converted to a number
   * @returns {boolean} A Boolean object
   * @url http://www.espruino.com/Reference#l_Boolean_Boolean
   */
  new(...value: any[]): Number;
  (value: any): boolean;
}

interface Boolean {

}


declare const Boolean: BooleanConstructor

// GLOBALS

/**
 * The pin marked SDA on the Arduino pin footprint. This is connected directly to
 * pin A4.
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_SDA
 */
declare const SDA: Pin;

/**
 * The pin marked SDA on the Arduino pin footprint. This is connected directly to
 * pin A5.
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_SCL
 */
declare const SCL: Pin;

/**
 * **Note:** This function is only available on the [BBC micro:bit](/MicroBit)
 * board
 * Show an image on the in-built 5x5 LED screen.
 * Image can be:
 * * A number where each bit represents a pixel (so 25 bits). e.g. `5` or
 *   `0x1FFFFFF`
 * * A string, e.g: `show("10001")`. Newlines are ignored, and anything that is not
 * a space or `0` is treated as a 1.
 * * An array of 4 bytes (more will be ignored), e.g `show([1,2,3,0])`
 * For instance the following works for images:
 * ```
 * show("#   #"+
 *      "  #  "+
 *      "  #  "+
 *      "#   #"+
 *      " ### ")
 * ```
 * This means you can also use Espruino's graphics library:
 * ```
 * var g = Graphics.createArrayBuffer(5,5,1)
 * g.drawString("E",0,0)
 * show(g.buffer)
 * ```
 *
 * @param {any} image - The image to show
 * @url http://www.espruino.com/Reference#l__global_show
 */
declare function show(image: any): void;

/**
 * **Note:** This function is only available on the [BBC micro:bit](/MicroBit)
 * board
 * Get the current acceleration of the micro:bit from the on-board accelerometer
 * **This is deprecated.** Please use `Microbit.accel` instead.
 * @returns {any} An object with x, y, and z fields in it
 * @url http://www.espruino.com/Reference#l__global_acceleration
 */
declare function acceleration(): any;

/**
 * **Note:** This function is only available on the [BBC micro:bit](/MicroBit)
 * board
 * Get the current compass position for the micro:bit from the on-board
 * magnetometer
 * **This is deprecated.** Please use `Microbit.mag` instead.
 * @returns {any} An object with x, y, and z fields in it
 * @url http://www.espruino.com/Reference#l__global_compass
 */
declare function compass(): any;

/**
 * On Puck.js V2 (not v1.0) this is the pin that controls the FET, for high-powered
 * outputs.
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_FET
 */
declare const FET: Pin;

/**
 * `Q0` and `Q1` Qwiic connectors can have their power controlled by a 500mA FET (`Q0.fet`) which switches GND.
 * The `sda` and `scl` pins on this port are also analog inputs - use `analogRead(Q0.sda)`/etc
 * To turn this connector on run `Q0.setPower(1)`
 * @returns {any} An object containing the pins for the Q0 connector on Jolt.js `{sda,scl,fet}`
 * @url http://www.espruino.com/Reference#l__global_Q0
 */
declare const Q0: Qwiic;

/**
 * `Q0` and `Q1` Qwiic connectors can have their power controlled by a 500mA FET (`Q1.fet`) which switches GND.
 * The `sda` and `scl` pins on this port are also analog inputs - use `analogRead(Q1.sda)`/etc
 * To turn this connector on run `Q1.setPower(1)`
 * @returns {any} An object containing the pins for the Q1 connector on Jolt.js `{sda,scl,fet}`
 * @url http://www.espruino.com/Reference#l__global_Q1
 */
declare const Q1: Qwiic;

/**
 * `Q2` and `Q3` have all 4 pins connected to Jolt.js's GPIO (including those usually used for power).
 * As such only around 8mA of power can be supplied to any connected device.
 * To use this as a normal Qwiic connector, run `Q2.setPower(1)`
 * @returns {any} An object containing the pins for the Q2 connector on Jolt.js `{sda,scl,gnd,vcc}`
 * @url http://www.espruino.com/Reference#l__global_Q2
 */
declare const Q2: Qwiic;

/**
 * `Q2` and `Q3` have all 4 pins connected to Jolt.js's GPIO (including those usually used for power).
 * As such only around 8mA of power can be supplied to any connected device.
 * To use this as a normal Qwiic connector, run `Q3.setPower(1)`
 * @returns {any} An object containing the pins for the Q3 connector on Jolt.js `{sda,scl,gnd,vcc}`
 * @url http://www.espruino.com/Reference#l__global_Q3
 */
declare const Q3: Qwiic;

/**
 * The Bangle.js's vibration motor.
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_VIBRATE
 */
declare const VIBRATE: Pin;

/**
 * On most Espruino board there are LEDs, in which case `LED` will be an actual
 * Pin.
 * On Bangle.js there are no LEDs, so to remain compatible with example code that
 * might expect an LED, this is an object that behaves like a pin, but which just
 * displays a circle on the display
 * @returns {any} A `Pin` object for a fake LED which appears on
 * @url http://www.espruino.com/Reference#l__global_LED
 */
declare const LED: any;

/**
 * On most Espruino board there are LEDs, in which case `LED1` will be an actual
 * Pin.
 * On Bangle.js there are no LEDs, so to remain compatible with example code that
 * might expect an LED, this is an object that behaves like a pin, but which just
 * displays a circle on the display
 * @returns {any} A `Pin` object for a fake LED which appears on
 * @url http://www.espruino.com/Reference#l__global_LED1
 */
declare const LED1: any;

/**
 * On most Espruino board there are LEDs, in which case `LED2` will be an actual
 * Pin.
 * On Bangle.js there are no LEDs, so to remain compatible with example code that
 * might expect an LED, this is an object that behaves like a pin, but which just
 * displays a circle on the display
 * @returns {any} A `Pin` object for a fake LED which appears on
 * @url http://www.espruino.com/Reference#l__global_LED2
 */
declare const LED2: any;

/**
 * The pin connected to the 'A' button. Reads as `1` when pressed, `0` when not
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_BTNA
 */
declare const BTNA: Pin;

/**
 * The pin connected to the 'B' button. Reads as `1` when pressed, `0` when not
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_BTNB
 */
declare const BTNB: Pin;

/**
 * The pin connected to the up button. Reads as `1` when pressed, `0` when not
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_BTNU
 */
declare const BTNU: Pin;

/**
 * The pin connected to the down button. Reads as `1` when pressed, `0` when not
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_BTND
 */
declare const BTND: Pin;

/**
 * The pin connected to the left button. Reads as `1` when pressed, `0` when not
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_BTNL
 */
declare const BTNL: Pin;

/**
 * The pin connected to the right button. Reads as `1` when pressed, `0` when not
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_BTNR
 */
declare const BTNR: Pin;

/**
 * The pin connected to Corner #1
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_CORNER1
 */
declare const CORNER1: Pin;

/**
 * The pin connected to Corner #2
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_CORNER2
 */
declare const CORNER2: Pin;

/**
 * The pin connected to Corner #3
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_CORNER3
 */
declare const CORNER3: Pin;

/**
 * The pin connected to Corner #4
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_CORNER4
 */
declare const CORNER4: Pin;

/**
 * The pin connected to Corner #5
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_CORNER5
 */
declare const CORNER5: Pin;

/**
 * The pin connected to Corner #6
 * @returns {Pin}
 * @url http://www.espruino.com/Reference#l__global_CORNER6
 */
declare const CORNER6: Pin;

/**
 * The Bluetooth Serial port - used when data is sent or received over Bluetooth
 * Smart on nRF51/nRF52 chips.
 * @url http://www.espruino.com/Reference#l__global_Bluetooth
 */
declare const Bluetooth: Serial;

/**
 * @returns {Pin} A Pin
 * @url http://www.espruino.com/Reference#l__global_MOS1
 */
declare const MOS1: Pin;

/**
 * @returns {Pin} A Pin
 * @url http://www.espruino.com/Reference#l__global_MOS2
 */
declare const MOS2: Pin;

/**
 * @returns {Pin} A Pin
 * @url http://www.espruino.com/Reference#l__global_MOS3
 */
declare const MOS3: Pin;

/**
 * @returns {Pin} A Pin
 * @url http://www.espruino.com/Reference#l__global_MOS4
 */
declare const MOS4: Pin;

/**
 * @returns {Pin} A Pin
 * @url http://www.espruino.com/Reference#l__global_IOEXT0
 */
declare const IOEXT0: Pin;

/**
 * @returns {Pin} A Pin
 * @url http://www.espruino.com/Reference#l__global_IOEXT1
 */
declare const IOEXT1: Pin;

/**
 * @returns {Pin} A Pin
 * @url http://www.espruino.com/Reference#l__global_IOEXT2
 */
declare const IOEXT2: Pin;

/**
 * @returns {Pin} A Pin
 * @url http://www.espruino.com/Reference#l__global_IOEXT3
 */
declare const IOEXT3: Pin;

/**
 * A simple VT100 terminal emulator.
 * When data is sent to the `Terminal` object, `Graphics.getInstance()` is called
 * and if an instance of `Graphics` is found then characters are written to it.
 * @url http://www.espruino.com/Reference#l__global_Terminal
 */
declare const Terminal: Serial;

/**
 * When Espruino is busy, set the pin specified here high. Set this to undefined to
 * disable the feature.
 *
 * @param {any} pin
 * @url http://www.espruino.com/Reference#l__global_setBusyIndicator
 */
declare function setBusyIndicator(pin: any): void;

/**
 * When Espruino is asleep, set the pin specified here low (when it's awake, set it
 * high). Set this to undefined to disable the feature.
 * Please see http://www.espruino.com/Power+Consumption for more details on this.
 *
 * @param {any} pin
 * @url http://www.espruino.com/Reference#l__global_setSleepIndicator
 */
declare function setSleepIndicator(pin: any): void;

/**
 * Set whether we can enter deep sleep mode, which reduces power consumption to
 * around 100uA. This only works on STM32 Espruino Boards (nRF52 boards sleep
 * automatically).
 * Please see http://www.espruino.com/Power+Consumption for more details on this.
 *
 * @param {boolean} sleep
 * @url http://www.espruino.com/Reference#l__global_setDeepSleep
 */
declare function setDeepSleep(sleep: boolean): void;

/**
 * Output current interpreter state in a text form such that it can be copied to a
 * new device
 * Espruino keeps its current state in RAM (even if the function code is stored in
 * Flash). When you type `dump()` it dumps the current state of code in RAM plus
 * the hardware state, then if there's code saved in flash it writes "// Code saved
 * with E.setBootCode" and dumps that too.
 * **Note:** 'Internal' functions are currently not handled correctly. You will
 * need to recreate these in the `onInit` function.
 * @url http://www.espruino.com/Reference#l__global_dump
 */
declare function dump(): void;

/**
 * Restart and load the program out of flash - this has an effect similar to
 * completely rebooting Espruino (power off/power on), but without actually
 * performing a full reset of the hardware.
 * This command only executes when the Interpreter returns to the Idle state - for
 * instance ```a=1;load();a=2;``` will still leave 'a' as undefined (or what it was
 * set to in the saved program).
 * Espruino will resume from where it was when you last typed `save()`. If you want
 * code to be executed right after loading (for instance to initialise devices
 * connected to Espruino), add an `init` event handler to `E` with `E.on('init',
 * function() { ... your_code ... });`. This will then be automatically executed by
 * Espruino every time it starts.
 * **If you specify a filename in the argument then that file will be loaded from
 * Storage after reset** in much the same way as calling `reset()` then
 * `eval(require("Storage").read(filename))`
 *
 * @param {any} [filename] - [optional] The name of a text JS file to load from Storage after reset
 * @url http://www.espruino.com/Reference#l__global_load
 */
declare function load(filename?: any): void;

/**
 * Save the state of the interpreter into flash (including the results of calling
 * `setWatch`, `setInterval`, `pinMode`, and any listeners). The state will then be
 * loaded automatically every time Espruino powers on or is hard-reset. To see what
 * will get saved you can call `dump()`.
 * **Note:** If you set up intervals/etc in `onInit()` and you have already called
 * `onInit` before running `save()`, when Espruino resumes there will be two copies
 * of your intervals - the ones from before the save, and the ones from after -
 * which may cause you problems.
 * For more information about this and other options for saving, please see the
 * [Saving code on Espruino](https://www.espruino.com/Saving) page.
 * This command only executes when the Interpreter returns to the Idle state - for
 * instance ```a=1;save();a=2;``` will save 'a' as 2.
 * When Espruino powers on, it will resume from where it was when you typed
 * `save()`. If you want code to be executed right after loading (for instance to
 * initialise devices connected to Espruino), add a function called `onInit`, or
 * add a `init` event handler to `E` with `E.on('init', function() { ... your_code
 * ... });`. This will then be automatically executed by Espruino every time it
 * starts.
 * In order to stop the program saved with this command being loaded automatically,
 * check out [the Troubleshooting
 * guide](https://www.espruino.com/Troubleshooting#espruino-stopped-working-after-i-typed-save-)
 * @url http://www.espruino.com/Reference#l__global_save
 */
declare function save(): void;

/**
 * Reset the interpreter - clear program memory in RAM, and do not load a saved
 * program from flash. This does NOT reset the underlying hardware (which allows
 * you to reset the device without it disconnecting from USB).
 * This command only executes when the Interpreter returns to the Idle state - for
 * instance ```a=1;reset();a=2;``` will still leave 'a' as undefined.
 * The safest way to do a full reset is to hit the reset button.
 * If `reset()` is called with no arguments, it will reset the board's state in RAM
 * but will not reset the state in flash. When next powered on (or when `load()` is
 * called) the board will load the previously saved code.
 * Calling `reset(true)` will cause *all saved code in flash memory to be cleared
 * as well*.
 *
 * @param {boolean} clearFlash - Remove saved code from flash as well
 * @url http://www.espruino.com/Reference#l__global_reset
 */
declare function reset(clearFlash: boolean): void;

/**
 * Fill the console with the contents of the given function, so you can edit it.
 * NOTE: This is a convenience function - it will not edit 'inner functions'. For
 * that, you must edit the 'outer function' and re-execute it.
 *
 * @param {any} funcName - The name of the function to edit (either a string or just the unquoted name)
 * @url http://www.espruino.com/Reference#l__global_edit
 */
declare function edit(funcName: any): void;

/**
 * Should Espruino echo what you type back to you? true = yes (Default), false =
 * no. When echo is off, the result of executing a command is not returned.
 * Instead, you must use 'print' to send output.
 *
 * @param {boolean} echoOn
 * @url http://www.espruino.com/Reference#l__global_echo
 */
declare function echo(echoOn: boolean): void;

/**
 * Return the current system time in Seconds (as a floating point number)
 * @returns {number}
 * @url http://www.espruino.com/Reference#l__global_getTime
 */
declare function getTime(): number;

/**
 * Set the current system time in seconds (`time` can be a floating point value).
 * This is used with `getTime`, the time reported from `setWatch`, as well as when
 * using `new Date()`.
 * `Date.prototype.getTime()` reports the time in milliseconds, so you can set the
 * time to a `Date` object using:
 * ```
 * setTime((new Date("Tue, 19 Feb 2019 10:57")).getTime()/1000)
 * ```
 * To set the timezone for all new Dates, use `E.setTimeZone(hours)`.
 *
 * @param {number} time
 * @url http://www.espruino.com/Reference#l__global_setTime
 */
declare function setTime(time: number): void;

/**
 * Get the serial number of this board
 * @returns {any} The board's serial number
 * @url http://www.espruino.com/Reference#l__global_getSerial
 */
declare function getSerial(): any;

/**
 * Call the function (or evaluate the string) specified REPEATEDLY after the
 * timeout in milliseconds.
 * For instance:
 * ```
 * setInterval(function () {
 *   console.log("Hello World");
 * }, 1000);
 * // or
 * setInterval('console.log("Hello World");', 1000);
 * // both print 'Hello World' every second
 * ```
 * You can also specify extra arguments that will be sent to the function when it
 * is executed. For example:
 * ```
 * setInterval(function (a,b) {
 *   console.log(a+" "+b);
 * }, 1000, "Hello", "World");
 * // prints 'Hello World' every second
 * ```
 * If you want to stop your function from being called, pass the number that was
 * returned by `setInterval` into the `clearInterval` function.
 *  **Note:** If `setDeepSleep(true)` has been called and the interval is greater
 *  than 5 seconds, Espruino may execute the interval up to 1 second late. This is
 *  because Espruino can only wake from deep sleep every second - and waking early
 *  would cause Espruino to waste power while it waited for the correct time.
 *
 * @param {any} function - A Function or String to be executed
 * @param {number} timeout - The time between calls to the function (max 3153600000000 = 100 years
 * @param {any} args - Optional arguments to pass to the function when executed
 * @returns {any} An ID that can be passed to clearInterval
 * @url http://www.espruino.com/Reference#l__global_setInterval
 */
declare function setInterval(func: string | Function, timeout: number, ...args: any[]): IntervalId;

/**
 * Call the function (or evaluate the string) specified ONCE after the timeout in
 * milliseconds.
 * For instance:
 * ```
 * setTimeout(function () {
 *   console.log("Hello World");
 * }, 1000);
 * // or
 * setTimeout('console.log("Hello World");', 1000);
 * // both print 'Hello World' after a second
 * ```
 * You can also specify extra arguments that will be sent to the function when it
 * is executed. For example:
 * ```
 * setTimeout(function (a,b) {
 *   console.log(a+" "+b);
 * }, 1000, "Hello", "World");
 * // prints 'Hello World' after 1 second
 * ```
 * If you want to stop the function from being called, pass the number that was
 * returned by `setTimeout` into the `clearTimeout` function.
 *  **Note:** If `setDeepSleep(true)` has been called and the interval is greater
 *  than 5 seconds, Espruino may execute the interval up to 1 second late. This is
 *  because Espruino can only wake from deep sleep every second - and waking early
 *  would cause Espruino to waste power while it waited for the correct time.
 *
 * @param {any} function - A Function or String to be executed
 * @param {number} timeout - The time until the function will be executed (max 3153600000000 = 100 years
 * @param {any} args - Optional arguments to pass to the function when executed
 * @returns {any} An ID that can be passed to clearTimeout
 * @url http://www.espruino.com/Reference#l__global_setTimeout
 */
declare function setTimeout(func: string | Function, timeout: number, ...args: any[]): TimeoutId;

/**
 * Clear the Interval that was created with `setInterval`, for example:
 * ```var id = setInterval(function () { print('foo'); }, 1000);```
 * ```clearInterval(id);```
 * If no argument is supplied, all timeouts and intervals are stopped.
 * To avoid accidentally deleting all Intervals, if a parameter is supplied but is `undefined` then an Exception will be thrown.
 *
 * @param {any} id - The id returned by a previous call to setInterval. **Only one argument is allowed.**
 * @url http://www.espruino.com/Reference#l__global_clearInterval
 */
declare function clearInterval(id: IntervalId): void;

/**
 * Clear the Timeout that was created with `setTimeout`, for example:
 * ```var id = setTimeout(function () { print('foo'); }, 1000);```
 * ```clearTimeout(id);```
 * If no argument is supplied, all timeouts and intervals are stopped.
 * To avoid accidentally deleting all Timeouts, if a parameter is supplied but is `undefined` then an Exception will be thrown.
 *
 * @param {any} id - The id returned by a previous call to setTimeout. **Only one argument is allowed.**
 * @url http://www.espruino.com/Reference#l__global_clearTimeout
 */
declare function clearTimeout(id: TimeoutId): void;

/**
 * Change the Interval on a callback created with `setInterval`, for example:
 * ```var id = setInterval(function () { print('foo'); }, 1000); // every second```
 * ```changeInterval(id, 1500); // now runs every 1.5 seconds```
 * This takes effect immediately and resets the timeout, so in the example above,
 * regardless of when you call `changeInterval`, the next interval will occur
 * 1500ms after it.
 *
 * @param {any} id - The id returned by a previous call to setInterval
 * @param {number} time - The new time period in ms
 * @url http://www.espruino.com/Reference#l__global_changeInterval
 */
declare function changeInterval(id: IntervalId, time: number): void;

/**
 * Read 8 bits of memory at the given location - DANGEROUS!
 *
 * @param {number} addr - The address in memory to read
 * @param {number} [count] - [optional] the number of items to read. If >1 a Uint8Array will be returned.
 * @returns {any} The value of memory at the given location
 * @url http://www.espruino.com/Reference#l__global_peek8
 */
declare function peek8(addr: number, count?: 1): number;
declare function peek8(addr: number, count: number): Uint8Array;

/**
 * Write 8 bits of memory at the given location - VERY DANGEROUS!
 *
 * @param {number} addr - The address in memory to write
 * @param {any} value - The value to write, or an array of values
 * @url http://www.espruino.com/Reference#l__global_poke8
 */
declare function poke8(addr: number, value: number | number[]): void;

/**
 * Read 16 bits of memory at the given location - DANGEROUS!
 *
 * @param {number} addr - The address in memory to read
 * @param {number} [count] - [optional] the number of items to read. If >1 a Uint16Array will be returned.
 * @returns {any} The value of memory at the given location
 * @url http://www.espruino.com/Reference#l__global_peek16
 */
declare function peek16(addr: number, count?: 1): number;
declare function peek16(addr: number, count: number): Uint8Array;

/**
 * Write 16 bits of memory at the given location - VERY DANGEROUS!
 *
 * @param {number} addr - The address in memory to write
 * @param {any} value - The value to write, or an array of values
 * @url http://www.espruino.com/Reference#l__global_poke16
 */
declare function poke16(addr: number, value: number | number[]): void;

/**
 * Read 32 bits of memory at the given location - DANGEROUS!
 *
 * @param {number} addr - The address in memory to read
 * @param {number} [count] - [optional] the number of items to read. If >1 a Uint32Array will be returned.
 * @returns {any} The value of memory at the given location
 * @url http://www.espruino.com/Reference#l__global_peek32
 */
declare function peek32(addr: number, count?: 1): number;
declare function peek32(addr: number, count: number): Uint8Array;

/**
 * Write 32 bits of memory at the given location - VERY DANGEROUS!
 *
 * @param {number} addr - The address in memory to write
 * @param {any} value - The value to write, or an array of values
 * @url http://www.espruino.com/Reference#l__global_poke32
 */
declare function poke32(addr: number, value: number | number[]): void;

/**
 * Get the analogue value of the given pin.
 * This is different to Arduino which only returns an integer between 0 and 1023
 * However only pins connected to an ADC will work (see the datasheet)
 * **Note:** if you didn't call `pinMode` beforehand then this function will also
 * reset pin's state to `"analog"`
 * **Note:** [Jolt.js](https://www.espruino.com/Jolt.js) motor driver pins with
 * analog inputs are scaled with a potential divider, and so those pins return a
 * number which is the actual voltage.
 *
 * @param {Pin} pin
 * The pin to use
 * You can find out which pins to use by looking at [your board's reference page](#boards) and searching for pins with the `ADC` markers.
 * @returns {number} The Analog Value of the Pin between 0(GND) and 1(VCC). See below.
 * @url http://www.espruino.com/Reference#l__global_analogRead
 */
declare function analogRead(pin: Pin): number;

/**
 * Set the analog Value of a pin. It will be output using PWM.
 * Objects can contain:
 * * `freq` - pulse frequency in Hz, e.g. ```analogWrite(A0,0.5,{ freq : 10 });``` -
 *   specifying a frequency will force PWM output, even if the pin has a DAC
 * * `soft` - boolean, If true software PWM is used if hardware is not available.
 * * `forceSoft` - boolean, If true software PWM is used even if hardware PWM or a
 *   DAC is available
 * On nRF52-based devices (Puck.js, Pixl.js, MDBT42Q, etc) hardware PWM runs at
 * 16MHz, with a maximum output frequency of 4MHz (but with only 2 bit (0..3) accuracy).
 * At 1Mhz, you have 4 bits (0..15), 1kHz = 14 bits and so on.
 *  **Note:** if you didn't call `pinMode` beforehand then this function will also
 *  reset pin's state to `"output"`
 *
 * @param {Pin} pin
 * The pin to use
 * You can find out which pins to use by looking at [your board's reference page](#boards) and searching for pins with the `PWM` or `DAC` markers.
 * @param {number} value - A value between 0 and 1
 * @param {any} options
 * An object containing options for analog output - see below
 * @url http://www.espruino.com/Reference#l__global_analogWrite
 */
declare function analogWrite(pin: Pin, value: number, options?: { freq?: number, soft?: boolean, forceSoft?: boolean }): void;

/**
 * Pulse the pin with the value for the given time in milliseconds. It uses a
 * hardware timer to produce accurate pulses, and returns immediately (before the
 * pulse has finished). Use `digitalPulse(A0,1,0)` to wait until a previous pulse
 * has finished.
 * e.g. `digitalPulse(A0,1,5);` pulses A0 high for 5ms.
 * `digitalPulse(A0,1,[5,2,4]);` pulses A0 high for 5ms, low for 2ms, and high for
 * 4ms
 *  **Note:** if you didn't call `pinMode` beforehand then this function will also
 *  reset pin's state to `"output"`
 * digitalPulse is for SHORT pulses that need to be very accurate. If you're doing
 * anything over a few milliseconds, use setTimeout instead.
 *
 * @param {Pin} pin - The pin to use
 * @param {boolean} value - Whether to pulse high (true) or low (false)
 * @param {any} time - A time in milliseconds, or an array of times (in which case a square wave will be output starting with a pulse of 'value')
 * @url http://www.espruino.com/Reference#l__global_digitalPulse
 */
declare function digitalPulse(pin: Pin, value: boolean, time: number | number[]): void;

/**
 * Set the digital value of the given pin.
 * ```
 * digitalWrite(LED1, 1); // light LED1
 * digitalWrite([LED1,LED2,LED3], 0b101); // lights LED1 and LED3
 * ```
 *  **Note:** if you didn't call `pinMode(pin, ...)` or `Pin.mode(...)` beforehand then this function will also
 * reset pin's state to `"output"`
 * If pin argument is an array of pins (e.g. `[A2,A1,A0]`) the value argument will
 * be treated as an array of bits where the last array element is the least
 * significant bit.
 * In this case, pin values are set least significant bit first (from the
 * right-hand side of the array of pins). This means you can use the same pin
 * multiple times, for example `digitalWrite([A1,A1,A0,A0],0b0101)` would pulse A0
 * followed by A1.
 * In 2v22 and later firmwares, using a boolean for the value will set *all* pins in
 * the array to the same value, eg `digitalWrite(pins, value?0xFFFFFFFF:0)`. Previously
 * digitalWrite with a boolean behaved like `digitalWrite(pins, value?1:0)` and would
 * only set the first pin.
 * If the pin argument is an object with a `write` method, the `write` method will
 * be called with the value passed through.
 *
 * @param {any} pin - The pin to use
 * @param {any} value - Whether to write a high (true) or low (false) value
 * @url http://www.espruino.com/Reference#l__global_digitalWrite
 */
declare function digitalWrite(pin: Pin, value: boolean): void;

/**
 * Get the digital value of the given pin.
 *  **Note:** if you didn't call `pinMode` beforehand then this function will also
 *  reset pin's state to `"input"`
 * If the pin argument is an array of pins (e.g. `[A2,A1,A0]`) the value returned
 * will be an number where the last array element is the least significant bit, for
 * example if `A0=A1=1` and `A2=0`, `digitalRead([A2,A1,A0]) == 0b011`
 * If the pin argument is an object with a `read` method, the `read` method will be
 * called and the integer value it returns passed back.
 *
 * @param {any} pin - The pin to use
 * @returns {number} The digital Value of the Pin
 * @url http://www.espruino.com/Reference#l__global_digitalRead
 */
declare function digitalRead(pin: Pin): number;

/**
 * Set the mode of the given pin.
 *  * `auto`/`undefined` - Don't change state, but allow `digitalWrite`/etc to
 *    automatically change state as appropriate
 *  * `analog` - Analog input
 *  * `input` - Digital input
 *  * `input_pullup` - Digital input with internal ~40k pull-up resistor
 *  * `input_pulldown` - Digital input with internal ~40k pull-down resistor
 *  * `output` - Digital output
 *  * `opendrain` - Digital output that only ever pulls down to 0v. Sending a
 *    logical `1` leaves the pin open circuit
 *  * `opendrain_pullup` - Digital output that pulls down to 0v. Sending a logical
 *    `1` enables internal ~40k pull-up resistor
 *  * `af_output` - Digital output from built-in peripheral
 *  * `af_opendrain` - Digital output from built-in peripheral that only ever pulls
 *    down to 0v. Sending a logical `1` leaves the pin open circuit
 *  **Note:** `digitalRead`/`digitalWrite`/etc set the pin mode automatically
 * *unless* `pinMode` has been called first. If you want `digitalRead`/etc to set
 * the pin mode automatically after you have called `pinMode`, simply call it again
 * with no mode argument (`pinMode(pin)`), `auto` as the argument (`pinMode(pin,
 * "auto")`), or with the 3rd 'automatic' argument set to true (`pinMode(pin,
 * "output", true)`).
 *
 * @param {Pin} pin - The pin to set pin mode for
 * @param {any} mode - The mode - a string that is either 'analog', 'input', 'input_pullup', 'input_pulldown', 'output', 'opendrain', 'af_output' or 'af_opendrain'. Do not include this argument or use 'auto' if you want to revert to automatic pin mode setting.
 * @param {boolean} automatic - Optional, default is false. If true, subsequent commands will automatically change the state (see notes below)
 * @url http://www.espruino.com/Reference#l__global_pinMode
 */
declare function pinMode(pin: Pin, mode?: PinMode | "auto", automatic?: boolean): void;

/**
 * Return the current mode of the given pin. See `pinMode` for more information on
 * returned values.
 *
 * @param {Pin} pin - The pin to check
 * @returns {any} The pin mode, as a string
 * @url http://www.espruino.com/Reference#l__global_getPinMode
 */
declare function getPinMode(pin: Pin): PinMode;

/**
 * Shift an array of data out using the pins supplied *least significant bit
 * first*, for example:
 * ```
 * // shift out to single clk+data
 * shiftOut(A0, { clk : A1 }, [1,0,1,0]);
 * ```
 * ```
 * // shift out a whole byte (like software SPI)
 * shiftOut(A0, { clk : A1, repeat: 8 }, [1,2,3,4]);
 * ```
 * ```
 * // shift out via 4 data pins
 * shiftOut([A3,A2,A1,A0], { clk : A4 }, [1,2,3,4]);
 * ```
 * `options` is an object of the form:
 * ```
 * {
 *   clk : pin, // a pin to use as the clock (undefined = no pin)
 *   clkPol : bool, // clock polarity - default is 0 (so 1 normally, pulsing to 0 to clock data in)
 *   repeat : int, // number of clocks per array item
 * }
 * ```
 * Each item in the `data` array will be output to the pins, with the first pin in
 * the array being the MSB and the last the LSB, then the clock will be pulsed in
 * the polarity given.
 * `repeat` is the amount of times shift data out for each array item. For instance
 * we may want to shift 8 bits out through 2 pins - in which case we need to set
 * repeat to 4.
 *
 * @param {any} pins - A pin, or an array of pins to use
 * @param {any} options - Options, for instance the clock (see below)
 * @param {any} data - The data to shift out (see `E.toUint8Array` for info on the forms this can take)
 * @url http://www.espruino.com/Reference#l__global_shiftOut
 */
declare function shiftOut(pins: Pin | Pin[], options: { clk?: Pin, clkPol?: boolean, repeat?: number }, data: Uint8ArrayResolvable): void;

/**
 * Call the function specified when the pin changes. Watches set with `setWatch`
 * can be removed using `clearWatch`.
 * If the `options` parameter is an object, it can contain the following
 * information (all optional):
 * ```
 * {
 *    // Whether to keep producing callbacks, or remove the watch after the first callback
 *    repeat: true/false(default),
 *    // Trigger on the rising or falling edge of the signal. Can be a string, or 1='rising', -1='falling', 0='both'
 *    edge:'rising'(default for built-in buttons)/'falling'/'both'(default for pins),
 *    // Use software-debouncing to stop multiple calls if a switch bounces
 *    // This is the time in milliseconds to wait for bounces to subside, or 0 to disable
 *    debounce:10 (0 is default for pins, 25 is default for built-in buttons),
 *    // Advanced: If the function supplied is a 'native' function (compiled or assembly)
 *    // setting irq:true will call that function in the interrupt itself
 *    irq : false(default)
 *    // Advanced: If specified, the given pin will be read whenever the watch is called
 *    // and the state will be included as a 'data' field in the callback
 *    data : pin
 *    // Advanced: On Nordic devices, a watch may be 'high' or 'low' accuracy. By default low
 *    // accuracy is used (which is better for power consumption), but this means that
 *    // high speed pulses (less than 25us) may not be reliably received. Setting hispeed=true
 *    // allows for detecting high speed pulses at the expense of higher idle power consumption
 *    hispeed : true
 * }
 * ```
 * The `function` callback is called with an argument, which is an object of type
 * `{state:bool, time:float, lastTime:float}`.
 *  * `state` is whether the pin is currently a `1` or a `0`
 *  * `time` is the time in seconds at which the pin changed state
 *  * `lastTime` is the time in seconds at which the **pin last changed state**.
 *    When using `edge:'rising'` or `edge:'falling'`, this is not the same as when
 *    the function was last called.
 *  * `data` is included if `data:pin` was specified in the options, and can be
 *    used for reading in clocked data
 * For instance, if you want to measure the length of a positive pulse you could
 * use `setWatch(function(e) { console.log(e.time-e.lastTime); }, BTN, {
 * repeat:true, edge:'falling' });`. This will only be called on the falling edge
 * of the pulse, but will be able to measure the width of the pulse because
 * `e.lastTime` is the time of the rising edge.
 * Internally, an interrupt writes the time of the pin's state change into a queue
 * with the exact time that it happened, and the function supplied to `setWatch` is
 * executed only from the main message loop. However, if the callback is a native
 * function `void (bool state)` then you can add `irq:true` to options, which will
 * cause the function to be called from within the IRQ. When doing this, interrupts
 * will happen on both edges and there will be no debouncing.
 * **Note:** if you didn't call `pinMode` beforehand then this function will reset
 * pin's state to `"input"`
 * **Note:** The STM32 chip (used in the [Espruino Board](/EspruinoBoard) and
 * [Pico](/Pico)) cannot watch two pins with the same number - e.g. `A0` and `B0`.
 * **Note:** On nRF52 chips (used in Puck.js, Pixl.js, MDBT42Q) `setWatch` disables
 * the GPIO output on that pin. In order to be able to write to the pin again you
 * need to disable the watch with `clearWatch`.
 *
 * @param {any} function - A Function or String to be executed
 * @param {Pin} pin - The pin to watch
 * @param {any} options - If a boolean or integer, it determines whether to call this once (false = default) or every time a change occurs (true). Can be an object of the form `{ repeat: true/false(default), edge:'rising'/'falling'/'both'(default), debounce:10}` - see below for more information.
 * @returns {any} An ID that can be passed to clearWatch
 * @url http://www.espruino.com/Reference#l__global_setWatch
 */
declare function setWatch(func: ((arg: { state: boolean, time: number, lastTime: number }) => void) | string, pin: Pin, options?: boolean | { repeat?: boolean, edge?: "rising" | "falling" | "both", debounce?: number, irq?: boolean, data?: Pin, hispeed?: boolean }): number;

/**
 * Clear the Watch that was created with setWatch. If no parameter is supplied, all watches will be removed.
 * To avoid accidentally deleting all Watches, if a parameter is supplied but is `undefined` then an Exception will be thrown.
 *
 * @param {any} id - The id returned by a previous call to setWatch. **Only one argument is allowed.** (or pass nothing to clear all watches)
 * @url http://www.espruino.com/Reference#l__global_clearWatch
 */
declare function clearWatch(id: number): void;
declare function clearWatch(): void;

declare const global: {
  SDA: typeof SDA;
  SCL: typeof SCL;
  show: typeof show;
  acceleration: typeof acceleration;
  compass: typeof compass;
  FET: typeof FET;
  Q0: typeof Q0;
  Q1: typeof Q1;
  Q2: typeof Q2;
  Q3: typeof Q3;
  VIBRATE: typeof VIBRATE;
  LED: typeof LED;
  LED1: typeof LED1;
  LED2: typeof LED2;
  BTNA: typeof BTNA;
  BTNB: typeof BTNB;
  BTNU: typeof BTNU;
  BTND: typeof BTND;
  BTNL: typeof BTNL;
  BTNR: typeof BTNR;
  CORNER1: typeof CORNER1;
  CORNER2: typeof CORNER2;
  CORNER3: typeof CORNER3;
  CORNER4: typeof CORNER4;
  CORNER5: typeof CORNER5;
  CORNER6: typeof CORNER6;
  Bluetooth: typeof Bluetooth;
  MOS1: typeof MOS1;
  MOS2: typeof MOS2;
  MOS3: typeof MOS3;
  MOS4: typeof MOS4;
  IOEXT0: typeof IOEXT0;
  IOEXT1: typeof IOEXT1;
  IOEXT2: typeof IOEXT2;
  IOEXT3: typeof IOEXT3;
  Terminal: typeof Terminal;
  setBusyIndicator: typeof setBusyIndicator;
  setSleepIndicator: typeof setSleepIndicator;
  setDeepSleep: typeof setDeepSleep;
  dump: typeof dump;
  load: typeof load;
  save: typeof save;
  reset: typeof reset;
  edit: typeof edit;
  echo: typeof echo;
  getTime: typeof getTime;
  setTime: typeof setTime;
  getSerial: typeof getSerial;
  setInterval: typeof setInterval;
  setTimeout: typeof setTimeout;
  clearInterval: typeof clearInterval;
  clearTimeout: typeof clearTimeout;
  changeInterval: typeof changeInterval;
  peek8: typeof peek8;
  poke8: typeof poke8;
  peek16: typeof peek16;
  poke16: typeof poke16;
  peek32: typeof peek32;
  poke32: typeof poke32;
  analogRead: typeof analogRead;
  analogWrite: typeof analogWrite;
  digitalPulse: typeof digitalPulse;
  digitalWrite: typeof digitalWrite;
  digitalRead: typeof digitalRead;
  pinMode: typeof pinMode;
  getPinMode: typeof getPinMode;
  shiftOut: typeof shiftOut;
  setWatch: typeof setWatch;
  clearWatch: typeof clearWatch;
  global: typeof global;
  globalThis: typeof globalThis;
  arguments: typeof arguments;
  eval: typeof eval;
  parseInt: typeof parseInt;
  parseFloat: typeof parseFloat;
  isFinite: typeof isFinite;
  isNaN: typeof isNaN;
  btoa: typeof btoa;
  atob: typeof atob;
  encodeURIComponent: typeof encodeURIComponent;
  decodeURIComponent: typeof decodeURIComponent;
  trace: typeof trace;
  print: typeof print;
  require: typeof require;
  __FILE__: typeof __FILE__;
  SPI1: typeof SPI1;
  SPI2: typeof SPI2;
  SPI3: typeof SPI3;
  I2C1: typeof I2C1;
  I2C2: typeof I2C2;
  I2C3: typeof I2C3;
  USB: typeof USB;
  Serial1: typeof Serial1;
  Serial2: typeof Serial2;
  Serial3: typeof Serial3;
  Serial4: typeof Serial4;
  Serial5: typeof Serial5;
  Serial6: typeof Serial6;
  LoopbackA: typeof LoopbackA;
  LoopbackB: typeof LoopbackB;
  Telnet: typeof Telnet;
  NaN: typeof NaN;
  Infinity: typeof Infinity;
  HIGH: typeof HIGH;
  LOW: typeof LOW;
  [key: string]: any;
}

/**
 * A reference to the global scope, where everything is defined.
 * This is identical to `global` but was introduced in the ECMAScript spec.
 * @returns {any} The global scope
 * @url http://www.espruino.com/Reference#l__global_globalThis
 */
// globalThis - builtin

/**
 * A variable containing the arguments given to the function:
 * ```
 * function hello() {
 *   console.log(arguments.length, JSON.stringify(arguments));
 * }
 * hello()        // 0 []
 * hello("Test")  // 1 ["Test"]
 * hello(1,2,3)   // 3 [1,2,3]
 * ```
 * **Note:** Due to the way Espruino works this is doesn't behave exactly the same
 * as in normal JavaScript. The length of the arguments array will never be less
 * than the number of arguments specified in the function declaration:
 * `(function(a){ return arguments.length; })() == 1`. Normal JavaScript
 * interpreters would return `0` in the above case.
 * @returns {any} An array containing all the arguments given to the function
 * @url http://www.espruino.com/Reference#l__global_arguments
 */
declare const arguments: any;

/**
 * Evaluate a string containing JavaScript code
 *
 * @param {any} code
 * @returns {any} The result of evaluating the string
 * @url http://www.espruino.com/Reference#l__global_eval
 */
declare function eval(code: any): any;

/**
 * Convert a string representing a number into an integer
 *
 * @param {any} string
 * @param {any} [radix] - [optional] The Radix of the string
 * @returns {any} The integer value of the string (or NaN)
 * @url http://www.espruino.com/Reference#l__global_parseInt
 */
declare function parseInt(string: any, radix?: any): any;

/**
 * Convert a string representing a number into an float
 *
 * @param {any} string
 * @returns {number} The value of the string
 * @url http://www.espruino.com/Reference#l__global_parseFloat
 */
declare function parseFloat(string: any): number;

/**
 * Is the parameter a finite number or not? If needed, the parameter is first
 * converted to a number.
 *
 * @param {any} x
 * @returns {boolean} True is the value is a Finite number, false if not.
 * @url http://www.espruino.com/Reference#l__global_isFinite
 */
declare function isFinite(x: any): boolean;

/**
 * Whether the x is NaN (Not a Number) or not
 *
 * @param {any} x
 * @returns {boolean} True is the value is NaN, false if not.
 * @url http://www.espruino.com/Reference#l__global_isNaN
 */
declare function isNaN(x: any): boolean;

/**
 * Encode the supplied string (or array) into a base64 string
 *
 * @param {any} binaryData - A string of data to encode
 * @returns {any} A base64 encoded string
 * @url http://www.espruino.com/Reference#l__global_btoa
 */
declare function btoa(binaryData: any): any;

/**
 * Decode the supplied base64 string into a normal string
 *
 * @param {any} base64Data - A string of base64 data to decode
 * @returns {any} A string containing the decoded data
 * @url http://www.espruino.com/Reference#l__global_atob
 */
declare function atob(base64Data: any): any;

/**
 * Convert a string with any character not alphanumeric or `- _ . ! ~ * ' ( )`
 * converted to the form `%XY` where `XY` is its hexadecimal representation
 *
 * @param {any} str - A string to encode as a URI
 * @returns {any} A string containing the encoded data
 * @url http://www.espruino.com/Reference#l__global_encodeURIComponent
 */
declare function encodeURIComponent(str: any): any;

/**
 * Convert any groups of characters of the form '%ZZ', into characters with hex
 * code '0xZZ'
 *
 * @param {any} str - A string to decode from a URI
 * @returns {any} A string containing the decoded data
 * @url http://www.espruino.com/Reference#l__global_decodeURIComponent
 */
declare function decodeURIComponent(str: any): any;

/**
 * Output debugging information
 * Note: This is not included on boards with low amounts of flash memory, or the
 * Espruino board.
 *
 * @param {any} root - The symbol to output (optional). If nothing is specified, everything will be output
 * @url http://www.espruino.com/Reference#l__global_trace
 */
declare function trace(root: any): void;

/**
 * Print the supplied string(s) to the console
 *  **Note:** If you're connected to a computer (not a wall adaptor) via USB but
 *  **you are not running a terminal app** then when you print data Espruino may
 *  pause execution and wait until the computer requests the data it is trying to
 *  print.
 *
 * @param {any} text
 * @url http://www.espruino.com/Reference#l__global_print
 */
declare function print(...text: any[]): void;

declare function require(moduleName: "ESP8266"): typeof import("ESP8266");
declare function require(moduleName: "crypto"): typeof import("crypto");
declare function require(moduleName: "neopixel"): typeof import("neopixel");
declare function require(moduleName: "net"): typeof import("net");
declare function require(moduleName: "dgram"): typeof import("dgram");
declare function require(moduleName: "tls"): typeof import("tls");
declare function require(moduleName: "Wifi"): typeof import("Wifi");
declare function require(moduleName: "NetworkJS"): typeof import("NetworkJS");
declare function require(moduleName: "http"): typeof import("http");
declare function require(moduleName: "WIZnet"): typeof import("WIZnet");
declare function require(moduleName: "CC3000"): typeof import("CC3000");
declare function require(moduleName: "TelnetServer"): typeof import("TelnetServer");
declare function require(moduleName: "fs"): typeof import("fs");
declare function require(moduleName: "tv"): typeof import("tv");
declare function require(moduleName: "tensorflow"): typeof import("tensorflow");
declare function require(moduleName: "heatshrink"): typeof import("heatshrink");
declare function require(moduleName: "Flash"): typeof import("Flash");
declare function require(moduleName: "Storage"): typeof import("Storage");
declare function require(moduleName: string): any;

/**
 * The filename of the JavaScript that is currently executing.
 * If `load` has been called with a filename (eg `load("myfile.js")`) then
 * `__FILE__` is set to that filename. Otherwise (eg `load()`) or immediately
 * after booting, `__FILE__` is not set.
 * @returns {any} The filename of the JavaScript that is currently executing
 * @url http://www.espruino.com/Reference#l__global___FILE__
 */
declare const __FILE__: any;

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
 * A loopback serial device. Data sent to `LoopbackA` comes out of `LoopbackB` and
 * vice versa
 * @url http://www.espruino.com/Reference#l__global_LoopbackA
 */
declare const LoopbackA: Serial;

/**
 * A loopback serial device. Data sent to `LoopbackA` comes out of `LoopbackB` and
 * vice versa
 * @url http://www.espruino.com/Reference#l__global_LoopbackB
 */
declare const LoopbackB: Serial;

/**
 * A telnet serial device that maps to the built-in telnet console server (devices
 * that have built-in wifi only).
 * @url http://www.espruino.com/Reference#l__global_Telnet
 */
declare const Telnet: Serial;

/**
 * @returns {number} Not a  Number
 * @url http://www.espruino.com/Reference#l__global_NaN
 */
declare const NaN: number;

/**
 * @returns {number} Positive Infinity (1/0)
 * @url http://www.espruino.com/Reference#l__global_Infinity
 */
declare const Infinity: number;

/**
 * @returns {number} Logic 1 for Arduino compatibility - this is the same as just typing `1`
 * @url http://www.espruino.com/Reference#l__global_HIGH
 */
declare const HIGH: true;

/**
 * @returns {number} Logic 0 for Arduino compatibility - this is the same as just typing `0`
 * @url http://www.espruino.com/Reference#l__global_LOW
 */
declare const LOW: false;

// LIBRARIES

/**
 * The ESP8266 library is specific to the ESP8266 version of Espruino, i.e.,
 * running Espruino on an ESP8266 module (not to be confused with using the ESP8266
 * as Wifi add-on to an Espruino board). This library contains functions to handle
 * ESP8266-specific actions. For example: `var esp8266 = require('ESP8266');
 * esp8266.reboot();` performs a hardware reset of the module.
 * @url http://www.espruino.com/Reference#ESP8266
 */
declare module "ESP8266" {
  /**
   * Perform a hardware reset/reboot of the esp8266.
   * @url http://www.espruino.com/Reference#l_ESP8266_reboot
   */
  function reboot(): void;

  /**
   * At boot time the esp8266's firmware captures the cause of the reset/reboot. This
   * function returns this information in an object with the following fields:
   * * `reason`: "power on", "wdt reset", "exception", "soft wdt", "restart", "deep
   *   sleep", or "reset pin"
   * * `exccause`: exception cause
   * * `epc1`, `epc2`, `epc3`: instruction pointers
   * * `excvaddr`: address being accessed
   * * `depc`: (?)
   * @returns {any} An object with the reset cause information
   * @url http://www.espruino.com/Reference#l_ESP8266_getResetInfo
   */
  function getResetInfo(): any;

  /**
   * Enable or disable the logging of debug information. A value of `true` enables
   * debug logging while a value of `false` disables debug logging. Debug output is
   * sent to UART1 (gpio2).
   *
   * @param {boolean} enable - Enable or disable the debug logging.
   * @url http://www.espruino.com/Reference#l_ESP8266_logDebug
   */
  function logDebug(enable: boolean): void;

  /**
   * Set the debug logging mode. It can be disabled (which frees ~1.2KB of heap),
   * enabled in-memory only, or in-memory and output to a UART.
   *
   * @param {number} mode - Debug log mode: 0=off, 1=in-memory only, 2=in-mem and uart0, 3=in-mem and uart1.
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
   * Dumps info about all sockets to the log. This is for troubleshooting the socket
   * implementation.
   * @url http://www.espruino.com/Reference#l_ESP8266_dumpSocketInfo
   */
  function dumpSocketInfo(): void;

  /**
   * **Note:** This is deprecated. Use `E.setClock(80/160)` **Note:** Set the
   * operating frequency of the ESP8266 processor. The default is 160Mhz.
   * **Warning**: changing the cpu frequency affects the timing of some I/O
   * operations, notably of software SPI and I2C, so things may be a bit slower at
   * 80Mhz.
   *
   * @param {any} freq - Desired frequency - either 80 or 160.
   * @url http://www.espruino.com/Reference#l_ESP8266_setCPUFreq
   */
  function setCPUFreq(freq: any): void;

  /**
   * Returns an object that contains details about the state of the ESP8266 with the
   * following fields:
   * * `sdkVersion` - Version of the SDK.
   * * `cpuFrequency` - CPU operating frequency in Mhz.
   * * `freeHeap` - Amount of free heap in bytes.
   * * `maxCon` - Maximum number of concurrent connections.
   * * `flashMap` - Configured flash size&map: '512KB:256/256' .. '4MB:512/512'
   * * `flashKB` - Configured flash size in KB as integer
   * * `flashChip` - Type of flash chip as string with manufacturer & chip, ex: '0xEF
   *   0x4016`
   * @returns {any} The state of the ESP8266
   * @url http://www.espruino.com/Reference#l_ESP8266_getState
   */
  function getState(): any;

  /**
   * **Note:** This is deprecated. Use `require("Flash").getFree()`
   * @returns {any} Array of objects with `addr` and `length` properties describing the free flash areas available
   * @url http://www.espruino.com/Reference#l_ESP8266_getFreeFlash
   */
  function getFreeFlash(): any;

  /**
   *
   * @param {any} arrayOfData - Array of data to CRC
   * @returns {any} 32-bit CRC
   * @url http://www.espruino.com/Reference#l_ESP8266_crc32
   */
  function crc32(arrayOfData: any): any;

  /**
   * **This function is deprecated.** Please use `require("neopixel").write(pin,
   * data)` instead
   *
   * @param {Pin} pin - Pin for output signal.
   * @param {any} arrayOfData - Array of LED data.
   * @url http://www.espruino.com/Reference#l_ESP8266_neopixelWrite
   */
  function neopixelWrite(pin: Pin, arrayOfData: any): void;

  /**
   * Put the ESP8266 into 'deep sleep' for the given number of microseconds, reducing
   * power consumption drastically.
   * meaning of option values:
   * 0 - the 108th Byte of init parameter decides whether RF calibration will be
   * performed or not.
   * 1 - run RF calibration after waking up. Power consumption is high.
   * 2 - no RF calibration after waking up. Power consumption is low.
   * 4 - no RF after waking up. Power consumption is the lowest.
   * **Note:** unlike normal Espruino boards' 'deep sleep' mode, ESP8266 deep sleep
   * actually turns off the processor. After the given number of microseconds have
   * elapsed, the ESP8266 will restart as if power had been turned off and then back
   * on. *All contents of RAM will be lost*. Connect GPIO 16 to RST to enable wakeup.
   * **Special:** 0 microseconds cause sleep forever until external wakeup RST pull
   * down occurs.
   *
   * @param {any} micros - Number of microseconds to sleep.
   * @param {any} option - posible values are 0, 1, 2 or 4
   * @url http://www.espruino.com/Reference#l_ESP8266_deepSleep
   */
  function deepSleep(micros: any, option: any): void;

  /**
   * **DEPRECATED** - please use `Wifi.ping` instead.
   * Perform a network ping request. The parameter can be either a String or a
   * numeric IP address.
   *
   * @param {any} ipAddr - A string representation of an IP address.
   * @param {any} pingCallback - Optional callback function.
   * @url http://www.espruino.com/Reference#l_ESP8266_ping
   */
  function ping(ipAddr: any, pingCallback: any): void;
}

/**
 * Cryptographic functions
 * **Note:** This library is currently only included in builds for boards where
 * there is space. For other boards there is `crypto.js` which implements SHA1 in
 * JS.
 * @url http://www.espruino.com/Reference#crypto
 */
declare module "crypto" {
  /**
   * Class containing AES encryption/decryption
   * @returns {any}
   * @url http://www.espruino.com/Reference#l_crypto_AES
   */
  const AES: AES;

  /**
   * Performs a SHA1 hash and returns the result as a 20 byte ArrayBuffer.
   * **Note:** On some boards (currently only Espruino Original) there isn't space
   * for a fully unrolled SHA1 implementation so a slower all-JS implementation is
   * used instead.
   *
   * @param {any} message - The message to apply the hash to
   * @returns {any} Returns a 20 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA1
   */
  function SHA1(message: any): ArrayBuffer;

  /**
   * Performs a SHA224 hash and returns the result as a 28 byte ArrayBuffer
   *
   * @param {any} message - The message to apply the hash to
   * @returns {any} Returns a 20 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA224
   */
  function SHA224(message: any): ArrayBuffer;

  /**
   * Performs a SHA256 hash and returns the result as a 32 byte ArrayBuffer
   *
   * @param {any} message - The message to apply the hash to
   * @returns {any} Returns a 20 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA256
   */
  function SHA256(message: any): ArrayBuffer;

  /**
   * Performs a SHA384 hash and returns the result as a 48 byte ArrayBuffer
   *
   * @param {any} message - The message to apply the hash to
   * @returns {any} Returns a 20 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA384
   */
  function SHA384(message: any): ArrayBuffer;

  /**
   * Performs a SHA512 hash and returns the result as a 64 byte ArrayBuffer
   *
   * @param {any} message - The message to apply the hash to
   * @returns {any} Returns a 32 byte ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_SHA512
   */
  function SHA512(message: any): ArrayBuffer;

  /**
   * Password-Based Key Derivation Function 2 algorithm, using SHA512
   *
   * @param {any} passphrase - Passphrase
   * @param {any} salt - Salt for turning passphrase into a key
   * @param {any} options - Object of Options, `{ keySize: 8 (in 32 bit words), iterations: 10, hasher: 'SHA1'/'SHA224'/'SHA256'/'SHA384'/'SHA512' }`
   * @returns {any} Returns an ArrayBuffer
   * @url http://www.espruino.com/Reference#l_crypto_PBKDF2
   */
  function PBKDF2(passphrase: any, salt: any, options: any): ArrayBuffer;
}

/**
 * This library allows you to write to Neopixel/WS281x/APA10x/SK6812 LED strips
 * These use a high speed single-wire protocol which needs platform-specific
 * implementation on some devices - hence this library to simplify things.
 * @url http://www.espruino.com/Reference#neopixel
 */
declare module "neopixel" {
  /**
   * Write to a strip of NeoPixel/WS281x/APA104/APA106/SK6812-style LEDs attached to
   * the given pin.
   * ```
   * // set just one pixel, red, green, blue
   * require("neopixel").write(B15, [255,0,0]);
   * ```
   * ```
   * // Produce an animated rainbow over 25 LEDs
   * var rgb = new Uint8ClampedArray(25*3);
   * var pos = 0;
   * function getPattern() {
   *   pos++;
   *   for (var i=0;i<rgb.length;) {
   *     rgb[i++] = (1 + Math.sin((i+pos)*0.1324)) * 127;
   *     rgb[i++] = (1 + Math.sin((i+pos)*0.1654)) * 127;
   *     rgb[i++] = (1 + Math.sin((i+pos)*0.1)) * 127;
   *   }
   *   return rgb;
   * }
   * setInterval(function() {
   *   require("neopixel").write(B15, getPattern());
   * }, 100);
   * ```
   * **Note:**
   * * Different types of LED have the data in different orders - so don't be
   * surprised by RGB or BGR orderings!
   * * Some LED strips (SK6812) actually take 4 bytes per LED (red, green, blue and
   * white). These are still supported but the array of data supplied must still be a
   * multiple of 3 bytes long. Just round the size up - it won't cause any problems.
   * * On some platforms like STM32, pins capable of hardware SPI MOSI are required.
   * * On STM32, `neopixel.write` chooses a hardware SPI device to output the signal on
   * and uses that. However in order to avoid spikes in the output, if that hardware device is *already
   * initialised* it will not be re-initialised. This means that if the SPI device was already in use,
   * you may have to use `SPIx.setup({baud:3200000, mosi:the_pin})` to force it to be re-setup on the pin.
   * * Espruino devices tend to have 3.3v IO, while WS2812/etc run off of 5v. Many
   * WS2812 will only register a logic '1' at 70% of their input voltage - so if
   * powering them off 5v you will not be able to send them data reliably. You can
   * work around this by powering the LEDs off a lower voltage (for example 3.7v from
   * a LiPo battery), can put the output into the `af_opendrain` state and use a
   * pullup resistor to 5v on STM32 based boards (nRF52 are not 5v tolerant so you
   * can't do this), or can use a level shifter to shift the voltage up into the 5v
   * range.
   *
   * @param {Pin} pin - The Pin the LEDs are connected to
   * @param {any} data - The data to write to the LED strip (must be a multiple of 3 bytes long)
   * @url http://www.espruino.com/Reference#l_neopixel_write
   */
  function write(pin: Pin, data: any): void;
}

/**
 * This library allows you to create TCPIP servers and clients
 * In order to use this, you will need an extra module to get network connectivity.
 * This is designed to be a cut-down version of the [node.js
 * library](http://nodejs.org/api/net.html). Please see the [Internet](/Internet)
 * page for more information on how to use it.
 * @url http://www.espruino.com/Reference#net
 */
declare module "net" {
  /**
   * Create a Server
   * When a request to the server is made, the callback is called. In the callback
   * you can use the methods on the connection to send data. You can also add
   * `connection.on('data',function() { ... })` to listen for received data
   *
   * @param {any} callback - A `function(connection)` that will be called when a connection is made
   * @returns {any} Returns a new Server Object
   * @url http://www.espruino.com/Reference#l_net_createServer
   */
  function createServer(callback: any): Server;

  /**
   * Create a TCP socket connection
   *
   * @param {any} options - An object containing host,port fields
   * @param {any} callback - A `function(sckt)` that will be called  with the socket when a connection is made. You can then call `sckt.write(...)` to send data, and `sckt.on('data', function(data) { ... })` and `sckt.on('close', function() { ... })` to deal with the response.
   * @returns {any} Returns a new net.Socket object
   * @url http://www.espruino.com/Reference#l_net_connect
   */
  function connect(options: any, callback: any): Socket;
}

/**
 * This library allows you to create UDP/DATAGRAM servers and clients
 * In order to use this, you will need an extra module to get network connectivity.
 * This is designed to be a cut-down version of the [node.js
 * library](http://nodejs.org/api/dgram.html). Please see the [Internet](/Internet)
 * page for more information on how to use it.
 * @url http://www.espruino.com/Reference#dgram
 */
declare module "dgram" {
  /**
   * Create a UDP socket
   *
   * @param {any} type - Socket type to create e.g. 'udp4'. Or options object { type: 'udp4', reuseAddr: true, recvBufferSize: 1024 }
   * @param {any} callback - A `function(sckt)` that will be called  with the socket when a connection is made. You can then call `sckt.send(...)` to send data, and `sckt.on('message', function(data) { ... })` and `sckt.on('close', function() { ... })` to deal with the response.
   * @returns {any} Returns a new dgram.Socket object
   * @url http://www.espruino.com/Reference#l_dgram_createSocket
   */
  function createSocket(type: any, callback: any): dgramSocket;
}

/**
 * This library allows you to create TCPIP servers and clients using TLS encryption
 * In order to use this, you will need an extra module to get network connectivity.
 * This is designed to be a cut-down version of the [node.js
 * library](http://nodejs.org/api/tls.html). Please see the [Internet](/Internet)
 * page for more information on how to use it.
 * @url http://www.espruino.com/Reference#tls
 */
declare module "tls" {
  /**
   * Create a socket connection using TLS
   * Options can have `ca`, `key` and `cert` fields, which should be the decoded
   * content of the certificate.
   * ```
   * var options = url.parse("localhost:1234");
   * options.key = atob("MIIJKQ ... OZs08C");
   * options.cert = atob("MIIFi ... Uf93rN+");
   * options.ca = atob("MIIFgDCC ... GosQML4sc=");
   * require("tls").connect(options, ... );
   * ```
   * If you have the certificates as `.pem` files, you need to load these files, take
   * the information between the lines beginning with `----`, remove the newlines
   * from it so you have raw base64, and then feed it into `atob` as above.
   * You can also:
   * * Just specify the filename (<=100 characters) and it will be loaded and parsed
   *   if you have an SD card connected. For instance `options.key = "key.pem";`
   * * Specify a function, which will be called to retrieve the data. For instance
   *   `options.key = function() { eeprom.load_my_info(); };
   * For more information about generating and using certificates, see:
   * https://engineering.circle.com/https-authorized-certs-with-node-js/
   * (You'll need to use 2048 bit certificates as opposed to 4096 bit shown above)
   *
   * @param {any} options - An object containing host,port fields
   * @param {any} callback - A function(res) that will be called when a connection is made. You can then call `res.on('data', function(data) { ... })` and `res.on('close', function() { ... })` to deal with the response.
   * @returns {any} Returns a new net.Socket object
   * @url http://www.espruino.com/Reference#l_tls_connect
   */
  function connect(options: any, callback: any): Socket;
}

/**
 * The Wifi library is designed to control the Wifi interface. It supports
 * functionality such as connecting to wifi networks, getting network information,
 * starting an access point, etc.
 * It is available on these devices:
 * * [Espruino WiFi](http://www.espruino.com/WiFi#using-wifi)
 * * [ESP8266](http://www.espruino.com/EspruinoESP8266)
 * * [ESP32](http://www.espruino.com/ESP32)
 * **Certain features may or may not be implemented on your device** however we
 * have documented what is available and what isn't.
 * If you're not using one of the devices above, a separate WiFi library is
 * provided. For instance:
 * * An [ESP8266 connected to an Espruino
 *   board](http://www.espruino.com/ESP8266#software)
 * * An [CC3000 WiFi Module](http://www.espruino.com/CC3000)
 * [Other ways of connecting to the
 * net](http://www.espruino.com/Internet#related-pages) such as GSM, Ethernet and
 * LTE have their own libraries.
 * You can use the WiFi library as follows:
 * ```
 * var wifi = require("Wifi");
 * wifi.connect("my-ssid", {password:"my-pwd"}, function(ap){ console.log("connected:", ap); });
 * ```
 * On ESP32/ESP8266 if you want the connection to happen automatically at boot, add
 * `wifi.save();`. On other platforms, place `wifi.connect` in a function called
 * `onInit`.
 * @url http://www.espruino.com/Reference#Wifi
 */
declare module "Wifi" {
  /**
   * The 'associated' event is called when an association with an access point has
   * succeeded, i.e., a connection to the AP's network has been established.
   * On ESP32/ESP8266 there is a `details` parameter which includes:
   * * ssid - The SSID of the access point to which the association was established
   * * mac - The BSSID/mac address of the access point
   * * channel - The wifi channel used (an integer, typ 1..14)
   * @param {string} event - The event to listen to.
   * @param {(details: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `details` An object with event details
   * @url http://www.espruino.com/Reference#l_Wifi_associated
   */
  function on(event: "associated", callback: (details: any) => void): void;

  /**
   * The 'disconnected' event is called when an association with an access point has
   * been lost.
   * On ESP32/ESP8266 there is a `details` parameter which includes:
   * * ssid - The SSID of the access point from which the association was lost
   * * mac - The BSSID/mac address of the access point
   * * reason - The reason for the disconnection (string)
   * @param {string} event - The event to listen to.
   * @param {(details: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `details` An object with event details
   * @url http://www.espruino.com/Reference#l_Wifi_disconnected
   */
  function on(event: "disconnected", callback: (details: any) => void): void;

  /**
   * The 'auth_change' event is called when the authentication mode with the
   * associated access point changes. The details include:
   * * oldMode - The old auth mode (string: open, wep, wpa, wpa2, wpa_wpa2)
   * * newMode - The new auth mode (string: open, wep, wpa, wpa2, wpa_wpa2)
   * @param {string} event - The event to listen to.
   * @param {(details: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `details` An object with event details
   * @url http://www.espruino.com/Reference#l_Wifi_auth_change
   */
  function on(event: "auth_change", callback: (details: any) => void): void;

  /**
   * The 'dhcp_timeout' event is called when a DHCP request to the connected access
   * point fails and thus no IP address could be acquired (or renewed).
   * @param {string} event - The event to listen to.
   * @param {() => void} callback - A function that is executed when the event occurs.
   * @url http://www.espruino.com/Reference#l_Wifi_dhcp_timeout
   */
  function on(event: "dhcp_timeout", callback: () => void): void;

  /**
   * The 'connected' event is called when the connection with an access point is
   * ready for traffic. In the case of a dynamic IP address configuration this is
   * when an IP address is obtained, in the case of static IP address allocation this
   * happens when an association is formed (in that case the 'associated' and
   * 'connected' events are fired in rapid succession).
   * On ESP32/ESP8266 there is a `details` parameter which includes:
   * * ip - The IP address obtained as string
   * * netmask - The network's IP range mask as string
   * * gw - The network's default gateway as string
   * @param {string} event - The event to listen to.
   * @param {(details: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `details` An object with event details
   * @url http://www.espruino.com/Reference#l_Wifi_connected
   */
  function on(event: "connected", callback: (details: any) => void): void;

  /**
   * The 'sta_joined' event is called when a station establishes an association (i.e.
   * connects) with the esp8266's access point. The details include:
   * * mac - The MAC address of the station in string format (00:00:00:00:00:00)
   * @param {string} event - The event to listen to.
   * @param {(details: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `details` An object with event details
   * @url http://www.espruino.com/Reference#l_Wifi_sta_joined
   */
  function on(event: "sta_joined", callback: (details: any) => void): void;

  /**
   * The 'sta_left' event is called when a station disconnects from the esp8266's
   * access point (or its association times out?). The details include:
   * * mac - The MAC address of the station in string format (00:00:00:00:00:00)
   * @param {string} event - The event to listen to.
   * @param {(details: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `details` An object with event details
   * @url http://www.espruino.com/Reference#l_Wifi_sta_left
   */
  function on(event: "sta_left", callback: (details: any) => void): void;

  /**
   * The 'probe_recv' event is called when a probe request is received from some
   * station by the esp8266's access point. The details include:
   * * mac - The MAC address of the station in string format (00:00:00:00:00:00)
   * * rssi - The signal strength in dB of the probe request
   * @param {string} event - The event to listen to.
   * @param {(details: any) => void} callback - A function that is executed when the event occurs. Its arguments are:
   * * `details` An object with event details
   * @url http://www.espruino.com/Reference#l_Wifi_probe_recv
   */
  function on(event: "probe_recv", callback: (details: any) => void): void;

  /**
   * Disconnect the wifi station from an access point and disable the station mode.
   * It is OK to call `disconnect` to turn off station mode even if no connection
   * exists (for example, connection attempts may be failing). Station mode can be
   * re-enabled by calling `connect` or `scan`.
   *
   * @param {any} [callback] - [optional] An `callback()` function to be called back on disconnection. The callback function receives no argument.
   * @url http://www.espruino.com/Reference#l_Wifi_disconnect
   */
  function disconnect(callback?: any): void;

  /**
   * Stop being an access point and disable the AP operation mode. AP mode can be
   * re-enabled by calling `startAP`.
   *
   * @param {any} [callback] - [optional] An `callback()` function to be called back on successful stop. The callback function receives no argument.
   * @url http://www.espruino.com/Reference#l_Wifi_stopAP
   */
  function stopAP(callback?: any): void;

  /**
   * Connect to an access point as a station. If there is an existing connection to
   * an AP it is first disconnected if the SSID or password are different from those
   * passed as parameters. Put differently, if the passed SSID and password are
   * identical to the currently connected AP then nothing is changed. When the
   * connection attempt completes the callback function is invoked with one `err`
   * parameter, which is NULL if there is no error and a string message if there is
   * an error. If DHCP is enabled the callback occurs once an IP address has been
   * obtained, if a static IP is set the callback occurs once the AP's network has
   * been joined. The callback is also invoked if a connection already exists and
   * does not need to be changed.
   * The options properties may contain:
   * * `password` - Password string to be used to access the network.
   * * `dnsServers` (array of String) - An array of up to two DNS servers in dotted
   *   decimal format string.
   * * `channel` - Wifi channel of the access point (integer, typ 0..14, 0 means any
   *   channel), only on ESP8266.
   * * `bssid` - Mac address of the access point (string, type "00:00:00:00:00:00"),
   *   only on ESP8266.
   * Notes:
   * * the options should include the ability to set a static IP and associated
   *   netmask and gateway, this is a future enhancement.
   * * the only error reported in the callback is "Bad password", all other errors
   *   (such as access point not found or DHCP timeout) just cause connection
   *   retries. If the reporting of such temporary errors is desired, the caller must
   *   use its own timeout and the `getDetails().status` field.
   * * the `connect` call automatically enabled station mode, it can be disabled
   *   again by calling `disconnect`.
   *
   * @param {any} ssid - The access point network id.
   * @param {any} [options] - [optional] Connection options.
   * @param {any} callback - A `callback(err)`  function to be called back on completion. `err` is null on success, or contains an error string on failure.
   * @url http://www.espruino.com/Reference#l_Wifi_connect
   */
  function connect(ssid: string, options?: { password?: string, dnsServers?: string[], authMode?: string, channel?: number, bssid?: string }, callback?: (err: string | null) => void): void;

  /**
   * Perform a scan for access points. This will enable the station mode if it is not
   * currently enabled. Once the scan is complete the callback function is called
   * with an array of APs found, each AP is an object with:
   * * `ssid`: SSID string.
   * * `mac`: access point MAC address in 00:00:00:00:00:00 format.
   * * `authMode`: `open`, `wep`, `wpa`, `wpa2`, or `wpa_wpa2`.
   * * `channel`: wifi channel 1..13.
   * * `hidden`: true if the SSID is hidden (ESP32/ESP8266 only)
   * * `rssi`: signal strength in dB in the range -110..0.
   * Notes:
   * * in order to perform the scan the station mode is turned on and remains on, use
   *   Wifi.disconnect() to turn it off again, if desired.
   * * only one scan can be in progress at a time.
   *
   * @param {any} callback - A `callback(err, ap_list)` function to be called back on completion. `err==null` and `ap_list` is an array on success, or `err` is an error string and `ap_list` is undefined on failure.
   * @url http://www.espruino.com/Reference#l_Wifi_scan
   */
  function scan(callback: any): void;

  /**
   * Create a WiFi access point allowing stations to connect. If the password is NULL
   * or an empty string the access point is open, otherwise it is encrypted. The
   * callback function is invoked once the access point is set-up and receives one
   * `err` argument, which is NULL on success and contains an error message string
   * otherwise.
   * The `options` object can contain the following properties.
   * * `authMode` - The authentication mode to use. Can be one of "open", "wpa2",
   *   "wpa", "wpa_wpa2". The default is open (but open access points are not
   *   recommended).
   * * `password` - The password for connecting stations if authMode is not open.
   * * `channel` - The channel to be used for the access point in the range 1..13. If
   *   the device is also connected to an access point as a station then that access
   *   point determines the channel.
   * * `hidden` - The flag if visible or not (0:visible, 1:hidden), default is
   *   visible.
   * Notes:
   * * the options should include the ability to set the AP IP and associated
   *   netmask, this is a future enhancement.
   * * the `startAP` call automatically enables AP mode. It can be disabled again by
   *   calling `stopAP`.
   *
   * @param {any} ssid - The network id.
   * @param {any} [options] - [optional] Configuration options.
   * @param {any} callback - Optional `callback(err)` function to be called when the AP is successfully started. `err==null` on success, or an error string on failure.
   * @url http://www.espruino.com/Reference#l_Wifi_startAP
   */
  function startAP(ssid: string, options?: { password?: string, authMode?: "open" | "wpa2" | "wpa" | "wpa_wpa2", channel?: number, hidden?: boolean }, callback?: (err: string | null) => void): void;

  /**
   * Retrieve the current overall WiFi configuration. This call provides general
   * information that pertains to both station and access point modes. The getDetails
   * and getAPDetails calls provide more in-depth information about the station and
   * access point configurations, respectively. The status object has the following
   * properties:
   * * `station` - Status of the wifi station: `off`, `connecting`, ...
   * * `ap` - Status of the wifi access point: `disabled`, `enabled`.
   * * `mode` - The current operation mode: `off`, `sta`, `ap`, `sta+ap`.
   * * `phy` - Modulation standard configured: `11b`, `11g`, `11n` (the esp8266 docs
   *   are not very clear, but it is assumed that 11n means b/g/n). This setting
   *   limits the modulations that the radio will use, it does not indicate the
   *   current modulation used with a specific access point.
   * * `powersave` - Power saving mode: `none` (radio is on all the time), `ps-poll`
   *   (radio is off between beacons as determined by the access point's DTIM
   *   setting). Note that in 'ap' and 'sta+ap' modes the radio is always on, i.e.,
   *   no power saving is possible.
   * * `savedMode` - The saved operation mode which will be applied at boot time:
   *   `off`, `sta`, `ap`, `sta+ap`.
   *
   * @param {any} callback - Optional `callback(status)` function to be called back with the current Wifi status, i.e. the same object as returned directly.
   * @returns {any} An object representing the current WiFi status, if available immediately.
   * @url http://www.espruino.com/Reference#l_Wifi_getStatus
   */
  function getStatus(callback: any): any;

  /**
   * Sets a number of global wifi configuration settings. All parameters are optional
   * and which are passed determines which settings are updated. The settings
   * available are:
   * * `phy` - Modulation standard to allow: `11b`, `11g`, `11n` (the esp8266 docs
   *   are not very clear, but it is assumed that 11n means b/g/n).
   * * `powersave` - Power saving mode: `none` (radio is on all the time), `ps-poll`
   *   (radio is off between beacons as determined by the access point's DTIM
   *   setting). Note that in 'ap' and 'sta+ap' modes the radio is always on, i.e.,
   *   no power saving is possible.
   * Note: esp8266 SDK programmers may be missing an "opmode" option to set the
   * sta/ap/sta+ap operation mode. Please use connect/scan/disconnect/startAP/stopAP,
   * which all set the esp8266 opmode indirectly.
   *
   * @param {any} settings - An object with the configuration settings to change.
   * @url http://www.espruino.com/Reference#l_Wifi_setConfig
   */
  function setConfig(settings: any): void;

  /**
   * Retrieve the wifi station configuration and status details. The details object
   * has the following properties:
   * * `status` - Details about the wifi station connection, one of `off`,
   *   `connecting`, `wrong_password`, `no_ap_found`, `connect_fail`, or `connected`.
   *   The off, bad_password and connected states are stable, the other states are
   *   transient. The connecting state will either result in connected or one of the
   *   error states (bad_password, no_ap_found, connect_fail) and the no_ap_found and
   *   connect_fail states will result in a reconnection attempt after some interval.
   * * `rssi` - signal strength of the connected access point in dB, typically in the
   *   range -110 to 0, with anything greater than -30 being an excessively strong
   *   signal.
   * * `ssid` - SSID of the access point.
   * * `password` - the password used to connect to the access point.
   * * `authMode` - the authentication used: `open`, `wpa`, `wpa2`, `wpa_wpa2` (not
   *   currently supported).
   * * `savedSsid` - the SSID to connect to automatically at boot time, null if none.
   *
   * @param {any} [callback] - [optional] An `callback(details)` function to be called back with the wifi details, i.e. the same object as returned directly.
   * @returns {any} An object representing the wifi station details, if available immediately.
   * @url http://www.espruino.com/Reference#l_Wifi_getDetails
   */
  function getDetails(callback?: any): any;

  /**
   * Retrieve the current access point configuration and status. The details object
   * has the following properties:
   * * `status` - Current access point status: `enabled` or `disabled`
   * * `stations` - an array of the stations connected to the access point. This
   *   array may be empty. Each entry in the array is an object describing the
   *   station which, at a minimum contains `ip` being the IP address of the station.
   * * `ssid` - SSID to broadcast.
   * * `password` - Password for authentication.
   * * `authMode` - the authentication required of stations: `open`, `wpa`, `wpa2`,
   *   `wpa_wpa2`.
   * * `hidden` - True if the SSID is hidden, false otherwise.
   * * `maxConn` - Max number of station connections supported.
   * * `savedSsid` - the SSID to broadcast automatically at boot time, null if the
   *   access point is to be disabled at boot.
   *
   * @param {any} [callback] - [optional] A `callback(details)` function to be called back with the current access point details, i.e. the same object as returned directly.
   * @returns {any} An object representing the current access point details, if available immediately.
   * @url http://www.espruino.com/Reference#l_Wifi_getAPDetails
   */
  function getAPDetails(callback?: any): any;

  /**
   * On boards where this is not available, just issue the `connect` commands you
   * need to run at startup from an `onInit` function.
   * Save the current wifi configuration (station and access point) to flash and
   * automatically apply this configuration at boot time, unless `what=="clear"`, in
   * which case the saved configuration is cleared such that wifi remains disabled at
   * boot. The saved configuration includes:
   * * mode (off/sta/ap/sta+ap)
   * * SSIDs & passwords
   * * phy (11b/g/n)
   * * powersave setting
   * * DHCP hostname
   *
   * @param {any} what - An optional parameter to specify what to save, on the esp8266 the two supported values are `clear` and `sta+ap`. The default is `sta+ap`
   * @url http://www.espruino.com/Reference#l_Wifi_save
   */
  function save(what: any): void;

  /**
   * Restores the saved Wifi configuration from flash. See `Wifi.save()`.
   * @url http://www.espruino.com/Reference#l_Wifi_restore
   */
  function restore(): void;

  /**
   * Return the station IP information in an object as follows:
   * * ip - IP address as string (e.g. "192.168.1.5")
   * * netmask - The interface netmask as string (ESP8266/ESP32 only)
   * * gw - The network gateway as string (ESP8266/ESP32 only)
   * * mac - The MAC address as string of the form 00:00:00:00:00:00
   * Note that the `ip`, `netmask`, and `gw` fields are omitted if no connection is established:
   *
   * @param {any} [callback] - [optional] A `callback(err, ipinfo)` function to be called back with the IP information.
   * @returns {any} An object representing the station IP information, if available immediately (**ONLY** on ESP8266/ESP32).
   * @url http://www.espruino.com/Reference#l_Wifi_getIP
   */
  function getIP(callback?: any): any;

  /**
   * Return the access point IP information in an object which contains:
   * * ip - IP address as string (typ "192.168.4.1")
   * * netmask - The interface netmask as string
   * * gw - The network gateway as string
   * * mac - The MAC address as string of the form 00:00:00:00:00:00
   *
   * @param {any} [callback] - [optional] A `callback(err, ipinfo)` function to be called back with the the IP information.
   * @returns {any} An object representing the esp8266's Access Point IP information, if available immediately (**ONLY** on ESP8266/ESP32).
   * @url http://www.espruino.com/Reference#l_Wifi_getAPIP
   */
  function getAPIP(callback?: any): any;

  /**
   * Lookup the hostname and invoke a callback with the IP address as integer
   * argument. If the lookup fails, the callback is invoked with a null argument.
   * **Note:** only a single hostname lookup can be made at a time, concurrent
   * lookups are not supported.
   *
   * @param {any} hostname - The hostname to lookup.
   * @param {any} callback - The `callback(ip)` to invoke when the IP is returned. `ip==null` on failure.
   * @url http://www.espruino.com/Reference#l_Wifi_getHostByName
   */
  function getHostByName(hostname: any, callback: any): void;

  /**
   * Returns the hostname announced to the DHCP server and broadcast via mDNS when
   * connecting to an access point.
   *
   * @param {any} [callback] - [optional] A `callback(hostname)` function to be called back with the hostname.
   * @returns {any} The currently configured hostname, if available immediately.
   * @url http://www.espruino.com/Reference#l_Wifi_getHostname
   */
  function getHostname(callback?: any): any;

  /**
   * Set the hostname. Depending on implementation, the hostname is sent with every
   * DHCP request and is broadcast via mDNS. The DHCP hostname may be visible in the
   * access point and may be forwarded into DNS as hostname.local. If a DHCP lease
   * currently exists changing the hostname will cause a disconnect and reconnect in
   * order to transmit the change to the DHCP server. The mDNS announcement also
   * includes an announcement for the "espruino" service.
   *
   * @param {any} hostname - The new hostname.
   * @param {any} [callback] - [optional] A `callback()` function to be called back when the hostname is set
   * @url http://www.espruino.com/Reference#l_Wifi_setHostname
   */
  function setHostname(hostname: any, callback?: any): void;

  /**
   * Starts the SNTP (Simple Network Time Protocol) service to keep the clock
   * synchronized with the specified server. Note that the time zone is really just
   * an offset to UTC and doesn't handle daylight savings time. The interval
   * determines how often the time server is queried and Espruino's time is
   * synchronized. The initial synchronization occurs asynchronously after setSNTP
   * returns.
   *
   * @param {any} server - The NTP server to query, for example, `us.pool.ntp.org`
   * @param {any} tz_offset - Local time zone offset in the range -11..13.
   * @url http://www.espruino.com/Reference#l_Wifi_setSNTP
   */
  function setSNTP(server: any, tz_offset: any): void;

  /**
   * The `settings` object must contain the following properties.
   * * `ip` IP address as string (e.g. "192.168.5.100")
   * * `gw` The network gateway as string (e.g. "192.168.5.1")
   * * `netmask` The interface netmask as string (e.g. "255.255.255.0")
   *
   * @param {any} settings - Configuration settings
   * @param {any} callback - A `callback(err)` function to invoke when ip is set. `err==null` on success, or a string on failure.
   * @url http://www.espruino.com/Reference#l_Wifi_setIP
   */
  function setIP(settings: any, callback: any): void;

  /**
   * The `settings` object must contain the following properties.
   * * `ip` IP address as string (e.g. "192.168.5.100")
   * * `gw` The network gateway as string (e.g. "192.168.5.1")
   * * `netmask` The interface netmask as string (e.g. "255.255.255.0")
   *
   * @param {any} settings - Configuration settings
   * @param {any} callback - A `callback(err)` function to invoke when ip is set. `err==null` on success, or a string on failure.
   * @url http://www.espruino.com/Reference#l_Wifi_setAPIP
   */
  function setAPIP(settings: any, callback: any): void;

  /**
   * Issues a ping to the given host, and calls a callback with the time when the
   * ping is received.
   *
   * @param {any} hostname - The host to ping
   * @param {any} callback - A `callback(time)` function to invoke when a ping is received
   * @url http://www.espruino.com/Reference#l_Wifi_ping
   */
  function ping(hostname: any, callback: any): void;

  /**
   * Switch to using a higher communication speed with the WiFi module.
   * * `true` = 921600 baud
   * * `false` = 115200
   * * `1843200` (or any number) = use a specific baud rate. * e.g.
   * `wifi.turbo(true,callback)` or `wifi.turbo(1843200,callback)`
   *
   * @param {any} enable - true (or a baud rate as a number) to enable, false to disable
   * @param {any} callback - A `callback()` function to invoke when turbo mode has been set
   * @url http://www.espruino.com/Reference#l_Wifi_turbo
   */
  function turbo(enable: any, callback: any): void;
}

/**
 * Library that initialises a network device that calls into JavaScript
 * @url http://www.espruino.com/Reference#NetworkJS
 */
declare module "NetworkJS" {
  /**
   * Initialise the network using the callbacks given and return the first argument.
   * For instance:
   * ```
   * require("NetworkJS").create({
   *   create : function(host, port, socketType, options) {
   *     // Create a socket and return its index, host is a string, port is an integer.
   *     // If host isn't defined, create a server socket
   *     console.log("Create",host,port);
   *     return 1;
   *   },
   *   close : function(sckt) {
   *     // Close the socket. returns nothing
   *   },
   *   accept : function(sckt) {
   *     // Accept the connection on the server socket. Returns socket number or -1 if no connection
   *     return -1;
   *   },
   *   recv : function(sckt, maxLen, socketType) {
   *     // Receive data. Returns a string (even if empty).
   *     // If non-string returned, socket is then closed
   *     return null;//or "";
   *   },
   *   send : function(sckt, data, socketType) {
   *     // Send data (as string). Returns the number of bytes sent - 0 is ok.
   *     // Less than 0
   *     return data.length;
   *   }
   * });
   * ```
   * `socketType` is an integer - 2 for UDP, or see SocketType in
   * https://github.com/espruino/Espruino/blob/master/libs/network/network.h for more
   * information.
   *
   * @param {any} obj - An object containing functions to access the network device
   * @returns {any} The object passed in
   * @url http://www.espruino.com/Reference#l_NetworkJS_create
   */
  function create(obj: any): any;
}

/**
 * This library allows you to create http servers and make http requests
 * In order to use this, you will need an extra module to get network connectivity
 * such as the [TI CC3000](/CC3000) or [WIZnet W5500](/WIZnet).
 * This is designed to be a cut-down version of the [node.js
 * library](http://nodejs.org/api/http.html). Please see the [Internet](/Internet)
 * page for more information on how to use it.
 * @url http://www.espruino.com/Reference#http
 */
declare module "http" {
  /**
   * Create an HTTP Server
   * When a request to the server is made, the callback is called. In the callback
   * you can use the methods on the response (`httpSRs`) to send data. You can also
   * add `request.on('data',function() { ... })` to listen for POSTed data
   *
   * @param {any} callback - A function(request,response) that will be called when a connection is made
   * @returns {any} Returns a new httpSrv object
   * @url http://www.espruino.com/Reference#l_http_createServer
   */
  function createServer(callback: any): httpSrv;

  /**
   * Create an HTTP Request - `end()` must be called on it to complete the operation.
   * `options` is of the form:
   * ```
   * var options = {
   *     host: 'example.com', // host name
   *     port: 80,            // (optional) port, defaults to 80
   *     path: '/',           // path sent to server
   *     method: 'GET',       // HTTP command sent to server (must be uppercase 'GET', 'POST', etc)
   *     protocol: 'http:',   // optional protocol - https: or http:
   *     headers: { key : value, key : value } // (optional) HTTP headers
   *   };
   * var req = require("http").request(options, function(res) {
   *   res.on('data', function(data) {
   *     console.log("HTTP> "+data);
   *   });
   *   res.on('close', function(data) {
   *     console.log("Connection closed");
   *   });
   * });
   * // You can req.write(...) here if your request requires data to be sent.
   * req.end(); // called to finish the HTTP request and get the response
   * ```
   * You can easily pre-populate `options` from a URL using `var options =
   * url.parse("http://www.example.com/foo.html")`
   * There's an example of using [`http.request` for HTTP POST
   * here](/Internet#http-post)
   * **Note:** if TLS/HTTPS is enabled, options can have `ca`, `key` and `cert`
   * fields. See `tls.connect` for more information about these and how to use them.
   *
   * @param {any} options - An object containing host,port,path,method,headers fields (and also ca,key,cert if HTTPS is enabled)
   * @param {any} callback - A function(res) that will be called when a connection is made. You can then call `res.on('data', function(data) { ... })` and `res.on('close', function() { ... })` to deal with the response.
   * @returns {any} Returns a new httpCRq object
   * @url http://www.espruino.com/Reference#l_http_request
   */
  function request(options: any, callback: any): httpCRq;

  /**
   * Request a webpage over HTTP - a convenience function for `http.request()` that
   * makes sure the HTTP command is 'GET', and that calls `end` automatically.
   * ```
   * require("http").get("http://pur3.co.uk/hello.txt", function(res) {
   *   res.on('data', function(data) {
   *     console.log("HTTP> "+data);
   *   });
   *   res.on('close', function(data) {
   *     console.log("Connection closed");
   *   });
   * });
   * ```
   * See `http.request()` and [the Internet page](/Internet) and ` for more usage
   * examples.
   *
   * @param {any} options - A simple URL, or an object containing host,port,path,method fields
   * @param {any} callback - A function(res) that will be called when a connection is made. You can then call `res.on('data', function(data) { ... })` and `res.on('close', function() { ... })` to deal with the response.
   * @returns {any} Returns a new httpCRq object
   * @url http://www.espruino.com/Reference#l_http_get
   */
  function get(options: any, callback: any): httpCRq;
}

/**
 * Library for communication with the WIZnet Ethernet module
 * @url http://www.espruino.com/Reference#WIZnet
 */
declare module "WIZnet" {
  /**
   * Initialise the WIZnet module and return an Ethernet object
   *
   * @param {any} spi - Device to use for SPI (or undefined to use the default)
   * @param {Pin} cs - The pin to use for Chip Select
   * @returns {any} An Ethernet Object
   * @url http://www.espruino.com/Reference#l_WIZnet_connect
   */
  function connect(spi: any, cs: Pin): Ethernet;
}

/**
 * @url http://www.espruino.com/Reference#CC3000
 */
declare module "CC3000" {
  /**
   * Initialise the CC3000 and return a WLAN object
   *
   * @param {any} spi - Device to use for SPI (or undefined to use the default). SPI should be 1,000,000 baud, and set to 'mode 1'
   * @param {Pin} cs - The pin to use for Chip Select
   * @param {Pin} en - The pin to use for Enable
   * @param {Pin} irq - The pin to use for Interrupts
   * @returns {any} A WLAN Object
   * @url http://www.espruino.com/Reference#l_CC3000_connect
   */
  function connect(spi: any, cs: Pin, en: Pin, irq: Pin): WLAN;
}

/**
 * This library implements a telnet console for the Espruino interpreter. It
 * requires a network connection, e.g. Wifi, and **currently only functions on the
 * ESP8266 and on Linux **. It uses port 23 on the ESP8266 and port 2323 on Linux.
 * **Note:** To enable on Linux, run `./espruino --telnet`
 * @url http://www.espruino.com/Reference#TelnetServer
 */
declare module "TelnetServer" {
  /**
   *
   * @param {any} options - Options controlling the telnet console server `{ mode : 'on|off'}`
   * @url http://www.espruino.com/Reference#l_TelnetServer_setOptions
   */
  function setOptions(options: any): void;
}

/**
 * This library handles interfacing with a FAT32 filesystem on an SD card. The API
 * is designed to be similar to node.js's - However Espruino does not currently
 * support asynchronous file IO, so the functions behave like node.js's xxxxSync
 * functions. Versions of the functions with 'Sync' after them are also provided
 * for compatibility.
 * To use this, you must type ```var fs = require('fs')``` to get access to the
 * library
 * See [the page on File IO](http://www.espruino.com/File+IO) for more information,
 * and for examples on wiring up an SD card if your device doesn't come with one.
 * **Note:** If you want to remove an SD card after you have started using it, you
 * *must* call `E.unmountSD()` or you may cause damage to the card.
 * @url http://www.espruino.com/Reference#fs
 */
declare module "fs" {
  /**
   * List all files in the supplied directory, returning them as an array of strings.
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like
   * the 'Sync' version.
   *
   * @param {any} path - The path of the directory to list. If it is not supplied, '' is assumed, which will list the root directory
   * @returns {any} An array of filename strings (or undefined if the directory couldn't be listed)
   * @url http://www.espruino.com/Reference#l_fs_readdir
   */
  function readdir(path: any): any;

  /**
   * List all files in the supplied directory, returning them as an array of strings.
   *
   * @param {any} path - The path of the directory to list. If it is not supplied, '' is assumed, which will list the root directory
   * @returns {any} An array of filename strings (or undefined if the directory couldn't be listed)
   * @url http://www.espruino.com/Reference#l_fs_readdirSync
   */
  function readdirSync(path: any): any;

  /**
   * Write the data to the given file
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like
   * the 'Sync' version.
   *
   * @param {any} path - The path of the file to write
   * @param {any} data - The data to write to the file
   * @returns {boolean} True on success, false on failure
   * @url http://www.espruino.com/Reference#l_fs_writeFile
   */
  function writeFile(path: any, data: any): boolean;

  /**
   * Write the data to the given file
   *
   * @param {any} path - The path of the file to write
   * @param {any} data - The data to write to the file
   * @returns {boolean} True on success, false on failure
   * @url http://www.espruino.com/Reference#l_fs_writeFileSync
   */
  function writeFileSync(path: any, data: any): boolean;

  /**
   * Append the data to the given file, created a new file if it doesn't exist
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like
   * the 'Sync' version.
   *
   * @param {any} path - The path of the file to write
   * @param {any} data - The data to write to the file
   * @returns {boolean} True on success, false on failure
   * @url http://www.espruino.com/Reference#l_fs_appendFile
   */
  function appendFile(path: any, data: any): boolean;

  /**
   * Append the data to the given file, created a new file if it doesn't exist
   *
   * @param {any} path - The path of the file to write
   * @param {any} data - The data to write to the file
   * @returns {boolean} True on success, false on failure
   * @url http://www.espruino.com/Reference#l_fs_appendFileSync
   */
  function appendFileSync(path: any, data: any): boolean;

  /**
   * Read all data from a file and return as a string
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like
   * the 'Sync' version.
   *
   * @param {any} path - The path of the file to read
   * @returns {any} A string containing the contents of the file (or undefined if the file doesn't exist)
   * @url http://www.espruino.com/Reference#l_fs_readFile
   */
  function readFile(path: any): any;

  /**
   * Read all data from a file and return as a string.
   * **Note:** The size of files you can load using this method is limited by the
   * amount of available RAM. To read files a bit at a time, see the `File` class.
   *
   * @param {any} path - The path of the file to read
   * @returns {any} A string containing the contents of the file (or undefined if the file doesn't exist)
   * @url http://www.espruino.com/Reference#l_fs_readFileSync
   */
  function readFileSync(path: any): any;

  /**
   * Delete the given file
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like
   * the 'Sync' version.
   *
   * @param {any} path - The path of the file to delete
   * @returns {boolean} True on success, or false on failure
   * @url http://www.espruino.com/Reference#l_fs_unlink
   */
  function unlink(path: any): boolean;

  /**
   * Delete the given file
   *
   * @param {any} path - The path of the file to delete
   * @returns {boolean} True on success, or false on failure
   * @url http://www.espruino.com/Reference#l_fs_unlinkSync
   */
  function unlinkSync(path: any): boolean;

  /**
   * Return information on the given file. This returns an object with the following
   * fields:
   * size: size in bytes dir: a boolean specifying if the file is a directory or not
   * mtime: A Date structure specifying the time the file was last modified
   *
   * @param {any} path - The path of the file to get information on
   * @returns {any} An object describing the file, or undefined on failure
   * @url http://www.espruino.com/Reference#l_fs_statSync
   */
  function statSync(path: any): any;

  /**
   * Create the directory
   * NOTE: Espruino does not yet support Async file IO, so this function behaves like
   * the 'Sync' version.
   *
   * @param {any} path - The name of the directory to create
   * @returns {boolean} True on success, or false on failure
   * @url http://www.espruino.com/Reference#l_fs_mkdir
   */
  function mkdir(path: any): boolean;

  /**
   * Create the directory
   *
   * @param {any} path - The name of the directory to create
   * @returns {boolean} True on success, or false on failure
   * @url http://www.espruino.com/Reference#l_fs_mkdirSync
   */
  function mkdirSync(path: any): boolean;

  /**
   * Pipe this file to a destination stream (object which has a `.write(data)` method).
   *
   * @param {any} source - The source file/stream that will send content.
   * @param {any} destination - The destination file/stream that will receive content from the source.
   * @param {any} [options]
   * [optional] An object `{ chunkSize : int=64, end : bool=true, complete : function }`
   * chunkSize : The amount of data to pipe from source to destination at a time
   * complete : a function to call when the pipe activity is complete
   * end : call the 'end' function on the destination when the source is finished
   * @url http://www.espruino.com/Reference#l_fs_pipe
   */
  function pipe(destination: any, options?: PipeOptions): void
}

/**
 * This library provides TV out capability on the Espruino and Espruino Pico.
 * See the [Television](/Television) page for more information.
 * @url http://www.espruino.com/Reference#tv
 */
declare module "tv" {
  /**
   * This initialises the TV output. Options for PAL are as follows:
   * ```
   * var g = require('tv').setup({ type : "pal",
   *   video : A7, // Pin - SPI MOSI Pin for Video output (MUST BE SPI1)
   *   sync : A6, // Pin - Timer pin to use for video sync
   *   width : 384,
   *   height : 270, // max 270
   * });
   * ```
   * and for VGA:
   * ```
   * var g = require('tv').setup({ type : "vga",
   *   video : A7, // Pin - SPI MOSI Pin for Video output (MUST BE SPI1)
   *   hsync : A6, // Pin - Timer pin to use for video sync
   *   vsync : A5, // Pin - pin to use for video sync
   *   width : 220,
   *   height : 240,
   *   repeat : 2, // amount of times to repeat each line
   * });
   * ```
   * or
   * ```
   * var g = require('tv').setup({ type : "vga",
   *   video : A7, // Pin - SPI MOSI Pin for Video output (MUST BE SPI1)
   *   hsync : A6, // Pin - Timer pin to use for video sync
   *   vsync : A5, // Pin - pin to use for video sync
   *   width : 220,
   *   height : 480,
   *   repeat : 1, // amount of times to repeat each line
   * });
   * ```
   * See the [Television](/Television) page for more information.
   *
   * @param {any} options - Various options for the TV output
   * @param {number} width
   * @returns {any} A graphics object
   * @url http://www.espruino.com/Reference#l_tv_setup
   */
  function setup(options: any, width: number): any;
}

/**
 * @url http://www.espruino.com/Reference#tensorflow
 */
declare module "tensorflow" {
  /**
   *
   * @param {number} arenaSize - The TensorFlow Arena size
   * @param {any} model - The model to use - this should be a flat array/string
   * @returns {any} A tensorflow instance
   * @url http://www.espruino.com/Reference#l_tensorflow_create
   */
  function create(arenaSize: number, model: any): TFMicroInterpreter;
}

/**
 * Simple library for compression/decompression using
 * [heatshrink](https://github.com/atomicobject/heatshrink), an
 * [LZSS](https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Storer%E2%80%93Szymanski)
 * compression tool.
 * Espruino uses heatshrink internally to compress RAM down to fit in Flash memory
 * when `save()` is used. This just exposes that functionality.
 * Functions here take and return buffers of data. There is no support for
 * streaming, so both the compressed and decompressed data must be able to fit in
 * memory at the same time.
 * ```
 * var c = require("heatshrink").compress("Hello World");
 * // =new Uint8Array([....]).buffer
 * var d = require("heatshrink").decompress(c);
 * // =new Uint8Array([72, 101, ...]).buffer
 * E.toString(d)
 * // ="Hello World"
 * ```
 * If you'd like a way to perform compression/decompression on desktop, check out https://github.com/espruino/EspruinoWebTools#heatshrinkjs
 * @url http://www.espruino.com/Reference#heatshrink
 */
declare module "heatshrink" {
  /**
   * Compress the data supplied as input, and return heatshrink encoded data as an ArrayBuffer.
   * No type information is stored, and the `data` argument is treated as an array of bytes
   * (whether it is a `String`/`Uint8Array` or even `Uint16Array`), so the result of
   * decompressing any compressed data will always be an ArrayBuffer.
   * If you'd like a way to perform compression/decompression on desktop, check out https://github.com/espruino/EspruinoWebTools#heatshrinkjs
   *
   * @param {any} data - The data to compress
   * @returns {any} Returns the result as an ArrayBuffer
   * @url http://www.espruino.com/Reference#l_heatshrink_compress
   */
  function compress(data: any): ArrayBuffer;

  /**
   * Decompress the heatshrink-encoded data supplied as input, and return it as an `ArrayBuffer`.
   * To get the result as a String, wrap `require("heatshrink").decompress` in `E.toString`: `E.toString(require("heatshrink").decompress(...))`
   * If you'd like a way to perform compression/decompression on desktop, check out https://github.com/espruino/EspruinoWebTools#heatshrinkjs
   *
   * @param {any} data - The data to decompress
   * @returns {any} Returns the result as an `ArrayBuffer`
   * @url http://www.espruino.com/Reference#l_heatshrink_decompress
   */
  function decompress(data: any): ArrayBuffer;
}

/**
 * This module allows you to read and write the nonvolatile flash memory of your
 * device.
 * Also see the `Storage` library, which provides a safer file-like interface to
 * nonvolatile storage.
 * It should be used with extreme caution, as it is easy to overwrite parts of
 * Flash memory belonging to Espruino or even its bootloader. If you damage the
 * bootloader then you may need external hardware such as a USB-TTL converter to
 * restore it. For more information on restoring the bootloader see `Advanced
 * Reflashing` in your board's reference pages.
 * To see which areas of memory you can and can't overwrite, look at the values
 * reported by `process.memory()`.
 * **Note:** On Nordic platforms there are checks in place to help you avoid
 * 'bricking' your device be damaging the bootloader. You can disable these with
 * `E.setFlags({unsafeFlash:1})`
 * @url http://www.espruino.com/Reference#Flash
 */
declare module "Flash" {
  /**
   * Returns the start and length of the flash page containing the given address.
   *
   * @param {number} addr - An address in memory
   * @returns {any} An object of the form `{ addr : #, length : #}`, where `addr` is the start address of the page, and `length` is the length of it (in bytes). Returns undefined if no page at address
   * @url http://www.espruino.com/Reference#l_Flash_getPage
   */
  function getPage(addr: number): any;

  /**
   * This method returns an array of objects of the form `{addr : #, length : #}`,
   * representing contiguous areas of flash memory in the chip that are not used for
   * anything.
   * The memory areas returned are on page boundaries. This means that you can safely
   * erase the page containing any address here, and you won't risk deleting part of
   * the Espruino firmware.
   * @returns {any} Array of objects with `addr` and `length` properties
   * @url http://www.espruino.com/Reference#l_Flash_getFree
   */
  function getFree(): any;

  /**
   * Erase a page of flash memory
   *
   * @param {any} addr - An address in the page that is to be erased
   * @url http://www.espruino.com/Reference#l_Flash_erasePage
   */
  function erasePage(addr: any): void;

  /**
   * Write data into memory at the given address
   * In flash memory you may only turn bits that are 1 into bits that are 0. If
   * you're writing data into an area that you have already written (so `read`
   * doesn't return all `0xFF`) you'll need to call `erasePage` to clear the entire
   * page.
   *
   * @param {any} data - The data to write
   * @param {number} addr - The address to start writing from
   * @url http://www.espruino.com/Reference#l_Flash_write
   */
  function write(data: any, addr: number): void;

  /**
   * Read flash memory from the given address
   *
   * @param {number} length - The amount of data to read (in bytes)
   * @param {number} addr - The address to start reading from
   * @returns {any} A Uint8Array of data
   * @url http://www.espruino.com/Reference#l_Flash_read
   */
  function read(length: number, addr: number): any;
}

/**
 * This module allows you to read and write part of the nonvolatile flash memory of
 * your device using a filesystem-like API.
 * Also see the `Flash` library, which provides a low level, more dangerous way to
 * access all parts of your flash memory.
 * The `Storage` library provides two distinct types of file:
 * * `require("Storage").write(...)`/`require("Storage").read(...)`/etc create
 * simple contiguous files of fixed length. This is the recommended file type.
 * * `require("Storage").open(...)` creates a `StorageFile`, which stores the file
 * in numbered chunks (`"filename\1"`/`"filename\2"`/etc). It allows data to be
 * appended and for the file to be read line by line.
 * You must read a file using the same method you used to write it - e.g. you can't
 * create a file with `require("Storage").open(...)` and then read it with
 * `require("Storage").read(...)`.
 * **Note:** In firmware 2v05 and later, the maximum length for filenames is 28
 * characters. However in 2v04 and earlier the max length is 8.
 * @url http://www.espruino.com/Reference#Storage
 */
declare module "Storage" {
  /**
   * Erase the flash storage area. This will remove all files created with
   * `require("Storage").write(...)` as well as any code saved with `save()` or
   * `E.setBootCode()`.
   * @url http://www.espruino.com/Reference#l_Storage_eraseAll
   */
  function eraseAll(): void;

  /**
   * Erase a single file from the flash storage area.
   * **Note:** This function should be used with normal files, and not `StorageFile`s
   * created with `require("Storage").open(filename, ...)`. To erase those, use
   * `require("Storage").open(..., "r").erase()`.
   *
   * @param {any} name - The filename - max 28 characters (case sensitive)
   * @url http://www.espruino.com/Reference#l_Storage_erase
   */
  function erase(name: string): void;

  /**
   * Read a file from the flash storage area that has been written with
   * `require("Storage").write(...)`.
   * This function returns a memory-mapped String that points to the actual memory
   * area in read-only memory, so it won't use up RAM.
   * As such you can check if a file exists efficiently using
   * `require("Storage").read(filename)!==undefined`.
   * If you evaluate this string with `eval`, any functions contained in the String
   * will keep their code stored in flash memory.
   * **Note:** This function should be used with normal files, and not `StorageFile`s
   * created with `require("Storage").open(filename, ...)`
   *
   * @param {any} name - The filename - max 28 characters (case sensitive)
   * @param {number} [offset] - [optional] The offset in bytes to start from
   * @param {number} [length] - [optional] The length to read in bytes (if <=0, the entire file is read)
   * @returns {any} A string of data, or `undefined` if the file is not found
   * @url http://www.espruino.com/Reference#l_Storage_read
   */
  function read(name: string, offset?: number, length?: number): string | undefined;

  /**
   * Read a file from the flash storage area that has been written with
   * `require("Storage").write(...)`, and parse JSON in it into a JavaScript object.
   * This is identical to `JSON.parse(require("Storage").read(...))`. It will throw
   * an exception if the data in the file is not valid JSON.
   * **Note:** This function should be used with normal files, and not `StorageFile`s
   * created with `require("Storage").open(filename, ...)`
   *
   * @param {any} name - The filename - max 28 characters (case sensitive)
   * @param {boolean} noExceptions - If true and the JSON is not valid, just return `undefined` - otherwise an `Exception` is thrown
   * @returns {any} An object containing parsed JSON from the file, or undefined
   * @url http://www.espruino.com/Reference#l_Storage_readJSON
   */
  function readJSON(name: string, noExceptions?: false | 0): unknown;
  function readJSON(name: string, noExceptions?: ShortBoolean): unknown | undefined;

  /**
   * Read a file from the flash storage area that has been written with
   * `require("Storage").write(...)`, and return the raw binary data as an
   * ArrayBuffer.
   * This can be used:
   * * In a `DataView` with `new DataView(require("Storage").readArrayBuffer("x"))`
   * * In a `Uint8Array/Float32Array/etc` with `new
   *   Uint8Array(require("Storage").readArrayBuffer("x"))`
   * **Note:** This function should be used with normal files, and not `StorageFile`s
   * created with `require("Storage").open(filename, ...)`
   *
   * @param {any} name - The filename - max 28 characters (case sensitive)
   * @returns {any} An ArrayBuffer containing data from the file, or undefined
   * @url http://www.espruino.com/Reference#l_Storage_readArrayBuffer
   */
  function readArrayBuffer(name: string): ArrayBuffer | undefined;

  /**
   * Write/create a file in the flash storage area. This is nonvolatile and will not
   * disappear when the device resets or power is lost.
   * Simply write `require("Storage").write("MyFile", "Some data")` to write a new
   * file, and `require("Storage").read("MyFile")` to read it.
   * If you supply:
   * * A String, it will be written as-is
   * * An array, will be written as a byte array (but read back as a String)
   * * An object, it will automatically be converted to a JSON string before being
   * written.
   * **Note:** If an array is supplied it will not be converted to JSON. To be
   * explicit about the conversion you can use `Storage.writeJSON`
   * You may also create a file and then populate data later **as long as you don't
   * try and overwrite data that already exists**. For instance:
   * ```
   * var f = require("Storage");
   * f.write("a","Hello",0,14); // Creates a new file, 14 chars long
   * print(JSON.stringify(f.read("a"))); // read the file
   * // any nonwritten chars will be char code 255:
   * "Hello\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF"
   * f.write("a"," ",5); // write within the file
   * f.write("a","World!!!",6); // write again within the file
   * print(f.read("a")); // "Hello World!!!"
   * f.write("a"," ",0); // Writing to location 0 again will cause the file to be re-written
   * print(f.read("a")); // " "
   * ```
   * This can be useful if you've got more data to write than you have RAM
   * available - for instance the Web IDE uses this method to write large files into
   * onboard storage.
   * **Note:** This function should be used with normal files, and not `StorageFile`s
   * created with `require("Storage").open(filename, ...)`
   *
   * @param {any} name - The filename - max 28 characters (case sensitive)
   * @param {any} data - The data to write
   * @param {number} [offset] - [optional] The offset within the file to write (if `0`/`undefined` a new file is created, otherwise Espruino attempts to write within an existing file if one exists)
   * @param {number} [size] - [optional] The size of the file (if a file is to be created that is bigger than the data)
   * @returns {boolean} True on success, false on failure
   * @url http://www.espruino.com/Reference#l_Storage_write
   */
  function write(name: string | ArrayBuffer | ArrayBufferView | number[] | object, data: any, offset?: number, size?: number): boolean;

  /**
   * Write/create a file in the flash storage area. This is nonvolatile and will not
   * disappear when the device resets or power is lost.
   * Simply write `require("Storage").writeJSON("MyFile", [1,2,3])` to write a new
   * file, and `require("Storage").readJSON("MyFile")` to read it.
   * This is (almost) equivalent to `require("Storage").write(name, JSON.stringify(data))` (see the notes below)
   * **Note:** This function should be used with normal files, and not `StorageFile`s
   * created with `require("Storage").open(filename, ...)`
   * **Note:** Normally `JSON.stringify` converts any non-standard character to an escape code with `\uXXXX`, but
   * as of Espruino 2v20, when writing to a file we use the most compact form, like `\xXX` or `\X`, as well as
   * skipping quotes on fields. This saves space and is faster, but also means that if a String wasn't a UTF8
   * string but contained characters in the UTF8 codepoint range, when saved it won't end up getting reloaded as a UTF8 string.
   * It does mean that you cannot parse the file with just `JSON.parse` as it's no longer standard JSON but is JS,
   * so you must use `Storage.readJSON`
   *
   * @param {any} name - The filename - max 28 characters (case sensitive)
   * @param {any} data - The JSON data to write
   * @returns {boolean} True on success, false on failure
   * @url http://www.espruino.com/Reference#l_Storage_writeJSON
   */
  function writeJSON(name: string, data: any): boolean;

  /**
   * List all files in the flash storage area. An array of Strings is returned.
   * By default this lists files created by `StorageFile` (`require("Storage").open`)
   * which have a file number (`"\1"`/`"\2"`/etc) appended to them.
   * ```
   * // All files
   * require("Storage").list()
   * // Files ending in '.js'
   * require("Storage").list(/\.js$/)
   * // All Storage Files
   * require("Storage").list(undefined, {sf:true})
   * // All normal files (e.g. created with Storage.write)
   * require("Storage").list(undefined, {sf:false})
   * ```
   * **Note:** This will output system files (e.g. saved code) as well as files that
   * you may have written.
   *
   * @param {any} [regex] - [optional] If supplied, filenames are checked against this regular expression (with `String.match(regexp)`) to see if they match before being returned
   * @param {any} [filter] - [optional] If supplied, File Types are filtered based on this: `{sf:true}` or `{sf:false}` for whether to show StorageFile
   * @returns {any} An array of filenames
   * @url http://www.espruino.com/Reference#l_Storage_list
   */
  function list(regex?: RegExp, filter?: { sf: boolean }): string[];

  /**
   * List all files in the flash storage area matching the specified regex (ignores
   * StorageFiles), and then hash their filenames *and* file locations.
   * Identical files may have different hashes (e.g. if Storage is compacted and the
   * file moves) but the chances of different files having the same hash are
   * extremely small.
   * ```
   * // Hash files
   * require("Storage").hash()
   * // Files ending in '.boot.js'
   * require("Storage").hash(/\.boot\.js$/)
   * ```
   * **Note:** This function is used by Bangle.js as a way to cache files. For
   * instance the bootloader will add all `.boot.js` files together into a single
   * `.boot0` file, but it needs to know quickly whether anything has changed.
   *
   * @param {any} [regex] - [optional] If supplied, filenames are checked against this regular expression (with `String.match(regexp)`) to see if they match before being hashed
   * @returns {number} A hash of the files matching
   * @url http://www.espruino.com/Reference#l_Storage_hash
   */
  function hash(regex: RegExp): number;

  /**
   * The Flash Storage system is journaling. To make the most of the limited write
   * cycles of Flash memory, Espruino marks deleted/replaced files as garbage/trash files and
   * moves on to a fresh part of flash memory. Espruino only fully erases those files
   * when it is running low on flash, or when `compact` is called.
   * `compact` may fail if there isn't enough RAM free on the stack to use as swap
   * space, however in this case it will not lose data.
   * **Note:** `compact` rearranges the contents of memory. If code is referencing
   * that memory (e.g. functions that have their code stored in flash) then they may
   * become garbled when compaction happens. To avoid this, call `eraseFiles` before
   * uploading data that you intend to reference to ensure that uploaded files are
   * right at the start of flash and cannot be compacted further.
   *
   * @param {boolean} [showMessage] - [optional] If true, an overlay message will be displayed on the screen while compaction is happening. Default is false.
   * @url http://www.espruino.com/Reference#l_Storage_compact
   */
  function compact(showMessage?: boolean): void;

  /**
   * This writes information about all blocks in flash memory to the console - and is
   * only useful for debugging flash storage.
   * @url http://www.espruino.com/Reference#l_Storage_debug
   */
  function debug(): void;

  /**
   * Return the amount of free bytes available in Storage. Due to fragmentation there
   * may be more bytes available, but this represents the maximum size of file that
   * can be written.
   * **NOTE:** `checkInternalFlash` is only useful on DICKENS devices - other devices don't use two different flash banks
   *
   * @param {boolean} checkInternalFlash - Check the internal flash (rather than external SPI flash).  Default false, so will check external storage
   * @returns {number} The amount of free bytes
   * @url http://www.espruino.com/Reference#l_Storage_getFree
   */
  function getFree(checkInternalFlash: boolean): number;

  /**
   * Returns:
   * ```
   * {
   *   totalBytes // Amount of bytes in filesystem
   *   freeBytes // How many bytes are left at the end of storage?
   *   fileBytes // How many bytes of allocated files do we have?
   *   fileCount // How many allocated files do we have?
   *   trashBytes // How many bytes of trash files do we have?
   *   trashCount // How many trash files do we have? (can be cleared with .compact)
   * }
   * ```
   * **NOTE:** `checkInternalFlash` is only useful on DICKENS devices - other devices don't use two different flash banks
   *
   * @param {boolean} checkInternalFlash - Check the internal flash (rather than external SPI flash).  Default false, so will check external storage
   * @returns {any} An object containing info about the current Storage system
   * @url http://www.espruino.com/Reference#l_Storage_getStats
   */
  function getStats(checkInternalFlash: boolean): any;

  /**
   * Writes a lookup table for files into Bangle.js's storage. This allows any file
   * stored up to that point to be accessed quickly.
   * @url http://www.espruino.com/Reference#l_Storage_optimise
   */
  function optimise(): void;

  /**
   * Open a file in the Storage area. This can be used for appending data
   * (normal read/write operations only write the entire file).
   * Please see `StorageFile` for more information (and examples).
   * **Note:** These files write through immediately - they do not need closing.
   *
   * @param {any} name - The filename - max **27** characters (case sensitive)
   * @param {any} mode - The open mode - must be either `'r'` for read,`'w'` for write , or `'a'` for append
   * @returns {any} An object containing {read,write,erase}
   * @url http://www.espruino.com/Reference#l_Storage_open
   */
  function open(name: string, mode: "r" | "w" | "a"): StorageFile;
}