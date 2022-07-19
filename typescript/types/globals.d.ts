/*~ This file declares the Espruino globals.
 *~ Reference: https://banglejs.com/reference#_global
 */

/* Note: The following don't have to be declared as they are
 * already part of regular JavaScript:
 * btoa
 * clearInterval
 * clearTimeout
 * decodeURIComponent
 * encodeURIComponent
 * eval
 * Infinity
 * isFinite
 * isNaN
 * NaN
 * parseFloat
 * parseInt
 * setInterval
 * setTimeout
 */

// Pins
declare type Pin = number;
declare type PinMode =
  | "analog"
  | "input"
  | "intupt_pullup"
  | "intupt_pulldown"
  | "output"
  | "opendrain"
  | "af_output"
  | "af_opendrain";

declare const BTN: 24;
declare const BTN1: 24;
declare const BTN2: 22;
declare const BTN3: 23;
declare const BTN4: 11;
declare const BTN5: 16;
declare const VIBRATE: 13;

declare function getPinMode(pin: Pin): PinMode;
declare function pinMode(
  pin: Pin,
  mode?: PinMode | "auto",
  automatic?: boolean
): void;

// Analog pins

/**
 * Get the analog value of the given pin.
 * This is different to Arduino which only returns an integer between 0 and 1023.
 * However only pins connected to an ADC will work (see the datasheet).
 * **Note**: if you didn't call `pinMode` beforehand then this function will also reset pin's state to "analog".
 * @param {number} pin - The pin to use.
 * @returns {number} The analog Value of the Pin between 0 and 1.
 * @url https://banglejs.com/reference#l__global_analogRead
 */
declare function analogRead(pin: Pin): number;

/**
 * Set the analog Value of a pin. It will be output using PWM.
 * **Note**: if you didn't call pinMode beforehand then this function will also reset pin's state to "output".
 * @param {number} pin - The pin to use.
 * @param {number} value - A value between 0 and 1.
 * @param {object} [options] - Additonal options.
 * @param {number} [options.freq] - Pulse frequency in Hz, e.g. 10 - specifying a frequency will force PWM output, even if the pin has a DAC.
 * @param {boolean} [options.soft] - If true software PWM is used if hardware is not available.
 * @param {boolean} [options.forceSoft] - If true software PWM is used even if hardware PWM or a DAC is available.
 */
declare function analogWrite(
  pin: Pin,
  value: number,
  options?: { freq?: number; soft?: boolean; forceSoft?: boolean }
): void;

// Digital pins
declare const HIGH: 1;

declare const LOW: 0;

declare function digitalPulse(pin: Pin, value: boolean, time: number): void;

declare function digitalRead(pin: Pin | Pin[]): number;

declare function digitalWrite(pin: Pin, value: boolean): void;
declare function digitalWrite(pin: Pin[], value: number): void;
declare function digitalWrite(
  pin: {
    write: (value: boolean) => void;
  },
  value: boolean
): void;

// Other globals
declare function atob(base64Data: string): string;

declare function btoa(binaryData: string): string;

declare function changeInterval(id: number, time: number): void;

declare function dump(): void;

declare function echo(echoOn: boolean): void;

declare function edit(funcName: string | Function): void;

declare function getSerial(): number;

declare function getTime(): number;

declare const global: any; //TODO define better

declare const I2C1: I2C;

declare function load(file?: string): void;

declare function peek8(address: number, count?: 1): number;
declare function peek8(address: number, count: number): Uint8Array;

declare function peek16(address: number, count?: 1): number;
declare function peek16(address: number, count: number): Uint16Array;

declare function peek32(address: number, count?: 1): number;
declare function peek32(address: number, count: number): Uint32Array;

declare function poke8(address: number, value: number): void;

declare function poke16(address: number, value: number): void;

declare function poke32(address: number, value: number): void;

declare function print(...args: any[]): void;

declare const Serial1: Serial;

declare const Bluetooth: Serial;

declare const LoopbackA: Serial;

declare const LoopbackB: Serial;

declare function require(module: "heatshrink"): {
  decompress: (compressedString: string) => string;
};
declare function require(module: "Storage"): Storage;
declare type Module = "heatshrink" | "Storage";

declare function reset(clearFlash?: true): void;

declare function setInterval(id: any): void;

declare function setBusyIndicator(pin?: Pin): void;

declare function setSleepIndicator(pin?: Pin): void;

declare function setTime(time: number): void;

type Data =
  | number
  | string
  | Array<Data>
  | ArrayBuffer
  | { data: Data; count: number }
  | { callback: () => Data };

declare function shiftOut(
  pins: Pin | Pin[],
  options: { clk: Pin; repeat?: number },
  data: Data
): void;

declare const SPI1: SPIInstance;

declare const Terminal: Serial;

declare function trace(root?: number): void;

// Watches
declare function clearWatch(id?: number): void;
declare const setWatch: ((
  callback:
    | ((obj: { state: boolean; time: number; lastTime: number }) => void)
    | string,
  pin: number,
  options?:
    | boolean
    | number
    | {
        repeat?: boolean;
        edge?: "rising" | "falling" | "both";
        debounce?: number;
        irq?: boolean;
      }
) => number) &
  // If a data option is specified, the callback will also have one.
  ((
    callback:
      | ((obj: {
          state: boolean;
          time: number;
          lastTime: number;
          data: any; // TODO: Specify data type
        }) => void)
      | string,
    pin: number,
    options?: {
      data: number;
      repeat?: boolean;
      edge?: "rising" | "falling" | "both";
      debounce?: number;
      irq?: boolean;
    }
  ) => number);
