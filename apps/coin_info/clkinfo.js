(function() {
    const COIN_ICON = atob("MDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAA//8AAAAB///AAAAB8A/gAAAAgAH4AAAwAAB8AAB4AAA+AADwA4APAADgA4APAAHgA4AHgADAf/ADwAAAf/gBwAAAf/wB4AAAcB4A4AAAcA4A4AAAcA4A4AYAcA4AcA8AcB4AcB+Af/wDdj/Af/4D/n/Af/8D/n/AcAcB/A4AcAOA+A4AcAOAcAcAcAOAAAcAcAAAAAcAcAAAAAeAf/AAAAOAf/AAAAPAf/ADAAHgA4AHgADwA4AHAADwA4APAAB8AAA+AAA+AAB8AAAfgAH4AAAH8A/gAAAD///AAAAA//8AAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="); // (full base64 string here)
    const settings = require("Storage").readJSON("coin_info.settings.json",1)||{};
    const db = require("Storage").readJSON("coin_info.cmc_key.json",1)||{};

    return {
        name: "CoinInfo",
        items: settings.tokenSelected.map(token => {
            let currentValue = {text: "Load...", img: COIN_ICON};
            let nextUpdate = 0;

            function update() {
                return Bangle.http(
                    `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?slug=${token}`,
                    {headers: {'CMC_PRO_API_KEY': db.apiKey}}
                ).then(res => {
                    currentValue = {
                        text: `${res.data["1"].symbol}\n$${res.data["1"].quote.USD.price.toFixed(2)}`,
                    };
                    nextUpdate = Date.now() + 3600000;
                }).catch(e => {
                    currentValue = {text: `Error: ${e}`, img: COIN_ICON};
                    nextUpdate = Date.now() + 300000; // Retry in 5 minutes on error
                }).finally(() => {
                    Bangle.drawWidgets();
                });
            }

            function checkUpdate() {
                if(Date.now() > nextUpdate) {
                    return update();
                }
                return Promise.resolve();
            }

            return {
                name: token,
                get: () => {
                    checkUpdate().then(); // Explicit promise handling
                    return currentValue;
                },
                show: function() {
                    update().then(); // Initial fetch
                    this.interval = setInterval(() => {
                        checkUpdate().then(() => this.emit("redraw"));
                    }, 60000);
                },
                hide: function() {
                    clearInterval(this.interval);
                }
            };
        })
    };
})();
