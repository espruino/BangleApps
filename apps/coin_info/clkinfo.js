(function() {
    const COIN_ICON = atob("MDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAA//8AAAAB///AAAAB8A/gAAAAgAH4AAAwAAB8AAB4AAA+AADwA4APAADgA4APAAHgA4AHgADAf/ADwAAAf/gBwAAAf/wB4AAAcB4A4AAAcA4A4AAAcA4A4AYAcA4AcA8AcB4AcB+Af/wDdj/Af/4D/n/Af/8D/n/AcAcB/A4AcAOA+A4AcAOAcAcAcAOAAAcAcAAAAAcAcAAAAAeAf/AAAAOAf/AAAAPAf/ADAAHgA4AHgADwA4AHAADwA4APAAB8AAA+AAA+AAB8AAAfgAH4AAAH8A/gAAAD///AAAAA//8AAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="); // (full base64 string here)

    const settings = require("Storage").readJSON("coin_info.settings.json",1)||{};
    const db = require("Storage").readJSON("coin_info.cmc_key.json",1)||{};

    if (!(settings.tokenSelected instanceof Array))
        settings.tokenSelected = [];
    return {
        name: "CoinInfo",
        items: settings.tokenSelected.map(token => {
            return { name : token,
                get : function()
                {
                    const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?slug=${token}`;
                    // const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?slug=bitcoin`;
                    return Bangle
                        .http(url, {
                            method: 'GET',
                            headers: {
                                'CMC_PRO_API_KEY': db.apikey
                            }
                        })
                        .then(cmcResult => ({
                            text: cmcResult.resp.data["1"].symbol, // Fixed data path
                            img: COIN_ICON
                        }))
                        .catch(err => ({
                            text: err.toString(),
                            img: COIN_ICON
                        }));
                },
                show : function() {
                    var self = this;
                    // Set timeout to align to the next minute
                    self.interval = setTimeout(function timerTimeout() {
                        self.emit("redraw");
                        // Continue updating every hour
                        self.interval = setInterval(function intervalCallback() {
                            self.emit("redraw");
                        }, 3600000);
                    }, 3600000 - (Date.now() % 3600000));
                },
                hide : function() {
                    if (this.interval) {
                        clearInterval(this.interval);
                        this.interval = null;
                    }
                },
            }
        })
    };
})
