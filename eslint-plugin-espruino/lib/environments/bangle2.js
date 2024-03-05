"use strict";

const bangle = require("./bangle.js");
const usart3 = require("./usart-3.js");
module.exports = {
    ...bangle,
    ...usart3,
    
    Unistroke: false,
}