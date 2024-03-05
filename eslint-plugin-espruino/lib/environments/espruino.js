"use strict";

const espruinoLowFlash = require("./espruino-low-flash.js");
const ecmascript = require("./ecmascript.js");
const browser = require("./browser.js");
module.exports = {
    ...espruinoLowFlash,
    ...ecmascript,
    ...browser,

    dump: false,
    edit: false,

    getPinMode: false,
    
    setBusyIndicator: false,
    setSleepIndicator: false,

    trace: false,

    Waveform: false,

}