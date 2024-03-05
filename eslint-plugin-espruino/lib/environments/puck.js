"use strict";

const nrf = require("./nrf.js");
const button1 = require("./button-1.js");
module.exports = {
    ...nrf,
    ...button1,

    FET: false,

    Puck: false,

}