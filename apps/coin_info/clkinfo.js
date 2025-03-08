(function() {
    const COIN_ICON = atob("MDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAA//8AAAAB///AAAAB8A/gAAAAgAH4AAAwAAB8AAB4AAA+AADwA4APAADgA4APAAHgA4AHgADAf/ADwAAAf/gBwAAAf/wB4AAAcB4A4AAAcA4A4AAAcA4A4AYAcA4AcA8AcB4AcB+Af/wDdj/Af/4D/n/Af/8D/n/AcAcB/A4AcAOA+A4AcAOAcAcAcAOAAAcAcAAAAAcAcAAAAAeAf/AAAAOAf/AAAAPAf/ADAAHgA4AHgADwA4AHAADwA4APAAB8AAA+AAA+AAB8AAAfgAH4AAAH8A/gAAAD///AAAAA//8AAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==");
    const LOAD_ICON_24 = atob("GBiBAAAAAAAeAAGfwAGB4AAAcBgAOBgYHAAYDAAYDGAYBmAYBgAYBgAYBmDbBmB+BgA8DAAYDBgAHBgAOAAAcAGB4AGfwAAeAAAAAA==");

    const settings = require("Storage").readJSON("coin_info.settings.json", 1) || {};
    const db = require("Storage").readJSON("coin_info.cmc_key.json", 1) || {};
    const logFile = require("Storage").open("coin_info_log.txt", "a");

    if (!(settings.tokenSelected instanceof Array)) settings.tokenSelected = [];

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

                    // Return placeholder while waiting for data
                    return {
                        text: "Load",
                        img: LOAD_ICON_24
                    };
                },
                show: function() {
                    var self = this;

                    // Function to fetch data from API
                    const fetchData = (callback) => {
                        const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${token}USDT`;

                        Bangle.http(url, { method: 'GET' })
                            .then(cmcResult => {
                                logFile.write("HTTP resp:" + JSON.stringify(cmcResult));
                                const apiData = JSON.parse(cmcResult.resp);
                                logFile.write("data:" + JSON.stringify(apiData));

                                // Update cache with fetched data
                                cache[token] = {
                                    text: `${apiData.symbol}`,
                                    img: COIN_ICON
                                };

                                callback();
                            })
                            .catch(err => {
                                logFile.write("API Error: " + JSON.stringify(err));
                                cache[token] = {
                                    text: "Error",
                                    img: COIN_ICON
                                };
                                callback();
                            });
                    };

                    // Set timeout to align to the next hour and then continue updating every hour
                    self.interval = setTimeout(function timerTimeout() {
                        fetchData(() => {
                            self.emit("redraw");
                        });
                        // Continue updating every hour
                        self.interval = setInterval(function intervalCallback() {
                            fetchData(() => {
                                self.emit("redraw");
                            });
                        }, 3600000);
                    }, 60000  - (Date.now() % 60000 ));
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
});