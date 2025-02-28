// Reads and validates settings from storage.
function readSettings() {
    const settings = require("Storage").readJSON("coin_info.settings.json", 1) || {};
    // Ensure settings.tokenSelected is an array.
    if (!(settings.tokenSelected instanceof Array)) {
        settings.tokenSelected = [];
    }
    return settings;
}

// Returns the display content for a given token.
function getCoinInfo(token) {
    return {
        text: token,
        img: atob("MDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAA//8AAAAB///AAAAB8A/gAAAAgAH4AAAwAAB8AAB4AAA+AADwA4APAADgA4APAAHgA4AHgADAf/ADwAAAf/gBwAAAf/wB4AAAcB4A4AAAcA4A4AAAcA4A4AYAcA4AcA8AcB4AcB+Af/wDdj/Af/4D/n/Af/8D/n/AcAcB/A4AcAOA+A4AcAOAcAcAcAOAAAcAcAAAAAcAcAAAAAeAf/AAAAOAf/AAAAPAf/ADAAHgA4AHgADwA4AHAADwA4APAAB8AAA+AAA+AAB8AAAfgAH4AAAH8A/gAAAD///AAAAA//8AAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==")
    };
}

// Starts the redraw timer for a clock info item. The timer aligns the redraw to the next minute.
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

// Creates a single coin info item for a given token.
function createCoinInfoItem(token) {
    return {
        name: token,
        get: function getCoinInfoItem() {
            return getCoinInfo(token);
        },
        show: showCoinInfo,
        hide: hideCoinInfo,
        hasRange: false
    };
}

// Creates the module object for CoinInfo by reading storage and mapping tokens to clock info items.
function createCoinInfoModule() {
    const settings = readSettings();
    const items = settings.tokenSelected.map(createCoinInfoItem);
    return {
        name: "CoinInfo",
        items: items
    };
}

// Export the module.
module.exports = createCoinInfoModule();
