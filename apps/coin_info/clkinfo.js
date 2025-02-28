const COIN_ICON = atob("MDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAA//8AAAAB///AAAAB8A/gAAAAgAH4AAAwAAB8AAB4AAA+AADwA4APAADgA4APAAHgA4AHgADAf/ADwAAAf/gBwAAAf/wB4AAAcB4A4AAAcA4A4AAAcA4A4AYAcA4AcA8AcB4AcB+Af/wDdj/Af/4D/n/Af/8D/n/AcAcB/A4AcAOA+A4AcAOAcAcAcAOAAAcAcAAAAAcAcAAAAAeAf/AAAAOAf/AAAAPAf/ADAAHgA4AHgADwA4AHAADwA4APAAB8AAA+AAA+AAB8AAAfgAH4AAAH8A/gAAAD///AAAAA//8AAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="); // (full base64 string here)

function getTokenInfo(token) {
    return function() {
        return {
            text: token,
            img: COIN_ICON
        };
    };
}

(function() {
    const settings = require("Storage").readJSON("coin_info.settings.json",1)||{};
    if (!(settings.tokenSelected instanceof Array))
        settings.tokenSelected = [];
    return {
        name: "CoinInfo",
        items: settings.tokenSelected.map(token => {
            return { name : token,
                get : getTokenInfo(token),
                show : function() {
                    var self = this;
                    // Set timeout to align to the next minute
                    self.interval = setTimeout(function timerTimeout() {
                        self.emit("redraw");
                        // Continue updating every minute
                        self.interval = setInterval(function intervalCallback() {
                            self.emit("redraw");
                        }, 60000);
                    }, 60000 - (Date.now() % 60000));
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
})()
