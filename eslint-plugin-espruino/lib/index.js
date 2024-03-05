/**
 * @fileoverview Eslint configurations for the Espruino ecosystem
 */
"use strict";

module.exports = {
    environments: {

        // Espruino core
        "ecmascript": require("./environments/ecmascript.js"),
        "browser-low-flash": require("./environments/browser-low-flash.js"),
        "browser": require("./environments/browser.js"),
        "espruino-low-flash": require("./environments/espruino-low-flash.js"),
        "espruino": require("./environments/espruino.js"),

        // Individual features
        "lcd": require("./environments/lcd.js"),

        // Officially supported platforms
        "nrf": require("./environments/nrf.js"),
        "stm32": require("./environments/stm32.js"),
        "esp32": require("./environments/esp32.js"),
        "esp8266": require("./environments/esp8266.js"),

        // Community supported platforms

        // Officially supported boards
        "bangle": require("./environments/bangle.js"),
        "bangle1": require("./environments/bangle1.js"),
        "bangle2": require("./environments/bangle2.js"),
        "pixl": require("./environments/pixl.js"),

        // Community supported boards
        "microbit": require("./environments/microbit.js"),

    },
    configs: {

        // Core setup
        "espruino-low-flash": require("./configs/espruino-low-flash.js"),
        "espruino": require("./configs/espruino.js"),

        // Rule bundles
        "recommended": require("./configs/recommended.js"),
        "all": require("./configs/all.js"),

    },
    rules: {

        
    },
}




