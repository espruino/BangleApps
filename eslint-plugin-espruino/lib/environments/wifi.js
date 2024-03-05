"use strict";

const stm32 = require("./stm32.js");
const button1 = require("./button-1.js");
const led2 = require("./led-2.js");
const i2c3 = require("./i2c-3.js");
const spi2 = require("./spi-2.js");
const usart2 = require("./usart-2.js");
module.exports = {
    ...stm32,
    ...button1,
    ...led2,
    ...i2c3,
    ...spi2,
    ...usart2,
    
}