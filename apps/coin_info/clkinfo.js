(function() {
    const SETTINGS_FILE = "coin_info.settings.json";
    var settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};

    function retrieveClkInfo(strToken) {
        // TODO: do something useful here -> http request to CMC
        return {
            text : strToken,
            // color: "#f00",
            img : atob("MDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAA//8AAAAB///AAAAB8A/gAAAAgAH4AAAwAAB8AAB4AAA+AADwA4APAADgA4APAAHgA4AHgADAf/ADwAAAf/gBwAAAf/wB4AAAcB4A4AAAcA4A4AAAcA4A4AYAcA4AcA8AcB4AcB+Af/wDdj/Af/4D/n/Af/8D/n/AcAcB/A4AcAOA+A4AcAOAcAcAcAOAAAcAcAAAAAcAcAAAAAeAf/AAAAOAf/AAAAPAf/ADAAHgA4AHgADwA4AHAADwA4APAAB8AAA+AAA+AAB8AAAfgAH4AAAH8A/gAAAD///AAAAA//8AAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==")
        }
    }

    function showClkInfo() {
        this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
                this.emit("redraw");
            }, 60000);
        }, 60000 - (Date.now() % 60000));
    }

    function hideClkInfo() {
        clearInterval(this.interval);
        this.interval = null;
    }

    function createClkInfoItems() {
        let clkItems = [];
        (settings.tokenSelected || []).sort().forEach(token => {
            clkItems.push({
                name: token,
                get: () => retrieveClkInfo(token),
                show: showClkInfo,
                hide: hideClkInfo
            });
        });
        return clkItems;
    }

    return {
        name: "CoinInfo",
        items: () => createClkInfoItems()
    };
})
