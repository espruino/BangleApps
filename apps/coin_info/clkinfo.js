(function() { // IIFE wrapper required
    const COIN_ICON = atob("MDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAA//8AAAAB///AAAAB8A/gAAAAgAH4AAAwAAB8AAB4AAA+AADwA4APAADgA4APAAHgA4AHgADAf/ADwAAAf/gBwAAAf/wB4AAAcB4A4AAAcA4A4AAAcA4A4AYAcA4AcA8AcB4AcB+Af/wDdj/Af/4D/n/Af/8D/n/AcAcB/A4AcAOA+A4AcAOAcAcAcAOAAAcAcAAAAAcAcAAAAAeAf/AAAAOAf/AAAAPAf/ADAAHgA4AHgADwA4AHAADwA4APAAB8AAA+AAA+AAB8AAAfgAH4AAAH8A/gAAAD///AAAAA//8AAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="); // (full base64 string here)
    const settings = require("Storage").readJSON("coin_info.settings.json",1)||{};
    const db = require("Storage").readJSON("coin_info.cmc_key.json",1)||{};

    const module = {
        name: "Coin Price",
        items: []
    };

    settings.tokenSelected.forEach(token => {
        let current = {text:"-", img: COIN_ICON};
        let timer = null;
        let lastUpdate = 0;

        function update() {
            Bangle.http(
                `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?slug=${token}`,
                {headers: {'CMC_PRO_API_KEY': db.apiKey}}
            ).then(res => {
                // current.text = `${res.data["1"].symbol}\n$${res.data["1"].quote.USD.price.toFixed(2)}`;
                current.text = `${res.data["1"].symbol}`;
                lastUpdate = Date.now();
            }).catch(err => {
                current.text = `Err: ${err}`;
                lastUpdate = Date.now() + 300000; // Retry in 5min
            }).finally(() => Bangle.drawWidgets());
        }

        module.items.push({
            name: token,
            get: () => current,
            show: function() {
                if(!timer) {
                    update();
                    timer = setInterval(update, 3600000); // 60min
                }
            },
            hide: function() {
                if(timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }
        });
    });

    return module;
})();



