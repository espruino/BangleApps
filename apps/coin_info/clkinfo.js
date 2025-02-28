/* coin_info.js */
(function() {
    // Reads and validates settings from storage.
    function readSettings() {
        var storage = require("Storage");
        var settings = storage.readJSON("coin_info.settings.json", 1) || {};
        if (!(settings.tokenSelected instanceof Array)) {
            settings.tokenSelected = [];
        }
        return settings;
    }

    // Returns the display info (text and image) for a given token.
    function getCoinInfo(token) {
        return {
            text: token,
            img: atob("MDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAA//8AAAAB///AAAAB8A/gAAAAgAH4AAAwAAB8AAB4AAA+AADwA4APAADgA4APAAHgA4AHgADAf/ADwAAAf/gBwAAAf/wB4AAAcB4A4AAAcA4A4AAAcA4A4AYAcA4AcA8AcB4AcB+Af/wDdj/Af/4D/n/Af/8D/n/AcAcB/A4AcAOA+A4AcAOAcAcAcAOAAAcAcAAAAAcAcAAAAAeAf/AAAAOAf/AAAAPAf/ADAAHgA4AHgADwA4AHAADwA4APAAB8AAA+AAA+AAB8AAAfgAH4AAAH8A/gAAAD///AAAAA//8AAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==")
        };
    }

    // Starts the redraw timer so the info gets updated at the start of each minute.
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

    // Creates a single clock_info item for a given token.
    function createCoinInfoItem(token) {
        return {
            name: token,
            get: function() {
                return getCoinInfo(token);
            },
            show: showCoinInfo,
            hide: hideCoinInfo,
            hasRange: false
        };
    }

    // Read settings and create items.
    var settings = readSettings();
    var items = settings.tokenSelected.map(createCoinInfoItem);

    // Return the module object, exactly as the clock_info app expects.
    return {
        name: "CoinInfo",
        items: items
    };
})();
