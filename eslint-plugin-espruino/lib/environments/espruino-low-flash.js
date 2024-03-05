"use strict";

const ecmascriptLowFlash = require("./ecmascript-low-flash.js");
const browserLowFlash = require("./browser-low-flash.js");
const globals = require("../../utils/globals.js");
module.exports = {
    ...ecmascriptLowFlash,
    ...browserLowFlash,
    ...globals.commonjs,

    analogRead: false,
    analogWrite: false,
    
    changeInterval: false,
    clearWatch: false,

    digitalPulse: false,
    digitalRead: false,
    digitalWrite: false,
    echo: false,

    getSerial: false,

    getTime: false,

    HIGH: false,

    load: false,

    LoopbackA: false,
    LoopbackB: false,

    LOW: false,

    peek16: false,
    peek32: false,
    peek8: false,

    pinMode: false,

    poke16: false,
    poke32: false,
    poke8: false,

    print: false,

    reset: false,
    save: false,

    setTime: false,
    setWatch: false,

    shiftOut: false,

    E: false,

    Graphics: false,

    I2C: false,

    Modules: false,

    OneWire: false,

    Pin: false,

    process: false,

    Serial: false,

    SPI: false,

    TFMicroInterpreter: false,
    
}