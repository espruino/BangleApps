"use strict";

const nrf = require("./nrf.js");
const button1 = require("./button-1.js");
const led2 = require("./led-2.js");
const lcd = require("./lcd.js");
const i2c2 = require("./i2c-2.js");
const spi2 = require("./spi-2.js");
const usart2 = require("./usart-2.js");
module.exports = {
    ...nrf,
    ...button1,
    ...led2,
    ...lcd,
    ...i2c2,
    ...spi2,
    ...usart2,

    VIBRATE: false,

    WIDGETS: false,

    Bangle: false,
}