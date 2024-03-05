"use strict";

const nrf = require("./nrf.js");
const button1 = require("./button-1.js");
const led1 = require("./led-1.js");
module.exports = {
    
    ...nrf,
    ...button1,
    ...led1,
    
}