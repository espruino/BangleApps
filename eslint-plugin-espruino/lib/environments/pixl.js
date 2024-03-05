"use strict";

const nrf = require("./nrf.js");
const button4 = require("./button-4.js");
const lcd = require("./lcd.js");
module.exports = {
    ...nrf,
    ...button4,
    ...lcd,

    SCL: false,
    SDA: false,

    Terminal: false,

    Pixl: false,

}