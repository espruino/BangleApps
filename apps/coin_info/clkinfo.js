/* coin_info.js */
(function() {
    // Reads and validates settings from storage.
    function readSettings() {
        const storage = require("Storage");
        let settings = storage.readJSON("coin_info.settings.json", 1) || {};
        if (!(settings.tokenSelected instanceof Array)) {
            settings.tokenSelected = [];
        }
        return settings;
    }

    // Returns the display content for a given token.
    function getCoinInfo(token) {
        return {
            text: token,
            // Decodes the base-64 image that will be shown.
            img: atob("MDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAA//8AAAAB///AAAAB8A/gAAAAgAH4AAAwAAB8AAB4AAA+AADwA4APAADgA4APAAHgA4AHgADAf/ADwAAAf/gBwAAAf/wB4AAAcB4A4AAAcA4A4AAAcA4A4AYAcA4AcA8AcB4AcB+Af/wDdj/Af/4D/n/Af/8D/n/AcAcB/A4AcAOA+A4AcAOAcAcAcAOAAAcAcAAAAAcAcAAAAAeAf/AAAAOAf/AAAAPAf/ADAAHgA4AHgADwA4AHAADwA4APAAB8AAA+AAA+AAB8AAAfgAH4AAAH8A/gAAAD///AAAAA//8AAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==")
        };
    }

    // Starts the redraw timer for a clock info item.
    // The timer is set so that the first redraw happens at the beginning of the next minute,
    // and then continues with an interval of 60,000ms (1 minute).
    function showCoinInfo() {
        var self = this;
        self.interval = setTimeout(function timerTimeout() {
            self.emit("redraw");
            self.interval = setInterval(function intervalCallback() {
                self.emit("redraw");
            }, 60000);
        }, 60000 - (Date.now() % 60000));
    }

    // Stops the redraw timer.
    function hideCoinInfo() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    // Creates a single clock info item for a given token.
    function createCoinInfoItem(token) {
        return {
            name: token,
            get: function() {
                return getCoinInfo(token);
            },
            show: showCoinInfo,
            hide: hideCoinInfo,
            hasRange: false,
        };
    }

    // Reads the stored tokens and creates clock info items for them.
    function createCoinInfoModule() {
        const settings = readSettings();
        const items = settings.tokenSelected.map(createCoinInfoItem);
        return {
            name: "CoinInfo",
            items: items,
        };
    }

    // Return the exported object (the module) from the IIFE.
    // Using this pattern ensures compatibility with the Espruino environment
    // on Bangle.js instead of Node.js-style module.exports.
    return createCoinInfoModule();
})();
