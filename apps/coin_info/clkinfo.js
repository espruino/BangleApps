(function() {
    const COIN_ICON = atob("MDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAA//8AAAAB///AAAAB8A/gAAAAgAH4AAAwAAB8AAB4AAA+AADwA4APAADgA4APAAHgA4AHgADAf/ADwAAAf/gBwAAAf/wB4AAAcB4A4AAAcA4A4AAAcA4A4AYAcA4AcA8AcB4AcB+Af/wDdj/Af/4D/n/Af/8D/n/AcAcB/A4AcAOA+A4AcAOAcAcAcAOAAAcAcAAAAAcAcAAAAAeAf/AAAAOAf/AAAAPAf/ADAAHgA4AHgADwA4AHAADwA4APAAB8AAA+AAA+AAB8AAAfgAH4AAAH8A/gAAAD///AAAAA//8AAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="); // (full base64 string here)

    const settings = require("Storage").readJSON("coin_info.settings.json", 1) || {};
    const db = require("Storage").readJSON("coin_info.cmc_key.json", 1) || {};
    const logFile = require("Storage").open("log.txt", "a");

    // Ensure tokenSelected is an array
    if (!(settings.tokenSelected instanceof Array)) settings.tokenSelected = [];

    // Cache for storing results
    let cache = {};

    return {
        name: "CoinInfo",
        items: settings.tokenSelected.map(token => {
            return {
                name: token,
                get: function() {
                    // Return cached data if available
                    if (cache[token]) {
                        return cache[token];
                    }

                    // Return placeholder while fetching data
                    return {
                        text: "Load...",
                        img: COIN_ICON
                    };
                },
                show: function() {
                    var self = this;

                    // Fetch data when shown
                    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${token.toUpperCase()}`;
                    Bangle.http(url, { method: 'GET' })
                        .then(cmcResult => {
                            logFile.write("HTTP resp:" + JSON.stringify(cmcResult));
                            const apiData = JSON.parse(cmcResult.resp);
                            logFile.write("data:" + JSON.stringify(apiData));

                            // Update cache with fetched data
                            cache[token] = {
                                // text: `${apiData.symbol}\n${apiData.lastPrice} USD`,
                                text: `${apiData.symbol}`,
                                img: COIN_ICON
                            };

                            // Trigger a redraw of this item
                            self.emit("redraw");
                        })
                        .catch(err => {
                            logFile.write("API Error: " + JSON.stringify(err));
                            cache[token] = {
                                text: "Error",
                                img: COIN_ICON
                            };
                            self.emit("redraw");
                        });

                    // Set interval to refresh data every hour
                    self.interval = setInterval(() => {
                        Bangle.http(url, { method: 'GET' })
                            .then(cmcResult => {
                                const apiData = JSON.parse(cmcResult.resp);
                                cache[token] = {
                                    // text: `${apiData.symbol}\n${apiData.lastPrice} USD`,
                                    text: `${apiData.symbol}`,
                                    img: COIN_ICON
                                };
                                self.emit("redraw");
                            })
                            .catch(err => {
                                logFile.write("API Error: " + JSON.stringify(err));
                                cache[token] = {
                                    text: "Error",
                                    img: COIN_ICON
                                };
                                self.emit("redraw");
                            });
                    }, 3600000); // Refresh every hour
                },
                hide: function() {
                    if (this.interval) {
                        clearInterval(this.interval);
                        this.interval = null;
                    }
                }
            };
        })
    };
})();

