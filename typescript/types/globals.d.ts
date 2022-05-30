// TODO all of these globals (copied from eslintrc) need to be typed at some point
/* The typing status is listed on the left of the attribute, e.g.:
status  "Attribute"

        // Methods and Fields at https://banglejs.com/reference
        "Array": "readonly",
        "ArrayBuffer": "readonly",
        "ArrayBufferView": "readonly",
started "Bangle": "readonly",
        "BluetoothDevice": "readonly",
        "BluetoothRemoteGATTCharacteristic": "readonly",
        "BluetoothRemoteGATTServer": "readonly",
        "BluetoothRemoteGATTService": "readonly",
        "Boolean": "readonly",
        "console": "readonly",
        "DataView": "readonly",
        "Date": "readonly",
        "E": "readonly",
        "Error": "readonly",
        "Flash": "readonly",
        "Float32Array": "readonly",
        "Float64Array": "readonly",
        "fs": "readonly",
        "Function": "readonly",
started "Graphics": "readonly",
done    "heatshrink": "readonly",
        "I2C": "readonly",
        "Int16Array": "readonly",
        "Int32Array": "readonly",
        "Int8Array": "readonly",
        "InternalError": "readonly",
        "JSON": "readonly",
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
started "require": "readonly",
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
        // Aliases and not defined at https://banglejs.com/reference
done    "g": "readonly",
done    "WIDGETS": "readonly"
 */

// ambient JS definitions

declare const require: ((module: 'heatshrink') => {
  decompress: (compressedString: string) => string;
}) & // TODO add more
  ((module: 'otherString') => {});

// ambient bangle.js definitions

declare const Bangle: {
  // functions
  buzz: (duration?: number, intensity?: number) => Promise<void>;
  drawWidgets: () => void;
  isCharging: () => boolean;
  // events
  on(event: 'charging', listener: (charging: boolean) => void): void;
  // TODO add more
};

declare type Image = {
  width: number;
  height: number;
  bpp?: number;
  buffer: ArrayBuffer | string;
  transparent?: number;
  palette?: Uint16Array;
};

declare type GraphicsApi = {
  reset: () => GraphicsApi;
  flip: () => void;
  setColor: (color: string) => GraphicsApi; // TODO we can most likely type color more usefully than this
  drawImage: (
    image: string | Image | ArrayBuffer,
    xOffset: number,
    yOffset: number,
    options?: {
      rotate?: number;
      scale?: number;
    }
  ) => GraphicsApi;
  // TODO add more
};

declare const Graphics: GraphicsApi;
declare const g: GraphicsApi;

declare type Widget = {
  area: 'tr' | 'tl';
  width: number;
  draw: (this: { x: number; y: number }) => void;
};
declare const WIDGETS: { [key: string]: Widget };
