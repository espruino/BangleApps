"use strict";

const browserLowFlash = require("./browser-low-flash.js");
module.exports = {
    ...browserLowFlash,

    atob: false,
    btoa: false,

}