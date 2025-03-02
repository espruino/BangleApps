(function() {
    const COIN_ICON = atob("MDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAA//8AAAAB///AAAAB8A/gAAAAgAH4AAAwAAB8AAB4AAA+AADwA4APAADgA4APAAHgA4AHgADAf/ADwAAAf/gBwAAAf/wB4AAAcB4A4AAAcA4A4AAAcA4A4AYAcA4AcA8AcB4AcB+Af/wDdj/Af/4D/n/Af/8D/n/AcAcB/A4AcAOA+A4AcAOAcAcAcAOAAAcAcAAAAAcAcAAAAAeAf/AAAAOAf/AAAAPAf/ADAAHgA4AHgADwA4AHAADwA4APAAB8AAA+AAA+AAB8AAAfgAH4AAAH8A/gAAAD///AAAAA//8AAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==");
    const settings = require("Storage").readJSON("coin_info.settings.json",1)||{};
    const apiKey = (require("Storage").readJSON("coin_info.cmc_key.json",1)||{}).apiKey||"";

    return {
        name: "CoinInfo",
        items: (settings.tokenSelected||[]).map(token => {
            let current = {text:"-", img:COIN_ICON};
            let tmr;

            return {
                name: token,
                get: () => current,
                show: function() {
                    const update = () => Bangle.http(
                        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?slug=${token}`,
                        {headers: {'CMC_PRO_API_KEY': apiKey}}
                    ).then(r => {
                        // current.text = `${r.data["1"].symbol} $${r.data["1"].quote.USD.price.toFixed(2)}`;
                        current.text = `${r.data["1"].symbol}`;
                        Bangle.drawWidgets();
                    }).catch(e => current.text = `Err:${e}`);

                    update();
                    tmr = setInterval(update, 3600000);
                },
                hide: () => tmr && clearInterval(tmr)
            };
        })
    };
})();
