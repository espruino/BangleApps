// TODO all of these globals (copied from eslintrc need to be typed at some point)
/* "globals": {
    // Methods and Fields at https://banglejs.com/reference
    "BluetoothDevice": "readonly",
    "BluetoothRemoteGATTCharacteristic": "readonly",
    "BluetoothRemoteGATTServer": "readonly",
    "BluetoothRemoteGATTService": "readonly",
    "DataView": "readonly",
    "E": "readonly",
    "Error": "readonly",
    "Flash": "readonly",
    "fs": "readonly",
    "Function": "readonly",
    "heatshrink": "readonly",
    "I2C": "readonly",
    "InternalError": "readonly",
    "Math": "readonly",
    "Modules": "readonly",
    "NRF": "readonly",
    "Number": "readonly",
    "Object": "readonly",
    "OneWire": "readonly",
    "Pin": "readonly",
    "process": "readonly",
    "Promise": "readonly",
    "ReferenceError": "readonly",
    "RegExp": "readonly",
    "Serial": "readonly",
    "SPI": "readonly",
    "Storage": "readonly",
    "StorageFile": "readonly",
    "String": "readonly",
    "SyntaxError": "readonly",
    "tensorflow": "readonly",
    "TFMicroInterpreter": "readonly",
    "TypeError": "readonly",
    "Uint16Array": "readonly",
    "Uint24Array": "readonly",
    "Uint32Array": "readonly",
    "Uint8Array": "readonly",
    "Uint8ClampedArray": "readonly",
    "Waveform": "readonly",
    // Methods and Fields at https://banglejs.com/reference
    "analogRead": "readonly",
    "analogWrite": "readonly",
    "arguments": "readonly",
    "atob": "readonly",
    "Bluetooth": "readonly",
    "BTN": "readonly",
    "BTN1": "readonly",
    "BTN2": "readonly",
    "BTN3": "readonly",
    "BTN4": "readonly",
    "BTN5": "readonly",
    "btoa": "readonly",
    "changeInterval": "readonly",
    "clearInterval": "readonly",
    "clearTimeout": "readonly",
    "clearWatch": "readonly",
    "decodeURIComponent": "readonly",
    "digitalPulse": "readonly",
    "digitalRead": "readonly",
    "digitalWrite": "readonly",
    "dump": "readonly",
    "echo": "readonly",
    "edit": "readonly",
    "encodeURIComponent": "readonly",
    "eval": "readonly",
    "getPinMode": "readonly",
    "getSerial": "readonly",
    "getTime": "readonly",
    "global": "readonly",
    "HIGH": "readonly",
    "I2C1": "readonly",
    "Infinity": "readonly",
    "isFinite": "readonly",
    "isNaN": "readonly",
    "LED": "readonly",
    "LED1": "readonly",
    "LED2": "readonly",
    "load": "readonly",
    "LoopbackA": "readonly",
    "LoopbackB": "readonly",
    "LOW": "readonly",
    "NaN": "readonly",
    "parseFloat": "readonly",
    "parseInt": "readonly",
    "peek16": "readonly",
    "peek32": "readonly",
    "peek8": "readonly",
    "pinMode": "readonly",
    "poke16": "readonly",
    "poke32": "readonly",
    "poke8": "readonly",
    "print": "readonly",
    "require": "readonly",
    "reset": "readonly",
    "save": "readonly",
    "Serial1": "readonly",
    "setBusyIndicator": "readonly",
    "setInterval": "readonly",
    "setSleepIndicator": "readonly",
    "setTime": "readonly",
    "setTimeout": "readonly",
    "setWatch": "readonly",
    "shiftOut": "readonly",
    "SPI1": "readonly",
    "Terminal": "readonly",
    "trace": "readonly",
    "VIBRATE": "readonly",
 */

export type loadGlobals = {};

declare global {
  const Bangle: {
    // functions
    buzz: () => void;
    drawWidgets: () => void;
    isCharging: () => boolean;
    // events
    on(event: 'charging', listener: (charging: boolean) => void): void;
    // TODO add more
  };

  type Image = {
    width: number;
    height: number;
    bpp?: number;
    buffer: ArrayBuffer | string;
    transparent?: number;
    palette?: Uint16Array;
  };

  type GraphicsApi = {
    reset: () => void;
    flip: () => void;
    setColor: (color: string) => void; // TODO we can most likely type color more usefully than this
    drawImage: (
      image: string | Image | ArrayBuffer,
      xOffset: number,
      yOffset: number,
      options?: {
        rotate?: number;
        scale?: number;
      }
    ) => void;
    // TODO add more
  };

  const Graphics: GraphicsApi;
  const g: GraphicsApi;

  type Widget = {
    area: 'tr' | 'tl';
    width: number;
    draw: () => void;
  };
  const WIDGETS: { [key: string]: Widget };
}
